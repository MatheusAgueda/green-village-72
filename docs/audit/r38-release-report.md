# R38 — Auditoria do portefólio e cinco idiomas

Revisão executada em 05/10/2026 sobre uma cópia limpa do `main` público. O projecto anterior, com alterações locais, não foi utilizado como origem da publicação.

## Alterações verificadas

- Português, inglês, espanhol, francês e italiano nos controlos, páginas, estados de erro, apresentação, plantas SVG e documentos. O motor contém 1 287 mensagens por idioma de destino e modelos dinâmicos. Os nomes, observações e anexos do cliente não são traduzidos nem enviados na ligação de partilha.
- Corrigidas traduções que desapareciam ao separar frases por `·`, o singular de “material”, legendas da planta rasterizada no PDF e o cabeçalho italiano que se sobrepunha à quantidade.
- A ficha JSON contém agora os 27 opcionais actuais e o adicional SPC, com preços em euros e indicação do IVA pendente nos pedidos sem enquadramento confirmado. O multisplit deixou de herdar uma afirmação indevida de IVA de 23%.
- O cenário deixou de repetir quatro fotografias em oito sectores. Usa uma panorâmica contínua, com transição do piso, sombras e reflexos. A mudança entre alçado e perspectiva preserva a distância de recorte; as falhas indicam o recurso que não carregou.
- A apresentação no telemóvel dispõe os seis capítulos em duas linhas, mantendo os nomes legíveis. Os textos sobre fotografias têm fundo com contraste estável.
- Foi acrescentado um cenário fotográfico opcional de Palermo, com fotografia nativa de 8 192 × 4 096 e iluminação HDR. Fonte: [Poly Haven — Palermo Square](https://polyhaven.com/a/palermo_square), Andreas Mischok, CC0. O local é identificado na interface.

## Verificação efectuada

| Âmbito | Evidência |
|---|---|
| Interface em FR/IT e EN/ES | 142 cenários, sem erros JavaScript/HTTP ou conteúdo a sair do ecrã; resíduos revistos para distinguir cognatos de português indevido |
| Cliente e privacidade | 29 verificações FR→IT→PT; mais 14 cenários do dossier existente |
| Valores/fontes | 8 verificações independentes; 916 verificações de opcionais na ronda geral |
| Janelas | 8 cenários FR/IT, além da regressão de 46 mecanismos de abertura |
| PDFs | Quatro documentos FR/IT de 14 páginas, dois dossiers pela interface e seis documentos PT/EN/ES; extracção, preços e limites verificados; páginas representativas inspeccionadas visualmente |
| Motor de tradução | 8 grupos; cobertura das 1 287 mensagens em EN/ES/FR/IT |
| Documentos e ZIP | 9 grupos com quatro PDFs reais; mensagens, README e dados privados preservados |
| Geometria/expansão | 47 grupos gerais; 7 007 poses de expansão e 7 007 poses de montagem nas sete plantas |
| Cenário | Testes de projecção, recursos, descarte, vistas técnicas, mudanças de cenário, cinco idiomas e falhas de carregamento no navegador |
| Exportação | PNG nativo 7 680 × 4 320 descarregado; buffer interactivo e configuração restaurados; 9 grupos da API de exportação |

Os resultados iniciais que detectaram defeitos foram conservados, juntamente com os testes posteriores às correcções. A publicação do código `fa6d98c` foi concluída no GitHub Pages: HTTP 200 e 65 recursos com hashes iguais, incluindo 58 destinos de módulos. A ronda real no endereço público passou os oito grupos de cenário, controlos, idiomas, exportação e recuperação. Recibos: `audit/r38/publication.json` e `audit/r38/public-browser/verification.json`.

## Informação comercial preservada

Vinílico incluído; SPC +1 200 € por casa. Frente em vidro: três módulos, 2 600 € por conjunto. Lateral comprida: seis módulos, 5 190 € por conjunto. Três janelas em cada lateral das sete plantas. Ilha e alterações sem preço confirmado permanecem sob orçamento. Cozinha standard `kitchen-14`, banho standard `bathroom-17`. Entrega de 90 a 180 dias úteis, mais 30 dias no terreno para montagem e acabamentos. Garantias: dez anos de estrutura, cinco do sistema expansível e dois de acabamentos.

## Limites da conclusão

Esta revisão não prova ausência de todos os defeitos futuros. As medições estimadas, composição por confirmar e percurso final das instalações mantêm essa classificação. Os circuitos são ilustrações de projecto; não são desenhos executivos certificados. A inspecção visual dos PDFs abrange páginas representativas, não todas as páginas de todas as combinações.

A aldeia inspirada na região do Porto continua ilustrativa e a sua fotografia base tem 1 774 × 887 píxeis. A fotografia 8K de Palermo é real, mas não documenta um terreno no Porto. A casa é um modelo 3D interactivo; exportar em 8K não transforma amostras pequenas em texturas medidas nem torna a imagem uma fotografia do produto instalado. Uma apresentação exacta num terreno do Porto exige imagens e dados desse local. Não foi prometido realismo de 100%.

Detalhe comercial e fontes: [r38-information-audit.md](r38-information-audit.md). Recibos locais: `audit/r38/`. Testes mantidos: `scripts/r38-*.mjs`.
