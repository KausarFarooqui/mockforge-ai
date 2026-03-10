import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
RENDERS_DIR = BASE_DIR / "renders"
BLENDER_TEMPLATES_DIR = BASE_DIR / "blender_templates"
TEMP_SCRIPTS_DIR = BASE_DIR / "renders" / "scripts"

RENDERS_DIR.mkdir(exist_ok=True)
TEMP_SCRIPTS_DIR.mkdir(exist_ok=True)

BLENDER_PATH = os.getenv("BLENDER_PATH", "blender")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

RENDER_TIMEOUT = int(os.getenv("RENDER_TIMEOUT", "120"))
RENDER_SAMPLES = int(os.getenv("RENDER_SAMPLES", "128"))
RENDER_RESOLUTION = int(os.getenv("RENDER_RESOLUTION", "2048"))

CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"
