import Relay from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';

import {
    runQuery,
    subscribe,
} from './websocket';

export const environment = new RelaySubscriptions.Environment();

export class ChannelsQuery extends Relay.Route {
    static routeName = 'ChannelsQuery';
    static queries = {
        channels: () => Relay.QL`query { channels }`,
    };
}

export class ChannelQuery extends Relay.Route {
    static routeName = 'ChannelQuery';
    static paramDefinitions = {
        name: { required: true },
    };
    static queries = {
        channel: () => Relay.QL`query { channel(name: $name) }`,
    };
}

function formatRequestErrors(request, errors) {
    const CONTEXT_BEFORE = 20;
    const CONTEXT_LENGTH = 60;

    const queryLines = request.getQueryString().split('\n');
    return errors.map(({ locations, message }, ii) => {
        const prefix = `${ii + 1}. `;
        const indent = ' '.repeat(prefix.length);
        const locationMessage = locations ?
            `\n${locations.map(({ column, line }) => {
                const queryLine = queryLines[line - 1];
                const offset = Math.min(column - 1, CONTEXT_BEFORE);
                return [
                    queryLine.substr(column - 1 - offset, CONTEXT_LENGTH),
                    `${' '.repeat(Math.max(0, offset))}^^^`,
                ].map(messageLine => indent + messageLine).join('\n');
            }).join('\n')}` :
            '';

        return prefix + message + locationMessage;
    }).join('\n');
}

environment.injectNetworkLayer({
    sendRequest(req) {
        return runQuery({
            query: req.getQueryString(),
            variables: req.getVariables(),
        })
        .then(result => {
            if (result.errors) {
                throw result;
            }

            req.resolve({
                response: result.data,
            });

            return result;
        })
        .catch(({ errors }) => {
            req.reject(new Error(
                formatRequestErrors(req, errors)
            ));
        });
    },

    sendMutation(mutationRequest) {
        return this.sendRequest(mutationRequest);
    },
    sendQueries(queryRequests) {
        return Promise.all(
            queryRequests.map(this.sendRequest)
        );
    },
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
                req.onError(new Error(
                    formatRequestErrors(req, errors)
                ));
            });

        return connection;
    },

    supports() {
        return false;
    },
});

/* eslint-disable no-underscore-dangle */
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__._relayInternals = {
        DefaultStoreData: environment._storeData,
        NetworkLayer: environment._storeData.getNetworkLayer(),
    };
}
/* eslint-enable no-underscore-dangle */
