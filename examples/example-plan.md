# Example Plan — Todo App

এটা একটা example plan file। নিজের project এ এরকম plan বানাও।

---

## Phase 1: Setup

### Step 1.1 — Project initialization (`package.json`)

**File**: `package.json`
**Action**: Create

**কি করবে**: Initialize npm project

**Exact Details**:
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}
```

**✅ Done check**: `package.json` exists

---

### Step 1.2 — Main entry point (`src/main.tsx`)

**File**: `src/main.tsx`
**Action**: Create

**কি করবে**: React app entry point

**Exact Details**:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**✅ Done check**: File exists, imports work

---

## Phase 2: Components

### Step 2.1 — Button component (`src/components/Button.tsx`)

**File**: `src/components/Button.tsx`
**Action**: Create

**কি করবে**: Reusable button component

**Exact Details**:
- Props: `children`, `onClick`, `variant` (primary/secondary)
- Styled with Tailwind

**✅ Done check**: File exists, exports Button component
