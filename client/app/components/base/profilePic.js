// @flow
import React from 'react';

import Avatar from 'components/base/avatars';
import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    photoURL: ?string,
};

const ProfilePic = ({ photoURL, ...props }: Props) => (
    <Avatar images={photoURL ? [photoURL] : []} {...props} />
);

const enhance = connectFirebase(
    ({ uid }) => `/users/${uid}/photoURL`,
    photoURL => ({ photoURL }),
);

export default enhance(ProfilePic);
