import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import * as T from '../dist/vendor/three.module.js';
import {makeHouse} from '../dist/model.js';
const OUT=process.env.GV72_AUDIT_DIR||path.join(os.tmpdir(),'gv72-expansion-audit'),ROOT=fileURLToPath(new URL('../dist/',import.meta.url));
fs.mkdirSync(OUT,{recursive:true});
const steps=Number(process.env.GV72_AUDIT_STEPS||1000);if(!Number.isInteger(steps)||steps<100||steps>100000)throw new Error('GV72_AUDIT_STEPS must be an integer from 100 to 100000.');
const hashes=()=>Object.fromEntries(['model.js','specification.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(ROOT+f)).digest('hex')]));
const before=hashes(),V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),axes=[V(1,0,0),V(0,1,0),V(0,0,1)],identity=new T.Matrix4();
function obb(box,m){const c=box.getCenter(V()).applyMatrix4(m),h=box.getSize(V()).multiplyScalar(.5),q=new T.Quaternion(),s=V();m.decompose(V(),q,s);return {c,h:h.multiply(s),axes:axes.map(a=>a.clone().applyQuaternion(q))};}
function sat(a,b){const d=b.c.clone().sub(a.c);let least=Infinity;for(const n of [...a.axes,...b.axes,...a.axes.flatMap(x=>b.axes.map(y=>x.clone().cross(y)))]){if(n.lengthSq()<1e-12)continue;n.normalize();const radius=o=>o.axes.reduce((r,x,i)=>r+Math.abs(n.dot(x))*o.h.getComponent(i),0),overlap=radius(a)+radius(b)-Math.abs(d.dot(n));if(overlap<=1e-6)return 0;least=Math.min(least,overlap);}return least;}
function components(mesh){const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry,p=g.attributes.position,N=p.count,parents=Array.from({length:N},(_,i)=>i),find=i=>{while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;},join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parents[b]=a;},seen=new Map();for(let i=0;i<N;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*1e7)).join(',');if(seen.has(key))join(i,seen.get(key));else seen.set(key,i);if(i%3)join(i,i-i%3);}const found=new Map();for(let i=0;i<N;i++){const id=find(i);if(!found.has(id))found.set(id,new T.Box3());found.get(id).expandByPoint(V(p.getX(i),p.getY(i),p.getZ(i)));}if(g!==mesh.geometry)g.dispose();return [...found.values()].map((box,i)=>({box,mesh,id:mesh.name+'#'+i}));}
const h=makeHouse({layout:process.env.GV72_AUDIT_LAYOUT||'t2',view:'expansion',expansion:1});h.root.updateMatrixWorld(true);const bodies=[];
const add=(id,roots)=>{const pieces=[];for(const root of roots)root.traverse(o=>{if(o.isMesh)pieces.push(...components(o));});bodies.push({id,roots,pieces});};
for(const a of h.floorAssemblies)add('floor '+a.dir,a.pivots);
for(const a of h.roofAssemblies)add('roof '+a.dir,a.pivots);
for(const a of h.sideAssemblies){add('side-panel '+a.dir,[a.pivot]);add('side-posts '+a.dir,[a.framePivot]);}
for(const a of h.endAssemblies)add('end '+a.dir+'/'+a.front,[a.pivot]);
const movingRoots=new Set(bodies.flatMap(b=>b.roots));
for(const name of ['structure','floor','floorLayers','roof','shell','supports']){
 const pieces=[];h.groups[name].traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(movingRoots.has(p))return;pieces.push(...components(o));});if(pieces.length)bodies.push({id:'fixed '+name,roots:[],pieces});
}
function pose(p){h.updateExpansion(p);h.root.updateMatrixWorld(true);for(const b of bodies){b.aabb=new T.Box3();for(const c of b.pieces){c.obb=obb(c.box,c.mesh.matrixWorld);c.aabb=c.box.clone().applyMatrix4(c.mesh.matrixWorld);b.aabb.union(c.aabb);}}}
function candidates(){const hits=[];for(let a=0;a<bodies.length;a++)for(let b=a+1;b<bodies.length;b++){const A=bodies[a],B=bodies[b];if(!A.roots.length&&!B.roots.length)continue;if(!A.aabb.intersectsBox(B.aabb))continue;for(let i=0;i<A.pieces.length;i++)for(let j=0;j<B.pieces.length;j++){const x=A.pieces[i],y=B.pieces[j];if(!x.aabb.intersectsBox(y.aabb))continue;const overlap=sat(x.obb,y.obb);if(overlap>.0001)hits.push({key:a+'/'+b+'/'+i+'/'+j,a:A.id,b:B.id,pieceA:x.id,pieceB:y.id,overlap});}}return hits;}
pose(1);const baselineContacts=candidates(),baseline=new Map(baselineContacts.map(x=>[x.key,x.overlap])),summary=new Map(),samples=[];let minPostY=Infinity,minPostPose=null;const swept=new T.Box3(),sweptVisible=new T.Box3();
for(let n=0;n<=steps;n++){const p=n/steps;pose(p);for(const b of bodies){swept.union(b.aabb);if(b.id.startsWith('side-posts')&&b.aabb.min.y<minPostY){minPostY=b.aabb.min.y;minPostPose=p;}}for(const hit of candidates()){const initial=baseline.get(hit.key)||0;if(hit.overlap<=initial+.0001)continue;const key=hit.a+' / '+hit.b;if(!summary.has(key))summary.set(key,{pair:key,firstP:p,lastP:p,maxOverlapM:0,example:null});const s=summary.get(key);s.lastP=p;if(hit.overlap>s.maxOverlapM){s.maxOverlapM=hit.overlap;s.example={p,...hit,finalBaselineOverlapM:initial};}}if([0,200,500,600,800,900,950,1000].includes(n))samples.push({p,bodies:bodies.map(b=>({id:b.id,bounds:b.aabb}))});}
const after=hashes(),result={sourceHashes:after,sourceStable:JSON.stringify(before)===JSON.stringify(after),frames:steps+1,method:'Actual transformed connected mesh-component OBB SAT with 0.1 mm excess-over-final-baseline threshold. Final structural joints retained as explicit baseline contacts, not hidden claims of fabrication clearance.',componentCounts:bodies.map(b=>({id:b.id,count:b.pieces.length})),minPostY,minPostPose,sweptBounds:swept,baselineContactCount:baseline.size,baselineContacts,regressions:[...summary.values()],samples};
fs.writeFileSync(OUT+'/actual-dense-'+(process.env.GV72_AUDIT_LAYOUT||'t2')+'.json',JSON.stringify(result,null,2));console.log(JSON.stringify({sourceStable:result.sourceStable,layout:process.env.GV72_AUDIT_LAYOUT,minPostY,minPostPose,sweptBounds:swept,baseline:baseline.size,regressions:result.regressions},null,2));h.dispose();if(!result.sourceStable||result.regressions.length)process.exitCode=1;
