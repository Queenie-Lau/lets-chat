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

// var usernameRoomSocketID = [];
// usernameAndRoom.push({
//     username: username,
//     room: room,
//     socketID: socket.id
// });

// console.log("usernameRoomSocketID: ", usernameRoomSocketID);

socket.emit(
    'joinSelectedRoom', 
    { username, room }
);

socket.on('message', (message) => 
    { console.log(message); }
    // raw message from client
);

socket.on('usernameAndRoom' ,  (usernameAndRoom) =>
    { 
        console.log("Client side usernameAndRoom: ", usernameAndRoom);
        var listOfUsernamesAndRooms = usernameAndRoom;
        addUserAndRoomTitle(listOfUsernamesAndRooms);
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

    for (var i = 0; i < listOfUsernamesAndRooms.length; ++i) {
        var ul = document.createElement("ul");
        userList.appendChild(ul);
        ul.innerHTML = listOfUsernamesAndRooms[i].username;
    }

    console.log("Added room title and users to sidebar");
}
