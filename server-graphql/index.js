require('dotenv').config();

const fs = require('fs');
const spdy = require('spdy');
const io = require('socket.io');
const express = require('express');

const schema = require('./schema');
const graphiql = require('./utils/graphiql');
const websocket = require('./utils/websocket');

const app = express();

if(process.env.NODE_ENV !== 'production') {
    app.use(graphiql);
}

const server = spdy.createServer({
    key: fs.readFileSync('../key.pem'),
    cert: fs.readFileSync('../cert.pem'),
}, app);

const wss = io(server, {
    serveClient: false,
});

wss.on('connection', websocket(wss));

const port = process.env.PORT || 8443;
server.listen(port, () => {
    console.log('Listening on port ' + port);
});
