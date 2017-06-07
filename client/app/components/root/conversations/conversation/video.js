// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { Map } from 'immutable';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import IconMic from 'material-ui/svg-icons/av/mic';
import IconMicOff from 'material-ui/svg-icons/av/mic-off';
import IconCam from 'material-ui/svg-icons/av/videocam';
import IconCamOff from 'material-ui/svg-icons/av/videocam-off';
import IconHangup from 'material-ui/svg-icons/communication/call-end';

import { toggleMicro, toggleCamera, leaveCall } from 'actions/chat';

import styles from './conversation.css';

type Props = {
    hasMicro: boolean,
    hasCamera: boolean,
    toggleMicro: () => void,
    toggleCamera: () => void,
    leaveCall: () => void,

    localStream: ?MediaStream,
    remotes: Map<string, {
        stream: ?MediaStream,
    }>,
};

const Chat = ({ localStream, remotes, ...props }: Props) => (
    <div className={`${styles.chat} ${styles.video}`}>
        {localStream && (
            // $FlowIssue
            <video src={URL.createObjectURL(localStream)} autoPlay muted />
        )}
        {
            remotes
                .filter(remote => !!remote.stream)
                .map((remote, key) => (
                    /* eslint-disable react/no-array-index-key */
                    // $FlowIssue
                    <video key={key} src={URL.createObjectURL(remote.stream)} autoPlay />
                    /* eslint-enable react/no-array-index-key */
                ))
                .toArray()
        }

        <Toolbar className={styles.toolbar} style={{ backgroundColor: '#474C5B' }}>
            <ToolbarGroup>
                <IconButton onTouchTap={props.toggleMicro}>
                    {props.hasMicro ? <IconMic color="#F7F9FB" /> : <IconMicOff color="#F7F9FB" />}
                </IconButton>
                <IconButton onTouchTap={props.toggleCamera}>
                    {props.hasCamera ? <IconCam color="#F7F9FB" /> : <IconCamOff color="#F7F9FB" />}
                </IconButton>
                <IconButton onTouchTap={props.leaveCall}>
                    <IconHangup color="#DAAB9C" />
                </IconButton>
            </ToolbarGroup>
        </Toolbar>
    </div>
);

const enhance = connect(
    ({ stream }) => stream.toObject(),
    dispatch => ({
        toggleMicro() {
            dispatch(toggleMicro());
        },
        toggleCamera() {
            dispatch(toggleCamera());
        },
        leaveCall() {
            dispatch(leaveCall());
        },
    })
);

export default enhance(Chat);
