#!/usr/bin/env bash
# scan-skills.sh — Lists available skills from global + meta-skill + project-local locations.
# Outputs: skill name + first line of description from YAML frontmatter.
# Usage: bash knowledge/meta-skills/session-launcher/scripts/scan-skills.sh [project_path]

set -euo pipefail

PROJECT_PATH="${1:-.}"

GLOBAL_SKILLS_DIRS=("$HOME/.codex/skills" "$HOME/.claude/skills")
META_SKILLS_DIR="$(dirname "$(dirname "$(realpath "$0")")")/.."
LOCAL_SKILLS_DIR="$PROJECT_PATH/.skills"

extract_description() {
    local skill_file="$1"
    if [ ! -f "$skill_file" ]; then
        echo "(no SKILL.md)"
        return
    fi
    # Extract the description field from YAML frontmatter
    # Handles both single-line and multi-line descriptions
    awk '
        BEGIN { in_front=0; in_desc=0; found=0 }
        /^---$/ { in_front++; if (in_front==2) exit; next }
        in_front==1 && /^description:/ {
            # Single-line description
            sub(/^description:[[:space:]]*/, "")
            if ($0 != "" && $0 != "|") {
                gsub(/^"/, ""); gsub(/"$/, "")
                print $0
                found=1
                exit
            }
            in_desc=1
            next
        }
        in_front==1 && in_desc==1 && /^[[:space:]]/ {
            # First indented line of multi-line description
            sub(/^[[:space:]]+/, "")
            print $0
            exit
        }
        in_front==1 && in_desc==1 { exit }
    ' "$skill_file"
}

echo "=== GLOBAL SKILLS (~/.codex/skills/, fallback ~/.claude/skills/) ==="
echo ""
global_found=0
for GLOBAL_SKILLS_DIR in "${GLOBAL_SKILLS_DIRS[@]}"; do
    if [ ! -d "$GLOBAL_SKILLS_DIR" ]; then
        continue
    fi
    global_found=1
    echo "From: $GLOBAL_SKILLS_DIR"
    for dir in "$GLOBAL_SKILLS_DIR"/*/; do
        [ -d "$dir" ] || continue
        name=$(basename "$dir")
        skill_file="$dir/SKILL.md"
        desc=$(extract_description "$skill_file")
        printf "  %-40s %s\n" "$name" "$desc"
    done
    echo ""
done
if [ "$global_found" -eq 0 ]; then
    echo "  (directory not found)"
fi

echo ""
echo "=== META-SKILLS (knowledge/meta-skills/) ==="
echo ""
if [ -d "$META_SKILLS_DIR" ]; then
    for dir in "$META_SKILLS_DIR"/*/; do
        [ -d "$dir" ] || continue
        name=$(basename "$dir")
        skill_file="$dir/SKILL.md"
        desc=$(extract_description "$skill_file")
        printf "  %-40s %s\n" "$name" "$desc"
    done
else
    echo "  (directory not found)"
fi

echo ""
echo "=== PROJECT-LOCAL SKILLS (.skills/) ==="
echo ""
if [ -d "$LOCAL_SKILLS_DIR" ]; then
    for dir in "$LOCAL_SKILLS_DIR"/*/; do
        [ -d "$dir" ] || continue
        name=$(basename "$dir")
        skill_file="$dir/SKILL.md"
        desc=$(extract_description "$skill_file")
        printf "  %-40s %s\n" "$name" "$desc"
    done
else
    echo "  (none — no .skills/ directory in project)"
fi

echo ""
echo "=== SUMMARY ==="
global_count=0
meta_count=0
local_count=0
for GLOBAL_SKILLS_DIR in "${GLOBAL_SKILLS_DIRS[@]}"; do
    if [ -d "$GLOBAL_SKILLS_DIR" ]; then
        global_count=$((global_count + $(find "$GLOBAL_SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l)))
    fi
done
[ -d "$META_SKILLS_DIR" ] && meta_count=$(find "$META_SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l)
[ -d "$LOCAL_SKILLS_DIR" ] && local_count=$(find "$LOCAL_SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l)
echo "  Global: $global_count | Meta: $meta_count | Local: $local_count | Total: $((global_count + meta_count + local_count))"
