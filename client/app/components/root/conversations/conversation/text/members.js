// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';

import connectFirebase from 'utils/firebase/enhancer';

import UserChip from '../../shared/user';

import UserMenu from './shared/userMenu';
import styles from './text.css';

type Props = {
    channel: string,
    users: ?Array<string>,
};

const MemberList = ({ channel, users }: Props, ctx) => (
    <Paper
        className={styles.wrapper} rounded={false}
        style={{ backgroundColor: ctx.muiTheme.palette.primary3Color }}>
        {users && users.map(uid => (
            <UserMenu key={uid} uid={uid} channel={channel}>
                <UserChip uid={uid} />
            </UserMenu>
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
