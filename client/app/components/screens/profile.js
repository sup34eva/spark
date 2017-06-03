// @flow
import React from 'react';
import FlatButton from 'material-ui/FlatButton';

const Profile = () => (
    <div style={{ paddingTop: 48 }}>
        <FlatButton label="Sign Out" onTouchTap={async () => {
            const { signOut } = await import(/* webpackChunkName: "firebase" */ '../../utils/firebase');
            await signOut();
        }} />
    </div>
);

export default Profile;
