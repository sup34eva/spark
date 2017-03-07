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
const { getUserByToken } = require('../../utils/auth');

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
            mutateAndGetPayload({ name }, { token }) {
                return createChannel(name)
                    .then(() => listChannels())
                    .then(channels => ({
                        viewer: {
                            id: token,
                        },
                        channelEdge: {
                            cursor: cursorForObjectInConnection(channels, name),
                            node: name,
                        },
                    }));
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
            mutateAndGetPayload: ({ channel, message }, { token }) =>
                getUserByToken(token)
                    .then(user => {
                        const key = uuid.v1();
                        const value = {
                            content: message,
                            author: user.user_id,
                            time: Date.now(),
                        };

                        return sendMessage({
                            key,
                            topic: channel,
                            value: JSON.stringify(value),
                        }).then(offset => ({
                            channel,
                            messageEdge: {
                                cursor: offsetToCursor(offset),
                                node: Object.assign({}, value, {
                                    id: `${channel}:${offset}`,
                                    uuid: key,
                                    author: user,
                                }),
                            },
                        }));
                    }),
        }),
    },
});
