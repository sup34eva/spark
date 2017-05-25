// @flow
import {
    compose,
    createStore,
    applyMiddleware,
} from 'redux';

// eslint-disable-next-line import/no-extraneous-dependencies
import createLogger from 'redux-logger';

import { thunk } from './utils';
import client from './utils/apollo';

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

// $FlowIssue
const store = createStore(
    rootReducer,
    composeEnhancers(
        // $FlowIssue
        applyMiddleware(
            client.middleware(),
            thunk,
            logger,
        ),
    ),
);

if (module.hot) {
    // eslint-disable-next-line flowtype-errors/show-errors
    module.hot.accept('./reducers', () =>
        store.replaceReducer(require('./reducers')) // eslint-disable-line global-require
    );
}

export default store;
