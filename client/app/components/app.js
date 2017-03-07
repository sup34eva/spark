// @flow
import React from 'react';
import { connect } from 'react-redux';

import LockDialog from './dialog/lock';
import ChannelList from './list/channels';
import Chat from './chat';

import styles from './app.css';

type Props = {
    token: ?string,
    channel: ?string,
};

const App = (props: Props) => (
    <div className={styles.app}>
        {props.token ? [
            <ChannelList key="list" />,
            props.channel && <Chat key="chat" token={props.token} channel={props.channel} />,
        ] : (
            <LockDialog />
        )}
    </div>
);

export default connect(
    ({ auth, chat }) => ({
        token: auth.token,
        channel: chat.channel,
    }),
)(App);
