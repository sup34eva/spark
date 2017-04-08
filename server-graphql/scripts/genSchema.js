require('dotenv').config();

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const { graphql } = require('graphql');
const { createCompositeSchema } = require('relay-composite-network-layer/lib/merge');
const { introspectionQuery, printSchema } = require('graphql/utilities');

const localSchema = require('../schema');
const outputFile = path.join(__dirname, '../data', 'schema');
const configFile = path.join(__dirname, '../data', 'config.json');

(async () => {
    try {
        const [ localResult, remoteResult ] = await Promise.all([
            graphql(localSchema, introspectionQuery),
            (async () => {
                const res = await fetch('https://api.graph.cool/simple/v1/cj0f0713f2jsl014802pm1qp4', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        query: introspectionQuery,
                    }),
                });

                if(res.ok) {
                    return await res.json();
                }

                throw new Error(res.statusText);
            })(),
        ]);

        const { schema, config } = createCompositeSchema({
            server: remoteResult,
            local: localResult,
        }, {
            queryType: 'CompositeQuery',
            mutationType: 'CompositeMutation',
            // subscriptionType: 'CompositeSubscription',
        });

        fs.writeFileSync(
            `${outputFile}.json`,
            JSON.stringify(schema, null, 4)
        );

        fs.writeFileSync(
            configFile,
            JSON.stringify(config, null, 4)
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
