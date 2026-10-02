import {selectedOption,availableOptionTargets,optionTargetLabel,money} from './project-options.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Keep the purchase action and its 3D effect together, even in short sidebars.
export function windowCardMarkup(item,state,project={}){
 const selection=selectedOption(state,item.id),targets=selection?.targets||[],first=targets[0];
 return `<article class="option-card window-card ${selection?'is-selected':''}" data-option-card="${item.id}">
  <div class="window-card-main">
   <div class="window-card-heading"><button class="window-photo" data-lightbox="${esc(item.photo)}" data-label="${esc(item.label)}" aria-label="Ampliar fotografia de ${esc(item.label)}"><img src="${esc(item.photo)}" loading="lazy" alt="${esc(item.label)}"></button><div><h4>${esc(item.label)}</h4><p class="window-unit-price">${money(item.priceCents)} <small>PVP actual · com IVA</small></p></div></div>
   <p class="window-placement-state">${first?`<span>Locais definidos</span>: ${targets.length} / ${selection.quantity}`:selection?'Guardado no projecto · local por definir':'Escolha o local para aplicar no 3D'}</p>
   <div class="window-card-actions"><button class="primary" data-window-editor="${item.id}">${first?'Alterar locais':'Aplicar no 3D'}</button>${first?`<button class="outline" data-test-window="${esc(first)}" aria-pressed="false">Abrir / fechar</button>`:''}</div>
  </div>
  <details class="window-card-details"><summary>Fotografia, detalhes e observações</summary>
   <div class="option-photo"><button data-lightbox="${esc(item.photo)}" data-label="${esc(item.label)}" aria-label="Ampliar fotografia de ${esc(item.label)}"><img src="${esc(item.photo)}" loading="lazy" alt="${esc(item.label)}"></button><small>${esc(item.photoCaption)}</small></div>
   <p class="option-scope">${esc(item.scope)}</p><ul>${item.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
   ${selection?`<p><span>Quantidade pretendida</span>: ${selection.quantity}</p>${targets.map(id=>`<div class="window-assigned"><span>${esc(optionTargetLabel(id))}</span><button class="outline" data-test-window="${esc(id)}" aria-pressed="false">Abrir / fechar</button></div>`).join('')}<label class="project-field"><span>Local pretendido e observações</span><textarea rows="3" maxlength="2400" data-option-note="${item.id}">${esc(project.optionNotes?.[item.id]||'')}</textarea></label><button class="outline" data-toggle-option="${item.id}" aria-pressed="true">Retirar do projecto</button>`:''}
   <p class="option-model-note">Dimensões não publicadas mantêm as medidas ilustrativas do vão. A instalação e as alterações da planta carecem de confirmação.</p>
   ${['window-large','window-alloy','window-thermal','window-projecting','window-tilt-turn'].includes(item.id)?'<p class="option-model-note">Abertura interactiva de apresentação. Mão, ângulos e ferragens por confirmar na proposta.</p>':''}
   ${selection&&targets.length<selection.quantity?'<p class="project-attention">A quantidade inclui artigos sem local no 3D.</p>':''}
   <button class="text-link" data-customize="project">Adicionar planta ou fotografia com observação ↗</button>
   ${item.page?`<a class="text-link" href="assets/opcionais-2026.pdf#page=${item.page}" target="_blank" rel="noopener">Ficha original · preços anteriores ↗</a>`:''}
  </details>
 </article>`;
}

// Draft changes stay inside the dialog. Cancel never changes the quotation.
export function openWindowEditor({item,state,plan,onApply}){
 let dialog=document.querySelector('#window-options');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='window-options';dialog.setAttribute('aria-labelledby','window-editor-title');document.body.append(dialog);}
 const selection=selectedOption(state,item.id),targets=availableOptionTargets(item,plan);
 dialog.innerHTML=`<form class="window-editor-form">
  <header class="window-editor-header"><div><span class="eyebrow">PERSONALIZAR JANELA</span><h2 id="window-editor-title">${esc(item.label)}</h2></div><button class="close" type="button" data-close aria-label="Fechar">×</button></header>
  <div class="window-editor-body"><div class="window-editor-reference"><img src="${esc(item.photo)}" alt="${esc(item.label)}"><div><strong>${money(item.priceCents)}</strong><span>PVP actual · com IVA</span><p>${esc(item.photoCaption)}</p></div></div>
   <fieldset><legend>Onde pretende aplicar?</legend><p>Escolha uma ou mais janelas. A aplicação substitui o artigo actualmente escolhido em cada local.</p><div class="window-location-list">${targets.map(t=>`<label><input id="window-location-${esc(t.id)}" type="checkbox" name="window-location" value="${esc(t.id)}" ${selection?.targets.includes(t.id)?'checked':''}><span>${esc(t.label)}</span></label>`).join('')}</div>${targets.length?'':'<p>Não existem vãos disponíveis nesta configuração. Pode guardar o artigo como pedido personalizado.</p>'}</fieldset>
   <label class="project-field"><span>Quantidade pretendida</span><input id="window-quantity" type="number" min="1" max="${item.maxQuantity}" step="1" required value="${selection?.quantity||1}"></label>
   <p class="window-draft-note" aria-live="polite"></p>
   <p class="option-model-note">Cálculo indicativo: quantidade × PVP actual. Unidade de facturação e inclusão na casa a confirmar na proposta.</p>
   <p class="option-model-note">Dimensões não publicadas mantêm as medidas ilustrativas do vão. A instalação e as alterações da planta carecem de confirmação.</p>
   <p id="window-editor-error" role="alert" hidden>Não foi possível aplicar esta escolha. Reveja os locais e a quantidade.</p>
  </div>
  <footer class="window-editor-footer"><div><span>Total deste artigo</span><strong id="window-draft-total"></strong></div><button id="window-apply" class="primary" type="submit">Aplicar e ver no 3D</button><button class="text-link" id="window-request" type="button">Guardar sem aplicar no 3D</button></footer>
 </form>`;
 const form=dialog.querySelector('form'),quantity=dialog.querySelector('#window-quantity'),apply=dialog.querySelector('#window-apply');
 const selectedTargets=()=>[...dialog.querySelectorAll('[name="window-location"]:checked')].map(x=>x.value);
 function sync(event){
  const count=selectedTargets().length;
  quantity.min=String(Math.max(1,count));
  if((!event||event.target.name==='window-location')&&count>Number(quantity.value))quantity.value=String(count);
  apply.disabled=!count||!quantity.checkValidity();
  dialog.querySelector('#window-draft-total').textContent=quantity.checkValidity()?money(item.priceCents*Number(quantity.value)):'—';
  dialog.querySelector('.window-draft-note').textContent=count?'Os locais seleccionados serão actualizados na casa e no orçamento.':'Escolha o local para aplicar no 3D';
 }
 function save(targets){
  if(!form.reportValidity())return;
  const ok=onApply({targets,quantity:Number(quantity.value)});
  if(ok){
   dialog.close();
   const action=document.querySelector(`[data-window-editor="${CSS.escape(item.id)}"]`),panel=document.querySelector('#config-content'),card=action?.closest('.window-card');
   if(targets.length&&matchMedia('(max-width:900px)').matches){document.querySelector('#viewport')?.scrollIntoView({block:'center'});document.querySelector('#openings-toggle')?.focus({preventScroll:true});}
   else{if(card&&panel){if(getComputedStyle(panel).overflowY==='auto')panel.scrollTop+=card.getBoundingClientRect().top-panel.getBoundingClientRect().top;else action.scrollIntoView({block:'nearest'});}action?.focus({preventScroll:true});}
  }
  else dialog.querySelector('#window-editor-error').hidden=false;
 }
 form.addEventListener('change',sync);quantity.addEventListener('input',sync);
 form.addEventListener('submit',event=>{event.preventDefault();if(selectedTargets().length)save(selectedTargets());});
 dialog.querySelector('#window-request').onclick=()=>save([]);
 sync();dialog.showModal();dialog.querySelector('[name="window-location"]')?.focus({preventScroll:true});
}
