// @flow
import React from 'react';
import Relay, {
    RelayProp,
} from 'react-relay';
import RelaySubscriptions from 'relay-subscriptions';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import type {
    Channel as ChannelType,
} from '../../schema';

import Message from '../item/message';
import InfiniteList from '../base/infiniteList';
import MessagesSubscription from '../../subscriptions/messages';

import styles from './messages.css';

class MessageList extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (nextProps.channel.id !== this.props.channel.id) {
            this.props.relay.setVariables({
                count: 20,
            });
        }
    }

    props: {
        relay: RelayProp,
        channel: ChannelType,
    };

    render() {
        return (
            <InfiniteList
                key={this.props.channel.id}
                className={styles.messageList}
                canLoadMore={this.props.channel.messages.pageInfo.hasPreviousPage}
                onLoadMore={() => {
                    this.props.relay.setVariables({
                        count: this.props.relay.variables.count + 20,
                    });
                }}>
                <ReactCSSTransitionGroup
                    transitionName="message"
                    transitionAppear
                    transitionAppearTimeout={1616}
                    transitionEnterTimeout={1616}
                    transitionLeaveTimeout={1616}>
                    {this.props.channel.messages.edges
                        .sort((a, b) => a.node.time - b.node.time)
                        .reduce(({ list, lastTime }, { node }) => {
                            const thisTime = new Date(node.time);
                            if (thisTime.getDay() !== lastTime.getDay()) {
                                const timeString = thisTime.toLocaleDateString();
                                list.push(
                                    <p key={timeString} className={styles.date}>
                                        {timeString}
                                    </p>,
                                );
                            }

                            list.push(
                                <Message key={node.id} message={node} />,
                            );

                            return { list, lastTime: thisTime };
                        }, {
                            list: [],
                            lastTime: new Date(0),
                        }).list
                    }
                </ReactCSSTransitionGroup>
            </InfiniteList>
        );
    }
}

export const messageFragment = Relay.QL`
    fragment on Message {
        id
        time
        ${Message.getFragment('message')}
    }
`;

export default RelaySubscriptions.createContainer(MessageList, {
    initialVariables: {
        count: 20,
    },
    fragments: {
        channel: () => Relay.QL`
            fragment on Channel {
                id
                messages(last: $count) {
                    edges {
                        node {
                            ${messageFragment}
                        }
                    }
                    pageInfo {
                        hasPreviousPage
                    }
                }
                ${MessagesSubscription.getFragment('channel')}
            }
        `,
    },

    subscriptions: [
        ({ channel }) => new MessagesSubscription({ channel }),
    ],
});
