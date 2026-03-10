import httpx
import asyncio
from config import RENDERS_DIR

HF_API_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"

async def run_replicate(params, render_id, api_token):
    headers = {"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"}
    payload = {"inputs": params["enhanced_prompt"], "parameters": {"negative_prompt": params["negative_prompt"], "width": 1024, "height": 1024, "num_inference_steps": 30, "guidance_scale": 7.5}}
    output_path = str(RENDERS_DIR / f"{render_id}.png")
    async with httpx.AsyncClient(timeout=120.0) as client:
        print("[HuggingFace] Sending request...")
        for attempt in range(10):
            response = await client.post(HF_API_URL, json=payload, headers=headers)
            if response.status_code == 503:
                print(f"[HuggingFace] Model loading, waiting 30s")
                await asyncio.sleep(30)
                continue
            elif response.status_code == 200:
                open(output_path, "wb").write(response.content)
                print(f"[HuggingFace] Saved: {output_path}")
                return output_path
            elif response.status_code == 429:
                await asyncio.sleep(30)
                continue
            else:
                raise RuntimeError(f"HuggingFace error {response.status_code}: {response.text[:300]}")
        raise TimeoutError("Failed after retries")
