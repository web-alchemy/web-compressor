const fs = require('fs/promises');
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

async function removeFileIfLarger(sourcePath, targetPath) {
  const [sourceStat, targetStat] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath)
  ]);

  if (targetStat.size >= sourceStat.size) {
    await fs.unlink(targetPath);
  }
}

module.exports = {
  walk,
  makeDir,
  removeFileIfLarger
}