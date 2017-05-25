const {
    GraphQLFloat,
    GraphQLString,
    GraphQLObjectType,
    GraphQLEnumType,
} = require('graphql');
const {
    globalIdField,
    connectionDefinitions,
} = require('graphql-relay');

const { auth } = require('../../utils/firebase');
const { userType } = require('./user');
const { nodeInterface } = require('../node');

const kindEnum = exports.messageKind = new GraphQLEnumType({
    name: 'MessageKind',
    values: {
        TEXT: {},
        FILE: {},
    },
});

const nodeType = exports.messageType = new GraphQLObjectType({
    name: 'Message',
    interfaces: [ nodeInterface ],
    fields: {
        id: globalIdField('Message'),
        uuid: {
            type: GraphQLString,
        },
        kind: {
            type: kindEnum,
        },
        content: {
            type: GraphQLString,
        },
        author: {
            type: userType,
            resolve: ({ author }) => auth.getUser(author),
        },
        time: {
            type: GraphQLFloat,
        },
    },
});

const { connectionType, edgeType } = connectionDefinitions({ nodeType });
exports.messageConnection = connectionType;
exports.messageEdge = edgeType;
