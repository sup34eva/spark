// @flow
import React from 'react';
import Paper from 'material-ui/Paper';

import UserChip from '../item/member';
import connectFirebase from '../../utils/firebase/enhancer';

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

const fbConnector = connectFirebase(
    props => `/channels/${props.channel}`,
    value => ({
        users: value ? Object.values(value.users) : [],
    }),
);

export default fbConnector(MemberList);
