import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {compileFlowPath,sampleFlowPath,compileFlowRoutes,createServiceFlow} from '../dist/service-flow.js';
import {buildServiceNetwork,serviceSegments} from '../dist/service-network.js';
import {getPlan} from '../dist/specification.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {DATA} from '../dist/data.js';

let checks=0;
function check(name,run){run();checks++;console.log('PASS '+name);}
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-6,actual+' != '+expected);
const pointClose=(actual,expected)=>actual.forEach((v,i)=>close(v,expected[i]));
const makeGroups=()=>({plumbing:new THREE.Group(),electrical:new THREE.Group()});

check('Transparent casings merge overlapping trunks without bridging gaps',()=>{
 const routes=[[[0,0,0],[0,0,3]],[[0,0,1],[0,0,4]],[[0,0,7],[0,0,6]],[[0,0,2],[1,0,2]]],before=JSON.stringify(routes);
 const actual=serviceSegments(routes);
 assert.deepEqual(actual,[[[0,0,0],[0,0,4]],[[0,0,6],[0,0,7]],[[0,0,2],[1,0,2]]]);
 assert.equal(JSON.stringify(routes),before);
});

check('Water inlets are upstream of every fixture in all seven plans',()=>{
 for(const layout of DATA.layouts.map(p=>p.id))for(const bathroom of ['standard','mirrored']){
  const plan=getPlan({...DEFAULT_CONFIG,layout,bathroom,kitchen:layout==='t4-a'?'linear':DEFAULT_CONFIG.kitchen}),network=buildServiceNetwork(plan);
  for(const route of network.water)assert.ok(route.start[2]<=route.end[2],layout+': inlet doubles back over its own external stub: '+route.id);
 }
});

check('Arc-length sampling stays uniform across an L bend and skips zero segments',()=>{
 const source=[[0,0,0],[0,0,0],[2,0,0],[2,3,0]],before=JSON.stringify(source),path=compileFlowPath(source);
 assert.equal(path.length,5);assert.equal(path.segments.length,2);
 pointClose(sampleFlowPath(path,1).position,[1,0,0]);pointClose(sampleFlowPath(path,2).position,[2,0,0]);pointClose(sampleFlowPath(path,3).position,[2,1,0]);pointClose(sampleFlowPath(path,5).position,[2,3,0]);
 for(let d=0;d<=5;d+=.031){const s=sampleFlowPath(path,d);assert.ok(s.position.every(Number.isFinite));close(Math.hypot(...s.tangent),1);assert.ok(Math.abs(s.position[1])<1e-6||Math.abs(s.position[0]-2)<1e-6);}
 assert.equal(JSON.stringify(source),before);
 const reverse=compileFlowPath(source,{reverse:true});pointClose(sampleFlowPath(reverse,0).position,[2,3,0]);pointClose(sampleFlowPath(reverse,5).position,[0,0,0]);
});

check('Degenerate paths stay finite; malformed coordinates are rejected',()=>{
 for(const points of [[],[[1,2,3]],[[1,2,3],[1,2,3]]]){const path=compileFlowPath(points);assert.equal(path.length,0);assert.ok(sampleFlowPath(path,NaN).position.every(Number.isFinite));}
 assert.throws(()=>compileFlowPath([[0,Infinity,0]]),TypeError);
});

check('Drain direction reverses while source topology remains immutable',()=>{
 const network={water:[{id:'sink-cold',kind:'cold',points:[[0,0,0],[0,0,2],[1,0,2]]},{id:'sink-drain',kind:'drain',points:[[.5,0,0],[.5,0,2],[1,0,2]]}],electrical:[]},before=JSON.stringify(network),routes=compileFlowRoutes(network,-1);
 pointClose(routes.cold[0].start,[0,0,-1]);pointClose(routes.cold[0].end,[1,0,2]);pointClose(routes.drain[0].start,[1,0,2]);pointClose(routes.drain[0].end,[.5,0,-1]);
 assert.equal(JSON.stringify(network),before);
});

check('Shared trunks deduplicate packets; independent branches remain visible',()=>{
 for(const kind of ['cold','drain']){
  const common={id:'a',kind,points:[[0,0,0],[0,0,3]]},branch={id:'b',kind,points:[[0,0,0],[0,0,2],[1,0,2]]};
  const single=createServiceFlow({network:{water:[common],electrical:[]},groups:makeGroups()}),duplicate=createServiceFlow({network:{water:[common,common],electrical:[]},groups:makeGroups()}),branched=createServiceFlow({network:{water:[common,branch],electrical:[]},groups:makeGroups()});
  for(let i=0;i<10;i++){for(const flow of [single,duplicate,branched])flow.update(.07,{view:'plumbing'});assert.equal(single.snapshot().counts[kind],duplicate.snapshot().counts[kind]);assert.ok(branched.snapshot().counts[kind]>single.snapshot().counts[kind]);}
  for(const flow of [single,duplicate,branched])flow.dispose();
 }
});

check('Actual packet motion follows the source for supply and the outlet for drainage',()=>{
 const network={water:['cold','drain'].map(kind=>({id:kind,kind,points:[[0,0,0],[0,0,3]]})),electrical:[]},flow=createServiceFlow({network,groups:makeGroups()}),before=flow.snapshot();
 flow.update(.1,{view:'plumbing'});const after=flow.snapshot();
 close(after.samples.cold[0][2]-before.samples.cold[0][2],.064);close(after.samples.drain[0][2]-before.samples.drain[0][2],-.048);flow.dispose();
});

check('Playback, view visibility, speed and paused initial packets are deterministic',()=>{
 const groups=makeGroups(),network={water:[{id:'a',kind:'cold',points:[[0,0,0],[0,0,4]]}],electrical:[{id:'e',kind:'socket',points:[[1,0,0],[1,0,4]]}]},flow=createServiceFlow({network,groups});
 assert.ok(flow.snapshot().counts.cold>0);assert.ok(flow.snapshot().counts.electrical>0);
 const start=flow.snapshot();assert.equal(flow.update(.1,{view:'plumbing',playing:false}),false);assert.equal(flow.snapshot().phase,start.phase);assert.equal(groups.plumbing.children[0].visible,true);assert.equal(groups.electrical.children[0].visible,false);
 flow.update(.1,{playing:true,speed:2});close(flow.snapshot().phase,.2);assert.notDeepEqual(flow.snapshot().samples,start.samples);assert.deepEqual(flow.snapshot().samples.electrical,start.samples.electrical);
 const phase=flow.snapshot().phase;assert.equal(flow.update(.1,{view:'exterior'}),false);assert.equal(flow.snapshot().phase,phase);assert.equal(groups.plumbing.children[0].visible,false);
 flow.setState({view:'electrical'});assert.equal(groups.electrical.children[0].visible,true);assert.equal(groups.plumbing.children[0].visible,false);const cold=flow.snapshot().samples.cold;flow.update(.1);assert.deepEqual(flow.snapshot().samples.cold,cold);assert.notDeepEqual(flow.snapshot().samples.electrical,start.samples.electrical);
 flow.dispose();assert.equal(flow.update(.1,{view:'plumbing'}),false);
});

check('Flow is nested away from static batching and resources dispose exactly once',()=>{
 const groups=makeGroups(),flow=createServiceFlow({network:{water:[{id:'a',kind:'cold',points:[[0,0,0],[0,0,4]]}],electrical:[]},groups});
 assert.ok(groups.plumbing.children.every(o=>o.isGroup));const resources=new Set(),counts=new Map();
 groups.plumbing.traverse(o=>{if(o.isInstancedMesh){for(const r of [o,o.geometry,o.material])resources.add(r);assert.equal(o.material.depthTest,true);}});
 for(const resource of resources){counts.set(resource,0);resource.addEventListener('dispose',()=>counts.set(resource,counts.get(resource)+1));}
 flow.dispose();flow.dispose();assert.equal(groups.plumbing.children.length,0);assert.equal(groups.electrical.children.length,0);for(const count of counts.values())assert.equal(count,1);
});

check('Every layout has finite bounded animated water/electrical geometry',()=>{
 let routes=0,instances=0;
 for(const layout of DATA.layouts)for(const bathroom of ['standard','mirrored']){
  const plan=getPlan({...DEFAULT_CONFIG,layout:layout.id,bathroom}),network=buildServiceNetwork(plan),groups=makeGroups(),flow=createServiceFlow({network,groups,exteriorZ:-plan.dimensions.length/2-.12});
  routes+=network.water.length+network.electrical.length;
  for(const view of ['plumbing','electrical'])for(let i=0;i<7;i++){
   flow.update(.1,{view});const shot=flow.snapshot();assert.ok(Object.values(shot.counts).every(n=>Number.isInteger(n)&&n>=0&&n<1000));for(const points of Object.values(shot.samples))for(const p of points)assert.ok(p.every(Number.isFinite));
   for(const group of Object.values(groups))group.traverse(o=>{if(o.isInstancedMesh){assert.ok(o.count<=o.instanceMatrix.count);for(let j=0;j<o.count*16;j++)assert.ok(Number.isFinite(o.instanceMatrix.array[j]));}});
  }
  instances+=Object.values(flow.snapshot().counts).reduce((a,b)=>a+b,0);flow.dispose();
 }
 console.log(JSON.stringify({layouts:DATA.layouts.length,variants:DATA.layouts.length*2,routes,instances}));
});

console.log(JSON.stringify({passed:checks}));
