import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{
 if(process.env.PLAYWRIGHT_MODULE)throw error;
 return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
});
const out=process.env.AUDIT_OUTPUT||'audit/r30/browser';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const page=await context.newPage(),errors=[],graphicsErrors=[],checks=[],observations={};
page.setDefaultTimeout(30000);
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{
 if(message.type()==='error'&&/WebGL|GL_INVALID|shader|context lost/i.test(message.text()))graphicsErrors.push(message.text());
});
const flow=()=>page.evaluate(()=>window.__GV.serviceFlow());
const frames=()=>page.evaluate(()=>window.__GV.diagnostics().frames);
const ready=async()=>{
 await page.waitForFunction(()=>window.__GV?.serviceFlow&&document.querySelector('#loading')?.hidden);
 await page.evaluate(()=>window.__GV.ready());
};
const visible=async()=>{
 await page.locator('#viewport').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>window.__GV.serviceFlow().viewportVisible===true);
};
const selectView=async view=>{
 assert.equal(await page.evaluate(view=>window.__GV.setView(view),view),true);
 await ready();await visible();
};
const playing=async value=>{
 if((await flow()).playing!==value)await page.locator('#service-flow-toggle').click();
 assert.equal((await flow()).playing,value);
};
const check=async(name,task)=>{
 await task();checks.push(name);console.log('PASS '+name);
 await fs.writeFile(path.join(out,'progress.json'),JSON.stringify({checks,errors,graphicsErrors,observations},null,2));
};
const advances=async label=>{
 const before=await flow();assert.ok(Number.isFinite(before.phase),label+' exposes a finite phase');
 assert.equal(before.viewportVisible,true);assert.equal(before.active,true);
 await page.waitForTimeout(450);const after=await flow();
 assert.ok(after.phase>before.phase,label+' phase advances');
 assert.notDeepEqual(after.samples,before.samples,label+' sample positions advance');
 observations[label]={before,after};
};
const frozen=async label=>{
 const before=await flow();await page.waitForTimeout(450);const after=await flow();
 assert.equal(after.phase,before.phase,label+' phase is frozen');
 assert.deepEqual(after.samples,before.samples,label+' sample positions are frozen');
};
const settles=async label=>{
 let previous=await frames(),stable=0;
 for(let i=0;i<40&&stable<4;i++){
  await page.waitForTimeout(100);const current=await frames();
  stable=current===previous?stable+1:0;previous=current;
 }
 assert.ok(stable>=4,label+' settles to demand rendering');
 const before=await frames();await page.waitForTimeout(450);
 assert.equal(await frames(),before,label+' has no continuing renderer RAF');
};
const capture=async name=>page.locator('#viewport').screenshot({path:path.join(out,name+'.png')});
const scrollOffscreen=async label=>{
 const setup=await page.evaluate(async()=>{
  const viewport=document.querySelector('#viewport'),bottom=viewport.getBoundingClientRect().bottom+scrollY;
  const available=document.documentElement.scrollHeight-innerHeight;
  let spacer=document.querySelector('#r30-audit-scroll-spacer');
  window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const current=viewport.getBoundingClientRect();
  // The production layout is untouched. Only extend the test document when its natural
  // scroll range cannot put the complete model outside the real browser viewport.
  if(current.bottom>0&&current.top<innerHeight&&!spacer){
   spacer=document.createElement('div');spacer.id='r30-audit-scroll-spacer';
   spacer.setAttribute('aria-hidden','true');spacer.style.height=(innerHeight+bottom+64)+'px';
   document.body.append(spacer);
  }
  window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});
  return {testOnlyBottomSpacer:!!spacer,naturalScrollMaximum:available,modelBottom:bottom};
 });
 await page.waitForFunction(()=>{
  const bounds=document.querySelector('#viewport').getBoundingClientRect();
  return (bounds.bottom<=0||bounds.top>=innerHeight)&&window.__GV.serviceFlow().viewportVisible===false;
 });
 const state=await flow();assert.equal(state.active,false);
 await settles(label);await frozen(label);
 const geometry=await page.locator('#viewport').boundingBox();
 observations[label]={...setup,bounds:geometry,flow:await flow(),frames:await frames(),method:'Real window scroll and native IntersectionObserver; no visibility getter or observer replacement'};
};
const resume=async label=>{
 const before=await flow();
 const first=await page.evaluate(()=>new Promise((resolve,reject)=>{
  const before=window.__GV.serviceFlow(),started=performance.now();
  const timeout=setTimeout(()=>reject(new Error('Visible flow did not resume')),10000);
  const sample=()=>{
   const after=window.__GV.serviceFlow();
   if(after.phase>before.phase){clearTimeout(timeout);resolve({before,after,firstDelta:after.phase-before.phase,wallMs:performance.now()-started});}
   else requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
  document.querySelector('#viewport').scrollIntoView({block:'center',behavior:'instant'});
 }));
 assert.equal(first.after.viewportVisible,true);assert.equal(first.after.active,true);
 assert.ok(first.firstDelta>0&&first.firstDelta<=before.speed*.05+.00001,label+' resumes with a fresh frame, without hidden-time catch-up');
 assert.equal(first.after.playing,before.playing);assert.equal(first.after.speed,before.speed);
 observations[label]=first;await advances(label+' motion');
};

try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4196/');await ready();
 await page.locator('[data-language="pt"]').click();
 for(const view of ['plumbing','electrical']){
  await check(view+': real offscreen scrolling freezes flow and demand rendering',async()=>{
   await selectView(view);await playing(true);await advances(view+' visible');
   await scrollOffscreen(view+' offscreen');
   await page.screenshot({path:path.join(out,view+'-offscreen.png')});
   await resume(view+' resumed');
  });
 }
 await check('Explicit pause and speed survive scroll, view changes and rebuilds',async()=>{
  await page.locator('#service-flow-speed').selectOption('2');await playing(false);
  const paused=await flow();assert.equal(paused.speed,2);assert.equal(paused.active,false);
  await scrollOffscreen('paused offscreen');await visible();
  assert.equal((await flow()).phase,paused.phase);assert.equal((await flow()).playing,false);
  assert.equal((await flow()).active,false);await frozen('paused after scroll');
  for(const view of ['plumbing','electrical']){
   await selectView(view);
   assert.equal(await page.evaluate(()=>window.__GV.configure({lighting:window.__GV.state().lighting==='neutral'?'exterior':'neutral'})),true);
   await ready();assert.equal((await flow()).playing,false);assert.equal((await flow()).speed,2);
   assert.equal(await page.locator('#service-flow-speed').inputValue(),'2');
   await frozen(view+' paused rebuild');await settles(view+' paused rebuild');
  }
  await playing(true);await advances('explicit play after pause');
  await page.locator('#service-flow-speed').selectOption('1');
 });
 await check('Close-up zoom, pointer rotation and keyboard focus keep both networks animated',async()=>{
  for(const view of ['plumbing','electrical']){
   await selectView(view);await playing(true);
   const before=await page.evaluate(()=>window.__GV.diagnostics().render);
   await page.locator('#zoom-in').click();await page.locator('#zoom-in').click();
   const zoomed=await page.evaluate(()=>window.__GV.diagnostics().render);
   const distance=render=>Math.hypot(...render.camera.map((value,i)=>value-render.target[i]));
   assert.ok(distance(zoomed)<distance(before),view+' zoom buttons approach the network');
   const canvas=await page.locator('#viewport canvas').boundingBox();assert.ok(canvas);
   const x=canvas.x+canvas.width*.5,y=canvas.y+canvas.height*.6;
   await page.mouse.move(x,y);await page.mouse.down();
   await page.mouse.move(x+70,y-24,{steps:10});await page.mouse.up();
   await page.waitForTimeout(250);
   const rotated=await page.evaluate(()=>window.__GV.diagnostics().render);
   assert.notDeepEqual(rotated.camera,zoomed.camera,view+' pointer rotation changes camera');
   await page.locator('#viewport').focus();await page.keyboard.press('ArrowLeft');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'viewport');
   const keyboard=await page.evaluate(()=>window.__GV.diagnostics().render);
   assert.notDeepEqual(keyboard.camera,rotated.camera,view+' focused keyboard rotation changes camera');
   observations[view+' closeup camera']={before,zoomed,rotated,keyboard};
   await advances(view+' closeup');await capture(view+'-closeup-a');
   await page.waitForTimeout(450);await capture(view+'-closeup-b');
  }
 });
 await check('Flow controls remain fully usable at 385, 768 and 1440 pixels',async()=>{
  for(const width of [385,768,1440]){
   await page.setViewportSize({width,height:width===385?844:1000});
   for(const view of ['plumbing','electrical']){
    await selectView(view);await page.locator('#service-flow-controls').scrollIntoViewIfNeeded();
    const layout=await page.evaluate(()=>{
     const rect=element=>{const b=element.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};
     return {screen:{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth},
      controls:rect(document.querySelector('#service-flow-controls')),
      children:['#service-flow-toggle','#service-flow-speed'].map(selector=>({selector,...rect(document.querySelector(selector))})),
      legend:rect(document.querySelector('#legend')),tools:rect(document.querySelector('.canvas-tools'))};
    });
    assert.ok(layout.screen.scrollWidth<=width+1,view+' '+width+' has no horizontal overflow');
    for(const bounds of [layout.controls,...layout.children]){
     assert.ok(bounds.width>0&&bounds.height>0&&bounds.x>=-1&&bounds.right<=width+1,view+' '+width+' controls fit horizontally');
     assert.ok(bounds.y>=-1&&bounds.bottom<=layout.screen.height+1,view+' '+width+' controls fit vertically');
    }
    for(const child of layout.children){
     assert.ok(child.x>=layout.controls.x-1&&child.right<=layout.controls.right+1,view+' '+width+' child fits toolbar');
     assert.ok(child.y>=layout.controls.y-1&&child.bottom<=layout.controls.bottom+1,view+' '+width+' child is not clipped');
    }
    const overlapWidth=Math.min(layout.legend.right,layout.tools.right)-Math.max(layout.legend.x,layout.tools.x);
    const overlapHeight=Math.min(layout.legend.bottom,layout.tools.bottom)-Math.max(layout.legend.y,layout.tools.y);
    assert.ok(overlapWidth<=0||overlapHeight<=0,view+' '+width+' legend and tools do not overlap');
    await playing(false);await frozen(view+' '+width+' pause');await playing(true);
    await advances(view+' '+width+' play');observations[view+' '+width+' layout']=layout;
    await page.screenshot({path:path.join(out,view+'-'+width+'-controls.png')});
   }
  }
 });
 await check('Repeated view changes and rebuilds retain bounded GPU and material resources',async()=>{
  await page.setViewportSize({width:1440,height:1000});const samples=[];
  for(let cycle=0;cycle<4;cycle++)for(const view of ['plumbing','electrical']){
   await selectView(view);
   assert.equal(await page.evaluate(lighting=>window.__GV.configure({lighting}),cycle%2?'neutral':'exterior'),true);
   await ready();await page.waitForTimeout(100);
   const diagnostic=await page.evaluate(()=>window.__GV.diagnostics());
   samples.push({cycle,view,memory:diagnostic.render.memory,materials:diagnostic.materials});
  }
  for(const view of ['plumbing','electrical']){
   const stable=samples.filter(sample=>sample.view===view&&sample.cycle>0);
   for(const key of ['geometries','textures']){
    const values=stable.map(sample=>sample.memory[key]);assert.ok(values.every(Number.isFinite));
    assert.ok(Math.max(...values)-Math.min(...values)<=2,view+' '+key+' do not accumulate');
   }
   assert.equal(new Set(stable.map(sample=>sample.materials.leases)).size,1,view+' material leases do not accumulate');
  }
  observations.rebuildResources=samples;
 });
 assert.deepEqual(errors,[],'No browser JavaScript errors');assert.deepEqual(graphicsErrors,[],'No WebGL errors');
 await fs.writeFile(path.join(out,'result.json'),JSON.stringify({checks,errors,graphicsErrors,observations},null,2));
 console.log('PASS '+checks.length+' browser checks; no JavaScript or WebGL errors');
}finally{
 await page.screenshot({path:path.join(out,'last-page.png')}).catch(()=>{});
 await page.evaluate(()=>document.querySelector('#r30-audit-scroll-spacer')?.remove()).catch(()=>{});
 await fs.writeFile(path.join(out,'progress.json'),JSON.stringify({checks,errors,graphicsErrors,observations,finalFlow:await flow().catch(()=>null)},null,2));
 await context.close();await browser.close();
}
