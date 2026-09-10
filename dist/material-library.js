import * as THREE from './vendor/three.module.js';
import {MATERIALS} from './material-data.js';
export const materialById=id=>MATERIALS.find(m=>m.id===id);
export const materialAsset=p=>'assets/catalogue-v2/'+p;
export function createMaterialLibrary(onLoad=()=>{},limit=18){
 const cache=new Map();let pending=0,failures=[];
 const load=(entry)=>{
  const key=entry.id;if(cache.has(key)){const value=cache.get(key);value.used=performance.now();return value.texture;}
  if(typeof document==='undefined')return null;
  pending++;const loader=new THREE.TextureLoader();const record={texture:null,used:performance.now(),references:0,disposed:false};
  const texture=loader.load(materialAsset(entry.textureAsset),()=>{pending--;if(record.disposed)texture.dispose();onLoad({pending,failures:[...failures]});},undefined,()=>{pending--;failures.push(entry.id);onLoad({pending,failures:[...failures]});});
  texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=entry.render.repeatWrapping==='mirrored-repeat'?THREE.MirroredRepeatWrapping:THREE.RepeatWrapping;texture.anisotropy=8;
  const repeat=entry.render.estimatedPhysicalRepeat;texture.repeat.set(1/repeat.widthM,1/repeat.heightM);texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;
  record.texture=texture;cache.set(key,record);return texture;
 };
 const trim=()=>{const unused=[...cache.entries()].filter(([,v])=>v.references===0).sort((a,b)=>a[1].used-b[1].used);while(cache.size>limit&&unused.length){const [key,r]=unused.shift();r.disposed=true;r.texture.dispose();cache.delete(key);}};
 function create(id,fallback,surface){
  const entry=materialById(id);const material=new THREE.MeshStandardMaterial({color:entry?.previewHexApprox||fallback,roughness:entry?.render.roughnessApprox??.65,metalness:entry?.render.metalnessApprox??0});
  material.name=id||surface;material.userData={surface,materialId:id,sourceStatus:entry?'catalogue-photo':'visualisation-palette'};
  if(entry&&entry.render.mode==='original-crop-texture'){const tx=load(entry);material.map=tx;material.color.set('#ffffff');if(tx){cache.get(entry.id).references++;material.userData.lease=entry.id;}}
  return material;
 }
 function release(material){const key=material.userData.lease;if(key&&cache.has(key))cache.get(key).references=Math.max(0,cache.get(key).references-1);material.dispose();trim();}
 function stats(){return {pending,failures:[...failures],cachedTextures:cache.size,leases:[...cache.values()].reduce((a,x)=>a+x.references,0)};}
 async function ready(){const deadline=Date.now()+20000;while(pending&&Date.now()<deadline)await new Promise(r=>setTimeout(r,20));if(pending)throw new Error('Tempo de carregamento dos materiais excedido.');}
 return {create,release,stats,ready,dispose(){for(const r of cache.values()){r.disposed=true;r.texture.dispose();}cache.clear();}};
}
// UV coordinates are measured in metres, so adjacent fragments share one texture grid.
export function physicalUV(geometry,offset=[0,0,0]){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+offset[0],y=p.getY(i)+offset[1],z=p.getZ(i)+offset[2],nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
  if(ny>=nx&&ny>=nz)uv.setXY(i,x,z);else if(nx>=nz)uv.setXY(i,z,y);else uv.setXY(i,x,y);
 }uv.needsUpdate=true;return geometry;
}
