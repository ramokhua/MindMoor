// Main chatbot endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        
        // First try Hugging Face
        const hfResponse = await queryHuggingFace(message, conversationHistory);
        if (hfResponse) {
            return res.json({ response: hfResponse });
        }
        
        // Fallback to OpenAI
        const openaiResponse = await queryOpenAI(message);
        return res.json({ response: openaiResponse });
        
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Error processing your message" });
    }
});

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
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
                }
            }
        );
        
        return processHuggingFaceResponse(response.data);
    } catch (error) {
        console.error("Hugging Face error:", error);
        return null;
    }
}

async function queryOpenAI(message) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are Moira, a compassionate mental health assistant. Respond with empathy, non-judgment, and care. Keep responses under 200 characters."
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
                }
            }
        );
        
        return response.data.choices[0]?.message?.content || "I'm not sure how to respond to that.";
    } catch (error) {
        console.error("OpenAI error:", error);
        return "I'm having trouble connecting to my services. Please try again later.";
    }
}

function processHuggingFaceResponse(data) {
    if (data.error) return null;
    
    if (data.generated_text) {
        return data.generated_text;
    } 
    else if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || null;
    }
    else if (data.conversation && data.conversation.generated_responses) {
        return data.conversation.generated_responses.slice(-1)[0];
    }
    
    return null;
}