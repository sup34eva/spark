// @flow
import React from 'react';
import {
    connect,
} from 'react-redux';

import ChannelList from './list_channels';
import Chat from './chat';

type Props = {
    currentChannel: ?string,
};

const App = (props: Props) => (
    <div>
        <ChannelList />
        {props.currentChannel && <Chat channel={props.currentChannel} />}
    </div>
);

export default connect(
    ({ chat }) => chat.toObject(),
)(App);
