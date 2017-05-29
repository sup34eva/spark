// @flow
import React from 'react';
import Relay, { Route } from 'react-relay';
import { connect } from 'react-redux';

import Video from './video';
import Text from './text';

import environment from '../utils/relay';

class ChannelQuery extends Route {
    static routeName = 'ChannelQuery';
    static paramDefinitions = {
        channel: { required: true },
    };
    static queries = {
        viewer: (component, variables) => Relay.QL`
            query {
                viewer {
                    ${component.getFragment('viewer', variables)}
                }
            }
        `,
    };
}

type Props = {
    channel: string,
    joined: boolean,
};

const Chat = ({ channel, joined }: Props) => (
    joined ? (
        <Video />
    ) : (
        <Relay.Renderer
            Container={Text}
            queryConfig={new ChannelQuery({ channel })}
            environment={environment} />
    )
);

const reduxConnector = connect(
    ({ chat, stream }) => ({
        channel: chat.channel,
        joined: stream.joined,
    }),
);

export default reduxConnector(Chat);
