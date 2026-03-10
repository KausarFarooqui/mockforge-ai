import hashlib
import re

PROMPT_CACHE: dict = {}


def sanitize_prompt(prompt: str) -> str:
    prompt = prompt.strip()
    prompt = re.sub(r'[<>{}|\\^`]', '', prompt)
    return prompt[:500]


def get_cache_key(prompt: str) -> str:
    return hashlib.md5(prompt.lower().strip().encode()).hexdigest()


async def enhance_prompt(prompt: str) -> str:
    enhancements = [
        "photorealistic product photography",
        "professional studio lighting",
        "8k ultra detailed",
        "sharp focus",
        "commercial product shot",
        "clean composition",
    ]
    prompt_lower = prompt.lower()
    if any(w in prompt_lower for w in ["perfume", "bottle", "glass"]):
        enhancements.append("macro lens, crystal clear reflections, luxury product photography")
    if any(w in prompt_lower for w in ["watch", "jewelry", "ring"]):
        enhancements.append("macro photography, metallic reflections, luxury advertisement")
    if any(w in prompt_lower for w in ["shoe", "sneaker", "boot"]):
        enhancements.append("Nike style product photography, dramatic lighting")
    if any(w in prompt_lower for w in ["phone", "smartphone", "laptop"]):
        enhancements.append("tech product photography, clean minimal background")
    if any(w in prompt_lower for w in ["food", "drink", "coffee", "cup"]):
        enhancements.append("food photography, warm tones, appetizing")
    return f"{prompt}, {', '.join(enhancements)}"


async def interpret_prompt(prompt: str) -> dict:
    prompt = sanitize_prompt(prompt)
    cache_key = get_cache_key(prompt)
    if cache_key in PROMPT_CACHE:
        return PROMPT_CACHE[cache_key]
    enhanced = await enhance_prompt(prompt)
    params = {
        "original_prompt": prompt,
        "enhanced_prompt": enhanced,
        "negative_prompt": "blurry, low quality, distorted, deformed, ugly, watermark, text, cartoon, illustration, painting, drawing, unrealistic",
        "width": 1024,
        "height": 1024,
        "num_inference_steps": 30,
        "guidance_scale": 7.5,
    }
    PROMPT_CACHE[cache_key] = params
    return params
