// Authored presentation copy found by the R38 browser audit. Source documents stay unchanged.
const pairs = [
 ['Exterior da colecção Expandível 72.', 'Extérieur de la collection Extensible 72.', 'Esterno della collezione Espandibile 72.'],
 ['Janelas nos painéis', 'Fenêtres dans les panneaux', 'Finestre nei pannelli'],
 ['Percorrer a expansão', 'Parcourir le déploiement', 'Scorri le fasi di espansione'],
 ['O contentor começa totalmente fechado. A arrumação interna das peças é ilustrativa; as dimensões de transporte não estão confirmadas.', 'Le conteneur est entièrement fermé au départ. Le rangement intérieur des éléments est illustratif ; les dimensions de transport ne sont pas confirmées.', 'Il container è inizialmente completamente chiuso. La disposizione interna dei componenti è illustrativa; le dimensioni di trasporto non sono confermate.'],
 ['Ordem confirmada pela Green Village: fechado, alas laterais, paredes laterais, frente e traseira. Arrumação interna e articulações ilustrativas. Telhado adicional, terraço e interiores omitidos durante a demonstração.', 'Ordre confirmé par Green Village : fermé, ailes latérales, parois latérales, façade avant et arrière. Rangement intérieur et articulations illustratifs. Toiture supplémentaire, terrasse et aménagements intérieurs omis pendant la démonstration.', 'Ordine confermato da Green Village: chiuso, ali laterali, pareti laterali, fronte e retro. Disposizione interna e articolazioni illustrative. Tetto aggiuntivo, terrazza e interni omessi durante la dimostrazione.'],
 ['A imagem começa com as coberturas já abertas. O estado totalmente fechado segue a explicação fornecida pela Green Village.', 'L’image commence avec les couvertures déjà ouvertes. L’état entièrement fermé suit les explications fournies par Green Village.', 'L’immagine inizia con le coperture già aperte. Lo stato completamente chiuso segue la spiegazione fornita da Green Village.'],
 ['Apresentação do modelo', 'Présentation du modèle', 'Presentazione del modello'],
 ['Demonstração 3D independente da expansão. Arraste ou use as setas para rodar; mais e menos para ampliar.', 'Démonstration 3D indépendante du déploiement. Faites glisser ou utilisez les flèches pour tourner ; plus et moins pour zoomer.', 'Dimostrazione 3D indipendente dell’espansione. Trascina o usa le frecce per ruotare; più e meno per regolare lo zoom.'],
 ['Repor câmara da expansão', 'Réinitialiser la caméra du déploiement', 'Ripristina la vista dell’espansione'],
 ['Aproximar expansão', 'Zoomer sur le déploiement', 'Ingrandisci l’espansione'],
 ['Afastar expansão', 'Dézoomer du déploiement', 'Riduci l’espansione'],
 ['Vídeos de apresentação: cada ambiente está no seu sector. Não reproduzem a configuração seleccionada nem definem os equipamentos incluídos de série. Todos sem áudio.', 'Vidéos de présentation : chaque ambiance figure dans sa rubrique. Elles ne reproduisent pas la configuration sélectionnée et ne définissent pas les équipements de série. Toutes sont sans audio.', 'Video di presentazione: ogni ambiente è nella propria sezione. Non riproducono la configurazione selezionata né definiscono le dotazioni di serie. Tutti senza audio.'],
 ['Guardar 4K ↓', 'Enregistrer en 4K ↓', 'Salva in 4K ↓'],
 ['Usar esta configuração ↗', 'Utiliser cette configuration ↗', 'Usa questa configurazione ↗'],
 ['Perspectiva interior mobilada da T3-A. Cobertura ocultada e paredes em corte para mostrar a distribuição.', 'Vue en perspective de l’intérieur meublé du T3-A. Couverture masquée et murs en coupe pour montrer l’agencement.', 'Vista prospettica dell’interno arredato del T3-A. Copertura nascosta e pareti in sezione per mostrare la disposizione.'],
 ['Vista superior ortogonal do modelo mobilado. Corpo principal 11,80 × 6,22 m, com alpendre adicional ilustrado; divisórias e mobiliário aproximados.', 'Vue orthogonale de dessus du modèle meublé. Corps principal de 11,80 × 6,22 m, avec auvent supplémentaire représenté ; cloisons et mobilier approximatifs.', 'Vista ortogonale dall’alto del modello arredato. Corpo principale di 11,80 × 6,22 m, con portico aggiuntivo illustrato; tramezzi e arredi approssimativi.'],
 ['Armação ilustrativa da mesma T3-A. Secções, perfis e fixações não constituem um desenho de fabrico.', 'Ossature illustrative du même T3-A. Les sections, profilés et fixations ne constituent pas un plan de fabrication.', 'Struttura illustrativa dello stesso T3-A. Sezioni, profili e fissaggi non costituiscono un disegno di fabbricazione.'],
 ['Elevação da entrada, identificada pela planta (+Z). T3-A com cobertura plana, sem telhado adicional nem alpendre.', 'Élévation de l’entrée, identifiée sur le plan (+Z). T3-A avec toiture plate, sans toiture supplémentaire ni auvent.', 'Prospetto dell’ingresso, identificato nella planimetria (+Z). T3-A con copertura piana, senza tetto aggiuntivo né portico.'],
 ['Elevação da lateral direita vista a partir da entrada (+X). Posições e alturas dos vãos estimadas a partir das fontes.', 'Élévation du côté droit vu depuis l’entrée (+X). Positions et hauteurs des ouvertures estimées à partir des sources.', 'Prospetto del lato destro visto dall’ingresso (+X). Posizioni e altezze delle aperture stimate dalle fonti.'],
 ['Elevação oposta à entrada (−Z), com o vão da casa de banho e janelas dos quartos. Sem orientação geográfica atribuída.', 'Élévation opposée à l’entrée (−Z), avec l’ouverture de la salle de bains et les fenêtres des chambres. Aucune orientation géographique attribuée.', 'Prospetto opposto all’ingresso (−Z), con l’apertura del bagno e le finestre delle camere. Nessun orientamento geografico assegnato.'],
 ['Elevação da lateral esquerda vista a partir da entrada (−X). Mesma planta T3-A e acabamentos originais.', 'Élévation du côté gauche vu depuis l’entrée (−X). Même plan T3-A et finitions d’origine.', 'Prospetto del lato sinistro visto dall’ingresso (−X). Stessa planimetria T3-A e finiture originali.'],
 ['Imagens de um estudo anterior do modelo. Para guardar a geometria e as escolhas actuais, use Exportar imagem 4K no estúdio. Dimensões não cotadas e escala dos padrões estimadas. As fotografias originais estão disponíveis na Ficha técnica.', 'Images d’une étude antérieure du modèle. Pour enregistrer la géométrie et les choix actuels, utilisez Exporter une image 4K dans le studio. Les dimensions non cotées et l’échelle des motifs sont estimées. Les photographies originales sont disponibles dans la Fiche technique.', 'Immagini di uno studio precedente del modello. Per salvare la geometria e le scelte attuali, usa Esporta immagine 4K nello studio. Le dimensioni non quotate e la scala dei motivi sono stimate. Le fotografie originali sono disponibili nella Scheda tecnica.'],
 ['Movimentação e retirada da casa do contentor de transporte', 'Manutention et sortie de la maison du conteneur de transport', 'Movimentazione ed estrazione della casa dal container di trasporto'],
 ['Movimentação no terreno', 'Manutention sur le terrain', 'Movimentazione sul terreno'],
 ['Divisões e acabamentos', 'Pièces et finitions', 'Ambienti e finiture'],
 ['Protecção lateral', 'Protection latérale', 'Protezione laterale'],
 ['Janela e revestimento', 'Fenêtre et revêtement', 'Finestra e rivestimento'],
 ['Vídeo completo da fonte, a partir de 15:45. Reprodução pelo YouTube, com áudio e controlos de volume.', 'Vidéo source complète, à partir de 15:45. Lecture sur YouTube, avec audio et réglage du volume.', 'Video completo della fonte, a partire da 15:45. Riproduzione tramite YouTube, con audio e controlli del volume.'],
 ['Vídeo completo da fonte, a partir de 08:12. Reprodução pelo YouTube, com áudio e controlos de volume.', 'Vidéo source complète, à partir de 08:12. Lecture sur YouTube, avec audio et réglage du volume.', 'Video completo della fonte, a partire da 08:12. Riproduzione tramite YouTube, con audio e controlli del volume.'],
 ['Visita T2 com cozinhas e ambientes de banho do catálogo. Consulte o configurador para a distribuição e as portas actualizadas.', 'Visite du T2 avec les cuisines et ambiances de salle de bains du catalogue. Consultez le configurateur pour l’agencement et les portes actualisés.', 'Visita del T2 con cucine e ambienti bagno del catalogo. Consulta il configuratore per la disposizione e le porte aggiornate.'],
 ['14 segundos da elevação longitudinal de dentro para fora. Registo da revisão R9; cobertura translúcida para observar ambas as paredes. Eixo e folgas ilustrativos, topos e interior omitidos.', '14 secondes de relevage longitudinal de l’intérieur vers l’extérieur. Enregistrement de la révision R9 ; couverture translucide pour observer les deux parois. Axe et jeux illustratifs, extrémités et intérieur omis.', '14 secondi di sollevamento longitudinale dall’interno verso l’esterno. Registrazione della revisione R9; copertura traslucida per osservare entrambe le pareti. Asse e giochi illustrativi, estremità e interni omessi.'],
 ['Descarregar vídeo sem áudio ↓', 'Télécharger la vidéo sans audio ↓', 'Scarica il video senza audio ↓'],
 ['Filmes de apresentação', 'Films de présentation', 'Filmati di presentazione'],
 ['Descarregar filme exterior e interior', 'Télécharger le film de l’extérieur et de l’intérieur', 'Scarica il filmato dell’esterno e dell’interno'],
 ['Elevação das paredes em 3D', 'Relevage des parois en 3D', 'Sollevamento delle pareti in 3D'],
 ['Descarregar filme da elevação das paredes', 'Télécharger le film du relevage des parois', 'Scarica il filmato del sollevamento delle pareti'],
];

const renderTitles = [
 ['Exterior com telhado e alpendre', 'Extérieur avec toiture et auvent', 'Esterno con tetto e portico'],
 ['Exterior com cobertura plana', 'Extérieur avec toiture plate', 'Esterno con copertura piana'],
 ['T3-A · interior mobilado', 'T3-A · intérieur meublé', 'T3-A · interno arredato'],
 ['Planta T3-A', 'Plan T3-A', 'Planimetria T3-A'],
 ['Cozinha em L · referência 03', 'Cuisine en L · référence 03', 'Cucina a L · riferimento 03'],
 ['Casa de banho · referência 06', 'Salle de bains · référence 06', 'Bagno · riferimento 06'],
 ['Estrutura', 'Structure', 'Struttura'],
 ['Fachada principal', 'Façade principale', 'Facciata principale'],
 ['Fachada lateral direita', 'Façade latérale droite', 'Facciata laterale destra'],
 ['Fachada posterior', 'Façade arrière', 'Facciata posteriore'],
 ['Fachada lateral esquerda', 'Façade latérale gauche', 'Facciata laterale sinistra'],
];
for (const [pt, fr, it] of renderTitles) {
 pairs.push([pt, fr, it]);
 pairs.push([`Guardar ${pt} em 4K`, `Enregistrer ${fr} en 4K`, `Salva ${it} in 4K`]);
 pairs.push([`Guardar ${pt} em PNG original`, `Enregistrer ${fr} au format PNG original`, `Salva ${it} in PNG originale`]);
}
for (const type of ['T3', 'T4']) for (const variant of ['A', 'B']) {
 pairs.push([`${type} · distribuição · ${variant}`, `${type} · agencement · ${variant}`, `${type} · distribuzione · ${variant}`]);
}
for (const code of ['8302B436', '166AA6EA']) {
 pairs.push([`T3 · distribuição · A · GV72-${code} · 4K`, `T3 · agencement · A · GV72-${code} · 4K`, `T3 · distribuzione · A · GV72-${code} · 4K`]);
}
const sourceTitle = pairs.find(row => row[0] === 'Movimentação e retirada da casa do contentor de transporte');
pairs.push(
 [`Momento na fonte ${sourceTitle[0]}`, `Position dans la source ${sourceTitle[1]}`, `Posizione nella fonte ${sourceTitle[2]}`],
 [`Vídeo do YouTube: ${sourceTitle[0]}`, `Vidéo YouTube : ${sourceTitle[1]}`, `Video YouTube: ${sourceTitle[2]}`],
 [`Reproduzir ${sourceTitle[0]} com áudio`, `Lire ${sourceTitle[1]} avec audio`, `Riproduci ${sourceTitle[2]} con audio`],
 [`Reproduzir ${sourceTitle[0]}`, `Lire ${sourceTitle[1]}`, `Riproduci ${sourceTitle[2]}`],
 [`Ver ${sourceTitle[0]} em ecrã inteiro`, `Voir ${sourceTitle[1]} en plein écran`, `Visualizza ${sourceTitle[2]} a schermo intero`],
);
for (const [time, title] of [['01:00', 'Movimentação no terreno'], ['09:00', 'Divisões e acabamentos'], ['00:02', 'Protecção lateral'], ['00:14', 'Janela e revestimento']]) {
 const row = pairs.find(entry => entry[0] === title);
 pairs.push([`${time} · ${title}`, `${time} · ${row[1]}`, `${time} · ${row[2]}`]);
 pairs.push([`${title}, ${time}`, `${row[1]}, ${time}`, `${row[2]}, ${time}`]);
}

export const FR_IT_PRESENTATION = Object.freeze({
 fr: Object.freeze(Object.fromEntries(pairs.map(([pt, fr]) => [pt, fr]))),
 it: Object.freeze(Object.fromEntries(pairs.map(([pt, , it]) => [pt, it]))),
});

// The same browser audit exposed older gaps in the English and Spanish surfaces.
const enEsPairs = [
 ['Exterior da colecção Expandível 72.', 'Exterior of the Expandable 72 collection.', 'Exterior de la colección Expandible 72.'],
 ['Janelas nos painéis', 'Windows in the panels', 'Ventanas en los paneles'],
 ['Percorrer a expansão', 'Explore the expansion sequence', 'Recorrer la expansión'],
 ['O contentor começa totalmente fechado. A arrumação interna das peças é ilustrativa; as dimensões de transporte não estão confirmadas.', 'The container starts fully closed. The internal arrangement of components is illustrative; transport dimensions are not confirmed.', 'El contenedor comienza completamente cerrado. La disposición interior de las piezas es ilustrativa; las dimensiones de transporte no están confirmadas.'],
 ['Ordem confirmada pela Green Village: fechado, alas laterais, paredes laterais, frente e traseira. Arrumação interna e articulações ilustrativas. Telhado adicional, terraço e interiores omitidos durante a demonstração.', 'Sequence confirmed by Green Village: closed, side wings, side walls, front and rear. Internal arrangement and joints are illustrative. Additional roof, terrace and interiors are omitted during the demonstration.', 'Orden confirmado por Green Village: cerrado, alas laterales, paredes laterales, frente y parte trasera. Disposición interior y articulaciones ilustrativas. Tejado adicional, terraza e interiores omitidos durante la demostración.'],
 ['A imagem começa com as coberturas já abertas. O estado totalmente fechado segue a explicação fornecida pela Green Village.', 'The image starts with the roofs already open. The fully closed state follows the explanation provided by Green Village.', 'La imagen comienza con las cubiertas ya abiertas. El estado completamente cerrado sigue la explicación facilitada por Green Village.'],
 ['Apresentação do modelo', 'Model presentation', 'Presentación del modelo'],
 ['Demonstração 3D independente da expansão. Arraste ou use as setas para rodar; mais e menos para ampliar.', 'Separate 3D expansion demonstration. Drag or use the arrow keys to rotate; plus and minus to zoom.', 'Demostración 3D independiente de la expansión. Arrastre o utilice las flechas para girar; más y menos para ajustar el zoom.'],
 ['Repor câmara da expansão', 'Reset the expansion camera', 'Restablecer la cámara de expansión'],
 ['Aproximar expansão', 'Zoom in on the expansion', 'Acercar la expansión'],
 ['Afastar expansão', 'Zoom out from the expansion', 'Alejar la expansión'],
 ['Vídeos de apresentação: cada ambiente está no seu sector. Não reproduzem a configuração seleccionada nem definem os equipamentos incluídos de série. Todos sem áudio.', 'Presentation videos: each setting appears in its own section. They do not reproduce the selected configuration or define the equipment included as standard. All are without audio.', 'Vídeos de presentación: cada ambiente aparece en su sección. No reproducen la configuración seleccionada ni definen el equipamiento incluido de serie. Todos sin audio.'],
 ['Guardar 4K ↓', 'Save in 4K ↓', 'Guardar en 4K ↓'],
 ['Usar esta configuração ↗', 'Use this configuration ↗', 'Usar esta configuración ↗'],
 ['Perspectiva interior mobilada da T3-A. Cobertura ocultada e paredes em corte para mostrar a distribuição.', 'Furnished interior perspective of the T3-A. The roof is hidden and the walls are cut away to show the layout.', 'Perspectiva interior amueblada del T3-A. Cubierta oculta y paredes en sección para mostrar la distribución.'],
 ['Vista superior ortogonal do modelo mobilado. Corpo principal 11,80 × 6,22 m, com alpendre adicional ilustrado; divisórias e mobiliário aproximados.', 'Orthographic top view of the furnished model. Main body 11.80 × 6.22 m, with an additional porch illustrated; partitions and furniture are approximate.', 'Vista superior ortogonal del modelo amueblado. Cuerpo principal de 11,80 × 6,22 m, con porche adicional ilustrado; tabiques y mobiliario aproximados.'],
 ['Armação ilustrativa da mesma T3-A. Secções, perfis e fixações não constituem um desenho de fabrico.', 'Illustrative frame of the same T3-A. Sections, profiles and fixings do not constitute a manufacturing drawing.', 'Estructura ilustrativa del mismo T3-A. Las secciones, perfiles y fijaciones no constituyen un plano de fabricación.'],
 ['Elevação da entrada, identificada pela planta (+Z). T3-A com cobertura plana, sem telhado adicional nem alpendre.', 'Entrance elevation, identified in the plan (+Z). T3-A with a flat roof, without an additional roof or porch.', 'Alzado de la entrada, identificada en el plano (+Z). T3-A con cubierta plana, sin tejado adicional ni porche.'],
 ['Elevação da lateral direita vista a partir da entrada (+X). Posições e alturas dos vãos estimadas a partir das fontes.', 'Right-side elevation viewed from the entrance (+X). Opening positions and heights are estimated from the sources.', 'Alzado del lateral derecho visto desde la entrada (+X). Posiciones y alturas de los huecos estimadas a partir de las fuentes.'],
 ['Elevação oposta à entrada (−Z), com o vão da casa de banho e janelas dos quartos. Sem orientação geográfica atribuída.', 'Elevation opposite the entrance (−Z), with the bathroom opening and bedroom windows. No geographical orientation is assigned.', 'Alzado opuesto a la entrada (−Z), con el hueco del baño y las ventanas de los dormitorios. Sin orientación geográfica asignada.'],
 ['Elevação da lateral esquerda vista a partir da entrada (−X). Mesma planta T3-A e acabamentos originais.', 'Left-side elevation viewed from the entrance (−X). The same T3-A plan and original finishes.', 'Alzado del lateral izquierdo visto desde la entrada (−X). Mismo plano T3-A y acabados originales.'],
 ['Imagens de um estudo anterior do modelo. Para guardar a geometria e as escolhas actuais, use Exportar imagem 4K no estúdio. Dimensões não cotadas e escala dos padrões estimadas. As fotografias originais estão disponíveis na Ficha técnica.', 'Images from an earlier study of the model. To save the current geometry and choices, use Export 4K image in the studio. Undimensioned measurements and pattern scale are estimates. Original photographs are available in the Technical sheet.', 'Imágenes de un estudio anterior del modelo. Para guardar la geometría y las elecciones actuales, utilice Exportar imagen 4K en el estudio. Las dimensiones no acotadas y la escala de los patrones son estimadas. Las fotografías originales están disponibles en la Ficha técnica.'],
 ['Movimentação e retirada da casa do contentor de transporte', 'Handling and removal of the home from the shipping container', 'Movimiento y extracción de la casa del contenedor de transporte'],
 ['Movimentação no terreno', 'On-site handling', 'Movimiento en el terreno'],
 ['Divisões e acabamentos', 'Rooms and finishes', 'Estancias y acabados'],
 ['Protecção lateral', 'Side protection', 'Protección lateral'],
 ['Janela e revestimento', 'Window and cladding', 'Ventana y revestimiento'],
 ['Vídeo completo da fonte, a partir de 15:45. Reprodução pelo YouTube, com áudio e controlos de volume.', 'Full source video, starting at 15:45. Playback through YouTube, with audio and volume controls.', 'Vídeo completo de la fuente, a partir de 15:45. Reproducción mediante YouTube, con audio y controles de volumen.'],
 ['Vídeo completo da fonte, a partir de 08:12. Reprodução pelo YouTube, com áudio e controlos de volume.', 'Full source video, starting at 08:12. Playback through YouTube, with audio and volume controls.', 'Vídeo completo de la fuente, a partir de 08:12. Reproducción mediante YouTube, con audio y controles de volumen.'],
 ['Visita T2 com cozinhas e ambientes de banho do catálogo. Consulte o configurador para a distribuição e as portas actualizadas.', 'T2 tour with kitchen and bathroom settings from the catalogue. Consult the configurator for the current layout and doors.', 'Visita del T2 con cocinas y ambientes de baño del catálogo. Consulte el configurador para ver la distribución y las puertas actualizadas.'],
 ['14 segundos da elevação longitudinal de dentro para fora. Registo da revisão R9; cobertura translúcida para observar ambas as paredes. Eixo e folgas ilustrativos, topos e interior omitidos.', '14 seconds of longitudinal wall raising from the inside out. Recording of revision R9; translucent roof to show both walls. Axis and clearances are illustrative; end walls and interiors are omitted.', '14 segundos de elevación longitudinal desde dentro hacia fuera. Registro de la revisión R9; cubierta translúcida para observar ambas paredes. Eje y holguras ilustrativos, extremos e interior omitidos.'],
 ['Descarregar vídeo sem áudio ↓', 'Download video without audio ↓', 'Descargar vídeo sin audio ↓'],
 ['Filmes de apresentação', 'Presentation films', 'Vídeos de presentación'],
 ['Descarregar filme exterior e interior', 'Download exterior and interior film', 'Descargar vídeo del exterior y del interior'],
 ['Elevação das paredes em 3D', '3D wall raising', 'Elevación de las paredes en 3D'],
 ['Descarregar filme da elevação das paredes', 'Download wall-raising film', 'Descargar vídeo de la elevación de las paredes'],
];
const enEsRenderTitles = [
 ['Exterior com telhado e alpendre', 'Exterior with roof and porch', 'Exterior con tejado y porche'],
 ['Exterior com cobertura plana', 'Exterior with flat roof', 'Exterior con cubierta plana'],
 ['T3-A · interior mobilado', 'T3-A · furnished interior', 'T3-A · interior amueblado'],
 ['Planta T3-A', 'T3-A floor plan', 'Plano T3-A'],
 ['Cozinha em L · referência 03', 'L-shaped kitchen · reference 03', 'Cocina en L · referencia 03'],
 ['Casa de banho · referência 06', 'Bathroom · reference 06', 'Baño · referencia 06'],
 ['Estrutura', 'Structure', 'Estructura'],
 ['Fachada principal', 'Front elevation', 'Fachada principal'],
 ['Fachada lateral direita', 'Right elevation', 'Fachada lateral derecha'],
 ['Fachada posterior', 'Rear elevation', 'Fachada posterior'],
 ['Fachada lateral esquerda', 'Left elevation', 'Fachada lateral izquierda'],
];
for (const [pt, en, es] of enEsRenderTitles) {
 enEsPairs.push([pt, en, es]);
 enEsPairs.push([`Guardar ${pt} em 4K`, `Save ${en} in 4K`, `Guardar ${es} en 4K`]);
 enEsPairs.push([`Guardar ${pt} em PNG original`, `Save ${en} as original PNG`, `Guardar ${es} en PNG original`]);
}
for (const type of ['T3', 'T4']) for (const variant of ['A', 'B']) {
 enEsPairs.push([`${type} · distribuição · ${variant}`, `${type} · layout · ${variant}`, `${type} · distribución · ${variant}`]);
}
for (const code of ['8302B436', '166AA6EA']) {
 enEsPairs.push([`T3 · distribuição · A · GV72-${code} · 4K`, `T3 · layout · A · GV72-${code} · 4K`, `T3 · distribución · A · GV72-${code} · 4K`]);
}
const enEsSourceTitle = enEsPairs.find(row => row[0] === 'Movimentação e retirada da casa do contentor de transporte');
enEsPairs.push(
 [`Momento na fonte ${enEsSourceTitle[0]}`, `Source position ${enEsSourceTitle[1]}`, `Posición en la fuente ${enEsSourceTitle[2]}`],
 [`Vídeo do YouTube: ${enEsSourceTitle[0]}`, `YouTube video: ${enEsSourceTitle[1]}`, `Vídeo de YouTube: ${enEsSourceTitle[2]}`],
 [`Reproduzir ${enEsSourceTitle[0]} com áudio`, `Play ${enEsSourceTitle[1]} with audio`, `Reproducir ${enEsSourceTitle[2]} con audio`],
 [`Reproduzir ${enEsSourceTitle[0]}`, `Play ${enEsSourceTitle[1]}`, `Reproducir ${enEsSourceTitle[2]}`],
 [`Ver ${enEsSourceTitle[0]} em ecrã inteiro`, `View ${enEsSourceTitle[1]} in fullscreen`, `Ver ${enEsSourceTitle[2]} a pantalla completa`],
);
for (const [time, title] of [['01:00', 'Movimentação no terreno'], ['09:00', 'Divisões e acabamentos'], ['00:02', 'Protecção lateral'], ['00:14', 'Janela e revestimento']]) {
 const row = enEsPairs.find(entry => entry[0] === title);
 enEsPairs.push([`${time} · ${title}`, `${time} · ${row[1]}`, `${time} · ${row[2]}`]);
 enEsPairs.push([`${title}, ${time}`, `${row[1]}, ${time}`, `${row[2]}, ${time}`]);
}
export const EN_ES_PRESENTATION = Object.freeze({
 en: Object.freeze(Object.fromEntries(enEsPairs.map(([pt, en]) => [pt, en]))),
 es: Object.freeze(Object.fromEntries(enEsPairs.map(([pt, , es]) => [pt, es]))),
});
