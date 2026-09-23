// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// The bundled dictionary (assets/vocabulary/vocabulary.db) ships as an asset that expo-sqlite
// copies into the app's database directory.
config.resolver.assetExts.push('db');

module.exports = config;
