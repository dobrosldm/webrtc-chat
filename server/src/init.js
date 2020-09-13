function serverInit() {
    const express = require("express");
    const http = require("http");
    const socketIO = require("socket.io");

    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);

    const port = 5000;

    // add middleware to ensure we can receive json
    app.use(express.json());

    // info about rooms
    const rooms = new Map();

    // info about broadcasters
    let broadcasters = {};

    server.listen(port, () => console.log(`Listening on port ${port}`));

    return { app, io, rooms, broadcasters };
}

module.exports = { serverInit };
