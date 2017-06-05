// @flow
import React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { ListItem } from 'material-ui/List';
import { grey400 } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

import ProfilePic from 'components/base/profilePic';
import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    uid: string,
    user: ?{
        displayName: string,
        status: 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE',
    },
};
const iconButtonElement = (
    <IconButton touch tooltip="Status" tooltipPosition="top-left">
        <MoreVertIcon color={grey400} />
    </IconButton>
);

const ITEM_STYLE = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
};

const Profile = (props: Props) => do {
    const setStatus = async (evt, child) => {
        const { database } = await import(/* webpackChunkName: "firebase" */ '../../utils/firebase');
        database.ref(`/users/${props.uid}/status`).set(child.props.value);
    };

    /* eslint-disable react/jsx-indent, no-unused-expressions */
    (
        <ListItem
            disabled
            style={ITEM_STYLE}
            leftAvatar={
                <ProfilePic uid={props.uid} />
            }
            rightIconButton={
                <IconMenu iconButtonElement={iconButtonElement} onItemTouchTap={setStatus}>
                    <MenuItem value="ONLINE">Online</MenuItem>
                    <MenuItem value="BUSY">Busy</MenuItem>
                    <MenuItem value="AWAY">Away</MenuItem>
                </IconMenu>
            }
            primaryText={props.user ? props.user.displayName : '\u00a0'}
            secondaryText={props.user && props.user.status} />
    );
    /* eslint-enable react/jsx-indent, no-unused-expressions */
};

const enhance = compose(
    connect(
        ({ auth }) => ({
            uid: auth.user.uid,
        }),
    ),
    connectFirebase(
        ({ uid }) => `/users/${uid}`,
        user => ({ user })
    ),
);

export default enhance(Profile);
