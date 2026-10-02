import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {COMMERCIAL_COPY,COMMERCIAL_TERMS} from '../dist/commercial-terms.js';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{
 if(process.env.PLAYWRIGHT_MODULE)throw error;
 return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
});
const out=path.resolve(process.env.AUDIT_OUTPUT||'audit/r33/browser');
await fs.mkdir(out,{recursive:true});
const report={url:process.env.AUDIT_URL||'http://127.0.0.1:4196/',checks:[],documents:[],observations:[],errors:[],httpErrors:[],pass:false};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage();page.setDefaultTimeout(30000);
page.on('pageerror',error=>report.errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)report.httpErrors.push({status:response.status(),url:response.url()});});
const flat=value=>value.replace(/\s+/g,' ').trim();
const retired=/\b90\s+(?:dias úteis|working days|días hábiles)|\b2\s+(?:anos na estrutura|years on the structure|años en la estructura)|\b1\s+(?:ano nos equipamentos|year on equipment|año en los equipos)|[12]-year warranty/i;
const unapproved=/30\s+(?:dias úteis|working days|días hábiles)|após a confirmação do pedido|after the order is confirmed|tras la confirmación del pedido/i;
const terms=(text,lang)=>{
 text=flat(text);
 for(const key of ['delivery','structure','expansion','finishes'])assert.ok(text.includes(COMMERCIAL_COPY[lang][key]),`${lang}: missing ${key} in ${text.slice(0,550)}`);
 assert.match(text,/30\s+(?:dias|days|días)/);assert.doesNotMatch(text,retired);assert.doesNotMatch(text,unapproved);
 return text;
};
const check=async(name,run)=>{await run();report.checks.push(name);console.log('PASS '+name);await fs.writeFile(path.join(out,'progress.json'),JSON.stringify(report,null,2));};
const nav=async name=>{await page.locator('button.nav[data-page="'+name+'"]').click();await page.evaluate(()=>window.__GV.ready());};
const chooseLanguage=async lang=>{await page.locator('[data-language="'+lang+'"]').click();await page.waitForFunction(lang=>document.documentElement.lang==={pt:'pt-PT',en:'en',es:'es-ES'}[lang],lang);};
const capture=async(locator,file)=>{
 await page.locator('#toast.show').waitFor({state:'hidden'});
 await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(animation=>Number.isFinite(animation.effect?.getTiming().iterations)).map(animation=>animation.finished.catch(()=>{})));});
 await locator.screenshot({path:path.join(out,file),animations:'disabled'});
};
try{
 await page.goto(report.url);
 await page.waitForFunction(()=>window.__GV&&document.querySelector('#loading')?.hidden);
 await page.evaluate(()=>window.__GV.ready());
 for(const lang of ['pt','en','es']){
  await chooseLanguage(lang);
  await check(lang.toUpperCase()+' FAQ and technical sheet show delivery, assembly and scoped warranties',async()=>{
   await nav('model');
   const faq=page.locator('.commercial-facts details').filter({has:page.locator('summary').filter({hasText:/prazo de entrega e a garantia|delivery time and warranty|plazo de entrega y la garantía/})});
   if(!await faq.evaluate(el=>el.open))await faq.locator('summary').click();
   const faqText=terms(await faq.locator('p').innerText(),lang);
   assert.equal(faqText,COMMERCIAL_COPY[lang].faq);
   await capture(faq,lang+'-faq-desktop.png');
   await nav('documentation');
   const sheet=page.locator('.technical-key-facts');
   const sheetText=terms(await sheet.innerText(),lang);
   assert.ok(sheetText.includes(COMMERCIAL_COPY[lang].assembly));
   const pending=await page.locator('.pending-facts').innerText();
   assert.doesNotMatch(pending,/garantia|warranty|garantía/i);
   assert.ok(pending.includes({pt:'Classes, ensaios e certificados do modelo',en:'Classes, tests and model certificates',es:'Clases, ensayos y certificados del modelo'}[lang]),lang+' certificate gap translated');
   await capture(sheet,lang+'-technical-desktop.png');
   report.observations.push({lang,faq:faqText,technicalSheet:sheetText});
  });
  await check(lang.toUpperCase()+' real customer PDF download retains all current commercial terms',async()=>{
   await nav('studio');await page.locator('#tab-project').click();
   await page.locator('[data-project-field="clientName"]').fill('Cliente teste R33');
   await page.locator('[data-project-field="clientName"]').blur();
   await page.locator('#summary-open').click();
   const downloading=page.waitForEvent('download',{timeout:90000});
   await page.locator('#print-config').click();
   const downloaded=await downloading,file=path.join(out,lang+'-client.pdf');
   await downloaded.saveAs(file);await page.locator('#summary [data-close]').click();
   const extracted=spawnSync('pdftotext',['-layout',file,'-'],{encoding:'utf8'});
   assert.equal(extracted.status,0,extracted.stderr);
   const text=extracted.stdout;terms(text,lang);
   assert.ok(flat(text).includes(COMMERCIAL_COPY[lang].assembly));
   assert.ok(text.includes('Cliente teste R33'),'Client name preserved');
   await fs.writeFile(path.join(out,lang+'-client.txt'),text);
   const pages=text.split('\f'),commercialPage=pages.findIndex(p=>flat(p).includes(COMMERCIAL_COPY[lang].delivery))+1;
   assert.ok(commercialPage>0);
   const bbox=spawnSync('pdftotext',['-bbox',file,'-'],{encoding:'utf8'});
   assert.equal(bbox.status,0,bbox.stderr);
   for(const word of bbox.stdout.matchAll(/<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)"/g))assert.ok(+word[1]>=0&&+word[2]>=0&&+word[3]<=596&&+word[4]<=843,'PDF text inside A4 page');
   const render=spawnSync('pdftoppm',['-f',String(commercialPage),'-singlefile','-scale-to','1400','-png',file,path.join(out,lang+'-commercial-page')],{encoding:'utf8'});
   assert.equal(render.status,0,render.stderr);
   report.documents.push({lang,file,suggestedFilename:downloaded.suggestedFilename(),pages:pages.filter(p=>p.trim()).length,commercialPage});
  });
 }
 await check('Actual source-ledger download includes structured terms and confirmed warranty facts',async()=>{
  await chooseLanguage('pt');await nav('documentation');
  const downloading=page.waitForEvent('download');await page.locator('#download-source-ledger').click();
  const download=await downloading,file=path.join(out,'source-ledger.json');await download.saveAs(file);
  const ledger=JSON.parse(await fs.readFile(file,'utf8'));
  assert.deepEqual(ledger.commercialTerms,COMMERCIAL_TERMS);
  assert.equal(ledger.technicalFacts.find(f=>f.id==='commercial-warranty').status,'owner-confirmed');
  assert.equal(ledger.technicalFacts.find(f=>f.id==='commercial-delivery').status,'owner-confirmed');
 });
 await check('375px PT/EN/ES FAQ and technical cards remain readable without horizontal overflow',async()=>{
  await page.setViewportSize({width:375,height:812});
  for(const lang of ['pt','en','es']){
   await chooseLanguage(lang);await nav('model');
   const faq=page.locator('.commercial-facts details').filter({hasText:COMMERCIAL_COPY[lang].faq});
   if(!await faq.evaluate(el=>el.open))await faq.locator('summary').click();
   terms(await faq.innerText(),lang);await capture(faq,lang+'-faq-mobile.png');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),lang+' model overflow');
   await nav('documentation');const sheet=page.locator('.technical-key-facts');terms(await sheet.innerText(),lang);
   await capture(sheet,lang+'-technical-mobile.png');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),lang+' technical overflow');
   for(const card of await sheet.locator('article').all())assert.ok(await card.evaluate(el=>el.scrollWidth<=el.clientWidth+1),lang+' card text overflow');
  }
 });
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.httpErrors,[]);report.pass=true;
 await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({passed:report.checks.length,documents:report.documents,errors:report.errors,httpErrors:report.httpErrors},null,2));
}finally{
 await page.screenshot({path:path.join(out,'last-page.png')}).catch(()=>{});
 await fs.writeFile(path.join(out,'progress.json'),JSON.stringify(report,null,2));
 await context.close();await browser.close();
}
