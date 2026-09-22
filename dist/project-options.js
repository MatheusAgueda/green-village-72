import {DATA} from './data.js';

export const CATALOGUE_EDITION = DATA.edition.split('-').reverse().join('/');
export const OPTION_GROUPS = {doors:'Portas',windows:'Janelas',walls:'Paredes e isolamento',roof:'Telhado',exterior:'Terraço',kitchen:'Cozinha',bathroom:'Casa de banho'};
const referencePhotos={
 'exterior-3d':{photo:'assets/catalogue/swatches/exterior-3d-textures-tijolo-cinza.jpg',photoCaption:'Amostra do painel 3D · catálogo p. 7',photoPage:7},
 'kitchen-upper':{photo:'assets/catalogue/reference/kitchen-08.jpg',photoCaption:'Ambiente do catálogo p. 16 com armários superiores. Não identifica o conjunto abrangido pelo PVP actual.',photoPage:16},
 'bathroom-separated':{photo:'assets/catalogue/reference/bathroom-13.jpg',photoCaption:'Ambiente do catálogo p. 18. Fotografia específica do adicional de 3 m por confirmar.',photoPage:18}
};
export const OPTIONAL_ITEMS = DATA.options.map(item => ({
  ...item,
  photo: item.image ? 'assets/catalogue/'+item.image : null,
  photoCaption:'Fotografia do artigo · catálogo p. '+item.page, photoPage:item.page,
  ...referencePhotos[item.id],
  priceCents: item.priceEurVatIncluded == null ? null : Math.round(item.priceEurVatIncluded*100),
  scope: ['rockwool','eps'].includes(item.id) ? 'Paredes e tecto · unidade 40FT' : item.id==='gable-roof' ? 'Sistema para casa completa · 40FT' : item.id==='terrace' ? 'Terraço e cobertura · profundidade de 3 m' : 'Âmbito de facturação a confirmar',
  maxQuantity: (['doors','windows'].includes(item.section)&&item.id!=='glass-front') ? 12 : 1,
  variants: item.id==='interior-door' ? [['wood','Madeira'],['aluminium','Alumínio'],['sliding','De correr']] : [],
  model: item.section==='windows' || item.section==='doors' ? 'opening' : ['gable-roof','terrace','kitchen-upper','bathroom-separated','exterior-3d'].includes(item.id) ? 'geometry' : 'specification'
}));
export const itemById = id => OPTIONAL_ITEMS.find(item=>item.id===id);
export const money = cents => cents==null?'Sob consulta':new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(cents/100);
export function validateOptionSelections(value=[]){
  if(!Array.isArray(value)||value.length>OPTIONAL_ITEMS.length)throw new Error('Lista de adicionais inválida.');
  const ids=new Set(),slots=new Set();
  const result=value.map(raw=>{
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Adicional inválido.');
    const item=itemById(raw.id);
    if(!item||ids.has(raw.id))throw new Error('Artigo desconhecido ou repetido.');
    ids.add(raw.id);
    if(!Number.isInteger(raw.quantity)||raw.quantity<1||raw.quantity>item.maxQuantity)throw new Error('Quantidade inválida: '+item.label+'.');
    const variant=raw.variant??(item.variants[0]?.[0]||'');
    if(typeof variant!=='string'||(item.variants.length?!item.variants.some(v=>v[0]===variant):variant!==''))throw new Error('Variante inválida: '+item.label+'.');
    const targets=raw.targets??[];
    if(!Array.isArray(targets)||targets.length>raw.quantity||new Set(targets).size!==targets.length)throw new Error('A quantidade deve abranger todos os locais seleccionados.');
    for(const target of targets){
      if(typeof target!=='string'||! /^(entry|front-window--?1|rear-window--?1|bath-window|side--?1-\d|bedroom-\d-door|bath-door)$/.test(target))throw new Error('Local de aplicação inválido.');
      const interior=/^(bedroom-|bath-door)/.test(target),window=target!=='entry'&&!interior;
      if(item.id==='glass-front'||(item.id==='interior-door'?!interior:item.section==='windows'?!window:item.id==='side-glass-door'?!target.startsWith('side-'):item.section==='doors'?target!=='entry':true))throw new Error('Artigo incompatível com o local escolhido.');
      const key=(item.id==='window-mosquito'?'screen:':'opening:')+target;
      if(slots.has(key))throw new Error('Só pode existir um tipo de porta ou janela por vão.');
      slots.add(key);
    }
    return {id:item.id,quantity:raw.quantity,variant,targets:[...targets].sort()};
  }).sort((a,b)=>a.id.localeCompare(b.id));
  if(ids.has('rockwool')&&ids.has('eps'))throw new Error('Escolha um isolamento de parede e tecto para esta proposta.');
  if(ids.has('glass-front')&&result.some(s=>s.id!=='glass-front'&&s.id!=='window-mosquito'&&s.targets.some(t=>t==='entry'||t.startsWith('front-window'))))throw new Error('A frente envidraçada substitui as escolhas dos vãos da frente.');
  const convertedDoors=new Set(result.find(s=>s.id==='side-glass-door')?.targets||[]);
  if(result.find(s=>s.id==='window-mosquito')?.targets.some(target=>convertedDoors.has(target)))throw new Error('O mosquiteiro para janela não pode ser aplicado ao vão convertido em porta. Escolha uma janela ou deixe o local por atribuir.');
  return result;
}
export const selectedOption=(state,id)=>(state.optionSelections||[]).find(s=>s.id===id);
export function setOptionSelection(state,id,patch){
  const item=itemById(id);if(!item)throw new Error('Artigo desconhecido.');
  let selections=(state.optionSelections||[]).filter(s=>s.id!==id).map(s=>({...s,targets:[...s.targets]}));
  if(patch!==null){
    if(id==='rockwool'||id==='eps')selections=selections.filter(s=>!['rockwool','eps'].includes(s.id));
    const next={id,quantity:1,variant:item.variants[0]?.[0]||'',targets:[],...selectedOption(state,id),...patch};
    next.quantity=Math.max(next.quantity,next.targets.length);
    // A screen remains in the order when its former window is replaced by a door.
    if(id==='side-glass-door')for(const other of selections)if(other.id==='window-mosquito')other.targets=other.targets.filter(target=>!next.targets.includes(target));
    for(const other of selections)if(id!=='window-mosquito'&&other.id!=='window-mosquito'){const before=other.targets.length;other.targets=other.targets.filter(t=>!next.targets.includes(t));other.quantity-=before-other.targets.length;}
    selections=selections.filter(s=>s.quantity>0);
    if(id==='glass-front'){for(const other of selections)if(other.id!=='window-mosquito'){const before=other.targets.length;other.targets=other.targets.filter(t=>t!=='entry'&&!t.startsWith('front-window'));other.quantity-=before-other.targets.length;}selections=selections.filter(s=>s.quantity>0);}
    if(next.targets.some(t=>t==='entry'||t.startsWith('front-window'))&&id!=='glass-front'&&id!=='window-mosquito')selections=selections.filter(s=>s.id!=='glass-front');
    selections.push(next);
  }
  const change={optionSelections:validateOptionSelections(selections)};
  if(id==='gable-roof')change.roof=patch!==null;
  if(id==='terrace')change.porch=patch!==null;
  if(id==='exterior-3d'){const is3d=/^exterior-3d-(textures|gm)-/.test(state.exteriorId);if(patch!==null&&!is3d)change.exteriorId=DATA.swatches['exterior-3d-textures'][0].id;else if(patch===null&&is3d)change.exteriorId=DATA.swatches['exterior-standard'].find(x=>/Branco Glacial/i.test(x.label)).id;}
  return change;
}
export function optionTargetLabel(id){
  if(id==='entry')return 'Porta de entrada';
  if(id==='bath-window')return 'Janela da casa de banho';
  if(id==='bath-door')return 'Porta da casa de banho';
  if(id.startsWith('bedroom-'))return 'Porta do quarto '+Number(id.split('-')[1]);
  const side=id.includes('--1')?'esquerda':'direita';
  if(id.startsWith('front-window'))return 'Janela frontal '+side;
  if(id.startsWith('rear-window'))return 'Janela traseira '+side;
  return 'Janela lateral '+side+' · '+(Number(id.split('-').at(-1))+1);
}
export function catalogueEstimate(state){
  const lines=validateOptionSelections(state.optionSelections).map(s=>{
    const item=itemById(s.id);
    const locations=s.targets.map(target=>{const label=optionTargetLabel(target);return s.id==='side-glass-door'?label.replace(/^Janela lateral /,'Porta lateral '):label;});
    return {...s,item,unitCents:item.priceCents,totalCents:item.priceCents==null?null:item.priceCents*s.quantity,locations,unitConfirmed:['rockwool','eps','gable-roof','terrace'].includes(s.id)};
  });
  return {currency:'EUR',vatIncluded:true,vatRate:23,edition:CATALOGUE_EDITION,lines,
    knownSubtotalCents:lines.reduce((sum,line)=>sum+(line.totalCents??0),0),
    pending:lines.filter(line=>line.totalCents==null),
    unassigned:lines.filter(line=>line.item.model==='opening'&&line.id!=='glass-front'&&line.targets.length<line.quantity),
    unitPending:lines.filter(line=>!line.unitConfirmed),
    basePriceCents:null,complete:false};
}
export function availableOptionTargets(item,plan){
  if(item.id==='glass-front')return [];
  if(item.id==='interior-door')return plan.doors.map(d=>({id:d.id,label:optionTargetLabel(d.id)}));
  if(item.section==='windows')return plan.perimeter.flatMap(f=>f.holes).filter(h=>h.id!=='entry'&&(item.id!=='window-mosquito'||h.kind==='window')).map(h=>({id:h.id,label:optionTargetLabel(h.id)}));
  if(item.section==='doors')return plan.perimeter.flatMap(f=>f.holes).filter(h=>item.id==='side-glass-door'?h.id.startsWith('side-'):h.id==='entry').map(h=>({id:h.id,label:optionTargetLabel(h.id)}));
  return [];
}
// Customer-requested replacements use existing wall assemblies, preserving their hinges.
// Unspecified dimensions stay at the illustrative opening dimensions; they are not source facts.
export function applyOpeningOptions(perimeter,doors,state){
  const selections=state.optionSelections||[];
  for(const face of perimeter)for(const h of face.holes){
    const choice=selections.find(s=>s.id!=='window-mosquito'&&s.targets.includes(h.id));
    if(choice){h.optionId=choice.id;h.optionVariant=choice.variant;h.proposed=true;
      if(choice.id==='window-930'){h.width=.93;h.height=.93;h.sill=Math.min(h.sill,1.5);}
      if(choice.id==='window-panoramic'){h.width=.6;h.height=1.9;h.sill=.15;}
      if(choice.id==='side-glass-door'){h.kind='door';h.sill=0;h.height=2.15;}
    }
    if(selectedOption(state,'glass-front')&&face.axis==='x'&&face.c>0){h.optionId='glass-front';h.height=2.15;h.sill=0;h.proposed=true;if(h.kind==='window')h.width=1.70;}
    h.mosquito=Boolean(selectedOption(state,'window-mosquito')?.targets.includes(h.id));
  }
  for(const door of doors){const choice=selectedOption(state,'interior-door');if(choice?.targets.includes(door.id)){door.optionId=choice.id;door.optionVariant=choice.variant;}}
}
export const projectPorchDepth=state=>selectedOption(state,'terrace')?3:1.95;

export const PROJECT_STORAGE_KEY='green-village-72/client-project-v1';
export function emptyClientProject(){const d=new Date(),date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');return {schemaVersion:1,clientName:'',projectName:'',projectDate:date,location:'',contact:'',kitchenStandard:'',bathroomStandard:'',adaptations:'',notes:''};}
export function validateClientProject(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.schemaVersion!==1)throw new Error('Dados de cliente inválidos.');
  const result={schemaVersion:1};
  for(const key of ['clientName','projectName','projectDate','location','contact','kitchenStandard','bathroomStandard','adaptations','notes']){
    const v=value[key]??'';const limit=['kitchenStandard','bathroomStandard','adaptations','notes'].includes(key)?2400:160;
    if(typeof v!=='string'||v.length>limit||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw new Error('Campo do projecto inválido: '+key+'.');result[key]=v.trim();
  }
  if(!/^\d{4}-\d{2}-\d{2}$/.test(result.projectDate)||!Number.isFinite(Date.parse(result.projectDate+'T12:00:00Z'))||new Date(result.projectDate+'T12:00:00Z').toISOString().slice(0,10)!==result.projectDate)throw new Error('Data do projecto inválida.');
  return result;
}
