const {
    GraphQLString,
    GraphQLObjectType,
} = require('graphql');
const {
    globalIdField,
    connectionDefinitions,
} = require('graphql-relay');

const { nodeInterface } = require('../node');

const nodeType = exports.userType = new GraphQLObjectType({
    name: 'User',
    interfaces: [ nodeInterface ],
    fields: {
        id: globalIdField(
            'User',
            ({ user_id }) => user_id
        ),
        username: {
            type: GraphQLString,
        },
        email: {
            type: GraphQLString,
        },
        picture: {
            type: GraphQLString,
        },
    },
});

const { connectionType } = connectionDefinitions({ nodeType });
exports.userConnection = connectionType;
