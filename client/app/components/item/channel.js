// @flow
import React from 'react';

import { ListItem } from 'material-ui/List';
import Mosaic from '../base/avatars';

type Props = {
    channel: {
        name: string,
        subtext: ?string,
        users: ?{
            [key: string]: string,
        },
    },

    onTouchTap?: () => void,
    style?: Object,
};

const Channel = ({ channel: { name, subtext, users }, style, onTouchTap }: Props) => (
    <ListItem
        style={style}
        onTouchTap={onTouchTap}
        leftAvatar={
            // $FlowIssue
            <Mosaic images={users ? Object.values(users).map(user => user) : []} />
        }
        primaryText={name}
        secondaryText={subtext} />
);

Channel.muiName = 'ListItem';
Channel.defaultProps = {
    nestedItems: [],
};

export default Channel;
