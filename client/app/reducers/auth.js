// @flow
import {
    Record,
} from 'immutable';

export const AuthState = Record({
    idToken: null,
    token: null,
    user: null,
});

export default (state: AuthState = new AuthState(), action: any) => {
    switch (action.type) {
        case 'SET_TOKEN':
            return state
                .set('user', action.payload.user)
                .set('token', action.payload.token)
                .set('idToken', action.payload.idToken);

        default:
            return state;
    }
};
