const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Using modern DOM Components approach instead of complex transformer
// config.transformer.babelTransformerPath = require.resolve('./metro-transformer.js');

// Add source extensions like original project
config.resolver.sourceExts.push('mjs', 'cjs');

// Enable cache reset like original project
config.resetCache = true;

// Add extraNodeModules for Node.js polyfills (SDK 52 compatible)
config.resolver.extraNodeModules = {
    ...require('node-libs-react-native'),
    // Explicitly add @mattrglobal for BBS+ signatures
    '@mattrglobal/node-bbs-signatures': require.resolve('@mattrglobal/node-bbs-signatures'),
    // Only add fs polyfill to fix security-context issue
    'fs': require.resolve('node-libs-react-native/mock/empty'),
    // Use custom crypto polyfill with createHash support
    'crypto': require.resolve('./src/polyfills/crypto-module.js'),
    'node:crypto': require.resolve('./src/polyfills/crypto-module.js'),
    // Add Buffer polyfill
    'buffer': require.resolve('buffer'),
};

// SDK 52: Add asset extensions for better compatibility
config.resolver.assetExts.push('bin');
config.resolver.assetExts.push('wasm'); // Add WebAssembly support

module.exports = config;
