const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLObjectType,
} = require('graphql');
const {
    globalIdField,
    connectionArgs,
    connectionFromPromisedArray,
} = require('graphql-relay');

const { listChannels } = require('../../utils/kafka');
const { channelType, channelConnection } = require('./channel');

exports.VIEWER_SINGLETON = { id: 0 };
exports.viewerType = new GraphQLObjectType({
    name: 'Viewer',
    fields: {
        id: globalIdField('Viewer'),
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
});
