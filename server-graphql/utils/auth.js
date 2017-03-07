const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const {
    AuthenticationClient,
    ManagementClient,
} = require('auth0');

const token = fetch('https://l3ops.eu.auth0.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
        grant_type: 'client_credentials',
        audience: 'https://l3ops.eu.auth0.com/api/v2/',
    }),
}).then(res => {
    if (res.ok) {
        return res.json();
    }

    throw new Error(`Failed to fetch API access token with error '${res.status} ${res.statusText}'`);
});

const management = token.then(({ access_token }) =>
    new ManagementClient({
        domain: 'l3ops.eu.auth0.com',
        token: access_token,
    })
);

const client = new AuthenticationClient({
    domain: 'l3ops.eu.auth0.com',
    clientID: 'Xwle6vHxKZhPlYUfSetetsRCrio6uKxS'
});

exports.getUserById = id => management.then(mgt => mgt.users.get({ id }));
exports.getUserByToken = token => client.getProfile(token).then(json => JSON.parse(json));
