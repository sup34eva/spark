// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { List } from 'immutable';

import styles from './app.css';

type Props = {
    localStream: ?MediaStream,
    remotes: List<{
        stream: ?MediaStream,
    }>,
};

const Chat = ({ localStream, remotes }: Props) => (
    <div className={styles.chat}>
        {localStream && (
            // $FlowIssue
            <video src={URL.createObjectURL(localStream)} autoPlay muted />
        )}
        {
            remotes
                .filter(remote => !!remote.stream)
                .map((remote, key) => (
                    // $FlowIssue
                    <video key={key} src={URL.createObjectURL(remote.stream)} autoPlay />
                ))
                .toArray()
        }
    </div>
);

const reduxConnector = connect(
    ({ stream }) => stream.toObject(),
);

export default reduxConnector(Chat);
