import localForage from 'localforage';

export default class SignalProtocolStore {
    constructor(name = 'default') {
        this.store = localForage.createInstance({ name });
    }

    getIdentityKeyPair() {
        return this.get('identityKey');
    }

    getLocalRegistrationId() {
        return this.get('registrationId');
    }

    put(key, value) {
        if (key === undefined || value === undefined || key === null || value === null) {
            throw new Error('Tried to store undefined/null');
        }

        // console.log('put', key, value);
        return this.store.setItem(key, value);
    }

    async get(key, defaultValue) {
        if (key === null || key === undefined) {
            throw new Error('Tried to get value for undefined/null key');
        }

        const storedValue = await this.store.getItem(key);
        // console.log('get', key, storedValue);

        if (storedValue === null) {
            return defaultValue;
        }

        return storedValue;
    }

    remove(key) {
        if (key === null || key === undefined) {
            throw new Error('Tried to remove value for undefined/null key');
        }

        return this.store.removeItem(key);
    }

    async isTrustedIdentity(identifier, identityKey) {
        if (identifier === null || identifier === undefined) {
            throw new Error('tried to check identity key for undefined/null key');
        }

        if (!(identityKey instanceof ArrayBuffer)) {
            throw new Error('Expected identityKey to be an ArrayBuffer');
        }

        const trusted = await this.get(`identityKey${identifier}`);
        if (trusted === undefined) {
            return true;
        }

        return identityKey.toString('binary') === trusted.toString('binary');
    }

    loadIdentityKey(identifier) {
        if (identifier === null || identifier === undefined) {
            throw new Error('Tried to get identity key for undefined/null key');
        }

        return this.get(`identityKey${identifier}`);
    }

    saveIdentity(identifier, _identityKey) {
        console.trace('saveIdentity');

        let identityKey = _identityKey;
        if (typeof identityKey === 'string') {
            identityKey = window.dcodeIO.ByteBuffer.fromBinary(identityKey).buffer;
        }

        if (identifier === null || identifier === undefined) {
            throw new Error('Tried to put identity key for undefined/null key');
        }

        return this.put(`identityKey${identifier}`, identityKey);
    }

    async loadPreKey(keyId) {
        const res = await this.get(`25519KeypreKey${keyId}`);
        if (res !== undefined) {
            return { pubKey: res.pubKey, privKey: res.privKey };
        }

        return res;
    }

    storePreKey(keyId, keyPair) {
        return this.put(`25519KeypreKey${keyId}`, keyPair);
    }

    removePreKey(keyId) {
        return this.remove(`25519KeypreKey${keyId}`);
    }

    async loadSignedPreKey(keyId) {
        const res = await this.get(`25519KeysignedKey${keyId}`);
        if (res !== undefined) {
            return { pubKey: res.pubKey, privKey: res.privKey };
        }

        return res;
    }

    storeSignedPreKey(keyId, keyPair) {
        return this.put(`25519KeysignedKey${keyId}`, keyPair);
    }

    removeSignedPreKey(keyId) {
        return this.remove(`25519KeysignedKey${keyId}`);
    }

    loadSession(identifier) {
        return this.get(`session${identifier}`);
    }

    storeSession(identifier, record) {
        return this.put(`session${identifier}`, record);
    }

    removeSession(identifier) {
        return this.remove(`session${identifier}`);
    }

    async removeAllSessions(identifier) {
        const keys = await this.store.keys();
        return await Promise.all(
            keys.filter(id => id.startsWith(`session${identifier}`))
                .map(this.store.removeItem)
        );
    }
}
