const admin = require("firebase-admin");
const serviceAccount = require("../firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

  // 🔴 IMPORTANT: Use your real bucket name
  storageBucket: "frame-extractor-97663.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };