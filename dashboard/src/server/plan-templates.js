const TIER_CONFIG = {
  small: {
    label: 'Small',
    emoji: '🟢',
    maxStepsPerPhase: 5,
    codeRequired: true,
    dependsAllowed: false,
    doneCheckType: 'simple',
    description: 'Simple structured plans for lightweight models',
    models: 'GPT-3.5, Gemini Flash, Claude Haiku',
    agentsRules: `## 🤖 AI Model Tier: Small
- Maximum 5 steps per phase
- Each step MUST have complete code block
- No chain dependencies between steps
- Done-check: file existence only (test -f)
- One file = one step = one action (STRICT)`
  },
  medium: {
    label: 'Medium',
    emoji: '🟡',
    maxStepsPerPhase: 10,
    codeRequired: false,
    dependsAllowed: true,
    doneCheckType: 'command',
    description: 'Standard plans for capable models',
    models: 'GPT-4o, Gemini Pro, Claude Sonnet',
    agentsRules: `## 🤖 AI Model Tier: Medium
- Maximum 10 steps per phase
- Each step needs code OR clear unambiguous instruction
- Linear dependencies allowed
- Done-check: any verifiable command
- One file = one step (recommended)`
  },
  high: {
    label: 'High',
    emoji: '🔴',
    maxStepsPerPhase: Infinity,
    codeRequired: false,
    dependsAllowed: true,
    doneCheckType: 'any',
    description: 'Unrestricted plans for advanced models',
    models: 'GPT-4, o1, Gemini Ultra, Claude Opus',
    agentsRules: `## 🤖 AI Model Tier: High
- No step limit per phase
- Full creative freedom in step format
- Any dependency structure allowed
- Any verification method accepted
- Agent decides optimal approach`
  }
};

function generatePlanTemplate(name, tier, description = '') {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.medium;
  const descStr = description || `Plan description for ${name}.`;

  if (tier === 'small') {
    return `# Plan: ${name}

> ${descStr}
> (AI Tier: Small — Max 5 steps/phase)

---

## Step 1.1 — Create initial module
- **File:** \`src/index.js\`
- **Action:** CREATE
- **Content:**
  \`\`\`javascript
  module.exports = { name: 'small-model-template' };
  \`\`\`
- **Done-check:** \`test -f src/index.js\`
- **Depends:** None

**Description:** Initialize the index file with a basic console log.
`;
  }

  if (tier === 'high') {
    return `# Plan: ${name}

> ${descStr}
> (AI Tier: High — No constraints)

---

## 1.1 — Create file
- **File:** \`src/index.js\`
- **Action:** CREATE
- **Done-check:** \`test -f src/index.js\`
- **Depends:** None

Write the complete code block or description here.
`;
  }

  // Medium (Default)
  return `# Plan: ${name}

> ${descStr}
> (AI Tier: Medium — Standard format)

---

## Step 1.1 — [Step Title]
- **File:** \`src/index.js\`
- **Action:** CREATE
- **Content:**
  // Put working code here
- **Done-check:** \`node -e "require('./src/index.js')"\`
- **Depends:** None

**Description:** Detailed instruction of what to do.
`;
}

function getAgentsTierBlock(tier) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.medium;
  return `<!-- AI-TIER-START -->
${config.agentsRules}
<!-- AI-TIER-END -->`;
}

export {
  TIER_CONFIG,
  generatePlanTemplate,
  getAgentsTierBlock
};
