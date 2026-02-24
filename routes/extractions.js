const express = require('express');
const firebase = require('../config/firebase');
const admin = firebase.admin;
const db = firebase.db;
const bucket = firebase.bucket;
const archiver = require('archiver');
const path = require('path');

const router = express.Router();

// GET /extractions?limit=20  -> list recent extractions
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    if (!db) {
  console.error("Firestore DB not initialized");
  return res.status(500).json({ error: "Database not initialized" });
}

const snap = await db
      .collection('extractions')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const items = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        videoId: data.videoId || doc.id,
        frameCount: data.frameCount || 0,
        frames: data.frames || [],
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
      };
    });

    return res.json({ items });
  } catch (err) {
    console.error('Error listing extractions:', err);
    return res
      .status(500)
      .json({ error: 'Failed to list extractions', details: err.message });
  }
});

// GET /extractions/:videoId -> single extraction document
router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const docRef = db.collection('extractions').doc(videoId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Extraction not found' });
    }

    const data = doc.data();
    return res.json({
      videoId: data.videoId || doc.id,
      frameCount: data.frameCount || 0,
      frames: data.frames || [],
      createdAt: data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null,
    });
  } catch (err) {
    console.error('Error fetching extraction:', err);
    return res
      .status(500)
      .json({ error: 'Failed to fetch extraction', details: err.message });
  }
});

// GET /extractions/:videoId/zip -> stream all frames as a ZIP file
router.get('/:videoId/zip', async (req, res) => {
  const { videoId } = req.params;

  try {
    const prefix = `frames/${videoId}/`;
    const [files] = await bucket.getFiles({ prefix });

    if (!files || files.length === 0) {
      return res
        .status(404)
        .json({ error: 'No frames found for this videoId' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${videoId}_frames.zip"`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error('Error while creating ZIP:', err);
      if (!res.headersSent) {
        res.status(500).end('Error while creating ZIP file');
      } else {
        res.end();
      }
    });

    archive.pipe(res);

    files.forEach((file) => {
      const fileName = path.basename(file.name);
      const stream = file.createReadStream();
      archive.append(stream, { name: fileName });
    });

    archive.finalize();
  } catch (err) {
    console.error('Error creating ZIP for extraction:', err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: 'Failed to create ZIP', details: err.message });
    }
    res.end();
  }
});

module.exports = router;

