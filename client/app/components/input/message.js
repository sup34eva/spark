// @flow
import React from 'react';
import Relay, {
    RelayProp,
} from 'react-relay';
import {
    connect,
} from 'react-redux';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import type {
    Dispatch,
} from 'redux';

import type {
    Action,
} from '../../store';

import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    Channel as ChannelType,
} from '../../schema';

import {
    setMessage,
} from '../../actions/chat';

import Squircle from '../base/squircle';
import PostMessageMutation from '../../mutations/postMessage';

import styles from './message.css';

type Props = {
    relay: RelayProp,
    channel: ChannelType,
    message: string,
    setMessage: (any, string) => void,
};

const PostForm = (props: Props) => {
    const onSubmit = evt => {
        evt.preventDefault();
        if (props.message.trim().length > 0) {
            props.setMessage(null, '');
            props.relay.commitUpdate(
                new PostMessageMutation({
                    channel: props.channel,
                    message: props.message,
                }),
            );
        }
    };

    const enabled = props.message.length > 0;

    return (
        <Paper rounded={false}>
            <form onSubmit={onSubmit} className={styles.form}>
                <TextField hintText="Message" value={props.message} onChange={props.setMessage} className={styles.content} />
                <Squircle
                    height={48} width={48} zDepth={Number(enabled)}
                    onClick={onSubmit}
                    className={styles.btn} data-enabled={enabled}>
                    <rect height="50" width="50" />
                    <g transform="translate(13, 13)">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </g>
                </Squircle>
            </form>
        </Paper>
    );
};

const postFormConnect = connect(
    ({ chat }) => ({
        message: chat.message,
    }),
    (dispatch: Dispatch<Action>) => ({
        setMessage: (evt, text) => {
            dispatch(setMessage(text));
        },
    }),
);

export default Relay.createContainer(postFormConnect(PostForm), {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                ${PostMessageMutation.getFragment('channel')}
            }
        `,
    },
});
