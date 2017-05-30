// @flow
import React from 'react';
import { connect } from 'react-redux';

import AuthForm from './dialog/auth';
import ChannelList from './list/channels';
import Chat from './chat';

import styles from './app.css';

type Props = {
    user: boolean,
    channel: boolean,
};

const App = (props: Props) => (
    <div className={styles.app}>
        {props.user ? [
            <ChannelList key="list" />,
            props.channel && <Chat key="chat" />,
        ] : (
            <AuthForm />
        )}
    </div>
);

export default connect(
    ({ auth, chat }) => ({
        user: !!auth.user,
        channel: !!chat.channel,
    }),
)(App);
