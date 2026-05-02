from flask import Blueprint, jsonify
from models.model_loader import get_model_info

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model": get_model_info(),
    })