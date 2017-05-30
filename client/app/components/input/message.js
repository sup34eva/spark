// @flow
import React from 'react';
import { connect } from 'react-redux';
import { toGlobalId } from 'graphql-relay';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import type { Dispatch } from 'redux';
import type { Action } from '../../store';

import { store } from '../../utils/relay';
import postMessage from '../../utils/relay/postMessage';
import { setMessage } from '../../actions/chat';

import Squircle from '../base/squircle';
import styles from './message.css';

type Props = {
    uid: string,
    channel: string,
    message: string,
    setMessage: (any, string) => void,
};

const PostForm = (props: Props) => {
    const onSubmit = evt => {
        evt.preventDefault();
        if (props.message.trim().length > 0) {
            const id = toGlobalId('Channel', props.channel);
            const { data } = store.lookup({
                dataID: id,
                node: {
                    selections: [{
                        kind: 'LinkedField',
                        name: '__MessageList_messages_connection',
                        alias: 'messages',
                        selections: [{
                            kind: 'LinkedField',
                            name: 'pageInfo',
                            selections: [{
                                kind: 'ScalarField',
                                name: 'endCursor',
                            }],
                        }],
                    }],
                },
            });

            // $FlowIssue
            postMessage({
                kind: 'TEXT',
                content: props.message,
                user: props.uid,
                channel: {
                    id,
                    name: props.channel,
                    ...data,
                },
            });

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

const reduxConnector = connect(
    ({ auth, chat }) => ({
        uid: auth.user.uid,
        channel: chat.channel,
        message: chat.message,
    }),
    (dispatch: Dispatch<Action>) => ({
        setMessage: (evt, text) => {
            dispatch(setMessage(text));
        },
    }),
);

export default reduxConnector(PostForm);
