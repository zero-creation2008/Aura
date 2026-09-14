"""
AURA - embeddings for semantic memory search.

Tries Ollama's embedding endpoint first (works with any embedding-capable
model, e.g. `ollama pull nomic-embed-text`). If unavailable, falls back to
a crude bag-of-words hashing vector so memory search still works
(less accurate, but no extra dependency and never crashes the app).
"""
import hashlib
import requests

import config

EMBED_MODEL = "nomic-embed-text"
FALLBACK_DIM = 256


def _ollama_embed(text: str):
    try:
        r = requests.post(
            f"{config.OLLAMA_HOST}/api/embeddings",
            json={"model": EMBED_MODEL, "prompt": text},
            timeout=config.OLLAMA_TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        emb = data.get("embedding")
        if emb:
            return emb
    except Exception:
        pass
    return None


def _hash_embed(text: str, dim: int = FALLBACK_DIM):
    """Deterministic pseudo-embedding: hashes words into buckets.
    Not semantically rich, but gives consistent, comparable vectors
    with zero external dependency."""
    vec = [0.0] * dim
    for word in text.lower().split():
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        vec[h % dim] += 1.0
    norm = sum(v * v for v in vec) ** 0.5
    if norm > 0:
        vec = [v / norm for v in vec]
    return vec


def embed(text: str) -> list:
    text = text[:8000]  # cap input size
    emb = _ollama_embed(text)
    if emb:
        return emb
    return _hash_embed(text)
