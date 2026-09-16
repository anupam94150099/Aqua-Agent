import fs from 'fs';
import path from 'path';

const wasmNativePath = path.resolve('node_modules/@rollup/wasm-node/dist/native.js');
const rollupNativePath = path.resolve('node_modules/rollup/dist/native.js');
const wasmNodeDir = path.resolve('node_modules/@rollup/wasm-node/dist/wasm-node');
const targetWasmNodeDir = path.resolve('node_modules/rollup/dist/wasm-node');

if (fs.existsSync(wasmNativePath)) {
  fs.copyFileSync(wasmNativePath, rollupNativePath);
  if (fs.existsSync(wasmNodeDir)) {
    fs.cpSync(wasmNodeDir, targetWasmNodeDir, { recursive: true });
  }
  console.log('[Patch Rollup] Successfully linked wasm-node to rollup!');
}
