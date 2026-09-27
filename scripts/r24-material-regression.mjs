import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import * as THREE from '../dist/vendor/three.module.js';
import {createMaterialLibrary,physicalUV,SOURCE_PHOTO_SCALES} from '../dist/material-library.js';
import {sourceFloorSampling} from '../dist/source-floor-phase.js';
import {PHOTO_PLANKS} from '../dist/photo-plank-data.js';

const results=[];
const test=async(name,run)=>{await run();results.push({name,pass:true});};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const loads=[];
const originalLoad=THREE.ImageLoader.prototype.load,originalDocument=globalThis.document;
// Exercise the actual loader/cache and shader installation without a browser.
// Image bytes are verified separately; texture loads complete asynchronously.
globalThis.document={};
THREE.ImageLoader.prototype.load=function(url,onLoad){
 loads.push(url);const image={width:url.includes('wallFinish')?65:440,height:url.includes('wallFinish')?93:233};
 queueMicrotask(()=>onLoad(image));return image;
};
const library=createMaterialLibrary();
const allocated=[];
const create=(...args)=>{const value=library.create(...args);allocated.push(value);return value;};
const createPhoto=(...args)=>{const value=library.createPhoto(...args);allocated.push(value);return value;};
const shaderFor=material=>{
 const shader={uniforms:{},vertexShader:'#include <common>\nvoid main(){\n#include <begin_vertex>\ngl_Position=vec4(transformed,1.);\n}',fragmentShader:'#include <common>\nvoid main(){\nvec4 diffuseColor=vec4(1.);\n#include <map_fragment>\nvec3 outgoingLight=diffuseColor.rgb;\n#include <opaque_fragment>\n}'};
 material.onBeforeCompile(shader);return shader;
};
try{
 await test('all twelve SPC samples retain original photographic bytes and source map URL',async()=>{
  for(const entry of PHOTO_PLANKS){
   const retained=readFileSync(new URL('../dist/assets/catalogue-v2/'+entry.originalAsset,import.meta.url));
   assert.equal(createHash('sha256').update(retained).digest('hex'),entry.source.retainedOriginalSha256);
   const crop=readFileSync(new URL('../dist/assets/catalogue-v2/textures/'+entry.id+'.png',import.meta.url));
   assert.deepEqual([crop.readUInt32BE(16),crop.readUInt32BE(20)],entry.dimensionsPx);
   const material=create(entry.id,'#808080','interior_floor',{mode:'source'});
   assert.equal(material.color.getHexString(),'ffffff');
   assert.equal(material.map.colorSpace,THREE.SRGBColorSpace);
   assert.equal(loads.at(-1),'assets/catalogue-v2/textures/'+entry.id+'.png');
   assert.ok(!material.normalMap&&!material.bumpMap&&!material.roughnessMap);
  }
  await library.ready();assert.deepEqual(library.stats().failures,[]);
 });
 await test('one intact aspect-preserving crop strip covers each whole board without wrapping',()=>{
  for(const entry of PHOTO_PLANKS){
   const {board,pixels,inset,span}=sourceFloorSampling(entry);
   near(span[0]*pixels[0]/board[0],span[1]*pixels[1]/board[1]);
   assert.ok(span[1]>=.95&&span[1]<1);
   // All source starts and all local board positions stay within the crop.
   for(const axis of [0,1])for(const phase of [0,.3,.6,1])for(const position of [0,.25,.5,.75,1]){
    const uv=inset[axis]+phase*(1-2*inset[axis]-span[axis])+position*span[axis];
    assert.ok(uv>=inset[axis]-1e-12&&uv<=1-inset[axis]+1e-12);
   }
   // The old 0.243 m longitudinal repetition now spans less than 20% of a crop.
   assert.ok(entry.sourceFootprintM[1]/board[1]*span[1]<.2);
  }
 });
 await test('floor shaders compile as GLSL ES 3, preserving lit and source-colour modes',()=>{
  const folder=mkdtempSync(join(tmpdir(),'gv72-r24-material-shader-'));
  for(const unlit of [false,true]){
   const material=create('floor-spc-kx7006','#808080','interior_floor',{mode:'source',unlit});
   const shader=shaderFor(material),sampling=sourceFloorSampling(PHOTO_PLANKS[1]);
   assert.deepEqual(shader.uniforms.gvFloorSpan.value.toArray(),sampling.span);
   assert.match(material.customProgramCacheKey(),/gv-source-floor-phase-v2/);
   assert.match(shader.fragmentShader,/textureGrad\(map,sourceUv/);
   assert.match(shader.fragmentShader,/dFdx\(metres\)/);
   assert.doesNotMatch(shader.fragmentShader,/gvFloorRepeat|gvPhotoMean|gvJoint|mix\(|reflect\(/);
   const sources={
    vert:'#version 300 es\nprecision highp float;\n#define varying out\nin vec3 position;\nin vec2 uv;\n'+shader.vertexShader.replace('#include <common>','').replace('#include <begin_vertex>','vec3 transformed=position;'),
    frag:'#version 300 es\nprecision highp float;\n#define varying in\n#define USE_MAP\nuniform sampler2D map;\nout vec4 outputColour;\n'+shader.fragmentShader.replace('#include <common>','').replace('#include <opaque_fragment>','outputColour=vec4(outgoingLight,diffuseColor.a);'),
   };
   for(const [stage,source]of Object.entries(sources)){
    const path=join(folder,(unlit?'unlit':'lit')+'.'+stage);writeFileSync(path,source);
    const result=spawnSync('glslangValidator',['-S',stage,path],{encoding:'utf8'});
    assert.equal(result.status,0,result.error?.message||result.stdout+result.stderr);
   }
  }
 });
 await test('shared metre UVs remain continuous across adjacent floor meshes',()=>{
  const a=physicalUV(new THREE.BoxGeometry(1,.1,1),[.5,0,.5]);
  const b=physicalUV(new THREE.BoxGeometry(1,.1,1),[1.5,0,.5]);
  const edge=g=>{const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,out=[];for(let i=0;i<p.count;i++)if(n.getY(i)>.9&&Math.abs(uv.getX(i)-1)<1e-7)out.push(uv.getY(i));return out.sort();};
  assert.deepEqual(edge(a),edge(b));assert.equal(edge(a).length,2);a.dispose();b.dispose();
 });
 await test('bathroom 17 uses its original small wall crop at an explicit estimated scale',async()=>{
  const scale=SOURCE_PHOTO_SCALES['bathroom-17/wall'];
  const material=createPhoto({id:'bathroom-17/wall',url:scale.asset,repeat:[1.2,1.8]},'wall');
  near(material.map.repeat.x,1/.325);near(material.map.repeat.y,1/.465);
  near(scale.repeatM[0]/scale.repeatM[1],scale.sourceDimensionsPx[0]/scale.sourceDimensionsPx[1]);
  assert.equal(material.map.wrapS,THREE.RepeatWrapping);assert.equal(material.map.wrapT,THREE.RepeatWrapping);
  assert.equal(material.userData.sourcePhysicalRepeat.status,'visualisation-estimate-not-manufacturer-data');
  assert.equal(loads.at(-1),scale.asset);assert.equal(material.color.getHexString(),'ffffff');
  await library.ready();
 });
 await test('other photographic finishes retain their explicit repeat values',async()=>{
  const material=createPhoto({id:'bathroom-12/wall',url:'assets/interior-r5/bathroom-12-wallFinish.png',repeat:[1.2,1.8]},'wall');
  near(material.map.repeat.x,1/1.2);near(material.map.repeat.y,1/1.8);
  assert.equal(material.userData.sourcePhysicalRepeat,undefined);await library.ready();
 });
 await test('vinyl without a source cannot acquire the optional SPC texture',()=>{
  const before=loads.length,material=create(null,'#b8b6b1','interior_floor',{mode:'source'});
  assert.equal(material.map,null);assert.equal(material.userData.sourceFloorPhase,undefined);
  assert.equal(material.color.getHexString(),'b8b6b1');assert.equal(loads.length,before);
  assert.equal(material.name,'Pavimento vinílico · referência por confirmar');
 });
 await test('reuse and release keep material texture leases balanced',()=>{
  assert.equal(library.stats().leases,allocated.filter(m=>m.map).length);
  while(allocated.length)library.release(allocated.pop());
  assert.equal(library.stats().leases,0);assert.equal(library.stats().pending,0);
 });
 console.log(JSON.stringify({passed:results.length,scope:'CPU sampling bounds, real Three.js shader hook and GLSL compilation; actual GPU room render is verified separately',results},null,2));
}finally{
 while(allocated.length)library.release(allocated.pop());library.dispose();
 THREE.ImageLoader.prototype.load=originalLoad;
 if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;
}
