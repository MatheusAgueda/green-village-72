import {DIM,EXPANSION_RIG,WALL_RAISE} from './specification.js';

// Commercial demonstration, not a manufacturer's stowage or linkage model.
export const DEPLOYMENT_ASSUMPTIONS=Object.freeze({
 status:'illustrative',floorCarrierAxis:.56,stowedPostAxis:.52,
 roofPackingOffset:.10,postPackingDrop:.15,carrierReturn:'illustrative recessed lower closure, rigid with floor',
 scope:'closed container, roof and floor wings, longitudinal walls, front and rear panels',
 limitations:'Inboard floor carrier axis and internal packing are illustrative. Side panels accompany the floor wings, then rise. No verified transport envelope, linkage, locks, loads or collision-free factory mechanism.'
});
const smooth=(p,a,b)=>{const t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t);};
export function deploymentPose(value){
 const p=Math.max(0,Math.min(1,Number(value)||0));
 return {p,roof:smooth(p,.025,.16),floor:smooth(p,.17,.43),
  wall:smooth(p,.48,.73),front:smooth(p,.78,.90),rear:smooth(p,.87,.99)};
}
export function applyDeployment(assemblies,value){
 const e=deploymentPose(value),{floorAssemblies,roofAssemblies,sideAssemblies,endAssemblies}=assemblies;
 const C=DIM.core/2,X=DIM.width/2,H=DIM.height,A=DEPLOYMENT_ASSUMPTIONS;
 for(const a of floorAssemblies)for(const pivot of a.pivots){
  const angle=a.dir*Math.PI/2*(1-e.floor),axis=a.dir*A.floorCarrierAxis,dx=a.dir*C-axis;
  // Rotate the existing mesh about an illustrative inboard carrier, without
  // changing child coordinates or introducing a separate handling movement.
  pivot.rotation.set(0,0,angle);pivot.position.set(axis+dx*Math.cos(angle),dx*Math.sin(angle),0);
 }
 for(const a of roofAssemblies)for(const pivot of a.pivots){
  pivot.position.set(a.dir*(C+A.roofPackingOffset*(1-e.roof)),H,0);
  pivot.rotation.set(0,0,-a.dir*Math.PI/2*(1-e.roof));
 }
 for(const a of sideAssemblies){
  const angle=a.dir*Math.PI/2*(1-e.wall),carrier=a.dir*Math.PI/2*(1-e.floor);
  const axis=a.dir*WALL_RAISE.axisX,carrierAxis=a.dir*A.floorCarrierAxis;
  const dx=a.dir*(X-EXPANSION_RIG.wallPivotInset-WALL_RAISE.axisX),dy=EXPANSION_RIG.wallPivotHeight;
  const flatX=axis+dx*Math.cos(angle)-dy*Math.sin(angle),flatY=dx*Math.sin(angle)+dy*Math.cos(angle);
  a.pivot.position.set(carrierAxis+(flatX-carrierAxis)*Math.cos(carrier)-flatY*Math.sin(carrier),(flatX-carrierAxis)*Math.sin(carrier)+flatY*Math.cos(carrier),0);
  a.pivot.rotation.set(0,0,carrier+angle);a.pivot.visible=true;
  // Post packing is illustrative, synchronised with the wing opening.
  a.framePivot.position.set(a.dir*(A.stowedPostAxis+(X-EXPANSION_RIG.wallPivotInset-A.stowedPostAxis)*e.floor),EXPANSION_RIG.wallPivotHeight-A.postPackingDrop*(1-e.floor),0);
  a.framePivot.rotation.set(0,0,0);
 }
 for(const a of endAssemblies){
  const opened=a.front>0?e.front:e.rear;
  a.pivot.position.set(a.dir*(C-.13*(1-opened)),0,a.front*DIM.length/2);
  a.pivot.rotation.set(0,a.dir*a.front*Math.PI/2*(1-opened),0);a.g.visible=true;
 }
 return e;
}
