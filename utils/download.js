const ytDlp = require('yt-dlp-exec');
const path = require('path');

async function downloadVideo(url, outputPath) {
  try {
    await ytDlp(url, {
      format: 'bestvideo[height<=720]+bestaudio/best[height<=720]',
      output: outputPath,
      noPlaylist: true,
    });

    console.log('Download completed');
  } catch (err) {
    console.error('Download failed:', err);
    throw err;
  }
}

module.exports = downloadVideo;