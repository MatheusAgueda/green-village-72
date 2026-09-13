import {createHash} from 'node:crypto';
import {closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Track bounded source objects; publish the exact validated, complete MP4 files.
const project = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(project, 'media-sources/r15');
const outputRoot = process.argv[2] ? path.resolve(process.argv[2]) : project;
const manifest = JSON.parse(readFileSync(path.join(source, 'manifest.json'), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
function inside(root, relative) {
  const target = path.resolve(root, relative), rel = path.relative(root, target);
  if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) throw new Error('Media path escapes its root.');
  return target;
}
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) throw new Error('Invalid media source manifest.');
for (const file of manifest.files) {
  if (!file.output.startsWith('dist/assets/reference-videos-r15/') || !file.output.endsWith('.mp4')) throw new Error('Unexpected media output.');
  const target = inside(outputRoot, file.output);
  if (existsSync(target)) {
    const current = readFileSync(target);
    if (current.length === file.bytes && sha256(current) === file.sha256) {
      console.log('Verified existing media: ' + path.basename(target));
      continue;
    }
  }
  mkdirSync(path.dirname(target), {recursive: true});
  const partial = target + '.partial', hash = createHash('sha256');
  let handle = openSync(partial, 'w'), total = 0;
  try {
    for (const chunk of file.chunks) {
      const bytes = readFileSync(inside(source, chunk.path));
      if (bytes.length > 8 * 1024 * 1024 || bytes.length !== chunk.bytes || sha256(bytes) !== chunk.sha256) throw new Error('Invalid media chunk: ' + chunk.path);
      let offset = 0;
      while (offset < bytes.length) offset += writeSync(handle, bytes, offset, bytes.length - offset);
      total += bytes.length; hash.update(bytes);
    }
    if (total !== file.bytes || hash.digest('hex') !== file.sha256) throw new Error('Assembled media hash mismatch: ' + file.output);
    closeSync(handle); handle = null;
    renameSync(partial, target);
    console.log('Assembled verified media: ' + path.basename(target));
  } finally {
    if (handle !== null) closeSync(handle);
    rmSync(partial, {force: true});
  }
}
