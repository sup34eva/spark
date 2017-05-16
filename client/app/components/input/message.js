// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import {
    // cursorToOffset,
    offsetToCursor,
    toGlobalId,
} from 'graphql-relay';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import type { Dispatch } from 'redux';
import type { Action } from '../../store';

import { fragment as messageFragment } from '../item/message';
import { setMessage } from '../../actions/chat';
import withApollo from '../../utils/apollo/enhancer';

import Squircle from '../base/squircle';
import styles from './message.css';

type Props = {
    message: string,
    setMessage: (any, string) => void,
    postMessage: () => void,
};

const PostForm = (props: Props) => {
    const onSubmit = evt => {
        evt.preventDefault();
        if (props.message.trim().length > 0) {
            props.postMessage();
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

const apolloConnector = withApollo('kafka', graphql(gql`
    mutation PostMessageMutation($input: PostMessageInput!) {
        postMessage(input: $input) {
            messageEdge {
                cursor
                node {
                    id
                    ...MessageFragment
                }
            }
        }
    }

    ${messageFragment}
`, {
    props: ({ ownProps, mutate }) => ({
        postMessage: () => {
            const offset = 0;
            /* if (ownProps.channel.messages.pageInfo.endCursor !== undefined) {
                offset = cursorToOffset(ownProps.channel.messages.pageInfo.endCursor) + 1;
            }*/

            return mutate({
                variables: {
                    input: {
                        channel: ownProps.channel,
                        message: ownProps.message,
                    },
                },
                optimisticResponse: {
                    __typename: 'RootMutation',
                    postMessage: {
                        __typename: 'PostMessagePayload',
                        messageEdge: {
                            __typename: 'MessageEdge',
                            cursor: offsetToCursor(offset),
                            node: {
                                __typename: 'Message',
                                id: toGlobalId(
                                    'Message',
                                    `${ownProps.channel}:${offset}`,
                                ),
                                content: ownProps.message,
                                time: Date.now(),
                                author: {
                                    __typename: 'User',
                                    id: toGlobalId('User', 0),
                                    avatar: 'http://i.imgur.com/pv1tBmT.png',
                                },
                            },
                        },
                    },
                },
                updateQueries: {
                    MessageList: (prev, { mutationResult }) => {
                        console.log('updateQueries', prev, mutationResult);
                        return update(prev, {
                            viewer: {
                                channel: {
                                    messages: {
                                        edges: {
                                            $push: [mutationResult.data.postMessage.messageEdge],
                                        },
                                    },
                                },
                            },
                        });
                    },
                },
            });
        },
    }),
}));

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

export default reduxConnector(apolloConnector(PostForm));
