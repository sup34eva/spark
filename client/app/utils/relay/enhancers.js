// @flow
import React, { PureComponent } from 'react';
import { createFragmentContainer, createPaginationContainer, QueryRenderer } from 'react-relay';
import type {
    Variables, GraphQLTaggedNode,
    FragmentOptions,
    FragmentMap, ConnectionConfig,
} from 'react-relay';

import hoistStatics from '../enhancers';

type Config = {
    query: GraphQLTaggedNode,
    variables: Variables,
    mapResultToProps: (Object) => Object,
    // eslint-disable-next-line no-undef
    LoadingComponent: ReactClass<*>,
};

export const withFragment = (fragmentOptions: FragmentOptions) => (
    // eslint-disable-next-line no-undef
    (Component: ReactClass<*>) => (
        createFragmentContainer(Component, fragmentOptions)
    )
);

export const withPagination = (fragments: FragmentMap, config: ConnectionConfig) => (
    // eslint-disable-next-line no-undef
    (Component: ReactClass<*>) => (
        createPaginationContainer(Component, fragments, config)
    )
);

export const withRenderer = ({ query, variables, mapResultToProps, LoadingComponent }: Config) => (
    // eslint-disable-next-line no-undef
    (WrappedComponent: ReactClass<*>) => {
        class Renderer extends PureComponent {
            constructor(props) {
                super(props);
                this.state = {
                    environment: null,
                };
            }

            async componentDidMount() {
                const { default: environment } = await import(/* webpackChunkName: "relay" */ './index');
                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({ environment });
            }

            render() {
                if (!this.state.environment) {
                    return <LoadingComponent />;
                }

                return (
                    <QueryRenderer
                        environment={this.state.environment}
                        query={query}
                        variables={{
                            ...variables,
                            ...this.props,
                        }}
                        render={({ error, props }) => {
                            if (error) {
                                return <div>{error.message}</div>;
                            }

                            if (props) {
                                const mapProps = mapResultToProps(props);
                                return <WrappedComponent {...mapProps} />;
                            }

                            return <LoadingComponent />;
                        }} />
                );
            }
        }

        return hoistStatics('Renderer', Renderer, WrappedComponent);
    }
);
