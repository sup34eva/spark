// @flow
import io from 'socket.io-client';

import {
    acceptOffer,
    handleCandidate,
} from 'actions/stream';

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

export const thenSocket = new Promise(resolve => {
    requestIdleCallback(() => {
        resolve(io('wss://api.spark.leops.me:8443'));
    });
});

export class Remote {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    sendOffer(offer: Offer): Promise<Answer> {
        return wrapSignal(async cb => {
            const socket = await thenSocket;
            socket.emit('send-offer', this.id, offer, cb);
        });
    }

    sendCandidate(candidate: Candidate): Promise<any> {
        return wrapSignal(async cb => {
            const socket = await thenSocket;
            socket.emit('send-candidate', this.id, candidate, cb);
        });
    }
}

export function runQuery(data: any): Promise<any> {
    const { auth } = store.getState();
    return wrapSignal(async cb => {
        const socket = await thenSocket;
        const token = auth.user ? await auth.user.getIdToken() : null;
        socket.emit('graphql', { data, token }, cb);
    });
}

type Subscription = {
    subscription: string,
    variables: Object,

    onNext: (Object) => void,
    onError: (Error) => void,
};

let clientSubscriptionId = 0;
export async function subscribe(request: Subscription) {
    const socket = await thenSocket;

    const id = clientSubscriptionId++;
    socket.on(id, result => {
        if (result.errors) {
            result.errors
                .forEach(err => request.onError(err));
        }

        request.onNext(result.data);
    });

    return {
        request: runQuery({
            query: request.subscription,
            variables: {
                ...request.variables,
                clientSubscriptionId: id,
            },
        }),
        connection: {
            dispose() {
                // TODO: Close connection
            },
        },
    };
}

export async function joinRoom(name: string): Promise<Array<Remote>> {
    const socket = await thenSocket;
    console.log('joinRoom', name);

    socket.on('offer', wrapMessage((id: string, offer: Offer) =>
        // $FlowIssue
        store.dispatch(acceptOffer(new Remote(id), offer))
    ));

    socket.on('candidate', wrapMessage((remote: string, candidate: Candidate) =>
        store.dispatch(handleCandidate(store, remote, candidate))
    ));

    const remotes = await wrapSignal(cb => {
        socket.emit('start-call', cb);
    });

    return remotes.map(id => new Remote(id));
}
