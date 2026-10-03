import assert from 'node:assert/strict';
import {homedir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const modulePath=process.env.PLAYWRIGHT_MODULE||path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.platform==='darwin'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];
const base=process.env.GV72_BASE_URL||'http://127.0.0.1:4196';
page.on('pageerror',error=>errors.push(error.message));
const captions=()=>page.evaluate(()=>({title:document.querySelector('#scene-title').textContent,description:document.querySelector('#view-description').textContent}));
async function expectCaptions(expected){
 await page.waitForFunction(value=>document.querySelector('#scene-title').textContent===value.title&&document.querySelector('#view-description').textContent===value.description,expected,{timeout:4000});
 assert.deepEqual(await captions(),expected);
}
const labels={
 pt:{title:'Vista exterior',description:'Clique numa porta ou janela para abrir'},
 en:{title:'Exterior view',description:'Click a door or window to open it'},
 es:{title:'Vista exterior',description:'Pulse una puerta o ventana para abrirla'}
};
try{
 await page.goto(base+'/?lang=pt&audit=r36-i18n');
 await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading').hidden);
 await expectCaptions(labels.pt);
 await page.locator('[data-language="en"]').click();await expectCaptions(labels.en);
 await page.locator('.presentation-start').click();
 await page.waitForFunction(()=>window.__GV.presentationMode().active);
 await page.locator('[data-presentation-view="bathroom"]').click();
 await page.waitForFunction(()=>document.querySelector('#scene-title').textContent==='Your bathroom, in detail');
 await page.locator('[data-presentation-action="exit"]').click();
 await expectCaptions(labels.en);
 await page.locator('[data-language="es"]').click();await expectCaptions(labels.es);
 await page.locator('[data-language="pt"]').click();await expectCaptions(labels.pt);
 console.log('PASS Presentation restores captions that remain translatable across PT → EN → ES → PT');

 // A caller can restore an older translated value by replacing its text node.
 await page.locator('[data-language="en"]').click();await expectCaptions(labels.en);
 const english=await captions();
 await page.locator('[data-language="es"]').click();await expectCaptions(labels.es);
 await page.evaluate(saved=>{document.querySelector('#scene-title').textContent=saved.title;document.querySelector('#view-description').textContent=saved.description;},english);
 await expectCaptions(labels.es);
 await page.locator('[data-language="pt"]').click();await expectCaptions(labels.pt);
 console.log('PASS Replaced translated text nodes retain their Portuguese source after language changes');

 // Authored Portuguese updates must still become the new source; private text stays exact.
 await page.evaluate(()=>{
  document.querySelector('#scene-title').textContent='A sua cozinha, em detalhe';
  const privateText=document.createElement('p');privateText.id='private-i18n-check';privateText.dataset.i18n='off';privateText.textContent='Exterior view · Cozinha';document.body.append(privateText);
 });
 await page.locator('[data-language="en"]').click();
 await page.waitForFunction(()=>document.querySelector('#scene-title').textContent==='Your kitchen, in detail');
 await page.locator('[data-language="pt"]').click();
 await page.waitForFunction(()=>document.querySelector('#scene-title').textContent==='A sua cozinha, em detalhe');
 assert.equal(await page.locator('#private-i18n-check').textContent(),'Exterior view · Cozinha');
 assert.deepEqual(errors,[]);
 console.log('PASS New authored labels replace old sources and private text is not translated');
 console.log(JSON.stringify({passed:3,failed:0,pageErrors:errors}));
}finally{await browser.close();}
