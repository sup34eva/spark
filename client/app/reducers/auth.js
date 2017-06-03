// @flow
import { Record } from 'immutable';

export const AuthState = Record({
    user: 'SETTLING',
});

export default (state: AuthState = new AuthState(), action: any) => {
    switch (action.type) {
        case 'SET_USER':
            return state.set('user', action.payload);

        default:
            return state;
    }
};
