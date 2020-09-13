const { serverInit } = require("./init");
const { expressHandler } = require("./expressHandler");
const { socketHandler } = require("./socketHandler");

const { app, io, rooms, broadcasters } = serverInit();

expressHandler(app, rooms);

socketHandler(rooms, io, broadcasters);
