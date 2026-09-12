import {DIM,EXPANSION_RIG,WALL_RAISE} from './specification.js';

// Commercial demonstration, not a manufacturer's stowage or linkage model.
export const DEPLOYMENT_ASSUMPTIONS=Object.freeze({
 status:'illustrative',stowedWallAxis:.70,stowedPostAxis:.52,
 roofPackingOffset:.10,roofClearanceAngle:.085,postPackingDrop:.15,
 scope:'closed container, roof and floor wings, longitudinal walls, front and rear panels',
 limitations:'Internal stowage and panel handling are schematic; no verified transport envelope, locks, loads or collision-free factory mechanism.'
});
const smooth=(p,a,b)=>{const t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t);};
export function deploymentPose(value){
 const p=Math.max(0,Math.min(1,Number(value)||0));
 return {p,roof:smooth(p,.025,.16),floor:smooth(p,.17,.33),
  placement:smooth(p,.35,.49),wall:smooth(p,.53,.74),
  front:smooth(p,.78,.90),rear:smooth(p,.87,.99),dock:smooth(p,.74,.78)};
}
export function applyDeployment(assemblies,value){
 const e=deploymentPose(value),{floorAssemblies,roofAssemblies,sideAssemblies,endAssemblies}=assemblies;
 const C=DIM.core/2,X=DIM.width/2,H=DIM.height,A=DEPLOYMENT_ASSUMPTIONS;
 for(const a of floorAssemblies)for(const pivot of a.pivots){
  pivot.rotation.set(0,0,a.dir*Math.PI/2*(1-e.floor));pivot.position.set(a.dir*C,0,0);
 }
 for(const a of roofAssemblies)for(const pivot of a.pivots){
  pivot.position.set(a.dir*(C+A.roofPackingOffset*(1-e.roof)),H,0);
  pivot.rotation.set(0,0,a.dir*(-Math.PI/2*(1-e.roof)+A.roofClearanceAngle*e.roof*(1-e.dock)));
 }
 for(const a of sideAssemblies){
  const angle=a.dir*Math.PI/2*e.placement*(1-e.wall);
  const axis=a.dir*(A.stowedWallAxis+(WALL_RAISE.axisX-A.stowedWallAxis)*e.placement);
  const dx=a.dir*(X-EXPANSION_RIG.wallPivotInset-WALL_RAISE.axisX),dy=EXPANSION_RIG.wallPivotHeight;
  a.pivot.position.set(axis+dx*Math.cos(angle)-dy*Math.sin(angle),dx*Math.sin(angle)+dy*Math.cos(angle),0);
  a.pivot.rotation.set(0,0,angle);a.pivot.visible=true;
  // Posts are handled separately, not folded rigidly with wall sheets.
  const travel=smooth(e.p,.33,.49),lift=smooth(e.p,.49,.53);
  a.framePivot.position.set(a.dir*(A.stowedPostAxis+(X-EXPANSION_RIG.wallPivotInset-A.stowedPostAxis)*travel),EXPANSION_RIG.wallPivotHeight-A.postPackingDrop*(1-lift),0);
  a.framePivot.rotation.set(0,0,0);
 }
 for(const a of endAssemblies){
  const opened=a.front>0?e.front:e.rear;
  a.pivot.position.set(a.dir*(C-.13*(1-opened)),0,a.front*DIM.length/2);
  a.pivot.rotation.set(0,a.dir*a.front*Math.PI/2*(1-opened),0);a.g.visible=true;
 }
 return e;
}
