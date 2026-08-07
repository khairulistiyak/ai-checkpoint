#!/usr/bin/env bash
set -e

echo "=== 1. Checking README assets exist ==="
test -f ui-mockup-colorful.svg
test -f ui-mockup-multiproject.svg
echo "✔ README assets present"

echo "=== 2. Checking No Dead Component Imports ==="
if grep -rn "EmptySelectionView" dashboard/src/ packages/ 2>/dev/null; then
  echo "❌ Broken import to EmptySelectionView found!"
  exit 1
fi
echo "✔ No dead component imports"

echo "=== 3. Checking CLI Health ==="
node scripts/ledger.cjs --help > /dev/null
echo "✔ CLI ledger command works"

echo "=== 4. Checking _archive structure ==="
test -d _archive/docs
test -d _archive/media
test -d _archive/marketing
test -d _archive/story
test -d _archive/logos
test -d _archive/plans-completed
test -d _archive/dead-code
echo "✔ _archive structure verified"

echo "=== 5. Testing Dashboard Build ==="
(cd dashboard && npm run build)
echo "✔ Dashboard build succeeded without errors"

echo ""
echo "🎉 Cleanup verification complete: All checks PASSED!"
