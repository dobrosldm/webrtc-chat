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

// after entering a room send user current online and message history
app.get('/room/:id', (req, res) => {
    const roomID = req.params["id"];
    let room;

    if (rooms.has(roomID)) {
        room = {
            'users': Array.from(rooms.get(roomID).get('users').values()),
            'messages': Array.from(rooms.get(roomID).get('messages').values())
        };
    } else {
        room = { 'users': [], 'messages': [] };
    }

    res.json(room);
});

io.on('connection', socket => {
    console.log(`user ${socket.id} connected`);

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

        // emit other users
        socket.join(roomID);
        rooms.get(roomID).get('users').set(socket.id, userName);
        const users = Array.from(rooms.get(roomID).get('users').values());
        socket.to(roomID).broadcast.emit('update_users', users);
    });

    // put new message into room and emit other participants
    socket.on('room_new_message', ({ roomID, userName, message}) => {
        const date = new Date();
        const messageObj = {
            userName,
            time: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
            message
        };

        rooms.get(roomID).get('messages').push(messageObj);
        io.in(roomID).emit('update_messages', Array.from(rooms.get(roomID).get('messages').values()));
    });

    socket.on('disconnect', () => {
        console.log('client disconnect...', socket.id);
    });

    socket.on('error', (err) => {
        console.log('received error from client:', socket.id);
        console.log(err);
    });

});

server.listen(port, () => console.log(`Listening on port ${port}`));
