// @flow
import type {
    Dispatch,
    Store as ReduxStore,
} from 'redux';

import * as RTC from 'utils/rtc';
import * as WS from 'utils/websocket';
import {
    initCamera,
    createConnection,
} from 'utils';
import type {
    Connection,
    Offer,
    Candidate,
} from 'utils/rtc';

import type {
    State,
} from '../reducers';
import type {
    Action,
} from '../store';

type GetState = () => State;
type Store = ReduxStore<State, Action>;

export function join(): Action {
    return {
        type: 'JOIN',
    };
}

export function localStream(stream: MediaStream): Action {
    return {
        type: 'LOCAL_STREAM',
        payload: stream,
    };
}

export function remoteConnection(remote: string, connection: Connection): Action {
    return {
        type: 'REMOTE_CONNECTION',
        payload: {
            remote, connection,
        },
    };
}

export function remoteStream(remote: string, stream: MediaStream): Action {
    return {
        type: 'REMOTE_STREAM',
        payload: {
            remote, stream,
        },
    };
}

export function sendOffer(): Action {
    return {
        type: 'SEND_OFFER',
        payload: async (dispatch: Dispatch<Action>, getState: GetState) => {
            dispatch(join());

            const {
                stream: streamState,
            } = getState();

            const [
                stream,
                remotes,
            ]: [
                MediaStream,
                Array<WS.Remote>,
            ] = await Promise.all([
                initCamera(streamState.localStream),
                WS.joinRoom('default'),
            ]);

            return Promise.all(
                remotes
                    .filter(remote => !streamState.remotes.has(remote.id))
                    .map(async remote => {
                        const connection = createConnection(remote, stream);

                        dispatch(remoteConnection(remote.id, connection));

                        const reply = await remote.sendOffer(
                            await RTC.sendOffer(connection),
                        );

                        await RTC.openConnection(connection, reply);

                        return connection;
                    }),
            );
        },
    };
}

export function acceptOffer(remote: WS.Remote, offer: Offer): Action {
    return {
        type: 'ACCEPT_OFFER',
        payload: async (dispatch: Dispatch<Action>, getState: GetState) => {
            const {
                stream: streamState,
            } = getState();

            const stream = await initCamera(streamState.localStream);

            const connection = createConnection(remote, stream);
            dispatch(remoteConnection(remote.id, connection));

            return RTC.acceptOffer(connection, offer);
        },
    };
}

export function handleCandidate(store: Store, remote: string, candidate: Candidate): Action {
    return {
        type: 'HANDLE_CANDIDATE',
        payload: async (dispatch: Dispatch<Action>, getState: GetState) => {
            const connection = await new Promise(resolve => {
                let unsubscribe;
                const handler = () => {
                    const {
                        stream: {
                            remotes,
                        },
                    } = getState();

                    if (remotes.has(remote) && remotes.get(remote).connection) {
                        resolve(remotes.get(remote).connection);
                        unsubscribe();
                    }
                };

                unsubscribe = store.subscribe(handler);
                handler();
            });

            return RTC.handleCandidate(
                connection,
                candidate,
            );
        },
    };
}
