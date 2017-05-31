// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'normalize.css';

import theme from '../palette';

import store from './store';
import App from './components/app';
import './app.global.css';

injectTapEventPlugin();

const renderRoot = AppComponent => (
    <AppContainer>
        <MuiThemeProvider muiTheme={theme}>
            <Provider store={store}>
                <AppComponent />
            </Provider>
        </MuiThemeProvider>
    </AppContainer>
);

const main = document.createElement('main');
document.body.appendChild(main);

ReactDOM.render(renderRoot(App), main);

if (module.hot) {
    // $FlowIssue
    module.hot.accept('./components/app', () => {
        // eslint-disable-next-line global-require
        const NextApp = require('./components/app').default;
        ReactDOM.render(renderRoot(NextApp), main);
    });
}
