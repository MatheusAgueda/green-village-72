import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{
 if(process.env.PLAYWRIGHT_MODULE)throw error;
 return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
});
const out=process.env.AUDIT_OUTPUT||'audit/r29/browser';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const page=await context.newPage(),errors=[],graphicsErrors=[],checks=[],observations={};
page.setDefaultTimeout(45000);
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{
 if(message.type()==='error'&&/WebGL|GL_INVALID|shader|context lost/i.test(message.text()))graphicsErrors.push(message.text());
});
const ready=async()=>{
 await page.waitForFunction(()=>window.__GV?.serviceFlow&&document.querySelector('#loading')?.hidden);
 await page.evaluate(()=>window.__GV.ready());
};
const flow=()=>page.evaluate(()=>window.__GV.serviceFlow());
const frames=()=>page.evaluate(()=>window.__GV.diagnostics().frames);
const check=async(name,task)=>{
 await task();checks.push(name);console.log('PASS '+name);
 await fs.writeFile(out+'/progress.json',JSON.stringify({checks,errors,graphicsErrors,observations},null,2));
};
const selectView=async view=>{
 assert.equal(await page.evaluate(view=>window.__GV.setView(view),view),true);
 await ready();
 await page.locator('#viewport').scrollIntoViewIfNeeded();
};
const ensurePlaying=async()=>{
 if(!(await flow()).playing)await page.locator('#service-flow-toggle').click();
 assert.equal((await flow()).playing,true);
};
const ensurePaused=async()=>{
 if((await flow()).playing)await page.locator('#service-flow-toggle').click();
 assert.equal((await flow()).playing,false);
};
const advances=async label=>{
 const before=await flow();assert.ok(Number.isFinite(before.phase),label+' exposes a finite phase');
 await page.waitForFunction(phase=>window.__GV.serviceFlow().phase!==phase,before.phase,{timeout:10000});
 await page.waitForTimeout(450);
 const after=await flow();
 assert.notEqual(after.phase,before.phase,label+' phase advances');
 assert.notDeepEqual(after.samples,before.samples,label+' visible sample positions advance');
 observations[label]={before,after};
};
const frozen=async label=>{
 const before=await flow();await page.waitForTimeout(450);const after=await flow();
 assert.equal(after.phase,before.phase,label+' phase stays frozen');
 assert.deepEqual(after.samples,before.samples,label+' sample positions stay frozen');
};
const settles=async label=>{
 let previous=await frames(),stable=0;
 for(let i=0;i<40&&stable<4;i++){
  await page.waitForTimeout(200);const current=await frames();
  stable=current===previous?stable+1:0;previous=current;
 }
 assert.ok(stable>=4,label+' settles to demand rendering');
 const before=await frames();await page.waitForTimeout(450);
 assert.equal(await frames(),before,label+' has no perpetual RAF');
};
const capture=async name=>page.locator('#viewport').screenshot({path:path.join(out,name+'.png')});

try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4196/');await ready();
 await page.locator('[data-language="pt"]').click();
 await check('Water flow advances along the visible network',async()=>{
  await selectView('plumbing');await page.locator('#service-flow-controls').waitFor({state:'visible'});
  await ensurePlaying();assert.equal(await page.locator('#service-flow-toggle').innerText(),'Pausar fluxo');
  assert.equal((await flow()).view,'plumbing');await advances('water');
  await capture('water-desktop-a');await page.waitForTimeout(450);await capture('water-desktop-b');
 });
 await check('Water flow pause freezes phase and geometry',async()=>{
  await page.locator('#service-flow-toggle').click();
  assert.equal(await page.locator('#service-flow-toggle').innerText(),'Reproduzir fluxo');
  assert.equal((await flow()).playing,false);await frozen('water pause');await settles('water pause');
 });
 await check('Speed and pause survive configuration rebuilds',async()=>{
  await page.locator('#service-flow-speed').selectOption('2');assert.equal((await flow()).speed,2);
  const result=await page.evaluate(()=>{
   const state=window.__GV.state();return window.__GV.configure({lighting:state.lighting==='neutral'?'exterior':'neutral'});
  });
  assert.equal(result,true);await ready();
  assert.equal((await flow()).speed,2);assert.equal((await flow()).playing,false);
  assert.equal(await page.locator('#service-flow-speed').inputValue(),'2');await frozen('rebuilt paused water');
  await ensurePlaying();await advances('water double speed');
 });
 await check('Electrical pulses advance and retain the selected speed',async()=>{
  await selectView('electrical');assert.equal((await flow()).view,'electrical');
  assert.equal((await flow()).speed,2);await ensurePlaying();await advances('electricity');
  await capture('electrical-desktop-a');await page.waitForTimeout(450);await capture('electrical-desktop-b');
  await page.locator('#service-flow-speed').selectOption('0.5');assert.equal((await flow()).speed,.5);
  await ensurePaused();await frozen('electricity pause');await ensurePlaying();
 });
 await check('Exterior and a hidden studio page stop the flow and RAF loop',async()=>{
  await selectView('exterior');await page.locator('#service-flow-controls').waitFor({state:'hidden'});
  await settles('exterior');await frozen('exterior');
  await selectView('plumbing');assert.equal((await flow()).speed,.5);await ensurePlaying();await advances('water resumed');
  await page.locator('[data-go="model"]').first().click();
  await page.waitForFunction(()=>document.body.dataset.page==='model');await settles('hidden studio');await frozen('hidden studio');
  await page.locator('button.nav[data-page="studio"]').click();await ready();
  await advances('studio resumed');
 });
 await check('Simulated document visibility suspends flow and resumes without catch-up',async()=>{
  await ensurePlaying();
  await page.evaluate(()=>{
   window.__r29HiddenDescriptor=Object.getOwnPropertyDescriptor(document,'hidden');
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
   document.dispatchEvent(new Event('visibilitychange'));
  });
  let hiddenPhase;
  try{
   assert.equal(await page.evaluate(()=>document.hidden),true);
   await settles('simulated hidden document');await frozen('simulated hidden document');
   hiddenPhase=(await flow()).phase;
  }finally{
   await page.evaluate(()=>{
    if(window.__r29HiddenDescriptor)Object.defineProperty(document,'hidden',window.__r29HiddenDescriptor);
    else delete document.hidden;
    delete window.__r29HiddenDescriptor;
    document.dispatchEvent(new Event('visibilitychange'));
   });
  }
  await advances('visible document resumed');
  observations.documentVisibility={method:'Synthetic document.hidden getter and visibilitychange event; not an OS background-tab test',hiddenPhase};
 });
 await check('4K export freezes animation until image encoding completes',async()=>{
  await selectView('electrical');await ensurePlaying();
  await page.evaluate(()=>{
   const canvas=document.querySelector('#viewport canvas');
   window.__r29CanvasEncoding={canvas,descriptor:Object.getOwnPropertyDescriptor(canvas,'toBlob')};
   const encode=canvas.toBlob;
   // Hold only delivery of the real PNG callback so the export lock can be observed reliably.
   canvas.toBlob=function(callback,...args){return encode.call(this,blob=>setTimeout(()=>callback(blob),900),...args);};
  });
  try{
   const downloadPromise=page.waitForEvent('download',{timeout:90000});
   const exportTask=page.evaluate(()=>window.__GV.export4K());
   await page.locator('#export-progress').waitFor({state:'visible'});
   const before=await flow();await page.waitForTimeout(450);
   assert.equal(await page.locator('#export-progress').isVisible(),true,'Export remains in its encoding phase');
   const after=await flow();assert.equal(after.phase,before.phase);assert.deepEqual(after.samples,before.samples);
   await exportTask;const download=await downloadPromise;const target=path.join(out,'electrical-4K.png');
   await download.saveAs(target);const png=await fs.readFile(target);
   assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),3840);assert.equal(png.readUInt32BE(20),2160);
   await page.locator('#export-progress').waitFor({state:'hidden'});await advances('flow after 4K export');
   observations.exportFreeze={phase:before.phase,width:3840,height:2160,method:'Real 4K PNG export, with encoding callback delivery delayed 900 ms by the test'};
  }finally{
   await page.evaluate(()=>{
    const record=window.__r29CanvasEncoding;
    if(record?.descriptor)Object.defineProperty(record.canvas,'toBlob',record.descriptor);
    else if(record)delete record.canvas.toBlob;
    delete window.__r29CanvasEncoding;
   });
  }
 });
 await check('Repeated model rebuilds retain bounded GPU and material resources',async()=>{
  await selectView('plumbing');await ensurePlaying();const samples=[];
  for(let i=0;i<8;i++){
   assert.equal(await page.evaluate(lighting=>window.__GV.configure({lighting}),i%2?'neutral':'exterior'),true);
   await ready();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const diagnostic=await page.evaluate(()=>window.__GV.diagnostics());
   samples.push({memory:diagnostic.render.memory,materials:diagnostic.materials});
  }
  const stable=samples.slice(2);
  for(const key of ['geometries','textures']){
   const values=stable.map(sample=>sample.memory[key]);
   assert.ok(values.every(Number.isFinite),key+' are reported');
   assert.ok(Math.max(...values)-Math.min(...values)<=2,key+' do not accumulate over repeated rebuilds');
  }
  assert.equal(new Set(stable.map(sample=>sample.materials.leases)).size,1,'Material leases do not accumulate');
  observations.rebuildResources=samples;
 });
 await check('Flow controls are translated in English and Spanish',async()=>{
  for(const lang of ['en','es']){
   await page.locator('[data-language="'+lang+'"]').click();await ensurePlaying();
   const playingText=await page.locator('#service-flow-toggle').innerText();
   assert.ok(playingText.trim());assert.notEqual(playingText,'Pausar fluxo');assert.notEqual(playingText,'Reproduzir fluxo');
   await ensurePaused();const pausedText=await page.locator('#service-flow-toggle').innerText();
   assert.ok(pausedText.trim());assert.notEqual(pausedText,'Reproduzir fluxo');assert.notEqual(pausedText,playingText);
   const text=await page.locator('#service-flow-controls').innerText();
   assert.ok(!/Velocidade|Pausar fluxo|Reproduzir fluxo/.test(text));
   observations['language-'+lang]={playingText,pausedText,text};
  }
  await page.locator('[data-language="pt"]').click();await ensurePlaying();
 });
 await check('Water and electrical motion remain usable on mobile',async()=>{
  await page.setViewportSize({width:390,height:844});
  for(const view of ['plumbing','electrical']){
   await selectView(view);await page.locator('#service-flow-controls').scrollIntoViewIfNeeded();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),view+' avoids horizontal overflow');
   const bounds=await page.locator('#service-flow-controls').boundingBox();
   assert.ok(bounds&&bounds.width>0&&bounds.x>=-1&&bounds.x+bounds.width<=391,view+' controls fit the mobile screen');
   const legend=await page.locator('#legend').boundingBox(),tools=await page.locator('.canvas-tools').boundingBox();
   assert.ok(legend&&tools,'Legend and canvas controls are visible');
   const overlapWidth=Math.min(legend.x+legend.width,tools.x+tools.width)-Math.max(legend.x,tools.x);
   const overlapHeight=Math.min(legend.y+legend.height,tools.y+tools.height)-Math.max(legend.y,tools.y);
   assert.ok(overlapWidth<=0||overlapHeight<=0,view+' legend does not overlap the canvas controls');
   observations['mobile bounds '+view]={legend,tools,controls:bounds};
   await ensurePlaying();await advances('mobile '+view);await capture(view+'-mobile');
   await page.screenshot({path:path.join(out,view+'-mobile-controls.png')});
   await ensurePaused();await frozen('mobile '+view);await ensurePlaying();
  }
 });
 await check('Reduced motion starts paused and allows explicit play',async()=>{
  await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();await ready();await selectView('plumbing');
  assert.equal((await flow()).playing,false);await frozen('reduced motion');await settles('reduced motion');
  await page.locator('#service-flow-toggle').click();assert.equal((await flow()).playing,true);
  await advances('explicit reduced motion play');await ensurePaused();
 });
 assert.deepEqual(errors,[],'No browser JavaScript errors');assert.deepEqual(graphicsErrors,[],'No WebGL errors');
 await fs.writeFile(out+'/result.json',JSON.stringify({checks,errors,graphicsErrors,observations},null,2));
 console.log('PASS '+checks.length+' browser checks; no JavaScript or WebGL errors');
}finally{
 await page.screenshot({path:path.join(out,'last-page.png')}).catch(()=>{});
 await fs.writeFile(out+'/progress.json',JSON.stringify({checks,errors,graphicsErrors,observations,finalFlow:await flow().catch(()=>null)},null,2));
 await context.close();await browser.close();
}
