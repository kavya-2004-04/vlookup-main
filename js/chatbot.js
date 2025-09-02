document.addEventListener('DOMContentLoaded', function() {
    const chatbotHTML = `
        <div id="chatbot-container" class="chatbot-container">
            <div class="chatbot-box">
                <div class="chatbot-header"><h3 class="chatbot-header-title">VlookUp Assistant</h3><button id="chatbot-close" class="chatbot-close">&times;</button></div>
                <div id="chat-messages" class="chatbot-body"></div>
                <div class="chatbot-input-section">
                    <input type="text" id="user-input" placeholder="Type your message..." class="chatbot-input">
                    <button id="send-button" class="chatbot-send-btn"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
        <button id="chatbot-toggle" class="chatbot-toggle-button"><i class="fas fa-headset"></i></button>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const toggleButton = document.getElementById('chatbot-toggle');
    const chatbot = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('chatbot-close');
    let currentContext = null;

    function showBotMessage(botData) {
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'chatbot-message bot';
        botMessageElement.innerHTML = botData.reply.replace(/\n/g, '<br>');
        chatMessages.appendChild(botMessageElement);

        if (botData.options && botData.options.length > 0) {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'chatbot-options-container'; 
            botData.options.forEach(optionText => {
                const optionElement = document.createElement('div');
                optionElement.className = 'chatbot-message bot chatbot-option-message';
                optionElement.textContent = optionText;
                optionElement.onclick = () => {
                    sendMessage(optionText);
                    optionsContainer.remove(); 
                };
                optionsContainer.appendChild(optionElement);
            });
            chatMessages.appendChild(optionsContainer);
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showUserMessage(message) {
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'chatbot-message user';
        userMessageElement.textContent = message;
        chatMessages.appendChild(userMessageElement);
    }

    async function sendMessage(messageText, isInitialCall = false) {
        const message = messageText || userInput.value.trim();
        if (!message) return;

        // --- THIS IS THE NEW FEATURE ---
        // Check for 'clear chat' or 'new chat' commands before sending to server
        const clearCommands = ['clear chat', 'new chat'];
        if (clearCommands.includes(message.toLowerCase())) {
            startChat(); // This function resets the entire conversation
            userInput.value = ''; // Clear the input field
            return; // Stop the function here so "clear chat" isn't sent to the server
        }
        // --- END OF NEW FEATURE ---

        if (!isInitialCall) {
            showUserMessage(message);
        }
        userInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chatbot-message bot typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
                        const response = await fetch('https://chatbot-backend-p3od.onrender.com/chat', { // Changed from 'http://localhost:5000/chat'
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message, context: currentContext }),
            });
            const data = await response.json();
            currentContext = data.newContext; 
            chatMessages.removeChild(typingIndicator);
            showBotMessage(data);
        } catch (error) {
            chatMessages.removeChild(typingIndicator);
            showBotMessage({ reply: 'Oops! Cannot connect to the server. Please try again later.' });
        }
    }
    
    function startChat() {
        chatMessages.innerHTML = '';
        currentContext = null;
        sendMessage('hi', true); 
    }

    sendButton.addEventListener('click', () => sendMessage());
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }});
    toggleButton.addEventListener('click', () => {
        const isHidden = chatbot.style.display === 'none' || chatbot.style.display === '';
        chatbot.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) userInput.focus();
    });
    closeBtn.addEventListener('click', () => { chatbot.style.display = 'none'; });

    startChat();
});