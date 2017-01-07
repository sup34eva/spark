// @flow
import {
    combineReducers,
} from 'redux';

import stream from './stream';
import type {
    StreamState,
} from './stream';

export type State = {
    stream: StreamState,
};

export default combineReducers({
    stream,
});
