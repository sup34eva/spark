// @flow
import Relay, { Mutation } from 'react-relay';

export default class CreateChannelMutation extends Mutation {
    getMutation() {
        return Relay.QL`mutation { createChannel }`;
    }

    getFatQuery() {
        return Relay.QL`
            fragment on CreateChannelPayload {
                viewer {
                    id
                }
            }
        `;
    }

    getVariables() {
        return {
            type: this.props.type,
            name: this.props.name,
        };
    }

    getConfigs() {
        return [];
    }
}
