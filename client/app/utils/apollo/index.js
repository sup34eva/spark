import { ApolloClient, printAST } from 'apollo-client';
import { socket, runQuery } from '../websocket';

export default new ApolloClient({
    dataIdFromObject: o => o.id,
    networkInterface: {
        subscriptionId: 0,

        query: request => runQuery({
            ...request,
            query: printAST(request.query),
        }),

        subscribe(request, handler) {
            const id = this.subscriptionId++;

            socket.on(id, result => {
                if (result.errors) {
                    result.errors.forEach(err => handler(err));
                }

                handler(null, result.data);
            });

            runQuery({
                ...request,
                query: printAST(request.query),
            });

            return id;
        },

        unsubscribe(id) {
            socket.off(id);
        },
    },
});
