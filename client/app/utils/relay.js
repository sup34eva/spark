// @flow
import Relay, { DefaultNetworkLayer } from 'react-relay';
import { Environment } from 'relay-subscriptions';
import { runQuery, subscribe } from './websocket';

console.log(Relay);

type Request = {
    getQueryString: (void) => string,
    getVariables: (void) => Object,
    onError: (Error) => void,
}

class SocketNetworkLayer extends DefaultNetworkLayer {
    async runQuery(req: Request) {
        console.log('runQuery', req);

        const res = await runQuery({
            query: req.getQueryString(),
            variables: req.getVariables(),
        });

        return {
            json: () => Promise.resolve(res),
        };
    }

    _sendQuery(req: Request) {
        return this.runQuery(req);
    }
    _sendMutation(req: Request) {
        return this.runQuery(req);
    }

    sendSubscription(req: Request) {
        const { connection, request } = subscribe(req);

        (async () => {
            try {
                const result = await request;
                if (result.errors) {
                    throw result;
                }
            } catch (err) {
                const { errors } = err;
                req.onError(new Error(errors[0]));
            }
        })();

        return connection;
    }
}

const environment = new Environment();
const networkLayer = new SocketNetworkLayer('');
environment.injectDefaultNetworkLayer(networkLayer);
environment.injectNetworkLayer(networkLayer);

export default environment;

/* eslint-disable no-underscore-dangle */
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__._relayInternals = {
        DefaultStoreData: environment._storeData,
        NetworkLayer: environment._storeData.getNetworkLayer(),
    };
}
/* eslint-enable no-underscore-dangle */
