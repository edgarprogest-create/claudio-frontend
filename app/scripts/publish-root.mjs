// Copies the Vite build (app/dist) into the repo root, which Cloudflare serves as the live site.
// Replaces /index.html and /assets/ only — manifest.json, sw.js, icons and legal pages are left alone.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const app = resolve(import.meta.dirname, '..');
const dist = resolve(app, 'dist');
const root = resolve(app, '..');

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('app/dist/index.html not found — run `npm run build` first.');
  process.exit(1);
}
rmSync(resolve(root, 'assets'), { recursive: true, force: true });
cpSync(resolve(dist, 'assets'), resolve(root, 'assets'), { recursive: true });
cpSync(resolve(dist, 'index.html'), resolve(root, 'index.html'));
console.log('Published app/dist → repo root (index.html + assets/).');
