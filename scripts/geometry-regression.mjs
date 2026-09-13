import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// Run from the site checkout, or set GV_PROJECT_ROOT. No browser, Git or network is required.
// Set GV_AUDIT_REPORT to write the optional JSON evidence report.
const root=path.resolve(process.env.GV_PROJECT_ROOT||process.cwd());
const load=name=>import(pathToFileURL(path.join(root,'dist',name)).href);
const [{makeHouse},{DIM,LAYOUTS,compatibility,getPlan},{DEFAULT_CONFIG,kitchenFitNote},{INTERIOR_REFERENCES},THREE,{navigationSegments,canWalk}]=await Promise.all([
 load('model.js'),load('specification.js'),load('configuration.js'),load('interior-references.js'),load('vendor/three.module.js'),load('walkthrough.js')
]);
const files=['dist/model.js','dist/interior-detail.js','dist/specification.js','dist/configuration.js','dist/app.js','dist/deployment-rig.js','dist/expansion-process.js','dist/walkthrough.js'];
const hash=file=>createHash('sha256').update(readFileSync(path.join(root,file))).digest('hex');
const startHashes=Object.fromEntries(files.map(file=>[file,hash(file)]));
const close=(a,b,label,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<tolerance,`${label}: ${a} != ${b}`);
const rows=[];
let windowRays=0,detailChecks=0,finalTransformChecks=0,mirrorMeshChecks=0;

// Fixed outer dimensions and illustrative hinge anchors protect against accidental drift.
close(DIM.width,6.22,'Exterior width');close(DIM.length,11.8,'Exterior length');
function assembledAnchors(h){
 for(const a of h.sideAssemblies){close(a.pivot.position.x,a.dir*2.984,'Side hinge X');close(a.pivot.position.y,.14,'Side hinge Y');}
 for(const a of h.floorAssemblies)for(const pivot of a.pivots){close(pivot.position.x,a.dir*1.1,'Floor hinge X');close(pivot.position.y,0,'Floor hinge Y');}
 for(const a of h.roofAssemblies)for(const pivot of a.pivots){close(pivot.position.x,a.dir*1.1,'Roof hinge X');close(pivot.position.y,2.55,'Roof hinge Y');}
 for(const a of h.endAssemblies){close(a.pivot.position.x,a.dir*1.1,'End hinge X');close(a.pivot.position.z,a.front*5.9,'End hinge Z');}
}
function checkHouse(config){
 const h=makeHouse({...config,view:'interior'});
 try{
  const skin=h.groups.interior.getObjectByName('Paredes do ambiente');assert.ok(skin,'Bathroom cladding group');
  h.setDetail('bathroom');assert.equal(skin.visible,true);
  for(const panel of skin.children){
   const lateral=panel.name==='Revestimento UV da casa de banho';
   const nearSide=panel.position.x*(config.bathroom==='mirrored'?-1:1)>0;
   assert.equal(panel.visible,!(lateral&&nearSide),`${config.layout}: rear cladding must survive side cutaway`);detailChecks++;
  }
  if(config.kitchen!=='none'){h.setDetail('kitchen');assert.equal(skin.visible,false,'Bathroom cladding hidden in kitchen detail');detailChecks++;}
  h.setDetail(null);assert.equal(skin.visible,true);assert.ok(skin.children.every(panel=>panel.visible),'Cladding restored after detail exit');detailChecks++;
  h.setView('exterior');h.root.updateMatrixWorld(true);assembledAnchors(h);

  // Trace into every source opening, only as far as the adjacent upper cupboard depth.
  const kitchen=h.groups.furniture.children.filter(group=>group.name.includes('kitchen'));
  for(const face of h.plan.perimeter)for(const hole of face.holes)for(const offset of [-.34,-.17,.17,.34])for(const y of [1.6,1.8,1.95]){
   if(Math.abs(offset)>hole.width/2-.06||y<hole.sill+.06||y>hole.sill+hole.height-.06)continue;
   const sign=Math.sign(face.c),u=hole.u+offset;
   const origin=face.axis==='z'?new THREE.Vector3(face.c+sign*.5,y,u):new THREE.Vector3(u,y,face.c+sign*.5);
   const direction=face.axis==='z'?new THREE.Vector3(-sign,0,0):new THREE.Vector3(0,0,-sign);
   const hits=new THREE.Raycaster(origin,direction,0,.98).intersectObjects(kitchen,true);
   assert.equal(hits.length,0,`${config.layout}/${config.kitchen}/${config.kitchenRef}/${hole.id}: upper cupboard covers source opening (${offset}, ${y})`);windowRays++;
  }
  if(config.kitchen!=='none'&&h.details.kitchen.upper&&h.plan.kitchenUpperModules.some(module=>module.blockedBy.length))assert.match(kitchenFitNote(config),/janelas livres/,'Window adaptation disclosed');
  if(config.layout==='t4-a'&&config.kitchen==='linear'){
   const run=h.plan.furnishings.find(item=>item.id==='kitchen-main');
   close(run.z0,-2.786,'Compact kitchen start');close(run.z1,-1.186,'Compact kitchen end');
   assert.match(kitchenFitNote(config),/1,60 m/,'Compact adaptation disclosed');
  }

  // Compare every actual mesh to its own assembled pose; no historical Git source is needed.
  const meshes=[];h.root.traverse(object=>{if(object.isMesh)meshes.push({object,matrix:object.matrixWorld.clone()});});
  for(const progress of [0,.18,.36,.69,.9,1])h.updateProcess(progress);
  h.root.updateMatrixWorld(true);assembledAnchors(h);
  for(const {object,matrix}of meshes){
   for(let i=0;i<16;i++)close(object.matrixWorld.elements[i],matrix.elements[i],`${config.layout}/${object.name}: final transform`,1e-8);
   finalTransformChecks++;
  }
  rows.push({layout:config.layout,kitchen:config.kitchen,bathroom:config.bathroom,kitchenRef:config.kitchenRef,upperModules:h.plan.kitchenUpperModules.filter(module=>!module.blockedBy.length).length});
 }finally{h.dispose();}
}

const configs=[];
for(const layout of LAYOUTS)for(const kitchen of ['none','linear','l','u','island'])for(const bathroom of ['standard','mirrored']){
 const config={...DEFAULT_CONFIG,layout:layout.id,kitchen,bathroom};if(!compatibility(config).length)configs.push(config);
}
assert.equal(configs.length,56,'Supported configuration coverage');
for(const config of configs)checkHouse(config);
const extraKitchens=Object.values(INTERIOR_REFERENCES).filter(ref=>ref.id.startsWith('kitchen')&&ref.upper&&ref.id!==DEFAULT_CONFIG.kitchenRef);
for(const ref of extraKitchens)checkHouse({...DEFAULT_CONFIG,kitchenRef:ref.id});

const bathReferences=Object.values(INTERIOR_REFERENCES).filter(ref=>ref.id.startsWith('bathroom'));
assert.equal(bathReferences.length,17,'Bathroom reference coverage');
for(const ref of bathReferences){
 const standard=makeHouse({...DEFAULT_CONFIG,bathroomRef:ref.id,bathroom:'standard'});
 const mirrored=makeHouse({...DEFAULT_CONFIG,bathroomRef:ref.id,bathroom:'mirrored'});
 try{
  for(const open of [false,true,false]){
   standard.details.setOpen(open,'bathroom');mirrored.details.setOpen(open,'bathroom');
   standard.root.updateMatrixWorld(true);mirrored.root.updateMatrixWorld(true);
   const left=[],right=[];
   standard.groups.furniture.getObjectByName('shower').traverse(object=>{if(object.isMesh)left.push(object);});
   mirrored.groups.furniture.getObjectByName('shower').traverse(object=>{if(object.isMesh)right.push(object);});
   assert.equal(left.length,right.length,'Mirroring retains every shower mesh');
   for(let k=0;k<left.length;k++){
    const a=left[k],b=right[k],pa=a.geometry.attributes.position,pb=b.geometry.attributes.position;
    assert.equal(a.name,b.name);assert.equal(pa.count,pb.count);
    for(const i of [0,Math.floor(pa.count/2),pa.count-1]){
     const av=new THREE.Vector3().fromBufferAttribute(pa,i).applyMatrix4(a.matrixWorld);
     const bv=new THREE.Vector3().fromBufferAttribute(pb,i).applyMatrix4(b.matrixWorld);
     close(av.x,-bv.x,`${ref.id}/${a.name}: mirror X`);close(av.y,bv.y,`${ref.id}/${a.name}: mirror Y`);close(av.z,bv.z,`${ref.id}/${a.name}: mirror Z`);
    }
    mirrorMeshChecks++;
   }
  }
 }finally{standard.dispose();mirrored.dispose();}
}

// A broad enough navigation grid detects the former near-zero-tolerance doorway bottleneck.
const navigation=[];
const step=.08,nx=73,nz=145,xAt=i=>(i-36)*step,zAt=j=>(j-72)*step;
for(const config of configs){
 const plan=getPlan(config),segments=navigationSegments(plan,true),free=new Uint8Array(nx*nz),seen=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)free[j*nx+i]=canWalk(plan,segments,xAt(i),zAt(j));
 let start=null;
 for(let z=4.9;z>-4&&!start;z-=.2)for(let x=0;x<1&&!start;x+=.2)if(canWalk(plan,segments,x,z))start={x,z};
 assert.ok(start,`${config.layout}: navigation start`);
 let key=Math.round(start.z/step+72)*nx+Math.round(start.x/step+36);
 if(!free[key])key=free.findIndex((value,k)=>value&&Math.hypot(xAt(k%nx)-start.x,zAt(Math.floor(k/nx))-start.z)<.16);
 assert.ok(key>=0,`${config.layout}: sampled start`);
 const queue=[key];seen[key]=1;
 for(let head=0;head<queue.length;head++){
  const k=queue[head],i=k%nx,j=Math.floor(k/nx);
  for(const [di,dj]of [[1,0],[-1,0],[0,1],[0,-1]]){
   const ii=i+di,jj=j+dj,kk=jj*nx+ii;
   if(ii>=0&&ii<nx&&jj>=0&&jj<nz&&free[kk]&&!seen[kk]){seen[kk]=1;queue.push(kk);}
  }
 }
 const rooms=plan.rooms.map(room=>{
  let reachable=0;
  for(const k of queue){const x=xAt(k%nx),z=zAt(Math.floor(k/nx));if(x>room.clear.x0&&x<room.clear.x1&&z>room.clear.z0&&z<room.clear.z1)reachable++;}
  assert.ok(reachable,`${config.layout}/${config.kitchen}/${config.bathroom}: ${room.id} unreachable or pinched`);
  return{id:room.id,reachable};
 });
 navigation.push({layout:config.layout,kitchen:config.kitchen,bathroom:config.bathroom,rooms});
}

// The browser owns interaction verification; this guard must precede opening movable furniture.
const app=readFileSync(path.join(root,'dist/app.js'),'utf8');
const handlerStart=app.indexOf("if(b.hasAttribute('data-fittings')||b.id==='detail-fittings')");
assert.ok(handlerStart>=0,'Global fittings handler');
const handler=app.slice(handlerStart,app.indexOf('\n',handlerStart));
const stop=handler.indexOf('if(walker?.active)stopWalk();'),open=handler.indexOf('house?.details.setOpen');
assert.ok(stop>=0&&open>stop,'Stop walking before opening furniture');

const hashes=Object.fromEntries(files.map(file=>[file,hash(file)]));
assert.deepEqual(hashes,startHashes,'Source changed while verification was running');
const report={status:'PASS',checkedAt:new Date().toISOString(),method:'CPU Three.js bounds/raycasts, sampled navigation, mirrored mesh coordinates and source guard ordering',hashes,supportedConfigurations:configs.length,additionalKitchenReferences:extraKitchens.length,bathroomReferences:bathReferences.length,bathroomPosesPerReference:3,windowRays,detailChecks,finalTransformChecks,mirrorMeshChecks,navigationAllRoomsReachable:true,navigationGridM:step,assembledAnchorsAndFinalTransforms:true,fittingsWalkGuard:'Source order verified; browser interaction requires separate smoke test',rows,navigation};
if(process.env.GV_AUDIT_REPORT){const output=path.resolve(process.env.GV_AUDIT_REPORT);mkdirSync(path.dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({status:report.status,supportedConfigurations:configs.length,bathroomReferences:bathReferences.length,windowRays,detailChecks,finalTransformChecks,mirrorMeshChecks,navigationAllRoomsReachable:true,reportWritten:Boolean(process.env.GV_AUDIT_REPORT)}));
