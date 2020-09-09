const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 5000;

// add middleware to ensure we can receive json
app.use(express.json());

// info about rooms
const rooms = new Map();

let broadcaster = {};

// after entering a room send user current online and message history
app.get('/room/:id', (req, res) => {
    const roomID = req.params["id"];
    let room;

    if (rooms.has(roomID)) {
        room = {
            'users': Array.from(rooms.get(roomID).get('users')),
            'messages': Array.from(rooms.get(roomID).get('messages').values())
        };
    } else {
        room = { 'users': new Map(), 'messages': [] };
    }

    res.json(room);
});

io.on('connection', socket => {

    // user initiates entering a room
    socket.on('join_room', ({ userName, roomID }) => {
        // create room if it was not found
        if (!rooms.has(roomID)) {
            rooms.set(
                roomID,
                new Map([
                    ['users', new Map()],
                    ['messages', []]
                ])
            );
        }

        // add new user to socket group
        socket.join(roomID);
        rooms.get(roomID).get('users').set(socket.id, userName);
        const users = Array.from(rooms.get(roomID).get('users'));

        console.log(`User ${userName} joined to room ${roomID}`);

        // emit other users
        socket.to(roomID).broadcast.emit('update_users', users);
    });

    // put new message into server and emit other room participants
    socket.on('room_new_message', ({ roomID, userName, message}) => {
        const messageObj = {
            userName,
            time: new Date().toTimeString().slice(0, 9),
            message,
            senderID: socket.id
        };

        rooms.get(roomID).get('messages').push(messageObj);
        io.in(roomID).emit('update_messages', Array.from(rooms.get(roomID).get('messages').values()));
    });

    // set broadcaster
    socket.on("broadcaster", (roomID, userName) => {
        if (!broadcaster[roomID]) {
            broadcaster[roomID] = {
                id: socket.id,
                name: userName
            }
        }
    });

    // emit broadcaster about new watcher
    socket.on("watcher", (roomID) => {
        socket.in(roomID).to(broadcaster[roomID].id).emit("watcher", socket.id);
    });

    // redirect offer to watcher
    socket.on("offer", (roomID, id, message) => {
        socket.in(roomID).to(id).emit("offer", socket.id, message);
    });

    // redirect answer to broadcaster
    socket.on("answer", (roomID, id, message) => {
        socket.in(roomID).to(broadcaster[roomID].id).emit("answer", socket.id, message);
    });

    // exchange candidates between broadcaster and watcher
    socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
    });

    // notify watchers about new broadcaster
    socket.on("broadcastInfo", (roomID) => {
        let info = {
            broadcasting: false,
            broadcasterID: null,
            broadcasterName: null
        };

        if (broadcaster[roomID]) {
            info.broadcasting = true;
            info.broadcasterID = broadcaster[roomID].id;
            info.broadcasterName = broadcaster[roomID].name;
        }

        io.in(roomID).emit("broadcastInfo", info);
    });

    // when user disconnects update room info and emit other room participants
    socket.on('disconnect', () => {
        rooms.forEach( (value, roomID) => {
            if(value.get('users').has(socket.id)) {
                const userName = value.get('users').get(socket.id);
                value.get('users').delete(socket.id);
                const users = Array.from(rooms.get(roomID).get('users'));

                console.log(`User ${userName} left room ${roomID}`);

                socket.to(roomID).broadcast.emit('update_users', users);

                // check if disconnected user was broadcaster
                if (broadcaster[roomID] && broadcaster[roomID].id === socket.id) {
                    delete broadcaster[roomID];
                } else {
                    socket.in(roomID).to(broadcaster).emit("disconnectPeer", socket.id);
                }
            }
        });
    });

    socket.on('error', (err) => {
        console.log('! Received error from client:', socket.id);
        console.log(err);
    });

});

server.listen(port, () => console.log(`Listening on port ${port}`));
