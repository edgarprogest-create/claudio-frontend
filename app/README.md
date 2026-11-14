# Claudionoid — novo frontend (Vite + React PWA)

Este é o código-fonte. O site publicado é o build copiado para a raiz do repo (`npm run build:site`).

## Correr
```bash
cd app
npm install
npm run dev      # http://localhost:5173 (e link "Network" para o telemóvel)
npm run build       # gera app/dist
npm run build:site  # gera e copia para a raiz (index.html + assets/) — é isto que vai para produção
```

## Estrutura
- `src/App.jsx` — navegação, estilo, sheets, sessão
- `src/screens/` — Splash, Onboarding, Auth, Home, Chat, History, Humanoids, Plans, Settings
- `src/components/` — UI partilhada, TabBar curva, StyleSheet, PersonaGrid, sheets (Locked, Rename, Humanoid), CheckoutSheet (Stripe Card Element), Markdown
- `src/data/prompts.js` — system prompts de cada humanoid (vindos do index.html antigo; Looksmax ♂/♀ juntos)
- `src/hooks/usePlan.js` — plano + acesso aos humanoids (`/api/chat/usage`, `/api/stripe/trial-status`), mesmas regras do `hasHumanoidAccess()`
- `src/lib/conversations.js` — histórico em `claudio_convs` (mesmo formato da app antiga)
- `src/i18n/*.json` — traduções (chave = texto em inglês; `pt` por defeito)
- `src/styles/` — `tokens.css`, `themes.css` (Noir/Papel/Cor), `app.css`
- `src/lib/api.js` — auth, usage, trial-status, `/api/chat` (streaming SSE), Stripe (`create-subscription` → fallback `checkout`), `cancel-trial` e `DELETE /api/auth/account`
- `src/lib/stripe.js` — carrega o Stripe.js só quando o Checkout abre

## localStorage
Partilhado com a app antiga: `claudio_token`, `claudio_name`, `claudio_email`, `claudio_lang`, `claudio_onboarding_done`, `claudio_convs`.
Novos: `claudio_style` (`noir` | `papel` | `cor`, por defeito `cor`), `claudio_default_persona`.

As conversas ganham dois campos opcionais que a app antiga ignora: `notes` (linhas "Mudou para X", nunca enviadas à API) e `attachments` por mensagem (nomes dos anexos).

## Apagar conta
O botão chama `DELETE /api/auth/account`. Enquanto o backend não tiver este endpoint (responde 404/405), abre `/delete-account.html`, que explica o pedido por email.
