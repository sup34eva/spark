const {
    graphql,
} = require('graphql');

const schema = require('../schema');

const rooms = new Map();

module.exports = wss => socket => {
    socket.on('graphql', async ({ token, data: { query, variables, operationName }}, cb) => {
        try {
            const result = await graphql(
                schema,
                query,
                { }, // Root data
                { socket, token }, // Context data
                variables,
                operationName
            );

            cb(null, result);
        } catch (err) {
            console.error(err);
            cb(err);
        }
    });

    let room = null;
    function leaveRoom() {
        if(room !== null) {
            console.log('leave room', socket.id);
            room.delete(socket.id);

            if(rooms.length === 0) {
                for (const [key, value] of rooms.entries()) {
                    if (value === room) {
                        console.log('cleaning room', key);
                        rooms.delete(key);
                        break;
                    }
                }
            }

            room = null;
        }
    }

    socket.on('start-call', (channel, cb) => {
        try {
            leaveRoom();
            if (rooms.has(channel)) {
                room = rooms.get(channel);
            } else {
                room = new Map();
                rooms.set(channel, room);
            }

            console.log('join room', channel, socket.id);
            room.set(socket.id, socket);

            cb(
                null,
                Array.from(room.keys())
                    .filter(key => key !== socket.id)
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
            room.get(remote).emit('offer', socket.id, offer, cb);
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
            room.get(remote).emit('candidate', socket.id, candidate, cb);
        } catch (err) {
            console.error(err);
            cb({
                message: err.message,
                // stack: err.stack,
            });
        }
    });

    socket.on('disconnect', () => {
        leaveRoom();
    });
};
