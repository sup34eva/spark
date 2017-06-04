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

            componentWillMount() {
                this.onValue = snapshot => {
                    this.setState({
                        value: snapshot.val(),
                    });
                };
                this.onError = err => {
                    console.error(err);
                };
            }

            componentDidMount() {
                this.updateRef(propsToPath(this.props));
            }

            componentWillReceiveProps(nextProps) {
                this.updateRef(propsToPath(nextProps));
            }

            async updateRef(nextPath) {
                if (this.path !== nextPath) {
                    if (this.ref) {
                        this.ref.off('value', this.onValue);
                        this.ref = null;
                    }
                    if (nextPath) {
                        const { database } = await import(/* webpackChunkName: "firebase" */ './index');
                        this.path = nextPath;
                        this.ref = database.ref(nextPath);
                        this.ref.on('value', this.onValue, this.onError);
                    }
                }
            }

            componentWillUnmount() {
                this.updateRef(null);
            }

            path: ?string;
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
