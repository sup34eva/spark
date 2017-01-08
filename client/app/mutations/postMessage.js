// @flow
import Relay from 'react-relay';

export default class PostMessageMutation extends Relay.Mutation {
    static fragments = {
        channel: () => Relay.QL`
            fragment on Channel {
                id
                name
            }
        `,
    };

    getMutation() {
        return Relay.QL`mutation { postMessage }`;
    }

    getFatQuery() {
        return Relay.QL`
            fragment on PostMessagePayload {
                messageEdge
                channel {
                    id
                    messages
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
            message: this.props.message,
        };
    }

    getOptimisticResponse() {
        return {
            messageEdge: {
                node: {
                    id: 'optimistic',
                    content: this.props.message,
                    time: Date.now(),
                    author: 0,
                },
            },
            channel: {
                id: this.props.channel.id,
            },
        };
    }
}
