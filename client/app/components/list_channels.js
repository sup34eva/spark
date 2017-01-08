// @flow
import React from 'react';
import Relay from 'react-relay';

import {
    environment,
    ChannelsQuery,
} from '../utils/relay';

import Channel from './item_channel';

type Props = {
    channels: {
        edges: Array<{
            node: {
                id: string,
            },
        }>,
    },
};

const List = (props: Props) => (
    <div>
        {props.channels.edges.map(({ node }) => (
            <Channel key={node.id} channel={node} />
        ))}
    </div>
);

const ListContainer = Relay.createContainer(List, {
    fragments: {
        channels: () => Relay.QL`
            fragment on ChannelConnection {
                edges {
                    node {
                        id
                        ${Channel.getFragment('channel')}
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
