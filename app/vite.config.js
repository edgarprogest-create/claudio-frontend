import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import pkg from './package.json' with { type: 'json' };

// In dev, serve the legal pages that live in the repo root (/terms.html, /privacy.html, …)
// so links from Auth work on `npm run dev`. In production they are served by the host.
const LEGAL = ['/terms.html', '/privacy.html', '/delete-account.html', '/legal.css'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const rootLegalPages = {
  name: 'root-legal-pages',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = (req.url || '').split('?')[0];
      if (!LEGAL.includes(path)) return next();
      const file = resolve(__dirname, '..', '.' + path);
      if (!existsSync(file)) return next();
      res.setHeader('Content-Type', TYPES[extname(file)]);
      res.end(readFileSync(file));
    });
  },
};

// base './' keeps the build portable: it can be served from /app/dist/ now
// and from the repo root once it replaces the old index.html (Fase 5).
export default defineConfig({
  base: './',
  plugins: [react(), rootLegalPages],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173 },
});
