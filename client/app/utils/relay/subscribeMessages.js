// @flow
import { graphql, requestSubscription } from 'react-relay';

import environment from './index';

type Props = {
    channel: string,
};

const updater = store => {
    console.log(store);
};

export default ({ channel }: Props) => requestSubscription(environment, {
    updater,
    subscription: graphql`
        subscription subscribeMessages_NewMessageSubscription($input: MessagesSubscribeInput!) {
            messagesSubscribe(input: $input) {
                messageEdge {
                    node {
                        id
                        time
                        ...message_message
                    }
                }
                channel {
                    id
                }
            }
        }
    `,
    variables: {
        input: { channel },
    },
    onNext: response => {
        console.log(response);
    },
});
