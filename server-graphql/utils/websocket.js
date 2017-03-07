const {
    graphql,
} = require('graphql');

const schema = require('../schema');

module.exports = wss => socket => {
    socket.on('graphql', ({ token, data: { query, variables, operationName }}, cb) => {
        graphql(
            schema,
            query,
            { }, // Root data
            { socket, token }, // Context data
            variables,
            operationName
        )
        .then(result => cb(null, result))
        .catch(err => cb(err));
    });

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
};
