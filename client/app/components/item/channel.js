// @flow
import React from 'react';
import Relay from 'react-relay';

import { ListItem } from 'material-ui/List';
import Mosaic from '../base/avatars';

import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    Channel as ChannelType,
} from '../../schema';

type Props = {
    channel: ChannelType,
    onTouchTap: () => void,
    style: Object,
};

const Channel = ({ channel, style, onTouchTap }: Props) => (
    <ListItem
        style={style}
        onTouchTap={onTouchTap}
        leftAvatar={
            <Mosaic images={channel.users.edges.map(({ node: user }) => user.avatar)} />
        }
        primaryText={channel.name}
        secondaryText={
            channel.messages.edges.map(
                ({ node: { content, author } }) => `${author.name}: ${content}`
            ).join('')
        } />
);

const ChannelContainer = Relay.createContainer(Channel, {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                name
                users(first: 4) {
                    edges {
                        node {
                            avatar
                        }
                    }
                }
                messages(last: 1) {
                    edges {
                        node {
                            content
                            author {
                                name
                            }
                        }
                    }
                }
            }
        `,
    },
});

ChannelContainer.muiName = 'ListItem';
ChannelContainer.defaultProps = {
    nestedItems: [],
};

export default ChannelContainer;
