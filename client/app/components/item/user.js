// @flow
import React from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

import connectFirebase from 'utils/firebase/enhancer';

import styles from './user.css';

type Props = {
    onRequestDelete?: () => void,
    profile: ?{
        displayName: string,
        photoURL: string,
    },
};

const UserChip = ({ profile, onRequestDelete }: Props) => do {
    /* eslint-disable no-unused-expressions, semi */
    if (profile) {
        <Chip className={styles.chip} style={{ margin: null }} onRequestDelete={onRequestDelete}>
            <Avatar src={profile.photoURL} />
            {profile.displayName}
        </Chip>
    } else {
        null
    }
    /* eslint-enable no-unused-expressions, semi */
};

const enhance = connectFirebase(
    ({ user }) => `/users/${user}`,
    profile => ({ profile }),
);

export default enhance(UserChip);
