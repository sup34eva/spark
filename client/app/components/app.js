// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import NavigationMinimize from 'material-ui/svg-icons/navigation/expand-more';
import NavigationMaximize from 'material-ui/svg-icons/navigation/fullscreen';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

import AuthForm from './auth';
import RootNavigator from './root';
import styles from './app.css';

const ACTIONS = [
    [NavigationMinimize, 'minimize'],
    [NavigationMaximize, 'maximize'],
    [NavigationClose, 'close'],
];

type Props = {
    isLogged: boolean,
};

const App = ({ isLogged }: Props, ctx) => (
    <Router>
        <div className={styles.app}>
            <Route path="/:type/:channel">
                {({ location, match }) => (
                    <div className={styles.appBar} style={{
                        left: do {
                            /* eslint-disable no-unused-expressions, react/jsx-indent */
                            if (!isLogged) {
                                0;
                            } else if (location.pathname === '/') {
                                64;
                            } else if (match) {
                                'unset';
                            } else {
                                320;
                            }
                            /* eslint-enable no-unused-expressions, react/jsx-indent */
                        },
                    }}>
                        {ACTIONS.map(([Icon, action]) => (
                            <IconButton key={action} onTouchTap={() => {
                                const win = remote.getCurrentWindow();
                                if (action === 'maximize' && win.isMaximized()) {
                                    win.unmaximize();
                                } else {
                                    win[action]();
                                }
                            }}>
                                <Icon color={ctx.muiTheme.palette.disabledColor} />
                            </IconButton>
                        ))}
                    </div>
                )}
            </Route>
            {do {
                /* eslint-disable no-unused-expressions, react/jsx-indent */
                if (!isLogged) {
                    <AuthForm />;
                } else {
                    <RootNavigator />;
                }
                /* eslint-enable no-unused-expressions, react/jsx-indent */
            }}
        </div>
    </Router>
);

App.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

const enhance = connect(
    ({ auth }) => ({
        isLogged: auth.user !== null,
    }),
);

export default enhance(App);
