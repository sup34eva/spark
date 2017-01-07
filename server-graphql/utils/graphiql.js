module.exports = (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8" />
                <title>GraphiQL</title>
                <meta name="robots" content="noindex" />
                <style>
                    html, body {
                        height: 100%;
                        margin: 0;
                        overflow: hidden;
                        width: 100%;
                }
                </style>
                <link href="https://cdn.jsdelivr.net/graphiql/0.8.0/graphiql.css" rel="stylesheet" />
                <script src="https://cdn.jsdelivr.net/fetch/0.9.0/fetch.min.js"></script>
                <script src="https://cdn.jsdelivr.net/react/15.3.2/react.min.js"></script>
                <script src="https://cdn.jsdelivr.net/react/15.3.2/react-dom.min.js"></script>
                <script src="https://cdn.jsdelivr.net/graphiql/0.8.0/graphiql.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.2/socket.io.min.js"></script>
            </head>
            <body>
                <script>
                    const socket = io(
                        \`wss://\${document.location.host || 'localhost'}:443\`
                    );

                    // Defines a GraphQL fetcher using the fetch API.
                    function graphQLFetcher(graphQLParams) {
                        if (graphQLParams.query.startsWith('subscription')) {
                            socket.on(graphQLParams.variables.input.clientSubscriptionId, console.log.bind(console));
                        }

                        return new Promise(resolve => {
                            socket.emit('graphql', graphQLParams, resolve);
                        });
                    }

                    // Render <GraphiQL /> into the body.
                    ReactDOM.render(
                        React.createElement(GraphiQL, {
                            fetcher: graphQLFetcher,
                        }),
                        document.body
                    );
                </script>
            </body>
        </html>
    `);
};
