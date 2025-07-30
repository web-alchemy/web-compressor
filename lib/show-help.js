const fs = require('fs');
const path = require('path');
const package = require('../package.json');

function showHelp() {
  const content =  fs.readFileSync(path.join(__dirname, './help.txt'), 'utf-8');
  console.log(`${package.name}@${package.version}`);
  console.log(content);
}

module.exports = {
  showHelp
}