// @flow
import React from 'react';
import { Route } from 'react-router-dom';

import Drawer from './drawer';
import TextConv from './text';
import VideoCall from './video';
import styles from './conversations.css';

const ConvRouter = (props: Object) => (
    <div className={styles.navigator}>
        <Drawer {...props} />
        <Route exact path="/:type/:channel" component={TextConv} />
        <Route path="/:type/:channel/video" component={VideoCall} />
    </div>
);

export default ConvRouter;
