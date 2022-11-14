const express = require('express');
const path = require('path');
const https = require('https');
const application = express();
const socketio = require('socket.io');
var fs = require( 'fs' );
const crypto = require('crypto');

// Set up application
var credentials = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem')),
};

const server = https.createServer(credentials, application);
const io = socketio(server);

application.use(express.static(path.join(__dirname, 'public')));
const PORT = 3000 || process.env.PORT;

server.listen(PORT, 
    () => console.log(`Server successfully running on port ${PORT}`)
); // Listen to the server

var numUsers = 0;
var userAndPublicKeyDict = [];
var sessionKey;

var usernameAndRoom = [];
var currUsername;
var currRoom;

io.on('connection', socket => {
    socket.on('joinSelectedRoom', (({ username, room }) => {
        // Send welcome message on client side
        socket.join(room);
        socket.emit('bot-message', 'Welcome to Let\'s Chat');
        numUsers++;
        const currUserSocketID = socket.id;

        socket.broadcast
            .to(room)
            .emit('bot-message',`${username} has joined the room.`);
        
        currUsername = username;
        currRoom = room;
        var currentUserKeyDict = createSharedKeyForUser(currUserSocketID);

        currUserDict = currentUserKeyDict;
        userAndPublicKeyDict.push({
            userObject:   currentUserKeyDict['userObject'],
            userPublicKeyBase64: currentUserKeyDict['userPublicKeyBase64'],
            userSocketID: currUserSocketID,
        });

        usernameAndRoom.push({
            username: username,
            room: room,
        });
        
        // Send username and room to client
        io.emit('usernameAndRoom' ,  usernameAndRoom);
        
        // Get user public key from client
        socket.on('userAndPublicKeyDict', userAndPublicKeyDict => {
            userAndPublicKeyDict = userAndPublicKeyDict;
        });

        writePubAndPrivKeyToFile(currentUserKeyDict);

        if (numUsers > 1) {
            sessionKey = createSharedSessionKey(userAndPublicKeyDict);
            console.log("Created session key");
        }

        socket.on('receivedChatMsg', chatMsg => {
            io.to(room).emit('message', username, chatMsg);
        });

        socket.on('encrypted-chat-message', (encryptedMessage, hashInBase64) => {
            var encryptedMsg = encryptedMessage.toString();
            console.log('Server received encrypted chat message: ', encryptedMsg); 
            io.to(room).emit('encrypted-message', username, encryptedMsg, hashInBase64);
        });

        }
    ))

    socket.on('disconnect', () => {
        console.log(`${currUsername} has disconnected`);
        // Tell the client who left the room
        io.emit('user-left' , currUsername);
        const userToRemove = [currUsername];
        usernameAndRoom = usernameAndRoom.filter(obj => !userToRemove.includes(obj.username));

        socket.broadcast
            .to(currRoom)
            .emit('bot-message',`${currUsername} has left the room.`);

        if (numUsers > 0) {
            numUsers--;
        }

        if (numUsers == 0) {
            if (fs.existsSync(path.join(__dirname, 'sessionKey.txt'))) {
                deleteSessionKeyFile();
            }
        }
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

    return usernamePublicKeyDict;
}

function writePubAndPrivKeyToFile(userDict) {
    var user = userDict['userObject'];
    var publicKeyFileName = currUsername + "-" + userDict['userSocketID'] + "-" + "public.pem";
    var privateKeyFileName = currUsername + "-" + userDict['userSocketID'] + "-" + "private.pem";
    fs.writeFileSync(path.join(__dirname, "keys", publicKeyFileName), user.getPublicKey().toString('base64'));
    fs.writeFileSync(path.join(__dirname, "keys", privateKeyFileName), user.getPrivateKey().toString('base64'));
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

    console.log("firstUserSharedKey == secondUserSharedKey", firstUserSharedKey == secondUserSharedKey);
    
    writeSessionKeyToFile(firstUserSharedKey.toString());

    return firstUserSharedKey;
}


function writeSessionKeyToFile(sessionKey) {
    fs.writeFile(path.join(__dirname, 'keys', 'sessionKey.pem'), sessionKey, err => {
    console.log("Wrote sessionKey to file");
    if (err) 
    {
        console.error(err);
    }
        // Session key written written successfully
    });
}

function deleteSessionKeyFile() {
    // Delete session key file: sessionKey.tx
    fs.unlink(path.join(__dirname, 'sessionKey.txt'), function (err) {
        if (err) throw err;
        // File has been deleted successfully
        console.log('Session key file deleted');
    });
}