import Auth0Lock from 'auth0-lock';
import store from '../store';

class AuthService {
    constructor(clientId, domain) {
        this.lock = new Auth0Lock(clientId, domain, {
            closable: false,
            container: 'lock-frame',
            auth: {
                responseType: 'token',
            },
        });

        window.electron = {};

        this.login = this.login.bind(this);
        this.lock.on('authenticated', ({ idToken, accessToken, idTokenPayload }) => {
            this.setToken({
                user: idTokenPayload.sub,
                token: accessToken,
                idToken,
            });
        });
    }

    login() {
        this.lock.show();
    }

    close() {
        this.lock.hide();
    }

    loggedIn() {
        return this.getToken() !== null;
    }

    setToken(payload) {
        store.dispatch({
            type: 'SET_TOKEN',
            payload,
        });
    }

    getToken() {
        const { auth } = store.getState();
        return auth.token;
    }

    logout() {
        this.setToken(null);
    }
}

export default new AuthService(
    'MhuyBfbONUSSCKiONYZyI75LrSlFsQRQ',
    'l3ops.eu.auth0.com',
);
