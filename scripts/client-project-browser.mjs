import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
import {spawnSync} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{if(process.env.PLAYWRIGHT_MODULE)throw error;return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));});
const out=path.resolve(process.env.AUDIT_OUTPUT||'audit/r23/browser');await fs.mkdir(out,{recursive:true});
const report={checks:[],errors:[],httpErrors:[],downloads:[]};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();page.setDefaultTimeout(15000);
page.on('pageerror',e=>report.errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
const check=(name,fn)=>Promise.resolve().then(fn).then(()=>{report.checks.push({name,pass:true});console.log('PASS '+name);});
const ready=async()=>{await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await page.evaluate(()=>window.__GV.ready());};
const tab=async name=>{await page.locator('button.nav[data-page="studio"]').click();await page.locator('#tab-'+name).click();};
const select=async id=>{const editor=page.locator('[data-window-editor="'+id+'"]');if(await editor.count()){await editor.click();await page.locator('#window-request').click();}else await page.locator('[data-toggle-option="'+id+'"]').click();};
const field=async(key,value)=>page.locator('[data-project-field="'+key+'"]').fill(value);
async function download(selector){const event=page.waitForEvent('download',{timeout:60000});await page.locator(selector).click();const file=await event;const destination=path.join(out,file.suggestedFilename());await file.saveAs(destination);report.downloads.push(destination);return destination;}
try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4191/');await ready();
 await check('All catalogue options and all eight window photographs load',async()=>{
  await tab('options');assert.equal(await page.locator('[data-option-card]').count(),await page.evaluate(async()=>(await import('./project-options.js')).OPTIONAL_ITEMS.length));
  await page.locator('#option-category').selectOption('windows');assert.equal(await page.locator('[data-option-card]').count(),8);
  for(const image of await page.locator('.window-photo img,.option-card:not(.window-card) .option-photo img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());assert.ok(await image.evaluate(img=>img.naturalWidth>0));}
  await page.locator('#option-category').selectOption('all');
 });
 await check('Repeated glass, kitchen window and quotation options retain notes',async()=>{
  await select('glass-front');await page.locator('[data-option-quantity="glass-front"]').fill('2');await page.locator('[data-option-quantity="glass-front"]').press('Tab');
  await page.locator('[data-option-note="glass-front"]').fill('Duas frentes pretendidas; confirmar medidas');
  for(const id of ['window-930','side-glass-partial','kitchen-island','ac-monosplit-12000','ac-multisplit-3x1'])await select(id);
  await page.locator('[data-option-card="window-930"] .window-card-details>summary').click();
  await page.locator('[data-option-note="window-930"]').fill('Janela nova na cozinha, acima da bancada');
  await page.locator('[data-option-note="side-glass-partial"]').fill('Lateral esquerda, vidro parcial de 2 m');
  const state=await page.evaluate(()=>window.__GV.state());assert.equal(state.optionSelections.find(i=>i.id==='glass-front').quantity,2);
  assert.deepEqual(state.optionSelections.find(i=>i.id==='window-930').targets,[]);
  assert.match(await page.locator('[data-option-card="ac-monosplit-12000"]').innerText(),/500/);
  assert.match(await page.locator('[data-option-card="ac-multisplit-3x1"]').innerText(),/Sob cotação/);
 });
 const fixtures=await page.evaluate(async()=>{
  const pdf=await PDFLib.PDFDocument.create();for(const text of ['PLANTA CLIENTE PISO UM','PLANTA CLIENTE PISO DOIS'])pdf.addPage().drawText(text,{x:40,y:700});pdf.addPage();
  const bytes=await pdf.save();let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  const canvas=document.createElement('canvas');canvas.width=700;canvas.height=700;const ctx=canvas.getContext('2d'),image=ctx.createImageData(700,700);
  for(let i=0;i<image.data.length;i+=4){image.data[i]=(i*13)%255;image.data[i+1]=(i*7)%255;image.data[i+2]=(i*17)%255;image.data[i+3]=255;}ctx.putImageData(image,0,0);
  return {pdf:btoa(binary),photo:canvas.toDataURL('image/png').split(',')[1]};
 });
 await check('Client uploads a three-page plan including a blank page and annotated photograph',async()=>{
  await tab('project');await field('clientName','Cliente Teste R23');await field('projectName','Projecto de auditoria');
  await page.locator('[data-add-request="window"]').click();await page.locator('[data-request-field="quantity"]').fill('2');await page.locator('[data-request-field="quantity"]').press('Tab');
  await page.locator('[data-request-field="notes"]').fill('Duas janelas extra em paredes a validar');
  await page.locator('[data-client-upload="plan"]').setInputFiles({name:'planta-cliente.pdf',mimeType:'application/pdf',buffer:Buffer.from(fixtures.pdf,'base64')});
  await page.locator('#config-content [data-attachment]').waitFor();await page.locator('#config-content [data-attachment-note]').fill('Planta escolhida pelo cliente, dois pisos de referência');
  await page.locator('[data-client-upload="photo"]').setInputFiles({name:'janela-referencia.png',mimeType:'image/png',buffer:Buffer.from(fixtures.photo,'base64')});
  await page.waitForFunction(()=>document.querySelectorAll('#config-content [data-attachment]').length===2);
  await page.locator('#config-content [data-attachment-note]').nth(1).fill('Fotografia da janela pretendida na cozinha');
  await page.locator('#save-local').click();await page.waitForFunction(()=>document.querySelector('#toast').textContent==='Projecto e anexos guardados neste dispositivo.');
  await page.screenshot({path:path.join(out,'desktop-client.png'),fullPage:true});
 });
 await check('Reload and saved-project recovery keep original files and notes',async()=>{
  await page.reload();await ready();await tab('project');assert.equal(await page.locator('#config-content [data-attachment]').count(),2);
  assert.equal(await page.locator('#config-content [data-attachment-note]').nth(1).inputValue(),'Fotografia da janela pretendida na cozinha');
  await field('clientName','Alteração temporária');await page.locator('#recover-local').click();await page.waitForFunction(()=>document.querySelector('[data-project-field="clientName"]')?.value==='Cliente Teste R23');
 });
 await check('Invalid files fail atomically',async()=>{
  await page.locator('[data-client-upload="photo"]').setInputFiles({name:'falso.png',mimeType:'image/png',buffer:Buffer.from('<script>alert(1)</script>')});
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('conteúdo não corresponde'));
  assert.equal(await page.locator('#config-content [data-attachment]').count(),2);
 });
 let exported;
 await check('Full JSON export and reimport includes original attachment bytes',async()=>{
  await page.locator('#review').click();await page.locator('#summary').waitFor({state:'visible'});
  const dest=await download('#save-config');exported=JSON.parse(await fs.readFile(dest,'utf8'));
  assert.equal(exported.project.attachments.length,2);assert.equal(exported.project.attachments[0].dataUrl.split(',')[1],fixtures.pdf);
  assert.equal(exported.project.attachments[1].dataUrl.split(',')[1],fixtures.photo);
  assert.equal(exported.project.requests[0].quantity,2);assert.equal(exported.project.optionNotes['window-930'],'Janela nova na cozinha, acima da bancada');
  await page.locator('#config-file').setInputFiles(dest);await page.waitForFunction(()=>!document.querySelector('#summary').open);
  assert.equal(await page.locator('#config-content [data-attachment]').count(),2);
 });
 await check('Large JSON with an image over the old 100k limit imports successfully',async()=>{
  const large=structuredClone(exported);large.project.notes='Texto longo de teste '.repeat(100);large.auditPadding='x'.repeat(120000);
  await page.locator('#config-file').setInputFiles({name:'projecto-grande.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(large))});
  await page.waitForFunction(()=>document.querySelector('[data-project-field="notes"]')?.value.startsWith('Texto longo de teste'));
 });
 await check('Malformed project import preserves the current project',async()=>{
  const invalid=structuredClone(exported);invalid.project.attachments[0].size=0;
  await page.locator('#config-file').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('inconsistentes'));assert.equal(await page.locator('#config-content [data-attachment]').count(),2);
 });
 await check('PDF export includes every plan page, photo and customer requests',async()=>{
  await page.locator('#review').click();await page.locator('#summary').waitFor({state:'visible'});
  const file=await download('#print-config');const bytes=await fs.readFile(file);
  const count=await page.evaluate(async data=>(await PDFLib.PDFDocument.load(Uint8Array.from(data))).getPageCount(),[...bytes]);assert.ok(count>=12);report.pdfPages=count;
  const extraction=spawnSync('pdftotext',['-layout',file,path.join(out,'dossier-text.txt')],{encoding:'utf8'});
  assert.equal(extraction.status,0);assert.equal(extraction.stderr,'');
  const text=await fs.readFile(path.join(out,'dossier-text.txt'),'utf8');
  for(const term of ['PLANTA CLIENTE PISO UM','PLANTA CLIENTE PISO DOIS','Fotografia da janela pretendida na cozinha','Duas janelas extra em paredes a validar','Janela nova na cozinha, acima da bancada','Lateral esquerda, vidro parcial de 2 m','5830,00 €'])assert.ok(text.includes(term),'PDF missing '+term);
  assert.equal(text.includes('p. null'),false);
 });
 await check('Share omits private data and preserves recovery before a different shared configuration',async()=>{
  await page.locator('#share-config').click();const url=await page.evaluate(()=>navigator.clipboard.readText());
  const raw=JSON.stringify(JSON.parse(Buffer.from(url.split('#config=')[1],'base64url').toString('utf8')));
  for(const privateWord of ['Cliente Teste','planta-cliente','data:application/pdf','Acima da bancada','Janela nova na cozinha'])assert.equal(raw.includes(privateWord),false);
  await page.locator('#summary [data-close]').click();
  const changed=await page.evaluate(async()=>{const {shareConfiguration}=await import('./client-tools.js');return shareConfiguration({...window.__GV.state(),bathroom:'mirrored'},location.href);});
  await page.goto(changed);await page.reload();await ready();await tab('project');assert.equal(await page.locator('#config-content [data-attachment]').count(),0);
  await page.locator('[data-recover-before-share]').click();await page.waitForFunction(()=>document.querySelectorAll('#config-content [data-attachment]').length===2);
 });
 await check('Responsive client and options at 375, 768, 950 and 1440 pixels',async()=>{
  for(const width of [375,768,950,1440]){await page.setViewportSize({width,height:950});for(const panel of ['project','options']){await tab(panel);const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dimensions.scroll<=dimensions.width+2,JSON.stringify(dimensions));if(width>900){const bounds=await page.evaluate(()=>({button:document.querySelector('#review').getBoundingClientRect().bottom,panel:document.querySelector('.config-panel').getBoundingClientRect().bottom}));assert.ok(bounds.button<=bounds.panel,'Review button is clipped');}await page.screenshot({path:path.join(out,`${panel}-${width}.png`),fullPage:true});}}
 });
 await check('Removing and restoring attachments preserves storage integrity',async()=>{
  await tab('project');await page.locator('[data-remove-attachment]').last().click();await page.waitForFunction(()=>document.querySelectorAll('#config-content [data-attachment]').length===1);
  await page.reload();await ready();await tab('project');assert.equal(await page.locator('#config-content [data-attachment]').count(),1);
  await page.locator('#recover-local').click();await page.waitForFunction(()=>document.querySelectorAll('#config-content [data-attachment]').length===2);
 });
 await check('Blocking localStorage still allows the application to start',async()=>{
  const isolated=await browser.newContext();await isolated.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
  const testPage=await isolated.newPage();const errors=[];testPage.on('pageerror',error=>errors.push(error.message));
  await testPage.goto(process.env.AUDIT_URL||'http://127.0.0.1:4191/');await testPage.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);
  assert.deepEqual(errors,[]);await isolated.close();
 });
 await check('Concurrent tabs cannot leave an attachment reference without its content',async()=>{
  const second=await context.newPage();await second.goto(process.env.AUDIT_URL||'http://127.0.0.1:4191/');await second.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);
  await second.locator('#tab-project').click();await second.locator('[data-remove-attachment]').last().click();await second.waitForFunction(()=>document.querySelectorAll('#config-content [data-attachment]').length===1);
  await page.locator('#config-content [data-attachment-note]').last().fill('Referência mantida pelo segundo pedido de gravação');
  await page.waitForFunction(()=>document.querySelector('[data-client-save-status]')?.textContent==='Ficha guardada neste dispositivo.');
  await page.reload();await ready();await tab('project');assert.equal(await page.locator('#config-content [data-attachment]').count(),2);
  assert.equal(await page.locator('#config-content [data-attachment-note]').last().inputValue(),'Referência mantida pelo segundo pedido de gravação');await second.close();
 });
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.httpErrors,[]);
}catch(error){report.failure=error.stack;console.error(error.stack);await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({checks:report.checks.length,errors:report.errors,httpErrors:report.httpErrors,failure:report.failure,pdfPages:report.pdfPages}));}
