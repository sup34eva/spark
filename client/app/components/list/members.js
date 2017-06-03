// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';

import connectFirebase from 'utils/firebase/enhancer';
import UserChip from 'components/item/user';

import styles from './members.css';

type Props = {
    users: ?Array<string>,
};

const MemberList = ({ users }: Props, ctx) => (
    <Paper
        className={styles.wrapper} rounded={false}
        style={{ backgroundColor: ctx.muiTheme.palette.accent1Color }}>
        {users && users.map(user => (
            <UserChip key={user} user={user} />
        ))}
    </Paper>
);

MemberList.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

const enhance = connectFirebase(
    props => `/channels/${props.channel}`,
    value => ({
        users: value ? Object.keys(value.users) : [],
    }),
);

export default enhance(MemberList);
