import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const out=process.env.AUDIT_OUTPUT||'audit/r38/artifacts/fr-it-sweep';await fs.mkdir(out,{recursive:true});
const engineOnly=process.env.R38_LANGUAGE_ENGINE_ONLY==='1';
const languages=(process.env.R38_AUDIT_LANGS||'fr,it').split(',');
const locales={pt:'pt-PT',en:'en',es:'es-ES',fr:'fr-FR',it:'it-IT'};
const report={engineOnly,checkedAt:new Date().toISOString(),checks:[],observations:[],leftovers:[],errors:[],httpErrors:[],failures:[]};
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(15000);await page.emulateMedia({reducedMotion:'reduce'});
page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.httpErrors.push({url:r.url(),status:r.status()});});
const ready=async()=>{await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await page.evaluate(()=>window.__GV.ready());};
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const lang=async language=>{if(engineOnly)await page.evaluate(async language=>(await import('./i18n.js')).setLanguage(language),language);else await page.locator('[data-language="'+language+'"]').click();await page.waitForFunction(l=>document.documentElement.lang===l,locales[language]);await settle();};
async function observe(language,width,route){
 await settle();
 const result=await page.evaluate(()=>{
  const suspects=[],seen=new Set(),rx=/\b(?:[\p{L}]+ções|[\p{L}]+ção|[\p{L}]+ões|[\p{L}]+ão|Escolha|Escolher|Seleccionar|Seleccione|Guardar|Descarregar|Cozinha|Janelas|Janela|Banho|Ficheiro|Ficheiros|Nenhum|Nenhuma|Abrir|Fechar|Pavimento|portas|Largura|Altura|Peitoril|Terreno|amostras|divisórias|orçamento|orçamentos|Cotação|cotação|confirmar|incluído|incluída|fornecido|fornecida)\b/u;
  const add=(text,el,attribute='text')=>{const value=text.replace(/\s+/g,' ').trim();if(!value||!rx.test(value)||seen.has(value))return;seen.add(value);suspects.push({text:value.slice(0,700),element:el.tagName.toLowerCase(),id:el.id||null,attribute});};
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){const node=walker.currentNode,el=node.parentElement;if(!el||el.closest('script,style,textarea,[data-i18n="off"],.client-preserve-lines')||!el.getClientRects().length)continue;add(node.nodeValue,el);}
  for(const el of document.querySelectorAll('[aria-label],[title],[placeholder]')){if(!el.getClientRects().length||el.closest('[data-i18n="off"]'))continue;for(const attr of ['aria-label','title','placeholder']){const value=el.getAttribute(attr);if(value)add(value,el,attr);}}
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,suspects};
 });
 report.observations.push({language,width,route,overflow:result.scrollWidth-result.width});
 report.leftovers.push(...result.suspects.map(s=>({...s,language,width,route})));
 assert.ok(result.scrollWidth<=result.width+2,route+' overflow '+JSON.stringify(result));
}
const check=async(name,fn)=>{try{await fn();report.checks.push({name,pass:true});}catch(error){report.failures.push({name,error:error.message});await page.screenshot({path:path.join(out,'failure-'+report.failures.length+'.png'),fullPage:true}).catch(()=>{});}await fs.writeFile(path.join(out,'progress.json'),JSON.stringify(report,null,2));};
try{
 await page.goto((process.env.AUDIT_URL||'http://127.0.0.1:4398/')+'?audit=r38');await ready();
 if(!engineOnly)assert.equal(await page.locator('[data-language]').count(),5);
 for(const width of [1440,375])for(const language of languages){
  await page.setViewportSize({width,height:width===375?900:1000});await lang(language);
  for(const section of ['studio','model','gallery','renders','plans','films','documentation'])await check(language+' '+width+' '+section,async()=>{
   await page.locator('button.nav[data-page="'+section+'"]').click();await ready();await observe(language,width,section);
   if(section==='documentation'||section==='model')await page.screenshot({path:path.join(out,language+'-'+width+'-'+section+'.png'),fullPage:true});
  });
  await page.locator('button.nav[data-page="studio"]').click();
  for(const panel of ['materials','layout','kitchen','bathroom','roof','options','project'])await check(language+' '+width+' panel '+panel,async()=>{
   await page.locator('#tab-'+panel).click();await observe(language,width,'panel-'+panel);
  });
  if(width===1440)for(const view of ['exterior','interior','structure','finishes','plumbing','electrical'])await check(language+' view '+view,async()=>{
   await page.locator('[data-view="'+view+'"]').click();await page.evaluate(()=>window.__GV.ready());await observe(language,width,'view-'+view);
  });
 }
 await check('French and Italian language preference persists after reload',async()=>{
  for(const language of languages){await lang(language);await page.reload();await ready();assert.equal(await page.locator('html').getAttribute('lang'),locales[language]);}
 });
 await check('Private text survives FR to IT to PT to FR transitions',async()=>{
  await page.locator('button.nav[data-page="studio"]').click();await page.locator('#tab-project').click();await page.locator('[data-project-field="clientName"]').fill('Cozinha PRIVATE_R38');await page.locator('[data-project-field="notes"]').fill('Janela e pavimento PRIVATE_R38');
  for(const language of ['it','pt','fr']){await lang(language);assert.equal(await page.locator('[data-project-field="clientName"]').inputValue(),'Cozinha PRIVATE_R38');assert.equal(await page.locator('[data-project-field="notes"]').inputValue(),'Janela e pavimento PRIVATE_R38');}
 });
 await check('Presentation captions remain translated after bathroom and exit',async()=>{
  await page.setViewportSize({width:1440,height:1000});
  for(const language of languages){await lang(language);await page.locator('.presentation-start').click();await page.waitForFunction(()=>window.__GV.presentationMode().active);await page.locator('[data-presentation-view="bathroom"]').click();await settle();assert.doesNotMatch(await page.locator('#scene-title').textContent(),/A sua casa|A sua cozinha|O seu banho|Casa de banho|em detalhe/);await page.locator('[data-presentation-action="exit"]').click();await observe(language,1440,'presentation-exit');}
 });
}catch(error){report.failures.push({name:'unhandled',error:error.stack});}
finally{report.leftovers=report.leftovers.filter((x,i,all)=>all.findIndex(y=>y.language===x.language&&y.route===x.route&&y.text===x.text&&y.attribute===x.attribute)===i);report.pass=report.failures.length===0&&report.errors.length===0&&report.httpErrors.length===0;await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({passed:report.checks.length,failures:report.failures,errors:report.errors,httpErrors:report.httpErrors,leftoverCandidates:report.leftovers.length},null,2));process.exitCode=report.pass?0:1;}
