module.exports.expressHandler = function(app, rooms) {
    // after entering a room send user current online and message history
    app.get('/room/:id', (req, res) => {
        const roomID = req.params.id;
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
};
