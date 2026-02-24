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

    // Copy cookies to writable temp folder
    const tempCookiesPath = path.join(__dirname, "../temp/cookies.txt");
    fs.copyFileSync("/etc/secrets/cookies.txt", tempCookiesPath);

    await ytDlp(url, {
      format: "bestvideo[height<=720]+bestaudio/best[height<=720]",
      output: outputPath,

      cookies: tempCookiesPath,   // ⭐ using writable copy

      noPlaylist: true,

      addHeader: [
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language: en-US,en;q=0.9"
      ],

      extractorArgs: "youtube:player_client=android",
      geoBypass: true,
      sleepRequests: 5,
      retries: 3,
      fragmentRetries: 3
    });

    console.log("Download completed");

  } catch (err) {
    console.error("Download failed:", err);
    throw err;
  }
}
module.exports = downloadVideo;