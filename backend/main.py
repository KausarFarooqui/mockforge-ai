import os
import time
import uuid
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator

from config import RENDERS_DIR, CACHE_ENABLED
from ai_engine import interpret_prompt
from replicate_runner import run_replicate

REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")

app = FastAPI(title="MockForge AI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/renders", StaticFiles(directory=str(RENDERS_DIR)), name="renders")

jobs: dict = {}


class GenerateRequest(BaseModel):
    prompt: str

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Prompt too short")
        if len(v) > 500:
            raise ValueError("Prompt too long")
        return v


@app.get("/")
async def root():
    return {"status": "ok", "service": "MockForge AI", "version": "2.0.0", "engine": "Stable Diffusion XL"}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "Replicate SDXL",
        "api_token_set": bool(REPLICATE_API_TOKEN),
        "renders_dir": str(RENDERS_DIR),
        "cache_enabled": CACHE_ENABLED,
    }


@app.post("/generate")
async def generate(request: GenerateRequest, background_tasks: BackgroundTasks):
    if not REPLICATE_API_TOKEN:
        raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not set")

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "queued",
        "prompt": request.prompt,
        "created_at": time.time(),
        "image_url": None,
        "error": None,
        "params": None,
    }
    background_tasks.add_task(_render_job, job_id, request.prompt)
    return {"job_id": job_id, "status": "queued", "message": "Render started"}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "image_url": job.get("image_url"),
        "error": job.get("error"),
        "params": job.get("params"),
        "elapsed": round(time.time() - job["created_at"], 1),
    }


@app.get("/renders/{filename}")
async def get_render(filename: str):
    path = RENDERS_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Render not found")
    return FileResponse(str(path), media_type="image/png")


async def _render_job(job_id: str, prompt: str):
    job = jobs[job_id]
    try:
        # Step 1: Enhance prompt
        job["status"] = "interpreting"
        print(f"[Job {job_id[:8]}] Enhancing prompt: {prompt[:60]}")
        params = await interpret_prompt(prompt)
        job["params"] = {
            "original": params["original_prompt"],
            "enhanced": params["enhanced_prompt"][:100] + "...",
        }
        print(f"[Job {job_id[:8]}] Enhanced: {params['enhanced_prompt'][:80]}...")

        # Step 2: Check cache
        import hashlib, json
        cache_key = hashlib.md5(params["enhanced_prompt"].encode()).hexdigest()
        cached = RENDERS_DIR / f"{cache_key}.png"
        if CACHE_ENABLED and cached.exists():
            print(f"[Job {job_id[:8]}] Cache hit!")
            job["status"] = "complete"
            job["image_url"] = f"/renders/{cache_key}.png"
            return

        # Step 3: Generate with Replicate
        job["status"] = "rendering"
        print(f"[Job {job_id[:8]}] Sending to Replicate SDXL...")
        output_path = await run_replicate(params, cache_key, REPLICATE_API_TOKEN)

        job["status"] = "complete"
        job["image_url"] = f"/renders/{cache_key}.png"
        print(f"[Job {job_id[:8]}] Complete! {job['image_url']}")

    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)
        print(f"[Job {job_id[:8]}] ERROR: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
