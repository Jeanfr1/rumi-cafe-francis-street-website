# Motion - O vapor que vira assinatura

## Intenção
A abertura deve parecer um gesto quente e breve, não um loading. O visitante já pode ler e navegar enquanto a assinatura se revela.

| Tempo | Ação | Implementação no estudo |
|---|---|---|
| 0.00-0.85 s | Fotografia ganha escala 1.035 → 1 | Transform CSS, sem esconder o conteúdo |
| 0.15-1.60 s | Três curvas finas sobem do café | SVG stroke-dashoffset e opacidade |
| 0.45-1.35 s | Headline entra com 18 px de deslocamento | Transform e opacity; título presente mesmo sem JavaScript |
| 1.00-2.55 s | Traços geométricos desenham RUMI | SVG monoline de animação; não é o master da logo |
| 2.20-2.85 s | Traços dão lugar ao PNG fiel da logo | Crossfade entre traçado e PNG |
| 2.85 s | Cena estável | Sem loop infinito ou áudio |

## Scroll
O primeiro fundo pode deslocar até 24 px. Folhas de papel entram 26 px com rotação inicial de -2 graus, estabilizando em 650 ms. A fotografia da seção fica visível durante toda a transição. Não prender o scroll, não trocar a direção de rolagem e não criar grandes vazios para produzir a animação.

## Controles e acessibilidade
Replay explícito na base do hero. Botão Pause/Resume interrompe o movimento. Com prefers-reduced-motion, mostrar imediatamente foto, título e PNG final; sem parallax, sem traçado e sem reveals. As figuras de vapor e o SVG são decorativos, aria-hidden. Mudanças de preferência devem ser respeitadas na sessão.

## Mobile
Vapor leve junto à região do café e marca na base; nada de overdraw pesado de blur. Usar só CSS transforms/opacity e stroke-dashoffset. A foto original em retrato substitui a campanha widescreen. A animação não usa vídeo para carregar o hero e não exige biblioteca externa.

## Arquivos executáveis
08-estudo/rumi.js controla replay, pausa, navegação e reveals. 08-estudo/rumi.css contém keyframes. 07-integracao/timeline.json conserva o timing para implementação em outro stack. O SVG decorativo é aproximado para animar o gesto; o PNG entregue é a assinatura definitiva no frame final.
