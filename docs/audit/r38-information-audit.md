# R38 — auditoria independente da informação e das regressões

Data: 5 de Outubro de 2026. Checkout: `/Users/claraazevedo/Documents/green-village-72-r38`.

## Resultado e âmbito

A ronda inicial executou 30 scripts de regressão: 28 passaram; o teste geral parou num hash de módulo alterado durante a edição cooperativa e o antigo `application-regression.mjs` falhou devido a mocks e fronteiras de extracção obsoletos. Uma cópia actualizada desse harness, guardada apenas em `audit/r38/artifacts/`, passou os três cenários. Estes resultados são verificações locais da ronda intermédia R38, não prova da publicação ou do estado final de todos os módulos.

Em navegador local isolado, passaram 14 cenários de projectos/anexos privados, oito cenários de janelas e seis exportações PDF (PT/EN/ES, cada idioma com vinil e SPC). O teste de projectos produziu um dossier de 18 páginas sem erros JavaScript ou HTTP; os seis PDFs de idioma têm 14 páginas cada. A auditoria não utilizou o Chrome pessoal.

A lacuna da tabela de preços do JSON de fontes foi corrigida pela integração principal e o teste independente passou 8/8. O harness de aplicação mantido passou agora 3/3. Após alargamento explícito da tarefa, esta auditoria passou também a escrever `dist/i18n-fr-it-presentation.js`: 88 textos de apresentação em EN/ES/FR/IT, cobrindo os 73 resíduos atribuídos. Os restantes módulos foram alterados pelas tarefas paralelas.

## Valores comerciais e proveniência

| Requisito | Verificação nesta ronda | Origem no código |
|---|---|---|
| Três janelas em cada fachada comprida | Sete plantas, sempre `[3, 3]` nos vãos base | `specification.js:135` e `source-commercial-audit.json` |
| Frente completa, três módulos, 2 600 € | Preço do conjunto em `OPTIONAL_ITEMS`; repetição conserva quantidade e preço no browser/PDF | `project-options.js:22` |
| Lateral completa, seis módulos, 5 190 € | Preço do conjunto e variante esquerda/direita; 28 configurações envidraçadas no teste R28 | `project-options.js:23` |
| Vinil incluído; SPC +1 200 € por casa | Seis PDFs: subtotais 630 €/1 830 € para janela 130 € + monosplit 500 €, com/sem SPC; uma única linha SPC | `project-options.js:31` |
| Ilha adicional separada | Preço nulo, pedido sob cotação e retenção fora de plantas compatíveis | `project-options.js:25`; regressões cliente/R26 |
| Monosplit 12 000 BTU, 1×1, 500 € com instalação | Preço e descrição preservados; IVA não acrescentado | `project-options.js:26`; PDF inglês p. 10 inspeccionado |
| Multisplit 3×1 sob cotação | Sem preço inventado; excluído do subtotal, nunca descrito como gratuito | `project-options.js:27`; seis PDFs |
| Entrega 90–180 dias úteis, mais 30 dias no terreno | Valores centrais e conteúdos UI/PDF na regressão R33; PDF inglês inspeccionado | `commercial-terms.js:3` |
| Garantia 10/5/2 anos | Estrutura/sistema expansível/acabamentos, respectivamente | `commercial-terms.js:8` |
| Cozinha standard original embalada | Referência `kitchen-14`; acabamento/cuba/torneira ocultos mantêm-se por confirmar | `standard-package.js:8`; PDF inglês p. 9 |
| Banho standard 17 | Referência `bathroom-17`, móvel à esquerda, sanita e duche com resguardo de correr | `standard-package.js:11`; PDF inglês p. 9 |

`DATA` retém a edição comercial de 20/09/2026 e o catálogo PDF conserva a edição de julho. O preço de frente em vidro de 1 350 € presente no PDF original, página 4, foi confirmado por extracção nesta sessão. O preço actual de 2 600 € é aplicado por `project-options.js` e `currentCataloguePrice()`, com data 02/10/2026 e IVA por confirmar. A presença do preço histórico no documento original não foi tratada como um erro.

A consulta do PDF original confirmou também a janela 930 × 930 mm, o isolamento EPS, os 50 mm de PU, os 3 m de terraço, a página de amostras SPC e o texto literal “3 m” do banho. Este último não é convertido em 3 m² nem aplicado como profundidade universal. A extracção integral está em `original-catalogue-text.txt`.

## Fontes, estimativas e limites

O inventário corrente contém 47 factos: 25 documentados, dois derivados, sete em falta, cinco observados sem cotas, um ambíguo, cinco parciais e dois confirmados pelo proprietário. A contagem histórica de 107 incluía outros registos/especificações e não deve ser repetida como contagem dos factos correntes.

Dimensões documentadas, valores de visualização e informação ausente permanecem separados em `MEASURES` e `configuredMeasures()`. A altura visual de 2,55 m não é apresentada como a altura do fabricante; as alturas de 2,48 m exterior e 2,24 m interior mantêm registos distintos. Paredes de 100 mm, divisórias de 80 mm, alturas/peitoris de janelas e implantação de interiores continuam estimados. A área útil certificada permanece em falta. O rectângulo exterior de 73,396 m² não é forçado a coincidir com a designação comercial de 72 m².

As fontes locais XLSX/PDF referenciadas pelos factos existem. Esta ronda verificou presença, estados, conteúdos comerciais seleccionados e a distinção entre dimensões; não recertificou cada alegação do fabricante nem efectuou uma nova leitura visual integral de todas as plantas e fichas originais. As dimensões identificadas como oriundas da ficha do fabricante não têm um documento autónomo dessa ficha na lista `SOURCES`; conservam-se como informação anteriormente fornecida, sem criar uma nova ligação documental fictícia.

A expansão mantém `full-illustrative-deployment`, pressupostos explícitos e volume de transporte não documentado. Os testes verificam transformações/continuidade da maquete. Não comprovam mecanismo de fabrico, tolerâncias, cargas, estanquidade ou ausência universal de colisões físicas.

`factsNotStandaloneCards` no artefacto de inventário identifica factos apresentados em tabelas, divergências ou listas, em vez de cartões `data-fact`. Não é uma lista de factos ausentes.

## Lacunas detectadas

### P2 resolvido — exportação de fontes sem todos os preços correntes

`dist/client-tools.js:106` constrói `commercialPrices` exclusivamente a partir dos 22 `CATALOGUE_OPTIONS`. O configurador tem 27 artigos seleccionáveis, além do SPC. A lateral completa em vidro, vidro lateral parcial, ilha, os dois sistemas de ar condicionado e o SPC não constam dessa tabela. A configuração exportada preserva IDs/quantidades, mas o JSON de fontes não fornece o preço/estado comercial completo desses novos artigos. As opções no ecrã e o PDF têm os valores correctos. A correcção conserva `catalogueOptions` como registo documental e passa a exportar os 27 opcionais correntes e a linha SPC, com preço, origem e IVA. O reteste `r38-information-checks.json` passou 8/8, incluindo cobertura integral e o cálculo independente de 8 990 € para frente + lateral + SPC, com ilha pendente.

### P2 resolvido — harness de aplicação desactualizado

O script `scripts/application-regression.mjs` extracía funções do `app.js` com fronteiras históricas. `runExport()` passou a chamar `pauseVisit()`, `cameraFlight`, `resizeViewport()` e `presentationMode`; `resizeViewport()` usa `presentationMode` e `matchMedia`. Os mocks não os declaravam. A extracção de `persist()` até `configure()` passou a incluir código lateral que exige `window.addEventListener`. Erros originais: `pauseVisit is not defined`, `presentationMode is not defined`, `window.addEventListener is not a function`.

A cópia de diagnóstico `application-regression-current-harness.mjs` actualiza apenas o contexto de teste e a extracção de `persist()`. Passou 3/3: preservação da câmara ao exportar, preservação ao redimensionar e persistência das alterações a uma ligação partilhada. A integração R38 aplicou a correcção ao script original e o reteste independente passou 3/3 (`application-regression-final.json`). Nenhum erro real de aplicação foi inferido destas falhas de mocks.

### P2 resolvido — cabeçalho da tabela PDF italiana sobreposto

A primeira inspecção visual da página 10 do PDF IT/SPC encontrou “Prezzo di vendita attuale” sobreposto a “Qtà”, apesar de passar a verificação de texto dentro dos limites da página. A tradução foi abreviada correctamente para “Prezzo attuale” pela tarefa PDF. Quatro PDFs FR/IT foram regenerados e passaram; o documento italiano foi novamente renderizado e inspeccionado. O intervalo medido entre os dois cabeçalhos é agora de 38,081 pontos, superior ao mínimo de seis pontos. Evidência: `pdf-it-spc-commercial-before.png`, `pdf-it-spc-commercial.png` e `italian-pdf-heading-gap.json`.

### P2 resolvido nos percursos FR/IT — textos fora do dicionário principal

A primeira passagem real encontrou 290 candidatos portugueses únicos em FR e 292 em IT. A maioria estava na ficha técnica, legendas de imagens, filmes, plantas e controlos; a contagem de chaves declaradas no dicionário não os abrangia. Uma passagem EN/ES identificou a mesma lacuna anterior. Foram distribuídos grupos de traduções pela equipa. Esta auditoria implementou o módulo de apresentação, com 88 chaves em cada um dos quatro idiomas de destino e cobertura testada dos 73 resíduos atribuídos.

Depois da integração, a passagem pelos botões reais FR/IT completou 71 cenários: sete secções, sete separadores, seis vistas 3D, 375/1440 px, preferência após recarregar, texto privado e apresentação/retorno. Não houve erros JavaScript, HTTP ou overflow. Os únicos dois candidatos restantes eram italiano correcto: “Pavimento” e “Pavimento e supporto”. Não ficou português indevido detectado nesses percursos. As janelas FR/IT passaram oito cenários. Esta observação não pretende cobrir todos os valores possíveis de todos os controlos ou cada estado de vídeo remoto.

### Gate final — actualizar hashes depois das edições

O `tests.mjs` encontrou o hash antigo de `commercial-terms.js` no import map enquanto outra tarefa o alterava. É necessário executar `npm run prepare:site` após a última edição JavaScript e repetir `npm test`. Não é uma falha comercial de conteúdo.

## Cobertura executada

| Grupo | Resultado e alcance |
|---|---|
| Projectos privados, Node | 33 cenários: validação, anexos, pedidos e exclusão de dados pessoais das ligações |
| Projectos privados, browser | 14/14: upload de planta de três páginas incluindo página branca, fotografia/observações, guardar/recarregar, recuperação, ficheiros inválidos, JSON completo, importações grandes, importação inválida atómica, PDF, partilha, responsive 375/768/950/1440, remoção/recuperação, localStorage bloqueado e concorrência entre separadores |
| Opcionais e pacote standard | 916 verificações de opções, 18 cenários standard, fotografias originais e pedidos separados de preço desconhecido |
| Janelas, browser | 8/8: cancelar sem cobrança, aplicar a vão, abrir/fechar, reload/undo/redo, todos os tipos, pedidos sem local, acção utilizável em ecrãs curtos e PT/EN/ES |
| Geometria geral | 56 configurações suportadas; 17 banhos, 5 792 raios de janela, 490 verificações de detalhe, 732 malhas espelhadas e 32 436 transformações finais |
| Opções no modelo | 98 configurações de janela, 6 132 raios, 3 840 verificações de colisão, nove deslizamentos bloqueados, 39 seguros e 99 966 matrizes finais |
| Fachadas/terraço R28 | 14 configurações base, 28 fachadas compridas, 28 configurações envidraçadas, 224 painéis, 2 016 raios de abertura, 28 movimentos de entrada e 22 264 matrizes recuperadas |
| Expansão | 7 007 poses; teste de expansão com 84 ciclos e teste de implantação com 56 ciclos; limites físicos explicitados nos relatórios |
| Materiais, interiores e redes | Regressões R24/R25/R26/R29/R30/R35/R37 passaram; 78 hashes de amostras de bancada verificados pelo teste R26 |
| Exportação e arquivos | R36 arquivo e R37 exportação passaram; seis PDFs reais PT/EN/ES × vinil/SPC, texto dentro das páginas e conteúdo privado original preservado |
| Vídeos | Regressão de lógica YouTube passou; reprodução remota contínua e verificação audiovisual integral não foram repetidas por esta subauditoria |

PDFs: foi realizada inspecção visual das páginas 7–10 do documento EN/SPC: planta original, página branca conservada, fotos standard e tabela comercial. Essas páginas estavam legíveis, sem cortes ou sobreposições observados. Os seis PDFs tiveram extracção e limites de texto verificados em todas as páginas. A inspecção visual não cobre cada página de cada idioma.

FR/IT recebeu nesta auditoria mais quatro PDFs reais (vinil/SPC, 14 páginas cada) e os percursos de navegador acima descritos. A página comercial italiana corrigida e a francesa foram inspeccionadas visualmente. Qualidade visual global, acessibilidade completa, prova da publicação e verificação do URL público são responsabilidades da integração principal e das tarefas paralelas. Este relatório não as declara concluídas.

## Artefactos reproduzíveis

Todos os ficheiros novos desta subauditoria estão em `audit/r38/artifacts/`, além deste relatório:

- `regression-summary.json` e um `.log` por script: códigos de saída/tempo da ronda de 30 scripts.
- `browser-summary.json`: os três harnesses de navegador e os respectivos códigos de saída.
- `client-project-browser/report.json`: 14 cenários, 18 páginas, erros JS/HTTP e ficheiros descarregados.
- `r24-pdf-regression/verification.json`: seis documentos, idiomas, subtotais e número de páginas.
- `r34-window-browser/`: cenários e capturas da edição de janelas.
- `source-commercial-audit.json`: estados de factos, preços e contagem de janelas nas sete plantas.
- `application-regression-current-harness.mjs` e `.log`: prova isolada da correcção necessária ao harness.
- `r38-information-checks.mjs`: verificações independentes dos requisitos comerciais e da cobertura do JSON de fontes; repetir depois da integração.

A tabela de preços da ficha JSON e o harness mantido foram corrigidos e retestados. Antes de aprovar a revisão integrada, repetir os gates gerais depois da última alteração do cenário e das traduções e verificar a publicação. As verificações amplas da primeira ronda descrevem o código que então foi executado; as alterações posteriores precisam dos respectivos retestes finais.

## Evidência adicional FR/IT e correcções

- `r38-fr-it-sweep/report.json`: 71 cenários com os botões de idioma reais; dois candidatos italianos legítimos revistos.
- `fr-it-engine-sweep/report.json` e `fr-it-residual-unique.json`: estado anterior à correcção, com lista exacta dos resíduos.
- `en-es-engine-sweep/report.json` e `en-es-residual-unique.json`: lacunas anteriores em EN/ES.
- `r38-fr-it-pdf-browser/verification.json`: quatro PDFs FR/IT, texto privado e páginas originais preservados, valores/IVA e limites de página.
- `presentation-translation-check.json`: 88 chaves por idioma, paridade EN/ES/FR/IT e cobertura dos 73 resíduos de apresentação.
- `r38-information-checks.json`: 8/8 requisitos comerciais, fontes, estimativas e privacidade.

A ronda comercial FR/IT com cliques reais passou seis cenários: FAQ e ficha técnica, PDF descarregado pela interface em cada idioma, ficha de fontes efectivamente descarregada e cartões a 375 px. Produziu dois dossiers de oito páginas com todos os prazos/garantias e zero erros JS/HTTP. Evidência: `r38-fr-it-commercial-browser/result.json`.

A ronda final EN/ES com botões reais completou também 71 cenários, sem erros JS/HTTP nem overflow. O detector não encontrou candidatos em EN; os 73 candidatos ES foram revistos um a um e eram espanhol válido (por exemplo Guardar, Abrir, Altura e por confirmar). Não ficou português indevido detectado nesses percursos. Evidência: `en-es-button-sweep/report.json` e `en-es-final-candidates.json`.


### Última correcção visual da planta exportada

A inspecção das páginas 3 dos dossiers efectivamente descarregados pela interface encontrou três legendas PT dentro da imagem raster da planta, que a extracção textual do PDF não detectava. Foram traduzidas em EN/ES/FR/IT pela tarefa de idiomas: espaço comum, entrada/fachada principal e a nota sobre cotas/áreas/cores. A ronda comercial FR/IT voltou a passar 6/6 e ambas as plantas foram novamente renderizadas e inspeccionadas. As três legendas estão agora em francês/italiano e permanecem legíveis. Evidência antes/depois: `fr-client-plan.png`, `it-client-plan.png`, `fr-client-plan-final.png`, `it-client-plan-final.png`.

Estado final desta subauditoria: nenhuma lacuna comercial, de privacidade ou de tradução ficou aberta nos percursos aqui verificados. Permanecem os limites de cobertura declarados e a necessidade dos gates finais da integração principal para cenário/publicação. O servidor local de auditoria continua em `http://127.0.0.1:4398/` para uso da equipa.
