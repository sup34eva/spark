// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import { List, makeSelectable } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import {
    connect,
} from 'react-redux';

import type {
    Dispatch,
} from 'redux';

import type {
    Action,
} from '../../store';

import type {
    Viewer,
} from '../../schema';

import ChannelItem from '../item/channel';
import CreateChannelDialog from '../dialog/createChannel';

import {
    selectChannel,
    setChannelModal,
} from '../../actions/chat';

const SelectableList = makeSelectable(List);

type Props = {
    data: {
        loading: boolean,
        viewer: Viewer,
    },

    channel: ?string,
    selectChannel: (any, string) => void,
    openModal: () => void,
};

const ChannelList = ({ data: { loading, viewer }, channel, ...props }: Props) => !loading && (
    <Paper style={{
        position: 'relative',
        width: 256,
    }}>
        <SelectableList value={channel} onChange={props.selectChannel}>
            <Subheader>Channels</Subheader>
            {viewer.channels.edges.map(({ node }) => (
                <ChannelItem key={node.id} value={node.name} channel={node} />
            ))}
        </SelectableList>

        <IconButton onTouchTap={props.openModal} style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
        }}>
            <ContentAdd />
        </IconButton>

        <CreateChannelDialog viewer={viewer} />
    </Paper>
);

const reduxConnector = connect(
    ({ chat }) => ({
        channel: chat.channel,
    }),
    (dispatch: Dispatch<Action>) => ({
        selectChannel: (evt, name) => {
            dispatch(selectChannel(name));
        },
        openModal() {
            dispatch(setChannelModal(''));
        },
    }),
);

const apolloConnector = graphql(gql`
    query ChannelList {
        viewer {
            channels(first: 10) {
                edges {
                    node {
                        id
                        name
                        ...ChannelFragment
                    }
                }
            }
        }
    }

    ${ChannelItem.fragment}
`);

export default apolloConnector(reduxConnector(ChannelList));
