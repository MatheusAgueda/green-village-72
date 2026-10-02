import * as THREE from './vendor/three.module.js';
import {createServiceFlow} from './service-flow.js';

// Presentation topology only. Pipe sizes, routing and outlet locations are estimates.
export function buildServiceNetwork(plan) {
 const water=[],electrical=[],fixtures=[],rear=-plan.dimensions.length/2+.10;
 const origins={cold:[.28,.16,rear],hot:[.42,.23,rear],drain:[.60,.08,rear]};
 const compact=points=>points.filter((p,i)=>!i||p.some((v,j)=>Math.abs(v-points[i-1][j])>1e-7));
 for(const point of plan.servicePoints){
  const f=plan.furnishings.find(f=>f.id===point.id||point.id==='kitchen-sink'&&f.id==='kitchen-main');
  const drain=point.drain||[f?(f.x0+f.x1)/2:point.x,.18,f?(f.z0+f.z1)/2:point.z];
  fixtures.push({id:point.id,position:[point.x,point.y,point.z],drain});
  for(const kind of ['cold',...(point.hot?['hot']:[]),'drain']){
   const start=origins[kind],end=kind==='drain'?drain:[point.x,point.y,point.z],riserX=end[0]+(kind==='hot'?.035:kind==='cold'?-.035:0);
   water.push({id:point.id+'-'+kind,fixture:point.id,kind,start:[...start],end,points:compact([start,[start[0],start[1],end[2]],[riserX,start[1],end[2]],[riserX,end[1],end[2]],end])});
  }
 }
 const wall=plan.perimeter.find(f=>f.axis==='z'&&!f.holes.some(h=>h.facadeGlazing)),half=plan.dimensions.length/2;
 let panelZ=half-.4;
 for(let z=half-.4;z>-half+.4;z-=.1)if(!wall.holes.some(h=>h.sill<1.70&&h.sill+h.height>1.30&&Math.abs(h.u-z)<h.width/2+.21)){panelZ=z;break;}
 const panel=[wall.c-Math.sign(wall.c)*.15,1.50,panelZ],trunkY=.12;
 const zones=[...plan.rooms,{id:'living',kind:'living',clear:{x0:-3,x1:3,z0:2.8,z1:5.5}}];
 for(const room of zones){
  const c=room.clear,z=(c.z0+c.z1)/2,x=c.x0+.08,cx=(c.x0+c.x1)/2;
  // Wet-room socket and switch stay by its entrance, outside the shower footprint.
  const endZ=room.kind==='bathroom'?c.z1-.16:z;
  for(const [kind,end]of [['socket',[x,.34,endZ]],['switch',[x,1.10,c.z1-.16]],['light',[cx,2.27,z]]]){
   const junction=[x,trunkY,endZ];
   const points=compact([panel,[panel[0],trunkY,panel[2]],[panel[0],trunkY,endZ],junction,[x,end[1],endZ],...(kind==='light'?[[x,end[1],z]]:[]),end]);
   electrical.push({id:room.id+'-'+kind,kind,room:room.id,start:[...panel],junction,end,points});
  }
 }
 return {status:'illustrative',origins,panel,fixtures,water,electrical};
}

// Merge overlapping collinear runs before rendering translucent casings.
// Shared trunks must not become opaque simply because several fixtures use them.
export function serviceSegments(routes){
 const lines=new Map(),segments=[];
 for(const points of routes)for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],axes=[0,1,2].filter(axis=>Math.abs(a[axis]-b[axis])>1e-7);
  if(!axes.length)continue;
  if(axes.length!==1){segments.push([a,b]);continue;}
  const axis=axes[0],key=axis+':'+a.filter((_,j)=>j!==axis).map(v=>v.toFixed(6)).join(':');
  if(!lines.has(key))lines.set(key,{axis,point:a,intervals:[]});
  lines.get(key).intervals.push([Math.min(a[axis],b[axis]),Math.max(a[axis],b[axis])]);
 }
 for(const {axis,point,intervals}of lines.values()){
  intervals.sort((a,b)=>a[0]-b[0]);const merged=[];
  for(const [lo,hi]of intervals){const last=merged.at(-1);if(last&&lo<=last[1]+1e-7)last[1]=Math.max(last[1],hi);else merged.push([lo,hi]);}
  for(const [lo,hi]of merged){const a=[...point],b=[...point];a[axis]=lo;b[axis]=hi;segments.push([a,b]);}
 }
 return segments;
}

export function renderServiceNetwork({plan,groups,mesh,box,pipe,plain}){
 const network=buildServiceNetwork(plan),materials=new Set();
 const mat=(name,colour,more={})=>{const m=plain(name,colour,.38,more);m.userData.serviceCircuit=true;materials.add(m);return m;};
 const m={cold:mat('Água fria · percurso ilustrativo','#2488cf'),hot:mat('Água quente · percurso ilustrativo','#df603c'),drain:mat('Esgoto · percurso ilustrativo','#659784'),conduit:mat('Conduta eléctrica · percurso ilustrativo','#e5b33b'),metal:mat('Uniões de ligação','#c4cbd0',{metalness:.7}),box:mat('Quadro e caixas','#ecece5'),dark:mat('Disjuntores e tomadas','#263333'),light:mat('Ponto de luz','#fff8d5',{emissive:'#fff1bc',emissiveIntensity:.4})};
 // Transparent pipe casings reveal the stream while retaining the physical route.
 for(const kind of ['cold','hot','drain'])Object.assign(m[kind],{transparent:true,opacity:kind==='drain'?.46:.48,depthWrite:false});
 const fluid={cold:mat('Água fria · coluna ilustrativa','#148cbd',{emissive:'#148cbd',emissiveIntensity:.4}),hot:mat('Água quente · coluna ilustrativa','#d85227',{emissive:'#d85227',emissiveIntensity:.3}),drain:mat('Esgotos · coluna ilustrativa','#24866f',{emissive:'#24866f',emissiveIntensity:.3})};
 const sphere=(g,p,r,material,name)=>{const o=mesh(g,new THREE.SphereGeometry(r,12,8),material,name);o.position.set(...p);return o;};
 const joints=new Set();
 function route(g,c,r,material){
  for(const p of c.points.slice(1,-1)){const key=g.name+':'+material.uuid+':'+p.join(',');if(!joints.has(key)){joints.add(key);sphere(g,p,r*1.16,material,'Curva e união · '+c.id);}}
  sphere(g,c.end,r*1.6,m.metal,'Ligação ao equipamento · '+c.id);
 }
 for(const kind of ['cold','hot','drain']){
  const p=network.origins[kind],routes=network.water.filter(c=>c.kind===kind).map(c=>c.points);
  routes.push([[p[0],p[1],rearEdge(plan)],p]);
  for(const segment of serviceSegments(routes)){
   pipe(groups.plumbing,segment,kind==='drain'?.038:.023,m[kind],kind+' · percurso ilustrativo');
   pipe(groups.plumbing,segment,kind==='drain'?.019:.012,fluid[kind],kind+' · coluna de água ilustrativa');
  }
 }
 for(const c of network.water){route(groups.plumbing,c,c.kind==='drain'?.038:.023,m[c.kind]);
  if(c.kind!=='drain'){const p=[c.end[0],Math.max(.26,c.end[1]-.16),c.end[2]];sphere(groups.plumbing,p,.034,m.metal,'Válvula de corte');box(groups.plumbing,.074,.013,.021,p[0],p[1]+.036,p[2],m[c.kind],'Manípulo de corte');}
 }
 for(const [kind,p]of Object.entries(network.origins)){
  sphere(groups.plumbing,p,kind==='drain'?.061:.05,m[kind],kind+' · ligação exterior proposta');
 }
 const p=network.panel,junctionBoxes=new Set();
 box(groups.electrical,.10,.39,.30,...p,m.box,'Quadro eléctrico · localização proposta',.008);
 for(let i=0;i<5;i++)box(groups.electrical,.02,.075,.031,p[0]-Math.sign(p[0])*.062,p[1],p[2]-.1+i*.05,m.dark,'Disjuntor ilustrativo');
 for(const segment of serviceSegments(network.electrical.map(c=>c.points)))pipe(groups.electrical,segment,.019,m.conduit,'Conduta eléctrica · percurso ilustrativo');
 for(const c of network.electrical){route(groups.electrical,c,.019,m.conduit);
  const junctionKey=c.junction.map(value=>value.toFixed(6)).join(',');
  if(!junctionBoxes.has(junctionKey)){
   junctionBoxes.add(junctionKey);
   box(groups.electrical,.083,.037,.083,...c.junction,m.box,'Caixa de derivação');
  }
  if(c.kind==='light')sphere(groups.electrical,c.end,.071,m.light,'Ponto de iluminação');
  else {box(groups.electrical,.027,.095,.095,...c.end,m.box,c.kind==='socket'?'Tomada':'Interruptor',.004);
   if(c.kind==='socket')for(const dz of [-.016,.016])sphere(groups.electrical,[c.end[0]+.016,c.end[1],c.end[2]+dz],.008,m.dark,'Contacto da tomada');
   else box(groups.electrical,.032,.056,.045,...c.end,m.dark,'Tecla do interruptor',.003);
  }
 }
 const flow=createServiceFlow({network,groups,exteriorZ:rearEdge(plan)});
 return {network,materials,flow};
}
const rearEdge=plan=>-plan.dimensions.length/2-.12;
