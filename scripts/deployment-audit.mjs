import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as T from '../dist/vendor/three.module.js';
import {makeHouse} from '../dist/model.js';
import {DATA} from '../dist/data.js';
import {processPose,PROCESS_STEPS} from '../dist/expansion-process.js';
const rows=[],hashes=()=>Object.fromEntries(['model.js','deployment-rig.js','expansion-process.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(new URL('../dist/'+f,import.meta.url))).digest('hex')]));
const startHashes=hashes();
const equal=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-9);
for(const {id:layout} of DATA.layouts){
 const h=makeHouse({layout,view:'exterior'});h.root.updateMatrixWorld(true);
 const meshes=[];h.root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 const baseline=meshes.map(m=>m.matrixWorld.toArray());
 const attachments=[];for(const a of [...h.sideAssemblies,...h.endAssemblies])a.pivot.traverse(m=>{if(m.isMesh)attachments.push({m,p:a.pivot,local:new T.Matrix4().copy(a.pivot.matrixWorld).invert().multiply(m.matrixWorld).toArray()});});
 h.setView('expansion');let prev=null,maxStep=0;
 for(let i=0;i<=1000;i++){
  const p=i/1000,pose=processPose(p);h.updateProcess(p);
  const current=meshes.map(m=>m.matrixWorld.toArray());
  for(const [j,m] of meshes.entries()){
   assert.ok(current[j].every(Number.isFinite),layout+' finite');
   assert.ok(Math.abs(m.matrixWorld.determinant()-1)<1e-8,layout+' rigid');
   if(prev)maxStep=Math.max(maxStep,...current[j].map((v,k)=>Math.abs(v-prev[j][k])));
  }
  for(const a of attachments)assert.ok(equal(new T.Matrix4().copy(a.p.matrixWorld).invert().multiply(a.m.matrixWorld).toArray(),a.local),'rigid window attachment');
  if(pose.placement>0)assert.equal(pose.floor,1,'floor fully open before panel handling');
  if(pose.wall>0)assert.equal(pose.placement,1,'panels placed before raising');
  if(pose.front>0||pose.rear>0)assert.equal(pose.wall,1,'side walls upright before ends');
  for(const a of h.endAssemblies){assert.ok(a.dir*a.front*a.pivot.rotation.y>=-1e-10,'end inside-to-outside rotation');assert.equal(a.g.visible,true);}
  prev=current;
 }
 assert.ok(maxStep<.15,layout+' continuous transforms');
 assert.ok(meshes.every((m,i)=>equal(m.matrixWorld.toArray(),baseline[i])),layout+' exact assembled transforms');
 for(const p of [0,.12,.3,.5,.66,.77,.88,1]){h.updateProcess(p);const before=meshes.map(m=>m.matrixWorld.toArray());h.setView('interior');h.setView('expansion');h.updateProcess(p);assert.ok(meshes.every((m,i)=>equal(m.matrixWorld.toArray(),before[i])),'reentry');}
 h.updateProcess(0);const bounds=new T.Box3();h.root.traverseVisible(o=>{if(o.isMesh){o.geometry.computeBoundingBox();bounds.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});
 assert.ok(bounds.max.x-bounds.min.x<3,'closed compact envelope');
 h.updateProcess(1);h.setView('exterior');assert.ok(meshes.every((m,i)=>equal(m.matrixWorld.toArray(),baseline[i])),'exit restores configuration');
 rows.push({layout,poses:1001,cycles:8,maxTransformStep:maxStep,closedIllustrativeBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}});h.dispose();
}
assert.deepEqual(PROCESS_STEPS.map(s=>processPose(s.position).step),[0,1,2,3]);
const endHashes=hashes();assert.deepEqual(startHashes,endHashes);
const report={status:'PASS',testedAt:new Date().toISOString(),scope:'Rigid meshes, sequencing, continuity, outward end-panel rotation, compact closed illustration, exact final transforms and reentry. Not a physical collision or manufacturer validation.',startHashes,endHashes,rows};
const i=process.argv.indexOf('--out');if(i>=0)fs.writeFileSync(process.argv[i+1],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,layouts:rows.length,poses:rows.reduce((n,x)=>n+x.poses,0),cycles:rows.reduce((n,x)=>n+x.cycles,0)}));
