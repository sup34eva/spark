// @flow
import React from 'react';
import Relay from 'react-relay';
import {
    connect,
} from 'react-redux';

import {
    selectChannel,
} from '../actions/chat';

type Props = {
    currentChannel: ?string,
    selectChannel: (string) => void,
    channel: {
        name: string,
    },
};

const Channel = (props: Props) => (
    <button
        className={props.channel.name === props.currentChannel ? 'selected' : ''}
        onClick={() => props.selectChannel(props.channel.name)}>
        {props.channel.name}
    </button>
);

const ChannelContainer = connect(
    ({ chat }) => ({
        currentChannel: chat.channel,
    }),
    dispatch => ({
        selectChannel: name => {
            dispatch(selectChannel(name));
        },
    }),
)(Channel);

export default Relay.createContainer(ChannelContainer, {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                name
            }
        `,
    },
});
