// @flow
import React from 'react';
import Relay from 'react-relay';
import { connect } from 'react-redux';

import IconButton from 'material-ui/IconButton';
import VideoCall from 'material-ui/svg-icons/av/video-call';
import MemberList from './list/members';
import MessageList from './list/messages';
import MessageForm from './input/message';

import { sendOffer } from '../actions/stream';
import styles from './app.css';

type Props = {
    channel: string,
    viewer: Object,
    sendOffer: () => void,
};

const Text = (props: Props) => (
    <div className={styles.chat}>
        <MemberList channel={props.channel} />
        <MessageList channel={props.channel} viewer={props.viewer} />
        <MessageForm channel={props.channel} viewer={props.viewer} />
        <IconButton className={styles.joinBtn} onTouchTap={props.sendOffer}>
            <VideoCall />
        </IconButton>
    </div>
);

const reduxConnector = connect(
    ({ chat }) => ({
        channel: chat.channel,
    }),
    dispatch => ({
        sendOffer: () => {
            dispatch(sendOffer());
        },
    }),
);

export default Relay.createContainer(reduxConnector(Text), {
    initialVariables: {
        channel: null,
    },
    fragments: {
        viewer: variables => Relay.QL`
            fragment on Viewer {
                ${MessageList.getFragment('viewer', variables)}
                ${MessageForm.getFragment('viewer', variables)}
            }
        `,
    },
});
