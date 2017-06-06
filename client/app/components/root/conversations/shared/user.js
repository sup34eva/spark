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

const UserChip = ({ uid, profile, onRequestDelete, style, ...props }: Props) => do {
    /* eslint-disable no-unused-expressions */
    if (profile) {
        (
            <Chip
                className={styles.chip} style={{ ...style, margin: null }}
                onRequestDelete={onRequestDelete} {...props}>
                <Avatar src={profile.photoURL} />
                {profile.displayName}
            </Chip>
        );
    } else {
        null;
    }
    /* eslint-enable no-unused-expressions */
};

const enhance = connectFirebase(
    ({ uid }) => `/users/${uid}`,
    profile => ({ profile }),
);

export default enhance(UserChip);
