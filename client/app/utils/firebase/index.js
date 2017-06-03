// @flow
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

import store from 'store';

// $FlowIssue
firebase.initializeApp({
    apiKey: 'AIzaSyDruhWVdCcU8QSA24C7yNDVEai1thLSEkA',
    authDomain: 'spark-c3d4b.firebaseapp.com',
    databaseURL: 'https://spark-c3d4b.firebaseio.com',
    projectId: 'spark-c3d4b',
    storageBucket: 'spark-c3d4b.appspot.com',
    messagingSenderId: '359874121967',
});

export const auth = firebase.auth();
export const database = firebase.database();
export const storage = firebase.storage();

let statusRef;
let onDisconnect;
function reset() {
    if (statusRef) {
        statusRef.set('OFFLINE');
        statusRef = null;
    }

    if (onDisconnect) {
        onDisconnect.cancel();
        onDisconnect = null;
    }
}

export function signOut() {
    reset();
    return auth.signOut();
}

auth.onAuthStateChanged(async user => {
    if (user) {
        statusRef = database.ref(`/users/${user.uid}/status`);
        statusRef.set('ONLINE');

        onDisconnect = statusRef.onDisconnect();
        onDisconnect.set('OFFLINE');
    } else {
        reset();
    }

    store.dispatch({
        type: 'SET_USER',
        payload: user,
    });
});
