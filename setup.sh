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

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"

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

# 3. Create ./l shortcut
cat > "$PROJECT_DIR/l" << 'EOF'
#!/bin/bash
node .agents/scripts/ledger.cjs "$@"
EOF
chmod +x "$PROJECT_DIR/l"

# 4. Copy system files to .agents/ (NOT plan/)
copy_if_new() {
  if [ -f "$2" ]; then
    echo -e "  ${YELLOW}⚠ $(basename $2) already exists — skip${NC}"
  else
    cp "$1" "$2"
    echo -e "  ${GREEN}✔ Created $(basename $2)${NC}"
  fi
}

echo -e "${YELLOW}Installing system files to .agents/...${NC}"
copy_if_new "$SCRIPT_DIR/templates/AGENTS.md" "$PROJECT_DIR/.agents/AGENTS.md"
copy_if_new "$SCRIPT_DIR/templates/PROGRESS.md" "$PROJECT_DIR/.agents/PROGRESS.md"
copy_if_new "$SCRIPT_DIR/templates/RULES.md" "$PROJECT_DIR/.agents/RULES.md"
copy_if_new "$SCRIPT_DIR/templates/SYSTEM_GUIDE.md" "$PROJECT_DIR/.agents/SYSTEM_GUIDE.md"

echo -e "${YELLOW}Setting up plan/ folder...${NC}"
copy_if_new "$SCRIPT_DIR/templates/drafts-README.md" "$PROJECT_DIR/plan/drafts/README.md"

# 5. Done!
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
echo -e "  ${BOLD}plan/${NC}                          ← ${GREEN}তোমার .md files (clean!)${NC}"
echo -e "  └── drafts/                  ← R&D notes"
echo ""
echo -e "${CYAN}Next:${NC}"
echo "  1. তোমার plan বানাও:  plan/my-plan.md"
echo "  2. Steps add করো:     .agents/PROGRESS.md"
echo "  3. Dashboard দেখো:    ./l"
echo ""
