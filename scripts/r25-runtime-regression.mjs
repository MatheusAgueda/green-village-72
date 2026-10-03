import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL, fileURLToPath} from 'node:url';

// Renderer output and DOM are inert; application handlers, stage mathematics,
// geometry and configuration are loaded from the checkout being verified.
const root = path.resolve(process.argv[2] || fileURLToPath(new URL('..', import.meta.url)));
const load = file => import(pathToFileURL(path.join(root, 'dist', file)).href);
const [THREE, {makeHouse}, {DEFAULT_CONFIG}] = await Promise.all([
  load('vendor/three.module.js'), load('model.js'), load('configuration.js'),
]);
const app = fs.readFileSync(path.join(root, 'dist/app.js'), 'utf8');
const {createLandscape}=await load('landscape.js');
const {createVillage}=await load('village.js');
const {createVillageBackdrop,disposeBackdrop,fitVillageBackdrop,VILLAGE_FACES}=await load('village-backdrop.js');
const stageSource = fs.readFileSync(path.join(root, 'dist/stage.js'), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replace('export function', 'function');
const functions = [...app.matchAll(/^(?:async )?function ([\w$]+)\(/gm)];
function appFunction(name) {
  const i = functions.findIndex(match => match[1] === name);
  assert.ok(i >= 0 && functions[i + 1], `Fixture function: ${name}`);
  return app.slice(functions[i].index, functions[i + 1].index);
}
const results = [];
async function check(name, task) {
  try { results.push({name, pass: true, evidence: await task()}); }
  catch (error) { results.push({name, pass: false, error: error.message}); }
}

await check('Exploded floor layers remain above the stage ground after camera selection', () => {
  class Renderer {
    constructor() { this.shadowMap = {}; }
    setSize() {}
    setPixelRatio() {}
    render() {}
    dispose() {}
  }
  class PMREM {
    fromScene() { return {texture: null, dispose() {}}; }
    dispose() {}
  }
  const ctx = {
    createLandscape, createVillage, createVillageBackdrop, disposeBackdrop, fitVillageBackdrop, VILLAGE_FACES,
    THREE: {...THREE, WebGLRenderer: Renderer, PMREMGenerator: PMREM},
    RoomEnvironment: class { dispose() {} },
    exporting: false, walker: null, roomFocus: null, cameraPreset: 'perspective',
    V: {view: 'finishes'},
    viewport: {dataset: {}, getBoundingClientRect: () => ({width: 960, height: 600})},
    $: () => ({}), updateReferencePeek() {}, syncMobileView() {}, requestRender() {},
  };
  vm.createContext(ctx);
  vm.runInContext(stageSource, ctx);
  ctx.stage = ctx.createStage({width: 960, height: 600});
  ctx.house = makeHouse({...DEFAULT_CONFIG, view: 'finishes', exploded: 1});
  ctx.house.root.updateMatrixWorld(true);
  ctx.visibleBounds = () => new THREE.Box3().setFromObject(ctx.house.root);
  ctx.controls = {target: new THREE.Vector3(), update() {}};
  vm.runInContext(appFunction('setCamera'), ctx);
  try {
    const ground = ctx.stage.scene.children.find(object => object.geometry?.type === 'PlaneGeometry');
    assert.ok(ground, 'Actual stage ground exists');
    ctx.stage.setView('finishes');
    const groundBefore = ground.position.y;
    ctx.setCamera('perspective');
    const floor = new THREE.Box3().setFromObject(ctx.house.groups.floorLayers);
    const evidence = {groundBefore, groundAfter: ground.position.y, floorLayersY: [floor.min.y, floor.max.y]};
    assert.ok(ground.position.y < floor.min.y, JSON.stringify(evidence));
    return evidence;
  } finally { ctx.house.dispose(); ctx.stage.dispose(); }
});

await check('Viewport resize during export is applied when export ends', async () => {
  let rect = {width: 960, height: 600};
  const sizes = [];
  const ctx = {
    stage: {camera: {aspect: 1.6}, resize(w, h) {this.camera.aspect = w / h; sizes.push([w, h]);}},
    exporting: false, currentPage: 'studio', roomFocus: null, house: null, walker: null,
    presentationMode: null, pauseVisit() {}, cameraFlight: {cancel() {}},
    controls: {enabled: true, enableDamping: true, update() {}},
    viewport: {getBoundingClientRect: () => ({...rect})}, matchMedia: () => ({matches: false}),
    requestRender() {}, stopAnimation() {}, syncHistory() {},
    $: () => ({showModal() {}, close() {}}), notify(message) {throw Error(message);},
  };
  vm.createContext(ctx);
  for (const name of ['resizeViewport', 'runExport']) vm.runInContext(appFunction(name), ctx);
  ctx.resizeViewport();
  await ctx.runExport(async () => {rect = {width: 600, height: 900}; ctx.resizeViewport();});
  const evidence = {viewport: rect, canvasSize: sizes.at(-1), cameraAspect: ctx.stage.camera.aspect, expectedAspect: rect.width / rect.height, resizes: sizes.length};
  assert.deepEqual(sizes.at(-1), [600, 900], JSON.stringify(evidence));
  assert.equal(ctx.stage.camera.aspect, rect.width / rect.height);
  assert.equal(ctx.controls.enabled, true);
  assert.equal(ctx.controls.enableDamping, true);
  return evidence;
});

console.log(JSON.stringify({root, passed: results.filter(item => item.pass).length, total: results.length, results}, null, 2));
process.exitCode = results.every(item => item.pass) ? 0 : 1;
