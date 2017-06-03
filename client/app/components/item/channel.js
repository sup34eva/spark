// @flow
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { ListItem } from 'material-ui/List';
import { fade } from 'material-ui/utils/colorManipulator';

import Mosaic from 'components/base/avatars';
import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    displayName: ?string,
    /* eslint-disable react/no-unused-prop-types */
    channel: {
        name: string,
        subtext: ?{
            content: string,
        },
        users: ?{
            [key: string]: 'user' | 'moderator',
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
            const { database } = await import(/* webpackChunkName: "firebase" */ '../../utils/firebase');
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
        const { textColor } = this.context.muiTheme.palette;
        const color = this.props.selected ? fade(textColor, 0.2) : undefined;

        let subtext;
        if (this.props.channel.subtext) {
            subtext = (
                <p>
                    <span style={{ color: textColor }}>
                        {this.props.displayName}
                    </span>
                    &nbsp;-&nbsp;
                    {this.props.channel.subtext.content}
                </p>
            );
        }

        return (
            <ListItem
                style={{ backgroundColor: color }}
                onTouchTap={this.props.onTouchTap}
                leftAvatar={
                    // $FlowIssue
                    <Mosaic images={this.state.users.toArray()} />
                }
                primaryText={this.props.channel.name}
                secondaryText={subtext} secondaryTextLines={2} />
        );
    }
}

const enhance = connectFirebase(
    ({ channel }) => (channel.subtext ? `/users/${channel.subtext.user}/displayName` : null),
    displayName => ({ displayName })
);

export default enhance(Channel);
