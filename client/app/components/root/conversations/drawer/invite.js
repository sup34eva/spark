// @flow
import React, { PureComponent } from 'react';
import { ListItem } from 'material-ui/List';

import connectFirebase from 'utils/firebase/enhancer';

import ProfilePic from '../../shared/profilePic';


/* eslint-disable react/no-unused-prop-types */
type Props = {
    uid: string,
    key: string,
    user: ?Object,
    onTouchTap?: () => void,
};

class UserListitem extends PureComponent {
    props : Props;

    render() {
        if (this.props.user === null) {
            return null;
        }
        return (
            <ListItem style={{ overflow: 'hidden' }}
                onTouchTap={this.props.onTouchTap}
                leftAvatar={
                    <ProfilePic uid={this.props.uid} />
                }
                primaryText={this.props.user.displayName.substr(0, 22)}
                title={this.props.user.displayName} />
        );
    }
}

const enhance = connectFirebase(
    ({ uid }) => `/users/${uid}`,
    user => ({ user }),
);

export default enhance(UserListitem);
