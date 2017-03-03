// @flow
import React from 'react';
import Relay from 'react-relay';

import type {
    // eslint-disable-next-line flowtype-errors/show-errors
    Message as MessageType,
} from '../../schema';

import Squircle from '../base/squircle';
import styles from './message.css';

class Message extends React.Component {
    constructor(props) {
        super(props);

        const isMine = props.message.author.id === '' || Math.random() < 0.5;
        this.state = {
            isMine,
        };
    }

    state: {
        isMine: bool,
    };

    props: {
        message: MessageType,
    };

    render() {
        const timeString = new Date(this.props.message.time).toLocaleTimeString();

        return (
            <div className={styles.message}>
                {!this.state.isMine && (
                    <Squircle width="40" height="40" zDepth={0} className={styles.avatar}>
                        <image x="0" y="0" height="50" width="50" xlinkHref={this.props.message.author.avatar} />
                    </Squircle>
                )}
                <div className={`${styles.bubble} ${this.state.isMine ? styles.outgoing : styles.incoming}`}>
                    <p className={styles.content}>{this.props.message.content}</p>
                    <p className={styles.time}>{timeString}</p>
                </div>
            </div>
        );
    }
}

export default Relay.createContainer(Message, {
    fragments: {
        message: () => Relay.QL`
            fragment on Message {
                uuid
                content
                time
                author {
                    id
                    avatar
                }
            }
        `,
    },
});
