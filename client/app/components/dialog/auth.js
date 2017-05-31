// @flow
import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { auth } from 'utils/firebase';

import styles from './auth.css';

export default class AuthForm extends PureComponent {
    constructor() {
        super();

        // $FlowIssue
        this.onRegister = this.onRegister.bind(this);
        // $FlowIssue
        this.onLogin = this.onLogin.bind(this);

        this.state = {
            username: '',
            password: '',
        };
    }

    state: {
        username: string,
        password: string,
    };

    async onLogin() {
        try {
            const { username, password } = this.state;
            await auth.signInWithEmailAndPassword(username, password);
        } catch (err) {
            const { code, message } = err;
            console.error(code, message);
        }
    }
    async onRegister() {
        try {
            const { username, password } = this.state;
            await auth.createUserWithEmailAndPassword(username, password);
        } catch (err) {
            const { code, message } = err;
            console.error(code, message);
        }
    }

    handleUsername = (event: Object) => {
        this.setState({
            username: event.target.value,
        });
    }
    handlePassword = (event: Object) => {
        this.setState({
            password: event.target.value,
        });
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
