// @flow
import React from 'react';
import Relay from 'react-relay';

import RelayRenderer from './base/renderer';
import MemberList from './list/members';
import MessageList from './list/messages';
import MessageForm from './input/message';
import { ChannelQuery } from '../utils/relay';
import type {
    Viewer,
} from '../schema';

import styles from './app.css';

type Props = {
    viewer: Viewer,
};

const Chat = ({ viewer: { channel } }: Props) => (
    <div className={styles.chat}>
        <MemberList channel={channel} />
        <MessageList channel={channel} />
        <MessageForm channel={channel} />
    </div>
);

const ChatContainer = Relay.createContainer(Chat, {
    initialVariables: {
        channel: null,
    },
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                channel(name: $channel) {
                    ${MemberList.getFragment('channel')}
                    ${MessageList.getFragment('channel')}
                    ${MessageForm.getFragment('channel')}
                }
            }
        `,
    },
});

type RendererProps = {
    channel: string,
};

export default (query: RendererProps) => (
    <RelayRenderer Container={ChatContainer} queryConfig={new ChannelQuery(query)} padding={128} />
);
