# MockForge AI ⬡

**AI-powered photorealistic product mockup generator.**  
Type a description → get a Blender Cycles render in seconds.

```
"A white ceramic perfume bottle on black marble with dramatic side lighting"
                              ↓
                    [AI interprets prompt]
                              ↓
                   [Blender scene is built]
                              ↓
                    [Cycles renders image]
                              ↓
                   ✨ Photorealistic render
```

---

## Architecture

```
Browser (React + Vite)
        ↓  POST /generate
FastAPI Backend (Python)
        ↓
AI Engine (Ollama / llama3 or rule-based fallback)
        ↓  scene parameters JSON
Scene Builder (Python → Blender Python script)
        ↓  blender --background --python scene.py
Blender CLI (Cycles renderer)
        ↓  PNG output
Static file server → Browser
```

---

## Prerequisites

### Required

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.10+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Blender | 3.6+ | [blender.org](https://blender.org) |

### Optional (for AI prompt interpretation)

| Tool | Purpose | Install |
|------|---------|---------|
| Ollama | Local LLM server | [ollama.ai](https://ollama.ai) |

> Without Ollama, MockForge uses a built-in rule-based parser. Renders still work perfectly.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/mockforge-ai.git
cd mockforge-ai
```

### 2. Install Blender

**macOS:**
```bash
brew install --cask blender
# or download from https://blender.org/download
```

**Ubuntu/Debian:**
```bash
sudo snap install blender --classic
# or: sudo apt install blender
```

**Windows:**
Download installer from [blender.org/download](https://www.blender.org/download/)  
Add Blender to PATH or set `BLENDER_PATH` environment variable.

**Verify installation:**
```bash
blender --version
```

### 3. Install Ollama (optional)

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve &
ollama pull llama3
```

**Windows:** Download from [ollama.ai](https://ollama.ai)

### 4. Start MockForge AI

```bash
chmod +x start.sh
./start.sh
```

That's it! The script will:
1. Create a Python virtual environment
2. Install Python dependencies
3. Install Node.js dependencies
4. Start the backend API (port 8000)
5. Start the frontend (port 3000)

Open **http://localhost:3000** in your browser.

---

## Usage

1. Open `http://localhost:3000`
2. Type a product description in the prompt box
3. Click **Generate Render** or press `⌘↵`
4. Wait 20–120 seconds (depending on your machine)
5. Download the 2048×2048 PNG render

### Example prompts

```
A matte black smartphone on a walnut desk with soft studio lighting, 45° product shot

Silver wireless headphones on a dark background with neon purple rim lighting

Glass perfume bottle on white marble, golden hour sunlight from the left, close-up macro

Vintage leather wallet on rough concrete with dramatic side lighting
```

---

## Configuration

Environment variables (set before running `start.sh`):

| Variable | Default | Description |
|----------|---------|-------------|
| `BLENDER_PATH` | `blender` | Path to Blender executable |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3` | LLM model to use |
| `RENDER_TIMEOUT` | `120` | Max render seconds |
| `RENDER_SAMPLES` | `128` | Cycles sample count |
| `RENDER_RESOLUTION` | `2048` | Output image size (px) |
| `CACHE_ENABLED` | `true` | Cache identical renders |

### Faster renders (for demos)

```bash
RENDER_SAMPLES=32 RENDER_RESOLUTION=1024 ./start.sh
```

---

## API Reference

### `POST /generate`

Start a render job.

```json
// Request
{ "prompt": "white smartphone on wooden desk" }

// Response
{ "job_id": "uuid", "status": "queued", "message": "Render job started" }
```

### `GET /status/{job_id}`

Poll job status.

```json
{
  "job_id": "uuid",
  "status": "complete",
  "image_url": "/renders/abc123.png",
  "params": { "product": "smartphone", "lighting": "soft studio", ... },
  "elapsed": 34.2
}
```

**Status values:** `queued` → `interpreting` → `building_scene` → `rendering` → `complete` / `error`

### `GET /health`

Check system health and Blender availability.

---

## Docker

```bash
docker-compose up --build
```

> Note: Blender GPU rendering is not available inside Docker without additional NVIDIA setup.

---

## Project Structure

```
mockforge-ai/
├── backend/
│   ├── main.py           # FastAPI app, job queue
│   ├── ai_engine.py      # Prompt → scene params (Ollama / fallback)
│   ├── scene_builder.py  # Params → Blender Python script
│   ├── blender_runner.py # Headless Blender execution
│   ├── config.py         # Configuration
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── App.jsx        # Main app + state machine
│       ├── api.js         # Backend API client
│       └── components/
│           ├── PromptBox.jsx    # Input UI
│           ├── Loader.jsx       # Render progress
│           └── RenderViewer.jsx # Result display + download
│
├── blender_templates/
│   └── product_scene_template.py  # Reference scene template
│
├── renders/              # Output PNGs stored here
├── start.sh              # One-command launcher
├── docker-compose.yml
└── README.md
```

---

## Render Quality

| Setting | Fast (demo) | Default | High quality |
|---------|------------|---------|--------------|
| Samples | 32 | 128 | 512 |
| Resolution | 512 | 2048 | 4096 |
| Est. time (CPU) | ~10s | ~60s | ~300s |

---

## Troubleshooting

**Blender not found:**
```bash
export BLENDER_PATH=/path/to/blender
./start.sh
```

**Render times out:**
```bash
RENDER_TIMEOUT=300 ./start.sh  # Increase timeout
RENDER_SAMPLES=32 ./start.sh   # Reduce quality for speed
```

**Ollama errors (non-fatal):**  
MockForge falls back to rule-based parsing automatically. You'll still get renders.

**Port conflicts:**
- Backend uses port 8000 — change with `uvicorn main:app --port 9000`
- Frontend uses port 3000 — change in `frontend/vite.config.js`

---

## License

MIT — built for demo/investor purposes.

---

*MockForge AI — From words to renders.*
