const uuid = require('node-uuid');
const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLObjectType,
} = require('graphql');
const {
    offsetToCursor,
    cursorForObjectInConnection,
    mutationWithClientMutationId,
} = require('graphql-relay');

const {
    createChannel,
    listChannels,
    sendMessage,
} = require('../../utils/kafka');
const { database, auth, exists } = require('../../utils/firebase');

const { channelKind, channelType, channelEdge } = require('../types/channel');
const { messageEdge, messageKind } = require('../types/message');
const viewerType = require('../types/viewer');

module.exports = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        createChannel: mutationWithClientMutationId({
            name: 'CreateChannel',
            inputFields: {
                name: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                type: {
                    type: new GraphQLNonNull(channelKind),
                },
            },
            outputFields: {
                channelEdge: {
                    type: channelEdge,
                },
                viewer: {
                    type: viewerType,
                },
            },
            async mutateAndGetPayload({ name, type }, { token }) {
                if(await exists('/channels/' + name)) {
                    throw new Error(`Channel ${name} already exists`);
                }

                const { sub } = await auth.verifyIdToken(token);

                await createChannel(name);

                database.ref('/channels/' + name).set({
                    type,
                    users: {
                        [sub]: 'moderator',
                    },
                });

                return {
                    viewer: {
                        id: token,
                    },
                    channelEdge: {
                        node: name,
                    },
                };
            },
        }),
        postMessage: mutationWithClientMutationId({
            name: 'PostMessage',
            inputFields: {
                channel: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                kind: {
                    type: new GraphQLNonNull(messageKind),
                },
                content: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            outputFields: {
                messageEdge: {
                    type: messageEdge,
                },
                channel: {
                    type: channelType,
                },
            },
            async mutateAndGetPayload({ channel, kind, content }, { token }) {
                const { sub } = await auth.verifyIdToken(token);

                const key = uuid.v1();
                const value = {
                    kind, content,
                    author: sub,
                    time: Date.now(),
                };

                const offset = await sendMessage({
                    key,
                    topic: channel,
                    value: JSON.stringify(value),
                });

                if(kind === 'TEXT') {
                    database.ref('/channels/' + channel + '/subtext').set({
                        user: sub,
                        content,
                    });
                }

                return {
                    channel,
                    messageEdge: {
                        cursor: offsetToCursor(offset - 1),
                        node: Object.assign({}, value, {
                            id: `${channel}:${offset}`,
                            uuid: key,
                        }),
                    },
                };
            },
        }),
    },
});
