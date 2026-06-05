"""
MindMoor Flask Backend - Vercel compatible
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Application factory pattern for Vercel compatibility"""
    app = Flask(__name__)
    
    # Configure CORS for production
    frontend_url = os.getenv('FRONTEND_URL', 'https://mindmoor.vercel.app')
    CORS(app, origins=[frontend_url, 'http://localhost:3000', 'http://localhost:5000'])
    
    # Import and register blueprints
    from routes.chat import chat_bp
    from routes.health import health_bp
    from routes.training import training_bp
    
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(training_bp, url_prefix='/api')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({"error": "Internal server error"}), 500
    
    return app

# Create app instance for Vercel
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
