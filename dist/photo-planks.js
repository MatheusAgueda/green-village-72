import * as THREE from './vendor/three.module.js';

// Coordinates are metres from physicalUV(), including the shared surface offset.
// This rearranges the catalogue's photographed grain; it is not a product scan.
const grainShader = /* glsl */`
uniform vec2 gvSourceSize;
uniform vec2 gvBoardSize;
uniform vec3 gvPhotoMean;
uniform float gvJoint;
uniform float gvSwapAxes;
float gvHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
vec3 gvGrain(vec2 metres) {
  metres = gvSwapAxes > .5 ? metres.yx : metres;
  float strip = floor(metres.x / gvBoardSize.x);
  float stagger = gvHash(vec2(strip, 13.7));
  float lengthPosition = metres.y / gvBoardSize.y + stagger;
  vec2 board = vec2(strip, floor(lengthPosition));
  vec2 local = vec2(fract(metres.x / gvBoardSize.x) * gvBoardSize.x,
                    fract(lengthPosition) * gvBoardSize.y);
  float phaseX = gvHash(board + vec2(31.2, 7.9));
  // Two photograph phases with the same derivatives preserve grain direction.
  // Patch length is independent of the photograph's original repeat period.
  float patchPosition = metres.y / (gvSourceSize.y * .83);
  float cell = floor(patchPosition), blend = smoothstep(.18, .82, fract(patchPosition));
  vec2 uv = vec2(local.x / gvSourceSize.x + phaseX, metres.y / gvSourceSize.y);
  vec2 dx = dFdx(metres) / gvSourceSize;
  vec2 dy = dFdy(metres) / gvSourceSize;
  vec2 seed = board * vec2(5.13, 9.71);
  vec2 phaseA = vec2(0., gvHash(seed + vec2(cell, 18.1)));
  vec2 phaseB = vec2(0., gvHash(seed + vec2(cell + 1., 18.1)));
  vec3 a = textureGrad(map, uv + phaseA, dx, dy).rgb;
  vec3 b = textureGrad(map, uv + phaseB, dx, dy).rgb;
  // Mild variance compensation reduces crossfade blur without adding detail.
  float compensation = mix(1., inversesqrt(blend * blend + (1. - blend) * (1. - blend)), .5);
  vec3 colour = gvPhotoMean + (mix(a, b, blend) - gvPhotoMean) * compensation;
  vec2 distanceToJoint = min(local, gvBoardSize - local);
  vec2 footprint = max(fwidth(metres), vec2(.0001));
  vec2 jointCoverage = 1. - smoothstep(vec2(gvJoint * .5), vec2(gvJoint * .5) + footprint, distanceToJoint);
  // Fine estimated butt joints: no artificial deep black gaps or height map.
  colour *= 1. - .12 * max(jointCoverage.x, jointCoverage.y);
  return clamp(colour, vec3(0.), vec3(1.));
}
`;

/** Load once per material ID; caller owns and disposes the returned texture. */
export async function loadPhotoPlankTexture(entry, assetRoot = '') {
  const texture = await new THREE.TextureLoader().loadAsync(assetRoot + entry.derivedAsset);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

/** Call after lib.create(); preserve lib lease ownership of the replaced map. */
export function installPhotoPlanks(material, texture, entry) {
  if (!material.isMeshStandardMaterial) throw new TypeError('MeshStandardMaterial required');
  material.map = texture;
  material.color.set('#ffffff');
  const previous = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    if (!shader.fragmentShader.includes('#include <map_fragment>')) throw new Error('Unexpected Three.js map shader chunk');
    Object.assign(shader.uniforms, {
      gvSourceSize: {value: new THREE.Vector2(...entry.sourceFootprintM)},
      gvBoardSize: {value: new THREE.Vector2(...entry.boardDimensionsM)},
      gvPhotoMean: {value: new THREE.Color().setRGB(...entry.meanSrgb, THREE.SRGBColorSpace)},
      gvJoint: {value: entry.jointWidthM},
      gvSwapAxes: {value: entry.grainAxis === 'horizontal' ? 1 : 0},
    });
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\n' + grainShader);
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\n diffuseColor *= vec4(gvGrain(vMapUv), 1.);\n#endif');
  };
  const previousKey = material.customProgramCacheKey.bind(material);
  const baseKey = previousKey();
  material.customProgramCacheKey = () => baseKey + '|gv-photo-planks-r3-v1';
  material.userData.photoPlanks = {
    materialId: entry.id, sourceAsset: entry.originalAsset,
    dimensionsStatus: entry.physicalDimensionsStatus,
    sourcePixelDimensions: entry.dimensionsPx,
    note: 'Photo-derived grain only; no measured albedo, relief or product plank dimensions supplied.',
  };
  material.needsUpdate = true;
  return material;
}

/** Optional shallow groove normal, justified only where the source shows siding.
 * No displacement or generated height image. Pitch/depth remain explicit estimates.
 */
export function installPanelProfile(material, {pitchM = .30, depthM = .0012, grooveWidthM = .004} = {}) {
  const previous = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    Object.assign(shader.uniforms, {gvPanelPitch: {value: pitchM}, gvPanelDepth: {value: depthM}, gvPanelGroove: {value: grooveWidthM}});
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
uniform float gvPanelPitch;
uniform float gvPanelDepth;
uniform float gvPanelGroove;
float gvProfileHeight(float y) {
 float distance = abs(fract(y / gvPanelPitch + .5) - .5) * gvPanelPitch;
 return -gvPanelDepth * exp(-distance * distance / (2. * gvPanelGroove * gvPanelGroove));
}
`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
 vec3 gvDx = dFdx(-vViewPosition), gvDy = dFdy(-vViewPosition);
 vec3 gvR1 = cross(gvDy, normal), gvR2 = cross(normal, gvDx);
 float gvDet = dot(gvDx, gvR1);
 float gvY = vMapUv.y;
 float gvH = gvProfileHeight(gvY);
 vec2 gvSlope = vec2(gvProfileHeight(gvY + dFdx(gvY)), gvProfileHeight(gvY + dFdy(gvY))) - gvH;
 normal = normalize(abs(gvDet) * normal - sign(gvDet) * (gvSlope.x * gvR1 + gvSlope.y * gvR2));
`);
  };
  const key = material.customProgramCacheKey();
  material.customProgramCacheKey = () => key + '|gv-estimated-panel-profile-v1';
  material.userData.panelProfile = {pitchM, depthM, grooveWidthM, status: 'illustrative-normal-only-profile-not-manufacturer-data'};
  material.needsUpdate = true;
  return material;
}
