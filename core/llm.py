"""
AURA - LLM client.

Talks to a LOCAL model via Ollama (http://localhost:11434). No cloud API,
no API key. You must have Ollama installed and a model pulled, e.g.:

    ollama pull qwen2.5:3b

If Ollama isn't running, all calls raise LLMUnavailable with a clear
message rather than silently failing or fabricating output.
"""
import json
import requests

import config


class LLMUnavailable(Exception):
    pass


def _check_ollama():
    try:
        r = requests.get(f"{config.OLLAMA_HOST}/api/tags", timeout=5)
        r.raise_for_status()
        return True
    except Exception as e:
        raise LLMUnavailable(
            f"Cannot reach Ollama at {config.OLLAMA_HOST}. "
            f"Is it installed and running? (pkg install ollama && ollama serve). "
            f"Underlying error: {e}"
        )


def generate(prompt: str, system: str = None, temperature: float = 0.3,
             model: str = None, json_mode: bool = False) -> str:
    """
    Single-turn completion against the local model.
    """
    _check_ollama()
    payload = {
        "model": model or config.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": temperature},
    }
    if system:
        payload["system"] = system
    if json_mode:
        payload["format"] = "json"

    try:
        r = requests.post(
            f"{config.OLLAMA_HOST}/api/generate",
            json=payload,
            timeout=config.OLLAMA_TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("response", "")
    except requests.exceptions.Timeout:
        raise LLMUnavailable(f"Ollama timed out after {config.OLLAMA_TIMEOUT}s. Try a smaller model.")
    except Exception as e:
        raise LLMUnavailable(f"Ollama request failed: {e}")


def chat(messages: list, temperature: float = 0.3, model: str = None) -> str:
    """
    Multi-turn chat completion. messages = [{"role": "user"/"assistant"/"system", "content": ...}]
    """
    _check_ollama()
    payload = {
        "model": model or config.OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature},
    }
    try:
        r = requests.post(
            f"{config.OLLAMA_HOST}/api/chat",
            json=payload,
            timeout=config.OLLAMA_TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("message", {}).get("content", "")
    except requests.exceptions.Timeout:
        raise LLMUnavailable(f"Ollama timed out after {config.OLLAMA_TIMEOUT}s. Try a smaller model.")
    except Exception as e:
        raise LLMUnavailable(f"Ollama request failed: {e}")


def generate_json(prompt: str, system: str = None) -> dict:
    """
    Ask the model for structured JSON and parse it. Falls back to {} on
    parse failure rather than crashing the caller.
    """
    raw = generate(prompt, system=system, json_mode=True, temperature=0.1)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # try to salvage JSON embedded in extra text
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(raw[start:end + 1])
            except json.JSONDecodeError:
                pass
        return {}


def is_available() -> bool:
    try:
        _check_ollama()
        return True
    except LLMUnavailable:
        return False
