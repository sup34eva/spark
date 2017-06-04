// @flow
import React, { PureComponent } from 'react';

import hoistStatics from '../enhancers';

type PropsToPath = (props: Object) => string;
type ValueToProps = (value: ?Object, ownProps: Object) => Object;

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
                this.updateRef(propsToPath(this.props));
            }

            componentWillReceiveProps(nextProps) {
                this.updateRef(propsToPath(nextProps));
            }

            async updateRef(nextRef) {
                if (this.ref) {
                    this.ref.off();
                    this.ref = null;
                }
                if (nextRef) {
                    const { database } = await import(/* webpackChunkName: "firebase" */ './index');
                    this.ref = database.ref(propsToPath(this.props));
                    this.ref.on('value', snapshot => {
                        this.setState({
                            value: snapshot.val(),
                        });
                    });
                }
            }

            componentWillUnmount() {
                this.updateRef(null);
            }

            ref: Object;
            props: any;

            render() {
                const valueProps = valueToProps(this.state.value, this.props);
                return <WrappedComponent {...valueProps} {...this.props} />;
            }
        },
        WrappedComponent,
    )
);
