# Example: Todo App Plan

> This is a sample plan file. Copy this format for your own projects.

---

## Phase 1: Setup

### Step 1.1 — Initialize project (`package.json`)

**File**: `package.json`  
**Action**: Create

**Details**: Standard npm init with React + Vite.

**✅ Done**: File exists with name and scripts.

---

### Step 1.2 — App entry point (`src/main.tsx`)

**File**: `src/main.tsx`  
**Action**: Create

**Details**: React 18 createRoot with StrictMode.

**✅ Done**: File exists, no import errors.

---

## Phase 2: UI Components

### Step 2.1 — Button component (`src/components/Button.tsx`)

**File**: `src/components/Button.tsx`  
**Action**: Create

**Details**:
- Props: `children`, `onClick`, `variant` (primary / secondary)
- Uses Tailwind for styling

**✅ Done**: Exports `Button` component.

---

### Step 2.2 — TodoList component (`src/components/TodoList.tsx`)

**File**: `src/components/TodoList.tsx`  
**Action**: Create

**Details**:
- Renders array of todo items
- Each item has checkbox + delete button
- Uses `Button` component

**✅ Done**: Renders list, buttons work.
