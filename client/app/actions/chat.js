// @flow
import type {
    Dispatch,
    Store as ReduxStore,
} from 'redux';

import * as RTC from 'utils/rtc';
import {
    initCamera,
    createConnection,
} from 'utils';

// eslint-disable-next-line no-undef
type GetState = () => State;
// eslint-disable-next-line no-undef
type Store = ReduxStore<State, Action>;

// eslint-disable-next-line no-undef
export function joinCall(): Action {
    return {
        type: 'JOIN',
    };
}

// eslint-disable-next-line no-undef
export function leaveCall(): Action {
    return {
        type: 'LEAVE',
        // eslint-disable-next-line no-undef
        payload: async (dispatch: Dispatch<Action>, getState: GetState) => {
            const { stream } = getState();

            for (const { connection } of stream.remotes.values()) {
                connection.close();
            }

            for (const track of stream.localStream.getTracks()) {
                track.stop();
            }

            dispatch({
                type: 'Navigation/NAVIGATE',
                routeName: 'Conversation',
            });
        },
    };
}

// eslint-disable-next-line no-undef
export function setLocalStream(stream: MediaStream): Action {
    return {
        type: 'LOCAL_STREAM',
        payload: stream,
    };
}

// eslint-disable-next-line no-undef
export function toggleMicro(): Action {
    return {
        type: 'TOGGLE_MICRO',
        // eslint-disable-next-line no-undef
        payload: async (dispatch: Dispatch<Action>, getState: GetState) => {
            const { stream } = getState();

            const hasMicro = !stream.hasMicro;
            for (const track of stream.localStream.getAudioTracks()) {
                track.enabled = hasMicro;
            }

            return hasMicro;
        },
    };
}

// eslint-disable-next-line no-undef
export function toggleCamera(): Action {
    return {
        type: 'TOGGLE_CAMERA',
        // eslint-disable-next-line no-undef
        payload: async (dispatch: Dispatch<Action>, getState: GetState) => {
            const { stream } = getState();

            const hasCamera = !stream.hasCamera;
            for (const track of stream.localStream.getVideoTracks()) {
                track.enabled = hasCamera;
            }

            return hasCamera;
        },
    };
}

// eslint-disable-next-line no-undef
export function remoteConnection(remote: string, connection: Connection): Action {
    return {
        type: 'REMOTE_CONNECTION',
        payload: {
            remote, connection,
        },
    };
}

// eslint-disable-next-line no-undef
export function remoteStream(remote: string, stream: MediaStream): Action {
    return {
        type: 'REMOTE_STREAM',
        payload: {
            remote, stream,
        },
    };
}

// eslint-disable-next-line no-undef
export function closeRemote(remote: string): Action {
    return {
        type: 'CLOSE_REMOTE',
        payload: remote,
    };
}

// eslint-disable-next-line no-undef
export function sendOffer(channel: string): Action {
    return {
        type: 'SEND_OFFER',
        // eslint-disable-next-line no-undef
        payload: async (dispatch: Dispatch<Action>, getState: GetState) => {
            dispatch(joinCall());

            const { stream: streamState } = getState();
            const WS = await import(/* webpackChunkName: "websocket" */ '../utils/websocket');

            const [
                stream,
                remotes,
            ]: [
                MediaStream,
                // eslint-disable-next-line no-undef
                Array<Remote>,
            ] = await Promise.all([
                initCamera(streamState.localStream),
                WS.joinRoom(channel),
            ]);

            return Promise.all(
                remotes
                    .filter(remote => !streamState.remotes.has(remote.id))
                    .map(async remote => {
                        const connection = createConnection(remote, stream);

                        dispatch(remoteConnection(remote.id, connection));

                        connection.oniceconnectionstatechange = () => {
                            switch (connection.iceConnectionState) {
                                case 'failed':
                                case 'closed':
                                case 'disconnected':
                                    dispatch(closeRemote(remote.id));
                                    break;

                                default:
                                    console.log(connection.iceConnectionState);
                                    break;
                            }
                        };

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

// eslint-disable-next-line no-undef
export function acceptOffer(remote: Remote, offer: Offer): Action {
    return {
        type: 'ACCEPT_OFFER',
        // eslint-disable-next-line no-undef
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

// eslint-disable-next-line no-undef
export function handleCandidate(store: Store, remote: string, candidate: Candidate): Action {
    return {
        type: 'HANDLE_CANDIDATE',
        // eslint-disable-next-line no-undef
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
