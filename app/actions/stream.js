import * as WS from '../utils/websocket';
import * as RTC from '../utils/rtc';

import {
    initCamera,
    createConnection,
} from '../utils';

export function join() {
    return {
        type: 'JOIN',
    };
}

export function localStream(stream) {
    return {
        type: 'LOCAL_STREAM',
        payload: stream,
    };
}

export function remoteConnection(remote, connection) {
    return {
        type: 'REMOTE_CONNECTION',
        payload: {
            remote, connection,
        },
    };
}

export function remoteStream(remote, stream) {
    return {
        type: 'REMOTE_STREAM',
        payload: {
            remote, stream,
        },
    };
}

export function sendOffer() {
    return {
        type: 'SEND_OFFER',
        payload: async (dispatch, getState) => {
            dispatch(join());

            const {
                stream: streamState,
            } = getState();

            const [
                stream,
                remotes,
            ] = await Promise.all([
                initCamera(streamState.localStream),
                WS.startCall(),
            ]);

            return await Promise.all(
                remotes
                    .filter(remote => !streamState.remotes.has(remote))
                    .map(async remote => {
                        const connection = createConnection(remote, stream);

                        connection.onaddstream = event => {
                            dispatch(remoteStream(remote, event.stream));
                        };

                        dispatch(remoteConnection(remote, connection));

                        const reply = await WS.sendOffer(
                            remote,
                            await RTC.sendOffer(connection),
                        );

                        await RTC.openConnection(connection, reply);

                        return connection;
                    }),
            );
        },
    };
}

export function acceptOffer(remote, offer) {
    return {
        type: 'ACCEPT_OFFER',
        payload: async (dispatch, getState) => {
            const {
                stream: streamState,
            } = getState();

            const stream = await initCamera(streamState.localStream);

            const connection = createConnection(remote, stream);
            dispatch(remoteConnection(remote, connection));

            return await RTC.acceptOffer(connection, offer);
        },
    };
}

export function handleCandidate(store, remote, candidate) {
    return {
        type: 'HANDLE_CANDIDATE',
        payload: async (dispatch, getState) => {
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

            return await RTC.handleCandidate(
                connection,
                candidate,
            );
        },
    };
}
