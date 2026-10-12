"""
LLM Gateway — provider-agnostic, async, fail-open.

Talks to any OpenAI-compatible Chat Completions endpoint:
OpenAI, Groq, Together, DeepSeek, OpenRouter, Google Gemini (OpenAI-compat),
or a local Ollama / LM Studio / llama.cpp server.

Design contract:
  * Every helper NEVER raises — on any failure it logs and returns None so
    callers can fall back to the deterministic engines in ai_service.py.
  * Disabled automatically when no LLM_API_KEY is configured (zero-config
    offline mode), unless LLM_ENABLED=1 forces it on for keyless local
    servers such as Ollama.
  * TTL cache for stable completions, consecutive-failure circuit breaker,
    and one retry — keeps latency and cost bounded.
"""
import hashlib
import json
import logging
import os
import re
import time
from typing import List, Optional, Union

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("llm")

# ---------------------------------------------------------------------------
# Configuration (all optional — sensible defaults keep the app zero-config)
# ---------------------------------------------------------------------------
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
LLM_API_KEY = os.getenv("LLM_API_KEY", "").strip()
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini").strip()
LLM_TIMEOUT = float(os.getenv("LLM_TIMEOUT_SECONDS", "15"))
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "800"))
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
_LLM_ENABLED_FLAG = os.getenv("LLM_ENABLED", "").strip().lower()

_FALSY = ("0", "false", "no", "off", "disabled")
_TRUTHY = ("1", "true", "yes", "on", "enabled")


def llm_available() -> bool:
    """True when an LLM is configured (or force-enabled for a local server)."""
    if _LLM_ENABLED_FLAG in _FALSY:
        return False
    if LLM_API_KEY:
        return True
    # Keyless local endpoints (Ollama, LM Studio) need an explicit opt-in.
    return _LLM_ENABLED_FLAG in _TRUTHY


def status_info() -> str:
    """One-line engine status for the startup log."""
    if llm_available():
        return f"LLM ({LLM_MODEL} @ {LLM_BASE_URL})"
    return "local heuristic engine (set LLM_API_KEY in backend/.env to enable an LLM)"


# ---------------------------------------------------------------------------
# Circuit breaker + TTL cache (in-process, best-effort)
# ---------------------------------------------------------------------------
_CONSECUTIVE_FAILURES = 0
_CIRCUIT_OPEN_UNTIL = 0.0
_FAILURE_THRESHOLD = 5
_CIRCUIT_COOLDOWN_SECONDS = 60.0

_CACHE: dict = {}
_CACHE_TTL = 300.0          # 5 minutes
_CACHE_MAX_ENTRIES = 256


def _circuit_open() -> bool:
    return time.monotonic() < _CIRCUIT_OPEN_UNTIL


def _record_success() -> None:
    global _CONSECUTIVE_FAILURES
    _CONSECUTIVE_FAILURES = 0


def _record_failure() -> None:
    global _CONSECUTIVE_FAILURES, _CIRCUIT_OPEN_UNTIL
    _CONSECUTIVE_FAILURES += 1
    if _CONSECUTIVE_FAILURES >= _FAILURE_THRESHOLD:
        _CIRCUIT_OPEN_UNTIL = time.monotonic() + _CIRCUIT_COOLDOWN_SECONDS
        _CONSECUTIVE_FAILURES = 0
        logger.warning(
            "LLM circuit opened for %.0fs after %d consecutive failures — "
            "using local engines meanwhile.",
            _CIRCUIT_COOLDOWN_SECONDS, _FAILURE_THRESHOLD,
        )


def _cache_key(messages: List[dict], temperature: float, max_tokens: int) -> str:
    blob = json.dumps(
        {"m": messages, "t": temperature, "n": max_tokens, "model": LLM_MODEL},
        sort_keys=True,
    )
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def _cache_get(key: str) -> Optional[str]:
    entry = _CACHE.get(key)
    if not entry:
        return None
    expires, value = entry
    if time.monotonic() > expires:
        _CACHE.pop(key, None)
        return None
    return value


def _cache_put(key: str, value: str) -> None:
    if len(_CACHE) >= _CACHE_MAX_ENTRIES:
        # Drop the oldest ~20% (dicts preserve insertion order).
        for old_key in list(_CACHE)[: _CACHE_MAX_ENTRIES // 5]:
            _CACHE.pop(old_key, None)
    _CACHE[key] = (time.monotonic() + _CACHE_TTL, value)


# ---------------------------------------------------------------------------
# HTTP client
# ---------------------------------------------------------------------------
_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        headers = {"Content-Type": "application/json"}
        if LLM_API_KEY:
            headers["Authorization"] = f"Bearer {LLM_API_KEY}"
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(LLM_TIMEOUT, connect=5.0),
            headers=headers,
        )
    return _client


async def aclose() -> None:
    """Close the shared client (called on shutdown if wired)."""
    if _client is not None and not _client.is_closed:
        await _client.aclose()


def _extract_content(payload: dict) -> Optional[str]:
    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return None
    if isinstance(content, str):
        return content.strip() or None
    # Some providers return a list of content parts.
    if isinstance(content, list):
        try:
            text = "".join(
                part.get("text", "") for part in content if isinstance(part, dict)
            ).strip()
            return text or None
        except (AttributeError, TypeError):
            return None
    return None


async def chat(
    messages: List[dict],
    *,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    cache: bool = True,
    retries: int = 1,
) -> Optional[str]:
    """
    Run a chat completion. Returns the assistant text, or None on any
    failure (callers must fall back to local logic).
    `messages`: [{"role": "system"|"user"|"assistant", "content": "..."}]
    """
    if not llm_available() or _circuit_open():
        return None

    temperature = LLM_TEMPERATURE if temperature is None else temperature
    max_tokens = LLM_MAX_TOKENS if max_tokens is None else max_tokens

    key = _cache_key(messages, temperature, max_tokens)
    if cache:
        hit = _cache_get(key)
        if hit is not None:
            return hit

    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    url = f"{LLM_BASE_URL}/chat/completions"
    client = _get_client()

    for attempt in range(retries + 1):
        try:
            resp = await client.post(url, json=payload)
            if resp.status_code >= 400:
                body = resp.text[:300]
                logger.warning(
                    "LLM HTTP %s (attempt %d/%d): %s",
                    resp.status_code, attempt + 1, retries + 1, body,
                )
                _record_failure()
                continue
            content = _extract_content(resp.json())
            if content is None:
                logger.warning("LLM response had no usable content.")
                _record_failure()
                continue
            _record_success()
            if cache:
                _cache_put(key, content)
            return content
        except Exception as exc:  # noqa: BLE001 — fail-open by design
            logger.warning(
                "LLM call failed (attempt %d/%d): %s",
                attempt + 1, retries + 1, exc,
            )
            _record_failure()

    return None


def parse_json_loose(text: str) -> Optional[Union[dict, list]]:
    """
    Tolerantly extract JSON from an LLM reply: strips markdown fences,
    then tries the outermost {...} / [...] span, then the raw text.
    """
    if not text:
        return None
    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*(.+?)\s*```", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1).strip()

    for opener, closer in (("{", "}"), ("[", "]")):
        start = cleaned.find(opener)
        end = cleaned.rfind(closer)
        if start != -1 and end > start:
            try:
                return json.loads(cleaned[start : end + 1])
            except (ValueError, TypeError):
                pass
    try:
        return json.loads(cleaned)
    except (ValueError, TypeError):
        return None


async def chat_json(
    messages: List[dict],
    *,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    cache: bool = True,
) -> Optional[Union[dict, list]]:
    """Chat + tolerant JSON parse. None on any failure."""
    text = await chat(
        messages,
        temperature=temperature,
        max_tokens=max_tokens,
        cache=cache,
    )
    if text is None:
        return None
    parsed = parse_json_loose(text)
    if parsed is None:
        logger.warning("LLM reply was not parseable as JSON — falling back.")
    return parsed


# ---------------------------------------------------------------------------
# Streaming (Server-Sent Events) — StudyBuddy live token streaming.
# ---------------------------------------------------------------------------
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai").strip().lower()


def _anthropic_headers() -> dict:
    return {
        "Content-Type": "application/json",
        "x-api-key": LLM_API_KEY,
        "anthropic-version": "2023-06-01",
    }


async def stream_chat(messages: List[dict], *, temperature=None, max_tokens=None):
    """
    Async generator yielding text chunks as they arrive.
    Supports Anthropic (provider=anthropic, SSE) and any OpenAI-compatible
    streaming endpoint. Raises on failure — callers must catch and fall back.
    """
    temperature = LLM_TEMPERATURE if temperature is None else temperature
    max_tokens = LLM_MAX_TOKENS if max_tokens is None else max_tokens
    client = _get_client()

    if LLM_PROVIDER == "anthropic":
        if not LLM_API_KEY:
            raise RuntimeError("LLM_PROVIDER=anthropic but LLM_API_KEY is empty")
        url = f"{LLM_BASE_URL}/messages"
        system_texts = [m["content"] for m in messages if m.get("role") == "system"]
        turns = [
            {"role": m["role"], "content": m["content"]}
            for m in messages
            if m.get("role") in ("user", "assistant")
        ]
        payload = {
            "model": LLM_MODEL,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True,
            "messages": turns,
        }
        if system_texts:
            payload["system"] = "\n".join(system_texts)
        async with client.stream(
            "POST", url, json=payload, headers=_anthropic_headers()
        ) as resp:
            if resp.status_code >= 400:
                raise RuntimeError(f"Anthropic HTTP {resp.status_code}: {(await resp.aread())[:200]!r}")
            async for line in resp.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data = line[6:].strip()
                if data == "[DONE]":
                    break
                try:
                    evt = json.loads(data)
                except ValueError:
                    continue
                if evt.get("type") == "content_block_delta":
                    delta = evt.get("delta") or {}
                    piece = delta.get("text", "")
                    if piece:
                        yield piece
                elif evt.get("type") == "message_stop":
                    break
        return

    # OpenAI-compatible SSE (OpenAI, Groq, DeepSeek, Gemini-compat, Ollama…)
    url = f"{LLM_BASE_URL}/chat/completions"
    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }
    async with client.stream("POST", url, json=payload) as resp:
        if resp.status_code >= 400:
            raise RuntimeError(f"LLM HTTP {resp.status_code}: {(await resp.aread())[:200]!r}")
        async for line in resp.aiter_lines():
            if not line.startswith("data: "):
                continue
            data = line[6:].strip()
            if data == "[DONE]":
                break
            try:
                evt = json.loads(data)
            except ValueError:
                continue
            try:
                piece = evt["choices"][0]["delta"].get("content") or ""
            except (KeyError, IndexError, TypeError):
                piece = ""
            if piece:
                yield piece
