import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {makeHouse} from '../dist/model.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {LAYOUTS,getPlan,intersects,doorPose,DOOR_DETAIL} from '../dist/specification.js';
import {planSVG} from '../dist/plan-svg.js';

let cases=0,doorPositions=0;
const close=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-6,message+': '+a+' != '+b);
for(const layout of LAYOUTS)for(const bathroom of ['standard','mirrored']){
 const state={...DEFAULT_CONFIG,layout:layout.id,kitchen:layout.id==='t4-a'?'linear':'l',bathroom},p=getPlan(state),room=p.rooms.find(r=>r.kind==='bathroom').clear;
 const f=p.furnishings.find(f=>f.id==='toilet'),sign=bathroom==='standard'?1:-1,house=makeHouse(state);
 try{
  house.root.updateMatrixWorld(true);
  const toilet=house.groups.furniture.getObjectByName('toilet'),tank=toilet.getObjectByName('Descarga dupla').getWorldPosition(new THREE.Vector3());
  const body=toilet.children.find(o=>o.name.startsWith('Sanita · ')),front=new THREE.Vector3(0,0,1).transformDirection(body.matrixWorld);
  close(front.x,sign,`${layout.id}/${bathroom}: toilet must face the aisle`);close(front.z,0,'Toilet must not face the entrance');
  close(f.x1-f.x0,.66,'Preserve the existing estimated fixture depth');close(f.z1-f.z0,.44,'Preserve the existing estimated fixture width');
  close((f.z0+f.z1)/2,room.z0+1.36,'Preserve the longitudinal centre between vanity and shower');
  const box=new THREE.Box3().setFromObject(toilet),centre=box.getCenter(new THREE.Vector3());
  assert.ok(sign*(centre.x-tank.x)>.1,'The tank is behind the bowl against the mounting side wall');
  assert.ok(box.min.x>=f.x0-.001&&box.max.x<=f.x1+.001&&box.min.z>=f.z0-.001&&box.max.z<=f.z1+.001,'3D mesh and plan footprint agree');
  assert.ok(f.x0>room.x0&&f.x1<room.x1&&f.z0>room.z0&&f.z1<room.z1,'Fixture stays inside the clear bathroom');
  for(const other of p.furnishings.filter(o=>['basin','shower'].includes(o.id)))assert.ok(!intersects(f,other),'Toilet intersects '+other.id);
  const door=p.doors.find(d=>d.id==='bath-door');
  for(let i=0;i<=100;i++){
   const pose=doorPose(door,i/100),points=[pose.start,pose.tip],half=DOOR_DETAIL.thickness/2;
   const bounds={x0:Math.min(...points.map(p=>p.x))-half,x1:Math.max(...points.map(p=>p.x))+half,z0:Math.min(...points.map(p=>p.z))-half,z1:Math.max(...points.map(p=>p.z))+half};
   assert.ok(!intersects(f,bounds),'Toilet intersects bathroom door at '+i+'%');doorPositions++;
  }
  const water=p.servicePoints.find(point=>point.id==='toilet');close(water.z,(f.z0+f.z1)/2,'Illustrative water connection follows the cistern');assert.ok(sign*(centre.x-water.x)>.1);
  const svg=planSVG(state);assert.ok(svg.includes('data-fixture-id="toilet"'),'Plan depicts an identifiable toilet');assert.ok(svg.includes('data-facing="'+(sign>0?'right':'left')+'"'),'Plan symbol faces the same way as the model');
  cases++;
 }finally{house.dispose();}
}
console.log(JSON.stringify({passed:true,cases,doorPositions}));
