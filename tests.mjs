import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
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
import {INTERIOR_REFERENCES} from './dist/interior-references.js';
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
 for(const layout of Object.keys(source))for(const kitchen of ['none','linear','l','u','island'])for(const bathroom of ['standard','mirrored']){const s={...DEFAULT_CONFIG,layout,kitchen,bathroom};if(compatibility(s).length)continue;const p=getPlan(s);for(const f of p.furnishings){assert.ok(f.x0>=-3.01-1e-7&&f.x1<=3.01+1e-7&&f.z0>=-5.8-1e-7&&f.z1<=5.8+1e-7,`${layout}/${kitchen}: ${f.id} outside`);if(f.type.includes('kitchen')||f.type==='island')for(const w of p.walls){const r=w.axis==='z'?{x0:w.c-.04,x1:w.c+.04,z0:w.a,z1:w.b}:{x0:w.a,x1:w.b,z0:w.c-.04,z1:w.c+.04};assert.equal(intersects(f,r),false,`${layout}/${kitchen}: ${f.id} vs ${w.id}`);}}
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
check('R3 grain treatment preserves 12 source identities and native map dimensions',()=>{
 const manifest=JSON.parse(readFileSync('dist/assets/catalogue-r3/floor-manifest.json','utf8'));
 assert.equal(manifest.entries.length,12);
 for(const entry of manifest.entries){assert.ok(MATERIALS.find(m=>m.id===entry.id));const png=readFileSync('dist/assets/catalogue-r3/'+entry.derivedAsset);assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],entry.dimensionsPx);assert.equal(entry.physicalDimensionsStatus,'visualisation-estimate-not-manufacturer-data');assert.ok(entry.metrics.meanMaxAbsDifferenceSrgb8<.01);assert.ok(entry.metrics.highFrequencyCorrelationInner>.99);}
});
check('37 wall derivatives retain native dimensions and original identities',()=>{
 const manifest=JSON.parse(readFileSync('dist/assets/catalogue-r3/wall-manifest.json','utf8')),entries=manifest.entries.filter(e=>e.derivedAsset);assert.equal(entries.length,37);
 for(const e of entries){assert.ok(MATERIALS.find(m=>m.id===e.id));const png=readFileSync('dist/assets/catalogue-r3/'+e.derivedAsset);assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],e.dimensionsPx);assert.equal(createHash('sha256').update(png).digest('hex'),e.sha256);assert.equal(e.physicalDimensionsStatus,'visualisation-estimate-not-manufacturer-data');}
});
check('R3 collapsed layers remain collapsed and optional roofs never hide structure',()=>{
 const h=makeHouse({...DEFAULT_CONFIG,view:'finishes',exploded:0,roof:true,porch:true});close(h.groups.roof.position.y,0);h.setView('finishes');close(h.groups.roof.position.y,0);h.setExploded(1);h.setExploded(0);for(const a of h.sideAssemblies)close(a.pivot.position.x,a.framePivot.position.x);h.setView('structure');assert.ok(h.groups.cover.children.some(o=>o.visible&&o.material===h.materials.steel));assert.equal(h.groups.cover.children.filter(o=>o.material===h.materials.roof&&o.visible).length,0);assert.equal(h.groups.porch.children.find(o=>o.name==='Cobertura do alpendre').visible,false);h.setView('exterior');assert.ok(h.groups.cover.children.every(o=>o.visible));h.dispose();
});
check('four original reference videos preserve their hashes and valid chapter bounds',()=>{
 const videos=JSON.parse(readFileSync('dist/assets/reference-videos/source-inventory.json','utf8')).videos;assert.equal(videos.length,4);
 for(const video of videos){assert.equal(createHash('sha256').update(readFileSync('dist/'+video.asset)).digest('hex'),video.sha256);assert.equal(video.frames.length,4);for(const frame of video.frames){assert.ok(frame.time_seconds>=0&&frame.time_seconds<video.duration_seconds);assert.equal(createHash('sha256').update(readFileSync('dist/'+frame.asset)).digest('hex'),frame.sha256);}}
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
check('complete rigid expansion, illustrative folded pose and stable visibility across 101 positions',()=>{
 assert.equal(expansionState(-1).floor,0);assert.equal(expansionState(-1).roof,0);assert.equal(expansionState(1).floor,1);assert.equal(expansionState(1).roof,1);assert.equal(expansionState(1).wall,1);assert.equal(expansionState(1).ends,1);assert.ok(expansionState(.5).uncertain);
 const h=makeHouse({...DEFAULT_CONFIG,view:'expansion',roof:true,porch:true});let lastWall=0,lastEnds=0;for(let i=0;i<=100;i++){const e=h.updateExpansion(i/100);assert.ok(e.wall>=lastWall&&e.ends>=lastEnds);lastWall=e.wall;lastEnds=e.ends;h.root.updateMatrixWorld(true);for(const a of h.sideAssemblies){close(a.pivot.matrixWorld.determinant(),1);assert.deepEqual(a.pivot.scale.toArray(),[1,1,1]);}for(const a of h.endAssemblies){close(a.g.matrixWorld.determinant(),1);assert.equal(a.g.visible,true);}assert.equal(h.groups.furniture.visible,false);assert.equal(h.groups.porch.visible,false);assert.equal(h.groups.cover.visible,false);}
 for(const a of h.sideAssemblies)close(a.pivot.rotation.z,0);for(const a of h.endAssemblies){close(a.pivot.rotation.y,0);close(a.pivot.position.z,a.front*DIM.length/2);}for(const a of [...h.floorAssemblies,...h.roofAssemblies])for(const p of a.pivots)close(p.rotation.z,0);h.setView('exterior');assert.equal(h.groups.furniture.visible,true);h.dispose();
});
check('R4 folded assemblies move rigidly, mandatory surfaces remain visible and full opening matches the house',()=>{
 const h=makeHouse({...DEFAULT_CONFIG,view:'expansion',wallsVisible:false,roofVisible:false});
 assert.equal(h.groups.shell.visible,true);assert.equal(h.groups.roof.visible,true);assert.ok(h.sideAssemblies.every(a=>a.pivot.visible));
 const meshes=[];h.root.traverse(o=>{if(o.isMesh)meshes.push(o);});const before=new Map();h.updateExpansion(1);h.root.updateMatrixWorld(true);for(const m of meshes)before.set(m,m.matrixWorld.clone());
 for(let n=0;n<=100;n++){h.updateExpansion(n/100);h.root.updateMatrixWorld(true);for(const a of [...h.floorAssemblies,...h.roofAssemblies])for(const p of a.pivots){close(p.matrixWorld.determinant(),1);assert.deepEqual(p.scale.toArray(),[1,1,1]);}for(const a of h.sideAssemblies){const box=new THREE.Box3().setFromObject(a.framePivot);assert.ok(box.min.y>-.001,'Folded post penetrates floor level at '+n);}}
 h.setView('exterior');h.root.updateMatrixWorld(true);for(const m of meshes)for(let i=0;i<16;i++)close(m.matrixWorld.elements[i],before.get(m).elements[i]);assert.equal(h.groups.shell.visible,false);assert.ok(h.sideAssemblies.every(a=>!a.pivot.visible));h.dispose();
});
check('bath mirroring updates fixtures and service terminals together',()=>{
 const a=getPlan({...DEFAULT_CONFIG,bathroom:'standard'}),b=getPlan({...DEFAULT_CONFIG,bathroom:'mirrored'});for(const id of ['basin','toilet']){const A=a.furnishings.find(x=>x.id===id),B=b.furnishings.find(x=>x.id===id);close(A.x0,-B.x1);close(a.servicePoints.find(x=>x.id===id).x,-b.servicePoints.find(x=>x.id===id).x);}assert.notDeepEqual(a.furnishings,b.furnishings);
});
check('SVG and exported configuration contain the current layout and same area data',()=>{
 for(const layout of Object.keys(source)){const s={...DEFAULT_CONFIG,layout},p=getPlan(s),svg=planSVG(s),json=JSON.parse(encodeConfiguration(s));assert.ok(svg.includes('6 220 mm')&&svg.includes('11 800 mm'));assert.ok(svg.includes(p.label));assert.deepEqual(json.areas,p.areas);assert.equal(json.configuration.layout,layout);assert.ok(!/NaN|undefined/.test(svg));}
});
check('plan area labels retain readable contrast with extreme custom floors',()=>{
 const luminance=hex=>{const values=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return values.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
 for(const floor of ['#000000','#ffffff','#ff0000','#00ff00','#0000ff']){const svg=planSVG({...DEFAULT_CONFIG,floorId:null,floor}),background=svg.match(/rx="0" fill="(#[a-f0-9]{6})"/)[1],foreground='#405a47';assert.ok(svg.includes(foreground));assert.ok((luminance(background)+.05)/(luminance(foreground)+.05)>=4.5);}
});
check('all original plans, catalogue references and application dependencies are present',()=>{
 for(const x of DATA.layouts)assert.ok(existsSync('dist/'+x.image));for(const x of [...DATA.kitchens,...DATA.bathrooms])assert.ok(existsSync('dist/assets/catalogue/'+x.asset));for(const f of ['opcionais-2026.pdf','plantas-40-pes.xlsx'])assert.ok(statSync('dist/assets/'+f).size>1000);
 for(const m of readFileSync('dist/index.html','utf8').matchAll(/(?:src|href)="([^"#]+)"/g)){const u=m[1];if(u==='./'||/^https?:|data:/.test(u)||(core&&/v2(?:-poster)?\.(?:jpg|mp4)$/.test(u)))continue;assert.ok(existsSync('dist/'+u),u);}
});
check('R5 all 32 reference selections affect the actual model and retain source provenance',()=>{
 const signatures={kitchen:new Set(),bathroom:new Set()};for(const [id,ref]of Object.entries(INTERIOR_REFERENCES)){
  const kitchen=id.startsWith('kitchen'),h=makeHouse({...DEFAULT_CONFIG,[kitchen?'kitchenRef':'bathroomRef']:id,kitchen:kitchen?ref.layout:'linear'});const features=[];
  h.groups.furniture.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;features.push([p.count,o.geometry.index?.count||0,o.material.color?.getHexString(),o.material.userData.referenceAsset||'',o.position.toArray()]);}});
  if(!kitchen)features.push(h.materials.bath.color.getHexString(),h.materials.bath.userData.referenceAsset);
  signatures[kitchen?'kitchen':'bathroom'].add(createHash('sha256').update(JSON.stringify(features)).digest('hex'));
  assert.equal(h.details[kitchen?'kitchen':'bath'].id,id);assert.ok(existsSync('dist/'+ref.sourceAsset));for(const surface of Object.values(ref.surfaces))assert.ok(existsSync('dist/'+surface.sampleAsset));
  let oven=false;h.root.traverse(o=>{if(/forno/i.test(o.name))oven=true;});assert.equal(oven,false);h.dispose();
 }assert.equal(signatures.kitchen.size,15);assert.equal(signatures.bathroom.size,17);
});
check('R5 fixture details reveal full height, open reversibly and respect bathroom wall overrides',()=>{
 for(const kind of ['kitchen','bathroom']){const h=makeHouse({...DEFAULT_CONFIG,view:'interior',kitchenRef:'kitchen-11',bathroomRef:'bathroom-02'});const before=h.details.motions.map(m=>[m.g.position.clone(),m.g.quaternion.clone()]);h.setDetail(kind);assert.equal(h.root.userData.detail,kind);assert.ok(h.detailBounds(kind).max.y>2);assert.ok(h.details.motions.length>0);h.details.setOpen(true);assert.ok(h.details.motions.some(m=>m.opened));h.details.setOpen(false);h.details.motions.forEach((m,i)=>{close(m.g.position.distanceTo(before[i][0]),0);close(m.g.quaternion.angleTo(before[i][1]),0);});h.setView('expansion');assert.equal(h.groups.furniture.visible,false);h.dispose();}
 const h=makeHouse({...DEFAULT_CONFIG,bathroomUV:DATA.swatches['bathroom-uv'][0].id});assert.equal(h.materials.bath.userData.materialId,DATA.swatches['bathroom-uv'][0].id);h.dispose();
});
check('R5 digital catalogue mode disables illumination of reference finishes, including solid samples',()=>{
 for(const id of ['kitchen-02','kitchen-12','bathroom-06','bathroom-16']){const h=makeHouse({...DEFAULT_CONFIG,lighting:'catalogue',[id.startsWith('kitchen')?'kitchenRef':'bathroomRef']:id});for(const m of [h.materials.exterior,h.materials.floor,h.details.K.front,h.details.K.counter,h.details.K.upper,h.details.B.front,h.details.B.counter,h.details.B.wall])assert.equal(m.toneMapped,false,m.name);h.dispose();}
 const legacy={...DEFAULT_CONFIG};delete legacy.textureMode;assert.equal(validateConfiguration(legacy).textureMode,'source');assert.throws(()=>validateConfiguration({...DEFAULT_CONFIG,textureMode:'fake'}));
});
if(!core)check('new videos, poster images and evidence links are real delivered files',()=>{for(const f of ['presentation-v3.mp4','expansion-v4.mp4','presentation-v3-poster.jpg','expansion-v4-poster.jpg','evidence-r4/audit-report.html','evidence-r4/dimensions.json'])assert.ok(statSync('dist/assets/'+f).size>1000,f);});
check('distributed first-party text contains no machine paths or credentials',()=>{
 function scan(dir){for(const f of readdirSync(dir)){const p=path.join(dir,f);if(statSync(p).isDirectory())scan(p);else if(/\.(js|html|json|css)$/.test(f)&&!p.includes('vendor')){const s=readFileSync(p,'utf8');assert.ok(!s.includes('/Users/'),p);assert.ok(!s.includes('API_KEY'),p);}}}scan('dist');
});
console.log(`${count} scoped regression checks passed${core?' (media/evidence integration pending)':''}.`);
