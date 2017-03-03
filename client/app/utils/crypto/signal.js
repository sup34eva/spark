// eslint-disable-next-line import/no-extraneous-dependencies
import {
    KeyHelper,
    SignalProtocolAddress,
    SessionBuilder,
    SessionCipher,
    // eslint-disable-next-line import/extensions
} from 'libsignal-protocol';

import SignalProtocolStore from './keyStore';

function toArrayBuffer(str) {
    return new TextEncoder('utf-8').encode(str).buffer;
}

function fromArrayBuffer(buf) {
    return new TextDecoder('utf-8').decode(new DataView(buf));
}

function generateIdentity(store) {
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ])
    .then(([identityKey, registrationId]) => {
        store.put('identityKey', identityKey);
        store.put('registrationId', registrationId);
        return null;
    });
}

function loadIdentity(store) {
    return Promise.all([
        store.get('identityKey'),
        store.get('registrationId'),
    ])
    .then(([identityKey, registrationId]) => {
        if (identityKey === undefined || registrationId === undefined) {
            return generateIdentity(store);
        }

        return null;
    });
}

function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    return Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId(),
    ])
    .then(([identity, registrationId]) =>
        Promise.all([
            KeyHelper.generatePreKey(preKeyId),
            KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
        ])
        .then(([preKey, signedPreKey]) => {
            store.storePreKey(preKeyId, preKey.keyPair);
            store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

            return {
                registrationId,
                identityKey: identity.pubKey,
                preKey: {
                    keyId: preKeyId,
                    publicKey: preKey.keyPair.pubKey,
                },
                signedPreKey: {
                    keyId: signedPreKeyId,
                    publicKey: signedPreKey.keyPair.pubKey,
                    signature: signedPreKey.signature,
                },
            };
        })
    );
}

function loadPreKeyBundle(store, preKeyId, signedPreKeyId) {
    return Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId(),
        store.loadPreKey(preKeyId),
        store.loadSignedPreKey(signedPreKeyId),
    ])
    .then(result => {
        if (result.indexOf(undefined) !== -1) {
            return generatePreKeyBundle(store, preKeyId, signedPreKeyId);
        }

        const [identity, registrationId, preKey, signedPreKey] = result;
        return {
            registrationId,
            identityKey: identity.pubKey,
            preKey: {
                keyId: preKeyId,
                publicKey: preKey.pubKey,
            },
            signedPreKey: {
                keyId: signedPreKeyId,
                publicKey: signedPreKey.pubKey,
                // signature: signedPreKey.signature,
            },
        };
    });
}

function serializeBundle(bundle) {
    return JSON.stringify(bundle, (key, value) => {
        if (value instanceof ArrayBuffer) {
            return Array.from(new Uint8Array(value).values());
        }

        return value;
    });
}

/* function deserializeBundle(str) {
    return JSON.parse(str, (key, value) => {
        if (value instanceof Array) {
            return new Uint8Array(value).buffer;
        }

        return value;
    });
}*/

const localStore = new SignalProtocolStore('local');
const remoteStore = new SignalProtocolStore('remote');

const remotePreKeyId = 1337;
const remoteSignedKeyId = 1;

const LOCAL_ADDRESS = new SignalProtocolAddress('+14151111111', 1);
const REMOTE_ADDRESS = new SignalProtocolAddress('+14152222222', 1);

const localIdentity = loadIdentity(localStore);
const remoteIdentity = loadIdentity(remoteStore);

export function encrypt(str) {
    return localIdentity
        .then(() => loadPreKeyBundle(remoteStore, remotePreKeyId, remoteSignedKeyId))
        .then(preKeyBundle => {
            const builder = new SessionBuilder(localStore, REMOTE_ADDRESS);
            return builder.processPreKey(preKeyBundle);
        })
        .then(() => {
            const sessionCipher = new SessionCipher(localStore, REMOTE_ADDRESS);
            return sessionCipher.encrypt(toArrayBuffer(str));
        });
}

export function decrypt(cipher) {
    return remoteIdentity
        .then(() => {
            const sessionCipher = new SessionCipher(remoteStore, LOCAL_ADDRESS);
            return sessionCipher.decryptPreKeyWhisperMessage(cipher.body, 'binary');
        })
        .then(fromArrayBuffer);
}

// const bobStore = new SignalProtocolStore();

/* const keyId = 1337;
const recipientId = 123;
const deviceId = 1;

const store = new KeyStore();
const address = new SignalProtocolAddress(recipientId, deviceId);
console.log('address', address);

const registrationId = KeyHelper.generateRegistrationId();
console.log('registrationId', registrationId);

Promise.all([
    KeyHelper.generatePreKey(keyId)
        .then(async preKey => {
            await store.storePreKey(preKey.keyId, preKey.keyPair);
            return preKey;
        }),
    KeyHelper.generateIdentityKeyPair()
        .then(identityKeyPair => Promise.all([
            (async () => {
                await store.saveIdentity(recipientId, identityKeyPair);
                await store.saveIdentity('', identityKeyPair);
                return identityKeyPair;
            })(),
            KeyHelper.generateSignedPreKey(identityKeyPair, keyId)
                .then(async signedPreKey => {
                    await store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);
                    return signedPreKey;
                }),
        ])),
])
.then(([preKey, [identityKeyPair, signedPreKey]]) => {
    const sessionBuilder = new SessionBuilder(store, address);
    console.log('sessionBuilder', sessionBuilder);

    return sessionBuilder.processPreKey({
        registrationId,
        identityKey: identityKeyPair.pubKey,
        signedPreKey: {
            keyId: signedPreKey.keyId,
            publicKey: signedPreKey.keyPair.pubKey,
            signature: signedPreKey.signature,
        },
        preKey: {
            keyId: preKey.keyId,
            publicKey: preKey.keyPair.pubKey,
        },
    });
})
.then(() => {
    console.log(arguments);
    const sessionCipher = new SessionCipher(store, address);
    return sessionCipher.encrypt('message');
})
.then(ciphertext => {
    console.log(ciphertext.type, ciphertext.body);
    return ciphertext;
})
.catch(err => {
    console.error(err);
});*/
