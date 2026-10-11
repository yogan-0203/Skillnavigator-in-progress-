// Fix DomainSelector: it references t.* but never sets up the theme.
// 1) add useTheme + getTokens imports
// 2) inject `const { darkMode } = useTheme(); const t = getTokens(darkMode);`
//    at the top of the component body.
const fs = require("fs");
const p = "src/DomainSelector.jsx";
let s = fs.readFileSync(p, "utf8");
const before = s;

// 1) imports (after the react-router import line)
if (!/useTheme/.test(s)) {
    s = s.replace(
        /import \{ useNavigate \} from "react-router-dom";/,
        'import { useNavigate } from "react-router-dom";\nimport { useTheme } from "./ThemeContext";'
    );
    s = s.replace(
        /import \{ useAuth \} from ".\/AuthContext";/,
        'import { useAuth } from "./AuthContext";\nimport { getTokens } from "./theme/tokens";'
    );
}

// 2) inject theme setup at top of component body (first line after the arrow fn)
if (!/const t = getTokens\(darkMode\)/.test(s)) {
    s = s.replace(
        /const DomainSelector = \(\{ open, onClose, onSelect \}\) => \{\s*\n(\s*)const \[selectedDomain, setSelectedDomain\] = useState\(null\);/,
        `const DomainSelector = ({ open, onClose, onSelect }) => {\n    const { darkMode } = useTheme();\n    const t = getTokens(darkMode);\n$1const [selectedDomain, setSelectedDomain] = useState(null);`
    );
}

if (s !== before) {
    fs.writeFileSync(p, s);
    console.log("DomainSelector: theme setup injected");
} else {
    console.log("DomainSelector: no change (already fixed?)");
}
