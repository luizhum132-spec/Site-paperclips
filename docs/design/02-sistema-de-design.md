# Sistema de design da PaperClips

> "Design não é só a aparência. Design é como funciona." Steve Jobs

Este documento cobre o processo inteiro: para quem é o site, que história ele conta, como cada coisa se move
e como apresentá-lo ao vivo. A pesquisa que embasa estas decisões está em [`01-pesquisa-apple.md`](01-pesquisa-apple.md).

---

## 1. Para quem é

Cada pessoa chega com **uma pergunta na cabeça**. O site precisa respondê-la antes que ela precise perguntar.

| Persona | Contexto | A pergunta | O que precisa sentir | Onde converte |
|---|---|---|---|---|
| **Marina, 42, sócia de um fundo** | No celular, entre reuniões, 30 segundos de atenção | "Essa holding é séria? O que ela faz?" | Solidez, foco, bom gosto | "Fale conosco" → Investimento |
| **Rafael, 35, dono de uma empresa** | No computador, comparando fornecedores | "Eles fazem meu site/IA? Funciona?" | Competência provada, sem jargão | Tecnologia → Contato |
| **Bia, 22, jogadora** | Chegou por um link do jogo | "Esse jogo é legal? Quando sai?" | Diversão, vontade de jogar | Games → aviso de lançamento |
| **O dono da PaperClips** | No painel, todo dia | "Quem me procurou hoje?" | Controle, clareza, calma | Painel de contatos |

**Consequências de design:**
- A Marina decide nos primeiros 10 segundos. Por isso a abertura precisa encantar **e** terminar com o nome e uma frase clara.
  Ela pode pular a abertura a qualquer momento.
- O Rafael precisa de prova. Toda afirmação da seção Tecnologia vem com um número ou uma demonstração.
- A Bia precisa ver o jogo se mexendo. Por isso há telas de jogo animadas, e não capturas paradas.
- Ninguém deve esperar uma animação para poder agir.

---

## 2. A história que a página conta

A página é uma apresentação com atos, como um keynote:

| Ato | Seção | Pergunta respondida | Emoção |
|---|---|---|---|
| 1. Encanto | Abertura (filme) | "O que é isso?" | Espanto, curiosidade |
| 2. Clareza | Destaques | "O que a holding faz?" | Entendimento rápido |
| 3. Crença | Princípios | "No que eles acreditam?" | Afinidade |
| 4. Prova | A holding (números) | "Funciona mesmo?" | Confiança |
| 5. Produtos | Games, Tecnologia | "O que posso usar/contratar?" | Desejo |
| 6. Escolha | Continue explorando | "Por onde sigo?" | Direção |
| 7. Conversa | Contato | "Como falo com eles?" | Facilidade |

### Fórmula de texto (adaptada da Apple)
```
Rótulo     1–2 palavras            PaperClips Games
Título     2–6 palavras, 2 tempos  Jogos que cabem em cinco minutos.
Prova      2–3 frases, 1 número    Partidas curtas, controle com um dedo…
Mídia      demonstra, não decora   o jogo rodando
```
Voz: frases curtas, verbos no presente, números concretos, nenhum jargão. Português do Brasil, com "você".

---

## 3. Movimento

### Regras
1. **Todo movimento tem um motivo:** revelar, conectar ou confirmar. Se não tem motivo, sai.
2. **Toca uma vez, ao chegar.** Nada repete sozinho em loop no campo de leitura.
3. **Nunca prende a rolagem.** Animações vinculadas à rolagem acompanham o dedo, sem sequestrá-lo.
4. **Sempre interrompível.** O filme tem "Pular abertura" e "Repetir abertura". Sair da seção encerra o filme.
5. **Movimento reduzido = quadro final.** Com "reduzir movimento" ligado, mostra-se direto o estado final, sem perder nenhuma informação.
6. **Objetos têm peso.** Aceleram e freiam, nunca começam ou param secos.
7. **A luz conta a história.** Escuro antes, luz depois. A tela ilumina o teclado e o metal reflete o ambiente.

### Tokens (em `css/base.css` e `js/core.js`)
| Token | Valor | Uso |
|---|---|---|
| `--ease` | `cubic-bezier(.7,0,.2,1)` | Objetos e transições de cena (peso) |
| `--out` | `cubic-bezier(.16,1,.3,1)` | Entradas de interface (chega rápido, assenta devagar) |
| `io3` / `eo` (JS) | cúbica simétrica / saída cúbica | Equivalentes no 3D e nos canvas |
| Micro | 150–200 ms | Toque em botão, hover |
| Interface | 300–500 ms | Abrir painel, trocar aba |
| Revelação | 800–1200 ms, cascata de 120 ms | Títulos e cartões entrando |
| Cinema | 2–10 s | Abertura e histórias de produto |

### Gatilhos
- **Tocar ao chegar:** quando o bloco cruza ~70% da altura da tela (`watchReach` em `js/reveal.js`).
- **Desenhar só o que está na tela:** um único laço de animação (`js/loop.js`) que pula seções fora da tela.
- **Pré-carregar antes:** recursos pesados começam a carregar duas telas antes (próxima etapa, quando houver vídeo).

---

## 4. A abertura

**Intenção:** a pessoa deve sentir que está vendo o lançamento de um produto, e entender no fim que o "produto" é a própria PaperClips.

Arquivo: [`js/hero-film.js`](../../js/hero-film.js). Duração: 10,4 s. Pode ser pulada e repetida.

| Tempo | Cena | O que se vê | Por quê |
|---|---|---|---|
| 0,0–0,6 s | Escuro | Preto. A exposição sobe devagar. | O silêncio antes da fala, para ganhar atenção |
| 0,2–2,6 s | **Chegada** | Um notebook fechado sobe de fora do quadro, girando, e para de frente. Uma luz percorre a tampa. | Apresentar o objeto como alguém que o traz na mão para o palco |
| 2,2–4,6 s | **Abertura** | A tampa abre. A tela acende com as cortinas de luz, que escorrem do centro para as bordas. A luz da tela cai sobre o teclado. | A tela é o personagem; a luz mostra que algo está vivo |
| 4,0–6,8 s | **O clipe** | Um arame de metal entra voando pelo canto, de fora do quadro, e se dobra no caminho até virar um clipe, parado diante da tela. | A marca nasce de um gesto simples: dobrar um fio |
| 6,8–9,6 s | **Mergulho** | A câmera avança junto com o clipe. A tela clareia até virar marfim, cobre o quadro, e o clipe atravessa para dentro dela. | O momento "uau": entramos na tela, e a tela é o site |
| 9,6–10,4 s | **Chegada ao site** | O fundo já é a página. O nome *paperclips*, a frase e os botões sobem em cascata. | O encanto vira informação |

**Detalhes de execução:**
- O enquadramento final do mergulho é **exatamente** o quadro final do site. Por isso não há corte nem salto.
- A tela fica marfim (`#F4F1EA`, a cor da página) antes de cobrir o quadro. Quando cobre, o notebook some e o fundo da página assume, sem transição visível.
- O clipe é desenhado "por cima" do notebook durante o mergulho. Ao cruzar o plano da tela, ele parece entrar nela, como num portal.
- Em telas em pé (celular), a câmera começa mais longe para o notebook caber no quadro.
- Sem WebGL, aparece um clipe desenhado. Com movimento reduzido, vai direto ao quadro final.
- Para ajustar o tempo de uma cena, abra o console do navegador e use `film.seek(5.2)`, que congela o filme nesse instante.

---

## 5. Roteiro das próximas seções

Cada seção recebe o tratamento de "história de produto". Ordem sugerida de implementação:

| Seção | Hoje | Proposta |
|---|---|---|
| Destaques | Galeria com progresso e pausa | Manter. Revisar os textos para a fórmula rótulo → frase de 1 linha. |
| Princípios | Lista "explore os detalhes" com cortinas de luz | Virar um "olhe de perto": cada princípio troca a vista, com transição de luz entre eles. |
| A holding | Título que acende e números que contam | Números com fonte e contexto ("desde 2024"), contagem vinculada à rolagem. |
| Games | Cartão com o jogo rodando | Duas histórias de produto (Bigodes, FicCity), cada uma com título em 2 tempos e o jogo jogável no celular desenhado. |
| Tecnologia | "O site se aproxima e se monta sozinho" | Animação vinculada à rolagem (scrub) num contêiner grudado: o site se monta conforme a pessoa rola. |
| Continue explorando | Cartões de comparação | Padrão "Keep exploring": 2–3 cartões com o mesmo esqueleto (o que é, para quem, um número, botão). |
| Contato | Formulário | Uma pergunta por vez no celular. Confirmação com microanimação do clipe. |

---

## 6. Apresentando ao vivo

Quando a PaperClips for apresentada (reunião, evento, vídeo), o site é o palco:

1. **Abra em tela cheia, já no topo, com a abertura pronta.** Diga uma frase só ("Quero mostrar o que a gente está construindo.") e **pare de falar**.
2. **Durante os 10 segundos do filme, fique parado, com as mãos quietas e o olhar na tela.** O público olha para onde você olha.
3. **Fale só depois que a coisa acontece.** Quando o nome aparecer, diga o que é a holding numa frase.
4. **Role devagar, com um gesto contínuo**, como quem vira a página de um livro. Pause em cada título por 2 segundos antes de explicar.
5. **Aponte para o resultado, não para o processo.** "Esse jogo cabe em cinco minutos", e não "aqui tem um canvas que…".
6. **Termine no Contato**, com uma pergunta para a plateia.

---

## 7. Checklist de qualidade (o "último 1%")

- [ ] Nada salta: o quadro final do filme é idêntico ao estado da página.
- [ ] 60 quadros por segundo em notebook comum e celular de 3 anos.
- [ ] Todo texto legível em 320 px de largura, sem rolagem lateral.
- [ ] Toda animação tem estado final sem movimento (movimento reduzido).
- [ ] Todo número tem fonte ou contexto.
- [ ] Títulos com no máximo 6 palavras; parágrafos com no máximo 3 frases.
- [ ] Contraste AA em todo texto, inclusive sobre as cortinas de luz.
- [ ] Botões de pelo menos 44 px no toque.
