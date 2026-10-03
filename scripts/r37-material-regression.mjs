import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {MATERIALS} from '../dist/material-data.js';
import {PHOTO_PLANKS} from '../dist/photo-plank-data.js';
import {DEFAULT_CONFIG,validateConfiguration} from '../dist/configuration.js';
import {createMaterialLibrary,referenceCropAsset,photoTreatmentById} from '../dist/material-library.js';

// Exercise the real texture cache without a browser or network request.
const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
const previousLoader=THREE.ImageLoader.prototype.load;
const loads=[],allocated=[],library=createMaterialLibrary();
globalThis.document={};
THREE.ImageLoader.prototype.load=function(url,onLoad){
 loads.push(url);
 const image={width:270,height:210};
 queueMicrotask(()=>onLoad(image));
 return image;
};
const create=(...args)=>{const material=library.create(...args);allocated.push(material);return material;};
const entries=MATERIALS.filter(entry=>entry.id.startsWith('exterior-')&&entry.render.mode==='sampled-colour');
let passed=0;
async function check(name,run){await run();passed++;console.log('PASS '+name);}
try{
 await check('every sampled exterior finish avoids tiling photographic lighting in both texture modes',()=>{
  assert.ok(entries.length>0);
  for(const entry of entries)for(const mode of ['source','prepared']){
   const material=create(entry.id,'#ff00ff','exterior_wall',{mode});
   assert.equal(material.map,null);
   assert.equal(material.color.getHexString(),entry.previewHexApprox.slice(1).toLowerCase());
   assert.equal(material.roughness,entry.render.roughnessApprox);
   assert.equal(material.metalness,entry.render.metalnessApprox);
   assert.equal(material.userData.materialId,entry.id);
   assert.equal(material.userData.textureMode,mode);
   assert.equal(material.userData.lease,undefined);
   assert.equal(material.userData.surfaceRepresentation.mode,'uniform-sampled-colour');
   assert.equal(material.userData.surfaceRepresentation.colour,entry.previewHexApprox);
   assert.equal(material.userData.surfaceRepresentation.referenceAsset,referenceCropAsset(entry.id));
   assert.equal(material.userData.surfaceRepresentation.originalAsset,'assets/catalogue-v2/'+entry.originalAsset);
   assert.match(material.userData.surfaceRepresentation.status,/not-measured-product-colour/);
  }
  assert.equal(loads.length,0);
  assert.equal(library.stats().cachedTextures,0);
  assert.equal(library.stats().leases,0);
 });
 await check('the original sampled-finish photograph remains intact in source comparison',async()=>{
  for(const entry of entries){
   const material=create(entry.id,'#ff00ff','comparison',{mode:'source',unlit:true});
   assert.equal(loads.at(-1),referenceCropAsset(entry.id));
   assert.ok(material.map?.isTexture);
   assert.equal(material.map.colorSpace,THREE.SRGBColorSpace);
   assert.equal(material.color.getHexString(),'ffffff');
   assert.equal(material.map.repeat.x,1/entry.render.estimatedPhysicalRepeat.widthM);
   assert.equal(material.map.repeat.y,1/entry.render.estimatedPhysicalRepeat.heightM);
   assert.equal(material.userData.surfaceRepresentation,undefined);
   assert.equal(material.toneMapped,false);
  }
  await library.ready();
  assert.deepEqual(library.stats().failures,[]);
 });
 await check('catalogue-lighting mode retains its unlit sampled colour on the building',()=>{
  const entry=entries.find(value=>value.id===DEFAULT_CONFIG.exteriorId);
  assert.ok(entry);
  const material=create(entry.id,'#000000','exterior_wall',{mode:'source',unlit:true});
  const shader={fragmentShader:'#include <opaque_fragment>'};
  material.onBeforeCompile(shader);
  assert.equal(material.map,null);
  assert.equal(material.color.getHexString(),entry.previewHexApprox.slice(1));
  assert.equal(material.toneMapped,false);
  assert.match(shader.fragmentShader,/outgoingLight = diffuseColor\.rgb/);
 });
 await check('textured exterior finishes retain their source photographs and prepared treatments',async()=>{
  for(const entry of MATERIALS.filter(value=>value.id.startsWith('exterior-')&&value.render.mode==='original-crop-texture')){
   for(const mode of ['source','prepared']){
    const material=create(entry.id,'#ff00ff','exterior_wall',{mode});
    const treatment=photoTreatmentById(entry.id);
    const expected=mode==='source'?referenceCropAsset(entry.id):treatment?'assets/catalogue-r3/'+treatment.derivedAsset:'assets/catalogue-v2/'+entry.textureAsset;
    assert.equal(loads.at(-1),expected);
    assert.ok(material.map?.isTexture);
    assert.equal(material.color.getHexString(),'ffffff');
    assert.equal(material.userData.textureMode,mode);
    assert.equal(material.userData.surfaceRepresentation,undefined);
   }
  }
  await library.ready();
  assert.deepEqual(library.stats().failures,[]);
 });
 await check('SPC photo sources and their existing board sampling remain unchanged',async()=>{
  for(const entry of PHOTO_PLANKS){
   const material=create(entry.id,'#ff00ff','interior_floor',{mode:'source'});
   assert.equal(loads.at(-1),referenceCropAsset(entry.id));
   assert.ok(material.map?.isTexture);
   assert.ok(material.userData.sourceFloorPhase);
   assert.equal(material.userData.surfaceRepresentation,undefined);
  }
  await library.ready();
 });
 await check('a render does not mutate the commercial configuration or material catalogue',()=>{
  const configuration=validateConfiguration({...DEFAULT_CONFIG});
  const before=JSON.stringify(configuration),catalogueBefore=JSON.stringify(MATERIALS);
  create(configuration.exteriorId,configuration.exterior,'exterior_wall',{mode:configuration.textureMode});
  assert.equal(JSON.stringify(configuration),before);
  assert.equal(JSON.stringify(MATERIALS),catalogueBefore);
  assert.equal(configuration.exteriorId,DEFAULT_CONFIG.exteriorId);
  assert.equal(configuration.textureMode,'source');
 });
}finally{
 for(const material of allocated)library.release(material);
 assert.equal(library.stats().leases,0);
 library.dispose();
 THREE.ImageLoader.prototype.load=previousLoader;
 if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else delete globalThis.document;
}
console.log(`${passed} material regression groups passed; ${entries.length} uniform finishes verified.`);
