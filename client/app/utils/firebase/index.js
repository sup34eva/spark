// @flow
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

import store from '../../store';

// $FlowIssue
firebase.initializeApp({
    apiKey: 'AIzaSyDruhWVdCcU8QSA24C7yNDVEai1thLSEkA',
    authDomain: 'spark-c3d4b.firebaseapp.com',
    databaseURL: 'https://spark-c3d4b.firebaseio.com',
    projectId: 'spark-c3d4b',
    storageBucket: 'spark-c3d4b.appspot.com',
    messagingSenderId: '359874121967',
});

// $FlowIssue
export const auth = firebase.auth();
// $FlowIssue
export const database = firebase.database();
// $FlowIssue
export const storage = firebase.storage();

auth.onAuthStateChanged(user => {
    store.dispatch({
        type: 'SET_USER',
        payload: user,
    });
});
