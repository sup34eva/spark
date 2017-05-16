// @flow
import React from 'react';
import { gql } from 'react-apollo';
import { toGlobalId } from 'graphql-relay';
import { connect } from 'react-redux';

import Squircle from '../base/squircle';
import styles from './message.css';

type Props = {
    user: string,
    message: Object,
};

const Message = (props: Props) => {
    const timeString = new Date(props.message.time).toLocaleTimeString();
    const isMine = props.message.author.id === toGlobalId('User', props.user);

    return (
        <div className={styles.message}>
            {!isMine && (
                <Squircle width="40" height="40" zDepth={0} className={styles.avatar}>
                    <image x="0" y="0" height="50" width="50" xlinkHref={props.message.author.picture} />
                </Squircle>
            )}
            <div className={`${styles.bubble} ${isMine ? styles.outgoing : styles.incoming}`}>
                <p className={styles.content}>{props.message.content}</p>
                <p className={styles.time}>{timeString}</p>
            </div>
        </div>
    );
};

const reduxConnector = connect(
    ({ auth }) => ({
        user: auth.user,
    }),
);

export const fragment = gql`
    fragment MessageFragment on Message {
        uuid
        content
        time
        author {
            id
            picture
        }
    }
`;

export default reduxConnector(Message);
