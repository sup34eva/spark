// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

import connectFirebase from 'utils/firebase/enhancer';

import UserDialog from './userDialog';

const addFriend = ({ selfId, uid, closeMenu }) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../../utils/firebase');
    database.ref(`/users/${selfId}/friends/${uid}`).set('FRIEND');
    database.ref(`/users/${uid}/friends/${selfId}`).set('INVITE');
};

const kickUser = ({ channel, uid, closeMenu }) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../../utils/firebase');
    database.ref(`/channels/${channel}/users/${uid}/kick`).set(Date.now() + 60000);
};

const banUser = ({ channel, uid, closeMenu }) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../../utils/firebase');
    database.ref(`/channels/${channel}/users/${uid}/ban`).set(true);
};

const makeModerator = ({ channel, uid, closeMenu }) => async () => {
    closeMenu();

    const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../../../utils/firebase');
    database.ref(`/channels/${channel}/users/${uid}/access`).set('MODERATOR');
};

const UserMenu = (props) => do {
    /* eslint-disable no-unused-expressions */
    if (props.access === 'MODERATOR') {
        (
            <Menu>
                <MenuItem primaryText="See profile" onTouchTap={props.openProfile} />
                <MenuItem primaryText="Add a contact" onTouchTap={addFriend(props)} />
                <Divider />
                <MenuItem primaryText="Kick" onTouchTap={kickUser(props)} />
                <MenuItem primaryText="Ban" onTouchTap={banUser(props)} />
                <MenuItem primaryText="Make moderator" onTouchTap={makeModerator(props)} />
            </Menu>
        );
    } else {
        (
            <Menu>
                <MenuItem primaryText="See profile" />
                <MenuItem primaryText="Add a contact" onTouchTap={addFriend(props)} />
            </Menu>
        );
    }
    /* eslint-enable no-unused-expressions */
};

const enhanceMenu = connectFirebase(
    ({ channel, selfId }) => (channel ? `/channels/${channel}/users/${selfId}/access` : null),
    access => ({ access }),
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
