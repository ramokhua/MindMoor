const chatbot = {
    config: {
        apiUrl: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        apiKey: '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',
        minResponseTime: 800,
        maxResponseTime: 3000,
        fallbackApiUrl: 'https://api.openai.com/v1/chat/completions',
        fallbackApiKey: 'YOUR_OPENAI_KEY'
    },
    conversationHistory: [],
    lastMessageTime: null,
    lastUserMessage: '',
    currentExercise: null,

    // Emotional intelligence components
    emotionalResponse: {
        lastEmotion: 'neutral',
        detectEmotion: function(text) {
            const emotionKeywords = {
                happy: ['happy', 'joy', 'excited', 'good', 'great', 'relieved'],
                sad: ['sad', 'depressed', 'unhappy', 'cry', 'hopeless', 'empty'],
                angry: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'rage'],
                anxious: ['anxious', 'nervous', 'worried', 'panic', 'scared', 'fear']
            };
            
            const lowerText = text.toLowerCase();
            for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
                if (keywords.some(keyword => lowerText.includes(keyword))) {
                    this.lastEmotion = emotion;
                    return emotion;
                }
            }
            return 'neutral';
        },
        getEmotionalResponse: function(emotion) {
            const responses = {
                happy: [
                    "I'm glad to hear you're feeling good!",
                    "It's wonderful that you're feeling happy!",
                    "That's great to hear! What's contributing to your good mood?"
                ],
                sad: [
                    "I'm sorry you're feeling this way. I'm here for you.",
                    "That sounds really difficult. Would you like to talk more about how you're feeling?",
                    "I hear your pain. You're not alone in this."
                ],
                angry: [
                    "I hear your frustration. Would it help to talk through what's bothering you?",
                    "That sounds really upsetting. What might help you right now?",
                    "Anger can be overwhelming. Would breathing exercises help?"
                ],
                anxious: [
                    "Anxiety can feel paralyzing. Would grounding techniques help?",
                    "I hear how anxious you're feeling. Let's focus on one small thing that might help.",
                    "That sounds scary. Remember to breathe - you've gotten through this before."
                ],
                neutral: [
                    "Thanks for sharing that with me.",
                    "I appreciate you telling me that.",
                    "I'm listening. Please continue."
                ]
            };
            return responses[emotion][Math.floor(Math.random() * responses[emotion].length)];
        }
    },

    // Context management
    contextManager: {
        currentContext: null,
        lastContextChange: 0,
        setContext: function(message) {
            const lowerMsg = message.toLowerCase();
            const now = Date.now();
            
            // Don't change context too frequently
            if (now - this.lastContextChange < 30000 && this.currentContext) return;
            
            if (/(stress|overwhelm)/i.test(lowerMsg)) {
                this.currentContext = 'stress';
                this.lastContextChange = now;
            } else if (/(anxious|anxiety)/i.test(lowerMsg)) {
                this.currentContext = 'anxiety';
                this.lastContextChange = now;
            } else if (/(depress|sad)/i.test(lowerMsg)) {
                this.currentContext = 'depression';
                this.lastContextChange = now;
            } else if (/(lonely|alone)/i.test(lowerMsg)) {
                this.currentContext = 'loneliness';
                this.lastContextChange = now;
            }
        },
        getContextualResponse: function() {
            if (!this.currentContext) return null;
            
            const contextualFollowUps = {
                stress: [
                    "You mentioned feeling stressed earlier. How has that been since we last talked?",
                    "Regarding what you said about stress, would breathing exercises help right now?",
                    "Earlier you mentioned stress. Have you noticed any patterns in when it gets worse?"
                ],
                anxiety: [
                    "Earlier you mentioned anxiety. Would the 5-4-3-2-1 grounding technique help?",
                    "About your anxiety - have you tried any coping strategies that worked?",
                    "You mentioned anxiety before. Would it help to explore what triggers it?"
                ],
                depression: [
                    "Earlier you mentioned feeling down. Have you noticed any small moments of relief?",
                    "Regarding what you said about feeling depressed, have you reached out to anyone?",
                    "You mentioned feeling low before. What's one small thing that might help today?"
                ],
                loneliness: [
                    "You mentioned feeling lonely earlier. Have you thought about reaching out to someone?",
                    "Regarding loneliness, would joining an online community help?",
                    "Earlier you mentioned feeling alone. What activities usually make you feel connected?"
                ]
            };
            
            // Only use contextual follow-up 40% of the time to avoid being repetitive
            if (Math.random() > 0.4) return null;
            
            return contextualFollowUps[this.currentContext]?.[Math.floor(Math.random() * contextualFollowUps[this.currentContext].length)];
        }
    },

    // Memory system
    memory: {
        userDetails: {},
        facts: [],
        load: function() {
            const saved = localStorage.getItem('chatbotMemory');
            if (saved) {
                const data = JSON.parse(saved);
                this.userDetails = data.userDetails || {};
                this.facts = data.facts || [];
            }
        },
        save: function() {
            localStorage.setItem('chatbotMemory', JSON.stringify({
                userDetails: this.userDetails,
                facts: this.facts
            }));
        },
        remember: function(key, value) {
            this.userDetails[key] = value;
            this.save();
        },
        recall: function(key) {
            return this.userDetails[key];
        },
        learnFact: function(fact) {
            this.facts.push(fact);
            this.save();
        }
    },

    // Learning from interactions
    learning: {
        patterns: [],
        analyzeConversation: function(history) {
            const lastExchange = history.slice(-2);
            if (lastExchange.length === 2) {
                const [userMsg, botMsg] = lastExchange;
                if (userMsg.message.length > 15 && botMsg.message.length > 10) {
                    this.patterns.push({
                        input: userMsg.message.toLowerCase(),
                        response: botMsg.message
                    });
                }
            }
        },
        findSimilarResponse: function(input) {
            const lowerInput = input.toLowerCase();
            for (const pattern of this.patterns) {
                if (lowerInput.includes(pattern.input)) {
                    return pattern.response;
                }
            }
            return null;
        }
    },

    // Exercise management
    exerciseManager: {
        availableExercises: {
            grounding: {
                name: "5-4-3-2-1 Grounding",
                description: "A technique to help with anxiety by focusing on your senses",
                steps: [
                    "Let's begin the grounding exercise.",
                    "Name 5 things you can see around you...",
                    "Now, notice 4 things you can touch...",
                    "Listen for 3 things you can hear...",
                    "Identify 2 things you can smell...",
                    "Finally, focus on 1 thing you can taste...",
                    "Great job completing the exercise! How do you feel now?"
                ]
            },
            breathing: {
                name: "4-7-8 Breathing",
                description: "A calming breathing pattern to reduce anxiety",
                steps: [
                    "Let's try 4-7-8 breathing.",
                    "Breathe in quietly through your nose for 4 seconds...",
                    "Hold your breath for 7 seconds...",
                    "Exhale completely through your mouth for 8 seconds...",
                    "Let's repeat that 3 more times...",
                    "Excellent! How does your body feel now?"
                ]
            }
        },
        startExercise: function(exerciseName) {
            this.currentExercise = {
                name: exerciseName,
                steps: [...this.availableExercises[exerciseName].steps],
                currentStep: 0
            };
            return this.currentExercise.steps[0];
        },
        nextStep: function() {
            if (!this.currentExercise) return null;
            
            this.currentExercise.currentStep++;
            if (this.currentExercise.currentStep >= this.currentExercise.steps.length) {
                const completedExercise = this.currentExercise.name;
                this.currentExercise = null;
                return {
                    message: `You've completed the ${completedExercise} exercise! How do you feel now?`,
                    completed: true
                };
            }
            return {
                message: this.currentExercise.steps[this.currentExercise.currentStep],
                completed: false
            };
        }
    },

    // Initialize the chatbot
    init: function() {
        if (!document.getElementById('send-message')) return;

        // Load memory
        this.memory.load();

        // Event listeners
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Welcome message
        setTimeout(() => {
            const name = this.memory.recall('name');
            if (name) {
                this.addMessage('bot', `Welcome back, ${name}! How can I support you today?`);
            } else {
                this.addMessage('bot', "Hello! I'm Moira, your mental health companion. How can I help you today?");
            }
        }, 1000);
    },

    // Main message handling
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

        // Handle exercise continuation first
        if (this.exerciseManager.currentExercise) {
            const exerciseResponse = this.handleExerciseContinuation(message);
            if (exerciseResponse) {
                setTimeout(() => {
                    this.hideTypingIndicator(typingIndicator);
                    this.addMessage('bot', exerciseResponse);
                    this.conversationHistory.push({ sender: 'bot', message: exerciseResponse });
                }, delay);
                return;
            }
        }

        // Check for crisis keywords immediately
        if (this.checkForCrisis(message)) {
            setTimeout(() => {
                this.hideTypingIndicator(typingIndicator);
                const crisisResponse = this.getCrisisResponse();
                this.addMessage('bot', crisisResponse);
                this.conversationHistory.push({ sender: 'bot', message: crisisResponse });
            }, delay);
            return;
        }

        // Analyze emotion
        const emotion = this.emotionalResponse.detectEmotion(message);
        const emotionalResponse = this.emotionalResponse.getEmotionalResponse(emotion);

        // Set context
        this.contextManager.setContext(message);

        // Try learned responses
        const learnedResponse = this.learning.findSimilarResponse(message);
        if (learnedResponse && Math.random() > 0.5) {
            setTimeout(() => {
                this.hideTypingIndicator(typingIndicator);
                this.addMessage('bot', learnedResponse);
                this.conversationHistory.push({ sender: 'bot', message: learnedResponse });
                this.learning.analyzeConversation(this.conversationHistory);
            }, delay);
            return;
        }

        // Check for keywords
        const keywordResponse = this.getKeywordResponse(message);
        if (keywordResponse) {
            setTimeout(() => {
                this.hideTypingIndicator(typingIndicator);
                this.addMessage('bot', keywordResponse);
                this.conversationHistory.push({ sender: 'bot', message: keywordResponse });
                this.learning.analyzeConversation(this.conversationHistory);
            }, delay);
            return;
        }

        // Try contextual follow-up
        const contextualResponse = this.contextManager.getContextualResponse();
        if (contextualResponse) {
            setTimeout(() => {
                this.hideTypingIndicator(typingIndicator);
                this.addMessage('bot', contextualResponse);
                this.conversationHistory.push({ sender: 'bot', message: contextualResponse });
                this.learning.analyzeConversation(this.conversationHistory);
            }, delay);
            return;
        }

        // Get AI response
        this.getAIResponse(message)
            .then(response => {
                // Combine AI response with emotional response if appropriate
                let fullResponse = response;
                if (emotion !== 'neutral' && Math.random() > 0.5) {
                    fullResponse = `${emotionalResponse} ${response}`;
                }

                setTimeout(() => {
                    this.hideTypingIndicator(typingIndicator);
                    this.addMessage('bot', fullResponse);
                    this.conversationHistory.push({ sender: 'bot', message: fullResponse });
                    this.learning.analyzeConversation(this.conversationHistory);
                }, delay);
            })
            .catch(error => {
                console.error("Chatbot error:", error);
                this.hideTypingIndicator(typingIndicator);
                const fallback = this.getFallbackResponse();
                this.addMessage('bot', fallback);
                this.conversationHistory.push({ sender: 'bot', message: fallback });
            });
    },

    // Handle exercise continuation
    handleExerciseContinuation: function(message) {
        if (!this.exerciseManager.currentExercise) return null;
        
        // Check if user wants to stop
        if (/(stop|quit|end|no)/i.test(message.toLowerCase())) {
            this.exerciseManager.currentExercise = null;
            return "Okay, we've stopped the exercise. Would you like to try something else?";
        }
        
        // Continue exercise
        const nextStep = this.exerciseManager.nextStep();
        if (nextStep.completed) {
            // Exercise completed - suggest mood tracking
            return `${nextStep.message} Would you like to <a href="../mood/mood-tracker.html" style="color: #5d93a6; text-decoration: underline;">track your mood</a> now?`;
        }
        return nextStep.message;
    },

    // Crisis detection and response
    checkForCrisis: function(message) {
        const crisisKeywords = [
            'suicide', 'suicidal', 'kill myself', 'end it all', 
            'self harm', 'self-harm', 'want to die', 'can\'t go on'
        ];
        const lowerMsg = message.toLowerCase();
        return crisisKeywords.some(keyword => lowerMsg.includes(keyword));
    },

    getCrisisResponse: function() {
        return `I'm really concerned about what you're sharing. Your life is valuable and help is available. 
                Please contact your local crisis hotline immediately. You're not alone in this. 
                <br><br>
                <strong>US National Suicide Prevention Lifeline:</strong> 988
                <br>
                <strong>Crisis Text Line:</strong> Text HOME to 741741
                <br><br>
                Would you like me to help you find more resources?`;
    },

    // Keyword responses
    getKeywordResponse: function(message) {
        const lowerMsg = message.toLowerCase();

        // Name detection
        if (/(my name is|I am|I'm) (\w+)/i.test(message)) {
            const name = message.match(/(my name is|I am|I'm) (\w+)/i)[2];
            this.memory.remember('name', name);
            return `Nice to meet you, ${name}! How can I help you today?`;
        }

        // Greetings
        if (/(hi|hey|hello|greetings)/i.test(lowerMsg)) {
            return this.getGreetingsResponse();
        }

        // Exercises
        if (/(grounding exercise|54321|5-4-3-2-1)/i.test(lowerMsg)) {
            return this.exerciseManager.startExercise('grounding');
        }

        if (/(breathing exercise|calm down|478|4-7-8)/i.test(lowerMsg)) {
            return this.exerciseManager.startExercise('breathing');
        }

        // Common mental health topics
        if (/(stress|overwhelm|overwhelmed)/i.test(lowerMsg)) {
            return this.getStressResponse();
        }

        if (/(anxious|anxiety|nervous|worried|panic)/i.test(lowerMsg)) {
            return this.getAnxietyResponse();
        }

        if (/(depress|sad|miserable|down|low)/i.test(lowerMsg)) {
            return this.getDepressionResponse();
        }

        if (/(lonely|alone|isolated)/i.test(lowerMsg)) {
            return this.getLonelinessResponse();
        }

        if (/(sleep|insomnia|tired|can't sleep)/i.test(lowerMsg)) {
            return this.getSleepResponse();
        }

        if (/(anger|angry|frustrated|irritated)/i.test(lowerMsg)) {
            return this.getAngerResponse();
        }

        // Resources
        if (/(resources|help|support|therapy)/i.test(lowerMsg)) {
            return this.getResourceResponse();
        }

        return null;
    },

    getGreetingsResponse: function() {
        const name = this.memory.recall('name');
        const options = name ? [
            `How can I help you today, ${name}?`,
            `What's on your mind, ${name}?`,
            `How are you feeling today, ${name}?`
        ] : [
            "How can I help you today?",
            "What would you like to talk about?",
            "I'm here to listen. What's on your mind?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getStressResponse: function() {
        const options = [
            "Stress can feel overwhelming. Would you like to try a grounding exercise or talk through what's bothering you?",
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

    getDepressionResponse: function() {
        const options = [
            "I'm sorry you're feeling this way. Depression can make everything feel heavy. Would you like to talk about what might help you today?",
            "That sounds really hard. When depression feels overwhelming, sometimes just getting through the day is enough. Be gentle with yourself.",
            "I hear how much you're struggling. Would it help to think of one small thing that usually brings you comfort, even just a little?"
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

    getSleepResponse: function() {
        const options = [
            "Sleep difficulties can really affect your wellbeing. Have you tried establishing a relaxing bedtime routine?",
            "Trouble sleeping is common with stress. Would you like some tips for better sleep hygiene?",
            "I hear you're having sleep problems. Sometimes writing down worries before bed can help quiet the mind."
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getAngerResponse: function() {
        const options = [
            "Anger can feel overwhelming. Would taking some deep breaths help right now?",
            "I hear your frustration. Sometimes counting to 10 slowly can help create space to respond rather than react.",
            "That sounds really upsetting. What might help you feel calmer in this moment?"
        ];
        return options[Math.floor(Math.random() * options.length)];
    },

    getResourceResponse: function() {
        return `Here are some resources that might help:
                <br><br>
                <strong>Free CBT Resources:</strong> <a href="../cbt/cbt.html" style="color: #5d93a6;">Cognitive Behavioral Therapy materials</a>
                <br>
                <strong>Breathing Exercises:</strong> <a href="../exercises/breathing.html" style="color: #5d93a6;">Guided breathing techniques</a>
                <br>
                <strong>Journaling:</strong> <a href="../diary/journal.html" style="color: #5d93a6;">Thought record journal</a>
                <br><br>
                Would you like help finding something specific?`;
    },

    // AI response handling
    getAIResponse: async function(userMessage) {
        try {
            // First try main API
            const response = await this.queryMainAPI(userMessage);
            if (response && response.length > 15) return response;
            
            // Fallback to secondary API if main fails
            const fallbackResponse = await this.queryFallbackAPI(userMessage);
            if (fallbackResponse) return fallbackResponse;
            
            // Final fallback
            return this.getFallbackResponse();
        } catch (error) {
            console.error("API Error:", error);
            return this.getFallbackResponse();
        }
    },

    queryMainAPI: async function(userMessage) {
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
                            .slice(-3)
                            .map(m => m.message),
                        generated_responses: this.conversationHistory
                            .filter(m => m.sender === 'bot')
                            .slice(-3)
                            .map(m => m.message),
                        text: userMessage
                    },
                    parameters: {
                        return_full_text: false,
                        max_length: 200,
                        temperature: 0.7
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
            console.error("Main API Error:", error);
            return null;
        }
    },

    queryFallbackAPI: async function(userMessage) {
        try {
            const response = await fetch(this.config.fallbackApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.fallbackApiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: "You are Moira, a compassionate mental health assistant. Respond with empathy, " +
                                 "non-judgment, and care. Keep responses under 200 characters. " +
                                 "Focus on active listening and emotional support."
                    }, {
                        role: "user",
                        content: userMessage
                    }],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });
            
            const data = await response.json();
            return data.choices[0]?.message?.content || '';
        } catch (error) {
            console.error("Fallback API Error:", error);
            return null;
        }
    },

    processResponse: function(data) {
        if (data.error) {
            console.error("API Error:", data.error);
            return this.getFallbackResponse();
        }

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

    // UI functions
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