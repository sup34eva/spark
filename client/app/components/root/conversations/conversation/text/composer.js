// @flow
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toGlobalId } from 'graphql-relay';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import VideoCall from 'material-ui/svg-icons/av/video-call';
import TextField from 'material-ui/TextField';

import { sendOffer } from 'actions/chat';
import postMessage from 'utils/relay/postMessage';
import Squircle from 'components/root/shared/squircle';
import redux from 'store';

import styles from './text.css';

type Props = {
    uid: string, // eslint-disable-line react/no-unused-prop-types
    channel: string,
    navigation: {
        navigate: (string) => void, // eslint-disable-line react/no-unused-prop-types
    },
};

class PostForm extends PureComponent {
    static contextTypes = {
        muiTheme: PropTypes.object.isRequired,
    };

    constructor(props, ctx) {
        super(props, ctx);
        this.state = {
            message: '',
        };
    }

    componentWillMount() {
        this.joinCall = () => {
            this.props.navigation.navigate('Video');
            redux.dispatch(sendOffer());
        };

        this.onSubmit = async evt => {
            evt.preventDefault();
            if (this.state.message.trim().length > 0) {
                const id = toGlobalId('Channel', this.props.channel);

                const { store } = await import(/* webpackChunkName: "relay" */ '../../../../../utils/relay');
                const { data } = store.lookup({
                    dataID: id,
                    node: {
                        selections: [{
                            kind: 'LinkedField',
                            name: '__MessageList_messages_connection',
                            alias: 'messages',
                            selections: [{
                                kind: 'LinkedField',
                                name: 'pageInfo',
                                selections: [{
                                    kind: 'ScalarField',
                                    name: 'endCursor',
                                }],
                            }],
                        }],
                    },
                });

                // $FlowIssue
                postMessage({
                    kind: 'TEXT',
                    content: this.state.message,
                    user: this.props.uid,
                    channel: {
                        id,
                        name: this.props.channel,
                        ...data,
                    },
                });

                this.setMessage(null, '');
            }
        };

        this.onKeyPress = evt => {
            if (evt.which === 13 && !evt.shiftKey) {
                this.onSubmit(evt);
            }
        };

        this.setMessage = (evt, message) => {
            this.setState({ message });
        };
    }

    props: Props;

    render() {
        const enabled = this.state.message.trim().length > 0;
        return (
            <Paper style={{ backgroundColor: '#fff' }} rounded={false}>
                <form onSubmit={this.onSubmit} className={styles.form}>
                    <IconButton onTouchTap={this.joinCall}>
                        <VideoCall />
                    </IconButton>
                    <TextField
                        hintText="Message" className={styles.content}
                        multiLine onKeyPress={this.onKeyPress}
                        value={this.state.message} onChange={this.setMessage} />
                    <Squircle
                        height={48} width={48} zDepth={Number(enabled)}
                        onClick={this.onSubmit}
                        className={styles.btn} data-enabled={enabled}>
                        <rect height="50" width="50" />
                        <g transform="translate(13, 13)">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </g>
                    </Squircle>
                </form>
            </Paper>
        );
    }

}

const enhance = connect(
    ({ auth }) => ({
        uid: auth.user.uid,
    }),
);

export default enhance(PostForm);
