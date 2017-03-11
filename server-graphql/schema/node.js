const {
    fromGlobalId,
    nodeDefinitions,
} = require('graphql-relay');

const { listMessages } = require('../utils/kafka');

const { nodeInterface, nodeField } = nodeDefinitions(
    async globalId => {
        const { type, id } = fromGlobalId(globalId);

        if (type === 'Message') {
            const [ topic, offset ] = id.split(':');
            const [ message ] = await listMessages(topic, offset, offset);
            return message;
        }

        if (type === 'Channel') {
            return id;
        }
    },
    obj => {
        if (typeof obj === 'string') {
            return channelType;
        }

        if (obj.avatar) {
            return userType;
        }

        return messageType;
    }
);

exports.nodeInterface = nodeInterface;
exports.nodeField = nodeField;
