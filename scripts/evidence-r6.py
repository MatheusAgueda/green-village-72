from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = Path(os.environ.get('GV72_R6_AUDIT_DIR', '/private/tmp/gv72-r6'))
OUT = ROOT / 'dist/assets/evidence-r6'
OUT.mkdir(parents=True, exist_ok=True)


def sanitise(value: str) -> str:
    value = value.replace(str(ROOT / 'dist') + '/', '').replace(str(ROOT) + '/', '')
    value = value.replace(str(AUDIT) + '/', 'audit-workspace/')
    value = re.sub(r'/Users/[^"\n]+/Downloads/', 'sources/', value)
    value = re.sub(r'/private/tmp/gv72[^/"\n]*/', 'audit-workspace/', value)
    value = value.replace('http://127.0.0.1:4174', 'local-preview')
    return value


PHASE = 'pass4' if (AUDIT / 'root-audit/pass4-walkthrough.json').exists() else 'pass3'
proofs = {
    'door-geometry/final-report.json': 'doors-summary.json',
    'door-geometry/final-door-matrix.json': 'door-matrix.json',
    'door-geometry/source-ledger.json': 'source-ledger.json',
    'door-geometry/integrated-audit.json': 'doors-sweep.json',
    'door-geometry/integrated-bath-services.json': 'bath-services.json',
    'door-geometry/door-pair-continuous.json': 'door-pairs.json',
    'door-geometry/basin-floor-passages.json': 'floor-passages.json',
    'fittings/browser-smoke/summary.json': 'catalogue-coverage-summary.json',
    'fittings/browser-smoke/coverage.json': 'catalogue-coverage.json',
    'fittings/final-actual-sat-summary.json': 'furniture-sweep-summary.json',
    'fittings/final-actual-sat.json': 'furniture-sweep.json',
    'fittings/final-actual-independent-pair-summary.json': 'furniture-pairs.json',
    'fittings/final-actual-dimensions.json': 'furniture-clearances.json',
    'fittings/final-actual-picking-fixed.json': 'furniture-picking.json',
    'fittings/final-geometry-unchanged.json': 'furniture-provenance.json',
    'app-audit/final-code-review.json': 'code-review.json',
    'app-audit/construction-failure-fixed.json': 'construction-recovery.json',
    'app-audit/picking-validation.json': 'picking-validation.json',
    'app-audit/app-audit-final.json': 'app-regressions.json',
    'app-audit/comparator-fixed.json': 'comparison-recovery.json',
    'app-audit/fittings/fittings-summary.json': 'furniture-interaction.json',
    f'root-audit/{PHASE}-walkthrough.json': 'walkthrough.json',
    'root-audit/door-top-proof.json': 'door-visual-proof.json',
}
for source, target in proofs.items():
    (OUT / target).write_text(sanitise((AUDIT / source).read_text()), encoding='utf-8')

for source, target in {
    'door-top-closed.png': 'doors-closed.png',
    'door-top-open.png': 'doors-open.png',
    'pass3-kitchen-open.png': 'kitchen-open.png',
    'pass3-bath-open.png': 'bath-open.png',
    'pass3-responsive-375.png': 'mobile.png',
    'pass3-configuration.pdf': 'configuration-example.pdf',
    'pass3-configuration.json': 'configuration-example.json',
    'pass3-plan.svg': 'plan-example.svg',
}.items():
    shutil.copyfile(AUDIT / 'root-audit' / source, OUT / target)

shutil.copyfile(Path(tempfile.gettempdir()) / 'gv72-expansion-audit/actual-dense-t2.json', OUT / 'expansion.json')
hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT / 'dist').iterdir()
          if p.suffix in {'.js', '.css', '.html'}}
(OUT / 'source-hashes.json').write_text(json.dumps(hashes, indent=2) + '\n')

html = '''<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portas e auditoria R6 | Green Village</title><link rel="icon" href="../favicon.svg">
<style>*{box-sizing:border-box}body{margin:0;background:#f5f6f1;color:#213e32;font:16px/1.65 system-ui}main{max-width:1120px;margin:auto;padding:40px 24px}a{color:#285940;text-underline-offset:3px}a:focus-visible,summary:focus-visible,.table-scroll:focus-visible{outline:3px solid #80621d;outline-offset:3px}h1{font-size:clamp(36px,6vw,64px);font-weight:500;letter-spacing:-2px;line-height:1.05}h2{font-size:27px;font-weight:500;margin:40px 0 14px}header p{max-width:820px}.eyebrow{font-size:12px;letter-spacing:2px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure,.card{margin:0;padding:16px;background:white;border:1px solid #dce2d7;border-radius:6px}img{display:block;width:100%;height:auto}figcaption,.fine{font-size:13px;color:#526447}figcaption{margin-top:12px}.links{display:flex;flex-wrap:wrap;gap:12px 24px;margin:18px 0}.table-scroll{overflow:auto}table{border-collapse:collapse;width:100%;background:white;min-width:660px}th,td{text-align:left;padding:14px;vertical-align:top;border-bottom:1px solid #dce2d7}th{font-size:13px}td{font-size:14px}summary{cursor:pointer;font-weight:600}details{background:white;padding:16px;border:1px solid #dce2d7;margin:12px 0}.status{display:inline-block;padding:5px 12px;background:#e1ebdc;border-radius:4px}li{margin:8px 0}@media(max-width:700px){main{padding:28px 16px}.grid{grid-template-columns:1fr}h1{letter-spacing:-1px}.links a{padding:6px 0}}</style></head>
<body><main><header><a href="../../index.html">← Voltar ao estúdio</a><p class="eyebrow">GREEN VILLAGE / REVISÃO 6 / 10.09.2026</p><h1>Portas que respeitam<br>o seu espaço.</h1><p>O sentido de abertura foi conferido nas sete plantas originais. A planta e o 3D partilham agora a mesma dobradiça, folha e trajectória. A revisão também corrigiu os armários, os cliques, o carregamento e a navegação.</p><p class="status">Correcções verificadas no âmbito descrito abaixo</p></header>
<h2>Abrir e fechar a mesma casa</h2><div class="grid"><figure><img src="doors-closed.png" alt="Planta T2 em 3D, vista de cima com portas fechadas"><figcaption>T2 · folhas fechadas e alinhadas com os vãos.</figcaption></figure><figure><img src="doors-open.png" alt="A mesma planta T2 com portas abertas para os respectivos compartimentos"><figcaption>T2 · quartos e banho abrem para dentro; a alternativa espelhada reflecte também a porta.</figcaption></figure></div>
<p>Foram corrigidas 18 divergências de dobradiça ou sentido nas 24 portas das distribuições padrão. As seis portas que já estavam correctas foram mantidas. O lavatório passou para o lado indicado na planta e as ligações acompanham essa posição.</p>
<h2>Problema, correcção e verificação</h2><div class="table-scroll" tabindex="0" role="region" aria-label="Problemas e verificações, tabela deslocável"><table><thead><tr><th>Problema observado</th><th>Correcção implementada</th><th>Verificação</th></tr></thead><tbody>
<tr><td>Portas abriam para o lado errado ou tocavam nas guarnições.</td><td>Pivô por porta, plano de folha recuado, folgas nas extremidades e dois puxadores.</td><td>56 configurações e 31 494 poses, com fecho sem deriva; SVG e 3D coincidentes.</td></tr>
<tr><td>A abertura do banho interferia com a posição do lavatório e um puxador tocava na parede.</td><td>Lavatório, vão e serviços coordenados; alternativa espelhada coerente; folga do puxador corrigida.</td><td>17 referências × 2 distribuições, 6154 poses; 546 passagens verificadas no piso.</td></tr>
<tr><td>Portas dos móveis rodavam pelo lado errado, cruzavam cantos ou ficavam embutidas no corpo.</td><td>Dobradiças nos montantes, painéis cegos nos cantos, corpo separado da frente e prateleiras retiradas dos gaveteiros.</td><td>76 configurações × 22 posições; 32 configurações com aberturas independentes; folga mínima medida de 2,5 mm no modelo.</td></tr>
<tr><td>Mudar o piso fechava uma porta aberta individualmente.</td><td>Estado de cada peça preservado entre reconstruções; abrir/fechar por divisão e estado misto coerentes.</td><td>Clique → material → exterior → detalhe, guardar/recuperar e reposição.</td></tr>
<tr><td>Clques atravessavam móveis opacos ou activavam peças ocultas.</td><td>A primeira superfície visível bloqueia o clique; arrastes e controlos sobrepostos não accionam frentes.</td><td>Raios pelas costas e pela frente, grupos ocultos e interacção real no navegador.</td></tr>
<tr><td>Folhas abertas saíam do enquadramento ou eram cortadas na vista de detalhe.</td><td>Enquadramento inclui os elementos abertos; materiais do equipamento preservados na aproximação.</td><td>15 cozinhas lineares com equipamentos abertos, sem vértices cortados.</td></tr>
<tr><td>Texturas abandonadas bloqueavam a exportação; uma falha noutro material impedia a comparação.</td><td>Espera limitada às texturas necessárias; comparação isolada; libertação em construção parcial falhada.</td><td>Falhas e atrasos injectados, nova tentativa, abandono e limpeza dos recursos.</td></tr>
<tr><td>Escolhas falhavam sem 3D; foco de teclado perdia-se; alguns textos tinham baixo contraste.</td><td>Escolhas disponíveis sem WebGL, foco restaurado, atalhos e títulos dos diálogos corrigidos, contraste aumentado.</td><td>Cinco áreas, três diálogos, teclado, seis larguras de ecrã e verificação automática de acessibilidade.</td></tr>
</tbody></table></div>
<h2>Os detalhes continuam interactivos</h2><div class="grid"><figure><img src="kitchen-open.png" alt="Cozinha de referência 02 com frentes abertas"><figcaption>Cozinha 02 · frente, bancada e abertura dos módulos.</figcaption></figure><figure><img src="bath-open.png" alt="Casa de banho espelhada com o móvel do lavatório aberto"><figcaption>Banho 16 · distribuição espelhada, frentes exteriores e resguardo.</figcaption></figure></div>
<h2>Âmbito da auditoria</h2><ul><li><strong>174 verificações do catálogo no navegador</strong>: 71 amostras nos dois modos, 15 cozinhas e 17 ambientes de banho. Escolhas validadas, material aplicado observado e novo fotograma renderizado em cada caso.</li><li><strong>30 grupos de regressão</strong>: dados, medidas, materiais, escolhas, exportações, portas, estado, picking e recursos.</li><li><strong>49 acções no percurso principal</strong>: estúdio, plantas, fotografias, filmes e fontes; guardar, recuperar, exportar e regressar após recarregar.</li><li><strong>375, 768, 1024, 1280, 1440 e 1920 píxeis</strong>: sem transbordo horizontal observado; teclado e foco conferidos.</li><li><strong>Acessibilidade automática</strong>: sem violações detectadas pelo axe nos oito estados testados. Não equivale a certificação com todos os leitores de ecrã.</li><li><strong>Expansão preservada</strong>: ensaio T2 com 1001 posições sem sobreposição adicional acima do limiar de 0,1 mm face aos 24 contactos de construção finais.</li><li><strong>Desempenho local</strong>: no percurso em Chrome headless/macOS, LCP de 128 ms, CLS de 0,00053 e maior interacção observada de 216 ms. Medição local sem simulação de rede móvel; não é INP de utilizadores reais.</li></ul>
<p class="fine">O ensaio do catálogo registou dois pedidos iniciais de vídeo cancelados, sem falhas de materiais ou respostas HTTP de erro. A reprodução e a procura temporal foram verificadas no percurso funcional.</p><p class="fine">Os 31 494 ensaios de passagem usam os móveis fechados. Abertura de mobiliário tem ensaio separado. Entre portas de passagem, 72 pares têm trajectórias completas limitadas por envelopes analiticamente disjuntos. As verificações com paredes, móveis e serviços são amostradas; não cobrem todas as combinações contínuas imagináveis.</p>
<h2>Exportações abertas e conferidas</h2><p>O exemplo T2 inclui cozinha 02 em L, banho 16 espelhado, SPC KX7007, telhado e alpendre. O PDF de duas páginas foi aberto e inspeccionado visualmente. A planta exportada mostra o novo sentido das portas.</p><div class="links"><a href="configuration-example.pdf">PDF de exemplo</a><a href="configuration-example.json" download>Configuração JSON</a><a href="plan-example.svg">Planta SVG</a><a href="mobile.png">Vista móvel</a></div>
<h2>Provas consultáveis</h2><details><summary>Geometria e fontes</summary><div class="links"><a href="doors-summary.json">Resumo das portas</a><a href="door-matrix.json">Matriz por porta</a><a href="source-ledger.json">Leitura das plantas originais</a><a href="doors-sweep.json">Posições intermédias</a><a href="bath-services.json">Banho e serviços</a><a href="door-pairs.json">Pares independentes</a><a href="floor-passages.json">Passagens no piso</a></div></details>
<details><summary>Móveis e utilização</summary><div class="links"><a href="furniture-sweep-summary.json">Folgas dos móveis</a><a href="furniture-sweep.json">Ensaio geométrico</a><a href="furniture-pairs.json">Aberturas independentes</a><a href="furniture-clearances.json">Medidas ilustrativas</a><a href="furniture-picking.json">Clques e superfícies</a><a href="furniture-interaction.json">Estado e enquadramento</a><a href="catalogue-coverage-summary.json">Cobertura do catálogo</a><a href="catalogue-coverage.json">174 casos do catálogo</a><a href="app-regressions.json">Regressões da aplicação</a><a href="code-review.json">Entradas e recursos</a><a href="construction-recovery.json">Construção interrompida</a><a href="picking-validation.json">Clques reais</a><a href="comparison-recovery.json">Recuperação do comparador</a><a href="walkthrough.json">Percurso completo</a><a href="source-hashes.json">Ficheiros verificados</a></div></details>
<h2>O que continua a depender de documentação</h2><p>As plantas sustentam o sentido das portas, mas não fornecem cotas completas de ferragens, espessuras ou folgas de montagem. Estes detalhes continuam identificados como estimativas. Os 0,1 mm usados nos ensaios são um limiar numérico, não uma tolerância de fabrico.</p><p>As cabines curvas 02/03 mantêm-se estáticas por falta de definição do seu mecanismo. Cores físicas calibradas, mapas PBR medidos e projectos de instalações também não constam dos anexos. A visita em vídeo anterior foi identificada como referência; o configurador contém a distribuição actualizada.</p><div class="links"><a href="../evidence-r5/audit-report.html">Referências e cor digital</a><a href="../evidence-r4/audit-report.html">Histórico da expansão</a><a href="expansion.json">Regressão actual da expansão</a><a href="../../index.html">Explorar o modelo corrigido →</a></div></main></body></html>'''
perf = json.loads((AUDIT / 'root-audit' / f'{PHASE}-walkthrough.json').read_text())['performance']
html = html.replace('Clques', 'Cliques').replace('LCP de 128 ms', f"LCP de {perf['lcp']:.0f} ms").replace('CLS de 0,00053', f"CLS de {perf['cls']:.5f}".replace('.', ',')).replace('observada de 216 ms', f"observada de {perf['maxObservedInteraction']:.0f} ms")
html = re.sub(r'<img src="([^"]+)"([^>]+)>', r'<a href="\1" target="_blank" rel="noopener"><img src="\1"\2></a>', html)
(OUT / 'audit-report.html').write_text(html, encoding='utf-8')
print(json.dumps({'output': 'dist/assets/evidence-r6', 'files': len(list(OUT.iterdir()))}))
