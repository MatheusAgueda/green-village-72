import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from '/Users/claraazevedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const out=process.env.AUDIT_OUTPUT||'audit/r34/browser';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
const ready=()=>page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);
const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
// Unlike locator.click(), this deliberately refuses to scroll a hidden action into view.
async function visibleClick(selector){
 const point=await page.locator(selector).filter({visible:true}).first().evaluate(el=>{const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:el.contains(document.elementFromPoint(x,y)),visible:r.width>0&&r.height>0&&x>=0&&y>=0&&x<innerWidth&&y<innerHeight};});
 assert.ok(point.visible&&point.hit,selector+' must be visible and unobstructed: '+JSON.stringify(point));await page.mouse.click(point.x,point.y);
}
try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4196/');await ready();
 await page.locator('#tab-options').click();await page.locator('#option-category').selectOption('windows');
 await check('The window action is visible with the article, above the sidebar footer',async()=>{
  await page.locator('[data-option-card="window-large"]').evaluate(el=>el.scrollIntoView({block:'start'}));
  await visibleClick('[data-window-editor="window-large"]');
  assert.equal(await page.locator('#window-options').evaluate(el=>el.open),true);
  assert.deepEqual(await page.evaluate(()=>window.__GV.state().optionSelections),[]);
 });
 await check('Cancel does not charge; applying a location changes the model and the price together',async()=>{
  await page.locator('#window-options [data-close]').click();
  await visibleClick('[data-window-editor="window-large"]');
  await page.locator('#window-location-front-window-1').check();
  await visibleClick('#window-apply');
  assert.deepEqual(await page.evaluate(()=>window.__GV.state().optionSelections.find(x=>x.id==='window-large').targets),['front-window-1']);
  const h=await page.evaluate(()=>window.__GV.plan().perimeter.flatMap(f=>f.holes).find(h=>h.id==='front-window-1'));assert.equal(h.optionId,'window-large');
  assert.equal(await page.evaluate(async()=>{const {catalogueEstimate}=await import('./project-options.js');return catalogueEstimate(window.__GV.state()).knownSubtotalCents;}),65000);
 });
 await check('An assigned window can be opened and closed from its own control',async()=>{
  await visibleClick('[data-test-window="front-window-1"]');await page.waitForFunction(()=>window.__GV.openings().find(x=>x.id==='front-window-1').value===1);
  await visibleClick('[data-test-window="front-window-1"]');await page.waitForFunction(()=>window.__GV.openings().find(x=>x.id==='front-window-1').value===0);
  await page.screenshot({path:out+'/applied.png'});
 });
 await check('Assignment survives reload, undo and redo without a duplicate charge',async()=>{
  await page.reload();await ready();
  assert.deepEqual(await page.evaluate(()=>window.__GV.state().optionSelections.find(x=>x.id==='window-large').targets),['front-window-1']);
  await page.locator('#tab-options').click();await page.locator('#option-category').selectOption('windows');
  await page.locator('[data-window-editor="window-large"]').click();await page.locator('#window-location-front-window--1').check();await page.locator('#window-apply').click();
  assert.equal(await page.evaluate(()=>window.__GV.state().optionSelections.find(x=>x.id==='window-large').quantity),2);
  await page.locator('#undo-config').click();assert.equal(await page.evaluate(()=>window.__GV.state().optionSelections.find(x=>x.id==='window-large').quantity),1);
  await page.locator('#redo-config').click();assert.equal(await page.evaluate(()=>window.__GV.state().optionSelections.find(x=>x.id==='window-large').quantity),2);
  await page.locator('[data-window-editor="window-large"]').click();await page.locator('#window-quantity').fill('0');assert.equal(await page.locator('#window-apply').isDisabled(),true);await page.keyboard.press('Escape');
 });
 await check('Every window type applies to the chosen location and has a working opening control',async()=>{
  await page.evaluate(()=>window.__GV.configure({optionSelections:[]}));
  const items=await page.evaluate(async()=>{const {OPTIONAL_ITEMS}=await import('./project-options.js');return OPTIONAL_ITEMS.filter(x=>x.section==='windows'&&x.id!=='window-mosquito').map(x=>({id:x.id,price:x.priceCents}));});
  for(const item of items){
   await page.locator('[data-window-editor="'+item.id+'"]').click();await page.locator('#window-location-front-window-1').check();await page.locator('#window-apply').click();
   assert.equal(await page.evaluate(()=>window.__GV.plan().perimeter.flatMap(f=>f.holes).find(h=>h.id==='front-window-1').optionId),item.id);
   assert.equal(await page.evaluate(async()=>{const {catalogueEstimate}=await import('./project-options.js');return catalogueEstimate(window.__GV.state()).knownSubtotalCents;}),item.price);
   await visibleClick('[data-option-card="'+item.id+'"] .window-card-actions [data-test-window]');await page.waitForFunction(()=>window.__GV.openings().find(x=>x.id==='front-window-1').value===1);
   await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(x=>x.value===0));
   assert.equal(await page.locator('[data-option-card="'+item.id+'"] .window-card-actions [data-test-window]').getAttribute('aria-pressed'),'false');
  }
 });
 await check('Unassigned requests remain explicit and can be assigned later without losing quantity',async()=>{
  await page.evaluate(()=>window.__GV.configure({optionSelections:[]}));
  await page.locator('[data-window-editor="window-large"]').click();await page.locator('#window-quantity').fill('2');await page.locator('#window-request').click();
  assert.deepEqual(await page.evaluate(()=>window.__GV.state().optionSelections.find(x=>x.id==='window-large').targets),[]);
  assert.match(await page.locator('[data-option-card="window-large"] .window-placement-state').innerText(),/local por definir/);
  await page.locator('[data-window-editor="window-large"]').click();await page.locator('#window-location-front-window-1').check();await page.locator('#window-apply').click();
  assert.equal(await page.evaluate(()=>window.__GV.state().optionSelections.find(x=>x.id==='window-large').quantity),2);
  assert.match(await page.locator('[data-option-card="window-large"] .window-placement-state').innerText(),/1 \/ 2/);
 });
 await check('Short desktop, tablet and phone: apply button is unobstructed and the model becomes visible',async()=>{
  for(const [width,height] of [[1366,650],[768,900],[375,812]]){
   await page.setViewportSize({width,height});await page.locator('[data-window-editor="window-large"]').click();
   await visibleClick('#window-apply');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   if(width<=900){const r=await page.locator('#viewport').boundingBox();assert.ok(r.y<height&&r.y+r.height>0,'3D viewport must be visible after applying');}
   await page.locator('[data-window-editor="window-large"]').click();
   await page.screenshot({path:out+'/editor-'+width+'.png'});await page.keyboard.press('Escape');
  }
 });
 await check('English and Spanish window editor controls and locations are translated',async()=>{
  await page.setViewportSize({width:1366,height:768});
  for(const [lang,expected] of [['en','Apply and view in 3D'],['es','Aplicar y ver en 3D']]){
   await page.locator('[data-language="'+lang+'"]').click();await page.locator('[data-window-editor="window-large"]').click();
   await page.waitForFunction(expected=>document.querySelector('#window-apply')?.textContent===expected,expected);
   assert.doesNotMatch(await page.locator('#window-options').innerText(),/Onde pretende|Quantidade pretendida|Janela frontal|por confirmar|Escolha uma/);
   await page.screenshot({path:out+'/editor-'+lang+'.png'});await page.keyboard.press('Escape');
  }
 });
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/result.json',JSON.stringify({checks,errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});await fs.writeFile(out+'/failure.txt',error.stack);throw error;}
finally{await browser.close();}
