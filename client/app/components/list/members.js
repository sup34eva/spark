// @flow
import React from 'react';
import { gql, graphql } from 'react-apollo';

import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

import styles from './members.css';
import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    Viewer,
} from '../../schema';

type Props = {
    data: {
        loading: boolean,
        viewer: Viewer,
    },
};

const MemberList = ({ data: { loading, viewer } }: Props) => !loading && (
    <Paper className={styles.wrapper} rounded={false}>
        {viewer.channel.users.edges.map(({ node }) => (
            <Chip key={node.id} className={styles.chip} style={{
                margin: null,
            }}>
                <Avatar src={node.picture} />
                {node.username}
            </Chip>
        ))}
    </Paper>
);

const apolloConnector = graphql(gql`
    query ChannelMembers($name: String!) {
        viewer {
            channel(name: $name) {
                users(first: 10) {
                    edges {
                        node {
                            id
                            username
                            picture
                        }
                    }
                }
            }
        }
    }
`, {
    options: ({ channel }) => ({
        variables: {
            name: channel,
        },
    }),
});

export default apolloConnector(MemberList);
