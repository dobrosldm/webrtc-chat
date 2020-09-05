const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = 5000;

app.get('/test', (req, res) => {
    const users = [
        {id: 0, name: 'User1'},
        {id: 1, name: 'User2'},
        {id: 2, name: 'User3'},
    ];

    res.json(users);

    console.log('data has been send');
});

io.on('connection', (client) => {
    console.log('a user connected');

    client.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port);