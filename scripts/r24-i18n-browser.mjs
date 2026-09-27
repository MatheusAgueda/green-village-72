import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.PLAYWRIGHT_MODULE||`${process.env.HOME}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`;
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext();
const page=await context.newPage(),base=process.env.GV72_BASE_URL||'http://127.0.0.1:4194';
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 await page.route('**/__r24_i18n_test__*',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="pt-PT"><head><title>Test</title><meta name="description" content="Test"></head><body></body></html>'}));
 await page.goto(base+'/__r24_i18n_test__?lang=es');
 await page.evaluate(async()=>{
  localStorage.setItem('gv72-language','en');
  const [{DEFAULT_CONFIG,flooringSelectionPatch},{emptyClientProject},{clientProjectMarkup,clientSummaryMarkup,floorChoiceMarkup,optionsPanelMarkup},{getPlan},i18n]=await Promise.all([import('/configuration.js'),import('/project-options.js'),import('/project-ui.js'),import('/specification.js'),import('/i18n.js')]);
  window.i18n=i18n;
  const state={...DEFAULT_CONFIG,...flooringSelectionPatch(DEFAULT_CONFIG,'spc'),optionSelections:[{id:'window-large',quantity:2,targets:[],variant:''}]};
  const client={...emptyClientProject(),clientName:'Cozinha',notes:'Nome do cliente',optionNotes:{'window-large':'Casa de banho'},requests:[{id:'test',title:'Cozinha',quantity:2,location:'Casa de banho',notes:'Abrir portas e janelas'}],attachments:[{id:'photo-test',kind:'photo',name:'Cozinha.pdf',mime:'image/png',notes:'Nome do cliente',dataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT8sAAAAASUVORK5CYII='}]};
  document.body.innerHTML='<button data-language="pt">PT</button><button data-language="en">EN</button><button data-language="es">ES</button><p id="dynamic-status">A guardar a ficha…</p><button id="dynamic-aria" aria-label="Abrir portas e janelas">Abrir portas e janelas</button><div id="record">'+clientProjectMarkup(client,state)+'</div><div id="floor">'+floorChoiceMarkup(state)+'</div><div id="summary">'+clientSummaryMarkup(client,state)+'</div><div id="options">'+optionsPanelMarkup(state,getPlan(state),'all',client)+'</div><select id="preserved"><optgroup label="Casa e ambientes"><option value="bathroom">Casa de banho</option></optgroup></select>';
  window.beforeInputs=[...document.querySelectorAll('input,textarea,select')].map(el=>({el,value:el.value,id:el.id}));
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),records=[];
  while(walker.nextNode())records.push({node:walker.currentNode,source:walker.currentNode.nodeValue});
  window.beforeText=records;
  i18n.initI18n();
 });
 assert.equal(await page.locator('html').getAttribute('lang'),'es-ES');
 await page.getByRole('button',{name:'EN',exact:true}).click();
 await page.waitForFunction(()=>document.documentElement.lang==='en'&&document.querySelector('#dynamic-status').textContent==='Saving the record…');
 const english=await page.evaluate(()=>({
  heading:document.querySelector('.project-intro h3').textContent,
  upload:document.querySelector('[data-client-upload="plan"]').previousElementSibling.textContent,
  floor:document.querySelector('#floor-type option[value="spc"]').textContent,
  group:document.querySelector('#preserved optgroup').label,
  aria:document.querySelector('#dynamic-aria').getAttribute('aria-label'),
  attachmentName:document.querySelector('.client-attachment > strong').textContent,
  fileAlt:document.querySelector('.client-attachment img').alt,
  removeAria:document.querySelector('[data-remove-attachment]').getAttribute('aria-label'),
  summaryName:document.querySelector('.client-summary > h3').textContent,
  requestTitle:document.querySelector('.client-request > strong')?.textContent,
  inputs:window.beforeInputs.every(({el,value,id})=>el.value===value&&el.id===id),
  leftovers:window.beforeText.filter(({node,source})=>node.isConnected&&node.nodeValue===source&&/\b(?:[A-Za-z]+ção|[A-Za-z]+ções|[A-Za-z]+ão|[A-Za-z]+ões|Escolha|confirma[rç]|fornecid|por |para |do |da |com )/u.test(source)&&!node.parentElement.closest('textarea,.client-preserve-lines,.client-summary dl dd,.client-summary > h3,.client-request > strong,.client-request > p:not(:last-child)')).map(({source})=>source.trim()).filter(Boolean)
 }));
 assert.equal(english.heading,'A project with a name.');assert.equal(english.upload,'Upload the client-defined floor plan');
 assert.equal(english.floor,'SPC · +€1,200');assert.equal(english.group,'Home and rooms');assert.equal(english.aria,'Open doors and windows');
 assert.equal(english.attachmentName,'Reference photograph · Cozinha.pdf');assert.equal(english.fileAlt,'Cozinha.pdf');assert.equal(english.removeAria,'Remove Cozinha.pdf');
 assert.equal(english.summaryName,'Cozinha');assert.equal(english.requestTitle,'2 × Cozinha');assert.equal(english.inputs,true);
 assert.deepEqual(english.leftovers,[],'Untranslated customer-control messages');
 await page.evaluate(()=>{
  document.querySelector('#dynamic-status').firstChild.nodeValue='Ficha guardada neste dispositivo.';
  document.querySelector('#dynamic-aria').setAttribute('aria-label','Fechar portas e janelas');
  document.querySelector('#dynamic-aria').textContent='Fechar portas e janelas';
 });
 await page.waitForFunction(()=>document.querySelector('#dynamic-status').textContent==='Record saved on this device.'&&document.querySelector('#dynamic-aria').getAttribute('aria-label')==='Close doors and windows');
 await page.getByRole('button',{name:'ES',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#dynamic-status').textContent==='Ficha guardada en este dispositivo.');
 assert.equal(await page.locator('[data-client-upload="plan"]').evaluate(el=>el.previousElementSibling.textContent),'Cargar el plano definido por el cliente');
 await page.getByRole('button',{name:'PT',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#dynamic-status').textContent==='Ficha guardada neste dispositivo.');
 assert.equal(await page.locator('#dynamic-aria').getAttribute('aria-label'),'Fechar portas e janelas');
 assert.equal(await page.locator('#preserved optgroup').getAttribute('label'),'Casa e ambientes');
 assert.equal(await page.evaluate(()=>window.beforeInputs.every(({el,value,id})=>el.value===value&&el.id===id)),true);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:19,failed:0,untranslatedEnglish:[...new Set(english.leftovers)],pageErrors:errors},null,2));
}finally{await context.close();await browser.close();}
