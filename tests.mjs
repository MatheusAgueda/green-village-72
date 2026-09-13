import {REFERENCE_VIDEOS} from './dist/reference-videos.js';
import {processPose,PROCESS_STEPS} from './dist/expansion-process.js';
import {technicalSheetMarkup} from './dist/technical-sheet.js';
import {CATALOGUE_OPTIONS,TECHNICAL_FACTS} from './dist/technical-data.js';
import assert from 'node:assert/strict';
import {createHistory,shareConfiguration,readSharedConfiguration,migrateStoredConfiguration,sourceLedger,quoteLink} from './dist/client-tools.js';
import {createLayerController,LAYERS} from './dist/model-layers.js';
import {navigationSegments,canWalk,moveInside} from './dist/walkthrough.js';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';
import * as THREE from './dist/vendor/three.module.js';
import {makeHouse} from './dist/model.js';
import {DIM,MEASURES,getPlan,doorPose,DOOR_DETAIL,compatibility,expansionState,unionArea,intersects} from './dist/specification.js';
import {DEFAULT_CONFIG,validateConfiguration,encodeConfiguration,decodeConfiguration,summaryRows,SWATCHES} from './dist/configuration.js';
import {MATERIALS} from './dist/material-data.js';
import {physicalUV} from './dist/material-library.js';
import {planSVG} from './dist/plan-svg.js';
import {DATA} from './dist/data.js';
import {INTERIOR_REFERENCES} from './dist/interior-references.js';
import {selectionMaterials,selectionGroups,configurationReference,summaryMarkup} from './dist/portfolio.js';
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
 const side=p.perimeter.filter(w=>w.axis==='z');assert.deepEqual(side.map(w=>w.holes.length),ref.side,id);const rear=p.perimeter.find(w=>w.axis==='x'&&w.c<0);assert.equal(rear.holes.filter(w=>w.width===.92).length,id.endsWith('-b')?0:2,id);
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
 const s=validateConfiguration({...DEFAULT_CONFIG,layout:'t3-b',kitchen:'l',bathroom:'mirrored',roof:true,porch:true,floorId:'floor-spc-kx8006'});assert.deepEqual(decodeConfiguration(encodeConfiguration(s)),s);for(const text of ['{','null','[]','{}',JSON.stringify({...s,floorId:'missing'}),JSON.stringify({...s,roof:'yes'}),JSON.stringify({...s,interior:'javascript:test'}),'x'.repeat(100001)])assert.throws(()=>decodeConfiguration(text));const missing={...s};delete missing.floorId;assert.throws(()=>validateConfiguration(missing),/Falta/);assert.equal(summaryRows(s).find(([k])=>k==='Planta')[1],DATA.layouts.find(x=>x.id==='t3-b').label);
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
check('four source reference videos match their published hashes and valid chapter bounds',()=>{
 const videos=JSON.parse(readFileSync('dist/assets/reference-videos/source-inventory.json','utf8')).videos;assert.equal(videos.length,4);
 for(const video of videos){assert.equal(createHash('sha256').update(readFileSync('dist/'+video.asset)).digest('hex'),video.sha256);assert.equal(video.frames.length,4);for(const frame of video.frames){assert.ok(frame.time_seconds>=0&&frame.time_seconds<video.duration_seconds);assert.equal(createHash('sha256').update(readFileSync('dist/'+frame.asset)).digest('hex'),frame.sha256);}}
});
check('supplied videos expose verified published bytes and individual media metadata',()=>{
 const newer=JSON.parse(readFileSync('dist/assets/reference-videos-r13/source-inventory.json','utf8')).videos;
 assert.equal(newer.length,2);assert.equal(REFERENCE_VIDEOS.videos.length,8);assert.equal(new Set(REFERENCE_VIDEOS.videos.map(v=>v.id)).size,8);assert.ok(!REFERENCE_VIDEOS.videos.some(v=>v.id==='visita-modulo-exposicao'));
 for(const video of newer){const entry=REFERENCE_VIDEOS.videos.find(v=>v.id===video.id);assert.deepEqual(entry,video);const bytes=readFileSync('dist/'+video.asset);assert.equal(bytes.length,video.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),video.sha256);assert.ok(video.native_pixels.every(n=>Number.isInteger(n)&&n>0));assert.equal(typeof video.has_audio,'boolean');assert.equal(createHash('sha256').update(readFileSync('dist/'+video.poster)).digest('hex'),video.poster_sha256);assert.ok(video.frames.every(f=>f.time_seconds>=0&&f.time_seconds<video.duration_seconds));}
});
check('delivery references preserve supplied YouTube moments, posters and user-controlled audio',()=>{
 const expected=[['mrVo6rKW270',945,'15:45'],['UGaynQUNfms',492,'08:12']];
 const videos=REFERENCE_VIDEOS.videos.filter(v=>v.collection==='delivery');assert.equal(videos.length,2);
 for(const [id,start,label] of expected){
  const v=videos.find(v=>new URL(v.sourceUrl).searchParams.get('v')===id);assert.ok(v,id);
  assert.equal(new URL(v.sourceUrl).searchParams.get('t'),start+'s');assert.equal(v.sourceStartSeconds,start);assert.equal(v.sourceStartLabel,label);
  assert.equal(v.provider,'youtube');assert.equal(v.youtubeId,id);assert.equal(v.playback_policy,'user-controlled-audio');assert.equal(v.asset,undefined);
  assert.equal(createHash('sha256').update(readFileSync('dist/'+v.poster)).digest('hex'),v.poster_sha256);
  assert.ok(v.duration_seconds>0);assert.ok(v.frames.length>0);assert.ok(v.frames.every(f=>f.time_seconds>=0&&f.time_seconds<v.duration_seconds));
 }
});
check('ALL distributed MP4 files contain video and zero audio tracks',()=>{
 const inventory=JSON.parse(readFileSync('audit/r14/silent-media.json','utf8'));
 inventory.assets=inventory.assets.filter(v=>v.path!=='dist/assets/reference-videos-r13/gv-display-module-walkthrough-20260913.mp4');
 const publicFiles=[];const walk=dir=>{for(const item of readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(file.endsWith('.mp4'))publicFiles.push(file);}};walk('dist');
 assert.deepEqual(publicFiles.sort(),inventory.assets.map(v=>v.path).sort());
 for(const record of inventory.assets){
  const file=record.path,bytes=readFileSync(file),handlers=[];
  const scan=(start,end)=>{let pos=start;while(pos<end){assert.ok(pos+8<=end,file);let size=bytes.readUInt32BE(pos),header=8;const type=bytes.toString('ascii',pos+4,pos+8);if(size===1){assert.ok(pos+16<=end,file);size=Number(bytes.readBigUInt64BE(pos+8));header=16;}else if(size===0)size=end-pos;assert.ok(size>=header&&pos+size<=end,file);if(['moov','trak','mdia'].includes(type))scan(pos+header,pos+size);else if(type==='hdlr'){assert.ok(size>=header+12,file);handlers.push(bytes.toString('ascii',pos+header+8,pos+header+12));}pos+=size;}};
  scan(0,bytes.length);assert.ok(handlers.includes('vide'),file);assert.ok(!handlers.includes('soun'),file+' contains audio');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),record.publishedSha256,file);assert.equal(record.outputAudioStreams,0,file);
 }
 for(const v of REFERENCE_VIDEOS.videos.filter(v=>v.provider!=='youtube'))assert.equal(v.has_audio,false,v.id);
});
check('metre UVs preserve physical scale across different mesh fragments',()=>{
 const a=physicalUV(new THREE.BoxGeometry(1,2,.1),[0,1,0]),b=physicalUV(new THREE.BoxGeometry(2,2,.1),[1.5,1,0]);const span=g=>{const u=[];for(let i=0;i<g.attributes.position.count;i++)if(g.attributes.normal.getZ(i)>.9)u.push(g.attributes.uv.getX(i));return Math.max(...u)-Math.min(...u);};close(span(a),1);close(span(b),2);a.dispose();b.dispose();
});
check('R16 partitions remain behind the facade and every glazing aperture is continuous',()=>{
 for(const layout of Object.keys(source)){
  const h=makeHouse({...DEFAULT_CONFIG,layout,view:'exterior',doorsOpen:false});h.root.updateMatrixWorld(true);
  try{
   for(const o of h.groups.interior.children.filter(o=>o.isMesh&&[h.materials.panelInterior,h.materials.white].includes(o.material))){
    const b=new THREE.Box3().setFromObject(o);for(const [axis,size]of [['x',DIM.width],['z',DIM.length]]){assert.ok(b.min[axis]>=-size/2+DIM.panel-1e-6,layout+' '+o.name);assert.ok(b.max[axis]<=size/2-DIM.panel+1e-6,layout+' '+o.name);}
   }
   for(const face of h.plan.perimeter)for(const hole of face.holes)for(const offset of [-.03,-.02,.02,.03]){
    const sign=Math.sign(face.c),u=hole.u+offset,y=hole.sill+hole.height/2;
    const origin=face.axis==='z'?new THREE.Vector3(face.c+sign*.5,y,u):new THREE.Vector3(u,y,face.c+sign*.5),direction=face.axis==='z'?new THREE.Vector3(-sign,0,0):new THREE.Vector3(0,0,-sign);
    const hit=new THREE.Raycaster(origin,direction).intersectObject(h.root,true)[0];assert.equal(hit?.object.name,hole.id+' · vidro',layout+' '+hole.id+' '+offset);
   }
   const skin=[];h.groups.interior.traverse(o=>{if(o.name==='Revestimento UV posterior')skin.push(o);});
   const ray=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,-DIM.length/2-1),new THREE.Vector3(0,0,1)).intersectObjects(skin);
   for(const x of [-.25,0,.25])for(const y of [1.75,1.95,2.15])assert.equal(ray(x,y).length,0,layout+' bathroom aperture');
   assert.ok(ray(0,1).length>0);assert.ok(ray(0,2.3).length>0);
  }finally{h.dispose();}
 }
});
check('R16 kitchen fitting adaptations remain in commercial summaries',()=>{
 for(const layout of ['t2','t4-a']){const s={...DEFAULT_CONFIG,layout,kitchenRef:'kitchen-01'},expected=layout==='t4-a'?'1,60 m':'janelas livres';assert.ok(summaryRows(s).flat().join(' ').includes(expected));assert.ok(selectionGroups(s).flatMap(g=>g.rows).flat().join(' ').includes(expected));assert.ok(summaryMarkup(s,{}).includes(expected));}
});
check('all seven geometry outputs are finite and preserve actual structural envelope',()=>{
 for(const layout of Object.keys(source)){const h=makeHouse({...DEFAULT_CONFIG,layout});h.root.updateMatrixWorld(true);h.root.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite),o.name);if(o.isMesh)for(const a of Object.values(o.geometry.attributes))assert.ok(a.array.every(Number.isFinite),o.name);});const box=new THREE.Box3().setFromObject(h.groups.structure);close(box.max.x-box.min.x,6.22,1e-5);close(box.max.z-box.min.z,11.8,1e-5);assert.equal(h.plan.rooms.filter(r=>r.kind==='bedroom').length,source[layout].bedrooms);h.dispose();}
});
check('interior cut applies to furnishings; undocumented technical layers contain no geometry',()=>{
 const h=makeHouse({...DEFAULT_CONFIG,view:'interior',roof:true,porch:true});assert.equal(h.groups.roof.visible,false);assert.equal(h.groups.cover.visible,false);for(const k of ['cabinet','metal','white','inner','steel'])assert.equal(h.materials[k].clippingPlanes.length,1,k);h.setView('electrical');assert.equal(h.groups.electrical.children.length,0);assert.equal(h.groups.plumbing.children.length,0);assert.equal(h.groups.electrical.visible,true);assert.equal(h.groups.plumbing.visible,false);h.setView('exterior');assert.equal(h.groups.cover.visible,true);h.dispose();
});
check('R9 wall raising keeps windows rigid and leaves undocumented end panels out of the demonstration',()=>{
 assert.equal(expansionState(-1).wall,0);assert.equal(expansionState(1).wall,1);assert.equal(expansionState(1).angle,0);assert.ok(expansionState(.5).uncertain);assert.equal(expansionState(1).roofLift,0);assert.equal(expansionState(0).roofLift,.008);
 const h=makeHouse({...DEFAULT_CONFIG,view:'expansion',roof:true,porch:true});let lastWall=0;for(let i=0;i<=100;i++){const e=h.updateExpansion(i/100);assert.ok(e.wall>=lastWall);lastWall=e.wall;h.root.updateMatrixWorld(true);for(const a of h.sideAssemblies){close(a.pivot.matrixWorld.determinant(),1);assert.deepEqual(a.pivot.scale.toArray(),[1,1,1]);}for(const a of h.endAssemblies){close(a.g.matrixWorld.determinant(),1);assert.equal(a.g.visible,false);}assert.equal(h.groups.furniture.visible,false);assert.equal(h.groups.porch.visible,false);assert.equal(h.groups.cover.visible,false);}
 for(const a of h.sideAssemblies)close(a.pivot.rotation.z,0);for(const a of h.endAssemblies){close(a.pivot.rotation.y,0);close(a.pivot.position.z,a.front*DIM.length/2);}for(const a of [...h.floorAssemblies,...h.roofAssemblies])for(const p of a.pivots)close(p.rotation.z,0);h.setView('exterior');assert.equal(h.groups.furniture.visible,true);h.dispose();
});
check('R9 animation restores assembled geometry and the selected visibility',()=>{
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
 for(const m of readFileSync('dist/index.html','utf8').matchAll(/(?:src|href)="([^"#]+)"/g)){const u=m[1];if(u==='./'||/^https?:|data:/.test(u)||u==='mailto:info@greenvillagemobilehomes.com'||(core&&/v2(?:-poster)?\.(?:jpg|mp4)$/.test(u)))continue;assert.ok(existsSync('dist/'+u.split('?')[0]),u);}
});
check('returning browsers receive the current application module graph',()=>{
 const html=readFileSync('dist/index.html','utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
 for(const name of readdirSync('dist').filter(n=>n.endsWith('.js'))){
  const hash=createHash('sha256').update(readFileSync('dist/'+name)).digest('hex').slice(0,16);
  assert.equal(map.imports['./'+name],'./'+name+'?v='+hash,'Run npm run prepare:site after changing '+name);
 }
 assert.equal(html.match(/<script type="module" src="([^"]+)"/)[1],map.imports['./app.js']);
 assert.equal(map.imports.three,'./vendor/three.module.js');
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
if(!core)check('R6 source door hinges open into their rooms, mirror coherently and return to the same closed pose',()=>{
 for(const [layout,ref]of Object.entries(source))for(const bathroom of ['standard','mirrored']){
  const config={...DEFAULT_CONFIG,layout,bathroom},h=makeHouse({...config,view:'interior'}),p=h.plan;
  p.rooms.filter(r=>r.kind==='bedroom').forEach((r,i)=>assert.equal(p.doors.find(d=>d.opensInto===r.id).hingeEnd,ref.doors[i]));
  const bath=p.doors.find(d=>d.id==='bath-door');assert.equal(bath.hingeEnd,bathroom==='standard'?'end':'start');assert.equal(bath.opensInto,p.rooms.find(r=>r.kind==='bathroom').id);
  h.setDoors(false);const closed=h.doors.map(d=>({id:d.id,matrix:d.pivot.matrix.toArray(),position:d.pivot.position.toArray()}));
  for(const open of [true,false,true,false]){h.setDoors(open);h.root.updateMatrixWorld(true);for(const d of h.doors){const pose=doorPose(d,open?1:0);close(d.pivot.rotation.y,pose.angle);close(d.pivot.position.x,pose.hinge.x);close(d.pivot.position.z,pose.hinge.z);assert.deepEqual(d.pivot.position.toArray(),closed.find(x=>x.id===d.id).position);if(open){const r=p.rooms.find(r=>r.id===d.opensInto);assert.ok(pose.tip.x>r.outline.x0&&pose.tip.x<r.outline.x1&&pose.tip.z>r.outline.z0&&pose.tip.z<r.outline.z1,layout+' '+d.id+' must open inward');}else close(d.pivot.rotation.y,0);}}
  const svg=planSVG(config);for(const d of p.doors){const pose=doorPose(d,1);assert.ok(svg.includes(`data-door-id="${d.id}" data-hinge-end="${d.hingeEnd}" data-open-angle="${pose.angle}"`));close(pose.leafWidth,d.width-2*DOOR_DETAIL.endGap);}
  h.dispose();
 }
});
check('R6 individual furniture states survive rebuild and hidden groups cannot be toggled',()=>{
 const config={...DEFAULT_CONFIG,kitchen:'linear',kitchenRef:'kitchen-09',view:'interior'},a=makeHouse(config),m=a.details.motions.find(m=>m.scope==='kitchen'&&m.kind==='rotation');assert.ok(m);a.details.toggle(m.g.children[0]);assert.equal(m.opened,true);const saved=a.details.capture(),b=makeHouse({...config,floor:'#bb9988'});b.details.restore(saved);assert.equal(b.details.motions.find(x=>x.key===m.key).opened,true);assert.equal(b.details.status('bathroom').anyOpen,false);
 b.details.setOpen(true,'kitchen');assert.equal(b.details.status('kitchen').allOpen,true);assert.equal(b.details.status('bathroom').anyOpen,false);b.setDetail('bathroom');const hidden=b.details.motions.find(x=>x.scope==='kitchen');assert.equal(b.details.toggle(hidden.g.children[0]),null);b.details.setOpen(false);assert.equal(b.details.status().anyOpen,false);a.dispose();b.dispose();
});
check('R6 partial construction releases acquired materials without touching the existing house',()=>{
 const live=new Set();let calls=0,failAt=Infinity;const create=()=>{if(++calls===failAt)throw new Error('Injected construction failure');const m=new THREE.MeshStandardMaterial();m.userData.lease='test-'+calls;live.add(m);return m;},lib={create,createPhoto:create,release(m){live.delete(m);m.dispose();}};
 const original=makeHouse(DEFAULT_CONFIG,lib),baseline=live.size;assert.ok(baseline>0);
 for(const offset of [3,6,8]){failAt=calls+offset;assert.throws(()=>makeHouse(DEFAULT_CONFIG,lib),/Injected construction failure/);assert.equal(live.size,baseline);assert.ok(original.root.children.length);}
 original.dispose();assert.equal(live.size,0);original.dispose();assert.equal(live.size,0);
});
check('R6 picking stops at opaque surfaces and ignores hidden or clipped surfaces',()=>{
 const h=makeHouse({...DEFAULT_CONFIG,kitchen:'linear',view:'interior'}),m=h.details.motions.find(x=>x.scope==='kitchen'),leaf=m.g.children[0],point=new THREE.Vector3(),panel=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
 const hits=[{object:panel,point},{object:leaf,point}];assert.equal(h.details.pick(hits),null);assert.equal(m.opened,false);
 panel.visible=false;assert.ok(h.details.pick(hits));assert.equal(m.opened,true);h.details.setOpen(false);
 panel.visible=true;panel.material.clippingPlanes=[new THREE.Plane(new THREE.Vector3(1,0,0),-1)];assert.ok(h.details.pick(hits));assert.equal(m.opened,true);
 panel.geometry.dispose();panel.material.dispose();h.dispose();
});
check('R6 open furniture remains inside the detail camera bounds and is not clipped',()=>{
 for(const ref of DATA.kitchens){const h=makeHouse({...DEFAULT_CONFIG,kitchen:'linear',kitchenRef:ref.id,view:'interior'});h.details.setOpen(true,'kitchen');h.setDetail('kitchen');h.root.updateMatrixWorld(true);const bounds=h.detailBounds('kitchen').expandByScalar(1e-8);for(const m of h.details.motions.filter(m=>m.scope==='kitchen'))assert.ok(bounds.containsBox(new THREE.Box3().setFromObject(m.g)),ref.id+' open component');for(const material of h.details.detailMaterials)assert.equal(material.clippingPlanes.length,0);h.dispose();}
});
check('new videos, poster images and evidence links are real delivered files',()=>{for(const f of ['presentation-v3.mp4','expansion-v4.mp4','presentation-v3-poster.jpg','expansion-v4-poster.jpg','evidence-r4/audit-report.html','evidence-r4/dimensions.json'])assert.ok(statSync('dist/assets/'+f).size>1000,f);});
check('R7 commercial summaries retain selected references and omit inactive kitchen photographs',()=>{
 for(const layout of DATA.layouts)for(const kitchen of ['none','linear']){
  const state=validateConfiguration({...DEFAULT_CONFIG,layout:layout.id,kitchen}),cards=selectionMaterials(state),groups=selectionGroups(state),markup=summaryMarkup(state,{plan:planSVG(state)});
  assert.equal(cards.some(m=>m.title.startsWith('Cozinha')),kitchen!=='none');assert.ok(groups.flatMap(g=>g.rows).some(([k,v])=>k==='Planta'&&v===layout.label));
  assert.ok(!/undefined|NaN/.test(markup));assert.equal(configurationReference(state),configurationReference(decodeConfiguration(encodeConfiguration(state))));
  if(kitchen==='none')assert.ok(!JSON.stringify(summaryRows(state)).includes('elementos aplicados ao 3D'));
  for(const m of cards)if(m.image)assert.ok(existsSync('dist/'+m.image),m.image);
 }
 const state={...DEFAULT_CONFIG,interiorName:'<img src=x onerror=alert(1)>'};assert.ok(!summaryMarkup(state).includes('<img src=x'));
});
check('R8 gallery has eleven matching native 4K views without undocumented expansion',()=>{
 const manifest=JSON.parse(readFileSync('dist/assets/presentation-r8/manifest.json','utf8'));assert.equal(manifest.items.length,11);assert.equal(new Set(manifest.items.map(i=>i.id)).size,11);
 assert.deepEqual([...new Set(manifest.items.map(i=>i.category))].sort(),['construction','exterior','interior']);
 function dimensions(bytes){let at=2;while(at<bytes.length){if(bytes[at]!==255){at++;continue;}const marker=bytes[at+1],length=bytes.readUInt16BE(at+2);if([192,193,194].includes(marker))return [bytes.readUInt16BE(at+7),bytes.readUInt16BE(at+5)];at+=2+length;}throw new Error('JPEG dimensions not found');}
 for(const item of manifest.items){validateConfiguration(item.configuration);assert.ok(['exterior','interior','structure'].includes(item.view));for(const field of ['image','thumbnail'])assert.ok(existsSync('dist/'+item[field]));assert.deepEqual(dimensions(readFileSync('dist/'+item.image)),[3840,2160]);assert.deepEqual(dimensions(readFileSync('dist/'+item.thumbnail)),[960,540]);if(item.room)assert.ok(['kitchen','bathroom'].includes(item.room));}
});
check('distributed first-party text contains no machine paths or credentials',()=>{
 function scan(dir){for(const f of readdirSync(dir)){const p=path.join(dir,f);if(statSync(p).isDirectory())scan(p);else if(/\.(js|html|json|css)$/.test(f)&&!p.includes('vendor')){const s=readFileSync(p,'utf8');assert.ok(!s.includes('/Users/'),p);assert.ok(!s.includes('API_KEY'),p);}}}scan('dist');
});
check('R9 only documented wall raising is animated and repeated poses do not drift',()=>{
 for(const layout of Object.keys(source)){
  const h=makeHouse({...DEFAULT_CONFIG,layout,view:'expansion',expansion:1});h.root.updateMatrixWorld(true);const closed=h.sideAssemblies.map(a=>a.pivot.matrixWorld.toArray());
  h.updateExpansion(0);h.root.updateMatrixWorld(true);assert.notDeepEqual(h.sideAssemblies[0].pivot.matrixWorld.toArray(),closed[0]);const folded=h.sideAssemblies.map(a=>a.pivot.matrixWorld.toArray());
  for(const p of [.4,1,0,.85,.12,1,0]){const e=h.updateExpansion(p);assert.equal(e.scope,'longitudinal-wall-raising');assert.equal(e.referenceOnly,false);h.root.updateMatrixWorld(true);if(p===0)h.sideAssemblies.forEach((a,i)=>assert.deepEqual(a.pivot.matrixWorld.toArray(),folded[i]));if(p===1)h.sideAssemblies.forEach((a,i)=>assert.deepEqual(a.pivot.matrixWorld.toArray(),closed[i]));}
  assert.equal(h.groups.plumbing.children.length,0);assert.equal(h.groups.electrical.children.length,0);h.setView('exterior');assert.ok(h.endAssemblies.every(a=>a.g.visible));h.dispose();
 }
 const html=readFileSync('dist/index.html','utf8');assert.ok(html.includes('id="play-expansion"'));assert.ok(html.includes('id="expansion-range"'));assert.equal(html.includes('src="assets/expansion-v4.mp4"'),false);assert.equal(html.includes('type="color"'),false);
});
check('R8 catalogue validation excludes undocumented colours and migrates legacy locally without losing plans',()=>{
 assert.throws(()=>validateConfiguration({...DEFAULT_CONFIG,floorId:null}));assert.throws(()=>validateConfiguration({...DEFAULT_CONFIG,exteriorId:null}));assert.throws(()=>validateConfiguration({...DEFAULT_CONFIG,interior:'#123456'}));
 const old={...DEFAULT_CONFIG,layout:'t4-b',floorId:null,interior:'#123456'},m=migrateStoredConfiguration(JSON.stringify(old));assert.equal(m.configuration.layout,'t4-b');assert.equal(m.configuration.floorId,DEFAULT_CONFIG.floorId);assert.deepEqual(m.changes,['floor','interior']);
});
check('R8 undo redo branch and share links preserve validated states',()=>{
 const h=createHistory(DEFAULT_CONFIG),b={...DEFAULT_CONFIG,roof:true},c={...b,porch:true};h.push(b);h.push(c);assert.equal(h.canUndo,true);assert.deepEqual(h.undo(),b);assert.deepEqual(h.redo(),c);h.undo();h.push({...b,layout:'t1'});assert.equal(h.canRedo,false);
 const shared=shareConfiguration(c,'https://example.test/path/#old');assert.deepEqual(readSharedConfiguration(new URL(shared).hash),c);assert.throws(()=>readSharedConfiguration('#config=%%%'));assert.throws(()=>readSharedConfiguration('#config='+btoa(JSON.stringify({...c,exteriorId:null})).replace(/=+$/,'')));assert.ok(quoteLink(c).includes('body='));
 const ledger=sourceLedger(c);assert.equal(ledger.dimensions.find(x=>x.id==='length').numericMatch,true);assert.equal(ledger.dimensions.find(x=>x.id==='height').provided,null);assert.equal(ledger.dimensions.find(x=>x.id==='height').modelled,2.55);assert.equal(ledger.dimensions.find(x=>x.id==='catalogueTerraceDepth').modelled,null);
});
check('R8 layer isolation and opacity are independent, reversible and preserve materials',()=>{
 const h=makeHouse({...DEFAULT_CONFIG,roof:true,porch:true}),l=createLayerController(h),settings=Object.fromEntries(LAYERS.map(([id])=>[id,{visible:true,opacity:1}]));
 for(const [id]of LAYERS){l.apply({...settings,isolate:id});assert.ok(l.entries.filter(e=>e.object.visible).every(e=>e.layer===id));assert.ok(l.entries.some(e=>e.layer===id),id+' classified');}
 l.apply({...settings,exterior:{visible:true,opacity:.35}});for(const e of l.entries){if(e.layer==='exterior'){close(e.object.material.opacity,.35);assert.notEqual(e.object.material,e.material);assert.equal(e.object.material.color.getHex(),e.material.color.getHex());}else assert.equal(e.object.material,e.material);}
 l.dispose();for(const e of l.entries)assert.equal(e.object.material,e.material);h.dispose();
});
check('R8 interior movement cannot cross envelope or partitions at high movement steps',()=>{
 for(const layout of Object.keys(source)){const p=getPlan({...DEFAULT_CONFIG,layout}),segments=navigationSegments(p,true);assert.ok(canWalk(p,segments,0,4.9));let position={x:0,z:4.9};for(const [dx,dz]of [[100,0],[-100,0],[0,-100],[0,100]]){position=moveInside(p,segments,position,dx,dz);assert.ok(canWalk(p,segments,position.x,position.z),layout);assert.ok(Math.abs(position.x)<3.01&&Math.abs(position.z)<5.8);}}
});
check('R9 each model dimension appears once and source conflicts do not assert an unproven variant',()=>{
 const ledger=sourceLedger({...DEFAULT_CONFIG,porch:true});
 assert.equal(ledger.dimensions.filter(m=>m.id==='porchDepthVisual'||m.id==='porchDepth').length,1);
 const porch=ledger.dimensions.find(m=>m.id==='porchDepthVisual'||m.id==='porchDepth');assert.equal(porch.provided,null);assert.equal(porch.modelled,1.95);assert.equal(porch.status,'estimated');
 assert.equal(ledger.dimensions.find(m=>m.id==='catalogueTerraceDepth').provided,3);
 assert.ok(!ledger.dimensions.find(m=>m.id==='catalogueTerraceDepth').note.includes('Variante distinta'));
});
check('R9 technical sheet preserves catalogue units, option prices and source scope',()=>{
 assert.equal(CATALOGUE_OPTIONS.length,22);assert.equal(CATALOGUE_OPTIONS.filter(o=>o.cataloguePrice.value!==null).length,21);
 const bathroom=CATALOGUE_OPTIONS.find(o=>o.id==='bathroom-dry-wet');assert.equal(bathroom.specifications[0].unit,'m');assert.equal(bathroom.cataloguePrice.value,null);
 const system=CATALOGUE_OPTIONS.find(o=>o.id==='front-glass-premium').specifications.find(s=>s.label==='Designação do sistema');assert.equal(system.value,'broken bridge 55');assert.equal(system.unit,null);
 for(const option of CATALOGUE_OPTIONS){assert.equal(option.applicability.gv72Compatibility,'not-confirmed');assert.ok(option.source.page>=3&&option.source.page<=17);}
 for(const layout of Object.keys(source)){const config={...DEFAULT_CONFIG,layout},html=technicalSheetMarkup(config);assert.ok(html.includes(getPlan(config).label));assert.ok(!/undefined|NaN/.test(html));assert.equal((html.match(/data-option=/g)||[]).length,22);assert.equal((html.match(/data-measure=/g)||[]).length,25);assert.equal((html.match(/data-open-reference-video=/g)||[]).length,8);assert.ok(!html.includes('Fonte / m'));}
 const current=sourceLedger(DEFAULT_CONFIG);assert.equal(current.units.areas,'m²');assert.equal(current.catalogueOptions.length,22);assert.equal(current.sourceLayout.id,DEFAULT_CONFIG.layout);assert.equal(current.videos.videos.length,8);assert.equal(TECHNICAL_FACTS.length,45);
});
check('R9 expansion film is native Full HD, source-bound and declares its limited animation scope',()=>{
 const film=JSON.parse(readFileSync('dist/assets/expansion-r9/manifest.json','utf8'));assert.equal(film.status,'PASS');assert.deepEqual(film.dimensions,[1920,1080]);assert.equal(film.frameCount,350);assert.equal(film.durationSeconds,14);assert.equal(film.fps,25);assert.equal(film.displayOverrides.roofOpacity,.09);
 for(const item of film.outputs)assert.equal(createHash('sha256').update(readFileSync('dist/'+item.path)).digest('hex'),item.sha256);
 for(const file of ['model.js','specification.js','stage.js'])assert.equal(createHash('sha256').update(readFileSync(['model.js','specification.js'].includes(file)?'dist/assets/expansion-r9/'+file.replace('.js','-source.js.txt'):'dist/'+file)).digest('hex'),film.sourceHashes[file]);
 assert.ok(film.limits.some(x=>x.includes('2–3')));assert.equal(film.validation.all350MP4FramesDecoded,true);
});
check('R12 panels accompany wings then rise, with no separate preparation phase',()=>{
 assert.deepEqual(PROCESS_STEPS.map(s=>processPose(s.position).step),[0,1,2,3]);
 assert.equal(processPose(0).representation,'deployment');assert.equal(processPose(1).representation,'deployment');
 for(const key of ['roof','floor','wall','front','rear']){assert.equal(processPose(0)[key],0);assert.equal(processPose(1)[key],1);}
 let previous=0;for(let i=0;i<=1000;i++){const pose=processPose(i/1000);assert.ok(pose.step>=previous);previous=pose.step;assert.ok(Number.isFinite(pose.wall)&&pose.wall>=0&&pose.wall<=1);assert.equal('placement' in pose,false);assert.ok(!/prepar|colocar/i.test(pose.motion));if(pose.wall>0)assert.equal(pose.floor,1);if(pose.front>0||pose.rear>0)assert.equal(pose.wall,1);}
 const p=sourceLedger(DEFAULT_CONFIG).expansion.presentation;assert.equal(p.steps.length,4);assert.deepEqual(p.discreteTransitions,[]);assert.equal(p.continuousMotion,'all stages');assert.equal(p.transportEnvelope,'not documented');
});
console.log(`${count} scoped regression checks passed${core?' (media/evidence integration pending)':''}.`);
