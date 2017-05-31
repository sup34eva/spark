// @flow
import React from 'react';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';
import { List, makeSelectable } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import CircularProgress from 'material-ui/CircularProgress';

import { selectChannel, openModal } from 'actions/chat';
import connectFirebase from 'utils/firebase/enhancer';
import ChannelItem from 'components/item/channel';
import CreateChannelDialog from 'components/dialog/createChannel';
import type { Action } from 'store';

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
        zIndex: 1,
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

const enhance = compose(
    connectFirebase(
        () => '/channels',
        value => ({
            // $FlowIssue
            channels: value ? Object.entries(value).map(([name, val]) => ({ name, ...val })) : null,
        }),
    ),
    connect(
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
    ),
);

export default enhance(ChannelList);
