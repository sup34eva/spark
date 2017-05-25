// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { AppContainer } from 'react-hot-loader';
import { ApolloProvider } from 'react-apollo';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'normalize.css';

import store from './store';
import App from './components/app';
import client from './utils/apollo';

import './app.global.css';

injectTapEventPlugin();

const renderRoot = AppComponent => (
    <AppContainer>
        <MuiThemeProvider>
            <ApolloProvider store={store} client={client}>
                <AppComponent />
            </ApolloProvider>
        </MuiThemeProvider>
    </AppContainer>
);

const main = document.querySelector('main');

ReactDOM.render(renderRoot(App), main);

if (module.hot) {
    // $FlowIssue
    module.hot.accept('./components/app', () => {
        // eslint-disable-next-line global-require
        const NextApp = require('./components/app').default;
        ReactDOM.render(renderRoot(NextApp), main);
    });
}
