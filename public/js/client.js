/* 
    Source: https://www.youtube.com/watch?v=jD7FnbI76Hg
    Referenced the above source to learn how sockets work,
    and used snippet of code to retrieve username and room
*/

// Get username and room from URL
const { username, room } = Qs.parse(
    location.search, 
    { ignoreQueryPrefix: true });

/** Client Side 
    Enter chatroom - send 'person' object with username and room => server side
*/

const socket = io();

socket.emit(
    'joinSelectedRoom', 
    { username, room }
);

socket.on('message', (username, message) => 
    { 
        console.log(message);
        // Get the username of user who has sent the message
        outputMessage(username, message);
    }
    // raw message from client
);

socket.on('bot-message', (botMsg) => 
{
    outputMessage("Let's Chat Bot", botMsg);
})

var listOfUsernamesAndRooms;
socket.on('usernameAndRoom' , (usernameAndRoom) =>
    { 
        console.log("Client side usernameAndRoom: ", usernameAndRoom);
        listOfUsernamesAndRooms = usernameAndRoom;
        addUserAndRoomTitle(listOfUsernamesAndRooms);
    }
);

socket.on('user-left', (currUserName) =>
    { 
        console.log("Removing the following from user list: ", currUserName)
        removeUserUponDisconnect(listOfUsernamesAndRooms, currUserName)
    }
);

console.log("Emitted joinSelectedRoom");
console.log(username, room);

socket.on('encrypted-msg-to-client', (encryptedMsg) =>
    {
        // TO DO: ENABLE DECRYPTION TO MESSAGES NOT RECEIVED BY YOU
        
        console.log("Client has received encrypted msg: ", encryptedMsg);
        var sessionKey;
        if (sessionKey == null) {
            // sessionKey = prompt("Please enter your secret session key (decrypt)");
        }

        // Decrypt password using shared session key
        var decryptedMessage = CryptoJS.AES.decrypt(encryptedMsg, sessionKey)
            .toString(CryptoJS.enc.Utf8);
            console.log("Decrypted message: ", decryptedMessage);
    }
);

// Once user joins server, add room name title and add user to list of users
function addUserAndRoomTitle(listOfUsernamesAndRooms) {
    const roomName = document.getElementById('room-name')
    roomName.innerHTML = 
        `
        ${room}
        `
    const userList = document.getElementById('username-list');
    userList.innerHTML = '';
    
    for (var i = 0; i < listOfUsernamesAndRooms.length; ++i) {
        if (listOfUsernamesAndRooms[i].room == room) {
            // If user is still in the room
            var ul = document.createElement("ul");
            userList.appendChild(ul);
            ul.innerHTML = listOfUsernamesAndRooms[i].username;
        }
    }

    console.log("Added room title and users to sidebar");
}

function removeUserUponDisconnect(listOfUsernamesAndRooms, username) {
    const userList = document.getElementById('username-list');
    for (var i = 0; i < listOfUsernamesAndRooms.length; ++i) {
        if (listOfUsernamesAndRooms[i].room == room) {
            var ulElement = userList.children[i];
            if (ulElement.innerHTML == username.toString()) {
                userList.removeChild(ulElement);
                console.log(`Removed ${username} from user list`);
            }
        }
    }
}

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


        //  CREATE USER OBJECT W/ EACH SUBMISSION
        socket.emit('receivedChatMsg', rawMessage);
        
        // outputMessage(rawMessage);
        input.value = '';
    }
    input.focus();

    // Automatically scroll down to each new message
    chatRoomContainer.scrollTop = chatRoomContainer.scrollHeight;
});

function userObject(username, message) {
    const date = new Date();
    timestamp = date.getDate();
    return {
        username,
        message,
        timestamp,
    }
};

// Send message to DOM
function outputMessage(username, encryptedMsg) {

    var secondDiv = document.createElement('div');
    var time = new Date();
    var currentTime = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    
    secondDiv.classList.add('user-timestamp-container');
    secondDiv.innerHTML = 
    `
    <h3 class="username">${username}</h3>
    <p class="timestamp">${currentTime}</p>
    `  
    document.querySelector('.chat-room-container').appendChild(secondDiv);

    var div = document.createElement('div');
    div.classList.add('chat-message');
    div.innerHTML = 
    `
    <p id="encrypted-msg">${encryptedMsg}</p>`
    document.querySelector('.chat-room-container').appendChild(div);
    console.log("Added outputMessage to website");
}
