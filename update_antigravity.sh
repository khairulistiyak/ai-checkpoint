#!/bin/bash
set -e

echo "=== Antigravity IDE Update & Installation ==="

DOWNLOADS_DIR="$HOME/Downloads"
TARGET_DIR="$HOME/.local/share/Antigravity"
DESKTOP_FILE="$HOME/.local/share/applications/antigravity.desktop"

# Check if archive exists in Downloads and extract
if [ -f "$DOWNLOADS_DIR/Antigravity.tar.gz" ]; then
    echo "Extracting Antigravity archive..."
    mkdir -p "$DOWNLOADS_DIR/Antigravity"
    tar -xzf "$DOWNLOADS_DIR/Antigravity.tar.gz" -C "$DOWNLOADS_DIR/Antigravity"
fi

# Ensure target directory exists
echo "Installing/Updating files to $TARGET_DIR..."
mkdir -p "$TARGET_DIR"

if [ -d "$DOWNLOADS_DIR/Antigravity/Antigravity-x64" ]; then
    cp -r "$DOWNLOADS_DIR/Antigravity/Antigravity-x64/"* "$TARGET_DIR/"
    chmod +x "$TARGET_DIR/antigravity"
    echo "Files copied successfully."
elif [ -d "$DOWNLOADS_DIR/Antigravity" ]; then
    cp -r "$DOWNLOADS_DIR/Antigravity/"* "$TARGET_DIR/"
    chmod +x "$TARGET_DIR/antigravity"
    echo "Files copied successfully."
else
    echo "Error: No Antigravity installation files found in ~/Downloads."
    exit 1
fi

# Create desktop entry shortcut
mkdir -p "$HOME/.local/share/applications"
cat << EOF > "$DESKTOP_FILE"
[Desktop Entry]
Name=Antigravity IDE
Comment=AI-First Integrated Development Environment
Exec=$TARGET_DIR/antigravity %F
Icon=$TARGET_DIR/resources/app/resources/linux/code.png
Type=Application
StartupNotify=true
StartupWMClass=Antigravity
Categories=Development;IDE;
MimeType=text/plain;
EOF

chmod +x "$DESKTOP_FILE"
update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true

echo "=== Antigravity IDE Successfully Installed / Updated! ==="
echo "You can launch it from your application launcher, or run:"
echo "$TARGET_DIR/antigravity"
