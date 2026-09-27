import assert from 'node:assert/strict';
import {translateText,resolveLanguage} from '../dist/i18n.js';
import {GENERATED_FILMS,generatedGalleryMarkup} from '../dist/generated-gallery.js';
import {OPTIONAL_ITEMS} from '../dist/project-options.js';
let passed=0;
const check=(label,run)=>{run();passed++;console.log('PASS '+label);};
check('R23 client and flooring controls have complete EN/ES translations',()=>{
 for(const message of ['Nome do cliente','Carregar planta definida pelo cliente','Adicionar fotografias de referência','Pedidos específicos do cliente','Descrição do pedido','Divisão ou local pretendido','Medidas e observações','Pedir janela extra na cozinha','Acrescentar outro pedido','Pavimento vinílico (incluído)','Referência por confirmar · visualização neutra sem amostra','A guardar a ficha…','Rever artigos e custos ↗']){
  assert.notEqual(translateText(message,'en'),message,message);
  assert.notEqual(translateText(message,'es'),message,message);
  assert.equal(translateText(message,'pt'),message);
 }
});
check('quantity and accessible labels use bounded parameter translations',()=>{
 assert.equal(translateText('Todos os 26 artigos','en'),'All 26 items');
 assert.equal(translateText('Os meus adicionais (4)','es'),'Mis extras (4)');
 assert.equal(translateText('2 de 3 locais definidos','en'),'2 of 3 locations assigned');
 assert.equal(translateText('Ampliar fotografia de Janela grande corte térmico','en'),'Enlarge photograph of Large thermally broken window');
 assert.equal(translateText('Descarregar Casa de banho em MP4','es'),'Descargar Baño en MP4');
 assert.equal(translateText('01 / CASA DE BANHO','en'),'01 / BATHROOM');
 assert.equal(translateText('  Nome do cliente  ','en'),'  Client name  ');
 assert.equal(translateText('unchanged-custom-name <&>','en'),'unchanged-custom-name <&>');
});
check('all current optional-item names translate',()=>{
 for(const item of OPTIONAL_ITEMS){assert.notEqual(translateText(item.label,'en'),item.label,item.id);assert.notEqual(translateText(item.label,'es'),item.label,item.id);}
});
check('gallery has four exclusive categories and six unique media',()=>{
 assert.deepEqual([...new Set(GENERATED_FILMS.map(item=>item.category))],['Exterior','Cozinha','Casa de banho','Terraços']);
 assert.equal(GENERATED_FILMS.length,6);assert.equal(new Set(GENERATED_FILMS.map(item=>item.asset)).size,6);
 const markup=generatedGalleryMarkup();
 assert.equal((markup.match(/<video /g)||[]).length,6);
 assert.equal((markup.match(/class="generated-film-section"/g)||[]).length,4);
 const visible=markup.replace(/<[^>]+>/g,' ');
 assert.doesNotMatch(visible,/\b(?:IA|Veo|Flow|Gemini)\b/i);
});
check('shared language links accept only PT/EN/ES and otherwise retain the saved language',()=>{
 for(const lang of ['pt','en','es'])assert.equal(resolveLanguage('?room=bathroom&lang='+lang,'pt'),lang);
 for(const search of ['','?room=kitchen','?lang=fr','?lang=','?lang=javascript%3Aalert(1)'])assert.equal(resolveLanguage(search,'es'),'es');
 assert.equal(resolveLanguage('?lang=EN','en'),'en');
 assert.equal(resolveLanguage('?lang=invalid','invalid'),'pt');
});
console.log(JSON.stringify({passed,failed:0}));
