// @flow
import React from 'react';
import { connect } from 'react-redux';
import IconButton from 'material-ui/IconButton';
import VideoCall from 'material-ui/svg-icons/av/video-call';

import { sendOffer } from 'actions/stream';

import MemberList from './list/members';
import MessageList from './list/messages';
import MessageForm from './input/message';
import styles from './app.css';

type Props = {
    channel: string,
    sendOffer: () => void,
};

const Text = (props: Props) => (
    <div className={styles.chat}>
        <MemberList channel={props.channel} />
        <MessageList channel={props.channel} />
        <MessageForm channel={props.channel} />
        <IconButton className={styles.joinBtn} onTouchTap={props.sendOffer}>
            <VideoCall />
        </IconButton>
    </div>
);

const enhance = connect(
    ({ chat }) => ({
        channel: chat.channel,
    }),
    dispatch => ({
        sendOffer: () => {
            dispatch(sendOffer());
        },
    }),
);

export default enhance(Text);
