const getBabelRelayPlugin = require('babel-relay-plugin');
const schema = require('../../server-graphql/data/schema.json');
module.exports = getBabelRelayPlugin(schema.data);
