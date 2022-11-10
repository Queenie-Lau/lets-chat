var form = document.getElementById('chat-message-form');
var input = document.getElementById('message');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    /*
        TO DO: Encrypt message before sending it the server
    */
    // socket.emit('chat-message', input.value);
    input.value = '';
  }
});
