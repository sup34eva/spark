// @flow
import React from 'react';
import Relay, {
    RelayProp,
} from 'react-relay';

import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

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
    // eslint-disable-next-line flowtype-errors/show-errors
    Viewer,
} from '../../schema';

import CreateChannelMutation from '../../mutations/createChannel';

import {
    setChannelModal,
} from '../../actions/chat';

type Props = {
    relay: RelayProp,
    viewer: Viewer,
    modalText: ?string,
    closeModal: () => void,
    setModalText: (any, string) => void,
};

const ChannelModal = (props: Props) => (
    <Dialog
        open={props.modalText !== null} onRequestClose={props.closeModal}
        title="Create a channel"
        actions={[
            <FlatButton
                label="Cancel" primary
                onTouchTap={props.closeModal} />,
            <FlatButton
                label="Create" primary
                onTouchTap={() => {
                    props.closeModal();
                    props.relay.commitUpdate(
                        new CreateChannelMutation({
                            viewer: props.viewer,
                            name: props.modalText,
                        }),
                    );
                }} />,
        ]}>
        <TextField
            hintText="Channel name" fullWidth
            value={props.modalText} onChange={props.setModalText} />
    </Dialog>
);

const modalConnect = connect(
    ({ chat }) => ({
        modalText: chat.channelModal,
    }),
    (dispatch: Dispatch<Action>) => ({
        closeModal() {
            dispatch(setChannelModal(null));
        },
        setModalText(evt, newValue) {
            dispatch(setChannelModal(newValue));
        },
    }),
);

export default Relay.createContainer(modalConnect(ChannelModal), {
    fragments: {
        viewer: () => Relay.QL`
            fragment on Viewer {
                ${CreateChannelMutation.getFragment('viewer')}
            }
        `,
    },
});
