import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// Keep the buildless site's module graph fresh in returning browser sessions.
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const index = path.join(dist, 'index.html');
const html = readFileSync(index, 'utf8');
const mapPattern = /<script type="importmap">([\s\S]*?)<\/script>/;
const match = html.match(mapPattern);
if (!match) throw new Error('The site import map is missing.');
const importMap = JSON.parse(match[1]);
const modules = readdirSync(dist).filter(name => name.endsWith('.js')).sort();
for (const name of modules) {
  const hash = createHash('sha256').update(readFileSync(path.join(dist, name))).digest('hex').slice(0, 16);
  importMap.imports['./' + name] = './' + name + '?v=' + hash;
}
const updated = html
  .replace(mapPattern, '<script type="importmap">' + JSON.stringify(importMap) + '</script>')
  .replace(/(<script type="module" src=")\.?\/?app\.js(?:\?[^" ]*)?("\s*>)/,
    '$1' + importMap.imports['./app.js'] + '$2');
if (updated === html) console.log('Module versions already current (' + modules.length + ').');
else {
  writeFileSync(index, updated);
  console.log('Versioned ' + modules.length + ' application modules.');
}
