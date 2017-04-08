// @flow
import React from 'react';

import MemberList from './list/members';
import MessageList from './list/messages';
import MessageForm from './input/message';

import styles from './app.css';

type Props = {
    channel: string,
};

const Chat = ({ channel }: Props) => (
    <div className={styles.chat}>
        <MemberList channel={channel} />
        <MessageList channel={channel} />
        <MessageForm channel={channel} />
    </div>
);

export default Chat;
