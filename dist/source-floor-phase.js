import {Vector2} from './vendor/three.module.js';

// The catalogue supplies a small grain photograph, not a full plank scan.
// Sample one intact strip per illustrative board. Wrapping a 24 cm photograph
// five times inside a 122 cm board produces the old checkerboard/banding defect.
export const SOURCE_FLOOR_LAYOUT = Object.freeze({
  boardDimensionsM: Object.freeze([.18, 1.22]),
  sourceDimensionsPx: Object.freeze([440, 233]),
  sourceHeightFraction: .96,
  edgeInsetPx: 1,
});

export function sourceFloorSampling(entry = {}) {
  const board = entry.boardDimensionsM || SOURCE_FLOOR_LAYOUT.boardDimensionsM;
  const pixels = entry.dimensionsPx || SOURCE_FLOOR_LAYOUT.sourceDimensionsPx;
  const inset = pixels.map(value => SOURCE_FLOOR_LAYOUT.edgeInsetPx / value);
  const height = Math.min(SOURCE_FLOOR_LAYOUT.sourceHeightFraction, 1 - 2 * inset[1]);
  // Equal texels per metre on both axes: grain direction and aspect are retained.
  const span = [height * board[0] / board[1] * pixels[1] / pixels[0], height];
  return {board: [...board], pixels: [...pixels], inset, span};
}

export function installSourceFloorPhase(material, texture, entry) {
  const sampling = sourceFloorSampling(entry);
  const previous = material.onBeforeCompile;
  const baseKey = material.customProgramCacheKey();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    if (!shader.fragmentShader.includes('#include <map_fragment>')) throw new Error('Unexpected Three.js map shader chunk');
    shader.uniforms.gvFloorBoard = {value: new Vector2(...sampling.board)};
    shader.uniforms.gvFloorSpan = {value: new Vector2(...sampling.span)};
    shader.uniforms.gvFloorInset = {value: new Vector2(...sampling.inset)};
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 gvFloorMetres;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ngvFloorMetres=uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec2 gvFloorMetres;
        uniform vec2 gvFloorBoard;
        uniform vec2 gvFloorSpan;
        uniform vec2 gvFloorInset;
        float gvFloorHash(vec2 p) {
          vec3 q=fract(vec3(p.xyx)*.1031);
          q+=dot(q,q.yzx+33.33);
          return fract((q.x+q.y)*q.z);
        }`)
      .replace('#include <map_fragment>', `#ifdef USE_MAP
        vec2 metres=gvFloorMetres;
        float strip=floor(metres.x/gvFloorBoard.x);
        // Regular one-third stagger avoids implausible near-aligned butt joints.
        float stagger=mod(strip,3.)/3.;
        vec2 boardPosition=vec2(metres.x/gvFloorBoard.x,metres.y/gvFloorBoard.y+stagger);
        vec2 board=floor(boardPosition);
        vec2 local=fract(boardPosition);
        vec2 phase=vec2(gvFloorHash(board+vec2(31.2,7.9)),gvFloorHash(board+vec2(5.1,18.1)));
        vec2 start=gvFloorInset+phase*(vec2(1.)-2.*gvFloorInset-gvFloorSpan);
        vec2 sourceUv=start+local*gvFloorSpan;
        // Derivatives come from continuous metres, never across a board boundary.
        // This keeps mip selection stable instead of blurring every butt joint.
        vec2 texelsPerMetre=gvFloorSpan/gvFloorBoard;
        diffuseColor*=textureGrad(map,sourceUv,
          dFdx(metres)*texelsPerMetre,dFdy(metres)*texelsPerMetre);
      #endif`);
  };
  material.customProgramCacheKey = () => baseKey + '|gv-source-floor-phase-v2';
  material.userData.sourceFloorPhase = {
    boardDimensionsM: sampling.board,
    sourceDimensionsPx: sampling.pixels,
    sourceUvSpan: sampling.span,
    dimensionsStatus: 'visualisation-estimate-not-manufacturer-data',
    preserveSourcePixelAspect: true,
    treatment: 'One bounded original-crop strip per staggered board; no within-board repeat, RGB change, crossfade, rotation, reflection or synthetic joints. Board size and source footprint are visual estimates, not a full-plank scan.'
  };
  material.needsUpdate = true;
}
