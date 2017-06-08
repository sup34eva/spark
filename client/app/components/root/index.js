// @flow
import React from 'react';
import { Route } from 'react-router-dom';

import styles from '../app.css';

import Sidebar from './sidebar';
import ConvRouter from './conversations';
import Profile from './profile';

const AppRouter = () => (
    <div className={styles.rootNavigator}>
        <Sidebar />

        <Route exact path="/" component={Profile} />
        <Route path="/:type" component={ConvRouter} />
    </div>
);

export default AppRouter;
