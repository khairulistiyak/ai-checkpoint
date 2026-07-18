# Coding Rules

> Project-specific conventions the agent must follow.

---

## Project

| Key | Value |
|-----|-------|
| Language | _TypeScript / JavaScript / Python_ |
| Framework | _React / Next.js / Vue_ |
| Styling | _Tailwind / CSS Modules / Vanilla_ |

---

## Import Order

1. External packages
2. Internal modules
3. Styles

## Naming

- Components: `PascalCase`
- Functions: `camelCase`
- Files: `kebab-case` or `PascalCase`

## Safety

- Don't delete existing code without being told
- Don't add new dependencies unless specified
- Don't leave console.log in production code

## Verify

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Build check |
