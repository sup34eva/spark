const {
    GraphQLObjectType,
} = require('graphql');

const { nodeField } = require('../node');
const viewerType = require('./viewer');

module.exports = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        node: nodeField,
        viewer: {
            type: viewerType,
            resolve: () => ({}),
        },
    },
});
