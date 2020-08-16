const fs = require('fs').promises;
const path = require('path');

async function* walk(dirPath) {
  let item;
  const queue = [dirPath];

  while (item = queue.shift()) {
    const dir = await fs.opendir(item);
    for await (const dirent of dir) {
      const direntPath = path.join(item, dirent.name);
      if (dirent.isDirectory()) {
        queue.push(direntPath);
      }
      yield { dirent, direntPath };
    }
  }
}

module.exports = walk;