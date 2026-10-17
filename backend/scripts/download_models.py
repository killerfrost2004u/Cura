"""
CURA Model Setup & Verification Script.
Ensures local AI models are ready for Edge execution on Raspberry Pi 4 / Laptop.
"""
import subprocess
import sys
import shutil

def check_ollama():
    print("[1/3] Checking Ollama installation...")
    ollama_path = shutil.which("ollama")
    if not ollama_path:
        print("  WARNING: 'ollama' command not found on PATH.")
        print("  Please install Ollama from: https://ollama.com/download")
        return False
    print(f"  Found Ollama at: {ollama_path}")

    print("  Pulling Qwen 2.5 1.5B (GGUF Q4_K_M)...")
    try:
        subprocess.run(["ollama", "pull", "qwen2.5:1.5b-instruct"], check=True)
        print("  SUCCESS: qwen2.5:1.5b-instruct is ready!")
        return True
    except Exception as e:
        print(f"  ERROR pulling model: {e}")
        return False

def check_whisper_and_piper():
    print("[2/3] Checking Whisper.cpp & Piper TTS binaries...")
    whisper_path = shutil.which("whisper-cli") or shutil.which("whisper")
    if whisper_path:
        print(f"  Whisper.cpp binary found at: {whisper_path}")
    else:
        print("  Notice: Whisper.cpp binary not on PATH. Fallback mock engine will be active during dev.")

    piper_path = shutil.which("piper")
    if piper_path:
        print(f"  Piper TTS binary found at: {piper_path}")
    else:
        print("  Notice: Piper TTS binary not on PATH. Fallback mock engine will be active during dev.")

if __name__ == "__main__":
    print("=" * 60)
    print("CURA Edge AI Models Setup & Health Verification")
    print("Target Platform: Raspberry Pi 4 Model B (4GB RAM) / Laptop Dev")
    print("=" * 60)
    check_ollama()
    check_whisper_and_piper()
    print("=" * 60)
    print("Setup check completed.")
