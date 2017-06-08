// @flow
import React, { PureComponent } from 'react';
import { graphql, commitMutation } from 'react-relay';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';

import connectFirebase from 'utils/firebase/enhancer';

import UserChip from '../shared/user';

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
        this.friends = {};
        this.state = {
            pending: false,
            name: '',
            search: '',
            invite: [],
            displayNames: new Map(),
        };
    }

    state: {
        pending: boolean,
        name: string,
        search: string,
        invite: Array<string>,
        displayNames: Map<string, string>,
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

        this.handleInvite = ({ value }) => {
            this.setState(state => ({
                search: '',
                invite: state.invite.concat([value]),
            }));
        };

        this.onCreate = async () => {
            this.setState({ pending: true });

            const { type } = this.props;
            const { name } = this.state;
            const { default: environment } = await import(/* webpackChunkName: "relay" */ '../../../../utils/relay');
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

    componentDidMount() {
        this.updateNames(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.updateNames(nextProps);
    }

    componentWillUnmount() {
        Object.entries(this.friends).forEach(([key, { ref, onValue }]) => {
            ref.off('value', onValue);
            delete this.friends[key];
        });
    }

    friends: {
        [key: string]: {
            ref: Object,
            onValue: Function,
        },
    };

    updateNames({ friends }) {
        const newFriends = new Set(friends);
        const oldFriends = new Set(Object.keys(this.friends));

        const intersection = new Set([...newFriends].filter(x => oldFriends.has(x)));
        for (const id of intersection) {
            newFriends.delete(id);
            oldFriends.delete(id);
        }

        newFriends.forEach(async id => {
            const onValue = snapshot => {
                console.log(id, snapshot.val());
                this.setState(state => ({
                    displayNames: state.displayNames.set(id, snapshot.val()),
                }));
            };

            const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../utils/firebase');
            const ref = database.ref(`/users/${id}/displayName`);
            ref.on('value', onValue);

            this.friends[id] = {
                ref, onValue,
            };
        });

        for (const id of oldFriends) {
            const { ref, onValue } = this.friends[id];
            ref.off('value', onValue);
            delete this.friends[id];
        }
    }

    props: Props;

    deleteHandler(uid) {
        return () => {
            this.setState(state => ({
                invite: state.invite.filter(elem => elem !== uid),
            }));
        };
    }

    render() {
        let content;
        const { type } = this.props;
        if (type === 'CHANNEL' || type === 'GROUP') {
            content = [
                <TextField
                    key="name"
                    floatingLabelText="Name" fullWidth
                    value={this.state.name} onChange={this.handleName} />,
                <div key="invite" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                }}>
                    {this.state.invite.map(uid => (
                        <UserChip
                            key={uid} uid={uid}
                            onRequestDelete={this.deleteHandler(uid)} />
                    ))}
                    <AutoComplete
                        dataSource={
                            this.state.displayNames.entrySeq()
                                .map(([value, text]) => ({ value, text }))
                                .toArray()
                        }
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
                    key="person"
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
            friends: do {
                /* eslint-disable no-unused-expressions */
                if (friends) {
                    Object.entries(friends)
                        .filter(([, status]) => status === 'FRIEND')
                        .map(([id]) => id);
                } else {
                    [];
                }
                /* eslint-enable no-unused-expressions */
            },
        }),
    ),
);

export default enhance(ChannelModal);
