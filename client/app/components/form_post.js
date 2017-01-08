// @flow
import React from 'react';
import Relay from 'react-relay';
import {
    connect,
} from 'react-redux';

import {
    setMessage,
} from '../actions/chat';

import PostMessageMutation from '../mutations/postMessage';

type Props = {
    // eslint-disable-next-line react/no-unused-prop-types
    relay: Object,
    // eslint-disable-next-line react/no-unused-prop-types
    channel: Object,
    message: string,
    setMessage: (string) => void,
};

const PostForm = (props: Props) => (
    <form onSubmit={evt => {
        evt.preventDefault();
        props.setMessage('');
        props.relay.commitUpdate(
            new PostMessageMutation({
                channel: props.channel,
                message: props.message,
            }),
        );
    }}>
        <input type="text" value={props.message} onChange={evt => {
            props.setMessage(evt.target.value);
        }} />
        <button type="submit">&rarr;</button>
    </form>
);

const PostFormContainer = connect(
    ({ chat }) => ({
        message: chat.message,
    }),
    dispatch => ({
        setMessage: text => {
            dispatch(setMessage(text));
        },
    }),
)(PostForm);

export default Relay.createContainer(PostFormContainer, {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                ${PostMessageMutation.getFragment('channel')}
            }
        `,
    },
});
