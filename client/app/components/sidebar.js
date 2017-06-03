// @flow
import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import Channel from 'material-ui/svg-icons/communication/forum';
import Group from 'material-ui/svg-icons/social/group';
import Friend from 'material-ui/svg-icons/social/person';

import Mosaic from 'components/base/avatars';
import connectFirebase from 'utils/firebase/enhancer';

import styles from './app.css';

type Props = {
    photoURL: ?string,
    navigation: {
        navigate: (string) => void,
        state: {
            key: 'Profile' | 'Channels' | 'Groups' | 'Friends',
        },
    },
};

type Context = {
    muiTheme: {
        palette: {
            primary3Color: string,
            canvasColor: string,
        }
    }
}

const PAPER_STYLE = {
    position: 'relative',
    width: 64,
    zIndex: 1,
};

const Sidebar = (props: Props, ctx: Context) => do {
    const { state, navigate } = props.navigation;
    const { primary2Color, textColor, disabledColor } = ctx.muiTheme.palette;

    /* eslint-disable semi, no-unused-expressions, react/jsx-indent */
    <Paper
        className={styles.sidebar} rounded={false}
        style={{ ...PAPER_STYLE, backgroundColor: primary2Color }}
        data-profile={state.key === 'Profile'}>
        <Mosaic className={styles.self}
            onTouchTap={() => navigate('Profile')}
            images={props.photoURL ? [props.photoURL] : []} />
        <IconButton onTouchTap={() => navigate('Channels')}>
            <Channel color={state.key === 'Channels' ? textColor : disabledColor} />
        </IconButton>
        <IconButton onTouchTap={() => navigate('Groups')}>
            <Group color={state.key === 'Groups' ? textColor : disabledColor} />
        </IconButton>
        <IconButton onTouchTap={() => navigate('Friends')}>
            <Friend color={state.key === 'Friends' ? textColor : disabledColor} />
        </IconButton>
    </Paper>
    /* eslint-enable semi, no-unused-expressions, react/jsx-indent */
};

Sidebar.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

const enhance = compose(
    connect(
        ({ auth }) => ({
            uid: auth.user.uid,
        }),
    ),
    connectFirebase(
        ({ uid }) => `/users/${uid}/photoURL`,
        photoURL => ({ photoURL }),
    ),
);

export default enhance(Sidebar);
