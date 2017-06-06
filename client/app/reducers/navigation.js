// @flow
import { RootRouter } from 'components/root';

const initialState = RootRouter.getStateForAction(
    RootRouter.getActionForPathAndParams('Profile'),
);

export default (state = initialState, action) => {
    const nextState = RootRouter.getStateForAction(action, state);
    return nextState || state;
};
