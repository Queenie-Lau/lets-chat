var form = document.getElementById('chat-message-form');
var input = document.getElementById('message');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value) {
        const rawMessage = input.value;
        /*
            TO DO: Encrypt message from current user before sending it the server
        */

        // Encrypt using raw message and session key

        // TODO: REPLACE TEMP W/ SESSION KEY => download as a file to your computer
            // modify params
        var ciphertext = CryptoJS.AES.encrypt(rawMessage, "temp");
        console.log("Cipher text: ", ciphertext.toString());
        
        // Send encrypted message to the server
        socket.emit('encrypted-chat-message', ciphertext.toString());
        input.value = '';
    }

});
