const {
    GraphQLString,
    GraphQLObjectType,
    GraphQLEnumType,
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

const kindEnum = exports.channelKind = new GraphQLEnumType({
    name: 'ChannelType',
    values: {
        CHANNEL: {},
        GROUP: {},
        CONVERSATION: {},
    },
});

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
        type: {
            type: kindEnum,
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
                console.log('log_1', name, args);

                const length = await getCurrentOffset(name);
                console.log('log_2', length);
                if (length === 0) {
                    return connectionFromArray([], args);
                }

                const { after, before, first, last } = args;
                const lastOffset = length - 1;

                let from = getOffsetWithDefault(after, 1);
                let to = getOffsetWithDefault(before, lastOffset);

                if (typeof last === 'number') {
                    from = Math.max(to - last, 1);
                }

                if(typeof first === 'number') {
                    to = Math.min(from + first, lastOffset);
                }

                console.log('log_3', name, args, length, from, to);

                const list = await listMessages(name, from, to);
                console.log('log_4', list);

                return connectionFromArraySlice(list, args, {
                    sliceStart: from - 1,
                    arrayLength: lastOffset,
                });
            },
        },
    },
});

const { connectionType, edgeType } = connectionDefinitions({ nodeType });
exports.channelConnection = connectionType;
exports.channelEdge = edgeType;
