import * as THREE from './vendor/three.module.js';
import {DIM,doorPose} from './specification.js';

export const WALK={eye:1.6,radius:.14,speed:1.4}; // Navigation assumptions, not product dimensions.
export function navigationSegments(plan,doorsOpen){
 const segments=[];
 for(const w of plan.walls){const spans=w.door?[[w.a,w.door.u-w.door.width/2],[w.door.u+w.door.width/2,w.b]]:[[w.a,w.b]];
  for(const [a,b]of spans)segments.push(w.axis==='z'?{ax:w.c,az:a,bx:w.c,bz:b,r:w.thickness/2}:{ax:a,az:w.c,bx:b,bz:w.c,r:w.thickness/2});
  if(w.door){const pose=doorPose(w.door,doorsOpen?1:0);segments.push({ax:pose.start.x,az:pose.start.z,bx:pose.tip.x,bz:pose.tip.z,r:.03});}
 }
 for(const f of plan.furnishings)for(const [a,b]of [[[f.x0,f.z0],[f.x1,f.z0]],[[f.x1,f.z0],[f.x1,f.z1]],[[f.x1,f.z1],[f.x0,f.z1]],[[f.x0,f.z1],[f.x0,f.z0]]])segments.push({ax:a[0],az:a[1],bx:b[0],bz:b[1],r:0});
 return segments;
}
function distanceToSegment(x,z,s){const dx=s.bx-s.ax,dz=s.bz-s.az,t=Math.max(0,Math.min(1,((x-s.ax)*dx+(z-s.az)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-s.ax-t*dx,z-s.az-t*dz);}
export function canWalk(plan,segments,x,z){
 if(Math.abs(x)>DIM.width/2-DIM.panel-WALK.radius||Math.abs(z)>DIM.length/2-DIM.panel-WALK.radius)return false;
 if(plan.furnishings.some(f=>x>f.x0&&x<f.x1&&z>f.z0&&z<f.z1))return false;
 return segments.every(s=>distanceToSegment(x,z,s)>=WALK.radius+s.r);
}
export function moveInside(plan,segments,position,dx,dz){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.035));let x=position.x,z=position.z;
 for(let i=0;i<steps;i++){if(canWalk(plan,segments,x+dx/steps,z))x+=dx/steps;if(canWalk(plan,segments,x,z+dz/steps))z+=dz/steps;}
 return {x,z};
}

export function createWalkthrough({stage,controls,element,getHouse,requestRender}){
 let active=false,yaw=0,pitch=0,last=0,pointer=null;const keys=new Set();
 function look(){const c=stage.camera;c.up.set(0,1,0);c.lookAt(c.position.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))));}
 const supported=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
 const keydown=e=>{if(!active||!supported.has(e.key.toLowerCase()))return;e.preventDefault();keys.add(e.key.toLowerCase());requestRender();};
 const keyup=e=>keys.delete(e.key.toLowerCase());
 element.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',()=>keys.clear());
 element.addEventListener('pointerdown',e=>{if(!active||e.target!==stage.renderer.domElement)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};element.setPointerCapture(e.pointerId);element.focus({preventScroll:true});});
 element.addEventListener('pointermove',e=>{if(!active||pointer?.id!==e.pointerId)return;yaw-=(e.clientX-pointer.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-pointer.y)*.003,-1.1,1.1);pointer.x=e.clientX;pointer.y=e.clientY;look();requestRender();});
 const release=()=>{pointer=null;};element.addEventListener('pointerup',release);element.addEventListener('pointercancel',release);
 return {
  get active(){return active;},
  start(){const h=getHouse(),segments=navigationSegments(h.plan,true);let start=null;
   for(let z=4.9;z>-4&&!start;z-=.2)for(let x=0;x<1&&!start;x+=.2)if(canWalk(h.plan,segments,x,z))start={x,z};
   if(!start)throw new Error('Não foi encontrado um ponto interior livre nesta configuração.');
   stage.perspective();controls.object=stage.camera;controls.enabled=false;stage.camera.fov=65;stage.camera.near=.025;stage.camera.updateProjectionMatrix();stage.camera.position.set(start.x,WALK.eye,start.z);yaw=0;pitch=0;active=true;last=0;look();element.focus({preventScroll:true});requestRender();
  },
  pause(){keys.clear();pointer=null;},
  stop(){active=false;keys.clear();pointer=null;controls.enabled=true;stage.camera.fov=36;stage.camera.near=.05;stage.camera.updateProjectionMatrix();},
  direction(name,pressed){const key={forward:'w',back:'s',left:'a',right:'d'}[name];if(!key)return;if(pressed)keys.add(key);else keys.delete(key);requestRender();},
  update(time){if(!active)return false;const dt=Math.min(.05,Math.max(0,(time-last)/1000));last=time;
   const f=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown')),side=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
   if(!f&&!side)return false;const factor=WALK.speed*dt/Math.max(1,Math.hypot(f,side));
   const h=getHouse(),segments=navigationSegments(h.plan,!!h.root.userData.state.doorsOpen),next=moveInside(h.plan,segments,stage.camera.position,(Math.sin(yaw)*f+Math.cos(yaw)*side)*factor,(-Math.cos(yaw)*f+Math.sin(yaw)*side)*factor);
   stage.camera.position.set(next.x,WALK.eye,next.z);look();return true;
  }
 };
}
