import fs from 'node:fs';
import {DATA} from '../dist/data.js';
import {MATERIALS} from '../dist/material-data.js';
import {INTERIOR_REFERENCES} from '../dist/interior-references.js';
import {DEFAULT_CONFIG} from '../dist/configuration.js';
import {sourceLedger} from '../dist/client-tools.js';
import {SOURCE_DIVERGENCES,REVISION} from '../dist/specification.js';

const out=new URL('../dist/assets/product-r8/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const write=(name,value)=>fs.writeFileSync(new URL(name,out),JSON.stringify(value,null,2)+'\n');
write('catalogue.json',{revision:REVISION,compatibility:'Generic catalogue; applicability to the selected variant awaits the commercial proposal.',materials:MATERIALS,swatches:DATA.swatches,kitchens:DATA.kitchens,bathrooms:DATA.bathrooms,interiorReferences:INTERIOR_REFERENCES,initialPresentation:DEFAULT_CONFIG,initialStatus:'Illustrative starting selection, not a documented standard equipment package.',interiorPaint:'No approved colour palette supplied; white photographic reference only.',addons:[{id:'roof',source:'Supplied canopy photograph',dimensions:'estimated',price:'Sob consulta'},{id:'porch',source:'Supplied porch photograph; not identified with catalogue p13 terrace',dimensions:'estimated',price:'Sob consulta'}]});
write('dimensions-and-sources.json',{...sourceLedger(DEFAULT_CONFIG),conflicts:SOURCE_DIVERGENCES,pending:['Dimensioned elevations and sections','Interior clear height, full panel composition, structural sections and connections','Certified useful-area schedule','Water/drainage/electrical/foundation drawings','Actual end-panel stowage, hinges and expansion sequence','Model-specific optional compatibility and standard equipment package','Interior paint palette and measured texture scale','Terrace p13 versus photographed porch applicability']});
console.log('Catalogue and dimension ledger generated.');
