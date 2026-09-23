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
    ignores: ['dist/*', '.expo/*', '.claude/*', 'openspec/*', 'coverage/*'],
  },
  // Repo scripts, Expo config plugins, and their tests run in Node (CommonJS), not the app.
  {
    files: ['scripts/**/*.js', 'plugins/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['scripts/**/*.test.js', 'plugins/**/*.test.js'],
    languageOptions: { globals: globals.jest },
  },
]);
