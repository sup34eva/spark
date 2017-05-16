import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ApolloMultiProvider extends Component {

    static childContextTypes = {
        store: PropTypes.object,
        clients: PropTypes.object.isRequired,
    };

    static contextTypes = {
        store: PropTypes.object,
    };

    getChildContext() {
        return {
            store: this.props.store || this.context.store,
            clients: this.props.clients,
        };
    }

    props: {
        clients: Object,
        children: Object,
        store: Object,
    };

    render() {
        return React.Children.only(this.props.children);
    }
}
