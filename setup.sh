#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# ai-checkpoint — Setup Script v5.0
# 
# CLEAN STRUCTURE:
#   .agents/  → System files (PROGRESS, RULES, scripts)
#   plan/     → ONLY user's .md plan files (empty by default!)
#
# Usage: bash /path/to/ai-checkpoint/setup.sh
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"

if [ -f "$PROJECT_DIR/l" ] && [ -d "$PROJECT_DIR/.agents" ]; then
  echo -e "${YELLOW}ai-checkpoint is already installed.${NC}"
  read -r -p "Update system files and preserve project data? [y/N] " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

echo ""
echo -e "${BOLD}${CYAN}┌──────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${CYAN}│   🧠 ai-checkpoint — Setup                           │${NC}"
echo -e "${BOLD}${CYAN}└──────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${CYAN}Project:${NC} $PROJECT_DIR"
echo ""

# 1. Create folders
echo -e "${YELLOW}Creating folders...${NC}"
mkdir -p "$PROJECT_DIR/.agents/scripts"
mkdir -p "$PROJECT_DIR/plan/drafts"

# 2. Install CLI
echo -e "${YELLOW}Installing CLI...${NC}"
cp "$SCRIPT_DIR/scripts/ledger.cjs" "$PROJECT_DIR/.agents/scripts/ledger.cjs"
mkdir -p "$PROJECT_DIR/.agents/packages/cli"
mkdir -p "$PROJECT_DIR/.agents/packages/core"
find "$SCRIPT_DIR/packages/cli" -maxdepth 1 -name '*.js' -not -name '._*' -exec cp {} "$PROJECT_DIR/.agents/packages/cli/" \;
find "$SCRIPT_DIR/packages/core" -maxdepth 1 -name '*.js' -not -name '._*' -exec cp {} "$PROJECT_DIR/.agents/packages/core/" \;
find "$PROJECT_DIR/.agents" -name '._*' -delete 2>/dev/null || true

# 3. Create default config.json for dashboard
CONFIG_FILE="$PROJECT_DIR/.agents/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  cat > "$CONFIG_FILE" << EOFCONFIG
{
  "projects": [
    {
      "name": "$PROJECT_NAME",
      "path": "$PROJECT_DIR"
    }
  ]
}
EOFCONFIG
  echo -e "  ${GREEN}✔ Created config.json${NC}"
fi

# 4. Create ./l shortcut
cat > "$PROJECT_DIR/l" << 'EOF'
#!/bin/bash
node .agents/scripts/ledger.cjs "$@"
EOF
chmod +x "$PROJECT_DIR/l"

# 5. Copy system files to .agents/ (NOT plan/)
copy_if_new() {
  if [ -f "$2" ]; then
    echo -e "  ${YELLOW}⚠ $(basename "$2") already exists — skip${NC}"
  else
    cp "$1" "$2"
    echo -e "  ${GREEN}✔ Created $(basename "$2")${NC}"
  fi
}

echo -e "${YELLOW}Installing system files to .agents/...${NC}"
copy_if_new "$SCRIPT_DIR/templates/AGENTS.md" "$PROJECT_DIR/.agents/AGENTS.md"
copy_if_new "$SCRIPT_DIR/templates/PROGRESS.md" "$PROJECT_DIR/.agents/PROGRESS.md"
copy_if_new "$SCRIPT_DIR/templates/RULES.md" "$PROJECT_DIR/.agents/RULES.md"
copy_if_new "$SCRIPT_DIR/templates/SYSTEM_GUIDE.md" "$PROJECT_DIR/.agents/SYSTEM_GUIDE.md"

echo -e "${YELLOW}Setting up plan/ folder...${NC}"
copy_if_new "$SCRIPT_DIR/templates/drafts-README.md" "$PROJECT_DIR/plan/drafts/README.md"

# 6. Done!
echo ""
echo -e "${BOLD}${GREEN}┌──────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${GREEN}│   ✅ Installed Successfully!                         │${NC}"
echo -e "${BOLD}${GREEN}└──────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "  ${BOLD}.agents/${NC}                       ← System (don't touch)"
echo -e "  ├── AGENTS.md                ← Agent rules"
echo -e "  ├── PROGRESS.md              ← Tracker"
echo -e "  ├── RULES.md                 ← Code rules"
echo -e "  ├── SYSTEM_GUIDE.md          ← Guide"
echo -e "  └── scripts/ledger.cjs       ← CLI"
echo ""
echo -e "  ${BOLD}plan/${NC}                          ← ${GREEN}Your .md plan files (clean!)${NC}"
echo -e "  └── drafts/                  ← R&D notes"
echo ""
echo -e "${CYAN}Next:${NC}"
echo "  1. Create your plan:   plan/my-plan.md"
echo "  2. Add steps:          .agents/PROGRESS.md"
echo "  3. View dashboard:     ./l"
echo ""
