import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath, pathToFileURL} from 'node:url';

// Exercise the actual stage state machine with real Three objects. Only WebGL,
// the asynchronous HDR transport, and surroundings asset loading are controlled.
const root = path.resolve(process.argv[2] || fileURLToPath(new URL('..', import.meta.url)));
const THREE = await import(pathToFileURL(path.join(root, 'dist/vendor/three.module.js')).href);
const {GroundedSkybox} = await import(pathToFileURL(path.join(root, 'dist/vendor/GroundedSkybox.js')).href);
const {createVillageBackdrop, disposeBackdrop, fitVillageBackdrop, VILLAGE_FACES} = await import(pathToFileURL(path.join(root, 'dist/village-backdrop.js')).href);
const source = fs.readFileSync(path.join(root, 'dist/stage.js'), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replace('export function', 'function');
const tick = () => new Promise(resolve => setImmediate(resolve));
const results = [];

function deferred() {
  let resolve, reject;
  const promise = new Promise((accept, fail) => {resolve = accept; reject = fail;});
  return {promise, resolve, reject};
}

function hdrTexture() {
  const width = 16, height = 8, pixels = new Float32Array(width * height * 4);
  const sunPixel = (2 * width + 3) * 4;
  pixels[sunPixel] = pixels[sunPixel + 1] = pixels[sunPixel + 2] = 100;
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat, THREE.FloatType);
  let disposals = 0;
  texture.addEventListener('dispose', () => {disposals++;});
  return {texture, disposals: () => disposals};
}

function fixture({browser = true, landscapePending = false, pmremFailure = false, maxTextureSize = 8192} = {}) {
  const requests = [], landscapeLoad = deferred();
  const events = {renderer: 0, studio: 0, hdr: 0, landscape: 0, village: 0, callbacks: 0, renders: 0, pmrem: 0};
  const studioTexture = new THREE.Texture(), environmentTexture = new THREE.Texture();
  const landscapeState = {visible: false, ready: !landscapePending, pending: landscapePending ? 1 : 0, failures: []};
  if (!landscapePending) landscapeLoad.resolve();
  class Renderer {
    constructor() {this.shadowMap = {}; this.ratio = 1; this.capabilities = {maxTextureSize};}
    setSize() {}
    setPixelRatio(value) {this.ratio = value;}
    getPixelRatio() {return this.ratio;}
    render() {events.renders++;}
    dispose() {events.renderer++;}
  }
  class PMREM {
    fromScene() {return {texture: studioTexture, dispose() {events.studio++;}};}
    fromEquirectangular() {
      if (pmremFailure) throw new Error('Controlled GPU conversion failure');
      return {texture: environmentTexture, dispose() {events.hdr++;}};
    }
    dispose() {events.pmrem++;}
  }
  class HDRLoader {
    loadAsync(url) {const load = deferred(); requests.push({url, ...load}); return load.promise;}
  }
  const context = {
    THREE: {...THREE, WebGLRenderer: Renderer, PMREMGenerator: PMREM},
    RoomEnvironment: class {dispose() {}},
    HDRLoader,
    GroundedSkybox,
    createVillageBackdrop, disposeBackdrop, fitVillageBackdrop, VILLAGE_FACES,
    createLandscape(scene, ground, options) {
      return {
        setVisible(value) {landscapeState.visible = value;},
        status: () => ({...landscapeState}),
        ready: () => landscapeLoad.promise,
        dispose() {events.landscape++;},
      };
    },
    createVillage() {
      return {
        setVisible() {}, setEntrance() {},
        status: () => ({ready: true, failures: []}),
        ready: async () => ({failures: []}),
        dispose() {events.village++;},
      };
    },
    ...(browser ? {document: {}} : {}),
  };
  vm.createContext(context);
  vm.runInContext(source, context, {filename: 'dist/stage.js'});
  const stage = options => context.createStage({...options, onChange: () => {events.callbacks++;}});
  const finishLandscape = (failures = []) => {
    Object.assign(landscapeState, {ready: true, pending: 0, failures});
    landscapeLoad.resolve({failures});
  };
  return {stage, requests, events, landscapeState, finishLandscape, studioTexture, environmentTexture};
}

async function check(name, task) {
  try {results.push({name, pass: true, evidence: await task()});}
  catch (error) {results.push({name, pass: false, error: error.stack});}
}

await check('Studio and document-free stages do not request HDR assets', async () => {
  for (const options of [{environment: 'studio'}, {browser: false}]) {
    const f = fixture(options), stage = f.stage(options);
    try {
      assert.equal(f.requests.length, 0);
      assert.equal((await stage.ready()).ready, true);
      if (options.environment === 'studio') {
        assert.equal(f.landscapeState.visible, false);
        assert.equal(stage.scene.environment, f.studioTexture);
        assert.equal(stage.presentationStatus().active, 'studio');
      }
    } finally {stage.dispose();}
  }
  return {HDRRequests: 0, contexts: ['studio', 'document-free']};
});

await check('Garden readiness joins both HDR and landscape completion', async () => {
  const f = fixture({landscapePending: true}), stage = f.stage();
  try {
    assert.equal(f.requests.length, 1);
    assert.equal(stage.presentationStatus().ready, false);
    let settled = false;
    const ready = stage.ready().then(status => {settled = true; return status;});
    const hdr = hdrTexture(); f.requests[0].resolve(hdr.texture);
    await tick();
    assert.equal(settled, false, 'An HDR alone must not enable export before landscape assets settle');
    assert.equal(stage.presentationStatus().ready, false);
    f.finishLandscape();
    const status = await ready;
    assert.equal(status.ready, true); assert.equal(status.failures.length, 0);
    assert.equal(stage.scene.background, hdr.texture);
    assert.equal(stage.scene.environment, f.environmentTexture);
    assert.equal(f.events.callbacks, 1);
    return {HDRRequests: f.requests.length, waitedForLandscape: true, active: status.active};
  } finally {stage.dispose();}
});

await check('Technical views and details remain neutral when an HDR completes late', async () => {
  const f = fixture(), stage = f.stage({environment: 'studio'});
  const ground = stage.scene.children.find(object => object.geometry?.type === 'PlaneGeometry');
  try {
    stage.setMood('late-afternoon'); stage.setEnvironment('garden');
    stage.setView('finishes');
    const hdr = hdrTexture(); f.requests[0].resolve(hdr.texture); await tick();
    assert.equal(stage.scene.environment, f.studioTexture); assert.ok(stage.scene.background.isColor);
    assert.equal(ground.position.y, -.96); assert.equal(f.landscapeState.visible, false);
    stage.lighting('catalogue'); stage.setView('exterior'); await stage.ready();
    assert.equal(stage.presentationStatus().mood, 'late-afternoon');
    assert.equal(stage.scene.background, hdr.texture); assert.equal(ground.position.y, -.365);
    stage.setDetail(new THREE.Box3(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 2, 1)));
    assert.equal(stage.scene.environment, f.studioTexture); assert.ok(stage.scene.background.isColor);
    assert.equal(ground.position.y, -.072); assert.equal(f.landscapeState.visible, false);
    stage.setDetail(null); assert.equal(stage.scene.background, hdr.texture);
    stage.setEnvironment('studio'); assert.ok(stage.scene.background.isColor);
    stage.setEnvironment('garden'); assert.equal(stage.scene.background, hdr.texture);
    assert.equal(f.requests.length, 1, 'Re-entering the garden must reuse the loaded HDR');
    assert.equal(stage.setMood('invalid'), false); assert.equal(stage.setEnvironment('invalid'), false);
    assert.equal(stage.presentationStatus().mood, 'late-afternoon');
    return {groundY: {exterior: -.365, finishes: -.96, detail: -.072}, selectedMood: 'late-afternoon', HDRRequests: 1};
  } finally {stage.dispose();}
});

await check('Sunlight follows the same panorama yaw as the photographic sky and reflections', async () => {
  const f = fixture(), stage = f.stage(), hdr = hdrTexture();
  try {
    f.requests[0].resolve(hdr.texture); await stage.ready();
    const key = stage.scene.children.find(object => object.isDirectionalLight && object.castShadow);
    const azimuth = ((3 + .5) / 16 - .5) * Math.PI * 2, elevation = (.5 - (2 + .5) / 8) * Math.PI;
    const sourceDirection = new THREE.Vector3(Math.cos(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.sin(azimuth) * Math.cos(elevation));
    for (const mood of ['daylight', 'late-afternoon']) {
      stage.setMood(mood);
      assert.equal(stage.scene.backgroundRotation.y, stage.scene.environmentRotation.y);
      const backdrop = stage.scene.children.find(object => object instanceof GroundedSkybox);
      assert.equal(backdrop.rotation.y, stage.scene.backgroundRotation.y);
      assert.equal(backdrop.material.color.r, stage.scene.backgroundIntensity);
      const expected = sourceDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), stage.scene.backgroundRotation.y);
      const actual = key.position.clone().sub(key.target.position).normalize();
      assert.ok(actual.distanceTo(expected) < 1e-10, `${mood}: sun and panorama must rotate together`);
    }
    return {moods: ['daylight', 'late-afternoon'], aligned: true};
  } finally {stage.dispose();}
});

await check('Grounded panorama blends outside the plot and restores an opaque floor in technical views', async () => {
  const f = fixture(), stage = f.stage(), hdr = hdrTexture();
  try {
    const ground = stage.scene.children.find(object => object.geometry?.type === 'PlaneGeometry');
    assert.equal(ground.material.transparent, false, 'An incomplete HDR keeps the fallback ground opaque');
    f.requests[0].resolve(hdr.texture); await stage.ready();
    const backdrop = stage.scene.children.find(object => object instanceof GroundedSkybox);
    assert.ok(backdrop); assert.equal(backdrop.position.y, 3 - .365);
    assert.equal(backdrop.material.depthWrite, false); assert.equal(backdrop.userData.presentationOnly, true);
    assert.equal(backdrop.visible, true); assert.ok(backdrop.renderOrder < ground.renderOrder);
    assert.equal(ground.material.transparent, true); assert.equal(ground.material.depthWrite, false);
    const shader = {uniforms: {}, vertexShader: '#include <common>\n#include <begin_vertex>', fragmentShader: '#include <common>\n#include <opaque_fragment>'};
    ground.material.onBeforeCompile(shader);
    assert.equal(shader.uniforms.gardenGroundBlend.value, 1);
    assert.ok(shader.fragmentShader.includes('smoothstep(22.0, 34.0, length(vGardenGround))'));
    stage.setView('finishes');
    assert.equal(backdrop.visible, false); assert.equal(ground.material.transparent, false);
    assert.equal(ground.material.depthWrite, true); assert.equal(shader.uniforms.gardenGroundBlend.value, 0);
    stage.setView('exterior');
    assert.equal(backdrop.visible, true); assert.equal(shader.uniforms.gardenGroundBlend.value, 1);
    return {blendMetres: [22, 34], panoramaRadius: 100, technicalFloorOpaque: true};
  } finally {stage.dispose();}
});

await check('HDR failures are reported with landscape failures and remain isolated from studio', async () => {
  const f = fixture({landscapePending: true}), stage = f.stage();
  try {
    const ready = stage.ready();
    f.requests[0].reject(new Error('Controlled network failure'));
    f.finishLandscape(['assets/scene-r35/missing-ground-map.jpg']);
    const status = await ready;
    assert.equal(status.ready, true, 'Ready means all requests settled; failures separately prevent export');
    assert.equal(status.failures.length, 2);
    assert.ok(status.failures.includes(f.requests[0].url), 'The failed local panorama is reported by its requested URL');
    assert.equal(stage.scene.environment, f.studioTexture); assert.ok(stage.scene.background.isColor);
    stage.setEnvironment('studio'); const neutral = await stage.ready();
    assert.equal(neutral.ready, true); assert.equal(neutral.failures.length, 0);
    assert.equal(neutral.active, 'studio');
    return {gardenFailures: status.failures.length, studioFailures: neutral.failures.length};
  } finally {stage.dispose();}
});

await check('PMREM conversion failure disposes the incoming HDR and preserves neutral fallback', async () => {
  const f = fixture({pmremFailure: true}), stage = f.stage(), hdr = hdrTexture();
  try {
    f.requests[0].resolve(hdr.texture); const status = await stage.ready();
    assert.equal(hdr.disposals(), 1); assert.equal(status.failures.length, 1);
    assert.equal(stage.scene.environment, f.studioTexture); assert.ok(stage.scene.background.isColor);
    assert.equal(f.events.pmrem, 2, 'Both studio and failed HDR PMREM generators release their working resources');
    return {HDRDisposals: hdr.disposals(), failures: status.failures.length};
  } finally {stage.dispose();}
});

await check('Late completion after disposal cannot resurrect a scene or trigger a render callback', async () => {
  const f = fixture(), stage = f.stage(), ready = stage.ready(), hdr = hdrTexture();
  stage.dispose(); stage.dispose();
  f.requests[0].resolve(hdr.texture); const status = await ready;
  stage.render();
  assert.equal(hdr.disposals(), 1); assert.equal(f.events.callbacks, 0);
  assert.equal(f.events.hdr, 0); assert.equal(f.events.renders, 0);
  assert.equal(f.events.renderer, 1); assert.equal(f.events.landscape, 1); assert.equal(f.events.studio, 1);
  assert.equal(stage.scene.environment, null); assert.equal(stage.scene.background, null);
  assert.equal(status.disposed, true); assert.equal(status.ready, false);
  return {lateTextureDisposals: 1, postDisposalCallbacks: 0, rendererDisposals: 1};
});

await check('Repeated disposal releases a loaded HDR and each owned target exactly once', async () => {
  const f = fixture(), stage = f.stage(), hdr = hdrTexture();
  f.requests[0].resolve(hdr.texture); await stage.ready();
  const backdrop = stage.scene.children.find(object => object instanceof GroundedSkybox);
  let geometryDisposals = 0, materialDisposals = 0;
  backdrop.geometry.addEventListener('dispose', () => {geometryDisposals++;});
  backdrop.material.addEventListener('dispose', () => {materialDisposals++;});
  stage.render(); assert.equal(f.events.renders, 1);
  stage.dispose(); stage.dispose(); stage.render();
  assert.equal(hdr.disposals(), 1); assert.equal(f.events.hdr, 1); assert.equal(f.events.studio, 1);
  assert.equal(f.events.renderer, 1); assert.equal(f.events.landscape, 1); assert.equal(f.events.renders, 1);
  assert.equal(geometryDisposals, 1); assert.equal(materialDisposals, 1); assert.equal(backdrop.parent, null);
  return {HDRTexture: 1, HDRTarget: 1, studioTarget: 1, renderer: 1, landscape: 1, backdropGeometry: 1, backdropMaterial: 1};
});

await check('R37 display density improves desktop and mobile clarity within the pixel budget', () => {
  const cases = [
    {width: 1280, height: 720, device: 1, expected: 1.5},
    {width: 1440, height: 900, device: 2, expected: 2},
    {width: 390, height: 844, device: 1, expected: 1.25},
    {width: 2560, height: 1440, device: 2, expected: Math.sqrt(6000000 / (2560 * 1440))},
  ];
  for (const {width, height, device, expected} of cases) {
    const f = fixture({browser: false}), stage = f.stage({width, height, pixelRatio: device});
    try {
      assert.equal(stage.renderer.getPixelRatio(), expected);
      assert.ok(width * height * expected ** 2 <= 6000000 + 1e-6);
      assert.equal(stage.presentationStatus().definition.shadowMap, 4096);
      stage.resize(390, 844, 1);
      assert.equal(stage.renderer.getPixelRatio(), 1.25, 'Resize reapplies the correct display density');
    } finally {stage.dispose();}
    assert.equal(f.events.village, 1, 'The added surroundings dependency is disposed with the stage');
  }
  const limited = fixture({browser: false, maxTextureSize: 2048}), stage = limited.stage();
  try {assert.equal(stage.presentationStatus().definition.shadowMap, 2048, 'Shadow size respects device support');}
  finally {stage.dispose();}
  return {cases: cases.length, desktopRatio: 1.5, mobileRatio: 1.25, pixelBudget: 6000000, shadowSize: 4096, limitedShadowSize: 2048};
});

console.log(JSON.stringify({root, passed: results.filter(result => result.pass).length, total: results.length, results}, null, 2));
process.exitCode = results.every(result => result.pass) ? 0 : 1;
