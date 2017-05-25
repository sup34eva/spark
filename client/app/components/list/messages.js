// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';
import update from 'immutability-helper';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import CircularProgress from 'material-ui/CircularProgress';

import Message, { fragment as messageFragment } from '../item/message';
import InfiniteList from '../base/infiniteList';

import styles from './messages.css';

class MessageList extends React.Component {
    componentDidMount() {
        this.unsubscribe = this.props.subscribeToMore();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    unsubscribe: () => void;
    props: {
        loading: boolean,
        viewer: ?Object,
        fetchMore: () => void,
        subscribeToMore: () => (() => void),
    };

    render() {
        console.log('MessageList', this.props);
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

export default apolloConnector(MessageList);
