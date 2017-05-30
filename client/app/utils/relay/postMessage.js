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

    const edge = ConnectionHandler.createEdge(
        store,
        messages,
        node,
        'MessageEdge',
    );

    ConnectionHandler.insertEdgeAfter(messages, edge);
};

export default ({ channel, user, kind, content }: Props) => commitMutation(environment, {
    mutation: graphql`
        mutation postMessage_PostMessageMutation($input: PostMessageInput!) {
            postMessage(input: $input) {
                messageEdge {
                    cursor
                    node {
                        id
                        kind
                        content
                        time
                        author {
                            id
                        }
                    }
                }
                channel {
                    id
                    name
                    messages {
                        pageInfo {
                            endCursor
                        }
                    }
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
        let offset = 0;
        if (channel.messages.pageInfo.endCursor) {
            offset = cursorToOffset(channel.messages.pageInfo.endCursor) + 2;
        }

        return {
            postMessage: {
                channel: {
                    id: channel.id,
                    name: channel.name,
                    messages: {
                        pageInfo: {
                            endCursor: offsetToCursor(offset),
                        },
                    },
                },
                messageEdge: {
                    cursor: offsetToCursor(offset),
                    node: {
                        id: toGlobalId(
                            'Message',
                            `${channel.name}:${offset}`,
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
