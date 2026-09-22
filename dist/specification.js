import { DATA } from './data.js';
import {applyOpeningOptions,projectPorchDepth,selectedOption,optionTargetLabel} from './project-options.js';
// Coordinates: metres; +X right, +Y up, +Z entrance. Origin: floor centre.
export const REVISION='GV72-R9-2026-09-11';
// Illustrative axes and clearance for the documented wall-raising phase only.
export const WALL_RAISE=Object.freeze({axisX:2.99,axisY:0,roofClearance:.008,wallEnd:.9,durationMs:9000,status:'estimated',source:'assets/expansao.png · quadros 2–3'});
// Deployment offsets are presentation assumptions, never transport or fabrication dimensions.
export const EXPANSION_RIG=Object.freeze({status:'estimated',wallPivotInset:.126,wallPivotHeight:.14});
export const EPSILON=1e-7; // Numerical tolerance only, not a manufacturing tolerance.
export const DIM=Object.freeze({width:6.22,length:11.8,core:2.2,wing:2.01,height:2.55,panel:.1,partition:.08,frame:.12,floor:.121,roof:.127,doorWidth:.76,doorHeight:2.05,windowWidth:.92,windowHeight:1.05,windowSill:.95,entryWidth:1.7,entryHeight:2.15,bathWindowWidth:.6,bathWindowHeight:.5,bathWindowSill:1.7,porchDepth:1.95,canopyOverhang:.28,canopyEavesAboveWall:.22,canopyRise:.65});
const d=(id,label,value,source,status='confirmed',note='')=>({id,label,value,unit:id==='usefulArea'?'m²':'m',source,status,note});
export const MEASURES=[
 d('length','Comprimento exterior',11.8,'XLSX · todas as 7 plantas'),d('width','Largura exterior',6.22,'XLSX · todas as 7 plantas'),d('core','Banda central',2.2,'XLSX · cota superior 2200'),d('wing','Banda lateral (cada)',2.01,'XLSX · cotas superiores 2010'),
 d('windowWidth','Largura cotada das janelas',.92,'XLSX · cota 920; posição/altura não cotadas'),d('height','Altura das paredes e perfis na maquete',2.55,'Hipótese da maquete','estimated','Não indicada nos anexos. Não usar como cota de fabrico.'),
 d('panel','Espessura de parede na maquete',.1,'Hipótese geométrica','estimated','O catálogo refere opção lã de rocha 100 mm; não comprova espessura total da parede desta variante.'),d('partition','Divisória interior',.08,'Hipótese geométrica','estimated'),d('frame','Secção visual dos perfis',.12,'Fotografias e maquete','estimated','Sem desenho de perfil ou ligação.'),d('floor','Camadas de piso, incluindo intervalos',DIM.floor,'Hipótese geométrica','estimated'),d('roof','Camadas e nervuras da cobertura',DIM.roof,'Hipótese geométrica','estimated'),d('doorWidth','Vão interior na maquete',.76,'Hipótese de visualização','estimated'),d('doorHeight','Altura das portas na maquete',2.05,'Hipótese de visualização','estimated'),d('windowHeight','Altura das janelas na maquete',1.05,'Fotografias, sem cota','estimated'),
 d('entryWidthVisual','Largura de entrada na maquete',DIM.entryWidth,'Fotografias sem cotas','estimated'),d('entryHeightVisual','Altura de entrada na maquete',DIM.entryHeight,'Fotografias sem cotas','estimated'),d('bathWindowWidthVisual','Largura de janela do banho na maquete',DIM.bathWindowWidth,'Planta sem cota neste vão','estimated'),d('windowSillVisual','Peitoril de janela na maquete',DIM.windowSill,'Fotografias sem cotas','estimated'),d('porchDepthVisual','Profundidade de alpendre na maquete',DIM.porchDepth,'Hipótese de visualização','estimated'),d('canopyRiseVisual','Desnível da cumeeira na maquete',DIM.canopyRise,'Fotografia sem cota','estimated'),d('canopyOverhangVisual','Beiral na maquete',DIM.canopyOverhang,'Fotografia sem cota','estimated'),
 d('catalogueTerraceDepth','Profundidade do terraço do catálogo',3,'Catálogo p. 13','confirmed','Correspondência com a fotografia do alpendre por confirmar. Não aplicada ao modelo sem confirmação.'),d('closedWidth','Largura de transporte',null,'Desenho do módulo fechado não fornecido','missing','A banda central de 2,20 m não estabelece a largura exterior de transporte com painéis recolhidos.'),d('usefulArea','Área útil certificada',null,'Mapa de áreas não fornecido','missing'),d('ridge','Altura da cumeeira adicional',null,'Fotografia de cobertura sem cotas','missing'),
];
export const SOURCES=[
 {id:'plans',file:'assets/plantas-40-pes.xlsx',label:'Plantas de 40 pés',scope:'7 layouts de unidade de dupla asa; designação 72 m² não impressa.',locations:'7 imagens na folha 40ft Standard Double-Wing Unit',confirmed:['11 800 × 6 220 mm','2010 + 2200 + 2010 mm','T0, T1, T2, T3 A/B e T4 A/B'],limits:'As posições interiores são proporcionais aproximadas; não há cozinha nem altura cotada.'},
 {id:'catalogue',file:'assets/opcionais-2026.pdf',label:'Opcionais de personalização · 11/07/2026',scope:'Catálogo genérico de expansíveis; compatibilidade específica de 72 m² por confirmar.',locations:'p. 7–10 exterior; p. 14 SPC; p. 16 cozinha; p. 17–18 casa de banho; p. 19 contacto',limits:'Amostras raster até 480 × 300 px. Não há RAL/NCS, escala de textura ou preço total da casa.'},
 {id:'expansion',file:'assets/expansao.png',label:'Sequência de expansão em quatro imagens',scope:'Referência conceptual sem cotas e sem variante comprovada.',locations:'4 posições',limits:'Não define pivôs exactos, alturas, folgas, bloqueios ou transporte das divisórias.'},
 {id:'frame',file:'assets/estrutura.png',label:'Referência de armação',scope:'Imagem de estrutura, sem desenho de fabrico.',locations:'Imagem completa',limits:'Perfis, fixações e soldaduras não cotados.'},
 {id:'canopy',file:'assets/alpendre.jpg',label:'Fotografia de telhado e alpendre',scope:'Variante fotografada, sem dimensões.',locations:'Imagem completa',limits:'A maquete reproduz forma e apoios com medidas estimadas.'},
];
export const SOURCE_DIVERGENCES=[
 'As plantas cotam janelas de 920 mm. A janela opcional de 930 × 930 mm (catálogo p. 5) não substitui essa cota; a compatibilidade e eventuais alterações dos vãos estão por confirmar.',
 'O terraço do catálogo (p. 13) indica 3 m e estrutura preta; a fotografia do alpendre apresenta guarda branca, sem profundidade cotada. Esta divergência não comprova uma variante diferente: a correspondência está por esclarecer. O preço do catálogo não é atribuído ao alpendre da maquete.',
 '72 m² é a designação comercial. 11,80 × 6,22 = 73,396 m² de rectângulo exterior. A diferença não é corrigida alterando cotas.',
 '5690 + 5690 = 11380 mm: faltam 420 mm para os 11800 mm totais nas plantas T0/T1/T2/T3 A/T4 A. Não foi atribuída silenciosamente uma espessura a esta diferença.',
 '4000 + 3900 + 3900 = 11800 mm nas plantas T3 B/T4 B; a cota 210 nas extremidades não é somada novamente ao comprimento exterior.',
 'As bandas estruturais cotadas não coincidem com os traços de divisórias no desenho raster. Os limites de divisões mantêm o traçado observado como estimativa, não cota exacta.',
 'As fotografias mostram unidades com vãos, portas laterais e acabamentos distintos. Não provam que todos estes elementos coexistem numa única variante.'
];
export function sourceDivergences(configuration){
 const divergences=[...SOURCE_DIVERGENCES];
 if(selectedOption(configuration,'terrace'))divergences[1]='A opção Terraço e cobertura de 3 m está seleccionada e o respectivo PVP consta dos adicionais. A profundidade documentada de 3 m é aplicada ao modelo. A fotografia de guarda branca não comprova os materiais, a geometria ou a compatibilidade desta opção; esses pormenores continuam por confirmar.';
 return divergences;
}
// Keep source dimensions separate from the geometry selected in the configurator.
export function configuredOpenings(plan){
 return plan.perimeter.flatMap(face=>face.holes.map(h=>{
  const option=DATA.options.find(item=>item.id===h.optionId);
  const sourceDimensions=h.optionId==='window-930'?{width:.93,height:.93}:h.optionId==='window-panoramic'?{width:.6,height:1.9}:!option&&h.kind==='window'&&h.id!=='bath-window'?{width:.92}:{};
  const sourceNote=option
   ? (Object.keys(sourceDimensions).length?'Largura e altura documentadas no catálogo. Peitoril e implantação estimados.':'Dimensões do artigo não publicadas; vão de apresentação estimado.')+' Catálogo p. '+option.page+'.'
   : h.id==='entry'?'Entrada de duas folhas desenhada na planta; dimensões estimadas.':h.kind==='window'&&h.id!=='bath-window'?'Largura de 0,920 m cotada na planta; altura e peitoril estimados.':'Dimensões estimadas; vão sem cotas na planta.';
  const label=h.kind==='door'&&h.id.startsWith('side-')?optionTargetLabel(h.id).replace(/^Janela lateral/,'Porta lateral'):optionTargetLabel(h.id);
  return {id:h.id,label,kind:h.kind,optionId:h.optionId||null,optionLabel:option?.label||null,
   modelled:{width:h.width,height:h.height,sill:h.sill},provided:sourceDimensions,
   drawnLeaves:h.kind==='door'?(['steel-door','side-glass-door'].includes(h.optionId)?1:2):null,
   sourceNote,status:'presentation-geometry'};
 })).concat(plan.doors.map(door=>({id:door.id,label:optionTargetLabel(door.id),kind:'door',optionId:door.optionId||null,
  optionLabel:door.optionId?DATA.options.find(item=>item.id===door.optionId)?.label||null:null,
  modelled:{width:door.width,height:door.height,sill:0},provided:{},drawnLeaves:1,
  sourceNote:door.optionId?'Material ou mecanismo seleccionado no catálogo; dimensões do vão estimadas.':'Porta interior da planta; largura e altura estimadas.',status:'presentation-geometry'})));
}
export function configuredMeasures(plan){
 const holes=plan.perimeter.flatMap(face=>face.holes),windows=holes.filter(h=>h.kind==='window'&&h.id!=='bath-window');
 const fields={windowWidth:[windows,'width'],windowHeight:[windows,'height'],windowSillVisual:[windows,'sill'],entryWidthVisual:[holes.filter(h=>h.id==='entry'),'width'],entryHeightVisual:[holes.filter(h=>h.id==='entry'),'height'],bathWindowWidthVisual:[holes.filter(h=>h.id==='bath-window'),'width']};
 const aliases={porchDepthVisual:'porchDepth',canopyRiseVisual:'canopyRise',canopyOverhangVisual:'canopyOverhang'};
 return MEASURES.map(m=>{
  if(plan.terraceOptionSelected&&['porchDepthVisual','catalogueTerraceDepth'].includes(m.id))return {...m,value:3,source:'Catálogo p. 13 · opção Terraço e cobertura seleccionada',status:'confirmed',provided:3,modelled:plan.dimensions.porchDepth,modelledValues:[plan.dimensions.porchDepth],numericMatch:plan.dimensions.porchDepth===3,note:'Profundidade documentada de 3 m aplicada ao modelo. Os restantes pormenores e a compatibilidade com a casa continuam por confirmar.'};
  const selection=fields[m.id],values=selection?[...new Set(selection[0].map(h=>h[selection[1]]))].sort((a,b)=>a-b):[plan.dimensions[aliases[m.id]||m.id]].filter(Number.isFinite);
  return {...m,provided:m.status==='confirmed'?m.value:null,modelled:values.length===1?values[0]:null,modelledValues:values,
   numericMatch:m.status==='confirmed'&&values.length?values.every(value=>value===m.value):null};
 });
}
export const LAYOUTS=DATA.layouts.map(p=>({...p,sourceStatus:'estimated',sourceNote:'Tipologia confirmada; limites interiores aproximados a partir do traçado da planta.'}));
export function rectArea(r){return Math.max(0,r.x1-r.x0)*Math.max(0,r.z1-r.z0);}
export function intersects(a,b,margin=0){return Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>margin+EPSILON&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>margin+EPSILON;}
// Door clearances are illustrative. Hinge end and opening side follow the source plans.
export const DOOR_DETAIL=Object.freeze({normalOffset:.0725,endGap:.023,baseGap:.008,thickness:.035});
export function doorPose(door,progress=0){
 const direction=door.hingeEnd==='end'?-1:1,hingeU=door.u-direction*door.width/2;
 const side=door.axis==='z'?door.hinge:-1,angle=(door.axis==='z'?side*direction:direction)*Math.PI/2*Math.min(1,Math.max(0,progress));
 const hinge={x:door.axis==='z'?door.c+side*DOOR_DETAIL.normalOffset:hingeU,z:door.axis==='z'?hingeU:door.c-DOOR_DETAIL.normalOffset};
 // Sliding travel is a presentation proposal along the longer adjacent wall span.
 if(door.optionVariant==='sliding'){
  // The short bathroom wall needs a face-mounted proposal on the common-room side.
  if(door.axis==='x')hinge.z=door.c+DOOR_DETAIL.normalOffset;
  const slide=(door.slideDirection??-direction)*door.width*Math.min(1,Math.max(0,progress));
  if(door.axis==='z')hinge.z+=slide;else hinge.x+=slide;
  const point=distance=>({x:hinge.x+(door.axis==='z'?0:direction*distance),z:hinge.z+(door.axis==='z'?direction*distance:0)});
  return {direction,hingeU,hinge,angle:0,sliding:true,slide,leafWidth:door.width-2*DOOR_DETAIL.endGap,start:point(DOOR_DETAIL.endGap),tip:point(door.width-DOOR_DETAIL.endGap),radius:door.width-DOOR_DETAIL.endGap};
 }
 const point=distance=>{const x=door.axis==='z'?0:direction*distance,z=door.axis==='z'?direction*distance:0;return{x:hinge.x+x*Math.cos(angle)+z*Math.sin(angle),z:hinge.z-x*Math.sin(angle)+z*Math.cos(angle)};};
 return {direction,hingeU,hinge,angle,leafWidth:door.width-2*DOOR_DETAIL.endGap,start:point(DOOR_DETAIL.endGap),tip:point(door.width-DOOR_DETAIL.endGap),radius:door.width-DOOR_DETAIL.endGap};
}
// Test the complete translation corridor, not only its final point. No renderer is needed.
// A conflict prevents assigning this optional door; it does not silently reduce its opening.
export function slidingDoorConflicts({walls,doors}){
 const conflicts=[];
 for(const door of doors){
  if(door.optionVariant!=='sliding')continue;
  const closed=doorPose(door,0),open=doorPose(door,1),points=[closed.start,closed.tip,open.start,open.tip],half=DOOR_DETAIL.thickness/2;
  const swept={x0:Math.min(...points.map(p=>p.x))-(door.axis==='z'?half:0),x1:Math.max(...points.map(p=>p.x))+(door.axis==='z'?half:0),z0:Math.min(...points.map(p=>p.z))-(door.axis==='x'?half:0),z1:Math.max(...points.map(p=>p.z))+(door.axis==='x'?half:0)};
  const blocker=walls.find(w=>(w.door?[[w.a,w.door.u-w.door.width/2],[w.door.u+w.door.width/2,w.b]]:[[w.a,w.b]]).some(([a,b])=>{
   if(b<=a)return false;
   const solid=w.axis==='z'?{x0:w.c-w.thickness/2,x1:w.c+w.thickness/2,z0:a,z1:b}:{x0:a,x1:b,z0:w.c-w.thickness/2,z1:w.c+w.thickness/2};
   return intersects(swept,solid);
  }));
  if(blocker)conflicts.push({targetId:door.id,wallId:blocker.id,reason:(door.id==='bath-door'?'A porta de correr da casa de banho':'Esta porta de correr')+' não dispõe de espaço livre para recolher a folha nesta distribuição. Mantenha o artigo sem local de aplicação até confirmar outra solução.'});
 }
 return conflicts;
}

export function getPlan(config){
 const template=LAYOUTS.find(x=>x.id===config.layout);if(!template)throw new Error('Planta desconhecida');
 const W=DIM.width,L=DIM.length,t=DIM.partition,edge=DIM.panel;
 const walls=[],doors=[],rooms=[];
 const wall=(id,axis,c,a,b,door=null)=>{const w={id,axis,c,a,b,thickness:t,height:DIM.height,door:door?{...door,axis,c}:null};walls.push(w);if(door)doors.push({...door,wall:id,axis,c});return w;};
 for(const [i,r] of template.rooms.entries()){
  const [u0,v0,u1,v1]=r.bounds,x0=u0*W-W/2,x1=u1*W-W/2,z0=v0*L-L/2,z1=v1*L-L/2;
  const clear={x0:x0+(u0===0?edge:t/2),x1:x1-(u1===1?edge:t/2),z0:z0+(v0===0?edge:t/2),z1:z1-(v1===1?edge:t/2)};
  const room={id:`${r.kind}-${i}`,kind:r.kind,label:r.label,outline:{x0,x1,z0,z1},clear,area:rectArea(clear),status:'estimated'};rooms.push(room);
  if(r.kind==='bedroom'){
   const side=x0>=0?1:-1,c=side===1?x0:x1;
   const centre=v1>=.999?z0+Math.max(.64,DIM.doorWidth*.8):z1-Math.max(.64,DIM.doorWidth*.8);wall(room.id+'-side','z',c,z0,z1,{id:room.id+'-door',u:centre,width:DIM.doorWidth,height:DIM.doorHeight,hinge:side,hingeEnd:v1>=.999?'start':'end',opensInto:room.id});
   if(v1<.999)wall(room.id+'-end','x',z1,x0,x1);
  }
 }
 const bath=rooms.find(r=>r.kind==='bathroom'),b=bath.outline;
 // The bathroom sides are shared with rear bedroom walls when a bedroom is adjacent.
 for(const [side,c] of [[-1,b.x0],[1,b.x1]])if(!walls.some(w=>w.axis==='z'&&Math.abs(w.c-c)<EPSILON&&w.a<=b.z0+EPSILON&&w.b>=b.z1-EPSILON))wall('bath-'+side,'z',c,b.z0,b.z1);
 const mirrored=config.bathroom==='mirrored',bathDoorWidth=Math.min(DIM.doorWidth,b.x1-b.x0-.2);
 wall('bath-front','x',b.z1,b.x0,b.x1,{id:'bath-door',u:mirrored?bath.clear.x0+.10+bathDoorWidth/2:bath.clear.x1-.10-bathDoorWidth/2,width:bathDoorWidth,height:DIM.doorHeight,hinge:-1,hingeEnd:mirrored?'start':'end',opensInto:bath.id});
 const perimeter=[{axis:'x',c:L/2,a:-W/2,b:W/2,holes:[{id:'entry',u:0,width:DIM.entryWidth,height:DIM.entryHeight,sill:0,kind:'door',source:'double-leaf door depicted; size estimated'},...[-1,1].map(s=>({id:'front-window-'+s,u:s*2.05,width:DIM.windowWidth,height:DIM.windowHeight,sill:DIM.windowSill,kind:'window'}))]},
 {axis:'x',c:-L/2,a:-W/2,b:W/2,holes:[{id:'bath-window',u:0,width:DIM.bathWindowWidth,height:DIM.bathWindowHeight,sill:DIM.bathWindowSill,kind:'window',source:'estimated'},...(['t3-b','t4-b'].includes(config.layout)?[]:[-1,1]).map(s=>({id:'rear-window-'+s,u:s*2.05,width:DIM.windowWidth,height:DIM.windowHeight,sill:DIM.windowSill,kind:'window'}))]}];
 for(const side of [-1,1]){
  const adjacent=rooms.filter(r=>r.kind==='bedroom'&&(side===-1?r.outline.x0<-.1:r.outline.x1>.1));
  const zs=adjacent.map(r=>(r.outline.z0+r.outline.z1)/2);
  if(!adjacent.length){if(config.layout==='t3-b'&&side===-1)zs.push(-3.7,.05,3.7);else zs.push(-2.85,2.85);}else if(adjacent.length===1){if(config.layout==='t4-b'&&side===-1)zs.push(.05,3.7);else zs.push(Math.max(adjacent[0].outline.z1+1.2,3.7));}
  perimeter.push({axis:'z',c:side*W/2,a:-L/2,b:L/2,holes:zs.map((z,i)=>({id:`side-${side}-${i}`,u:z,width:DIM.windowWidth,height:DIM.windowHeight,sill:DIM.windowSill,kind:'window',source:'window count/room relation follows source; centre position estimated'}))});
 }
 // Apply replacements before cabinet/window constraints and keep both door consumers in sync.
 applyOpeningOptions(perimeter,doors,config);
 for(const face of perimeter)for(const h of face.holes)if(h.optionId)h.source='Selected catalogue option; undocumented opening dimensions and placement remain illustrative.';
 for(const door of doors){const wall=walls.find(w=>w.id===door.wall);
  if(door.optionVariant==='sliding'){const before=door.u-door.width/2-wall.a,after=wall.b-door.u-door.width/2;door.slideDirection=after>before?1:-1;door.motionStatus='proposed';}
  Object.assign(wall.door,door);
 }
 const furnishings=[],servicePoints=[];
 const item=(id,type,r,extra={})=>{const f={id,type,...r,...extra,status:'estimated'};furnishings.push(f);return f;};
 for(const r of rooms.filter(r=>r.kind==='bedroom')){const c=r.clear,cx=(c.x0+c.x1)/2,w=walls.find(w=>w.id===r.id+'-side'),mid=(c.z0+c.z1)/2,cz=r.outline.z1<L/2-EPSILON?Math.min(mid,w.door.u-w.door.width/2-.96-.12):mid;item(r.id+'-bed','bed',{x0:cx-.68,x1:cx+.68,z0:cz-.96,z1:cz+.96},{height:.53});}
 const bc=bath.clear,bw=bc.x1-bc.x0;
 item('shower','shower',{x0:bc.x0+.035,x1:bc.x1-.035,z0:bc.z0+.025,z1:bc.z0+.85},{height:1.95});
 const toiletX=mirrored?bc.x1-.29:bc.x0+.29,basinX=mirrored?bc.x1-.23:bc.x0+.23;
 item('toilet','toilet',{x0:toiletX-.22,x1:toiletX+.22,z0:bc.z0+1.03,z1:bc.z0+1.69},{height:.78});
 item('basin','basin',{x0:basinX-.21,x1:basinX+.21,z0:bc.z1-.84,z1:bc.z1-.12},{height:.85});
 servicePoints.push({id:'shower',x:(bc.x0+bc.x1)/2,z:bc.z0+.1,y:1.05,hot:true},{id:'toilet',x:toiletX,z:bc.z0+1.15,y:.45,hot:false},{id:'basin',x:basinX,z:bc.z1-.33,y:.83,hot:true});
 const leftRooms=rooms.filter(r=>r.kind==='bedroom'&&r.outline.x0<0),lastLeft=leftRooms.length?Math.max(...leftRooms.map(r=>r.outline.z1)):-L/2;
 const compact=config.layout==='t4-a';
 const kitchenZ=compact?b.z1+.40:Math.max(lastLeft+.24,-3.9,config.kitchen==='u'?b.z1+.24:-Infinity),kitchenX=compact?b.x0+t/2+.02:-W/2+edge+.025;
 const length=compact?1.6:2.4,depth=.6;
 if(config.kitchen!=='none'){
  item('kitchen-main','kitchen',{x0:kitchenX,x1:kitchenX+depth,z0:kitchenZ,z1:kitchenZ+length},{height:.91});
  if(['l','u'].includes(config.kitchen))item('kitchen-return','kitchen-return',{x0:kitchenX+depth,x1:kitchenX+(config.kitchen==='u'?2.5:1.7),z0:kitchenZ,z1:kitchenZ+depth},{height:.91});
  if(config.kitchen==='u')item('kitchen-opposite','kitchen',{x0:kitchenX+1.9,x1:kitchenX+2.5,z0:kitchenZ+depth,z1:kitchenZ+length},{height:.91});
  if(config.kitchen==='island')item('kitchen-island','island',{x0:kitchenX+depth+1,x1:kitchenX+depth+1+.7,z0:Math.max(kitchenZ+.28,b.z1+.94),z1:Math.max(kitchenZ+.28,b.z1+.94)+1.3},{height:.91});
  servicePoints.push({id:'kitchen-sink',x:kitchenX+.3,z:kitchenZ+.3,y:.91,hot:true});
 }
 if(!compact){item('sofa','sofa',{x0:-2.65,x1:-.82,z0:3.78,z1:4.6},{height:.8});item('table','table',{x0:-2.29,x1:-1.15,z0:4.91,z1:5.48},{height:.4});}
 // Cabinet modules use the same openings as the shell; no upper cupboard covers a window.
 const kitchenUpperModules=[],run=furnishings.find(f=>f.id==='kitchen-main');
 if(run){const width=run.z1-run.z0,count=Math.max(2,Math.round(width/.6)),cell=width/count,mid=(run.z0+run.z1)/2;
  for(let i=0;i<count;i++){const u=-width/2+(i+.5)*cell,bounds={x0:run.x0,x1:run.x0+.32,z0:mid-u-cell/2,z1:mid-u+cell/2},blockedBy=[];
   for(const face of perimeter){const sign=Math.sign(face.c),normal=face.axis==='z'?'x':'z',along=face.axis==='z'?'z':'x',a=Math.min(face.c,face.c-sign*.4),b=Math.max(face.c,face.c-sign*.4);
    if(bounds[normal+'1']<=a||bounds[normal+'0']>=b)continue;
    for(const hole of face.holes)if(hole.sill<2.16&&hole.sill+hole.height>1.515&&bounds[along+'0']<hole.u+hole.width/2+.02&&bounds[along+'1']>hole.u-hole.width/2-.02)blockedBy.push(hole.id);
   }
   kitchenUpperModules.push({index:i,u,width:cell-.006,bounds,blockedBy});
  }
 }
 const inner={x0:-W/2+edge,x1:W/2-edge,z0:-L/2+edge,z1:L/2-edge};
 // Union of solid partition footprints clipped to the inner envelope; door passages remain free.
 const footprints=walls.flatMap(w=>(w.door?[[w.a,w.door.u-w.door.width/2],[w.door.u+w.door.width/2,w.b]]:[[w.a,w.b]]).map(([a,b])=>w.axis==='z'?{x0:w.c-t/2,x1:w.c+t/2,z0:a,z1:b}:{x0:a,x1:b,z0:w.c-t/2,z1:w.c+t/2})).map(r=>({x0:Math.max(inner.x0,r.x0),x1:Math.min(inner.x1,r.x1),z0:Math.max(inner.z0,r.z0),z1:Math.min(inner.z1,r.z1)})).filter(r=>r.x1>r.x0&&r.z1>r.z0);
 const wallArea=unionArea(footprints);
 const internalEnvelope=rectArea(inner),estimatedNet=internalEnvelope-wallArea;
 const enclosed=rooms.reduce((s,r)=>s+r.area,0);
 const areas={commercial:72,exterior:W*L,internalEnvelope,partitions:wallArea,estimatedNet,common:Math.max(0,estimatedNet-enclosed),roomTotal:enclosed,status:'estimated',note:'Áreas calculadas com paredes de 100 mm e divisórias de 80 mm assumidas; não são um mapa de áreas certificado.'};
 return {id:template.id,label:template.label,description:template.description,sourceImage:template.image,bedrooms:template.bedrooms,rooms,walls,doors,perimeter,furnishings,kitchenUpperModules,servicePoints,areas,dimensions:{...DIM,porchDepth:projectPorchDepth(config)},terraceOptionSelected:Boolean(selectedOption(config,'terrace')),sourceStatus:'estimated',compact};
}
export function compatibility(state){
 const reasons=[];if(!LAYOUTS.some(l=>l.id===state.layout))return ['Planta desconhecida.'];
 if(state.layout==='t4-a'&&!['linear','none'].includes(state.kitchen))reasons.push('O T4 A só admite a proposta de cozinha linear: a faixa central não comporta uma ilha ou bancada em L.');
 if(['island','u'].includes(state.kitchen)&&['t3-a','t4-b'].includes(state.layout))reasons.push('A ilha ou cozinha em U interfere com a passagem nesta planta. Escolha uma cozinha linear ou em L.');
 return reasons;
}
export function expansionState(value){
 const p=Math.min(1,Math.max(0,Number(value)||0)),smooth=(a,b)=>{const t=Math.min(1,Math.max(0,(p-a)/(b-a)));return t*t*(3-2*t);};
 const wall=smooth(0,WALL_RAISE.wallEnd);
 return {p,wall,angle:Math.PI/2*(1-wall),roofLift:WALL_RAISE.roofClearance*(1-smooth(WALL_RAISE.wallEnd,1)),sourcePhase:'2–3',label:p===0?'Paredes deitadas':p<WALL_RAISE.wallEnd?'Elevação de dentro para fora':p<1?'Paredes verticais · assentamento visual':'Paredes erguidas',uncertain:true};
}

export function unionArea(rectangles){
 const xs=[...new Set(rectangles.flatMap(r=>[r.x0,r.x1]))].sort((a,b)=>a-b);let area=0;
 for(let i=1;i<xs.length;i++){const mid=(xs[i]+xs[i-1])/2,intervals=rectangles.filter(r=>r.x0<mid&&r.x1>mid).map(r=>[r.z0,r.z1]).sort((a,b)=>a[0]-b[0]);let length=0,start=null,end=null;for(const [a,b]of intervals){if(start===null){start=a;end=b;}else if(a<=end)end=Math.max(end,b);else{length+=end-start;start=a;end=b;}}if(start!==null)length+=end-start;area+=(xs[i]-xs[i-1])*length;}return area;
}
