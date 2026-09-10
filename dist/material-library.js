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
export const referenceCropAsset=id=>photoTreatmentById(id)?'assets/catalogue-r3/crops/'+id+'.png':materialAsset(materialById(id).referenceCropAsset);
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
 function load(entry){
  const key=entry.id;if(cache.has(key)){const value=cache.get(key);value.used=performance.now();return value.texture;}
  if(typeof document==='undefined')return null;
  const photo=photoTreatmentById(key),grain=Boolean(photo?.boardDimensionsM),texture=new THREE.Texture();
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=photo?THREE.RepeatWrapping:entry.render.repeatWrapping==='mirrored-repeat'?THREE.MirroredRepeatWrapping:THREE.RepeatWrapping;
  texture.anisotropy=8;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;
  const repeat=entry.render.estimatedPhysicalRepeat;
  texture.repeat.set(grain?1:photo?1/photo.sourceFootprintM[0]:1/repeat.widthM,grain?1:photo?1/photo.sourceFootprintM[1]:1/repeat.heightM);
  const record={id:key,texture,url:photo?'assets/catalogue-r3/'+photo.derivedAsset:materialAsset(entry.textureAsset),fallback:entry.previewHexApprox,used:performance.now(),references:0,disposed:false,loading:false};
  cache.set(key,record);fetchTexture(record);return texture;
 }
 const trim=()=>{const unused=[...cache.entries()].filter(([,v])=>v.references===0).sort((a,b)=>a[1].used-b[1].used);while(cache.size>limit&&unused.length){const [key,r]=unused.shift();r.disposed=true;r.texture.dispose();cache.delete(key);failures.delete(key);}};
 function create(id,fallback,surface){
  const entry=materialById(id),material=new THREE.MeshStandardMaterial({color:entry?.previewHexApprox||fallback,roughness:entry?.render.roughnessApprox??.65,metalness:entry?.render.metalnessApprox??0});
  material.name=id||surface;material.userData={surface,materialId:id,sourceStatus:entry?'catalogue-photo':'visualisation-palette'};
  if(entry&&entry.render.mode==='original-crop-texture'){
   const tx=load(entry);
   if(tx){material.map=tx;material.color.set('#ffffff');cache.get(entry.id).references++;material.userData.lease=entry.id;const photo=photoTreatmentById(id);if(photo?.boardDimensionsM)installPhotoPlanks(material,tx,photo);if(photo?.profileRecommended)installPanelProfile(material,photo.panelProfile);}
  }
  return material;
 }
 function release(material){const key=material.userData.lease;if(key&&cache.has(key))cache.get(key).references=Math.max(0,cache.get(key).references-1);material.dispose();trim();}
 function stats(){return {pending,failures:[...failures].filter(id=>cache.get(id)?.references>0),cachedTextures:cache.size,leases:[...cache.values()].reduce((a,x)=>a+x.references,0)};}
 async function ready(){const deadline=Date.now()+20000;while(pending&&Date.now()<deadline)await new Promise(r=>setTimeout(r,20));if(pending)throw new Error('Tempo de carregamento dos materiais excedido.');return stats();}
 function retry(){for(const id of failures){const record=cache.get(id);if(record)fetchTexture(record);}return ready();}
 return {create,release,stats,ready,retry,dispose(){disposed=true;for(const r of cache.values()){r.disposed=true;r.texture.dispose();}cache.clear();failures.clear();}};
}
// UV coordinates are measured in metres, so adjacent fragments share one texture grid.
export function physicalUV(geometry,offset=[0,0,0]){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+offset[0],y=p.getY(i)+offset[1],z=p.getZ(i)+offset[2],nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
  if(ny>=nx&&ny>=nz)uv.setXY(i,x,z);else if(nx>=nz)uv.setXY(i,z,y);else uv.setXY(i,x,y);
 }uv.needsUpdate=true;return geometry;
}
