# Green Village — Expandível 72

Portefólio e configurador interactivo em português, inglês e espanhol.

[Abrir o portefólio público](https://matheusagueda.github.io/green-village-72/) · [Ver a casa de banho](https://matheusagueda.github.io/green-village-72/?room=bathroom)

## Executar

```sh
node scripts/serve.mjs 4194
```

Abrir `http://127.0.0.1:4194/`. A aplicação usa módulos JavaScript e precisa de HTTP; abrir `index.html` directamente como ficheiro não é suportado. Não são necessárias contas para visitar o site público.

```sh
npm run build
npm test
npm run test:r24
npm run test:expansion
npm run test:deployment
```

`build` actualiza as versões dos módulos no mapa de importação. O site utiliza os recursos estáticos em `dist/`; a página de entrada na raiz encaminha para essa pasta, preservando a configuração partilhada. O GitHub Pages publica a raiz da branch `main`.

## Funcionalidades

- Sete plantas, materiais do catálogo, adicionais com fotografias e custos conhecidos.
- Cozinha e casa de banho isoladas para exploração dos equipamentos; janelas e portas interactivas.
- Expansão com leitor próprio na página do modelo; circuitos ilustrativos de água e electricidade.
- Vídeos agrupados por exterior, cozinha, casa de banho e terraços.
- Vinílico incluído; SPC com acréscimo de 1 200 €, contabilizado uma vez. A incidência de IVA deste valor aguarda confirmação.
- Histórico, guardar/recuperar, comparação A/B, partilha de configuração, JSON, PDF, PNG e GLB.
- Ficha do cliente com nome, data, pedidos, observações e anexos. O PDF conserva as páginas dos documentos anexados e usa o idioma seleccionado; não traduz texto escrito pelo cliente.

Os dados do cliente e os anexos ficam neste navegador, salvo exportação pelo utilizador. A partilha de configuração exclui dados privados. Não há sincronização automática entre dispositivos nem envio automático de propostas.

## Manutenção e verificação

`dist/specification.js` contém as plantas e medidas; `configuration.js` valida escolhas; `project-options.js` define os adicionais; `model.js` e `interior-detail.js` constroem o modelo; `opening-motion.js` controla os vãos. Traduções da interface e dos documentos estão em `i18n.js` e `pdf-i18n.js`.

Os testes de navegador aceitam `AUDIT_URL`, `PLAYWRIGHT_MODULE` e `CHROME_PATH`. Os testes PDF precisam também de Poppler (`pdftotext`); a verificação de shaders utiliza `glslangValidator`. Os relatórios e capturas de trabalho permanecem fora da aplicação publicada.

Os 72 m², a altura exterior de 2,48 m, o interior de 11,54 × 6,06 × 2,24 m, a casa dobrada (11,80 × 2,20 × 2,48 m, 4 600 kg) e a composição de estrutura, paredes, cobertura, piso e electricidade vêm da ficha e da confirmação de especificação do fabricante. Prazo de entrega, garantia e transporte seguem as condições comerciais da Green Village. Medidas não documentadas, ferragens, percursos de instalações e trajectórias de montagem não constituem projecto de execução. Fotografias do catálogo não são medições de cor nem materiais PBR: a sua resolução limita o realismo. A fotografia do vinílico incluído permanece por confirmar; não é substituída por uma amostra SPC. Os preços sem fonte continuam sob consulta.

Os recursos históricos R9 têm os seus próprios manifestos e cópias de código; não representam a revisão actual do modelo.
