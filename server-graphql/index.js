const fs = require('fs');
const https = require('https');
const io = require('socket.io');
const express = require('express');

const schema = require('./schema');
const graphiql = require('./graphiql');
const websocket = require('./websocket');

const app = express();

app.use('/graphql', graphiql);

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app);

const wss = io(server, {
    serveClient: false,
});

wss.on('connection', websocket(wss));

server.listen(443);
