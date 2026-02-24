const path = require("path");
const { bucket } = require("./config/firebase");

async function uploadTest() {
  try {
    const filePath = path.join(__dirname, "firebaseKey.json"); 
    const destination = "test/firebaseKey.json";

    await bucket.upload(filePath, {
      destination,
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    console.log("✅ Upload success:", publicUrl);
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}

uploadTest();