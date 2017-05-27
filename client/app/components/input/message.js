// @flow
import React from 'react';
import { connect } from 'react-redux';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import type { Dispatch } from 'redux';
import type { Action } from '../../store';
import sendMessageMutation from '../../utils/apollo/sendMessage';

import { fragment as messageFragment } from '../item/message';
import { setMessage } from '../../actions/chat';

import Squircle from '../base/squircle';
import styles from './message.css';

type MessagePayload = {
    kind: 'TEXT' | 'FILE',
    content: string,
};

type Props = {
    channel: string,
    message: string,
    setMessage: (any, string) => void,
    postMessage: (string, MessagePayload) => void,
};

const PostForm = (props: Props) => {
    const onSubmit = evt => {
        evt.preventDefault();
        if (props.message.trim().length > 0) {
            props.postMessage(props.channel, { kind: 'TEXT', content: props.message });
            props.setMessage(null, '');
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

const apolloConnector = sendMessageMutation(messageFragment);

const reduxConnector = connect(
    ({ chat }) => ({
        message: chat.message,
    }),
    (dispatch: Dispatch<Action>) => ({
        setMessage: (evt, text) => {
            dispatch(setMessage(text));
        },
    }),
);

export default apolloConnector(reduxConnector(PostForm));
