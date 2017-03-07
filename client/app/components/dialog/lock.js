// @flow
import React from 'react';

import auth from '../../utils/auth';
import styles from './lock.css';

export default class Lock extends React.Component {
    componentDidMount() {
        auth.login();
    }

    componentWillUnmount() {
        auth.close();
    }

    render() {
        return <div id="lock-frame" className={styles.lock} />;
    }
}
