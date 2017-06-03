// @flow
import React from 'react';
import { graphql } from 'react-relay';
import { toGlobalId } from 'graphql-relay';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import marked from 'marked';

import BatchedSprings, { PRESET_ZOOM } from 'components/base/batchedSprings';
import Squircle from 'components/base/squircle';
import { withFragment } from 'utils/relay/enhancers';

// eslint-disable-next-line camelcase
import type { message_message } from './__generated__/message_message.graphql';
import File from './fileMessage';
import Text from './textMessage';
import styles from './message.css';

type Props = {
    channel: string,
    user: {
        uid: string,
    },

    // eslint-disable-next-line camelcase, react/no-unused-prop-types
    message: message_message,
};

marked.setOptions({
    sanitize: true,
});

const TRANSLATE = {
    tension: 50,
    friction: 5,
    end: 0,
};

const Message = (props: Props) => {
    const { kind, content, time, author } = props.message;
    if (!time || !author || !content) {
        return null;
    }

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
                        {do {
                            /* eslint-disable no-unused-expressions, semi */
                            if (kind === 'FILE') {
                                <File channel={props.channel} isMine={isMine} content={content} />
                            } else {
                                <Text content={content} />
                            }
                            /* eslint-enable no-unused-expressions, semi */
                        }}
                        <p className={styles.time}>{timeString}</p>
                    </div>
                </div>
            )}
        </BatchedSprings>
    );
};

const enhance = compose(
    withFragment(
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
    ),
    connect(
        ({ auth }) => ({
            user: auth.user,
        }),
    ),
);

export default enhance(Message);
