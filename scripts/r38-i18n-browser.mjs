import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.PLAYWRIGHT_MODULE||`${process.env.HOME}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`;
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const context=await browser.newContext();
const page=await context.newPage(),base=process.env.GV72_BASE_URL||'http://127.0.0.1:4398';
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 await page.route('**/__r38_i18n_test__*',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="pt-PT"><head><title>Test</title><meta name="description" content="Test"></head><body></body></html>'}));
 await page.goto(base+'/__r38_i18n_test__?lang=fr');
 await page.evaluate(async()=>{
  localStorage.setItem('gv72-language','en');
  const [{DEFAULT_CONFIG,flooringSelectionPatch},{emptyClientProject},{clientProjectMarkup,clientSummaryMarkup,floorChoiceMarkup,optionsPanelMarkup},{getPlan},i18n]=await Promise.all([import('/configuration.js'),import('/project-options.js'),import('/project-ui.js'),import('/specification.js'),import('/i18n.js')]);
  window.i18n=i18n;
  const state={...DEFAULT_CONFIG,...flooringSelectionPatch(DEFAULT_CONFIG,'spc'),optionSelections:[{id:'window-large',quantity:2,targets:[],variant:''}]};
  const client={...emptyClientProject(),clientName:'Cozinha',notes:'Nome do cliente',optionNotes:{'window-large':'Casa de banho'},requests:[{id:'test',title:'Cozinha',quantity:2,location:'Casa de banho',notes:'Abrir portas e janelas'}],attachments:[{id:'photo-test',kind:'photo',name:'Cozinha.pdf',mime:'image/png',notes:'Nome do cliente',dataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT8sAAAAASUVORK5CYII='}]};
  document.body.innerHTML='<button data-language="pt">PT</button><button data-language="en">EN</button><button data-language="es">ES</button><button data-language="fr">FR</button><button data-language="it">IT</button><p id="dynamic-status">A guardar a ficha…</p><button id="dynamic-aria" aria-label="Abrir portas e janelas">Abrir portas e janelas</button><div id="record">'+clientProjectMarkup(client,state)+'</div><div id="floor">'+floorChoiceMarkup(state)+'</div><div id="summary">'+clientSummaryMarkup(client,state)+'</div><div id="options">'+optionsPanelMarkup(state,getPlan(state),'all',client)+'</div><select id="preserved"><optgroup label="Casa e ambientes"><option value="bathroom">Casa de banho</option></optgroup></select>';
  window.beforeInputs=[...document.querySelectorAll('input,textarea,select')].map(el=>({el,value:el.value,id:el.id}));
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),records=[];
  while(walker.nextNode())records.push({node:walker.currentNode,source:walker.currentNode.nodeValue});
  window.beforeText=records;
  i18n.initI18n();
 });
 assert.equal(await page.locator('html').getAttribute('lang'),'fr-FR');
 await page.getByRole('button',{name:'FR',exact:true}).click();
 await page.waitForFunction(()=>document.documentElement.lang==='fr-FR'&&document.querySelector('#dynamic-status').textContent==='Enregistrement de la fiche…');
 const french=await page.evaluate(()=>({
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
 assert.equal(french.heading,'Un projet qui porte un nom.');assert.equal(french.upload,'Importer le plan défini par le client');
 assert.equal(french.floor,'SPC · +1 200 €');assert.equal(french.group,'Maison et pièces');assert.equal(french.aria,'Ouvrir les portes et fenêtres');
 assert.equal(french.attachmentName,'Photographie de référence · Cozinha.pdf');assert.equal(french.fileAlt,'Cozinha.pdf');assert.equal(french.removeAria,'Retirer Cozinha.pdf');
 assert.equal(french.summaryName,'Cozinha');assert.equal(french.requestTitle,'2 × Cozinha');assert.equal(french.inputs,true);
 assert.deepEqual(french.leftovers,[],'Untranslated French customer-control messages');
 await page.evaluate(()=>{
  document.querySelector('#dynamic-status').firstChild.nodeValue='Ficha guardada neste dispositivo.';
  document.querySelector('#dynamic-aria').setAttribute('aria-label','Fechar portas e janelas');
  document.querySelector('#dynamic-aria').textContent='Fechar portas e janelas';
 });
 await page.waitForFunction(()=>document.querySelector('#dynamic-status').textContent==='Fiche enregistrée sur cet appareil.'&&document.querySelector('#dynamic-aria').getAttribute('aria-label')==='Fermer les portes et fenêtres');
 await page.getByRole('button',{name:'IT',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#dynamic-status').textContent==='Scheda salvata su questo dispositivo.');
 assert.equal(await page.locator('[data-client-upload="plan"]').evaluate(el=>el.previousElementSibling.textContent),'Carica la planimetria definita dal cliente');
 assert.equal(await page.locator('html').getAttribute('lang'),'it-IT');
 assert.match(await page.title(),/Espandibile/);
 assert.match(await page.locator('meta[name="description"]').getAttribute('content'),/casa espandibile/);
 const italian=await page.evaluate(()=>({
  inputs:window.beforeInputs.every(({el,value,id})=>el.value===value&&el.id===id),
  attachmentName:document.querySelector('.client-attachment > strong').textContent,
  fileAlt:document.querySelector('.client-attachment img').alt,
  removeAria:document.querySelector('[data-remove-attachment]').getAttribute('aria-label'),
  summaryName:document.querySelector('.client-summary > h3').textContent,
  requestTitle:document.querySelector('.client-request > strong')?.textContent,
  leftovers:window.beforeText.filter(({node,source})=>node.isConnected&&node.nodeValue===source&&/\b(?:[A-Za-z]+ção|[A-Za-z]+ções|[A-Za-z]+ão|[A-Za-z]+ões|Escolha|confirma[rç]|fornecid|por |para |do |da |com )/u.test(source)&&!node.parentElement.closest('textarea,.client-preserve-lines,.client-summary dl dd,.client-summary > h3,.client-request > strong,.client-request > p:not(:last-child)')).map(({source})=>source.trim()).filter(Boolean)
 }));
 assert.equal(italian.inputs,true);assert.equal(italian.attachmentName,'Fotografia di riferimento · Cozinha.pdf');assert.equal(italian.fileAlt,'Cozinha.pdf');assert.equal(italian.removeAria,'Rimuovi Cozinha.pdf');assert.equal(italian.summaryName,'Cozinha');assert.equal(italian.requestTitle,'2 × Cozinha');assert.deepEqual(italian.leftovers,[]);
 assert.equal(await page.evaluate(()=>localStorage.getItem('gv72-language')),'it');

 await page.getByRole('button',{name:'PT',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#dynamic-status').textContent==='Ficha guardada neste dispositivo.');
 assert.equal(await page.locator('#dynamic-aria').getAttribute('aria-label'),'Fechar portas e janelas');
 assert.equal(await page.locator('#preserved optgroup').getAttribute('label'),'Casa e ambientes');
 assert.equal(await page.evaluate(()=>window.beforeInputs.every(({el,value,id})=>el.value===value&&el.id===id)),true);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:29,failed:0,untranslatedFrench:[...new Set(french.leftovers)],untranslatedItalian:[...new Set(italian.leftovers)],pageErrors:errors},null,2));
}finally{await context.close();await browser.close();}
