// @flow
import { graphql, commitMutation } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import {
    cursorToOffset,
    offsetToCursor,
    toGlobalId,
 } from 'graphql-relay';

import environment from './index';

type Props = {
    kind: string,
    content: string,
    user: string,
    channel: {
        id: string,
        name: string,
        messages: {
            pageInfo: {
                endCursor: string,
            },
        },
    },
};

const updater = store => {
    const rootField = store.getRootField('postMessage');
    const channel = rootField.getLinkedRecord('channel');

    const messageEdge = rootField.getLinkedRecord('messageEdge');
    const node = messageEdge.getLinkedRecord('node');

    const messages = ConnectionHandler.getConnection(channel, 'MessageList_messages');

    const pageInfo = messages.getLinkedRecord('pageInfo');
    const currentCursor = pageInfo.getValue('endCursor');
    const newCursor = messageEdge.getValue('cursor');
    pageInfo.setValue(newCursor, 'endCursor');

    const edge = ConnectionHandler.createEdge(
        store,
        messages,
        node,
        'MessageEdge',
    );

    ConnectionHandler.insertEdgeAfter(messages, edge, currentCursor);
};

export default ({ channel, user, kind, content }: Props) => commitMutation(environment, {
    mutation: graphql`
        mutation postMessage_PostMessageMutation($input: PostMessageInput!) {
            postMessage(input: $input) {
                messageEdge {
                    cursor
                    node {
                        id
                        time
                        kind
                        content
                        author {
                            id
                        }
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
            channel: channel.name,
            kind,
            content,
        },
    },

    optimisticResponse: () => {
        let index = 0;
        if (channel.messages.pageInfo.endCursor) {
            index = cursorToOffset(channel.messages.pageInfo.endCursor) + 1;
        }

        return {
            postMessage: {
                channel: {
                    id: channel.id,
                },
                messageEdge: {
                    cursor: offsetToCursor(index),
                    node: {
                        id: toGlobalId(
                            'Message',
                            `${channel.name}:${index + 1}`,
                        ),
                        kind,
                        content,
                        time: Date.now(),
                        author: {
                            id: toGlobalId('User', user),
                        },
                    },
                },
            },
        };
    },

    updater,
    optimisticUpdater: updater,
});
