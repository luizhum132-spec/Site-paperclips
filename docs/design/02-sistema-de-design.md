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
7. **A luz conta a história.** Escuro antes, luz depois. O metal líquido é a primeira luz da cena e, frio, o aço passa a refletir o estúdio.

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

**Intenção:** mostrar a empresa com um início robusto. O espectador acompanha a fabricação do símbolo da PaperClips:
metal líquido vira barra, a barra é temperada na água, o aço é dobrado com calma e o clipe pousa sobre papéis.
O papel vira a própria página do site.

Arquivo: [`js/hero-film.js`](../../js/hero-film.js). Duração: 20,4 s. Pode ser pulada e repetida.

| Tempo | Cena | O que se vê |
|---|---|---|
| 0,0–4,4 s | **Fundição** | No escuro, um cadinho inclina e derrama um fio de metal líquido num canal reto de uma forma de grafite. O líquido corre pelo canal, tremulando e soltando fagulhas. Ele é a única luz da cena. |
| 4,4–5,2 s | **Endurecimento** | A barra fica no canal, ainda incandescente, passando do amarelo ao laranja. |
| 5,1–8,5 s | **Alicate** | Um alicate grande entra pelo alto, abre, desce, prende a barra em brasa, tira da forma e leva até o tanque. |
| 8,5–10,5 s | **Têmpera** | A barra mergulha na água fria. A água ferve só em volta do metal, com bolhas, anéis e vapor iluminado pelo brilho de baixo. O brilho se apaga conforme o aço esfria. |
| 10,5–11,0 s | **Saída** | O alicate puxa a barra rápido. A água espirra em direção à câmera. |
| 11,0–13,0 s | **A gota** | Uma gota bate na lente: a imagem embaça e a gota funciona como uma pequena lente, invertida e ampliada. Ela escorre deixando um rastro. Ao fundo, o aço agora prateado começa a brilhar. |
| 12,9–17,3 s | **Dobra** | Sobre uma mesa escura, sob um foco de luz, as três curvas se dobram devagar, uma de cada vez. Cada dobra leva 1,8 s e começa e termina parada (curva com velocidade e aceleração zero nas pontas). |
| 16,6–18,9 s | **O papel** | O clipe desce e pousa no canto superior esquerdo de uma pilha de folhas, com sombra real. A câmera entra no papel. |
| 18,9–20,4 s | **A página** | O papel cobre a tela e já tem a cor exata da página. O fundo do site assume, o clipe se ergue para a posição final e o nome sobe em cascata. |

**Detalhes de execução:**
- **Fluidez:** câmera, alicate e clipe seguem curvas de Hermite que passam pelos pontos-chave sem parar.
- **Metal:** a cor de cada ponto vem da temperatura (corpo negro), calculada a partir de quando aquele ponto foi preenchido e de quando entrou na água.
  Quente, o aço é escuro e fosco e o líquido tremula. Frio, ele reflete o estúdio.
- **Água:** a superfície se deforma na placa de vídeo (bolhas de fervura e anéis), e o brilho do metal submerso a ilumina por baixo.
- **Lente molhada:** desfoque da cena inteira, mais a gota como lente (refração invertida, borda escura, reflexo) e o rastro.
  A troca da oficina para o estúdio acontece escondida pelo desfoque.
- **Papel → página:** a cor do papel é calculada de trás para frente pelo tom (ACES) do three.js, para sair exatamente `#F4F1EA` ao cobrir a tela.
- **Brilho:** a cena é desenhada em alta faixa dinâmica, com bloom em 5 níveis. Sem WebGL 2, é desenhada sem bloom nem lente.
- **Desempenho:** se o aparelho não mantiver ~30 quadros por segundo, a resolução interna cai sozinha.
- Sem WebGL, aparece um clipe desenhado. Com movimento reduzido, vai direto ao quadro final.
- Para ajustar uma cena, abra o console do navegador e use `film.seek(9.6)`, que congela o filme nesse instante.

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
2. **Durante os 20 segundos da forja, fique parado, com as mãos quietas e o olhar na tela.** O público olha para onde você olha.
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
