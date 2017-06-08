// @flow
import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import withState from 'recompose/withState';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import connectFirebase from 'utils/firebase/enhancer';

import UserChip from '../shared/user';

import UserMenu from './shared/userMenu';
import MembersModal from './addMembers';
import styles from './text.css';

type Props = {
    channel: string,
    users: ?Array<string>,

    showModal: boolean,
    setModal: (boolean) => void,
};

const MemberList = ({ channel, users, showModal, setModal }: Props, ctx) => (
    <Paper
        className={styles.wrapper} rounded={false}
        style={{ backgroundColor: ctx.muiTheme.palette.primary3Color }}>
        {users && users.map(uid => (
            <UserMenu key={uid} uid={uid} channel={channel}>
                <UserChip uid={uid} />
            </UserMenu>
        ))}

        <IconButton onTouchTap={() => setModal(true)}>
            <ContentAdd />
        </IconButton>

        <MembersModal channel={channel} open={showModal} onRequestClose={() => setModal(false)} />
    </Paper>
);

MemberList.contextTypes = {
    muiTheme: PropTypes.object.isRequired,
};

const enhance = compose(
    withState('showModal', 'setModal', false),
    connectFirebase(
        props => `/channels/${props.channel}`,
        value => ({
            users: value ? Object.keys(value.users) : [],
        }),
    ),
);

export default enhance(MemberList);
