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
const { database, auth } = require('../../utils/firebase');

const { channelType, channelEdge } = require('../types/channel');
const { messageEdge } = require('../types/message');
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
            },
            outputFields: {
                channelEdge: {
                    type: channelEdge,
                },
                viewer: {
                    type: viewerType,
                },
            },
            async mutateAndGetPayload({ name }, { token }) {
                const { sub } = await auth.verifyIdToken(token);
                const channel = database.ref('/channels/' + name + '/users').push().set(sub);

                await createChannel(name);

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
                message: {
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
            async mutateAndGetPayload({ channel, message }, { token }) {
                const { sub } = await auth.verifyIdToken(token);
                const key = uuid.v1();
                const value = {
                    content: message,
                    author: sub,
                    time: Date.now(),
                };

                const offset = await sendMessage({
                    key,
                    topic: channel,
                    value: JSON.stringify(value),
                });

                const user = await auth.getUser(sub);
                database.ref('/channels/' + channel + '/subtext').set(`${user.displayName}: ${message}`);

                return {
                    channel,
                    messageEdge: {
                        cursor: offsetToCursor(offset),
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
