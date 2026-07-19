#!/bin/bash

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 X.Y.Z"
  exit 1
fi

VERSION="$1"
TAG="v$VERSION"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must match X.Y.Z"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working tree must be clean"
  exit 1
fi

if git rev-parse --verify "refs/tags/$TAG" >/dev/null 2>&1; then
  echo "Error: tag $TAG already exists"
  exit 1
fi

TODAY="$(date +%Y-%m-%d)"
VERSION="$VERSION" TODAY="$TODAY" python3 - <<'PY'
from pathlib import Path
import os

path = Path("CHANGELOG.md")
text = path.read_text()
marker = "## [Unreleased]"
replacement = f"{marker}\n\n## [{os.environ['VERSION']}] - {os.environ['TODAY']}"
if marker not in text:
    raise SystemExit("Error: CHANGELOG.md has no Unreleased section")
path.write_text(text.replace(marker, replacement, 1))
PY

git add CHANGELOG.md
git commit -m "release: $TAG"
git tag -a "$TAG" -m "Release $TAG"

echo "Release $TAG created locally."
echo "Push with: git push origin main && git push origin $TAG"
echo "Release page: https://github.com/khairulistiyak/ai-checkpoint/releases/new?tag=$TAG"
