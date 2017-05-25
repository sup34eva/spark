require('dotenv').config();

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const { graphql } = require('graphql');
const { introspectionQuery, printSchema } = require('graphql/utilities');

const localSchema = require('../schema');
const outputFile = path.join(__dirname, '../data', 'schema');

(async () => {
    try {
        const localResult = await graphql(localSchema, introspectionQuery);

        fs.writeFileSync(
            `${outputFile}.json`,
            JSON.stringify(localResult, null, 4)
        );

        fs.writeFileSync(
            `${outputFile}.graphql`,
            printSchema(localSchema)
        );
    } catch (err) {
        console.error(err);
    }

    process.exit(0);
})();
