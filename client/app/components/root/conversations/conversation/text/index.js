// @flow
import React from 'react';

import styles from '../conversation.css';

import MemberList from './members';
import MessageList from './messages';
import Composer from './composer';

type Props = {
    channel: string,
    navigation: Object,
};

const Conversation = ({ channel, navigation }: Props) => (
    <div className={styles.chat}>
        <MemberList channel={channel} />
        <MessageList channel={channel} />
        <Composer channel={channel} navigation={navigation} />
    </div>
);

export default Conversation;
