#!/bin/bash
# One-line installer for ai-checkpoint
# Usage: curl -fsSL https://raw.githubusercontent.com/khairulistiyak/ai-checkpoint/main/install.sh | bash

set -euo pipefail

REPO_URL="https://github.com/khairulistiyak/ai-checkpoint.git"
INSTALL_DIR="$HOME/.ai-checkpoint"

echo "📦 Installing ai-checkpoint..."
ORIGINAL_DIR="$(pwd)"

if [ -d "$INSTALL_DIR" ]; then
  echo "Updating existing installation..."
  git -C "$INSTALL_DIR" pull --quiet
else
  echo "Downloading ai-checkpoint..."
  git clone --quiet --depth 1 "$REPO_URL" "$INSTALL_DIR"
fi

cd "$ORIGINAL_DIR"

if [ -f "$INSTALL_DIR/setup.sh" ]; then
  bash "$INSTALL_DIR/setup.sh"
else
  echo "❌ Error: setup.sh missing in $INSTALL_DIR"
  exit 1
fi

echo ""
echo "✅ Installation complete!"
echo "Dashboard command: ./l"
