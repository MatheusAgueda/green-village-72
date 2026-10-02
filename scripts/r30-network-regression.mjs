import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {renderServiceNetwork} from '../dist/service-network.js';
import {getPlan} from '../dist/specification.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {DATA} from '../dist/data.js';

// Exercise the production renderer; pipe geometry is irrelevant to coincident boxes.
const evidence=[];
for(const {id:layout}of DATA.layouts)for(const bathroom of ['standard','mirrored']){
 const plan=getPlan({...DEFAULT_CONFIG,layout,bathroom,kitchen:layout==='t4-a'?'linear':DEFAULT_CONFIG.kitchen});
 const groups={plumbing:new THREE.Group(),electrical:new THREE.Group()},geometry=new Set(),materials=new Set(),objects=[];
 groups.plumbing.name='plumbing';groups.electrical.name='electrical';
 const mesh=(group,shape,material,name)=>{geometry.add(shape);const object=new THREE.Mesh(shape,material);object.name=name;group.add(object);objects.push(object);return object;};
 const box=(group,w,h,d,x,y,z,material,name)=>{const object=mesh(group,new THREE.BoxGeometry(w,h,d),material,name);object.position.set(x,y,z);return object;};
 const plain=(name,color,roughness,extra)=>{const material=new THREE.MeshStandardMaterial({color,roughness,...extra});material.name=name;materials.add(material);return material;};
 const services=renderServiceNetwork({plan,groups,mesh,box,plain,pipe(){}});
 try{
  const positionKey=point=>point.map(value=>value.toFixed(6)).join(',');
  const expected=new Set(services.network.electrical.map(route=>positionKey(route.junction)));
  const boxes=objects.filter(object=>object.name==='Caixa de derivação');
  const actual=boxes.map(object=>positionKey(object.position.toArray()));
  assert.equal(boxes.length,expected.size,layout+': one physical box per junction');
  assert.equal(new Set(actual).size,actual.length,layout+': no coincident box faces');
  assert.deepEqual(new Set(actual),expected,layout+': all branch junctions retained');
  for(const [kind,name]of [['socket','Tomada'],['switch','Interruptor'],['light','Ponto de iluminação']]){
   assert.equal(objects.filter(object=>object.name===name).length,services.network.electrical.filter(route=>route.kind===kind).length,layout+': all '+kind+' terminals retained');
  }
  services.flow.update(.1,{view:'electrical'});
  assert.ok(services.flow.snapshot().counts.electrical>0,layout+': electrical animation retained');
  evidence.push({layout,bathroom,branches:services.network.electrical.length,junctions:boxes.length});
 }finally{services.flow.dispose();for(const shape of geometry)shape.dispose();for(const material of materials)material.dispose();}
}
console.log(JSON.stringify({pass:true,variants:evidence.length,evidence}));
