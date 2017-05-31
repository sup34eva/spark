// @flow
import React, { PureComponent } from 'react';
import { graphql } from 'react-relay';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import CircularProgress from 'material-ui/CircularProgress';

import DropZone from 'components/base/dropZone';
import BatchedSprings, { PRESET_ZOOM } from 'components/base/batchedSprings';
import Message from 'components/item/message';
import InfiniteList from 'components/base/infiniteList';
import { storage } from 'utils/firebase';
import nextPushId from 'utils/firebase/nextPushId';
import postMessage from 'utils/relay/postMessage';
import subscribeMessages from 'utils/relay/subscribeMessages';
import { withRenderer, withPagination } from 'utils/relay/enhancers';

/* eslint-disable camelcase */
import type { messages_channel } from './__generated__/messages_channel.graphql';
import type { messages_MessageListQuery } from './__generated__/messages_MessageListQuery.graphql';
/* eslint-enable camelcase */
import styles from './messages.css';

const LoadingList = () => (
    <div className={styles.loadingList}>
        <CircularProgress />
    </div>
);

class MessageList extends PureComponent {
    async componentDidMount() {
        this.subscription = await subscribeMessages({
            channel: this.props.viewer.channel.name,
        });
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.dispose();
            this.subscription = null;
        }
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

    // eslint-disable-next-line no-undef
    getMessages(edges: $ReadOnlyArray<Object>) {
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

    // eslint-disable-next-line no-undef
    subscription: Disposable;
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
        const { messages } = this.props.channel;
        if (!messages || !messages.edges) {
            return <LoadingList />;
        }

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

const enhancer = compose(
    withRenderer({
        query,
        LoadingComponent: LoadingList,
        variables: {
            count: 20,
        },
        mapResultToProps: ({ viewer }) => ({
            viewer,
            channel: viewer.channel,
        }),
    }),
    withPagination({
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
    }, {
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
    }),
    connect(
        ({ auth }) => ({
            uid: auth.user.uid,
        }),
    ),
);

export default enhancer(MessageList);
