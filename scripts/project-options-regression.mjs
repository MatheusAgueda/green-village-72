import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as options from '../dist/project-options.js';
import {DEFAULT_CONFIG,validateConfiguration,encodeConfiguration,decodeConfiguration} from '../dist/configuration.js';
import {getPlan} from '../dist/specification.js';
import {DATA} from '../dist/data.js';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
const {OPTIONAL_ITEMS,itemById,validateOptionSelections,setOptionSelection,catalogueEstimate,availableOptionTargets,applyOpeningOptions,emptyClientProject,validateClientProject,optionTargetLabel}=options;
const results=[];
async function test(name,run){try{await run();results.push({name,pass:true});}catch(error){results.push({name,pass:false,error:String(error.message).slice(0,1400)});}}
const selection=(id,quantity=1,targets=[],variant='')=>({id,quantity,targets,variant});
const state=(selections=[],layout='t2')=>({...DEFAULT_CONFIG,layout,kitchen:layout==='t4-a'?'linear':DEFAULT_CONFIG.kitchen,optionSelections:selections});
const rejected=run=>assert.throws(run);

await test('catalogue: 22 source items and 4 client options, 22 known prices',()=>{assert.equal(OPTIONAL_ITEMS.length,26);assert.equal(new Set(OPTIONAL_ITEMS.map(i=>i.id)).size,26);assert.equal(OPTIONAL_ITEMS.filter(i=>i.priceCents!==null).length,22);assert.equal(itemById('bathroom-separated').priceCents,null);});
for(const item of OPTIONAL_ITEMS){
 if(!item.commercialSource)await test('price source '+item.id,()=>assert.equal(item.priceCents,item.priceEurVatIncluded===null?null:item.priceEurVatIncluded*100));
 if(!item.commercialSource)await test('photo source '+item.id,async()=>{assert.match(item.photo,/^assets\/catalogue\//);await access(root+'/dist/'+item.photo);assert.ok(item.photoCaption);assert.ok(Number.isInteger(item.photoPage));});
 await test('default choice '+item.id,()=>assert.equal(validateOptionSelections([{id:item.id,quantity:1}])[0].id,item.id));
 await test('quantity upper bound '+item.id,()=>rejected(()=>validateOptionSelections([selection(item.id,item.maxQuantity+1)])));
}
await test('photo limitations for kitchen and bathroom remain explicit',()=>{assert.match(itemById('kitchen-upper').photoCaption,/não identifica/i);assert.match(itemById('bathroom-separated').photoCaption,/por confirmar/i);assert.equal(itemById('kitchen-upper').photoPage,16);assert.equal(itemById('bathroom-separated').photoPage,18);});
for(const value of [null,{},'x',42,Array(23).fill(selection('bathroom-separated'))])await test('reject non-list or overlong '+JSON.stringify(value).slice(0,40),()=>rejected(()=>validateOptionSelections(value)));
for(const value of [null,[],true,42,'window-930',{}, {id:'unknown',quantity:1}])await test('reject malformed entry '+JSON.stringify(value),()=>rejected(()=>validateOptionSelections([value])));
for(const quantity of [undefined,null,0,-1,1.25,NaN,Infinity,-Infinity,'2',{},[],13])await test('reject invalid quantity '+String(quantity),()=>rejected(()=>validateOptionSelections([{id:'window-930',quantity,targets:[]}])));
for(const targets of [null,{},'entry',[null],[{},'entry'],[0],['entry','entry'],['side--1-10'],['side-0-0'],['side--2-0'],['bedroom-a-door'],['entry<script>']]){
 // null is intentionally normalized to an unassigned selection by the public API.
 if(targets===null)continue;
 await test('reject malformed target '+JSON.stringify(targets),()=>rejected(()=>validateOptionSelections([{id:'window-930',quantity:2,targets}])));
}
await test('targets cannot exceed quantity',()=>rejected(()=>validateOptionSelections([selection('window-930',1,['side-1-0','side--1-0'])])));
await test('known duplicate rejected',()=>rejected(()=>validateOptionSelections([selection('window-930'),selection('window-930')])));
await test('unpriced duplicate rejected',()=>rejected(()=>validateOptionSelections([selection('bathroom-separated'),selection('bathroom-separated')])));
await test('interior variant default',()=>assert.equal(validateOptionSelections([{id:'interior-door',quantity:1}])[0].variant,'wood'));
for(const variant of ['wood','aluminium','sliding'])await test('interior variant '+variant,()=>assert.equal(validateOptionSelections([selection('interior-door',1,['bath-door'],variant)])[0].variant,variant));
for(const variant of ['glass','WOOD',3,{}])await test('reject bad interior variant '+String(variant),()=>rejected(()=>validateOptionSelections([selection('interior-door',1,[],variant)])));
await test('reject unexpected variant on fixed item',()=>rejected(()=>validateOptionSelections([selection('window-930',1,[],'sliding')])));
for(const id of ['steel-door','thermal-glass-door'])for(const target of ['bath-window','front-window-1','rear-window--1','side-1-0','bath-door'])await test('door target role '+id+'/'+target,()=>rejected(()=>validateOptionSelections([selection(id,1,[target])])));
for(const target of ['entry','front-window-1','rear-window--1','bath-window','bath-door'])await test('side glass target role '+target,()=>rejected(()=>validateOptionSelections([selection('side-glass-door',1,[target])])));
await test('glass front multiple assemblies can be requested',()=>assert.equal(validateOptionSelections([selection('glass-front',2)])[0].quantity,2));
await test('glass front has no explicit target',()=>rejected(()=>validateOptionSelections([selection('glass-front',1,['entry'])])));
for(const id of ['window-930','window-mosquito'])for(const target of ['entry','bath-door'])await test('window target role '+id+'/'+target,()=>rejected(()=>validateOptionSelections([selection(id,1,[target])])));
await test('no physical target on material option',()=>rejected(()=>validateOptionSelections([selection('eps',1,['bath-window'])])));
await test('two window types same slot rejected',()=>rejected(()=>validateOptionSelections([selection('window-930',1,['side-1-0']),selection('window-large',1,['side-1-0'])])));
await test('screen can accompany a window',()=>assert.equal(validateOptionSelections([selection('window-930',1,['side-1-0']),selection('window-mosquito',1,['side-1-0'])]).length,2));
await test('EPS and rock wool exclusive',()=>rejected(()=>validateOptionSelections([selection('eps'),selection('rockwool')])));
await test('glass front and assigned entry exclusive',()=>rejected(()=>validateOptionSelections([selection('glass-front'),selection('steel-door',1,['entry'])])));
await test('glass front and assigned front window exclusive',()=>rejected(()=>validateOptionSelections([selection('glass-front'),selection('window-large',1,['front-window-1'])])));
await test('glass front and rear window compatible',()=>assert.equal(validateOptionSelections([selection('glass-front'),selection('window-large',1,['rear-window-1'])]).length,2));
for(const layout of DATA.layouts){
 const plan=getPlan(state([],layout.id));
 for(const item of OPTIONAL_ITEMS){
  const targets=availableOptionTargets(item,plan);
  for(const target of targets)await test('offered target accepted '+layout.id+'/'+item.id+'/'+target.id,()=>{const choice={id:item.id,quantity:1,targets:[target.id]};validateOptionSelections([choice]);validateConfiguration(state([choice],layout.id));});
 }
 for(const target of ['side--1-9','bedroom-9-door'])await test('reject absent target '+layout.id+'/'+target,()=>rejected(()=>validateConfiguration(state([{id:target.startsWith('bedroom')?'interior-door':'window-930',quantity:1,targets:[target]}],layout.id))));
}
await test('T0 absent bedroom door rejected',()=>rejected(()=>validateConfiguration(state([{id:'interior-door',quantity:1,targets:['bedroom-0-door']}],'t0'))));
await test('T3B absent rear side window rejected',()=>rejected(()=>validateConfiguration(state([selection('window-930',1,['rear-window-1'])],'t3-b'))));
await test('price arithmetic with quantity two and unknown price',()=>{const est=catalogueEstimate(state([selection('steel-door',2),selection('window-930',3),selection('bathroom-separated')]));assert.equal(est.knownSubtotalCents,121000);assert.equal(est.pending.length,1);assert.equal(est.pending[0].id,'bathroom-separated');assert.equal(est.pending[0].totalCents,null);assert.equal(est.complete,false);assert.equal(est.basePriceCents,null);assert.equal(est.unassigned.length,2);});
await test('unknown price only remains pending, not complete zero-price proposal',()=>{const est=catalogueEstimate(state([selection('bathroom-separated')]));assert.equal(est.knownSubtotalCents,0);assert.equal(est.pending.length,1);assert.equal(est.complete,false);});
await test('setter replaces EPS with rock wool',()=>{const patch=setOptionSelection(state([selection('eps')]),'rockwool',{});assert.deepEqual(patch.optionSelections.map(x=>x.id),['rockwool']);assert.equal(catalogueEstimate(patch).knownSubtotalCents,477000);});
await test('setter enables and disables roof and porch',()=>{assert.equal(setOptionSelection(state(),'gable-roof',{}).roof,true);assert.equal(setOptionSelection(state([selection('gable-roof')]),'gable-roof',null).roof,false);assert.equal(setOptionSelection(state(),'terrace',{}).porch,true);assert.equal(setOptionSelection(state([selection('terrace')]),'terrace',null).porch,false);});
await test('setter does not mutate caller selections',()=>{const s=state([selection('window-930',1,['side-1-0'])]);const original=structuredClone(s);setOptionSelection(s,'window-large',{targets:['side-1-0']});assert.deepEqual(s,original);});
await test('replacing fully-assigned window removes displaced quantity and charge',()=>{const patch=setOptionSelection(state([selection('window-930',1,['side-1-0'])]),'window-large',{targets:['side-1-0']});const est=catalogueEstimate(patch);assert.equal(est.knownSubtotalCents,65000,JSON.stringify(est.lines.map(l=>({id:l.id,quantity:l.quantity,targets:l.targets,totalCents:l.totalCents}))));});
await test('partial replacement preserves only surviving and pre-existing unassigned quantities',()=>{const patch=setOptionSelection(state([selection('window-930',3,['side-1-0','side--1-0'])]),'window-large',{targets:['side-1-0']});const previous=patch.optionSelections.find(x=>x.id==='window-930');assert.equal(previous.quantity,2);assert.deepEqual(previous.targets,['side--1-0']);assert.equal(catalogueEstimate(patch).knownSubtotalCents,91000);});
await test('glass front replacement removes displaced entry/front-window charges',()=>{const patch=setOptionSelection(state([selection('steel-door',1,['entry']),selection('window-930',2,['front-window-1','front-window--1'])]),'glass-front',{});const est=catalogueEstimate(patch);assert.equal(est.knownSubtotalCents,135000,JSON.stringify(est.lines.map(l=>({id:l.id,quantity:l.quantity,targets:l.targets,totalCents:l.totalCents}))));});
await test('selection roundtrip retains quantity, variant and physical targets',()=>{const s=state([selection('window-930',2,['side-1-0','side--1-0']),selection('interior-door',1,['bath-door'],'sliding'),selection('bathroom-separated')]);const restored=decodeConfiguration(encodeConfiguration(s));assert.deepEqual(restored.optionSelections,validateOptionSelections(s.optionSelections));});
await test('option target labels do not expose NaN for every offered target',()=>{for(const layout of DATA.layouts){const p=getPlan(state([],layout.id));for(const i of OPTIONAL_ITEMS)for(const t of availableOptionTargets(i,p))assert.doesNotMatch(optionTargetLabel(t.id),/NaN|undefined/);}});
await test('window dimensions and lateral door are applied to fresh plan',()=>{const plan=getPlan(state());applyOpeningOptions(plan.perimeter,plan.doors,state([selection('window-930',1,['bath-window']),selection('side-glass-door',1,['side-1-0'])]));const holes=plan.perimeter.flatMap(f=>f.holes);assert.equal(holes.find(h=>h.id==='bath-window').width,.93);assert.equal(holes.find(h=>h.id==='bath-window').height,.93);assert.equal(holes.find(h=>h.id==='side-1-0').kind,'door');});
await test('client default validates',()=>assert.equal(validateClientProject(emptyClientProject()).schemaVersion,1));
for(const date of ['2024-02-29','2026-01-01','2026-12-31'])await test('valid exact date '+date,()=>assert.equal(validateClientProject({...emptyClientProject(),projectDate:date}).projectDate,date));
for(const date of ['2026-02-29','2100-02-29','2026-02-30','2026-13-01','2026-00-10','2026-01-00','2026-1-1','garbage'])await test('reject invalid exact date '+date,()=>rejected(()=>validateClientProject({...emptyClientProject(),projectDate:date})));
for(const key of ['clientName','projectName','location','contact','kitchenStandard','bathroomStandard','adaptations','notes']){
 const limit=['kitchenStandard','bathroomStandard','adaptations','notes'].includes(key)?2400:160;
 await test('client max accepted '+key,()=>assert.equal(validateClientProject({...emptyClientProject(),[key]:'x'.repeat(limit)})[key].length,limit));
 await test('client too long rejected '+key,()=>rejected(()=>validateClientProject({...emptyClientProject(),[key]:'x'.repeat(limit+1)})));
 await test('client object field rejected '+key,()=>rejected(()=>validateClientProject({...emptyClientProject(),[key]:{x:1}})));
 await test('client control character rejected '+key,()=>rejected(()=>validateClientProject({...emptyClientProject(),[key]:'x\u0000y'})));
}
await test('client normalizes whitespace and preserves intended multiline text',()=>{const s=validateClientProject({...emptyClientProject(),clientName:'  Cliente de teste  ',notes:' linha 1\nlinha 2 '});assert.equal(s.clientName,'Cliente de teste');assert.equal(s.notes,'linha 1\nlinha 2');});
await test('client unknown/prototype keys discarded',()=>{const input=JSON.parse('{"schemaVersion":1,"projectDate":"2026-09-19","__proto__":{"polluted":true},"admin":true}');const out=validateClientProject(input);assert.equal(Object.hasOwn(out,'__proto__'),false);assert.equal(Object.hasOwn(out,'admin'),false);assert.equal({}.polluted,undefined);});
const {clientProjectMarkup,clientSummaryMarkup}=await import('../dist/project-ui.js');
const markupPayload='"><img src=x onerror=alert(1)></textarea><script>alert(1)</script>&';
const hostileClient=validateClientProject({...emptyClientProject(),clientName:markupPayload,projectName:markupPayload,contact:markupPayload,location:markupPayload,kitchenStandard:markupPayload,bathroomStandard:markupPayload,adaptations:markupPayload,notes:markupPayload});
for(const [name,render] of [['edit',clientProjectMarkup],['summary',clientSummaryMarkup]])await test('customer markup injection escaped in '+name,()=>{const html=render(hostileClient,state());assert.equal(html.includes(markupPayload),false);assert.equal(html.includes('<script>'),false);assert.equal(html.includes('<img src=x'),false);assert.ok(html.includes('&lt;img src=x'));assert.ok(html.includes('&lt;/textarea&gt;'));assert.ok(html.includes('&amp;'));});
await test('priced 3D facade families automatically add exactly one catalogue item',()=>{for(const family of ['exterior-3d-textures','exterior-3d-gm']){const config=validateConfiguration({...DEFAULT_CONFIG,exteriorId:DATA.swatches[family][0].id});assert.equal(config.optionSelections.filter(x=>x.id==='exterior-3d').length,1);assert.equal(catalogueEstimate(config).knownSubtotalCents,209000);assert.deepEqual(validateConfiguration(config),config);}});
await test('removing paid 3D facade resets to an included documented swatch',()=>{const chosen=validateConfiguration({...DEFAULT_CONFIG,...setOptionSelection(DEFAULT_CONFIG,'exterior-3d',{})});assert.match(chosen.exteriorId,/^exterior-3d-/);const removed=validateConfiguration({...chosen,...setOptionSelection(chosen,'exterior-3d',null)});assert.equal(removed.exteriorId,DEFAULT_CONFIG.exteriorId);assert.equal(catalogueEstimate(removed).knownSubtotalCents,0);});
await test('page9 finishes do not assume an undocumented 3D charge',()=>{const s=validateConfiguration({...DEFAULT_CONFIG,exteriorId:DATA.swatches['exterior-finishes'][0].id});assert.equal(s.optionSelections.length,0);});
await test('bedroom labels match source room numbering',()=>{assert.equal(optionTargetLabel('bedroom-1-door'),'Porta do quarto 1');assert.equal(optionTargetLabel('bedroom-4-door'),'Porta do quarto 4');});
const sourcePath=root+'/dist/project-options.js';
const failures=results.filter(r=>!r.pass);const report={date:new Date().toISOString(),modulePath:sourcePath,moduleSha256:createHash('sha256').update(await readFile(sourcePath)).digest('hex'),tests:results.length,passed:results.length-failures.length,failed:failures.length,failures,results};
await writeFile('/private/tmp/gv72-options-audit-results.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({tests:report.tests,passed:report.passed,failed:report.failed,failures},null,2));
process.exitCode=failures.length?1:0;
