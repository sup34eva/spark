import {
    compose,
    createStore,
    applyMiddleware,
} from 'redux';
import createLogger from 'redux-logger';

import {
    thunk,
} from './utils';

import * as actionCreators from './actions/stream';
import rootReducer from './reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionCreators,
    }) : compose;

const logger = createLogger({
    level: 'info',
    collapsed: true,
});

export default createStore(
    rootReducer,
    composeEnhancers(
        applyMiddleware(
            thunk,
            logger,
        ),
    ),
);
