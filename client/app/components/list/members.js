// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';

import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import withApollo from '../../utils/apollo/enhancer';

import styles from './members.css';

type Props = {
    data: {
        loading: boolean,
        Channel: ?Object,
    },
};

const MemberList = ({ data: { loading, Channel } }: Props) => !loading && Channel && (
    <Paper className={styles.wrapper} rounded={false}>
        {Channel.users.map(node => (
            <Chip key={node.id} className={styles.chip} style={{
                margin: null,
            }}>
                <Avatar src={node.picture} />
                {node.displayName}
            </Chip>
        ))}
    </Paper>
);

const apolloConnector = withApollo('apollo', graphql(gql`
    query ChannelMembers($name: String!) {
        Channel(name: $name) {
            users(first: 10) {
                id
                displayName
                picture
            }
        }
    }
`, {
    options: ({ channel }) => ({
        variables: {
            name: channel,
        },
    }),
}));

export default apolloConnector(MemberList);
