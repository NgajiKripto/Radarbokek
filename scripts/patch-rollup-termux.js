// Patch rollup native.js to use WASM on Termux (Android platform)
// Termux Node.js reports process.platform === 'android' but uses Linux-compatible libc,
// making native rollup binaries incompatible. Fall back to WASM.
import { platform } from 'node:process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

if (platform !== 'android') {
  process.exit(0);
}

const wasmDir = join(root, 'node_modules', '@rollup', 'wasm-node', 'dist', 'wasm-node');
const rollupWasmDir = join(root, 'node_modules', 'rollup', 'dist', 'wasm-node');
const nativeJsPath = join(root, 'node_modules', 'rollup', 'dist', 'native.js');

if (!existsSync(wasmDir)) {
  console.warn('[patch-rollup-termux] @rollup/wasm-node not found, skipping patch');
  process.exit(0);
}

// Copy WASM bindings
mkdirSync(rollupWasmDir, { recursive: true });
copyFileSync(join(wasmDir, 'bindings_wasm.js'), join(rollupWasmDir, 'bindings_wasm.js'));
copyFileSync(join(wasmDir, 'bindings_wasm_bg.wasm'), join(rollupWasmDir, 'bindings_wasm_bg.wasm'));

// Overwrite native.js with WASM version
writeFileSync(nativeJsPath, `const {
\tparse,
\txxhashBase64Url,
\txxhashBase36,
\txxhashBase16
} = require('./wasm-node/bindings_wasm.js');

exports.parse = parse;
exports.parseAsync = async (code, allowReturnOutsideFunction, jsx, _signal) =>
\tparse(code, allowReturnOutsideFunction, jsx);
exports.xxhashBase64Url = xxhashBase64Url;
exports.xxhashBase36 = xxhashBase36;
exports.xxhashBase16 = xxhashBase16;
`);

console.log('[patch-rollup-termux] Rollup patched to use WASM build');
