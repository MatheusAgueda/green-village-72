import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {createStage} from './stage.js';
import {makeHouse} from './model.js';
import {createMaterialLibrary} from './material-library.js';
import {VISUAL_DEFAULT,validateConfiguration} from './configuration.js';
import {PROCESS_STEPS,PROCESS_DURATION,PROCESS_REVISION,processPose} from './expansion-process.js';

// A separate presentation scene. Configuration enters by copy; nothing writes back.
export function createExpansionViewer(root,{getConfiguration,onOpenHouse,onError=()=>{}}){
 const find=selector=>root.querySelector(selector),viewport=find('[data-expansion-viewport]');
 const range=find('[data-expansion-range]'),play=find('[data-expansion-play]');
 const loading=find('[data-expansion-loading]'),note=find('[data-expansion-note]');
 let stage=null,controls=null,house=null,lib=null,active=false,lost=false,failed=false,scheduled=false,materialGeneration=0;
 let progress=0,playing=false,started=0,signature='',lastWidth=0,lastHeight=0,disposed=false;
 const bounds=new THREE.Box3(new THREE.Vector3(-3.5,-.38,-6.4),new THREE.Vector3(3.5,3.1,6.4));
 find('[data-expansion-steps]').innerHTML=PROCESS_STEPS.map((step,index)=>`<button data-expansion-step="${index}" aria-pressed="${index===0}"><span>${String(index+1).padStart(2,'0')}</span><strong>${step.title}</strong><small>${step.subtitle}</small></button>`).join('');
 function requestRender(){if(disposed||scheduled||!active||lost||!stage||document.hidden)return;scheduled=true;requestAnimationFrame(render);}
 function render(time){scheduled=false;if(disposed||!active||lost||!stage||document.hidden)return;const moved=controls.update();if(playing){setProgress(Math.min(1,(time-started)/PROCESS_DURATION));if(progress>=1)pause();}stage.render();if(playing||moved)requestRender();}
 function updateUI(){
  const pose=processPose(progress),step=PROCESS_STEPS[pose.step];
  range.value=String(progress);range.setAttribute('aria-valuetext',`Etapa ${pose.step+1} de 4 · ${pose.motion} · ${Math.round(progress*100)}%`);
  find('[data-expansion-title]').textContent=pose.motion;
  find('[data-expansion-value]').textContent=Math.round(progress*100)+'%';
  if(note.textContent!==step.note)note.textContent=step.note;
  for(const button of root.querySelectorAll('[data-expansion-step]'))button.setAttribute('aria-pressed',String(Number(button.dataset.expansionStep)===pose.step));
  play.textContent=playing?'Pausar Ⅱ':'Reproduzir ▷';play.setAttribute('aria-pressed',String(playing));
  play.setAttribute('aria-label',playing?'Pausar sequência de expansão':'Reproduzir as quatro etapas');
  root.dataset.progress=String(progress);root.dataset.playing=String(playing);
 }
 function setProgress(value){progress=processPose(value).p;house?.updateProcess(progress);updateUI();requestRender();}
 function pause(){playing=false;updateUI();}
 function fit(){if(!stage)return;controls.target.copy(stage.preset('perspective',bounds));controls.object=stage.camera;controls.update();requestRender();}
 function resize(){if(!active||!stage)return;const {width,height}=viewport.getBoundingClientRect();if(width<1||height<1)return;if(width!==lastWidth||height!==lastHeight){lastWidth=width;lastHeight=height;stage.resize(width,height);const direction=stage.camera.position.clone().sub(controls.target);controls.target.copy(stage.fitBox(bounds,direction));controls.update();}requestRender();}
 function zoom(factor){if(!stage||lost)return;const offset=stage.camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));stage.camera.position.copy(controls.target).add(offset);controls.update();requestRender();}
 function release(){materialGeneration++;controls?.dispose();house?.dispose();lib?.dispose();if(stage){stage.renderer.domElement.remove();stage.dispose();}stage=null;controls=null;house=null;lib=null;signature='';lastWidth=lastHeight=0;}
 function fail(message){failed=true;pause();loading.hidden=false;find('[data-expansion-error]').textContent=message;find('[data-expansion-retry]').hidden=false;root.dataset.ready='false';onError(message);}
 function initialise(){
  if(stage||disposed)return;
  try{
   const size=viewport.getBoundingClientRect();stage=createStage({width:Math.max(1,size.width),height:Math.max(1,size.height),pixelRatio:devicePixelRatio});
   viewport.appendChild(stage.renderer.domElement);stage.renderer.domElement.setAttribute('aria-hidden','true');
   stage.renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;fail('A visualização da expansão foi interrompida. As escolhas da sua casa estão preservadas.');});
   stage.renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;retry();});
   controls=new OrbitControls(stage.camera,stage.renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.095;controls.minDistance=5;controls.maxDistance=48;controls.maxPolarAngle=Math.PI*.485;controls.maxTargetRadius=3.2;
   controls.addEventListener('change',requestRender);
   const generation=++materialGeneration;
   lib=createMaterialLibrary(()=>{if(disposed||generation!==materialGeneration)return;requestRender();const failures=lib?.stats().failures.length||0;find('[data-expansion-materials]').textContent=failures?'Uma textura não carregou. Use Tentar novamente.':'';find('[data-expansion-retry]').hidden=!(failures||lost||failed);});
   syncConfiguration();stage.setView('expansion');fit();resize();loading.hidden=true;failed=false;find('[data-expansion-retry]').hidden=!(lib.stats().failures.length||lost);root.dataset.ready='true';
  }catch(error){release();fail('Não foi possível carregar a expansão 3D. Pode continuar a personalizar a casa.');}
 }
 function syncConfiguration(){
  if(!stage)return;
  const configuration=validateConfiguration(JSON.parse(JSON.stringify(getConfiguration()))),next=JSON.stringify(configuration);
  if(next===signature)return;
  const model=makeHouse({...configuration,...VISUAL_DEFAULT,view:'expansion',wallsVisible:true,roofVisible:true,furnitureVisible:false,doorsOpen:false},lib);
  if(house){stage.scene.remove(house.root);house.dispose();}house=model;stage.scene.add(house.root);stage.lighting(configuration.lighting);signature=next;house.updateProcess(progress);
 }
 function activate(value){active=Boolean(value);if(!active){pause();return;}try{initialise();syncConfiguration();resize();requestRender();}catch(error){fail('Não foi possível actualizar a demonstração. Tente novamente.');}}
 function retry(){pause();release();lost=false;initialise();requestRender();}
 function togglePlay(){if(playing){pause();return;}if(!active||lost||!house)return;if(progress>=1)setProgress(0);playing=true;started=performance.now()-progress*PROCESS_DURATION;updateUI();requestRender();}
 function click(event){const button=event.target.closest('button');if(!button||!root.contains(button))return;
  if(button.dataset.expansionStep!==undefined){pause();setProgress(PROCESS_STEPS[Number(button.dataset.expansionStep)].position);}
  if(button.hasAttribute('data-expansion-play'))togglePlay();
  if(button.hasAttribute('data-expansion-restart')){pause();setProgress(0);}
  if(button.hasAttribute('data-expansion-reset-camera'))fit();
  if(button.hasAttribute('data-expansion-zoom'))zoom(Number(button.dataset.expansionZoom));
  if(button.hasAttribute('data-expansion-house')){pause();onOpenHouse();}
  if(button.hasAttribute('data-expansion-retry'))retry();
 }
 function keyboard(event){if(event.target!==viewport||!stage)return;const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'];if(!keys.includes(event.key))return;event.preventDefault();if(['+','=','-'].includes(event.key)){zoom(event.key==='-'?1.15:.85);return;}const spherical=new THREE.Spherical().setFromVector3(stage.camera.position.clone().sub(controls.target));spherical.theta+=event.key==='ArrowLeft'?.12:event.key==='ArrowRight'?-.12:0;spherical.phi=THREE.MathUtils.clamp(spherical.phi+(event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0),.03,1.5);stage.camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();requestRender();}
 const input=()=>{pause();setProgress(range.value);},visibility=()=>{if(document.hidden)pause();else requestRender();};
 root.addEventListener('click',click);viewport.addEventListener('keydown',keyboard);range.addEventListener('input',input);document.addEventListener('visibilitychange',visibility);
 const observer=new ResizeObserver(resize);observer.observe(viewport);updateUI();
 return {activate,pause,setProgress,play:togglePlay,status:()=>({...processPose(progress),playing,active,ready:!!house&&!lost,revision:PROCESS_REVISION}),dispose(){disposed=true;active=false;observer.disconnect();root.removeEventListener('click',click);viewport.removeEventListener('keydown',keyboard);range.removeEventListener('input',input);document.removeEventListener('visibilitychange',visibility);release();}};
}
