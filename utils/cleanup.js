const fs = require('fs').promises;
const path = require('path');

async function removeEntry(fullPath) {
  try {
    const stat = await fs.lstat(fullPath);
    if (stat.isDirectory()) {
      const children = await fs.readdir(fullPath);
      await Promise.all(children.map((child) => removeEntry(path.join(fullPath, child))));
      await fs.rmdir(fullPath);
    } else {
      await fs.unlink(fullPath);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error removing temp entry:', fullPath, err);
    }
  }
}

/**
 * Cleans the temp directory by removing all children.
 * The root temp directory is recreated if it does not exist.
 */
async function cleanTempDirectory(tempRoot) {
  const root = tempRoot || path.join(__dirname, '..', 'temp');

  try {
    await fs.mkdir(root, { recursive: true });
    const entries = await fs.readdir(root);
    await Promise.all(entries.map((entry) => removeEntry(path.join(root, entry))));
  } catch (err) {
    console.error('Failed to clean temp directory:', err);
    throw err;
  }
}

module.exports = {
  cleanTempDirectory,
};

