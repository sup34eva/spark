// @flow
import React from 'react';
import Relay from 'react-relay';

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

import RelayRenderer from '../base/renderer';
import { RootQuery } from '../../utils/relay';

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
    viewer: Viewer,

    channel: ?string,
    selectChannel: (any, string) => void,
    openModal: () => void,
};

const ChannelList = (props: Props) => (
    <Paper style={{
        position: 'relative',
        width: 256,
    }}>
        <SelectableList value={props.channel} onChange={props.selectChannel}>
            <Subheader>Channels</Subheader>
            {props.viewer.channels.edges.map(({ node }) => (
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

        <CreateChannelDialog viewer={props.viewer} />
    </Paper>
);

const listConnect = connect(
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

const ListContainer = Relay.createContainer(listConnect(ChannelList), {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                channels(first: 10) {
                    edges {
                        node {
                            id
                            name
                            ${ChannelItem.getFragment('channel')}
                        }
                    }
                }

                ${CreateChannelDialog.getFragment('viewer')}
            }
        `,
    },
});

export default () => (
    <RelayRenderer Container={ListContainer} queryConfig={new RootQuery()} />
);
