// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow bundling `.pte` ExecuTorch model files as assets.
config.resolver.assetExts.push('pte');

module.exports = config;
