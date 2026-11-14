# Handoff: Claudionoid PWA — full redesign

## Overview
Claudionoid is a mobile-first AI assistant with ten "humanoid" personas (now nine — see Humanoids). This package redesigns the whole app: onboarding, auth, home, chat, voice, history, humanoids, plans/checkout and settings, with three user-selectable visual styles and four languages.

Target: the existing repo **edgarprogest-create/claudio-frontend** (plain HTML/JS PWA, backend on Railway). Replace `index.html` + `onboarding.html` with the new design while **keeping every existing backend call** (listed below).

## About the design files
The files in `prototype/` are **design references built in HTML/React (Babel in-browser)**. They show the intended look and behaviour; they are not production code. Recreate them in the repo's environment. Recommended: keep it a PWA, but move to **Vite + React** (or Preact) so the screens can be split into components, precompiled, and the 90 KB single `index.html` goes away. Plain JS is acceptable if you prefer to stay build-free.

Open `Claudionoid Offline.html` in any browser to click through the full prototype (works offline).

## Fidelity
**High-fidelity.** Colours, type, spacing, radii and interactions are final. Recreate pixel-perfectly.

---

## Global layout
- Mobile web, full viewport (`100dvh`). On screens wider than 480px the app is a centred column, `max-width: 480px`, with 1px side borders `var(--border)`.
- Respect safe areas: top bar padding `env(safe-area-inset-top) + 8px`; tab bar / composer bottom padding `env(safe-area-inset-bottom) + 12px`.
- All inputs `font-size: 16px` (prevents iOS zoom).
- No visible scrollbars anywhere (`scrollbar-width:none`, `::-webkit-scrollbar{display:none}`); scrolling by touch only.
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">`, `apple-mobile-web-app-capable`, `black-translucent` status bar. Update `theme-color` meta to the active style's `--bg`.

## Typography
**Montserrat everywhere** (Google Fonts, weights 400/500/600/700/800).
| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Display (screen titles) | 32–40px (onboarding 40, Home greeting 38, sheets 26) | 700 (Papel: 800) | -0.045em (Papel -0.055em) | 1.04 |
| Display highlight word | same, `color: var(--accent)`, not italic | | | |
| Eyebrow / labels | 10px, UPPERCASE | 600 | 0.12em | — |
| App bar side buttons | 11px UPPERCASE | 600 | 0.1em | — |
| Body | 14–15px | 400–500 | -0.005em | 1.45–1.5 |
| Chat bubble | 14.5px (AI in Noir/Papel 15.5px, lh 1.6) | 400 | | 1.5 |
| Card title | 15px | 600 | -0.015em | |
| Tab label | 9px UPPERCASE | 600 | 0.06em | |
| Logo "claudio" | 20px | 700 | -0.04em | preceded by 7px accent dot with glow |

## Styles (user picks in Settings → Style). Default: **Cor**
Apply as a class on `<html>`: `theme-noir | theme-papel | theme-cor`. Full values in `prototype/themes.css` + `tokens.css`.

| Token | Noir | Papel | Cor |
|---|---|---|---|
| --bg | #000000 | #f3eee5 | #101114 |
| --surface | #0e0f0e | #fbf8f3 | #1a1c20 |
| --surface-2 | #161816 | #e9e2d6 | #22252a |
| --border | rgba(255,255,255,.07) | rgba(20,18,14,.12) | rgba(255,255,255,.06) |
| --border-hi | rgba(255,255,255,.13) | rgba(20,18,14,.22) | rgba(255,255,255,.12) |
| --text | #f2f2f0 | #14120e | #f4f4f6 |
| --text-2 | #d4d6d3 | #3a352d | #c9cbd1 |
| --dim | #858a85 | #6e665a | #80838c |
| --faint | #5d625d | #9a9183 | #5b5e66 |
| --accent | #25d366 | #0d7a3f | #25d366 |
| --accent-soft | rgba(37,211,102,.12) | rgba(13,122,63,.09) | rgba(37,211,102,.12) |
| --error | #ff6b6b | #ff6b6b | #ff6b6b |

Structural differences:
- **Noir**: AI replies have no bubble (plain text, full width). User bubble `#1a1c1a`, radius 22. Tab bar floats: absolute, 14px from sides, 12px above safe-area bottom, 68px tall, glass `#1a1c1a`, fully rounded ends, icons only (labels hidden). Scroll areas get 110px bottom padding so content clears the bar.
- **Papel**: editorial. Cards lose background/border; separated by 1px top rules. AI replies: no box, 1px top rule, 12px top padding. User bubble ink `#14120e` with paper text, radius 20/20/4/20. Composer: no box, 3px ink top rule. Selected persona: 3px ink top rule. No shadows on buttons. Tab bar fill `#fbf8f3`. `+` button ink with paper icon.
- **Cor**: each humanoid has its own colour `--p` (table below). In chat: top bar + safe-area background `var(--p)` with bottom radius 28px and all bar text `#111`; user bubbles `var(--p)` with `#111` text, weight 500, radius 22/22/6/22; send button `var(--p)`, radius 16. Home quick-start chips and unlocked persona cards fill with `--p`, text `#111`. Locked cards stay `--surface` with dim text. Selected card ring: `0 0 0 3px var(--bg), 0 0 0 5px var(--p)`. Cards no border, radius 22. `+` button `#f4f4f6`, radius 18.

## Humanoids
Merge Looksmax ♂/♀ into one **Looksmax** (backend: map to one mode; ask gender inside the conversation if needed by the system prompt).

| id | Name | Glyph | Colour (Cor) | Locked on Free | Description |
|---|---|---|---|---|---|
| default | Default | ◇ | #e9e9ee | no | Natural, balanced chat. |
| brother | Brother | ✺ | #ff8a50 | no | No filters. Like a real friend. |
| health | Health | ✚ | #43e0a0 | no | Symptoms, causes, holistic. |
| coaching | Coaching | ◉ | #7c9cff | yes | Direction. Plans. Pressure. |
| meal | Meal | ✦ | #ffd166 | yes | Weekly plans, shopping list. |
| stylist | Stylist | ◈ | #ff6fae | yes | Style for your body & life. |
| spiritual | Spiritual | ☉ | #b69cff | yes | Purpose, energy, presence. |
| nomad | Nomad | ⟁ | #3dd6c6 | yes | Jurisdictions, citizenships. |
| looksmax | Looksmax | ◐ | #f4a261 | yes | Photo analysis · glow up. |

Locked = requires Advanced/Everyday or active trial (keep the repo's `hasHumanoidAccess()` rules, including the Essential 24h grace).
Each humanoid has 3 suggestion prompts for the empty chat — see `SUGGESTIONS` in `prototype/proto-ui.jsx`.

---

## Screens

### 1. Splash
Centred "Claudionoid" (38px/700/-0.045em) under a 22px accent dot (glow `0 0 40px accent, 0 0 80px accent-glow`, breathing 1.6s). 360px radial accent glow behind. Bottom eyebrow "Loading your humanoids…". Auto-advances after 1.8s; tap to skip. If a token exists in localStorage (`claudio_token`) skip straight to Home.

### 2. Onboarding (4 steps)
App bar: "← Back" (from step 2), "Skip" (right, jumps to Auth). Content padding 12px 28px.
1. `01 · The thesis` — "Not one AI. / **Ten of you.**" + body.
2. `02 · Your roster` — collage of 6 rotated cards (130px wide, radius 16, `--surface`, border-hi, shadow `0 10px 28px rgba(0,0,0,.3)`), title 32px "Pick the voice you need **today.**".
3. `03 · No typing` — idle voice orb 180px, "Just **talk.**".
4. `04 · The deal` — three promises (glyph 24px accent + eyebrow label + 14px text).
Footer: dots (6px, active 22px wide accent, width transition .3s) + primary pill "Continue →" / "Get started →". Swipe left/right also navigates. Content fades in (.35s) on step change.

### 3. Auth (centred)
Column `max-width:360px`, centred horizontally and vertically (flex spacers), text centred. 18px glowing accent dot → eyebrow "Almost there" → display 40px "Get **in.**" (login) / "Join **us.**" (register) → subtitle max 280px.
Buttons (radius 14, padding 14, 14.5px/600): "Continue with Apple" (bg `--text`, text `--bg`), "Continue with Google" (`--surface`, border-hi). Divider "or". Email + password fields (`--surface`, border, radius 14, focus border accent; Show/Hide toggle). Primary "Sign in →" / "Create account →" (disabled look at 50% opacity until password filled). Switch link "New here? Create account". Footer legal eyebrow at bottom.
Register mode must keep the repo's fields: **name, email, password ≥ 8, terms checkbox** (link to `/terms.html` and `/privacy.html`). Errors shown in `--error`, 13px, centred.
Apple/Google: **new backend work** (Sign in with Apple is mandatory if Google login exists on iOS).

### 4. Home
App bar: logo left, "+ New" accent right. Eyebrow: weekday · HH:MM (locale of current language). Greeting by hour: <5 "Still up", <12 "Good morning", <19 "Good afternoon", else "Good evening" + ",\n**Pedro.**" (user's name from `claudio_name`).
"Continue" section: last 3 conversations as cards (padding 14/16): persona eyebrow `✦ NAME` accent, time right, title 15/600, last line 13px dim ellipsis. "See all →" → History.
"Quick start": horizontal scroller of persona chips (pill, 10/14 padding, glyph + name; locked ones 60% opacity + "PRO" tag → open Locked sheet).

### 5. Tab bar (curved)
Order: Home · History · **[+]** · Humanoids · Settings. Hidden on Chat and Voice.
Shape: top corners radius 28px; centre has a smooth concave notch (SVG, 150×44, path `M0 0H20C34 0 39 6 44 15C51 30 61 39 75 39C89 39 99 30 106 15C111 6 116 0 130 0H150V44H0Z`) flanked by flat segments; fill `var(--tabbar)` (= `--surface`; Noir `#1a1c1a`; Papel `#fbf8f3`); drop-shadow `0 -3px 14px rgba(0,0,0,.10)`.
`+` button: 54px circle, accent bg, `#fff` icon (Noir `#000`), absolutely centred, top −31px, shadow `0 6px 18px accent-glow`; tap → new chat with default humanoid.
Tabs: icon 22px stroke 1.7 + 9px label; inactive `--faint`, active `--text` (Noir/Papel/Cor) with a 4px dot below.

### 6. Chat
App bar: "← Back", centre = live dot + persona name + ▾ (opens Humanoid picker sheet), right "⋯" (menu sheet: Change humanoid, Switch to voice, Rename, Delete conversation [confirm]).
Empty state (bottom-aligned): glyph 34px, "What's on your **mind?**", "Name · description", eyebrow "Try one of these" + 3 persona-specific suggestion cards; tapping one **sends it**.
Messages: gap 12px; user right, AI left, max-width 85%; system line centred eyebrow ("Switched to X"). Typing indicator: 3 dots bouncing 1.2s.
Composer (radius 28, `--surface`, border, shadow `0 4px 24px rgba(0,0,0,.18)`): [+ attach] [input] [mic icon] [send 38px circle accent ↑]. **Send is always visible**; 45% opacity + disabled when input empty and no attachment. Enter sends. Attach sheet: Camera / Photo library / File → chip above composer with × to remove.
Switching humanoid mid-chat appends a system line; locked → Locked sheet.

### 7. Voice
Full screen, opened from mic (slide up). Orb 200px with states: idle (breathe 4s), listening (breathe 1.4s + 2 ripple rings), thinking (spin 1.2s, desaturated), speaking (scale .97→1.08 alternate .45s). Live transcript with blinking caret; reply text shown while speaking. Timer mm:ss. Controls: keyboard (back to chat), big pause/play 76px accent, end ×. On exit, the voice turns are appended to the chat.
**New backend work:** speech-to-text (e.g. Whisper) + TTS (e.g. ElevenLabs/OpenAI TTS).

### 8. History
Title "**N** conversations", hint "Swipe left on a conversation to delete it." Search field (radius 12). Grouped by Today / Yesterday / date. Row: glyph, title 14/600, "Persona · last line" 12px dim, time. **Swipe left** reveals 88px red "Delete" (snap at 44px). "Clear" (top right, red) → confirm dialog.

### 9. Humanoids
Title "Ten angles **on you.**" (update copy to "Nine" or keep marketing line). Upsell card if Free. 2-column grid, gap 8: card padding 14/12, radius 16, min-height 116; glyph 24px, name 13.5/700, desc 11px. Selected: accent-soft bg + accent border + ✓. Locked: "PRO" tag. Tap unlocked → new chat; locked → Locked sheet.

### 10. Locked sheet
Glyph + name + description, eyebrow "Sounds like", sample reply bubble, primary "Unlock with Advanced · 24h free" → Plans, ghost "Not now".

### 11. Plans
"Three ways in" / "**Become.**". Cards radius 22, padding 20/18; featured Advanced uses accent-soft bg + accent border + "✦ Popular" badge (pill, top −10px). Current plan badge "✓ Current" / "✦ On trial", button disabled "Your plan".
| Plan | Price | Features |
|---|---|---|
| Essential | €15/mo | 350K tokens/week · Sonnet · Default, Brother, Health |
| Advanced | €25/mo | 1.5M tokens/week · Opus · All humanoids · 24h free trial |
| Everyday | €85/mo | Unlimited (fair use) · Opus + priority · Everything in Advanced |
CTA → Checkout sheet (summary rows Today/After 24h/Cancel, Pay button, "Not now") → success sheet (✓ ring pop-in, "You're **in.**", "Start talking →").
Keep the repo's Stripe flow (`/api/stripe/create-subscription`, `/api/stripe/checkout`, `confirmCardPayment`/`confirmCardSetup`).

### 12. Settings
Avatar (52px circle, accent-soft, initial) + name + email. Plan card (trial countdown HH:MM:SS live from `/api/stripe/trial-status`). Tokens bar (4px, accent fill, from `/api/chat/usage`), "Resets Monday".
Groups (eyebrow + card with 50px rows, chevrons): **Preferences** — Style (sheet with 3 previews), Default humanoid (sheet), Language (sheet: English, Português, Español, Français). **Plan** — Current plan, Invoices. **Account** — Sign out (confirm), Delete account (confirm, red).
Build string footer.

### Sheets & dialogs
Sheet: bottom, radius 28 top, border-top border-hi, padding 12/20/36, max-height 75% (86% tall), grab handle 38×4; backdrop `rgba(0,0,0,.55)` + blur 6px; slide-up .32s `cubic-bezier(.22,1,.36,1)`.
Confirm dialog: centred card radius 22, title 17/700, body 13.5 dim, Cancel (ghost) + action (primary or red).
Toast: top centre pill, 12px/600, fade+slide .25s, auto-hide 1.8s.

## Transitions
- Push (forward): slide from right, .38s `cubic-bezier(.22,1,.36,1)`.
- Pop (back): from −28% + fade.
- Tab switch: fade .22s. Voice/Home after login: slide up .42s.
- Pressed state on tappables: `scale(.97)`.

## i18n
Default language **Português**. All strings live in `prototype/i18n.jsx` (EN keys → PT) and `i18n-extra.jsx` (ES, FR) + style strings in `styles.jsx`. Port to JSON files per locale. Date/time formatting via `Intl` with pt-PT / en-GB / es-ES / fr-FR. Persist in `localStorage.claudio_lang`. The AI should reply in the user's language (pass `lang` to `/api/chat`).

## State
`token, name, email` (localStorage, as repo) · `style` · `lang` · `defaultPersona` · `plan` (free/trial/essential/advanced/everyday from backend) · `conversations[]` {id, title, persona, messages[], updatedAt} · current `chat` · `typing` · `attachment` · open `sheet`/`dialog`.

## Backend endpoints already in the repo (keep)
- `POST /api/auth/register` {name,email,password} · `POST /api/auth/login`
- `POST /api/chat` {messages, humanoid, …} · `GET /api/chat/usage`
- `GET /api/stripe/trial-status` · `POST /api/stripe/cancel-trial`
- `POST /api/stripe/create-subscription` · `POST /api/stripe/checkout`
Base URL: `https://claudio-production-6014.up.railway.app`.

## New backend work needed
1. `DELETE /api/auth/account` (in-app deletion — required by Apple/Google).
2. Sign in with Apple + Google.
3. Server-side conversation storage + sync (currently localStorage only).
4. Speech-to-text + text-to-speech for Voice.
5. Rename conversation, merge Looksmax modes.
6. Verify `sk_live_…` lives only in Railway env vars.

## PWA
Update `sw.js`: add `/onboarding.html` (or new entry), `/privacy.html`, `/terms.html`, `/legal.css` to the cache list and bump `CACHE_NAME` to `claudio-v2`. `manifest.json`: `theme_color` and `background_color` = `#101114` (Cor default), `lang: "pt"`, name "Claudionoid".

## Brand inconsistencies to fix
Name everywhere: **Claudionoid** (logo wordmark "claudio"). Green accent everywhere; remove the orange `#e87722` from the old delete-account page (new version in `legal/`).

## Files
- `Claudionoid Offline.html` — full clickable prototype, single file.
- `prototype/Claudio Prototype.html` — app shell, routing, state, sheets.
- `prototype/proto-ui.jsx` — personas, replies, suggestions, shared UI, tab bar, splash, onboarding, auth.
- `prototype/proto-screens.jsx` — Home, Chat, Voice, History (swipe row).
- `prototype/proto-screens2.jsx` — Humanoids, Settings, Plans, Checkout/Locked/List/Rename sheets.
- `prototype/styles.jsx` — style picker + persona colours.
- `prototype/tokens.css`, `prototype/themes.css` — all tokens and per-style rules.
- `prototype/i18n*.jsx` — translations.
- `legal/` — privacy.html, terms.html, delete-account.html, legal.css (drop into repo root).
- `prototype/tweaks-panel.jsx` — design-tool only; do not ship.

## Assets
No images. Icons are inline SVG strokes (24×24, stroke 1.7–2.6, round caps) — see `ICONS` in proto-ui.jsx. Persona glyphs are Unicode characters. Reuse the repo's existing PNG app icons.
