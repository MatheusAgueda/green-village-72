# Auditoria R16 — síntese da evidência

Verificação independente apenas de leitura; não constitui confirmação da publicação.

## Acessibilidade e navegação

Foram agregados 36 relatórios axe-core 4.10.3: seis páginas em seis larguras. Não há violações automáticas confirmadas, erros de execução, avisos/erros de consola ou recursos falhados registados nesses relatórios.

| Página | 375 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---:|---:|---:|---:|---:|---:|
| Configurador | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| O modelo | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| Galeria 4K | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| Plantas | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| Filmes | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| Ficha técnica | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |

Cada célula indica execuções / violações automáticas.

Ficam assinaladas para revisão manual:

- **Contraste** (`color-contrast`): 26 relatórios e 52 alvos distintos. Texto sobre imagens/canvas, rótulos SVG, símbolos e elementos parcialmente sobrepostos impedem o cálculo automático. Inclui controlos 3D, indicadores, botões “Ampliar”, legendas das plantas e alguns controlos do YouTube.
- **Ligação para saltar conteúdo** (`skip-link`): 30 relatórios, nas cinco páginas fora do configurador; confirmar que activar “Ir para o configurador” torna o destino visível e lhe dá foco. O resultado automático é inconclusivo, não uma falha demonstrada.
- **Legendas dos vídeos** (`video-caption`): seis relatórios de Filmes, com oito leitores locais. Os ficheiros locais estão comprovadamente sem faixa sonora; este aviso não demonstra ausência de legendagem de diálogo. A acessibilidade do conteúdo visual e as legendas dos vídeos externos do YouTube exigem apreciação manual separada.

## Desempenho observado

Duas sessões locais registaram LCP de 248 ms e 96 ms, CLS 0 e INP final de 72 ms e 176 ms. São medições do documento/sessão, partilhadas pelas mudanças de página; não são 36 ensaios independentes nem medições de utilizadores reais. As métricas foram recolhidas antes da execução de cada auditoria, com entradas INP dos controlos de auditoria excluídas quando identificáveis. Não demonstram desempenho equivalente em telemóveis físicos ou redes lentas.

## Integridade da versão actual

- 662 verificações independentes passaram: sete plantas, 71 materiais, 32 referências de interiores, oito vídeos de referência (seis locais e dois YouTube com áudio controlável).
- 75 importações relativas resolvidas em 27 módulos; 4909 referências verificadas em 921 ficheiros públicos. Não foram encontrados ficheiros públicos necessários em falta, erros de JSON, caminhos pessoais ou padrões de credenciais nas adições revistas.
- O vídeo “Visita a um módulo em exposição” foi removido dos registos activos e dos ficheiros públicos, incluindo a imagem de apresentação. A ficha técnica tem oito atalhos válidos em cada planta.
- Os 15 MP4 distribuídos mantêm exactamente os hashes dos ficheiros R14 já verificados sem faixa de áudio. Esta confirmação resulta da identidade dos bytes; não foi repetida uma descodificação completa. Os dois vídeos do YouTube têm uma política distinta, com áudio disponível.
- A galeria 4K identifica as imagens como estudo anterior. A ligação R9 identifica o histórico; os snapshots do modelo e da especificação utilizados no filme R9 mantêm os hashes do manifesto original.
- A nota de adaptação da cozinha já é preservada no JSON, resumo e linha comum usada pelo PDF.

## Limites da conclusão

Esta síntese agrega os relatórios existentes e verifica integridade local; não executou um navegador, não alterou o projecto e não publicou o site. Exportações finais, revisão visual do PDF, reprodução de áudio no site publicado e confirmação da publicação pertencem à verificação final do responsável. Zero violações automáticas não equivale a certificação WCAG. A geometria continua a ser uma maquete com hipóteses identificadas, não um projecto de execução.

Dados completos: `/private/tmp/gv72-r16-integrity/final-summary.json`.
