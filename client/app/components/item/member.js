// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';

import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

import styles from './member.css';

type Props = {
    user: ?{
        displayName: ?string,
        photoURL: ?string,
    },
};

const UserChip = ({ user }: Props) => (
    user ? (
        <Chip className={styles.chip} style={{ margin: null }}>
            <Avatar src={user.photoURL} />
            {user.displayName}
        </Chip>
    ) : null
);

const apolloConnector = graphql(gql`
    query UserProfile($id: String!) {
        viewer {
            user(id: $id) {
                id
                displayName
                photoURL
            }
        }
    }
`, {
    options: ({ user }) => ({
        variables: {
            id: user,
        },
    }),
    props: ({ data: { loading, viewer } }) => ({
        user: !loading ? viewer.user : null,
    }),
});

export default apolloConnector(UserChip);
