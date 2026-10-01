import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {DEFAULT_CONFIG,validateConfiguration,encodeConfiguration,decodeConfiguration} from '../dist/configuration.js';
import {setOptionSelection,catalogueEstimate,OPTIONAL_ITEMS} from '../dist/project-options.js';
import {adaptationEstimate,standardPatch} from '../dist/standard-package.js';
import {getPlan} from '../dist/specification.js';
import {DATA} from '../dist/data.js';
import {WORKTOPS} from '../dist/worktop-data.js';
import {buildServiceNetwork} from '../dist/service-network.js';
import {makeHouse} from '../dist/model.js';
import {translateText} from '../dist/i18n.js';
const checks=[];let routes=0;
const check=(name,fn)=>{fn();checks.push(name);console.log('PASS '+name);};
check('All 26 optional prices retain their arithmetic and known prices',()=>{
 for(const item of OPTIONAL_ITEMS)for(const quantity of [1,item.maxQuantity]){const s={...DEFAULT_CONFIG,optionSelections:[{id:item.id,quantity,targets:[],variant:item.variants[0]?.[0]||''}]},e=catalogueEstimate(s),line=e.lines.find(l=>l.id===item.id);assert.equal(line.totalCents,item.priceCents===null?null:quantity*item.priceCents);}
 assert.equal(OPTIONAL_ITEMS.find(i=>i.id==='kitchen-upper').priceCents,58000);
});
check('78 original worktop hashes and private-free configuration roundtrips',()=>{
 assert.equal(WORKTOPS.length,78);
 for(const w of WORKTOPS){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../dist/'+w.asset,import.meta.url))).digest('hex'),w.sha256);const s=validateConfiguration({...DEFAULT_CONFIG,kitchenWorktop:w.id,kitchenCabinetColour:'#3E5147',bathroomCabinetColour:'#a5815d'});assert.deepEqual(decodeConfiguration(encodeConfiguration(s)),s);assert.equal(catalogueEstimate(s).knownSubtotalCents,0);assert.equal(adaptationEstimate(s).lines.length,3);}
});
check('Old island can be removed; selected island is independently priced',()=>{
 const old=validateConfiguration({...DEFAULT_CONFIG,kitchen:'island'});assert.ok(old.optionSelections.some(i=>i.id==='kitchen-island'));
 const removed=validateConfiguration({...old,...setOptionSelection(old,'kitchen-island',null)});assert.equal(removed.kitchen,'linear');assert.ok(!getPlan(removed).furnishings.some(f=>f.type==='island'));
 const added={...DEFAULT_CONFIG,...setOptionSelection(DEFAULT_CONFIG,'kitchen-island',{})};assert.ok(getPlan(added).furnishings.some(f=>f.type==='island'));assert.equal(catalogueEstimate(added).pending[0].id,'kitchen-island');
});
check('Specific worktop replaces generic request; standard restores only its own room',()=>{
 const s=validateConfiguration({...DEFAULT_CONFIG,kitchenWorktop:WORKTOPS[0].id,adaptationRequests:['kitchen-worktop'],bathroomCabinetColour:'#123456'});assert.equal(adaptationEstimate(s).lines.filter(l=>l.kind==='kitchen').length,1);
 const restored=validateConfiguration({...s,...standardPatch('kitchen',s)});assert.equal(restored.kitchenWorktop,null);assert.equal(restored.bathroomCabinetColour,'#123456');
});
check('14 service networks continuous, anchored, panel clear of windows',()=>{
 for(const layout of DATA.layouts)for(const bathroom of ['standard','mirrored']){
  const state={...DEFAULT_CONFIG,layout:layout.id,bathroom,kitchen:layout.id==='t4-a'?'linear':'l'},plan=getPlan(state),n=buildServiceNetwork(plan);
  for(const p of plan.servicePoints){const cs=n.water.filter(c=>c.fixture===p.id);assert.deepEqual(cs.map(c=>c.kind),p.hot?['cold','hot','drain']:['cold','drain']);assert.deepEqual(cs.find(c=>c.kind==='drain').end,p.drain);for(const c of cs.filter(c=>c.kind!=='drain'))assert.deepEqual(c.end,[p.x,p.y,p.z]);}
  for(const c of [...n.water,...n.electrical]){routes++;assert.deepEqual(c.start,c.points[0]);assert.deepEqual(c.end,c.points.at(-1));assert.ok(c.points.flat().every(Number.isFinite));for(let i=1;i<c.points.length;i++)assert.ok(c.points[i].filter((v,j)=>Math.abs(v-c.points[i-1][j])>1e-7).length<=1,'axis-aligned continuous run');}
  const wall=plan.perimeter.find(f=>f.axis==='z'&&f.c<0);assert.ok(!wall.holes.some(h=>h.sill<1.7&&h.sill+h.height>1.3&&Math.abs(h.u-n.panel[2])<h.width/2+.15));
 }
});
check('Cabinet option exclusively controls upper modules; services exempt from clipping',()=>{
 for(const kitchenRef of ['kitchen-01','kitchen-14'])for(const on of [false,true]){const h=makeHouse({...DEFAULT_CONFIG,kitchenRef,view:'interior',optionSelections:on?[{id:'kitchen-upper',quantity:1,targets:[],variant:''}]:[]});assert.equal(h.details.kitchen.upper,on);let upper=0;h.root.traverse(o=>{if(o.name==='Porta do armário superior')upper++;});assert.equal(upper>0,on);for(const view of ['plumbing','electrical']){h.setView(view);for(const m of h.services.materials)assert.equal(m.clippingPlanes.length,0);}h.setView('exterior');assert.equal(h.groups.plumbing.visible,false);assert.equal(h.groups.electrical.visible,false);h.dispose();}
});
check('New customer controls translated in English and Spanish',()=>{for(const key of ['Armários e bancada','Cor do móvel do banho','Bancada personalizada','Escolha o vão onde pretende aplicar este artigo.','Água quente','Bancada 78'])for(const lang of ['en','es'])assert.notEqual(translateText(key,lang),key);});
fs.mkdirSync('audit/r26',{recursive:true});fs.writeFileSync('audit/r26/regression.json',JSON.stringify({checks,routes,pass:true},null,2));
