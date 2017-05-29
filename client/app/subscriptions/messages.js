// @flow
import Relay from 'react-relay';
import { Subscription } from 'relay-subscriptions';

export default class MessagesSubscription extends Subscription {
    static fragments = {
        channel: () => Relay.QL`
            fragment on Channel {
                id
                name
            }
        `,
    };

    getSubscription() {
        // eslint-disable-next-line global-require
        const { messageFragment } = require('../components/list/messages');

        return Relay.QL`
            subscription {
                messagesSubscribe(input: $input) {
                    messageEdge {
                        __typename
                        node {
                            ${messageFragment}
                        }
                    }
                    channel {
                        id
                    }
                }
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'channel',
            parentID: this.props.channel.id,
            connectionName: 'messages',
            edgeName: 'messageEdge',
            rangeBehaviors: () => 'append',
        }];
    }

    getVariables() {
        return {
            channel: this.props.channel.name,
        };
    }
}
