// @flow
import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';

import Message from './item_message';
import MessagesSubscription from '../subscriptions/messages';

import styles from './list_messages.css';

type Props = {
    channel: {
        messages: {
            edges: Array<{
                node: {
                    id: string,
                    time: number,
                },
            }>,
        },
    },
};

const MessageList = (props: Props) => (
    <div className={styles.messageList}>
        {props.channel.messages.edges
            .sort((a, b) => a.node.time - b.node.time)
            .map(({ node }) => (
                <Message key={node.id} message={node} />
            ))
        }
    </div>
);

export const messageFragment = Relay.QL`
    fragment on Message {
        id
        time
        ${Message.getFragment('message')}
    }
`;

export default RelaySubscriptions.createContainer(MessageList, {
    initialVariables: {
        count: 50,
    },
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                messages(last: $count) {
                    edges {
                        node {
                            ${messageFragment}
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
