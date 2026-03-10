<div align="center">

# ⬡ MockForge AI

### Turn words into photorealistic product images

**Describe any product. Get a commercial-grade render in seconds.**

![MockForge AI](https://img.shields.io/badge/Powered%20by-Stable%20Diffusion%20XL-C9A96E?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)

</div>

---

## What is MockForge AI?

MockForge AI is an AI-powered product mockup generator. Type a description of any product and get a photorealistic commercial-grade image in seconds — no design skills, no Photoshop, no 3D software needed.

```
"white crystal perfume bottle on black marble with dramatic side lighting"
                                    ↓
                     ✨ Photorealistic product image
```

---

## Demo

| Prompt | Result |
|--------|--------|
| `white perfume bottle on black marble with dramatic lighting` | Luxury product shot |
| `gold watch on dark velvet with spotlight` | Premium watch ad |
| `red sneaker on white background soft lighting` | Clean product photo |
| `coffee cup with steam on wooden table warm light` | Lifestyle product shot |

---

## Features

- **AI Prompt Enhancer** — automatically enriches your prompt with photography keywords
- **12 Quick Templates** — one-click generate popular product categories
- **Live Suggestions** — smart autocomplete guides you to better prompts
- **Gallery** — all your renders saved locally, fullscreen lightbox viewer
- **Prompt History** — every prompt saved, one-click reuse
- **Download PNG** — export any render at full resolution
- **No character limit** — describe in as much detail as you want

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Python + FastAPI |
| AI Image Generation | Stable Diffusion XL via HuggingFace |
| Prompt Enhancement | Rule-based AI engine |
| Styling | Pure CSS (no framework) |

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Git | Any | [git-scm.com](https://git-scm.com) |

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/KausarFarooqui/mockforge-ai.git
cd mockforge-ai
```

### 2. Get a HuggingFace API Token (Free)

1. Go to [huggingface.co](https://huggingface.co) and create a free account
2. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Click **New token** → select **Write** role → click **Generate**
4. Copy the token (starts with `hf_...`)

### 3. Set up the Backend

```bash
cd backend
python -m venv venv
```

**Windows:**
```powershell
.\venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 4. Set up the Frontend

```bash
cd ../frontend
npm install
```

---

## Running the App

You need **two terminal windows** open at the same time.

### Terminal 1 — Start the Backend

**Windows:**
```powershell
cd backend
.\venv\Scripts\activate
$env:REPLICATE_API_TOKEN="hf_YOUR_TOKEN_HERE"
$env:PYTHONUTF8="1"
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Mac/Linux:**
```bash
cd backend
source venv/bin/activate
export REPLICATE_API_TOKEN="hf_YOUR_TOKEN_HERE"
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

### Open the App

```
http://localhost:3000
```

---

## Usage

1. Open **http://localhost:3000**
2. Type a product description in the prompt box
3. OR click any template card to generate instantly
4. Wait ~15-30 seconds for the image
5. Download your render as PNG

### Example Prompts

```
white crystal perfume bottle on black marble with dramatic side lighting
gold luxury watch on dark velvet surface with spotlight lighting
red leather sneaker on white background with soft studio lighting
hot espresso coffee cup with steam on rustic wooden table warm golden light
matte black smartphone on dark gradient background minimal studio lighting
crystal whiskey glass with ice on dark oak table with warm amber lighting
```

### Prompt Tips

For best results, structure your prompt as:

```
[product] + [color/material] + [surface/background] + [lighting style]
```

Examples:
- `white ceramic` + `on black marble` + `with dramatic side lighting`
- `gold metallic` + `on dark velvet` + `with warm spotlight`
- `matte black` + `floating on gradient` + `with cinematic rim lighting`

---

## Configuration

Set these environment variables to customize behavior:

| Variable | Default | Description |
|----------|---------|-------------|
| `REPLICATE_API_TOKEN` | required | Your HuggingFace API token |
| `RENDER_TIMEOUT` | `300` | Max seconds to wait for render |
| `CACHE_ENABLED` | `true` | Cache identical prompts |

---

## Project Structure

```
mockforge-ai/
├── backend/
│   ├── main.py              # FastAPI app + job queue
│   ├── ai_engine.py         # Prompt enhancer
│   ├── replicate_runner.py  # HuggingFace SDXL API
│   ├── config.py            # Configuration
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── App.jsx          # Main app (studio, gallery, history)
│       ├── api.js           # Backend API client
│       └── components/      # UI components
│
├── renders/                 # Generated images stored here
└── README.md
```

---

## Troubleshooting

**"401 Unauthorized"**
→ Your HuggingFace token is invalid. Create a new one with **Write** permissions at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

**"403 Forbidden"**
→ Token needs **Write** role, not Read. Create a new token.

**"503 Model loading"**
→ Normal on first use. The model takes 30-60 seconds to load. Just wait and retry.

**Port already in use**
```powershell
# Windows - find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Frontend not loading**
→ Make sure backend is running first, then start frontend.

---

## Roadmap

- [ ] User authentication
- [ ] Cloud deployment (Vercel + Railway)
- [ ] Multiple image variations per prompt
- [ ] Image upscaling (4x resolution)
- [ ] Custom style presets
- [ ] API access for developers

---

## License

MIT License — free to use, modify and deploy.

---

<div align="center">

Built with ♦ by [KausarFarooqui](https://github.com/KausarFarooqui)

**Star ⭐ this repo if you found it useful!**

</div>
