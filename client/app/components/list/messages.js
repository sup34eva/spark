// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';
import update from 'immutability-helper';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import CircularProgress from 'material-ui/CircularProgress';

import { storage } from '../../utils/firebase';
import nextPushId from '../../utils/firebase/nextPushId';
import sendMessageMutation from '../../utils/apollo/sendMessage';
import Message, { fragment as messageFragment } from '../item/message';
import InfiniteList from '../base/infiniteList';

import styles from './messages.css';

type MessagePayload = {
    kind: 'TEXT' | 'FILE',
    content: string,
};

class MessageList extends React.Component {
    constructor(props, ctx) {
        super(props, ctx);
        // $FlowIssue
        this.onDrop = this.onDrop.bind(this);
    }

    componentDidMount() {
        this.unsubscribe = this.props.subscribeToMore();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    async onDrop(evt) {
        evt.preventDefault();
        const { items, files } = evt.dataTransfer;
        const blobs = Array.from(items || files).map(entry => {
            if (entry.kind === 'file') {
                return entry.getAsFile();
            }

            return entry;
        });

        const entries = await Promise.all(
            blobs.map(async blob => {
                const id = nextPushId(new Date().getTime());
                const ref = storage.ref(`${this.props.channel}/${id}`);

                await ref.put(blob);
                await ref.updateMetadata({
                    contentType: blob.type,
                    customMetadata: {
                        displayName: blob.name,
                    },
                });

                this.props.postMessage(this.props.channel, {
                    kind: 'FILE',
                    content: id,
                });
            }),
        );

        console.log('onDrop', entries);
    }
    onDragOver = evt => {
        evt.preventDefault();
    }
    handleList = (list: HTMLDivElement) => {
        if (list) {
            // $FlowIssue
            list.addEventListener('drop', this.onDrop);
            // $FlowIssue
            list.addEventListener('dragover', this.onDragOver);
        } else {
            this.list.removeEventListener('drop', this.onDrop);
            this.list.removeEventListener('dragover', this.onDragOver);
        }
        this.list = list;
    }

    list: HTMLDivElement;
    unsubscribe: () => void;
    props: {
        channel: string,
        loading: boolean,
        viewer: ?Object,
        fetchMore: () => void,
        subscribeToMore: () => (() => void),
        postMessage: (string, MessagePayload) => void,
    };

    render() {
        if (this.props.loading || !this.props.viewer) {
            return (
                <div className={styles.messageList} style={{ height: '100%', justifyContent: 'center' }}>
                    <CircularProgress style={{ alignSelf: 'center' }} />
                </div>
            );
        }

        const viewer = (this.props.viewer: Object);
        const messages = [...viewer.channel.messages.edges];
        messages.sort((a, b) => a.node.time - b.node.time);

        return (
            <InfiniteList
                key={viewer.channel.id}
                containerRef={this.handleList}
                className={styles.messageList}
                canLoadMore={viewer.channel.messages.pageInfo.hasPreviousPage}
                onLoadMore={this.props.fetchMore}>
                <ReactCSSTransitionGroup
                    transitionName="message"
                    transitionAppear
                    transitionAppearTimeout={1616}
                    transitionEnterTimeout={1616}
                    transitionLeaveTimeout={1616}>
                    {messages.reduce(({ list, lastTime }, { node }) => {
                        const thisTime = new Date(node.time);
                        if (thisTime.getDay() !== lastTime.getDay()) {
                            const timeString = thisTime.toLocaleDateString();
                            list.push(
                                <p key={timeString} className={styles.date}>
                                    {timeString}
                                </p>,
                            );
                        }

                        list.push(
                            <Message key={node.id} message={node} />,
                        );

                        return { list, lastTime: thisTime };
                    }, {
                        list: [],
                        lastTime: new Date(0),
                    }).list}
                </ReactCSSTransitionGroup>
            </InfiniteList>
        );
    }
}

const apolloConnector = graphql(gql`
    query MessageList($name: String!, $count: Int!) {
        viewer {
            channel(name: $name) {
                id
                messages(last: $count) {
                    edges {
                        node {
                            id
                            ...MessageFragment
                        }
                    }
                    pageInfo {
                        hasPreviousPage
                    }
                }
            }
        }
    }

    ${messageFragment}
`, {
    options: ({ channel }) => ({
        variables: {
            name: channel,
            count: 20,
        },
    }),
    props: ({ data: { loading, viewer, variables, fetchMore, subscribeToMore } }) => ({
        loading,
        viewer,
        fetchMore: () => fetchMore({
            variables: {
                ...variables,
                count: variables.count + 20,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                    return prev;
                }

                return update(prev, {
                    viewer: {
                        channel: {
                            messages: {
                                edges: {
                                    $unshift: fetchMoreResult.viewer.channel.messages.edges,
                                },
                            },
                        },
                    },
                });
            },
        }),
        subscribeToMore: () => subscribeToMore({
            document: gql`
                subscription MessageListSubscription($input: MessagesSubscribeInput!) {
                    messagesSubscribe(input: $input) {
                        messageEdge {
                            node {
                                id
                                time
                            }
                        }
                    }
                }
            `,
            variables: {
                input: {
                    channel: variables.name,
                },
            },
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) {
                    return prev;
                }

                return update(prev, {
                    viewer: {
                        channel: {
                            messages: {
                                edges: {
                                    $push: [subscriptionData.data.messagesSubscribe.messageEdge],
                                },
                            },
                        },
                    },
                });
            },
        }),
    }),
});

const sendMessage = sendMessageMutation(messageFragment);

export default apolloConnector(sendMessage(MessageList));
