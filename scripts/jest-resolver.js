// Jest resolver: Reanimated's (it loads Reanimated's and Worklets' web files, as their native
// modules don't exist under Jest) on top of React Native's (jest-expo's default, which lets tests
// mock react-native subpaths).
const reactNative = require('@react-native/jest-preset/jest/resolver');
const reanimated = require('react-native-reanimated/jest/resolver');

// Those resolvers pick files by checking whether the folder path names their package. pnpm's store
// folder for Reanimated also names Worklets (react-native-reanimated@4.7.1_react-native-worklets@…),
// which would send every Reanimated file down the Worklets path; they see the path without that
// folder name, and the real path is used to resolve.
const STORE_FOLDER = /([\\/]\.pnpm[\\/])[^\\/]+/;

module.exports = (request, options) =>
  reanimated(request, {
    ...options,
    basedir: options.basedir.replace(STORE_FOLDER, '$1_'),
    defaultResolver: (path, rest) =>
      reactNative(path, {
        ...rest,
        basedir: options.basedir,
        defaultResolver: options.defaultResolver,
      }),
  });
