const chatbot = {
    config: {
        apiUrl: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        apiKey: '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',
        minResponseTime: 800,
        maxResponseTime: 3000
    },
    conversationHistory: [],
    lastMessageTime: null,
    lastUserMessage: '',

    init: function() {
        if (!document.getElementById('send-message')) return;

        // Event listeners
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Welcome message
        setTimeout(() => {
            this.addMessage('bot', "Hello! I'm Moira.");
        }, 1000);
    },

    sendMessage: function() {
        // Rate limiting
        if (this.lastMessageTime && Date.now() - this.lastMessageTime < 1000) {
            this.addMessage('bot', "Please wait a moment before sending another message.");
            return;
        }
        this.lastMessageTime = Date.now();

        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.lastUserMessage = message;
        this.conversationHistory.push({ sender: 'user', message });
        input.value = '';
        input.focus();

        const typingIndicator = this.showTypingIndicator();

        // Add delay for better UX
        const delay = Math.max(
            this.config.minResponseTime,
            Math.random() * this.config.maxResponseTime
        );

        // Check for keywords first
        const keywordResponse = this.getKeywordResponse(message);
        if (keywordResponse) {
            setTimeout(() => {
                this.hideTypingIndicator(typingIndicator);
                this.addMessage('bot', keywordResponse);
                this.conversationHistory.push({ sender: 'bot', message: keywordResponse });
            }, delay);
            return;
        }

        this.getAIResponse(message)
            .then(response => {
                setTimeout(() => {
                    this.hideTypingIndicator(typingIndicator);
                    this.addMessage('bot', response);
                    this.conversationHistory.push({ sender: 'bot', message: response });
                }, delay);
            })
            .catch(error => {
                this.hideTypingIndicator(typingIndicator);
                const fallback = this.getFallbackResponse();
                this.addMessage('bot', fallback);
                this.conversationHistory.push({ sender: 'bot', message: fallback });
                console.error("Chatbot error:", error);
            });
    },

    getKeywordResponse: function(message) {
        const lowerMsg = message.toLowerCase();

        //greetings keywords
        if(/(hi|hey|hello)/i.test(lowerMsg)){
            return this.getGreetingsResponse();
        }

        // Crisis keywords
        if (/(suicidal|self.?harm|kill myself|end it all)/i.test(lowerMsg)) {
            return "I'm really concerned about what you're sharing. Please contact your local crisis hotline immediately. You're not alone, and help is available.";
        }

        // Common mental health topics
        if (/(stress|overwhelm|overwhelmed)/i.test(lowerMsg)) {
            return this.getStressResponse();
        }

        if (/(anxious|anxiety|nervous|worried)/i.test(lowerMsg)) {
            return this.getAnxietyResponse();
        }

        if (/(interview|job|work|employment)/i.test(lowerMsg)) {
            return this.getInterviewResponse();
        }

        if (/(lonely|alone|isolated)/i.test(lowerMsg)) {
            return this.getLonelinessResponse();
        }

        if (/(depress|sad|miserable|down)/i.test(lowerMsg)) {
            return this.getDepressionResponse();
        }

        return null;
    },

    getGreetingsResponse: function() {
        const options = [
            "How can I help you today?",
            "How are you doing?",
            "I'm here to listen. What's on your mind?",
            "I'm here to listen. What's been on your mind lately?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },  // Removed the semicolon here

    getStressResponse: function() {
        const options = [
            "Stress can feel overwhelming. Would you like a grounding exercise or to talk through what's bothering you?",
            "When I'm stressed, I remember to pause and breathe. Let's try together: breathe in for 4, hold for 4, out for 6.",
            "That sounds really difficult. Stress often comes from feeling overloaded. Would it help to prioritize one small thing to address first?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getAnxietyResponse: function() {
        const options = [
            "Anxiety can feel paralyzing. Would you like to try the 5-4-3-2-1 grounding technique? Name 5 things you see, 4 you can touch...",
            "I hear how anxious you're feeling. Sometimes writing down worries can help contain them. Would you like to try that?",
            "Anxiety often makes us fear the future. Can you tell me one small thing that might help right now?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getInterviewResponse: function() {
        const options = [
            "Job interviews can definitely be nerve-wracking. Many people find it helpful to practice answers out loud. Would you like to do a mock interview?",
            "Interview anxiety is completely normal. Remember, it's a conversation, not a test. Would you like some common interview questions to practice?",
            "Preparing for interviews can reduce anxiety. Would it help to discuss: 1) Your strengths 2) Why you want this job 3) Questions you have for them?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getLonelinessResponse: function() {
        const options = [
            "Loneliness can be really painful. Would you like to explore ways to connect with others, or strategies to feel comfort when alone?",
            "I hear how lonely you're feeling. Sometimes joining an online community or class can help. Would you like some suggestions?",
            "Feeling alone is so hard. Would it help to think of one person you could reach out to today, even just for a quick message?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getDepressionResponse: function() {
        const options = [
            "I'm sorry you're feeling this way. Depression can make everything feel heavy. Would you like to talk about what might help you today?",
            "That sounds really hard. When depression feels overwhelming, sometimes just getting through the day is enough. Be gentle with yourself.",
            "I hear how much you're struggling. Would it help to think of one small thing that usually brings you comfort, even just a little?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getAIResponse: async function(userMessage) {
        try {
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({ 
                    inputs: {
                        past_user_inputs: this.conversationHistory
                            .filter(m => m.sender === 'user')
                            .slice(-2)
                            .map(m => m.message),
                        generated_responses: this.conversationHistory
                            .filter(m => m.sender === 'bot')
                            .slice(-2)
                            .map(m => m.message),
                        text: userMessage
                    },
                    parameters: {
                        return_full_text: false,
                        max_length: 150
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 503 && errorData.error === "Model is loading") {
                    return "I'm still waking up. Please try again in a few seconds.";
                }
                if (response.status === 429) {
                    return "I'm getting too many requests. Please wait a moment before trying again.";
                }
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return this.processResponse(data);
        } catch (error) {
            console.error("API Error:", error);
            return this.getFallbackResponse();
        }
    },

    processResponse: function(data) {
        if (data.error) {
            console.error("API Error:", data.error);
            return this.getFallbackResponse();
        }

        // Handle different response formats
        let responseText = "";

        if (data.generated_text) {
            responseText = data.generated_text;
        } 
        else if (Array.isArray(data) && data.length > 0) {
            responseText = data[0].generated_text || "";
        }
        else if (data.conversation && data.conversation.generated_responses) {
            responseText = data.conversation.generated_responses.slice(-1)[0];
        }

        if (!responseText.trim()) {
            return this.getFallbackResponse();
        }

        return this.cleanResponse(responseText);
    },

    cleanResponse: function(text) {
        if (!text) return this.getFallbackResponse();

        // Remove any bot-specific prefixes
        let cleaned = text.replace(/^\s*(bot|ai|moira):?\s*/i, '').trim();

        // Remove special tokens or weird characters
        cleaned = cleaned.replace(/<\/?s>|\[|\]|\(|\)/g, '');

        // Ensure proper punctuation
        if (!/[.!?]$/.test(cleaned)) {
            cleaned += '.';
        }

        // Capitalize first letter and fix spacing
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        cleaned = cleaned.replace(/\s+([.,!?])/g, '$1');
        cleaned = cleaned.replace(/([.,!?])([a-zA-Z])/g, '$1 $2');

        return cleaned;
    },

    getFallbackResponse: function() {
        const fallbacks = [
            "I want to understand better. Could you share more about what you're experiencing?",
            "That sounds important. Let me think how best to help...",
            "I hear you. Would it help if we explored this together?",
            "Thank you for sharing that with me. What would be most helpful right now?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    },

    showTypingIndicator: function() {
        const container = document.getElementById('chatbot-messages');
        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
        return indicator;
    },

    hideTypingIndicator: function(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    },

    addMessage: function(sender, text) {
        const container = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${timestamp}</div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
};

// Initialize only if on chatbot page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('chatbot.html') || 
        document.getElementById('chatbot-messages')) {
        chatbot.init();
    }
});