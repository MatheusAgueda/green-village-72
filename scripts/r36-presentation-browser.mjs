import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
import {execFileSync} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(()=>import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const out=process.env.AUDIT_OUTPUT||'audit/r36/browser',url=process.env.AUDIT_URL||'http://127.0.0.1:4196/?v=r36';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='darwin'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1050},acceptDownloads:true}),errors=[],checks=[];
page.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push(error.message));
const test=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
const state=()=>page.evaluate(()=>JSON.stringify(window.__GV.state()));
const settle=()=>page.waitForFunction(()=>!window.__GV.presentationMode().flying);
const mode=()=>page.evaluate(()=>window.__GV.presentationMode());
const action=name=>page.locator(`[data-presentation-action="${name}"]`);
const view=name=>page.locator(`[data-presentation-view="${name}"]`);
const snapshot=()=>page.evaluate(()=>({visual:window.__GV.visual(),detail:window.__GV.detail().focus,presentation:window.__GV.presentation(),layers:window.__GV.layerState(),camera:window.__GV.diagnostics().render.camera,target:window.__GV.diagnostics().render.target,openings:window.__GV.openings(),buffer:[document.querySelector('#viewport canvas').width,document.querySelector('#viewport canvas').height]}));
try{
 await page.goto(url);await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);assert.deepEqual((await page.evaluate(()=>window.__GV.ready())).failures,[]);
 const original=await state();
 await test('Immersive mode reuses the same canvas and leaves all priced choices intact',async()=>{
  await page.evaluate(()=>window.testCanvas=document.querySelector('#viewport canvas'));
  await page.locator('.presentation-start').click();await settle();
  assert.equal((await mode()).active,true);assert.ok(await page.evaluate(()=>window.testCanvas===document.querySelector('#viewport canvas')));
  assert.equal(await page.locator('#viewport canvas').count(),1);assert.equal(await state(),original);
  await page.screenshot({path:out+'/immersive-arrival.png'});
 });
 await test('Every visit chapter, lighting and manual navigation works without changing the configuration',async()=>{
  for(const chapter of ['garden','overview','interior','kitchen','bathroom','arrival']){await view(chapter).click();await settle();assert.equal((await mode()).chapter,chapter);assert.equal(await state(),original);}
  await action('mood').click();assert.equal(await page.evaluate(()=>window.__GV.presentation().mood),'late-afternoon');await page.screenshot({path:out+'/immersive-warm.png'});
  await action('next').click();await settle();assert.equal((await mode()).chapter,'garden');
 });
 await test('Opt-in guided visit advances, pauses on a drag, and honours reduced motion',async()=>{
  await action('play').click();assert.equal((await mode()).playing,true);
  await page.waitForFunction(()=>window.__GV.presentationMode().chapter==='overview',{},{timeout:12000});await settle();
  const box=await page.locator('#viewport canvas').boundingBox();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.54,box.y+box.height*.51,{steps:5});await page.mouse.up();assert.equal((await mode()).playing,false);
  await page.emulateMedia({reducedMotion:'reduce'});await view('arrival').click();assert.equal((await mode()).flying,false);await page.emulateMedia({reducedMotion:'no-preference'});
  await action('play').click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await mode()).playing,false);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 });
 await test('Exit restores the prior viewport and original trigger focus',async()=>{
  await action('exit').click();assert.equal((await mode()).active,false);assert.equal(await page.evaluate(()=>document.activeElement.className),'presentation-start');assert.equal(await state(),original);
  await page.evaluate(()=>window.__GV.focusRoom('bathroom'));await page.waitForTimeout(600);const before=await snapshot();
  await page.locator('#fullscreen').click();await settle();await view('garden').click();await settle();await action('exit').click();await page.waitForTimeout(600);const after=await snapshot();
  assert.equal(after.detail,before.detail);assert.deepEqual(after.visual,before.visual);assert.deepEqual(after.layers,before.layers);assert.deepEqual(after.buffer,before.buffer);
  for(const key of ['camera','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(after[key][i]-before[key][i])<.005,`${key} not restored`);
 });
 await test('ZIP download contains three real 4K PNGs and restores the bathroom view',async()=>{
  const before=await snapshot();const downloadPromise=page.waitForEvent('download',{timeout:90000});await page.evaluate(()=>window.__GV.exportImageSet());const download=await downloadPromise;
  const zip=out+'/current-configuration-4k.zip';await download.saveAs(zip);await page.waitForFunction(()=>!document.querySelector('#export-progress').open);
  const report=execFileSync('python3',['-c',`import json,struct,sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.testzip() is None\n names=z.namelist(); assert len(names)==5\n pngs=[n for n in names if n.endswith('.png')]; assert len(pngs)==3\n for n in pngs:\n  data=z.read(n); assert struct.unpack('>II',data[16:24])==(3840,2160); assert len(data)>300000\n manifest=json.loads(z.read('configuration.json')); assert 'project' not in manifest and 'clientName' not in manifest\n print(json.dumps({'names':names,'pixels':'3840x2160','crc':'valid'}))`,zip],{encoding:'utf8'});await fs.writeFile(out+'/archive-validation.json',report);
  const after=await snapshot();assert.equal(after.detail,before.detail);assert.deepEqual(after.visual,before.visual);assert.deepEqual(after.buffer,before.buffer);assert.equal(await state(),original);
 });
 await test('Presentation opens a complete house and restores hidden layers and every opening',async()=>{
  await page.evaluate(()=>{window.__GV.setView('exterior');document.querySelector('#walls-toggle').click();});
  const before=await snapshot();assert.equal(before.visual.wallsVisible,false);
  await page.locator('.presentation-start').click();await settle();assert.equal((await snapshot()).visual.wallsVisible,true);
  await page.evaluate(()=>document.querySelector('#openings-toggle').click());await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===1));
  await action('exit').click();await page.waitForTimeout(400);const after=await snapshot();assert.deepEqual(after.visual,before.visual);assert.deepEqual(after.openings,before.openings);
  await page.evaluate(()=>document.querySelector('#walls-toggle').click());
 });
 await test('Failed image encoding unlocks the presentation and Escape cannot dismiss a busy export',async()=>{
  await page.locator('.presentation-start').click();await settle();
  await page.evaluate(()=>{window.originalBlob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback){setTimeout(()=>callback(null),500);};});
  await page.locator('.presentation-mode-downloads > summary').click();await action('export').click();await page.waitForFunction(()=>document.querySelector('#export-progress').open);await page.keyboard.press('Escape');assert.equal(await page.locator('#export-progress').evaluate(d=>d.open),true);
  await page.waitForFunction(()=>!document.querySelector('#export-progress').open);assert.equal(await action('exit').isDisabled(),false);assert.equal(await page.locator('.presentation-mode').getAttribute('aria-busy'),'false');
  await page.evaluate(()=>{HTMLCanvasElement.prototype.toBlob=window.originalBlob;delete window.originalBlob;});await action('exit').click();
 });
 await test('Current-configuration gallery launches presentation and returns to the gallery',async()=>{
  await page.locator('.nav[data-page="renders"]').click();await page.waitForFunction(()=>document.querySelector('#current-project-studio img')?.src.startsWith('data:image/png'));
  await page.locator('[data-current-present]').click();await settle();await action('exit').click();assert.equal(await page.locator('body').getAttribute('data-page'),'renders');assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-current-present')),true);assert.equal(await state(),original);
 });
 await test('PT EN ES and phone tablet desktop modes remain usable without horizontal overflow',async()=>{
  await page.locator('.nav[data-page="studio"]').click();
  for(const [lang,width,height,label] of [['en',1440,1050,'Arrival'],['es',768,1024,'Llegada'],['pt',390,844,'Chegada']]){
   await page.setViewportSize({width,height});await page.locator(`[data-language="${lang}"]`).click();await page.locator('.presentation-start').click();await settle();assert.equal(await page.locator('.presentation-mode-chapter-title').textContent(),label);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok((await action('exit').boundingBox()).width>=44);await page.screenshot({path:`${out}/presentation-${lang}-${width}.png`});await action('exit').click();
  }
 });
 await test('Missing HDR prevents incomplete ZIP and restores technical view and export controls',async()=>{
  const fallback=await browser.newPage({viewport:{width:1280,height:900}});let downloads=0;fallback.on('download',()=>downloads++);
  try{
   await fallback.route('**/assets/scene-r35/*.hdr',r=>r.abort());await fallback.goto(url);await fallback.waitForFunction(()=>window.__GV);
   // Exercise the HDR-dependent garden explicitly; the default village uses its own backgrounds.
   await fallback.locator('[data-presentation="environment"]').selectOption('garden');
   const failed=await fallback.evaluate(()=>window.__GV.ready());assert.ok(failed.failures.length>0,'The garden HDR failure must be present before testing export recovery');
   assert.equal(await fallback.evaluate(()=>window.__GV.presentation().selected.environment),'garden');
   await fallback.evaluate(()=>window.__GV.focusRoom('bathroom'));const before=await fallback.evaluate(()=>window.__GV.detail().focus);
   await fallback.evaluate(()=>window.__GV.exportImageSet());assert.equal(downloads,0);assert.equal(await fallback.evaluate(()=>window.__GV.detail().focus),before);assert.equal(await fallback.locator('#export-progress').evaluate(d=>d.open),false);assert.ok(await fallback.locator('#toast').innerText());
  }finally{await fallback.close();}
 });
 assert.deepEqual(errors,[]);await fs.writeFile(out+'/result.json',JSON.stringify({url,checks,errors},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png'});await fs.writeFile(out+'/result.json',JSON.stringify({url,checks,errors,failure:error.stack},null,2));throw error;}finally{await browser.close();}
