// @flow
import {
    combineReducers,
} from 'redux';

import stream from './stream';
import chat from './chat';
import auth from './auth';
import client from '../utils/apollo';

import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    StreamState,
} from './stream';
import type {
    ChatState,
} from './chat';
import type {
    AuthState,
} from './auth';

export type State = {
    stream: StreamState,
    chat: ChatState,
    auth: AuthState,
};

export default combineReducers({
    chat,
    auth,
    stream,
    apollo: client.reducer(),
});
