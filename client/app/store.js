// @flow
import { compose, createStore, applyMiddleware } from 'redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLogger } from 'redux-logger';

import * as actionCreators from 'actions/stream';
import thunk from 'utils/thunk';

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
            thunk,
            logger,
        ),
    ),
);

if (module.hot) {
    // $FlowIssue
    module.hot.accept('./reducers', () =>
        store.replaceReducer(require('./reducers')) // eslint-disable-line global-require
    );
}

export default store;
