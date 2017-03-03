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
            id => id
        ),
        name: {
            type: GraphQLString,
            resolve(id) {
                const names = [
                    'Julia Goldman',
                    'Kyle Hardman',
                    'Zoe Milton',
                    'Samuel Reynolds',
                    'Zoe Milton',
                    'Kyle Oswald',
                    'Angelina Mackenzie',
                    'Jordan Gill',
                    'Abigail Stevenson',
                    'Angel Ogden',
                    'Michelle Macey',
                ];

                return names[id % names.length];
            },
        },
        avatar: {
            type: GraphQLString,
            resolve(id) {
                const avatars = [
                    'https://i.imgur.com/pv1tBmT.png',
                    'https://i.imgur.com/R3Jm1CL.png',
                    'https://i.imgur.com/ROz4Jgh.png',
                    'https://i.imgur.com/Qn9UesZ.png',
                ];

                return avatars[id % avatars.length];
            },
        },
    },
});

const { connectionType } = connectionDefinitions({ nodeType });
exports.userConnection = connectionType;
