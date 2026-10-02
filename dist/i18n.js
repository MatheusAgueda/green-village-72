import {COMMERCIAL_TRANSLATIONS} from './commercial-terms.js';
const STRINGS={
  en:{'Vídeo de apresentação · Sem áudio':'Presentation video · No audio','Personalizar':'Customize','O modelo':'The model','Galeria de vídeos':'Video gallery','Vistas 4K':'4K views','Plantas':'Floor plans','Filmes':'Films','Ficha técnica':'Technical sheet','O meu resumo':'My summary','Idioma':'Language','COLECÇÃO EXPANSÍVEL / 40 PÉS':'EXPANDABLE COLLECTION / 40 FT','Explore o espaço. Escolha os materiais. Dê-lhe a sua identidade.':'Explore the space. Choose the materials. Make it yours.','O espaço. Os materiais. A sua escolha.':'The space. The materials. Your choice.','Exterior':'Exterior','Interior':'Interior','Estrutura':'Structure','Camadas':'Layers','Água':'Water','Electricidade':'Electricity','Entrar na casa':'Enter the house','Aérea':'Aerial','Planta 3D':'3D plan','Cozinha':'Kitchen','Casa de banho':'Bathroom','Ajustar vista':'Adjust view','Personalize a sua casa.':'Customize your home.','Acabamentos':'Finishes','Planta':'Floor plan','Banho':'Bath','Cobertura':'Roof','Adicionais':'Extras','Cliente':'Client','Piso':'Floor','O modelo, em grande formato':'The model, in large format','Entre. Veja cada detalhe.':'Step inside. See every detail.','UMA CASA. SETE POSSIBILIDADES.':'ONE HOME. SEVEN POSSIBILITIES.','Encontre o seu espaço.':'Find your space.','GALERIA DE VÍDEOS':'VIDEO GALLERY','A casa ganha movimento.':'The home comes to life.','Exterior, interiores e terraços.':'Exterior, interiors and terraces.','Seis filmes organizados por ambiente.':'Six films organised by area.','Preparar o meu resumo':'Prepare my summary','Personalizar a minha casa':'Customize my home','Consultar fotografias e fontes':'View photos and sources','O que sustenta o modelo.':'What supports the model.','Medidas confirmadas, hipóteses identificadas':'Confirmed measurements, identified assumptions','e evidências da revisão.':'and revision evidence.','Descarregar vídeo':'Download video','Sem áudio':'No audio','Vídeo de apresentação':'Presentation video','Ver a expansão':'View the expansion','Escolher os acabamentos':'Choose finishes','Explore a cozinha':'Explore the kitchen','Experimentar telhado e alpendre':'Try roof and terrace','Rever configuração':'Review configuration',
  'CONHEÇA A CASA':'DISCOVER THE HOUSE','Veja a expansão e os filmes de apresentação.':'See the expansion and presentation films.','O modelo ↗':'The model ↗','Galeria de vídeos ↗':'Video gallery ↗','Catálogo de opcionais ↓ PDF':'Extras catalogue ↓ PDF',
  'GREEN VILLAGE / COLECÇÃO EXPANSÍVEL':'GREEN VILLAGE / EXPANDABLE COLLECTION','Um espaço para viver.':'A space to live.','À sua maneira.':'Your way.','Um módulo central e duas alas expansíveis. Sete distribuições para pensar a sala, os quartos e a forma como quer usar a sua casa.':'A central module and two expandable wings. Seven layouts to think about the living room, bedrooms and how you want to use your home.','Personalizar a minha casa ↗':'Customize my home ↗','Ver a expansão ↓':'See the expansion ↓','Designação comercial':'Commercial designation','Dimensões exteriores':'External dimensions','Distribuições':'Layouts',
  'DA PLANTA AO ÚLTIMO ACABAMENTO':'FROM FLOOR PLAN TO FINAL FINISH','O seu projecto começa nas escolhas.':'Your project starts with your choices.','Compare referências reais e veja a sua combinação no modelo 3D. O exterior, o pavimento, a cozinha e a casa de banho têm escolhas independentes.':'Compare real references and see your combination on the 3D model. The exterior, flooring, kitchen and bathroom have independent choices.',
  '01 / ESPAÇO':'01 / SPACE','Uma planta para cada forma de viver.':'A floor plan for every way of living.','Do T0 aberto às opções com quatro quartos. Todas as sete plantas fornecidas incluem uma casa de banho.':'From the open T0 to four-bedroom options. All seven layouts include a bathroom.','Ver as sete distribuições ↗':'See the seven layouts ↗',
  '02 / MATERIAIS':'02 / MATERIALS','Textura, cor e personalidade.':'Texture, colour and personality.','51 referências de exterior, 12 pavimentos SPC e oito revestimentos UV para o banho, extraídos do catálogo original.':'51 exterior references, 12 SPC floors and eight UV coatings for the bathroom, from the original catalogue.','Escolher os acabamentos ↗':'Choose the finishes ↗',
  '03 / AMBIENTES':'03 / ATMOSPHERES','Uma casa que se revela por dentro.':'A home that reveals itself from the inside.','15 cozinhas e 17 ambientes de banho de referência. Explore bancadas, móveis, torneiras e resguardos em detalhe.':'15 kitchens and 17 bathroom settings. Explore worktops, cabinets, taps and shower screens in detail.','Explorar a cozinha ↗':'Explore the kitchen ↗',
  'O EXTERIOR TAMBÉM SE VIVE':'THE EXTERIOR IS ALSO FOR LIVING','Abra a porta.':'Open the door.','Fique mais um pouco.':'Stay a little longer.','Explore referências de telhado e terraço em vídeo. No configurador, compare os volumes adicionais e prepare as suas escolhas.':'Explore roof and terrace references in video. In the configurator, compare additional volumes and prepare your choices.','Experimentar telhado e alpendre ↗':'Try roof and porch ↗',
  'DO TRANSPORTE À CASA ABERTA':'FROM TRANSPORT TO OPEN HOUSE','O espaço, passo a passo.':'The space, step by step.','Fechado. Alas abertas. Paredes laterais erguidas. Frente e traseira abertas.':'Closed. Wings open. Side walls raised. Front and back open.','EXPANSÃO INTERACTIVA':'INTERACTIVE EXPANSION','Contentor fechado':'Closed container',
  'FILMES DE APRESENTAÇÃO':'PRESENTATION FILMS','Seis visualizações a partir das fotografias fornecidas.':'Six visualizations from the supplied photographs.','Explorar a galeria de vídeos ↗':'Explore the video gallery ↗',
  'Seis filmes organizados por ambiente.':'Six films organized by area.',
  'PARA PREPARAR A SUA ESCOLHA':'TO PREPARE YOUR CHOICE','Clareza em cada etapa.':'Clarity at every step.','O que posso personalizar?':'What can I customize?','O que significam os 72 m²?':'What do the 72 m² mean?','Como ficam as minhas escolhas no orçamento?':'How do my choices affect the budget?','As imagens representam a casa final?':'Do the images represent the final house?',
  'Planta, fachada, pavimento, referência e implantação de cozinha, ambiente e distribuição da casa de banho, telhado e alpendre. A combinação seleccionada fica guardada neste dispositivo e pode ser exportada.':'Layout, facade, flooring, kitchen reference and layout, bathroom setting and layout, roof and porch. The selected combination is saved on this device and can be exported.',
  '72 m² é a área indicada na ficha do fabricante. As plantas indicam 11,80 × 6,22 m exteriores, equivalentes a um rectângulo de 73,396 m², e o fabricante indica 11,54 × 6,06 m interiores. A área útil certificada não foi fornecida; as áreas de cada divisão são estimativas.':'72 m² is the area stated on the manufacturer\'s specification sheet. The plans show 11.80 × 6.22 m outside, equivalent to a 73.396 m² rectangle, and the manufacturer states 11.54 × 6.06 m inside. No certified useful area has been supplied; individual room areas are estimates.',
  'Guarde o resumo em PDF com planta, materiais e referências. O preço da casa inclui o transporte para Portugal Continental. A Green Village confirma a compatibilidade, os equipamentos incluídos, a instalação e o preço final na proposta comercial.':'Save the summary as PDF with layout, materials and references. The home price includes transport to mainland Portugal. Green Village confirms compatibility, included equipment, installation and the final price in the commercial proposal.',
  'O 3D é um modelo de apresentação reconstruído das plantas e fotografias. As amostras digitais vêm do catálogo; a luz e o ecrã alteram a percepção da cor. Medidas interiores e detalhes não cotados são estimados. Instalações e mecanismo exacto de expansão aguardam documentação.':'The 3D is a presentation model reconstructed from plans and photographs. Digital samples come from the catalogue; light and screen affect colour perception. Interior dimensions and unquoted details are estimated. Installations and exact expansion mechanism await documentation.',
  'A SUA CASA COMEÇA AQUI':'YOUR HOME STARTS HERE','Escolha. Explore. Guarde.':'Choose. Explore. Save.','Prepare uma configuração que possa mostrar e discutir com a Green Village.':'Prepare a configuration you can show and discuss with Green Village.','Preparar o meu resumo ↗':'Prepare my summary ↗',
  'MEDIDAS, DOCUMENTOS E REFERÊNCIAS':'MEASUREMENTS, DOCUMENTS AND REFERENCES','Medidas confirmadas, hipóteses identificadas e evidências da revisão.':'Confirmed measurements, identified assumptions and revision evidence.','Fotografias originais de referência':'Original reference photographs',
  'O ESPAÇO EM MOVIMENTO':'THE SPACE IN MOTION','Uma casa que se revela.':'A home that reveals itself.','Da chegada ao terreno à visita interior.':'From arrival to the interior tour.','Vídeos do YouTube com áudio. Visitas e animações locais sem áudio.':'YouTube videos with audio. Local tours and animations without audio.',
  'TRANSPORTE, ENTREGA E MONTAGEM':'TRANSPORT, DELIVERY AND ASSEMBLY','Da chegada à instalação.':'From arrival to installation.','As duas referências indicadas pela Green Village, a partir dos momentos seleccionados.':'The two references indicated by Green Village, from the selected moments.',
  'VISITAS E ANIMAÇÃO 3D':'TOURS AND 3D ANIMATION','Explore o modelo em movimento.':'Explore the model in motion.',
  'VISUALIZAÇÕES ILUSTRATIVAS':'ILLUSTRATIVE VISUALIZATIONS','Os filmes de apresentação têm a sua própria galeria.':'The presentation films have their own gallery.','Abrir galeria de vídeos ↗':'Open video gallery ↗',
  'VÍDEOS FORNECIDOS':'SUPPLIED VIDEOS','Referências reais, em detalhe.':'Real references, in detail.','Vídeos enviados pela Green Village, com acesso directo aos momentos assinalados. Reprodução e descarga sem áudio.':'Videos sent by Green Village, with direct access to marked moments. Playback and download without audio.',
  'ESCOLHAS EM TEMPO REAL':'REAL-TIME CHOICES',
  'O SEU ESPAÇO, EM PERSPECTIVA':'YOUR SPACE, IN PERSPECTIVE','Vista exterior':'Exterior view','Duas alas. Uma nova forma de habitar.':'Two wings. A new way of living.','A preparar o modelo 3D…':'Preparing the 3D model…','Ecrã inteiro':'Full screen','Repor perspectiva':'Reset perspective','Aproximar':'Zoom in','Afastar':'Zoom out','Vista superior':'Top view','Exportar imagem 4K da configuração':'Export 4K image of your configuration','Arraste para explorar o modelo':'Drag to explore the model',
  'Arraste para explorar':'Drag to explore','Roda para aproximar':'Scroll to zoom',
  'Explorar':'Explore','Sair da visita':'Exit tour','Arraste para olhar · WASD ou setas para andar':'Drag to look · WASD or arrows to walk','Altura de observação: 1,60 m (navegação)':'Observation height: 1.60 m (navigation)',
  'Identificar componentes':'Identify components','Visibilidade e corte':'Visibility and cut','Personalizar ↓':'Customize ↓','Tentar texturas ↻':'Retry textures ↻','Sobre o modelo':'About the model',
  'Fachadas':'Facades','Mobiliário':'Furniture','Portas abertas':'Open doors',
  'Desfazer':'Undo','Refazer':'Redo','Comparar A/B':'Compare A/B','Guardar':'Save','Recuperar':'Recover','Repor':'Reset','A sua casa começa aqui.':'Your home starts here.','Rever configuração ↗':'Review configuration ↗',
  'Contactar a Green Village':'Contact Green Village','Catálogo 2026 ↗':'Catalogue 2026 ↗',
  'O MODEL, EM GRANDE FORMATO':'THE MODEL, IN LARGE FORMAT','Imagens do modelo 3D em 3 840 × 2 160 píxeis. Abra uma vista, guarde-a em 4K ou experimente a configuração representada.':'3D model images in 3,840 × 2,160 pixels. Open a view, save it in 4K or try the displayed configuration.',
  'Todas as vistas':'All views','Construção':'Construction',
  'Plantas originais do ficheiro fornecido.':'Original plans from the supplied file.',
  'O seu projecto, num só lugar.':'Your project, in one place.','Exportar JSON ↓':'Export JSON ↓','Importar JSON ↑':'Import JSON ↑','Copiar ligação':'Copy link','Descarregar modelo GLB ↓':'Download GLB model ↓','Ficha do cliente em PDF ↓':'Client sheet PDF ↓',
  'Visualizações ilustrativas: não reproduzem a configuração seleccionada nem definem os equipamentos incluídos de série. Todos sem áudio.':'Illustrative visualizations: they do not reproduce the selected configuration nor define the equipment included as standard. All without audio.',
  'Terraço branco, visualização ilustrativa.':'White terrace, illustrative visualization.',
  'Visualização ilustrativa a partir da fotografia fornecida.':'Illustrative visualization from the supplied photograph.',
  'Visualização ilustrativa. Variante, medidas e adequação à sua unidade a confirmar na proposta.':'Illustrative visualization. Variant, dimensions and suitability for your unit to be confirmed in the proposal.',
  'Ir para o configurador':'Skip to configurator',
  'Navegação principal':'Main navigation',
  'DO DETALHE À SUA ESCOLHA':'FROM DETAIL TO YOUR CHOICE','A próxima combinação é sua.':'The next combination is yours.','Voltar a personalizar ↗':'Back to customizing ↗',
  'Terraços':'Terraces',
  'Exterior creme':'Cream exterior','Cozinha em L':'L-shaped kitchen','Casa de banho':'Bathroom','Terraço preto':'Black terrace','Terraço cinzento':'Grey terrace','Terraço branco':'White terrace',
  'Uma aproximação à fachada creme e à caixilharia escura.':'A close-up of the cream facade and dark window frames.','Uma cozinha de referência com móveis claros e bancada escura.':'A reference kitchen with light cabinets and dark worktop.','Um enquadramento vertical do resguardo e do revestimento com padrão de mármore.':'A vertical framing of the shower screen and marble-pattern wall cladding.','Estrutura e guardas escuras numa referência de terraço coberto.':'Dark structure and railings in a covered terrace reference.','Uma aproximação frontal ao terraço e à entrada central.':'A frontal approach to the terrace and the central entrance.','Vista lateral de uma referência com fachada amarela e guarda branca.':'Side view of a reference with yellow facade and white railing.',
  'Pavimento':'Flooring','Cor livre':'Free colour','O pavimento vinílico está incluído no preço base. O pavimento SPC tem um custo adicional de 1 200 €.':'Vinyl flooring is included in the base price. SPC flooring has an additional cost of €1,200.','12 acabamentos SPC do catálogo · escolha uma amostra para a visualizar.':'12 SPC finishes from the catalogue · choose a sample to preview.',
  'Pavimento SPC (+1 200 €)':'SPC Flooring (+€1,200)','Pavimento SPC':'SPC Flooring',
  'O navegador não permitiu guardar neste dispositivo. Pode exportar um ficheiro JSON.':'The browser did not allow saving on this device. You can export a JSON file.','A ligação não pôde ser actualizada. Use Partilhar para copiar as escolhas actuais.':'The link could not be updated. Use Share to copy your current choices.','Configuração actualizada.':'Configuration updated.','Aguarde a exportação em curso.':'Please wait for the ongoing export.',
  'designação comercial':'commercial designation','7 distribuições':'7 layouts',
  'Sobre este modelo.':'About this model.',
  'Expandível 72 · 40 pés':'Expandable 72 · 40 ft','Modelo':'Model','Referência em falta':'Reference missing','Paredes interiores':'Interior walls','Revestimento do banho':'Bathroom cladding','Ambiente de banho':'Bathroom setting','Texturas':'Textures','Luz':'Light','Telhado adicional':'Additional roof','Alpendre':'Porch','Subtotal indicativo de adicionais':'Indicative extras subtotal','Personalizações sob orçamento':'Custom adaptations under budget',
  'Seleccionado · sob consulta':'Selected · upon request','Não seleccionado':'Not selected','Seleccionado · confirmar variante na lista de adicionais':'Selected · confirm variant in the extras list','Nenhum seleccionado':'None selected','Nenhuma alteração ao standard seleccionada':'No changes to standard selected','preço base e total por confirmar':'base price and total to be confirmed',
  'Sem cozinha representada':'No kitchen represented','Linear':'Linear','Em L':'L-shaped','Com ilha':'With island','Em U':'U-shaped','Distribuição da planta (aproximada)':'Layout distribution (approximate)','Alternativa espelhada (proposta)':'Mirrored alternative (proposal)',
  'Recorte original, sem tratamento de cor':'Original crop, no colour treatment','Preparação de emendas R3':'R3 seam preparation','Cor digital da amostra':'Digital sample colour','Neutra':'Neutral','Fachada':'Facade',
  'Revestimento UV do banho':'Bathroom UV cladding','local por definir':'location to be defined'
  },
  es:{'Vídeo de apresentação · Sem áudio':'Vídeo de presentación · Sin audio','Personalizar':'Personalizar','O modelo':'El modelo','Galeria de vídeos':'Galería de vídeos','Vistas 4K':'Vistas 4K','Plantas':'Planos','Filmes':'Películas','Ficha técnica':'Ficha técnica','O meu resumo':'Mi resumen','Idioma':'Idioma','COLECÇÃO EXPANSÍVEL / 40 PÉS':'COLECCIÓN EXPANDIBLE / 40 PIES','Explore o espaço. Escolha os materiais. Dê-lhe a sua identidade.':'Explora el espacio. Elige los materiales. Hazla tuya.','O espaço. Os materiais. A sua escolha.':'El espacio. Los materiales. Tu elección.','Exterior':'Exterior','Interior':'Interior','Estrutura':'Estructura','Camadas':'Capas','Água':'Agua','Electricidade':'Electricidad','Entrar na casa':'Entrar en la casa','Aérea':'Aérea','Planta 3D':'Plano 3D','Cozinha':'Cocina','Casa de banho':'Baño','Ajustar vista':'Ajustar vista','Personalize a sua casa.':'Personaliza tu casa.','Acabamentos':'Acabados','Planta':'Plano','Banho':'Baño','Cobertura':'Cubierta','Adicionais':'Extras','Cliente':'Cliente','Piso':'Suelo','O modelo, em grande formato':'El modelo, en gran formato','Entre. Veja cada detalhe.':'Entra. Mira cada detalle.','UMA CASA. SETE POSSIBILIDADES.':'UNA CASA. SIETE POSIBILIDADES.','Encontre o seu espaço.':'Encuentra tu espacio.','GALERIA DE VÍDEOS':'GALERÍA DE VÍDEOS','A casa ganha movimento.':'La casa cobra vida.','Exterior, interiores e terraços.':'Exterior, interiores y terrazas.','Seis filmes organizados por ambiente.':'Seis vídeos organizados por espacio.','Preparar o meu resumo':'Preparar mi resumen','Personalizar a minha casa':'Personalizar mi casa','Consultar fotografias e fontes':'Ver fotos y fuentes','O que sustenta o modelo.':'Qué sustenta el modelo.','Medidas confirmadas, hipóteses identificadas':'Medidas confirmadas, hipótesis identificadas','e evidências da revisão.':'y evidencias de la revisión.','Descarregar vídeo':'Descargar vídeo','Sem áudio':'Sin audio','Vídeo de apresentação':'Vídeo de presentación','Ver a expansão':'Ver la expansión','Escolher os acabamentos':'Elegir acabados','Explore a cozinha':'Explorar la cocina','Experimentar telhado e alpendre':'Probar cubierta y terraza','Rever configuração':'Revisar configuración',
  'CONHEÇA A CASA':'CONOZCA LA CASA','Veja a expansão e os filmes de apresentação.':'Vea la expansión y las películas de presentación.','O modelo ↗':'El modelo ↗','Galeria de vídeos ↗':'Galería de vídeos ↗','Catálogo de opcionais ↓ PDF':'Catálogo de opcionales ↓ PDF',
  'GREEN VILLAGE / COLECÇÃO EXPANSÍVEL':'GREEN VILLAGE / COLECCIÓN EXPANDIBLE','Um espaço para viver.':'Un espacio para vivir.','À sua maneira.':'A su manera.','Um módulo central e duas alas expansíveis. Sete distribuições para pensar a sala, os quartos e a forma como quer usar a sua casa.':'Un módulo central y dos alas expandibles. Siete distribuciones para pensar el salón, los dormitorios y cómo quiere usar su casa.','Personalizar a minha casa ↗':'Personalizar mi casa ↗','Ver a expansão ↓':'Ver la expansión ↓','Designação comercial':'Designación comercial','Dimensões exteriores':'Dimensiones exteriores','Distribuições':'Distribuciones',
  'DA PLANTA AO ÚLTIMO ACABAMENTO':'DEL PLANO AL ÚLTIMO ACABADO','O seu projecto começa nas escolhas.':'Su proyecto empieza en las elecciones.','Compare referências reais e veja a sua combinação no modelo 3D. O exterior, o pavimento, a cozinha e a casa de banho têm escolhas independentes.':'Compare referencias reales y vea su combinación en el modelo 3D. El exterior, el pavimento, la cocina y el baño tienen opciones independientes.',
  '01 / ESPAÇO':'01 / ESPACIO','Uma planta para cada forma de viver.':'Un plano para cada forma de vivir.','Do T0 aberto às opções com quatro quartos. Todas as sete plantas fornecidas incluem uma casa de banho.':'Desde el T0 abierto hasta las opciones con cuatro dormitorios. Los siete planos incluyen un baño.','Ver as sete distribuições ↗':'Ver las siete distribuciones ↗',
  '02 / MATERIAIS':'02 / MATERIALES','Textura, cor e personalidade.':'Textura, color y personalidad.','51 referências de exterior, 12 pavimentos SPC e oito revestimentos UV para o banho, extraídos do catálogo original.':'51 referencias de exterior, 12 pavimentos SPC y ocho revestimientos UV para el baño, del catálogo original.','Escolher os acabamentos ↗':'Elegir los acabados ↗',
  '03 / AMBIENTES':'03 / AMBIENTES','Uma casa que se revela por dentro.':'Una casa que se revela por dentro.','15 cozinhas e 17 ambientes de banho de referência. Explore bancadas, móveis, torneiras e resguardos em detalhe.':'15 cocinas y 17 ambientes de baño. Explore encimeras, muebles, grifos y mamparas en detalle.','Explorar a cozinha ↗':'Explorar la cocina ↗',
  'O EXTERIOR TAMBÉM SE VIVE':'EL EXTERIOR TAMBIÉN SE VIVE','Abra a porta.':'Abra la puerta.','Fique mais um pouco.':'Quédese un poco más.','Explore referências de telhado e terraço em vídeo. No configurador, compare os volumes adicionais e prepare as suas escolhas.':'Explore referencias de tejado y terraza en vídeo. En el configurador, compare los volúmenes adicionales y prepare sus opciones.','Experimentar telhado e alpendre ↗':'Probar tejado y porche ↗',
  'DO TRANSPORTE À CASA ABERTA':'DEL TRANSPORTE A LA CASA ABIERTA','O espaço, passo a passo.':'El espacio, paso a paso.','Fechado. Alas abertas. Paredes laterais erguidas. Frente e traseira abertas.':'Cerrado. Alas abiertas. Paredes laterales levantadas. Frente y trasera abiertas.','EXPANSÃO INTERACTIVA':'EXPANSIÓN INTERACTIVA','Contentor fechado':'Contenedor cerrado',
  'FILMES DE APRESENTAÇÃO':'PELÍCULAS DE PRESENTACIÓN','Seis visualizações a partir das fotografias fornecidas.':'Seis visualizaciones a partir de las fotografías suministradas.','Explorar a galeria de vídeos ↗':'Explorar la galería de vídeos ↗',
  'Seis filmes organizados por ambiente.':'Seis vídeos organizados por espacio.',
  'PARA PREPARAR A SUA ESCOLHA':'PARA PREPARAR SU ELECCIÓN','Clareza em cada etapa.':'Claridad en cada etapa.','O que posso personalizar?':'¿Qué puedo personalizar?','O que significam os 72 m²?':'¿Qué significan los 72 m²?','Como ficam as minhas escolhas no orçamento?':'¿Cómo afectan mis opciones al presupuesto?','As imagens representam a casa final?':'¿Las imágenes representan la casa final?',
  'Planta, fachada, pavimento, referência e implantação de cozinha, ambiente e distribuição da casa de banho, telhado e alpendre. A combinação seleccionada fica guardada neste dispositivo e pode ser exportada.':'Plano, fachada, pavimento, referencia e implantación de cocina, ambiente y distribución del baño, tejado y porche. La combinación seleccionada se guarda en este dispositivo y puede exportarse.',
  '72 m² é a área indicada na ficha do fabricante. As plantas indicam 11,80 × 6,22 m exteriores, equivalentes a um rectângulo de 73,396 m², e o fabricante indica 11,54 × 6,06 m interiores. A área útil certificada não foi fornecida; as áreas de cada divisão são estimativas.':'72 m² es la superficie indicada en la ficha del fabricante. Los planos indican 11,80 × 6,22 m exteriores, equivalentes a un rectángulo de 73,396 m², y el fabricante indica 11,54 × 6,06 m interiores. No se ha facilitado el área útil certificada; las áreas de cada estancia son estimaciones.',
  'Guarde o resumo em PDF com planta, materiais e referências. O preço da casa inclui o transporte para Portugal Continental. A Green Village confirma a compatibilidade, os equipamentos incluídos, a instalação e o preço final na proposta comercial.':'Guarde el resumen en PDF con plano, materiales y referencias. El precio de la casa incluye el transporte a Portugal continental. Green Village confirma la compatibilidad, los equipos incluidos, la instalación y el precio final en la propuesta comercial.',
  'O 3D é um modelo de apresentação reconstruído das plantas e fotografias. As amostras digitais vêm do catálogo; a luz e o ecrã alteram a percepção da cor. Medidas interiores e detalhes não cotados são estimados. Instalações e mecanismo exacto de expansão aguardam documentação.':'El 3D es un modelo de presentación reconstruido a partir de los planos y fotografías. Las muestras digitales provienen del catálogo; la luz y la pantalla alteran la percepción del color. Medidas interiores y detalles no acotados son estimaciones. Instalaciones y mecanismo exacto de expansión pendientes de documentación.',
  'A SUA CASA COMEÇA AQUI':'SU CASA EMPIEZA AQUÍ','Escolha. Explore. Guarde.':'Elija. Explore. Guarde.','Prepare uma configuração que possa mostrar e discutir com a Green Village.':'Prepare una configuración para mostrar y discutir con Green Village.','Preparar o meu resumo ↗':'Preparar mi resumen ↗',
  'MEDIDAS, DOCUMENTOS E REFERÊNCIAS':'MEDIDAS, DOCUMENTOS Y REFERENCIAS','Medidas confirmadas, hipóteses identificadas e evidências da revisão.':'Medidas confirmadas, hipótesis identificadas y evidencias de la revisión.','Fotografias originais de referência':'Fotografías originales de referencia',
  'O ESPAÇO EM MOVIMENTO':'EL ESPACIO EN MOVIMIENTO','Uma casa que se revela.':'Una casa que se revela.','Da chegada ao terreno à visita interior.':'Desde la llegada al terreno a la visita interior.','Vídeos do YouTube com áudio. Visitas e animações locais sem áudio.':'Vídeos de YouTube con audio. Visitas y animaciones locales sin audio.',
  'TRANSPORTE, ENTREGA E MONTAGEM':'TRANSPORTE, ENTREGA Y MONTAJE','Da chegada à instalação.':'Desde la llegada hasta la instalación.','As duas referências indicadas pela Green Village, a partir dos momentos seleccionados.':'Las dos referencias indicadas por Green Village, a partir de los momentos seleccionados.',
  'VISITAS E ANIMAÇÃO 3D':'VISITAS Y ANIMACIÓN 3D','Explore o modelo em movimento.':'Explore el modelo en movimiento.',
  'VISUALIZAÇÕES ILUSTRATIVAS':'VISUALIZACIONES ILUSTRATIVAS','Os filmes de apresentação têm a sua própria galeria.':'Las películas de presentación tienen su propia galería.','Abrir galeria de vídeos ↗':'Abrir galería de vídeos ↗',
  'VÍDEOS FORNECIDOS':'VÍDEOS SUMINISTRADOS','Referências reais, em detalhe.':'Referencias reales, en detalle.','Vídeos enviados pela Green Village, com acesso directo aos momentos assinalados. Reprodução e descarga sem áudio.':'Vídeos enviados por Green Village, con acceso directo a los momentos señalados. Reproducción y descarga sin audio.',
  'ESCOLHAS EM TEMPO REAL':'OPCIONES EN TIEMPO REAL',
  'O SEU ESPAÇO, EM PERSPECTIVA':'SU ESPACIO, EN PERSPECTIVA','Vista exterior':'Vista exterior','Duas alas. Uma nova forma de habitar.':'Dos alas. Una nueva forma de habitar.','A preparar o modelo 3D…':'Preparando el modelo 3D…','Ecrã inteiro':'Pantalla completa','Repor perspectiva':'Restablecer perspectiva','Aproximar':'Acercar','Afastar':'Alejar','Vista superior':'Vista superior','Exportar imagem 4K da configuração':'Exportar imagen 4K de su configuración','Arraste para explorar o modelo':'Arrastre para explorar el modelo',
  'Arraste para explorar':'Arrastre para explorar','Roda para aproximar':'Rueda para acercar',
  'Explorar':'Explorar','Sair da visita':'Salir de la visita','Arraste para olhar · WASD ou setas para andar':'Arrastre para mirar · WASD o flechas para caminar','Altura de observação: 1,60 m (navegação)':'Altura de observación: 1,60 m (navegación)',
  'Identificar componentes':'Identificar componentes','Visibilidade e corte':'Visibilidad y corte','Personalizar ↓':'Personalizar ↓','Tentar texturas ↻':'Reintentar texturas ↻','Sobre o modelo':'Sobre el modelo',
  'Fachadas':'Fachadas','Mobiliário':'Mobiliario','Portas abertas':'Puertas abiertas',
  'Desfazer':'Deshacer','Refazer':'Rehacer','Comparar A/B':'Comparar A/B','Guardar':'Guardar','Recuperar':'Recuperar','Repor':'Restablecer','A sua casa começa aqui.':'Su casa empieza aquí.','Rever configuração ↗':'Revisar configuración ↗',
  'Contactar a Green Village':'Contactar con Green Village','Catálogo 2026 ↗':'Catálogo 2026 ↗',
  'Imagens do modelo 3D em 3 840 × 2 160 píxeis. Abra uma vista, guarde-a em 4K ou experimente a configuração representada.':'Imágenes del modelo 3D en 3.840 × 2.160 píxeles. Abra una vista, guárdela en 4K o pruebe la configuración mostrada.',
  'Todas as vistas':'Todas las vistas','Construção':'Construcción',
  'Plantas originais do ficheiro fornecido.':'Planos originales del archivo suministrado.',
  'O seu projecto, num só lugar.':'Su proyecto, en un solo lugar.','Exportar JSON ↓':'Exportar JSON ↓','Importar JSON ↑':'Importar JSON ↑','Copiar ligação':'Copiar enlace','Descarregar modelo GLB ↓':'Descargar modelo GLB ↓','Ficha do cliente em PDF ↓':'Ficha del cliente PDF ↓',
  'Visualizações ilustrativas: não reproduzem a configuração seleccionada nem definem os equipamentos incluídos de série. Todos sem áudio.':'Visualizaciones ilustrativas: no reproducen la configuración seleccionada ni definen los equipos incluidos de serie. Todos sin audio.',
  'Terraço branco, visualização ilustrativa.':'Terraza blanca, visualización ilustrativa.',
  'Visualização ilustrativa a partir da fotografia fornecida.':'Visualización ilustrativa a partir de la fotografía suministrada.',
  'Visualização ilustrativa. Variante, medidas e adequação à sua unidade a confirmar na proposta.':'Visualización ilustrativa. Variante, medidas y adecuación a su unidad por confirmar en la propuesta.',
  'Ir para o configurador':'Ir al configurador',
  'Navegação principal':'Navegación principal',
  'DO DETALHE À SUA ESCOLHA':'DEL DETALLE A SU ELECCIÓN','A próxima combinação é sua.':'La próxima combinación es suya.','Voltar a personalizar ↗':'Volver a personalizar ↗',
  'Terraços':'Terrazas',
  'Exterior creme':'Exterior crema','Cozinha em L':'Cocina en L','Casa de banho':'Baño','Terraço preto':'Terraza negra','Terraço cinzento':'Terraza gris','Terraço branco':'Terraza blanca',
  'Uma aproximação à fachada creme e à caixilharia escura.':'Un acercamiento a la fachada crema y la carpintería oscura.','Uma cozinha de referência com móveis claros e bancada escura.':'Una cocina de referencia con muebles claros y encimera oscura.','Um enquadramento vertical do resguardo e do revestimento com padrão de mármore.':'Un encuadre vertical de la mampara y el revestimiento con patrón de mármol.','Estrutura e guardas escuras numa referência de terraço coberto.':'Estructura y barandillas oscuras en una referencia de terraza cubierta.','Uma aproximação frontal ao terraço e à entrada central.':'Un acercamiento frontal a la terraza y la entrada central.','Vista lateral de uma referência com fachada amarela e guarda branca.':'Vista lateral de una referencia con fachada amarilla y barandilla blanca.',
  'Pavimento':'Pavimento','Cor livre':'Color libre','O pavimento vinílico está incluído no preço base. O pavimento SPC tem um custo adicional de 1 200 €.':'El pavimento vinílico está incluido en el precio base. El pavimento SPC tiene un coste adicional de 1 200 €.','12 acabamentos SPC do catálogo · escolha uma amostra para a visualizar.':'12 acabados SPC del catálogo · elija una muestra para previsualizarla.',
  'Pavimento SPC (+1 200 €)':'Pavimento SPC (+1 200 €)','Pavimento SPC':'Pavimento SPC',
  'O navegador não permitiu guardar neste dispositivo. Pode exportar um ficheiro JSON.':'El navegador no permitió guardar en este dispositivo. Puede exportar un fichero JSON.','A ligação não pôde ser actualizada. Use Partilhar para copiar as escolhas actuais.':'El enlace no se pudo actualizar. Use Compartir para copiar sus opciones actuales.','Configuração actualizada.':'Configuración actualizada.','Aguarde a exportação em curso.':'Espere a que termine la exportación en curso.',
  'designação comercial':'designación comercial','7 distribuições':'7 distribuciones',
  'Sobre este modelo.':'Sobre este modelo.',
  'Expandível 72 · 40 pés':'Expandible 72 · 40 pies','Modelo':'Modelo','Referência em falta':'Referencia no encontrada','Paredes interiores':'Paredes interiores','Revestimento do banho':'Revestimiento del baño','Ambiente de banho':'Ambiente de baño','Texturas':'Texturas','Luz':'Luz','Telhado adicional':'Tejado adicional','Alpendre':'Porche','Subtotal indicativo de adicionais':'Subtotal indicativo de extras','Personalizações sob orçamento':'Personalizaciones bajo presupuesto',
  'Seleccionado · sob consulta':'Seleccionado · bajo consulta','Não seleccionado':'No seleccionado','Seleccionado · confirmar variante na lista de adicionais':'Seleccionado · confirmar variante en la lista de extras','Nenhum seleccionado':'Ninguno seleccionado','Nenhuma alteração ao standard seleccionada':'Ningún cambio al estándar seleccionado','preço base e total por confirmar':'precio base y total por confirmar',
  'Sem cozinha representada':'Sin cocina representada','Linear':'Lineal','Em L':'En L','Com ilha':'Con isla','Em U':'En U','Distribuição da planta (aproximada)':'Distribución de la planta (aproximada)','Alternativa espelhada (proposta)':'Alternativa espejada (propuesta)',
  'Recorte original, sem tratamento de cor':'Recorte original, sin tratamiento de color','Preparação de emendas R3':'Preparación de empalmes R3','Cor digital da amostra':'Color digital de la muestra','Neutra':'Neutra','Fachada':'Fachada',
  'Revestimento UV do banho':'Revestimiento UV del baño','local por definir':'ubicación por definir'
  }
};

// Only trusted application messages are translated; user-entered values are never rewritten.
const CUSTOMER_STRINGS=[
 ['Tipo de pavimento','Flooring type','Tipo de pavimento'],
 ['Vinílico · incluído','Vinyl · included','Vinílico · incluido'],
 ['Vinílico incluído','Vinyl included','Vinílico incluido'],
 ['SPC · +1 200 €','SPC · +€1,200','SPC · +1 200 €'],
 ['Pavimento vinílico (incluído)','Vinyl flooring (included)','Pavimento vinílico (incluido)'],
 ['Referência por confirmar · visualização neutra sem amostra','Reference pending · neutral preview without a sample','Referencia pendiente · visualización neutra sin muestra'],
 ['Referência por confirmar','Reference pending','Referencia pendiente'],
 ['Referência SPC por confirmar','SPC reference pending','Referencia SPC pendiente'],
 ['Adicional único de 1 200 € já incluído no subtotal. IVA por confirmar. Escolha uma amostra SPC abaixo.','A single €1,200 upgrade is already included in the subtotal. VAT to be confirmed. Choose an SPC sample below.','El suplemento único de 1 200 € ya está incluido en el subtotal. IVA por confirmar. Elija una muestra SPC a continuación.'],
 ['O pavimento vinílico está incluído. A fotografia e o acabamento ainda estão por confirmar. O 3D apresenta uma cor neutra, sem textura de referência.','Vinyl flooring is included. Its photograph and finish are still to be confirmed. The 3D preview uses a neutral colour without a reference texture.','El pavimento vinílico está incluido. La fotografía y el acabado están pendientes de confirmación. La vista 3D presenta un color neutro sin textura de referencia.'],
 ['Substituição do pavimento vinílico incluído por pavimento SPC na casa','Replace the included vinyl flooring with SPC throughout the home','Sustitución del pavimento vinílico incluido por SPC en la casa'],
 ['FICHA DO CLIENTE','CLIENT RECORD','FICHA DEL CLIENTE'],
 ['PROJECTO DO CLIENTE','CLIENT PROJECT','PROYECTO DEL CLIENTE'],
 ['Um projecto com nome.','A project with a name.','Un proyecto con nombre.'],
 ['Identifique o cliente e registe os detalhes a levar para a proposta e para o contrato.','Identify the client and record the details for the quotation and contract.','Identifique al cliente y registre los detalles para la oferta y el contrato.'],
 ['Dados guardados apenas neste dispositivo e nos ficheiros que exportar. A ligação de partilha contém as escolhas, sem os dados pessoais.','Data is saved only on this device and in exported files. The sharing link contains your choices without personal details.','Los datos se guardan solo en este dispositivo y en los archivos exportados. El enlace compartido contiene las selecciones sin datos personales.'],
 ['Nome do cliente','Client name','Nombre del cliente'],
 ['Nome ou número do projecto','Project name or number','Nombre o número del proyecto'],
 ['Data da ficha','Record date','Fecha de la ficha'],
 ['Local de instalação','Installation location','Lugar de instalación'],
 ['Contacto do cliente (opcional)','Client contact (optional)','Contacto del cliente (opcional)'],
 ['Composição de série acordada','Agreed standard specification','Equipamiento de serie acordado'],
 ['As referências standard confirmadas já acompanham a ficha. Use os campos para acrescentar a composição acordada especificamente com este cliente.','Confirmed standard references are already included. Use these fields to add the specification agreed with this client.','Las referencias estándar confirmadas ya figuran en la ficha. Use estos campos para añadir el equipamiento acordado con este cliente.'],
 ['Cozinha standard: equipamentos e referência','Standard kitchen: equipment and reference','Cocina estándar: equipamiento y referencia'],
 ['Banho standard: equipamentos e referência','Standard bathroom: equipment and reference','Baño estándar: equipamiento y referencia'],
 ['Adaptações deste projecto','Adaptations for this project','Adaptaciones de este proyecto'],
 ['Alterações de layout, portas, janelas e medidas solicitadas','Requested layout, door, window and dimension changes','Cambios solicitados de distribución, puertas, ventanas y medidas'],
 ['Observações para a proposta e contrato','Notes for the quotation and contract','Observaciones para la oferta y el contrato'],
 ['Recuperar ficha anterior à partilha','Restore the record from before sharing','Recuperar la ficha anterior al enlace compartido'],
 ['Rever planta e distribuição ↗','Review the plan and layout ↗','Revisar el plano y la distribución ↗'],
 ['Rever adicionais e custos ↗','Review extras and costs ↗','Revisar extras y costes ↗'],
 ['Preparar ficha para impressão ↗','Prepare the record for printing ↗','Preparar la ficha para imprimir ↗'],
 ['Planta e fotografias do cliente','Client floor plan and photographs','Plano y fotografías del cliente'],
 ['A planta enviada e os pedidos ficam na ficha para validação. O modelo 3D mantém a distribuição seleccionada.','The uploaded plan and requests are kept in the record for validation. The 3D model retains the selected layout.','El plano enviado y las solicitudes quedan en la ficha para su validación. El modelo 3D mantiene la distribución seleccionada.'],
 ['Carregar planta definida pelo cliente','Upload the client-defined floor plan','Cargar el plano definido por el cliente'],
 ['PNG, JPEG ou PDF · até 5 MB · PDF até 20 páginas. Retire a planta actual para a substituir.','PNG, JPEG or PDF · up to 5 MB · PDF up to 20 pages. Remove the current plan to replace it.','PNG, JPEG o PDF · hasta 5 MB · PDF de hasta 20 páginas. Retire el plano actual para sustituirlo.'],
 ['Adicionar fotografias de referência','Add reference photographs','Añadir fotografías de referencia'],
 ['PNG ou JPEG · até 5 MB por fotografia · 12 anexos e 20 MB no total.','PNG or JPEG · up to 5 MB per photograph · 12 attachments and 20 MB in total.','PNG o JPEG · hasta 5 MB por fotografía · 12 adjuntos y 20 MB en total.'],
 ['Planta do cliente','Client floor plan','Plano del cliente'],
 ['Fotografia de referência','Reference photograph','Fotografía de referencia'],
 ['Planta PDF · todas as páginas serão incluídas no dossier.','PDF floor plan · all pages will be included in the dossier.','Plano PDF · todas las páginas se incluirán en el dossier.'],
 ['Sem observações.','No notes.','Sin observaciones.'],
 ['Descarregar original','Download original','Descargar original'],
 ['Retirar anexo','Remove attachment','Retirar adjunto'],
 ['Ainda não foram adicionadas plantas ou fotografias.','No plans or photographs have been added yet.','Todavía no se han añadido planos ni fotografías.'],
 ['Pedidos específicos do cliente','Specific client requests','Solicitudes específicas del cliente'],
 ['Registe janelas novas, alterações e extras que ainda não têm lugar no 3D. Cada pedido fica sob cotação e não é somado ao subtotal. Para artigos com preço publicado, escolha primeiro o artigo em Adicionais.','Record new windows, changes and extras not yet represented in 3D. Each request requires a quotation and is excluded from the subtotal. For priced items, select the item in Extras first.','Registre ventanas nuevas, cambios y extras que aún no se representan en 3D. Cada solicitud queda pendiente de presupuesto y no se suma al subtotal. Para artículos con precio publicado, seleccione primero el artículo en Extras.'],
 ['Descrição do pedido','Request description','Descripción de la solicitud'],
 ['Quantidade','Quantity','Cantidad'],
 ['Divisão ou local pretendido','Requested room or location','Estancia o ubicación deseada'],
 ['Medidas e observações','Dimensions and notes','Medidas y observaciones'],
 ['Retirar pedido','Remove request','Retirar solicitud'],
 ['Sob cotação · validação técnica pendente','Quotation required · technical validation pending','Pendiente de presupuesto · validación técnica pendiente'],
 ['Pedir janela extra na cozinha','Request an extra kitchen window','Solicitar una ventana adicional en la cocina'],
 ['Acrescentar outro pedido','Add another request','Añadir otra solicitud'],
 ['Pedido por descrever','Request description pending','Descripción de la solicitud pendiente'],
 ['Local por definir','Location pending','Ubicación pendiente'],
 ['Ficha guardada neste dispositivo.','Record saved on this device.','Ficha guardada en este dispositivo.'],
 ['A guardar a ficha…','Saving the record…','Guardando la ficha…'],
 ['Não guardado. Exporte o JSON antes de sair.','Not saved. Export the JSON before leaving.','No se ha guardado. Exporte el JSON antes de salir.'],
 ['Dados e anexos não guardados neste dispositivo. Exporte o JSON antes de sair.','Data and attachments were not saved on this device. Export the JSON before leaving.','Los datos y adjuntos no se han guardado en este dispositivo. Exporte el JSON antes de salir.'],
 ['Projecto e anexos guardados neste dispositivo.','Project and attachments saved on this device.','Proyecto y adjuntos guardados en este dispositivo.'],
 ['Projecto guardado recuperado.','Saved project restored.','Proyecto guardado recuperado.'],
 ['O navegador bloqueou a gravação. Exporte um JSON no resumo.','The browser blocked saving. Export a JSON from the summary.','El navegador ha bloqueado el guardado. Exporte un JSON desde el resumen.'],
 ['Ainda não existe uma configuração guardada.','There is no saved configuration yet.','Todavía no hay una configuración guardada.'],
 ['Projecto','Project','Proyecto'],['Data','Date','Fecha'],['Local','Location','Ubicación'],['Contacto','Contact','Contacto'],
 ['Cozinha standard confirmada','Confirmed standard kitchen','Cocina estándar confirmada'],
 ['Banho standard confirmado','Confirmed standard bathroom','Baño estándar confirmado'],
 ['Acordo específico de cozinha','Specific kitchen agreement','Acuerdo específico de cocina'],
 ['Acordo específico de banho','Specific bathroom agreement','Acuerdo específico de baño'],
 ['Sem indicações adicionais','No additional instructions','Sin indicaciones adicionales'],
 ['Adaptações solicitadas','Requested adaptations','Adaptaciones solicitadas'],
 ['Observações','Notes','Observaciones'],['Editar dados do cliente ↗','Edit client details ↗','Editar datos del cliente ↗'],
 ['Adicionais e valores','Extras and prices','Extras y precios'],['Ainda não seleccionou adicionais.','No extras selected yet.','Todavía no ha seleccionado extras.'],
 ['Personalizações — acréscimos por definir','Custom changes — prices pending','Personalizaciones — suplementos pendientes'],
 ['Estas alterações não estão incluídas no subtotal e não são gratuitas. O acréscimo de cada uma será indicado na proposta.','These changes are excluded from the subtotal and are not free. Each additional charge will be included in the quotation.','Estos cambios no están incluidos en el subtotal y no son gratuitos. El suplemento de cada uno se indicará en la oferta.'],
 ['Subtotal indicativo com preço publicado','Indicative subtotal of priced items','Subtotal orientativo de artículos con precio publicado'],
 ['Subtotal indicativo dos adicionais','Indicative extras subtotal','Subtotal orientativo de extras'],
 ['Inclui IVA de 23%. Não é somado IVA novamente.','Includes 23% VAT. VAT is not added again.','Incluye IVA del 23 %. No se vuelve a añadir IVA.'],
 ['Preços indicados sem acrescentar IVA. IVA dos artigos assinalados por confirmar.','Quoted prices without adding VAT. VAT treatment of marked items is to be confirmed.','Precios indicados sin añadir IVA. IVA de los artículos señalados por confirmar.'],
 ['IVA dos artigos assinalados por confirmar','VAT treatment of marked items to be confirmed','IVA de los artículos señalados por confirmar'],
 ['IVA incluído','VAT included','IVA incluido'],['com IVA','including VAT','con IVA'],['IVA por confirmar','VAT to be confirmed','IVA por confirmar'],
 ['base da casa por confirmar','base house price to be confirmed','precio base de la casa por confirmar'],
 ['há artigos sob consulta','some items require a quotation','hay artículos pendientes de presupuesto'],
 ['Preço base da casa','Base house price','Precio base de la casa'],['Por confirmar','To be confirmed','Por confirmar'],
 ['Transporte e instalação','Transport and installation','Transporte e instalación'],['Total da proposta','Quotation total','Total de la oferta'],
 ['Oferta Green Village','Green Village offer','Oferta Green Village'],['Sob consulta','On request','Bajo consulta'],['Sob orçamento','Quotation required','Pendiente de presupuesto'],['Sob cotação','Quotation required','Pendiente de presupuesto'],
 ['Adicionais à sua medida.','Extras to suit you.','Extras a su medida.'],
 ['Escolha os artigos e os locais onde pretende aplicá-los. As selecções acompanham a planta, o resumo e o PDF.','Choose the items and where you want them fitted. Your selections are included in the plan, summary and PDF.','Elija los artículos y dónde desea instalarlos. Las selecciones se incluyen en el plano, el resumen y el PDF.'],
 ['Categoria de adicionais','Extras category','Categoría de extras'],
 ['Portas e envidraçados','Doors and glazing','Puertas y acristalamientos'],['Janelas','Windows','Ventanas'],['Paredes e isolamento','Walls and insulation','Paredes y aislamiento'],['Telhado','Roof','Tejado'],['Terraço','Terrace','Terraza'],['Ar condicionado','Air conditioning','Aire acondicionado'],
 ['Fotografia por confirmar','Photograph pending','Fotografía pendiente'],['Adicione uma referência na ficha do cliente.','Add a reference to the client record.','Añada una referencia a la ficha del cliente.'],
 ['Pedido personalizado','Custom request','Solicitud personalizada'],['Instalação incluída · IVA por confirmar','Installation included · VAT to be confirmed','Instalación incluida · IVA por confirmar'],
 ['✓ Seleccionado · retirar','✓ Selected · remove','✓ Seleccionado · retirar'],['Adicionar ao projecto','Add to project','Añadir al proyecto'],
 ['Local pretendido e observações','Requested location and notes','Ubicación deseada y observaciones'],
 ['Ex.: cozinha, lateral esquerda, medidas ou referência pretendida','E.g. kitchen, left side, dimensions or desired reference','Ej.: cocina, lateral izquierdo, medidas o referencia deseada'],
 ['O 3D representa uma frente. As unidades adicionais ficam como pedido na ficha; indique os restantes locais e medidas. Para uma lateral parcialmente envidraçada, escolha Vidro parcial na lateral.','The 3D model shows one front. Additional units are recorded as requests; specify their locations and dimensions. For partial side glazing, choose Partial side glazing.','El 3D representa un frente. Las unidades adicionales quedan como solicitudes en la ficha; indique las demás ubicaciones y medidas. Para un lateral parcialmente acristalado, elija Acristalamiento lateral parcial.'],
 ['Pode pedir uma janela nova sem escolher um vão existente. Indique a divisão nas observações; a abertura e a instalação ficam pendentes de validação técnica.','You can request a new window without choosing an existing opening. Specify the room in the notes; the opening and installation require technical validation.','Puede solicitar una ventana nueva sin elegir un hueco existente. Indique la estancia en las observaciones; el hueco y la instalación quedan pendientes de validación técnica.'],
 ['Adicionar planta ou fotografia com observação ↗','Add a plan or photograph with a note ↗','Añadir un plano o una fotografía con observación ↗'],
 ['Quantidade pretendida','Requested quantity','Cantidad deseada'],['Tipo de porta','Door type','Tipo de puerta'],['Madeira','Wood','Madera'],['Alumínio','Aluminium','Aluminio'],['De correr','Sliding','Corredera'],
 ['Aplicar nos vãos da planta','Apply to openings in the plan','Aplicar a los huecos del plano'],
 ['Escolha o local para ver a proposta em 3D. Seleccionar outro tipo substitui a escolha desse vão.','Choose a location to preview it in 3D. Selecting another type replaces the choice for that opening.','Elija la ubicación para ver la propuesta en 3D. Seleccionar otro tipo sustituye la selección de ese hueco.'],
 ['sem espaço de recolha nesta planta','no sliding clearance in this layout','sin espacio de deslizamiento en este plano'],
 ['Este artigo destina-se a janelas. Ao substituir uma janela por uma porta, o mosquiteiro mantém-se na ficha, com a mesma quantidade e preço, mas fica por atribuir.','This item is for windows. When a window is replaced by a door, the insect screen remains in the record at the same quantity and price, awaiting a new location.','Este artículo es para ventanas. Al sustituir una ventana por una puerta, la mosquitera permanece en la ficha con la misma cantidad y precio, pendiente de asignación.'],
 ['Escolher a textura do painel ↗','Choose the panel texture ↗','Elegir la textura del panel ↗'],
 ['Pré-visualização com caixilho fechado representativo. O mecanismo de abertura desta referência ainda não está modelado.','Preview with a representative closed frame. The opening mechanism of this reference is not yet modelled.','Vista previa con un marco cerrado representativo. El mecanismo de apertura de esta referencia todavía no está modelado.'],
 ['Registado na especificação e no PDF.','Recorded in the specification and PDF.','Registrado en la especificación y en el PDF.'],
 ['A geometria das camadas da casa é representativa; esta escolha não valida espessuras totais ou ligações.','The house layers are representative; this selection does not validate total thicknesses or connections.','La geometría de las capas de la casa es representativa; esta selección no valida espesores totales ni uniones.'],
 ['Ver no modelo ↗','View on the model ↗','Ver en el modelo ↗'],
 ['Cálculo indicativo: quantidade × PVP actual. Unidade de facturação e inclusão na casa a confirmar na proposta.','Indicative calculation: quantity × current price. Billing unit and inclusion in the home are subject to confirmation in the quotation.','Cálculo orientativo: cantidad × PVP actual. La unidad de facturación y la inclusión en la casa se confirmarán en la oferta.'],
 ['Dimensões não publicadas mantêm as medidas ilustrativas do vão. A instalação e as alterações da planta carecem de confirmação.','Unpublished dimensions retain the illustrative opening size. Installation and layout changes require confirmation.','Las dimensiones no publicadas mantienen las medidas ilustrativas del hueco. La instalación y los cambios del plano requieren confirmación.'],
 ['Ficha original · preços anteriores ↗','Original sheet · previous prices ↗','Ficha original · precios anteriores ↗'],['Rever artigos e custos ↗','Review items and costs ↗','Revisar artículos y costes ↗'],
 ['Local de aplicação por definir','Installation location pending','Ubicación de instalación pendiente'],['Âmbito de facturação a confirmar','Billing scope to be confirmed','Alcance de facturación por confirmar'],
 ['Paredes e tecto · unidade 40FT','Walls and ceiling · 40FT unit','Paredes y techo · unidad 40FT'],['Sistema para casa completa · 40FT','Complete home system · 40FT','Sistema para casa completa · 40FT'],['Terraço e cobertura · profundidade de 3 m','Terrace and canopy · 3 m depth','Terraza y cubierta · 3 m de profundidad'],
 ['Vidro parcial na lateral','Partial side glazing','Acristalamiento lateral parcial'],['Ilha adicional na cozinha','Additional kitchen island','Isla adicional en la cocina'],
 ['Indique o lado, as medidas e a divisão nas observações.','Specify the side, dimensions and room in the notes.','Indique el lado, las medidas y la estancia en las observaciones.'],
 ['Dimensões e instalação sujeitas a validação técnica.','Dimensions and installation subject to technical validation.','Dimensiones e instalación sujetas a validación técnica.'],
 ['Envidraçamento lateral parcial sob cotação','Partial side glazing subject to quotation','Acristalamiento lateral parcial bajo presupuesto'],
 ['Pedido registado mesmo quando a planta 3D não comporta uma ilha.','The request is recorded even when an island does not fit in the 3D layout.','La solicitud se registra aunque el plano 3D no tenga espacio para una isla.'],
 ['Dimensões, circulação, acabamento e equipamentos a definir.','Dimensions, circulation, finish and equipment to be defined.','Dimensiones, circulación, acabado y equipamiento por definir.'],
 ['Ilha de cozinha sob cotação personalizada','Kitchen island subject to a custom quotation','Isla de cocina bajo presupuesto personalizado'],
 ['Ar condicionado 12 000 BTU · Monosplit 1×1','Air conditioning 12,000 BTU · Monosplit 1×1','Aire acondicionado 12 000 BTU · Monosplit 1×1'],
 ['Ar condicionado · Multisplit 3×1','Air conditioning · Multisplit 3×1','Aire acondicionado · Multisplit 3×1'],
 ['1 unidade exterior + 1 unidade interior.','1 outdoor unit + 1 indoor unit.','1 unidad exterior + 1 unidad interior.'],
 ['Climatização de uma divisão.','Air conditioning for one room.','Climatización de una estancia.'],
 ['Solução económica e simples de instalar.','An economical solution that is simple to install.','Solución económica y sencilla de instalar.'],
 ['500 € por sistema, com instalação incluída.','€500 per system, installation included.','500 € por sistema, con instalación incluida.'],
 ['Um sistema de 12 000 BTU com instalação incluída','One 12,000 BTU system with installation included','Un sistema de 12 000 BTU con instalación incluida'],
 ['1 unidade exterior + 3 unidades interiores.','1 outdoor unit + 3 indoor units.','1 unidad exterior + 3 unidades interiores.'],
 ['Até 3 divisões com uma unidade exterior, poupando espaço na fachada.','Up to 3 rooms with one outdoor unit, saving space on the facade.','Hasta 3 estancias con una unidad exterior, ahorrando espacio en la fachada.'],
 ['Preço conforme potência total, marca, unidades interiores e comprimento da tubagem.','Price depends on total capacity, brand, indoor units and pipe length.','Precio según la potencia total, la marca, las unidades interiores y la longitud de las tuberías.'],
 ['Dimensionamento técnico e cotação personalizada','Technical sizing and a custom quotation','Dimensionamiento técnico y presupuesto personalizado'],
 ['INCLUÍDO NO MODELO STANDARD','INCLUDED IN THE STANDARD MODEL','INCLUIDO EN EL MODELO ESTÁNDAR'],
 ['Cozinha standard em L','Standard L-shaped kitchen','Cocina estándar en L'],['Casa de banho standard','Standard bathroom','Baño estándar'],
 ['Cozinha em L da fotografia 14, com móveis inferiores e três gavetas. Fotografia do modelo ainda embalado.','L-shaped kitchen in photograph 14, with base cabinets and three drawers. Photograph of the model still wrapped.','Cocina en L de la fotografía 14, con muebles bajos y tres cajones. Fotografía del modelo todavía embalado.'],
 ['A película oculta o acabamento da bancada e das frentes. A posição da cuba e da torneira não é visível nesta fotografia.','The film conceals the worktop and cabinet finishes. The sink and tap positions are not visible in this photograph.','La película oculta el acabado de la encimera y los frentes. La posición del fregadero y del grifo no se ve en esta fotografía.'],
 ['Móvel com lavatório integrado à esquerda, sanita ao lado e duche ao fundo com resguardo de correr. Revestimento claro com veios e perfis claros, conforme a fotografia 17.','Cabinet with an integrated basin on the left, toilet alongside and shower at the back with a sliding enclosure. Light veined cladding and light frames, as in photograph 17.','Mueble con lavabo integrado a la izquierda, inodoro al lado y ducha al fondo con mampara corredera. Revestimiento claro veteado y perfiles claros, según la fotografía 17.'],
 ['Medidas e materiais comerciais exactos por confirmar; a implantação 3D adapta-se à divisão da planta.','Exact dimensions and commercial materials remain to be confirmed; the 3D layout adapts to the room in the plan.','Medidas y materiales comerciales exactos por confirmar; la distribución 3D se adapta a la estancia del plano.'],
 ['Referência standard confirmada pela Green Village em 21/09/2026.','Standard reference confirmed by Green Village on 21/09/2026.','Referencia estándar confirmada por Green Village el 21/09/2026.'],
 ['Ampliar fotografia do standard','Enlarge the standard photograph','Ampliar la fotografía del estándar'],
 ['✓ Standard seleccionado','✓ Standard selected','✓ Estándar seleccionado'],['Configuração personalizada · acréscimos separados','Custom configuration · additional charges listed separately','Configuración personalizada · suplementos separados'],
 ['Standard aplicado','Standard applied','Estándar aplicado'],['Repor cozinha standard','Restore standard kitchen','Restablecer la cocina estándar'],['Repor banho standard','Restore standard bathroom','Restablecer el baño estándar'],
 ['Nesta planta T4 A, a cozinha em L não cabe na zona prevista. A implantação linear é uma adaptação sujeita a orçamento.','In layout T4 A, the L-shaped kitchen does not fit in the intended area. The linear layout is an adaptation subject to quotation.','En el plano T4 A, la cocina en L no cabe en la zona prevista. La distribución lineal es una adaptación sujeta a presupuesto.'],
 ['Armário superior opcional','Optional wall cabinet','Armario alto opcional'],['Alterações ao banho original','Changes to the original bathroom','Cambios en el baño original'],
 ['Bancada, posição do lavatório e ampliação têm acréscimos próprios, a definir na proposta.','The worktop, basin position and enlargement have separate charges, to be defined in the quotation.','La encimera, la posición del lavabo y la ampliación tienen suplementos propios que se definirán en la oferta.'],
 ['Fotografias e adicionais ↗','Photographs and extras ↗','Fotografías y extras ↗'],
 ['Alterar a bancada da cozinha','Change the kitchen worktop','Cambiar la encimera de la cocina'],['Alterar a posição do lava-loiça','Change the sink position','Cambiar la posición del fregadero'],
 ['Alterar a bancada ou o móvel do lavatório','Change the basin worktop or cabinet','Cambiar la encimera o el mueble del lavabo'],['Alterar a posição do lavatório','Change the basin position','Cambiar la posición del lavabo'],['Ampliar a casa de banho para o lavatório','Enlarge the bathroom for the basin','Ampliar el baño para el lavabo'],
 ['Personalizações do espaço da cozinha','Kitchen customisations','Personalizaciones de la cocina'],['Personalizações do banho','Bathroom customisations','Personalizaciones del baño'],
 ['Cada alteração tem um acréscimo próprio. Seleccione o que pretende orçamentar.','Each change has its own additional charge. Select the changes you want quoted.','Cada cambio tiene un suplemento propio. Seleccione los cambios que desea presupuestar.'],
 ['associado à distribuição espelhada','associated with the mirrored layout','asociado a la distribución invertida'],
 ['A distribuição espelhada altera a posição do lavatório. Para retirar esta alteração, escolha Distribuição base abaixo e desmarque o pedido, se o tiver seleccionado manualmente.','The mirrored layout changes the basin position. To remove this change, choose Base layout below and untick the request if you selected it manually.','La distribución invertida cambia la posición del lavabo. Para retirar este cambio, elija Distribución base a continuación y desmarque la solicitud si la seleccionó manualmente.'],
 ['Os pedidos acima ficam na ficha. Medidas, posição exacta e material serão definidos com a Green Village; o 3D mantém a implantação escolhida abaixo.','These requests are recorded in the file. Dimensions, exact positions and materials will be agreed with Green Village; the 3D model retains the layout selected below.','Estas solicitudes quedan en la ficha. Las medidas, la posición exacta y el material se definirán con Green Village; el 3D mantiene la distribución seleccionada a continuación.'],
 ['Acrescentar medidas e observações ↗','Add dimensions and notes ↗','Añadir medidas y observaciones ↗'],
 ['Especificações e acréscimo a definir com a Green Village.','Specifications and additional price to be agreed with Green Village.','Especificaciones y suplemento por definir con Green Village.'],
 ['Alteração da implantação da cozinha','Change to the kitchen layout','Cambio de distribución de la cocina'],['Cozinha alternativa ao standard','Kitchen alternative to the standard','Cocina alternativa al estándar'],['Banho alternativo ao standard','Bathroom alternative to the standard','Baño alternativo al estándar'],['Alterar o revestimento do banho','Change the bathroom cladding','Cambiar el revestimiento del baño'],
 ['Distribuição espelhada: lavatório e sanita no lado oposto.','Mirrored layout: basin and toilet on the opposite side.','Distribución invertida: lavabo e inodoro en el lado opuesto.'],
 ['Sem cozinha representada; fornecimento e eventual ajuste do preço a acordar.','No kitchen shown; supply and any price adjustment to be agreed.','Sin cocina representada; suministro y posible ajuste de precio por acordar.'],
 ['Implantação linear.','Linear layout.','Distribución lineal.'],['Implantação em U.','U-shaped layout.','Distribución en U.'],['Implantação com ilha.','Layout with an island.','Distribución con isla.'],
 ['Porta de entrada','Entrance door','Puerta de entrada'],['Janela da casa de banho','Bathroom window','Ventana del baño'],['Porta da casa de banho','Bathroom door','Puerta del baño'],
 ['Janela frontal esquerda','Front left window','Ventana frontal izquierda'],['Janela frontal direita','Front right window','Ventana frontal derecha'],['Janela traseira esquerda','Rear left window','Ventana trasera izquierda'],['Janela traseira direita','Rear right window','Ventana trasera derecha'],
 ['Superfície','Surface','Superficie'],['Família de materiais','Material family','Familia de materiales'],
 ['Cores incluídas · 12','Included colours · 12','Colores incluidos · 12'],['Madeira e lamelas · 12','Wood and slats · 12','Madera y lamas · 12'],['Alvenaria e texturas · 12','Masonry and textures · 12','Mampostería y texturas · 12'],['Série GM · 15','GM series · 15','Serie GM · 15'],
 ['REFERÊNCIA SELECCIONADA','SELECTED REFERENCE','REFERENCIA SELECCIONADA'],['Amostra seleccionada','Selected sample','Muestra seleccionada'],['Comparar com o catálogo ↗','Compare with the catalogue ↗','Comparar con el catálogo ↗'],
 ['Aplicação da textura','Texture application','Aplicación de la textura'],['Original','Original','Original'],['Emendas suavizadas','Softened seams','Juntas suavizadas'],['Comparar referência e aplicação ↗','Compare the reference and application ↗','Comparar la referencia y la aplicación ↗'],
 ['Procurar nesta colecção','Search this collection','Buscar en esta colección'],['Nome ou código da referência','Reference name or code','Nombre o código de la referencia'],['Nenhuma amostra nesta colecção. Experimente outro nome ou código.','No sample found in this collection. Try another name or code.','No se ha encontrado ninguna muestra en esta colección. Pruebe otro nombre o código.'],
 ['Branco de referência','Reference white','Blanco de referencia'],['As fotografias apresentam paredes claras. O catálogo não define uma paleta de tintas interiores: a cor final fica por confirmar na proposta.','The photographs show light-coloured walls. The catalogue does not define an interior paint palette; the final colour will be confirmed in the quotation.','Las fotografías muestran paredes claras. El catálogo no define una paleta de pinturas interiores; el color final se confirmará en la oferta.'],
 ['O revestimento UV da casa de banho dispõe de oito referências próprias.','Bathroom UV cladding has eight dedicated references.','El revestimiento UV del baño dispone de ocho referencias propias.'],['Escolher revestimento do banho ↗','Choose bathroom cladding ↗','Elegir el revestimiento del baño ↗'],
 ['Fonte até 480 × 300 píxeis. Escala física e rugosidade não especificadas pelo fabricante.','Source up to 480 × 300 pixels. Physical scale and roughness are not specified by the manufacturer.','Fuente de hasta 480 × 300 píxeles. Escala física y rugosidad no especificadas por el fabricante.'],
 ['Cor de apresentação sem equivalência RAL/NCS documentada.','Presentation colour without a documented RAL/NCS equivalent.','Color de presentación sin equivalencia RAL/NCS documentada.'],['Consultar fontes e limitações ↗','View sources and limitations ↗','Consultar fuentes y limitaciones ↗'],
 ['Sete plantas documentadas','Seven documented layouts','Siete planos documentados'],['Planta, áreas e cotas ↗','Plan, areas and dimensions ↗','Plano, superficies y cotas ↗'],
 ['Limites interiores aproximados a partir do traçado original. Dimensões exteriores confirmadas.','Approximate interior boundaries based on the original drawing. External dimensions confirmed.','Límites interiores aproximados a partir del trazado original. Dimensiones exteriores confirmadas.'],
 ['Implantação na sua planta','Layout within your floor plan','Distribución en su plano'],['Sem cozinha','No kitchen','Sin cocina'],['Planta sem equipamento.','Plan without equipment.','Plano sin equipamiento.'],['Uma frente de bancada.','One worktop run.','Un frente de encimera.'],['Duas frentes perpendiculares.','Two perpendicular worktop runs.','Dos frentes perpendiculares.'],['Três frentes, com passagem central.','Three runs with central circulation.','Tres frentes con paso central.'],['Bancada e ilha independente.','Worktop and a separate island.','Encimera e isla independiente.'],
 ['Distribuição','Layout','Distribución'],['Distribuição base','Base layout','Distribución base'],['Relações da planta fornecida.','Arrangement from the supplied plan.','Relaciones del plano facilitado.'],['Espelhada','Mirrored','Invertida'],['Equipamentos no lado oposto · sob orçamento.','Equipment on the opposite side · quotation required.','Equipamiento en el lado opuesto · pendiente de presupuesto.'],
 ['Revestimento da casa de banho','Bathroom cladding','Revestimiento del baño'],['Usar parede da fotografia','Use the wall from the photograph','Usar la pared de la fotografía'],['Pode substituir o revestimento do ambiente por uma das oito amostras UV.','You can replace the room cladding with one of the eight UV samples.','Puede sustituir el revestimiento del ambiente por una de las ocho muestras UV.'],['Comparar amostra UV ↗','Compare the UV sample ↗','Comparar la muestra UV ↗'],
 ['Ampliar fotografia seleccionada','Enlarge the selected photograph','Ampliar la fotografía seleccionada'],['Comparar com fotografia original','Compare with the original photograph','Comparar con la fotografía original'],['Explorar em detalhe ↗','Explore in detail ↗','Explorar en detalle ↗'],['Abrir mobiliário','Open furniture','Abrir muebles'],['Fechar mobiliário','Close furniture','Cerrar muebles'],['← Ver casa completa','← View the complete home','← Ver la casa completa'],
 ['A sua cozinha, em detalhe','Your kitchen, in detail','Su cocina, en detalle'],['A sua casa de banho, em detalhe','Your bathroom, in detail','Su baño, en detalle'],['Arraste para rodar · clique numa frente para abrir','Drag to rotate · click a cabinet front to open','Arrastre para girar · pulse un frente para abrir'],
 ['Vista do modelo','Model view','Vista del modelo'],['Casa e ambientes','Home and rooms','Casa y ambientes'],['Interior · vista aérea','Interior · aerial view','Interior · vista aérea'],['Cozinha em detalhe','Kitchen detail','Cocina en detalle'],['Casa de banho em detalhe','Bathroom detail','Baño en detalle'],['Água e esgotos','Water and drainage','Agua y desagües'],['Camadas e acabamentos','Layers and finishes','Capas y acabados'],
 ['Fechar informações','Close information','Cerrar información'],['Fechar','Close','Cerrar'],['Abrir','Open','Abrir'],['Anular','Cancel','Cancelar'],['Cancelar','Cancel','Cancelar'],['Confirmar','Confirm','Confirmar'],
 ['Editar cliente','Edit client','Editar cliente'],['Preparar PDF','Prepare PDF','Preparar PDF'],['Importar projecto','Import project','Importar proyecto'],['Exportar projecto','Export project','Exportar proyecto'],
 ['Ligação copiada com as escolhas, sem os dados pessoais do cliente.','Link copied with the selections, without the client’s personal details.','Enlace copiado con las selecciones, sin los datos personales del cliente.'],['Não foi possível copiar. Pode exportar e partilhar o JSON.','Could not copy. You can export and share the JSON.','No se ha podido copiar. Puede exportar y compartir el JSON.'],
 ['Configuração inicial reposta. A cópia guardada foi preservada.','Initial configuration restored. The saved copy was preserved.','Configuración inicial restablecida. Se ha conservado la copia guardada.'],
 ['Porta de segurança em aço preta','Black steel security door','Puerta de seguridad de acero negra'],['Porta lateral em vidro','Glass side door','Puerta lateral de vidrio'],['Porta interior','Interior door','Puerta interior'],['Frente em vidro','Glass front','Frente acristalado'],['Porta em vidro com rutura térmica','Thermally broken glass door','Puerta de vidrio con rotura de puente térmico'],
 ['Janela de correr alumínio corte térmico 930 × 930','Thermally broken aluminium sliding window 930 × 930','Ventana corredera de aluminio con rotura térmica 930 × 930'],['Janela panorâmica chão-teto 600 × 1900','Floor-to-ceiling panoramic window 600 × 1900','Ventana panorámica de suelo a techo 600 × 1900'],['Janela grande corte térmico','Large thermally broken window','Ventana grande con rotura térmica'],['Janela liga alumínio (upgrade simples)','Aluminium-alloy window (basic upgrade)','Ventana de aleación de aluminio (mejora básica)'],['Janela corte térmico','Thermally broken window','Ventana con rotura térmica'],['Janela basculante / projetante','Tilting / projecting window','Ventana abatible / proyectante'],['Janela oscilobatente','Tilt-and-turn window','Ventana oscilobatiente'],['Mosquiteiro para janela','Window insect screen','Mosquitera para ventana'],
 ['Revestimento exterior painel 3D metal (sandwich)','3D metal sandwich exterior cladding','Revestimiento exterior de panel metálico 3D sándwich'],['Painel interior de parede fibra de bambu (peça única)','Bamboo-fibre interior wall panel (single piece)','Panel interior de pared de fibra de bambú (pieza única)'],['Isolamento parede + teto lã de rocha 100 mm','Wall + ceiling insulation, 100 mm mineral wool','Aislamiento de pared + techo, lana de roca de 100 mm'],['Isolamento parede + teto EPS','EPS wall + ceiling insulation','Aislamiento EPS de pared + techo'],['Isolamento de chão poliuretano PU spray','Sprayed PU polyurethane floor insulation','Aislamiento del suelo con poliuretano PU proyectado'],['Sistema de telhado triangular (casa completa)','Gable roof system (complete home)','Sistema de tejado a dos aguas (casa completa)'],['Terraço com toldo chuva/sol','Terrace with rain/sun canopy','Terraza con cubierta para lluvia y sol'],['Armário superior','Wall cabinet','Armario alto'],['Casa de banho separação seco/molhado 3 m','Bathroom dry/wet separation, 3 m','Separación seca/húmeda del baño, 3 m'],
 ['Aço','Steel','Acero'],['Cor preta','Black colour','Color negro'],['Fechadura reforçada','Reinforced lock','Cerradura reforzada'],['Folha simples','Single leaf','Hoja simple'],['Acesso ao terraço do lado da sala','Terrace access from the living-room side','Acceso a la terraza desde el lado del salón'],['Alternativa: porta em aço','Alternative: steel door','Alternativa: puerta de acero'],['Madeira, alumínio ou de correr','Wood, aluminium or sliding','Madera, aluminio o corredera'],
 ['Frente totalmente envidraçada (curtain wall)','Fully glazed front (curtain wall)','Frente totalmente acristalado (muro cortina)'],['Vidro temperado duplo com câmara de ar','Double tempered glazing with an air cavity','Doble vidrio templado con cámara de aire'],['Alumínio com rutura de ponte térmica broken bridge 55','Thermally broken aluminium, broken bridge 55','Aluminio con rotura de puente térmico, broken bridge 55'],['Isolante entre alumínio interior e exterior','Insulation between inner and outer aluminium','Aislante entre el aluminio interior y exterior'],['Melhoria do isolamento térmico e acústico','Improved thermal and acoustic insulation','Mejora del aislamiento térmico y acústico'],['Menor condensação','Reduced condensation','Menor condensación'],['Vidro duplo','Double glazing','Doble acristalamiento'],['Rutura de ponte térmica','Thermal break','Rotura de puente térmico'],['Chão ao teto','Floor to ceiling','De suelo a techo'],['Alumínio com corte térmico','Thermally broken aluminium','Aluminio con rotura térmica'],['Dimensões não publicadas','Dimensions not published','Dimensiones no publicadas'],['Liga de alumínio','Aluminium alloy','Aleación de aluminio'],['Upgrade face à janela standard','Upgrade from the standard window','Mejora respecto a la ventana estándar'],['Eixo horizontal','Horizontal axis','Eje horizontal'],['Abertura inclinada para dentro ou fora','Tilts inward or outward','Apertura inclinada hacia dentro o fuera'],['Caixilharia em alumínio','Aluminium frame','Carpintería de aluminio'],['Dupla abertura: batente e basculante','Dual opening: side-hung and tilt','Doble apertura: practicable y abatible'],['Mosquiteiro','Insect screen','Mosquitera'],
 ['Painel metálico 3D esculpido decorativo','Decorative sculpted 3D metal panel','Panel metálico 3D decorativo esculpido'],['Parede em liga alumínio-magnésio-manganês','Aluminium-magnesium-manganese alloy wall','Pared de aleación de aluminio-magnesio-manganeso'],['Estrutura em aço galvanizado a quente','Hot-dip galvanised steel structure','Estructura de acero galvanizado en caliente'],['Resistente à corrosão','Corrosion resistant','Resistente a la corrosión'],['Parede e teto em placa de fibra de bambu','Bamboo-fibre board walls and ceiling','Paredes y techo de placa de fibra de bambú'],['Interior da versão deluxe','Deluxe version interior','Interior de la versión deluxe'],['Parede e teto','Walls and ceiling','Paredes y techo'],['Unidade 40FT','40FT unit','Unidad 40FT'],['Melhor resistência ao fogo do que EPS','Better fire resistance than EPS','Mayor resistencia al fuego que el EPS'],['Duas águas (full gable)','Two slopes (full gable)','Dos aguas (full gable)'],['Beirado','Eaves','Alero'],['Liga alumínio-magnésio-manganês','Aluminium-magnesium-manganese alloy','Aleación de aluminio-magnesio-manganeso'],['Integração com terraço','Terrace integration','Integración con terraza'],['3 m de profundidade','3 m depth','3 m de profundidad'],['Estrutura em aço com frame preto','Steel structure with a black frame','Estructura de acero con marco negro'],['Cobertura em painel sandwich de aço lacado 50 mm','Canopy with 50 mm coated-steel sandwich panels','Cubierta de panel sándwich de acero lacado de 50 mm'],['Terraço e cobertura em conjunto na versão standard','Terrace and canopy together in the standard version','Terraza y cubierta juntas en la versión estándar'],['Armário de cozinha de parede','Kitchen wall cabinet','Armario de pared de cocina'],['3 m (conforme catálogo; não especifica área)','3 m (as in the catalogue; area not specified)','3 m (según el catálogo; no especifica superficie)'],['Zona de duche isolada por porta de correr de vidro','Shower area enclosed by a sliding glass door','Zona de ducha separada por una puerta corredera de vidrio']
];
CUSTOMER_STRINGS.push(
 ['22 artigos documentados. Datas dos PVP e enquadramento de IVA identificados por artigo.','22 documented items. Price dates and VAT treatment are identified for each item.','22 artículos documentados. Fechas de precios y tratamiento del IVA indicados por artículo.'],
 ['Telhado e alpendre','Roof and porch','Tejado y porche'],['Escolher no catálogo com preço ↗','Choose from the priced catalogue ↗','Elegir en el catálogo con precio ↗'],['Telhado triangular','Gable roof','Tejado a dos aguas'],['Alpendre coberto','Covered porch','Porche cubierto'],['Sob consulta · variante fotografada','On request · photographed variant','Bajo consulta · variante fotografiada'],
 ['Ampliar referência do telhado e alpendre','Enlarge the roof and porch reference','Ampliar la referencia del tejado y el porche'],['Referência do telhado e alpendre','Roof and porch reference','Referencia del tejado y el porche'],
 ['Esta vista usa o alpendre da fotografia. Seleccione Terraço nos adicionais para a proposta de 3 m do catálogo.','This view uses the porch from the photograph. Select Terrace in Extras for the 3 m catalogue proposal.','Esta vista usa el porche de la fotografía. Seleccione Terraza en Extras para la propuesta de 3 m del catálogo.'],
 ['Terraço do catálogo seleccionado: proposta com 3 m de profundidade e estrutura preta.','Catalogue terrace selected: proposal with 3 m depth and a black structure.','Terraza del catálogo seleccionada: propuesta con 3 m de profundidad y estructura negra.'],
 ['Forma e apoios interpretados da fotografia. Altura, inclinação e profundidade do alpendre não estão cotadas; a profundidade de 1,95 m é apenas uma hipótese da maquete.','Shape and supports interpreted from the photograph. Porch height, pitch and depth are not dimensioned; the 1.95 m depth is only an assumption for the model.','Forma y apoyos interpretados de la fotografía. La altura, inclinación y profundidad del porche no tienen cotas; la profundidad de 1,95 m es solo una hipótesis de la maqueta.'],
 ['Forma e apoios interpretados da fotografia. Altura, inclinação e profundidade do alpendre não estão cotadas; a profundidade de 3 m provém do adicional seleccionado.','Shape and supports interpreted from the photograph. Porch height, pitch and depth are not dimensioned; the 3 m depth comes from the selected extra.','Forma y apoyos interpretados de la fotografía. La altura, inclinación y profundidad del porche no tienen cotas; la profundidad de 3 m procede del extra seleccionado.'],
 ['A fotografia mostra uma cozinha em L. A implantação adapta-se ao espaço livre; o XLSX não contém cotas de cozinha.','The photograph shows an L-shaped kitchen. The layout adapts to the available space; the XLSX has no kitchen dimensions.','La fotografía muestra una cocina en L. La distribución se adapta al espacio libre; el XLSX no contiene cotas de cocina.'],
 ['A fotografia mostra três frentes. A implantação adapta-se ao espaço livre; o XLSX não contém cotas de cozinha.','The photograph shows three worktop runs. The layout adapts to the available space; the XLSX has no kitchen dimensions.','La fotografía muestra tres frentes. La distribución se adapta al espacio libre; el XLSX no contiene cotas de cocina.'],
 ['Bancada ilustrativa de 1,60 m para manter as passagens livres.','Illustrative 1.60 m worktop to keep circulation clear.','Encimera ilustrativa de 1,60 m para mantener libres los pasos.'],
 ['Armários superiores ajustados para deixar as janelas livres.','Wall cabinets adjusted to keep the windows clear.','Armarios altos ajustados para dejar libres las ventanas.'],
 ['Abrir portas e janelas','Open doors and windows','Abrir puertas y ventanas'],
 ['Fechar portas e janelas','Close doors and windows','Cerrar puertas y ventanas'],
 ['Clique numa porta ou janela para abrir','Click a door or window to open it','Pulse una puerta o ventana para abrirla'],
 ['Porta ou janela actualizada.','Door or window updated.','Puerta o ventana actualizada.'],
 ['Circuitos ilustrativos de água e electricidade. O projecto de execução será definido para a instalação.','Illustrative water and electrical circuits. The construction design will be specified for the installation.','Circuitos ilustrativos de agua y electricidad. El proyecto de ejecución se definirá para la instalación.'],
 ['Abertura interactiva de apresentação. Mão, ângulos e ferragens por confirmar na proposta.','Interactive opening for presentation. Handing, angles and hardware to be confirmed in the quotation.','Apertura interactiva de presentación. Sentido, ángulos y herrajes por confirmar en la oferta.']
);
CUSTOMER_STRINGS.push(
 ['Observação','Note','Observación'],
 ['Ambiente do catálogo p. 16 com armários superiores. Não identifica o conjunto abrangido pelo PVP actual.','Catalogue setting on p. 16 with wall cabinets. It does not identify the set covered by the current price.','Ambiente del catálogo de la p. 16 con armarios altos. No identifica el conjunto incluido en el PVP actual.'],
 ['Ambiente do catálogo p. 18. Fotografia específica do adicional de 3 m por confirmar.','Catalogue setting on p. 18. A specific photograph of the 3 m extra is to be confirmed.','Ambiente del catálogo de la p. 18. Fotografía específica del extra de 3 m por confirmar.'],
 ['fotografia original','original photograph','fotografía original'],
 ['fotografia confirmada pela Green Village','photograph confirmed by Green Village','fotografía confirmada por Green Village'],
 ['imagem do catálogo','catalogue image','imagen del catálogo'],
 ['referência do catálogo','catalogue reference','referencia del catálogo'],
 ['Pavimento vinílico incluído no preço base.','Vinyl flooring included in the base price.','Pavimento vinílico incluido en el precio base.'],
 ['Exterior, interiores e terraços.','Exterior, kitchen, bathroom and terraces.','Exterior, cocina, baño y terrazas.'],
 ['Seis filmes organizados por ambiente.','Six films organised into four areas.','Seis vídeos organizados en cuatro ambientes.'],
 ['Espaço aberto, com casa de banho no fundo ao centro.','Open space, with the bathroom at the rear centre.','Espacio abierto, con el baño al fondo en el centro.'],
 ['Um quarto ao fundo à direita. Sala aberta à esquerda e junto à entrada.','One bedroom at the rear right. Open living space on the left and by the entrance.','Un dormitorio al fondo a la derecha. Salón abierto a la izquierda y junto a la entrada.'],
 ['Dois quartos na lateral direita. Sala na lateral esquerda.','Two bedrooms on the right side. Living space on the left side.','Dos dormitorios en el lateral derecho. Salón en el lateral izquierdo.'],
 ['Um quarto ao fundo à esquerda e dois à direita. Sala junto à entrada à esquerda.','One bedroom at the rear left and two on the right. Living space by the entrance on the left.','Un dormitorio al fondo a la izquierda y dos a la derecha. Salón junto a la entrada a la izquierda.'],
 ['Três quartos na lateral direita. Sala aberta ao longo da lateral esquerda.','Three bedrooms on the right side. Open living space along the left side.','Tres dormitorios en el lateral derecho. Salón abierto a lo largo del lateral izquierdo.'],
 ['Dois quartos em cada lateral. Circulação central desde a entrada até à casa de banho.','Two bedrooms on each side. Central circulation from the entrance to the bathroom.','Dos dormitorios en cada lateral. Paso central desde la entrada hasta el baño.'],
 ['Um quarto ao fundo à esquerda e três à direita. Sala na frente à esquerda.','One bedroom at the rear left and three on the right. Living space at the front left.','Un dormitorio al fondo a la izquierda y tres a la derecha. Salón al frente a la izquierda.'],
 ['Usar esta planta','Use this floor plan','Usar este plano'],['Usar planta com cozinha linear','Use the plan with a linear kitchen','Usar el plano con cocina lineal'],
 ['planta da configuração','configuration floor plan','plano de la configuración'],['Rectângulo exterior','External rectangle','Rectángulo exterior'],['Área livre calculada *','Calculated clear area *','Superficie libre calculada *'],['Espaço comum *','Shared space *','Espacio común *'],
 ['* Estimativas com espessuras assumidas. Alpendre e cobertura adicional excluídos.','* Estimates using assumed thicknesses. Porch and additional canopy excluded.','* Estimaciones con espesores supuestos. Se excluyen el porche y la cubierta adicional.'],
 ['Recorte original sem recoloração ou rotação do veio. No piso, a amostra é distribuída por réguas com posições desencontradas para evitar faixas alinhadas; paginação e escala estimadas. Use Cor do catálogo para comparar a cor digital.','Original crop without recolouring or rotating the grain. On the floor, the sample is distributed across staggered planks to avoid aligned bands; layout and scale are estimates. Use Catalogue colour to compare the digital colour.','Recorte original sin recolorear ni girar la veta. En el suelo, la muestra se distribuye en lamas desplazadas para evitar bandas alineadas; despiece y escala estimados. Use Color del catálogo para comparar el color digital.'],
 ['Preparação R3: reduz emendas, suaviza a iluminação fotografada e reorganiza alguns veios. O padrão pode diferir do recorte original.','R3 preparation: reduces seams, softens photographed lighting and rearranges some grain. The pattern may differ from the original crop.','Preparación R3: reduce las juntas, suaviza la iluminación fotografiada y reorganiza algunas vetas. El patrón puede diferir del recorte original.']
);
CUSTOMER_STRINGS.push(
 ['Península ripada','Slatted peninsula','Península de listones'],['Frentes lisas','Flat fronts','Frentes lisos'],['Bancada clara','Light worktop','Encimera clara'],['Armários superiores','Wall cabinets','Armarios altos'],['Cuba simples','Single sink','Fregadero de una cubeta'],['A película impede confirmar o acabamento das frentes.','The film prevents confirmation of the cabinet finish.','La película impide confirmar el acabado de los frentes.'],
 ['Branco com molduras','White with framed fronts','Blanco con molduras'],['Portas com molduras','Framed doors','Puertas con molduras'],['Bancada preta','Black worktop','Encimera negra'],['Sem armários altos visíveis','No visible wall cabinets','Sin armarios altos visibles'],['Módulos dimensionados para a planta seleccionada; cores recolhidas da fotografia.','Modules sized for the selected layout; colours sampled from the photograph.','Módulos dimensionados para el plano seleccionado; colores tomados de la fotografía.'],
 ['Greige contemporâneo','Contemporary greige','Greige contemporáneo'],['Branco e linhas pretas','White with black lines','Blanco con líneas negras'],['Greige com escorredor','Greige with a draining board','Greige con escurridor'],['Bancada preta em U','Black U-shaped worktop','Encimera negra en U'],['Cuba dupla','Double sink','Fregadero de dos cubetas'],['Antracite','Anthracite','Antracita'],['Clássica com armários altos','Classic with wall cabinets','Clásica con armarios altos'],['Creme e placa de gás','Cream with a gas hob','Crema con placa de gas'],['Branco com relevo','White with relief','Blanco con relieve'],['Portas com relevo','Raised-panel doors','Puertas con relieve'],['Bancada cinza','Grey worktop','Encimera gris'],['Cinza verde com molduras','Green-grey with framed fronts','Gris verdoso con molduras'],['Efeito madeira de veio vertical','Vertical wood-grain effect','Efecto madera con veta vertical'],['Cinza em dois tons','Two-tone grey','Gris en dos tonos'],['Frentes sob película','Film-covered fronts','Frentes bajo película'],['Puxadores escuros','Dark handles','Tiradores oscuros'],['Três gavetas','Three drawers','Tres cajones'],['Acabamento por confirmar','Finish to be confirmed','Acabado por confirmar'],['A embalagem oculta frentes e bancada; as cores apresentadas são propostas por confirmar.','Packaging conceals the fronts and worktop; the displayed colours are proposals awaiting confirmation.','El embalaje oculta los frentes y la encimera; los colores mostrados son propuestas pendientes de confirmación.'],['Branco com cuba dupla','White with a double sink','Blanco con fregadero doble'],
 ['Preto e areia','Black and sand','Negro y arena'],['Resguardo de correr','Sliding shower enclosure','Mampara corredera'],['Lavatório integrado','Integrated basin','Lavabo integrado'],['Espelho rectangular','Rectangular mirror','Espejo rectangular'],['Vidro transparente','Clear glass','Vidrio transparente'],['Equipamentos adaptados à divisão da planta; revestimento recolhido da fotografia.','Equipment adapted to the room in the plan; cladding sampled from the photograph.','Equipamiento adaptado a la estancia del plano; revestimiento tomado de la fotografía.'],['Cabine curva · padrão mármore','Curved enclosure · marble pattern','Cabina curva · patrón de mármol'],['Cabine curva com faixas','Curved enclosure with bands','Cabina curva con franjas'],['Prateleiras junto ao espelho','Shelves beside the mirror','Estantes junto al espejo'],['Vidro com privacidade','Privacy glass','Vidrio de privacidad'],['Cabine curva · cinza','Curved enclosure · grey','Cabina curva · gris'],['Padrão pedra e divisória branca','Stone pattern and white partition','Patrón de piedra y mampara blanca'],['Detalhe da sanita','Toilet detail','Detalle del inodoro'],['Sanita branca','White toilet','Inodoro blanco'],['Descarga dupla','Dual flush','Doble descarga'],['Assento arredondado','Rounded seat','Asiento redondeado'],['Referência parcial','Partial reference','Referencia parcial'],['A fotografia documenta sobretudo a sanita; restantes equipamentos são uma proposta base.','The photograph mainly documents the toilet; the remaining equipment is a base proposal.','La fotografía documenta principalmente el inodoro; el resto del equipamiento es una propuesta base.'],['Padrão pedra ondulada e taupe','Wavy stone pattern and taupe','Patrón de piedra ondulada y topo'],['Padrão mármore e vidro fosco','Marble pattern and frosted glass','Patrón de mármol y vidrio mate'],['Padrão mármore e vidro transparente','Marble pattern and clear glass','Patrón de mármol y vidrio transparente'],['Lavatório de pousar','Countertop basin','Lavabo sobre encimera'],['Padrão mármore contrastado','Contrasting marble pattern','Patrón de mármol contrastado'],['Efeito madeira e padrão mármore','Wood effect and marble pattern','Efecto madera y patrón de mármol'],['Padrão mármore cinza escuro','Dark-grey marble pattern','Patrón de mármol gris oscuro'],['Cinza e vidro dividido','Grey with divided glass','Gris con vidrio dividido'],['Padrão mármore e quadrícula','Marble pattern and grid','Patrón de mármol y cuadrícula'],['Veios dourados e vidro','Golden veining and glass','Vetas doradas y vidrio'],['Padrão mármore carvão','Charcoal marble pattern','Patrón de mármol carbón'],
 ['Tijolo Cinza','Grey Brick','Ladrillo Gris'],['Tijolo Bordô','Burgundy Brick','Ladrillo Burdeos'],['Tijolo Creme','Cream Brick','Ladrillo Crema'],['Tijolo Vermelho','Red Brick','Ladrillo Rojo'],['Pedra Areia','Sand Stone','Piedra Arena'],['Bloco Cinza','Grey Block','Bloque Gris'],['Tijolo Castanho','Brown Brick','Ladrillo Marrón'],['Pedra Bege','Beige Stone','Piedra Beige'],['Tijolo Multicor','Multicolour Brick','Ladrillo Multicolor'],['Tijolo Ardósia','Slate Brick','Ladrillo Pizarra'],['Tijolo Rústico','Rustic Brick','Ladrillo Rústico'],['Granito Cinza','Grey Granite','Granito Gris'],['Madeira Mel','Honey Wood','Madera Miel'],['Lamela Branca','White Slat','Lama Blanca'],['Lamela Bege','Beige Slat','Lama Beige'],['Lamela Creme','Cream Slat','Lama Crema'],['Lamela Dourada','Golden Slat','Lama Dorada'],['Lamela Cinza','Grey Slat','Lama Gris'],['Lamela Bordô','Burgundy Slat','Lama Burdeos'],['Grafite','Graphite','Grafito'],['Preto','Black','Negro'],['Vermelho','Red','Rojo'],['Areia','Sand','Arena'],['Granito Branco','White Granite','Granito Blanco'],['Pedra Cinza','Grey Stone','Piedra Gris'],['Cinza Metálico','Metallic Grey','Gris Metálico'],['Prata','Silver','Plata'],['Madeira Castanho','Brown Wood','Madera Marrón'],['Cinza Pérola','Pearl Grey','Gris Perla'],['Madeira Cerejeira','Cherry Wood','Madera Cerezo'],['Cinza Quente','Warm Grey','Gris Cálido'],['Branco Glacial','Glacial White','Blanco Glacial'],['Bege Marfim','Ivory Beige','Beige Marfil'],['Vermelho Borgonha','Burgundy Red','Rojo Borgoña'],
 ['Apoios da maquete','Model supports','Apoyos de la maqueta'],['Chassis e perfis','Chassis and profiles','Chasis y perfiles'],['Pavimento e suporte','Flooring and support','Pavimento y soporte'],['Paredes exteriores','Exterior walls','Paredes exteriores'],['Divisórias e portas interiores','Partitions and interior doors','Tabiques y puertas interiores'],['Isolamento representativo','Representative insulation','Aislamiento representativo'],['Cobertura e tecto','Roof and ceiling','Cubierta y techo'],['Janelas e entrada','Windows and entrance','Ventanas y entrada'],['Equipamentos e mobiliário','Equipment and furniture','Equipamiento y mobiliario'],['Telhado opcional','Optional roof','Tejado opcional'],['Alpendre opcional','Optional porch','Porche opcional'],['Isolar','Isolate','Aislar'],['Opacidade','Opacity','Opacidad'],['Repor camadas','Reset layers','Restablecer capas'],['Explorar cada camada','Explore each layer','Explorar cada capa'],
 ['Forma representativa; fundação do terreno não documentada.','Representative shape; ground foundations not documented.','Forma representativa; cimentación del terreno no documentada.'],['Forma das fotografias; secções e ligações estimadas.','Shape from the photographs; sections and connections estimated.','Forma de las fotografías; secciones y uniones estimadas.'],['Vinílico incluído ou SPC opcional; espessura total estimada.','Included vinyl or optional SPC; total thickness estimated.','Vinílico incluido o SPC opcional; espesor total estimado.'],['Vãos da planta; alturas e espessuras estimadas.','Openings from the plan; heights and thicknesses estimated.','Huecos del plano; alturas y espesores estimados.'],['Relações da planta; dimensões não cotadas estimadas.','Arrangement from the plan; undimensioned measurements estimated.','Relaciones del plano; dimensiones sin cota estimadas.'],['Composição da variante por confirmar.','Variant composition to be confirmed.','Composición de la variante por confirmar.'],['Volume representado; composição por confirmar.','Volume shown; composition to be confirmed.','Volumen representado; composición por confirmar.'],['Vãos da planta; ferragens não cotadas.','Openings from the plan; hardware not dimensioned.','Huecos del plano; herrajes sin cotas.'],['Referências de cozinha/banho; restante mobiliário ilustrativo.','Kitchen/bathroom references; remaining furniture illustrative.','Referencias de cocina/baño; resto del mobiliario ilustrativo.'],['Variante fotografada, medidas por confirmar.','Photographed variant; dimensions to be confirmed.','Variante fotografiada; medidas por confirmar.'],
 ['Isolamento, secções e composição não cotados são representativos. As cores dos materiais mantêm-se.','Undimensioned insulation, sections and composition are representative. Material colours are retained.','El aislamiento, las secciones y la composición sin cotas son representativos. Se mantienen los colores de los materiales.'],['opcional não seleccionado','optional item not selected','opcional no seleccionado'],['Instalações por documentar','Services to be documented','Instalaciones por documentar'],['Água, esgotos e electricidade: o portefólio mantém um esquema visual de circuitos. Percursos, pontos e ligações finais carecem de projecto técnico.','Water, drainage and electricity: the portfolio retains a visual circuit diagram. Final routes, points and connections require a technical design.','Agua, desagües y electricidad: el portafolio mantiene un esquema visual de circuitos. Los recorridos, puntos y conexiones finales requieren un proyecto técnico.']
);
CUSTOMER_STRINGS.push(
 ["Qual é o prazo de entrega e a garantia?", "What are the delivery time and warranty?", "¿Cuál es el plazo de entrega y la garantía?"],
 ["Como é construída a casa?", "How is the home built?", "¿Cómo se construye la casa?"],
 ["Estrutura em aço galvanizado com pintura a pó, paredes em painel sandwich EPS de aço colorido, cobertura em painel sandwich de 50 mm e piso sobre placa de fibrocimento ignífuga no módulo central e contraplacado de bambu nas alas. Instalação eléctrica a 220 V / 50 Hz com protecção diferencial de 32 A. A ficha técnica indica o que ainda falta documentar.", "Galvanised steel frame with powder coating, colour-steel EPS sandwich panel walls, a 50 mm sandwich panel roof and flooring laid on fire-resistant fibre-cement board in the central module and bamboo plywood in the wings. 220 V / 50 Hz electrical installation with 32 A residual-current protection. The technical sheet lists what is still to be documented.", "Estructura de acero galvanizado con pintura en polvo, paredes de panel sándwich EPS de acero prelacado, cubierta de panel sándwich de 50 mm y suelo sobre placa de fibrocemento ignífuga en el módulo central y contrachapado de bambú en las alas. Instalación eléctrica a 220 V / 50 Hz con protección diferencial de 32 A. La ficha técnica indica lo que aún falta documentar."],
 ["Área na ficha do fabricante", "Area on the manufacturer's sheet", "Superficie en la ficha del fabricante"],
 ["Altura exterior e interior", "External and internal height", "Altura exterior e interior"],
 ["2,48 m", "2.48 m", "2,48 m"],
 ["2,24 m", "2.24 m", "2,24 m"],
 ["2,55 m", "2.55 m", "2,55 m"],
 ["Casa dobrada para transporte", "Home folded for transport", "Casa plegada para el transporte"],
 ["11,80 × 2,20 × 2,48 m", "11.80 × 2.20 × 2.48 m", "11,80 × 2,20 × 2,48 m"],
 ["4 600 kg", "4,600 kg", "4600 kg"],
 ["Altura da maquete 3D", "3D model height", "Altura de la maqueta 3D"],
 ["ilustrativa", "illustrative", "ilustrativa"],
 ["Transporte para Portugal Continental", "Transport to mainland Portugal", "Transporte a Portugal continental"],
 ["Incluído no preço da casa", "Included in the home price", "Incluido en el precio de la casa"],
 ["Instalação no local", "On-site installation", "Instalación in situ"]
);
CUSTOMER_STRINGS.push(
 ["Interior: 11,54 × 6,06 m", "Interior: 11.54 × 6.06 m", "Interior: 11,54 × 6,06 m"],
 ["área útil certificada por fornecer", "certified useful area not yet supplied", "área útil certificada pendiente"],
 ["contentor 40HQ", "40HQ container", "contenedor 40HQ"],
 ["Maquete 3D com altura ilustrativa", "The 3D model uses an illustrative height", "Maqueta 3D con altura ilustrativa"],
 ["Prazo de entrega", "Delivery time", "Plazo de entrega"],
 ["transporte incluído para Portugal Continental", "transport to mainland Portugal included", "transporte incluido a Portugal continental"],
 ["Garantia", "Warranty", "Garantía"],
);
CUSTOMER_STRINGS.push(
 ['Armários e bancada','Cabinets and worktop','Armarios y encimera'],
 ['Explorar amostras de bancada','Browse worktop samples','Explorar muestras de encimeras'],['Anterior','Previous','Anterior'],['Seguinte','Next','Siguiente'],
 ['Pedido do cliente · sob orçamento','Customer request · quotation required','Solicitud del cliente · bajo presupuesto'],
 ['Catálogo do fornecedor · sob orçamento','Supplier catalogue · quotation required','Catálogo del proveedor · bajo presupuesto'],
 ['Referências do catálogo e cores solicitadas para a proposta.','Catalogue references and colours requested for the proposal.','Referencias del catálogo y colores solicitados para la propuesta.'],
 ['Móvel do lavatório','Vanity unit','Mueble de lavabo'],
 ['Personalizações opcionais, sob orçamento.','Optional customisations, subject to quotation.','Personalizaciones opcionales, bajo presupuesto.'],
 ['Ilha adicional na cozinha','Additional kitchen island','Isla adicional de cocina'],
 ['Cor dos armários da cozinha','Kitchen cabinet colour','Color de los armarios de cocina'],
 ['Cor do móvel do banho','Bathroom cabinet colour','Color del mueble de baño'],
 ['Propostas de cor','Colour ideas','Propuestas de color'],
 ['Bancada personalizada','Custom worktop','Encimera personalizada'],
 ['Acabamento da referência','Reference finish','Acabado de referencia'],
 ['Usar acabamento da referência','Use reference finish','Usar acabado de referencia'],
 ['Catálogo de bancadas ↗','Worktop catalogue ↗','Catálogo de encimeras ↗'],
 ['Escolher o local ↗','Choose location ↗','Elegir ubicación ↗'],
 ['Para alterar o 3D, escolha um vão da planta.','To update the 3D model, choose an opening on the plan.','Para actualizar el modelo 3D, elija un hueco del plano.'],
 ['Escolha o vão onde pretende aplicar este artigo.','Choose the opening where you want to apply this item.','Elija el hueco donde desea aplicar este artículo.'],
 ['Cor de preferência para a proposta. Acabamento final e correspondência com uma amostra física por confirmar.','Preferred colour for your proposal. Final finish and physical sample match to be confirmed.','Color preferido para la propuesta. Acabado final y correspondencia con una muestra física por confirmar.'],
 ['O preço dos armários superiores refere-se ao adicional; o conjunto de módulos abrangido será confirmado na proposta.','The upper-cabinet price refers to the optional extra; the modules covered will be confirmed in the proposal.','El precio de los armarios superiores corresponde al extra; los módulos incluidos se confirmarán en la propuesta.'],
 ['A ilha mantém-se no pedido. Esta planta precisa de adaptação para a representar com passagem livre.','The island remains in your request. This layout needs adaptation to show it with clear circulation.','La isla se mantiene en la solicitud. Esta distribución necesita adaptación para representarla con paso libre.'],
 ['78 amostras originais do fornecedor. A selecção altera a bancada no 3D; preço e disponibilidade sujeitos a confirmação.','78 original supplier samples. Selection updates the 3D worktop; price and availability require confirmation.','78 muestras originales del proveedor. La selección actualiza la encimera 3D; precio y disponibilidad sujetos a confirmación.'],
 ['Água fria','Cold water','Agua fría'],['Água quente','Hot water','Agua caliente'],['Esgotos','Drainage','Desagües'],
 ['Quadro','Distribution board','Cuadro'],['condutas','conduits','conductos'],['caixas','junction boxes','cajas'],['tomadas','sockets','enchufes'],['iluminação','lighting','iluminación'],
 ['cor pedida pelo cliente; correspondência e preço por confirmar.','customer-requested colour; matching and price to be confirmed.','color solicitado por el cliente; correspondencia y precio por confirmar.'],
 ['fornecimento e preço por confirmar.','supply and price to be confirmed.','suministro y precio por confirmar.']
);
for(let i=1;i<=78;i++){const n=String(i).padStart(2,'0');CUSTOMER_STRINGS.push(['Bancada '+n,'Worktop '+n,'Encimera '+n]);}
CUSTOMER_STRINGS.push(
 ['Frente em vidro · 3 módulos','Glazed entrance front · 3 modules','Frente acristalado · 3 módulos'],
 ['Lateral completa em vidro · 6 módulos','Fully glazed long side · 6 modules','Lateral completamente acristalado · 6 módulos'],
 ['Lateral envidraçada','Glazed side','Lateral acristalado'],['Lateral esquerda','Left side','Lateral izquierdo'],['Lateral direita','Right side','Lateral derecho'],
 ['Actualização Green Village · 02/10/2026','Green Village update · 02/10/2026','Actualización Green Village · 02/10/2026'],
 ['Uma frente completa de entrada · cerca de 6,2 m · 3 módulos','One complete entrance front · approximately 6.2 m · 3 modules','Un frente completo de entrada · unos 6,2 m · 3 módulos'],
 ['Uma lateral completa · 40FT · 11,8 m · 6 módulos','One complete long side · 40FT · 11.8 m · 6 modules','Un lateral completo · 40FT · 11,8 m · 6 módulos'],
 ['3 módulos na frente da entrada.','3 modules across the entrance front.','3 módulos en el frente de entrada.'],
 ['2 600 € pelo conjunto completo; não por módulo.','€2,600 for the complete assembly; not per module.','2.600 € por el conjunto completo; no por módulo.'],
 ['6 módulos numa lateral comprida de 11,8 m.','6 modules along one 11.8 m side.','6 módulos en un lateral de 11,8 m.'],
 ['5 190 € pelo conjunto completo; não por módulo.','€5,190 for the complete assembly; not per module.','5.190 € por el conjunto completo; no por módulo.'],
 ['Pode combinar com a frente de entrada em vidro.','Can be combined with the glazed entrance front.','Puede combinarse con el frente de entrada acristalado.'],
 ['Configuração das folhas e instalação sujeitas a validação técnica.','Leaf configuration and installation require technical validation.','Configuración de las hojas e instalación sujetas a validación técnica.'],
 ['Painéis fixos ilustrados; ferragens e aberturas a definir no projecto.','Fixed panes illustrated; hardware and openings to be defined in the project.','Paneles fijos ilustrados; herrajes y aperturas por definir en el proyecto.'],
 ['IVA por confirmar','VAT to be confirmed','IVA por confirmar'],
 ['O 3D representa uma frente. As unidades adicionais ficam como pedido na ficha; indique os restantes locais e medidas. Para juntar uma lateral completa, seleccione Lateral completa em vidro · 6 módulos.','The 3D shows one front. Additional assemblies remain in the customer request; specify other locations and dimensions. To add a complete side, select Fully glazed long side · 6 modules.','El 3D representa un frente. Los conjuntos adicionales quedan en la solicitud; indique los demás lugares y medidas. Para añadir un lateral completo, seleccione Lateral completamente acristalado · 6 módulos.']
);
CUSTOMER_STRINGS.push(
 ['Animação do circuito','Circuit animation','Animación del circuito'],
 ['Água em circulação','Water in motion','Agua en circulación'],
 ['Percurso da energia','Energy flow','Recorrido de la energía'],
 ['Fluxo ilustrativo','Illustrative flow','Flujo ilustrativo'],
 ['Pausar fluxo','Pause flow','Pausar flujo'],
 ['Reproduzir fluxo','Play flow','Reproducir flujo'],
 ['Velocidade','Speed','Velocidad'],
 ['0,5×','0.5×','0,5×']
);
CUSTOMER_STRINGS.push(...COMMERCIAL_TRANSLATIONS,
 ['Condições Green Village','Green Village terms','Condiciones Green Village'],
 ['Classes, ensaios e certificados do modelo','Classes, tests and model certificates','Clases, ensayos y certificados del modelo'],
 ['Documentação técnica do modelo','Model technical documentation','Documentación técnica del modelo'],
 ['Classes, ensaios e certificados não fornecidos.','Classes, tests and certificates have not been supplied.','No se han facilitado clases, ensayos ni certificados.'],
 ['Transporte para Portugal Continental incluído','Transport to mainland Portugal included','Transporte a Portugal continental incluido']
);
for(const [pt,en,es] of CUSTOMER_STRINGS){STRINGS.en[pt]=en;STRINGS.es[pt]=es;}
const SENTENCE_KEYS=Object.fromEntries(['en','es'].map(lang=>[lang,Object.keys(STRINGS[lang]).filter(message=>message.endsWith('.')).sort((a,b)=>b.length-a.length)]));
const UPPER_STRINGS=Object.fromEntries(['en','es'].map(lang=>[lang,Object.fromEntries(Object.entries(STRINGS[lang]).map(([pt,value])=>[pt.toLocaleUpperCase('pt-PT'),value.toLocaleUpperCase(lang==='es'?'es-ES':'en-GB')]))]));

const DYNAMIC_STRINGS=[
 [/^Amostra (\d+)$/,(_,n)=>[`Sample ${n}`,`Muestra ${n}`]],
 [/^Todos os (\d+) artigos$/,(_,n)=>[`All ${n} items`,`Todos los ${n} artículos`]],
 [/^Os meus adicionais \((\d+)\)$/,(_,n)=>[`My extras (${n})`,`Mis extras (${n})`]],
 [/^(\d+) de (\d+) locais definidos$/,(_,n,total)=>[`${n} of ${total} locations assigned`,`${n} de ${total} ubicaciones definidas`]],
 [/^(\d+) alteraç(?:ão|ões) por orçamentar$/,(_,n)=>[`${n} ${n==='1'?'change':'changes'} awaiting a quotation`,`${n} ${n==='1'?'cambio pendiente':'cambios pendientes'} de presupuesto`]],
 [/^(\d+) mosquiteiros? por atribuir\. Escolha uma janela ou ajuste a quantidade pretendida\.$/,(_,n)=>[`${n} insect ${n==='1'?'screen':'screens'} awaiting a location. Choose a window or adjust the requested quantity.`,`${n} ${n==='1'?'mosquitera pendiente':'mosquiteras pendientes'} de asignación. Elija una ventana o ajuste la cantidad deseada.`]],
 [/^PVP ACTUALIZADO · (.+)$/,(_,date)=>[`UPDATED PRICES · ${date}`,`PVP ACTUALIZADO · ${date}`]],
 [/^PVP actual · ficha p\. (\d+)$/,(_,n)=>[`Current price · sheet p. ${n}`,`PVP actual · ficha p. ${n}`]],
 [/^PVP actualizado em ([\d/]+)\. O PDF original conserva os preços da edição de julho\. O subtotal soma os PVP actuais multiplicados pelas quantidades pedidas; o âmbito de facturação dos artigos sem unidade expressa e os equipamentos já incluídos têm de ser confirmados pela Green Village\.$/,(_,date)=>[`Prices updated on ${date}. The original PDF retains the July edition prices. The subtotal adds current prices multiplied by requested quantities; the billing scope of items without an explicit unit and equipment already included must be confirmed by Green Village.`,`PVP actualizado el ${date}. El PDF original conserva los precios de la edición de julio. El subtotal suma los PVP actuales multiplicados por las cantidades solicitadas; Green Village debe confirmar el alcance de facturación de los artículos sin unidad expresa y el equipamiento ya incluido.`]],
 [/^([\d\s.,\u00a0]+€) com IVA · PVP de ([\d/]+)\. Conjunto de módulos abrangido por confirmar\.$/,(_,price,date)=>[`${price} including VAT · Price as of ${date}. The set of modules included is to be confirmed.`,`${price} con IVA · PVP del ${date}. Conjunto de módulos incluido por confirmar.`]],
 [/^Porta do quarto (\d+)$/,(_,n)=>[`Bedroom ${n} door`,`Puerta del dormitorio ${n}`]],
 [/^(Janela|Porta) lateral (esquerda|direita) · (\d+)$/,(_,kind,side,n)=>[`${side==='esquerda'?'Left':'Right'} side ${kind==='Janela'?'window':'door'} · ${n}`,`${kind==='Janela'?'Ventana':'Puerta'} lateral ${side==='esquerda'?'izquierda':'derecha'} · ${n}`]],
 [/^Quarto (\d+)( \*)?$/,(_,n,star='')=>[`Bedroom ${n}${star}`,`Dormitorio ${n}${star}`]],
 [/^(\d+) quartos? \/ 1 WC$/,(_,n)=>[`${n} ${n==='1'?'bedroom':'bedrooms'} / 1 bathroom`,`${n} ${n==='1'?'dormitorio':'dormitorios'} / 1 baño`]],
 [/^(\d+) quartos? · 1 casa de banho( · usar cozinha linear, sob orçamento)?$/,(_,n,adapted)=>[`${n} ${n==='1'?'bedroom':'bedrooms'} · 1 bathroom${adapted?' · linear kitchen, quotation required':''}`,`${n} ${n==='1'?'dormitorio':'dormitorios'} · 1 baño${adapted?' · cocina lineal, bajo presupuesto':''}`]],
 [/^Original · página (\d+) ↗$/,(_,n)=>[`Original · page ${n} ↗`,`Original · página ${n} ↗`]],
 [/^Referência (\d+) · fotografia original ↗$/,(_,n)=>[`Reference ${n} · original photograph ↗`,`Referencia ${n} · fotografía original ↗`]],
 [/^Fotografia do artigo · catálogo p\. (\d+)$/,(_,n)=>[`Item photograph · catalogue p. ${n}`,`Fotografía del artículo · catálogo p. ${n}`]],
 [/^Amostra SPC (\S+) · recorte do catálogo sem inscrições$/,(_,code)=>[`SPC sample ${code} · catalogue crop without lettering`,`Muestra SPC ${code} · recorte del catálogo sin inscripciones`]],
 [/^Amostra do painel 3D · catálogo p\. (\d+)$/,(_,n)=>[`3D panel sample · catalogue p. ${n}`,`Muestra del panel 3D · catálogo p. ${n}`]],
 [/^T([0-4]) · distribuição · ([AB])$/,(_,n,variant)=>[`T${n} · layout · ${variant}`,`T${n} · distribución · ${variant}`]],
 [/^(\d+) COZINHAS$/,(_,n)=>[`${n} KITCHENS`,`${n} COCINAS`]],
 [/^(\d+) AMBIENTES$/,(_,n)=>[`${n} SETTINGS`,`${n} AMBIENTES`]],
 [/^SPC: adicional único de 1 200 € por casa; referência escolhida no configurador\.$/,()=>['SPC: a single €1,200 upgrade per home; reference selected in the configurator.','SPC: suplemento único de 1 200 € por casa; referencia seleccionada en el configurador.']],
 [/^([0-9]+) VÍDEOS DE REFERÊNCIA$/,(_,n)=>[`${n} REFERENCE VIDEOS`,`${n} VÍDEOS DE REFERENCIA`]],
 [/^A carregar (\d+) materiais?…$/,(_,n)=>[`Loading ${n} ${n==='1'?'material':'materials'}…`,`Cargando ${n} ${n==='1'?'material':'materiales'}…`]]
];

/** Translate trusted application copy only. Never pass free-form client data. */
export function translateText(value,lang='pt'){
 const source=String(value??'');
 if(lang==='pt'||!STRINGS[lang]||!source.trim())return source;
 const key=source.trim(),translated=translateKnown(key,lang,0);
 return source.slice(0,source.indexOf(key))+translated+source.slice(source.indexOf(key)+key.length);
}

function translateKnown(key,lang,depth){
 const map=STRINGS[lang];
 if(Object.hasOwn(map,key))return map[key];
 if(depth>4)return key;
 for(const [pattern,render] of DYNAMIC_STRINGS){const match=key.match(pattern);if(match)return render(...match)[lang==='en'?0:1];}
 const affixes=[
  [/^Ampliar fotografia de (.+)$/,lang==='en'?'Enlarge photograph of ':'Ampliar fotografía de '],
  [/^Ampliar (.+)$/,lang==='en'?'Enlarge ':'Ampliar '],
  [/^Descarregar (.+) em MP4$/,lang==='en'?'Download ':'Descargar ',lang==='en'?' as MP4':' en MP4'],
  [/^Opacidade: (.+)$/,lang==='en'?'Opacity: ':'Opacidad: '],
  [/^Referência escolhida: (.+)$/,lang==='en'?'Selected reference: ':'Referencia seleccionada: '],
  [/^Falta definir a aplicação de (.+)\.$/,lang==='en'?'Assign a location for ':'Falta definir la ubicación de ','.']
 ];
 for(const [pattern,before,after=''] of affixes){const match=key.match(pattern);if(match)return before+translateKnown(match[1],lang,depth+1)+after;}
 const reference=key.match(/^(Cozinha de referência|Ambiente de banho) (\d+): (.+)$/);
 if(reference)return `${lang==='en'?(reference[1]==='Cozinha de referência'?'Kitchen reference':'Bathroom setting'):(reference[1]==='Cozinha de referência'?'Cocina de referencia':'Ambiente de baño')} ${reference[2]}: ${translateKnown(reference[3],lang,depth+1)}`;
 const numbered=key.match(/^(\d+\s*[/·×]\s*)(.+)$/);
 if(numbered)return numbered[1]+translateKnown(numbered[2],lang,depth+1);
 const marker=key.match(/^(.*?)(\s*[↗↓↑✓])$/);
 if(marker)return translateKnown(marker[1],lang,depth+1)+marker[2];
 if(Object.hasOwn(UPPER_STRINGS[lang],key))return UPPER_STRINGS[lang][key];
 // Concatenated standard descriptions retain complete known sentences as units.
 for(const original of SENTENCE_KEYS[lang]){
  if(key.startsWith(original+' '))return map[original]+' '+translateKnown(key.slice(original.length+1),lang,depth+1);
 }
 const fragments=key.split(/(\s+[·—]\s+|(?<=\.)\s+(?=[A-ZÁÀÉÍÓÚÂÊÔÃÕ]))/u);
 if(fragments.length>1)return fragments.map((part,index)=>index%2?part:translateKnown(part,lang,depth+1)).join('');
 return key;
}

const ptOriginals=new WeakMap();
const attributeOriginals=new WeakMap();
const ATTRIBUTES=['aria-label','title','alt','placeholder','label'];
const PRIVATE_TEXT='script,style,code,input,textarea,[contenteditable]:not([contenteditable="false"]),[translate="no"],[data-i18n="off"],.client-preserve-lines,.client-summary > h3,.client-summary dl dd,.client-request > strong,.client-request > p:not(:last-child)';
let language='pt';
try{const saved=typeof window!=='undefined'?window.localStorage.getItem('gv72-language'):null;if(['pt','en','es'].includes(saved))language=saved;}catch{}

function collectTextNodes(root){
  if(root.nodeType===3)return [root];
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  return nodes;
}

function originalRecord(store,key,current){
 const previous=store.get(key);
 if(previous&&(current===previous.last||current===previous.source))return previous;
 const record={source:current,last:current};store.set(key,record);return record;
}

function translateFileLabel(source){
 // Keep filenames byte-for-byte while translating only the application-owned prefix.
 const match=source.match(/^(Planta do cliente|Fotografia de referência|Observação)( · )([\s\S]*)$/);
 return match?translateText(match[1],language)+match[2]+match[3]:source;
}

export function translateDOM(root=document){
  for(const node of collectTextNodes(root)){
    const parent=node.parentElement;
    if(!parent||parent.closest(PRIVATE_TEXT))continue;
    const record=originalRecord(ptOriginals,node,node.nodeValue);
    const fileLabel=parent.matches('.client-attachment > strong,.client-attachment .project-field > span');
    record.last=language==='pt'?record.source:fileLabel?translateFileLabel(record.source):translateText(record.source,language);
    if(node.nodeValue!==record.last)node.nodeValue=record.last;
  }
  const elements=root.nodeType===1?[root,...root.querySelectorAll('*')]:root.querySelectorAll?[...root.querySelectorAll('*')]:[];
  for(const element of elements){
    if(element.closest('[translate="no"],[data-i18n="off"]'))continue;
    let records=attributeOriginals.get(element);
    if(!records){records=new Map();attributeOriginals.set(element,records);}
    for(const attribute of ATTRIBUTES){
      if(!element.hasAttribute(attribute)||(attribute==='label'&&!element.matches('optgroup,option')))continue;
      if(attribute==='alt'&&element.matches('.client-attachment img'))continue;
      const record=originalRecord(records,attribute,element.getAttribute(attribute));
      const attachmentRemove=element.hasAttribute('data-remove-attachment')&&attribute==='aria-label';
      record.last=language==='pt'?record.source:attachmentRemove?record.source.replace(/^Retirar /,language==='en'?'Remove ':'Retirar '):translateText(record.source,language);
      if(element.getAttribute(attribute)!==record.last)element.setAttribute(attribute,record.last);
    }
  }
}

const TITLES={en:'Expandable 72 — Green Village',es:'Expandible 72 — Green Village',pt:'Expandível 72 — Green Village'};
const DESCRIPTIONS={en:'Explore and customize the Green Village 72 expandable home. 3D model, seven floor plans, catalogue finishes and presentation films.',es:'Explore y personalice la casa expandible Green Village 72. Modelo 3D, siete planos, acabados del catálogo y películas de presentación.',pt:'Explore e personalize a casa expansível Green Village 72. Modelo 3D, sete plantas, acabamentos do catálogo e filmes de apresentação.'};

export function setLanguage(next){
  if(!['pt','en','es'].includes(next))throw new Error('Unsupported language.');
  language=next;
  try{localStorage.setItem('gv72-language',next);}catch{}
  document.documentElement.lang=next==='en'?'en':next==='es'?'es-ES':'pt-PT';
  document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===next)));
  document.title=TITLES[next]||TITLES.pt;
  const meta=document.querySelector('meta[name="description"]');
  if(meta)meta.content=DESCRIPTIONS[next]||DESCRIPTIONS.pt;
  for(const cb of listeners)cb(next);
  translateDOM();
}

const listeners=[];
export function onLangChange(cb){listeners.push(cb);}
export function getLang(){return language;}
export function resolveLanguage(search,stored='pt'){
 const requested=new URLSearchParams(search).get('lang');
 return ['pt','en','es'].includes(requested)?requested:['pt','en','es'].includes(stored)?stored:'pt';
}
export function initI18n(){
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-language]');
    if(button)setLanguage(button.dataset.language);
  });
  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      if(mutation.type==='attributes'){translateDOM(mutation.target);continue;}
      if(mutation.type==='characterData'){translateDOM(mutation.target);continue;}
      for(const node of mutation.addedNodes)if(node.nodeType===Node.ELEMENT_NODE||node.nodeType===Node.TEXT_NODE)translateDOM(node);
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRIBUTES});
  setLanguage(resolveLanguage(window.location.search,language));
}
