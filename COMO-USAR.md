# Como usar este pacote com o Claude Code

Precisas de 3 coisas: o **Claude Code** instalado, o teu **repositório** no computador e **esta pasta**.

## 1. Instalar o Claude Code (uma vez)
1. Instala o Node.js: https://nodejs.org (botão "LTS").
2. Abre o Terminal (Mac) ou o PowerShell (Windows) e escreve:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
3. Faz login quando pedir (precisas de conta Claude Pro/Max ou de API).

## 2. Ter o repositório no computador
```
git clone https://github.com/edgarprogest-create/claudio-frontend.git
cd claudio-frontend
```

## 3. Pôr este pacote dentro do repositório
Descompacta o zip e arrasta a pasta `design_handoff_claudionoid_pwa` para dentro da pasta `claudio-frontend`.

## 4. Abrir o Claude Code
No terminal, dentro de `claudio-frontend`:
```
claude
```

## 5. Pedir o trabalho, uma fase de cada vez
Copia e cola estas mensagens, **uma de cada vez**. Espera que termine, testa e só depois passa à seguinte.

**Fase 1: legal (rápido)**
> Lê design_handoff_claudionoid_pwa/README.md. Copia os ficheiros da pasta legal/ para a raiz do repo e atualiza o sw.js e o onboarding.html como diz a secção PWA.

**Fase 2: base do novo frontend**
> Lê design_handoff_claudionoid_pwa/README.md e os ficheiros em prototype/. Cria o novo frontend como PWA com Vite + React, com Montserrat, os 3 estilos (default Cor), as traduções (default Português) e a barra de navegação curva. Começa só pelo Splash, Onboarding e Auth, ligados aos endpoints /api/auth existentes. Não apagues o index.html antigo ainda.

**Fase 3: ecrãs principais**
> Continua: Home, Chat, History e Humanoids, ligados a /api/chat e /api/chat/usage, como no README.

**Fase 4: planos e definições**
> Continua: Plans, Checkout (Stripe já existente), Settings com Style, Language e Default humanoid.

**Fase 5: limpeza**
> Substitui o index.html antigo pelo novo build, atualiza o manifest.json e confirma que tudo funciona.

## 6. Testar
O Claude Code diz-te o comando, normalmente:
```
npm run dev
```
Abre o link que aparece (ex: http://localhost:5173) no browser. Para testar no telemóvel, usa o link "Network" na mesma rede Wi-Fi.

## 7. Guardar e publicar
> Faz commit e push destas alterações para o GitHub.

## Dicas
- Se algo correr mal, escreve ao Claude Code o que vês ("o botão enviar não aparece") ou cola a mensagem de erro.
- Pede sempre "mostra-me o que vais mudar antes de mudar" se quiseres mais controlo.
- O backend (Railway) é outro projeto: as tarefas da secção "New backend work needed" têm de ser feitas lá.
