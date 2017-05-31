// @flow
import hoistNonReactStatics from 'hoist-non-react-statics';
import getDisplayName from 'recompose/getDisplayName';

// eslint-disable-next-line no-undef
export default function (prefix: string, wrapper: ReactClass<*>, wrapped: ReactClass<*>) {
    const hoisted = hoistNonReactStatics(wrapper, wrapped);
    hoisted.displayName = `${prefix}(${getDisplayName(wrapped)})`;
    return hoisted;
}
