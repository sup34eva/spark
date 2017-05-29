// @flow
import React, { Component } from 'react';
import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';
import { connect } from 'react-redux';

import environment from '../../utils/relay';
import { storage } from '../../utils/firebase';
import nextPushId from '../../utils/firebase/nextPushId';
import MessagesSubscription from '../../subscriptions/messages';
import PostMessageMutation from '../../mutations/postMessage';

import DropZone from '../base/dropZone';
import BatchedSprings, { PRESET_ZOOM } from '../base/batchedSprings';
import Message from '../item/message';
import InfiniteList from '../base/infiniteList';

import styles from './messages.css';

/* eslint-disable react/no-unused-prop-types */
type Viewer = {
    channel: {
        name: string,
        messages: {
            edges: Array<Object>,
            pageInfo: {
                hasPreviousPage: boolean,
            },
        },
    },
};
/* eslint-enable react/no-unused-prop-types */

class MessageList extends Component {
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

            environment.commitUpdate(
                new PostMessageMutation({
                    kind: 'FILE',
                    content: id,
                    user: this.props.uid,
                    channel: this.props.viewer.channel,
                }),
            );
        });
    }

    getMessages(viewer: Viewer) {
        const messages = [...viewer.channel.messages.edges];
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
        this.props.relay.setVariables({
            count: this.props.relay.variables.count + 20,
        });
    }

    props: {
        uid: string,
        viewer: Viewer,
        relay: {
            setVariables: (Object) => void,
            variables: {
                count: number,
            },
        },
    };

    render() {
        const { viewer } = this.props;
        const { hasPreviousPage } = viewer.channel.messages.pageInfo;
        const { list } = this.getMessages(viewer);

        return (
            // $FlowIssue
            <DropZone className={styles.messageList} onDrop={this.onFileDrop}>
                <InfiniteList canLoadMore={hasPreviousPage} onLoadMore={this.fetchMore}>
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

export const messageFragment = Relay.QL`
    fragment on Message {
        id
        time
        ${Message.getFragment('message')}
    }
`;

export default RelaySubscriptions.createContainer(reduxConnector(MessageList), {
    initialVariables: {
        channel: null,
        count: 20,
    },
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                channel(name: $channel) {
                    name
                    messages(last: $count) {
                        edges {
                            node {
                                ${messageFragment}
                            }
                        }
                        pageInfo {
                            hasPreviousPage
                        }
                    }

                    ${MessagesSubscription.getFragment('channel')}
                    ${PostMessageMutation.getFragment('channel')}
                }
            }
        `,
    },
    subscriptions: [
        ({ viewer }) => new MessagesSubscription({ channel: viewer.channel }),
    ],
});
