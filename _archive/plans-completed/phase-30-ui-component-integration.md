# Phase 30: UI Component Integration

**Goal:** Integrate the atomic UI components (`GlassButton`, `InputField`, `StatusBadge`) across the entire dashboard to ensure maximum reusability and strictly follow the cyber theme.

**Steps:** 10

---

## Steps

### 30.1 — Update GlassButton.jsx to Cyber Theme
- **File:** `dashboard/src/components/ui/GlassButton.jsx`
- **Do:** Upgrade variants to use cyber colors (`bg-cyber-accent`, `bg-cyber-card-border/50`, etc.).
- **How:** Replace hardcoded `white` and `black` variables.
- **Check:** Lint and valid React syntax.

### 30.2 — Update InputField.jsx to Cyber Theme
- **File:** `dashboard/src/components/ui/InputField.jsx`
- **Do:** Upgrade to cyber colors (`bg-cyber-dark/50`, `border-cyber-card-border`, `focus:border-cyber-accent`).
- **How:** Replace hardcoded Tailwind utility colors.
- **Check:** Lint and valid React syntax.

### 30.3 — Update StatusBadge.jsx to Cyber Theme
- **File:** `dashboard/src/components/ui/StatusBadge.jsx`
- **Do:** Upgrade to cyber colors.
- **How:** Replace emerald, sky, red, gray with mapped generic cyber variations if needed.
- **Check:** Lint and valid React syntax.

### 30.4 — Refactor Header.jsx to use UI components
- **File:** `dashboard/src/components/Header.jsx`
- **Do:** Replace `<button>` with `<GlassButton variant="ghost">` and `<input>` with `<InputField>`.
- **How:** Import components from `./ui`.
- **Check:** Component renders without errors.

### 30.5 — Refactor Sidebar.jsx to use UI components
- **File:** `dashboard/src/components/Sidebar.jsx`
- **Do:** Replace search input and Add Project button with UI components.
- **How:** Import components from `./ui`.
- **Check:** Component renders without errors.

### 30.6 — Refactor ProjectCard.jsx to use UI components
- **File:** `dashboard/src/components/ProjectCard.jsx`
- **Do:** Replace action buttons with `<GlassButton variant="secondary">`.
- **How:** Map classes to size and variant props.
- **Check:** Layout doesn't break.

### 30.7 — Refactor AddProjectModal.jsx to use UI components
- **File:** `dashboard/src/components/AddProjectModal.jsx`
- **Do:** Swap standard input and submit buttons.
- **How:** Use `<InputField>` and `<GlassButton>`.
- **Check:** Modal interactions still work.

### 30.8 — Refactor ConfigEditor.jsx to use UI components
- **File:** `dashboard/src/components/ConfigEditor.jsx`
- **Do:** Swap save and cancel buttons.
- **How:** Use `<GlassButton>`.
- **Check:** Modal interactions still work.

### 30.9 — Refactor ConfirmModal.jsx to use UI components
- **File:** `dashboard/src/components/ConfirmModal.jsx`
- **Do:** Swap Cancel/Confirm actions.
- **How:** Use `<GlassButton variant="danger">`.
- **Check:** Modal interactions still work.

### 30.10 — Refactor GeneratePlanModal.jsx to use UI components
- **File:** `dashboard/src/components/PlansCenter.jsx`
- **Do:** Replace plan name input and action buttons.
- **How:** Use `<InputField>` and `<GlassButton>`.
- **Check:** Modal interactions still work.
