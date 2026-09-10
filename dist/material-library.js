import * as THREE from './vendor/three.module.js';
import {MATERIALS} from './material-data.js';
import {PHOTO_PLANKS} from './photo-plank-data.js';
import {PHOTO_WALLS} from './photo-wall-data.js';
import {installPhotoPlanks,installPanelProfile} from './photo-planks.js';
const planks=new Map(PHOTO_PLANKS.map(entry=>[entry.id,entry])),walls=new Map(PHOTO_WALLS.map(entry=>[entry.id,entry]));
export const materialById=id=>MATERIALS.find(m=>m.id===id);
export const materialAsset=p=>'assets/catalogue-v2/'+p;
export const photoPlankById=id=>planks.get(id);
export const photoTreatmentById=id=>planks.get(id)||walls.get(id);
export const referenceCropAsset=id=>materialAsset(materialById(id).referenceCropAsset);
export function createMaterialLibrary(onLoad=()=>{},limit=18){
 const cache=new Map(),failures=new Set();let pending=0,disposed=false;
 function fetchTexture(record){
  if(record.loading||record.disposed)return;
  record.loading=true;pending++;
  const finish=()=>{pending--;record.loading=false;if(!disposed)onLoad(stats());};
  new THREE.ImageLoader().load(record.url,image=>{
   if(!record.disposed){const previous=record.texture.image;if(previous&&(previous.width!==image.width||previous.height!==image.height))record.texture.dispose();record.texture.image=image;record.texture.needsUpdate=true;failures.delete(record.id);}
   finish();
  },undefined,()=>{
   if(!record.disposed){failures.add(record.id);const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');ctx.fillStyle=record.fallback;ctx.fillRect(0,0,1,1);record.texture.image=canvas;record.texture.needsUpdate=true;}
   finish();
  });
 }
 function load(entry,mode='source'){
  const key=entry.id+':'+mode;if(cache.has(key)){const value=cache.get(key);value.used=performance.now();return value.texture;}
  if(typeof document==='undefined')return null;
  const photo=photoTreatmentById(entry.id),grain=mode==='prepared'&&Boolean(photo?.boardDimensionsM),texture=new THREE.Texture();
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=mode==='source'?THREE.RepeatWrapping:photo?THREE.RepeatWrapping:entry.render.repeatWrapping==='mirrored-repeat'?THREE.MirroredRepeatWrapping:THREE.RepeatWrapping;
  texture.anisotropy=8;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;
  const repeat=entry.render.estimatedPhysicalRepeat;
  texture.repeat.set(mode==='source'?1/repeat.widthM:grain?1:photo?1/photo.sourceFootprintM[0]:1/repeat.widthM,mode==='source'?1/repeat.heightM:grain?1:photo?1/photo.sourceFootprintM[1]:1/repeat.heightM);
  const record={id:key,texture,url:mode==='source'?referenceCropAsset(entry.id):photo?'assets/catalogue-r3/'+photo.derivedAsset:materialAsset(entry.textureAsset),fallback:entry.previewHexApprox,used:performance.now(),references:0,disposed:false,loading:false};
  cache.set(key,record);fetchTexture(record);return texture;
 }
 const trim=()=>{const unused=[...cache.entries()].filter(([,v])=>v.references===0).sort((a,b)=>a[1].used-b[1].used);while(cache.size>limit&&unused.length){const [key,r]=unused.shift();r.disposed=true;r.texture.dispose();cache.delete(key);failures.delete(key);}};
 function create(id,fallback,surface,{mode='source',unlit=false}={}){
  const entry=materialById(id),material=new THREE.MeshStandardMaterial({color:entry?.previewHexApprox||fallback,roughness:entry?.render.roughnessApprox??.65,metalness:entry?.render.metalnessApprox??0});
  material.name=id||surface;material.toneMapped=!unlit;if(unlit){material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight = diffuseColor.rgb;\n#include <opaque_fragment>');};material.customProgramCacheKey=()=> 'gv-source-unlit';}material.userData={surface,materialId:id,sourceStatus:entry?'catalogue-photo':'visualisation-palette',textureMode:mode,unlit};
  if(entry&&(mode==='source'||entry.render.mode==='original-crop-texture')){
   const tx=load(entry,mode);
   if(tx){material.map=tx;material.color.set('#ffffff');cache.get(entry.id+':'+mode).references++;material.userData.lease=entry.id+':'+mode;const photo=photoTreatmentById(id);if(mode==='prepared'&&photo?.boardDimensionsM)installPhotoPlanks(material,tx,photo);if(mode==='prepared'&&photo?.profileRecommended)installPanelProfile(material,photo.panelProfile);}
  }
  return material;
 }
 function createPhoto(descriptor,surface,{unlit=false}={}){
  const {id,url,colour='#ddddda',repeat=[.6,.6],roughness=.48,metalness=0}=descriptor;
  const material=new THREE.MeshStandardMaterial({color:colour,roughness,metalness});material.name=id;material.userData={surface,sourceStatus:'reference-photo',referenceAsset:url};
  if(typeof document!=='undefined'){
   if(!cache.has(id)){const texture=new THREE.Texture();texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.MirroredRepeatWrapping;texture.repeat.set(1/repeat[0],1/repeat[1]);texture.anisotropy=8;const record={id,texture,url,fallback:colour,used:performance.now(),references:0,disposed:false,loading:false};cache.set(id,record);fetchTexture(record);}
   const record=cache.get(id);record.references++;record.used=performance.now();material.map=record.texture;material.color.set('#ffffff');material.userData.lease=id;
  }
  if(unlit){material.toneMapped=false;material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight = diffuseColor.rgb;\n#include <opaque_fragment>');};material.customProgramCacheKey=()=> 'gv-photo-unlit';}
  return material;
 }
 function release(material){const key=material.userData.lease;if(key&&cache.has(key))cache.get(key).references=Math.max(0,cache.get(key).references-1);material.dispose();trim();}
 const activePending=()=>[...cache.values()].filter(r=>r.references>0&&r.loading&&!r.disposed).length;
 function stats(){return {pending:activePending(),backgroundPending:pending-activePending(),failures:[...failures].filter(id=>cache.get(id)?.references>0),cachedTextures:cache.size,leases:[...cache.values()].reduce((a,x)=>a+x.references,0)};}
 async function ready(lease=null){const waiting=()=>[...cache.values()].some(r=>r.references>0&&r.loading&&!r.disposed&&(!lease||r.id===lease));const deadline=Date.now()+20000;while(waiting()&&Date.now()<deadline)await new Promise(r=>setTimeout(r,20));if(waiting())throw new Error('Tempo de carregamento dos materiais excedido.');const result=stats();return lease?{...result,failures:result.failures.filter(id=>id===lease)}:result;}
 function retry(){for(const id of failures){const record=cache.get(id);if(record?.references>0)fetchTexture(record);}return ready();}
 return {create,createPhoto,release,stats,ready,retry,dispose(){disposed=true;for(const r of cache.values()){r.disposed=true;r.texture.dispose();}cache.clear();failures.clear();}};
}
// UV coordinates are measured in metres, so adjacent fragments share one texture grid.
export function physicalUV(geometry,offset=[0,0,0]){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+offset[0],y=p.getY(i)+offset[1],z=p.getZ(i)+offset[2],nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
  if(ny>=nx&&ny>=nz)uv.setXY(i,x,z);else if(nx>=nz)uv.setXY(i,z,y);else uv.setXY(i,x,y);
 }uv.needsUpdate=true;return geometry;
}
