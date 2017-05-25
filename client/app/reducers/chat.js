// @flow
import {
    Record,
} from 'immutable';

export const ChatState = Record({
    showModal: false,
    channel: null,
    message: '',
});

export default (state: ChatState = new ChatState(), action: any) => {
    switch (action.type) {
        case 'OPEN_MODAL':
            return state.set('showModal', true);

        case 'CLOSE_MODAL':
            return state.set('showModal', false);

        case 'SELECT_CHANNEL':
            return state.set('channel', action.payload);

        case 'SET_MESSAGE':
            return state.set('message', action.payload);

        default:
            return state;
    }
};
