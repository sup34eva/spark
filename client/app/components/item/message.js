// @flow
import React, { Component } from 'react';
import { gql } from 'react-apollo';
import { toGlobalId } from 'graphql-relay';
import { connect } from 'react-redux';
import { shell } from 'electron';

import FlatButton from 'material-ui/FlatButton';
import IconAttachment from 'material-ui/svg-icons/file/attachment';

import md from '../../utils/markdown';
import { storage } from '../../utils/firebase';
import Squircle from '../base/squircle';
import styles from './message.css';

type Props = {
    channel: string,
    user: {
        uid: string,
    },

    /* eslint-disable react/no-unused-prop-types */
    message: {
        kind?: 'TEXT' | 'FILE',
        content: string,
        time: number,
        author: {
            id: string,
            photoURL: ?string,
        },
    },
    /* eslint-enable react/no-unused-prop-types */
};

class File extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: null,
            metadata: null,
        };
    }

    state: {
        content: ?string,
        metadata: ?{
            customMetadata: {
                displayName: string,
            },
        },
    };

    // $FlowIssue
    async componentDidMount() {
        const ref = storage.ref(`${this.props.channel}/${this.props.content}`);
        const content = await ref.getDownloadURL();
        const metadata = await ref.getMetadata();
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ content, metadata });
    }

    handleClick = evt => {
        evt.preventDefault();
        shell.openExternal(this.state.content);
    }

    props: {
        isMine: boolean,
        content: string,
        channel: string, // eslint-disable-line react/no-unused-prop-types
    };

    render() {
        const color = this.props.isMine ? '#fff' : '#191a1b';
        return (
            <FlatButton
                icon={<IconAttachment color={color} />}
                label={
                    this.state.metadata ? this.state.metadata.customMetadata.displayName : ''
                }
                labelStyle={{ color }}
                disabled={this.state.content === null}
                onTouchTap={this.handleClick} />
        );
    }
}

const Message = (props: Props) => {
    const { kind, content, time, author } = props.message;
    const timeString = new Date(time).toLocaleTimeString();
    const isMine = author.id === toGlobalId('User', props.user.uid);

    return (
        <div className={styles.message}>
            {!isMine && (
                <Squircle width="40" height="40" zDepth={0} className={styles.avatar}>
                    <image x="0" y="0" height="50" width="50" xlinkHref={author.photoURL} />
                </Squircle>
            )}
            <div className={`${styles.bubble} ${isMine ? styles.outgoing : styles.incoming}`}>
                <div className={styles.content}>
                    {kind === 'FILE' ? (
                        <File
                            kind={kind} content={content}
                            channel={props.channel} isMine={isMine} />
                    ) : (
                        md.render(content)
                    )}
                </div>
                <p className={styles.time}>{timeString}</p>
            </div>
        </div>
    );
};

const reduxConnector = connect(
    ({ auth, chat }) => ({
        user: auth.user,
        channel: chat.channel,
    }),
);

export const fragment = gql`
    fragment MessageFragment on Message {
        kind
        content
        time
        author {
            id
            photoURL
        }
    }
`;

export default reduxConnector(Message);
