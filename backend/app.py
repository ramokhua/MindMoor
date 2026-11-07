from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv('FRONTEND_URL', 'http://localhost:3000')}})

# Simple in-memory chat for demo
chat_history = []

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    
    # Store message in history
    chat_history.append({"role": "user", "content": user_message})
    
    # For now, return a simple response
    # TODO: Integrate with actual model
    response_text = f"You said: {user_message}. This is a demo response."
    
    chat_history.append({"role": "assistant", "content": response_text})
    
    return jsonify({
        "response": response_text,
        "history_length": len(chat_history)
    }), 200

@app.route('/api/chat/history', methods=['GET'])
def get_history():
    return jsonify({"history": chat_history}), 200

@app.route('/api/chat/clear', methods=['POST'])
def clear_history():
    global chat_history
    chat_history = []
    return jsonify({"message": "Chat history cleared"}), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=os.getenv('FLASK_DEBUG', False), port=port)
