// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';

import { ListItem } from 'material-ui/List';
import Mosaic from '../base/avatars';

import { database } from '../../utils/firebase';

type Props = {
    /* eslint-disable react/no-unused-prop-types */
    channel: {
        name: string,
        subtext: ?string,
        users: ?{
            [key: string]: boolean,
        },
    },
    /* eslint-enable react/no-unused-prop-types */

    onTouchTap?: () => void,
    style?: Object,
};

export default class Channel extends Component {
    static muiName = 'ListItem';
    static defaultProps = {
        nestedItems: [],
    };

    constructor(props: Props) {
        super(props);
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
        this.users.forEach(ref => ref.off());
    }

    updateUsers(users: Array<string>) {
        this.users = users.map(uid => {
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

    users: Array<Object>;
    props: Props;

    render() {
        return (
            <ListItem
                style={this.props.style}
                onTouchTap={this.props.onTouchTap}
                leftAvatar={
                    // $FlowIssue
                    <Mosaic images={this.state.users.toArray()} />
                }
                primaryText={this.props.channel.name}
                secondaryText={this.props.channel.subtext} />
        );
    }
}
