import assert from 'node:assert/strict';
import {makeHouse} from '../dist/model.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {LAYOUTS} from '../dist/specification.js';
let checks=0;
for(const layout of LAYOUTS)for(const bathroom of ['standard','mirrored']){
 const house=makeHouse({...DEFAULT_CONFIG,layout:layout.id,bathroom,kitchen:layout.id==='t4-a'?'linear':'l',view:'interior'});
 try{
  const original=new Map(Object.values(house.groups).map(g=>[g,g.visible]));
  for(const kind of ['bathroom','kitchen','bathroom']){
   house.setDetail(kind);
   for(const key of ['structure','supports','floorLayers','roof','cover','porch'])assert.equal(house.groups[key].visible,false,`${layout.id}/${kind}: ${key} leaked into detail`);
   assert.ok(house.detailBounds(kind).max.y>=2.4,'Complete walls must fit in detail camera');
   house.details.setOpen(true,kind);house.setDetail(kind);
   assert.equal(house.root.userData.detail,kind);house.details.setOpen(false,kind);checks++;
  }
  house.setDetail(null);for(const [group,visible]of original)assert.equal(group.visible,visible,group.name+' was not restored');
  house.setView('plumbing');assert.equal(house.groups.plumbing.visible,true);house.setView('exterior');assert.equal(house.groups.structure.visible,true);checks++;
 }finally{house.dispose();}
}
console.log(JSON.stringify({ok:true,checks}));
