

async function sendMessage() {
    const chatBotInput = document.getElementById('chatbot-input').value;
    if (!chatBotInput) return;

    // Display user message
    const chatBox = document.getElementById('chatbot-messages');
    chatBox.innerHTML += `<div class="user-message">${chatBotInput}</div>`;
    document.getElementById('chatbot-input-').value = '';

    // Call Hugging Face API
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            { inputs: chatBox },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        const botMessage = response.data.generated_text;
        chatBox.innerHTML += `<div class="bot-message">${botMessage}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }
}
