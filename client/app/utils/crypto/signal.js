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

async function generateIdentity(store) {
    const [identityKey, registrationId] = await Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ]);

    store.put('identityKey', identityKey);
    store.put('registrationId', registrationId);
}

async function loadIdentity(store) {
    const [identityKey, registrationId] = await Promise.all([
        store.get('identityKey'),
        store.get('registrationId'),
    ]);

    if (identityKey === undefined || registrationId === undefined) {
        await generateIdentity(store);
    }
}

async function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    const [identity, registrationId] = await Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId(),
    ]);

    const [preKey, signedPreKey] = await Promise.all([
        KeyHelper.generatePreKey(preKeyId),
        KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
    ]);

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
}

async function loadPreKeyBundle(store, preKeyId, signedPreKeyId) {
    const result = await Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId(),
        store.loadPreKey(preKeyId),
        store.loadSignedPreKey(signedPreKeyId),
    ]);

    if (result.indexOf(undefined) !== -1) {
        return await generatePreKeyBundle(store, preKeyId, signedPreKeyId);
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

export async function encrypt(str) {
    await localIdentity;
    const preKeyBundle = await loadPreKeyBundle(remoteStore, remotePreKeyId, remoteSignedKeyId);

    const builder = new SessionBuilder(localStore, REMOTE_ADDRESS);
    await builder.processPreKey(preKeyBundle);

    const sessionCipher = new SessionCipher(localStore, REMOTE_ADDRESS);
    return await sessionCipher.encrypt(toArrayBuffer(str));
}

export function decrypt(cipher) {
    await remoteIdentity;

    const sessionCipher = new SessionCipher(remoteStore, LOCAL_ADDRESS);
    const buffer = await sessionCipher.decryptPreKeyWhisperMessage(cipher.body, 'binary');

    return fromArrayBuffer(buffer);
}
