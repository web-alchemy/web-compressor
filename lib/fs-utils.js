const { promises: fs } = require('fs');
const path = require('path');

async function* walk(dirPath) {
  const queue = [dirPath];

  let item;
  while (item = queue.shift()) {
    const dir = await fs.opendir(item);

    for await (const dirent of dir) {
      const direntPath = path.join(item, dirent.name);

      if (dirent.isDirectory()) {
        queue.push(direntPath);
      }

      yield {
        dirent,
        direntPath
      };
    }
  }
}

function makeDir(dir) {
  return fs.mkdir(dir, { recursive: true });
}

module.exports = {
  walk,
  makeDir
}