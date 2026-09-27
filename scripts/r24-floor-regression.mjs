import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {DATA} from '../dist/data.js';
import {DEFAULT_CONFIG,validateConfiguration,encodeConfiguration,decodeConfiguration,flooringSelectionPatch,flooringSummary,VINYL_PLACEHOLDER_COLOUR} from '../dist/configuration.js';
import {catalogueEstimate,validateOptionSelections,SPC_FLOOR_UPGRADE} from '../dist/project-options.js';
import {floorChoiceMarkup,costSummaryMarkup} from '../dist/project-ui.js';

let checks=0;
const test=async(name,run)=>{await run();checks++;console.log('PASS '+name);};
const change=(state,type,id)=>validateConfiguration({...state,...flooringSelectionPatch(state,type,id)});

await test('new projects include vinyl with an explicit missing-reference state',()=>{
 const state=validateConfiguration(DEFAULT_CONFIG);
 assert.equal(state.floorType,'vinyl');
 assert.equal(state.floorId,null);
 assert.equal(state.floorReferenceStatus,'missing-reference');
 assert.equal(state.floor,VINYL_PLACEHOLDER_COLOUR);
 assert.equal(catalogueEstimate(state).knownSubtotalCents,0);
 assert.match(flooringSummary(state)[0],/vinílico \(incluído\)/);
 assert.match(flooringSummary(state)[1],/Referência por confirmar/);
});

await test('all existing SPC references migrate unchanged and cost exactly 1200 EUR',async()=>{
 for(const sample of DATA.swatches['floor-spc']){
  const legacy={...DEFAULT_CONFIG,floorId:sample.id};
  delete legacy.floorType;delete legacy.floorReferenceStatus;
  const state=validateConfiguration(legacy),estimate=catalogueEstimate(state);
  assert.equal(state.floorType,'spc');assert.equal(state.floorId,sample.id);
  assert.equal(state.floorReferenceStatus,'catalogue-reference');
  assert.equal(estimate.knownSubtotalCents,120000);
  assert.equal(estimate.lines.length,1);assert.equal(estimate.lines[0].quantity,1);
  assert.equal(estimate.lines[0].derived,true);
  assert.deepEqual(estimate.unitPending,[]);
  assert.equal(estimate.vatIncluded,false);
  await access(new URL('../dist/'+estimate.lines[0].item.photo,import.meta.url));
 }
});

await test('SPC sample changes, serialization and repeated validation never add another charge',()=>{
 let state=change(DEFAULT_CONFIG,'spc');
 for(const sample of DATA.swatches['floor-spc']){
  state=change(state,'spc',sample.id);
  state=decodeConfiguration(encodeConfiguration(validateConfiguration(state)));
  assert.equal(catalogueEstimate(state).knownSubtotalCents,120000);
  assert.equal(catalogueEstimate(state).lines.filter(line=>line.id===SPC_FLOOR_UPGRADE.id).length,1);
  assert.equal(state.optionSelections.length,0);
 }
});

await test('returning to vinyl clears the SPC sample and removes only its own charge',()=>{
 const upgraded=change({...DEFAULT_CONFIG,optionSelections:[{id:'ac-monosplit-12000',quantity:2,variant:'',targets:[]}]},'spc');
 assert.equal(catalogueEstimate(upgraded).knownSubtotalCents,220000);
 const included=change(upgraded,'vinyl');
 assert.equal(included.floorId,null);assert.equal(included.floorReferenceStatus,'missing-reference');
 assert.equal(catalogueEstimate(included).knownSubtotalCents,100000);
 assert.deepEqual(included.optionSelections,upgraded.optionSelections);
 assert.deepEqual(decodeConfiguration(encodeConfiguration(included)),included);
});

await test('malformed type/reference and attempts to store a second SPC line are rejected',()=>{
 assert.throws(()=>validateConfiguration({...DEFAULT_CONFIG,floorType:'wood'}));
 assert.throws(()=>validateConfiguration({...DEFAULT_CONFIG,floorType:'spc',floorId:null}));
 assert.throws(()=>validateConfiguration({...DEFAULT_CONFIG,floorId:'not-a-sample'}));
 assert.throws(()=>flooringSelectionPatch(DEFAULT_CONFIG,'spc','not-a-sample'));
 assert.throws(()=>validateOptionSelections([{id:SPC_FLOOR_UPGRADE.id,quantity:1,variant:'',targets:[]}]));
 const forged=validateConfiguration({...DEFAULT_CONFIG,floorReferenceStatus:'confirmed-photo',floor:'#ff0000'});
 assert.equal(forged.floorReferenceStatus,'missing-reference');
 assert.equal(forged.floor,VINYL_PLACEHOLDER_COLOUR);
});

await test('UI distinguishes included vinyl, actual SPC subtotal and unavailable vinyl photography',()=>{
 const vinyl=floorChoiceMarkup(DEFAULT_CONFIG),spcState=change(DEFAULT_CONFIG,'spc');
 assert.match(vinyl,/id="floor-type"/);assert.match(vinyl,/value="vinyl" selected/);
 assert.match(vinyl,/fotografia e o acabamento ainda estão por confirmar/);
 assert.doesNotMatch(vinyl,/<img/);
 assert.match(floorChoiceMarkup(spcState),/value="spc" selected/);
 const summary=costSummaryMarkup(spcState);
 assert.match(summary,/Pavimento SPC/);assert.match(summary,/IVA dos artigos assinalados por confirmar/);
 assert.equal((summary.match(/<strong>Pavimento SPC<\/strong>/g)||[]).length,1);
});

console.log(JSON.stringify({passed:checks,failed:0}));
