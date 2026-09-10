# Auditoria independente do browser — Green Village 72, revisão 2

10/09/2026. Testes locais em Chrome instalado, headless, GPU real Apple M4 através de ANGLE Metal. Desktop 1440×1000 e viewport móvel 390×844, ambos com escala de pixels 1. Não foi usado telemóvel físico. Nenhum ficheiro do Site foi alterado por esta auditoria.

**Resultado funcional: aprovado após reverificação das duas correcções dos controlos.** Materiais, plantas, navegação, recuperação, exportações e filmes responderam aos casos executados. O relatório público e todos os 15 links únicos das evidências responderam 200 na verificação final. Não houve teste nem publicação em produção.

## Problemas encontrados e estado final

| Problema | Evidência | Estado |
|---|---|---|
| Servidor Python 4173 interrompia pedidos dos módulos JS, deixando spinner e zero canvas | `initial-probe.json`, `initial-probe.png` | Resolvido ao testar o servidor Node concorrente 4174; sem repetição de CONNECTION_RESET |
| Repor alterava o modelo mas deixava checkboxes e corte com valores anteriores | `flows.json`, captura `failure-reset-synchronises-visible-controls.png` | Corrigido e revalidado: os cinco valores DOM/modelo coincidem em `fixes-perf.json` |
| Primeiro movimento de Explodido, fora de Camadas, mudava o cursor para 1 apesar do valor escolhido .5 | `flows.json` | Corrigido e revalidado: modelo=.5, input=.5 |
| Vista superior inicialmente tinha texto sobre a geometria | `desktop-top-viewport.png` | Corrigido na captura `desktop-top-final-viewport.png`: vertical, íntegra e sem sobreposição |
| Ausência temporária dos quatro ficheiros finais de vídeo/poster | Logs iniciais | Resolvida: ambos os filmes reproduzidos, pesquisados temporalmente e descarregados |
| PMREM avisa que sigma .08 pede 39 amostras, acima de 20 | Logs `quick.json`, `final-media.json` | Aviso de renderização sem falha funcional; não equivale a erro JS |
| Links do relatório público e do resumo JSON | `report-links.json`, `closing.json` | Resolvido: os dois HTML e todos os 15 links únicos responderam 200; nenhuma ligação pendente |

O teste inicial de rejeição de cozinha marcou FAIL porque o Playwright respeita `aria-disabled` e recusou clicar. Era uma falha do teste, não da aplicação. A reverificação accionou as quatro variantes disponíveis por cliques e confirmou a rejeição de Ilha na T4 A através da API validada, preservando a configuração anterior.

## Cobertura executada

| Área | Verificação concreta | Resultado |
|---|---|---|
| Arranque | `__GV` disponível, canvas e loading oculto, desktop e viewport móvel | PASS |
| Materiais | 71 IDs aplicados no browser pelo mesmo `configure` validado; carregamento concluído, zero falhas | 71/71 |
| Cache | Três ciclos adicionais dos 12 pavimentos; cache ≤18, sem crescimento de geometrias/texturas entre ciclos equivalentes | PASS |
| Comparador | Cliques reais; original, recorte e canvas; piso KX8006 e cor aproximada Branco Glacial | PASS |
| Comparador repetido | 20 aberturas/fechos, repetidos na versão final com libertação de contexto; canvas principal preservado, sem crescimento de texturas | PASS |
| Plantas | Sete selecções por botões, captura da vista superior de cada uma; mesma planta indicada no estado | 7/7 |
| Vistas | Exterior, Interior, Estrutura, Camadas, Água, Electricidade, Expansão, através da interface | 7/7 |
| Câmaras | Fachada, esquerda, direita, Planta, Interior e Perspectiva pelo selector | 6/6 |
| Cozinha | Sem cozinha, Linear, L, Ilha; rejeição compatível da T4 A | PASS |
| Banho e opções | Espelhado, referência de banho 17, cozinha 15, telhado, alpendre, iluminação exterior | PASS |
| Visibilidade | Portas, fachadas, mobiliário, corte .65 m, explodido .5; reposição sincronizada | PASS após correcção |
| Animação | Reproduzir, pausar, reiniciar; alteração de configuração durante reprodução pára a animação e preserva estado coerente | PASS |
| Persistência | Gravação automática, reload, Guardar/Recuperar, Repor preservando cópia manual | PASS |
| JSON | Download e importação válida pela selecção real de ficheiro; rejeição de JSON corrupto, campo em falta, opção inválida e ficheiro >100 KB | PASS |
| Recuperação adversa | Gravação automática corrupta regressa aos valores iniciais com mensagem; cópia manual corrupta ou ausente não altera a configuração | PASS |
| Exportações | Downloads PDF, PNG, SVG e JSON; PNG/SVG abertos no browser; PDF reaberto, extraído e duas páginas renderizadas e inspeccionadas | PASS |
| Teclado | Setas rodam; + aproxima; End navega os separadores; Enter abre resumo; Escape fecha e devolve foco ao botão | PASS |
| Móvel | Piso, T4 A, portas, expansão, guardar/recarregar, resumo e Escape a 390×844; sem overflow horizontal global | PASS no viewport |
| WebGL ausente | `--disable-webgl`: contextos indisponíveis, fallback correcto; plantas, resumo, comparador de recortes e PDF continuam acessíveis | PASS |
| Contexto perdido | `WEBGL_lose_context` real: mensagem, estado preservado, resumo utilizável; `restoreContext` recarrega e recupera 3D/configuração | PASS |
| Filmes | Reprodução, procura em 0/meio/fim, download integral e resposta HTTP Range 206 | 2/2 |

## Desempenho observado

Dados medidos no browser através do contador de renders de `__GV`, `renderer.info` e intervalos RAF; nenhuma estimativa inferida apenas do código. Amostras curtas nesta máquina, com outros trabalhos locais em curso, não benchmarks universais.

- **Rotação real por arrasto:** 72 movimentos de ponteiro com botão premido; 218 renders em 3,632 s = **60,03 fps**, intervalo RAF mediano 16,7 ms, P95 16,8 ms. Após largar o rato, a inércia terminou; foram observados dois frames residuais na janela posterior.
- **Animação:** 180 renders em 3,002 s = **59,97 fps**.
- **Parado em vistas fixas:** **0 renders em 1,5 s**, repetido em Exterior/Interior/Estrutura nos dois viewports. O baseline renderizava continuamente cerca de 60 fps.
- **T2, enquadramento equivalente:** exterior 295 draw calls / 108 136 triângulos; interior 277 / 104 752; estrutura 4 / 7058. Estas contagens incluem as chamadas registadas pelo renderer na cena efectivamente apresentada.
- **Cache:** limite observado de 18 texturas da biblioteca; as contagens da GPU incluem ainda ambiente, sombras e outros recursos do renderer.

## Exportações e filmes

`configuration.pdf` contém duas páginas: resumo T3 B/Terracota/KX8006 com imagem, seguido da planta e cotas 6220/11800. Ambas foram abertas e inspeccionadas (`pdf-page-1.png`, `pdf-page-2.png`); sem sobreposição ou corte impeditivo. `fallback-configuration.pdf` foi também gerado sem WebGL.

| Filme | Codec | Dimensões | Taxa confirmada no MP4 | Frames | Duração | Download |
|---|---|---|---:|---:|---:|---:|
| Exterior e interior | AVC (`avc1`) | 1280×720 | 24 fps | 528 | 22 s | 3 302 851 bytes |
| Montagem da envolvente | AVC (`avc1`) | 1280×720 | 24 fps | 384 | 16 s | 1 976 509 bytes |

As taxas foram lidas dos tempos das amostras nos próprios MP4 (`mp4-metadata.json`), concordando com a duração apresentada pelo browser. Procura validada em 0/11/21,88 s e 0/8/15,88 s. Respostas Range: 206 com os 1024 bytes pedidos. Os `ERR_ABORTED` nos pedidos de vídeo correspondem a preloads e procura temporal cancelados; ambos os elementos reproduziram sem erro. Os hashes dos downloads estão em `final-media.json`.

## Limitações visuais preservadas

- O pavimento mantém iluminação e repetição visíveis na amostra fotográfica. Não foi validado como textura física contínua, PBR medido, nem correspondência RAL/NCS. O comparador KX8006 mostrou aproximação visual fiel ao recorte, dentro desta limitação.
- As proporções e funcionalidades ficaram mais legíveis que no baseline; esta auditoria não certifica medidas interiores, fabrico, redes ou articulações.
- Em móvel, os controlos de personalização continuam abaixo da vista 3D: é necessário deslocar a página entre a escolha e o resultado. A interacção funciona, mas a comparação imediata é menos cómoda.

## Evidências e reprodução

- `quick.mjs` / `quick.json`: seis vistas antes/depois e contagem de frames parados.
- `flows.mjs` / `flows.json`: materiais, plantas, controlos, persistência e exportações; contém as falhas históricas, resolvidas em `fixes-perf.json`.
- `fixes-perf.mjs` / `fixes-perf.json`: reverificação das correcções e rotação real.
- `robust-mobile.mjs` / `robust-mobile.json`: WebGL, perda/restauro e controlos móveis.
- `remaining.mjs` / `remaining.json`: câmaras, banho, cobertura, referências e repetição do comparador.
- `final-media.mjs` / `final-media.json`: filmes finais, downloads, links e comparador após libertação de contexto.
- Capturas equivalentes: `desktop-{exterior,interior,structure}-comparison.png`, `mobile-{exterior,interior,structure}-comparison.png`, com variantes `-viewport.png`.
- Comparação usa a posição/alvo/FOV do baseline pelo hook `compareCamera`; DPR1 e os mesmos tamanhos de janela. A altura ocupada pelos controlos da interface mudou. `desktop-top-final-viewport.png` representa a correcção final do enquadramento superior.


## Fecho da verificação de evidências

`audit-report.html` respondeu 200 e carregou 7/7 imagens; `materials.html` respondeu 200 e carregou 142/142 imagens. As duas páginas foram renderizadas e inspeccionadas. Os 15 links internos únicos responderam 200, incluindo `browser-final.json` (reverificado em `closing.json`). A pesquisa KX8006 mostrou exactamente um material; limpar a pesquisa repôs os 71. O relatório a 390×844 não apresentou overflow horizontal. `desktop-top-verified-final.png` confirma a vista superior final limpa. Não existem ligações pendentes na verificação final.
