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
        {do {
            /* eslint-disable no-unused-expressions, semi */
            if (props.user) {
                [
                    <ChannelList key="list" />,
                    props.channel && <Chat key="chat" />,
                ]
            } else {
                <AuthForm />
            }
            /* eslint-enable no-unused-expressions, semi */
        }}
    </div>
);

const enhance = connect(
    ({ auth, chat }) => ({
        user: !!auth.user,
        channel: !!chat.channel,
    }),
);

export default enhance(App);
