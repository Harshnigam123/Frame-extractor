const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Uses ffmpeg to extract frames from a video at a given interval.
 * Returns an array of local frame file paths.
 */
async function extractFrames(videoPath, jobDir, intervalSeconds) {
  const framesDir = path.join(jobDir, 'frames');
  await fs.mkdir(framesDir, { recursive: true });

  const framePattern = path.join(framesDir, 'frame_%03d.jpg');

  const args = [
    '-i',
    videoPath,
    '-vf',
    `fps=1/${intervalSeconds}`,
    '-qscale:v',
    '2',
    framePattern,
  ];

  console.log('ffmpeg args:', args.join(' '));

  await new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { shell: false });

    proc.stdout.on('data', (data) => {
      console.log(`[ffmpeg stdout]: ${data}`);
    });

    proc.stderr.on('data', (data) => {
      console.log(`[ffmpeg stderr]: ${data}`);
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start ffmpeg: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });

  const files = await fs.readdir(framesDir);
  const frameFiles = files
    .filter((f) => f.startsWith('frame_') && f.endsWith('.jpg'))
    .sort()
    .map((f) => path.join(framesDir, f));

  if (frameFiles.length === 0) {
    throw new Error('No frames were extracted by ffmpeg.');
  }

  return frameFiles;
}

module.exports = extractFrames;

