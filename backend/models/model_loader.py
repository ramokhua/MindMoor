"""
Model management for MindMoor.
Loads either a fine-tuned local model or falls back to HuggingFace inference.
"""
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Lazy singletons ────────────────────────────────────────────────────────────
_tokenizer = None
_model     = None
_pipeline  = None

# Base model to use when no fine-tuned version exists
BASE_MODEL = os.getenv("BASE_MODEL", "facebook/blenderbot-400M-distill")
FINE_TUNED_DIR = Path(os.getenv("FINE_TUNED_DIR", "./models/moira-finetuned"))


def _load_pipeline():
    """Load the text generation pipeline (once, lazily)."""
    global _tokenizer, _model, _pipeline

    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

    model_path = str(FINE_TUNED_DIR) if FINE_TUNED_DIR.exists() else BASE_MODEL
    logger.info(f"Loading model from: {model_path}")

    _tokenizer = AutoTokenizer.from_pretrained(model_path)
    _model     = AutoModelForSeq2SeqLM.from_pretrained(model_path)

    _pipeline = pipeline(
        "text2text-generation",
        model=_model,
        tokenizer=_tokenizer,
        max_new_tokens=int(os.getenv("MAX_NEW_TOKENS", 200)),
        temperature=float(os.getenv("MODEL_TEMPERATURE", 0.75)),
        do_sample=True,
        top_p=0.92,
    )

    logger.info("✅ Model loaded successfully")
    return _pipeline


def get_pipeline():
    """Return the cached pipeline, loading it on first call."""
    global _pipeline
    if _pipeline is None:
        _pipeline = _load_pipeline()
    return _pipeline


def is_model_loaded() -> bool:
    return _pipeline is not None


def get_model_info() -> dict:
    fine_tuned = FINE_TUNED_DIR.exists()
    return {
        "base_model": BASE_MODEL,
        "fine_tuned": fine_tuned,
        "model_path": str(FINE_TUNED_DIR) if fine_tuned else BASE_MODEL,
        "loaded": is_model_loaded(),
    }