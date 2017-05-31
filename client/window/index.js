// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { AppContainer } from 'react-hot-loader';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'normalize.css';

import theme from '../palette';

import App from './app';

injectTapEventPlugin();

const renderRoot = AppComponent => (
    <AppContainer>
        <MuiThemeProvider muiTheme={theme}>
            <AppComponent />
        </MuiThemeProvider>
    </AppContainer>
);

const main = document.createElement('main');
document.body.appendChild(main);

ReactDOM.render(renderRoot(App), main);

if (module.hot) {
    // $FlowIssue
    module.hot.accept('./app', () => {
        // eslint-disable-next-line global-require
        const NextApp = require('./app').default;
        ReactDOM.render(renderRoot(NextApp), main);
    });
}
