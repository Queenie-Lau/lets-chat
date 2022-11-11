var form = document.getElementById('chat-message-form');
var input = document.getElementById('message');
var sessionKey;

form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value) {
        if (sessionKey == null) {
            sessionKey = prompt("Please enter your secret session key (encrypt)");
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
        input.value = '';
    }

});
