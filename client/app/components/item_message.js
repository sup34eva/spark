// @flow
import React from 'react';
import Relay from 'react-relay';

type Props = {
    message: {
        value: string,
    },
};

const Message = (props: Props) => (
    <p>{props.message.value}</p>
);

export default Relay.createContainer(Message, {
    fragments: {
        message: () => Relay.QL`
            fragment on Message {
                value
            }
        `,
    },
});
