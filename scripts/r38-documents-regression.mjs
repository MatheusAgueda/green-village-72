import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {homedir} from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {crc32,deflateSync} from 'node:zlib';
import {COMMERCIAL_COPY,COMMERCIAL_TERMS,COMMERCIAL_TRANSLATIONS} from '../dist/commercial-terms.js';
import {createPDFI18n,rawPDF} from '../dist/pdf-i18n.js';
import {createImageArchive} from '../dist/image-archive.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';

const languages=['pt','en','es','fr','it'],checks=[];
const check=async(name,run)=>{await run();checks.push(name);console.log('PASS '+name);};
const source=await fs.readFile(new URL('../dist/pdf-i18n.js',import.meta.url),'utf8');
const rows=vm.runInNewContext(source.slice(source.indexOf('const COPY='),source.indexOf('const LANGUAGES='))+';COPY',{COMMERCIAL_TRANSLATIONS});
await check('Every authored PDF phrase and commercial term has all five translations',()=>{
 for(const row of rows){
  assert.equal(row.length,5,row[0]);
  for(const [index,language] of languages.entries()){
   assert.ok(typeof row[index]==='string'&&row[index].length,row[0]+'/'+language);
   assert.equal(createPDFI18n(language).t(row[0]),row[index],row[0]+'/'+language);
  }
 }
 for(const language of languages)for(const [key,original] of Object.entries(COMMERCIAL_COPY.pt))assert.equal(createPDFI18n(language).t(original),COMMERCIAL_COPY[language][key]);
 assert.deepEqual(COMMERCIAL_TERMS.delivery,{minWorkingDays:90,maxWorkingDays:180});
 assert.equal(COMMERCIAL_TERMS.onSiteDays,30);
 assert.deepEqual(COMMERCIAL_TERMS.warranty,{structureYears:10,expansionSystemYears:5,finishesYears:2});
 assert.match(COMMERCIAL_COPY.fr.faq,/90 à 180 jours ouvrés/);
 assert.match(COMMERCIAL_COPY.it.faq,/90 a 180 giorni lavorativi/);
 assert.doesNotMatch(COMMERCIAL_COPY.fr.faq,/30 jours ouvrés/);
 assert.doesNotMatch(COMMERCIAL_COPY.it.faq,/30 giorni lavorativi/);
});
await check('Client text, filenames and unknown-language fallback are preserved',()=>{
 for(const language of languages)for(const value of ['Cozinha','Local: Cozinha\nData: Cozinha','Cozinha.pdf','Prénom: Élise / Città: Forlì / 客戶'])assert.equal(createPDFI18n(language).t(rawPDF(value)),value);
 assert.equal(createPDFI18n('constructor').lang,'pt');
 assert.equal(createPDFI18n('unknown').t('Projecto do cliente'),'Projecto do cliente');
});
await check('FR/IT PDF quantities, roof descriptions, client page counts, currency and dates are localized',()=>{
 const expected={fr:['2 sur 3 à attribuer.','Plan du client · page 2 sur 3','1 chambre · 1 salle de bains · toit à deux pans · porche sélectionné','4 chambres · 1 salle de bains · toit plat'],it:['2 di 3 da assegnare.','Planimetria del cliente · pagina 2 di 3','1 camera da letto · 1 bagno · tetto a due falde · portico selezionato','4 camere da letto · 1 bagno · copertura piana']};
 const inputs=['2 de 3 por atribuir','Planta do cliente · página 2 de 3','1 quarto · 1 casa de banho · telhado triangular · alpendre seleccionado','4 quartos · 1 casa de banho · cobertura plana'];
 for(const language of ['fr','it']){
  const pdf=createPDFI18n(language);
  inputs.forEach((input,index)=>assert.equal(pdf.t(input),expected[language][index]));
  assert.equal(pdf.t('2. Projecto do cliente'),'2. '+pdf.t('Projecto do cliente'));
  assert.equal(pdf.t('Projecto do cliente\nData do projecto'),pdf.t('Projecto do cliente')+'\n'+pdf.t('Data do projecto'));
  assert.equal(pdf.money(120000),new Intl.NumberFormat(pdf.locale,{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(1200));
  assert.equal(pdf.date('2026-10-05'),new Intl.DateTimeFormat(pdf.locale).format(new Date('2026-10-05T12:00:00Z')));
  assert.doesNotMatch(pdf.t('O modelo 3D representa uma frente. As restantes 3 unidades são pedidos adicionais, com aplicação sujeita a validação.'),/As restantes|pedidos adicionais|validação/);
 }
});
function chunk(type,bytes=Buffer.alloc(0)){
 const content=Buffer.concat([Buffer.from(type),bytes]),size=Buffer.alloc(4),checksum=Buffer.alloc(4);
 size.writeUInt32BE(bytes.length);checksum.writeUInt32BE(crc32(content));return Buffer.concat([size,content,checksum]);
}
function png(){
 const header=Buffer.alloc(13);header.writeUInt32BE(3840);header.writeUInt32BE(2160,4);header[8]=8;header[9]=2;
 return new Blob([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.alloc((3840*3+1)*2160))),chunk('IEND')],{type:'image/png'});
}
function zipEntries(buffer){
 const entries=new Map(),view=new DataView(buffer);let offset=0;
 while(view.getUint32(offset,true)===0x04034b50){
  const size=view.getUint32(offset+18,true),nameSize=view.getUint16(offset+26,true),extraSize=view.getUint16(offset+28,true);
  const start=offset+30+nameSize+extraSize,name=new TextDecoder().decode(buffer.slice(offset+30,offset+30+nameSize));
  entries.set(name,new TextDecoder().decode(buffer.slice(start,start+size)));offset=start+size;
 }
 return entries;
}
await check('FR/IT ZIP readmes and validation messages localize without exposing private client data',async()=>{
 const blob=png(),images=['01.png','02.png','03.png'].map(name=>({name,blob}));
 for(const [language,heading,term,countError] of [['fr','GREEN VILLAGE — VOTRE MAISON','Le terrain et le jardin ne sont pas inclus.','Trois images sont nécessaires'],['it','GREEN VILLAGE — LA SUA CASA','Il terreno e il giardino non sono inclusi.','Sono necessarie tre immagini']]){
  const options={images,lang:language,reference:'GV72-TEST',configuration:{...structuredClone(DEFAULT_CONFIG),clientName:'PRIVATE_CLIENT',notes:'PRIVATE_NOTES',attachments:[{dataUrl:'PRIVATE_BYTES'}]}};
  const entries=zipEntries(await (await createImageArchive(options)).arrayBuffer()),readme=entries.get('README.txt');
  assert.ok(readme.startsWith(heading));assert.ok(readme.includes(term));assert.ok(readme.includes('configuration.json'));
  assert.doesNotMatch(entries.get('configuration.json'),/PRIVATE_/);
  await assert.rejects(createImageArchive({...options,images:[]}),error=>error.message.includes(countError));
  await assert.rejects(createImageArchive({...options,images:[{name:'../bad.png',blob},...images.slice(1)]}),language==='fr'?/Nom d’image non valide/:/Nome immagine non valido/);
  await assert.rejects(createImageArchive({...options,images:[{name:'01.png',blob:new Blob(['bad'])},...images.slice(1)]}),language==='fr'?/Image PNG non valide/:/Immagine PNG non valida/);
 }
});

if(process.argv.includes('--browser')){
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{if(process.env.PLAYWRIGHT_MODULE)throw error;return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));});
 const output=path.resolve(process.env.AUDIT_OUTPUT||'audit/r38/documents');await fs.mkdir(output,{recursive:true});
 let server;const base=process.env.AUDIT_URL||'http://127.0.0.1:4198/';
 if(!process.env.AUDIT_URL){
  server=spawn(process.execPath,['scripts/serve.mjs','4198'],{cwd:new URL('..',import.meta.url),stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Preview server exited: '+code)));});
 }
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],documents=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  // Run the real PDF and presentation modules with their own local assets, without a duplicate WebGL scene.
  await page.route('**/*',route=>route.request().isNavigationRequest()?route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><title>R38 document verification</title></head><body><script src="vendor/pdf-lib.min.js"></script><script src="vendor/fontkit.umd.min.js"></script></body></html>'}):route.continue());
  await page.goto(base);await page.waitForFunction(()=>window.PDFLib&&window.fontkit);
  await check('Presentation controls and presentation mode relabel FR/IT actions and preserve behaviour',async()=>{
   const result=await page.evaluate(async()=>{
    const {setLanguage}=await import('./i18n.js'),{createPresentationControls}=await import('./presentation-controls.js'),{createPresentationMode}=await import('./presentation-mode.js');
    const anchor=document.createElement('div'),workspace=document.createElement('section'),viewport=document.createElement('div');document.body.append(anchor,workspace);workspace.append(viewport);
    const status={environment:'garden',active:'garden',ready:true,mood:'daylight',camera:'arrival',chapter:'arrival',playing:false,hasKitchen:true},events=[];
    const controls=createPresentationControls({anchor,getStatus:()=>status,onEnvironment:value=>{status.environment=value;},onMood:value=>{status.mood=value;},onCamera:value=>{status.camera=value;},onExport:()=>events.push('4k'),onExport8K:()=>events.push('8k'),onPresent:()=>events.push('present')});
    const presentation=createPresentationMode({workspace,viewport,getStatus:()=>status,onView:value=>{status.chapter=value;},onPlay:()=>{status.playing=true;},onPause:()=>{status.playing=false;},onExport:()=>events.push('presentation-4k'),onExport8K:()=>events.push('presentation-8k'),onExportSet:()=>events.push('zip')});
    const observations=[];
    for(const language of ['fr','it']){
     setLanguage(language);controls.root.querySelector('.presentation-start').click();controls.root.querySelector('.presentation-export-hd').click();
     status.ready=false;controls.update();const loading=controls.root.querySelector('.presentation-status').textContent;
     status.failures=['missing'];controls.update();const failed=controls.root.querySelector('.presentation-status').textContent;status.failures=[];status.ready=true;
     presentation.open();workspace.querySelector('[data-presentation-action="play"]').click();
     const pause=workspace.querySelector('[data-presentation-action="play"]').getAttribute('aria-label');
     workspace.querySelector('[data-presentation-action="next"]').click();workspace.querySelector('[data-presentation-action="export-set"]').click();
     observations.push({language,controlTitle:controls.root.getAttribute('aria-label'),controlText:controls.root.textContent,loading,failed,pause,presentationTitle:workspace.getAttribute('aria-label'),chapter:status.chapter,text:workspace.textContent});
     presentation.close();status.playing=false;status.chapter='arrival';
    }
    return {observations,events};
   });
   for(const observation of result.observations){
    const french=observation.language==='fr';assert.match(observation.controlTitle,french?/Votre maison/:/La sua casa/);
    assert.match(observation.loading,french?/Préparation du cadre/:/Preparazione dello scenario/);
    assert.match(observation.failed,french?/Cadre incomplet/:/Scenario incompleto/);
    assert.match(observation.pause,french?/Mettre la visite en pause/:/Mettere in pausa la visita/);
    assert.match(observation.presentationTitle,french?/Présentation de la maison/:/Presentazione della casa/);
    assert.equal(observation.chapter,'garden');assert.match(observation.text,french?/Trois images 4K/:/Tre immagini 4K/);
   }
   assert.deepEqual(result.events,['present','8k','zip','present','8k','zip']);
  });
  for(const language of ['fr','it'])for(const floorType of ['vinyl','spc'])await check('Actual '+language.toUpperCase()+' '+floorType+' PDF keeps private originals, prices, terms and page bounds',async()=>{
   const result=await page.evaluate(async({language,floorType})=>{
    const {createPortfolioPDF}=await import('./portfolio.js'),{DEFAULT_CONFIG,validateConfiguration}=await import('./configuration.js'),{emptyClientProject,setOptionSelection,catalogueEstimate}=await import('./project-options.js');
    let state=validateConfiguration({...DEFAULT_CONFIG});
    for(const id of ['window-930','ac-monosplit-12000','ac-multisplit-3x1'])state=validateConfiguration({...state,...setOptionSelection(state,id,{targets:[]})});
    if(floorType==='spc')state=validateConfiguration({...state,floorType:'spc',floorId:'floor-spc-kx7006'});
    const original=await PDFLib.PDFDocument.create();original.addPage().drawText('Cozinha ORIGINAL CLIENTE',{x:40,y:700});original.addPage();const originalBytes=await original.save();
    const base64=bytes=>{let text='';for(let i=0;i<bytes.length;i+=0x8000)text+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(text);},dataUrl='data:application/pdf;base64,'+base64(originalBytes);
    const project={...emptyClientProject(),clientName:'Cozinha',projectName:'Cozinha',projectDate:'2026-10-05',location:'Cozinha',contact:'Cozinha',kitchenStandard:'Cozinha',bathroomStandard:'Cozinha',adaptations:'Cozinha',notes:'Cozinha',optionNotes:{'window-930':'Cozinha'},requests:[{id:'r38-custom',title:'Cozinha',quantity:2,location:'Cozinha',notes:'Cozinha'}],attachments:[{id:'r38-original',kind:'plan',name:'Cozinha.pdf',mime:'application/pdf',size:originalBytes.length,dataUrl,notes:'Cozinha'}]};
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=700;canvas.getContext('2d').fillRect(0,0,800,700);
    const bytes=await createPortfolioPDF(state,{planImage:canvas.toDataURL('image/png'),project,lang:language});
    if(project.attachments[0].dataUrl!==dataUrl)throw new Error('Original client PDF changed');
    const estimate=catalogueEstimate(state),spc=estimate.lines.filter(line=>line.id==='floor-spc-upgrade');
    return {pdf:base64(bytes),pages:(await PDFLib.PDFDocument.load(bytes)).getPageCount(),subtotal:estimate.knownSubtotalCents,spcLines:spc.length,spcAmount:spc[0]?.totalCents,spcVAT:spc[0]?.item.vatIncluded};
   },{language,floorType});
   const file=path.join(output,language+'-'+floorType+'.pdf');await fs.writeFile(file,Buffer.from(result.pdf,'base64'));
   const extracted=spawnSync('pdftotext',['-layout',file,'-'],{encoding:'utf8'});assert.equal(extracted.status,0,extracted.stderr);await fs.writeFile(file.replace(/\.pdf$/,'.txt'),extracted.stdout);
   const flat=extracted.stdout.replace(/\s+/g,' '),pdf=createPDFI18n(language);
   assert.ok(flat.includes('Cozinha.pdf'));assert.ok(flat.includes('Cozinha ORIGINAL CLIENTE'));assert.ok((flat.match(/Cozinha/g)||[]).length>=12);
   for(const term of ['A sua configuração.','Projecto do cliente','Validação do projecto',COMMERCIAL_COPY.pt.delivery,COMMERCIAL_COPY.pt.structure,COMMERCIAL_COPY.pt.expansion,COMMERCIAL_COPY.pt.finishes,COMMERCIAL_COPY.pt.assembly,'IVA: enquadramento por confirmar.'])assert.ok(flat.includes(pdf.t(term)),language+': missing '+pdf.t(term));
   for(const term of ['A sua configuração.','Dados e preferências registados','IVA já incluído; não','Validação do projecto','Por confirmar na proposta comercial.','dias úteis'])assert.ok(!flat.includes(term),language+': untranslated '+term);
   assert.ok(flat.includes(pdf.money(result.subtotal).replace(/\s+/g,' ')));assert.equal(result.subtotal,floorType==='spc'?183000:63000);assert.equal(result.spcLines,floorType==='spc'?1:0);
   if(floorType==='spc'){assert.equal(result.spcAmount,120000);assert.equal(result.spcVAT,null);assert.ok(flat.includes(pdf.money(120000).replace(/\s+/g,' ')));}
   else assert.ok(flat.includes(pdf.t('Pavimento vinílico (incluído)')));
   const bbox=spawnSync('pdftotext',['-bbox',file,'-'],{encoding:'utf8'});assert.equal(bbox.status,0,bbox.stderr);
   for(const word of bbox.stdout.matchAll(/<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)"/g))assert.ok(+word[1]>=0&&+word[2]>=0&&+word[3]<=596&&+word[4]<=843,'PDF text outside page bounds');
   let tableHeaders=0;
   for(const [,markup] of bbox.stdout.matchAll(/<page\b[^>]*>([\s\S]*?)<\/page>/g)){
    const words=[...markup.matchAll(/<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)">([^<]*)<\/word>/g)].map(match=>({left:+match[1],top:+match[2],right:+match[3],text:match[5]}));
    for(const quantity of words.filter(word=>word.text===(language==='fr'?'Qté':'Qtà'))){
     const price=words.find(word=>word.text===(language==='fr'?'Prix':'Prezzo')&&Math.abs(word.top-quantity.top)<.1&&word.left>300);
     assert.ok(price&&price.left>=quantity.right+6,'Retail-price header overlaps the quantity heading');tableHeaders++;
    }
   }
   assert.ok(tableHeaders>0,'No commercial table header was verified');
   assert.ok(result.pages>=10&&result.pages<24);documents.push({language,floorType,file,pages:result.pages,subtotal:result.subtotal});
  });
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'verification.json'),JSON.stringify({checks,documents,errors},null,2));
 }finally{await browser.close();server?.kill();}
}
console.log(JSON.stringify({passed:checks.length,failed:0,pdfPhrases:rows.length,browser:process.argv.includes('--browser')}));
