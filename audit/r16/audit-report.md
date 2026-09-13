# Auditoria do portefólio Green Village — Expandível 72

13 de Setembro de 2026 · revisão R16

Foram corrigidos os defeitos reproduzidos e concluídos os testes de regressão do âmbito abaixo. Não foram observadas falhas bloqueantes nas verificações finais. Este resultado não equivale a certificar o projecto de construção, a fidelidade física das cores ou a ausência de qualquer erro em todas as combinações possíveis.

**Perspectiva de utilização:** cliente sem conhecimentos técnicos que explora a casa, compara acabamentos, consulta as plantas e os vídeos e guarda uma configuração comercial, em computador ou telemóvel.

## Correcções verificadas

| Área | Defeito reproduzido | Correcção e confirmação |
|---|---|---|
| Fachada | Na planta T2, as extremidades das divisórias e dos rodapés apareciam no exterior como uma linha clara. | As divisórias terminam na face interior da envolvente. Limites verificados nas sete plantas e fachada observada no navegador. |
| Portas e janelas | As folhas de vidro deixavam intervalos indevidos junto aos perfis. | Largura e posição das folhas ajustadas ao vão real. Verificação por raios sobre a geometria. |
| Janela do banho | O revestimento interior tapava a janela traseira. | Revestimento recortado em torno do vão; verificação geométrica e vista interior. |
| Vistas de detalhe | O revestimento do banho atravessava a vista da cozinha; o corte do banho também escondia elementos traseiros. | Visibilidade limitada à divisão e à face que impede a observação. 482 verificações de detalhe. |
| Armários de cozinha | Alguns armários superiores sobrepunham-se às janelas. | Os módulos incompatíveis com o vão deixam de ser desenhados. 4 960 raios verificaram a desobstrução. A adaptação é indicada na selecção, no resumo e no PDF. |
| Cozinha T4 A | A bancada compacta invadia a passagem. | Bancada ilustrativa de 1,60 m e posição corrigida. Todos os compartimentos alcançáveis nas 56 combinações suportadas, numa grelha de navegação de 8 cm. |
| Banho espelhado | Partes da cabine curva e acessórios mantinham a orientação anterior. | Todo o conjunto do duche acompanha o espelhamento. 17 referências, três posições de abertura e 732 verificações de malhas. |
| Visita interior | Abrir mobiliário durante a visita criava obstáculos que o mapa de circulação não representava. | A abertura do mobiliário termina a visita e regressa à exploração em corte; confirmado por interacção. |
| Câmara | Exportação ou redimensionamento podiam deslocar a câmara da visita interior. | A actualização orbital não interfere com a câmara de caminhada. Regressão com o OrbitControls real; o defeito anterior produzia um deslocamento de aproximadamente 2,88 m. |
| Configuração partilhada | Editar uma ligação de configuração e recarregar podia recuperar as escolhas antigas da ligação. | A ligação acompanha as alterações guardadas. Regressão de edição e recarregamento aprovada. |
| YouTube | O relógio personalizado ficava incoerente ao recuar para antes do instante de entrada. | Relógio e barra usam o tempo absoluto do vídeo. Os capítulos mantêm os inícios de 15:45 e 08:12. Testado no leitor real e em nove regressões. |
| Reprodução | O estado de pausa podia continuar a apresentar a mensagem de carregamento. | Estado de pausa actualizado; iniciar outro vídeo ou sair de Filmes interrompe a reprodução anterior. |
| Teclado | O atalho inicial para o configurador não abria o estúdio quando outra secção estava activa. | Activa o estúdio e coloca o foco no modelo; confirmado com Enter a partir da ficha técnica. |
| Acessibilidade | Etiquetas de dois contentores não tinham a função semântica adequada. | Funções de grupo definidas; nenhuma violação automática nas 36 verificações finais. |
| Informação comercial | A galeria antiga era descrita como se representasse a geometria actual; uma auditoria R9 parecia ser a revisão actual. | Galeria identificada como estudo anterior, com indicação de como exportar a configuração actual em 4K. Auditoria R9 identificada como histórico. |

## Vídeos e preferências pedidas

- Retirado **“Visita a um módulo em exposição”**, incluindo o MP4 e a miniatura da distribuição do site. Os ficheiros originais do utilizador não foram alterados.
- Os dois vídeos do YouTube disponibilizam áudio e controlos nativos. A escolha posterior do utilizador de silenciar ou ajustar o volume é respeitada.
- Os restantes vídeos locais e os respectivos downloads continuam sem áudio. Os 15 MP4 distribuídos foram verificados; não foi adicionado áudio nem recodificado o vídeo nesta revisão.
- A biblioteca activa contém oito referências: dois vídeos do YouTube e seis vídeos locais. A numeração dos cartões é sequencial; o antigo vídeo 04 passa a 03, com outra identidade.

## Cobertura e resultados

| Verificação | Resultado |
|---|---|
| Regressão principal | 47 grupos aprovados |
| Expansão | Sete plantas, 7 007 posições e 56 ciclos aprovados |
| Geometria e circulação | 56 combinações suportadas; 18 488 verificações das transformações finais |
| Câmara e configuração partilhada | Três regressões aprovadas |
| Leitores YouTube | Nove regressões aprovadas, complementadas por reprodução real |
| Integridade | Materiais, referências, importações e ligações locais revistos; resultados detalhados nos ficheiros de evidência |
| Navegador | Seis secções × seis larguras = 36 relatórios |
| Larguras | 375, 768, 1 024, 1 280, 1 440 e 1 920 px |
| Consola, execução e carregamento | Zero erros ou avisos nos relatórios finais; sem conteúdo a transbordar horizontalmente |
| Acessibilidade automática | Zero violações axe-core; verificações manuais indicadas abaixo |

As secções verificadas foram Personalizar, O modelo, Galeria 4K, Plantas, Filmes e Ficha técnica. A animação mantém a sequência confirmada: módulo fechado → alas laterais → paredes laterais erguidas → frente e traseira para fora. As funções de articulação não foram substituídas nesta revisão. Os testes verificam o comportamento da maqueta, não a engenharia do mecanismo de fábrica.

### Interacções realizadas no navegador

Pesquisa sem resultados e recuperação da lista; alteração de material e desfazer; escolha de cozinha; bancada T4 A; banho espelhado; entrada e saída da visita; abertura de mobiliário; vistas 3D; comparação de planta original; abertura e fecho de imagens ampliadas; filtro de galeria; pergunta sobre a área comercial; ligações aos documentos; navegação móvel; atalho de teclado; resumo com as escolhas actuais; criação de PDF; exportação 4K; cópia da ligação de partilha.

Nos leitores reais do YouTube foram confirmados áudio disponível, reprodução, pausa do leitor anterior e recuo até 0:00, anterior ao início seleccionado de 15:45. As preferências de volume e os capítulos também foram verificados através do módulo real com uma API de teste determinística.

O PDF foi criado pelo botão do portefólio com confirmação de quatro páginas; a exportação 4K e a cópia da ligação também apresentaram confirmação sem erros. A análise de ficheiros PDF gerados directamente pelo módulo está identificada separadamente nas evidências: não deve ser confundida com uma captura 3D do navegador. Os downloads do navegador não ficaram expostos como ficheiros locais nesta ferramenta.

### Desempenho observado

Na execução local móvel de 375 px: LCP 248 ms, CLS 0 e INP 72 ms. Noutra execução, LCP 96 ms, CLS 0 e INP 176 ms. As medições antecederam o teste axe para reduzir a interferência do próprio auditor. São medições locais, em condições favoráveis; não representam utilizadores reais, ligações lentas ou telemóveis físicos. As medições posteriores a redimensionamentos não são novos carregamentos independentes.

## Limites e melhorias ainda por validar

- **Acessibilidade manual completa: Incomplete.** O protocolo exaustivo da skill UX Audit exige um manifesto integral de todos os controlos e cenários; esse protocolo integral não foi completado. Foram efectuadas interacções reais, capturas de ecrã e a matriz automática descrita, mas não uma certificação WCAG nem uma revisão integral com leitor de ecrã.
- O axe assinala contraste sobre imagens/3D, legendagem dos vídeos locais e o destino inicialmente oculto do atalho entre secções como verificações manuais. O atalho foi confirmado pelo teclado. Os MP4 são silenciosos e têm descrições e capítulos; não foi validada uma alternativa descritiva equivalente para todo o seu conteúdo visual.
- Os leitores externos do YouTube dependem desse serviço. O áudio e os controlos foram testados; não se afirma cobertura automática completa do conteúdo externo.
- As imagens 4K antigas da galeria não foram todas geradas de novo. Estão identificadas como estudo anterior; a exportação do estúdio usa a configuração actual.
- Fotografias sem calibração não permitem garantir identidade física de cor, brilho ou escala da textura. Mantêm-se os recortes originais e as distinções documentadas entre amostra e visualização.
- Medidas não cotadas, equipamentos adaptados, instalações e pormenores de fabrico continuam identificados como estimados ou por confirmar. Não foram inventadas certificações nem alteradas as cotas exteriores fornecidas.

## Evidências e reprodução

- `browser/*.json`: 36 relatórios com data, secção, largura, axe, erros e medições.
- `browser-summary.json` e `browser-workflows.json`: matriz e interacções observadas.
- `geometry-final.json`: verificações finais de geometria e hashes dos módulos.
- `application-final.json` e `youtube-final.json`: regressões finais.
- `deployment.log` e `core-tests.log`: testes da expansão e grupos principais.
- `integrity-final.json`, `assets-final.json` e `integrity-review.md`: revisão independente.
- `geometry-findings.json` e `application-before.json`: defeitos reproduzidos antes da correcção.
- `removed-video.json`: identidade e proveniência do vídeo retirado.
- `pdf-final.json`: validação complementar do módulo de PDF.

Reprodução: `npm test`, `npm run test:deployment`, `node scripts/geometry-regression.mjs`, `node scripts/application-regression.mjs` e `node scripts/youtube-regression.mjs`. A ferramenta temporária de auditoria no navegador não integra o site publicado.
