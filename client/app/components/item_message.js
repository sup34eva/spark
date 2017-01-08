// @flow
import React from 'react';
import Relay from 'react-relay';

type Props = {
    message: {
        content: string,
    },
};

const Message = (props: Props) => (
    <p>{props.message.content}</p>
);

export default Relay.createContainer(Message, {
    fragments: {
        message: () => Relay.QL`
            fragment on Message {
                content
            }
        `,
    },
});
