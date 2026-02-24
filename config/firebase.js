const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

  // VERY IMPORTANT ↓↓↓
  storageBucket: process.env.FIREBASE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket(); // uses bucket from above

module.exports = { admin, db, bucket };