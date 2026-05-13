#!/usr/bin/env node
/**
 * Copies canvaskit.wasm from the canvaskit-wasm package into public/ so Expo's
 * web build serves it at the root path (/canvaskit.wasm).
 *
 * Why: @shopify/react-native-skia's LoadSkiaWeb defaults to fetching the WASM
 * by URL — Metro doesn't bundle .wasm assets through its resolver, so without
 * a public-folder copy the loader 404s. We previously fell back to jsDelivr,
 * but a local file is offline-safe, version-locked, and avoids a cold-start
 * round-trip to a third-party CDN.
 *
 * Runs automatically on `pnpm install` via the postinstall script.
 *
 * pnpm hoists canvaskit-wasm under .pnpm/canvaskit-wasm@<v>/node_modules/...,
 * so we resolve the wasm path by looking up the package's package.json first.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// canvaskit-wasm is a transitive dep of @shopify/react-native-skia. Under pnpm
// it isn't visible at the root node_modules, so resolve it via Skia's path.
const skiaPkgJson = require.resolve('@shopify/react-native-skia/package.json');
const cwPkgJson = require.resolve('canvaskit-wasm/package.json', {
  paths: [skiaPkgJson],
});
const pkgRoot = dirname(cwPkgJson);
const wasmSrc = join(pkgRoot, 'bin', 'full', 'canvaskit.wasm');
const publicDir = join(ROOT, 'public');
const wasmDst = join(publicDir, 'canvaskit.wasm');

mkdirSync(publicDir, { recursive: true });
copyFileSync(wasmSrc, wasmDst);

console.log(`[canvaskit] copied ${wasmSrc} → ${wasmDst}`);
