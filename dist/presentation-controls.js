import {getLang,onLangChange} from './i18n.js';

const COPY={
 pt:{title:'A casa no seu lugar.',sub:'Largo de aldeia · inspiração região do Porto',village:'Aldeia · Porto',environment:'Cenário',garden:'Jardim',studio:'Estúdio',light:'Luz',day:'Natural',warm:'Quente',camera:'Enquadramento',free:'Vista livre',arrival:'Chegada',gardenView:'Envolvente',overview:'Vista geral',present:'Apresentar a minha casa',export:'Imagem 4K',loading:'A preparar o ambiente…',failed:'Cenário incompleto. Pode continuar com o fundo de estúdio.',technical:'Fundo de estúdio para leitura dos detalhes.',note:'Ambiente ilustrativo; localização e arranjos exteriores não incluídos.'},
 en:{title:'Your home, in its setting.',sub:'Village square · inspired by the Porto region',village:'Village · Porto',environment:'Setting',garden:'Garden',studio:'Studio',light:'Light',day:'Natural',warm:'Warm',camera:'View',free:'Free view',arrival:'Arrival',gardenView:'Surroundings',overview:'Overview',present:'Present my home',export:'4K image',loading:'Preparing the setting…',failed:'Setting incomplete. You can continue with the studio background.',technical:'Studio background for a clear view of the details.',note:'Illustrative setting; location and landscaping are not included.'},
 es:{title:'Su casa, en su entorno.',sub:'Plaza de pueblo · inspirada en la región de Oporto',village:'Pueblo · Oporto',environment:'Entorno',garden:'Jardín',studio:'Estudio',light:'Luz',day:'Natural',warm:'Cálida',camera:'Vista',free:'Vista libre',arrival:'Llegada',gardenView:'Entorno',overview:'Vista general',present:'Presentar mi casa',export:'Imagen 4K',loading:'Preparando el entorno…',failed:'Entorno incompleto. Puede continuar con el fondo de estudio.',technical:'Fondo de estudio para ver los detalles con claridad.',note:'Entorno ilustrativo; ubicación y acondicionamiento exterior no incluidos.'}
};

/** Presentation preferences are independent of the customer's priced configuration. */
export function createPresentationControls({anchor,getStatus,onEnvironment,onMood,onCamera,onExport,onExport8K,onPresent,isBusy=()=>false}){
 const root=document.createElement('section');root.className='presentation-controls';root.dataset.i18n='off';root.setAttribute('aria-label','Presentation');anchor.before(root);
 let previous='';
 function render(){
  const t=COPY[getLang()]||COPY.pt;
  root.innerHTML=`<div class="presentation-heading"><div><strong>${t.title}</strong><span>${t.sub}</span></div><div class="presentation-actions"><button type="button" class="presentation-start">${t.present} <span aria-hidden="true">↗</span></button><button type="button" class="presentation-export">${t.export} <span aria-hidden="true">↓</span></button><button type="button" class="presentation-export-hd">8K <span aria-hidden="true">↓</span></button></div></div><div class="presentation-fields"><label>${t.environment}<select data-presentation="environment"><option value="village">${t.village}</option><option value="garden">${t.garden}</option><option value="studio">${t.studio}</option></select></label><label>${t.light}<select data-presentation="mood"><option value="daylight">${t.day}</option><option value="late-afternoon">${t.warm}</option></select></label><label>${t.camera}<select data-presentation="camera"><option value="custom" disabled>${t.free}</option><option value="arrival">${t.arrival}</option><option value="garden">${t.gardenView}</option><option value="overview">${t.overview}</option></select></label></div><p class="presentation-note">${t.note}</p><p class="presentation-status" role="status" hidden></p>`;
  root.querySelector('[data-presentation="environment"]').onchange=e=>{if(!isBusy())onEnvironment(e.target.value);update();};
  root.querySelector('[data-presentation="mood"]').onchange=e=>{if(!isBusy())onMood(e.target.value);update();};
  root.querySelector('[data-presentation="camera"]').onchange=e=>{if(!isBusy())onCamera(e.target.value);update();};
  root.querySelector('.presentation-start').onclick=()=>{if(!isBusy())onPresent();};
  root.querySelector('.presentation-export').onclick=()=>{if(!isBusy())onExport();};
  root.querySelector('.presentation-export-hd').onclick=()=>{if(!isBusy())onExport8K();};
  previous='';update();
 }
 function update(){
  const s=getStatus();if(!s)return;const signature=JSON.stringify(s);if(signature===previous)return;previous=signature;
  const t=COPY[getLang()]||COPY.pt;
  root.querySelector('[data-presentation="environment"]').value=s.environment;
  root.querySelector('[data-presentation="mood"]').value=s.mood;
  root.querySelector('[data-presentation="mood"]').disabled=s.active==='studio';
  root.querySelector('[data-presentation="camera"]').value=['arrival','garden','overview'].includes(s.camera)?s.camera:'custom';
  const status=root.querySelector('.presentation-status');status.textContent=s.failures?.length?t.failed:s.active==='studio'&&s.environment!=='studio'?t.technical:!s.ready?t.loading:'';status.hidden=!status.textContent;
  root.dataset.active=s.active;anchor.dataset.environment=s.active;
 }
 onLangChange(render);render();return{root,update};
}
