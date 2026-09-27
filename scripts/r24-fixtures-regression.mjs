import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {makeHouse} from '../dist/model.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {INTERIOR_REFERENCES} from '../dist/interior-references.js';

// Exercise the rendered meshes, not the source string or assumed dimensions.
let configurations=0,closedTransforms=0,materialNormals=0;
const refs=Object.values(INTERIOR_REFERENCES);
const standard=makeHouse({...DEFAULT_CONFIG,view:'interior'});
try{
 standard.root.updateMatrixWorld(true);
 const basin=standard.groups.furniture.getObjectByName('basin').getObjectByName('Cuba côncava');
 assert.ok(basin.geometry.index,'Continuous basin must share vertices to interpolate ceramic normals');
 const positions=basin.geometry.attributes.position,normals=basin.geometry.attributes.normal;
 assert.ok(basin.geometry.index.count>positions.count*3,'Basin triangles share multiple rings of vertices');
 for(let i=0;i<normals.count;i++){
  const n=new THREE.Vector3().fromBufferAttribute(normals,i);assert.ok(Math.abs(n.length()-1)<1e-5,'Unit surface normal');materialNormals++;
 }
 const down=new THREE.Vector3(0,-1,0).transformDirection(basin.matrixWorld);
 const from=new THREE.Vector3(0,.95,.005).applyMatrix4(basin.matrixWorld);
 const hit=new THREE.Raycaster(from,down).intersectObject(basin,false)[0];
 assert.ok(hit,'The basin has an interior bottom');
 assert.ok(hit.point.y<.72&&hit.point.y>.69,'The basin remains genuinely hollow below the counter');
 const toilet=standard.groups.furniture.getObjectByName('toilet');
 const body=toilet.children.find(o=>o.name.startsWith('Sanita · '));
 const lidHit=new THREE.Raycaster(new THREE.Vector3(0,1,.07).applyMatrix4(body.matrixWorld),new THREE.Vector3(0,-1,0)).intersectObject(toilet,true)[0];
 assert.ok(lidHit&&lidHit.point.y>.46&&lidHit.point.y<.48,'The standard toilet lid is closed as shown in its source photograph');
 assert.equal(standard.details.kitchen.sinkVisible,false,'Do not invent the standard kitchen sink under the packaging');
 assert.equal(standard.details.kitchen.tapVisible,false,'Do not invent the hidden standard tap');
 assert.equal(standard.groups.furniture.getObjectByName('Toalha dobrada'),undefined,'No undocumented decorative rectangle on the vanity');
 assert.equal(standard.details.B.mirror.metalness,1);
 assert.ok(standard.details.B.mirror.roughness<.03,'Mirror uses a polished reflective surface');
}finally{standard.dispose();}

for(const bathroom of ['standard','mirrored'])for(const ref of refs){
 const state={...DEFAULT_CONFIG,view:'interior',bathroom,...(ref.id.startsWith('kitchen')?{kitchenRef:ref.id}:{bathroomRef:ref.id})};
 const h=makeHouse(state);
 try{
  h.root.updateMatrixWorld(true);
  const original=new Map();
  h.groups.furniture.traverse(m=>{if(m.isMesh)original.set(m,m.matrixWorld.clone());});
  const closed=h.details.capture();h.details.setOpen(true);assert.ok(h.details.status().opened>0);
  const saved=h.details.capture();h.details.setOpen(false);h.details.restore(saved);assert.ok(h.details.status().allOpen);
  h.details.restore(closed);assert.equal(h.details.status().opened,0);h.root.updateMatrixWorld(true);
  for(const [m,matrix]of original){assert.deepEqual(m.matrixWorld.elements,matrix.elements,'Every fixture returns exactly to its original closed pose');closedTransforms++;}
  const toilet=h.groups.furniture.getObjectByName('toilet'),footprint=h.plan.furnishings.find(f=>f.id==='toilet'),bounds=new THREE.Box3().setFromObject(toilet);
  assert.ok(bounds.min.x>=footprint.x0-.001&&bounds.max.x<=footprint.x1+.001,'Ceramic and seat stay inside the existing toilet width');
  assert.ok(bounds.min.z>=footprint.z0-.001&&bounds.max.z<=footprint.z1+.001,'Ceramic and seat stay inside the existing toilet depth');
  for(const {g}of h.details.motions)assert.ok(g.userData.interaction,'Fixture hit targets retain their interaction');
  configurations++;
 }finally{h.dispose();}
}
console.log(JSON.stringify({ok:true,configurations,closedTransforms,materialNormals,verified:['concave basin','standard closed lid','smooth normals','existing footprint','standard equipment','motion restore']}));
