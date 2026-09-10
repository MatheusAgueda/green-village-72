import * as THREE from './vendor/three.module.js';
import { DATA } from './data.js';
export const DIM={width:6.22,length:11.8,core:2.22,height:2.55,wing:2};
export const DEFAULT={layout:'t2',exterior:'#dad8cd',interior:'#f1eee6',floor:'#ba9870',texture:'plain',floorMap:null,wallMap:null,kitchen:'linear',bathroom:'standard',roof:false,porch:false,view:'exterior',expansion:1};
export function expansionState(value){
 const p=THREE.MathUtils.clamp(Number(value)||0,0,1);
 const phase=(a,b)=>THREE.MathUtils.smoothstep(p,a,b);
 return {roof:phase(0,.3),floor:phase(.2,.65),wall:phase(.62,.92),ends:phase(.83,1),label:p<.05?'Módulo fechado':p<.3?'Abertura da cobertura':p<.65?'Desdobramento do piso':p<.92?'Elevação das paredes':'Casa expandida'};
}
export function makeHouse(options={}){
 const state={...DEFAULT,...options}, root=new THREE.Group(); root.name='Green Village 72';
 const groups={}; for(const k of ['structure','shell','roof','interior','plumbing','electrical','cover','porch']){groups[k]=new THREE.Group();groups[k].name=k;root.add(groups[k]);}
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.75,...extra});
 const steel=mat('#303b3c',{metalness:.45,roughness:.48}),wall=mat(state.exterior),inside=mat(state.interior),floor=mat(state.floor),roofmat=mat('#394847',{metalness:.2}),white=mat('#f9f8f1'),wood=mat('#a97b4d'),linen=mat('#c3c7b6'),glass=mat('#81a9ae',{transparent:true,opacity:.35,metalness:.3,roughness:.15,depthWrite:false}),black=mat('#252e2c'),soil=mat('#dddfd5');
 const kitchenMat=mat(DATA.kitchens.find(k=>k.id===state.kitchenRef)?.previewHexApprox||state.interior);
 const bathMat=mat(state.interior);
 const materials={steel,wall,inside,floor,roofmat,white,wood,linen,glass,black,soil,kitchen:kitchenMat,bath:bathMat};
 const loaded=[];
 function mapMaterial(m,url,repeat){if(!url||typeof document==='undefined')return;const tx=new THREE.TextureLoader().load(url);tx.colorSpace=THREE.SRGBColorSpace;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(...repeat);m.map=tx;m.color.set('#ffffff');loaded.push(tx);}
 mapMaterial(floor,state.floorMap,[3,8]); mapMaterial(wall,state.wallMap,[2,2]);mapMaterial(bathMat,state.bathroomMap,[1,1]);
 function box(g,w,h,d,x,y,z,m){const obj=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;g.add(obj);return obj;}
 function beam(g,a,b,r,m){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);const obj=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m);obj.position.copy(A.add(B).multiplyScalar(.5));obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());obj.castShadow=true;g.add(obj);return obj;}
 function frame(g,x1,x2,z1,z2,y=0){
  for(const x of [x1,x2])for(const z of [z1,z2])box(g,.12,2.7,.12,x,y+1.35,z,steel);
  for(const h of [y+.02,y+2.7]){for(const x of [x1,x2])box(g,.12,.14,z2-z1,x,h,(z1+z2)/2,steel);for(const z of [z1,z2])box(g,x2-x1,.14,.12,(x1+x2)/2,h,z,steel);}
  for(let z=z1+.65;z<z2;z+=.65)box(g,x2-x1,.07,.045,(x1+x2)/2,y-.07,z,steel);
 }
 function windowAt(g,u,y,len,h,axis,constant,isDoor=false){
  const w=len,t=.065,z=axis==='z'?u:constant,x=axis==='x'?u:constant;
  box(g,axis==='x'?w:t,h,axis==='x'?t:w,x,y+h/2,z,glass);
  for(const v of [-w/2,w/2,0])box(g,axis==='x'?.055:t,h+.07,axis==='x'?t:.055,x+(axis==='x'?v:0),y+h/2,z+(axis==='z'?v:0),steel);
  for(const v of [y,y+h])box(g,axis==='x'?w+.07:t,.055,axis==='x'?t:w+.07,x,v,z,steel);
  if(isDoor)box(g,.03,.22,.05,x+.08,y+.95,z+.075,white);
 }
 // A wall is built around its actual apertures, so glazing remains open in cutaway views.
 function panel(g,axis,c,start,end,holes=[],height=2.55){
  const cuts=[start,end,...holes.flatMap(h=>[h.u-h.w/2,h.u+h.w/2])].sort((a,b)=>a-b);
  for(let i=0;i<cuts.length-1;i++){const a=Math.max(start,cuts[i]),b=Math.min(end,cuts[i+1]);if(b-a<.01)continue;const h=holes.find(v=>(a+b)/2>v.u-v.w/2&&(a+b)/2<v.u+v.w/2);
   const pieces=h?[[0,h.y],[h.y+h.h,height]]:[[0,height]];
   for(const [lo,hi] of pieces){if(hi-lo<.01)continue;box(g,axis==='x'?b-a:.075,hi-lo,axis==='x'?.075:b-a,axis==='x'?(a+b)/2:c,(hi+lo)/2,axis==='z'?(a+b)/2:c,wall);}
  }
  for(const h of holes)windowAt(g,h.u,h.y,h.w,h.h,axis,c,h.y<.05);
  if(state.texture==='cladding'||state.texture==='wood')for(let y=.2;y<height;y+=.24){
   for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1];if(holes.some(h=>(a+b)/2>h.u-h.w/2&&(a+b)/2<h.u+h.w/2&&y>h.y&&y<h.y+h.h))continue;
    box(g,axis==='x'?b-a:.081,.012,axis==='x'?.081:b-a,axis==='x'?(a+b)/2:c,y,axis==='z'?(a+b)/2:c,wood);
   }
  }
 }
 frame(groups.structure,-1.11,1.11,-5.9,5.9);
 box(groups.interior,2.22,.14,11.8,0,-.1,0,floor);
 box(groups.roof,2.22,.12,11.8,0,2.7,0,roofmat);
 panel(groups.shell,'x',5.9,-1.11,1.11,[{u:0,w:1.7,h:2.25,y:0}]);
 panel(groups.shell,'x',-5.9,-1.11,1.11,[{u:0,w:.75,h:.55,y:1.65}]);
 const wings=[];
 for(const dir of [-1,1]){
  const assembly=new THREE.Group();root.add(assembly);
  const floorPivot=new THREE.Group();floorPivot.position.set(dir*1.11,0,0);assembly.add(floorPivot);
  const floorSurface=new THREE.Group();floorPivot.add(floorSurface);box(floorSurface,2,.14,11.8,dir,-.1,0,floor);
  const floorSteel=new THREE.Group();floorPivot.add(floorSteel);
  for(let z=-5.9;z<=5.91;z+=.59)box(floorSteel,2,.08,.045,dir,-.17,z,steel);
  box(floorSteel,.12,.16,11.8,dir*2,0,0,steel);
  const sideWall=new THREE.Group();sideWall.position.x=dir*2;floorPivot.add(sideWall);
  const sideShell=new THREE.Group();sideWall.add(sideShell);
  panel(sideShell,'z',0,-5.9,5.9,[-4,-.8,3.4].map(u=>({u,w:1.15,y:.85,h:1.2})));
  const sideSteel=new THREE.Group();sideWall.add(sideSteel);
  for(const z of [-5.9,-2,2,5.9])box(sideSteel,.12,2.67,.1,0,1.33,z,steel);
  box(sideSteel,.12,.14,11.8,0,2.64,0,steel);
  const top=new THREE.Group();top.position.set(dir*1.11,2.7,0);assembly.add(top);
  const roofSurface=box(top,2,.12,11.8,dir,0,0,roofmat);
  const topSteel=new THREE.Group();top.add(topSteel);box(topSteel,2,.1,.12,dir,0,-5.9,steel);box(topSteel,2,.1,.12,dir,0,5.9,steel);
  for(let z=-5.9;z<5.91;z+=1.18)box(topSteel,2,.07,.05,dir,-.08,z,steel);
  const ends=[];
  for(const z of [-5.9,5.9]){const e=new THREE.Group();e.position.set(dir*1.11,0,z);assembly.add(e);panel(e,'x',0,dir===1?0:-2,dir===1?2:0,[{u:dir,w:.9,h:1.1,y:.95}]);ends.push(e);}
  wings.push({dir,assembly,floorPivot,floorSurface,floorSteel,sideWall,sideShell,sideSteel,top,roofSurface,topSteel,ends});
 }
 function partition(axis,c,a,b,door=0){
  const g=groups.interior;
  for(const [lo,hi] of [[a,door-.4],[door+.4,b]])if(hi>lo)box(g,axis==='x'?hi-lo:.08,2.35,axis==='x'?.08:hi-lo,axis==='x'?(hi+lo)/2:c,1.18,axis==='z'?(hi+lo)/2:c,inside);
  box(g,axis==='x'?.8:.08,.25,axis==='x'?.08:.8,axis==='x'?door:c,2.23,axis==='z'?door:c,inside);
 }
 // Layouts trace room bands from the supplied workbook; furnishing positions are illustrative.
 const plan=DATA.layouts.find(p=>p.id===state.layout)||DATA.layouts[2];
 const bedRooms=plan.rooms.filter(r=>r.kind==='bedroom');
 for(const room of bedRooms){
  const [x0,z0,x1,z1]=room.bounds;const x=(x0+x1)/2*6.22-3.11,z=(z0+z1)/2*11.8-5.9,w=(x1-x0)*6.22,len=(z1-z0)*11.8;
  const dir=Math.sign(x),innerX=dir>0?x0*6.22-3.11:x1*6.22-3.11;
  partition('z',innerX,z-len/2,z+len/2,z+len/2-.65);
  if(z+len/2<5.8)box(groups.interior,w,2.35,.07,x,1.18,z+len/2,inside);
  box(groups.interior,1.4,.28,1.9,x,.12,z,wood);box(groups.interior,1.36,.19,1.86,x,.36,z,white);box(groups.interior,1.38,.055,1.08,x,.49,z+.36,linen);
  for(const q of [-.35,.35])box(groups.interior,.55,.12,.37,x+q,.54,z-.62,white);
  box(groups.interior,1.45,.75,.08,x,.45,z-.97,wood);
 }
 const bathroom=new THREE.Group();groups.interior.add(bathroom);bathroom.position.z=-4.545;bathroom.scale.set(.69,1,1.22);
 if(state.bathroom==='mirrored')bathroom.scale.x=-.69;
 box(bathroom,2.1,.02,2.05,0,.01,0,mat('#b7b9b3'));
 for(const x of [-1.08,1.08])box(bathroom,.07,2.35,2.1,x,1.18,0,bathMat);
 partition('x',-3.23,-.745,.745,0);
 box(bathroom,1.98,.07,.75,0,.08,-.64,white);
 box(bathroom,1.98,1.85,.025,0,1,-.24,glass);
 box(bathroom,2.05,2.35,.055,0,1.18,-1.04,bathMat);
 beam(bathroom,[0,.85,-.99],[0,2,-.99],.017,steel);beam(bathroom,[0,2,-.99],[0,2,-.76],.017,steel);
 box(bathroom,.52,.4,.62,-.56,.22,.2,white);box(bathroom,.5,.65,.14,-.56,.36,-.05,white);
 box(bathroom,.58,.72,.43,.63,.38,.66,wood);box(bathroom,.6,.06,.45,.63,.79,.66,white);box(bathroom,.48,.6,.03,.63,1.4,1.02,glass);
 const kitchen=new THREE.Group();groups.interior.add(kitchen); kitchen.position.set(state.layout==='t4-a'?-.4:-2.73,0,state.layout==='t4-a'?-2.3:1.2);
 function kitchenUnit(x,z){box(kitchen,.58,.87,.62,x,.44,z,kitchenMat);box(kitchen,.62,.045,.66,x,.9,z,white);box(kitchen,.38,.015,.025,x,.75,z+.326,steel);}
 for(let i=0;i<3;i++)kitchenUnit(0,i*.62);
 box(kitchen,.42,.015,.45,0,.93,0,steel);box(kitchen,.28,.02,.32,0,.945,0,glass);
 beam(kitchen,[.15,.94,-.1],[.15,1.18,-.1],.012,steel);
 box(kitchen,.44,.012,.43,0,.936,1.2,black);
 for(const x of [-.1,.1])for(const z of [1.08,1.32]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.015,16),steel);m.position.set(x,.95,z);kitchen.add(m);}
 if(state.kitchen==='l'&&state.layout!=='t4-a')for(let i=1;i<3;i++)kitchenUnit(i*.6,0);
 if(state.kitchen==='island'&&state.layout!=='t4-a'){for(let i=0;i<2;i++)kitchenUnit(.95,i*.62);}
 // Living furniture stays in the open front-left bay in bedroom configurations.
 if(state.layout!=='t4-a'){
 const loungeX=state.layout==='t4-a'?0:-1.1,loungeZ=4.1;
 box(groups.interior,state.layout==='t4-a'?1.2:1.7,.3,.8,loungeX,.22,loungeZ,linen);box(groups.interior,state.layout==='t4-a'?1.2:1.7,.6,.15,loungeX,.55,loungeZ-.38,linen);
 for(const x of (state.layout==='t4-a'?[-.55,.55]:[-.8,.8]))box(groups.interior,.14,.53,.8,loungeX+x,.42,loungeZ,linen);
 box(groups.interior,1.25,.05,.65,loungeX,.38,loungeZ+1.12,wood);
 for(const x of [-.49,.49])for(const z of [-.23,.23])box(groups.interior,.035,.36,.035,loungeX+x,.17,loungeZ+1.12+z,steel);
 }
 const blue=mat('#259ad3'),red=mat('#e1765b'),drain=mat('#649987'),electric=mat('#e6ac34');
 materials.blue=blue;materials.red=red;materials.drain=drain;materials.electric=electric;
 for(const [off,m] of [[-.15,blue],[0,red],[.15,drain]]){
  const mainEnd=state.layout==='t4-a'?-1:2.8;
  beam(groups.plumbing,[off,.02,-6.3],[off,.02,mainEnd],m===drain?.046:.023,m);
  const mirror=state.bathroom==='mirrored'?-1:1;
  const fixtures=[[0,-5.25,1.7],[-.39*mirror,-4.3,.42],[.44*mirror,-3.74,.81],[kitchen.position.x,kitchen.position.z,.94]];
  for(const [x,z,y] of fixtures){if(m===red&&y===.42)continue;beam(groups.plumbing,[off,.02,z],[x+off,.02,z],.023,m);beam(groups.plumbing,[x+off,.02,z],[x+off,y,z],.023,m);}
 }
 box(groups.electrical,.35,.5,.12,.87,1.45,5.6,black);
 for(const x of [-2.93,2.93]){
  beam(groups.electrical,[.87,2.35,5.6],[x,2.35,5.6],.023,electric);beam(groups.electrical,[x,2.35,5.6],[x,2.35,-5.5],.023,electric);
  for(const z of [-4.2,-.5,3.6]){beam(groups.electrical,[x,2.35,z],[x,.38,z],.02,electric);box(groups.electrical,.12,.16,.09,x,.35,z,white);beam(groups.electrical,[x,2.35,z],[0,2.35,z],.02,electric);box(groups.electrical,.45,.035,.45,0,2.32,z,white);}
 }
 // Independent pitched shelter and front veranda.
 const pitch=Math.atan2(.8,3.5);
 for(const dir of [-1,1]){const s=box(groups.cover,3.6,.1,12.3,dir*1.74,3.23,0,roofmat);s.rotation.z=-dir*pitch;}
 for(const z of [-5.9,-2,2,5.9]){beam(groups.cover,[-3.45,2.85,z],[0,3.65,z],.045,steel);beam(groups.cover,[0,3.65,z],[3.45,2.85,z],.045,steel);beam(groups.cover,[-3.45,2.85,z],[3.45,2.85,z],.035,steel);}
 box(groups.porch,6.6,.15,2.1,0,-.1,7,wood);
 for(let x=-3.15;x<=3.2;x+=2.1){box(groups.porch,.07,2.65,.07,x,1.27,8.02,white);}
 for(const dir of [-1,1]){const s=box(groups.porch,3.6,.07,2.4,dir*1.74,3.22,7.1,roofmat);s.rotation.z=-dir*pitch;}
 for(let x=-3.2;x<3.21;x+=.2)if(Math.abs(x)>.65)box(groups.porch,.025,.82,.025,x,.4,8.02,white);
 for(const x of [-2,2])box(groups.porch,2.55,.05,.06,x,.83,8.02,white);
 function updateExpansion(p){const e=expansionState(p);
  for(const w of wings){w.floorPivot.rotation.z=w.dir*(Math.PI/2)*(1-e.floor);w.sideWall.rotation.z=w.dir*(Math.PI/2)*(1-e.wall);w.top.rotation.z=-w.dir*(Math.PI/2)*(1-e.roof);w.ends.forEach((g,i)=>{g.rotation.y=(i===0?-1:1)*w.dir*Math.PI/2*(1-e.ends);});}
  groups.interior.visible=p>.97&&state.view!=='structure';groups.cover.visible=state.roof&&p>.99&&!['interior','plumbing','electrical','plan'].includes(state.view);groups.porch.visible=state.porch&&p>.99;
  return e;
 }
 function setView(v){state.view=v;const cut=['interior','plumbing','electrical','plan'].includes(v),tech=['structure','plumbing','electrical'].includes(v);
  groups.shell.visible=!tech&&!cut;groups.roof.visible=!cut&&v!=='structure';groups.structure.visible=true;
  for(const w of wings){w.sideShell.visible=!tech&&!cut;w.roofSurface.visible=!cut&&v!=='structure';w.topSteel.visible=!cut;w.floorSurface.visible=v!=='structure';w.ends.forEach(e=>e.visible=!tech&&!cut);}
  groups.plumbing.visible=v==='plumbing';groups.electrical.visible=v==='electrical';groups.interior.visible=v!=='structure';
  if(tech&&v!=='structure')groups.interior.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.28;}});
 }
 setView(state.view);updateExpansion(state.expansion);
 root.userData={state,groups,wings,materials,bedroomCount:bedRooms.length};
 return {root,groups,wings,materials,updateExpansion,setView,dispose(){const mats=new Set(Object.values(materials));root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)mats.add(o.material);});mats.forEach(m=>m.dispose());loaded.forEach(t=>t.dispose());}};
}
