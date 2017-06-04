// @flow
import { createStore, applyMiddleware } from 'redux';
import compose from 'recompose/compose';

import * as chatActions from 'actions/chat';
import * as navActions from 'actions/navigation';
import thunk from 'utils/thunk';

import rootReducer from './reducers';

const middlewares = [
    thunk,
];

if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { createLogger } = require('redux-logger');
    middlewares.push(
        createLogger({
            level: 'info',
            collapsed: true,
            diff: true,
        }),
    );
}

/* eslint-disable no-underscore-dangle, no-unused-expressions, semi */
const composeEnhancers = do {
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            actionCreators: {
                ...chatActions,
                ...navActions,
            },
        })
    } else {
        compose
    }
};
/* eslint-enable no-underscore-dangle, no-unused-expressions, semi */

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
        applyMiddleware(...middlewares),
    ),
);

if (module.hot) {
    // $FlowIssue
    module.hot.accept('./reducers', () =>
        store.replaceReducer(require('./reducers').default) // eslint-disable-line global-require
    );
}

export default store;
