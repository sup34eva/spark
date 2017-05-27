// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { AppContainer } from 'react-hot-loader';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'normalize.css';

import App from './app';
import theme from '../palette';

injectTapEventPlugin();

const renderRoot = AppComponent => (
    <AppContainer>
        <MuiThemeProvider muiTheme={theme}>
            <AppComponent />
        </MuiThemeProvider>
    </AppContainer>
);

const main = document.querySelector('main');

ReactDOM.render(renderRoot(App), main);

if (module.hot) {
    // $FlowIssue
    module.hot.accept('./app', () => {
        // eslint-disable-next-line global-require
        const NextApp = require('./app').default;
        ReactDOM.render(renderRoot(NextApp), main);
    });
}
