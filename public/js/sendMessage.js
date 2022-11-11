const form = document.getElementById('chat-message-form');
var input = document.getElementById('message');
const chatRoomContainer = document.querySelector('.chat-room-container');
var sessionKey;

form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value) {
        if (sessionKey == null) {
            // sessionKey = prompt("Please enter your secret session key (encrypt)");
        } // Private session key never gets sent to the server

        const rawMessage = input.value;
        /*
            TO DO: Encrypt message from current user before sending it the server
        */
        // Encrypt using raw message and session key
        if (sessionKey != null && input.value != null) {
            var ciphertext = CryptoJS.AES.encrypt(rawMessage, sessionKey);
            console.log("Cipher text: ", ciphertext.toString());
            
            // Send encrypted message to the server
            socket.emit('encrypted-chat-message', ciphertext.toString());
        }
        outputMessage(rawMessage);
        input.value = '';
    }
    input.focus();

    // Automatically scroll down to each new message
    chatRoomContainer.scrollTop = chatRoomContainer.scrollHeight;
});

// Send message to DOM
function outputMessage(encryptedMsg) {
    const div = document.createElement('div');
    div.classList.add('chat-message');
    div.innerHTML = 
    `
    <p id="encrypted-msg">
    ${encryptedMsg}
    </p>`
    document.querySelector('.chat-message').appendChild(div);
    console.log("Added message to website");
}