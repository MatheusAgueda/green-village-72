/** A small cancellable camera transition. It never touches model configuration. */
export function createCameraFlight({getCamera,getControls,reducedMotion,requestRender}){
 let flight=null;
 function cancel(){if(!flight)return;const c=getControls();c.enableDamping=flight.damping;flight=null;}
 function start(from,to,duration=1100){
  cancel();const camera=getCamera(),controls=getControls();
  if(reducedMotion()||!camera.isPerspectiveCamera)return false;
  flight={from,to,start:performance.now(),duration,damping:controls.enableDamping};controls.enableDamping=false;
  camera.position.copy(from.position);controls.target.copy(from.target);camera.lookAt(controls.target);controls.update();requestRender();return true;
 }
 function update(time){
  if(!flight)return false;const p=Math.min(1,Math.max(0,(time-flight.start)/flight.duration)),t=p*p*(3-2*p),camera=getCamera(),controls=getControls();
  camera.position.lerpVectors(flight.from.position,flight.to.position,t);controls.target.lerpVectors(flight.from.target,flight.to.target,t);camera.lookAt(controls.target);controls.update();if(p>=1)cancel();return p<1;
 }
 function pose(){return{position:getCamera().position.clone(),target:getControls().target.clone()};}
 return{start,update,cancel,pose,get active(){return Boolean(flight);}};
}
