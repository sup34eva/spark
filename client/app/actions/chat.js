// @flow
import type {
    Action,
} from '../store';

export function openModal(): Action {
    return {
        type: 'OPEN_MODAL',
    };
}

export function closeModal(): Action {
    return {
        type: 'CLOSE_MODAL',
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
