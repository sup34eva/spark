// @flow
import React from 'react';
import Dialog from 'material-ui/Dialog';

import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    open: boolean,
    onClose: () => void,

    profile: ?{
        displayName: string,
        birthDate: string,
        biography: string,
    },
};

const UserDialog = ({ open, onClose, profile }: Props) => do {
    /* eslint-disable no-unused-expressions */
    if (profile) {
        (
            <Dialog open={open} onRequestClose={onClose} title={profile.displayName}>
                <p>Birthdate: {new Date(profile.birthDate).toLocaleDateString()}</p>
                <p>Biography: {profile.biography}</p>
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
