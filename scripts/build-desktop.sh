#!/bin/bash
set -euo pipefail

# AI Checkpoint — Cross-Platform Desktop Build Script
# Usage: ./scripts/build-desktop.sh [mac|win|linux|all]

show_help() {
  echo "AI Checkpoint Desktop Builder"
  echo ""
  echo "Usage:"
  echo "  ./scripts/build-desktop.sh [platform]"
  echo ""
  echo "Platforms:"
  echo "  mac      Build for macOS (.dmg, .zip)"
  echo "  win      Build for Windows (.exe, portable)"
  echo "  linux    Build for Linux (.AppImage, .deb)"
  echo "  all      Build for all platforms"
  echo "  --help   Show this help message"
  echo ""
  exit 0
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  show_help
fi

PLATFORM="${1:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 Step 1: Building Dashboard production bundle..."
cd dashboard
if [ -f "package-lock.json" ]; then
  npm ci || npm install
else
  npm install
fi
npm run build
cd "$ROOT_DIR"

echo "📦 Step 2: Preparing Root dependencies..."
if [ -f "package-lock.json" ]; then
  npm ci || npm install
else
  npm install
fi

echo "🚀 Step 3: Packaging Desktop App with Electron Builder..."
case "$PLATFORM" in
  mac)
    npx electron-builder --mac --publish never
    ;;
  win)
    npx electron-builder --win --publish never
    ;;
  linux)
    npx electron-builder --linux --publish never
    ;;
  all)
    npx electron-builder -mwl --publish never
    ;;
  "")
    # Default to current platform
    npx electron-builder --publish never
    ;;
  *)
    echo "❌ Unknown platform: $PLATFORM"
    show_help
    ;;
esac

echo "✅ Desktop build complete! Check the 'release/' directory."
