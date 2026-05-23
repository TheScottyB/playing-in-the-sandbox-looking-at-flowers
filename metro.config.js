// metro.config.js
// Configure Metro to resolve and watch the shared directory outside the project root.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the entire workspace root to allow resolving files in other workspace folders
config.watchFolders = [workspaceRoot];

// Ensure Metro resolves modules from the project's node_modules first
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Add wasm to assetExts to support expo-sqlite on web
config.resolver.assetExts.push('wasm');

module.exports = config;
