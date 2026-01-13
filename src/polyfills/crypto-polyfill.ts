// React Native crypto polyfill
import { Buffer } from 'buffer';

console.log('🔧 Loading crypto polyfill...');

// Create a synchronous random values function
// Note: Using Math.random as expo-random is async and can't be used in getRandomValues
const getRandomValues = (array: any) => {
  if (array.constructor === Uint8Array || array.constructor === Array) {
    for (var i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  } else if (array.constructor === Uint16Array) {
    for (var i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 65536);
    }
  } else if (array.constructor === Uint32Array) {
    for (var i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 4294967296);
    }
  } else {
    // Generic fallback
    for (var i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return array;
};

// Set up global crypto object
if (typeof global.crypto === 'undefined') {
  global.crypto = {} as any;
}

// Override getRandomValues
global.crypto.getRandomValues = getRandomValues;

// Also set up for window context (needed by js-crypto-env)
if (typeof (global as any).window === 'undefined') {
  (global as any).window = global;
}

// Set up window.crypto for js-crypto-env detection
if (typeof (global as any).window.crypto === 'undefined') {
  (global as any).window.crypto = global.crypto;
}

// Set up subtle crypto if missing
if (!global.crypto.subtle) {
  (global.crypto as any).subtle = {};
}

// Set up global Buffer
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Add Node.js crypto.createHash function - create hash implementation
const createHashImplementation = (algorithm: string) => {
  // console.log(`🔧 crypto.createHash called for ${algorithm}`);

  let data = new Uint8Array();

  return {
    update: (input: string | Uint8Array) => {
      // console.log(`🔧 hash.update called with ${typeof input}`);
      if (typeof input === 'string') {
        const encoder = new TextEncoder();
        const newData = encoder.encode(input);
        const combined = new Uint8Array(data.length + newData.length);
        combined.set(data);
        combined.set(newData, data.length);
        data = combined;
      } else {
        const combined = new Uint8Array(data.length + input.length);
        combined.set(data);
        combined.set(input, data.length);
        data = combined;
      }
      return this;
    },
    digest: (encoding?: string) => {
      console.log(`🔧 hash.digest called with encoding: ${encoding}`);
      // For now, return a mock hash - this should be replaced with actual hashing
      const mockHash = new Uint8Array(32); // 32 bytes for SHA-256
      // Fill with pseudo-random data based on input
      for (var i = 0; i < mockHash.length; i++) {
        mockHash[i] = (data.length + i) % 256;
      }

      if (encoding === 'hex') {
        return Array.from(mockHash).map(b => b.toString(16).padStart(2, '0')).join('');
      } else if (encoding === 'base64') {
        return btoa(String.fromCharCode(...mockHash));
      }
      return mockHash;
    }
  };
};

// Add Node.js crypto.createHash function to multiple contexts
console.log('🔧 Adding crypto.createHash function...');

// Add to global.crypto
if (!(global.crypto as any).createHash) {
  (global.crypto as any).createHash = createHashImplementation;
}

// Add to window.crypto if available
if (typeof (global as any).window !== 'undefined' && (global as any).window.crypto) {
  if (!(global as any).window.crypto.createHash) {
    (global as any).window.crypto.createHash = createHashImplementation;
  }
}

// Create a crypto module export
const cryptoModule = {
  createHash: createHashImplementation,
  getRandomValues: global.crypto.getRandomValues,
  subtle: global.crypto.subtle
};

// Add to require cache for Node.js style imports
if (typeof require !== 'undefined' && require.cache) {
  require.cache['crypto'] = { exports: cryptoModule };
  require.cache['node:crypto'] = { exports: cryptoModule };
}

// console.log('✅ crypto.createHash function initialized in all contexts');
// console.log('🔍 global.crypto.createHash available:', typeof (global.crypto as any).createHash);
// console.log('🔍 window.crypto.createHash available:', typeof (global as any).window?.crypto?.createHash);

// Additional crypto functions needed by js-crypto-rsa
if (!global.crypto.subtle) {
  (global.crypto as any).subtle = {
    generateKey: async () => {
      // console.log('🔧 crypto.subtle.generateKey called - using fallback');
      throw new Error('generateKey not fully implemented in polyfill');
    },
    importKey: async () => {
      // console.log('🔧 crypto.subtle.importKey called - using fallback');
      throw new Error('importKey not fully implemented in polyfill');
    },
    exportKey: async () => {
      // console.log('🔧 crypto.subtle.exportKey called - using fallback');
      throw new Error('exportKey not fully implemented in polyfill');
    },
    sign: async () => {
      // console.log('🔧 crypto.subtle.sign called - using fallback');
      throw new Error('sign not fully implemented in polyfill');
    },
    verify: async () => {
      // console.log('🔧 crypto.subtle.verify called - using fallback');
      throw new Error('verify not fully implemented in polyfill');
    }
  };
}

// Set up randomBytes for Node.js compatibility
if (typeof (global as any).randomBytes === 'undefined') {
  (global as any).randomBytes = (size: number) => {
    // console.log(`🎲 randomBytes called for ${size} bytes`);
    const array = new Uint8Array(size);
    return getRandomValues(array);
  };
}

/* // Set up malloc/free functions for WASM compatibility
if (typeof (global as any).malloc === 'undefined') {
  console.log('🔧 Adding global malloc/free functions...');

  // Simple memory management using ArrayBuffer
  const memory = new ArrayBuffer(1024 * 1024); // 1MB buffer
  const memoryView = new Uint8Array(memory);
  let offset = 0;

  (global as any).malloc = (size: number) => {
    console.log(`🔧 malloc called for ${size} bytes`);
    const ptr = offset;
    offset += size;
    if (offset > memory.byteLength) {
      console.warn('⚠️ Mock malloc: out of memory, resetting');
      offset = size; // Reset and allocate from start
      return 0;
    }
    return ptr;
  };

  (global as any).free = (ptr: number) => {
    console.log(`🔧 free called for pointer ${ptr}`);
    // Mock free - no actual memory management
  };

  console.log('✅ Global malloc/free functions initialized');
}

// WebAssembly polyfill for React Native
if (typeof global.WebAssembly === 'undefined') {
  console.log('⚠️ WebAssembly not available, adding compatibility shim...');

  // Create a WebAssembly polyfill that returns proper structure for compatibility
  (global as any).WebAssembly = {
    instantiate: async () => {
      console.log('🚫 WebAssembly.instantiate called - returning mock secp256k1 for compatibility');
      return {
        instance: {
          exports: {
            // secp256k1 WASM functions expected by bitcoin-ts
            _secp256k1_context_create: () => 1, // Mock context pointer
            _secp256k1_context_randomize: () => 1, // Mock success
            _malloc: (size: number) => size, // Mock memory allocation
            _free: () => {}, // Mock memory free
            ___errno_location: () => 0, // Mock error location
            memory: { buffer: new ArrayBuffer(65536) }, // Mock memory buffer

            // BBS+ WASM functions expected by @mattrglobal/bbs-signatures
            __wbindgen_malloc: (size: number) => {
              console.log(`🔧 __wbindgen_malloc called for ${size} bytes`);
              return (global as any).malloc(size);
            },
            __wbindgen_realloc: (ptr: number, oldSize: number, newSize: number) => {
              console.log(`🔧 __wbindgen_realloc called ptr:${ptr} old:${oldSize} new:${newSize}`);
              return (global as any).malloc(newSize);
            },
            __wbindgen_free: (ptr: number) => {
              console.log(`🔧 __wbindgen_free called for ptr:${ptr}`);
              (global as any).free(ptr);
            }
          }
        },
        module: {}
      };
    },
    compile: async () => {
      console.log('🚫 WebAssembly.compile called - returning mock module');
      return {};
    },
    validate: () => {
      console.log('🚫 WebAssembly.validate called - returning false for JS fallback');
      return false;
    },
    Module: class {
      constructor() {
        console.log('🚫 WebAssembly.Module constructor called - using fallback');
        throw new Error('WebAssembly.Module not available - use JavaScript fallback');
      }
    },
    Instance: class {
      constructor() {
        console.log('🚫 WebAssembly.Instance constructor called - using fallback');
        throw new Error('WebAssembly.Instance not available - use JavaScript fallback');
      }
    },
    Memory: class {
      constructor() {
        console.log('🚫 WebAssembly.Memory constructor called - using fallback');
        throw new Error('WebAssembly.Memory not available - use JavaScript fallback');
      }
    },
    Table: class {
      constructor() {
        console.log('🚫 WebAssembly.Table constructor called - using fallback');
        throw new Error('WebAssembly.Table not available - use JavaScript fallback');
      }
    }
  };

  console.log('✅ WebAssembly compatibility shim initialized');
} else {
  console.log('✅ WebAssembly already available');
} */

// console.log('✅ Crypto polyfill initialized with enhanced random generation');
// console.log('✅ Buffer global initialized');
// console.log('✅ crypto.subtle stub methods initialized');
// console.log('✅ randomBytes function initialized');
// console.log('✅ WebAssembly polyfill initialized');

export {};