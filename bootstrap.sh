#!/usr/bin/env bash
set -euo pipefail

# Portable Agent Kit — Bootstrap
# Kör detta EN gång efter kopiering till nytt projekt.
# Bygger Rust-binärerna, skapar projektstruktur, validerar.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo ""
echo "=== Portable Agent Kit — Bootstrap ==="
echo ""

# ─────────────────────────────────────────────
# 1. Kontrollera förutsättningar
# ─────────────────────────────────────────────

echo "--- Steg 1: Kontrollerar förutsättningar ---"

# Rust toolchain
if command -v cargo &> /dev/null; then
    RUST_VER=$(rustc --version 2>/dev/null || echo "unknown")
    ok "Rust installerad: $RUST_VER"
else
    warn "Rust saknas. Installerar via rustup..."
    if command -v curl &> /dev/null; then
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env" 2>/dev/null || true
    else
        fail "Varken Rust eller curl hittades. Installera Rust manuellt: https://rustup.rs"
    fi
    ok "Rust installerad"
fi

# Python (valfritt, för skill-creator)
if command -v python3 &> /dev/null; then
    PY_VER=$(python3 --version 2>/dev/null || echo "unknown")
    ok "Python tillgänglig: $PY_VER (skill-creator-verktyg aktiverade)"
elif command -v python &> /dev/null; then
    PY_VER=$(python --version 2>/dev/null || echo "unknown")
    ok "Python tillgänglig: $PY_VER (skill-creator-verktyg aktiverade)"
else
    warn "Python saknas — skill-creator scripts (eval, benchmark) kräver Python 3.8+"
fi

# ANTHROPIC_API_KEY
if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    ok "ANTHROPIC_API_KEY är satt"
else
    warn "ANTHROPIC_API_KEY är inte satt — runtime-binärerna kräver den"
fi

echo ""

# ─────────────────────────────────────────────
# 2. Bygg Rust-binärerna
# ─────────────────────────────────────────────

echo "--- Steg 2: Bygger Rust-binärerna ---"

if [ -d "runtime/crates" ]; then
    cd runtime
    if cargo build --release 2>&1; then
        ok "4 binärer byggda: ob1, claw-mini, snowball, claw-gateway"
    else
        warn "Rust-bygget misslyckades. Binärerna är inte tillgängliga men resten av kitet fungerar."
        warn "Kör 'cd runtime && cargo build --release' manuellt senare."
    fi
    cd "$SCRIPT_DIR"
else
    warn "runtime/crates/ saknas — hoppar över Rust-bygge"
fi

echo ""

# ─────────────────────────────────────────────
# 3. Installera MemPalace
# ─────────────────────────────────────────────

echo "--- Steg 3: Installerar MemPalace ---"

if [ -d "mempalace" ] && [ -f "mempalace/pyproject.toml" ]; then
    if pip install -e "./mempalace" > /dev/null 2>&1; then
        MP_VER=$(python -c "from mempalace import __version__; print(__version__)" 2>/dev/null || echo "?")
        ok "MemPalace $MP_VER installerat (editable)"
    else
        warn "MemPalace pip install misslyckades — kör 'pip install -e ./mempalace' manuellt"
    fi

    # Registrera MCP-server om Claude Code finns
    if command -v claude &> /dev/null; then
        claude mcp add mempalace -- python -m mempalace.mcp_server > /dev/null 2>&1 && \
            ok "MemPalace MCP-server registrerad" || \
            warn "Kunde inte registrera MCP-server — kör 'claude mcp add mempalace -- python -m mempalace.mcp_server'"
    else
        warn "Claude Code ej hittad — registrera MCP-servern manuellt efter installation"
    fi
else
    warn "mempalace/ saknas — minnessystemet är inte tillgängligt"
fi

echo ""

# ─────────────────────────────────────────────
# 4. Skapa projektstruktur
# ─────────────────────────────────────────────

echo "--- Steg 4: Skapar projektstruktur ---"

# .skills/ för projektlokala anpassade skills
mkdir -p .skills
if [ ! -f .skills/.gitkeep ]; then
    touch .skills/.gitkeep
fi
ok "Mapp .skills/ redo (projektlokala skills hamnar här)"

# AGENTS.md från template
if [ ! -f AGENTS.md ]; then
    if [ -f AGENTS.template.md ]; then
        cp AGENTS.template.md AGENTS.md
        ok "AGENTS.md skapad från template — fyll i [PLACEHOLDER]-fälten"
    else
        warn "AGENTS.template.md saknas — skapa AGENTS.md manuellt"
    fi
else
    ok "AGENTS.md finns redan — behåller befintlig"
fi

echo ""

# ─────────────────────────────────────────────
# 5. Validera filstruktur
# ─────────────────────────────────────────────

echo "--- Steg 5: Validerar filstruktur ---"

ERRORS=0

check_file() {
    if [ -f "$1" ]; then
        ok "$1"
    else
        warn "Saknas: $1"
        ERRORS=$((ERRORS + 1))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        COUNT=$(find "$1" -maxdepth 1 -type f | wc -l)
        ok "$1/ ($COUNT filer)"
    else
        warn "Saknas: $1/"
        ERRORS=$((ERRORS + 1))
    fi
}

# Kärnfiler
check_file "CLAUDE.md"
check_file "AGENTS.md"

# Kunskapsbas
check_dir "knowledge/gamechangers"
check_dir "knowledge/skills"
check_dir "knowledge/agents"
check_file "knowledge/INDEX.md"

# Skill-engine
check_file "skill-engine/PROTOCOL.md"
check_file "skill-engine/intake.md"
check_file "skill-engine/resolver.md"
check_file "skill-engine/eval-engine.md"
check_file "skill-engine/adapter.md"
check_file "skill-engine/explicit-skills.md"
check_file "skill-engine/implicit-skills.md"

# Skill-creator
check_file "skill-creator/SKILL.md"
check_dir "skill-creator/agents"

# Protokoll
check_file "protocols/small-model-premium.md"
check_file "protocols/agent-orchestration.md"
check_file "protocols/architecture-audit.md"

# Konventioner
check_file "conventions/FOR_AGENTS.md"
check_file "conventions/PRINCIPLES.md"

# Scaffolds
check_dir "scaffolds"

# MemPalace
check_file "mempalace/pyproject.toml"
check_file "mempalace/mempalace/mcp_server.py"
check_file "mempalace/hooks/mempal_save_hook.sh"
check_file ".claude/settings.json"

# Runtime
check_file "runtime/Cargo.toml"
check_dir "runtime/crates"

# Binärer (valfritt)
if [ -f "runtime/target/release/ob1" ] || [ -f "runtime/target/release/ob1.exe" ]; then
    ok "runtime/target/release/ob1 (binär)"
else
    warn "Binär ob1 ej byggd (kördes cargo build?)"
fi

echo ""

# ─────────────────────────────────────────────
# 6. Sammanfattning
# ─────────────────────────────────────────────

echo "==========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}"
    echo "  REDO"
    echo ""
    echo "  Portable Agent Kit är installerat."
    echo "  Starta Claude Code i denna katalog."
    echo "  Agenten läser CLAUDE.md och vet allt."
    echo -e "${NC}"
else
    echo -e "${YELLOW}"
    echo "  DELVIS REDO ($ERRORS varningar)"
    echo ""
    echo "  De flesta delarna fungerar."
    echo "  Se varningarna ovan för detaljer."
    echo -e "${NC}"
fi

echo "Nästa steg:"
echo "  1. Fyll i AGENTS.md med ditt projekts stack och verify-kommandon"
echo "  2. Sätt ANTHROPIC_API_KEY om du vill använda runtime-binärerna"
echo "  3. Kör 'mempalace init .' och 'mempalace mine .' för att aktivera minnet"
echo "  4. Starta Claude Code: claude"
echo ""
echo "==========================================="
