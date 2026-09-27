import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.PLAYWRIGHT_MODULE||`${process.env.HOME}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`;
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 await page.goto(process.env.GV72_BASE_URL||'http://127.0.0.1:4194',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'EN',exact:true}).click();
 const results=[];
 for(const panel of ['materials','layout','kitchen','bathroom','roof','options','project']){
  await page.locator(`[data-config="${panel}"]`).click();
  await page.waitForTimeout(80);
  const leftovers=await page.locator('#config-content').evaluate(root=>{
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),texts=[];
   while(walker.nextNode()){
    const node=walker.currentNode,text=node.nodeValue.trim();
    if(text&&/\b(?:[A-Za-z]+ção|[A-Za-z]+ções|[A-Za-z]+ão|[A-Za-z]+ões|Escolha|confirma[rç]|fornecid|por |para |do |da |com )/u.test(text)&&!node.parentElement.closest('textarea,.client-preserve-lines'))texts.push(text);
   }
   return [...new Set(texts)];
  });
  results.push({panel,leftovers});
 }
 for(const language of ['es','pt']){
  await page.locator(`[data-language="${language}"]`).click();
  await page.waitForFunction(lang=>document.documentElement.lang===lang,language==='es'?'es-ES':'pt-PT');
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({panels:results,pageErrors:errors},null,2));
}finally{await context.close();await browser.close();}
