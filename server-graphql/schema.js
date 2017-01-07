const {
    GraphQLID,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInputObjectType,
} = require('graphql');
const {
    toGlobalId,
    globalIdField,
    offsetToCursor,
    connectionArgs,
    connectionFromArray,
    nodeDefinitions,
    connectionDefinitions,
    mutationWithClientMutationId,
} = require('graphql-relay');

const {
    subscriptionWithClientSubscriptionId,
} = require('./utils/graphql');
const {
    sendMessage,
    createConsumer,
} = require('./utils/kafka');

const { nodeInterface, nodeField } = nodeDefinitions(
    globalId => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'Message') {
            return null;
        }
        if (type === 'Channel') {
            return { };
        }
    },
    obj => {
        return obj.messages ? channelType : messageType;
    }
);

const messageType = new GraphQLObjectType({
    name: 'Message',
    interfaces: [ nodeInterface ],
    fields: {
        id: globalIdField('Message', message => message.offset),
        offset: {
            type: GraphQLInt,
        },
        value: {
            type: GraphQLString,
        },
    },
});

const {
    connectionType: messageConnection,
    edgeType: messageEdge,
} = connectionDefinitions({
    nodeType: messageType,
});

const channelType = new GraphQLObjectType({
    name: 'Channel',
    interfaces: [ nodeInterface ],
    fields: {
        id: globalIdField(
            'Channel',
            name => name
        ),
        name: {
            type: GraphQLString,
            resolve: name => name,
        },
        messages: {
            type: messageConnection,
            args: connectionArgs,
            resolve: (_, args) => connectionFromArray([], args),
        },
    },
});

const {
    connectionType: channelConnection,
} = connectionDefinitions({
    nodeType: channelType,
});

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
            channels: {
                type: channelConnection,
                args: connectionArgs,
                resolve(_, args) {
                    return connectionFromArray([ 'test' ], args);
                },
            },
            channel: {
                type: channelType,
                args: {
                    name: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                },
                resolve: (root, { name }) => name,
            },
        },
    }),
    mutation: new GraphQLObjectType({
        name: 'RootMutation',
        fields: {
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
                        resolve: ({ messageEdge }) => ({
                            cursor: offsetToCursor(messageEdge.offset),
                            node: messageEdge,
                        }),
                    },
                    channel: {
                        type: channelType,
                    },
                },
                mutateAndGetPayload({ channel, message }) {
                    return sendMessage({
                        topic: channel,
                        messages: message,
                    }).then(offset => ({
                        channel,
                        messageEdge: {
                            offset,
                            value: message,
                        },
                    }));
                },
            }),
        },
    }),
    subscription: new GraphQLObjectType({
        name: 'RootSubscription',
        fields: {
            messagesSubscribe: subscriptionWithClientSubscriptionId({
                name: 'MessagesSubscribe',
                inputFields: {
                    channel: {
                        type: new GraphQLNonNull(GraphQLString),
                    },
                },
                outputFields: {
                    messageEdge: {
                        type: messageEdge,
                        resolve: () => null,
                    },
                    channel: {
                        type: channelType,
                        resolve: ({ channel }) => channel,
                    },
                },
                start(publish, { channel }) {
                    const consumer = createConsumer(channel);

                    consumer.on('message', message => {
                        publish({
                            channel: {
                                id: toGlobalId('Channel', channel),
                            },
                            messageEdge: {
                                __typename: 'MessageEdge',
                                cursor: offsetToCursor(message.offset),
                                node: {
                                    id: toGlobalId('Message', message.offset),
                                    offset: message.offset,
                                    value: message.value,
                                },
                            },
                        });
                    });

                    return consumer;
                },
                stop(consumer) {
                    consumer.close();
                },
            }),
        },
    }),
});
