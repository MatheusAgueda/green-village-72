import * as THREE from './vendor/three.module.js';

// Animated presentation of the supplied routes, not a hydraulic or electrical simulation.
const EPSILON=1e-7;
const KINDS={
 cold:{colour:'#9defff',radius:.019,length:.16,spacing:.45,velocity:.64},
 hot:{colour:'#ffd3a2',radius:.019,length:.16,spacing:.45,velocity:.64},
 drain:{colour:'#bcf9e1',radius:.030,length:.20,spacing:.52,velocity:.48},
 electrical:{colour:'#fff9cd',radius:.032,length:.28,spacing:.60,velocity:1.35},
};
const modulo=(value,period)=>((value%period)+period)%period;

export function compileFlowPath(points,{reverse=false}={}){
 const clean=[];
 for(const point of points||[]){
  if(!Array.isArray(point)||point.length!==3||!point.every(Number.isFinite))throw new TypeError('Invalid service-flow coordinate');
  const last=clean.at(-1);
  if(!last||Math.hypot(...point.map((v,i)=>v-last[i]))>EPSILON)clean.push([...point]);
 }
 if(reverse)clean.reverse();
 const segments=[];let length=0;
 for(let i=1;i<clean.length;i++){
  const a=clean[i-1],b=clean[i],vector=b.map((v,j)=>v-a[j]),size=Math.hypot(...vector);
  segments.push({a,b,start:length,end:length+size,length:size,tangent:vector.map(v=>v/size)});length+=size;
 }
 return {segments,length,start:clean[0]||[0,0,0],end:clean.at(-1)||[0,0,0]};
}

export function sampleFlowPath(path,distance,out={position:[0,0,0],tangent:[0,1,0]}){
 const d=Math.max(0,Math.min(path.length,Number.isFinite(distance)?distance:0));
 let low=0,high=path.segments.length-1;
 while(low<high){const middle=(low+high)>>1;if(d>=path.segments[middle].end)low=middle+1;else high=middle;}
 const segment=path.segments[low];
 if(!segment){for(let i=0;i<3;i++){out.position[i]=path.start[i];out.tangent[i]=i===1?1:0;}out.segmentIndex=-1;out.segmentDistance=0;out.segmentLength=0;return out;}
 const along=d-segment.start;
 for(let i=0;i<3;i++){out.position[i]=segment.a[i]+segment.tangent[i]*along;out.tangent[i]=segment.tangent[i];}
 out.segmentIndex=low;out.segmentDistance=along;out.segmentLength=segment.length;
 return out;
}

export function compileFlowRoutes(network,exteriorZ){
 const routes={cold:[],hot:[],drain:[],electrical:[]};
 for(const route of network.water||[]){
  if(!routes[route.kind]||route.kind==='electrical')continue;
  const points=route.points.map(p=>[...p]);
  if(points.length&&Number.isFinite(exteriorZ))points.unshift([points[0][0],points[0][1],exteriorZ]);
  const path=compileFlowPath(points,{reverse:route.kind==='drain'});
  if(path.length>EPSILON)routes[route.kind].push({...path,id:route.id,phaseOffset:route.kind==='drain'?path.length:0});
 }
 for(const route of network.electrical||[]){const path=compileFlowPath(route.points);if(path.length>EPSILON)routes.electrical.push({...path,id:route.id,phaseOffset:0});}
 return routes;
}

export function createServiceFlow({network,groups,exteriorZ}){
 const routes=compileFlowRoutes(network,exteriorZ),geometry=new THREE.CapsuleGeometry(1,1,3,8),ownedMaterials=[],meshes={},layers={};
 const parentGroups={plumbing:groups.plumbing,electrical:groups.electrical};
 for(const [kind,parent]of Object.entries(parentGroups)){
  const group=new THREE.Group();group.name=kind+' · animated service flow';group.userData.serviceFlow=true;group.visible=false;parent.add(group);layers[kind]=group;
 }
 for(const [kind,style]of Object.entries(KINDS)){
  const capacity=routes[kind].reduce((n,path)=>n+Math.ceil(path.length/style.spacing)+1,0);
  if(!capacity)continue;
  const material=new THREE.MeshBasicMaterial({color:style.colour,transparent:true,opacity:.97,depthTest:true,depthWrite:false,toneMapped:false});
  material.name=kind+' · flow highlight';material.userData.serviceCircuit=true;ownedMaterials.push(material);
  const mesh=new THREE.InstancedMesh(geometry,material,capacity);mesh.name=kind+' · moving flow';mesh.userData.serviceFlow=true;mesh.frustumCulled=false;mesh.renderOrder=3;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  layers[kind==='electrical'?'electrical':'plumbing'].add(mesh);meshes[kind]=mesh;
 }
 const state={view:null,playing:true,speed:1},phases={cold:0,hot:0,drain:0,electrical:0},counts={cold:0,hot:0,drain:0,electrical:0},samples={},seen=new Set();
 const sample={position:[0,0,0],tangent:[0,1,0]},position=new THREE.Vector3(),direction=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Quaternion(),matrix=new THREE.Matrix4(),up=new THREE.Vector3(0,1,0);
 let elapsed=0,disposed=false;
 function draw(kinds=Object.keys(KINDS)){
  for(const kind of kinds){
   const style=KINDS[kind];
   const mesh=meshes[kind];if(!mesh)continue;seen.clear();let count=0;const preview=[];
   for(const path of routes[kind]){
    // Drain paths are reversed. Length offset aligns packets on their shared outlet trunk.
    const first=modulo(path.phaseOffset+phases[kind],style.spacing);
    for(let d=first;d<path.length-EPSILON;d+=style.spacing){
     sampleFlowPath(path,d,sample);
     const key=sample.position.map(v=>Math.round(v*100000)).join(',');if(seen.has(key))continue;seen.add(key);
     position.set(...sample.position);direction.set(...sample.tangent);rotation.setFromUnitVectors(up,direction);
     const available=Math.min(sample.segmentDistance,sample.segmentLength-sample.segmentDistance);
     // Shorten at bends/endpoints, keeping every luminous capsule within its straight pipe segment.
     const length=Math.max(.008,Math.min(style.length,2*available));scale.set(style.radius,length/3,style.radius);matrix.compose(position,rotation,scale);mesh.setMatrixAt(count++,matrix);
     if(preview.length<4)preview.push(sample.position.map(v=>Number(v.toFixed(5))));
    }
   }
   mesh.count=count;mesh.instanceMatrix.needsUpdate=true;counts[kind]=count;samples[kind]=preview;
  }
 }
 function setState(next={}){
  if(disposed)return;
  if('view'in next)state.view=next.view;
  if(typeof next.playing==='boolean')state.playing=next.playing;
  if(Number.isFinite(next.speed))state.speed=Math.max(.1,Math.min(3,next.speed));
  layers.plumbing.visible=state.view==='plumbing';layers.electrical.visible=state.view==='electrical';
 }
 function update(dt,next={}){
  if(disposed)return false;setState(next);
  const active=state.playing&&['plumbing','electrical'].includes(state.view),delta=Number.isFinite(dt)?Math.max(0,Math.min(.25,dt)):0;
  if(active&&delta>0){const kinds=state.view==='electrical'?['electrical']:['cold','hot','drain'];elapsed+=delta*state.speed;for(const kind of kinds){const style=KINDS[kind];phases[kind]=modulo(phases[kind]+delta*state.speed*style.velocity,style.spacing);}draw(kinds);}
  return active;
 }
 function snapshot(){return {phase:Number(elapsed.toFixed(6)),playing:state.playing,speed:state.speed,view:state.view,disposed,counts:{...counts},samples:Object.fromEntries(Object.entries(samples).map(([kind,points])=>[kind,points.map(p=>[...p])]))};}
 function dispose(){if(disposed)return;disposed=true;for(const layer of Object.values(layers))layer.removeFromParent();geometry.dispose();for(const material of ownedMaterials)material.dispose();for(const mesh of Object.values(meshes))mesh.dispose();}
 draw();
 return {update,setState,snapshot,dispose};
}
