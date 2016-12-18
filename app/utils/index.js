import * as WS from './websocket';
import * as RTC from './rtc';

import {
    localStream,
    remoteStream,
} from '../actions/stream';
import store from '../store';

export function createConnection(remote, stream) {
    const connection = RTC.createConnection();
    RTC.setNegociator(connection, candidate => {
        WS.sendCandidate(remote, candidate);
    });

    connection.onaddstream = event => {
        store.dispatch(remoteStream(remote, event.stream));
    };

    RTC.setStream(connection, stream);
    return connection;
}

export async function initCamera(currentStream) {
    if (currentStream === null) {
        const camera = await RTC.createCamera();
        store.dispatch(localStream(camera));
        return camera;
    }

    return currentStream;
}

export function wrapMessage(cb) {
    return async (...args) => {
        const reply = args.pop();

        try {
            reply(null, await cb(...args));
        } catch (err) {
            console.error(err);
            reply(err.message);
        }
    };
}

export function wrapSignal(cb) {
    return new Promise((resolve, reject) => {
        cb((err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export const thunk = ({ dispatch, getState }) => next => async action => {
    if (typeof action.payload === 'function') {
        action.payload = action.payload(dispatch, getState);
    }

    if (action.payload instanceof Promise) {
        try {
            const result = await action.payload;

            dispatch({
                ...action,
                payload: result,
            });

            return result;
        } catch (error) {
            dispatch({
                ...action,
                payload: error,
                error: true,
            });

            throw error;
        }
    }

    return next(action);
};
