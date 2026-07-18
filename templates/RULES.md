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

## Project Settings

| Key | Value |
|-----|-------|
| Language | _TypeScript / JavaScript / Python_ |
| Framework | _React / Next.js / Vue_ |
| Styling | _Tailwind / CSS Modules / Vanilla_ |

## Import Order

1. External packages
2. Internal barrels
3. Styles

## Naming

- Components: `PascalCase`
- Functions: `camelCase`
- Files: `kebab-case` or `PascalCase`

## Safety

- Do not delete code without an explicit plan step.
- Do not add dependencies without an explicit plan step.
- Do not leave debug logging in production code.

## Verify

| Command | Purpose |
|---------|---------|
| `./l v` | Plan, file, and size validation |
| _project command_ | Build, lint, typecheck, or test |
