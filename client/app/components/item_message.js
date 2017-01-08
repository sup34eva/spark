// @flow
import React from 'react';
import Relay from 'react-relay';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';

import styles from './list_messages.css';

type Props = {
    message: {
        author: number,
        content: string,
    },
};

const Message = (props: Props) => (
    <div className={styles.message}>
        <Avatar className={styles.avatar}>
            {props.message.author}
        </Avatar>
        <Paper className={styles.content}>
            {props.message.content}
        </Paper>
    </div>
);

export default Relay.createContainer(Message, {
    fragments: {
        message: () => Relay.QL`
            fragment on Message {
                author
                content
            }
        `,
    },
});
