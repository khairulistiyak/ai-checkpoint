# Coding Rules

> Project-specific conventions the agent must follow.

---

## RULE 0 — Micro-File Monorepo Rule

### File Rules

1. One file does exactly one job: one component, utility, or config.
2. Every project file has at most 150 effective lines. Split larger files.
3. One step changes exactly one file with one action.
4. File names describe their job. `utils.js` is forbidden; use names such as `format-date.js`.

### Required Layout

```text
project/
├── .agents/
├── plan/
├── packages/
│   ├── core/
│   │   ├── index.js
│   │   ├── state.js
│   │   └── events.js
│   ├── ui/
│   └── utils/
└── package.json
```

- Import a module only through its `index.js` barrel.
- Never import a module's internal files from outside that module.
- Put each new feature in a new, focused folder.
- Never extend an existing file beyond 150 effective lines.

### Protected Paths

- `.agents/`: system state. Change only when a plan step names the exact file.
- `plan/drafts/`: research notes. Never execute automatically.
- `.git/`: repository internals. Never edit directly.
- Secret and environment files: never read, print, copy, or commit.

---

## RULE 1 — Atomic Step Format

Every step in `plan/*.md` must use this format:

```markdown
### Step X.Y — [Clear Title]
- **File:** `exact/path/to/file.ext`
- **Action:** CREATE | EDIT | DELETE
- **Content:** [Complete code OR one unambiguous instruction]
- **Done-check:** `exact command` → expected output
- **Depends:** X.(Y-1) | None
```

### Forbidden Words
Do not use: "appropriately", "as needed", "properly", "etc.", "and so on", "refactor nicely", "improve", "optimize".

---

## RULE 2 — Project Execution & Run Environment

1. **Run Location**: Commands must run in their declared directory.
2. **Standard Command Matrix**:
   - `dev`: Local development server (e.g. `npm run dev`)
   - `build`: Production bundle (e.g. `npm run build`)
   - `test`: Test suite runner (e.g. `npm test`, `bats tests/`)
   - `lint` / `verify`: Validation & linting (e.g. `./l v`, `./l dry`)

---

## RULE 3 — Dynamic DRY & Code Reuse Protocol

1. Before writing any new helper/utility, search existing registry: `./l utils <keyword>`.
2. Do not duplicate function logic across multiple files.
3. If identical logic exists elsewhere, import it from canonical module.
4. Shared utilities must be extracted to canonical module in `packages/core/` or `utils/`.
5. Enforce with `./l dry` and `./l health` before completing steps.

---

## Verify

| Command | Purpose |
|---|---|
| `./l v` | Plan, file, and size validation |
| `./l dry` | DRY code redundancy scan |
| `./l health` | Project health & AST integrity |
