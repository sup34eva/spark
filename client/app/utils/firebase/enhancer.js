// @flow
import React, { Component } from 'react';
import { database } from './index';

type PropsToPath = (props: Object) => string;
type ValueToProps = (value: ?Object) => Object;

export default (propsToPath: PropsToPath, valueToProps: ValueToProps) => (
    // eslint-disable-next-line no-undef
    (WrappedComponent: ReactClass<*>) => (
        class FirebaseConnector extends Component {
            constructor(props: Object) {
                super(props);
                this.state = {
                    value: null,
                };
            }

            ref: Object;
            props: Object;
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

            render() {
                const valueProps = valueToProps(this.state.value);
                return <WrappedComponent {...valueProps} {...this.props} />;
            }
        }
    )
);
