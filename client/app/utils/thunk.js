// @flow
import type { Dispatch, MiddlewareAPI } from 'redux';

// eslint-disable-next-line no-undef
type Middleware = MiddlewareAPI<State, Action>;

export default ({ dispatch, getState }: Middleware) => (
    // eslint-disable-next-line no-undef
    (next: Dispatch<Action>) => (
        // eslint-disable-next-line no-undef
        async (action: Action) => {
            if (typeof action.payload === 'function') {
                // eslint-disable-next-line no-param-reassign
                action.payload = action.payload(dispatch, getState);
            }

            if (action.payload instanceof Promise) {
                try {
                    const result = await action.payload;

                    dispatch({
                        ...action,
                        payload: result,
                    });

                    return result;
                } catch (error) {
                    console.error(error);

                    dispatch({
                        ...action,
                        payload: error,
                        error: true,
                    });

                    throw error;
                }
            }

            return next(action);
        }
    )
);
