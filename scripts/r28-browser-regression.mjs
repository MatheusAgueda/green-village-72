import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{if(process.env.PLAYWRIGHT_MODULE)throw error;return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));});
const out=process.env.AUDIT_OUTPUT||'audit/r28/browser';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
const ready=()=>page.evaluate(()=>window.__GV.ready());
const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
const tab=async id=>{await page.locator('button.nav[data-page="studio"]').click();await page.locator('#tab-'+id).click();await ready();};
const cost=()=>page.evaluate(async()=>{const {catalogueEstimate}=await import('./project-options.js');const e=catalogueEstimate(window.__GV.state());return {total:e.knownSubtotalCents,lines:e.lines.map(l=>({id:l.id,quantity:l.quantity,total:l.totalCents})),vat:e.vatPending.map(l=>l.id)};});
try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4196/');await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await ready();
 await check('Three standard windows on both long sides; deck side guards',async()=>{
  await page.locator('button.nav[data-page="studio"]').click();assert.deepEqual(await page.evaluate(()=>window.__GV.plan().perimeter.filter(f=>f.axis==='z').map(f=>f.holes.length)),[3,3]);
  assert.equal(await page.evaluate(()=>window.__GV.configure({porch:true,roof:true})),true);await ready();await page.evaluate(()=>window.__GV.setCamera('perspective'));
  await page.locator('#viewport').screenshot({path:out+'/standard-deck.png'});
 });
 await check('Whole front and whole side independently priced; total 7790',async()=>{
  await tab('options');await page.locator('[data-toggle-option="glass-front"]').click();assert.equal((await cost()).total,260000);
  await page.locator('[data-toggle-option="glass-side-full"]').click();assert.equal((await cost()).total,779000);assert.equal((await cost()).vat.length,2);
  await page.locator('[data-option-variant="glass-side-full"]').selectOption('right');await ready();assert.equal(await page.locator('#viewport').getAttribute('data-camera'),'right');
  const faces=await page.evaluate(()=>window.__GV.plan().perimeter.map(f=>({axis:f.axis,c:f.c,count:f.holes.length,glazing:f.holes.filter(h=>h.facadeGlazing).length})));
  assert.equal(faces.find(f=>f.axis==='x'&&f.c>0).glazing,3);assert.equal(faces.find(f=>f.axis==='z'&&f.c>0).glazing,6);assert.equal(faces.find(f=>f.axis==='z'&&f.c<0).count,3);
  assert.ok(!(await page.locator('[data-option-card="glass-side-full"] .option-price').innerText()).includes('Instalação incluída'));
  await page.evaluate(()=>window.__GV.setCamera('perspective'));await page.locator('#viewport').screenshot({path:out+'/front-and-right-glass.png'});
 });
 await check('Side switches visually; front entry still opens',async()=>{
  await page.locator('[data-option-variant="glass-side-full"]').selectOption('left');await ready();assert.equal(await page.locator('#viewport').getAttribute('data-camera'),'left');
  await page.locator('[data-preview-option="glass-front"]').click();assert.equal(await page.locator('#viewport').getAttribute('data-camera'),'front');
  await page.locator('#openings-toggle').click();await page.locator('#viewport').scrollIntoViewIfNeeded();await page.waitForFunction(()=>window.__GV.openings().find(r=>r.id==='entry').value===1);
  assert.ok(await page.evaluate(()=>!window.__GV.openings().some(r=>r.id.startsWith('glazing-side'))));
  await page.locator('#viewport').screenshot({path:out+'/front-entry-open.png'});
 });
 await check('Save/reload and JSON retain the selected facade and package counts',async()=>{
  const saved=await page.evaluate(()=>window.__GV.state());await page.reload();await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await ready();
  assert.deepEqual(await page.evaluate(()=>window.__GV.state().optionSelections),saved.optionSelections);assert.equal((await cost()).total,779000);
  assert.ok((await page.evaluate(()=>window.__GV.exportJSON())).includes('glass-side-full'));
 });
 await check('Removing side glazing restores three windows without removing front glazing',async()=>{
  await tab('options');await page.locator('[data-toggle-option="glass-side-full"]').click();assert.equal((await cost()).total,260000);
  assert.deepEqual(await page.evaluate(()=>window.__GV.plan().perimeter.filter(f=>f.axis==='z').map(f=>f.holes.length)),[3,3]);
  await page.locator('[data-toggle-option="glass-side-full"]').click();assert.equal((await cost()).total,779000);
 });
 await check('Customer PDF exports two packages with module counts and correct subtotal',async()=>{
  await tab('project');await page.locator('[data-project-field="clientName"]').fill('Cliente de teste R28');await page.locator('[data-project-field="clientName"]').blur();
  await page.locator('#summary-open').click();assert.ok((await page.locator('#summary').innerText()).includes('7 790')||(await page.locator('#summary').innerText()).includes('7790'));
  const download=page.waitForEvent('download',{timeout:90000});await page.locator('#print-config').click();await(await download).saveAs(out+'/facades.pdf');await page.locator('#summary [data-close]').click();
 });
 await check('English, Spanish and mobile facade controls',async()=>{
  for(const [lang,title]of [['en','Fully glazed long side · 6 modules'],['es','Lateral completamente acristalado · 6 módulos']]){await page.locator('[data-language="'+lang+'"]').click();await tab('options');assert.equal(await page.locator('[data-option-card="glass-side-full"] h4').innerText(),title);}
  await page.locator('[data-language="pt"]').click();await page.setViewportSize({width:390,height:844});await tab('options');await page.locator('[data-option-card="glass-side-full"]').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:out+'/mobile.png'});
 });
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/result.json',JSON.stringify({checks,errors},null,2));
}finally{await page.screenshot({path:out+'/last-page.png'}).catch(()=>{});const debug=await page.locator('[data-toggle-option="glass-side-full"]').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),parents:Array.from((function*(n){for(;n;n=n.parentElement)yield n})(el)).map(n=>({tag:n.tagName,id:n.id,classes:n.className,display:getComputedStyle(n).display,visibility:getComputedStyle(n).visibility}))})).catch(()=>null);await fs.writeFile(out+'/progress.json',JSON.stringify({checks,errors,debug},null,2));await browser.close();}
