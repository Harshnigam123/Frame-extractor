const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const downloadVideo = require('../utils/download');
const extractFrames = require('../utils/extract');
const uploadFrames = require('../utils/upload');
const { cleanTempDirectory } = require('../utils/cleanup');

const router = express.Router();

router.post('/', async (req, res) => {
  const { url, interval } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing "url"' });
  }

  const parsedInterval = parseInt(interval, 10);
  if (!parsedInterval || parsedInterval <= 0) {
    return res.status(400).json({ error: 'Invalid or missing "interval"' });
  }

  const videoId = uuidv4();
  console.log(`Starting extraction for videoId=${videoId}, url=${url}, interval=${parsedInterval}s`);

  const tempRoot = path.join(__dirname, '..', 'temp');
  const jobDir = path.join(tempRoot, videoId);

  try {
    console.log('Cleaning temp directory before processing...');
    await cleanTempDirectory(tempRoot);

    await fs.mkdir(jobDir, { recursive: true });

    console.log('Downloading video with yt-dlp...');
    const videoPath = await downloadVideo(url, jobDir, videoId);
    console.log(`Video downloaded to ${videoPath}`);

    console.log('Extracting frames with ffmpeg...');
    const framePaths = await extractFrames(videoPath, jobDir, parsedInterval);
    console.log(`Extracted ${framePaths.length} frames`);

    console.log('Uploading frames to Firebase Storage and saving metadata...');
    const { videoId: storedVideoId, frameCount, frames } = await uploadFrames(videoId, framePaths);

    console.log(`Successfully processed videoId=${storedVideoId}, frameCount=${frameCount}`);

    return res.json({
      videoId: storedVideoId,
      frameCount,
      frames,
    });
  } catch (err) {
    console.error('Error during extraction workflow:', err);
    return res.status(500).json({
      error: 'Failed to extract frames',
      details: err.message || 'Unknown error',
    });
  } finally {
    try {
      console.log('Cleaning temp directory after processing...');
      await cleanTempDirectory(tempRoot);
    } catch (cleanupErr) {
      console.error('Failed to clean temp directory:', cleanupErr);
    }
  }
});

module.exports = router;

