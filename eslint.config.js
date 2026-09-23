// https://docs.expo.dev/guides/using-eslint/
// Formatting is checked by `pnpm format:check`; eslint-config-prettier only turns off rules that
// would conflict with it, so Prettier does not run twice.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    // docs/design holds the Claude Design prototype: generated reference code, not app code.
    ignores: ['dist/*', '.expo/*', '.claude/*', 'openspec/*', 'coverage/*', 'docs/design/*'],
  },
  // Repo scripts, Expo config plugins, and their tests run in Node (CommonJS), not the app.
  {
    files: ['scripts/**/*.js', 'plugins/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['scripts/**/*.test.js', 'plugins/**/*.test.js', 'jest.setup.js'],
    languageOptions: { globals: globals.jest },
  },
]);
