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
                this.addListener(propsToPath(this.props));
            }

            componentWillReceiveProps(nextProps) {
                const nextPath = propsToPath(nextProps);
                if (this.path !== nextPath) {
                    this.removeListener();
                    this.addListener(nextPath);
                }
            }

            async addListener(path) {
                this.path = path;
                if (path) {
                    const { database } = await import(/* webpackChunkName: "firebase" */ './index');
                    this.ref = database.ref(this.path);
                    this.ref.on('value', this.onValue, this.onError);
                }
            }

            removeListener() {
                if (this.ref) {
                    this.ref.off('value', this.onValue);
                    this.ref = null;
                }
            }

            componentWillUnmount() {
                this.removeListener();
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
