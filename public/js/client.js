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

socket.on('message', (message) => 
    { console.log(message); }
);

console.log("Emitted joinSelectedRoom");
console.log(username, room);