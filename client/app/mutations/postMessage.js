// @flow
import Relay from 'react-relay';
import {
    cursorToOffset,
    offsetToCursor,
    toGlobalId,
 } from 'graphql-relay';

export default class PostMessageMutation extends Relay.Mutation {
    static fragments = {
        channel: () => Relay.QL`
            fragment on Channel {
                id
                name
                messages(last: 1) {
                    pageInfo {
                        endCursor
                    }
                }
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
            token: this.props.token,
            channel: this.props.channel.name,
            message: this.props.message,
        };
    }

    getOptimisticResponse() {
        let offset = 0;
        if (this.props.channel.messages.pageInfo.endCursor !== undefined) {
            offset = cursorToOffset(this.props.channel.messages.pageInfo.endCursor) + 1;
        }

        return {
            channel: this.props.channel,
            messageEdge: {
                cursor: offsetToCursor(offset),
                node: {
                    id: toGlobalId(
                        'Message',
                        `${this.props.channel.name}:${offset}`,
                    ),
                    content: this.props.message,
                    time: Date.now(),
                    author: {
                        id: toGlobalId('User', 0),
                        avatar: 'http://i.imgur.com/pv1tBmT.png',
                    },
                },
            },
        };
    }
}
