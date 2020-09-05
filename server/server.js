const express = require ("express");

const app = express();
const port = 5000;

app.get("/test", (req, res) => {
    const users = [
        {id: 0, name: 'User1'},
        {id: 1, name: 'User2'},
        {id: 2, name: 'User3'},
    ];

    res.json(users);
})

app.listen(port);