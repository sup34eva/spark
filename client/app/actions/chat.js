// @flow
import type {
    Action,
} from '../store';

export function setChannelModal(text: ?string): Action {
    return {
        type: 'SET_CHANNEL_MODAL',
        payload: text,
    };
}

export function selectChannel(name: string): Action {
    return {
        type: 'SELECT_CHANNEL',
        payload: name,
    };
}

export function setMessage(text: string): Action {
    return {
        type: 'SET_MESSAGE',
        payload: text,
    };
}
