import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{if(process.env.PLAYWRIGHT_MODULE)throw error;return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));});
const out=process.env.AUDIT_OUTPUT||'audit/r35/browser',url=process.env.AUDIT_URL||'http://127.0.0.1:4196/?v=r35';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.platform==='darwin'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1050},acceptDownloads:true}),errors=[],consoleErrors=[],httpErrors=[],checks=[];
page.setDefaultTimeout(25000);page.on('pageerror',e=>errors.push(e.message));
page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
page.on('response',response=>{if(response.status()>=400)httpErrors.push({url:response.url(),status:response.status()});});
page.on('requestfailed',request=>httpErrors.push({url:request.url(),error:request.failure()?.errorText}));
const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
const choice=key=>page.locator('[data-presentation="'+key+'"]');
const state=()=>page.evaluate(()=>JSON.stringify(window.__GV.state()));
const ready=async()=>{await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);return page.evaluate(()=>window.__GV.ready());};
try{
 await page.goto(url);const initial=await ready();
 await check('Photographic assets load and exterior presentation is ready',async()=>{assert.deepEqual(initial.failures,[]);assert.equal(initial.presentation.ready,true);assert.equal(initial.presentation.active,'garden');await page.locator('#viewport').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/desktop.png'});await page.locator('#viewport').screenshot({path:out+'/arrival.png'});});
 const original=await state();
 await check('Environment and light choices preserve every priced configuration field',async()=>{
  await choice('environment').selectOption('studio');assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'studio');assert.ok(await choice('mood').isDisabled());
  await choice('environment').selectOption('garden');await choice('mood').selectOption('late-afternoon');await ready();assert.equal(await state(),original);assert.equal(await page.evaluate(()=>window.__GV.presentation().mood),'late-afternoon');
  await choice('camera').selectOption('garden');assert.equal(await page.evaluate(()=>window.__GV.presentation().camera),'garden');await page.locator('#viewport').screenshot({path:out+'/garden-warm.png'});
  await choice('mood').selectOption('daylight');await choice('camera').selectOption('overview');await page.locator('#viewport').screenshot({path:out+'/overview.png'});
 });
 await check('Interior, utilities, exploded layers and room details keep neutral backgrounds',async()=>{
  for(const view of ['interior','plumbing','electrical','finishes','structure']){await page.evaluate(v=>window.__GV.setView(v),view);assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'studio');if(view==='plumbing')await page.locator('#viewport').screenshot({path:out+'/water.png'});}
  for(const room of ['bathroom','kitchen']){await page.evaluate(r=>window.__GV.focusRoom(r),room);assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'studio');}
  await choice('camera').selectOption('arrival');assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'garden');assert.equal(await state(),original);
 });
 await check('Real 4K download waits for assets and restores interactive viewport dimensions',async()=>{
  const before=await page.locator('#viewport canvas').evaluate(c=>({w:c.width,h:c.height}));
  const downloadPromise=page.waitForEvent('download',{timeout:60000});await page.locator('.presentation-export').click();const download=await downloadPromise;await download.saveAs(out+'/portofolio-garden-4k.png');
  const bytes=await fs.readFile(out+'/portofolio-garden-4k.png');assert.equal(bytes.readUInt32BE(16),3840);assert.equal(bytes.readUInt32BE(20),2160);assert.ok(bytes.length>300000);
  await page.waitForFunction(()=>!document.querySelector('#export-progress').open);assert.deepEqual(await page.locator('#viewport canvas').evaluate(c=>({w:c.width,h:c.height})),before);assert.equal(await state(),original);
 });
 await check('All opening controls remain interactive after garden export',async()=>{
  await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(x=>x.value===1));
  await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(x=>x.value===0));
 });
 await check('Presentation controls are translated in Portuguese, English and Spanish',async()=>{
  for(const [lang,label] of [['en','Save 4K image'],['es','Guardar imagen 4K'],['pt','Guardar imagem 4K']]){await page.locator('[data-language="'+lang+'"]').click();assert.ok((await page.locator('.presentation-controls').innerText()).includes(label));assert.equal(await state(),original);}
 });
 await check('Phone and tablet have usable controls without horizontal overflow',async()=>{
  for(const [width,height]of [[768,1024],[390,844]]){await page.setViewportSize({width,height});await choice('camera').selectOption('garden');await page.locator('.presentation-controls').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));for(const name of ['environment','mood','camera']){const box=await choice(name).boundingBox();assert.ok(box.width>=60&&box.height>=32);}await page.screenshot({path:out+'/responsive-'+width+'.png'});}
 });
 await check('Idle garden does not run a continuous animation loop',async()=>{
  await page.locator('#viewport').scrollIntoViewIfNeeded();await page.waitForTimeout(1800);const before=await page.evaluate(()=>window.__GV.diagnostics().frames);await page.waitForTimeout(1000);const after=await page.evaluate(()=>window.__GV.diagnostics().frames);assert.ok(after-before<=2,'Unexpected idle frames: '+(after-before));
 });
 await check('Missing HDR reports fallback and studio can still export',async()=>{
  const fallback=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
  try{await fallback.route('**/assets/scene-r35/*.hdr',r=>r.abort());await fallback.goto(url);await fallback.waitForFunction(()=>window.__GV);const report=await fallback.evaluate(()=>window.__GV.ready());assert.ok(report.failures.length>0);await fallback.waitForFunction(()=>document.querySelector('.presentation-status').textContent.includes('incompleto'));await fallback.locator('[data-presentation="environment"]').selectOption('studio');const studio=await fallback.evaluate(()=>window.__GV.ready());assert.deepEqual(studio.failures,[]);const image=await fallback.evaluate(()=>window.__GV.snapshotData());assert.ok(image.startsWith('data:image/png;base64,'));}finally{await fallback.close();}
 });
 assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(httpErrors,[]);await fs.writeFile(out+'/result.json',JSON.stringify({url,checks,errors,consoleErrors,httpErrors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});await fs.writeFile(out+'/failure.txt',error.stack);await fs.writeFile(out+'/result.json',JSON.stringify({url,checks,errors,consoleErrors,httpErrors,failure:error.message},null,2));throw error;}finally{await browser.close();}
