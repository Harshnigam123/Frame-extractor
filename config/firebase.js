const admin = require('firebase-admin');

if (!process.env.FIREBASE_KEY) {
  throw new Error("FIREBASE_KEY environment variable is missing");
}

// Convert ENV string → JSON object
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // optional but recommended
});

module.exports = admin;