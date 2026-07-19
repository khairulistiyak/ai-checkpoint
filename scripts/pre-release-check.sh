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

# 2. All templates exist
echo "2. Templates..."
for f in AGENTS.md PROGRESS.md RULES.md SYSTEM_GUIDE.md PLAN_TEMPLATE.md; do
  test -f "templates/$f" || { echo "Missing templates/$f"; exit 1; }
done
echo "   ✅ Pass"

# 3. Examples exist
echo "3. Examples..."
test -f examples/atomic-plan-example.md || exit 1
test -f examples/walkthrough.md || exit 1
echo "   ✅ Pass"

# 4. CLI exists and parses
echo "4. CLI..."
test -f scripts/ledger.cjs || exit 1
node -c scripts/ledger.cjs || exit 1
echo "   ✅ Pass"

# 5. Documentation checks
echo "5. Documentation..."
grep -q "60-Second Quickstart" README.md || { echo "README missing quickstart"; exit 1; }
grep -q "Unreleased" CHANGELOG.md || { echo "CHANGELOG missing Unreleased section"; exit 1; }
echo "   ✅ Pass"

# 6. Test setup in clean directory
echo "6. Setup test..."
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
