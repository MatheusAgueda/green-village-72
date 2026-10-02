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

function compileFlowLines(paths){
 const byLine=new Map(),up=new THREE.Vector3(0,1,0);
 const prepared=paths.map(path=>({path,segments:path.segments.map(segment=>{
  const sign=segment.tangent.find(value=>Math.abs(value)>EPSILON)<0?-1:1,direction=segment.tangent.map(value=>value*sign);
  const offset=segment.a.reduce((sum,value,index)=>sum+value*direction[index],0),origin=segment.a.map((value,index)=>value-offset*direction[index]);
  const key=[...direction,...origin].map(value=>Math.round(value/EPSILON)).join(',');
  let line=byLine.get(key);
  if(!line){line={direction,origin,rotation:new THREE.Quaternion().setFromUnitVectors(up,new THREE.Vector3(...direction)),spans:[],pool:[]};byLine.set(key,line);}
  return {line,offset,sign};
 })}));
 return {paths:prepared,lines:[...byLine.values()]};
}

export function createServiceFlow({network,groups,exteriorZ}){
 const routes=compileFlowRoutes(network,exteriorZ),geometry=new THREE.CapsuleGeometry(1,1,3,8),ownedMaterials=[],meshes={},layers={},flowLines={};
 const parentGroups={plumbing:groups.plumbing,electrical:groups.electrical};
 for(const [kind,parent]of Object.entries(parentGroups)){
  const group=new THREE.Group();group.name=kind+' · animated service flow';group.userData.serviceFlow=true;group.visible=false;parent.add(group);layers[kind]=group;
 }
 for(const [kind,style]of Object.entries(KINDS)){
  // A packet can straddle either endpoint; each bend adds at most one fragment
  // because packet length is below spacing. Merging shared lines only lowers this bound.
  const capacity=routes[kind].reduce((n,path)=>n+Math.ceil((path.length+style.length)/style.spacing)+path.segments.length,0);
  if(!capacity)continue;
  flowLines[kind]=compileFlowLines(routes[kind]);
  const material=new THREE.MeshBasicMaterial({color:style.colour,transparent:true,opacity:.97,depthTest:true,depthWrite:false,toneMapped:false});
  material.name=kind+' · flow highlight';material.userData.serviceCircuit=true;ownedMaterials.push(material);
  const mesh=new THREE.InstancedMesh(geometry,material,capacity);mesh.name=kind+' · moving flow';mesh.userData.serviceFlow=true;mesh.frustumCulled=false;mesh.renderOrder=3;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  layers[kind==='electrical'?'electrical':'plumbing'].add(mesh);meshes[kind]=mesh;
 }
 const state={view:null,playing:true,speed:1},phases={cold:0,hot:0,drain:0,electrical:0},counts={cold:0,hot:0,drain:0,electrical:0},samples={},seen=new Set();
 const sample={position:[0,0,0],tangent:[0,1,0]},position=new THREE.Vector3(),scale=new THREE.Vector3(),matrix=new THREE.Matrix4();
 let elapsed=0,disposed=false;
 function draw(kinds=Object.keys(KINDS)){
  for(const kind of kinds){
   const style=KINDS[kind];
   const mesh=meshes[kind];if(!mesh)continue;seen.clear();let count=0;const preview=[];
   const layout=flowLines[kind],halfLength=style.length/2;
   for(const line of layout.lines)line.spans.length=0;
   for(const {path,segments}of layout.paths){
    // Drain paths are reversed. Length offset aligns packets on their shared outlet trunk.
    const first=modulo(path.phaseOffset+phases[kind],style.spacing);
    for(let d=first-style.spacing;d<path.length+halfLength-EPSILON;d+=style.spacing){
     const start=Math.max(0,d-halfLength),end=Math.min(path.length,d+halfLength);if(end-start<=EPSILON)continue;
     // Keep snapshot samples at packet centres, independent of the rendered fragments.
     if(d>=0&&d<path.length-EPSILON&&preview.length<4){
      sampleFlowPath(path,d,sample);const key=sample.position.map(v=>Math.round(v*100000)).join(',');
      if(!seen.has(key)){seen.add(key);preview.push(sample.position.map(v=>Number(v.toFixed(5))));}
     }
     sampleFlowPath(path,start,sample);
     // Intersect the complete packet interval with every adjoining segment. A bend
     // redistributes its length instead of shrinking it; only route ends clip it.
     for(let index=sample.segmentIndex;index<path.segments.length;index++){
      const segment=path.segments[index];if(segment.start>=end-EPSILON)break;
      const from=Math.max(start,segment.start),to=Math.min(end,segment.end);if(to-from<=EPSILON)continue;
      const {line,offset,sign}=segments[index],a=offset+sign*(from-segment.start),b=offset+sign*(to-segment.start);
      const slot=line.spans.length,span=line.pool[slot]||(line.pool[slot]={start:0,end:0});span.start=Math.min(a,b);span.end=Math.max(a,b);line.spans.push(span);
     }
    }
   }
   for(const line of layout.lines){
    if(!line.spans.length)continue;
    line.spans.sort((a,b)=>a.start-b.start||a.end-b.end);
    let start=line.spans[0].start,end=line.spans[0].end;
    for(let i=1;i<=line.spans.length;i++){
     const next=line.spans[i];
     if(next&&next.start<=end+EPSILON){end=Math.max(end,next.end);continue;}
     const centre=(start+end)/2;
     position.set(...line.origin);for(let axis=0;axis<3;axis++)position.setComponent(axis,position.getComponent(axis)+line.direction[axis]*centre);
     scale.set(style.radius,(end-start)/3,style.radius);matrix.compose(position,line.rotation,scale);mesh.setMatrixAt(count++,matrix);
     if(next){start=next.start;end=next.end;}
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
