// Browser polyfills for Node.js modules needed by @nillion/blindfold
import { Buffer } from 'buffer';

// Make Buffer available globally in the browser
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Buffer = Buffer;
  // @ts-ignore
  window.global = window;
}

// This will be handled by webpack polyfills