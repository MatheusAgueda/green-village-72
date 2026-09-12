// Run against the local preview. PLAYWRIGHT_MODULE and CHROME_PATH are optional.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.AUDIT_URL||'http://127.0.0.1:4174';
assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(url).hostname),'Use a local preview');
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=()=>crypto.createHash('sha256').update(fs.readFileSync(path.join(project,'dist/app.js'))).digest('hex');
const report={started:new Date().toISOString(),startHash:hash(),checks:[],errors:[]};
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 page.on('pageerror',error=>report.errors.push(error.message));
 await page.goto(url);await page.waitForFunction(()=>window.__GV?.process&&document.querySelector('#loading').hidden);
 await page.evaluate(()=>window.__GV.ready());
 await page.locator('[data-view="expansion"]').click();
 const state=()=>page.evaluate(()=>({process:window.__GV.process(),render:window.__GV.diagnostics().render,sourceHidden:document.querySelector('#process-reference').hidden,snapshotDisabled:document.querySelector('#snapshot').disabled}));
 for(let i=0;i<4;i++){
  await page.locator(`#process-steps [data-process-step="${i}"]`).click();
  const current=await state();assert.equal(current.process.step,i);assert.equal(current.sourceHidden,true);assert.equal(current.snapshotDisabled,false);
  report.checks.push({name:`stage-${i+1}`,process:current.process});
 }
 // Force a real render: a stale framebuffer masked the old same-tab visibility bug.
 await page.evaluate(()=>window.__GV.snapshotData());const before=await state();
 await page.locator('[data-view="expansion"]').click();
 await page.evaluate(()=>window.__GV.snapshotData());const after=await state();
 assert.deepEqual(after.process,before.process);assert.equal(after.render.triangles,before.render.triangles);assert.equal(after.render.calls,before.render.calls);
 report.checks.push({name:'same-active-view-restores-assembled-panels',before:before.render,after:after.render});
 await page.locator('#process-steps [data-process-step="0"]').click();
 const sourceCapture=await page.evaluate(async()=>{try{await window.__GV.snapshotData();return {rejected:false};}catch(error){return {rejected:true,message:error.message};}});
 assert.equal(sourceCapture.rejected,false);report.checks.push({name:'closed-stage-captures-actual-3D-model',...sourceCapture});
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(error){report.status='FAIL';report.failure=error.message;process.exitCode=1;}
finally{
 report.endHash=hash();report.stable=report.startHash===report.endHash;if(!report.stable){report.status='FAIL';process.exitCode=1;}
 report.ended=new Date().toISOString();await browser.close();
 const i=process.argv.indexOf('--out');if(i>=0){const out=path.resolve(process.argv[i+1]);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify(report));
}
