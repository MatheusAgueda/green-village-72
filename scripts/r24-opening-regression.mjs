import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createOpeningMotion,openingMechanism} from '../dist/opening-motion.js';

const results=[];
const test=(name,run)=>{run();results.push({name,pass:true});};
const near=(a,b,epsilon=1e-9)=>assert.ok(Math.abs(a-b)<epsilon,`${a} != ${b}`);
const fixtures=[];
function fixture(){
 const root=new THREE.Group(),geometries=[];
 const materials={aluminium:new THREE.MeshStandardMaterial(),metal:new THREE.MeshStandardMaterial(),doorSteel:new THREE.MeshStandardMaterial(),glass:new THREE.MeshStandardMaterial({transparent:true,opacity:.34}),screen:new THREE.MeshStandardMaterial()};
 const box=(g,w,h,d,x,y,z,material,name)=>{assert.ok(w>0&&h>0&&d>0);const geometry=new THREE.BoxGeometry(w,h,d),mesh=new THREE.Mesh(geometry,material);geometries.push(geometry);mesh.position.set(x,y,z);mesh.name=name;g.add(mesh);return mesh;};
 const motion=createOpeningMotion({box,materials,panelDepth:.075});
 const add=(patch={},face={axis:'x',c:2,sign:1},g=root)=>motion.build({g,...face,h:{id:'test-'+motion.records.length,u:0,width:.93,height:1.05,sill:.95,kind:'window',...patch}});
 const f={root,motion,materials,box,add,geometries};fixtures.push(f);return f;
}
const snapshot=record=>{record.group.updateMatrixWorld(true);return record.meshes.map(mesh=>mesh.matrixWorld.toArray());};
const compare=(a,b)=>{assert.equal(a.length,b.length);for(let i=0;i<a.length;i++)for(let j=0;j<16;j++)near(a[i][j],b[i][j]);};
const centroid=leaf=>leaf.content.getWorldPosition(new THREE.Vector3());
const outward=(before,after,axis,sign)=>(axis==='x'?after.z-before.z:after.x-before.x)*sign;
try{
 test('mechanism families use inspected source photographs and qualify standard assumptions',()=>{
  const ids=['window-930','window-alloy','window-thermal','window-projecting','window-panoramic','window-tilt-turn','window-large','steel-door','side-glass-door','thermal-glass-door'];
  for(const optionId of ids){const p=openingMechanism({optionId,kind:optionId.includes('door')?'door':'window'});assert.ok(existsSync(new URL('../dist/'+p.sourceAsset,import.meta.url)),p.sourceAsset);assert.notEqual(p.status,'illustrative-mechanism');}
  assert.equal(openingMechanism({kind:'window'}).status,'illustrative-mechanism');
  assert.equal(openingMechanism({kind:'door'}).leaves,2);
  assert.equal(openingMechanism({kind:'window',optionId:'window-930'}).type,'sliding');
 });
 test('all four facade orientations swing single and double doors outward from interior hinge lines',()=>{
  for(const axis of ['x','z'])for(const sign of [-1,1])for(const optionId of [undefined,'steel-door','side-glass-door','thermal-glass-door']){
   const {add,motion}=fixture(),record=add({kind:'door',optionId,width:optionId==='side-glass-door'?.92:1.7,height:2.15,sill:0},{axis,c:sign*3,sign});
   const before=record.leaves.map(centroid),frame=record.meshes.filter(m=>m.name.endsWith(' · aro')).map(m=>m.matrixWorld.toArray());
   motion.setOpening(record.id,1);
   for(let i=0;i<record.leaves.length;i++)assert.ok(outward(before[i],centroid(record.leaves[i]),axis,sign)>.2);
   compare(frame,record.meshes.filter(m=>m.name.endsWith(' · aro')).map(m=>m.matrixWorld.toArray()));
   const normal=axis==='x'?record.group.position.z:record.group.position.x;
   near(normal,sign*3-sign*.035);
  }
 });
 test('sliders move one complete leaf into its own track without changing fixed leaf or depth',()=>{
  for(const axis of ['x','z'])for(const sign of [-1,1]){
   const {add,motion}=fixture(),record=add({optionId:'window-930'},{axis,c:sign*3,sign});
   const [a,b]=record.leaves,beforeA=centroid(a),beforeB=centroid(b);
   motion.setOpening(record.id,1);const afterA=centroid(a),afterB=centroid(b);
   assert.ok(afterA.distanceTo(beforeA)>.3);near(afterB.distanceTo(beforeB),0);
   near(outward(beforeA,afterA,axis,sign),0);
   near(axis==='x'?afterA.x:afterA.z,axis==='x'?afterB.x:afterB.z);
   assert.ok(Math.abs((axis==='x'?afterA.z:afterA.x)-(axis==='x'?afterB.z:afterB.x))>.02);
  }
 });
 test('projecting and panoramic central sashes open outward while panoramic fixed panels stay put',()=>{
  for(const axis of ['x','z'])for(const sign of [-1,1])for(const optionId of ['window-projecting','window-panoramic']){
   const {add,motion}=fixture(),record=add({optionId},{axis,c:sign*3,sign}),before=record.leaves.map(centroid);
   motion.setOpening(record.id,1);
   record.leaves.forEach((leaf,i)=>leaf.moving?assert.ok(outward(before[i],centroid(leaf),axis,sign)>.08):near(centroid(leaf).distanceTo(before[i]),0));
  }
 });
 test('tilt-turn supports separate inward tilt and turn with rigid glazing and attached handles',()=>{
  for(const axis of ['x','z'])for(const sign of [-1,1]){
   const {add,motion}=fixture(),record=add({optionId:'window-tilt-turn'},{axis,c:sign*3,sign}),closed=snapshot(record);
   for(const mode of ['turn','tilt']){
    const childLocal=record.leaves.flatMap(leaf=>leaf.content.children.map(m=>m.position.toArray())),before=record.leaves.map(centroid);
    assert.equal(motion.setOpening(record.id,1,{mode}),true);
    record.leaves.forEach((leaf,i)=>assert.ok(outward(before[i],centroid(leaf),axis,sign)<-.05));
    assert.deepEqual(record.leaves.flatMap(leaf=>leaf.content.children.map(m=>m.position.toArray())),childLocal);
    motion.setOpening(record.id,0,{mode});compare(snapshot(record),closed);
   }
   assert.equal(motion.setOpening(record.id,1,{mode:'unknown'}),false);
  }
 });
 test('every profile returns to precise closed transforms after repeated poses and parent movement',()=>{
  for(const optionId of [undefined,'window-930','window-alloy','window-thermal','window-large','window-projecting','window-panoramic','window-tilt-turn','steel-door','side-glass-door','thermal-glass-door']){
   const {root,add,motion}=fixture();root.position.set(2,3,-4);root.rotation.set(.2,-.3,.1);
   const record=add({optionId,kind:optionId?.includes('door')?'door':'window',height:optionId?.includes('door')?2.15:1.05}),closed=snapshot(record);
   for(let i=0;i<101;i++)motion.setOpening(record.id,i/100);
   motion.setOpening(record.id,0);compare(snapshot(record),closed);
  }
 });
 test('duplicate hole IDs stay synchronized across normal and isolated detail presentations',()=>{
  const {root,add,motion}=fixture(),detail=new THREE.Group();root.add(detail);detail.position.x=5;
  const a=add({id:'bath-window'}),b=add({id:'bath-window'},undefined,detail),closed=[snapshot(a),snapshot(b)];
  motion.setOpening('bath-window',1);assert.equal(a.value,1);assert.equal(b.value,1);
  motion.setEnabled(false);assert.equal(a.value,0);assert.equal(b.value,0);compare(snapshot(a),closed[0]);compare(snapshot(b),closed[1]);
  assert.equal(motion.update(.05),false);assert.equal(motion.isAnimating(),false);
  motion.setEnabled(true);assert.equal(a.value,1);assert.equal(b.value,1);
  motion.setOpen(0);compare(snapshot(a),closed[0]);compare(snapshot(b),closed[1]);
 });
 test('ray picking honours hidden ancestors, clipping and solid foreground occlusion',()=>{
  const {root,add,motion,box,materials}=fixture(),record=add({id:'pick-window'});
  const ray=new THREE.Raycaster(new THREE.Vector3(-.22,1.45,4),new THREE.Vector3(0,0,-1));
  assert.equal(motion.toggleFromRay(ray,root)?.id,'pick-window');assert.equal(motion.isAnimating(),true);
  for(let i=0;i<30;i++)motion.update(1/60);assert.equal(record.value,1);assert.equal(motion.isAnimating(),false);motion.setOpen(0);
  record.group.visible=false;assert.equal(motion.toggleFromRay(ray,root),null);record.group.visible=true;
  for(const material of Object.values(materials))material.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,0,1),-2.5)];
  assert.equal(motion.toggleFromRay(ray,root),null);for(const material of Object.values(materials))material.clippingPlanes=[];
  const wall=box(root,2,2,.05,0,1.5,3,materials.aluminium,'Opaque wall');root.updateMatrixWorld(true);
  assert.equal(motion.toggleFromRay(ray,root),null);wall.visible=false;
  assert.equal(motion.toggleFromRay(ray,root)?.id,'pick-window');motion.setEnabled(false);
  assert.equal(motion.toggleFromRay(ray,root),null);
 });
 test('same-ID hidden details cannot intercept a visible house opening',()=>{
  const {root,add,motion}=fixture(),hidden=new THREE.Group();root.add(hidden);hidden.visible=false;hidden.position.z=1;
  const normal=add({id:'bath-window'});add({id:'bath-window'},undefined,hidden);
  const ray=new THREE.Raycaster(new THREE.Vector3(-.22,1.45,4),new THREE.Vector3(0,0,-1));
  assert.equal(motion.toggleFromRay(ray,root)?.id,'bath-window');assert.equal(normal.target,1);
 });
 console.log(JSON.stringify({passed:results.length,instances:fixtures.length,results},null,2));
}finally{for(const fixture of fixtures){for(const geometry of fixture.geometries)geometry.dispose();for(const material of Object.values(fixture.materials))material.dispose();}}
