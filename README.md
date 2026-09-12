# Green Village — Expandível 72, revisão R9

Portefólio comercial interactivo com o logótipo original, sete plantas, catálogo de acabamentos, cozinha e banho, galeria 4K e resumo PDF. Aplicação estática em `dist/`. Reutilizar o Site de `.openai/hosting.json`; este checkout é independente do repositório que o contém.

## Utilização

- `node scripts/serve.mjs` serve o projecto em `http://127.0.0.1:4174`. Os módulos precisam de HTTP, não de abertura directa como ficheiro.
- `npm test` executa os testes permanentes. `npm run test:expansion` verifica a fase de elevação das paredes nas sete plantas, em 7 007 posições, por SAT, vínculos das janelas, monotonia e retorno à posição final. A sequência completa de montagem não está documentada.
- Não há compilação obrigatória: a publicação usa a pasta `dist/`.

O cliente pode seleccionar materiais, desfazer/refazer escolhas, guardar/recuperar, comparar A/B, partilhar uma ligação validada e exportar JSON, PDF, PNG 4K ou GLB. A ligação mantém as permissões do Site: não concede acesso a novos visitantes. O contacto do catálogo abre uma mensagem no programa de correio do cliente; não simula nem efectua um envio.

## Correcção das paredes, portas e janelas

A expansão R9 anima a elevação das paredes longitudinais observada nos quadros 2–3 da imagem fornecida, sempre de dentro para fora, com as janelas solidárias. Reproduzir, pausar, retomar, reiniciar e cursor manual partilham a mesma geometria. Eixo longitudinal a ±2,99 m/altura 0 e folga de cobertura de 8 mm são estimativas visíveis na ficha, não cotas do fabricante. Pisos e estrutura estão abertos. Os painéis de topo e o interior são omitidos durante a demonstração; a casa completa é uma vista separada. Não se restaura a rotação incorrecta dos topos das revisões R3/R4. O recolhimento desses painéis continua dependente de documentação ou confirmação do utilizador.

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
5. Inventário técnico R9: `dist/technical-data.js`, `dist/technical-sheet.js` e `assets/product-r9/`. Manter os 22 opcionais, 107 factos e classificações em concordância com os originais. O gerador antigo `scripts/export-catalogue.mjs` escreve o arquivo R8; não o usar para substituir os dados R9. Depois de uma alteração, correr os testes e verificar no navegador o material, resumo, PDF e exportações. Regenerar imagens da galeria quando a geometria ou os materiais da configuração representada mudarem.

`dist/client-tools.js` contém histórico, ligações e exportações; `dist/model-layers.js` gere camadas e transparência; `dist/walkthrough.js` define navegação com colisões; `dist/stage.js` gere iluminação/câmaras, incluindo planta e quatro fachadas ortográficas. A altura de observação de 1,60 m é uma opção de navegação, não uma cota da casa.

## Entrega e limites de verificação

Catálogo e mapa de fontes: `dist/assets/product-r9/`. Relatório actual: `dist/assets/evidence-r9/audit-report.html`. Testes e provas indicam explicitamente o ambiente e o âmbito executados. Testar tamanhos móveis no computador não certifica todos os dispositivos físicos. Não declarar resolvida a cinemática de expansão até existir informação suficiente sobre o mecanismo real.

## Ficha e vídeos R9

A ficha actualiza planta, vãos e áreas da configuração. As 25 medidas não repetem a profundidade do alpendre; 1,95 m assumidos não substituem os 3 m da opção genérica. São apresentados 22 opcionais, com 21 preços publicados no catálogo de 11/07/2026 e um sem preço; não são somados como orçamento. STANDARD/PREMIUM/DELUXE são designações do catálogo, sem provar inclusão. As 12 cores exteriores são explicitamente incluídas na fonte; SPC e UV não têm inclusão declarada. “Broken bridge 55” não é convertido em 55 mm; “banho 3 m” não é convertido em área. Janela opcional 930 × 930 mm não substitui a cota de 920 mm da planta.

Os quatro MP4 originais mantêm bytes, duração, resolução 576 × 1024 e capítulos. Os nomes 74 m² e 20ft/37 m²/40ft não provam correspondência ou variante: conflitos identificados no próprio ficheiro. O leitor carrega o ficheiro completo antes da reprodução para contornar servidores que ignoram pedidos Range; cache limitada a dois vídeos. Leitores móveis usam largura completa. Os atalhos da ficha levam o foco e a vista ao vídeo seleccionado.

Filme R9: `dist/assets/expansion-r9/wall-raising.mp4`, 14 s / 1920 × 1080 / 25 fps, 350 fotogramas renderizados do mesmo modelo. A cobertura é translúcida a 9% para leitura dos painéis, declarada na imagem. O manifesto preserva configuração, hashes de origem, verificação de descodificação e limites. O vídeo não representa duração real de montagem.

## Processo de expansão R10
A sequência segue os quatro estados confirmados pelo cliente. Etapa1: referência original; etapas2–3: painéis e janelas em 3D; etapa4: casa montada. Transições1–2 e3–4 discretas, sem dobradiças inventadas. A exportação3D é bloqueada na referência2D. Relatório completo: `dist/assets/evidence-r10/audit-report.html`. A animação real do modelo R9 foi preservada; o controlador `dist/expansion-process.js` organiza a apresentação. Ver MEMORY/HANDOFF para provas e limites geométricos.
