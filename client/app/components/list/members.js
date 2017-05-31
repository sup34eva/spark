// @flow
import React from 'react';
import Paper from 'material-ui/Paper';

import connectFirebase from 'utils/firebase/enhancer';
import UserChip from 'components/item/user';

import styles from './members.css';

type Props = {
    users: ?Array<string>,
};

const MemberList = ({ users }: Props) => (
    <Paper className={styles.wrapper} rounded={false}>
        {users && users.map(user => (
            <UserChip key={user} user={user} />
        ))}
    </Paper>
);

const enhance = connectFirebase(
    props => `/channels/${props.channel}`,
    value => ({
        users: value ? Object.keys(value.users) : [],
    }),
);

export default enhance(MemberList);
