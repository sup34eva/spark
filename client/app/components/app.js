// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { addNavigationHelpers } from 'react-navigation';
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
    user: null | Object,
    navigation: Object,
    dispatch: (Object) => void,
};

const App = (props: Props, ctx) => (
    <div className={styles.app}>
        <div className={styles.appBar} style={{
            left: do {
                const { routeName, ...route } = props.navigation.routes[props.navigation.index];
                /* eslint-disable no-unused-expressions, react/jsx-indent */
                if (props.user === null) {
                    0;
                } else if (routeName === 'Profile') {
                    64;
                } else {
                    const { routeName: subRoute } = route.routes[route.index];
                    if (subRoute === 'ConvOpen') {
                        'unset';
                    } else {
                        320;
                    }
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
        {do {
            /* eslint-disable no-unused-expressions, react/jsx-indent */
            if (props.user === null) {
                <AuthForm />;
            } else {
                <RootNavigator navigation={addNavigationHelpers({
                    dispatch: props.dispatch,
                    state: props.navigation,
                })} />;
            }
            /* eslint-enable no-unused-expressions, react/jsx-indent */
        }}
    </div>
);

App.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

const enhance = connect(
    ({ auth, navigation }) => ({
        user: auth.user,
        navigation,
    }),
);

export default enhance(App);
