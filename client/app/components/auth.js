// @flow
import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

import Logo from './root/shared/logo';
import styles from './auth.css';

export default class AuthForm extends PureComponent {
    constructor() {
        super();
        this.state = {
            username: '',
            password: '',

            userError: null,
            passError: null,
            snackbar: '',
        };
    }

    state: {
        username: string,
        password: string,
        userError: ?string,
        passError: ?string,
        snackbar: string,
    };

    componentWillMount() {
        this.onLogin = async evt => {
            evt.preventDefault();

            try {
                const hasUsername = this.ensureUsername();
                const hasPassword = this.ensurePassword();
                if (hasUsername && hasPassword) {
                    const { username, password } = this.state;
                    const { auth } = await import(/* webpackChunkName: "firebase" */ '../utils/firebase');
                    await auth.signInWithEmailAndPassword(username, password);
                }
            } catch (err) {
                const { code, message } = err;
                console.error(code, message);
            }
        };

        this.onRegister = async () => {
            try {
                const hasUsername = this.ensureUsername();
                const hasPassword = this.ensurePassword();
                if (hasUsername && hasPassword) {
                    const { username, password } = this.state;
                    const { auth } = await import(/* webpackChunkName: "firebase" */ '../utils/firebase');
                    await auth.createUserWithEmailAndPassword(username, password);
                }
            } catch (err) {
                const { code, message } = err;
                console.error(code, message);
            }
        };

        this.onReset = async () => {
            try {
                if (this.ensureUsername()) {
                    const { username } = this.state;
                    const { auth } = await import(/* webpackChunkName: "firebase" */ '../utils/firebase');
                    await auth.sendPasswordResetEmail(username);
                    this.showSnackbar(`A reset email has been sent to ${username}`);
                }
            } catch (err) {
                const { code, message } = err;
                console.error(code, message);
            }
        };

        this.handleUsername = (event: Object) => {
            this.setState({
                username: event.target.value,
                userError: null,
            });
        };

        this.handlePassword = (event: Object) => {
            this.setState({
                password: event.target.value,
                passError: null,
            });
        };

        this.handleRequestClose = () => {
            this.setState({ snackbar: '' });
        };
    }

    ensureUsername() {
        if (this.state.username.length === 0) {
            this.setState({ userError: 'Username is required' });
            return false;
        }

        return true;
    }

    ensurePassword() {
        if (this.state.password.length === 0) {
            this.setState({ passError: 'Password is required' });
            return false;
        }

        return true;
    }

    showSnackbar(text) {
        this.setState({ snackbar: text });
    }

    render() {
        return (
            <form className={styles.form} onSubmit={this.onLogin}>
                <h1>
                    <Logo />
                    Spark
                </h1>
                <TextField
                    floatingLabelText="Username" errorText={this.state.userError}
                    value={this.state.username} onChange={this.handleUsername} />
                <TextField
                    floatingLabelText="Password" type="password" errorText={this.state.passError}
                    value={this.state.password} onChange={this.handlePassword} />

                <div className={styles.btnGroup}>
                    <RaisedButton label="Login" primary type="submit" />
                    <RaisedButton label="Register" onTouchTap={this.onRegister} />
                </div>

                <FlatButton label="Reset password" onTouchTap={this.onReset} />

                <Snackbar
                    open={!!this.state.snackbar} message={this.state.snackbar}
                    autoHideDuration={4000} onRequestClose={this.handleRequestClose} />
            </form>
        );
    }
}
