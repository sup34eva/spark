// @flow
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

import type {
    Candidate,
    Offer,
    Answer,
} from './rtc';

export class Remote {
    id: string;
    socket: io;

    constructor(socket: io, id: string) {
        this.socket = socket;
        this.id = id;
    }

    sendOffer(offer: Offer): Promise<Answer> {
        return wrapSignal(cb => {
            this.socket.emit('send-offer', this.id, offer, cb);
        });
    }

    sendCandidate(candidate: Candidate): Promise<any> {
        return wrapSignal(cb => {
            this.socket.emit('send-candidate', this.id, candidate, cb);
        });
    }
}

export function joinRoom(name: string): Promise<Array<Remote>> {
    console.log('name', name);

    const socket = io(
        `wss://${document.location.host || 'localhost'}:443`
    );

    socket.on('offer', wrapMessage((id: string, offer: Offer) =>
        store.dispatch(acceptOffer(new Remote(socket, id), offer))
    ));

    socket.on('candidate', wrapMessage((remote: string, candidate: Candidate) =>
        store.dispatch(handleCandidate(store, remote, candidate))
    ));

    return wrapSignal(cb => {
        socket.emit('start-call', cb);
    }).then(remotes =>
        remotes.map(id => new Remote(socket, id))
    );
}
