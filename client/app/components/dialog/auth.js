// @flow
import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import styles from './auth.css';

export default class AuthForm extends PureComponent {
    constructor() {
        super();
        this.state = {
            username: '',
            password: '',
        };
    }

    state: {
        username: string,
        password: string,
    };

    componentWillMount() {
        this.onLogin = async () => {
            try {
                const { username, password } = this.state;
                const { auth } = await import(/* webpackChunkName: "firebase" */ '../../utils/firebase');
                await auth.signInWithEmailAndPassword(username, password);
            } catch (err) {
                const { code, message } = err;
                console.error(code, message);
            }
        };

        this.onRegister = async () => {
            try {
                const { username, password } = this.state;
                const { auth } = await import(/* webpackChunkName: "firebase" */ '../../utils/firebase');
                await auth.createUserWithEmailAndPassword(username, password);
            } catch (err) {
                const { code, message } = err;
                console.error(code, message);
            }
        };

        this.handleUsername = (event: Object) => {
            this.setState({
                username: event.target.value,
            });
        };

        this.handlePassword = (event: Object) => {
            this.setState({
                password: event.target.value,
            });
        };
    }

    render() {
        return (
            <div className={styles.form}>
                <TextField id="auth-username" value={this.state.username} onChange={this.handleUsername} />
                <TextField id="auth-password" type="password" value={this.state.password} onChange={this.handlePassword} />
                <div className={styles.btnGroup}>
                    <RaisedButton label="Login" primary onTouchTap={this.onLogin} />
                    <RaisedButton label="Register" onTouchTap={this.onRegister} />
                </div>
            </div>
        );
    }
}
