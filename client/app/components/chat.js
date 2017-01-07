// @flow
import React from 'react';
import Relay from 'react-relay';

import MessageList from './list_messages';
import PostForm from './form_post';
import {
    environment,
    ChannelQuery,
} from '../utils/relay';

type Props = {
    channel: any,
};

const Chat = ({ channel }: Props) => (
    <div>
        <MessageList channel={channel} />
        <PostForm channel={channel} />
    </div>
);

const ChatContainer = Relay.createContainer(Chat, {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                ${MessageList.getFragment('channel')}
                ${PostForm.getFragment('channel')}
            }
        `,
    },
});

export default (props: Props) => (
    <Relay.Renderer
        Container={ChatContainer}
        environment={environment}
        queryConfig={new ChannelQuery({ name: props.channel })} />
);
