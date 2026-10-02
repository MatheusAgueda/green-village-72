import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFileSync} from 'node:fs';

const root=path.resolve(process.env.GV_PROJECT_ROOT||process.cwd());
const load=name=>import(pathToFileURL(path.join(root,'dist',name)));
const [{makeHouse},{getPlan,LAYOUTS,DIM},{DEFAULT_CONFIG,validateConfiguration,encodeConfiguration,decodeConfiguration},{catalogueEstimate},THREE]=await Promise.all(['model.js','specification.js','configuration.js','project-options.js','vendor/three.module.js'].map(load));
const choose=(id,variant='')=>({id,quantity:1,targets:[],variant});
const state=patch=>validateConfiguration({...DEFAULT_CONFIG,optionSelections:[],...patch,...(patch?.layout==='t4-a'?{kitchen:'linear'}:{})});
const close=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<1e-6,`${label}: ${actual} != ${expected}`);
const report={ok:true,standardConfigurations:0,longFaces:0,preservedWindowPositions:0,glazedConfigurations:0,fixedPanels:0,apertureRays:0,entryMotions:0,restoredMatrices:0,deckConfigurations:0,priceChecks:0,persistenceChecks:0};

// Independent snapshot of the previously selectable window IDs. The user has
// confirmed three windows per long side; existing target identities must survive.
const previous={
 't0':[[-2.85,2.85],[-2.85,2.85]],
 't1':[[-2.85,2.85],[-2.95,3.7]],
 't2':[[-2.85,2.85],[-2.95,2.95]],
 't3-a':[[-2.95,3.7],[-2.95,2.95]],
 't3-b':[[-3.7,.05,3.7],[-3.9353,.0649,4.0002]],
 't4-a':[[-2.95,2.95],[-2.95,2.95]],
 't4-b':[[-3.9353,.05,3.7],[-3.9353,.0649,4.0002]],
};

function restoreExpansion(house,label){
 house.root.updateMatrixWorld(true);
 const before=[];
 house.root.traverse(mesh=>{if(mesh.isMesh)before.push([mesh,mesh.matrixWorld.clone()]);});
 for(const progress of [0,.2,.46,.7,.92,1])house.updateProcess(progress);
 house.root.updateMatrixWorld(true);
 for(const [mesh,matrix] of before){
  mesh.matrixWorld.elements.forEach((value,i)=>close(value,matrix.elements[i],`${label}/${mesh.name}: expanded transform`));
  report.restoredMatrices++;
 }
}

function assertApertures(house,faces,label){
 house.root.updateMatrixWorld(true);
 const solid=[];
 house.root.traverse(mesh=>{if(mesh.isMesh&&[house.materials.exterior,house.materials.panelInterior,house.materials.insulation,house.materials.steel].includes(mesh.material))solid.push(mesh);});
 for(const face of faces)for(const hole of face.holes){
  const sign=Math.sign(face.c);
  for(const fraction of [.2,.5,.8])for(const offset of [-.2,.2]){
   const u=hole.u+hole.width*offset,y=hole.sill+hole.height*fraction;
   const origin=face.axis==='z'?new THREE.Vector3(face.c+sign*.2,y,u):new THREE.Vector3(u,y,face.c+sign*.2);
   const direction=face.axis==='z'?new THREE.Vector3(-sign,0,0):new THREE.Vector3(0,0,-sign);
   assert.equal(new THREE.Raycaster(origin,direction,0,.36).intersectObjects(solid,false).length,0,`${label}/${hole.id}: opaque geometry blocks the aperture`);
   report.apertureRays++;
  }
 }
}

for(const layout of LAYOUTS)for(const bathroom of ['standard','mirrored']){
 const configuration=state({layout:layout.id,bathroom});
 const plan=getPlan(configuration),house=makeHouse(configuration);
 try{
  const faces=plan.perimeter.filter(face=>face.axis==='z');
  for(const face of faces){
   const side=Math.sign(face.c),old=previous[layout.id][side<0?0:1];
   assert.equal(face.holes.length,3,`${layout.id}/${bathroom}/${side}: three standard windows`);
   assert.deepEqual(face.holes.map(h=>h.id),[0,1,2].map(i=>`side-${side}-${i}`));
   for(const [i,u] of old.entries()){
    close(face.holes.find(h=>h.id===`side-${side}-${i}`).u,u,`${layout.id}: saved window target position`);
    report.preservedWindowPositions++;
   }
   for(const [i,hole] of face.holes.entries()){
    assert.ok(hole.u-hole.width/2>face.a+DIM.panel&&hole.u+hole.width/2<face.b-DIM.panel,'Window clears end posts');
    for(const other of face.holes.slice(i+1))assert.ok(Math.abs(hole.u-other.u)>(hole.width+other.width)/2+.1,'Window frames do not overlap');
    for(const wall of plan.walls.filter(w=>w.axis==='x'&&(side<0?w.a<=-3:w.b>=3)))assert.ok(Math.abs(wall.c-hole.u)>hole.width/2+wall.thickness/2+.02,`${layout.id}/${hole.id}: window clears room partition`);
    const record=house.openings.records.find(r=>r.id===hole.id);
    assert.ok(record,'Every standard side window has rendered, interactive geometry');
    assert.equal(house.openings.setOpening(hole.id,1),true);
    assert.equal(record.value,1);
    assert.equal(house.openings.setOpening(hole.id,0),true);
   }
   report.longFaces++;
  }
  assertApertures(house,faces,layout.id);
  restoreExpansion(house,`${layout.id}/${bathroom}/standard`);
  report.standardConfigurations++;
 }finally{house.dispose();}

 for(const variant of ['left','right']){
  const selected=state({layout:layout.id,bathroom,optionSelections:[choose('glass-front'),choose('glass-side-full',variant)]});
  const estimate=catalogueEstimate(selected);
  assert.equal(estimate.knownSubtotalCents,779000,'Front plus one long side: 2,600 + 5,190 euros, never multiplied by panel count');
  assert.equal(estimate.lines.find(line=>line.id==='glass-front').totalCents,260000);
  assert.equal(estimate.lines.find(line=>line.id==='glass-side-full').totalCents,519000);
  assert.equal(estimate.lines.length,2);
  assert.equal(estimate.pending.length,0);
  assert.equal(estimate.vatPending.length,2,'New commercial prices do not imply an unconfirmed VAT treatment');
  report.priceChecks++;
  assert.deepEqual(decodeConfiguration(encodeConfiguration(selected)),selected,'Both independent facade selections persist with the chosen side');
  report.persistenceChecks++;
  const glazed=makeHouse(selected);
  try{
   const side=variant==='left'?-1:1,long=glazed.plan.perimeter.find(face=>face.axis==='z'&&Math.sign(face.c)===side);
   const opposite=glazed.plan.perimeter.find(face=>face.axis==='z'&&Math.sign(face.c)===-side);
   const panel=glazed.services.network.panel;
   assert.equal(Math.sign(panel[0]),-side,'Electrical panel remains on the opaque facade');
   assert.ok(!opposite.holes.some(h=>h.sill<1.70&&h.sill+h.height>1.30&&Math.abs(h.u-panel[2])<h.width/2+.15),'Electrical panel clears windows');
   const front=glazed.plan.perimeter.find(face=>face.axis==='x'&&face.c>0);
   assert.equal(long.holes.length,6);
   assert.deepEqual(long.holes.map(h=>h.id),Array.from({length:6},(_,i)=>`glazing-side-${side}-${i}`));
   assert.equal(opposite.holes.length,3,'Only the purchased side changes');
   assert.equal(front.holes.length,3,'Front consists of two fixed modules and the entry module');
   const fixed=[...long.holes,...front.holes.filter(h=>h.kind==='window')];
   assert.equal(fixed.length,8);
   glazed.root.updateMatrixWorld(true);
   for(const hole of fixed){
    assert.equal(hole.facadeGlazing,true);
    const group=glazed.root.getObjectByName(hole.id+' · caixilharia funcional');
    assert.ok(group,`${hole.id}: full facade panel has actual scene geometry`);
    assert.equal(group.userData.opening.mechanism,'fixed');
    assert.equal(glazed.openings.records.some(r=>r.id===hole.id),false,'Fixed panel is not offered as an operable window');
    assert.equal(glazed.openings.setOpening(hole.id,1),false);
    let glassCount=0;
    group.traverse(mesh=>{if(mesh.isMesh&&mesh.name.endsWith(' · vidro de folha')){
     glassCount++;const bounds=new THREE.Box3().setFromObject(mesh),size=bounds.getSize(new THREE.Vector3());
     assert.ok(size.y>2,'Full-height glass is rendered');
     assert.ok(Math.max(size.x,size.z)>1.5,'Full facade module width is rendered');
     assert.equal(mesh.userData.openingMotionId,undefined,'Fixed glazing has no active motion hit target');
    }});
    assert.equal(glassCount,1,'One clear glazed pane per fixed module');
    report.fixedPanels++;
   }
   const entry=glazed.openings.records.find(r=>r.id==='entry');
   assert.ok(entry,'Front entry retains real door geometry');
   assert.equal(entry.kind,'door');assert.equal(entry.profile.type,'swing');assert.equal(entry.leaves.length,2);
   assert.equal(glazed.openings.setOpening('entry',1),true);
   assert.ok(entry.leaves.every(leaf=>Math.abs(leaf.pivot.rotation.y)>1),'Both entry leaves actually rotate');
   assert.equal(glazed.openings.setOpening('entry',0),true);
   report.entryMotions++;
   assertApertures(glazed,[long,front],`${layout.id}/${variant}`);
   restoreExpansion(glazed,`${layout.id}/${bathroom}/${variant}/glazing`);
   report.glazedConfigurations++;
  }finally{glazed.dispose();}
 }
}

for(const catalogue of [false,true]){
 const configuration=state({porch:true,optionSelections:catalogue?[choose('terrace')]:[]});
 const house=makeHouse(configuration),depth=catalogue?3:1.95,front=DIM.length/2+depth;
 try{
  house.root.updateMatrixWorld(true);
  close(house.plan.dimensions.porchDepth,depth,'Selected deck depth');
  for(const [side,sign] of [['esquerda',-1],['direita',1]]){
   const rail=house.groups.porch.getObjectByName(`Guarda lateral ${side} · corrimão`);
   const post=house.groups.porch.getObjectByName(`Guarda lateral ${side} · montante`);
   assert.ok(rail&&post,'Both lateral boundaries have a rail and rear post');
   const bounds=new THREE.Box3().setFromObject(rail);
   close((bounds.min.x+bounds.max.x)/2,sign*(DIM.width/2-.08),'Guard follows deck outer side');
   close(bounds.max.z-bounds.min.z,depth-.12,'Side guard covers full deck depth');
   close(bounds.min.z,DIM.length/2+.06,'Guard starts at rear mounting post');
   close(bounds.max.z,front-.06,'Guard meets existing front corner post');
   const bars=house.groups.porch.children.filter(mesh=>mesh.name===`Guarda lateral ${side} · balaústre`);
   assert.ok(bars.length>=8,'Side guard has a continuous run of balusters');
   for(const bar of bars){close(bar.position.x,rail.position.x,'Balusters align with side rail');assert.ok(bar.position.z>DIM.length/2&&bar.position.z<front);}
  }
  const passage=new THREE.Box3(new THREE.Vector3(-1,.12,front-.1),new THREE.Vector3(1,1.6,front+.1));
  for(const mesh of house.groups.porch.children.filter(o=>o.isMesh))assert.equal(new THREE.Box3().setFromObject(mesh).intersectsBox(passage),false,`${mesh.name}: front entrance stays clear`);
  report.deckConfigurations++;
 }finally{house.dispose();}
}

if(process.env.GV_AUDIT_REPORT)writeFileSync(process.env.GV_AUDIT_REPORT,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
