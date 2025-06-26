const apiKey: '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';

async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;

    // Display user message
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    document.getElementById('user-input').value = '';

    // Call Hugging Face API
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            { inputs: userInput },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );

        const botMessage = response.data.generated_text;
        chatBox.innerHTML += `<div class="bot-message">${botMessage}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
    }
}
