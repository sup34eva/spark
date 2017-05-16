import ApolloClient, { createNetworkInterface } from 'apollo-client';
import store from '../../store';

const networkInterface = createNetworkInterface({
    uri: 'https://api.graph.cool/simple/v1/cj0f0713f2jsl014802pm1qp4',
});

networkInterface.use([{
    applyMiddleware(req, next) {
        if (!req.options.headers) {
            // eslint-disable-next-line no-param-reassign
            req.options.headers = {};
        }

        const state = store.getState();
        if (state.auth.idToken) {
            // eslint-disable-next-line no-param-reassign
            req.options.headers.authorization = `Bearer ${state.auth.idToken}`;
        }

        next();
    },
}]);

const client = new ApolloClient({
    reduxRootSelector: state => state.apollo,
    networkInterface,
});

export default client;
