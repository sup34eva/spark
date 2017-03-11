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

const socket = io('wss://api.spark.leops.me:8443');

export class Remote {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    sendOffer(offer: Offer): Promise<Answer> {
        return wrapSignal(cb => {
            socket.emit('send-offer', this.id, offer, cb);
        });
    }

    sendCandidate(candidate: Candidate): Promise<any> {
        return wrapSignal(cb => {
            socket.emit('send-candidate', this.id, candidate, cb);
        });
    }
}

export function runQuery(data: any): Promise<any> {
    const { auth } = store.getState();
    return wrapSignal(cb => {
        socket.emit('graphql', { data, token: auth.token }, cb);
    });
}

export function subscribe(request: any) {
    const id = request.getClientSubscriptionId();
    socket.on(id, result => {
        if (result.errors) {
            result.errors
                .forEach(err => request.onError(err));
        }

        request.onNext(result.data);
    });

    return {
        request: runQuery({
            query: request.getQueryString(),
            variables: request.getVariables(),
        }),
        connection: {
            dispose() {
                // TODO: Close connection
            },
        },
    };
}

export async function joinRoom(name: string): Promise<Array<Remote>> {
    console.log('joinRoom', name);

    socket.on('offer', wrapMessage((id: string, offer: Offer) =>
        // eslint-disable-next-line flowtype-errors/show-errors
        store.dispatch(acceptOffer(new Remote(socket, id), offer))
    ));

    socket.on('candidate', wrapMessage((remote: string, candidate: Candidate) =>
        store.dispatch(handleCandidate(store, remote, candidate))
    ));

    const remotes = await wrapSignal(cb => {
        socket.emit('start-call', cb);
    });

    return remotes.map(id => new Remote(socket, id));
}
