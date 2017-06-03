// @flow
import { RecordSource, Store, Network, Environment } from 'relay-runtime';

const source = new RecordSource();
export const store = new Store(source);

const network = Network.create(
    async (operation, variables) => {
        const { runQuery } = await import(/* webpackChunkName: "websocket" */ '../websocket');
        return runQuery({
            query: operation.text,
            variables,
        });
    },
    async (operation, variables, ignored, { onError, onNext }) => {
        const { subscribe } = await import(/* webpackChunkName: "websocket" */ '../websocket');
        const { connection, request } = subscribe({
            subscription: operation.text,
            variables,
            onNext,
            onError,
        });

        (async () => {
            try {
                const result = await request;
                if (result.errors) {
                    throw result;
                }
            } catch (err) {
                const { errors } = err;
                onError(new Error(errors[0]));
            }
        })();

        return connection;
    },
);

const environment = new Environment({
    network,
    store,
});

export default environment;

/* eslint-disable no-underscore-dangle */
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__._relayInternals = {
        DefaultStoreData: store,
        NetworkLayer: network,
    };
}
/* eslint-enable no-underscore-dangle */
