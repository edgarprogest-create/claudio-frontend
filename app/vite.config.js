import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import pkg from './package.json' with { type: 'json' };

// The repo root is the deployed site (Cloudflare serves it as static assets).
// manifest.json, sw.js, icons and the legal pages live there; in dev we serve them from there too.
const ROOT_FILES = /^\/(manifest\.json|sw\.js|legal\.css|(terms|privacy|delete-account)\.html|(icon-\d+x\d+|apple-touch-icon|favicon-32x32)\.png)$/;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.png': 'image/png' };
const rootStatic = {
  name: 'repo-root-static',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = (req.url || '').split('?')[0];
      if (!ROOT_FILES.test(path)) return next();
      const file = resolve(__dirname, '..', '.' + path);
      if (!existsSync(file)) return next();
      res.setHeader('Content-Type', TYPES[extname(file)]);
      res.end(readFileSync(file));
    });
  },
};

export default defineConfig({
  base: '/',
  publicDir: false,
  plugins: [react(), rootStatic],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173 },
});
