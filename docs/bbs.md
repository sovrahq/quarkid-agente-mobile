# BBS+ Signatures Compatibility Issue

## Problem Summary

During migration to Expo 52 + React Native 0.76 + Node 20, we encountered compatibility issues with `@mattrglobal/node-bbs-signatures` package.

## Error Details

```
node-pre-gyp ERR! install response status 404 Not Found on https://github.com/mattrglobal/node-bbs-signatures/releases/download/0.18.1/node-v115-darwin-arm64.tar.gz
```

## Root Cause Analysis

### What's Happening:
- The package tries to download precompiled native code (C++/Rust) for your specific platform
- It's looking for `node-v115-darwin-arm64.tar.gz` (Node 20 + macOS ARM64)
- The 404 errors show these precompiled binaries don't exist on GitHub releases

### Why It's Missing:
1. **Node 20 Support**: The package versions were built before Node 20 was widely adopted
2. **ARM64 macOS**: Apple Silicon support may be incomplete for older package versions
3. **Version Lag**: Native binary releases often lag behind Node.js releases

## Impact on Application

### BBS+ Signature Features Won't Work:
- Zero-knowledge proofs
- Selective disclosure credentials
- Advanced privacy-preserving credential operations

### Core @extrimian Features Still Work:
- Basic DID/VC operations
- Standard JWT operations
- Most cryptographic functions

### Runtime Behavior:
- Any code calling BBS+ functions will throw errors
- App should handle these gracefully

## Technical Constraints

### React Native 0.76 Requirements:
- **Minimum Node Version**: 20.0.0
- **Recommended**: Node 20.18.x (latest LTS)
- **Dropped Support**: Node 16 and 18 are no longer supported

### This Creates a Conflict:
- **React Native 0.76**: Requires Node 20 ✅
- **@mattrglobal/node-bbs-signatures**: Missing Node 20 ARM64 binaries ❌

## Potential Solutions

### 1. Accept the Trade-off (Recommended for Now)
- Use Node 20 + RN 0.76
- Disable BBS+ features temporarily
- Implement graceful fallbacks

### 2. Build from Source
```bash
yarn install --build-from-source
```
- Requires build tools (Xcode, Python, etc.)
- Longer build times
- May have other compatibility issues

### 3. Wait for Updates
- Monitor @mattrglobal for Node 20 binary releases
- Check for community forks with Node 20 support

### 4. Alternative BBS+ Library
- Find different BBS+ implementation with Node 20 support
- Evaluate performance and API compatibility

### 5. Version Downgrade (Not Recommended)
- Use older Node version (16/18) where binaries exist
- Incompatible with React Native 0.76 requirements

## Recommended Approach

For the migration:
1. **Continue with Node 20 + RN 0.76**
2. **Mark BBS+ features as "coming soon"**
3. **Implement feature flags to disable BBS+ functionality**
4. **Plan for future update when binaries become available**

## Affected Packages in Migration

- `@mattrglobal/node-bbs-signatures@^0.18.1` - Core BBS+ implementation
- `@extrimian/kms-suite-bbsbls2020@^1.1.1` - Uses BBS+ signatures
- Any custom code using BBS+ credential features

## Monitoring for Resolution

Check these resources for updates:
- [@mattrglobal/node-bbs-signatures releases](https://github.com/mattrglobal/node-bbs-signatures/releases)
- [React Native compatibility tracker](https://reactnative.dev/versions)
- Community discussions around BBS+ and Node 20

## Next Steps

1. Complete migration without BBS+ functionality
2. Implement feature detection for BBS+ capabilities
3. Add graceful error handling for missing native modules
4. Monitor for binary availability updates
5. Plan incremental rollout when compatibility is restored