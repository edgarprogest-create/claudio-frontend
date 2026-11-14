# claudio-frontend

Frontend do **Claudionoid** — PWA servida pela Cloudflare a partir da raiz deste repositório (ver `wrangler.jsonc`). Backend: Railway.

## Estrutura
- `app/` — código-fonte (Vite + React). Ver `app/README.md`.
- `index.html` + `assets/` — **build gerado** a partir de `app/`. Não editar à mão.
- `manifest.json`, `sw.js`, ícones — PWA.
- `privacy.html`, `terms.html`, `delete-account.html`, `legal.css` — páginas legais.
- `onboarding.html` — só redireciona para `/` (PWAs instaladas antigas).
- `design_handoff_claudionoid_pwa/` — pacote de design (protótipo, README do redesign). Não é publicado.
- `.assetsignore` — o que a Cloudflare não publica.

## Desenvolver
```bash
cd app
npm install
npm run dev
```

## Publicar uma alteração
```bash
cd app
npm run build:site
```
Isto gera o build e copia-o para a raiz (`index.html` + `assets/`). Depois faz commit e push.
Se mudares ficheiros em cache, aumenta `CACHE_NAME` em `sw.js`.
