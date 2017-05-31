// @flow
import React, { PureComponent } from 'react';

import { hoistStatics } from '../enhancers';

import { database } from './index';

type PropsToPath = (props: Object) => string;
type ValueToProps = (value: ?Object) => Object;

export default (propsToPath: PropsToPath, valueToProps: ValueToProps) => (
    // eslint-disable-next-line no-undef
    (WrappedComponent: ReactClass<*>) => hoistStatics(
        'Firebase',
        class FirebaseConnector extends PureComponent {
            constructor(props: Object) {
                super(props);
                this.state = {
                    value: null,
                };
            }

            state: {
                value: ?Object,
            };

            componentDidMount() {
                this.ref = database.ref(propsToPath(this.props));
                this.ref.on('value', snapshot => {
                    this.setState({
                        value: snapshot.val(),
                    });
                });
            }

            componentWillUnmount() {
                this.ref.off();
            }

            ref: Object;
            props: any;

            render() {
                const valueProps = valueToProps(this.state.value);
                return <WrappedComponent {...valueProps} {...this.props} />;
            }
        },
        WrappedComponent,
    )
);
