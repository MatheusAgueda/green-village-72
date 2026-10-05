import {GroundedSkybox} from './vendor/GroundedSkybox.js';

// One continuous panorama replaces eight repeated, unrelated photographic walls.
// The original four elevations remain documentary assets, never render tiles.
export const VILLAGE_FACES = [];
export const BACKDROP_RADIUS = 120;
export const BACKDROP_HEIGHT = 8;
export function createVillageBackdrop(texture) {
  if (!texture?.isTexture) throw new TypeError('A continuous panorama texture is required');
  const backdrop = new GroundedSkybox(texture, BACKDROP_HEIGHT, BACKDROP_RADIUS, 128);
  backdrop.position.y = BACKDROP_HEIGHT - .365;
  backdrop.renderOrder = -1000;
  backdrop.frustumCulled = false;
  backdrop.userData.presentationOnly = true;
  backdrop.userData.continuousPanorama = true;
  backdrop.userData.projectionHeightM = BACKDROP_HEIGHT;
  return backdrop;
}
export function fitVillageBackdrop(backdrop, camera) {
  // Enlarging the distant sphere must never raise its projected ground plane.
  const distance = Math.hypot(camera.position.x, camera.position.z);
  const scale = Math.max(1, (distance + 30) / BACKDROP_RADIUS);
  backdrop.scale.setScalar(scale);
  backdrop.position.y = BACKDROP_HEIGHT * scale - .365;
}
export function disposeBackdrop(backdrop) {
  if (!backdrop) return;
  backdrop.removeFromParent();
  backdrop.traverse(node => {
    node.geometry?.dispose();
    for (const material of [].concat(node.material || [])) material.dispose();
  });
}
