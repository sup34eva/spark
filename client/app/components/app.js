// @flow
import React from 'react';
import {
    connect,
} from 'react-redux';

import ChannelList from './list_channels';
import Chat from './chat';

type Props = {
    channel: ?string,
};

const App = (props: Props) => (
    <div>
        <ChannelList />
        {props.channel && <Chat channel={props.channel} />}
    </div>
);

export default connect(
    ({ chat }) => ({
        channel: chat.channel,
    }),
)(App);
