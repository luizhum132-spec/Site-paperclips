# PaperClips Holding — site

Site estático (HTML + CSS + JS puro, sem build). O 3D da abertura usa three.js 0.147, incluído em `vendor/`.

## Rodar localmente

Requer Node.js (qualquer versão recente). Sem dependências para instalar.

```bash
npm run dev
```

Abra http://localhost:5173. Para outra porta: `node server.js 8080`.

## Estrutura

```
index.html            marcação de todas as seções, na ordem da página
css/                  um arquivo por seção, carregados nesta ordem:
  base.css            variáveis de cor (:root), reset, .wrap, botões
  typography.css      títulos e textos de seção
  reveal.css          animações de "revelar ao chegar"
  nav.css             barra de navegação
  hero.css            abertura com o filme 3D
  highlights.css      Destaques (galeria de cartões)
  principles.css      Princípios
  holding.css         A holding (título que acende + números)
  games.css           PaperClips Games
  technology.css      PaperClips Tecnologia
  explore.css         Continue explorando
  contact.css         Contato
  panel.css           Login, painel do dono, toasts e reduced-motion
js/                   scripts clássicos, carregados nesta ordem (compartilham o escopo global):
  core.js             utilitários ($, $$, clamp, store, toast, easing)
  reveal.js           observador de visibilidade
  nav.js              seção ativa e tema claro/escuro da nav
  streaks.js          cortinas de luz
  hero-film.js        filme 3D do clipe (three.js)
  game-engines.js     motores Bigodes e FicCity
  highlights.js … panel.js   lógica de cada seção
  loop.js             laço único de animação
  init.js             inicialização (sempre por último)
vendor/three@0.147.0/ three.js local
server.js             servidor estático de desenvolvimento
```

A ordem dos `<script>` em `index.html` importa: um arquivo pode usar o que foi definido nos anteriores.

## Fazer mudanças e voltar atrás (git)

```bash
git status                 # o que mudou
git diff                   # ver as mudanças
git add -A && git commit -m "Descreve a mudança"   # salvar um ponto
git log --oneline          # histórico
git restore .              # descartar mudanças não salvas
git revert <commit>        # desfazer um commit já salvo (mantém o histórico)
git checkout v1-organizado -- .   # restaurar todos os arquivos para a versão organizada
```

Tags: `v0-original` (HTML único recebido) e `v1-organizado` (esta estrutura).
