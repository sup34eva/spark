// @flow
import React from 'react';
import {
    connect,
} from 'react-redux';

import ChannelList from './list_channels';
import Chat from './chat';

import styles from './app.css';

type Props = {
    channel: ?string,
};

const App = (props: Props) => (
    <div className={styles.app}>
        <ChannelList />
        <div className={styles.chatContainer}>
            {props.channel && <Chat channel={props.channel} />}
        </div>
    </div>
);

export default connect(
    ({ chat }) => ({
        channel: chat.channel,
    }),
)(App);
