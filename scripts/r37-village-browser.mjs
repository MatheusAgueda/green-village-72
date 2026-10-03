import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const url=process.env.AUDIT_URL||'http://127.0.0.1:4196/?v=r37',out=process.env.AUDIT_OUTPUT||'audit/r37/browser';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='darwin'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
page.on('console',message=>{if(message.type()==='error'&&/THREE.WebGLProgram|Shader Error|VALIDATE_STATUS/.test(message.text()))errors.push(message.text());});
const test=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
const choice=name=>page.locator(`[data-presentation="${name}"]`);
const state=()=>page.evaluate(()=>JSON.stringify(window.__GV.state()));
try{
 await page.goto(url);await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);const ready=await page.evaluate(()=>window.__GV.ready()),initial=await state();
 await test('Default village and original model load with all local resources and high-density rendering',async()=>{assert.deepEqual(ready.failures,[]);assert.equal(ready.presentation.active,'village');assert.ok(ready.presentation.definition.pixelRatio>=1.5);assert.equal(ready.presentation.definition.shadowMap,4096);assert.equal(await choice('environment').inputValue(),'village');await page.locator('#viewport').screenshot({path:out+'/studio-village.png'});});
 await test('Village garden and studio remain independent of priced configuration',async()=>{for(const name of ['garden','studio','village']){await choice('environment').selectOption(name);const result=await page.evaluate(()=>window.__GV.ready());assert.deepEqual(result.failures,[]);assert.equal(result.presentation.active,name);assert.equal(await state(),initial);}await choice('mood').selectOption('late-afternoon');assert.equal(await state(),initial);await choice('mood').selectOption('daylight');});
 await test('Water electricity and interior details retain clear neutral backgrounds',async()=>{for(const name of ['plumbing','electrical','structure','finishes','interior']){await page.evaluate(n=>window.__GV.setView(n),name);assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'studio');}for(const name of ['kitchen','bathroom']){await page.evaluate(n=>window.__GV.focusRoom(n),name);assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'studio');}await choice('camera').selectOption('arrival');});
 await test('Actual native8K house download restores renderer and configuration',async()=>{const before=await page.locator('#viewport canvas').evaluate(c=>[c.width,c.height]);const request=page.waitForEvent('download',{timeout:120000});await page.locator('.presentation-export-hd').click();const download=await request;await download.saveAs(out+'/village-house-8k.png');await page.waitForFunction(()=>!document.querySelector('#export-progress').open);const bytes=await fs.readFile(out+'/village-house-8k.png');assert.equal(bytes.readUInt32BE(16),7680);assert.equal(bytes.readUInt32BE(20),4320);assert.ok(bytes.length>1000000);assert.deepEqual(await page.locator('#viewport canvas').evaluate(c=>[c.width,c.height]),before);assert.equal(await state(),initial);await fs.writeFile(out+'/8k.json',JSON.stringify({width:7680,height:4320,bytes:bytes.length,bufferRestored:before}));});
 await test('All openings still operate after the physical-glass change and 8K export',async()=>{await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===1));await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===0));});
 await test('Immersive village and eight-k controls translate and fit desktop tablet and phone',async()=>{
  for(const [lang,width,height,label]of [['pt',1440,1000,'Aldeia · Porto'],['en',768,1024,'Village · Porto'],['es',390,844,'Pueblo · Oporto']]){
   await page.setViewportSize({width,height});await page.locator(`button[data-language="${lang}"]`).click();assert.equal(await choice('environment').locator('option:checked').textContent(),label);
   await page.locator('.presentation-start').click();await page.waitForFunction(()=>!window.__GV.presentationMode().flying);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${out}/immersive-${lang}-${width}.png`});
   await page.locator('.presentation-mode-downloads>summary').click();assert.equal(await page.locator('[data-presentation-action="export-8k"]').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.__GV.presentationMode().active),false);assert.equal(await state(),initial);
  }
 });
 for(const blockedAsset of ['porto-village-panorama.png','village-north.png'])await test('Unavailable '+blockedAsset+' blocks incomplete export and studio remains usable',async()=>{
  const broken=await browser.newPage({viewport:{width:1280,height:900}});let downloads=0;broken.on('download',()=>downloads++);
  try{await broken.route('**/assets/scene-r37/'+blockedAsset,r=>r.abort());await broken.goto(url);await broken.waitForFunction(()=>window.__GV);const missing=await broken.evaluate(()=>window.__GV.ready());assert.ok(missing.failures.length>0);await broken.evaluate(()=>window.__GV.export8K());assert.equal(downloads,0);assert.equal(await broken.locator('#export-progress').evaluate(d=>d.open),false);await broken.locator('[data-presentation="environment"]').selectOption('studio');assert.deepEqual((await broken.evaluate(()=>window.__GV.ready())).failures,[]);assert.ok((await broken.evaluate(()=>window.__GV.snapshotData())).startsWith('data:image/png'));}finally{await broken.close();}
 });
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/result.json',JSON.stringify({url,checks,errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});await fs.writeFile(out+'/result.json',JSON.stringify({url,checks,errors,failure:error.stack},null,2));throw error;}finally{await browser.close();}
