const {
    GraphQLString,
    GraphQLObjectType,
} = require('graphql');
const {
    globalIdField,
    connectionArgs,
    connectionFromArray,
    connectionFromArraySlice,
    getOffsetWithDefault,
    connectionDefinitions,
} = require('graphql-relay');

const {
    getCurrentOffset,
    listMessages,
} = require('../../utils/kafka');

const { userConnection } = require('./user');
const { messageConnection } = require('./message');
const { nodeInterface } = require('../node');

const cache = {};
const nodeType = exports.channelType = new GraphQLObjectType({
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
        users: {
            type: userConnection,
            args: connectionArgs,
            resolve: (_, args) => connectionFromArray([], args),
        },
        messages: {
            description: 'Cette connection est toujours vide, utiliser la subscription messagesSubscribe pour obtenir son contenu',
            type: messageConnection,
            args: connectionArgs,
            async resolve(name, args) {
                const length = await getCurrentOffset(name);
                if (length === 0) {
                    return connectionFromArray([], args);
                }

                const { after, before, first, last } = args;
                const lastOffset = length - 1;

                const from = Math.max(
                    getOffsetWithDefault(after, 0),
                    typeof first === 'number' ? first : 0
                );
                const to = Math.min(
                    getOffsetWithDefault(before, lastOffset),
                    typeof last === 'number' ? Math.max(lastOffset - last, 0) : lastOffset
                );

                const list = await listMessages(name, from, to);
                return connectionFromArraySlice(list, args, {
                    sliceStart: from,
                    arrayLength: length,
                });
            },
        },
    },
});

const { connectionType, edgeType } = connectionDefinitions({ nodeType });
exports.channelConnection = connectionType;
exports.channelEdge = edgeType;
