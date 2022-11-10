const express = require('express');
const path = require('path');
const http = require('http');
const application = express();
const socketio = require('socket.io');
const crypto = require('crypto');
const server = http.createServer(application);
const io = socketio(server);

// Set up application
application.use(express.static(path.join(__dirname, 'public')));
const PORT = 3000 || process.env.PORT;
server.listen(PORT, 
    () => console.log(`Server successfully running on port ${PORT}`)
); // Listen to the server

