# @mattrglobal Node.js Binary Compatibility Issues

## The Problem

`@mattrglobal/node-bbs-signatures` is a native Node.js module that uses pre-compiled binaries for performance. The package tries to download platform-specific binaries (`.node` files) for your system:

- **Your system**: Node 20.18.1 on Darwin ARM64 (M1/M2 Mac)
- **What it's looking for**: `node-v115-darwin-arm64.tar.gz`
- **The issue**: The binary for Node.js v20 (ABI version 115) doesn't exist on their GitHub releases

From the error logs:
```
node-pre-gyp ERR! install response status 404 Not Found on
https://github.com/mattrglobal/node-bbs-signatures/releases/download/0.15.0/node-v115-darwin-arm64.tar.gz
```

## Why This Happens

1. **Node.js ABI versions**: Each major Node.js version has an ABI (Application Binary Interface) version:
   - Node 16 = ABI 93
   - Node 18 = ABI 108
   - Node 20 = ABI 115

2. **Package age**: The `@mattrglobal/node-bbs-signatures@0.15.0` was compiled before Node 20 was released, so no Node 20 binaries exist.

## Impact on Our Project

**This is actually fine for our use case** because:

1. **We're using DOM Components**: Our BBS+ key generation runs in a WebView-like context using `@extrimian/kms-suite-bbsbls2020`, not directly calling `@mattrglobal/node-bbs-signatures`

2. **React Native context**: The native Node.js binaries wouldn't work in React Native anyway - they're designed for server-side Node.js

3. **Extrimian handles it**: The `@extrimian` libraries provide their own WebAssembly-based BBS+ implementation that works in React Native

## The Solution

The warnings are harmless because:
- Our DOM Component uses `BbsBls2020Suite` from `@extrimian/kms-suite-bbsbls2020`
- This library has its own BBS+ implementation that doesn't rely on the problematic native binaries
- The `'use dom'` directive runs JavaScript (including WASM) in a web context where these crypto libraries work properly

So the migration is still on track - the real BBS+ cryptographic operations will work through the Extrimian SDK's WebAssembly implementation, not the problematic native Node.js binaries.