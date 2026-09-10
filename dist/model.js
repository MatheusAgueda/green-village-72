import * as THREE from './vendor/three.module.js';
import { createInteriorDetail } from './interior-detail.js';
import { installPanelJoints } from './panel-joints.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';
import { DIM, EXPANSION_RIG as RIG, getPlan,doorPose,DOOR_DETAIL, expansionState } from './specification.js';
import { DEFAULT_CONFIG, VISUAL_DEFAULT } from './configuration.js';
import { createMaterialLibrary, physicalUV } from './material-library.js';
export { DIM, expansionState } from './specification.js';
export const DEFAULT={...DEFAULT_CONFIG,...VISUAL_DEFAULT};
export function makeHouse(options={},library=null){
 const state={...DEFAULT,...options},plan=getPlan(state),lib=library||createMaterialLibrary(),ownLibrary=!library,root=new THREE.Group();root.name='GV72 · estúdio de materiais R6';
 const groups={};for(const name of ['structure','floor','floorLayers','shell','roof','interior','furniture','plumbing','electrical','cover','porch','supports']){const g=new THREE.Group();g.name=name;groups[name]=g;root.add(g);}
 const allMaterials=new Set(),allGeometry=new Set(),walls=[],roofPanels=[],sideAssemblies=[],endAssemblies=[],floorAssemblies=[],roofAssemblies=[],doors=[],colliders=[];
 let disposed=false;function dispose(){if(disposed)return;disposed=true;for(const g of allGeometry)g.dispose();for(const m of allMaterials)if(m.userData.lease)lib.release(m);else m.dispose();allGeometry.clear();allMaterials.clear();if(ownLibrary)lib.dispose();}
 try{
 const acquire=(...args)=>{const m=lib.create(...args);allMaterials.add(m);return m;};
 const plain=(name,color,roughness=.65,more={})=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness:0,...more});m.name=name;allMaterials.add(m);return m;};
 const renderOptions={mode:state.textureMode,unlit:state.lighting==='catalogue'},exterior=acquire(state.exteriorId,state.exterior,'exterior_wall',renderOptions),floorFinish=acquire(state.floorId,state.floor,'interior_floor',renderOptions),bathFinish=acquire(state.bathroomUV,'#e7e8e3','bathroom_wall',renderOptions);
 const M={exterior,floor:floorFinish,bath:bathFinish,inner:plain('Pintura interior',state.interior,.84),steel:plain('Perfil pintado · secção estimada','#293330',.43),aluminium:plain('Caixilharia lacada','#273632',.34),metal:plain('Metal aparente','#b0b8b5',.27,{metalness:.85}),white:plain('Cerâmica','#f2f2ed',.19),board:plain('Placa base do piso','#827765',.91),insulation:plain('Camada de isolamento ilustrativa','#ddd9c3',.97),roof:plain('Cobertura metálica','#e2e4dd',.65),cabinet:plain('Mobiliário · branco ilustrativo','#e4e4dc',.58),counter:plain('Bancada · composição ilustrativa','#e4e6df',.36),wood:plain('Madeira de mobiliário · ilustrativa','#ae8f67',.61),linen:plain('Tecido','#a8b39d',.94),fabric:plain('Roupa de cama','#e5e3d9',.96),rubber:plain('Junta elastomérica','#202722',.92),black:plain('Placa de cozinha','#101a1a',.17),blue:plain('Água fria · esquema','#2285c1'),red:plain('Água quente · esquema','#c66347'),drain:plain('Esgotos · esquema','#40846b'),electric:plain('Electricidade · esquema','#d8a027')};
 M.panelInterior=installPanelJoints(plain('Painéis interiores · juntas estimadas',state.interior,.84));
 const glass=new THREE.MeshPhysicalMaterial({color:'#dce9e7',roughness:.06,metalness:0,transmission:.25,transparent:true,opacity:.34,ior:1.5,thickness:.006,envMapIntensity:.55,depthWrite:false});glass.name='Vidro · aparência ilustrativa';allMaterials.add(glass);M.glass=glass;
 function mesh(g,geometry,material,name=''){allGeometry.add(geometry);const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=material!==glass;m.receiveShadow=true;g.add(m);return m;}
 function box(g,w,h,d,x,y,z,material,name='',bevel=0){if(w<=0||h<=0||d<=0)throw new Error('Dimensão não positiva em '+name);const geo=bevel?new RoundedBoxGeometry(w,h,d,2,Math.min(bevel,w/4,h/4,d/4)):new THREE.BoxGeometry(w,h,d);physicalUV(geo,[x,y,z]);const m=mesh(g,geo,material,name);m.position.set(x,y,z);return m;}
 function cylinder(g,r,h,x,y,z,material,name='',segments=14){const m=mesh(g,new THREE.CylinderGeometry(r,r,h,segments),material,name);m.position.set(x,y,z);return m;}
 function pipe(g,points,r,material,name){for(let i=0;i<points.length-1;i++){const a=new THREE.Vector3(...points[i]),b=new THREE.Vector3(...points[i+1]),v=b.clone().sub(a);if(v.length()<1e-6)continue;const m=mesh(g,new THREE.CylinderGeometry(r,r,v.length(),9),material,name);m.position.copy(a.add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());}}
 function beam(g,a,b,width=.06,depth=.06,material=M.steel,name='Perfil · dimensões ilustrativas'){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A),geo=new THREE.BoxGeometry(width,v.length(),depth);const m=mesh(g,geo,material,name);m.position.copy(A.add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
 function bolt(g,x,y,z,axis='z'){const m=cylinder(g,.014,.008,x,y,z,M.metal,'Fixação representativa',6);if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;}
 // Profile dimensions and fixing details are visual assumptions, not manufacturer specifications.
 const X=DIM.width/2,Z=DIM.length/2,C=DIM.core/2,H=DIM.height,P=DIM.frame;
 // Rigid assemblies retain the finished geometry. Deployment clearances are illustrative.
 const wings=new Map([-1,1].map(dir=>{const w={dir};for(const [key,parent]of [['floor','floor'],['layers','floorLayers'],['floorFrame','structure'],['roofFrame','structure'],['sideFrame','structure']]){const g=new THREE.Group();g.name=key+' '+dir;groups[parent].add(g);w[key]=g;}return [dir,w];}));
 function hinge(g,position,name){const parent=g.parent,pivot=new THREE.Group();pivot.name=name;parent.add(pivot);pivot.position.copy(position);pivot.add(g);g.position.copy(position).negate();return pivot;}
 const floorZones=[[-X,-C],[-C,C],[C,X]],wingAt=(a,b)=>a>=C?wings.get(1):b<=-C?wings.get(-1):null;

 for(const x of [-C+P/2,C-P/2])for(const z of [-Z+P/2,Z-P/2])box(groups.structure,P,H,P,x,H/2,z,M.steel,'Pilar do núcleo',.009);
 for(const x of [-C+P/2,C-P/2])for(const y of [-.075,H-P/2])box(groups.structure,P,P,DIM.length,x,y,0,M.steel,'Longarina central',.006);
 for(const x of [-X+P/2,X-P/2])for(const z of [-Z+P/2,Z-P/2])box(wings.get(Math.sign(x)).sideFrame,P,H,P,x,H/2,z,M.steel,'Pilar lateral',.006);
 for(const x of [-X+P/2,X-P/2])for(const y of [-.075,H-P/2])box(wings.get(Math.sign(x))[y<0?'floorFrame':'roofFrame'],P,P,DIM.length,x,y,0,M.steel,'Longarina lateral',.005);
 for(const z of [-Z+P/2,Z-P/2])for(const y of [-.075,H-P/2])for(const [a,b]of floorZones){const wing=wingAt(a,b);box(wing?wing[y<0?'floorFrame':'roofFrame']:groups.structure,b-a,P,P,(a+b)/2,y,z,M.steel,'Travessa lateral',.005);}
 for(let z=-Z+.3;z<Z-.15;z+=.59)for(const [a,b]of floorZones){const wing=wingAt(a,b),lo=Math.max(a,-X+.1),hi=Math.min(b,X-.1);box(wing?wing.floorFrame:groups.structure,hi-lo,.055,.045,(lo+hi)/2,-.14,z,M.steel,'Travessa de piso estimada');}
 for(const x of [-X+.2,-C+.15,C-.15,X-.2])for(const z of [-Z+.35,0,Z-.35]){box(groups.supports,.29,.035,.29,x,-.347,z,M.steel,'Base de apoio');cylinder(groups.supports,.038,.17,x,-.245,z,M.metal,'Apoio ilustrativo');}
 // Three independent visible floor layers, inside the same 6.22 × 11.80 m envelope.
 function floorSlab(g,a,b,bottom,depth,material,name){const inset=.004; a+=inset; b-=inset; const shape=new THREE.Shape();shape.moveTo(a,-Z+inset);shape.lineTo(b,-Z+inset);shape.lineTo(b,Z-inset);shape.lineTo(a,Z-inset);shape.closePath();for(const point of plan.servicePoints)for(const offset of [-.13,0,.13]){const x=point.x+offset;if(x>a+.04&&x<b-.04){const hole=new THREE.Path();hole.absarc(x,-point.z,.037,0,Math.PI*2,true);shape.holes.push(hole);}}const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12});geo.rotateX(-Math.PI/2);physicalUV(geo);const m=mesh(g,geo,material,name);m.position.y=bottom;}
 for(const [a,b] of floorZones){const w=wingAt(a,b);floorSlab(w?w.floor:groups.floor,a,b,-.012,.012,M.floor,'Pavimento SPC · passagens propostas');floorSlab(w?w.layers:groups.floorLayers,a,b,-.046,.032,M.board,'Placa de suporte');floorSlab(w?w.layers:groups.floorLayers,a,b,-.121,.07,M.insulation,'Isolamento de piso · ilustrativo');}
 // Panels have separate external skin, insulating body and internal paint. Each side has metre UVs.
 function panelSection(g,axis,c,a,b,lo,hi,sign,name,material=M.exterior){if(b-a<1e-7||hi-lo<1e-7)return;
  const centre=(a+b)/2,cy=(lo+hi)/2;const at=(offset)=>axis==='z'?[c+offset,cy,centre]:[centre,cy,c+offset];
  const add=(depth,offset,m,n)=>{const [x,y,z]=at(offset);return box(g,axis==='z'?depth:b-a,hi-lo,axis==='z'?b-a:depth,x,y,z,m,n);};
  add(DIM.panel-.012,-sign*DIM.panel/2,M.insulation,name+' · núcleo');add(.005,-sign*.0025,material,name+' · exterior');add(.005,-sign*(DIM.panel-.0025),M.panelInterior,name+' · interior');
 }
 function window(g,axis,c,h,sign){const {u,width,height,sill}=h,at=(v,y,offset=0)=>axis==='z'?[c+offset,y,v]:[v,y,c+offset];const rect=(w,hei,depth,v,y,mat,name,off=0)=>{const [x,yy,z]=at(v,y,off);return box(g,axis==='z'?depth:w,hei,axis==='z'?w:depth,x,yy,z,mat,name,.003);};
  const isDoor=h.kind==='door',f=isDoor?.055:.044,th=.052;for(const e of [-1,1])rect(f,height,th,u+e*(width/2-f/2),sill+height/2,M.aluminium,h.id+' · aro',-sign*.035);
  for(const y of [sill+f/2,sill+height-f/2])rect(width,f,th,u,y,M.aluminium,h.id+' · aro',-sign*.035);
  rect(.026,height-.06,.044,u,sill+height/2,M.aluminium,h.id+' · montante',-sign*.035);
  for(const e of [-1,1]){rect((width-f*3)/2,height-f*2,.004,u+e*width/4,sill+height/2,glass,h.id+' · vidro',-sign*.041);}
  rect(width+.02,.022,DIM.panel+.025,u,sill-.011,M.metal,h.id+' · soleira',-sign*DIM.panel/2);
  if(isDoor){rect(.018,.18,.018,u+.08,.99,M.metal,'Puxador',sign*.012);}else rect(.014,.11,.012,u+.055,sill+height*.45,M.metal,'Fecho da janela',-sign*.071);
 }
 function wallPanel(g,axis,c,a,b,holes,sign,name){const cuts=[a,b,...holes.flatMap(h=>[Math.max(a,h.u-h.width/2),Math.min(b,h.u+h.width/2)])].sort((a,b)=>a-b);for(let i=0;i<cuts.length-1;i++){const lo=cuts[i],hi=cuts[i+1];if(hi<=a||lo>=b||hi-lo<1e-6)continue;const hole=holes.find(h=>(lo+hi)/2>h.u-h.width/2&&(lo+hi)/2<h.u+h.width/2);for(const [y0,y1]of hole?[[.09,hole.sill],[hole.sill+hole.height,H-.12]]:[[.09,H-.12]])panelSection(g,axis,c,lo,hi,Math.max(.09,y0),Math.min(H-.12,y1),sign,name);}
  for(const h of holes)if(h.u-h.width/2>=a-1e-6&&h.u+h.width/2<=b+1e-6)window(g,axis,c,h,sign);
  const bottom=axis==='z'?[c-sign*.05,.046,(a+b)/2]:[(a+b)/2,.046,c-sign*.05];box(g,axis==='z'?.098:b-a,.085,axis==='z'?b-a:.098,...bottom,M.aluminium,name+' · remate inferior');
  walls.push(g);
 }
 for(const face of plan.perimeter){const sign=face.c>0?1:-1;if(face.axis==='z'){
   const pivot=new THREE.Group();pivot.name='Painel longitudinal '+sign;pivot.position.set(sign*(X-RIG.wallPivotInset),RIG.wallPivotHeight,0);root.add(pivot);
   const local=new THREE.Group();local.position.set(-pivot.position.x,-pivot.position.y,0);pivot.add(local);
   wallPanel(local,'z',sign*X,-Z+P,Z-P,face.holes,sign,'Fachada longitudinal');
   sideAssemblies.push({dir:sign,pivot,local});
  }else{
   const core=new THREE.Group();core.name='Topo do núcleo';groups.shell.add(core);wallPanel(core,'x',face.c,-C+P,C-P,face.holes.filter(h=>Math.abs(h.u)<C),sign,'Topo central');
   for(const dir of [-1,1]){const g=new THREE.Group();g.name='Painel de topo '+sign+' '+dir;root.add(g);wallPanel(g,'x',face.c,dir<0?-X+P:C,dir<0?-C:X-P,face.holes.filter(h=>Math.sign(h.u)===dir&&Math.abs(h.u)>=C),sign,'Painel de topo');endAssemblies.push({g,front:sign,dir});}
  }}
 // Roof panels have a real thickness; layer visibility never leaves roof ribs over the cutaway.
 for(const [a,b]of floorZones){const g=new THREE.Group();groups.roof.add(g);box(g,b-a-.008,.06,DIM.length-.008,(a+b)/2,H-.025,0,M.roof,'Chapa de cobertura',.005);box(g,b-a-.008,.055,DIM.length-.008,(a+b)/2,H-.081,0,M.insulation,'Isolamento de cobertura');box(g,b-a-.008,.005,DIM.length-.008,(a+b)/2,H-.111,0,M.inner,'Tecto interior');for(let z=-Z+.22;z<Z;z+=.59)box(g,b-a,.009,.018,(a+b)/2,H+.009,z,M.roof,'Nervura de chapa');roofPanels.push(g);}
 function interiorWall(w){const {axis,c,a,b,door,thickness}=w;const at=(u,y)=>axis==='z'?[c,y,u]:[u,y,c];const segment=(lo,hi,y0,y1)=>{if(hi<=lo)return;box(groups.interior,axis==='z'?thickness:hi-lo,y1-y0,axis==='z'?hi-lo:thickness,...at((lo+hi)/2,(y0+y1)/2),M.panelInterior,w.id);};
  if(door){segment(a,door.u-door.width/2,0,H-.12);segment(door.u+door.width/2,b,0,H-.12);segment(door.u-door.width/2,door.u+door.width/2,door.height,H-.12);
   const pose=doorPose(door),pivot=new THREE.Group();pivot.name=door.id;pivot.position.set(pose.hinge.x,0,pose.hinge.z);groups.interior.add(pivot);
   box(pivot,axis==='z'?DOOR_DETAIL.thickness:pose.leafWidth,door.height-.025,axis==='z'?pose.leafWidth:DOOR_DETAIL.thickness,axis==='z'?0:pose.direction*door.width/2,(door.height-.025)/2+DOOR_DETAIL.baseGap,axis==='z'?pose.direction*door.width/2:0,M.inner,'Folha de porta',.004);
   for(const face of [-1,1]){if(axis==='z')box(pivot,.08,.018,.02,face*.05,.99,pose.direction*(door.width-.12),M.metal,'Puxador interior');else box(pivot,.02,.018,.08,pose.direction*(door.width-.12),.99,face*.05,M.metal,'Puxador interior');}
   doors.push({pivot,...door});
   for(const u of [door.u-door.width/2,door.u+door.width/2])box(groups.interior,axis==='z'?thickness+.024:.036,door.height+.025,axis==='z'?.036:thickness+.024,...at(u,(door.height+.025)/2),M.white,'Guarnição da porta');
  }else segment(a,b,0,H-.12);
  // Skirting follows only solid wall spans and never crosses a doorway.
  for(const [lo,hi]of door?[[a,door.u-door.width/2],[door.u+door.width/2,b]]:[[a,b]])if(hi>lo)box(groups.interior,axis==='z'?thickness+.018:hi-lo,.065,axis==='z'?hi-lo:thickness+.018,...at((lo+hi)/2,.033),M.white,'Rodapé');
 }
 plan.walls.forEach(interiorWall);
 const details=createInteriorDetail({state,lib,M,plain,box,mesh,cylinder,pipe,allMaterials});if(!state.bathroomUV)M.bath=details.B.wall;
 const bath=plan.rooms.find(r=>r.kind==='bathroom');
 // Dedicated bathroom material is applied only to its internal walls.
 const bathSkin=new THREE.Group();bathSkin.name='Paredes do ambiente';groups.interior.add(bathSkin);const bc=bath.clear;for(const x of [bc.x0,bc.x1])box(bathSkin,.006,H-.14,bc.z1-bc.z0,x,H/2-.06,(bc.z0+bc.z1)/2,M.bath,'Revestimento UV da casa de banho');box(bathSkin,bc.x1-bc.x0,H-.14,.006,(bc.x0+bc.x1)/2,H/2-.06,bc.z0,M.bath,'Revestimento UV posterior');
 for(const f of plan.furnishings){const cx=(f.x0+f.x1)/2,cz=(f.z0+f.z1)/2,w=f.x1-f.x0,d=f.z1-f.z0,g=new THREE.Group();g.name=f.id;groups.furniture.add(g);
  if(f.type==='bed'){box(g,w,.19,d,cx,.145,cz,M.wood,'Base de cama',.024);box(g,w-.045,.2,d-.04,cx,.345,cz,M.fabric,'Colchão',.055);box(g,w-.035,.085,d*.58,cx,.467,cz+d*.18,M.linen,'Edredão',.035);for(const x of [cx-w*.245,cx+w*.245])box(g,w*.41,.115,.36,x,.496,f.z0+.27,M.fabric,'Almofada',.05);box(g,w+.025,.82,.055,cx,.44,f.z0+.01,M.wood,'Cabeceira',.018);}
  if(f.type==='sofa'){box(g,w,.22,d,cx,.25,cz,M.linen,'Sofá · base',.055);box(g,w,.49,.17,cx,.62,f.z0+.05,M.linen,'Sofá · costas',.05);for(const x of [f.x0+.08,f.x1-.08])box(g,.16,.49,d,x,.49,cz,M.linen,'Sofá · braço',.035);for(const x of [cx-w*.22,cx+w*.22])box(g,w*.4,.16,d*.73,x,.43,cz+.05,M.linen,'Sofá · almofada',.048);for(const x of [f.x0+.13,f.x1-.13])for(const z of [f.z0+.15,f.z1-.15])cylinder(g,.023,.15,x,.075,z,M.wood);}
  if(f.type==='table'){box(g,w,.045,d,cx,.41,cz,M.wood,'Mesa de apoio',.023);for(const x of [f.x0+.1,f.x1-.1])for(const z of [f.z0+.1,f.z1-.1])cylinder(g,.018,.385,x,.192,z,M.steel);}
  if(f.type==='shower')details.buildShower(g,f);
  if(f.type==='toilet')details.buildToilet(g,f);
  if(f.type==='basin')details.buildBasin(g,f,bc);
  if(f.type.includes('kitchen')||f.type==='island')details.buildKitchen(g,f);

 }
 // Scheme paths follow semantic fixture coordinates from getPlan. Sizes are symbols, not pipe specifications.
 for(const [offset,material,kind]of [[-.13,M.blue,'cold'],[0,M.red,'hot'],[.13,M.drain,'drain']]){
  const points=plan.servicePoints.filter(p=>kind!=='hot'||p.hot),maxZ=Math.max(...points.map(p=>p.z));pipe(groups.plumbing,[[offset,-.26,-Z-.2],[offset,-.26,maxZ]],kind==='drain'?.027:.017,material,kind+' · esquema');
  for(const p of points)pipe(groups.plumbing,[[offset,-.26,p.z],[p.x+offset,-.26,p.z],[p.x+offset,p.y,p.z]],kind==='drain'?.025:.014,material,p.id+' · '+kind);
 }
 // Electrical illustration uses the documented room/door relationships. Crossing each
 // partition at 2.00 m goes through its 2.05 m door void, rather than through a solid wall.
 const electricWhite=plain('Pontos eléctricos · esquema','#f2f2ed',.6),electricBox=plain('Quadro eléctrico · esquema','#dde0d6',.6);
 box(groups.electrical,.29,.38,.1,.45,1.45,Z-.22,electricBox,'Quadro eléctrico · posição proposta',.012);
 const trunkZ=Z-.3;
 for(const room of plan.rooms.filter(r=>r.kind==='bedroom')){
  const w=plan.walls.find(w=>w.id===room.id+'-side'),side=w.c>0?1:-1,inside=w.c+side*.15,cz=(room.clear.z0+room.clear.z1)/2,cx=(room.clear.x0+room.clear.x1)/2;
  pipe(groups.electrical,[[.45,1.65,trunkZ],[.45,2,trunkZ],[.45,2,w.door.u],[inside,2,w.door.u],[inside,2.32,w.door.u],[inside,2.32,cz],[cx,2.32,cz]],.012,M.electric,'Percurso ilustrativo pelo vão de porta');
  cylinder(groups.electrical,.11,.024,cx,2.31,cz,electricWhite,'Ponto de luz proposto');
  pipe(groups.electrical,[[inside,2.32,cz],[inside,.3,cz]],.009,M.electric,'Descida conceptual junto à divisória');
  box(groups.electrical,.035,.12,.09,inside,.28,cz,electricWhite,'Ponto de utilização proposto');
 }
 const commonLightX=plan.compact?0:-1.6;
 pipe(groups.electrical,[[.45,1.65,trunkZ],[.45,2.32,trunkZ],[.45,2.32,3],[commonLightX,2.32,3]],.012,M.electric,'Iluminação comum · esquema');
 cylinder(groups.electrical,.11,.024,commonLightX,2.31,3,electricWhite,'Ponto de luz comum proposto');
 // Pitched canopy: dimensions below are explicitly estimates, while shape follows the supplied photograph.
 const coverHalf=X+DIM.canopyOverhang,eaves=H+DIM.canopyEavesAboveWall,rise=DIM.canopyRise,over=DIM.canopyOverhang,slant=Math.hypot(coverHalf,rise),pitch=Math.atan2(rise,coverHalf);
 for(const dir of [-1,1]){const m=box(groups.cover,slant,.06,DIM.length+2*over,dir*coverHalf/2,eaves+rise/2,0,M.roof,'Telhado adicional · medidas estimadas',.005);m.rotation.z=-dir*pitch;for(const z of [-Z,-2,2,Z])beam(groups.cover,[dir*coverHalf,eaves,z],[0,eaves+rise,z],.045,.05,M.steel,'Asna ilustrativa');}
 for(const z of [-Z,-2,2,Z])beam(groups.cover,[-coverHalf,eaves,z],[coverHalf,eaves,z],.05,.05,M.steel,'Travessa do telhado');
 const porchDepth=DIM.porchDepth,porchFront=Z+porchDepth;
 box(groups.porch,DIM.width,.1,porchDepth,0,-.09,Z+porchDepth/2,M.wood,'Piso do alpendre · profundidade estimada',.008);
 const canopyGroup=new THREE.Group();canopyGroup.name='Cobertura do alpendre';groups.porch.add(canopyGroup);
 for(const dir of [-1,1]){const m=box(canopyGroup,slant,.06,porchDepth+.28,dir*coverHalf/2,eaves+rise/2,Z+porchDepth/2,M.roof,'Cobertura de alpendre');m.rotation.z=-dir*pitch;}
 for(const x of [-X+.08,-1.04,1.04,X-.08])box(groups.porch,.06,eaves,.06,x,eaves/2,porchFront-.06,M.white,'Pilar de alpendre',.006);
 for(const dir of [-1,1]){box(groups.porch,2.02,.045,.05,dir*2.04,.9,porchFront-.05,M.white,'Corrimão',.006);for(let x=1.12;x<X-.06;x+=.19)box(groups.porch,.018,.8,.018,dir*x,.46,porchFront-.05,M.white,'Balaústre');}

 for(const w of wings.values()){
  const anchor=new THREE.Vector3(w.dir*C,0,0),pivots=['floor','layers','floorFrame'].map(key=>hinge(w[key],anchor,'Articulação de piso '+w.dir));
  for(const post of w.sideFrame.children){post.userData.deploymentZ=post.position.z;post.userData.deploymentX=post.position.x;}
  const side=sideAssemblies.find(a=>a.dir===w.dir);side.framePivot=hinge(w.sideFrame,new THREE.Vector3(w.dir*(X-RIG.wallPivotInset),RIG.wallPivotHeight,0),'Articulação de postes '+w.dir);
  floorAssemblies.push({dir:w.dir,pivots});
  const panel=roofPanels[w.dir<0?0:2],roofAnchor=new THREE.Vector3(w.dir*C,H,0);
  roofAssemblies.push({dir:w.dir,pivots:[hinge(panel,roofAnchor,'Articulação de cobertura '+w.dir),hinge(w.roofFrame,roofAnchor,'Articulação de perfis de cobertura '+w.dir)]});
 }
 for(const a of endAssemblies){a.pivot=hinge(a.g,new THREE.Vector3(a.dir*C,0,a.front*Z),'Articulação de topo '+a.front+' '+a.dir);}
 const cutPlane=new THREE.Plane(new THREE.Vector3(0,-1,0),state.cut||1.1);
 const moving=[...sideAssemblies.map(a=>a.pivot),...endAssemblies.map(a=>a.g)];
 function setView(view){state.view=view;const cut=['interior','plan','plumbing','electrical'].includes(view),structure=view==='structure',finish=view==='finishes',expand=view==='expansion';
  groups.shell.visible=!structure&&(expand||state.wallsVisible);groups.interior.visible=!structure&&!expand;groups.furniture.visible=state.furnitureVisible&&!structure&&!expand;
  groups.floor.visible=!structure;groups.floorLayers.visible=!structure||finish;groups.roof.visible=!cut&&!structure&&(expand||state.roofVisible);groups.structure.visible=true;groups.supports.visible=true;
  groups.plumbing.visible=view==='plumbing';groups.electrical.visible=view==='electrical';
  for(const a of sideAssemblies)a.pivot.visible=!structure&&(expand||state.wallsVisible);for(const a of endAssemblies)a.g.visible=!structure&&(expand||state.wallsVisible);
  for(const m of allMaterials){m.clippingPlanes=cut&&![M.electric,electricWhite,electricBox].includes(m)?[cutPlane]:[];m.clipShadows=true;m.needsUpdate=true;}
  if(view==='plumbing'||view==='electrical'){groups.floor.visible=false;groups.floorLayers.visible=false;}
  groups.cover.visible=state.roof&&!cut&&!expand;groups.porch.visible=state.porch&&!expand;canopyGroup.visible=!cut&&!structure;for(const o of groups.cover.children)o.visible=!structure||o.material!==M.roof;for(const o of groups.porch.children)if(o.isMesh)o.visible=!structure||o.material!==M.wood;
  setExploded(finish?state.exploded??1:0);updateExpansion(expand?state.expansion:1);setDoors(state.doorsOpen);
 }
 function setDetail(kind=null){
  const active=state.view==='interior'&&kind&&detailBounds(kind);root.userData.detail=active?kind:null;
  for(const g of groups.furniture.children)g.visible=!active||(kind==='kitchen'?g.name.includes('kitchen'):['shower','toilet','basin'].includes(g.name));
  for(const wall of bathSkin.children)wall.visible=!(active&&kind==='bathroom'&&wall.position.x*(state.bathroom==='mirrored'?-1:1)>0);
  const crop=active?active.clone().expandByScalar(.34):null;
  const planes=crop?[new THREE.Plane(new THREE.Vector3(1,0,0),-crop.min.x),new THREE.Plane(new THREE.Vector3(-1,0,0),crop.max.x),new THREE.Plane(new THREE.Vector3(0,0,1),-crop.min.z),new THREE.Plane(new THREE.Vector3(0,0,-1),crop.max.z)]:[];
  if(state.view==='interior')for(const m of allMaterials){m.clippingPlanes=active&&details.detailMaterials.has(m)?[]:active&&(m===M.bath||(kind==='kitchen'&&[M.panelInterior,M.aluminium,M.glass,M.metal].includes(m)))?planes:[active&&kind==='bathroom'?new THREE.Plane(new THREE.Vector3(0,-1,0),.07):cutPlane,...planes];m.needsUpdate=true;}
 }
 function detailBounds(kind){const list=plan.furnishings.filter(f=>kind==='kitchen'?f.type.includes('kitchen')||f.type==='island':['shower','toilet','basin'].includes(f.type));if(!list.length)return null;const bounds=new THREE.Box3(new THREE.Vector3(Math.min(...list.map(f=>f.x0))-.07,0,Math.min(...list.map(f=>f.z0))-.04),new THREE.Vector3(Math.max(...list.map(f=>f.x1))+.08,kind==='kitchen'?(details.kitchen.upper?2.23:1.22):2.12,Math.max(...list.map(f=>f.z1))+.04));root.updateMatrixWorld(true);for(const m of details.motions)if(m.scope===kind)bounds.union(new THREE.Box3().setFromObject(m.g));return bounds;}

 function setCut(height){state.cut=height;cutPlane.constant=height;}
 function setDoors(open){state.doorsOpen=open;for(const d of doors)d.pivot.rotation.y=doorPose(d,open?1:0).angle;}
 function setExploded(v){state.exploded=v;groups.roof.position.y=v*1.2;groups.floorLayers.position.y=-v*.65;for(const a of sideAssemblies)for(const p of [a.pivot,a.framePivot])p.position.x=a.dir*(X-RIG.wallPivotInset+v*.6);groups.cover.position.y=v*1.5;}
 function updateExpansion(value){
  const e=expansionState(value);state.expansion=e.p;const active=state.view==='expansion';
  const alpha=active?Math.PI/2*(1-e.floor):0,beta=active?Math.PI/2*(1-e.wall):0;
  const lift=RIG.floorLift*Math.sin(alpha),offset=RIG.floorOffset*Math.sin(alpha);
  for(const a of floorAssemblies)for(const p of a.pivots){p.rotation.z=a.dir*alpha;p.position.set(a.dir*(C+offset),lift,0);}
  for(const a of sideAssemblies){
   const anchor=new THREE.Vector3(a.dir*(X-RIG.wallPivotInset-C),RIG.wallPivotHeight,0).applyAxisAngle(new THREE.Vector3(0,0,1),a.dir*alpha).add(new THREE.Vector3(a.dir*(C+offset),lift,0));
   if(state.view==='finishes')anchor.x+=a.dir*state.exploded*.6;
   for(const p of [a.pivot,a.framePivot]){p.position.copy(anchor);p.rotation.z=a.dir*(alpha+beta);}
   for(const post of a.framePivot.children[0].children)if(Number.isFinite(post.userData.deploymentZ)){const clearance=active?1-e.postsDock:0;post.position.z=post.userData.deploymentZ+Math.sign(post.userData.deploymentZ)*RIG.postClearance*clearance;post.position.x=post.userData.deploymentX+a.dir*RIG.postLateralClearance*clearance;}
  }
  for(const a of roofAssemblies)for(const p of a.pivots){p.rotation.z=active?-a.dir*Math.PI/2*(1-e.roof):0;p.position.set(a.dir*(C+(active?RIG.roofOffset*(1-e.roofDock):0)),H+(active?RIG.roofLift*(1-e.roofLower):0),0);}
  for(const a of endAssemblies){const angle=active?Math.PI/2*(1-e.ends):0;a.pivot.rotation.y=-a.dir*a.front*angle;a.pivot.position.set(a.dir*(C+RIG.endOffset*Math.sin(angle)**2),0,a.front*(Z+(active?RIG.endAxialOffset*(1-e.ends):0)));}
  if(active){groups.interior.visible=false;groups.furniture.visible=false;groups.cover.visible=false;groups.porch.visible=false;groups.plumbing.visible=false;groups.electrical.visible=false;}
  return e;
 }
 function captureBases(){root.updateMatrixWorld(true);for(const a of sideAssemblies)colliders.push({id:'side-'+a.dir,object:a.pivot,kind:'moving-wall'});for(const a of endAssemblies)colliders.push({id:a.g.name,object:a.pivot,kind:'moving-end'});for(const a of floorAssemblies)colliders.push({id:'floor-'+a.dir,object:a.pivots[0],kind:'moving-floor'});for(const a of roofAssemblies)colliders.push({id:'roof-'+a.dir,object:a.pivots[0],kind:'moving-roof'});}
 // Merge only immutable per-group profile pieces with the same material, retaining animated groups.
 function batch(g){const byMat=new Map();for(const o of [...g.children])if(o.isMesh&&!o.name.includes('vidro')&&o.material!==glass){if(!byMat.has(o.material))byMat.set(o.material,[]);byMat.get(o.material).push(o);}
  for(const [material,objects]of byMat)if(objects.length>3){const geometries=objects.map(o=>{o.updateMatrix();const geo=o.geometry.clone().applyMatrix4(o.matrix);return geo.index?geo.toNonIndexed():geo;});const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!merged)continue;const replacement=mesh(g,merged,material,`${g.name} · ${objects.length} peças`);for(const o of objects){g.remove(o);o.geometry.dispose();allGeometry.delete(o.geometry);}}}
 for(const w of wings.values())for(const key of ['floorFrame','roofFrame','sideFrame','layers'])batch(w[key]);
 batch(groups.structure);batch(groups.supports);batch(groups.floorLayers);batch(groups.interior);batch(groups.plumbing);batch(groups.electrical);for(const g of roofPanels)batch(g);for(const a of sideAssemblies)batch(a.local);for(const a of endAssemblies)batch(a.g);function batchTree(g){for(const child of [...g.children])if(child.isGroup)batchTree(child);batch(g);}for(const g of groups.furniture.children)batchTree(g);
 setView(state.view);captureBases();
 root.userData={revision:'R6',state,plan,groups,bedroomCount:plan.bedrooms,colliders,envelope:{width:DIM.width,length:DIM.length,core:DIM.core,wing:DIM.wing},animationLimits:'Complete illustrative deployment; unmeasured hinges and temporary clearances are not manufacturer transport dimensions.'};
 return {root,groups,plan,details,setDetail,detailBounds,materials:M,sideAssemblies,endAssemblies,floorAssemblies,roofAssemblies,doors,colliders,updateExpansion,setView,setCut,setExploded,setDoors,library:lib,dispose};
 }catch(error){dispose();throw error;}
}
