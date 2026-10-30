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
| 1. Encanto | Abertura (a forja) | "O que é isso?" | Espanto, curiosidade |
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
7. **A luz conta a história.** Escuro antes, luz depois. O fio incandescente é a primeira luz da cena e o metal reflete o estúdio.

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

## 4. A abertura: "A forja"

**Intenção:** a pessoa assiste ao nascimento do símbolo da empresa. Um fio de aço incandescente sai do escuro,
esfria até virar prata e é dobrado curva por curva até se tornar o clipe. É a ideia da PaperClips (fazer algo
simples e essencial com cuidado) contada sem uma palavra.

Arquivo: [`js/hero-film.js`](../../js/hero-film.js). Duração: 9,6 s. Pode ser pulada e repetida.

| Tempo | Cena | O que se vê | Por quê |
|---|---|---|---|
| 0,0–0,5 s | Escuro | Preto absoluto. | O silêncio antes da fala |
| 0,5–3,0 s | **Nascimento** | Um ponto de luz aparece e dele sai um fio branco-amarelo, rápido no início e freando até parar, soltando fagulhas. A câmera começa rente ao ponto e recua acompanhando o fio. | O fio é a única luz da cena. Ele chama o olhar |
| 1,5–4,8 s | **Têmpera** | O fio esfria da ponta para trás: amarelo, laranja, vermelho, um tom de palha e, por fim, o aço prateado. A luz do estúdio sobe aos poucos e um brilho percorre o metal. | A transformação de matéria bruta em produto acabado |
| 4,3–7,2 s | **Dobra** | As três curvas do clipe se dobram uma de cada vez, a de fora, a do meio e a de dentro. O trecho do meio fica parado, como preso num dobrador. O trecho que gira passa por cima do arame e assenta no plano com uma leve acomodação de mola. O fio gira no espaço para mostrar cada dobra. | Cuidado e precisão: cada curva tem seu momento |
| 6,4–9,6 s | **Assentamento** | A câmera chega ao quadro final, o fundo clareia do preto ao marfim, e o nome *paperclips*, a frase e os botões sobem em cascata. | O encanto vira informação |

**Detalhes de execução:**
- **Fluidez:** câmera, posição e rotação do clipe seguem curvas de Hermite que passam pelos pontos-chave **sem parar**.
  Só o primeiro e o último quadro têm velocidade zero. Nada começa ou termina seco.
- **Metal quente:** a cor de cada ponto do fio vem da temperatura (radiação de corpo negro), calculada a partir de quando aquele ponto saiu.
  Enquanto está quente, o aço fica escuro e fosco. Ao esfriar, volta a refletir o estúdio.
- **Brilho real:** a cena é desenhada em alta faixa dinâmica, e só o que passa do branco se espalha num halo (bloom em 5 níveis).
  Sem WebGL 2, a cena é desenhada sem o halo.
- **Fagulhas:** 280 partículas, cada uma com nascimento, velocidade, gravidade e resfriamento próprios, calculadas na placa de vídeo.
- **Dobra física:** o comprimento do arame é preservado. Cada dobra usa uma mola que parte do repouso e assenta em ~0,8 s com ~4% de excesso.
- **Estúdio:** as caixas de luz refletidas no aço têm bordas suaves, geradas no próprio código. Não há imagens externas.
- **Desempenho:** se o aparelho não mantiver ~30 quadros por segundo, a resolução interna cai sozinha.
- O quadro final é o mesmo de antes: o clipe pode ser girado com o dedo ou o mouse.
- Sem WebGL, aparece um clipe desenhado. Com movimento reduzido, vai direto ao quadro final.
- Para ajustar uma cena, abra o console do navegador e use `film.seek(5.2)`, que congela o filme nesse instante.

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
2. **Durante os 10 segundos da forja, fique parado, com as mãos quietas e o olhar na tela.** O público olha para onde você olha.
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
