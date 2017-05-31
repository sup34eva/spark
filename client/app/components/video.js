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
                .map((remote, key) => console.log(remote) || (
                    /* eslint-disable react/no-array-index-key */
                    // $FlowIssue
                    <video key={key} src={URL.createObjectURL(remote.stream)} autoPlay />
                    /* eslint-enable react/no-array-index-key */
                ))
                .toArray()
        }
    </div>
);

const enhance = connect(
    ({ stream }) => stream.toObject(),
);

export default enhance(Chat);
