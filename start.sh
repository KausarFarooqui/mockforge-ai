#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║        MockForge AI  v1.0            ║${NC}"
echo -e "${BOLD}${CYAN}║  AI-Powered Product Render Generator ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── CHECK PYTHON ──────────────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}✗ Python 3 not found. Please install Python 3.10+${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Python: $(python3 --version)${NC}"

# ── CHECK NODE ────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node: $(node --version)${NC}"

# ── CHECK BLENDER ─────────────────────────────────────────────────────────────
if command -v blender &>/dev/null; then
  BLENDER_VER=$(blender --version 2>/dev/null | head -1)
  echo -e "${GREEN}✓ Blender: $BLENDER_VER${NC}"
else
  echo -e "${YELLOW}⚠ Blender not found in PATH${NC}"
  echo -e "  Set BLENDER_PATH env var or install from https://blender.org"
fi

# ── CHECK OLLAMA ──────────────────────────────────────────────────────────────
if command -v ollama &>/dev/null; then
  echo -e "${GREEN}✓ Ollama available (AI interpretation enabled)${NC}"
else
  echo -e "${YELLOW}⚠ Ollama not found — using rule-based fallback${NC}"
  echo -e "  Install from https://ollama.ai for AI-powered prompt interpretation"
fi

echo ""

# ── INSTALL BACKEND DEPS ──────────────────────────────────────────────────────
echo -e "${CYAN}→ Installing Python dependencies...${NC}"
cd backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate || source venv/Scripts/activate 2>/dev/null
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"
cd ..

# ── INSTALL FRONTEND DEPS ─────────────────────────────────────────────────────
echo -e "${CYAN}→ Installing frontend dependencies...${NC}"
cd frontend
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# ── ENSURE RENDERS DIR ────────────────────────────────────────────────────────
mkdir -p renders/scripts
echo -e "${GREEN}✓ Output directories ready${NC}"

echo ""
echo -e "${BOLD}Starting services...${NC}"
echo ""

# ── START BACKEND ─────────────────────────────────────────────────────────────
cd backend
source venv/bin/activate || source venv/Scripts/activate 2>/dev/null
echo -e "${CYAN}→ Starting FastAPI backend on http://localhost:8000${NC}"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
sleep 2

# ── START FRONTEND ────────────────────────────────────────────────────────────
cd frontend
echo -e "${CYAN}→ Starting Vite frontend on http://localhost:3000${NC}"
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║  MockForge AI is running!            ║${NC}"
echo -e "${BOLD}${GREEN}║                                      ║${NC}"
echo -e "${BOLD}${GREEN}║  Frontend: http://localhost:3000     ║${NC}"
echo -e "${BOLD}${GREEN}║  Backend:  http://localhost:8000     ║${NC}"
echo -e "${BOLD}${GREEN}║  API docs: http://localhost:8000/docs║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "Press ${BOLD}Ctrl+C${NC} to stop all services"

# ── CLEANUP ON EXIT ───────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo -e "${CYAN}Stopping services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo -e "${GREEN}Goodbye!${NC}"
  exit 0
}
trap cleanup INT TERM

wait
