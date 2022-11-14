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
        // Get the username of user who has sent the message
        outputMessage(username, message);
    }
    // Raw message from client
);

var currSessionKey;
socket.on('encrypted-message', (user, encryptedMsg, hashInBase64, isMessageVerified) =>
{
    if (isMessageVerified) {
        console.log("Digital Signature is verified.");
    } else {
        console.log("Digital Signature is not verified.");
    }

    var originalText;
    if (currSessionKey == null) {
        if (user != username) { // If you're not sending the message
            currSessionKey = prompt("Enter your session key to decrypt");
            var hashedCipherTextToCheck = CryptoJS.HmacSHA256(encryptedMsg, currSessionKey).toString();

            if (hashedCipherTextToCheck == hashInBase64) {
                console.log("hashInBase64ToCheck == hashInBase64", hashedCipherTextToCheck == hashInBase64);
            }

            var bytes  = CryptoJS.AES.decrypt(encryptedMsg, currSessionKey, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            originalText = bytes.toString(CryptoJS.enc.Utf8);
            outputMessage(user, originalText);
        }
    }

    else if (currSessionKey != null) { // Already entered session key
        if (user != username) { // You're receiving messages

            var hashedCipherTextToCheck = CryptoJS.HmacSHA256(encryptedMsg, currSessionKey).toString();

            if (hashedCipherTextToCheck == hashInBase64) {
                console.log("hashInBase64ToCheck == hashInBase64", hashedCipherTextToCheck == hashInBase64);
            }

            var bytes  = CryptoJS.AES.decrypt(encryptedMsg, currSessionKey, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
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
        listOfUsernamesAndRooms = usernameAndRoom;
        addUserAndRoomTitle(listOfUsernamesAndRooms);
    }
);

socket.on('user-left', (currUserName) =>
    { 
        removeUserUponDisconnect(listOfUsernamesAndRooms, currUserName);
        
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
    var exitRoomButton = document.getElementById('exit-room-button');
    exitRoomButton.addEventListener('click', removeUser(username, room));
}

function removeUser(username, room) {
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
            sessionKey = prompt("Enter your session key to encrypt");
        } // Private session key never gets sent to the server

        const rawMessage = input.value;
        
        /*
            Encrypt message using session key before sending it the server
        */

        if (sessionKey != null) {
            var ciphertext = CryptoJS.AES.encrypt(rawMessage, sessionKey,  {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
              }).toString();
            console.log("Cipher text: ", ciphertext);
            // If you're sending the message, print it out
                outputMessage(username, rawMessage);

            var hashedCipherText = CryptoJS.HmacSHA256(ciphertext, sessionKey).toString();
            
            console.log("Hashed cipher text: ", hashedCipherText);
            socket.emit('encrypted-chat-message', ciphertext, hashedCipherText);
        }

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
    chatRoomContainer.scrollTop = chatRoomContainer.scrollHeight;
}
