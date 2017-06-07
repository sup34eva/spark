// @flow
import { Map, Record } from 'immutable';

export const Remote = Record({
    connection: null,
    stream: null,
});

export const StreamState = Record({
    joined: false,
    hasMicro: true,
    hasCamera: true,

    localStream: null,
    remotes: new Map(),
});

export default (state: StreamState = new StreamState(), action: any) => {
    switch (action.type) {
        case 'JOIN':
            return state.set('joined', true);

        case 'LEAVE':
            return new StreamState();

        case 'SET_MICRO':
            return state.set('hasMicro', action.payload);

        case 'SET_CAMERA':
            return state.set('hasCamera', action.payload);

        case 'LOCAL_STREAM':
            return state.set('localStream', action.payload);

        case 'REMOTE_CONNECTION':
            return state.updateIn(
                ['remotes', action.payload.remote],
                new Remote(),
                remote => remote.set('connection', action.payload.connection),
            );

        case 'REMOTE_STREAM':
            return state.updateIn(
                ['remotes', action.payload.remote],
                new Remote(),
                remote => remote.set('stream', action.payload.stream),
            );

        case 'CLOSE_REMOTE':
            return state.deleteIn(
                ['remotes', action.payload],
            );

        default:
            return state;
    }
};
