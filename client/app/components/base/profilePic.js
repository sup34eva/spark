// @flow
import React from 'react';
import Badge from 'material-ui/Badge';

import Avatar from 'components/base/avatars';
import connectFirebase from 'utils/firebase/enhancer';

type Props = {
    className: ?string,
    style: ?Object,

    uid: string,
    photoURL: ?string,
    status: 'OFFLINE' | 'BUSY' | 'AWAY' | 'ONLINE',
};

const ROOT_STYLE = {
    display: null,
    padding: null,
};

function badgeStyle(status) {
    let backgroundColor;
    switch (status) {
        case 'OFFLINE':
            backgroundColor = '#f44336';
            break;

        case 'BUSY':
            backgroundColor = '#ffeb3b';
            break;

        case 'AWAY':
            backgroundColor = '#ff9800';
            break;

        case 'ONLINE':
        default:
            backgroundColor = '#8bc34a';
            break;

    }

    return {
        top: null,
        bottom: -4,
        right: -4,
        width: 16,
        height: 16,
        backgroundColor,
    };
}

const ProfilePic = ({ uid, className, style, status, photoURL, ...props }: Props) => (
    <Badge
        className={className} style={{ ...ROOT_STYLE, ...style }}
        badgeStyle={badgeStyle(status)} badgeContent="">
        <Avatar images={photoURL ? [photoURL] : []} {...props} />
    </Badge>
);

const enhance = connectFirebase(
    ({ uid }) => `/users/${uid}`,
    value => do {
        /* eslint-disable no-unused-expressions */
        if (value) {
            ({ status: value.status, photoURL: value.photoURL });
        } else {
            null;
        }
        /* eslint-enable no-unused-expressions */
    },
);

export default enhance(ProfilePic);
