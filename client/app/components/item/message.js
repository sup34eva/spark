// @flow
import React, { Component } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { toGlobalId } from 'graphql-relay';
import { connect } from 'react-redux';
import { shell } from 'electron';

import FlatButton from 'material-ui/FlatButton';
import IconAttachment from 'material-ui/svg-icons/file/attachment';

// eslint-disable-next-line camelcase
import type { message_message } from './__generated__/message_message.graphql';

import md from '../../utils/markdown';
import { storage } from '../../utils/firebase';
import BatchedSprings, { PRESET_ZOOM } from '../base/batchedSprings';
import Squircle from '../base/squircle';
import styles from './message.css';

type Props = {
    channel: string,
    user: {
        uid: string,
    },

    // eslint-disable-next-line camelcase, react/no-unused-prop-types
    message: message_message,
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

const TRANSLATE = {
    tension: 50,
    friction: 5,
    end: 0,
};

const Message = (props: Props) => {
    const { kind, content, time, author } = props.message;
    const timeString = new Date(time).toLocaleTimeString();
    const isMine = author.id === toGlobalId('User', props.user.uid);
    const start = isMine ? -100 : 100;

    return (
        // $FlowIssue
        <BatchedSprings springs={{ ...PRESET_ZOOM, translate: { ...TRANSLATE, start } }}>
            {({ opacity, scale, translate }) => (
                <div className={styles.message} style={{ opacity }}>
                    {!isMine && (
                        <Squircle
                            width="40" height="40"
                            zDepth={0} className={styles.avatar}
                            style={{ transform: `scale(${scale})` }}>
                            <image x="0" y="0" height="50" width="50" xlinkHref={author.photoURL} />
                        </Squircle>
                    )}
                    <div
                        className={`${styles.bubble} ${isMine ? styles.outgoing : styles.incoming}`}
                        style={{ transform: `translateX(${translate}%)` }}>
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
            )}
        </BatchedSprings>
    );
};

const reduxConnector = connect(
    ({ auth, chat }) => ({
        user: auth.user,
        channel: chat.channel,
    }),
);

export default createFragmentContainer(
    reduxConnector(Message),
    graphql`
        fragment message_message on Message {
            kind
            content
            time
            author {
                id
                photoURL
            }
        }
    `,
);
