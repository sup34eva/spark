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

const { auth } = require('../../utils/firebase');
const { listChannels } = require('../../utils/kafka');
const { channelType, channelConnection } = require('./channel');
const { userType } = require('./user');

module.exports = new GraphQLObjectType({
    name: 'Viewer',
    fields: {
        id: globalIdField(
            'Viewer',
            (_, { token }) => token
        ),

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
            resolve: (_, { name }) => name,
        },

        user: {
            description: `Obtiens le profil d'un utilisateur via son id`,
            type: userType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            resolve: (_, { id }) => auth.getUser(id),
        }
    },
});
