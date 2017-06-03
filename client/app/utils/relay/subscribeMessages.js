// @flow
import { graphql, requestSubscription } from 'react-relay';

type Props = {
    channel: string,
};

const updater = store => {
    console.log(store);
};

export default async ({ channel }: Props) => {
    const { default: environment } = await import(/* webpackChunkName: "relay" */ './index');
    return requestSubscription(environment, {
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
};
