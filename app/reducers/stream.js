// @flow
import {
    Map, Record,
} from 'immutable';
import type {
    Action,
} from '../store';

export const Remote = Record({
    connection: null,
    stream: null,
});

export const StreamState = Record({
    joined: false,
    localStream: null,
    remotes: new Map(),
});

export default (state: StreamState = new StreamState(), action: Action) => {
    switch (action.type) {
        case 'JOIN':
            return state.set('joined', true);

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

        default:
            return state;
    }
};
