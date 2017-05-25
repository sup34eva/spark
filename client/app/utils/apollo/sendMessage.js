import { gql, graphql } from 'react-apollo';
import update from 'immutability-helper';
import { offsetToCursor, toGlobalId } from 'graphql-relay';

export default messageFragment => graphql(gql`
    mutation PostMessageMutation($input: PostMessageInput!) {
        postMessage(input: $input) {
            messageEdge {
                cursor
                node {
                    id
                    ...MessageFragment
                }
            }
        }
    }

    ${messageFragment}
`, {
    props: ({ mutate }) => ({
        postMessage: (channel, { kind, content }) => {
            const offset = 0;
            /* if (ownProps.channel.messages.pageInfo.endCursor !== undefined) {
                offset = cursorToOffset(ownProps.channel.messages.pageInfo.endCursor) + 1;
            }*/

            return mutate({
                variables: {
                    input: { channel, kind, content },
                },
                optimisticResponse: {
                    __typename: 'RootMutation',
                    postMessage: {
                        __typename: 'PostMessagePayload',
                        messageEdge: {
                            __typename: 'MessageEdge',
                            cursor: offsetToCursor(offset),
                            node: {
                                __typename: 'Message',
                                id: toGlobalId(
                                    'Message',
                                    `${channel}:${offset}`,
                                ),
                                kind,
                                content,
                                time: Date.now(),
                                author: {
                                    __typename: 'User',
                                    id: toGlobalId('User', 0),
                                    avatar: 'http://i.imgur.com/pv1tBmT.png',
                                },
                            },
                        },
                    },
                },
                updateQueries: {
                    MessageList: (prev, { mutationResult }) => {
                        console.log('updateQueries', prev, mutationResult);
                        return update(prev, {
                            viewer: {
                                channel: {
                                    messages: {
                                        edges: {
                                            $push: [mutationResult.data.postMessage.messageEdge],
                                        },
                                    },
                                },
                            },
                        });
                    },
                },
            });
        },
    }),
});
