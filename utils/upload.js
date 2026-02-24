const path = require('path');
const { admin, db, bucket } = require('../config/firebase');

/**
 * Uploads local frame image files to Firebase Storage and
 * saves a Firestore document in the "extractions" collection.
 * Returns { videoId, frameCount, frames }.
 */
async function uploadFrames(videoId, framePaths) {
  const frameUrls = [];

  for (const framePath of framePaths) {
    const filename = path.basename(framePath);
    const destination = `frames/${videoId}/${filename}`;

    console.log(`Uploading frame ${filename} to ${destination}...`);

    await bucket.upload(framePath, {
      destination,
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public,max-age=31536000',
      },
    });

    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2035',
    });

    frameUrls.push(url);
  }

  console.log('Saving metadata to Firestore...');

  const docRef = db.collection('extractions').doc(videoId);
  await docRef.set({
    videoId,
    frameCount: frameUrls.length,
    frames: frameUrls,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    videoId,
    frameCount: frameUrls.length,
    frames: frameUrls,
  };
}

module.exports = uploadFrames;

