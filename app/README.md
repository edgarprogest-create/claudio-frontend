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
- `src/screens/` — Splash, Onboarding, Auth, Settings (parcial), Placeholder (Home/History/Humanoids até à Fase 3)
- `src/components/` — UI partilhada, TabBar curva, StyleSheet
- `src/i18n/*.json` — traduções (chave = texto em inglês; `pt` por defeito)
- `src/styles/` — `tokens.css`, `themes.css` (Noir/Papel/Cor), `app.css`
- `src/lib/api.js` — `/api/auth/login` e `/api/auth/register` no backend Railway

## localStorage
Partilhado com a app antiga: `claudio_token`, `claudio_name`, `claudio_email`, `claudio_lang`, `claudio_onboarding_done`.
Novo: `claudio_style` (`noir` | `papel` | `cor`, por defeito `cor`).
