import {getLang,onLangChange} from './i18n.js';

const CHAPTERS=['arrival','garden','overview','interior','kitchen','bathroom'];
const COPY={
 pt:{title:'Apresentação da casa',collection:'COLECÇÃO EXPANSÍVEL',home:'Expandível 72',arrival:'Chegada',garden:'Envolvente',overview:'Vista geral',interior:'Interior',kitchen:'Cozinha',bathroom:'Casa de banho',views:'Explorar a casa',play:'Iniciar visita',pause:'Pausar visita',previous:'Vista anterior',next:'Vista seguinte',exit:'Sair da apresentação',images:'Guardar imagens',export:'Imagem 4K',exportHint:'A vista actual · PNG',export8K:'Imagem 8K',export8KHint:'7 680 × 4 320 · alta resolução',exportSet:'Conjunto de 3 vistas',exportSetHint:'Três imagens 4K · ZIP',day:'Luz natural',warm:'Luz de fim de tarde',switchDay:'Mudar para luz natural',switchWarm:'Mudar para luz de fim de tarde',note:'Ambiente ilustrativo. Localização e arranjos exteriores não incluídos.',hint:'Arraste para explorar',playing:'Visita em curso',paused:'Explore ao seu ritmo'},
 en:{title:'Home presentation',collection:'EXPANDABLE COLLECTION',home:'Expandable 72',arrival:'Arrival',garden:'Surroundings',overview:'Overview',interior:'Interior',kitchen:'Kitchen',bathroom:'Bathroom',views:'Explore the home',play:'Start tour',pause:'Pause tour',previous:'Previous view',next:'Next view',exit:'Exit presentation',images:'Save images',export:'4K image',exportHint:'Current view · PNG',export8K:'8K image',export8KHint:'7,680 × 4,320 · high resolution',exportSet:'Set of 3 views',exportSetHint:'Three 4K images · ZIP',day:'Natural light',warm:'Late afternoon light',switchDay:'Switch to natural light',switchWarm:'Switch to late afternoon light',note:'Illustrative setting. Location and landscaping are not included.',hint:'Drag to explore',playing:'Tour in progress',paused:'Explore at your own pace'},
 es:{title:'Presentación de la casa',collection:'COLECCIÓN EXPANSIBLE',home:'Expansible 72',arrival:'Llegada',garden:'Entorno',overview:'Vista general',interior:'Interior',kitchen:'Cocina',bathroom:'Baño',views:'Explorar la casa',play:'Iniciar visita',pause:'Pausar visita',previous:'Vista anterior',next:'Vista siguiente',exit:'Salir de la presentación',images:'Guardar imágenes',export:'Imagen 4K',exportHint:'Vista actual · PNG',export8K:'Imagen 8K',export8KHint:'7.680 × 4.320 · alta resolución',exportSet:'Conjunto de 3 vistas',exportSetHint:'Tres imágenes 4K · ZIP',day:'Luz natural',warm:'Luz de última hora',switchDay:'Cambiar a luz natural',switchWarm:'Cambiar a luz de última hora',note:'Entorno ilustrativo. Ubicación y acondicionamiento exterior no incluidos.',hint:'Arrastre para explorar',playing:'Visita en curso',paused:'Explore a su ritmo'},
 fr:{title:'Présentation de la maison',collection:'COLLECTION EXTENSIBLE',home:'Extensible 72',arrival:'Arrivée',garden:'Environnement',overview:'Vue d’ensemble',interior:'Intérieur',kitchen:'Cuisine',bathroom:'Salle de bains',views:'Explorer la maison',play:'Commencer la visite',pause:'Mettre la visite en pause',previous:'Vue précédente',next:'Vue suivante',exit:'Quitter la présentation',images:'Enregistrer les images',export:'Image 4K',exportHint:'Vue actuelle · PNG',export8K:'Image 8K',export8KHint:'7 680 × 4 320 · haute résolution',exportSet:'Ensemble de 3 vues',exportSetHint:'Trois images 4K · ZIP',day:'Lumière naturelle',warm:'Lumière de fin d’après-midi',switchDay:'Passer à la lumière naturelle',switchWarm:'Passer à la lumière de fin d’après-midi',note:'Cadre illustratif. Emplacement et aménagements extérieurs non inclus.',hint:'Faites glisser pour explorer',playing:'Visite en cours',paused:'Explorez à votre rythme'},
 it:{title:'Presentazione della casa',collection:'COLLEZIONE ESPANDIBILE',home:'Espandibile 72',arrival:'Arrivo',garden:'Dintorni',overview:'Vista generale',interior:'Interni',kitchen:'Cucina',bathroom:'Bagno',views:'Esplorare la casa',play:'Avviare la visita',pause:'Mettere in pausa la visita',previous:'Vista precedente',next:'Vista successiva',exit:'Uscire dalla presentazione',images:'Salvare le immagini',export:'Immagine 4K',exportHint:'Vista attuale · PNG',export8K:'Immagine 8K',export8KHint:'7.680 × 4.320 · alta risoluzione',exportSet:'Raccolta di 3 viste',exportSetHint:'Tre immagini 4K · ZIP',day:'Luce naturale',warm:'Luce del tardo pomeriggio',switchDay:'Passare alla luce naturale',switchWarm:'Passare alla luce del tardo pomeriggio',note:'Scenario illustrativo. Ubicazione e sistemazioni esterne non incluse.',hint:'Trascini per esplorare',playing:'Visita in corso',paused:'Esplori al suo ritmo'}
};
const ICONS={
 play:'<path d="m9 5 10 7-10 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',
 previous:'<path d="m14 6-6 6 6 6"/>',next:'<path d="m10 6 6 6-6 6"/>',
 exit:'<path d="m6 6 12 12M18 6 6 18"/>',
 images:'<path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
 sunset:'<path d="M3 17h18M5 21h14M6 17a6 6 0 0 1 12 0M12 3v3M3 8l2 2m16-2-2 2"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
const FOCUSABLE='button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]:not([tabindex="-1"])';

/** A presentation shell around the existing renderer; visual state belongs to the caller. */
export function createPresentationMode({workspace,viewport,getStatus,onEnter=()=>{},onExit=()=>{},onView=()=>{},onPlay=()=>{},onPause=()=>{},onExport=()=>{},onExport8K=()=>{},onExportSet=()=>{},onMood=()=>{},isBusy=()=>false}){
 const root=document.createElement('div');
 root.className='presentation-mode';root.dataset.i18n='off';root.hidden=true;
 root.innerHTML=`<header class="presentation-mode-header"><div class="presentation-mode-brand"><span class="presentation-mode-monogram" aria-hidden="true">GV<span>✦</span></span><div><span class="presentation-mode-wordmark">GREEN VILLAGE</span><strong data-copy="home"></strong><span class="presentation-mode-reference"></span></div></div><div class="presentation-mode-actions"><button type="button" class="presentation-mode-light" data-presentation-action="mood"><span class="presentation-mode-light-icon">${icon('sun')}</span><span class="presentation-mode-light-label"></span></button><details class="presentation-mode-downloads"><summary>${icon('images')}<span class="presentation-mode-sr" data-copy="images"></span></summary><div class="presentation-mode-download-menu"><button type="button" data-presentation-action="export"><strong data-copy="export"></strong><small data-copy="exportHint"></small></button><button type="button" data-presentation-action="export-8k"><strong data-copy="export8K"></strong><small data-copy="export8KHint"></small></button><button type="button" data-presentation-action="export-set"><strong data-copy="exportSet"></strong><small data-copy="exportSetHint"></small></button></div></details><button type="button" class="presentation-mode-exit" data-presentation-action="exit">${icon('exit')}</button></div></header><div class="presentation-mode-caption"><span data-copy="collection"></span><h2 class="presentation-mode-chapter-title"></h2><p data-copy="hint"></p></div><div class="presentation-mode-bottom"><div class="presentation-mode-dock"><div class="presentation-mode-playback"><button type="button" class="presentation-mode-play" data-presentation-action="play">${icon('play')}</button><div class="presentation-mode-progress"><span class="presentation-mode-count"></span><span class="presentation-mode-state"></span></div><button type="button" data-presentation-action="previous">${icon('previous')}</button><button type="button" data-presentation-action="next">${icon('next')}</button></div><nav class="presentation-mode-views">${CHAPTERS.map((chapter,index)=>`<button type="button" data-presentation-view="${chapter}"><span class="presentation-mode-view-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span data-copy="${chapter}"></span></button>`).join('')}</nav></div><p class="presentation-mode-note" data-copy="note"></p></div>`;
 workspace.append(root);
 const select=selector=>root.querySelector(selector);
 const elements={
  play:select('[data-presentation-action="play"]'),mood:select('[data-presentation-action="mood"]'),
  previous:select('[data-presentation-action="previous"]'),next:select('[data-presentation-action="next"]'),
  exit:select('[data-presentation-action="exit"]'),downloads:select('details'),summary:select('summary'),
  title:select('.presentation-mode-chapter-title'),count:select('.presentation-mode-count'),state:select('.presentation-mode-state'),
  reference:select('.presentation-mode-reference'),views:select('.presentation-mode-views'),
  moodIcon:select('.presentation-mode-light-icon'),moodLabel:select('.presentation-mode-light-label')
 };
 let active=false,previousFocus=null,scrollPosition=null,restoreAttributes=null,restoreOverflow=null;
 let lastPlaying=null,lastMood=null,lastChapter=null,lastLanguage=null;
 const inertStates=new Map();
 const available=status=>CHAPTERS.filter(chapter=>chapter!=='kitchen'||status.hasKitchen!==false);
 function setLabel(element,label){element.setAttribute('aria-label',label);element.title=label;}
 function update(){
  const status=getStatus()||{},language=getLang(),t=COPY[language]||COPY.pt;
  const chapters=available(status),chapter=chapters.includes(status.chapter)?status.chapter:chapters[0];
  const playing=Boolean(status.playing),warm=status.mood==='late-afternoon',busy=Boolean(isBusy());
  if(lastLanguage!==language){
   for(const element of root.querySelectorAll('[data-copy]'))element.textContent=t[element.dataset.copy];
   elements.views.setAttribute('aria-label',t.views);
   setLabel(elements.previous,t.previous);setLabel(elements.next,t.next);setLabel(elements.exit,t.exit);setLabel(elements.summary,t.images);
   if(active)workspace.setAttribute('aria-label',t.title);
  }
  if(lastPlaying!==playing||lastLanguage!==language){
   elements.play.innerHTML=icon(playing?'pause':'play');setLabel(elements.play,playing?t.pause:t.play);
   elements.play.setAttribute('aria-pressed',String(playing));elements.state.textContent=playing?t.playing:t.paused;
  }
  if(lastMood!==warm||lastLanguage!==language){
   elements.moodIcon.innerHTML=icon(warm?'sunset':'sun');elements.moodLabel.textContent=warm?t.warm:t.day;
   elements.mood.setAttribute('aria-pressed',String(warm));setLabel(elements.mood,warm?t.switchDay:t.switchWarm);
  }
  elements.title.textContent=t[chapter];elements.count.textContent=`${String(chapters.indexOf(chapter)+1).padStart(2,'0')} / ${String(chapters.length).padStart(2,'0')}`;
  elements.reference.textContent=typeof status.reference==='string'?status.reference:'';
  elements.reference.hidden=!elements.reference.textContent;
  for(const button of root.querySelectorAll('[data-presentation-view]')){
   const id=button.dataset.presentationView,selected=id===chapter,visible=chapters.includes(id);
   if(!visible&&document.activeElement===button)elements.play.focus({preventScroll:true});
   button.hidden=!visible;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-current',selected);
   button.querySelector('.presentation-mode-view-number').textContent=String(chapters.indexOf(id)+1).padStart(2,'0');
  }
  for(const button of root.querySelectorAll('button'))button.disabled=busy;
  elements.summary.setAttribute('aria-disabled',String(busy));root.setAttribute('aria-busy',String(busy));
  if(active&&lastChapter!==chapter){
   const button=select(`[data-presentation-view="${chapter}"]`),nav=elements.views;
   if(button.offsetLeft<nav.scrollLeft)nav.scrollLeft=button.offsetLeft;
   else if(button.offsetLeft+button.offsetWidth>nav.scrollLeft+nav.clientWidth)nav.scrollLeft=button.offsetLeft+button.offsetWidth-nav.clientWidth;
  }
  lastPlaying=playing;lastMood=warm;lastChapter=chapter;lastLanguage=language;
 }
 function step(direction){
  const status=getStatus()||{},chapters=available(status),current=Math.max(0,chapters.indexOf(status.chapter));
  onView(chapters[(current+direction+chapters.length)%chapters.length]);update();
 }
 function inertBranch(element){
  if(!(element instanceof HTMLElement)||element.matches('dialog,script,style,link,template'))return;
  // A dialog may be opened by an export while presentation is active.
  if(element.querySelector('dialog')){for(const child of element.children)inertBranch(child);return;}
  inertStates.set(element,element.inert);element.inert=true;
 }
 function isolate(){
  for(let branch=workspace;branch.parentElement&&branch!==document.body;branch=branch.parentElement){
   for(const sibling of branch.parentElement.children)if(sibling!==branch)inertBranch(sibling);
  }
 }
 function restore(){
  for(const [element,inert] of inertStates)element.inert=inert;
  inertStates.clear();
  for(const [name,value] of Object.entries(restoreAttributes||{})){
   if(value===null)workspace.removeAttribute(name);else workspace.setAttribute(name,value);
  }
  if(restoreOverflow){document.body.style.overflow=restoreOverflow.body;document.documentElement.style.overflow=restoreOverflow.html;}
  root.hidden=true;elements.downloads.open=false;
  if(scrollPosition)window.scrollTo(scrollPosition.x,scrollPosition.y);
  if(previousFocus?.isConnected&&!previousFocus.closest('[inert]'))previousFocus.focus({preventScroll:true});
  previousFocus=null;scrollPosition=null;restoreAttributes=null;restoreOverflow=null;
 }
 function open(){
  if(active||isBusy())return false;
  previousFocus=document.activeElement;scrollPosition={x:window.scrollX,y:window.scrollY};
  restoreAttributes=Object.fromEntries(['role','aria-modal','aria-label','tabindex','data-presenting'].map(name=>[name,workspace.getAttribute(name)]));
  restoreOverflow={body:document.body.style.overflow,html:document.documentElement.style.overflow};
  try{if(onEnter()===false){restore();return false;}}catch(error){restore();throw error;}
  active=true;workspace.dataset.presenting='true';workspace.setAttribute('role','dialog');workspace.setAttribute('aria-modal','true');workspace.setAttribute('aria-label',(COPY[getLang()]||COPY.pt).title);workspace.setAttribute('tabindex','-1');
  document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';isolate();root.hidden=false;
  lastChapter=null;update();elements.exit.focus({preventScroll:true});
  document.addEventListener('keydown',onKeyDown,true);document.addEventListener('pointerdown',onOutsideDownload,true);
  return true;
 }
 function close(){
  if(!active||isBusy())return false;
  active=false;document.removeEventListener('keydown',onKeyDown,true);document.removeEventListener('pointerdown',onOutsideDownload,true);
  restore();onExit();
  return true;
 }
 function onOutsideDownload(event){if(!elements.downloads.contains(event.target))elements.downloads.open=false;}
 function onKeyDown(event){
  if(!active||document.querySelector('dialog[open]'))return;
  if(event.key==='Escape'){
   event.preventDefault();event.stopPropagation();
   close();return;
  }
  if(event.key==='Tab'){
   const candidates=[...workspace.querySelectorAll(FOCUSABLE)].filter(element=>!element.closest('[hidden],[inert]')&&element.getClientRects().length>0);
   const first=candidates[0]||workspace,last=candidates.at(-1)||workspace,current=document.activeElement;
   if(event.shiftKey&&(current===first||!candidates.includes(current))){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(current===last||!candidates.includes(current))){event.preventDefault();first.focus();}
   return;
  }
  if(isBusy()||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!workspace.contains(event.target)||event.target.closest('input,textarea,select,[contenteditable="true"],[role="slider"]'))return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();step(event.key==='ArrowLeft'?-1:1);}
 }
 root.addEventListener('click',event=>{
  if(!active||isBusy()){event.preventDefault();return;}
  const chapter=event.target.closest('[data-presentation-view]');
  if(chapter){onView(chapter.dataset.presentationView);update();return;}
  const action=event.target.closest('[data-presentation-action]')?.dataset.presentationAction;
  if(!action)return;
  if(action==='exit'){close();return;}
  if(action==='previous'||action==='next'){step(action==='previous'?-1:1);return;}
  if(action==='play'){if(getStatus()?.playing)onPause();else onPlay();}
  if(action==='mood')onMood(getStatus()?.mood==='late-afternoon'?'daylight':'late-afternoon');
  if(action==='export'||action==='export-set'||action==='export-8k'){
   elements.downloads.open=false;elements.summary.focus({preventScroll:true});
   if(action==='export')onExport();else if(action==='export-8k')onExport8K();else onExportSet();
  }
  update();
 });
 onLangChange(update);update();
 return{open,close,update,get active(){return active;}};
}
