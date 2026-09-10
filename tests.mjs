import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';
import * as THREE from './dist/vendor/three.module.js';
import {makeHouse} from './dist/model.js';
import {DIM,MEASURES,getPlan,compatibility,expansionState,unionArea,intersects} from './dist/specification.js';
import {DEFAULT_CONFIG,validateConfiguration,encodeConfiguration,decodeConfiguration,summaryRows,SWATCHES} from './dist/configuration.js';
import {MATERIALS} from './dist/material-data.js';
import {physicalUV} from './dist/material-library.js';
import {planSVG} from './dist/plan-svg.js';
import {DATA} from './dist/data.js';
const core=process.argv.includes('--core');let count=0;
function check(label,fn){fn();count++;console.log('PASS '+label);}
const close=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
// Independent transcription from the seven original workbook images, reviewed by the source auditor.
const source={
 't0':{bedrooms:0,doors:[],side:[2,2]},
 't1':{bedrooms:1,doors:['end'],side:[2,2]},
 't2':{bedrooms:2,doors:['end','start'],side:[2,2]},
 't3-a':{bedrooms:3,doors:['end','end','start'],side:[2,2]},
 't3-b':{bedrooms:3,doors:['end','end','start'],side:[3,3]},
 't4-a':{bedrooms:4,doors:['end','end','start','start'],side:[2,2]},
 't4-b':{bedrooms:4,doors:['end','end','end','start'],side:[3,3]},
};
check('independent workbook dimensions: 11800 / 6220 / 2010+2200+2010 / windows 920',()=>{
 close(DIM.width,6220/1000);close(DIM.length,11800/1000);close(DIM.core,2200/1000);close(DIM.wing,2010/1000);close(DIM.windowWidth,920/1000);close(DIM.core+2*DIM.wing,DIM.width);close(DIM.width*DIM.length,73.396);
 assert.equal(MEASURES.find(x=>x.id==='closedWidth').status,'missing');assert.equal(MEASURES.find(x=>x.id==='height').status,'estimated');
});
check('seven original room counts, door end relationships and window counts',()=>{
 assert.deepEqual(DATA.layouts.map(x=>x.id),Object.keys(source));
 for(const [id,ref]of Object.entries(source)){const p=getPlan({...DEFAULT_CONFIG,layout:id});assert.equal(p.bedrooms,ref.bedrooms);const rooms=p.rooms.filter(x=>x.kind==='bedroom');assert.equal(rooms.length,ref.bedrooms);rooms.forEach((r,i)=>{const d=p.walls.find(w=>w.id===r.id+'-side').door;assert.equal(d.u<(r.outline.z0+r.outline.z1)/2?'start':'end',ref.doors[i],`${id} room ${i}`);});
 const side=p.perimeter.filter(w=>w.axis==='z');assert.deepEqual(side.map(w=>w.holes.length),ref.side,id);const rear=p.perimeter.find(w=>w.axis==='x'&&w.c<0);assert.equal(rear.holes.filter(w=>w.width===.92).length,2,id);
 for(const r of p.rooms)assert.ok(r.area>0&&r.clear.x0>=-3.11&&r.clear.x1<=3.11&&r.clear.z0>=-5.9&&r.clear.z1<=5.9);
 }
});
check('partition union handles overlaps; areas never forced to commercial 72',()=>{
 close(unionArea([{x0:0,x1:2,z0:0,z1:1},{x0:1,x1:3,z0:0,z1:1}]),3);
 close(unionArea([{x0:0,x1:3,z0:0,z1:1},{x0:1,x1:2,z0:-1,z1:2}]),5);
 for(const layout of Object.keys(source)){const p=getPlan({...DEFAULT_CONFIG,layout});close(p.areas.exterior,73.396);close(p.areas.internalEnvelope,6.02*11.6);close(p.areas.estimatedNet+p.areas.partitions,p.areas.internalEnvelope);close(p.areas.roomTotal+p.areas.common,p.areas.estimatedNet);assert.equal(p.areas.status,'estimated');assert.ok(p.areas.estimatedNet<70);}
});
check('all supported kitchen/bath proposals avoid partition and furniture footprint overlaps',()=>{
 for(const layout of Object.keys(source))for(const kitchen of ['none','linear','l','island'])for(const bathroom of ['standard','mirrored']){const s={...DEFAULT_CONFIG,layout,kitchen,bathroom};if(compatibility(s).length)continue;const p=getPlan(s);for(const f of p.furnishings){assert.ok(f.x0>=-3.01-1e-7&&f.x1<=3.01+1e-7&&f.z0>=-5.8-1e-7&&f.z1<=5.8+1e-7,`${layout}/${kitchen}: ${f.id} outside`);if(f.type.includes('kitchen')||f.type==='island')for(const w of p.walls){const r=w.axis==='z'?{x0:w.c-.04,x1:w.c+.04,z0:w.a,z1:w.b}:{x0:w.a,x1:w.b,z0:w.c-.04,z1:w.c+.04};assert.equal(intersects(f,r),false,`${layout}/${kitchen}: ${f.id} vs ${w.id}`);}}
 for(let i=0;i<p.furnishings.length;i++)for(let j=i+1;j<p.furnishings.length;j++)assert.equal(intersects(p.furnishings[i],p.furnishings[j]),false,`${layout}/${kitchen}: ${p.furnishings[i].id}/${p.furnishings[j].id}`);
 }
});
check('incompatible choices fail explicitly without mutating current state',()=>{
 const before={...DEFAULT_CONFIG};assert.throws(()=>validateConfiguration({...before,layout:'t4-a',kitchen:'l'}),/T4 A/);assert.throws(()=>validateConfiguration({...before,layout:'t3-a',kitchen:'island'}),/ilha/);assert.deepEqual(before,DEFAULT_CONFIG);
});
check('configuration roundtrip preserves choices; rejects corrupt, unknown and incomplete payloads',()=>{
 const s=validateConfiguration({...DEFAULT_CONFIG,layout:'t3-b',kitchen:'l',bathroom:'mirrored',roof:true,porch:true,interior:'#ba8970',interiorName:'Terracota',floorId:'floor-spc-kx8006'});assert.deepEqual(decodeConfiguration(encodeConfiguration(s)),s);for(const text of ['{','null','[]','{}',JSON.stringify({...s,floorId:'missing'}),JSON.stringify({...s,roof:'yes'}),JSON.stringify({...s,interior:'javascript:test'}),'x'.repeat(100001)])assert.throws(()=>decodeConfiguration(text));const missing={...s};delete missing.floorId;assert.throws(()=>validateConfiguration(missing),/Falta/);assert.equal(summaryRows(s).find(([k])=>k==='Planta')[1],DATA.layouts.find(x=>x.id==='t3-b').label);
});
check('71 material IDs map to original/crop assets and valid render metadata',()=>{
 assert.equal(MATERIALS.length,71);assert.equal(new Set(MATERIALS.map(x=>x.id)).size,71);assert.deepEqual(new Set(MATERIALS.map(x=>x.id)),new Set(SWATCHES.map(x=>x.id)));
 for(const m of MATERIALS){for(const f of [m.originalAsset,m.textureAsset,m.referenceCropAsset].filter(Boolean))assert.ok(existsSync('dist/assets/catalogue-v2/'+f),f);assert.ok(/^#[a-f0-9]{6}$/i.test(m.previewHexApprox));assert.ok(m.render.roughnessApprox>=0&&m.render.roughnessApprox<=1);assert.ok(m.render.estimatedPhysicalRepeat.widthM>0&&m.render.estimatedPhysicalRepeat.heightM>0);assert.ok(['original-crop-texture','sampled-colour'].includes(m.render.mode));}
});
check('metre UVs preserve physical scale across different mesh fragments',()=>{
 const a=physicalUV(new THREE.BoxGeometry(1,2,.1),[0,1,0]),b=physicalUV(new THREE.BoxGeometry(2,2,.1),[1.5,1,0]);const span=g=>{const u=[];for(let i=0;i<g.attributes.position.count;i++)if(g.attributes.normal.getZ(i)>.9)u.push(g.attributes.uv.getX(i));return Math.max(...u)-Math.min(...u);};close(span(a),1);close(span(b),2);a.dispose();b.dispose();
});
check('all seven geometry outputs are finite and preserve actual structural envelope',()=>{
 for(const layout of Object.keys(source)){const h=makeHouse({...DEFAULT_CONFIG,layout});h.root.updateMatrixWorld(true);h.root.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite),o.name);if(o.isMesh)for(const a of Object.values(o.geometry.attributes))assert.ok(a.array.every(Number.isFinite),o.name);});const box=new THREE.Box3().setFromObject(h.groups.structure);close(box.max.x-box.min.x,6.22,1e-5);close(box.max.z-box.min.z,11.8,1e-5);assert.equal(h.plan.rooms.filter(r=>r.kind==='bedroom').length,source[layout].bedrooms);h.dispose();}
});
check('interior cut removes every high furnishing material while retaining electrical schematic',()=>{
 const h=makeHouse({...DEFAULT_CONFIG,view:'interior',roof:true,porch:true});assert.equal(h.groups.roof.visible,false);assert.equal(h.groups.cover.visible,false);for(const k of ['cabinet','metal','white','inner','steel'])assert.equal(h.materials[k].clippingPlanes.length,1,k);h.setView('electrical');assert.equal(h.materials.electric.clippingPlanes.length,0);assert.equal(h.groups.electrical.visible,true);assert.equal(h.groups.plumbing.visible,false);h.setView('exterior');assert.equal(h.groups.cover.visible,true);h.dispose();
});
check('rigid expansion, no unsupported closed pose and stable visibility across 101 positions',()=>{
 assert.equal(expansionState(-1).floor,1);assert.equal(expansionState(-1).roof,1);assert.equal(expansionState(1).wall,1);assert.equal(expansionState(1).ends,1);assert.ok(expansionState(.5).uncertain);
 const h=makeHouse({...DEFAULT_CONFIG,view:'expansion',roof:true,porch:true});let lastWall=0,lastEnds=0;for(let i=0;i<=100;i++){const e=h.updateExpansion(i/100);assert.ok(e.wall>=lastWall&&e.ends>=lastEnds);lastWall=e.wall;lastEnds=e.ends;h.root.updateMatrixWorld(true);for(const a of h.sideAssemblies){close(a.pivot.matrixWorld.determinant(),1);assert.deepEqual(a.pivot.scale.toArray(),[1,1,1]);}for(const a of h.endAssemblies){close(a.g.matrixWorld.determinant(),1);assert.equal(a.g.visible,true);}assert.equal(h.groups.furniture.visible,false);assert.equal(h.groups.porch.visible,false);assert.equal(h.groups.cover.visible,false);}
 for(const a of h.sideAssemblies)close(a.pivot.rotation.z,0);for(const a of h.endAssemblies)close(a.g.position.z,0);h.setView('exterior');assert.equal(h.groups.furniture.visible,true);h.dispose();
});
check('bath mirroring updates fixtures and service terminals together',()=>{
 const a=getPlan({...DEFAULT_CONFIG,bathroom:'standard'}),b=getPlan({...DEFAULT_CONFIG,bathroom:'mirrored'});for(const id of ['basin','toilet']){const A=a.furnishings.find(x=>x.id===id),B=b.furnishings.find(x=>x.id===id);close(A.x0,-B.x1);close(a.servicePoints.find(x=>x.id===id).x,-b.servicePoints.find(x=>x.id===id).x);}assert.notDeepEqual(a.furnishings,b.furnishings);
});
check('SVG and exported configuration contain the current layout and same area data',()=>{
 for(const layout of Object.keys(source)){const s={...DEFAULT_CONFIG,layout},p=getPlan(s),svg=planSVG(s),json=JSON.parse(encodeConfiguration(s));assert.ok(svg.includes('6 220 mm')&&svg.includes('11 800 mm'));assert.ok(svg.includes(p.label));assert.deepEqual(json.areas,p.areas);assert.equal(json.configuration.layout,layout);assert.ok(!/NaN|undefined/.test(svg));}
});
check('all original plans, catalogue references and application dependencies are present',()=>{
 for(const x of DATA.layouts)assert.ok(existsSync('dist/'+x.image));for(const x of [...DATA.kitchens,...DATA.bathrooms])assert.ok(existsSync('dist/assets/catalogue/'+x.asset));for(const f of ['opcionais-2026.pdf','plantas-40-pes.xlsx'])assert.ok(statSync('dist/assets/'+f).size>1000);
 for(const m of readFileSync('dist/index.html','utf8').matchAll(/(?:src|href)="([^"#]+)"/g)){const u=m[1];if(u==='./'||/^https?:|data:/.test(u)||(core&&/v2(?:-poster)?\.(?:jpg|mp4)$/.test(u)))continue;assert.ok(existsSync('dist/'+u),u);}
});
if(!core)check('new videos, poster images and evidence links are real delivered files',()=>{for(const f of ['presentation-v2.mp4','expansion-v2.mp4','presentation-v2-poster.jpg','expansion-v2-poster.jpg','evidence/audit-report.html','evidence/dimensions.json'])assert.ok(statSync('dist/assets/'+f).size>1000,f);});
check('distributed first-party text contains no machine paths or credentials',()=>{
 function scan(dir){for(const f of readdirSync(dir)){const p=path.join(dir,f);if(statSync(p).isDirectory())scan(p);else if(/\.(js|html|json|css)$/.test(f)&&!p.includes('vendor')){const s=readFileSync(p,'utf8');assert.ok(!s.includes('/Users/'),p);assert.ok(!s.includes('API_KEY'),p);}}}scan('dist');
});
console.log(`${count} scoped regression checks passed${core?' (media/evidence integration pending)':''}.`);
