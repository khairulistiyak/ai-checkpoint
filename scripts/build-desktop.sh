#!/bin/bash
set -euo pipefail

# AI Checkpoint — Cross-Platform Desktop Build Script
# Usage: ./scripts/build-desktop.sh [mac|win|linux|all]

export COPYFILE_DISABLE=1

restore_source() {
  echo "🔄 Restoring original source if backups exist..."
  if [ -d "dashboard/src/server.bak" ]; then
    rm -rf dashboard/src/server && mv dashboard/src/server.bak dashboard/src/server
  fi
  if [ -f "dashboard/server.js.bak" ]; then
    mv dashboard/server.js.bak dashboard/server.js
  fi
  if [ -d "electron.bak" ]; then
    rm -rf electron && mv electron.bak electron
  fi
  echo "✅ Source restored safely."
}
trap restore_source EXIT

show_help() {
  echo "AI Checkpoint Desktop Builder"
  echo ""
  echo "Usage:"
  echo "  ./scripts/build-desktop.sh [platform]"
  echo ""
  echo "Platforms:"
  echo "  mac      Build for macOS (.dmg, .zip)"
  echo "  win      Build for Windows (.exe, portable)"
  echo "  linux    Build for Linux (.tar.gz, .zip, .deb)"
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

echo "🧹 Cleaning AppleDouble junk files..."
dot_clean -m . 2>/dev/null || true
find . -name "._*" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

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

echo "🧹 Pre-package cleanup..."
dot_clean -m . 2>/dev/null || true
find . -name "._*" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

echo "🔧 Building encrypted engine..."
npm run build:engine

echo "📦 Backing up source for obfuscation..."
cp -r dashboard/src/server dashboard/src/server.bak
cp dashboard/server.js dashboard/server.js.bak
cp -r electron electron.bak

echo "🔒 Obfuscating backend code..."
npx javascript-obfuscator dashboard/server.js --output dashboard/server.js --compact true --string-array true
for f in dashboard/src/server/*.js; do
  npx javascript-obfuscator "$f" --output "$f" --compact true --string-array true
done
for f in electron/*.js; do
  npx javascript-obfuscator "$f" --output "$f" --compact true --string-array true
done

echo "🧹 Cleaning stale release directory..."
rm -rf release 2>/dev/null || sudo rm -rf release 2>/dev/null || true

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
