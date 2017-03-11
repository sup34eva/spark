const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const {
    AuthenticationClient,
    ManagementClient,
} = require('auth0');

const token = (async () => {
    const res = await fetch('https://l3ops.eu.auth0.com/oauth/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            audience: 'https://l3ops.eu.auth0.com/api/v2/',
        }),
    });

    if (res.ok) {
        return await res.json();
    }

    throw new Error(`Failed to fetch API access token with error '${res.status} ${res.statusText}'`);
})();

const management = (async () => {
    const { access_token } = await token;
    return new ManagementClient({
        domain: 'l3ops.eu.auth0.com',
        token: access_token,
    });
})();

const client = new AuthenticationClient({
    domain: 'l3ops.eu.auth0.com',
    clientID: 'Xwle6vHxKZhPlYUfSetetsRCrio6uKxS'
});

exports.getUserById = async id => {
    const { users } = await management;
    return users.get({ id });
};

exports.getUserByToken = async token => {
    const json = await client.getProfile(token);
    return JSON.parse(json);
};
