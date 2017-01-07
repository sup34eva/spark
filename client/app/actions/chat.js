// @flow
import type {
    Action,
} from '../store';

// eslint-disable-next-line import/prefer-default-export
export function selectChannel(name: string): Action {
    return {
        type: 'SELECT_CHANNEL',
        payload: name,
    };
}
