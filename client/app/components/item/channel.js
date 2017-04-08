// @flow
import React from 'react';
import { gql } from 'react-apollo';

import { ListItem } from 'material-ui/List';
import Mosaic from '../base/avatars';

import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    Channel as ChannelType,
} from '../../schema';

type Props = {
    channel: ChannelType,
    onTouchTap?: () => void,
    style?: Object,
};

const Channel = ({ channel, style, onTouchTap }: Props) => (
    <ListItem
        style={style}
        onTouchTap={onTouchTap}
        leftAvatar={
            <Mosaic images={channel.users.edges.map(({ node: user }) => user.picture)} />
        }
        primaryText={channel.name}
        secondaryText={
            channel.messages.edges.map(
                ({ node: { content, author } }) => `${author.username}: ${content}`
            ).join('')
        } />
);

Channel.fragment = gql`
    fragment ChannelFragment on Channel {
        name
        users(first: 4) {
            edges {
                node {
                    picture
                }
            }
        }
        messages(last: 1) {
            edges {
                node {
                    content
                    author {
                        username
                    }
                }
            }
        }
    }
`;

Channel.muiName = 'ListItem';
Channel.defaultProps = {
    nestedItems: [],
};

export default Channel;
