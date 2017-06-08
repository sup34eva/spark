// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

import connectFirebase from 'utils/firebase/enhancer';

import UserDialog from './userDialog';

type MenuProps = {
    /* eslint-disable react/no-unused-prop-types */
    uid: string,
    selfId: string,
    channel: string,
    closeMenu: () => void,
    /* eslint-enable react/no-unused-prop-types */

    access: null | 'USER' | 'MODERATOR',
    friendStatus: ?string,
    openProfile: () => void,
};

const addFriend = ({ selfId, uid, closeMenu }: MenuProps) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../utils/firebase');
    database.ref(`/users/${selfId}/friends/${uid}`).set('FRIEND');
    database.ref(`/users/${uid}/friends/${selfId}`).set('INVITE');
};

const kickUser = ({ channel, uid, closeMenu }: MenuProps) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../utils/firebase');
    database.ref(`/channels/${channel}/users/${uid}/kick`).set(Date.now() + 60000);
};

const banUser = ({ channel, uid, closeMenu }: MenuProps) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../utils/firebase');
    database.ref(`/channels/${channel}/users/${uid}/ban`).set(true);
};

const makeModerator = ({ channel, uid, closeMenu }: MenuProps) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../utils/firebase');
    database.ref(`/channels/${channel}/users/${uid}/access`).set('MODERATOR');
};

const UserMenu = (props: MenuProps) => {
    const items = [];
    if (props.access === 'MODERATOR') {
        items.push(
            <Divider key="div" />,
            <MenuItem key="kick" primaryText="Kick" onTouchTap={kickUser(props)} />,
            <MenuItem key="ban" primaryText="Ban" onTouchTap={banUser(props)} />,
            <MenuItem key="mod" primaryText="Make moderator" onTouchTap={makeModerator(props)} />,
        );
    }

    return (
        <Menu>
            <MenuItem primaryText="See profile" onTouchTap={props.openProfile} />
            <MenuItem
                primaryText="Add a contact"
                disabled={props.friendStatus !== null}
                onTouchTap={addFriend(props)} />
            {items}
        </Menu>
    );
};

const enhanceMenu = compose(
    connectFirebase(
        ({ channel, selfId }) => (channel ? `/channels/${channel}/users/${selfId}/access` : null),
        access => ({ access }),
    ),
    connectFirebase(
        ({ uid, selfId }) => `/users/${uid}/friends/${selfId}`,
        friendStatus => ({ friendStatus }),
    ),
);

const EnhancedMenu = enhanceMenu(UserMenu);

type Props = {
    uid: string,
    selfId: string,
    channel: ?string,
    // eslint-disable-next-line no-undef
    children: ReactElement<*>,
};

class UserCard extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            anchor: null,
            profile: false,
        };
    }

    componentWillMount() {
        this.handleOpen = evt => {
            evt.preventDefault();
            this.setState({
                open: true,
                anchor: evt.currentTarget,
            });
        };
        this.handleClose = () => {
            this.setState({
                open: false,
                anchor: null,
            });
        };
        this.openProfile = () => {
            this.setState({
                open: false,
                anchor: null,
                profile: true,
            });
        };
        this.closeProfile = () => {
            this.setState({ profile: false });
        };
    }

    props: Props;

    render() {
        const {
            uid,
            selfId,
            channel,
            children,
            dispatch, // eslint-disable-line no-unused, react/prop-types
            ...props
        } = this.props;

        if (selfId === uid) {
            return this.props.children;
        }

        return (
            <div {...props}>
                {React.cloneElement(this.props.children, {
                    onTouchTap: this.handleOpen,
                })}

                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchor}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                    onRequestClose={this.handleClose}>
                    <EnhancedMenu
                        selfId={selfId} uid={uid} channel={channel}
                        closeMenu={this.handleClose}
                        openProfile={this.openProfile} />
                </Popover>

                <UserDialog uid={uid} open={this.state.profile} onClose={this.closeProfile} />
            </div>
        );
    }
}

const enhance = connect(
    ({ auth }) => ({
        selfId: auth.user.uid,
    }),
);

export default enhance(UserCard);
