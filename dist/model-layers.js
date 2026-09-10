export const LAYERS=[
 ['supports','Apoios da maquete','Forma representativa; fundação do terreno não documentada.'],
 ['structure','Chassis e perfis','Forma das fotografias; secções e ligações estimadas.'],
 ['floor','Pavimento e suporte','SPC do catálogo; espessura total estimada.'],
 ['exterior','Paredes exteriores','Vãos da planta; alturas e espessuras estimadas.'],
 ['interior','Divisórias e portas interiores','Relações da planta; dimensões não cotadas estimadas.'],
 ['insulation','Isolamento representativo','Composição da variante por confirmar.'],
 ['roof','Cobertura e tecto','Volume representado; composição por confirmar.'],
 ['openings','Janelas e entrada','Vãos da planta; ferragens não cotadas.'],
 ['furniture','Equipamentos e mobiliário','Referências de cozinha/banho; restante mobiliário ilustrativo.'],
 ['cover','Telhado opcional','Variante fotografada, medidas por confirmar.'],
 ['porch','Alpendre opcional','Variante fotografada, medidas por confirmar.']
];

export function classifyLayer(group,material,name,materials){
 let ancestors='';for(let g=group;g;g=g.parent)ancestors+=' '+g.name;
 if(/furniture/.test(ancestors))return 'furniture';
 if(/porch/.test(ancestors))return 'porch';
 if(/cover/.test(ancestors))return 'cover';
 if(/supports/.test(ancestors))return 'supports';
 if(material===materials.insulation)return 'insulation';
 if(/structure/.test(ancestors))return 'structure';
 if(/floor/.test(ancestors))return 'floor';
 if(/roof/.test(ancestors))return 'roof';
 if(/interior/.test(ancestors))return 'interior';
 if(/vidro|aro|montante|soleira|Puxador|Fecho da janela/.test(name))return 'openings';
 return 'exterior';
}

// Layer opacity uses owned clones: glass and a wall may never recolour one another.
export function createLayerController(house){
 const entries=[],clones=new Map();let settings=null;
 house.root.traverse(o=>{if(o.isMesh)entries.push({object:o,material:o.material,visible:o.visible,layer:o.userData.layer||'furniture'});});
 const parents=new Map();house.root.traverse(o=>{if(!o.isMesh)parents.set(o,o.visible);});
 function restore(){for(const e of entries){e.object.material=e.material;e.object.visible=e.visible;}for(const [o,visible]of parents)o.visible=visible;}
 function apply(value){restore();settings=value;if(!value)return;
  for(const [o]of parents)o.visible=true;
  for(const e of entries){const {object,material,layer}=e,item=value[layer]||{visible:true,opacity:1};
   const enabled=(layer!=='cover'||house.root.userData.state.roof)&&(layer!=='porch'||house.root.userData.state.porch);
   object.visible=e.visible&&enabled&&item.visible!==false&&(!value.isolate||value.isolate===layer);
   const opacity=typeof item.opacity==='number'?Math.max(.1,Math.min(1,item.opacity)):1;
   if(opacity<1){const key=layer+'/'+material.uuid;let clone=clones.get(key);if(!clone){clone=material.clone();clone.onBeforeCompile=material.onBeforeCompile;clone.customProgramCacheKey=material.customProgramCacheKey;clones.set(key,clone);}clone.opacity=material.opacity*opacity;clone.transparent=true;clone.depthWrite=false;clone.clippingPlanes=material.clippingPlanes;object.material=clone;}
  }
 }
 return {apply,entries,get settings(){return settings;},dispose(){restore();for(const m of clones.values())m.dispose();clones.clear();}};
}
