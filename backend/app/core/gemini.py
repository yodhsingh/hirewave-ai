import itertools
import logging
import os
import threading
from typing import List

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)

_key_cycle_lock = threading.Lock()

def _load_api_keys() -> List[str]:
    # Prefer comma-separated list, fall back to single key
    keys: List[str] = []
    raw_list = os.getenv("GOOGLE_GEMINI_API_KEYS")
    if raw_list:
        keys.extend([k.strip() for k in raw_list.split(",") if k.strip()])

    fallback = os.getenv("GOOGLE_GEMINI_API_KEY") or settings.GOOGLE_GEMINI_API_KEY
    if fallback:
        if fallback not in keys:
            keys.append(fallback)

    # Deduplicate while preserving order
    deduped = []
    seen = set()
    for k in keys:
        if k and k not in seen:
            seen.add(k)
            deduped.append(k)
    return deduped

_api_keys = _load_api_keys()
_key_cycle = itertools.cycle(_api_keys) if _api_keys else None


def get_next_gemini_api_key() -> str:
    if not _key_cycle:
        logger.error("No Gemini API keys configured")
        raise ValueError("No Gemini API keys configured. Set GOOGLE_GEMINI_API_KEYS or GOOGLE_GEMINI_API_KEY")
    with _key_cycle_lock:
        return next(_key_cycle)


def configure_genai_with_rotation() -> str:
    """Configure genai with the next API key in round-robin order.
    Returns the API key used so callers can log/trace if needed.
    """
    api_key = get_next_gemini_api_key()
    genai.configure(api_key=api_key)
    return api_key
