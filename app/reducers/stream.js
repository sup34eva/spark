import {
    Map, Record,
} from 'immutable';

const Remote = Record({
    connection: null,
    stream: null,
});

const StreamState = Record({
    joined: false,
    localStream: null,
    remotes: new Map(),
});

export default (state = new StreamState(), action) => {
    switch(action.type) {
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
