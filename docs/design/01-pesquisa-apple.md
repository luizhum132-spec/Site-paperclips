# Pesquisa: como a Apple apresenta um produto

Estudo feito em 30/10/2026 sobre cinco páginas salvas do apple.com (EUA):

| Página | O que observar |
|---|---|
| Página inicial | Vitrine: um produto por faixa, nome + frase + dois botões |
| MacBook Pro com tela PROLED XDR | A referência principal: abertura, histórias de produto, mergulho na tela |
| iPhone 18 Pro | Histórias de produto com câmera e vídeo vinculados à rolagem |
| iPhone Duo | Produto novo (dobrável): como explicar algo que ninguém viu ainda |
| Apple Watch Series 12 | Produto pessoal (saúde): tom mais humano, menos técnico |

**Limites desta análise.** O site da Apple está bloqueado na rede do ambiente de desenvolvimento, então as páginas
foram salvas no navegador e enviadas. Vieram o HTML renderizado (estrutura, classes, atributos de animação,
textos e as descrições de acessibilidade dos vídeos), mas não os arquivos de CSS, JavaScript e vídeo.
As animações foram reconstruídas a partir dos atributos que as controlam e das descrições de cada vídeo, que funcionam como roteiro.

Nada do conteúdo da Apple (textos, imagens, vídeos, código ou marca) vai para o site da PaperClips.
O que levamos são princípios.

---

## 1. Anatomia de uma página de produto

As quatro páginas de produto seguem quase a mesma sequência. A ordem é um argumento de venda.

1. **Abertura (hero).** O nome do produto aparece pequeno, como sobretítulo. O título de verdade é uma frase de 3 a 4 palavras,
   geralmente um trocadilho. Embaixo vêm disponibilidade, preço e **um único botão**. Ao fundo há um vídeo curto que toca uma vez.
2. **Destaques.** Uma galeria horizontal de 5 a 6 cartões, cada um com um vídeo curto e **uma frase** de benefício. Quem só lê isso já sabe o essencial.
3. **Olhe de perto.** Um visualizador do produto com botões (cores, tamanhos, tela, portas). Cada botão troca a vista e mostra uma frase.
4. **Histórias de produto.** Uma seção por benefício. Esse é o coração da página (veja a fórmula abaixo).
5. **Vale a troca?** Uma comparação com o modelo que a pessoa provavelmente já tem.
6. **Por que comprar aqui.** Uma galeria de vantagens comerciais.
7. **Continue explorando.** Cartões que comparam modelos.
8. **Meio ambiente e valores.** Fecham a página com credibilidade.

### Ritmo de cor
- As histórias de produto ficam no **fundo escuro**, onde o produto e a luz brilham.
- As seções comerciais e institucionais ficam no **fundo claro**.
- A barra de navegação troca de tema sozinha quando entra numa seção escura, um pouco antes de ela chegar ao topo
  (`start: topo da âncora − altura da nav − 50% da tela`).

### Fórmula de cada história de produto
```
Rótulo          1–2 palavras, o assunto          "Touch", "Battery", "Performance"
Título          2–6 palavras, efeito ou humor    "Magic on tap."  "Mic drop."  "Plug in. Go all out."
Parágrafo       2–4 frases com UM número forte   "up to 24 hours", "50 percent deeper bass"
Mídia           um vídeo que demonstra, não decora
Detalhes        3–5 subtítulos curtos + 1 frase cada
Nota de rodapé  toda afirmação numérica tem fonte
```
Observações sobre o texto:
- Os títulos quase sempre têm **duas partes**: "Ready. Set. Know.", "Connected. Protected.", "Super. Natural.".
- Usa o vocabulário da pessoa, não o da engenharia ("Go from dawn to done" em vez de "24 h de autonomia").
- Seções de conversão respondem a uma pergunta com uma resposta curta: "Worth the upgrade? You bet.", "Absolutely.".
- O relógio, que é um produto pessoal, fala do corpo e da vida ("A work of heart.", "Know your body."). O notebook, que é ferramenta, fala de trabalho ("Born to run.", "Cut to the chase.").

---

## 2. Mecânica do movimento

### Três gatilhos, nenhum prende a rolagem
| Gatilho | Atributo no HTML | Comportamento |
|---|---|---|
| **Tocar ao chegar** | `data-inline-media-play-keyframe`, `{"start":"t - 70vh","cssClass":"animate"}` | Quando o topo do bloco passa 70% da tela, o vídeo toca **uma vez**. Depois aparece o botão "repetir". |
| **Vinculado à rolagem (scrub)** | `data-video-progress-kf`, `{"start":"a0t - 100vh","end":"a0b - 100vh","progress":[0.01,1]}` | Dentro de um contêiner alto e "grudado" (sticky), a rolagem avança e volta a animação quadro a quadro. |
| **Pré-carregar antes** | `data-video-load-kf`, `{"start":"a0t - 200vh","end":"a0b + 100vh"}` | O vídeo começa a carregar **duas telas antes** de aparecer e é descarregado depois. |

A linguagem dos keyframes é sempre relativa: `a0t`/`a0b` são o topo e o fundo da âncora, `vh` é a altura da tela,
`a0h` é a altura da âncora. Assim tudo funciona em qualquer tamanho de tela.

### Detalhes que fazem a diferença
- **Quadro inicial e final como imagem.** Cada vídeo tem uma imagem do primeiro quadro (`start-frame`), então nunca aparece um retângulo vazio enquanto carrega.
  Ao terminar, o vídeo é descarregado (`unload-at-end`) e fica a imagem final.
- **Galerias que entram em cascata** (`staggered-start`, `StaggeredFadeIn`): os itens aparecem um após o outro, nunca todos juntos.
- **Acessibilidade.** Cada vídeo tem uma descrição completa do que acontece. Com "reduzir movimento" ligado, mostra-se o quadro final e o botão de repetir.
- **Curvas e tempos** encontrados no DOM:
  - Saídas rápidas: `opacity 150ms cubic-bezier(.82,.005,1,.06)`. Quase não se move e depois some de vez.
  - Entradas de interface: `.3s ease-in-out` com `.3s` de atraso, e `.5s`.
  - Movimento de objeto: `cubic-bezier(.75,0,.25,1)`. Aceleração e frenagem simétricas e fortes, como um objeto com peso.

---

## 3. Roteiros visuais (das descrições dos vídeos)

As descrições de acessibilidade contam cada cena. Os padrões que se repetem:

1. **O objeto entra e gira para se revelar.** "Laptop spins to reveal a screen…", "closed lid… laptop opens".
2. **A tela ilumina o mundo.** "Screen illuminates keyboard", "keyboard lit by glow from display". A luz do produto é personagem.
3. **A tela é um portal.** "A series of lights shine through a hollow space, the image zooms out and the lights are revealed to be the pixels…",
   "moves closer until we can see the individual diodes", "a 3D cityscape expands to fill the screen, zooming out to reveal it's a file…".
   A câmera entra na tela ou sai dela, e a escala revela o que era aquilo.
4. **A mão humana completa a cena.** "A hand appears and swipes the screen", "hands reach over the keyboard to play a virtual piano".
   A tecnologia só ganha sentido quando alguém a usa.
5. **Começo no escuro, fim na luz.** As aberturas começam no preto e terminam no produto iluminado, com o texto entrando por último.

---

## 4. O que a PaperClips leva disso

| Princípio da Apple | Como vira PaperClips |
|---|---|
| Uma ideia por seção, título de 2 a 6 palavras | Cada seção da holding responde a uma pergunta só |
| Rótulo → título → prova → mídia | Mesma fórmula para Games e Tecnologia |
| Escuro para o produto, claro para a conversa | Games e Tecnologia no escuro; holding e contato no claro |
| Tocar ao chegar, uma vez, sem prender a rolagem | Já usamos; vira regra do sistema de movimento |
| O objeto nasce e se revela | **A abertura "A forja"**: o metal é fundido, temperado e dobrado até virar o clipe |
| A luz do produto ilumina o mundo | O metal líquido é a única luz da oficina e ilumina a forma, o alicate e a água por baixo |
| A tela como portal | A gota na lente faz a passagem da oficina para o estúdio; o papel vira a página |
| Quadro final sempre bonito | Movimento reduzido, botão de pular ou fim do filme dão o mesmo quadro final |

O sistema completo está em [`02-sistema-de-design.md`](02-sistema-de-design.md).
