// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import Channel from 'material-ui/svg-icons/communication/forum';
import Group from 'material-ui/svg-icons/social/group';
import Friend from 'material-ui/svg-icons/social/person';

import ProfilePic from 'components/root/shared/profilePic';

import styles from '../app.css';

type Props = {
    uid: string,
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
    const { primary2Color, primary3Color, disabledColor } = ctx.muiTheme.palette;

    /* eslint-disable no-unused-expressions, react/jsx-indent */
    (
        <Paper
            className={styles.sidebar} rounded={false}
            style={{ ...PAPER_STYLE, backgroundColor: primary2Color }}
            data-profile={state.key === 'Profile'}>
            <ProfilePic
                uid={props.uid} className={styles.self}
                onTouchTap={() => navigate('Profile')} />
            <IconButton onTouchTap={() => navigate('Channels')}>
                <Channel color={state.key === 'Channels' ? primary3Color : disabledColor} />
            </IconButton>
            <IconButton onTouchTap={() => navigate('Groups')}>
                <Group color={state.key === 'Groups' ? primary3Color : disabledColor} />
            </IconButton>
            <IconButton onTouchTap={() => navigate('Friends')}>
                <Friend color={state.key === 'Friends' ? primary3Color : disabledColor} />
            </IconButton>
        </Paper>
    );
    /* eslint-enable no-unused-expressions, react/jsx-indent */
};

Sidebar.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

const enhance = connect(
    ({ auth }) => ({
        uid: auth.user.uid,
    }),
);

export default enhance(Sidebar);
