#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# Checkpoint-Based Task Ledger — Setup Script
# 
# Installs the ledger system into ANY project.
# Run from your project root directory.
#
# Usage:
#   bash /path/to/checkpoint-task-ledger/setup.sh
#   OR
#   ./setup.sh (if inside the ledger repo)
# ═══════════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(pwd)"

echo ""
echo -e "${BOLD}${CYAN}┌──────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${CYAN}│   🧠 Checkpoint Task Ledger — Setup                  │${NC}"
echo -e "${BOLD}${CYAN}└──────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${CYAN}Project directory:${NC} $PROJECT_DIR"
echo ""

# 1. Create folder structure
echo -e "${YELLOW}Creating folder structure...${NC}"
mkdir -p "$PROJECT_DIR/plan/steps"
mkdir -p "$PROJECT_DIR/plan/drafts"
mkdir -p "$PROJECT_DIR/.agents/scripts"

# 2. Copy ledger CLI script
echo -e "${YELLOW}Installing ledger CLI...${NC}"
cp "$SCRIPT_DIR/scripts/ledger.cjs" "$PROJECT_DIR/.agents/scripts/ledger.cjs"

# 3. Create shortcut ./l
echo -e "${YELLOW}Creating ./l shortcut...${NC}"
cat > "$PROJECT_DIR/l" << 'EOF'
#!/bin/bash
node .agents/scripts/ledger.cjs "$@"
EOF
chmod +x "$PROJECT_DIR/l"

# 4. Copy template files (only if they don't exist)
copy_template() {
  local src="$1"
  local dest="$2"
  if [ -f "$dest" ]; then
    echo -e "  ${YELLOW}⚠ $dest already exists — skipping${NC}"
  else
    cp "$src" "$dest"
    echo -e "  ${GREEN}✔ Created $dest${NC}"
  fi
}

echo -e "${YELLOW}Installing templates...${NC}"
copy_template "$SCRIPT_DIR/templates/PROGRESS.md" "$PROJECT_DIR/plan/PROGRESS.md"
copy_template "$SCRIPT_DIR/templates/RULES.md" "$PROJECT_DIR/plan/RULES.md"
copy_template "$SCRIPT_DIR/templates/SYSTEM_GUIDE.md" "$PROJECT_DIR/plan/SYSTEM_GUIDE.md"
copy_template "$SCRIPT_DIR/templates/AGENTS.md" "$PROJECT_DIR/.agents/AGENTS.md"
copy_template "$SCRIPT_DIR/templates/drafts-README.md" "$PROJECT_DIR/plan/drafts/README.md"

# 5. Done!
echo ""
echo -e "${BOLD}${GREEN}┌──────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${GREEN}│   ✅ Ledger System Installed Successfully!           │${NC}"
echo -e "${BOLD}${GREEN}└──────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${CYAN}Installed files:${NC}"
echo "  📂 plan/"
echo "  ├── PROGRESS.md          ← Tracker"
echo "  ├── RULES.md             ← Code rules"
echo "  ├── SYSTEM_GUIDE.md      ← Guide"
echo "  ├── steps/               ← Plan files (any name.md)"
echo "  └── drafts/              ← R&D notes"
echo "  📂 .agents/"
echo "  ├── AGENTS.md            ← Workflow rules"
echo "  └── scripts/ledger.cjs   ← CLI tool"
echo "  📄 ./l                   ← Shortcut"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Create your plan:  plan/steps/my-plan.md"
echo "  2. Add steps to:      plan/PROGRESS.md"
echo "  3. Run dashboard:     ./l"
echo "  4. Start working:     ./l start 1.1"
echo ""
