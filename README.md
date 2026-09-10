# Green Village — Expandível 72, revisão R4

Portefólio e configurador existentes revistos em 10/09/2026. Aplicação estática em `dist/`, com identidade Green Village preservada e recursos de execução incluídos localmente. Reutilizar sempre o Site indicado em `.openai/hosting.json`.

## Utilização e verificação

`node scripts/serve.mjs` disponibiliza a pré-visualização em `http://127.0.0.1:4174`. Abrir por `file://` não suporta os módulos. `npm test` executa 22 grupos de regressão. Não existe build obrigatório: o empacotamento usa directamente `dist/`.

## Alterações R4

- Expansão completa com pisos, cobertura, paredes e topos rígidos. Seis etapas seleccionáveis, progresso preservado entre vistas e opções alteráveis durante a reprodução.
- Corrigidos visibilidade herdada, reposição completa, câmara após redimensionamento fora do estúdio, órbita após vista superior, categorias por teclado, captura após perda de WebGL e alinhamento de postes na vista de camadas.
- Parâmetros de folga e articulação em `EXPANSION_RIG`, explicitamente estimados. O estado recolhido não é uma dimensão de transporte do fabricante. Equipamentos, redes, telhado e alpendre são tratados depois da abertura.
- Filme de expansão actualizado: 20 segundos, Full HD, 24 fps. O filme exterior/interior e quatro vídeos originais são preservados.
- `npm run test:expansion` verifica 1 001 poses T2 por defeito; `GV72_AUDIT_LAYOUT`, `GV72_AUDIT_STEPS` e `GV72_AUDIT_DIR` permitem repetir a matriz. A auditoria final analisou 10 001 poses de cada uma das sete plantas, com limiar numérico de 0,1 mm acima dos contactos da montagem final (listados). Não é validação de engenharia.
- Relatório actual: `dist/assets/evidence-r4/audit-report.html`. O histórico R3 permanece disponível.

## Alterações R3 preservadas

- 12 pisos SPC com veio da amostra original, réguas desencontradas e atenuação de iluminação fotografada; 37 paredes com tratamento específico para madeiras, lamelas e alvenarias. 49 mapas na resolução nativa, sem ampliação. 71 originais e IDs preservados.
- Comparador com original, recorte exacto e aplicação em superfície 3D sob luz neutra. Escalas e perfis de apresentação identificados como estimativas.
- Estúdio compacto: cena e categorias visíveis ao escolher no telefone; painel com deslocação própria no computador; expansão dos controlos técnicos não bloqueia a página.
- Reconstrução e mudanças de vista conservam estado/casa anteriores quando há falha. Gravação, importação, recuperação, comparações simultâneas, exportações e repetição de pedidos de textura têm tratamento de erro.
- Camadas separadas ficam acima do plano de apoio; opcionais não tapam a armação; câmara preserva a órbita ao redimensionar. Planta 2D usa cores suavizadas e rótulos legíveis.
- Quatro vídeos originais, identificados por variante, com 16 capítulos de detalhe. Dois novos filmes da maquete em Full HD.

## Módulos e proveniência

`specification.js` centraliza medidas, fontes, sete plantas, vãos, áreas, equipamentos e compatibilidade. `model.js` e `plan-svg.js` usam essa base comum. `configuration.js` mantém a validação e o esquema de persistência compatível com R2.

`material-data.js` preserva o catálogo R2. `photo-plank-data.js`, `photo-wall-data.js`, `photo-planks.js` e `panel-joints.js` descrevem os tratamentos R3. `material-library.js` usa uma única cache limitada e leases por material, incluindo recuperação após falha de carregamento. `stage.js` contém ambiente, iluminação e enquadramento; `app.js` coordena as interacções e exportações.

Relatório actual: `dist/assets/evidence-r3/audit-report.html`. Ledger dos 71 materiais: `dist/assets/catalogue-r3/material-r3-ledger.json`. Inventário dos vídeos: `dist/assets/reference-videos/source-inventory.json`. Evidências históricas R2 mantidas em `dist/assets/evidence/`.

## Documentação e limites

Confirmado no XLSX: rectângulo exterior 11,80 × 6,22 m, bandas 2,01 / 2,20 / 2,01 m e janelas cotadas de 0,92 m. O rectângulo tem 73,396 m²; 72 m² é designação comercial. Área útil certificada, ressaltos exactos do núcleo e cotas interiores completas não constam dos anexos.

Alturas, espessuras, perfis, ligações, interiores, redes, telhado e alpendre incluem hipóteses identificadas. Amostras fotográficas até 480 × 300 px não certificam cores, escala, relevo ou continuidade do produto. Os tratamentos reduzem repetição; não recuperam detalhe inexistente nem substituem mapas medidos.

Os quatro vídeos recebidos têm 576 × 1024 px e mostram variantes diferentes já abertas. Não demonstram a sequência de expansão. A montagem 3D começa com pisos e cobertura abertos, eleva paredes e instala topos; não certifica transporte, articulações ou desdobramento do piso.

## Vídeos produzidos

`presentation-v3.mp4`: exterior/interior T2, 22 s. `expansion-v3.mp4`: montagem parcial, 16 s. Ambos 1920 × 1080, 24 fps, H.264, sem áudio e com faststart. 912 fotogramas capturados e descodificados; início, meio e fim inspeccionados. Fontes e hashes reais constam da evidência. Uma correcção posterior exclusiva do ramo de recuperação de texturas está registada; esse ramo não foi activado nas capturas.

## Âmbito dos testes

Geometria: 48 combinações permitidas, 101 posições amostradas da montagem, portas em 31 ângulos, sete redes eléctricas e 486 subidas hidráulicas. Sem colisões accionáveis no âmbito declarado; amostragem não é prova contínua do mecanismo.

Navegador: sete plantas, 71 materiais em dois ciclos com renderização efectiva, sete vistas, persistência, exportações abertas, teclado, ecrãs 375/768/1440 px, falhas de WebGL e de pedidos, comparações concorrentes e recuperação de estado. Chrome 153 / Apple M4 / ANGLE Metal: 59,94 fps na órbita medida, zero frames em repouso de 1 s. Emulação de ecrã móvel não é teste em todos os telefones físicos.

## Dependências e recuperação

Three.js 0.180.0, respectivos auxiliares e pdf-lib incluídos em `dist/vendor/`, com licenças. Recuperação anterior à R3: `recovery/gv72-before-r3-20260910`. Histórico anterior à R2: `recovery/gv72-before-audit-20260910`. Este checkout é independente do repositório GLS que o contém.


Final publication transport correction: the hosted static MP4 endpoint returns HTTP 200 to Range requests, unlike the local server. The shared video-library now prepares a complete Blob on first playback or chapter selection, retains at most two media objects, validates seek completion, cancels stale requests on navigation and supports native controls for all six videos. Original download links remain unchanged. This changes the player only; captured model geometry and film pixels are unchanged. Swatch thumbnails use the same exact R3 crops as the comparator.
