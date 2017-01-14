// @flow
import React from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';

import RefreshIndicator from 'material-ui/RefreshIndicator';

import Message from './item_message';
import MessagesSubscription from '../subscriptions/messages';

import styles from './list_messages.css';

class MessageList extends React.Component {
    componentWillUpdate() {
        const scroll = this.node.scrollTop + this.node.offsetHeight;
        this.shouldScrollBottom = scroll === this.node.scrollHeight;
    }

    componentDidUpdate() {
        if (this.shouldScrollBottom) {
            this.node.scrollTop = this.node.scrollHeight;
        }
    }

    node: any;
    shouldScrollBottom: boolean;
    props: {
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

    render() {
        return (
            <div className={styles.messageList} ref={node => { this.node = node; }}>
                <RefreshIndicator size={50} top={8} left={8} status="loading" style={{
                    transform: 'unset',
                    top: 'unset',
                    right: 'unset',
                    position: 'static',
                    margin: '8px auto',
                }} />
                {this.props.channel.messages.edges
                    .sort((a, b) => a.node.time - b.node.time)
                    .map(({ node }) => (
                        <Message key={node.id} message={node} />
                    ))
                }
            </div>
        );
    }
}

export const messageFragment = Relay.QL`
    fragment on Message {
        id
        time
        ${Message.getFragment('message')}
    }
`;

export default RelaySubscriptions.createContainer(MessageList, {
    initialVariables: {
        count: 20,
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
