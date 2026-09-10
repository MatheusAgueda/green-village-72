# Green Village — Expandível 72, revisão R8

Portefólio comercial interactivo com o logótipo original, sete plantas, catálogo de acabamentos, cozinha e banho, galeria 4K e resumo PDF. Aplicação estática em `dist/`. Reutilizar o Site de `.openai/hosting.json`; este checkout é independente do repositório que o contém.

## Utilização

- `node scripts/serve.mjs` serve o projecto em `http://127.0.0.1:4174`. Os módulos precisam de HTTP, não de abertura directa como ficheiro.
- `npm test` executa os testes permanentes. `npm run test:expansion` compara componentes na posição montada; desde R8, **não verifica uma cinemática de expansão**, que está pendente de documentação.
- Não há compilação obrigatória: a publicação usa a pasta `dist/`.

O cliente pode seleccionar materiais, desfazer/refazer escolhas, guardar/recuperar, comparar A/B, partilhar uma ligação validada e exportar JSON, PDF, PNG 4K ou GLB. A ligação mantém as permissões do Site: não concede acesso a novos visitantes. O contacto do catálogo abre uma mensagem no programa de correio do cliente; não simula nem efectua um envio.

## Correcção das paredes, portas e janelas

A auditoria comprovou que os quatro painéis de topo da animação anterior rodavam de fora para dentro. Inverter apenas o sinal da rotação criava interferências com outros componentes. A pedido do utilizador, não foi inventado outro mecanismo: a área de expansão mostra agora a sequência original de quatro imagens e o 3D na posição aberta. O filme de expansão anterior deixou de integrar o percurso comercial. Os originais e os relatórios históricos permanecem no arquivo.

As folhas interiores mantêm o sentido de abertura das sete plantas. As janelas continuam solidárias às paredes. As duas janelas traseiras acrescentadas indevidamente às variantes T3 B e T4 B foram removidas. A cozinha proposta no T4 A foi recuada 50 mm para melhorar a passagem; a porta e a planta não foram deslocadas.

## Modelo e fontes

- Confirmado no XLSX: 11,80 × 6,22 m exteriores; bandas 2,01 / 2,20 / 2,01 m; largura de janela cotada 0,92 m.
- 72 m² é designação comercial. O rectângulo exterior é 73,396 m². Área útil certificada não fornecida. Áreas interiores calculadas com espessuras assumidas são identificadas como estimativas.
- Altura, espessuras completas, perfis, ferragens, posições sem cotas e implantação da cozinha são estimativas. Não são dados de fabrico.
- A cor interior branca é uma aparência de referência. Não há paleta de tintas interiores aprovada; os selectores livres foram retirados. As importações rejeitam escolhas sem referência; a recuperação local migra antigas cores livres com aviso.
- O terraço de 3 m do catálogo, p.13, e o alpendre da fotografia não são comprovadamente a mesma variante. O modelo fotográfico mantém uma profundidade estimada, sem lhe atribuir o preço do terraço. Valores sob consulta.
- Sem projectos de água, esgotos, electricidade ou fundação do terreno. Percursos, quadro, pontos e furos de serviço antes propostos foram retirados.
- Fotografias de amostras não são medições de cor ou mapas PBR. O modo Original conserva os recortes; escala, rugosidade e repetição são aproximações. Os modos de preparação de emendas estão identificados em separado.

## Exportações

A imagem actual usa um buffer nativo 3840 × 2160, após carregar os materiais. Conserva posição e direcção da câmara, alargando o campo visível necessário para caber em 16:9; não recorta nem amplia uma captura pequena. A resolução interactiva é restaurada mesmo em caso de falha. A galeria identifica a configuração, vista e estado de portas de cada imagem.

O GLB contém a casa estática completa da configuração seleccionada, componentes nomeados, materiais e texturas integradas. Não inclui os controlos da aplicação, cortes, comportamento das portas, mecanismo de expansão, iluminação do estúdio nem o shader das juntas. A geometria parametrizada, os estados e os materiais originais permanecem neste projecto. Exportador oficial Three.js r180: https://github.com/mrdoob/three.js/blob/r180/examples/jsm/exporters/GLTFExporter.js . Licença MIT incluída em `dist/vendor/THREE-LICENSE.txt`.

## Actualizar materiais, opções e contactos

1. Cotas, plantas, vãos, áreas e fontes: `dist/specification.js`. Acrescentar fonte e estado de confirmação a cada medida. Não alterar cotas para fazer coincidir áreas.
2. Referências do catálogo: `dist/data.js`, `dist/material-data.js` e respectivos recursos. Manter IDs estáveis, página de origem, recorte original, unidade e limites. Cozinhas/banhos: `dist/interior-references.js`; a geometria detalhada está em `dist/interior-detail.js`.
3. Opções e validação: `dist/configuration.js`. Atualizar também a migração em `dist/client-tools.js` se mudar o esquema. Restrições de implantação calculadas não provam compatibilidade comercial.
4. Contacto: `CONTACT_EMAIL` em `dist/portfolio.js`, cabeçalho/rodapé quando aplicável. Usar exclusivamente um contacto confirmado para este projecto. Não existe número WhatsApp confirmado.
5. Depois de uma alteração, gerar o catálogo estruturado com `node scripts/export-catalogue.mjs`, correr os testes e verificar no navegador o material, resumo, PDF e exportações. Regenerar imagens da galeria quando a geometria ou os materiais da configuração representada mudarem.

`dist/client-tools.js` contém histórico, ligações e exportações; `dist/model-layers.js` gere camadas e transparência; `dist/walkthrough.js` define navegação com colisões; `dist/stage.js` gere iluminação/câmaras, incluindo planta e quatro fachadas ortográficas. A altura de observação de 1,60 m é uma opção de navegação, não uma cota da casa.

## Entrega e limites de verificação

Catálogo e mapa de fontes: `dist/assets/product-r8/`. Relatório actual: `dist/assets/evidence-r8/audit-report.html`. Testes e provas indicam explicitamente o ambiente e o âmbito executados. Testar tamanhos móveis no computador não certifica todos os dispositivos físicos. Não declarar resolvida a cinemática de expansão até existir informação suficiente sobre o mecanismo real.
