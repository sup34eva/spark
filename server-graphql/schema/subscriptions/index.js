const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLObjectType,
} = require('graphql');
const {
    offsetToCursor,
} = require('graphql-relay');

const {
    subscriptionWithClientSubscriptionId,
} = require('../../utils/graphql');
const {
    createConsumer,
} = require('../../utils/kafka');

const { channelType } = require('../types/channel');
const { messageEdge } = require('../types/message');

module.exports = new GraphQLObjectType({
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
                return createConsumer(channel)
                    .then(consumer => {
                        consumer.on('message', ({ key, offset, value }) => {
                            const node = JSON.parse(value);
                            publish({
                                channel,
                                messageEdge: {
                                    cursor: offsetToCursor(offset),
                                    node: Object.assign({}, node, {
                                        id: `${channel}:${offset}`,
                                        uuid: key,
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
                    });
            },
            stop(consumer) {
                consumer.close();
            },
        }),
    },
});
