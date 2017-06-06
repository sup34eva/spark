const {
    GraphQLString,
    GraphQLObjectType,
} = require('graphql');
const {
    globalIdField,
    connectionDefinitions,
} = require('graphql-relay');

const { nodeInterface } = require('../node');
const { database } = require('../../utils/firebase');

const nodeType = exports.userType = new GraphQLObjectType({
    name: 'User',
    interfaces: [ nodeInterface ],
    fields: {
        id: globalIdField(
            'User',
            ({ uid }) => uid
        ),
        displayName: {
            type: GraphQLString,
            resolve: ({ uid }) => new Promise((resolve, reject) => {
                database.ref(`/users/${uid}/displayName`).once(
                    'value',
                    snapshot => {
                        resolve(snapshot.val());
                    },
                    reject
                );
            }),
        },
        photoURL: {
            type: GraphQLString,
            resolve: ({ uid }) => new Promise((resolve, reject) => {
                database.ref(`/users/${uid}/photoURL`).once(
                    'value',
                    snapshot => {
                        resolve(snapshot.val());
                    },
                    reject
                );
            }),
        },
    },
});

const { connectionType } = connectionDefinitions({ nodeType });
exports.userConnection = connectionType;
