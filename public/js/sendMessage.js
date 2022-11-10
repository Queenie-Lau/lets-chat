var form = document.getElementById('chat-message-form');
var input = document.getElementById('message');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {

    const rawMessage = input.value;

    /*
        TO DO: Encrypt message from current user before sending it the server
    */

    var ciphertext = CryptoJS.SHA512("Message"); 
    console.log("Went in here: ", ciphertext);
    
    // socket.emit('chat-message', input.value);
    input.value = '';
  }
});
