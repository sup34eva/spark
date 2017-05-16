import { Component, createElement } from 'react';
import PropTypes from 'prop-types';

const invariant = require('invariant');
const hoistNonReactStatics = require('hoist-non-react-statics');

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}


export default function withApollo(clientName, enhancer) {
    return ApolloComponent => {
        const WrappedComponent = enhancer(ApolloComponent);
        const withDisplayName = `withApollo(${getDisplayName(WrappedComponent)})`;

        class WithApollo extends Component {
            static displayName = withDisplayName;
            static WrappedComponent = WrappedComponent;

            static contextTypes = { clients: PropTypes.object.isRequired };
            static childContextTypes = { client: PropTypes.object.isRequired };

            constructor(props, context) {
                super(props, context);
                this.client = context.clients[clientName];
                invariant(!!this.client, `Could not find "${clientName}" in the context of "${withDisplayName}". Wrap the root component in an <ApolloMultiProvider>`);
            }

            getChildContext() {
                return {
                    client: this.client,
                };
            }

            render() {
                const props = Object.assign({}, this.props);
                props.client = this.client;
                return createElement(WrappedComponent, props);
            }
        }

        return hoistNonReactStatics(WithApollo, WrappedComponent, {});
    };
}
