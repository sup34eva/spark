// @flow
import React from 'react';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import { List, makeSelectable } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import CircularProgress from 'material-ui/CircularProgress';

import {
    connect,
} from 'react-redux';

import type {
    Dispatch,
} from 'redux';

import type {
    Action,
} from '../../store';

import ChannelItem from '../item/channel';
import CreateChannelDialog from '../dialog/createChannel';
import connectFirebase from '../../utils/firebase/enhancer';

import {
    selectChannel,
    openModal,
} from '../../actions/chat';

const SelectableList = makeSelectable(List);

type Props = {
    channels: ?Array<{
        name: string,
        subtext: ?string,
        users: ?{
            [key: string]: string,
        },
    }>,
    channel: ?string,
    selectChannel: (any, string) => void,
    openModal: () => void,
};

const ChannelList = ({ channels, channel, ...props }: Props) => (
    <Paper style={{
        position: 'relative',
        width: 256,
    }}>
        <SelectableList value={channel} onChange={props.selectChannel}>
            <Subheader>Channels</Subheader>
            {channels ? channels.map(node => (
                // $FlowIssue
                <ChannelItem key={node.name} value={node.name} channel={node} />
            )) : (
                <CircularProgress />
            )}
        </SelectableList>

        <IconButton onTouchTap={props.openModal} style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
        }}>
            <ContentAdd />
        </IconButton>

        <CreateChannelDialog />
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
            dispatch(openModal());
        },
    }),
);

const fbConnector = connectFirebase(
    () => '/channels',
    value => ({
        // $FlowIssue
        channels: value ? Object.entries(value).map(([name, val]) => ({ name, ...val })) : null,
    }),
);

export default fbConnector(reduxConnector(ChannelList));
