// @flow
import React from 'react';
import Dialog from 'material-ui/Dialog';

import ProfilePic from 'components/root/shared/profilePic';
import connectFirebase from 'utils/firebase/enhancer';

import styles from './dialog.css';

type Props = {
    open: boolean,
    onClose: () => void,

    uid: string,
    profile: ?{
        displayName: string,
        birthDate: ?string,
        biography: ?string,
    },
};

const UserDialog = ({ open, onClose, uid, profile }: Props) => do {
    /* eslint-disable no-unused-expressions */
    if (profile) {
        (
            <Dialog
                open={open} onRequestClose={onClose}
                title={profile.displayName} bodyClassName={styles.dialog}>
                <ProfilePic uid={uid} height="96" width="96" />
                <div className={styles.fields}>
                    {profile.birthDate && (
                        <p>Birthdate: {new Date(profile.birthDate).toLocaleDateString()}</p>
                    )}
                    {profile.biography && <p>Biography: {profile.biography}</p>}
                </div>
            </Dialog>
        );
    } else {
        <Dialog open={open} onRequestClose={onClose} />;
    }
    /* eslint-enable no-unused-expressions */
};

const enhance = connectFirebase(
    ({ uid }) => `/users/${uid}`,
    profile => ({ profile }),
);

export default enhance(UserDialog);
