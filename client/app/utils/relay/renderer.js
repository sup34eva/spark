// @flow
import React from 'react';
import { QueryRenderer } from 'react-relay';
import hoistNonReactStatics from 'hoist-non-react-statics';

import CircularProgress from 'material-ui/CircularProgress';
import environment from './index';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

type MapFunc = (Object) => Object;

export default (query: Object, variables: Object, mapResultToProps: MapFunc) => (
    // eslint-disable-next-line no-undef
    (WrappedComponent: ReactClass<*>) => {
        const wrapper = (ownProps: Object) => (
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

                    return <CircularProgress />;
                }} />
        );

        wrapper.displayName = `Renderer(${getDisplayName(WrappedComponent)})`;
        return hoistNonReactStatics(wrapper, WrappedComponent);
    }
);
