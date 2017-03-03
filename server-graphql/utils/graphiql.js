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
                        \`wss://\${document.location.host || 'api.spark.leops.me'}\`
                    );

                    // Render <GraphiQL /> into the body.
                    ReactDOM.render(
                        React.createElement(GraphiQL, {
                            fetcher(params) {
                                return new Promise((resolve, reject) => {
                                    socket.emit('graphql', params, (err, data) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(data);
                                        }
                                    });
                                });
                            },
                        }),
                        document.body
                    );
                </script>
            </body>
        </html>
    `);
};
