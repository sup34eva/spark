// @flow
import {
    compose,
    createStore,
    applyMiddleware,
} from 'redux';

// eslint-disable-next-line import/no-extraneous-dependencies
import createLogger from 'redux-logger';

import {
    thunk,
} from './utils';

import * as actionCreators from './actions/stream';
import rootReducer from './reducers';

/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionCreators,
    }) : compose;
/* eslint-enable no-underscore-dangle */

const logger = createLogger({
    level: 'info',
    collapsed: true,
});

export type Action = {
    type: string,
    payload?: any,
    error?: boolean,
};

export default createStore(
    rootReducer,
    composeEnhancers(
        applyMiddleware(
            thunk,
            logger,
        ),
    ),
);
