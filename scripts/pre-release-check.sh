#!/bin/bash

set -euo pipefail

echo "🔍 Running pre-release checks..."
echo ""

echo "1. Shell script verification..."
if command -v shellcheck >/dev/null; then
  shellcheck setup.sh install.sh scripts/*.sh || exit 1
else
  bash -n setup.sh && bash -n install.sh && bash -n scripts/release.sh || exit 1
fi
echo "   ✅ Pass"

echo "2. Templates..."
for f in AGENTS.md PROGRESS.md RULES.md SYSTEM_GUIDE.md PLAN_TEMPLATE.md; do
  test -f "templates/$f" || { echo "Missing templates/$f"; exit 1; }
done
echo "   ✅ Pass"

echo "3. Examples..."
test -f examples/atomic-plan-example.md || exit 1
test -f examples/walkthrough.md || exit 1
echo "   ✅ Pass"

echo "4. CLI existence and parse..."
test -f packages/cli/index.js || exit 1
node -c packages/cli/index.js || exit 1
echo "   ✅ Pass"

echo "5. CLI Line Limits (<= 150)..."
for f in packages/cli/*.js; do
  lines=$(wc -l < "$f" | tr -d ' ')
  if [ "$lines" -gt 150 ]; then
    echo "❌ $f is $lines lines (>150)"
    exit 1
  fi
done
echo "   ✅ Pass"

echo "6. BATS tests..."
npx bats tests || exit 1
echo "   ✅ Pass"

echo "7. Dashboard build..."
(cd dashboard && npm run build) || exit 1
echo "   ✅ Pass"

echo "8. No placeholders (USER/)..."
if grep -rq "USER/" packages templates scripts 2>/dev/null; then
  echo "❌ Found placeholders in shipped files"
  exit 1
fi
echo "   ✅ Pass"

echo "9. Git tree is clean..."
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Git tree is dirty"
  exit 1
fi
echo "   ✅ Pass"

echo "10. Setup test in clean directory..."
TESTDIR=$(mktemp -d)
cd "$TESTDIR"
git init --quiet
bash "$OLDPWD/setup.sh" > /dev/null 2>&1 || { echo "Setup failed"; exit 1; }
test -f "./l" || exit 1
test -d ".agents" || exit 1
cd "$OLDPWD"
rm -rf "$TESTDIR"
echo "   ✅ Pass"

echo ""
echo "✅ All checks passed!"
echo "Ready for release."
