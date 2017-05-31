// @flow
import hoistNonReactStatics from 'hoist-non-react-statics';

// eslint-disable-next-line no-undef
export function getDisplayName(WrappedComponent: ReactClass<*>) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// eslint-disable-next-line no-undef
export function hoistStatics(prefix: string, wrapper: ReactClass<*>, wrapped: ReactClass<*>) {
    const hoisted = hoistNonReactStatics(wrapper, wrapped);
    hoisted.displayName = `${prefix}(${getDisplayName(wrapped)})`;
    return hoisted;
}
