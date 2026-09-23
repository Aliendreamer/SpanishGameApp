const fs = require('fs');
const path = require('path');

const { root } = require('./test-utils');

// Expo Router bundles every file under src/app as a route, so a test file there ends up in the
// app bundle (and its Node-only test imports break it). Route tests live in src/__tests__/app.
test('src/app holds no test files', () => {
  const files = fs.readdirSync(path.join(root, 'src/app'), { recursive: true, encoding: 'utf8' });

  expect(files.filter((file) => /\.test\.[jt]sx?$/.test(file))).toEqual([]);
});
