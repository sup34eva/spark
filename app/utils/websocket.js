import io from 'socket.io-client';

import {
    wrapMessage,
    wrapSignal,
} from './index';

import {
    acceptOffer,
    handleCandidate,
} from '../actions/stream';
import store from '../store';

const socket = io(
    `wss://${document.location.host || 'localhost'}:443`
);

socket.on('offer', wrapMessage((remote, offer) => {
    return store.dispatch(acceptOffer(remote, offer));
}));

socket.on('candidate', wrapMessage((remote, candidate) => {
    return store.dispatch(handleCandidate(store, remote, candidate));
}));

export function startCall() {
    return wrapSignal(cb => {
        socket.emit('start-call', cb);
    });
}

export function sendOffer(remote, offer) {
    return wrapSignal(cb => {
        socket.emit('send-offer', remote, offer, cb);
    });
}

export function sendCandidate(remote, candidate) {
    return wrapSignal(cb => {
        socket.emit('send-candidate', remote, candidate, cb);
    });
}
