// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { AppContainer } from 'react-hot-loader';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'normalize.css';

import store from './store';
import App from './components/app';
import ApolloMultiProvider from './utils/apollo/multiProvider';
import mainClient from './utils/apollo/mainClient';
import kafkaClient from './utils/apollo/kafkaClient';

import './app.global.css';

injectTapEventPlugin();

const renderRoot = AppComponent => (
    <AppContainer>
        <MuiThemeProvider>
            <ApolloMultiProvider store={store} clients={{ apollo: mainClient, kafka: kafkaClient }}>
                <AppComponent />
            </ApolloMultiProvider>
        </MuiThemeProvider>
    </AppContainer>
);

const main = document.querySelector('main');

ReactDOM.render(renderRoot(App), main);

if (module.hot) {
    // eslint-disable-next-line flowtype-errors/show-errors
    module.hot.accept('./components/app', () => {
        // eslint-disable-next-line global-require
        const NextApp = require('./components/app').default;
        ReactDOM.render(renderRoot(NextApp), main);
    });
}
