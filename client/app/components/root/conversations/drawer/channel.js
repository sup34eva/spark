// @flow
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { grey400 } from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';

import Mosaic from 'components/root/shared/avatars';
import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    displayName: ?string,

    /* eslint-disable react/no-unused-prop-types */
    uid: string,
    channel: {
        name: string,
        subtext: ?{
            content: string,
        },
        users: ?{
            [key: string]: {
                access: 'USER' | 'MODERATOR',
            },
        },
    },
    /* eslint-enable react/no-unused-prop-types */

    selected: boolean,
    onTouchTap?: () => void,
};

class Channel extends PureComponent {
    static contextTypes = {
        muiTheme: PropTypes.object.isRequired,
    };

    constructor(props: Props, ctx) {
        super(props, ctx);
        this.state = {
            users: new Map(),
        };
    }

    state: {
        users: Map<string, string>,
    };

    componentWillMount() {
        this.leaveChannel = async () => {
            const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../utils/firebase');
            database.ref(`/channels/${this.props.channel.name}/users/${this.props.uid}`).remove();
        };
    }

    componentDidMount() {
        if (this.props.channel.users) {
            this.updateUsers(Object.keys(this.props.channel.users));
        }
    }

    componentWillUnmount() {
        this.users.forEach(async ref => (await ref).off());
    }

    context: {
        muiTheme: Object,
    };

    updateUsers(users: Array<string>) {
        this.users = users.map(async uid => {
            const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../utils/firebase');
            const ref = database.ref(`/users/${uid}`);
            ref.on('value', snapshot => {
                const { photoURL } = snapshot.val();
                this.setState(state => ({
                    users: state.users.set(uid, photoURL),
                }));
            });

            return ref;
        });
    }

    users: Array<Promise<Object>>;
    props: Props;

    render() {
        const { uid, channel } = this.props;
        if (channel.users && Object.keys(channel.users).indexOf(uid) === -1) {
            return null;
        }

        const { textColor } = this.context.muiTheme.palette;
        const color = this.props.selected ? fade(textColor, 0.2) : undefined;

        let subtext;
        if (channel.subtext) {
            subtext = (
                <p>
                    <span style={{ color: textColor }}>
                        {this.props.displayName}
                    </span>
                    &nbsp;-&nbsp;
                    {channel.subtext.content}
                </p>
            );
        }

        // $FlowIssue
        const avatar = <Mosaic images={this.state.users.toArray()} />;

        const button = (
            <IconButton touch tooltip="Options" tooltipPosition="bottom-left">
                <MoreVertIcon color={grey400} />
            </IconButton>
        );
        const menu = (
            <IconMenu iconButtonElement={button}>
                <MenuItem onTouchTap={this.leaveChannel}>Leave</MenuItem>
            </IconMenu>
        );

        return (
            <ListItem
                style={{ backgroundColor: color }}
                onTouchTap={this.props.onTouchTap}
                leftAvatar={avatar} rightIconButton={menu}
                primaryText={channel.name}
                secondaryText={subtext} secondaryTextLines={2} />
        );
    }
}

const enhance = compose(
    connect(
        ({ auth }) => ({
            uid: auth.user.uid,
        }),
    ),
    connectFirebase(
        ({ channel }) => (channel.subtext ? `/users/${channel.subtext.user}/displayName` : null),
        displayName => ({ displayName })
    ),
);

export default enhance(Channel);
