import Relay from 'react-relay';
import {
    Subscription,
} from 'relay-subscriptions';

import Message from '../components/item_message';

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
        return Relay.QL`
            subscription {
                messagesSubscribe(input: $input) {
                    messageEdge {
                        __typename
                        node {
                            id
                            offset
                            ${Message.getFragment('message')}
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
