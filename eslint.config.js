// https://docs.expo.dev/guides/using-eslint/
// Formatting is checked by `pnpm format:check`; eslint-config-prettier only turns off rules that
// would conflict with it, so Prettier does not run twice.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.expo/*', '.claude/*', 'openspec/*', 'coverage/*'],
  },
]);
