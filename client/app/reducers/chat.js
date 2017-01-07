// @flow
import {
    Record,
} from 'immutable';

export const ChatState = Record({
    currentChannel: null,
});

export default (state: ChatState = new ChatState(), action: any) => {
    switch (action.type) {
        case 'SELECT_CHANNEL':
            return state.set('currentChannel', action.payload);

        default:
            return state;
    }
};
