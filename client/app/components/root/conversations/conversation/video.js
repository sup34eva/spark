// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { Map } from 'immutable';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Checkbox from 'material-ui/Checkbox';
import IconMic from 'material-ui/svg-icons/av/mic';
import IconMicOff from 'material-ui/svg-icons/av/mic-off';
import IconCam from 'material-ui/svg-icons/av/videocam';
import IconCamOff from 'material-ui/svg-icons/av/videocam-off';
import IconHangup from 'material-ui/svg-icons/communication/call-end';

import { setMicro, setCamera, leaveCall } from 'actions/chat';

import styles from './conversation.css';

type Props = {
    hasMicro: boolean,
    hasCamera: boolean,
    setMicro: (Object, boolean) => void,
    setCamera: (Object, boolean) => void,
    leaveCall: () => void,

    localStream: ?MediaStream,
    remotes: Map<string, {
        stream: ?MediaStream,
    }>,
};

const CB_STYLES = {
    style: { width: 48, height: 48 },
    inputStyle: { width: 48, height: 48 },
    iconStyle: { width: 24, height: 24, margin: 12 },
};
const ICN_STYLE = {
    margin: 0,
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
                <Checkbox
                    {...CB_STYLES}
                    checked={props.hasMicro}
                    onCheck={props.setMicro}
                    checkedIcon={<IconMic style={ICN_STYLE} />}
                    uncheckedIcon={<IconMicOff style={ICN_STYLE} />} />
                <Checkbox
                    {...CB_STYLES}
                    checked={props.hasCamera}
                    onCheck={props.setCamera}
                    checkedIcon={<IconCam style={ICN_STYLE} />}
                    uncheckedIcon={<IconCamOff style={ICN_STYLE} />} />
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
        setMicro(evt, isChecked) {
            dispatch(setMicro(isChecked));
        },
        setCamera(evt, isChecked) {
            dispatch(setCamera(isChecked));
        },
        leaveCall() {
            dispatch(leaveCall());
        },
    })
);

export default enhance(Chat);
