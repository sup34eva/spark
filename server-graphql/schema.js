const {
    GraphQLID,
    GraphQLInt,
    GraphQLFloat,
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
    connectionFromPromisedArray,
    nodeDefinitions,
    connectionDefinitions,
    mutationWithClientMutationId,
} = require('graphql-relay');

const {
    subscriptionWithClientSubscriptionId,
} = require('./utils/graphql');
const {
    listChannels,
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
            return id;
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
        id: globalIdField('Message'),
        content: {
            type: GraphQLString,
        },
        author: {
            type: GraphQLInt,
        },
        time: {
            type: GraphQLFloat,
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
            description: 'Cette connection est toujours vide, utiliser la subscription messagesSubscribe pour obtenir son contenu',
            type: messageConnection,
            args: connectionArgs,
            resolve: (_, args) => connectionFromArray([], args)
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
            node: nodeField,
            channels: {
                description: 'Liste des channels disponible',
                type: channelConnection,
                args: connectionArgs,
                resolve: (_, args) => connectionFromPromisedArray(listChannels(), args),
            },
            channel: {
                description: 'Obtiens une référence a un channel spécifique via son nom',
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
                    },
                    channel: {
                        type: channelType,
                    },
                },
                mutateAndGetPayload({ channel, message }) {
                    const value = {
                        content: message,
                        author: 0,
                        time: Date.now(),
                    };

                    return sendMessage({
                        topic: channel,
                        messages: JSON.stringify(value),
                    }).then(offset => ({
                        channel,
                        messageEdge: {
                            cursor: offsetToCursor(offset),
                            node: Object.assign({}, value, { id: offset }),
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
                description: `Emet tous les messages d'un channel`,
                inputFields: {
                    channel: {
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
                start(publish, { channel }) {
                    const consumer = createConsumer(channel);

                    consumer.on('message', ({ offset, value }) => {
                        const node = JSON.parse(value);
                        publish({
                            channel,
                            messageEdge: {
                                cursor: offsetToCursor(offset),
                                node: Object.assign({}, node, {
                                    id: offset,
                                }),
                            },
                        });
                    });

                    return {
                        data: consumer,
                        result: {
                            channel,
                            messageEdge: null,
                        },
                    };
                },
                stop(consumer) {
                    consumer.close();
                },
            }),
        },
    }),
});
