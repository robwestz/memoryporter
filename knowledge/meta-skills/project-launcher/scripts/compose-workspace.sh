#!/usr/bin/env bash
# compose-workspace.sh — populate a project-launcher target directory.
#
# Usage:
#   bash compose-workspace.sh \
#     --target /abs/path/to/project \
#     --name project-name \
#     --skills "skill1,skill2,skill3" \
#     --kit /abs/path/to/portable-kit \
#     [--force]
#
# Behavior:
#   - Refuses if --target exists and is non-empty (unless --force)
#   - Refuses if --target is inside --kit
#   - Creates directory layout
#   - Copies selected skills from kit/knowledge/meta-skills/ AND kit/skill-engine/
#   - Copies protocols/ (small-model-premium, agent-orchestration)
#   - Writes .gitignore with sane defaults
#   - Does NOT fill [VARIABLE] placeholders — that's the agent's job after this runs

set -euo pipefail

TARGET=""
NAME=""
SKILLS=""
KIT=""
FORCE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --target) TARGET="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --skills) SKILLS="$2"; shift 2 ;;
    --kit) KIT="$2"; shift 2 ;;
    --force) FORCE=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

# --- Validate ---
for req in TARGET NAME SKILLS KIT; do
  if [ -z "${!req}" ]; then
    echo "Missing required arg: --${req,,}" >&2
    exit 2
  fi
done

if [ ! -d "$KIT" ]; then
  echo "FAIL: kit path does not exist: $KIT" >&2
  exit 1
fi

# Refuse if target inside kit
TARGET_REAL=$(realpath -m "$TARGET" 2>/dev/null || python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$TARGET")
KIT_REAL=$(realpath -m "$KIT" 2>/dev/null || python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$KIT")
case "$TARGET_REAL" in
  "$KIT_REAL"*)
    echo "FAIL: target ($TARGET_REAL) is inside portable-kit ($KIT_REAL). Projects must live outside the kit." >&2
    exit 1
    ;;
esac

# Refuse if target non-empty (unless --force)
if [ -d "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  if [ "$FORCE" -ne 1 ]; then
    echo "FAIL: target exists and is non-empty: $TARGET (use --force to override)" >&2
    exit 1
  fi
  echo "WARN: overwriting non-empty target (--force)" >&2
fi

# --- Create layout ---
mkdir -p "$TARGET"/{phases,skills,protocols,verify,docs/showcases,docs/sessions,.tmp}

# --- Copy skills ---
IFS=',' read -ra SKILL_ARR <<< "$SKILLS"
for skill in "${SKILL_ARR[@]}"; do
  skill=$(echo "$skill" | xargs)  # trim
  [ -z "$skill" ] && continue

  src=""
  if [ -d "$KIT/knowledge/meta-skills/$skill" ]; then
    src="$KIT/knowledge/meta-skills/$skill"
  elif [ -d "$KIT/knowledge/skills/$skill" ]; then
    src="$KIT/knowledge/skills/$skill"
  else
    echo "WARN: skill not found in kit: $skill (skipping)" >&2
    continue
  fi

  cp -r "$src" "$TARGET/skills/$skill"
  echo "  copied skill: $skill"
done

# --- Copy protocols ---
if [ -d "$KIT/protocols" ]; then
  for p in small-model-premium.md agent-orchestration.md architecture-audit.md; do
    if [ -f "$KIT/protocols/$p" ]; then
      cp "$KIT/protocols/$p" "$TARGET/protocols/$p"
      echo "  copied protocol: $p"
    fi
  done
else
  echo "WARN: protocols dir not found in kit: $KIT/protocols" >&2
fi

# --- .gitignore ---
cat > "$TARGET/.gitignore" <<'EOF'
# Scratch
.tmp/
node_modules/
.env
.env.local

# Build output
dist/
build/
target/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF

# --- README pointer ---
cat > "$TARGET/README.md" <<EOF
# $NAME

An autonomous-build project composed by \`project-launcher\`.

## Start here

1. Read \`AGENT.md\` — operational manual
2. Read \`PROJECT.md\` — what this project is
3. Read \`ARCHITECTURE.md\` — how it's built
4. Open the first unfinished phase in \`phases/\`

## For humans

- Phases are in \`phases/\`, named \`phase-NN-<name>.md\`
- Each phase has a verify script in \`verify/phase-NN.sh\`
- Showcases land in \`docs/showcases/\`
- Session logs in \`docs/sessions/\`

## Launched

Created by project-launcher from portable-kit at $KIT.
EOF

# --- Summary ---
echo ""
echo "=== Workspace composed ==="
echo "  Target: $TARGET"
echo "  Skills: ${#SKILL_ARR[@]}"
echo "  Next: agent fills AGENT.md.tmpl, PROJECT.md.tmpl, ARCHITECTURE.md.tmpl, phase templates"
