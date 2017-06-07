// @flow
import io from 'socket.io-client';

import {
    acceptOffer,
    handleCandidate,
} from 'actions/chat';

import store from '../store';

import type {
    Candidate,
    Offer,
    Answer,
} from './rtc';
import {
    wrapMessage,
    wrapSignal,
} from './index';

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
    return wrapSignal(async cb => {
        const token = auth.user ? await auth.user.getIdToken() : null;
        socket.emit('graphql', { data, token }, cb);
    });
}

type Request = {
    query: string,
    variables: Object,
};

let clientSubscriptionId = 0;
export function subscribe(onNext: (Object) => void, request: Request) {
    const id = clientSubscriptionId++;
    socket.on(id, onNext);

    return {
        request: runQuery({
            query: request.query,
            variables: {
                ...request.variables,
                input: {
                    ...request.variables.input,
                    clientSubscriptionId: id,
                },
            },
        }),
        connection: {
            dispose() {
                socket.off(id);
            },
        },
    };
}

export async function joinRoom(name: string): Promise<Array<Remote>> {
    socket.on('offer', wrapMessage((id: string, offer: Offer) =>
        store.dispatch(acceptOffer(new Remote(id), offer))
    ));

    socket.on('candidate', wrapMessage((remote: string, candidate: Candidate) =>
        store.dispatch(handleCandidate(store, remote, candidate))
    ));

    const remotes = await wrapSignal(cb => {
        socket.emit('start-call', name, cb);
    });

    return remotes.map(id => new Remote(id));
}
