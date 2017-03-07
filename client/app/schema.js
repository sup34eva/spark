// @flow

'no babel-plugin-flow-react-proptypes';

export type ID = string;

export type Schema = {
    query: RootQuery,
    mutation: RootMutation,
    subscription: RootSubscription,
};

export type Channel = {
    id: ID,
    name: string,
    users: UserConnection,
    messages: MessageConnection,
};

export type ChannelConnection = {
    pageInfo: PageInfo,
    edges: Array<ChannelEdge>,
};

export type ChannelEdge = {
    node: Channel,
    cursor: string,
};

export type CreateChannelInput = {
    name: string,
    clientMutationId: string,
};

export type CreateChannelPayload = {
    channelEdge: ChannelEdge,
    viewer: Viewer,
    clientMutationId: string,
};

export type Message = {
    id: ID,
    content: string,
    author: User,
    time: number,
};

export type MessageConnection = {
    pageInfo: PageInfo,
    edges: Array<MessageEdge>,
};

export type MessageEdge = {
    node: Message,
    cursor: string,
};

export type MessagesSubscribeInput = {
    channel: string,
    clientSubscriptionId: string,
};

export type MessagesSubscribeMessage = {
    messageEdge: MessageEdge,
    channel: Channel,
};

export type Node = {
    id: ID,
};

export type PageInfo = {
    hasNextPage: bool,
    hasPreviousPage: bool,
    startCursor: string,
    endCursor: string,
};

export type PostMessageInput = {
    channel: string,
    message: string,
    clientMutationId: string,
};

export type PostMessagePayload = {
    messageEdge: MessageEdge,
    channel: Channel,
    clientMutationId: string,
};

export type RootMutation = {
    createChannel: CreateChannelPayload,
    postMessage: PostMessagePayload,
};

export type RootQuery = {
    node: Node,
    viewer: Viewer,
};

export type RootSubscription = {
    messagesSubscribe: MessagesSubscribeMessage,
};

export type User = {
    id: ID,
    username: string,
    email: string,
    picture: string,
};

export type UserConnection = {
    pageInfo: PageInfo,
    edges: Array<UserEdge>,
};

export type UserEdge = {
    node: User,
    cursor: string,
};

export type Viewer = {
    id: ID,
    channels: ChannelConnection,
    channel: Channel,
    me: User,
};
