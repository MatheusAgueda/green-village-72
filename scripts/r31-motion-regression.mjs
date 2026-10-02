import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as THREE from '../dist/vendor/three.module.js';
import {createServiceFlow,compileFlowRoutes} from '../dist/service-flow.js';
import {buildServiceNetwork} from '../dist/service-network.js';
import {getPlan} from '../dist/specification.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {DATA} from '../dist/data.js';

const checks=[],observations={};
const check=(name,run)=>{run();checks.push(name);console.log('PASS '+name);};
const close=(actual,expected,tolerance=1e-5)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} differs from ${expected}`);
const groups=()=>({plumbing:new THREE.Group(),electrical:new THREE.Group()});
const kinds=['cold','hot','drain','electrical'];
const velocity={cold:.64,hot:.64,drain:.48,electrical:1.35};
const packetSpacing={cold:.45,hot:.45,drain:.52,electrical:.60};
const view=kind=>kind==='electrical'?'electrical':'plumbing';
const route=(kind,points,id='route')=>({id,kind,points});
const networkFor=(kind,routes)=>({water:kind==='electrical'?[]:routes,electrical:kind==='electrical'?routes:[]});
function symbolMesh(parents,kind){
 let result;
 for(const parent of Object.values(parents))parent.traverse(object=>{
  if(object.isInstancedMesh&&object.name===kind+' · moving '+(kind==='electrical'?'lightning':'water drops'))result=object;
 });
 assert.ok(result,'Missing rendered symbols for '+kind);return result;
}
function centres(mesh){
 const matrix=new THREE.Matrix4(),result=[];
 for(let i=0;i<mesh.count;i++){
  mesh.getMatrixAt(i,matrix);assert.ok(matrix.elements.every(Number.isFinite));
  result.push(new THREE.Vector3().setFromMatrixPosition(matrix).toArray());
 }
 return result;
}
function onPath(point,path){
 return path.segments.some(segment=>{
  const relative=point.map((value,index)=>value-segment.a[index]);
  const along=relative.reduce((sum,value,index)=>sum+value*segment.tangent[index],0);
  return along>=-1e-5&&along<=segment.length+1e-5&&Math.hypot(...relative.map((value,index)=>value-along*segment.tangent[index]))<1e-5;
 });
}
function advance(flow,seconds,state){
 let remaining=seconds;
 while(remaining>1e-8){const dt=Math.min(.02,remaining);flow.update(dt,state);remaining-=dt;}
}

check('Rendered lightning and drop centres follow bends and match diagnostics',()=>{
 const points=[[0,0,0],[0,0,3],[2,0,3],[2,2,3],[3,3,4]];
 for(const kind of kinds){
  const parents=groups(),network=networkFor(kind,[route(kind,points)]),paths=compileFlowRoutes(network)[kind];
  const flow=createServiceFlow({network,groups:parents}),mesh=symbolMesh(parents,kind),capacity=mesh.instanceMatrix.count;
  try{
   for(let i=0;i<160;i++){
    flow.update(.017,{view:view(kind),speed:2});
    const actual=centres(mesh),snapshot=flow.snapshot().symbols[kind];
    assert.equal(snapshot.shape,kind==='electrical'?'lightning':'drop');assert.equal(snapshot.count,actual.length);
    assert.ok(actual.length>0&&actual.length<=capacity);assert.equal(mesh.instanceMatrix.count,capacity);
    assert.ok(actual.every(point=>paths.some(path=>onPath(point,path))),kind+' symbols leave their routes');
    snapshot.positions.forEach((point,index)=>point.forEach((value,axis)=>close(value,actual[index][axis])));
   }
  }finally{flow.dispose();}
 }
});

check('Symbols move in supply/electrical and drainage directions without capsule-wrap jumps',()=>{
 for(const kind of kinds){
  const parents=groups(),flow=createServiceFlow({network:networkFor(kind,[route(kind,[[0,0,0],[0,0,12]])]),groups:parents});
  try{
   const mesh=symbolMesh(parents,kind),direction=kind==='drain'?-1:1;
   const initial=centres(mesh)[0];flow.update(.1,{view:view(kind)});
   close(centres(mesh)[0][2]-initial[2],direction*.1*velocity[kind]);
   const beforeWrap=packetSpacing[kind]/velocity[kind]-.01;
   advance(flow,beforeWrap-.1,{view:view(kind)});const before=centres(mesh)[0];
   flow.update(.02,{view:view(kind)});const after=centres(mesh)[0];
   close(after[2]-before[2],direction*.02*velocity[kind]);
   observations[kind+' packet boundary']={before,after,expectedDistance:direction*.02*velocity[kind]};
  }finally{flow.dispose();}
 }
});

check('Duplicate routes and shared trunks do not stack symbols',()=>{
 for(const kind of kinds){
  const common=route(kind,[[0,0,0],[0,0,6]],'main'),branch=route(kind,[[0,0,0],[0,0,3],[3,0,3]],'branch');
  const parents=[groups(),groups(),groups()],flows=[
   createServiceFlow({network:networkFor(kind,[common]),groups:parents[0]}),
   createServiceFlow({network:networkFor(kind,[common,common]),groups:parents[1]}),
   createServiceFlow({network:networkFor(kind,[common,branch]),groups:parents[2]})
  ];
  try{
   for(let step=0;step<110;step++){
    flows.forEach(flow=>flow.update(.023,{view:view(kind)}));
    assert.deepEqual(centres(symbolMesh(parents[0],kind)),centres(symbolMesh(parents[1],kind)));
    const branched=centres(symbolMesh(parents[2],kind)),keys=branched.map(point=>point.map(value=>Math.round(value*1e5)).join(','));
    assert.equal(new Set(keys).size,keys.length,kind+' symbols overlap at a shared trunk');
    assert.ok(branched.some(point=>point[0]>.1),kind+' independent branch is missing its symbols');
   }
  }finally{flows.forEach(flow=>flow.dispose());}
 }
});

check('Pause, speed and inactive views control the rendered symbols',()=>{
 const parents=groups(),network={water:['cold','hot','drain'].map(kind=>route(kind,[[0,0,0],[0,0,12]],kind)),electrical:[route('electrical',[[1,0,0],[1,0,12]])]};
 const flow=createServiceFlow({network,groups:parents});
 try{
  const initial=flow.snapshot();assert.equal(flow.update(.1,{view:'plumbing',playing:false}),false);
  assert.deepEqual(flow.snapshot().symbols,initial.symbols);
  flow.update(.1,{playing:true,speed:2});const moving=flow.snapshot();
  close(moving.symbols.cold.positions[0][2]-initial.symbols.cold.positions[0][2],.128);
  assert.deepEqual(moving.symbols.electrical,initial.symbols.electrical);
  flow.update(.1,{view:'exterior'});assert.deepEqual(flow.snapshot().symbols,moving.symbols);
  assert.equal(flow.snapshot().phase,moving.phase);
  flow.update(.1,{view:'electrical'});const electrical=flow.snapshot();
  for(const kind of ['cold','hot','drain'])assert.deepEqual(electrical.symbols[kind],moving.symbols[kind]);
  assert.notDeepEqual(electrical.symbols.electrical.positions,moving.symbols.electrical.positions);
  flow.update(.1,{playing:false});assert.deepEqual(flow.snapshot().symbols,electrical.symbols);
 }finally{flow.dispose();}
 assert.equal(flow.update(.1,{view:'electrical',playing:true}),false);
});

check('Symbol resources stay nested and are released exactly once',()=>{
 const parents=groups(),flow=createServiceFlow({network:{water:['cold','hot','drain'].map(kind=>route(kind,[[0,0,0],[0,0,8]],kind)),electrical:[route('electrical',[[1,0,0],[1,0,8]])]},groups:parents});
 const resources=new Set(),events=new Map();
 for(const parent of Object.values(parents)){
  assert.ok(parent.children.every(object=>object.isGroup));
  parent.traverse(object=>{
   if(!object.isInstancedMesh)return;
   for(const resource of [object,object.geometry,object.material])resources.add(resource);
   assert.equal(object.material.depthTest,true);assert.equal(object.material.depthWrite,false);
  });
 }
 for(const resource of resources){events.set(resource,0);resource.addEventListener('dispose',()=>events.set(resource,events.get(resource)+1));}
 flow.dispose();flow.dispose();
 for(const parent of Object.values(parents))assert.equal(parent.children.length,0);
 for(const count of events.values())assert.equal(count,1);
 observations.resources={uniqueResources:resources.size,disposeEvents:[...events.values()].reduce((sum,value)=>sum+value,0)};
});

check('Every plan and bathroom orientation has finite bounded symbols on its own routes',()=>{
 let variants=0,totalSymbols=0;
 for(const layout of DATA.layouts)for(const bathroom of ['standard','mirrored']){
  const plan=getPlan({...DEFAULT_CONFIG,layout:layout.id,bathroom}),network=buildServiceNetwork(plan),parents=groups(),exteriorZ=-plan.dimensions.length/2-.12;
  const flow=createServiceFlow({network,groups:parents,exteriorZ}),routes=compileFlowRoutes(network,exteriorZ);
  try{
   for(const activeView of ['plumbing','electrical'])for(let step=0;step<12;step++){
    flow.update(.071,{view:activeView,speed:3});
    for(const kind of Object.keys(flow.snapshot().symbols)){
     const mesh=symbolMesh(parents,kind),points=centres(mesh);
     assert.ok(points.length<1000&&points.length<=mesh.instanceMatrix.count);
     assert.ok(points.every(point=>routes[kind].some(path=>onPath(point,path))),layout.id+' '+kind+' is off-route');
    }
   }
   totalSymbols+=Object.values(flow.snapshot().symbols).reduce((sum,entry)=>sum+entry.count,0);variants++;
  }finally{flow.dispose();}
 }
 observations.layouts={variants,totalSymbols};
});

const output=process.env.AUDIT_OUTPUT||'audit/r31';
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,'motion-result.json'),JSON.stringify({passed:checks.length,checks,observations},null,2));
console.log(JSON.stringify({passed:checks.length,...observations.layouts,...observations.resources}));
