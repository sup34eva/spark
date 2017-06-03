// @flow
import { combineReducers } from 'redux';

import stream from './stream';
import auth from './auth';
import navigation from './navigation';
import type { StreamState } from './stream';
import type { AuthState } from './auth';
import type { NavigationState } from './navigation';

export type State = {
    stream: StreamState,
    auth: AuthState,
    navigation: NavigationState,
};

export default combineReducers({
    auth,
    stream,
    navigation,
});
