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
            client_id: process.env.AUTH0_MGT_CLIENT_ID,
            client_secret: process.env.AUTH0_MGT_CLIENT_SECRET,
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
        domain: process.env.AUTH0_DOMAIN,
        token: access_token,
    });
})();

const client = new AuthenticationClient({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_AUTH_CLIENT_ID,
});

exports.getUserById = async id => {
    const { users } = await management;
    console.log('getUserById', id);
    return users.get({ id });
};

exports.getUserByToken = async token => {
    console.log('getUserByToken', token);
    const json = await client.getProfile(token);

    try {
        return JSON.parse(json);
    } catch(err) {
        console.error(err);
        throw json;
    }
};
