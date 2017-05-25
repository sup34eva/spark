// @flow
import React, { Component } from 'react';
import { gql, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import type {
    Dispatch,
} from 'redux';

import type {
    Action,
} from '../../store';

import {
    closeModal,
} from '../../actions/chat';

type Props = {
    showModal: boolean,
    closeModal: () => void,
    createChannel: (string) => void,
};

class ChannelModal extends Component {
    constructor(props: Props) {
        super(props);
        this.state = {
            name: '',
        };
    }

    state: {
        name: string,
    };
    props: Props;

    handleChange = (event: Object) => {
        this.setState({
            name: event.target.value,
        });
    }

    render() {
        return (
            <Dialog
                open={this.props.showModal} onRequestClose={this.props.closeModal}
                title="Create a channel"
                actions={[
                    <FlatButton
                        label="Cancel" primary
                        onTouchTap={this.props.closeModal} />,
                    <FlatButton
                        label="Create" primary
                        onTouchTap={() => {
                            this.props.createChannel(this.state.name);
                            this.props.closeModal();
                        }} />,
                ]}>
                <TextField
                    hintText="Channel name" fullWidth
                    value={this.state.name} onChange={this.handleChange} />
            </Dialog>
        );
    }
}

const reduxConnector = connect(
    ({ chat }) => ({
        showModal: chat.showModal,
    }),
    (dispatch: Dispatch<Action>) => ({
        closeModal() {
            dispatch(closeModal());
        },
    }),
);

const apolloConnector = graphql(gql`
    mutation CreateChannelMutation($input: CreateChannelInput!) {
        createChannel(input: $input) {
            channelEdge {
                node {
                    id
                }
            }
        }
    }
`, {
    props: ({ mutate }) => ({
        createChannel: name => mutate({
            variables: {
                input: { name },
            },
        }),
    }),
});

export default apolloConnector(reduxConnector(ChannelModal));
