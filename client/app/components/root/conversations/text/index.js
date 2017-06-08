// @flow
import React from 'react';

import styles from '../conversations.css';

import MemberList from './members';
import MessageList from './messages';
import Composer from './composer';

type Props = {
    match: {
        params: {
            channel: string, // eslint-disable-line react/no-unused-prop-types
        },
    },
};

const Conversation = ({ match }: Props) => (
    <div className={styles.chat}>
        <MemberList channel={match.params.channel} />
        <MessageList channel={match.params.channel} />
        <Composer channel={match.params.channel} />
    </div>
);

export default Conversation;
