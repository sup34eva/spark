// @flow
import React from 'react';
import Relay from 'react-relay';
import Drawer from 'material-ui/Drawer';
import { List, makeSelectable, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import {
    connect,
} from 'react-redux';

import {
    selectChannel,
} from '../actions/chat';
import {
    environment,
    ChannelsQuery,
} from '../utils/relay';

const SelectableList = makeSelectable(List);

type Props = {
    channel: ?string,
    selectChannel: (any, string) => void,
    channels: {
        edges: Array<{
            node: {
                id: string,
                name: string,
            },
        }>,
    },
};

const ChannelList = (props: Props) => (
    <Drawer open>
        <SelectableList value={props.channel} onChange={props.selectChannel}>
            <Subheader>Channels</Subheader>
            {props.channels.edges.map(({ node }) => (
                <ListItem key={node.id} value={node.name} primaryText={node.name} />
            ))}
        </SelectableList>
    </Drawer>
);

const ListConnect = connect(
    ({ chat }) => ({
        channel: chat.channel,
    }),
    dispatch => ({
        selectChannel: (evt, name) => {
            dispatch(selectChannel(name));
        },
    }),
)(ChannelList);

const ListContainer = Relay.createContainer(ListConnect, {
    fragments: {
        channels: () => Relay.QL`
            fragment on ChannelConnection {
                edges {
                    node {
                        id
                        name
                    }
                }
            }
        `,
    },
});

export default () => (
    <Relay.Renderer
        Container={ListContainer}
        environment={environment}
        queryConfig={new ChannelsQuery()} />
);
