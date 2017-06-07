// @flow
import React, { PureComponent } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import connectFirebase from 'utils/firebase/enhancer';

import ProfilePic from '../../shared/profilePic';


type Props = {
    /* eslint-disable react/no-unused-prop-types */
    uid: string,
    inviteUid: ?string,
    /* eslint-enable react/no-unused-prop-types */
    closeModal: () => void,
    inviteDisplayName: ?string,
};

const bodyStyle = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };

class HandleInviteDialog extends PureComponent {
    componentWillMount() {
        this.acceptInvite = async () => {
            const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../utils/firebase');
            database.ref(`users/${this.props.uid}/friends/${this.props.inviteUid}`).set(
                'FRIEND'
            );
            this.props.closeModal();
        };

        this.declineInvite = async () => {
            const { database } = await import(/* webpackChunkName: "firebase" */ '../../../../utils/firebase');
            database.ref(`users/${this.props.uid}/friends/${this.props.inviteUid}`).remove();
            this.props.closeModal();
        };
    }

    props : Props;

    render() {
        return (
            <Dialog bodyStyle={bodyStyle}
                title="Friend invite"
                actions={[
                    <FlatButton
                        label="Decline"
                        primary
                        onTouchTap={this.declineInvite}
                    />,
                    <FlatButton
                        label="Accept"
                        primary
                        keyboardFocused
                        onTouchTap={this.acceptInvite}
                    />,
                ]}
                modal={false}
                open={this.props.inviteUid !== null}
                onRequestClose={this.props.closeModal}>

                <ProfilePic uid={this.props.inviteUid} />
                {this.props.inviteDisplayName} invited you.
            </Dialog>
        );
    }
}

const enhance = connectFirebase(
    ({ inviteUid }) => `/users/${inviteUid}/displayName`,
    inviteDisplayName => ({ inviteDisplayName }),
);

export default enhance(HandleInviteDialog);
