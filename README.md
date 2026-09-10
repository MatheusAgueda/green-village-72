# Green Village — Expandível 72

Portefólio estático com visualização Three.js, sete plantas originais, materiais do catálogo de 11/07/2026, fotografias e dois filmes MP4. `dist/` contém o site completo, sem serviços externos de execução.

## Utilização
Servir `dist/` por HTTP; abrir `index.html` por `file://` não suporta os módulos. `python3 -m http.server 4173 --directory dist` inicia a pré-visualização. `npm test` executa as verificações de geometria, opções e recursos.

## Conteúdo e limites
- Plantas extraídas sem alterar os PNG incorporados no XLSX.
- Dimensões exteriores lidas: 11,80 × 6,22 m; 72 m² é designação comercial, área útil não documentada.
- Altura ilustrativa 2,55 m. Divisões reconstruídas por proporções observadas nos desenhos.
- Cozinhas, redes, sequência de expansão e coberturas são propostas/simulações, não projectos de execução.
- Cores renderizadas são aproximações das fotografias do catálogo; referências originais acessíveis.
- Filmes: apresentação das fotografias 22s, expansão 3D 16s; H.264, 720p, 24fps.

## Dependências
Three.js 0.180.0 e OrbitControls incluídos em `dist/vendor/`, licença MIT distribuída.
