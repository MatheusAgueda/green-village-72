import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import * as THREE from '../dist/vendor/three.module.js';
import {createVillageBackdrop,fitVillageBackdrop,disposeBackdrop,VILLAGE_FACES} from '../dist/village-backdrop.js';

const textures=Array.from({length:4},()=>new THREE.Texture());
const backdrop=createVillageBackdrop(textures),results=[];
const near=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);
async function check(name,task){
 try{results.push({name,pass:true,evidence:await task()});}
 catch(error){results.push({name,pass:false,error:error.stack});}
}
await check('eight adjoining sectors form a full circle with a fixed ground plane',()=>{
 assert.equal(backdrop.children.length,8);
 assert.equal(new Set(VILLAGE_FACES).size,4);
 let totalAngle=0;
 for(let index=0;index<8;index++){
  const mesh=backdrop.children[index],next=backdrop.children[(index+1)%8];
  const p=mesh.geometry.parameters;
  assert.equal(p.openEnded,true);near(p.radiusTop,32);near(p.radiusBottom,32);
  totalAngle+=p.thetaLength;
  const positions=mesh.geometry.attributes.position,nextPositions=next.geometry.attributes.position;
  const end=new THREE.Vector3().fromBufferAttribute(positions,p.radialSegments);
  const start=new THREE.Vector3().fromBufferAttribute(nextPositions,0);
  assert.ok(end.distanceTo(start)<1e-5,'Adjacent sectors must meet without a geometry gap');
  mesh.geometry.computeBoundingBox();
  near(mesh.geometry.boundingBox.min.y+mesh.position.y,-.365);
  const uv=mesh.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)assert.ok(uv.getY(i)>=.425-1e-6&&uv.getY(i)<=1+1e-6);
  assert.equal(mesh.material.map,textures[index%textures.length]);
 }
 near(totalAngle,Math.PI*2);
 return{sectors:8,radius:32,footPlane:-.365,sourceFaces:4};
});
await check('neighbour blends wrap correctly and compile without softening the whole image',()=>{
 const folder=mkdtempSync(join(tmpdir(),'gv72-r37-backdrop-'));
 try{
  for(let index=0;index<8;index++){
   const {material}=backdrop.children[index];
   assert.equal(material.side,THREE.BackSide);
   assert.equal(material.depthWrite,true,'Far scenic surfaces write depth before the nearer product');
   assert.equal(material.transparent,false);
   const shader={uniforms:{},fragmentShader:'#include <map_pars_fragment>\nvoid main(){vec4 diffuseColor=vec4(1.);\n#include <map_fragment>\noutputColour=diffuseColor;}'};
   material.onBeforeCompile(shader);
   assert.equal(shader.uniforms.gvPrevious.value,textures[(index+3)%4]);
   assert.equal(shader.uniforms.gvNext.value,textures[(index+1)%4]);
   assert.match(shader.fragmentShader,/vMapUv\.x < \.045/);
   assert.match(shader.fragmentShader,/vMapUv\.x > \.955/);
   assert.match(shader.fragmentShader,/\.5 \+ \.5 \* smoothstep/);
   const fragment='#version 300 es\nprecision highp float;\n#define texture2D texture\nuniform sampler2D map;\nin vec2 vMapUv;\nout vec4 outputColour;\n'+shader.fragmentShader.replace('#include <map_pars_fragment>','');
   const path=join(folder,`sector-${index}.frag`);writeFileSync(path,fragment);
   const compiled=spawnSync('glslangValidator',['-S','frag',path],{encoding:'utf8'});
   assert.equal(compiled.status,0,compiled.error?.message||compiled.stdout+compiled.stderr);
   // At either exact edge, both sectors blend the same two samples by one half.
   const a=[.13,.54,.82],b=[.97,.23,.41];
   assert.deepEqual(a.map((value,c)=>(value+b[c])*.5),b.map((value,c)=>(value+a[c])*.5));
  }
 }finally{rmSync(folder,{recursive:true,force:true});}
 return{compiledShaders:8,edgeBlendWidth:.045,depthWrite:true};
});
await check('camera fitting keeps the scenery outside the camera and preserves the product',()=>{
 const scene=new THREE.Scene(),product=new THREE.Group(),camera=new THREE.PerspectiveCamera();
 product.name='Configured home';product.position.set(2,0,-1);scene.add(product,backdrop);
 const positions=[[0,0,0],[15,4,20],[80,8,-50],[150,20,0]];
 for(const position of positions){
  camera.position.set(...position);const cameraBefore=camera.position.clone();
  fitVillageBackdrop(backdrop,camera);scene.updateMatrixWorld(true);
  const distance=Math.hypot(position[0],position[2]),radius=32*backdrop.scale.x;
  assert.ok(radius>=distance+8-1e-6);assert.ok(radius>=32);
  near(backdrop.scale.x,backdrop.scale.y);near(backdrop.scale.x,backdrop.scale.z);
  near(new THREE.Box3().setFromObject(backdrop).min.y,-.365,2e-5);
  assert.ok(camera.position.equals(cameraBefore));
  assert.equal(backdrop.userData.presentationOnly,true);
  backdrop.traverse(node=>{assert.equal(node.userData.presentationOnly,true);assert.notEqual(node.parent,product);});
  assert.equal(product.userData.presentationOnly,undefined);
  assert.deepEqual(product.position.toArray(),[2,0,-1]);
 }
 camera.position.set(0,0,0);fitVillageBackdrop(backdrop,camera);
 assert.deepEqual(backdrop.scale.toArray(),[1,1,1]);near(backdrop.position.y,0);
 // The backdrop is a sibling of the product, not part of its transform hierarchy.
 assert.equal(product.parent,scene);assert.equal(backdrop.parent,scene);
 return{cameraPositions:positions.length,minimumRadius:32,cameraClearance:8,footPlane:-.365};
});
await check('disposal releases each mesh once and leaves shared texture ownership to the stage',()=>{
 const geometries=new Map(),materials=new Map(),textureDisposals=new Map(textures.map(texture=>[texture,0]));
 backdrop.traverse(node=>{
  if(node.geometry){geometries.set(node.geometry,0);node.geometry.addEventListener('dispose',()=>geometries.set(node.geometry,geometries.get(node.geometry)+1));}
  if(node.material){materials.set(node.material,0);node.material.addEventListener('dispose',()=>materials.set(node.material,materials.get(node.material)+1));}
 });
 for(const texture of textures)texture.addEventListener('dispose',()=>textureDisposals.set(texture,textureDisposals.get(texture)+1));
 disposeBackdrop(backdrop);disposeBackdrop(null);
 assert.equal(backdrop.parent,null);assert.equal(geometries.size,8);assert.equal(materials.size,8);
 assert.ok([...geometries.values()].every(count=>count===1));
 assert.ok([...materials.values()].every(count=>count===1));
 assert.ok([...textureDisposals.values()].every(count=>count===0),'Repeated faces must not dispose the shared photos');
 for(const texture of textures)texture.dispose();
 assert.ok([...textureDisposals.values()].every(count=>count===1));
 return{geometries:8,materials:8,sharedTextures:4,duplicateTextureDisposals:0};
});
console.log(JSON.stringify({passed:results.filter(result=>result.pass).length,total:results.length,results},null,2));
process.exitCode=results.every(result=>result.pass)?0:1;
