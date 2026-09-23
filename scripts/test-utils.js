// Helpers for the tests that check repo config files.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
// Non-blank, non-comment lines, trimmed: ignore files and hook scripts.
const lines = (file) =>
  read(file)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
const readJSON = (file) => JSON.parse(read(file));

module.exports = { root, read, lines, readJSON };
