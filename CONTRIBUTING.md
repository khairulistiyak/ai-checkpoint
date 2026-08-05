# Contributing to AI-Checkpoint

Thank you for your interest in contributing to **AI-Checkpoint**! We welcome contributions from developers of all skill levels.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/ai-checkpoint.git
   cd ai-checkpoint
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Validation and Health Checks**
   ```bash
   ./l v
   ./l doctor
   ```

4. **Run Bats Test Suite**
   ```bash
   npm test
   ```

---

## 📐 Coding Conventions & Rules

- **Rule 0 (Micro-Files)**: Keep every source file strictly $\le 150$ effective lines. If a file grows larger, split it into modular sub-files and re-export via an `index.js` barrel.
- **Rule 1 (Atomic Steps)**: When building features, follow the atomic step template in `plan/*.md`.
- **Zero External Dependencies in Core**: The core CLI engine must remain pure Node.js with zero runtime npm dependencies.

---

## 🚀 Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Make your edits and ensure all checks pass:
   ```bash
   ./l v && ./l doctor && npm test
   ```
3. Commit with semantic commit messages (`feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`).
4. Push to your fork and open a Pull Request against the `main` branch.

Thank you for helping make AI coding deterministic and reliable! ⚡
