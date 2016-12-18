const fs = require('fs');
const path = require('path');
const https = require('https');

const io = require('socket.io');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');

const app = express();

app.use(webpackMiddleware(webpack({
    debug: true,
    devtool: 'inline-source-map',

    entry: [
        'babel-polyfill',
        `./app/index.js`,
    ],

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },

    output: {
        path: path.join(__dirname, 'app'),
        fileName: 'bundle.js',

        publicPath: 'https://localhost/dist/',
    },
}), {
    publicPath: 'https://localhost/dist/',
    index: 'index.html',
    stats: {
        colors: true,
    },
}));

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
            cb(err.message);
        }
    });

    socket.on('send-offer', (remote, offer, cb) => {
        try {
            const {
                sockets,
            } = wss.sockets;

            sockets[remote].emit('offer', socket.id, offer, cb);
        } catch (err) {
            console.error(err);
            cb(err.message);
        }
    });

    socket.on('send-candidate', (remote, candidate, cb) => {
        try {
            const {
                sockets,
            } = wss.sockets;

            sockets[remote].emit('candidate', socket.id, candidate, cb);
        } catch (err) {
            console.error(err);
            cb(err.message);
        }
    });
});

server.listen(443);
