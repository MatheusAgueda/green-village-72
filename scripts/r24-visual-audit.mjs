import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
const {chromium}=await import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const phase=process.env.PHASE||'before',out=path.resolve('audit/r24',phase);await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4194/');await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);await page.evaluate(()=>window.__GV.ready());
 if(process.env.SPC)await page.evaluate(()=>window.__GV.configure({floorId:'floor-spc-kx7006'}));
 for(const room of ['bathroom','kitchen']){
  await page.locator('#tab-'+room).click();await page.evaluate(()=>window.__GV.ready());await page.locator('#viewport canvas').waitFor();await page.waitForTimeout(400);
  await page.screenshot({path:path.join(out,room+'-desktop.png'),fullPage:true});
  await page.locator('#viewport').screenshot({path:path.join(out,room+'-detail.png')});
 }
 console.log(JSON.stringify({phase,errors,state:await page.evaluate(()=>window.__GV.state()),diagnostics:await page.evaluate(()=>window.__GV.diagnostics())}));
 if(errors.length)process.exitCode=1;
}finally{await browser.close();}
