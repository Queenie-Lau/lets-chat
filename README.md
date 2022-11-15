# Let's Chat

Simple, secure communication.

## Description

Let's Chat is a fully-encrypted messaging system that enables users to safely and securely communicate. The server accepts and forwards messages to their intended recipients, the clients are able to interact securely with the server, and the users should feel confident that they are speaking with the persons they believe they are speaking with.

## Getting Started

### Installing

* Download [Node.js](https://nodejs.org/en/download/) and follow the guided information until the installation is complete.

### Executing program

* Navigate (change directory) into the lets-chat directory in the terminal
* Run the following command

```
npm start
```
* Open two tabs on your browser
* Navigate to the following website
```
https://localhost:3000
```
* Create two usernames
* Join the same room
* Begin chatting!

### Notes
* Navigating to https://localhost:3000 will display a potential security risk ahead warning, navigate to Advanced -> Accept the Risk and Continue
- This is because I have created a self-signed certificate for the purpose of the practical (not for production)
* Each user's public (username-socketid-public.pem) and private keys (username-socketid-private.pem) are generated and stored locallyinside the "keys" sub-directory upon joining a room 
* A sessionKey.pem file inside the "keys" sub-directory will be generated upon two users entering. Once both users leave, the session key will be deleted.
- Copy and paste the contents of the session key (shared key) to encrypt and decrypt messages
* Open the console to view logged messages such as the cipher text, hashed cipher text, and whether the digital signature has been verified
