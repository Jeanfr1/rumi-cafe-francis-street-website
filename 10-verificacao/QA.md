# Verificação da entrega

## Concluído
- Modelo 01 aprovado preservado como referência e aplicado ao estudo.
- Logo PNG com canais RGBA e alpha real; marca conferida visualmente sobre fundos escuro e marfim.
- Hero desktop sem texto embutido, hero mobile original e fotografias reais nas seções.
- Seis fontes fotográficas originais preservadas byte a byte e derivadas WEBP separadas.
- Fontes locais e arquivo de licença incluídos.
- Conteúdo de visitantes em inglês e roteiros em português.
- Links internos, âncoras, assets CSS e JSON verificados.
- Sintaxe JavaScript verificada.
- Testes de comportamento dos controles em DOM simulado: início, pausa, replay, navegação mobile, Escape e retorno do foco, fechamento por âncora e mudança de reduced motion.
- Guia PDF de oito páginas renderizado e revisto visualmente.
- Maquetes de composição desktop/mobile, storyboard e vídeo ilustrativo incluídos.
- ZIP validado por leitura, extração e comparação SHA256.

## Limite material
A renderização em navegador real não foi executada: o navegador não estava instalado e o download disponível falhou. Os testes de DOM simulado não comprovam geometria CSS, contraste em todos os crops ou comportamento em Safari/iOS. As maquetes e o vídeo são composições de direção, não screenshots nem gravações do navegador. Antes de publicar, abrir o estudo em 390, 768 e 1440 px e revisar o checklist abaixo.

## Revisão visual antes da publicação
- Hero: conferir texto sem cortes e contraste sobre a fotografia.
- Fotografias: garantir que crops CSS da fachada ocultem interface de avaliação e setas; manter o letreiro reconhecível.
- Papel: manter margens confortáveis e não cobrir rostos.
- Mobile: confirmar navegação, tamanho dos botões e ausência de scroll horizontal.
- Teclado: testar foco visível, links e retorno de foco após Escape.
- Movimento: verificar replay, pausa e prefers-reduced-motion; a preferência deve mostrar o frame final.
- Rede: verificar imagens e fontes locais carregadas; nada depende de CDN.
- Dados: confirmar horários, preços ou contatos antes de adicioná-los. O estudo atual não publica esses dados.

## Reproduzir os controles de arquivo
`python3 10-verificacao/validar-arquivos.py`

`node --check 08-estudo/rumi.js`

`node 10-verificacao/testar-controles.cjs`

O estudo abre sem build. Os scripts de validação usam Python/Node padrão e não substituem uma revisão em navegador real.
