import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createPDFI18n,rawPDF} from '../dist/pdf-i18n.js';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright').catch(error=>{if(process.env.PLAYWRIGHT_MODULE)throw error;return import(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));});
const out=path.resolve(process.env.AUDIT_OUTPUT||'audit/r24/pdf');await fs.mkdir(out,{recursive:true});
const report={checks:[],documents:[],errors:[]};
const check=(name,fn)=>Promise.resolve().then(fn).then(()=>report.checks.push({name,pass:true}));
for(const lang of ['pt','en','es']){
 const locale=createPDFI18n(lang);
 assert.equal(locale.t(rawPDF('Cozinha')),'Cozinha');assert.equal(locale.t(rawPDF('Cozinha.pdf')),'Cozinha.pdf');
 assert.equal(locale.t(rawPDF('Local: Cozinha\nData: Cozinha')),'Local: Cozinha\nData: Cozinha');
 assert.equal(locale.money(120000),new Intl.NumberFormat(locale.locale,{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(1200));
}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',error=>report.errors.push(error.message));
try{
 await page.goto(process.env.AUDIT_URL||'http://127.0.0.1:4194/');await page.waitForFunction(()=>window.PDFLib&&window.fontkit);
 for(const lang of ['pt','en','es'])for(const floorType of ['vinyl','spc'])await check('Actual '+lang.toUpperCase()+' '+floorType+' PDF preserves client copy, prices and translated sections',async()=>{
  const result=await page.evaluate(async({lang,floorType})=>{
   const {createPortfolioPDF}=await import('./portfolio.js?r24-pdf-audit');
   const {DEFAULT_CONFIG,validateConfiguration}=await import('./configuration.js');
   const {emptyClientProject,setOptionSelection,catalogueEstimate}=await import('./project-options.js');
   let state=validateConfiguration({...DEFAULT_CONFIG});
   for(const id of ['window-930','ac-monosplit-12000','ac-multisplit-3x1'])state=validateConfiguration({...state,...setOptionSelection(state,id,{targets:[]})});
   if(floorType==='spc')state=validateConfiguration({...state,floorType:'spc',floorId:'floor-spc-kx7006'});
   const original=await PDFLib.PDFDocument.create();original.addPage().drawText('Cozinha ORIGINAL CLIENTE',{x:40,y:700});original.addPage();
   const originalBytes=await original.save(),base64=bytes=>{let text='';for(let i=0;i<bytes.length;i+=0x8000)text+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(text);};
   const dataUrl='data:application/pdf;base64,'+base64(originalBytes);
   const project={...emptyClientProject(),clientName:'Cozinha',projectName:'Cozinha',projectDate:'2026-09-27',location:'Cozinha',contact:'Cozinha',kitchenStandard:'Cozinha',bathroomStandard:'Cozinha',adaptations:'Cozinha',notes:'Cozinha',optionNotes:{'window-930':'Cozinha'},requests:[{id:'r24-custom',title:'Cozinha',quantity:2,location:'Cozinha',notes:'Cozinha'}],attachments:[{id:'r24-original',kind:'plan',name:'Cozinha.pdf',mime:'application/pdf',size:originalBytes.length,dataUrl,notes:'Cozinha'}]};
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=700;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,800,700);
   const bytes=await createPortfolioPDF(state,{planImage:canvas.toDataURL('image/png'),project,lang});
   if(project.attachments[0].dataUrl!==dataUrl)throw new Error('Original client PDF was mutated');
   const estimate=catalogueEstimate(state),spc=estimate.lines.filter(line=>line.id==='floor-spc-upgrade');
   return {pdf:base64(bytes),pages:(await PDFLib.PDFDocument.load(bytes)).getPageCount(),subtotal:estimate.knownSubtotalCents,spcLines:spc.length,spcAmount:spc[0]?.totalCents,spcVAT:spc[0]?.item.vatIncluded};
  },{lang,floorType});
  const file=path.join(out,lang+'-'+floorType+'.pdf');await fs.writeFile(file,Buffer.from(result.pdf,'base64'));
  const textFile=path.join(out,lang+'-'+floorType+'.txt'),extract=spawnSync('pdftotext',['-layout',file,textFile],{encoding:'utf8'});
  assert.equal(extract.status,0,extract.stderr);const text=await fs.readFile(textFile,'utf8'),flat=text.replace(/\s+/g,' ');
  assert.ok(flat.includes('Cozinha.pdf'));assert.ok(flat.includes('Cozinha ORIGINAL CLIENTE'));assert.ok((flat.match(/Cozinha/g)||[]).length>=12);
  const expected={pt:['A sua configuração.','Projecto do cliente','Validação do projecto','Não foi acrescentado IVA'],en:['Your configuration.','Client project','Project validation','not the total home price','VAT has not been added','are not free','Single-split installation is included'],es:['Su configuración.','Proyecto del cliente','Validación del proyecto','no es el precio total de la vivienda','No se ha añadido IVA','no son gratuitos','La instalación del monosplit está incluida']}[lang];
  for(const term of expected)assert.ok(flat.includes(term),'Missing '+lang+': '+term);
  if(lang!=='pt')for(const term of ['A sua configuração.','Dados e preferências registados','IVA já incluído; não','Validação do projecto','Por confirmar na proposta comercial.'])assert.ok(!flat.includes(term),'Untranslated '+lang+': '+term);
  const expectedMoney=createPDFI18n(lang).money(result.subtotal).replace(/\s+/g,' ');assert.ok(flat.includes(expectedMoney),'Missing localized subtotal '+expectedMoney);
  assert.equal(result.subtotal,floorType==='spc'?183000:63000);assert.equal(result.spcLines,floorType==='spc'?1:0);
  if(floorType==='spc'){assert.equal(result.spcAmount,120000);assert.equal(result.spcVAT,null);assert.ok(flat.includes(createPDFI18n(lang).money(120000).replace(/\s+/g,' ')));assert.ok(flat.includes({pt:'IVA: enquadramento por confirmar.',en:'VAT: treatment to be confirmed.',es:'IVA: régimen pendiente de confirmar.'}[lang]));}
  else assert.ok(flat.includes({pt:'Pavimento vinílico (incluído)',en:'Vinyl flooring (included)',es:'Pavimento vinílico (incluido)'}[lang]));
  const bbox=spawnSync('pdftotext',['-bbox',file,'-'],{encoding:'utf8'});assert.equal(bbox.status,0);
  for(const word of bbox.stdout.matchAll(/<word xMin="([\d.-]+)" yMin="([\d.-]+)" xMax="([\d.-]+)" yMax="([\d.-]+)"/g))assert.ok(+word[1]>=0&&+word[2]>=0&&+word[3]<=596&&+word[4]<=843,'PDF text outside page bounds');
  assert.ok(result.pages>=10&&result.pages<24);report.documents.push({lang,floorType,file,pages:result.pages,subtotal:result.subtotal,spcLines:result.spcLines});
 });
 assert.deepEqual(report.errors,[]);await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.checks.length,documents:report.documents,errors:report.errors},null,2));
}finally{await browser.close();}
