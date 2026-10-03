import * as THREE from './vendor/three.module.js';

export const VILLAGE_FACES = ['north', 'east', 'south', 'west'].map(name => `assets/scene-r37/village-${name}.png`);

// Scenic photographic elevations, separate from the configurable product.
// Each elevation occupies a narrow arc to preserve pedestrian/building proportions.
// These are illustrative surrounds, not a surveyed spherical photograph of a site.
export function createVillageBackdrop(textures) {
  const group = new THREE.Group();
  const radius = 32, arc = Math.PI / 4, crop = .425;
  const height = radius * arc * (1 - crop);
  for (let index = 0; index < 8; index++) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 24, 1, true, index * arc - arc / 2, arc);
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, crop + uv.getY(i) * (1 - crop));
    const material = new THREE.MeshBasicMaterial({map: textures[index % textures.length], side: THREE.BackSide, depthWrite: true});
    // Match neighbouring edge colours without softening the house or whole photo.
    material.onBeforeCompile = shader => {
      shader.uniforms.gvPrevious = {value: textures[(index + textures.length - 1) % textures.length]};
      shader.uniforms.gvNext = {value: textures[(index + 1) % textures.length]};
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\nuniform sampler2D gvPrevious;\nuniform sampler2D gvNext;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        vec4 villageColour = texture2D(map, vMapUv);
        if (vMapUv.x < .045) {
          vec4 neighbour = texture2D(gvPrevious, vec2(1. - vMapUv.x, vMapUv.y));
          villageColour = mix(neighbour, villageColour, .5 + .5 * smoothstep(0., .045, vMapUv.x));
        } else if (vMapUv.x > .955) {
          vec4 neighbour = texture2D(gvNext, vec2(1. - vMapUv.x, vMapUv.y));
          villageColour = mix(neighbour, villageColour, .5 + .5 * smoothstep(0., .045, 1. - vMapUv.x));
        }
        diffuseColor *= villageColour;
      `);
    };
    material.customProgramCacheKey = () => 'gv-village-elevation-edges-r37';
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = height / 2 - .365;
    mesh.renderOrder = -1000;
    mesh.frustumCulled = false;
    mesh.userData.presentationOnly = true;
    group.add(mesh);
  }
  group.userData.presentationOnly = true;
  return group;
}

export function fitVillageBackdrop(backdrop, camera) {
  // The scenic shell always remains beyond the camera, even after a long zoom/pan.
  const distance = Math.hypot(camera.position.x, camera.position.z);
  const scale = Math.max(1, (distance + 8) / 32);
  backdrop.scale.setScalar(scale);
  backdrop.position.y = .365 * (scale - 1);
}

export function disposeBackdrop(backdrop) {
  if (!backdrop) return;
  backdrop.removeFromParent();
  backdrop.traverse(node => {
    node.geometry?.dispose();
    for (const material of [].concat(node.material || [])) material.dispose();
  });
}
