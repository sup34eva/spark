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

import Mosaic from 'components/base/avatars';
import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    user: ?{
        photoURL: string,
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

const Profile = (props: Props) => (
    <ListItem
        disabled
        style={ITEM_STYLE}
        leftAvatar={
            // $FlowIssue
            <Mosaic images={props.user ? [props.user.photoURL] : []} />
        }
        rightIconButton={
            <IconMenu iconButtonElement={iconButtonElement}>
                <MenuItem>Online</MenuItem>
                <MenuItem>Busy</MenuItem>
                <MenuItem>Away</MenuItem>
            </IconMenu>
        }
        primaryText={props.user ? props.user.displayName : '\u00a0'}
        secondaryText={props.user && props.user.status} />
);

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
