// @flow
import React from 'react';
import Relay from 'react-relay';
import {
    connect,
} from 'react-redux';

import PostMessageMutation from '../mutations/postMessage';

class PostForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
        };
    }

    state: {
        message: string,
    };
    props: {
        relay: any,
        channel: any,
    };

    render() {
        const onSubmit = evt => {
            evt.preventDefault();
            this.props.relay.commitUpdate(
                new PostMessageMutation({
                    channel: this.props.channel,
                    message: this.state.message,
                }),
            );
            this.setState({
                message: '',
            });
        };

        return (
            <form onSubmit={onSubmit}>
                <input
                    type="text" value={this.state.message}
                    onChange={evt => this.setState({ message: evt.target.value })} />
                <button type="submit">&rarr;</button>
            </form>
        );
    }
}

export default Relay.createContainer(connect(
    ({ chat }) => chat.toObject()
)(PostForm), {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                ${PostMessageMutation.getFragment('channel')}
            }
        `,
    },
});
