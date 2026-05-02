"""
/api/chat  –  Moira chatbot endpoint
"""
import time
import logging
from flask import Blueprint, request, jsonify

from models.model_loader import get_pipeline
from utils.safety import check_crisis, get_crisis_response
from utils.prompt import build_prompt, clean_response, get_fallback

logger = logging.getLogger(__name__)
chat_bp = Blueprint("chat", __name__)

# Simple in-memory rate limiting (per IP)
_rate_cache: dict[str, list[float]] = {}
RATE_LIMIT   = int(__import__("os").getenv("RATE_LIMIT", 30))    # requests
RATE_WINDOW  = int(__import__("os").getenv("RATE_WINDOW", 60))   # seconds


def _check_rate_limit(ip: str) -> bool:
    now = time.time()
    hits = [t for t in _rate_cache.get(ip, []) if now - t < RATE_WINDOW]
    _rate_cache[ip] = hits
    if len(hits) >= RATE_LIMIT:
        return False
    _rate_cache[ip].append(now)
    return True


@chat_bp.route("/chat", methods=["POST"])
def chat():
    ip = request.remote_addr

    # Rate limiting
    if not _check_rate_limit(ip):
        return jsonify({"error": "Rate limit exceeded. Please wait a moment."}), 429

    # Validate payload
    data = request.get_json(silent=True)
    if not data or not isinstance(data.get("message"), str):
        return jsonify({"error": "Invalid request. Provide a 'message' string."}), 400

    user_message: str = data["message"].strip()
    history: list    = data.get("history", [])   # [{role, content}, …]

    if not user_message:
        return jsonify({"error": "Message cannot be empty."}), 400

    if len(user_message) > 2000:
        return jsonify({"error": "Message too long (max 2000 chars)."}), 400

    # Crisis check — never pass to model
    if check_crisis(user_message):
        return jsonify({
            "response": get_crisis_response(),
            "source": "safety_filter",
        })

    # Generate response
    try:
        pipe    = get_pipeline()
        prompt  = build_prompt(user_message, history)
        outputs = pipe(prompt)

        raw_text = outputs[0]["generated_text"]
        response = clean_response(raw_text)

        return jsonify({
            "response": response,
            "source": "model",
        })

    except Exception as exc:
        logger.error(f"Model inference error: {exc}", exc_info=True)
        return jsonify({
            "response": get_fallback(),
            "source": "fallback",
        })