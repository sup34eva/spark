// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';
import { toGlobalId } from 'graphql-relay';

import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import {
    connect,
} from 'react-redux';

import type {
    Dispatch,
} from 'redux';

import ChannelItem from '../item/channel';

import type {
    Action,
} from '../../store';

import {
    setChannelModal,
} from '../../actions/chat';

import withApollo from '../../utils/apollo/enhancer';

type Props = {
    modalText: ?string,
    createChannel: () => void,
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
                    props.createChannel();
                }} />,
        ]}>
        <TextField
            hintText="Channel name" fullWidth
            value={props.modalText} onChange={props.setModalText} />
    </Dialog>
);

const apolloConnector = withApollo('apollo', graphql(gql`
    mutation createChannel($input: CreateChannelInput!) {
        createChannel(input: $input) {
            channelEdge {
                node {
                    ...ChannelFragment
                }
            }
            viewer {
                id
            }
        }
    }

    ${ChannelItem.fragment}
`, {
    props: ({ ownProps, mutate }) => ({
        createChannel: () => mutate({
            variables: {
                input: {
                    name: ownProps.modalText,
                },
            },
            optimisticResponse: {
                __typename: 'RootMutation',
                createChannel: {
                    __typename: 'CreateChannelMutation',
                    channelEdge: {
                        __typename: 'ChannelEdge',
                        node: {
                            __typename: 'Channel',
                            id: toGlobalId('Channel', ownProps.modalText),
                            name: ownProps.modalText,
                            users: { edges: [] },
                            messages: { edges: [] },
                        },
                    },
                    viewer: {
                        __typename: 'Viewer',
                        id: ownProps.viewer.id,
                    },
                },
            },
        }),
    }),
}));

const reduxConnector = connect(
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

export default reduxConnector(apolloConnector(ChannelModal));
