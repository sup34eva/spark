// @flow
import React, { PureComponent } from 'react';
import { shell } from 'electron';
import FlatButton from 'material-ui/FlatButton';
import IconAttachment from 'material-ui/svg-icons/file/attachment';

import styles from './message.css';

export default class File extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            content: null,
            metadata: null,
            imageStyle: null,
        };
    }

    state: {
        content: ?string,
        imageStyle: ?Object,
        metadata: ?{
            customMetadata: {
                displayName: string,
            },
        },
    };

    componentWillMount() {
        this.handleClick = evt => {
            evt.preventDefault();
            shell.openExternal(this.state.content);
        };
        this.handleImage = evt => {
            const img = evt.target;
            this.setState({
                imageStyle: {
                    maxWidth: img.naturalWidth,
                    maxHeight: img.naturalHeight,
                },
            });
        };
    }

    // $FlowIssue
    async componentDidMount() {
        const { storage } = await import(/* webpackChunkName: "firebase" */ '../../../../../../utils/firebase');
        const ref = storage.ref(`${this.props.channel}/${this.props.content}`);
        const content = await ref.getDownloadURL();
        const metadata = await ref.getMetadata();
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ content, metadata });
    }

    props: {
        isMine: boolean,
        content: string,
        channel: string, // eslint-disable-line react/no-unused-prop-types
    };

    render() {
        const { metadata, content } = this.state;
        const color = this.props.isMine ? '#fff' : '#191a1b';
        const displayName = metadata ? metadata.customMetadata.displayName : '';

        return (
            <div className={styles.content}>
                {do {
                    /* eslint-disable no-unused-expressions */
                    if (metadata && metadata.contentType.startsWith('image/')) {
                        (
                            <img
                                src={content} alt={displayName}
                                onLoadStart={this.handleImage} style={this.state.imageStyle} />
                        );
                    } else {
                        (
                            <FlatButton
                                icon={<IconAttachment color={color} />}
                                label={displayName}
                                labelStyle={{ color }}
                                disabled={content === null}
                                onTouchTap={this.handleClick} />
                        );
                    }
                    /* eslint-enable no-unused-expressions */
                }}
            </div>
        );
    }
}
