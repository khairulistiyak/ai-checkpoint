# Phase 27: AI Model Tier-Based Plan Generation (Optimized)

**Goal:** Dashboard UI থেকে AI model tier (Small/Medium/High) select করে plan generate করা — tier অনুযায়ী plan complexity auto-adjust হবে।

**Why:** Small model কে complex plan দিলে confused হয়, High model কে restricted করলে ক্ষমতা নষ্ট হয়।

**Risk:** Low — new files only, existing functionality untouched

**Steps:** 9

---

## Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| **Storage** | `.agents/ai-config.json` | Project-specific, portable, git-friendly, CLI+Dashboard same source |
| **Templates** | 1 dynamic generator function | 3টা file maintain এর ঝামেলা নেই, config দিয়ে dynamically generate |
| **AGENTS.md update** | Marker block `<!-- AI-TIER -->` | User এর custom rules safe, শুধু marked section update হবে |
| **UI approach** | GeneratePlanModal with embedded tier selector | Generic modal — name + tier + preview — simple UX |
| **Server routes** | 1 merged route file | Over-engineering avoid |

---

## Story

1. আগে: Plan বানাতে গেলে সবার জন্য একই template, model capability ignore হতো
2. সমস্যা: Small model complex plan handle করতে পারে না, High model restricted plan এ ক্ষমতা নষ্ট হয়
3. Fix: UI তে tier select → tier অনুযায়ী plan template + AGENTS.md rules auto-generate
4. পরে: User model select করলেই optimal plan structure পাবে — Small=simple, Medium=standard, High=freedom

---

## Steps

### 27.1 — Create dynamic plan template generator
- **File:** `dashboard/src/server/plan-templates.js`
- **Do:** Single function দিয়ে tier অনুযায়ী plan template ও AGENTS.md rules generate করবে
- **How:** `generatePlanTemplate(name, tier, description)` function — tier config থেকে maxSteps, complexity, codeRequirement read করে dynamic markdown generate করবে। `getAgentsTierBlock(tier)` function — `<!-- AI-TIER-START -->` ও `<!-- AI-TIER-END -->` marker block এর মধ্যে tier-specific rules return করবে। `TIER_CONFIG` object — Small/Medium/High এর constraints define করবে
- **Check:** `node -e "require('./dashboard/src/server/plan-templates.js')"` → no error

### 27.2 — Create AI tier API routes
- **File:** `dashboard/src/server/ai-tier.js`
- **Do:** Express router — tier settings read/write + plan generation endpoint
- **How:** 3 endpoints:
  - `GET /api/projects/:id/ai-tier` → `.agents/ai-config.json` থেকে tier read করবে (default: `medium`)
  - `POST /api/projects/:id/ai-tier` → tier save করবে `.agents/ai-config.json` এ
  - `POST /api/projects/:id/generate-plan` → `{ name, tier, description }` নিয়ে plan file create করবে `plan/` folder এ, AGENTS.md এ marker block update করবে
- **Check:** Server restart → no crash

### 27.3 — Mount AI tier routes in server
- **File:** `dashboard/server.js`
- **Do:** `aiTierRouter` import ও mount করবে
- **How:** `import aiTierRouter from './src/server/ai-tier.js'` → `app.use('/api', aiTierRouter)`
- **Check:** `curl http://localhost:20226/api/projects/test/ai-tier` → response comes

### 27.4 — Add frontend API functions
- **File:** `dashboard/src/utils/api.js`
- **Do:** 3টা new function add করবে
- **How:** `fetchAiTier(id)`, `updateAiTier(id, tier)`, `generatePlan(id, { name, tier, description })` — standard fetch wrapper
- **Check:** File syntax valid → `node -c dashboard/src/utils/api.js` style check

### 27.5 — Create AiTierSelector component
- **File:** `dashboard/src/components/AiTierSelector.jsx`
- **Do:** 3-card tier selector UI — Small 🟢 / Medium 🟡 / High 🔴
- **How:** Each card shows: icon, tier name, description, recommended models, max steps। Selected card gets accent glow + border। `onChange(tier)` callback prop। Animated selection with framer-motion।
- **Check:** Component import matches standard components and has no error

### 27.6 — Create GeneratePlanModal component
- **File:** `dashboard/src/components/GeneratePlanModal.jsx`
- **Do:** Plan generation modal — name input + embedded AiTierSelector + live template preview + generate button
- **How:** Modal with:
  1. Plan name input (validated: `[a-zA-Z0-9-]{1,50}`)
  2. Optional description textarea
  3. AiTierSelector embedded (auto-loads project's saved tier as default)
  4. Live markdown preview panel — tier change করলে preview instantly update হবে
  5. "Generate Plan" button — API call → success toast → close modal → refresh
  6. AGENTS.md update checkbox — "Update AGENTS.md with tier rules" (default: checked)
- **Check:** Component import matches standard components and has no error

### 27.7 — Add Generate Plan button to ProjectGrid
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Do:** PlanCard এর পাশে "✨ Generate Plan" button add করবে
- **How:** `onGeneratePlan` prop receive করবে, Sparkles icon + button, installed project এর জন্যই দেখাবে
- **Check:** Dashboard এ button দেখায়

### 27.8 — Integrate GeneratePlanModal in App.jsx
- **File:** `dashboard/src/App.jsx`
- **Do:** `isGeneratePlanOpen` state + GeneratePlanModal render + ProjectGrid এ callback pass
- **How:** `useState(false)` → ProjectGrid এ `onGeneratePlan={() => setIsGeneratePlanOpen(true)}` → AnimatePresence এ GeneratePlanModal render → onClose ও onSuccess handler
- **Check:** Dashboard এ Generate Plan button click → modal open হয়

### 27.9 — Add --tier flag to CLI new-plan command
- **File:** `packages/cli/cmd-new-plan.js`
- **Do:** Optional `--tier small|medium|high` flag support
- **How:** args parse করে tier extract, tier অনুযায়ী `.agents/ai-config.json` read/write করবে, `plan-templates.js` এর logic inline করবে (shared `TIER_CONFIG` object), tier specific template generate করবে। Without flag → default medium
- **Check:** `./l new-plan test-plan --tier small` → plan file তৈরি হয়, `cat .agents/ai-config.json` → `{"tier":"small"}`
