// @flow
import Relay from 'react-relay';
import { toGlobalId } from 'graphql-relay';

export default class CreateChannelMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => Relay.QL`
            fragment on Viewer {
                id
            }
        `,
    };

    getMutation() {
        return Relay.QL`mutation { createChannel }`;
    }

    getFatQuery() {
        return Relay.QL`
            fragment on CreateChannelPayload {
                channelEdge
                viewer {
                    id
                    channels
                }
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'viewer',
            parentID: this.props.viewer.id,
            connectionName: 'channels',
            edgeName: 'channelEdge',
            rangeBehaviors: () => 'append',
        }];
    }

    getVariables() {
        return {
            token: this.props.token,
            name: this.props.name,
        };
    }

    getOptimisticResponse() {
        return {
            channelEdge: {
                node: {
                    id: toGlobalId('Channel', this.props.name),
                    name: this.props.name,
                    users: { edges: [] },
                    messages: { edges: [] },
                },
            },
            viewer: {
                id: this.props.viewer.id,
            },
        };
    }
}
