require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter); // Apply rate limiting to all requests

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main chatbot endpoint
app.post('/api/chat', async (req, res) => {
    try {
        // Input validation
        if (!req.body.message || typeof req.body.message !== 'string') {
            return res.status(400).json({ error: "Invalid message format" });
        }

        const { message, conversationHistory = [] } = req.body;
        
        // Validate conversation history structure if provided
        if (conversationHistory.length > 0) {
            const isValidHistory = conversationHistory.every(item => 
                item && typeof item === 'object' && 
                ['user', 'bot'].includes(item.sender) && 
                typeof item.message === 'string'
            );
            
            if (!isValidHistory) {
                return res.status(400).json({ error: "Invalid conversation history format" });
            }
        }
        
        // First try Hugging Face
        const hfResponse = await queryHuggingFace(message, conversationHistory);
        if (hfResponse) {
            return res.json({ 
                response: cleanResponse(hfResponse),
                source: 'huggingface'
            });
        }
        
        // Fallback to OpenAI
        const openaiResponse = await queryOpenAI(message);
        return res.json({ 
            response: cleanResponse(openaiResponse),
            source: 'openai'
        });
        
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ 
            error: "Error processing your message",
            fallback: getFallbackResponse()
        });
    }
});

// Helper function to query Hugging Face API
async function queryHuggingFace(message, conversationHistory) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
            {
                inputs: {
                    past_user_inputs: conversationHistory
                        .filter(m => m.sender === 'user')
                        .slice(-3)
                        .map(m => m.message),
                    generated_responses: conversationHistory
                        .filter(m => m.sender === 'bot')
                        .slice(-3)
                        .map(m => m.message),
                    text: message
                },
                parameters: {
                    return_full_text: false,
                    max_length: 200,
                    temperature: 0.7
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );
        
        return processHuggingFaceResponse(response.data);
    } catch (error) {
        console.error("Hugging Face error:", error.response?.data || error.message);
        return null;
    }
}

// Helper function to query OpenAI API
async function queryOpenAI(message) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are Moira, a compassionate mental health assistant. Respond with empathy, " +
                             "non-judgment, and care. Keep responses conversational and under 200 characters. " +
                             "Focus on active listening and emotional support. For crisis situations, " +
                             "provide appropriate resources."
                }, {
                    role: "user",
                    content: message
                }],
                temperature: 0.7,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );
        
        return response.data.choices[0]?.message?.content || getFallbackResponse();
    } catch (error) {
        console.error("OpenAI error:", error.response?.data || error.message);
        return getFallbackResponse();
    }
}

// Process Hugging Face API response
function processHuggingFaceResponse(data) {
    if (data.error) {
        if (data.error === "Model is loading") {
            return "I'm still waking up. Please try again in a few seconds.";
        }
        return null;
    }
    
    if (data.generated_text) {
        return data.generated_text;
    } 
    else if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || null;
    }
    else if (data.conversation?.generated_responses) {
        return data.conversation.generated_responses.slice(-1)[0];
    }
    
    return null;
}

// Clean up the response text
function cleanResponse(text) {
    if (!text) return getFallbackResponse();

    // Remove any bot-specific prefixes
    let cleaned = text.replace(/^\s*(bot|ai|moira|assistant):?\s*/i, '').trim();

    // Remove special tokens or weird characters
    cleaned = cleaned.replace(/<\/?s>|\[|\]|\(|\)|\*/g, '');

    // Ensure proper punctuation
    if (!/[.!?]$/.test(cleaned)) {
        cleaned += '.';
    }

    // Capitalize first letter and fix spacing
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    cleaned = cleaned.replace(/\s+([.,!?])/g, '$1');
    cleaned = cleaned.replace(/([.,!?])([a-zA-Z])/g, '$1 $2');

    return cleaned;
}

// Fallback responses when APIs fail
function getFallbackResponse() {
    const fallbacks = [
        "I want to understand better. Could you share more about what you're experiencing?",
        "That sounds important. Let me think how best to help...",
        "I hear you. Would it help if we explored this together?",
        "Thank you for sharing that with me. What would be most helpful right now?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        fallback: getFallbackResponse()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});