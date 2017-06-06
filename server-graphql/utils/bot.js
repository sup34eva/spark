const fetch = require('node-fetch');
const uuid = require('node-uuid');

const { sendMessage } = require('./kafka');
const { database } = require('./firebase');

module.exports = async (channel, { uid, url, access }, value) => {
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(value),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    switch(data.action.toUpperCase()) {
        case 'ANSWER': {
            await sendMessage({
                key: uuid.v1(),
                topic: channel,
                value: JSON.stringify({
                    kind: 'TEST',
                    content: data.content,
                    author: uid,
                    time: Date.now(),
                }),
            });
            return;
        }

        case 'KICK': {
            if (access === 'MODERATOR') {
                const { author } = value;
                database.ref(`/channels/${channel}/users/${author}/kick`).set(Date.now() + 60000);
            }
            return;
        }

        case 'BAN': {
            if (access === 'MODERATOR') {
                const { author } = value;
                database.ref(`/channels/${channel}/users/${author}/ban`).set(true);
            }
            return;
        }
    }
};
