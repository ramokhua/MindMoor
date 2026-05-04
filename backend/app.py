"""
MindMoor Flask Backend
Serves the fine-tuned HuggingFace model for the Moira chatbot.
"""
import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "*")])

    # Register blueprints
    from routes.chat import chat_bp
    from routes.health import health_bp
    from routes.training import training_bp

    app.register_blueprint(chat_bp,     url_prefix="/api")
    app.register_blueprint(health_bp,   url_prefix="/api")
    app.register_blueprint(training_bp, url_prefix="/api")

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f"🧠 MindMoor backend starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)