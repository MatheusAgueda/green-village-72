import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const out=process.env.AUDIT_OUTPUT||'audit/r38/scene',url=process.env.AUDIT_URL||'http://127.0.0.1:4196/?v=r38';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&/THREE.WebGLProgram|Shader Error/.test(m.text()))errors.push(m.text());});
page.setDefaultTimeout(30000);
const test=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
try{
 await page.goto(url);await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);
 const initial=await page.evaluate(()=>JSON.stringify(window.__GV.state()));
 await test('Continuous village loads and all four orbit quadrants render',async()=>{
  assert.deepEqual((await page.evaluate(()=>window.__GV.ready())).failures,[]);
  for(const [name,pos]of [['front',[13,5,19]],['right',[18,5,-12]],['rear',[-13,5,-19]],['left',[-18,5,12]]]){
   await page.evaluate(p=>window.__GV.compareCamera(p,[0,1,0]),pos);
   await page.locator('#viewport').screenshot({path:out+'/village-'+name+'.png'});
  }
 });
 await test('Licensed 8K photograph with HDR lighting is separately labelled Palermo',async()=>{
  await page.locator('[data-presentation="environment"]').selectOption('square');
  const ready=await page.evaluate(()=>window.__GV.ready());assert.deepEqual(ready.failures,[]);assert.equal(ready.presentation.active,'square');
  assert.match(await page.locator('.presentation-note').textContent(),/Palermo/);
  await page.locator('[data-presentation="camera"]').selectOption('arrival');
  await page.locator('#viewport').screenshot({path:out+'/photographic-square.png'});
  assert.equal(await page.evaluate(()=>JSON.stringify(window.__GV.state())),initial);
 });
 await test('Native 8K export preserves camera, display buffer and configuration',async()=>{
  const before=await page.locator('#viewport canvas').evaluate(c=>[c.width,c.height]);
  const downloadPromise=page.waitForEvent('download',{timeout:120000});await page.locator('.presentation-export-hd').click();
  const download=await downloadPromise;await download.saveAs(out+'/house-square-8k.png');
  await page.waitForFunction(()=>!document.querySelector('#export-progress').open);
  const bytes=await fs.readFile(out+'/house-square-8k.png');assert.equal(bytes.readUInt32BE(16),7680);assert.equal(bytes.readUInt32BE(20),4320);
  assert.deepEqual(await page.locator('#viewport canvas').evaluate(c=>[c.width,c.height]),before);
  assert.equal(await page.evaluate(()=>JSON.stringify(window.__GV.state())),initial);
 });
 await test('All openings and clear utility circuits survive background changes',async()=>{
  await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===1));
  await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===0));
  for(const view of ['plumbing','electrical','structure','finishes','interior']){await page.evaluate(v=>window.__GV.setView(v),view);assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'studio');await page.locator('#viewport').screenshot({path:out+'/'+view+'.png'});}
  for(const room of ['kitchen','bathroom']){await page.evaluate(v=>window.__GV.focusRoom(v),room);assert.equal(await page.evaluate(()=>window.__GV.presentation().active),'studio');}
 });
 await test('All four surroundings and light preferences leave the quotation unchanged',async()=>{
  for(const environment of ['garden','studio','village','square']){
   await page.evaluate(()=>window.__GV.setView('exterior'));
   await page.locator('[data-presentation="environment"]').selectOption(environment);
   assert.deepEqual((await page.evaluate(()=>window.__GV.ready())).failures,[]);
   assert.equal(await page.evaluate(()=>JSON.stringify(window.__GV.state())),initial);
  }
  await page.locator('[data-presentation="mood"]').selectOption('late-afternoon');assert.equal(await page.evaluate(()=>JSON.stringify(window.__GV.state())),initial);
  await page.locator('[data-presentation="mood"]').selectOption('daylight');
 });
 await test('Returning from an elevation preserves the panoramic camera far plane',async()=>{
  const evidence=await page.evaluate(async()=>{
   const {createStage}=await import('./stage.js');const testStage=createStage({width:200,height:200,environment:'studio'});
   try{testStage.preset('front');const before=testStage.camera.far;testStage.perspective();return {before,after:testStage.camera.far};}finally{testStage.dispose();}
  });assert.deepEqual(evidence,{before:400,after:400});
 });
 await test('Five languages and immersive layout fit mobile tablet and desktop',async()=>{
  await page.evaluate(()=>window.__GV.setView('exterior'));
  for(const [lang,width,height]of [['pt',1440,1000],['en',768,1024],['es',390,844],['fr',375,812],['it',1440,1000]]){
   await page.setViewportSize({width,height});await page.locator(`[data-language="${lang}"]`).click();
   assert.equal((await page.locator('html').getAttribute('lang')).split('-')[0],lang);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.locator('.presentation-start').click();await page.waitForFunction(()=>!window.__GV.presentationMode().flying);
   if(width<560){
    const fit=await page.locator('.presentation-mode-views>button').evaluateAll(buttons=>buttons.filter(b=>!b.hidden).every(b=>b.scrollWidth<=b.clientWidth+1));assert.ok(fit,'Chapter text must fit without clipping');
    assert.ok(await page.locator('.presentation-mode-note').evaluate(n=>parseFloat(getComputedStyle(n).fontSize)>=11));
   }
   await page.screenshot({path:out+'/immersive-'+lang+'.png'});await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>window.__GV.presentationMode().active),false);
  }
 });
 await test('Missing photograph blocks incomplete export and studio remains usable',async()=>{
  const failed=await browser.newPage();try{
   await failed.route('**/palermo-square-8k.jpg',r=>r.abort());await failed.goto(url);await failed.waitForFunction(()=>window.__GV);
   await failed.locator('[data-presentation="environment"]').selectOption('square');
   const ready=await failed.evaluate(()=>window.__GV.ready());assert.ok(ready.failures.includes('assets/scene-r38/palermo-square-8k.jpg'));
   let downloads=0;failed.on('download',()=>downloads++);await failed.evaluate(()=>window.__GV.export8K());assert.equal(downloads,0);
   await failed.locator('[data-presentation="environment"]').selectOption('studio');assert.deepEqual((await failed.evaluate(()=>window.__GV.ready())).failures,[]);
  }finally{await failed.close();}
 });
 assert.deepEqual(errors,[]);
 await fs.writeFile(out+'/verification.json',JSON.stringify({url,checks,errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});await fs.writeFile(out+'/verification.json',JSON.stringify({url,checks,errors,error:error.stack},null,2));throw error;}finally{await browser.close();}
