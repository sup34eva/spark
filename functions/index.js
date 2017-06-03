const functions = require('firebase-functions');
const admin = require('firebase-admin');
const gravatar = require('gravatar');

admin.initializeApp(functions.config().firebase);

exports.createUserProfile = functions.auth.user().onCreate(event => {
    const { uid, email, displayName, photoURL } = event.data;
    admin.database().ref('/users/' + uid).set({
        displayName: displayName || email,
        photoURL: photoURL || ('https:' + gravatar.url(email, { d: 'retro' })),
    });
});
