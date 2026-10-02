import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{if(process.env.PLAYWRIGHT_MODULE)throw error;return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));});
const out=path.resolve(process.env.AUDIT_OUTPUT||'audit/r24/integrated-browser');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
const ready=()=>page.evaluate(()=>window.__GV.ready());
const tab=async name=>{await page.locator('button.nav[data-page="studio"]').click();await page.locator('#tab-'+name).click();await ready();};
try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4194/');await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await ready();
 await check('Vinyl included, SPC adds 1200 exactly once, choice survives reload and undo',async()=>{
  await tab('materials');await page.locator('[data-surface="floor"]').click();assert.equal(await page.locator('#floor-type').inputValue(),'vinyl');assert.equal(await page.locator('[data-target="floor"][data-swatch]').count(),0);
  await page.locator('#floor-type').selectOption('spc');assert.equal(await page.evaluate(()=>window.__GV.state().floorType),'spc');
  const total=()=>page.evaluate(async()=>{const {catalogueEstimate}=await import('./project-options.js');return catalogueEstimate(window.__GV.state()).knownSubtotalCents;});
  assert.equal(await total(),120000);await page.reload();await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);assert.equal(await total(),120000);
  await tab('materials');await page.locator('[data-surface="floor"]').click();await page.locator('#floor-type').selectOption('vinyl');assert.equal(await total(),0);
  await page.locator('#undo-config').click();assert.equal(await total(),120000);await page.locator('#redo-config').click();assert.equal(await total(),0);
 });
 await check('Window and door control opens and closes every built instance',async()=>{
  await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===1));
  await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===0));
 });
 await check('Large optional window opens from a direct click on its 3D sash',async()=>{
  await tab('options');await page.locator('[data-window-editor="window-large"]').click();
  await page.locator('#window-location-front-window-1').check();await page.locator('#window-apply').click();
  await page.evaluate(()=>{window.__GV.setView('exterior');window.__GV.setCamera('perspective');});await ready();
  const point=await page.evaluate(async()=>{
   const THREE=await import('./vendor/three.module.js'),diag=window.__GV.diagnostics().render,face=window.__GV.plan().perimeter.find(f=>f.axis==='x'&&f.c>0),h=face.holes.find(h=>h.id==='front-window-1');
   const r=document.querySelector('#viewport canvas').getBoundingClientRect(),camera=new THREE.PerspectiveCamera(36,r.width/r.height,.05,200);camera.position.fromArray(diag.camera);camera.lookAt(new THREE.Vector3(...diag.target));camera.updateMatrixWorld();
   const p=new THREE.Vector3(h.u+h.width*.32,h.sill+h.height*.6,face.c).project(camera);
   return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
  });
  await page.mouse.click(point.x,point.y);await page.waitForFunction(()=>window.__GV.openings().find(r=>r.id==='front-window-1').value===1);
  await page.screenshot({path:path.join(out,'large-window-open.png')});
  await page.locator('#openings-toggle').click();await page.waitForFunction(()=>window.__GV.openings().every(r=>r.value===0));
 });
 await check('Room views centre on the actual room; desktop, tablet and phone controls stay usable',async()=>{
  await page.evaluate(()=>window.__GV.configure({optionSelections:[],floorId:'floor-spc-kx7006'}));
  for(const width of [1440,768,375]){
   await page.setViewportSize({width,height:1000});
   for(const room of ['bathroom','kitchen']){
    await tab(room);await page.waitForTimeout(150);
    const data=await page.evaluate(()=>{const viewport=document.querySelector('#viewport').getBoundingClientRect(),buttons=[...document.querySelectorAll('.canvas-tools button')].filter(b=>!b.hidden).map(b=>({id:b.id,x:b.getBoundingClientRect().left,y:b.getBoundingClientRect().top,w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height,right:b.getBoundingClientRect().right,bottom:b.getBoundingClientRect().bottom}));return {width:innerWidth,scroll:document.documentElement.scrollWidth,viewport:{left:viewport.left,right:viewport.right,top:viewport.top,bottom:viewport.bottom},buttons,diag:window.__GV.diagnostics().render,room:window.__GV.plan().rooms.find(r=>r.kind==='bathroom')};});
    assert.ok(data.scroll<=data.width+1);
    for(const b of data.buttons){assert.ok(b.w>=44&&b.h>=44,JSON.stringify(b));assert.ok(b.x>=data.viewport.left&&b.right<=data.viewport.right+1,JSON.stringify(b));assert.ok(b.bottom<=data.viewport.bottom,JSON.stringify(b));}
    if(room==='bathroom')assert.ok(Math.abs(data.diag.target[2]-(data.room.clear.z0+data.room.clear.z1)/2)<.2,'Camera target was constrained away from bathroom');
    await page.locator('#detail-fittings').click();assert.equal(await page.locator('#detail-fittings').getAttribute('aria-pressed'),'true');await page.locator('#detail-fittings').click();
    await page.locator('#viewport').screenshot({path:path.join(out,`${room}-${width}.png`)});
   }
  }
 });
 await check('Water and electricity circuit views remain selectable',async()=>{
  await page.setViewportSize({width:1440,height:1000});
  for(const view of ['plumbing','electrical']){await page.locator('[data-view="'+view+'"]').click();assert.equal(await page.evaluate(()=>window.__GV.visual().view),view);assert.match(await page.locator('#model-note').innerText(),/Circuitos ilustrativos/);}
 });
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'result.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors}));
}finally{await browser.close();}
