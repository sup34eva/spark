// @flow
import React from 'react';
import { createFragmentContainer, createPaginationContainer, QueryRenderer } from 'react-relay';

import hoistStatics from '../enhancers';

import environment from './index';

type Config = {
    query: Object,
    variables: Object,
    mapResultToProps: (Object) => Object,
    // eslint-disable-next-line no-undef
    LoadingComponent: ReactClass<*>,
};

// eslint-disable-next-line no-undef
export const withFragment = (fragmentOptions: FragmentOptions) => (
    // eslint-disable-next-line no-undef
    (Component: ReactClass<*>) => (
        createFragmentContainer(Component, fragmentOptions)
    )
);

// eslint-disable-next-line no-undef
export const withPagination = (fragments: FragmentMap, config: ConnectionConfig) => (
    // eslint-disable-next-line no-undef
    (Component: ReactClass<*>) => (
        createPaginationContainer(Component, fragments, config)
    )
);

export const withRenderer = ({ query, variables, mapResultToProps, LoadingComponent }: Config) => (
    // eslint-disable-next-line no-undef
    (WrappedComponent: ReactClass<*>) => hoistStatics(
        'Renderer',
        (ownProps: Object) => (
            <QueryRenderer
                environment={environment}
                query={query}
                variables={{
                    ...variables,
                    ...ownProps,
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
        ),
        WrappedComponent,
    )
);
