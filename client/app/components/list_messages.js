// @flow
import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';

import Message from './item_message';
import MessagesSubscription from '../subscriptions/messages';

type Props = {
    channel: any,
};

const MessageList = (props: Props) => (
    <div>
        {props.channel.messages.edges
            .sort((a, b) => a.node.offset - b.node.offset)
            .map(({ node }) => (
                <Message key={node.id} message={node} />
            ))
        }
    </div>
);

export default RelaySubscriptions.createContainer(MessageList, {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                messages(last: 25) {
                    edges {
                        node {
                            id
                            offset
                            ${Message.getFragment('message')}
                        }
                    }
                }
                ${MessagesSubscription.getFragment('channel')}
            }
        `,
    },

    subscriptions: [
        ({ channel }) => new MessagesSubscription({ channel }),
    ],
});
