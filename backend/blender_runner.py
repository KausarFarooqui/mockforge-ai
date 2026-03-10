import asyncio
import subprocess
import shutil
from pathlib import Path
from config import BLENDER_PATH, RENDER_TIMEOUT


async def run_blender(script_path: str, output_path: str) -> bool:
    """
    Execute Blender headlessly to render the scene.
    Returns True on success, raises on failure.
    """
    # Validate blender is available
    blender_exe = shutil.which(BLENDER_PATH) or BLENDER_PATH

    cmd = [
        blender_exe,
        "--background",
        "--python", script_path,
        "--",  # separator for script args
    ]

    print(f"[Blender] Running: {' '.join(cmd)}")

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await asyncio.wait_for(
            proc.communicate(),
            timeout=RENDER_TIMEOUT
        )

        stdout_str = stdout.decode("utf-8", errors="replace")
        stderr_str = stderr.decode("utf-8", errors="replace")

        # Log output
        for line in stdout_str.splitlines():
            if any(kw in line for kw in ["MockForge", "Fra:", "Saved", "Error", "Warning"]):
                print(f"[Blender] {line}")

        if proc.returncode != 0:
            print(f"[Blender] STDERR: {stderr_str[-2000:]}")
            raise RuntimeError(f"Blender exited with code {proc.returncode}")

        # Verify output exists
        if not Path(output_path).exists():
            raise RuntimeError(f"Render output not found at {output_path}")

        print(f"[Blender] Render saved to {output_path}")
        return True

    except asyncio.TimeoutError:
        try:
            proc.kill()
        except Exception:
            pass
        raise TimeoutError(f"Blender render timed out after {RENDER_TIMEOUT}s")

    except FileNotFoundError:
        raise RuntimeError(
            f"Blender not found at '{blender_exe}'. "
            "Please install Blender and ensure it's in your PATH, "
            "or set the BLENDER_PATH environment variable."
        )


def check_blender_available() -> tuple[bool, str]:
    """Check if Blender is installed and return version."""
    blender_exe = shutil.which(BLENDER_PATH) or BLENDER_PATH
    try:
        result = subprocess.run(
            [blender_exe, "--version"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            version_line = result.stdout.splitlines()[0] if result.stdout else "Unknown"
            return True, version_line
        return False, "Blender returned non-zero exit code"
    except FileNotFoundError:
        return False, f"Blender not found at '{blender_exe}'"
    except Exception as e:
        return False, str(e)
