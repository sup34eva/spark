// @flow
import React from 'react';

import MemberList from 'components/list/members';
import MessageList from 'components/list/messages';
import MessageForm from 'components/input/message';

import styles from '../app.css';

type Props = {
    channel: string,
    navigation: Object,
};

const Conversation = ({ channel, navigation }: Props) => (
    <div className={styles.chat}>
        <MemberList channel={channel} />
        <MessageList channel={channel} />
        <MessageForm channel={channel} navigation={navigation} />
    </div>
);

export default Conversation;
