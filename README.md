# Flashcards PM-PE (PWA)

App de flashcards com repetição espaçada (SM-2 simplificado), offline, sem login e **sem limite diário**. Roda no Safari do iPhone e é instalado na Tela de Início, sem App Store e sem expirar.

## Estrutura

```
flashcards-app/
├── index.html             página única do app
├── manifest.webmanifest   nome, ícone e modo tela cheia ao instalar
├── sw.js                  Service Worker (funciona offline)
├── css/app.css            visual, modo escuro automático
├── js/app.js              telas e navegação (início, baralho, cartão, revisão, busca, importar)
├── js/db.js               IndexedDB: baralhos, cartões, importar/exportar, seed
├── js/srs.js              algoritmo de repetição espaçada (seção 7)
├── js/seed.js             os 64 cartões iniciais (seção 11)
└── icons/                 ícones do app
```

Sem build, sem dependências: é HTML, CSS e JavaScript puro.

## Rodar no computador

```bash
cd flashcards-app
python3 -m http.server 8000
# abra http://localhost:8000
```

(Ou `npx serve .`.) Não abra o `index.html` direto pelo arquivo: o navegador bloqueia módulos JS em `file://`.

No computador dá para usar o teclado na revisão: **espaço** mostra a resposta, **1 2 3 4** = Errei, Difícil, Bom, Fácil.

## Publicar (precisa de HTTPS para instalar no iPhone)

### Opção 1: GitHub Pages (grátis)

1. Crie um repositório em https://github.com/new (ex.: `flashcards`). Em conta gratuita o Pages exige repositório **público**; não tem problema, porque seus cartões e progresso ficam só no iPhone, não no repositório.
2. Envie os arquivos desta pasta para a raiz do repositório:
   ```bash
   cd flashcards-app
   git init && git add . && git commit -m "Flashcards PWA"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/flashcards.git
   git push -u origin main
   ```
3. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save**.
4. Em 1 ou 2 minutos o app fica em `https://SEU_USUARIO.github.io/flashcards/`.

### Opção 2: Netlify Drop

Entre em https://app.netlify.com/drop e arraste a pasta `flashcards-app`. Ele gera um link HTTPS na hora.

## Instalar no iPhone

1. Abra o link no **Safari** (precisa ser o Safari).
2. Toque em **Compartilhar** (quadrado com seta) → **Adicionar à Tela de Início** → **Adicionar**.
3. Abra sempre pelo ícone **Flashcards** da Tela de Início. Ele abre em tela cheia e funciona sem internet.

Importante sobre os dados:
- O app instalado na Tela de Início tem um armazenamento **separado** do Safari. Use sempre pelo ícone.
- Os dados ficam só no aparelho. De vez em quando use **Importar → Exportar → Baixar arquivo** (salva no app Arquivos/iCloud) como backup. Para restaurar, use **Importar → Escolher arquivo**.
- O backup leva baralho, frente e verso, não o progresso de revisão (é o formato da seção 8).

## Atualizar o app depois de mudar o código

1. Altere os arquivos e aumente a versão em `sw.js` (`flashcards-v1` → `flashcards-v2`).
2. Publique de novo (`git push`).
3. No iPhone, abra o app com internet, feche e abra de novo. Seus cartões continuam lá.

## Como funciona a revisão

- "Para revisar hoje" = cartões com data de revisão até o fim de hoje, incluindo os novos. Sem limite.
- **Errei**: volta para o fim da fila da mesma sessão. **Difícil / Bom / Fácil**: agenda para daqui a alguns dias (o botão mostra quantos).
- "Revisar tudo" mistura todos os baralhos; dentro de um baralho, **Revisar** só ele.

## Importar cartões gerados em outro chat

Em **Importar**, cole:

```json
[
  { "deck": "Português", "front": "pergunta", "back": "resposta" }
]
```

O baralho é criado se não existir, e cartão repetido (mesmo baralho + mesma frente) é ignorado.
