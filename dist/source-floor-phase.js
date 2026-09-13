// Break aligned photographic edge bands by offsetting each illustrative plank.
// Source texels, metre scale and grain orientation remain unchanged.
export function installSourceFloorPhase(material, texture) {
  const previous = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey.bind(material);
  const baseKey = previousKey();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.uniforms.gvFloorRepeat = { value: texture.repeat.clone() };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 gvFloorMetres;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ngvFloorMetres=uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec2 gvFloorMetres;
        uniform vec2 gvFloorRepeat;
        float gvFloorHash(vec2 p) {
          vec3 q=fract(vec3(p.xyx)*.1031);
          q+=dot(q,q.yzx+33.33);
          return fract((q.x+q.y)*q.z);
        }`)
      .replace('#include <map_fragment>', `#ifdef USE_MAP
        vec2 metres=gvFloorMetres;
        float strip=floor(metres.x/.18);
        float stagger=gvFloorHash(vec2(strip,13.7));
        vec2 board=vec2(strip,floor(metres.y/1.22+stagger));
        vec2 phase=vec2(gvFloorHash(board+vec2(31.2,7.9)),gvFloorHash(board+vec2(5.1,18.1)));
        diffuseColor*=textureGrad(map,metres*gvFloorRepeat+phase,
          dFdx(metres)*gvFloorRepeat,dFdy(metres)*gvFloorRepeat);
      #endif`);
  };
  material.customProgramCacheKey = () => baseKey + '|gv-source-floor-phase-v1';
  material.userData.sourceFloorPhase = {
    boardDimensionsM: [.18, 1.22],
    dimensionsStatus: 'visualisation-estimate-not-manufacturer-data',
    treatment: 'Original crop; deterministic UV phase per board; no RGB change, crossfade, rotation or reflection.'
  };
  material.needsUpdate = true;
}
