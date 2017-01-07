const fs = require('fs');
const path = require('path');
const https = require('https');

const io = require('socket.io');
const express = require('express');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const config = require('./webpack.config');
const compiler = webpack(config);

const app = express();

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
    },
}));

app.use(webpackHotMiddleware(compiler));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app/index.html'));
});

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app);

const wss = io(server, {
    serveClient: false,
});

wss.on('connection', socket => {
    console.log('connection', socket.id);

    socket.on('start-call', cb => {
        try {
            const {
                sockets,
            } = wss.sockets;

            cb(
                null,
                Object.keys(sockets)
                    .filter(remote => remote !== socket.id)
            );
        } catch (err) {
            console.error(err);
            cb({
                message: err.message,
                // stack: err.stack,
            });
        }
    });

    socket.on('send-offer', (remote, offer, cb) => {
        try {
            wss.sockets.connected[remote].emit('offer', socket.id, offer, cb);
        } catch (err) {
            console.error(err);
            cb({
                message: err.message,
                // stack: err.stack,
            });
        }
    });

    socket.on('send-candidate', (remote, candidate, cb) => {
        try {
            wss.sockets.connected[remote].emit('candidate', socket.id, candidate, cb);
        } catch (err) {
            console.error(err);
            cb({
                message: err.message,
                // stack: err.stack,
            });
        }
    });
});

server.listen(443);
