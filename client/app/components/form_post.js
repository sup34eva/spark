// @flow
import React from 'react';
import Relay from 'react-relay';
import {
    connect,
} from 'react-redux';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentSend from 'material-ui/svg-icons/content/send';

import {
    setMessage,
} from '../actions/chat';

import PostMessageMutation from '../mutations/postMessage';

import styles from './form_post.css';

type Props = {
    // eslint-disable-next-line react/no-unused-prop-types
    relay: Object,
    // eslint-disable-next-line react/no-unused-prop-types
    channel: Object,
    message: string,
    setMessage: (any, string) => void,
};

const PostForm = (props: Props) => {
    const onSubmit = evt => {
        evt.preventDefault();
        props.setMessage(null, '');
        props.relay.commitUpdate(
            new PostMessageMutation({
                channel: props.channel,
                message: props.message,
            }),
        );
    };

    return (
        <Paper rounded={false}>
            <form onSubmit={onSubmit} className={styles.form}>
                <TextField hintText="Message" value={props.message} onChange={props.setMessage} className={styles.content} />
                <FloatingActionButton disabled={props.message.length === 0} onTouchTap={onSubmit}>
                    <ContentSend />
                </FloatingActionButton>
            </form>
        </Paper>
    );
};

const PostFormContainer = connect(
    ({ chat }) => ({
        message: chat.message,
    }),
    dispatch => ({
        setMessage: (evt, text) => {
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
