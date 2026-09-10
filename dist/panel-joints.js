// Fine panel joins observed in the supplied tours. Spacing/width are visual estimates.
export function installPanelJoints(material){
 const previous=material.onBeforeCompile;
 material.onBeforeCompile=(shader,renderer)=>{
  previous.call(material,shader,renderer);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 gvPanelUv;\nvarying float gvPanelFace;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngvPanelUv=uv;gvPanelFace=1.-step(.5,abs(normal.y));');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 gvPanelUv;\nvarying float gvPanelFace;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float joinDistance=min(fract(gvPanelUv.x),1.-fract(gvPanelUv.x));
   float coverage=1.-smoothstep(.0006,.0006+max(fwidth(gvPanelUv.x),.0001),joinDistance);
   diffuseColor.rgb*=1.-.10*coverage*gvPanelFace;`);
 };
 material.customProgramCacheKey=()=> 'gv-panel-joints-r3';
 material.userData.panelJoints={spacingM:1,widthM:.0012,status:'visual-estimate',source:'Four user-supplied tours, fine vertical joints visible; no measured panel dimensions.'};
 return material;
}
