const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Downloads a YouTube video using yt-dlp limited to <=720p.
 * Supports mp4/webm and returns the full path to the downloaded file.
 */
async function downloadVideo(url, outputDir, videoId) {
  const outputTemplate = path.join(outputDir, `${videoId}.%(ext)s`);

  const args = [
    '-f',
    'bestvideo[height<=720]+bestaudio/best[height<=720]',
    '--no-playlist',
    '-o',
    outputTemplate,
    url,
  ];

  console.log('yt-dlp args:', args.join(' '));

  await new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', args, { shell: false });

    proc.stdout.on('data', (data) => {
      console.log(`[yt-dlp stdout]: ${data}`);
    });

    proc.stderr.on('data', (data) => {
      console.log(`[yt-dlp stderr]: ${data}`);
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });
  });

  const files = await fs.readdir(outputDir);
  const matching = files.find((f) => f.startsWith(videoId + '.'));

  if (!matching) {
    throw new Error('Downloaded video file not found after yt-dlp finished.');
  }

  const videoPath = path.join(outputDir, matching);
  return videoPath;
}

module.exports = downloadVideo;

