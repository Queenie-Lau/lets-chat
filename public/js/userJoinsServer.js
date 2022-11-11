// Once user joins server, add room name title and add user to list of users
function addUserAndRoomTitle() {
    const roomName = document.getElementById('room-name')
    roomName.innerHTML = 
        `
        ${room}
        `
    const userList = document.getElementById('username-list');
    var ul = document.createElement("ul");
    userList.appendChild(ul);
    ul.innerHTML = `${username}`

    console.log("Added room title and user to sidebar");
}