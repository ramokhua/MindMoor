const apiKey: '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';

async function sendMessage() {
    const chatBotInput = document.getElementById('chatbot-input').value;
    if (!chatBotInput) return;

    // Display user message
    const chatbotInputContainer = document.getElementById('chatbot-input-container');
    chatBox.innerHTML += `<div class="user-message">${chatBotInput}</div>`;
    document.getElementById('chatbot-input-container').value = '';

    // Call Hugging Face API
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            { inputs: chatBotInput },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        const botMessage = response.data.generated_text;
        chatbotInputContainer.innerHTML += `<div class="bot-message">${botMessage}</div>`;
        chatbotInputContainer.scrollTop = chatbotInputContainer.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }
}
