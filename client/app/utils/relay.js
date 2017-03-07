import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';

import {
    runQuery,
    subscribe,
} from './websocket';

export const environment = new RelaySubscriptions.Environment();

export class RootQuery extends Relay.Route {
    static routeName = 'RootQuery';
    static queries = {
        viewer: (Component, variables) => Relay.QL`
            query {
                viewer {
                    ${Component.getFragment('viewer', variables)}
                }
            }
        `,
    };
}

class SocketNetworkLayer extends Relay.DefaultNetworkLayer {
    runQuery(req) {
        return runQuery({
            query: req.getQueryString(),
            variables: req.getVariables(),
        }).then(res => ({
            json: () => Promise.resolve(res),
        }));
    }

    _sendQuery(req) {
        return this.runQuery(req);
    }
    _sendMutation(req) {
        return this.runQuery(req);
    }

    sendSubscription(req) {
        const { connection, request } = subscribe(req);

        request
            .then(result => {
                if (result.errors) {
                    throw result;
                }

                return result;
            })
            .catch(({ errors }) => {
                req.onError(new Error(errors[0]));
            });

        return connection;
    }
}

environment.injectNetworkLayer(
    new SocketNetworkLayer('')
);

/* eslint-disable no-underscore-dangle */
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__._relayInternals = {
        DefaultStoreData: environment._storeData,
        NetworkLayer: environment._storeData.getNetworkLayer(),
    };
}
/* eslint-enable no-underscore-dangle */
