import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createVillageBackdrop,fitVillageBackdrop,disposeBackdrop,BACKDROP_HEIGHT,BACKDROP_RADIUS} from '../dist/village-backdrop.js';
const texture=new THREE.Texture(),backdrop=createVillageBackdrop(texture),checks=[];
function check(name,fn){fn();checks.push(name);console.log('PASS '+name);}
const near=(a,b)=>assert.ok(Math.abs(a-b)<.00005,`${a} != ${b}`);
check('One ground-projected panorama replaces repeated photo sectors',()=>{
 assert.equal(backdrop.isMesh,true);assert.equal(backdrop.children.length,0);
 assert.equal(backdrop.geometry.type,'SphereGeometry');assert.equal(backdrop.material.map,texture);
 assert.equal(backdrop.material.depthWrite,false);assert.equal(backdrop.userData.continuousPanorama,true);
 assert.equal(backdrop.geometry.parameters.phiLength,Math.PI*2);
 assert.ok(backdrop.geometry.attributes.position.count>32000);
});
check('Orbit and zoom preserve the ground plane and configurable product',()=>{
 const scene=new THREE.Scene(),product=new THREE.Group(),camera=new THREE.PerspectiveCamera();
 product.position.set(1,0,-2);scene.add(product,backdrop);
 for(const p of [[0,0,0],[13,5,19],[-18,7,-30],[80,8,-50],[150,20,0]]){
  camera.position.set(...p);fitVillageBackdrop(backdrop,camera);scene.updateMatrixWorld(true);
  assert.ok(BACKDROP_RADIUS*backdrop.scale.x>=Math.hypot(p[0],p[2])+30-.00001);
  near(backdrop.position.y-BACKDROP_HEIGHT*backdrop.scale.y,-.365);
  assert.deepEqual(camera.position.toArray(),p);assert.deepEqual(product.position.toArray(),[1,0,-2]);
 }
});
check('Backdrop disposal releases geometry and material once without disposing shared texture',()=>{
 let g=0,m=0,t=0;backdrop.geometry.addEventListener('dispose',()=>g++);backdrop.material.addEventListener('dispose',()=>m++);texture.addEventListener('dispose',()=>t++);
 disposeBackdrop(backdrop);assert.equal(backdrop.parent,null);assert.deepEqual([g,m,t],[1,1,0]);texture.dispose();assert.equal(t,1);
});
check('Photographic source is native8K with matching licensed HDR and declared location',()=>{
 const bytes=fs.readFileSync('dist/assets/scene-r38/palermo-square-8k.jpg');
 // Parse JPEG SOF without trusting extension or output filename.
 let i=2,width=0,height=0;while(i<bytes.length){if(bytes[i++]!==255)continue;const marker=bytes[i++];if(marker===217||marker===218)break;const n=bytes.readUInt16BE(i);if([192,193,194].includes(marker)){height=bytes.readUInt16BE(i+3);width=bytes.readUInt16BE(i+5);break;}i+=n;}
 assert.deepEqual([width,height],[8192,4096]);assert.ok(fs.statSync('dist/assets/scene-r38/palermo-square-2k.hdr').size>6000000);
 const licence=fs.readFileSync('dist/assets/scene-r38/LICENSE.md','utf8');assert.match(licence,/CC0/);assert.match(licence,/Palermo, not Porto/);
});
check('Foreground fades into panorama and technical views remain independent',()=>{
 const village=fs.readFileSync('dist/village.js','utf8'),stage=fs.readFileSync('dist/stage.js','utf8');
 assert.match(village,/1\.-smoothstep\(14\.,24\.,length\(gvPlazaPosition\)\)/);
 assert.match(stage,/currentView==='exterior'&&!detail/);assert.match(stage,/node.material.depthWrite=false/);
 assert.match(stage,/kind==='village'\|\|kind==='square'/);assert.doesNotMatch(stage,/VILLAGE_FACES\.map/);
});
console.log(JSON.stringify({passed:checks.length,total:5,checks}));
