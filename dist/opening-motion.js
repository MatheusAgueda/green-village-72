import * as THREE from './vendor/three.module.js';

const clamp=value=>Math.max(0,Math.min(1,Number.isFinite(Number(value))?Number(value):0));
const PHOTO_ROOT='assets/catalogue/products/';

/** Mechanism families follow the supplied photographs/descriptions. Angles,
 * profile sections, handing and travel are presentation estimates only. */
export function openingMechanism(h){
 const option=h.optionId;
 if(h.kind==='door')return {type:'swing',leaves:['steel-door','side-glass-door'].includes(option)?1:2,opaque:option==='steel-door',sourceAsset:option?PHOTO_ROOT+option+'.jpg':null,status:option?'photographic-mechanism-reference':'illustrative-mechanism',note:'Abertura para o exterior; mão, ferragens e ângulo representados são estimados.'};
 if(option==='window-projecting')return {type:'projecting',leaves:1,sourceAsset:PHOTO_ROOT+option+'.jpg',status:'photographic-mechanism-reference'};
 if(option==='window-panoramic')return {type:'panoramic',leaves:1,sourceAsset:PHOTO_ROOT+option+'.jpg',status:'photographic-mechanism-reference',note:'Painéis fixos superior/inferior e folha central projectante; proporções estimadas.'};
 if(option==='window-tilt-turn')return {type:'tilt-turn',leaves:2,sourceAsset:PHOTO_ROOT+option+'.jpg',status:'documented-mechanism',modes:['turn','tilt']};
 if(option==='window-large')return {type:'swing',leaves:1,sourceAsset:PHOTO_ROOT+option+'.jpg',status:'photographic-mechanism-reference',fixedLeft:true,note:'Folha lateral de abrir e área fixa, proporções estimadas pela fotografia.'};
 return {type:'sliding',leaves:2,sourceAsset:['window-930','window-alloy','window-thermal'].includes(option)?PHOTO_ROOT+option+'.jpg':null,status:option==='window-930'?'documented-mechanism':['window-alloy','window-thermal'].includes(option)?'photographic-mechanism-reference':'illustrative-mechanism',note:'Percurso e mão estimados; o mecanismo das janelas standard não está especificado.'};
}

/** Caller provides its box factory so geometry/material lifetime stays with the
 * house. Build replaces the former static window() body without moving its aro. */
export function createOpeningMotion({box,materials,glass=materials.glass,panelDepth=.075}){
 if(typeof box!=='function')throw new TypeError('Opening motion requires the house box factory');
 const records=[],byId=new Map();let enabled=true;

 function build({g,axis,c,h,sign=Math.sign(c)||1}){
  if(!['x','z'].includes(axis)||!g||h.width<=.15||h.height<=.15)throw new TypeError('Invalid opening geometry');
  const profile=openingMechanism(h),isDoor=h.kind==='door',f=isDoor?.055:.044,depth=.052;
  const group=new THREE.Group();group.name=h.id+' · caixilharia funcional';g.add(group);
  const at=(u,y,normal=0)=>new THREE.Vector3(...(axis==='z'?[c+normal,y,u]:[u,y,c+normal]));
  group.position.copy(at(h.u,h.sill,-sign*.035));
  const point=(u,y,normal=0)=>new THREE.Vector3(...(axis==='z'?[normal,y,u]:[u,y,normal]));
  const meshes=[],leaves=[];
  const record={id:h.id,kind:h.kind,group,profile,leaves,meshes,value:0,target:0,mode:profile.type==='tilt-turn'?'turn':'default'};
  group.userData.opening={id:h.id,mechanism:profile.type,status:profile.status,sourceAsset:profile.sourceAsset||null,dimensionsStatus:'opening-dimensions-follow-plan-hardware-estimated'};
  function rect(parent,w,height,thickness,u,y,normal,material,name,interactive=true){
   const p=point(u,y,normal),m=box(parent,axis==='z'?thickness:w,height,axis==='z'?w:thickness,p.x,p.y,p.z,material,h.id+' · '+name,.003);
   m.userData.layer='openings';if(interactive)m.userData.openingMotionId=h.id;meshes.push(m);return m;
  }
  // Same outer dimensions and frame centre as the previous static caixilharia.
  for(const side of [-1,1])rect(group,f,h.height,depth,side*(h.width/2-f/2),h.height/2,0,materials.aluminium,'aro');
  for(const y of [f/2,h.height-f/2])rect(group,h.width,f,depth,0,y,0,materials.aluminium,'aro');
  rect(group,h.width+.02,.022,panelDepth+.025,0,-.011,-sign*(panelDepth/2-.035),materials.metal,'soleira');
  const innerW=h.width-2*f,innerH=h.height-2*f,leafNormal=-sign*.006;
  function leaf({u=0,bottom=f,width=innerW,height=innerH,mechanism=profile.type,direction=1,track=0,moving=true,opaque=false}){
   const center=point(u,bottom+height/2,leafNormal+track),pivot=new THREE.Group(),content=new THREE.Group();
   pivot.name=h.id+' · folha '+(leaves.length+1);content.name='Vidro, perfis e puxadores solidários';group.add(pivot);pivot.add(content);
   const modes={},hingeU=u-direction*width/2;
   const swingSign=(axis==='z'?1:-1)*sign*direction;
   if(mechanism==='sliding')modes.default={pivot:center.clone(),translation:point(width-.014,0,0)};
   else if(mechanism==='projecting')modes.default={pivot:point(u,bottom+height,leafNormal+track),axis:axis==='z'?'z':'x',angle:(axis==='z'?1:-1)*sign*Math.PI/7};
   else if(mechanism==='tilt-turn'){
    modes.turn={pivot:point(hingeU,bottom+height/2,leafNormal+track),axis:'y',angle:-swingSign*Math.PI*.43};
    modes.tilt={pivot:point(u,bottom,leafNormal+track),axis:axis==='z'?'z':'x',angle:(axis==='z'?1:-1)*sign*Math.PI/15};
   }else modes.default={pivot:point(hingeU,bottom+height/2,leafNormal+track),axis:'y',angle:swingSign*Math.PI/2};
   const rail=isDoor?.026:.022,leafDepth=isDoor?.034:.020;
   if(opaque)rect(content,width,height,leafDepth,0,0,0,materials.doorSteel||materials.aluminium,'folha opaca em aço · vão proposto');
   else{
    for(const side of [-1,1])rect(content,rail,height,leafDepth,side*(width/2-rail/2),0,0,materials.aluminium,'perfil de folha');
    for(const y of [-height/2+rail/2,height/2-rail/2])rect(content,width,rail,leafDepth,0,y,0,materials.aluminium,'perfil de folha');
    rect(content,width-2*rail,height-2*rail,.004,0,0,0,glass,'vidro de folha');
   }
   if(moving){
    const handleU=mechanism==='projecting'?0:direction*(width/2-.065),handleY=isDoor?Math.max(-height/2+.25,.99-(bottom+height/2)):mechanism==='projecting'?-height/2+.055:0;
    for(const face of [-1,1]){
     rect(content,.016,.10,.016,handleU,handleY,face*.027,materials.metal,isDoor?'Puxador solidário':'Fecho solidário');
     if(isDoor)rect(content,.075,.014,.016,handleU-direction*.03,handleY+.026,face*.039,materials.metal,'Manípulo solidário');
    }
   }
   const result={pivot,content,center,modes,moving,width,height,closedBounds:new THREE.Box3(),direction};
   leaves.push(result);return result;
  }
  if(profile.type==='sliding'){
   const width=innerW/2+.007;
   leaf({u:-(innerW-width)/2,width,track:sign*.012,mechanism:'sliding'});
   leaf({u:(innerW-width)/2,width,track:-sign*.012,moving:false});
  }else if(profile.type==='panoramic'){
   const bottom=innerH*.26,top=innerH*.18,middle=innerH-bottom-top;
   leaf({bottom:f,height:bottom,moving:false});
   leaf({bottom:f+bottom,height:middle,mechanism:'projecting'});
   leaf({bottom:f+bottom+middle,height:top,moving:false});
  }else if(profile.fixedLeft){
   const fixed=innerW*.64,moving=innerW-fixed;
   leaf({u:-innerW/2+fixed/2,width:fixed,moving:false});
   leaf({u:innerW/2-moving/2,width:moving,mechanism:'swing',direction:-1});
  }else if(profile.leaves===2){
   const width=(innerW-.004)/2;
   for(const side of [-1,1])leaf({u:side*(width/2+.002),width,mechanism:profile.type,direction:-side});
  }else leaf({opaque:profile.opaque,mechanism:profile.type,direction:profile.opaque?-1:1});
  if(h.mosquito&&materials.screen){
   const nx=Math.max(1,Math.ceil(innerW/.025)),ny=Math.max(1,Math.ceil(innerH/.025)),offset=sign*.039;
   for(let i=0;i<=nx;i++)rect(group,.0012,innerH,.0012,-innerW/2+innerW*i/nx,h.height/2,offset,materials.screen,'mosquiteiro representativo');
   for(let i=0;i<=ny;i++)rect(group,innerW,.0012,.0012,0,f+innerH*i/ny,offset,materials.screen,'mosquiteiro representativo');
  }
  records.push(record);if(!byId.has(h.id))byId.set(h.id,[]);byId.get(h.id).push(record);apply(record,0);group.updateMatrixWorld(true);
  for(const item of leaves)item.closedBounds.setFromObject(item.pivot);
  return record;
 }
 function apply(record,value){
  record.value=value;
  for(const leaf of record.leaves){
   const motion=leaf.modes[record.mode]||leaf.modes.default||leaf.modes.turn;
   leaf.pivot.position.copy(motion.pivot);leaf.pivot.quaternion.identity();leaf.content.position.copy(leaf.center).sub(motion.pivot);
   if(leaf.moving&&value>0){if(motion.translation)leaf.pivot.position.addScaledVector(motion.translation,value);else leaf.pivot.rotation[motion.axis]=motion.angle*value;}
   leaf.pivot.updateMatrix();leaf.content.updateMatrix();
  }
  record.group.updateMatrixWorld(true);
 }
 function setOpening(id,value,{immediate=true,mode}={}){
  const instances=byId.get(id);if(!instances)return false;
  if(mode!==undefined&&instances.some(record=>record.profile.type!=='tilt-turn'||!['turn','tilt'].includes(mode)))return false;
  for(const record of instances){if(mode!==undefined)record.mode=mode;record.target=clamp(value);if(immediate||!enabled)apply(record,enabled?record.target:0);}return true;
 }
 function setOpen(value,options={}){for(const id of byId.keys())setOpening(id,value,options);}
 function setEnabled(value){enabled=Boolean(value);for(const record of records)apply(record,enabled?record.target:0);}
 function update(dt){
  if(!enabled)return false;const step=Math.max(0,Math.min(.1,Number(dt)||0))*2.7;let changed=false;
  for(const record of records){const delta=record.target-record.value;if(Math.abs(delta)>1e-7){apply(record,Math.abs(delta)<=step?record.target:record.value+Math.sign(delta)*step);changed=true;}}
  return changed;
 }
 function isAnimating(){return enabled&&records.some(record=>Math.abs(record.value-record.target)>1e-7);}
 const visible=object=>{for(let p=object;p;p=p.parent)if(!p.visible)return false;return true;};
 function toggleFromRay(raycaster,root){
  if(!enabled)return null;root.updateMatrixWorld(true);
  // Respect the first visible surface: an opening cannot be clicked through a wall.
  for(const hit of raycaster.intersectObject(root,true)){
   if(!visible(hit.object))continue;
   const mat=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;
   if(mat&&(!mat.visible||mat.transparent&&mat.opacity<.05))continue;
   const planes=mat?.clippingPlanes||[];
   if(planes.length&&(mat.clipIntersection?planes.every(plane=>plane.distanceToPoint(hit.point)<0):planes.some(plane=>plane.distanceToPoint(hit.point)<0)))continue;
   const id=hit.object.userData.openingMotionId,record=byId.get(id)?.[0];if(!record)return null;
   setOpening(id,record.target>.5?0:1,{immediate:false});return {id,opened:record.target>0,mechanism:record.profile.type,mode:record.mode};
  }
  return null;
 }
 return {build,records,setOpen,setOpening,setEnabled,update,isAnimating,toggleFromRay,get enabled(){return enabled;}};
}
