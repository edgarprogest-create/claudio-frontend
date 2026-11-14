# Claudionoid — novo frontend (Vite + React PWA)

O frontend antigo (`/index.html`, `/onboarding.html`) continua intacto até à Fase 5.

## Correr
```bash
cd app
npm install
npm run dev      # http://localhost:5173 (e link "Network" para o telemóvel)
npm run build    # gera app/dist
```

## Estrutura
- `src/App.jsx` — navegação, estilo, sheets, sessão
- `src/screens/` — Splash, Onboarding, Auth, Home, Chat, History, Humanoids, Settings (parcial até à Fase 4)
- `src/components/` — UI partilhada, TabBar curva, StyleSheet, PersonaGrid, sheets (Locked, Rename, Humanoid), Markdown
- `src/data/prompts.js` — system prompts de cada humanoid (vindos do index.html antigo; Looksmax ♂/♀ juntos)
- `src/hooks/usePlan.js` — plano + acesso aos humanoids (`/api/chat/usage`, `/api/stripe/trial-status`), mesmas regras do `hasHumanoidAccess()`
- `src/lib/conversations.js` — histórico em `claudio_convs` (mesmo formato da app antiga)
- `src/i18n/*.json` — traduções (chave = texto em inglês; `pt` por defeito)
- `src/styles/` — `tokens.css`, `themes.css` (Noir/Papel/Cor), `app.css`
- `src/lib/api.js` — auth, usage, trial-status e `/api/chat` (streaming SSE) no backend Railway

## localStorage
Partilhado com a app antiga: `claudio_token`, `claudio_name`, `claudio_email`, `claudio_lang`, `claudio_onboarding_done`, `claudio_convs`.
Novos: `claudio_style` (`noir` | `papel` | `cor`, por defeito `cor`), `claudio_default_persona` (Fase 4).

As conversas ganham dois campos opcionais que a app antiga ignora: `notes` (linhas "Mudou para X", nunca enviadas à API) e `attachments` por mensagem (nomes dos anexos).
