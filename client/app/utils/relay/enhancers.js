// @flow
import React from 'react';
import { QueryRenderer } from 'react-relay';

import { hoistStatics } from '../enhancers';

import environment from './index';

type Config = {
    query: Object,
    variables: Object,
    mapResultToProps: (Object) => Object,
    // eslint-disable-next-line no-undef
    LoadingComponent: ReactClass<*>,
};

export default ({ query, variables, mapResultToProps, LoadingComponent }: Config) => (
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
