// @flow
import React, { Component } from 'react';
import { graphql, commitMutation } from 'react-relay';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';

import type { Dispatch } from 'redux';

import UserChip from '../item/user';

import environment from '../../utils/relay';
import { closeModal } from '../../actions/chat';

import type { Action } from '../../store';

type Props = {
    showModal: boolean,
    friends: Array<{
        uid: string,
        name: string,
    }>,
    closeModal: () => void,
};

class ChannelModal extends Component {
    static defaultProps = {
        friends: [],
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            pending: false,
            type: 'CHANNEL',
            name: '',
            search: '',
            invite: [],
        };
    }

    state: {
        pending: boolean,
        type: 'CHANNEL' | 'GROUP' | 'CONVERSATION',
        name: string,
        search: string,
        invite: Array<string>,
    };

    setPerson = (event, index, value) => {
        this.setState({
            invite: [value],
        });
    }
    handleType = (event, index, value) => {
        this.setState({
            type: value,
        });
    }
    handleName = (event: Object) => {
        this.setState({
            name: event.target.value,
        });
    }
    handleSearch = search => {
        this.setState({ search });
    }
    handleInvite = user => {
        this.setState(state => ({
            search: '',
            invite: state.invite.concat([user]),
        }));
    }

    props: Props;

    deleteHandler(user) {
        return () => {
            this.setState(state => ({
                invite: state.invite.filter(elem => elem !== user),
            }));
        };
    }

    render() {
        let content;
        if (this.state.type === 'CHANNEL' || this.state.type === 'GROUP') {
            content = [
                <TextField
                    hintText="Name" fullWidth key="name"
                    value={this.state.name} onChange={this.handleName} />,
                <div key="invite">
                    {this.state.invite.map(user => (
                        <UserChip
                            key={user} user={user}
                            onRequestDelete={this.deleteHandler(user)} />
                    ))}
                    <AutoComplete
                        dataSource={this.props.friends}
                        searchText={this.state.search}
                        onUpdateInput={this.handleSearch}
                        onNewRequest={this.handleInvite}
                        floatingLabelText="Invite"
                        fullWidth />
                </div>,
            ];
        } else {
            content = [
                <SelectField
                    floatingLabelText="Person"
                    value={this.state.invite[0]}
                    onChange={this.setPerson}>
                    {this.props.friends.map(({ uid, name }) => (
                        <MenuItem key={uid} value={uid} primaryText={name} />
                    ))}
                </SelectField>,
            ];
        }

        return (
            <Dialog
                open={this.props.showModal}
                onRequestClose={this.props.closeModal}
                title="Create a channel"
                actions={[
                    <FlatButton
                        label="Cancel"
                        disabled={this.state.pending}
                        onTouchTap={this.props.closeModal} />,
                    <FlatButton
                        label="Create" primary
                        disabled={this.state.pending}
                        onTouchTap={async () => {
                            this.setState({ pending: true });

                            const { type, name } = this.state;
                            commitMutation(environment, {
                                mutation: graphql`
                                    mutation createChannel_CreateChannelMutation($input: CreateChannelInput!) {
                                        createChannel(input: $input) {
                                            clientMutationId
                                        }
                                    }
                                `,
                                variables: {
                                    input: { type, name },
                                },

                                onCompleted: () => {
                                    this.props.closeModal();
                                    this.setState({ pending: false });
                                },
                            });
                        }} />,
                ]}>
                <SelectField
                    floatingLabelText="Type"
                    value={this.state.type}
                    onChange={this.handleType}>
                    <MenuItem value="CHANNEL" primaryText="Channel" />
                    <MenuItem value="GROUP" primaryText="Group" />
                    <MenuItem value="CONVERSATION" primaryText="Conversation" />
                </SelectField>
                {content}
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

export default reduxConnector(ChannelModal);
