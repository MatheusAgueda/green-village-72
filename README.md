# Green Village — Expandível 72, revisão R2

Portefólio existente revisto em 10/09/2026. `dist/` contém a aplicação estática completa, sem serviços externos de execução. Publicação privada no Site já existente; identidade visual preservada.

## Utilização

`node scripts/serve.mjs` serve a pré-visualização em `http://127.0.0.1:4174`. Abrir por `file://` não suporta os módulos. `npm test` executa os 16 grupos de regressão de geometria, fontes, opções, exportação e recursos entregues.

## Dados e módulos

- `dist/specification.js`: medidas, origem, eixos, sete layouts, vãos, equipamentos, áreas e regras de compatibilidade; gera a base comum de `model.js` e `plan-svg.js`.
- `dist/configuration.js`: estado persistente, validação de entrada, resumo e exportação JSON. Configuração no localStorage deste navegador; exportar JSON para transportar entre dispositivos.
- `dist/material-data.js` e `material-library.js`: 71 IDs, fontes originais, recortes, PBR ilustrativo, UVs em metros, cache limitada e libertação de recursos.
- `dist/stage.js`: motor, ambiente neutro, luz, câmaras e recorte; `app.js`: interacções, persistência, PDF/PNG/SVG/JSON e recuperação gráfica.
- `dist/assets/evidence/audit-report.html`: comparação antes/depois, métodos, resultados, limitações e mapas descarregáveis. `materials.html` permite procurar nas 71 amostras.

## Limites documentais

Confirmado nas plantas: 11,80 × 6,22 m, bandas 2,01 / 2,20 / 2,01 m e janelas cotadas 0,92 m. O rectângulo exterior é 73,396 m²; 72 m² é designação comercial. Área útil certificada, forma exacta dos ressaltos e cotas interiores completas não foram fornecidas.

Divisões interiores, altura, espessuras, perfis, ligações, telhado, alpendre e instalações incluem hipóteses explicitadas. Catálogo genérico, com fotografias de amostras até 480 × 300 px: não certifica cores, escala física, continuidade dos padrões ou compatibilidade específica desta unidade. O pavimento KX7006 ainda mostra variações da iluminação fotográfica quando repetido.

A montagem começa com pisos e cobertura abertos; representa elevação de paredes e instalação de topos. Não representa o estado fechado, transporte ou um mecanismo certificado do fabricante. 101 posições amostradas sem colisões no âmbito descrito no relatório; não é uma prova contínua de todo o movimento.

## Vídeos

`presentation-v2.mp4`: exterior/interior T2, 22 s; `expansion-v2.mp4`: montagem ilustrativa, 16 s. Ambos renderizados do modelo, 1280 × 720, 24 fps, H.264, sem áudio, faststart. 912 fotogramas descodificados e folhas de contacto inspeccionadas. Os hashes publicados estão em `dist/assets/evidence/delivered-media.json`.

## Verificação

Sete plantas e 71 materiais no navegador; 48 combinações geométricas; portas em 31 ângulos; sete redes eléctricas; 486 subidas hidráulicas. PDFs de duas páginas, SVG, PNG e JSON abertos. Gravação/recuperação/reposição, context loss, WebGL desactivado, teclado e viewport móvel testados.

Medição num Apple M4 com Chromium/ANGLE Metal: 60,03 fps durante arrasto de 3,63 s; zero renderizações em 1,5 s de repouso estável. Viewport móvel 390 × 844; não é teste em telemóvel físico. Aviso PMREM de limite de amostragem do ambiente mantido e registado; sem impacto funcional observado.

## Dependências e recuperação

Three.js 0.180.0, OrbitControls, RoomEnvironment, RoundedBoxGeometry, BufferGeometryUtils e pdf-lib estão incluídos em `dist/vendor/`, com licenças MIT. Não há build obrigatório: o teste e o empacotamento validam directamente `dist/`.

A versão anterior está preservada na etiqueta `recovery/gv72-before-audit-20260910`. As alterações desta revisão pertencem apenas ao checkout deste Site.
