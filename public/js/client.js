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
    // Raw message from client
);

var currSessionKey;
socket.on('encrypted-message', (user, encryptedMsg) =>
{
    console.log("Encrypted msg");
    console.log(user, encryptedMsg);
    console.log(`Sender ${user} and recipient ${username}`);

    var originalText;
    if (currSessionKey == null) {
        if (user != username) { // If you're not sending the message
            currSessionKey = prompt("Enter your session key to decrypt");
            var bytes  = CryptoJS.DES.decrypt(encryptedMsg, currSessionKey);
            originalText = bytes.toString(CryptoJS.enc.Utf8);
            outputMessage(user, originalText);
        }
    }

    else if (currSessionKey != null) { // Already entered session key
        if (user != username) { // You're receiving messages
            var bytes  = CryptoJS.DES.decrypt(encryptedMsg, currSessionKey);
            originalText = bytes.toString(CryptoJS.enc.Utf8);
            outputMessage(user, originalText);
        }
    }
})

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
        console.log("Removing the following from user list: ", currUserName);
        removeUserUponDisconnect(listOfUsernamesAndRooms, currUserName);
        
    }
);

console.log("Emitted joinSelectedRoom");
console.log(username, room);

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
    var exitRoomButton = document.getElementById('exit-room-button');
    exitRoomButton.addEventListener('click', removeUser(username, room));

    console.log("Added room title and users to sidebar");
}

function removeUser(username, room) {
    console.log("Remove user from room: ", room);

    socket.emit(
        'user-left-via-exit-room-button', 
        { username, room }
    );
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
            sessionKey = prompt("Please enter your secret session key");
        } // Private session key never gets sent to the server

        const rawMessage = input.value;
        /*
        Encrypt message from current user before sending it the server
        */
        // Encrypt using raw message and session key
        if (sessionKey != null) {
            var ciphertext = CryptoJS.DES.encrypt(rawMessage, sessionKey).toString();
            console.log("Cipher text: ", ciphertext);
             // If you're sending the message, print it out
            outputMessage(username, rawMessage);
            // Send encrypted message to the server
            socket.emit('encrypted-chat-message', ciphertext);
        }

        // Raw Message (Testing)
            // socket.emit('receivedChatMsg', rawMessage);
    
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
