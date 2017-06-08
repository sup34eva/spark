// @flow
import { combineReducers } from 'redux';

import stream from './stream';
import auth from './auth';
import type { StreamState } from './stream';
import type { AuthState } from './auth';

export type State = {
    stream: StreamState,
    auth: AuthState,
};

export default combineReducers({
    auth, stream,
});
