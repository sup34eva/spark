const {
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInputObjectType,
} = require('graphql');
const {
    mutationWithClientMutationId,
} = require('graphql-relay');

const {
    subscriptionWithClientSubscriptionId,
} = require('./graphql');
const {
    sendMessage,
    createConsumer,
} = require('./kafka');

const Message = new GraphQLObjectType({
    name: 'Message',
    fields: {
        offset: {
            type: GraphQLInt,
        },
        value: {
            type: GraphQLString,
        },
    },
});

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
            channels: {
                type: new GraphQLList(GraphQLString),
                resolve() {
                    return [ 'test' ];
                },
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
                    message: {
                        type: Message,
                    },
                },
                mutateAndGetPayload({ channel, message }) {
                    return sendMessage({
                        topic: channel,
                        messages: message,
                    }).then(offset => ({
                        message: {
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
                    message: {
                        type: Message,
                    },
                },
                start(publish, { channel }) {
                    const consumer = createConsumer(channel);

                    consumer.on('message', message => {
                        publish({ message });
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
