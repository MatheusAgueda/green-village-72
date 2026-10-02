import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{
 if(process.env.PLAYWRIGHT_MODULE)throw error;
 return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
});
const out=process.env.AUDIT_OUTPUT||'audit/r31/browser';
const baseURL=process.env.AUDIT_URL||'http://127.0.0.1:4196/';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const errors=[],graphicsErrors=[],checks=[],observations={},contexts=[];
function watch(page){
 page.setDefaultTimeout(30000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/WebGL|GL_INVALID|shader|context lost/i.test(message.text()))graphicsErrors.push(message.text());});
}
async function open({width=1440,reducedMotion='no-preference',view=null}={}){
 const context=await browser.newContext({viewport:{width,height:width<600?844:1000},reducedMotion});contexts.push(context);
 const page=await context.newPage();watch(page);const url=new URL(baseURL);url.searchParams.delete('view');
 if(view)url.searchParams.set('view',view);
 await page.goto(url.href);await ready(page);await page.locator('[data-language="pt"]').click();return page;
}
async function ready(page){
 await page.waitForFunction(()=>window.__GV?.serviceFlow&&document.querySelector('#loading')?.hidden);
 await page.evaluate(()=>window.__GV.ready());
 await page.locator('#viewport').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>window.__GV.serviceFlow().viewportVisible);
}
const flow=page=>page.evaluate(()=>window.__GV.serviceFlow());
async function select(page,view,mobile=false){
 if(mobile)await page.locator('#mobile-scene-view').selectOption(view);
 else await page.locator('.view[data-view="'+view+'"]').click();
 await ready(page);assert.equal((await flow(page)).view,view);
 assert.equal(await page.locator('#service-flow-controls').isVisible(),['plumbing','electrical'].includes(view));
}
async function playing(page,value){
 if((await flow(page)).playing!==value)await page.locator('#service-flow-toggle').click();
 assert.equal((await flow(page)).playing,value);
}
async function settled(page){
 let previous=-1,stable=0;
 for(let i=0;i<50&&stable<3;i++){
  await page.waitForTimeout(100);const current=await page.evaluate(()=>window.__GV.diagnostics().frames);
  stable=current===previous?stable+1:0;previous=current;
 }
 assert.ok(stable>=3,'Paused camera and renderer settle');
}
async function capture(page,name,compare=null){
 const result=await page.evaluate(({name,compare})=>{
  const source=document.querySelector('#viewport canvas'),canvas=document.createElement('canvas');
  canvas.width=source.width;canvas.height=source.height;const context=canvas.getContext('2d',{willReadFrequently:true});
  context.drawImage(source,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
  const state=window.__GV.serviceFlow(),electrical=state.view==='electrical';
  // Saturated glyph fills exclude the pale near-white capsule highlights.
  const isGlyph=(data,index)=>electrical?data[index]>235&&data[index+1]>175&&data[index+2]<85:data[index]<155&&data[index+1]>165&&data[index+2]>180;
  window.__r31Frames??={};const previous=compare?window.__r31Frames[compare]:null;
  let glyphPixels=0,changedPixels=0,changedGlyphPixels=0;
  for(let i=0;i<pixels.length;i+=4){
   const currentGlyph=isGlyph(pixels,i);if(currentGlyph)glyphPixels++;
   if(previous&&previous.pixels.length===pixels.length){
    const changed=Math.abs(pixels[i]-previous.pixels[i])+Math.abs(pixels[i+1]-previous.pixels[i+1])+Math.abs(pixels[i+2]-previous.pixels[i+2])>24;
    if(changed){changedPixels++;if(currentGlyph||isGlyph(previous.pixels,i))changedGlyphPixels++;}
   }
  }
  window.__r31Frames[name]={pixels};
  return {png:canvas.toDataURL('image/png'),state,width:canvas.width,height:canvas.height,glyphPixels,changedPixels,changedGlyphPixels};
 },{name,compare});
 await fs.writeFile(path.join(out,name+'.png'),Buffer.from(result.png.split(',')[1],'base64'));
 const {png,...evidence}=result;return evidence;
}
async function visibleMotion(page,label){
 await playing(page,true);await page.waitForTimeout(300);
 const before=await capture(page,label+'-a');await page.waitForTimeout(380);const after=await capture(page,label+'-b',label+'-a');
 assert.equal(before.state.active,true);assert.ok(after.state.phase>before.state.phase,label+' clock advances');
 const visibleKinds=before.state.view==='electrical'?['electrical']:['cold','hot','drain'];
 for(const kind of visibleKinds){
  const initial=before.state.symbols[kind],next=after.state.symbols[kind];
  assert.ok(initial.count>0&&next.count>0,label+' '+kind+' rendered symbols exist');
  assert.notDeepEqual(initial.positions,next.positions,label+' '+kind+' symbols move on their paths');
 }
 assert.ok(before.glyphPixels>=20&&after.glyphPixels>=20,label+' glyph fill is visible in the actual canvas');
 assert.ok(after.changedGlyphPixels>=12,label+' visible glyph pixels move between frames');
 observations[label]={before,after};
}
async function pausedFrames(page,label){
 await playing(page,false);await settled(page);
 const before=await capture(page,label+'-a');await page.waitForTimeout(380);const after=await capture(page,label+'-b',label+'-a');
 assert.equal(before.state.active,false);assert.equal(after.state.phase,before.state.phase);
 assert.deepEqual(after.state.symbols,before.state.symbols,label+' symbol positions freeze');
 assert.equal(after.changedPixels,0,label+' actual canvas freezes');observations[label]={before,after};
}
async function check(name,run){
 await run();checks.push(name);console.log('PASS '+name);
 await fs.writeFile(path.join(out,'progress.json'),JSON.stringify({checks,errors,graphicsErrors,observations},null,2));
}

try{
 const desktop=await open();
 await check('Desktop navigation from the exterior shows visible moving drops and lightning',async()=>{
  assert.equal((await flow(desktop)).view,'exterior');assert.equal((await flow(desktop)).active,false);
  for(const view of ['electrical','plumbing']){
   await select(desktop,view);await visibleMotion(desktop,'desktop-'+view);
   await pausedFrames(desktop,'desktop-'+view+'-paused');await playing(desktop,true);
  }
 });
 await check('Paused symbols remain legible while rotating the camera and changing speed',async()=>{
  await select(desktop,'electrical');await playing(desktop,false);
  await desktop.locator('#service-flow-speed').selectOption('2');await settled(desktop);const before=await flow(desktop);
  const canvas=await desktop.locator('#viewport canvas').boundingBox();assert.ok(canvas);
  const x=canvas.x+canvas.width*.5,y=canvas.y+canvas.height*.55;
  await desktop.mouse.move(x,y);await desktop.mouse.down();await desktop.mouse.move(x+80,y-25,{steps:8});await desktop.mouse.up();
  await settled(desktop);const rotated=await capture(desktop,'desktop-electrical-paused-rotated');
  assert.equal(rotated.state.speed,2);assert.deepEqual(rotated.state.symbols,before.symbols);
  assert.ok(rotated.glyphPixels>=20,'Camera-facing lightning remains visible after rotation');
  await pausedFrames(desktop,'desktop-electrical-rotated-paused');await visibleMotion(desktop,'desktop-electrical-speed2');
 });
 await desktop.context().close();
 const mobile=await open({width:385});
 await check('Mobile selector from the exterior starts both circuits and allows pause/resume',async()=>{
  assert.equal((await flow(mobile)).view,'exterior');assert.equal(await mobile.locator('#mobile-scene-view').isVisible(),true);
  for(const view of ['plumbing','electrical']){
   await select(mobile,view,true);await visibleMotion(mobile,'mobile-'+view);await pausedFrames(mobile,'mobile-'+view+'-paused');
   await playing(mobile,true);
  }
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 });
 await mobile.context().close();
 await check('Reduced motion starts paused and explicit Play animates each requested circuit',async()=>{
  for(const view of ['plumbing','electrical']){
   const page=await open({reducedMotion:'reduce',view});const initial=await flow(page);
   assert.equal(initial.view,view);assert.equal(initial.playing,false);assert.equal(initial.active,false);
   await pausedFrames(page,'reduced-'+view+'-initial');await visibleMotion(page,'reduced-'+view+'-explicit-play');
   await page.context().close();
  }
 });
 await check('Circuit deep links start visible animation with normal motion preferences',async()=>{
  for(const view of ['plumbing','electrical']){
   const page=await open({view}),state=await flow(page);
   assert.equal(state.view,view);assert.equal(state.playing,true);assert.equal(state.active,true);
   await visibleMotion(page,'direct-'+view);await page.context().close();
  }
 });
 assert.deepEqual(errors,[],'No browser JavaScript errors');assert.deepEqual(graphicsErrors,[],'No WebGL errors');
 await fs.writeFile(path.join(out,'result.json'),JSON.stringify({passed:checks.length,checks,errors,graphicsErrors,observations},null,2));
 console.log(JSON.stringify({passed:checks.length,javascriptErrors:errors.length,webglErrors:graphicsErrors.length}));
}finally{
 await fs.writeFile(path.join(out,'progress.json'),JSON.stringify({checks,errors,graphicsErrors,observations},null,2));
 for(const context of contexts)await context.close().catch(()=>{});
 await browser.close();
}
