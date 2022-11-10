const express = require('express');
const path = require('path');
const http = require('http');
const application = express();
const socketio = require('socket.io');
const crypto = require('crypto');
const server = http.createServer(application);
const io = socketio(server);
var numUsers = 0;
var userAndPublicKeyDict = [];

// Set up application
application.use(express.static(path.join(__dirname, 'public')));
const PORT = 3000 || process.env.PORT;
server.listen(PORT, 
    () => console.log(`Server successfully running on port ${PORT}`)
); // Listen to the server

io.on('connection', socket => {
    socket.on('joinSelectedRoom', (({ username, room }) => {
        // Send welcome message on client side
        socket.emit('message', 'Welcome to Let\'s Chat');
        console.log('Socket ID:', socket.id);
        const currUserSocketID = socket.id;
        numUsers++;
        console.log("Number of users: ", numUsers);

        var currentUserKeyDict = createSharedKeyForUser(currUserSocketID);
        currUserDict = currentUserKeyDict;
        userAndPublicKeyDict.push({
            userObject:   currentUserKeyDict['userObject'],
            userPublicKeyBase64: currentUserKeyDict['userPublicKeyBase64'],
            userSocketID: currUserSocketID,
        });

        if (numUsers > 1) {
            const sessionKey = createSharedSessionKey(userAndPublicKeyDict);
        }

        console.log(`${username} has connected to the server.`);
        console.log(`User is in room: ${room}.`);
        }
    ))

    socket.on('disconnect', () => {
        console.log('User has disconnected');
        numUsers--;
    });

    socket.on('chat-message', (chatMessage) => {
        console.log('Message sent: ' + chatMessage);
    });


})

function createSharedKeyForUser(socketID) {
    // Each user who joins a chat room will get a generated public key
    const userECDH = crypto.createECDH('secp256k1');
    userECDH.generateKeys();
    const userPublicKeyBase64 = userECDH.getPublicKey().toString('base64');

    const usernamePublicKeyDict = {
        userObject: userECDH,
        userPublicKeyBase64: userPublicKeyBase64,
        userSocketID: socketID,
    };

    console.log("User public key: ", usernamePublicKeyDict);
    return usernamePublicKeyDict;
}

function createSharedSessionKey(usernamePublicKeyDict) {
    // Exchange and generate the shared sesison key
    const firstUser = usernamePublicKeyDict[0].userObject;
    const secondUser = usernamePublicKeyDict[1].userObject;

    const firstUserPublicKeyBase64= usernamePublicKeyDict[0].userPublicKeyBase64;
    const secondUserPublicKeyBase64= usernamePublicKeyDict[1].userPublicKeyBase64;

    console.log( {firstUser, secondUser});

    const firstUserSharedKey = 
        firstUser.computeSecret(secondUserPublicKeyBase64, 'base64', 'hex');
    const secondUserSharedKey = 
        secondUser.computeSecret(firstUserPublicKeyBase64, 'base64', 'hex');

    console.log("Shared keys should match: ", firstUserSharedKey == secondUserSharedKey);
    
    console.log("Shared key: ", firstUserSharedKey);

    return firstUserSharedKey;
}
