// @flow
import React from 'react';
import { connect } from 'react-redux';

import Video from './video';
import Text from './text';

type Props = {
    joined: boolean,
};

const Chat = ({ joined }: Props) => (
    joined ? <Video /> : <Text />
);

const reduxConnector = connect(
    ({ stream }) => ({
        joined: stream.joined,
    }),
);

export default reduxConnector(Chat);
