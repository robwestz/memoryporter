#!/usr/bin/env bash
set -euo pipefail

# 200k Pipeline — Global Skill Installer
# Installs skill-forge + 200k-blueprint + Archon workflows globally
# so they're available in every Claude Code session.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$HOME/.claude/skills/200k-pipeline"
GREEN='\033[0;32m'
NC='\033[0m'

echo ""
echo "=== 200k Pipeline — Installing globally ==="
echo ""

# 1. Install the master skill + sub-skills
mkdir -p "$SKILL_DIR"
cp "$SCRIPT_DIR/SKILL.md" "$SKILL_DIR/"

# Copy skill-forge (from sibling directory)
if [ -d "$SCRIPT_DIR/../skill-forge" ]; then
    cp -r "$SCRIPT_DIR/../skill-forge" "$SKILL_DIR/skill-forge"
    echo -e "${GREEN}[OK]${NC} skill-forge installed"
else
    echo "[!] skill-forge not found at $SCRIPT_DIR/../skill-forge"
fi

# Copy 200k-blueprint (from sibling directory)
if [ -d "$SCRIPT_DIR/../200k-blueprint" ]; then
    cp -r "$SCRIPT_DIR/../200k-blueprint" "$SKILL_DIR/200k-blueprint"
    echo -e "${GREEN}[OK]${NC} 200k-blueprint installed"
else
    echo "[!] 200k-blueprint not found at $SCRIPT_DIR/../200k-blueprint"
fi

# 2. Copy Archon workflow templates
ARCHON_WORKFLOWS="$SCRIPT_DIR/../../../.archon/workflows"
if [ -d "$ARCHON_WORKFLOWS" ]; then
    mkdir -p "$SKILL_DIR/workflows"
    cp "$ARCHON_WORKFLOWS"/*.yaml "$SKILL_DIR/workflows/" 2>/dev/null || true
    echo -e "${GREEN}[OK]${NC} Archon workflow templates copied"
else
    echo "[!] No .archon/workflows/ found — skipping workflow templates"
fi

# 3. Verify
echo ""
echo "=== Installed to: $SKILL_DIR ==="
find "$SKILL_DIR" -name "SKILL.md" -o -name "*.yaml" | head -20
echo ""
echo "Files: $(find "$SKILL_DIR" -type f | wc -l)"
echo ""
echo "Done. The 200k-pipeline skill is now available in every Claude Code session."
echo "Test: open any project with 'claude' and say 'forge a skill for X'"
echo ""
