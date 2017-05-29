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
            channel: this.props.channel.name,
            kind: this.props.kind,
            content: this.props.content,
        };
    }

    getOptimisticResponse() {
        const { channel, user, kind, content } = this.props;

        let offset = 0;
        if (channel.messages.pageInfo.endCursor !== undefined) {
            offset = cursorToOffset(channel.messages.pageInfo.endCursor) + 1;
        }

        return {
            channel: {
                id: channel.id,
                name: channel.name,
                messages: {
                    pageInfo: {
                        endCursor: offsetToCursor(offset),
                    },
                },
            },
            messageEdge: {
                cursor: offsetToCursor(offset),
                node: {
                    id: toGlobalId(
                        'Message',
                        `${channel.name}:${offset}`,
                    ),
                    kind,
                    content,
                    time: Date.now(),
                    author: {
                        id: user,
                    },
                },
            },
        };
    }
}
