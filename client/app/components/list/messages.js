// @flow
import React, { Component } from 'react';
import { graphql, requestSubscription, createPaginationContainer } from 'react-relay';
import { connect } from 'react-redux';

import environment from '../../utils/relay';
import { storage } from '../../utils/firebase';
import nextPushId from '../../utils/firebase/nextPushId';
import connectRelay from '../../utils/relay/renderer';
import postMessage from '../../utils/relay/postMessage';

import DropZone from '../base/dropZone';
import BatchedSprings, { PRESET_ZOOM } from '../base/batchedSprings';
import Message from '../item/message';
import InfiniteList from '../base/infiniteList';

/* eslint-disable camelcase */
import type { messages_channel } from './__generated__/messages_channel.graphql';
import type { messages_MessageListQuery } from './__generated__/messages_MessageListQuery.graphql';
/* eslint-enable camelcase */

import styles from './messages.css';

class MessageList extends Component {
    componentDidMount() {
        requestSubscription(environment, {
            subscription: graphql`
                subscription messages_NewMessageSubscription($input: MessagesSubscribeInput!) {
                    messagesSubscribe(input: $input) {
                        messageEdge {
                            node {
                                id
                                time
                                ...message_message
                            }
                        }
                        channel {
                            id
                        }
                    }
                }
            `,
            variables: {
                input: {
                    channel: this.props.viewer.channel.name,
                },
            },
        });
    }

    onFileDrop = files => {
        const channel = this.props.viewer.channel.name;
        files.forEach(async blob => {
            const id = nextPushId(new Date().getTime());
            const ref = storage.ref(`${channel}/${id}`);

            await ref.put(blob);
            await ref.updateMetadata({
                contentType: blob.type,
                customMetadata: {
                    displayName: blob.name,
                },
            });

            postMessage({
                kind: 'FILE',
                content: id,
                user: this.props.uid,
                channel: {
                    ...this.props.viewer.channel,
                    ...this.props.channel,
                },
            });
        });
    }

    getMessages(edges: Array<Object>) {
        const messages = [...edges];
        messages.sort((a, b) => a.node.time - b.node.time);

        return messages.reduce(({ list, lastTime }, { node }) => {
            const thisTime = new Date(node.time);
            if (thisTime.getDay() !== lastTime.getDay()) {
                const timeString = thisTime.toLocaleDateString();
                list.push(
                    // $FlowIssue
                    <BatchedSprings key={timeString} springs={PRESET_ZOOM}>
                        {({ opacity, scale }) => (
                            <p className={styles.date} style={{ opacity, transform: `scale(${scale})` }}>
                                {timeString}
                            </p>
                        )}
                    </BatchedSprings>,
                );
            }

            list.push(
                <Message key={node.id} message={node} />,
            );

            return { list, lastTime: thisTime };
        }, {
            list: [],
            lastTime: new Date(0),
        });
    }

    fetchMore = () => {
        if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
            return;
        }

        this.props.relay.loadMore(20);
    }

    props: {
        /* eslint-disable camelcase, react/no-unused-prop-types */
        channel: messages_channel,
        viewer: messages_MessageListQuery,
        /* eslint-enable camelcase, react/no-unused-prop-types */

        uid: string,
        relay: {
            isLoading: () => boolean,
            hasMore: () => boolean,
            loadMore: (number) => void,
        },
    };

    render() {
        console.log('MessageList', this.props);

        const { messages } = this.props.channel;
        const { list } = this.getMessages(messages.edges);

        return (
            // $FlowIssue
            <DropZone className={styles.messageList} onDrop={this.onFileDrop}>
                <InfiniteList canLoadMore={this.props.relay.hasMore()} onLoadMore={this.fetchMore}>
                    {list}
                </InfiniteList>
            </DropZone>
        );
    }
}

const reduxConnector = connect(
    ({ auth }) => ({
        uid: auth.user.uid,
    }),
);

const query = graphql`
    query messages_MessageListQuery($channel: String!, $count: Int!, $cursor: String) {
        viewer {
            channel(name: $channel) {
                id
                name
                ...messages_channel
            }
        }
    }
`;

const relayConnector = connectRelay(
    query,
    {
        count: 20,
    },
    ({ viewer }) => ({
        viewer,
        channel: viewer.channel,
    }),
);

export default relayConnector(createPaginationContainer(
    reduxConnector(MessageList),
    {
        channel: graphql`
            fragment messages_channel on Channel {
                messages(last: $count, before: $cursor) @connection(key: "MessageList_messages") {
                    edges {
                        node {
                            id
                            time
                            ...message_message
                        }
                    }
                    pageInfo {
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                }
            }
        `,
    },
    {
        query,
        direction: 'backward',
        getConnectionFromProps: props => (
            props.channel && props.channel.messages
        ),
        getFragmentVariables: (prevVars, totalCount) => ({
            ...prevVars,
            count: totalCount,
        }),
        getVariables: (props, { count, cursor }) => ({
            channel: props.viewer.channel.name,
            count,
            cursor,
        }),
    },
));
