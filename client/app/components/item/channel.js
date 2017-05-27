// @flow
import React from 'react';

import { ListItem } from 'material-ui/List';
import Mosaic from '../base/avatars';

type Props = {
    /* eslint-disable react/no-unused-prop-types */
    channel: {
        name: string,
        subtext: ?string,
        users: ?{
            [key: string]: string,
        },
    },
    /* eslint-enable react/no-unused-prop-types */

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
