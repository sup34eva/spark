const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://spark-c3d4b.firebaseio.com',
});

exports.auth = admin.auth();
const database = exports.database = admin.database();

exports.exists = path => new Promise((resolve, reject) => {
    database.ref(path).once('value', snapshot => {
        resolve(snapshot.val() !== null);
    }, reject);
});
