const {
    GraphQLString,
    GraphQLSchema,
    GraphQLObjectType,
} = require('graphql');

const query = require('./types/query');
const mutation = require('./mutations');
const subscription = require('./subscriptions');

module.exports = new GraphQLSchema({
    query, mutation, subscription,
});
