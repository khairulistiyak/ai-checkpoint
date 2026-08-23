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

# 1. Global Engine Deploy
echo -e "${YELLOW}Deploying Global Engine...${NC}"
GLOBAL_DIR="$HOME/.ai-checkpoint"
mkdir -p "$GLOBAL_DIR"
if [ -f "$SCRIPT_DIR/assets/engine.bin.js" ]; then
  cp "$SCRIPT_DIR/assets/engine.bin.js" "$GLOBAL_DIR/engine.bin.js"
  echo -e "  ${GREEN}✔ Global Engine deployed${NC}"
else
  echo -e "  ${YELLOW}⚠ engine.bin.js not found in assets. Please run 'npm run build:engine' first.${NC}"
fi

# 2. Create folders
echo -e "${YELLOW}Creating project folders...${NC}"
mkdir -p "$PROJECT_DIR/.agents"
mkdir -p "$PROJECT_DIR/plan/drafts"

# 3. Copy files
copy_if_new() {
  if [ -f "$2" ]; then
    echo -e "  ${YELLOW}⚠ $(basename "$2") already exists — skip${NC}"
  else
    cp "$1" "$2"
    echo -e "  ${GREEN}✔ Created $(basename "$2")${NC}"
  fi
}

echo -e "${YELLOW}Setting up configuration files...${NC}"
copy_if_new "$SCRIPT_DIR/templates/RULES.md" "$PROJECT_DIR/.agents/RULES.md"
copy_if_new "$SCRIPT_DIR/templates/SYSTEM_GUIDE.md" "$PROJECT_DIR/.agents/SYSTEM_GUIDE.md"
copy_if_new "$SCRIPT_DIR/templates/AGENTS.md" "$PROJECT_DIR/AGENTS.md"
copy_if_new "$SCRIPT_DIR/templates/drafts-README.md" "$PROJECT_DIR/plan/drafts/README.md"

echo -e "${YELLOW}Installing CLI wrapper...${NC}"
if [ ! -f "$PROJECT_DIR/l" ]; then
  cat > "$PROJECT_DIR/l" <<'EOF'
#!/bin/bash
if [ -f "packages/cli/index.js" ]; then
  node packages/cli/index.js "$@"
elif [ -f "$HOME/.ai-checkpoint/engine.bin.js" ]; then
  node "$HOME/.ai-checkpoint/engine.bin.js" "$@"
elif [ -f ".agents/scripts/ledger.cjs" ]; then
  node .agents/scripts/ledger.cjs "$@"
else
  echo "Error: CLI Engine not found."
  exit 1
fi
EOF
  chmod +x "$PROJECT_DIR/l"
  echo -e "  ${GREEN}✔ Created l${NC}"
else
  echo -e "  ${YELLOW}⚠ l already exists — skip${NC}"
fi

# 4. Done!
echo ""
echo -e "${BOLD}${GREEN}┌──────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${GREEN}│   ✅ Installed Successfully!                         │${NC}"
echo -e "${BOLD}${GREEN}└──────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "  ${BOLD}.agents/${NC}                       ← System (don't touch)"
echo -e "  ├── RULES.md                 ← Code rules"
echo -e "  └── SYSTEM_GUIDE.md          ← Guide"
echo ""
echo -e "  ${BOLD}AGENTS.md${NC}                      ← Root rules file"
echo ""
echo -e "  ${BOLD}plan/${NC}                          ← ${GREEN}Your .md plan files (clean!)${NC}"
echo -e "  └── drafts/                  ← R&D notes"
echo ""
echo -e "${CYAN}Next:${NC}"
echo "  1. Create your plan:   plan/my-plan.md"
echo "  2. Use Dashboard:      Launch AI Checkpoint app"
echo ""
