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
