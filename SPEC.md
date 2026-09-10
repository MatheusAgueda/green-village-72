# Green Village 72 — portefólio e configurador

A experiência abre directamente num modelo 3D interactivo. PT-PT. Direcção visual: estúdio de arquitectura, verde floresta profundo, branco, tipografia editorial, grande maquete sobre fundo mineral.

## Critérios
- Modelo volumétrico orbitável do contentor de 40 pés / 72 m², com exterior, interior, estrutura, redes ilustrativas e expansão articulada.
- Cores e texturas a partir do PDF; plantas originais extraídas do XLSX, com layouts seleccionáveis; configurações de cozinha e casa de banho.
- Telhado e alpendre opcionais visíveis; piso e paredes com materiais alteráveis; resumo das escolhas exportável.
- Fotografias originais, filme MP4 das fotos e filme da animação 3D; controlos de vídeo.
- Geometria reconstruída identificada como ilustrativa; redes sem alegação de projecto certificado. Nenhuma dimensão inferida apresentada como medida de fabrico.
- Validar sintaxe, recursos locais, invariantes da geometria e estados/opções; servir e confirmar HTTP antes de publicar em acesso privado.

# Revisão documental e funcional — 10/09/2026

Pedido integral: auditoria e correcção do portefólio existente; manter identidade, publicar revisão privada verificável. Base anterior guardada na etiqueta `recovery/gv72-before-audit-20260910`.

## Ordem e aceitação
1. Fontes: inventário com página/fotograma, âmbito da variante e lacunas; cotejar independentemente PDF/XLSX/fotografias. Não usar screenshot como fonte dimensional.
2. Dados: unidades metros, X largura, Y altura, Z comprimento; frente +Z, origem centro do piso. Exterior confirmado 11,80 × 6,22; áreas interiores calculadas com hipóteses identificadas. Fonte única gera 2D/3D/resumo.
3. Geometria: sete plantas documentadas, vãos/portas/equipamentos ligados aos mesmos dados; espessuras e medidas estimadas explicitadas. Corrigir intersecções e circulação verificáveis.
4. Materiais: códigos originais, cores separadas, UVs em metros, texturas sem texto, iluminação neutra e comparação referência/aplicação. Sem fingir detalhe superior à imagem de origem.
5. Configuração: validar incompatibilidades sem alterações silenciosas, guardar/recuperar/repor, exportar JSON/SVG/PNG/PDF coerentes. Perspectivas/corte/explodido/camadas, navegação acessível.
6. Expansão: peças rígidas, estados intermédios verificados; montagem de equipamento/coberturas separada da cinemática, incertezas do mecanismo claras. Sem representar uma solução inferida como desenho de fabricante.
7. Verificação: testes Node de dados/áreas/UVs/regras/expansão; browser QA de sete plantas, todas as 71 amostras, persistência e exportações, desktop/mobile, erros e WebGL indisponível. Desempenho reportado com ambiente identificado e limites.
8. Entrega: relatório de fontes/medidas/materiais, antes/depois, dois vídeos do modelo corrigido (exterior/interior e expansão) e versão publicada verificada.

A falta de desenhos de fabrico não bloqueia as correcções verificáveis. Dimensões livres estimadas, perfis, ligações, alturas e diâmetros ilustrativos nunca são apresentados como certificados.

## R4 — recuperar a expansão e corrigir regressões

- Recuperar a demonstração completa de recolhimento/abertura de cobertura, pisos e paredes, mantendo peças rígidas e a geometria final do configurador. O estado recolhido e os pivôs inferidos ficam identificados como simulação, sem medidas de transporte certificadas.
- Expor etapas seleccionáveis, reprodução, pausa, reinício e regresso à casa pronta. Trocas de opções não devem saltar silenciosamente para outra vista nem apagar o progresso.
- Garantir que a expansão apresenta os painéis necessários mesmo quando outras vistas usam cortes ou fachadas ocultas; os controlos devem corresponder à visibilidade efectiva.
- Corrigir bugs reproduzidos na revisão de estados, câmaras e exportações; preservar os pisos, materiais e vídeos originais já tratados.
- Testar trajectórias e estados intermédios, sete layouts e opcionais, transições, telemóvel e recuperação. Actualizar o filme da expansão para corresponder à sequência entregue e publicar no Site existente.

## R5 — correspondência entre catálogo e ambientes 3D

- Cada referência de cozinha e banho selecciona acabamentos e elementos visíveis específicos; as fotografias são cotejadas individualmente. A implantação adapta-se à planta com medidas estimadas, sem inventar códigos de material.
- Usar recortes reais rastreáveis para os materiais de ambientes; oferecer aplicação sem tratamento de cor das amostras e comparação digital. Preservar originais e identificar escala/iluminação estimadas.
- Acrescentar aproximação dedicada, comparação com a referência seleccionada, frentes móveis, ferragens, cubas côncavas, torneiras, espelhos e resguardos detalhados.
- Guardar/exportar todas as escolhas. Testar cada referência, migração das configurações existentes, carregamento/recuperação de texturas, navegação móvel e expansão R4 sem regressões.
- Rever visualmente os ambientes no navegador, actualizar o filme de apresentação com o modelo entregue e publicar no Site privado existente.
# R6 — door correction and product audit, 10 September 2026

Preserve the existing Site, catalogue references, user configuration and R4 expansion. Follow the seven original plan images when assigning passage-door hinges and swing directions. No new fabrication measurements are inferred from the drawings.

- Passage-door leaves and SVG swing arcs must share one kinematic definition, including hinge end, closed direction and opening side.
- Opening and closing must return to the same doorway without reversing through a wall or moving the hinge. Audit the swept leaf against partitions and proposed furniture; resolve model conflicts without changing confirmed exterior dimensions.
- Furniture fronts and shower doors must open away from their closed body and keep coherent individual and collective controls.
- Exercise all six portfolio sections and core configure/save/recover/export flows, keyboard navigation, responsive layouts, source comparisons and media. Record the scope and real reproductions before fixing; document inapplicable account/CRUD scenarios rather than inventing them.
- Regression checks must prove the corrected directions for all seven plans, stable closed endpoints, matching 2D/3D, retained expansion and the specific interaction defects discovered in this audit.
