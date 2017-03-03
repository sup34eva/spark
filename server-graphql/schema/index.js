const {
    GraphQLSchema,
    GraphQLObjectType,
} = require('graphql');

const { viewerType, VIEWER_SINGLETON } = require('./types/viewer');
const { nodeField } = require('./node');

const mutation = require('./mutations');
const subscription = require('./subscriptions');

module.exports = new GraphQLSchema({
    mutation, subscription,
    query: new GraphQLObjectType({
        name: 'RootQuery',
        fields: {
            node: nodeField,
            viewer: {
                type: viewerType,
                resolve: () => VIEWER_SINGLETON,
            },
        },
    }),
});
