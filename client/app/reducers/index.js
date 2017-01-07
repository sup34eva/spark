// @flow
import {
    combineReducers,
} from 'redux';

import stream from './stream';
import chat from './chat';

import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    StreamState,
} from './stream';
import type {
    ChatState,
} from './chat';

export type State = {
    stream: StreamState,
    chat: ChatState,
};

export default combineReducers({
    stream, chat,
});
