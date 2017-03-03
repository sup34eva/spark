// @flow
import {
    Record,
} from 'immutable';

export const ChatState = Record({
    channelModal: null,

    channel: null,
    message: '',
});

export default (state: ChatState = new ChatState(), action: any) => {
    switch (action.type) {
        case 'SET_CHANNEL_MODAL':
            return state.set('channelModal', action.payload);

        case 'SELECT_CHANNEL':
            return state.set('channel', action.payload);

        case 'SET_MESSAGE':
            return state.set('message', action.payload);

        default:
            return state;
    }
};
