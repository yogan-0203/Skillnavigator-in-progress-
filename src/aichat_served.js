import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/AIChatbot.jsx");const useState = __vite__cjsImport0_react["useState"]; const useRef = __vite__cjsImport0_react["useRef"]; const useEffect = __vite__cjsImport0_react["useEffect"];const _jsxDEV = __vite__cjsImport12_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport12_react_jsxDevRuntime["Fragment"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=8b1f4652";
import { Box, Typography, TextField, IconButton, Fab, Drawer, Fade, Chip, Avatar } from "/node_modules/.vite/deps/@mui_material.js?v=8b1f4652";
import SmartToyRoundedIcon from "/node_modules/.vite/deps/@mui_icons-material_SmartToyRounded.js?v=8b1f4652";
import SendRoundedIcon from "/node_modules/.vite/deps/@mui_icons-material_SendRounded.js?v=8b1f4652";
import CloseRoundedIcon from "/node_modules/.vite/deps/@mui_icons-material_CloseRounded.js?v=8b1f4652";
import LightbulbRoundedIcon from "/node_modules/.vite/deps/@mui_icons-material_LightbulbRounded.js?v=8b1f4652";
import PsychologyRoundedIcon from "/node_modules/.vite/deps/@mui_icons-material_PsychologyRounded.js?v=8b1f4652";
import RocketLaunchRoundedIcon from "/node_modules/.vite/deps/@mui_icons-material_RocketLaunchRounded.js?v=8b1f4652";
import { mentorAPI } from "/src/api.js";
import { useTheme } from "/src/ThemeContext.jsx";
import { getTokens, ACCENTS } from "/src/theme/tokens.js";
import { ClayCard, GlassPanel, ClayButton, PageHeader, StatTile, SegmentTabs, EmptyState, LoadingState, ChartTooltip } from "/src/theme/Clay.jsx";
var _jsxFileName = "C:/Users/Yoga parwezh A/sih-hack-demo/src/AIChatbot.jsx";
import __vite__cjsImport12_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=8b1f4652";
var _s = $RefreshSig$();
const QUICK_PROMPTS = [
	{
		icon: /* @__PURE__ */ _jsxDEV(LightbulbRoundedIcon, { sx: { fontSize: 14 } }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 14,
			columnNumber: 9
		}, this),
		text: "What skills do I need for AI/ML?",
		color: "#9b6dff"
	},
	{
		icon: /* @__PURE__ */ _jsxDEV(PsychologyRoundedIcon, { sx: { fontSize: 14 } }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 20,
			columnNumber: 9
		}, this),
		text: "Create a learning roadmap for me",
		color: "#4f8ef7"
	},
	{
		icon: /* @__PURE__ */ _jsxDEV(RocketLaunchRoundedIcon, { sx: { fontSize: 14 } }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 26,
			columnNumber: 9
		}, this),
		text: "How do I get my first job?",
		color: "#3ecf8e"
	}
];
const AI_RESPONSES = {
	"what skills do i need for ai/ml?": `Great question! Here's your personalized AI/ML skill roadmap:\n\n**Phase 1 - Foundations (Weeks 1-4)**\n Python Programming → NumPy & Pandas → Linear Algebra\n\n**Phase 2 - Core ML (Weeks 5-10)**\n Machine Learning Algorithms → Scikit-learn → Feature Engineering\n\n**Phase 3 - Deep Learning (Weeks 11-16)**\n Neural Networks → TensorFlow/PyTorch → CNNs & RNNs\n\n**Phase 4 - Specialization (Weeks 17-24)**\n NLP or Computer Vision → MLOps → Projects Portfolio\n\nI recommend starting with Python fundamentals and taking our Python for Beginners course first!`,
	"create a learning roadmap for me": `I've analyzed your profile and created a personalized roadmap!\n\n**Your Current Level:** Beginner (assessed from your skills)\n**Target Role:** AI/ML Engineer\n**Estimated Timeline:** 6 months\n\n**Month 1-2: Foundations**\n→ Python Advanced course\n→ Statistics for Data Science\n→ 2 mini-projects\n\n**Month 3-4: Core Skills**\n→ Machine Learning Fundamentals\n→ Deep Learning with Neural Networks\n→ Kaggle competitions\n\n**Month 5-6: Advanced & Portfolio**\n→ NLP or Computer Vision specialization\n→ 3 portfolio projects\n→ Mock interviews\n\nWould you like me to enroll you in the first course?`,
	"how do i get my first job?": `Here's your job-ready action plan:\n\n**Step 1: Build Portfolio (Do this week)**\n→ 3 solid projects on GitHub\n→ Deploy one project online\n\n**Step 2: Optimize Presence**\n→ LinkedIn profile with keywords\n→ GitHub with good READMEs\n→ Technical blog (even 2-3 posts)\n\n**Step 3: Apply Strategically**\n→ 10 applications/day to relevant roles\n→ Target: Startups + Mid-size companies\n→ Roles: Junior ML Engineer, Data Analyst, AI Intern\n\n**Step 4: Prepare for Interviews**\n→ Take 5+ assessments on our platform\n→ Practice coding problems\n→ Prepare project explanations\n\n**Pro Tip:** Companies value projects more than certificates. Focus on building!`
};
const getAIResponse = (message) => {
	const lowerMsg = message.toLowerCase().trim();
	for (const [key, response] of Object.entries(AI_RESPONSES)) {
		if (lowerMsg.includes(key) || key.includes(lowerMsg)) return response;
	}
	if (lowerMsg.includes("skill") || lowerMsg.includes("learn")) {
		return `Based on your domain interest, here are the key skills you should focus on:\n\n**Technical Skills:**\n→ Programming (Python/JavaScript)\n→ Domain-specific tools\n→ Data structures & algorithms\n\n**Soft Skills:**\n→ Problem-solving\n→ Communication\n→ Project management\n\nWould you like me to create a detailed learning plan for you?`;
	}
	if (lowerMsg.includes("job") || lowerMsg.includes("career") || lowerMsg.includes("interview")) {
		return `Let me help you with career guidance!\n\n**Quick Assessment:**\n→ Take skill assessments to identify gaps\n→ Build 2-3 portfolio projects\n→ Practice with our AI interview prep\n\n**Current Market Trends:**\n→ AI/ML roles are up 75% this year\n→ Remote opportunities available\n→ Average entry salary: ₹8-15 LPA\n\nWant me to analyze your resume or suggest specific roles?`;
	}
	if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
		return `Hey there! I'm your AI Career Mentor. I can help you with:\n\n→ Learning roadmaps\n→ Skill gap analysis\n→ Career guidance\n→ Interview preparation\n→ Project ideas\n\nWhat would you like to explore today?`;
	}
	return `That's a great question! Let me think about that...\n\nBased on your current profile and goals, here are my recommendations:\n\n**Immediate Actions:**\n→ Take a skill assessment to identify your level\n→ Browse relevant courses in your domain\n→ Set weekly learning goals\n\n**This Week:**\n→ Complete one learning module\n→ Practice with hands-on exercises\n→ Track your progress on the dashboard\n\nIs there anything specific you'd like to dive deeper into? I can help with learning paths, career advice, or technical questions!`;
};
const AIChatbot = ({ domain }) => {
	_s();
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState([{
		role: "ai",
		text: `Hi! I'm your AI Career Mentor. I see you're interested in ${domain?.label || "learning"}. How can I help you today?`
	}]);
	const [input, setInput] = useState("");
	const [typing, setTyping] = useState(false);
	const messagesEndRef = useRef(null);
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);
	const sendMessage = async (text) => {
		if (!text.trim()) return;
		const userMsg = {
			role: "user",
			text: text.trim()
		};
		const history = [...messages, userMsg].map((m) => ({
			role: m.role === "ai" ? "mentor" : "user",
			text: m.text
		}));
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setTyping(true);
		try {
			const { data } = await mentorAPI.chat(userMsg.text, history.slice(-10));
			setMessages((prev_1) => [...prev_1, {
				role: "ai",
				text: data.reply
			}]);
		} catch {
			// Backend offline - fall back to the local canned response
			setMessages((prev_0) => [...prev_0, {
				role: "ai",
				text: getAIResponse(text)
			}]);
		} finally {
			setTyping(false);
		}
	};
	return /* @__PURE__ */ _jsxDEV(_Fragment, { children: [/* @__PURE__ */ _jsxDEV(Fab, {
		onClick: () => setOpen(true),
		sx: {
			position: "fixed",
			bottom: 24,
			right: 24,
			zIndex: 1e3,
			background: "linear-gradient(135deg, #9b6dff, #4f8ef7)",
			color: "#fff",
			width: 56,
			height: 56,
			boxShadow: "0 4px 20px rgba(155,109,255,0.4)",
			"&:hover": {
				background: "linear-gradient(135deg, #b08aff, #6ba3ff)",
				boxShadow: "0 6px 30px rgba(155,109,255,0.6)"
			},
			animation: "pulseGlow 2s ease infinite"
		},
		children: /* @__PURE__ */ _jsxDEV(SmartToyRoundedIcon, { sx: { fontSize: 26 } }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 118,
			columnNumber: 17
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 102,
		columnNumber: 13
	}, this), /* @__PURE__ */ _jsxDEV(Drawer, {
		anchor: "right",
		open,
		onClose: () => setOpen(false),
		PaperProps: { sx: {
			width: 400,
			maxWidth: "90vw",
			background: (typeof t !== "undefined" && t.glass?.panel) ?? "rgba(255,255,255,0.55)",
			backdropFilter: "blur(24px) saturate(1.3)",
			WebkitBackdropFilter: "blur(24px) saturate(1.3)",
			borderLeft: `1px solid ${t.border.subtle}`
		} },
		children: /* @__PURE__ */ _jsxDEV(Box, {
			sx: {
				height: "100%",
				display: "flex",
				flexDirection: "column"
			},
			children: [
				/* @__PURE__ */ _jsxDEV(Box, {
					sx: {
						p: 2,
						borderBottom: `1px solid ${t.border.subtle}`,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ _jsxDEV(Box, {
						sx: {
							display: "flex",
							alignItems: "center",
							gap: 1.5
						},
						children: [/* @__PURE__ */ _jsxDEV(Box, {
							sx: {
								width: 36,
								height: 36,
								borderRadius: "12px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								background: "linear-gradient(135deg, rgba(155,109,255,0.2), rgba(79,142,247,0.2))",
								border: "1px solid rgba(155,109,255,0.3)"
							},
							children: /* @__PURE__ */ _jsxDEV(SmartToyRoundedIcon, { sx: {
								fontSize: 20,
								color: "#9b6dff"
							} }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 162,
								columnNumber: 33
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 152,
							columnNumber: 29
						}, this), /* @__PURE__ */ _jsxDEV(Box, { children: [/* @__PURE__ */ _jsxDEV(Typography, {
							sx: {
								fontSize: 14,
								fontWeight: 600
							},
							children: "AI Career Mentor"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 168,
							columnNumber: 33
						}, this), /* @__PURE__ */ _jsxDEV(Typography, {
							sx: {
								fontSize: 10,
								color: "#3ecf8e"
							},
							children: "Online"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 172,
							columnNumber: 33
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 167,
							columnNumber: 29
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 147,
						columnNumber: 25
					}, this), /* @__PURE__ */ _jsxDEV(IconButton, {
						onClick: () => setOpen(false),
						sx: { color: t.secondary },
						children: /* @__PURE__ */ _jsxDEV(CloseRoundedIcon, { sx: { fontSize: 20 } }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 181,
							columnNumber: 29
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 178,
						columnNumber: 25
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 140,
					columnNumber: 21
				}, this),
				/* @__PURE__ */ _jsxDEV(Box, {
					sx: {
						flex: 1,
						overflowY: "auto",
						p: 2,
						display: "flex",
						flexDirection: "column",
						gap: 2
					},
					children: [
						messages.map((msg, i) => /* @__PURE__ */ _jsxDEV(Fade, {
							in: true,
							timeout: 300,
							children: /* @__PURE__ */ _jsxDEV(Box, {
								sx: {
									display: "flex",
									gap: 1,
									flexDirection: msg.role === "user" ? "row-reverse" : "row"
								},
								children: [/* @__PURE__ */ _jsxDEV(Avatar, {
									sx: {
										width: 28,
										height: 28,
										background: msg.role === "ai" ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : t.glass.chip,
										flexShrink: 0
									},
									children: msg.role === "ai" ? /* @__PURE__ */ _jsxDEV(SmartToyRoundedIcon, { sx: { fontSize: 16 } }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 208,
										columnNumber: 62
									}, this) : /* @__PURE__ */ _jsxDEV(Typography, {
										sx: { fontSize: 12 },
										children: "U"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 210,
										columnNumber: 25
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 202,
									columnNumber: 37
								}, this), /* @__PURE__ */ _jsxDEV(Box, {
									sx: {
										maxWidth: "80%",
										p: 1.5,
										borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
										background: msg.role === "user" ? "linear-gradient(135deg, #4f8ef7, #9b6dff)" : t.glass.inset,
										border: msg.role === "ai" ? `1px solid ${t.border.subtle}` : "none"
									},
									children: /* @__PURE__ */ _jsxDEV(Typography, {
										sx: {
											fontSize: 12,
											whiteSpace: "pre-wrap",
											lineHeight: 1.6,
											color: msg.role === "user" ? "#fff" : t.text.primary
										},
										children: msg.text
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 221,
										columnNumber: 41
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 214,
									columnNumber: 37
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 197,
								columnNumber: 33
							}, this)
						}, i, false, {
							fileName: _jsxFileName,
							lineNumber: 196,
							columnNumber: 51
						}, this)),
						typing && /* @__PURE__ */ _jsxDEV(Box, {
							sx: {
								display: "flex",
								gap: 1,
								alignItems: "center"
							},
							children: [/* @__PURE__ */ _jsxDEV(Avatar, {
								sx: {
									width: 28,
									height: 28,
									background: "linear-gradient(135deg, #9b6dff, #4f8ef7)"
								},
								children: /* @__PURE__ */ _jsxDEV(SmartToyRoundedIcon, { sx: { fontSize: 16 } }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 240,
									columnNumber: 37
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 235,
								columnNumber: 33
							}, this), /* @__PURE__ */ _jsxDEV(Box, {
								sx: {
									p: 1.5,
									borderRadius: "14px",
									background: `t.glass.inset`,
									border: `1px solid ${t.border.subtle}`
								},
								children: /* @__PURE__ */ _jsxDEV(Box, {
									sx: {
										display: "flex",
										gap: .5
									},
									children: [
										/* @__PURE__ */ _jsxDEV(Box, { sx: {
											width: 6,
											height: 6,
											borderRadius: "50%",
											background: "#9b6dff",
											animation: "float 1s ease infinite"
										} }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 254,
											columnNumber: 41
										}, this),
										/* @__PURE__ */ _jsxDEV(Box, { sx: {
											width: 6,
											height: 6,
											borderRadius: "50%",
											background: "#4f8ef7",
											animation: "float 1s ease infinite 0.2s"
										} }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 261,
											columnNumber: 41
										}, this),
										/* @__PURE__ */ _jsxDEV(Box, { sx: {
											width: 6,
											height: 6,
											borderRadius: "50%",
											background: "#3ecf8e",
											animation: "float 1s ease infinite 0.4s"
										} }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 268,
											columnNumber: 41
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 250,
									columnNumber: 37
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 244,
								columnNumber: 33
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 230,
							columnNumber: 36
						}, this),
						/* @__PURE__ */ _jsxDEV("div", { ref: messagesEndRef }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 278,
							columnNumber: 25
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 188,
					columnNumber: 21
				}, this),
				messages.length <= 1 && /* @__PURE__ */ _jsxDEV(Box, {
					sx: {
						px: 2,
						pb: 1,
						display: "flex",
						gap: 1,
						flexWrap: "wrap"
					},
					children: QUICK_PROMPTS.map((prompt, i_0) => /* @__PURE__ */ _jsxDEV(Chip, {
						label: prompt.text,
						icon: prompt.icon,
						onClick: () => sendMessage(prompt.text),
						sx: {
							fontSize: 10,
							height: 28,
							color: prompt.color,
							background: `${prompt.color}10`,
							border: `1px solid ${prompt.color}25`,
							"&:hover": { background: `${prompt.color}20` }
						}
					}, i_0, false, {
						fileName: _jsxFileName,
						lineNumber: 289,
						columnNumber: 65
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 282,
					columnNumber: 46
				}, this),
				/* @__PURE__ */ _jsxDEV(Box, {
					sx: {
						p: 2,
						borderTop: `1px solid ${t.border.subtle}`
					},
					children: /* @__PURE__ */ _jsxDEV(Box, {
						sx: {
							display: "flex",
							gap: 1,
							alignItems: "center"
						},
						children: [/* @__PURE__ */ _jsxDEV(TextField, {
							fullWidth: true,
							size: "small",
							placeholder: "Ask me anything...",
							value: input,
							onChange: (e) => setInput(e.target.value),
							onKeyDown: (e_0) => e_0.key === "Enter" && sendMessage(input),
							sx: { "& .MuiOutlinedInput-root": {
								borderRadius: "12px",
								color: t.primary,
								"& fieldset": { borderColor: `t.border.subtle` },
								"&:hover fieldset": { borderColor: "rgba(155,109,255,0.3)" },
								"&.Mui-focused fieldset": { borderColor: "#9b6dff" }
							} }
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 311,
							columnNumber: 29
						}, this), /* @__PURE__ */ _jsxDEV(IconButton, {
							onClick: () => sendMessage(input),
							disabled: !input.trim(),
							sx: {
								width: 40,
								height: 40,
								borderRadius: "12px",
								background: input.trim() ? "linear-gradient(135deg, #9b6dff, #4f8ef7)" : t.glass.inset,
								color: t.primary,
								"&:hover": { background: "linear-gradient(135deg, #b08aff, #6ba3ff)" },
								"&.Mui-disabled": {
									background: `t.glass.inset`,
									color: t.secondary
								}
							},
							children: /* @__PURE__ */ _jsxDEV(SendRoundedIcon, { sx: { fontSize: 18 } }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 340,
								columnNumber: 33
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 326,
							columnNumber: 29
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 306,
						columnNumber: 25
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 302,
					columnNumber: 21
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 134,
			columnNumber: 17
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 124,
		columnNumber: 13
	}, this)] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 100,
		columnNumber: 10
	}, this);
};
_s(AIChatbot, "c7+5cqU2FSCtDm4w1V7CZh+H6M4=");
_c = AIChatbot;
export default AIChatbot;
var _c;
$RefreshReg$(_c, "AIChatbot");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/AIChatbot.jsx";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/Yoga parwezh A/sih-hack-demo/src/AIChatbot.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/Yoga parwezh A/sih-hack-demo/src/AIChatbot.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "C:/Users/Yoga parwezh A/sih-hack-demo/src/AIChatbot.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,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QUVwRSxVQUFVLEdBQUcsRUFBRTs7Ozs7TUFDOUI7Ozs7Y0FDWDs7Ozs7O0lBQ0o7Ozs7O0dBQ0o7Ozs7OztDQUNEOzs7O1NBQ1o7Ozs7O0FBRVI7OztBQUVBLGVBQWVjIiwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VSZWYiLCJ1c2VFZmZlY3QiLCJCb3giLCJUeXBvZ3JhcGh5IiwiVGV4dEZpZWxkIiwiSWNvbkJ1dHRvbiIsIkZhYiIsIkRyYXdlciIsIkZhZGUiLCJDaGlwIiwiQXZhdGFyIiwiU21hcnRUb3lSb3VuZGVkSWNvbiIsIlNlbmRSb3VuZGVkSWNvbiIsIkNsb3NlUm91bmRlZEljb24iLCJMaWdodGJ1bGJSb3VuZGVkSWNvbiIsIlBzeWNob2xvZ3lSb3VuZGVkSWNvbiIsIlJvY2tldExhdW5jaFJvdW5kZWRJY29uIiwibWVudG9yQVBJIiwidXNlVGhlbWUiLCJnZXRUb2tlbnMiLCJBQ0NFTlRTIiwiQ2xheUNhcmQiLCJHbGFzc1BhbmVsIiwiQ2xheUJ1dHRvbiIsIlBhZ2VIZWFkZXIiLCJTdGF0VGlsZSIsIlNlZ21lbnRUYWJzIiwiRW1wdHlTdGF0ZSIsIkxvYWRpbmdTdGF0ZSIsIkNoYXJ0VG9vbHRpcCIsIlFVSUNLX1BST01QVFMiLCJpY29uIiwiZm9udFNpemUiLCJ0ZXh0IiwiY29sb3IiLCJBSV9SRVNQT05TRVMiLCJnZXRBSVJlc3BvbnNlIiwibWVzc2FnZSIsImxvd2VyTXNnIiwidG9Mb3dlckNhc2UiLCJ0cmltIiwia2V5IiwicmVzcG9uc2UiLCJPYmplY3QiLCJlbnRyaWVzIiwiaW5jbHVkZXMiLCJBSUNoYXRib3QiLCJkb21haW4iLCJvcGVuIiwic2V0T3BlbiIsIm1lc3NhZ2VzIiwic2V0TWVzc2FnZXMiLCJyb2xlIiwibGFiZWwiLCJpbnB1dCIsInNldElucHV0IiwidHlwaW5nIiwic2V0VHlwaW5nIiwibWVzc2FnZXNFbmRSZWYiLCJjdXJyZW50Iiwic2Nyb2xsSW50b1ZpZXciLCJiZWhhdmlvciIsInNlbmRNZXNzYWdlIiwidXNlck1zZyIsImhpc3RvcnkiLCJtYXAiLCJtIiwicHJldiIsImRhdGEiLCJjaGF0Iiwic2xpY2UiLCJyZXBseSIsInBvc2l0aW9uIiwiYm90dG9tIiwicmlnaHQiLCJ6SW5kZXgiLCJiYWNrZ3JvdW5kIiwid2lkdGgiLCJoZWlnaHQiLCJib3hTaGFkb3ciLCJhbmltYXRpb24iLCJzeCIsIm1heFdpZHRoIiwidCIsImdsYXNzIiwicGFuZWwiLCJiYWNrZHJvcEZpbHRlciIsIldlYmtpdEJhY2tkcm9wRmlsdGVyIiwiYm9yZGVyTGVmdCIsImJvcmRlciIsInN1YnRsZSIsImRpc3BsYXkiLCJmbGV4RGlyZWN0aW9uIiwicCIsImJvcmRlckJvdHRvbSIsImFsaWduSXRlbXMiLCJqdXN0aWZ5Q29udGVudCIsImdhcCIsImJvcmRlclJhZGl1cyIsImZvbnRXZWlnaHQiLCJzZWNvbmRhcnkiLCJmbGV4Iiwib3ZlcmZsb3dZIiwibXNnIiwiaSIsImNoaXAiLCJmbGV4U2hyaW5rIiwiaW5zZXQiLCJ3aGl0ZVNwYWNlIiwibGluZUhlaWdodCIsInByaW1hcnkiLCJsZW5ndGgiLCJweCIsInBiIiwiZmxleFdyYXAiLCJwcm9tcHQiLCJib3JkZXJUb3AiLCJlIiwidGFyZ2V0IiwidmFsdWUiLCJib3JkZXJDb2xvciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJBSUNoYXRib3QuanN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgICBCb3gsIFR5cG9ncmFwaHksIFRleHRGaWVsZCwgSWNvbkJ1dHRvbiwgRmFiLCBEcmF3ZXIsXG4gICAgRmFkZSwgQ2hpcCwgQXZhdGFyLFxufSBmcm9tIFwiQG11aS9tYXRlcmlhbFwiO1xuaW1wb3J0IFNtYXJ0VG95Um91bmRlZEljb24gZnJvbSBcIkBtdWkvaWNvbnMtbWF0ZXJpYWwvU21hcnRUb3lSb3VuZGVkXCI7XG5pbXBvcnQgU2VuZFJvdW5kZWRJY29uIGZyb20gXCJAbXVpL2ljb25zLW1hdGVyaWFsL1NlbmRSb3VuZGVkXCI7XG5pbXBvcnQgQ2xvc2VSb3VuZGVkSWNvbiBmcm9tIFwiQG11aS9pY29ucy1tYXRlcmlhbC9DbG9zZVJvdW5kZWRcIjtcbmltcG9ydCBMaWdodGJ1bGJSb3VuZGVkSWNvbiBmcm9tIFwiQG11aS9pY29ucy1tYXRlcmlhbC9MaWdodGJ1bGJSb3VuZGVkXCI7XG5pbXBvcnQgUHN5Y2hvbG9neVJvdW5kZWRJY29uIGZyb20gXCJAbXVpL2ljb25zLW1hdGVyaWFsL1BzeWNob2xvZ3lSb3VuZGVkXCI7XG5pbXBvcnQgUm9ja2V0TGF1bmNoUm91bmRlZEljb24gZnJvbSBcIkBtdWkvaWNvbnMtbWF0ZXJpYWwvUm9ja2V0TGF1bmNoUm91bmRlZFwiO1xyXG5pbXBvcnQgeyBtZW50b3JBUEkgfSBmcm9tIFwiLi9hcGlcIjtcbmltcG9ydCB7IHVzZVRoZW1lIH0gZnJvbSBcIi4vVGhlbWVDb250ZXh0XCI7XG5pbXBvcnQgeyBnZXRUb2tlbnMsIEFDQ0VOVFMgfSBmcm9tIFwiLi90aGVtZS90b2tlbnNcIjtcbmltcG9ydCB7IENsYXlDYXJkLCBHbGFzc1BhbmVsLCBDbGF5QnV0dG9uLCBQYWdlSGVhZGVyLCBTdGF0VGlsZSwgU2VnbWVudFRhYnMsIEVtcHR5U3RhdGUsIExvYWRpbmdTdGF0ZSwgQ2hhcnRUb29sdGlwIH0gZnJvbSBcIi4vdGhlbWUvQ2xheVwiO1xuXG5jb25zdCBRVUlDS19QUk9NUFRTID0gW1xuICAgIHsgaWNvbjogPExpZ2h0YnVsYlJvdW5kZWRJY29uIHN4PXt7IGZvbnRTaXplOiAxNCB9fSAvPiwgdGV4dDogXCJXaGF0IHNraWxscyBkbyBJIG5lZWQgZm9yIEFJL01MP1wiLCBjb2xvcjogXCIjOWI2ZGZmXCIgfSxcbiAgICB7IGljb246IDxQc3ljaG9sb2d5Um91bmRlZEljb24gc3g9e3sgZm9udFNpemU6IDE0IH19IC8+LCB0ZXh0OiBcIkNyZWF0ZSBhIGxlYXJuaW5nIHJvYWRtYXAgZm9yIG1lXCIsIGNvbG9yOiBcIiM0ZjhlZjdcIiB9LFxuICAgIHsgaWNvbjogPFJvY2tldExhdW5jaFJvdW5kZWRJY29uIHN4PXt7IGZvbnRTaXplOiAxNCB9fSAvPiwgdGV4dDogXCJIb3cgZG8gSSBnZXQgbXkgZmlyc3Qgam9iP1wiLCBjb2xvcjogXCIjM2VjZjhlXCIgfSxcbl07XG5cbmNvbnN0IEFJX1JFU1BPTlNFUyA9IHtcbiAgICBcIndoYXQgc2tpbGxzIGRvIGkgbmVlZCBmb3IgYWkvbWw/XCI6IGBHcmVhdCBxdWVzdGlvbiEgSGVyZSdzIHlvdXIgcGVyc29uYWxpemVkIEFJL01MIHNraWxsIHJvYWRtYXA6XFxuXFxuKipQaGFzZSAxIC0gRm91bmRhdGlvbnMgKFdlZWtzIDEtNCkqKlxcbiBQeXRob24gUHJvZ3JhbW1pbmcg4oaSIE51bVB5ICYgUGFuZGFzIOKGkiBMaW5lYXIgQWxnZWJyYVxcblxcbioqUGhhc2UgMiAtIENvcmUgTUwgKFdlZWtzIDUtMTApKipcXG4gTWFjaGluZSBMZWFybmluZyBBbGdvcml0aG1zIOKGkiBTY2lraXQtbGVhcm4g4oaSIEZlYXR1cmUgRW5naW5lZXJpbmdcXG5cXG4qKlBoYXNlIDMgLSBEZWVwIExlYXJuaW5nIChXZWVrcyAxMS0xNikqKlxcbiBOZXVyYWwgTmV0d29ya3Mg4oaSIFRlbnNvckZsb3cvUHlUb3JjaCDihpIgQ05OcyAmIFJOTnNcXG5cXG4qKlBoYXNlIDQgLSBTcGVjaWFsaXphdGlvbiAoV2Vla3MgMTctMjQpKipcXG4gTkxQIG9yIENvbXB1dGVyIFZpc2lvbiDihpIgTUxPcHMg4oaSIFByb2plY3RzIFBvcnRmb2xpb1xcblxcbkkgcmVjb21tZW5kIHN0YXJ0aW5nIHdpdGggUHl0aG9uIGZ1bmRhbWVudGFscyBhbmQgdGFraW5nIG91ciBQeXRob24gZm9yIEJlZ2lubmVycyBjb3Vyc2UgZmlyc3QhYCxcbiAgICBcImNyZWF0ZSBhIGxlYXJuaW5nIHJvYWRtYXAgZm9yIG1lXCI6IGBJJ3ZlIGFuYWx5emVkIHlvdXIgcHJvZmlsZSBhbmQgY3JlYXRlZCBhIHBlcnNvbmFsaXplZCByb2FkbWFwIVxcblxcbioqWW91ciBDdXJyZW50IExldmVsOioqIEJlZ2lubmVyIChhc3Nlc3NlZCBmcm9tIHlvdXIgc2tpbGxzKVxcbioqVGFyZ2V0IFJvbGU6KiogQUkvTUwgRW5naW5lZXJcXG4qKkVzdGltYXRlZCBUaW1lbGluZToqKiA2IG1vbnRoc1xcblxcbioqTW9udGggMS0yOiBGb3VuZGF0aW9ucyoqXFxu4oaSIFB5dGhvbiBBZHZhbmNlZCBjb3Vyc2VcXG7ihpIgU3RhdGlzdGljcyBmb3IgRGF0YSBTY2llbmNlXFxu4oaSIDIgbWluaS1wcm9qZWN0c1xcblxcbioqTW9udGggMy00OiBDb3JlIFNraWxscyoqXFxu4oaSIE1hY2hpbmUgTGVhcm5pbmcgRnVuZGFtZW50YWxzXFxu4oaSIERlZXAgTGVhcm5pbmcgd2l0aCBOZXVyYWwgTmV0d29ya3NcXG7ihpIgS2FnZ2xlIGNvbXBldGl0aW9uc1xcblxcbioqTW9udGggNS02OiBBZHZhbmNlZCAmIFBvcnRmb2xpbyoqXFxu4oaSIE5MUCBvciBDb21wdXRlciBWaXNpb24gc3BlY2lhbGl6YXRpb25cXG7ihpIgMyBwb3J0Zm9saW8gcHJvamVjdHNcXG7ihpIgTW9jayBpbnRlcnZpZXdzXFxuXFxuV291bGQgeW91IGxpa2UgbWUgdG8gZW5yb2xsIHlvdSBpbiB0aGUgZmlyc3QgY291cnNlP2AsXG4gICAgXCJob3cgZG8gaSBnZXQgbXkgZmlyc3Qgam9iP1wiOiBgSGVyZSdzIHlvdXIgam9iLXJlYWR5IGFjdGlvbiBwbGFuOlxcblxcbioqU3RlcCAxOiBCdWlsZCBQb3J0Zm9saW8gKERvIHRoaXMgd2VlaykqKlxcbuKGkiAzIHNvbGlkIHByb2plY3RzIG9uIEdpdEh1YlxcbuKGkiBEZXBsb3kgb25lIHByb2plY3Qgb25saW5lXFxuXFxuKipTdGVwIDI6IE9wdGltaXplIFByZXNlbmNlKipcXG7ihpIgTGlua2VkSW4gcHJvZmlsZSB3aXRoIGtleXdvcmRzXFxu4oaSIEdpdEh1YiB3aXRoIGdvb2QgUkVBRE1Fc1xcbuKGkiBUZWNobmljYWwgYmxvZyAoZXZlbiAyLTMgcG9zdHMpXFxuXFxuKipTdGVwIDM6IEFwcGx5IFN0cmF0ZWdpY2FsbHkqKlxcbuKGkiAxMCBhcHBsaWNhdGlvbnMvZGF5IHRvIHJlbGV2YW50IHJvbGVzXFxu4oaSIFRhcmdldDogU3RhcnR1cHMgKyBNaWQtc2l6ZSBjb21wYW5pZXNcXG7ihpIgUm9sZXM6IEp1bmlvciBNTCBFbmdpbmVlciwgRGF0YSBBbmFseXN0LCBBSSBJbnRlcm5cXG5cXG4qKlN0ZXAgNDogUHJlcGFyZSBmb3IgSW50ZXJ2aWV3cyoqXFxu4oaSIFRha2UgNSsgYXNzZXNzbWVudHMgb24gb3VyIHBsYXRmb3JtXFxu4oaSIFByYWN0aWNlIGNvZGluZyBwcm9ibGVtc1xcbuKGkiBQcmVwYXJlIHByb2plY3QgZXhwbGFuYXRpb25zXFxuXFxuKipQcm8gVGlwOioqIENvbXBhbmllcyB2YWx1ZSBwcm9qZWN0cyBtb3JlIHRoYW4gY2VydGlmaWNhdGVzLiBGb2N1cyBvbiBidWlsZGluZyFgLFxufTtcblxuY29uc3QgZ2V0QUlSZXNwb25zZSA9IChtZXNzYWdlKSA9PiB7XG5jb25zdCBsb3dlck1zZyA9IG1lc3NhZ2UudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgXG4gICAgZm9yIChjb25zdCBba2V5LCByZXNwb25zZV0gb2YgT2JqZWN0LmVudHJpZXMoQUlfUkVTUE9OU0VTKSkge1xuICAgICAgICBpZiAobG93ZXJNc2cuaW5jbHVkZXMoa2V5KSB8fCBrZXkuaW5jbHVkZXMobG93ZXJNc2cpKSByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICAgIFxuICAgIGlmIChsb3dlck1zZy5pbmNsdWRlcyhcInNraWxsXCIpIHx8IGxvd2VyTXNnLmluY2x1ZGVzKFwibGVhcm5cIikpIHtcbiAgICAgICAgcmV0dXJuIGBCYXNlZCBvbiB5b3VyIGRvbWFpbiBpbnRlcmVzdCwgaGVyZSBhcmUgdGhlIGtleSBza2lsbHMgeW91IHNob3VsZCBmb2N1cyBvbjpcXG5cXG4qKlRlY2huaWNhbCBTa2lsbHM6KipcXG7ihpIgUHJvZ3JhbW1pbmcgKFB5dGhvbi9KYXZhU2NyaXB0KVxcbuKGkiBEb21haW4tc3BlY2lmaWMgdG9vbHNcXG7ihpIgRGF0YSBzdHJ1Y3R1cmVzICYgYWxnb3JpdGhtc1xcblxcbioqU29mdCBTa2lsbHM6KipcXG7ihpIgUHJvYmxlbS1zb2x2aW5nXFxu4oaSIENvbW11bmljYXRpb25cXG7ihpIgUHJvamVjdCBtYW5hZ2VtZW50XFxuXFxuV291bGQgeW91IGxpa2UgbWUgdG8gY3JlYXRlIGEgZGV0YWlsZWQgbGVhcm5pbmcgcGxhbiBmb3IgeW91P2A7XG4gICAgfVxuICAgIFxuICAgIGlmIChsb3dlck1zZy5pbmNsdWRlcyhcImpvYlwiKSB8fCBsb3dlck1zZy5pbmNsdWRlcyhcImNhcmVlclwiKSB8fCBsb3dlck1zZy5pbmNsdWRlcyhcImludGVydmlld1wiKSkge1xuICAgICAgICByZXR1cm4gYExldCBtZSBoZWxwIHlvdSB3aXRoIGNhcmVlciBndWlkYW5jZSFcXG5cXG4qKlF1aWNrIEFzc2Vzc21lbnQ6KipcXG7ihpIgVGFrZSBza2lsbCBhc3Nlc3NtZW50cyB0byBpZGVudGlmeSBnYXBzXFxu4oaSIEJ1aWxkIDItMyBwb3J0Zm9saW8gcHJvamVjdHNcXG7ihpIgUHJhY3RpY2Ugd2l0aCBvdXIgQUkgaW50ZXJ2aWV3IHByZXBcXG5cXG4qKkN1cnJlbnQgTWFya2V0IFRyZW5kczoqKlxcbuKGkiBBSS9NTCByb2xlcyBhcmUgdXAgNzUlIHRoaXMgeWVhclxcbuKGkiBSZW1vdGUgb3Bwb3J0dW5pdGllcyBhdmFpbGFibGVcXG7ihpIgQXZlcmFnZSBlbnRyeSBzYWxhcnk6IOKCuTgtMTUgTFBBXFxuXFxuV2FudCBtZSB0byBhbmFseXplIHlvdXIgcmVzdW1lIG9yIHN1Z2dlc3Qgc3BlY2lmaWMgcm9sZXM/YDtcbiAgICB9XG4gICAgXG4gICAgaWYgKGxvd2VyTXNnLmluY2x1ZGVzKFwiaGVsbG9cIikgfHwgbG93ZXJNc2cuaW5jbHVkZXMoXCJoaVwiKSB8fCBsb3dlck1zZy5pbmNsdWRlcyhcImhleVwiKSkge1xuICAgICAgICByZXR1cm4gYEhleSB0aGVyZSEgSSdtIHlvdXIgQUkgQ2FyZWVyIE1lbnRvci4gSSBjYW4gaGVscCB5b3Ugd2l0aDpcXG5cXG7ihpIgTGVhcm5pbmcgcm9hZG1hcHNcXG7ihpIgU2tpbGwgZ2FwIGFuYWx5c2lzXFxu4oaSIENhcmVlciBndWlkYW5jZVxcbuKGkiBJbnRlcnZpZXcgcHJlcGFyYXRpb25cXG7ihpIgUHJvamVjdCBpZGVhc1xcblxcbldoYXQgd291bGQgeW91IGxpa2UgdG8gZXhwbG9yZSB0b2RheT9gO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYFRoYXQncyBhIGdyZWF0IHF1ZXN0aW9uISBMZXQgbWUgdGhpbmsgYWJvdXQgdGhhdC4uLlxcblxcbkJhc2VkIG9uIHlvdXIgY3VycmVudCBwcm9maWxlIGFuZCBnb2FscywgaGVyZSBhcmUgbXkgcmVjb21tZW5kYXRpb25zOlxcblxcbioqSW1tZWRpYXRlIEFjdGlvbnM6KipcXG7ihpIgVGFrZSBhIHNraWxsIGFzc2Vzc21lbnQgdG8gaWRlbnRpZnkgeW91ciBsZXZlbFxcbuKGkiBCcm93c2UgcmVsZXZhbnQgY291cnNlcyBpbiB5b3VyIGRvbWFpblxcbuKGkiBTZXQgd2Vla2x5IGxlYXJuaW5nIGdvYWxzXFxuXFxuKipUaGlzIFdlZWs6KipcXG7ihpIgQ29tcGxldGUgb25lIGxlYXJuaW5nIG1vZHVsZVxcbuKGkiBQcmFjdGljZSB3aXRoIGhhbmRzLW9uIGV4ZXJjaXNlc1xcbuKGkiBUcmFjayB5b3VyIHByb2dyZXNzIG9uIHRoZSBkYXNoYm9hcmRcXG5cXG5JcyB0aGVyZSBhbnl0aGluZyBzcGVjaWZpYyB5b3UnZCBsaWtlIHRvIGRpdmUgZGVlcGVyIGludG8/IEkgY2FuIGhlbHAgd2l0aCBsZWFybmluZyBwYXRocywgY2FyZWVyIGFkdmljZSwgb3IgdGVjaG5pY2FsIHF1ZXN0aW9ucyFgO1xufTtcblxuY29uc3QgQUlDaGF0Ym90ID0gKHsgZG9tYWluIH0pID0+IHtcbiAgICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW21lc3NhZ2VzLCBzZXRNZXNzYWdlc10gPSB1c2VTdGF0ZShbXG4gICAgICAgIHsgcm9sZTogXCJhaVwiLCB0ZXh0OiBgSGkhIEknbSB5b3VyIEFJIENhcmVlciBNZW50b3IuIEkgc2VlIHlvdSdyZSBpbnRlcmVzdGVkIGluICR7ZG9tYWluPy5sYWJlbCB8fCBcImxlYXJuaW5nXCJ9LiBIb3cgY2FuIEkgaGVscCB5b3UgdG9kYXk/YCB9XG4gICAgXSk7XG4gICAgY29uc3QgW2lucHV0LCBzZXRJbnB1dF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBjb25zdCBbdHlwaW5nLCBzZXRUeXBpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IG1lc3NhZ2VzRW5kUmVmID0gdXNlUmVmKG51bGwpO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbWVzc2FnZXNFbmRSZWYuY3VycmVudD8uc2Nyb2xsSW50b1ZpZXcoeyBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KTtcbiAgICB9LCBbbWVzc2FnZXNdKTtcblxuICAgIGNvbnN0IHNlbmRNZXNzYWdlID0gYXN5bmMgKHRleHQpID0+IHtcbiAgICAgICAgaWYgKCF0ZXh0LnRyaW0oKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB1c2VyTXNnID0geyByb2xlOiBcInVzZXJcIiwgdGV4dDogdGV4dC50cmltKCkgfTtcbiAgICAgICAgY29uc3QgaGlzdG9yeSA9IFsuLi5tZXNzYWdlcywgdXNlck1zZ10ubWFwKChtKSA9PiAoe1xuICAgICAgICAgICAgcm9sZTogbS5yb2xlID09PSBcImFpXCIgPyBcIm1lbnRvclwiIDogXCJ1c2VyXCIsXG4gICAgICAgICAgICB0ZXh0OiBtLnRleHQsXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2V0TWVzc2FnZXMocHJldiA9PiBbLi4ucHJldiwgdXNlck1zZ10pO1xuICAgICAgICBzZXRJbnB1dChcIlwiKTtcbiAgICAgICAgc2V0VHlwaW5nKHRydWUpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IG1lbnRvckFQSS5jaGF0KHVzZXJNc2cudGV4dCwgaGlzdG9yeS5zbGljZSgtMTApKTtcbiAgICAgICAgICAgIHNldE1lc3NhZ2VzKHByZXYgPT4gWy4uLnByZXYsIHsgcm9sZTogXCJhaVwiLCB0ZXh0OiBkYXRhLnJlcGx5IH1dKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBCYWNrZW5kIG9mZmxpbmUgLSBmYWxsIGJhY2sgdG8gdGhlIGxvY2FsIGNhbm5lZCByZXNwb25zZVxuICAgICAgICAgICAgc2V0TWVzc2FnZXMocHJldiA9PiBbLi4ucHJldiwgeyByb2xlOiBcImFpXCIsIHRleHQ6IGdldEFJUmVzcG9uc2UodGV4dCkgfV0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0VHlwaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIChcbiAgICAgICAgPD5cbiAgICAgICAgICAgIHsvKiBGbG9hdGluZyBBY3Rpb24gQnV0dG9uICovfVxuICAgICAgICAgICAgPEZhYlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4odHJ1ZSl9XG4gICAgICAgICAgICAgICAgc3g9e3tcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIiwgYm90dG9tOiAyNCwgcmlnaHQ6IDI0LCB6SW5kZXg6IDEwMDAsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzliNmRmZiwgIzRmOGVmNylcIixcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwiI2ZmZlwiLCB3aWR0aDogNTYsIGhlaWdodDogNTYsXG4gICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogXCIwIDRweCAyMHB4IHJnYmEoMTU1LDEwOSwyNTUsMC40KVwiLFxuICAgICAgICAgICAgICAgICAgICBcIiY6aG92ZXJcIjogeyBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNiMDhhZmYsICM2YmEzZmYpXCIsIGJveFNoYWRvdzogXCIwIDZweCAzMHB4IHJnYmEoMTU1LDEwOSwyNTUsMC42KVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogXCJwdWxzZUdsb3cgMnMgZWFzZSBpbmZpbml0ZVwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFNtYXJ0VG95Um91bmRlZEljb24gc3g9e3sgZm9udFNpemU6IDI2IH19IC8+XG4gICAgICAgICAgICA8L0ZhYj5cblxuICAgICAgICAgICAgey8qIENoYXQgRHJhd2VyICovfVxuICAgICAgICAgICAgPERyYXdlciBhbmNob3I9XCJyaWdodFwiIG9wZW49e29wZW59IG9uQ2xvc2U9eygpID0+IHNldE9wZW4oZmFsc2UpfVxuICAgICAgICAgICAgICAgIFBhcGVyUHJvcHM9e3sgc3g6IHsgd2lkdGg6IDQwMCwgbWF4V2lkdGg6IFwiOTB2d1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICh0eXBlb2YgdCAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0LmdsYXNzPy5wYW5lbCkgPz8gXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNTUpXCIsIGJhY2tkcm9wRmlsdGVyOiBcImJsdXIoMjRweCkgc2F0dXJhdGUoMS4zKVwiLCBXZWJraXRCYWNrZHJvcEZpbHRlcjogXCJibHVyKDI0cHgpIHNhdHVyYXRlKDEuMylcIixcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJMZWZ0OiBgMXB4IHNvbGlkICR7dC5ib3JkZXIuc3VidGxlfWAgfSB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgaGVpZ2h0OiBcIjEwMCVcIiwgZGlzcGxheTogXCJmbGV4XCIsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgcDogMiwgYm9yZGVyQm90dG9tOiBgMXB4IHNvbGlkICR7dC5ib3JkZXIuc3VidGxlfWAsIGRpc3BsYXk6IFwiZmxleFwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZS1iZXR3ZWVuXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHN4PXt7IGRpc3BsYXk6IFwiZmxleFwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEuNSB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHN4PXt7IHdpZHRoOiAzNiwgaGVpZ2h0OiAzNiwgYm9yZGVyUmFkaXVzOiBcIjEycHhcIiwgZGlzcGxheTogXCJmbGV4XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMTU1LDEwOSwyNTUsMC4yKSwgcmdiYSg3OSwxNDIsMjQ3LDAuMikpXCIsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgxNTUsMTA5LDI1NSwwLjMpXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTbWFydFRveVJvdW5kZWRJY29uIHN4PXt7IGZvbnRTaXplOiAyMCwgY29sb3I6IFwiIzliNmRmZlwiIH19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHkgc3g9e3sgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiA2MDAgfX0+QUkgQ2FyZWVyIE1lbnRvcjwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHkgc3g9e3sgZm9udFNpemU6IDEwLCBjb2xvcjogXCIjM2VjZjhlXCIgfX0+T25saW5lPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKGZhbHNlKX0gc3g9e3sgY29sb3I6IHQuc2Vjb25kYXJ5IH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDbG9zZVJvdW5kZWRJY29uIHN4PXt7IGZvbnRTaXplOiAyMCB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgICAgICB7LyogTWVzc2FnZXMgKi99XG4gICAgICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgZmxleDogMSwgb3ZlcmZsb3dZOiBcImF1dG9cIiwgcDogMiwgZGlzcGxheTogXCJmbGV4XCIsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHttZXNzYWdlcy5tYXAoKG1zZywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGYWRlIGtleT17aX0gaW4gdGltZW91dD17MzAwfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBzeD17eyBkaXNwbGF5OiBcImZsZXhcIiwgZ2FwOiAxLCBmbGV4RGlyZWN0aW9uOiBtc2cucm9sZSA9PT0gXCJ1c2VyXCIgPyBcInJvdy1yZXZlcnNlXCIgOiBcInJvd1wiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEF2YXRhciBzeD17eyB3aWR0aDogMjgsIGhlaWdodDogMjgsIGJhY2tncm91bmQ6IG1zZy5yb2xlID09PSBcImFpXCIgPyBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICM5YjZkZmYsICM0ZjhlZjcpXCIgOiB0LmdsYXNzLmNoaXAsIGZsZXhTaHJpbms6IDAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge21zZy5yb2xlID09PSBcImFpXCIgPyA8U21hcnRUb3lSb3VuZGVkSWNvbiBzeD17eyBmb250U2l6ZTogMTYgfX0gLz4gOiA8VHlwb2dyYXBoeSBzeD17eyBmb250U2l6ZTogMTIgfX0+VTwvVHlwb2dyYXBoeT59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0F2YXRhcj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgbWF4V2lkdGg6IFwiODAlXCIsIHA6IDEuNSwgYm9yZGVyUmFkaXVzOiBtc2cucm9sZSA9PT0gXCJ1c2VyXCIgPyBcIjE0cHggMTRweCA0cHggMTRweFwiIDogXCIxNHB4IDE0cHggMTRweCA0cHhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBtc2cucm9sZSA9PT0gXCJ1c2VyXCIgPyBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICM0ZjhlZjcsICM5YjZkZmYpXCIgOiB0LmdsYXNzLmluc2V0LCBib3JkZXI6IG1zZy5yb2xlID09PSBcImFpXCIgPyBgMXB4IHNvbGlkICR7dC5ib3JkZXIuc3VidGxlfWAgOiBcIm5vbmVcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeSBzeD17eyBmb250U2l6ZTogMTIsIHdoaXRlU3BhY2U6IFwicHJlLXdyYXBcIiwgbGluZUhlaWdodDogMS42LCBjb2xvcjogbXNnLnJvbGUgPT09IFwidXNlclwiID8gXCIjZmZmXCIgOiB0LnRleHQucHJpbWFyeSB9fT57bXNnLnRleHR9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRmFkZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3R5cGluZyAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBzeD17eyBkaXNwbGF5OiBcImZsZXhcIiwgZ2FwOiAxLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QXZhdGFyIHN4PXt7IHdpZHRoOiAyOCwgaGVpZ2h0OiAyOCwgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjOWI2ZGZmLCAjNGY4ZWY3KVwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFNtYXJ0VG95Um91bmRlZEljb24gc3g9e3sgZm9udFNpemU6IDE2IH19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQXZhdGFyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHN4PXt7IHA6IDEuNSwgYm9yZGVyUmFkaXVzOiBcIjE0cHhcIiwgYmFja2dyb3VuZDogYHQuZ2xhc3MuaW5zZXRgLCBib3JkZXI6IGAxcHggc29saWQgJHt0LmJvcmRlci5zdWJ0bGV9YCB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgZGlzcGxheTogXCJmbGV4XCIsIGdhcDogMC41IH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgd2lkdGg6IDYsIGhlaWdodDogNiwgYm9yZGVyUmFkaXVzOiBcIjUwJVwiLCBiYWNrZ3JvdW5kOiBcIiM5YjZkZmZcIiwgYW5pbWF0aW9uOiBcImZsb2F0IDFzIGVhc2UgaW5maW5pdGVcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgd2lkdGg6IDYsIGhlaWdodDogNiwgYm9yZGVyUmFkaXVzOiBcIjUwJVwiLCBiYWNrZ3JvdW5kOiBcIiM0ZjhlZjdcIiwgYW5pbWF0aW9uOiBcImZsb2F0IDFzIGVhc2UgaW5maW5pdGUgMC4yc1wiIH19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBzeD17eyB3aWR0aDogNiwgaGVpZ2h0OiA2LCBib3JkZXJSYWRpdXM6IFwiNTAlXCIsIGJhY2tncm91bmQ6IFwiIzNlY2Y4ZVwiLCBhbmltYXRpb246IFwiZmxvYXQgMXMgZWFzZSBpbmZpbml0ZSAwLjRzXCIgfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHJlZj17bWVzc2FnZXNFbmRSZWZ9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgICAgICAgICAgIHsvKiBRdWljayBQcm9tcHRzICovfVxuICAgICAgICAgICAgICAgICAgICB7bWVzc2FnZXMubGVuZ3RoIDw9IDEgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBzeD17eyBweDogMiwgcGI6IDEsIGRpc3BsYXk6IFwiZmxleFwiLCBnYXA6IDEsIGZsZXhXcmFwOiBcIndyYXBcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7UVVJQ0tfUFJPTVBUUy5tYXAoKHByb21wdCwgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2hpcCBrZXk9e2l9IGxhYmVsPXtwcm9tcHQudGV4dH0gaWNvbj17cHJvbXB0Lmljb259IG9uQ2xpY2s9eygpID0+IHNlbmRNZXNzYWdlKHByb21wdC50ZXh0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN4PXt7IGZvbnRTaXplOiAxMCwgaGVpZ2h0OiAyOCwgY29sb3I6IHByb21wdC5jb2xvciwgYmFja2dyb3VuZDogYCR7cHJvbXB0LmNvbG9yfTEwYCwgYm9yZGVyOiBgMXB4IHNvbGlkICR7cHJvbXB0LmNvbG9yfTI1YCwgXCImOmhvdmVyXCI6IHsgYmFja2dyb3VuZDogYCR7cHJvbXB0LmNvbG9yfTIwYCB9IH19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICAgICAgICB7LyogSW5wdXQgKi99XG4gICAgICAgICAgICAgICAgICAgIDxCb3ggc3g9e3sgcDogMiwgYm9yZGVyVG9wOiBgMXB4IHNvbGlkICR7dC5ib3JkZXIuc3VidGxlfWAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHN4PXt7IGRpc3BsYXk6IFwiZmxleFwiLCBnYXA6IDEsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCBmdWxsV2lkdGggc2l6ZT1cInNtYWxsXCIgcGxhY2Vob2xkZXI9XCJBc2sgbWUgYW55dGhpbmcuLi5cIiB2YWx1ZT17aW5wdXR9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0SW5wdXQoZS50YXJnZXQudmFsdWUpfSBvbktleURvd249eyhlKSA9PiBlLmtleSA9PT0gXCJFbnRlclwiICYmIHNlbmRNZXNzYWdlKGlucHV0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3g9e3sgXCImIC5NdWlPdXRsaW5lZElucHV0LXJvb3RcIjogeyBib3JkZXJSYWRpdXM6IFwiMTJweFwiLCBjb2xvcjogdC5wcmltYXJ5LCBcIiYgZmllbGRzZXRcIjogeyBib3JkZXJDb2xvcjogYHQuYm9yZGVyLnN1YnRsZWAgfSwgXCImOmhvdmVyIGZpZWxkc2V0XCI6IHsgYm9yZGVyQ29sb3I6IFwicmdiYSgxNTUsMTA5LDI1NSwwLjMpXCIgfSwgXCImLk11aS1mb2N1c2VkIGZpZWxkc2V0XCI6IHsgYm9yZGVyQ29sb3I6IFwiIzliNmRmZlwiIH0gfSB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxJY29uQnV0dG9uIG9uQ2xpY2s9eygpID0+IHNlbmRNZXNzYWdlKGlucHV0KX0gZGlzYWJsZWQ9eyFpbnB1dC50cmltKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN4PXt7IHdpZHRoOiA0MCwgaGVpZ2h0OiA0MCwgYm9yZGVyUmFkaXVzOiBcIjEycHhcIiwgYmFja2dyb3VuZDogaW5wdXQudHJpbSgpID8gXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjOWI2ZGZmLCAjNGY4ZWY3KVwiIDogdC5nbGFzcy5pbnNldCwgY29sb3I6IHQucHJpbWFyeSwgXCImOmhvdmVyXCI6IHsgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjYjA4YWZmLCAjNmJhM2ZmKVwiIH0sIFwiJi5NdWktZGlzYWJsZWRcIjogeyBiYWNrZ3JvdW5kOiBgdC5nbGFzcy5pbnNldGAsIGNvbG9yOiB0LnNlY29uZGFyeSB9IH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U2VuZFJvdW5kZWRJY29uIHN4PXt7IGZvbnRTaXplOiAxOCB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgIDwvRHJhd2VyPlxuICAgICAgICA8Lz5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQUlDaGF0Ym90O1xyXG4iXSwiZmlsZSI6IkM6L1VzZXJzL1lvZ2EgcGFyd2V6aCBBL3NpaC1oYWNrLWRlbW8vc3JjL0FJQ2hhdGJvdC5qc3gifQ==