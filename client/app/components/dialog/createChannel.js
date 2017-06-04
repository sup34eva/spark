// @flow
import React, { PureComponent } from 'react';
import { graphql, commitMutation } from 'react-relay';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';

import UserChip from 'components/item/user';
import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    open: boolean,
    onRequestClose: () => void,

    type: 'CHANNEL' | 'GROUP' | 'PERSON',
    friends: Array<{
        uid: string,
        name: string,
    }>,
};

class ChannelModal extends PureComponent {
    constructor(props: Props) {
        super(props);
        this.state = {
            pending: false,
            name: '',
            search: '',
            invite: [],
        };
    }

    state: {
        pending: boolean,
        name: string,
        search: string,
        invite: Array<string>,
    };

    componentWillMount() {
        this.setPerson = (event, index, value) => {
            this.setState({
                invite: [value],
            });
        };

        this.handleName = (event: Object) => {
            this.setState({
                name: event.target.value,
            });
        };

        this.handleSearch = search => {
            this.setState({ search });
        };

        this.handleInvite = user => {
            this.setState(state => ({
                search: '',
                invite: state.invite.concat([user]),
            }));
        };

        this.onCreate = async () => {
            this.setState({ pending: true });

            const { type } = this.props;
            const { name } = this.state;
            const { default: environment } = await import(/* webpackChunkName: "relay" */ '../../utils/relay');
            commitMutation(environment, {
                mutation: graphql`
                    mutation createChannel_CreateChannelMutation($input: CreateChannelInput!) {
                        createChannel(input: $input) {
                            clientMutationId
                        }
                    }
                `,
                variables: {
                    input: {
                        type,
                        name: type === 'PERSON' ? '' : name,
                    },
                },

                onCompleted: () => {
                    this.props.onRequestClose();
                    this.setState({ pending: false });
                },
            });
        };
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
        const { type } = this.props;
        if (type === 'CHANNEL' || type === 'GROUP') {
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
                open={this.props.open}
                onRequestClose={this.props.onRequestClose}
                title={`Create a ${type === 'PERSON' ? 'conversation' : type.toLowerCase()}`}
                actions={[
                    <FlatButton
                        label="Cancel"
                        disabled={this.state.pending}
                        onTouchTap={this.props.onRequestClose} />,
                    <FlatButton
                        label="Create" primary
                        disabled={this.state.pending}
                        onTouchTap={this.onCreate} />,
                ]}>
                {content}
            </Dialog>
        );
    }
}

const enhance = compose(
    connect(
        ({ auth }) => ({
            uid: auth.user.uid,
        }),
    ),
    connectFirebase(
        ({ uid }) => `/users/${uid}/friends`,
        friends => ({
            friends: friends || [],
        }),
    ),
);

export default enhance(ChannelModal);
