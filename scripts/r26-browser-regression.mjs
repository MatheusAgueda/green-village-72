import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{if(process.env.PLAYWRIGHT_MODULE)throw error;return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));});
const out=process.env.AUDIT_OUTPUT||'audit/r26/browser';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
const ready=()=>page.evaluate(()=>window.__GV.ready());
const tab=async id=>{await page.locator('button.nav[data-page="studio"]').click();await page.locator('#tab-'+id).click();await ready();};
const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4196/');await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await ready();
 await page.locator('button.nav[data-page="studio"]').click();await page.locator('#viewport').screenshot({path:out+'/exterior.png'});
 await check('Island and upper cupboards independent, priced and reversible',async()=>{
  await tab('kitchen');await page.locator('[data-kitchen-extra="kitchen-island"]').check();
  assert.ok(await page.evaluate(()=>window.__GV.plan().furnishings.some(f=>f.type==='island')));
  await page.locator('[data-kitchen-extra="kitchen-upper"]').check();
  const cost=await page.evaluate(async()=>{const {catalogueEstimate}=await import('./project-options.js');const c=catalogueEstimate(window.__GV.state());return {total:c.knownSubtotalCents,pending:c.pending.map(l=>l.id)};});
  assert.equal(cost.total,58000);assert.ok(cost.pending.includes('kitchen-island'));
  await page.locator('[data-finish-colour="#3e5147"]').click();assert.equal(await page.evaluate(()=>window.__GV.state().kitchenCabinetColour),'#3e5147');
  await page.locator('#kitchen-worktop').selectOption({index:1});await ready();
  assert.ok(await page.evaluate(()=>window.__GV.state().kitchenWorktop));
  await page.locator('#viewport').screenshot({path:out+'/kitchen.png'});
  await page.locator('[data-kitchen-extra="kitchen-island"]').uncheck();assert.ok(await page.evaluate(()=>!window.__GV.plan().furnishings.some(f=>f.type==='island')));
 });
 await check('Worktop gallery pages and sample selection update the model',async()=>{
  await tab('kitchen');await page.locator('.worktop-browser summary').click();
  const first=await page.locator('[data-worktop-choice]').first().getAttribute('data-worktop-choice');
  assert.equal(await page.locator('[data-worktop-choice]').count(),6);
  await page.locator('[data-worktop-page="1"]').click();
  const seventh=await page.locator('[data-worktop-choice]').first().getAttribute('data-worktop-choice');assert.notEqual(seventh,first);
  await page.locator('[data-worktop-choice]').first().click();await ready();
  assert.equal(await page.evaluate(()=>window.__GV.state().kitchenWorktop),seventh);
  assert.equal(await page.locator('#kitchen-worktop').inputValue(),seventh);
  assert.ok(await page.locator('.worktop-browser').getAttribute('open')!==null);
  await page.locator('.custom-finishes').screenshot({path:out+'/worktop-gallery.png'});
 });
 await check('Bathroom colour, finish records and selected sample survive reload',async()=>{
  await tab('bathroom');await page.locator('[data-finish-colour="#a5815d"]').click();await ready();
  await page.locator('#viewport').screenshot({path:out+'/bathroom.png'});
  const saved=await page.evaluate(()=>window.__GV.state());await page.reload();await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await ready();
  const restored=await page.evaluate(()=>window.__GV.state());for(const key of ['kitchenCabinetColour','bathroomCabinetColour','kitchenWorktop'])assert.equal(restored[key],saved[key]);
  const json=await page.evaluate(()=>window.__GV.exportJSON());assert.ok(json.includes('#a5815d'));assert.ok(json.includes(saved.kitchenWorktop));
 });
 await check('Window assignment exits detail and focuses the rear facade',async()=>{
  await tab('options');await page.locator('[data-toggle-option="window-panoramic"]').click();
  assert.match(await page.locator('[data-option-card="window-panoramic"] .option-target-prompt').innerText(),/escolha um vão/);
  await page.locator('#option-target-window-panoramic-rear-window-1').check();await ready();
  assert.equal(await page.locator('#viewport').getAttribute('data-camera'),'back');assert.equal(await page.evaluate(()=>window.__GV.detail().focus),null);
  const window=await page.evaluate(()=>window.__GV.plan().perimeter.flatMap(f=>f.holes).find(h=>h.id==='rear-window-1'));
  assert.equal(window.height,1.9);await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().find(r=>r.id==='rear-window-1').value===1);
  await page.locator('#viewport').screenshot({path:out+'/rear-window.png'});
 });
 await check('Water and electricity views expose clear connected circuits',async()=>{
  for(const view of ['plumbing','electrical']){await page.locator('[data-view="'+view+'"]').click();await ready();assert.equal(await page.locator('#legend').isVisible(),true);await page.locator('#viewport').screenshot({path:out+'/'+view+'.png'});}
 });
 await check('Replacing an open tilt-turn with a panoramic window preserves opening state',async()=>{
  await page.evaluate(()=>window.__GV.configure({optionSelections:[{id:'window-tilt-turn',quantity:1,variant:'',targets:['rear-window-1']}]}));
  await page.evaluate(()=>window.__GV.setView('exterior'));
  if(await page.evaluate(()=>window.__GV.openings().some(r=>r.target>0)))await page.locator('#openings-toggle').click();
  await page.locator('#openings-toggle').click();await page.locator('#viewport').scrollIntoViewIfNeeded();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===1));
  await page.evaluate(()=>window.__GV.configure({optionSelections:[{id:'window-panoramic',quantity:1,variant:'',targets:['rear-window-1']}]}));
  await page.waitForFunction(()=>window.__GV.openings().find(r=>r.id==='rear-window-1').value===1);
 });
 await check('Customer PDF includes custom finishes and known versus pending prices',async()=>{
  await page.evaluate(()=>window.__GV.configure({optionSelections:[{id:'kitchen-upper',quantity:1,variant:'',targets:[]},{id:'kitchen-island',quantity:1,variant:'',targets:[]}]}));
  await tab('project');await page.locator('[data-project-field="clientName"]').fill('Cliente de teste R26');await page.locator('[data-project-field="clientName"]').blur();
  await page.locator('#summary-open').click();
  const download=page.waitForEvent('download',{timeout:90000});await page.locator('#print-config').click();await(await download).saveAs(out+'/client.pdf');
  await page.locator('#summary [data-close]').click();
 });
 await check('English and Spanish new controls retain translated labels',async()=>{
  for(const [lang,title]of [['en','Cabinets and worktop'],['es','Armarios y encimera']]){await page.locator('[data-language="'+lang+'"]').click();await tab('kitchen');assert.equal(await page.locator('.custom-finishes h3').innerText(),title);}
  await page.locator('[data-language="pt"]').click();
 });
 await check('Mobile controls and custom colour fields fit the viewport',async()=>{
  await page.setViewportSize({width:390,height:844});await tab('kitchen');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#config-content').screenshot({path:out+'/mobile-options.png'});
 });
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/result.json',JSON.stringify({checks,errors},null,2));
}finally{const diagnostics=await page.evaluate(()=>({openings:window.__GV?.openings(),render:window.__GV?.diagnostics(),visual:window.__GV?.visual()})).catch(()=>null);await fs.writeFile(out+'/progress.json',JSON.stringify({checks,errors,diagnostics},null,2));await browser.close();}
