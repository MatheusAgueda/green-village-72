Auditoria independente de materiais e anexos — Green Village 72

O pacote contém 71 registos estáveis, 71 originais extraídos directamente do PDF e 71 recortes PNG sem alteração dos píxeis. O Site não foi modificado. A validação digital passou: cada recorte é exactamente igual à região documentada do respectivo original.

O PDF é um catálogo genérico de opcionais de casas expansíveis de dupla asa. A página 19 identifica a colecção 10–40 FT e edições especiais de 184 m². Não publica planta, dimensões gerais, compatibilidade dos acabamentos ou especificação comercial própria de um modelo de 72 m². A imagem de capa não demonstra a aparência desse modelo.

| Grupo | Entradas | Identificação na origem | Aplicação conservadora |
|---|---:|---|---|
| Texturas exteriores 3D, p. 7 | 12 | Nomes impressos; sem código técnico | Parede exterior |
| Painéis GM, p. 8 | 15 | GM-16 a GM-30 impressos | Parede exterior |
| Acabamentos exteriores, p. 9 | 12 | Nomes impressos; sem código técnico | Parede exterior |
| Cores incluídas, p. 10 | 12 | Nomes impressos; sem código técnico | Parede exterior |
| SPC, p. 14 | 12 | Referências KX impressas | Pavimento interior |
| Placas UV, p. 17 | 8 | «Amostra 1–8» são identificadores editoriais | Parede da casa de banho |

Há 27 códigos publicados no total. GM/KX são códigos do catálogo; a identidade do fabricante não foi verificada. Nenhum valor RAL ou NCS é publicado. «Outras cores e tons RAL sob consulta», na página 10, não fornece códigos específicos. Os nomes Madeira Mel e Grafite aparecem em mais de um grupo com imagens diferentes e devem conservar IDs separados.

Os 71 originais embebidos têm apenas 480 × 300 píxeis. Não existe uma versão maior destas amostras dentro do PDF. A extracção existente tinha recomprimido as imagens: os novos originais conservam o fluxo extraído do PDF e o SHA-256 está registado. Estes ficheiros servem para escolher acabamentos e para uma aproximação 3D à distância; não sustentam certificação de cor, acabamento ou detalhe em grande plano.

Correcções preparadas:

- GM-18, GM-19, GM-20, GM-21, GM-24 e GM-30: os mapas actuais incluem fragmentos do código impresso. Todos os GM passam a usar uma região superior que exclui as letras.
- Onze texturas de alvenaria: recortes contíguos procuram bordas mais compatíveis. O erro RGB médio entre bordas opostas desce de 33,864 para 10,819, uma redução de 68,05%. Mantêm-se irregularidades, perspectiva e repetição da pequena amostra; não são texturas sem emendas certificadas.
- SPC: os novos recortes conservam mais área útil e excluem o código e o furo visível de suspensão. Não representam uma régua completa nem fornecem medidas comerciais.
- Cinza Metálico, Prata, Cinza Pérola e Cinza Quente: as fotografias incluem bordas de bobina/chapa ou partes do ambiente. Os recortes isolam a região útil; o manifesto recomenda apenas a cor média aproximada na superfície 3D.
- Grafite, Branco Glacial, Bege Marfim e Vermelho Borgonha do grupo standard: a fotografia tem iluminação/reflexos impróprios para repetição. O manifesto também recomenda cor aproximada. Os recortes e os originais continuam disponíveis como referência.
- Madeira Castanho e Madeira Cerejeira: recortes evitam os principais reflexos brancos sem corrigir a cor nem inventar veios.

Comparação mensurável: DeltaE76 mediano entre a média digital do mapa actual e do preparado = 0,337; média = 0,690. Entre os 63 mapas recomendados para aplicação, o máximo é 3,300 (Madeira Castanho, após excluir o reflexo). O maior desvio geral, 7,959, é Cinza Quente: a região nova retira a parede inacabada que contaminava a média. Os PNG preparados têm erro máximo por canal de 0 relativamente ao recorte exacto da origem. As métricas assumem sRGB/D65 e comparam imagens digitais; não são medições de cor do produto físico.

As repetições físicas propostas no manifesto são estimativas visuais de baixa confiança, expressamente identificadas como não provenientes do fabricante. O recorte reduz proporcionalmente a dimensão estimada da área fotografada, mantendo o tamanho aparente do veio e a proporção dos píxeis. Devem usar-se coordenadas UV contínuas em metros; a repetição fixa [2,2] em cada pequeno segmento da parede altera a escala do desenho junto às aberturas. A repetição fixa [3,8] no pavimento também depende da dimensão de cada peça. As superfícies adjacentes devem partilhar orientação e origem de UV.

A repetição espelhada indicada para alguns mapas é uma técnica de visualização que cria simetria do desenho, não um assentamento certificado. As folhas de contacto de repetição normal mostram deliberadamente os limites dos recortes. Para as chapas UV, não interpretar veios claros/escuros como relevo. Não foram inventados mapas normal, bump ou roughness: a luminosidade da fotografia mistura impressão, sombras e reflexos. Os valores escalares de roughness propostos são pressupostos de renderização, não propriedades declaradas.

A cor do mapa deve ser interpretada em sRGB e aplicada com multiplicador branco. Não multiplicar novamente pelo hex médio: isso escurece e altera o acabamento. A correspondência com a amostra deve ser avaliada com iluminação neutra, exposição fixa e sem dominante verde/amarela do ambiente. A validação de shader e de iluminação pertence à integração do modelo.

As 15 fotografias de cozinhas (p. 16) e 17 fotografias de casas de banho (pp. 17–18) são referências de ambientes. Os seus nomes numerados são editoriais e não fornecem códigos, medidas, layouts executáveis ou correspondência nominal às oito placas UV. A média da fotografia de uma cozinha mistura paredes, janelas, pavimento, luz e mobiliário: não deve colorir automaticamente os armários. Remover esse comportamento presente em model.js:15 e app.js:33; manter a fotografia seleccionada como referência.

Quanto a preços, apenas as 12 cores da página 10 têm inclusão expressa sem custo adicional. As 39 amostras das páginas 7–9 seguem o adicional exterior 3D; o PDF não define preço individual ou regras de combinação. SPC e UV não têm preço individual publicado. Não substituir «preço não publicado» por zero nem transformar o selo STANDARD em inclusão comercial.

Ficheiros de entrega:

- material-ledger.json: origem, códigos, uso, crop, hashes, cor, resolução, limitações e estimativas para cada um dos 71 materiais.
- integration-manifest.json: mapeamento por ID para integração; 63 texturas aplicáveis e oito modos sampled-colour. O assetRoot proposto é assets/catalogue-v2.
- colour-comparison.json: estatísticas por imagem, DeltaE76 e erro entre bordas.
- annex-reference-ledger.json: 32 referências de ambientes com dimensões nativas e uso permitido pela evidência.
- originals/: 71 originais extraídos, preservados.
- textures/: 71 PNG de recortes contíguos sem geração, clonagem, recoloração ou aumento de resolução.
- contact-sheets/: comparações com fundo neutro e testes de repetição.
- validation.json: verificações executadas e limites da conclusão.

Pronto para integrar com fidelidade à fonte e limitações explícitas. A escala e o desempenho fotográfico final exigem revisão do modelo renderizado.
