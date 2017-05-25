const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://spark-c3d4b.firebaseio.com',
});

exports.auth = admin.auth();
exports.database = admin.database();
