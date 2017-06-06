// @flow
import { graphql, requestSubscription } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import { fromGlobalId } from 'graphql-relay';

type Props = {
    channel: string,
};

export default async ({ channel }: Props) => {
    const { default: environment } = await import(/* webpackChunkName: "relay" */ './index');
    const { default: redux } = await import(/* webpackChunkName: "relay" */ '../../store');

    return requestSubscription(environment, {
        subscription: graphql`
            subscription subscribeMessages_NewMessageSubscription($input: MessagesSubscribeInput!) {
                messagesSubscribe(input: $input) {
                    messageEdge {
                        node {
                            id
                            time
                            ...message_message

                            content
                            author {
                                id
                                displayName
                                photoURL
                            }
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
        updater: store => {
            const rootField = store.getRootField('messagesSubscribe');

            const messageEdge = rootField.getLinkedRecord('messageEdge');
            const node = messageEdge.getLinkedRecord('node');

            const author = node.getLinkedRecord('author');
            const { id: uid } = fromGlobalId(author.getValue('id'));

            const { auth } = redux.getState();
            if (uid !== auth.user.uid) {
                const chan = rootField.getLinkedRecord('channel');
                const messages = ConnectionHandler.getConnection(chan, 'MessageList_messages');

                const pageInfo = messages.getLinkedRecord('pageInfo');
                const currentCursor = pageInfo.getValue('endCursor');
                const newCursor = messageEdge.getValue('cursor');
                pageInfo.setValue(newCursor, 'endCursor');

                const edge = ConnectionHandler.createEdge(
                    store,
                    messages,
                    node,
                    'MessageEdge',
                );

                ConnectionHandler.insertEdgeAfter(messages, edge, currentCursor);
            }
        },
        onNext: response => {
            const { author, content } = response.messagesSubscribe.messageEdge.node;
            const { id: uid } = fromGlobalId(author.id);
            console.log(author, content);

            const { auth } = redux.getState();
            if (uid !== auth.user.uid) {
                // eslint-disable-next-line no-new
                new Notification(author.displayName, {
                    badge: author.photoURL,
                    icon: author.photoURL,
                    image: author.photoURL,
                    body: content,
                });
            }
        },
        onError: err => {
            console.error(err);
        },
    });
};
