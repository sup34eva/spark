// @flow
import type {
    Dispatch,
    MiddlewareAPI,
} from 'redux';
import type {
    Remote,
} from './websocket';

import * as RTC from './rtc';
import type {
    Connection,
} from './rtc';

import {
    localStream,
    remoteStream,
} from '../actions/stream';

import store from '../store';
import type {
    State,
} from '../reducers';
import type {
    Action,
} from '../store';

type Middleware = MiddlewareAPI<State, Action>;

export function createConnection(remote: Remote, stream: MediaStream): Connection {
    const connection = RTC.createConnection();
    RTC.setNegociator(connection, candidate => {
        remote.sendCandidate(candidate);
    });

    connection.onaddstream = event => {
        store.dispatch(remoteStream(remote.id, event.stream));
    };

    RTC.setStream(connection, stream);
    return connection;
}

export async function initCamera(currentStream: ?MediaStream): Promise<MediaStream> {
    if (!currentStream) {
        const camera = await RTC.createCamera();
        store.dispatch(localStream(camera));
        return camera;
    }

    return currentStream;
}

type MessageHandler = (...args: Array<any>) => any;
export function wrapMessage(cb: MessageHandler) {
    return async (...args: Array<any>) => {
        const reply = args.pop();

        try {
            reply(null, await cb(...args));
        } catch (err) {
            console.error(err);
            reply({
                message: err.message,
                // stack: err.stack,
            });
        }
    };
}

type SignalCallback<T> = (err: ?any, result: T) => void;
type SignalHandler<T> = (handler: SignalCallback<T>) => any;
export function wrapSignal<T>(cb: SignalHandler<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        cb((err: ?any, result: T) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export const thunk = ({ dispatch, getState }: Middleware) =>
    (next: Dispatch<Action>) =>
        async (action: Action) => {
            if (typeof action.payload === 'function') {
                // eslint-disable-next-line no-param-reassign
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
                    console.error(error);

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
