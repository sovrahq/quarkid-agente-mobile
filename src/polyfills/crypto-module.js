// Custom crypto module with crypto-js for synchronous hashing
const webviewCrypto = require('react-native-webview-crypto');
const CryptoJS = require('crypto-js');

// Real synchronous hash implementation using crypto-js
const createHashImplementation = (algorithm) => {
  console.log(`🔧 crypto.createHash called for ${algorithm}`);

  let dataString = '';

  const hashObject = {
    update: function(input) {
      console.log(`🔧 hash.update called with ${typeof input}`);
      if (typeof input === 'string') {
        dataString += input;
      } else {
        // Convert Uint8Array to string
        const decoder = new TextDecoder();
        dataString += decoder.decode(input);
      }
      return hashObject; // Return the hash object itself for chaining
    },
    digest: function(encoding) {
      console.log(`🔧 hash.digest called with encoding: ${encoding}`);

      let hash;
      switch (algorithm.toLowerCase()) {
        case 'sha256':
          hash = CryptoJS.SHA256(dataString);
          break;
        case 'sha1':
          hash = CryptoJS.SHA1(dataString);
          break;
        case 'md5':
          hash = CryptoJS.MD5(dataString);
          break;
        default:
          throw new Error(`Unsupported hash algorithm: ${algorithm}`);
      }

      if (encoding === 'hex') {
        const result = hash.toString(CryptoJS.enc.Hex);
        console.log(`🔧 hash.digest result (hex): ${result}`);
        return result;
      } else if (encoding === 'base64') {
        const result = hash.toString(CryptoJS.enc.Base64);
        console.log(`🔧 hash.digest result (base64): ${result}`);
        return result;
      } else {
        // Return raw bytes as Buffer (Node.js compatibility)
        const hexString = hash.toString(CryptoJS.enc.Hex);
        const buffer = Buffer.from(hexString, 'hex');
        console.log(`🔧 hash.digest result (buffer): ${buffer.length} bytes`);
        return buffer;
      }
    }
  };

  return hashObject;
};

// Export crypto module with real createHash
module.exports = {
  ...webviewCrypto,
  createHash: createHashImplementation
};