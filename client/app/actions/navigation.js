// @flow
import type { Action } from '../store';

export function setPage(name: string): Action {
    return {
        type: 'SET_PAGE',
        payload: name,
    };
}

export function selectChannel(name: string): Action {
    return {
        type: 'SELECT_CHANNEL',
        payload: name,
    };
}

export function openChannelModal(): Action {
    return {
        type: 'OPEN_CHANNEL_MODAL',
    };
}

export function closeChannelModal(): Action {
    return {
        type: 'CLOSE_CHANNEL_MODAL',
    };
}
