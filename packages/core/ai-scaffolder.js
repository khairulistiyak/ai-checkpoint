const fs = require('fs');
const path = require('path');

function scaffoldStrictRules(projectPath) {
  const rulesPath = path.join(projectPath, '.agents', 'RULES.md');
  
  const strictRulesContent = `# 🚀 World Top 1 Standards (Enforced)

> ⚠️ **CRITICAL INSTRUCTION**: This project is monitored by the Advanced AI Intelligence System. You MUST adhere to the following standards. Any code that falls below these standards will be flagged.

## 1. 100% Responsive Strictness
- **NO Hardcoded Pixels**: You must NEVER use fixed pixels (e.g., \`width: 200px\`, \`font-size: 16px\`) for layout or typography.
- **Fluid & Scalable**: Use \`clamp()\`, \`vw/vh\`, \`rem\`, and percentages for all layout elements.
- **Mobile First**: Every component must look perfect on mobile, tablet, and desktop without exception.

## 2. Dynamic & Interactive UI
- **NO Static Elements**: Buttons, links, and cards MUST have hover, focus, and active states.
- **Micro-interactions**: Use transitions and animations to make the UI feel alive (e.g., \`transform: translateY(-2px)\`).
- **Stateful**: Use proper state management hooks and event handlers where applicable.

## 3. High-Performance Backend
- **Scalable Architecture**: Ensure all APIs and database queries are optimized.
- **Lazy Loading**: Import modules and load data dynamically when possible.
- **Security**: Never hardcode secrets. Validate all user inputs.

## 4. Accessibility (a11y)
- **ARIA Labels**: All interactive elements must have proper aria labels.
- **Keyboard Navigation**: Ensure the entire app is navigable via keyboard.
- **Contrast**: Maintain a high contrast ratio for text.

*Failure to comply will result in a penalty to the project's intelligence grade.*
`;

  fs.mkdirSync(path.dirname(rulesPath), { recursive: true });
  fs.writeFileSync(rulesPath, strictRulesContent, 'utf8');
}

module.exports = {
  scaffoldStrictRules
};
