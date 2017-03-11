const fs = require('fs');
const path = require('path');

const {
    graphql,
}  = require('graphql');
const {
    introspectionQuery,
    printSchema,
} = require('graphql/utilities');

const schema = require('../schema');
const outputFile = path.join(__dirname, '../data', 'schema');

(async () => {
    const result = await graphql(schema, introspectionQuery);
    fs.writeFileSync(
        `${outputFile}.json`,
        JSON.stringify(result, null, 4)
    );

    fs.writeFileSync(
        `${outputFile}.graphql`,
        printSchema(schema)
    );

    process.exit(0);
})();
