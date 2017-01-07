// @flow
import React from 'react';
import {
    connect,
} from 'react-redux';

import {
    sendOffer,
} from '../actions/stream';

export default connect(
    ({ stream }) => stream.toObject(),
    dispatch => ({
        sendOffer: () => {
            dispatch(sendOffer());
        },
    }),
)(props => (
    <div>
        {props.localStream && (
            <video src={URL.createObjectURL(props.localStream)} autoPlay muted />
        )}
        {
            props.remotes
                .filter(remote => !!remote.stream)
                .map((remote, key) => (
                    <video key={key} src={URL.createObjectURL(remote.stream)} autoPlay />
                ))
                .toArray()
        }
        {!props.joined && (
            <button onClick={props.sendOffer}>Join</button>
        )}
    </div>
));
