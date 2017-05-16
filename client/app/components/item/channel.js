// @flow
import React from 'react';
import { gql } from 'react-apollo';

import { ListItem } from 'material-ui/List';
import Mosaic from '../base/avatars';

type Props = {
    channel: Object,
    onTouchTap?: () => void,
    style?: Object,
};

const Channel = ({ channel, style, onTouchTap }: Props) => (
    <ListItem
        style={style}
        onTouchTap={onTouchTap}
        leftAvatar={
            <Mosaic images={channel.users.map(user => user.picture)} />
        }
        primaryText={channel.name}
        secondaryText={
            [].map(
                ({ node: { content, author } }) => `${author.username}: ${content}`
            ).join('')
        } />
);

Channel.fragment = gql`
    fragment ChannelFragment on Channel {
        name
        users(first: 4) {
            picture
        }
    }
`;

Channel.muiName = 'ListItem';
Channel.defaultProps = {
    nestedItems: [],
};

export default Channel;
