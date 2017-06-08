// @flow
import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Route, withRouter } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import Channel from 'material-ui/svg-icons/communication/forum';
import Group from 'material-ui/svg-icons/social/group';
import Friend from 'material-ui/svg-icons/social/person';

import ProfilePic from 'components/root/shared/profilePic';

import styles from '../app.css';

type Context = {
    muiTheme: {
        palette: {
            primary2Color: string,
            primary3Color: string,
            canvasColor: string,
        }
    }
};

type BtnProps = {
    path: string,
    tooltip: string,
    children: ReactElement<*>, // eslint-disable-line no-undef
};

const Button = (props: BtnProps, ctx: Context) => do {
    const { primary3Color, disabledColor } = ctx.muiTheme.palette;
    /* eslint-disable no-unused-expressions */
    (
        <Route path={props.path}>
            {({ history, match }) => (
                <IconButton onTouchTap={() => history.push(props.path)} tooltip={props.tooltip}>
                    {React.cloneElement(props.children, {
                        color: match ? primary3Color : disabledColor,
                    })}
                </IconButton>
            )}
        </Route>
    );
    /* eslint-enable no-unused-expressions */
};

Button.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

type Props = {
    uid: string,
};

const PAPER_STYLE = {
    position: 'relative',
    width: 64,
    zIndex: 1,
};

const Sidebar = (props: Props, ctx: Context) => do {
    const { primary2Color } = ctx.muiTheme.palette;

    /* eslint-disable no-unused-expressions, react/jsx-indent */
    (
        <Paper
            className={styles.sidebar} rounded={false}
            style={{ ...PAPER_STYLE, backgroundColor: primary2Color }}>
            <Route path="/profile">
                {({ history }) => (
                    <IconButton
                        className={styles.self} tooltip="Profile"
                        onTouchTap={() => history.push('/profile')}>
                        <ProfilePic uid={props.uid} />
                    </IconButton>
                )}
            </Route>
            <Button path="/channels" tooltip="Channels">
                <Channel />
            </Button>
            <Button path="/groups" tooltip="Groups">
                <Group />
            </Button>
            <Button path="/friends" tooltip="Friends">
                <Friend />
            </Button>
        </Paper>
    );
    /* eslint-enable no-unused-expressions, react/jsx-indent */
};

Sidebar.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

const enhance = compose(
    withRouter,
    connect(
        ({ auth }) => ({
            uid: auth.user.uid,
        }),
    ),
);

export default enhance(Sidebar);
