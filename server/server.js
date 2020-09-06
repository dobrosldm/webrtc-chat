const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// add middleware to ensure we can receive json
app.use(express.json());

const port = 5000;

const rooms = new Map();

app.post('/rooms', (req, res) => {
    const { roomID, userName } = req.body;

    if (!rooms.has(roomID)) {
        rooms.set(
            roomID,
            new Map([
                ['users', new Map()],
                ['messages', []]
            ])
        );
    }

    console.log(rooms);
    res.send();
})

io.on('connection', client => {
    console.log(`user ${client.id} connected`)

    client.on('disconnect', () => {
        console.log('client disconnect...', client.id);
    });

    client.on('error', (err) => {
        console.log('received error from client:', client.id);
        console.log(err);
    });

});

server.listen(port, () => console.log(`Listening on port ${port}`));
