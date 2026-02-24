const fs = require("fs");
const ytDlp = require("yt-dlp-exec");
const path = require("path");

console.log("=== COOKIE DEBUG START ===");
console.log(
  "Cookies file exists:",
  fs.existsSync("/etc/secrets/cookies.txt")
);
console.log("=== COOKIE DEBUG END ===");

async function downloadVideo(url, outputPath) {
  try {
    await ytDlp(url, {
      format: "bestvideo[height<=720]+bestaudio/best[height<=720]",
      output: outputPath,

      // ✅ correct cookies flag
      cookies: "/etc/secrets/cookies.txt",

      noPlaylist: true,
    });

    console.log("Download completed");
  } catch (err) {
    console.error("Download failed:", err);
    throw err;
  }
}

module.exports = downloadVideo;