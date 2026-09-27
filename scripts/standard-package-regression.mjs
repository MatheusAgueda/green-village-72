import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {DEFAULT_CONFIG,validateConfiguration,encodeConfiguration,decodeConfiguration,summaryRows} from '../dist/configuration.js';
import {STANDARD_PACKAGE,ADAPTATION_REQUESTS,adaptationEstimate,standardPatch,layoutSelectionPatch} from '../dist/standard-package.js';
import {catalogueEstimate,emptyClientProject,CATALOGUE_EDITION} from '../dist/project-options.js';
import {createHistory,migrateStoredConfiguration,shareConfiguration,readSharedConfiguration,sourceLedger} from '../dist/client-tools.js';
import {currentCataloguePrice} from '../dist/commercial-prices.js';
import {CATALOGUE_OPTIONS} from '../dist/technical-data.js';
import {standardSpecificationMarkup,clientSummaryMarkup} from '../dist/project-ui.js';
import {makeHouse} from '../dist/model.js';
import {appendClientDossier} from '../dist/project-pdf.js';
const results=[];
async function test(name,run){await run();results.push({name,pass:true});}
const config=patch=>validateConfiguration({...DEFAULT_CONFIG,...patch});
const quote=id=>adaptationEstimate(config({adaptationRequests:[id]}));

await test('confirmed photographs and new-project L-shaped default',()=>{
  assert.equal(DEFAULT_CONFIG.kitchenRef,'kitchen-14');assert.equal(DEFAULT_CONFIG.bathroomRef,'bathroom-17');
  assert.equal(DEFAULT_CONFIG.kitchen,'l');assert.equal(adaptationEstimate(DEFAULT_CONFIG).lines.length,0);
  assert.equal(catalogueEstimate(DEFAULT_CONFIG).knownSubtotalCents,0);
});
await test('old saved configurations retain their reference and layout',()=>{
  const old={...DEFAULT_CONFIG,kitchen:'linear',kitchenRef:'kitchen-01',bathroomRef:'bathroom-01'};delete old.adaptationRequests;
  const restored=migrateStoredConfiguration(JSON.stringify(old)).configuration;
  assert.equal(restored.kitchenRef,'kitchen-01');assert.equal(restored.bathroomRef,'bathroom-01');assert.equal(restored.kitchen,'linear');
  assert.deepEqual(restored.adaptationRequests,[]);assert.equal(adaptationEstimate(restored).lines.length,3);
});
for(const item of ADAPTATION_REQUESTS)await test('separate null-price request: '+item.id,()=>{
  assert.equal(quote(item.id).lines.length,1);assert.equal(quote(item.id).lines[0].priceCents,null);
});
await test('requests survive JSON sharing history and recovery without client data',()=>{
  const chosen=config({adaptationRequests:ADAPTATION_REQUESTS.map(item=>item.id)});
  assert.deepEqual(decodeConfiguration(encodeConfiguration(chosen)),chosen);
  assert.deepEqual(readSharedConfiguration(new URL(shareConfiguration(chosen,'https://example.test/')).hash),chosen);
  const history=createHistory(DEFAULT_CONFIG);history.push(chosen);assert.deepEqual(history.undo(),config({}));assert.deepEqual(history.redo(),chosen);
});
await test('invalid or duplicate quote requests rejected',()=>{
  for(const value of [null,{},['unknown'],['bathroom-extension','bathroom-extension']])assert.throws(()=>config({adaptationRequests:value}));
});
await test('mirrored layout and explicit relocation remain one quote line',()=>{
  const s=config({bathroom:'mirrored',adaptationRequests:['bathroom-basin-position']});
  assert.equal(adaptationEstimate(s).lines.length,1);assert.match(adaptationEstimate(s).lines[0].detail,/espelhada/);
});
await test('alternative pictures/layout/wall always disclose quotation',()=>{
  for(const patch of [{kitchenRef:'kitchen-08'},{bathroomRef:'bathroom-08'},{kitchen:'u'},{kitchen:'none'},{bathroomUV:'bathroom-uv-amostra-1'}])assert.ok(adaptationEstimate(config(patch)).lines.length>0);
});
await test('return to standard clears only that room requests and extras',()=>{
  const original=config({kitchenRef:'kitchen-08',bathroom:'mirrored',adaptationRequests:['kitchen-worktop','bathroom-extension'],optionSelections:[{id:'kitchen-upper',quantity:1},{id:'window-930',quantity:1}]});
  const restored=config({...original,...standardPatch('kitchen',original)});
  assert.equal(restored.kitchenRef,'kitchen-14');assert.deepEqual(restored.adaptationRequests,['bathroom-extension']);
  assert.equal(restored.optionSelections[0].id,'window-930');assert.equal(restored.bathroom,'mirrored');
});
await test('T4 A explicit choice uses linear adaptation, import remains strict',()=>{
  assert.throws(()=>config({layout:'t4-a'}));const s=config(layoutSelectionPatch('t4-a',DEFAULT_CONFIG));
  assert.equal(s.kitchen,'linear');assert.equal(adaptationEstimate(s).lines[0].id,'kitchen-layout');
});
await test('current 580 EUR upper charge never prices another adaptation',()=>{
  const chosen=config({optionSelections:[{id:'kitchen-upper',quantity:1}],adaptationRequests:['bathroom-extension','bathroom-worktop']});
  assert.equal(catalogueEstimate(chosen).knownSubtotalCents,58000);assert.equal(adaptationEstimate(chosen).lines.length,2);
  assert.ok(adaptationEstimate(chosen).lines.every(line=>line.priceCents===null));assert.equal(CATALOGUE_EDITION,'20/09/2026');
});
await test('22 current PVP mappings preserve July documentary prices',()=>{
  for(const item of CATALOGUE_OPTIONS)assert.equal(currentCataloguePrice(item.id).edition,'2026-09-20');
  assert.equal(currentCataloguePrice('kitchen-upper').value,580);
  assert.equal(CATALOGUE_OPTIONS.find(item=>item.id==='kitchen-upper').cataloguePrice.value,700);
  const ledger=sourceLedger(DEFAULT_CONFIG);assert.equal(ledger.commercialPrices.length,22);assert.equal(ledger.standardPackage.kitchen.ref,'kitchen-14');
});
await test('UI and summary distinguish standard, choice and unpaid quote',()=>{
  assert.match(standardSpecificationMarkup('kitchen',DEFAULT_CONFIG),/580,00/);
  assert.match(standardSpecificationMarkup('bathroom',DEFAULT_CONFIG),/bathroom-17.jpg/);
  const summary=clientSummaryMarkup(emptyClientProject(),config({adaptationRequests:['bathroom-extension']}));
  assert.match(summary,/Ampliar a casa de banho/);assert.match(summary,/Sob orçamento/);assert.match(summary,/Cozinha standard confirmada/);
  assert.match(summaryRows(config({kitchen:'linear'})).at(-1)[1],/Alteração da implantação/);
});
await test('actual geometry uses confirmed kitchen/bath reference profiles',()=>{
  const house=makeHouse(DEFAULT_CONFIG);
  try{assert.equal(house.details.kitchen.id,'kitchen-14');assert.equal(house.details.bath.id,'bathroom-17');assert.equal(house.details.bath.vessel,false);assert.equal(house.details.bath.shower,'sliding');assert.equal(house.details.kitchen.sinkVisible,false);}finally{house.dispose();}
});
await test('real PDF export includes standard photographs and quote requests',async()=>{
  vm.runInThisContext(readFileSync(new URL('../dist/vendor/pdf-lib.min.js',import.meta.url),'utf8'));
  globalThis.window={PDFLib:globalThis.PDFLib};
  const originalFetch=globalThis.fetch;globalThis.fetch=async src=>new Response(readFileSync(new URL('../dist/'+src,import.meta.url)));
  try{
    const doc=await PDFLib.PDFDocument.create();
    const state=config({bathroom:'mirrored',adaptationRequests:['bathroom-worktop','bathroom-extension'],optionSelections:[{id:'kitchen-upper',quantity:1}]});
    const project={...emptyClientProject(),clientName:'Cliente de teste R19',projectDate:'2026-09-21'};
    await appendClientDossier(doc,{state,project});
    assert.ok(doc.getPageCount()>=5);mkdirSync('audit/r19',{recursive:true});
    writeFileSync('audit/r19/ficha-standard-verificacao.pdf',await doc.save());
  }finally{globalThis.fetch=originalFetch;}
});
mkdirSync('audit/r19',{recursive:true});writeFileSync('audit/r19/standard-regression.json',JSON.stringify({passed:results.length,failed:0,results},null,2));
console.log(JSON.stringify({passed:results.length,failed:0,pdf:'audit/r19/ficha-standard-verificacao.pdf'}));
