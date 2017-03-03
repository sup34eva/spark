// @flow
import React from 'react';
import Relay from 'react-relay';

import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

import styles from './members.css';
import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    Channel as ChannelType,
} from '../../schema';

type Props = {
    channel: ChannelType,
};

const MemberList = (props: Props) => (
    <Paper className={styles.wrapper} rounded={false}>
        {props.channel.users.edges.map(({ node }) => (
            <Chip key={node.id} className={styles.chip} style={{
                margin: null,
            }}>
                <Avatar src={node.avatar} />
                {node.name}
            </Chip>
        ))}
    </Paper>
);

export default Relay.createContainer(MemberList, {
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                users(first: 10) {
                    edges {
                        node {
                            id
                            name
                            avatar
                        }
                    }
                }
            }
        `,
    },
});
