/* ===============================
   MODULE: TRAVAUX - OUTILS D'ANNOTATION
   Definitions des outils (stylo, surligneur, gomme, texte, formes)
   et palette de couleurs/epaisseurs

   DEPENDANCES:
   - travaux-annotation.js (utilise ces definitions)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       COULEURS
       =============================== */

    const COULEURS = [
        { id: 'rouge',       hex: '#ff0000', nom: 'Rouge' },
        { id: 'orange',      hex: '#ff8c00', nom: 'Orange' },
        { id: 'vert-lime',   hex: '#98d025', nom: 'Vert lime' },
        { id: 'vert',        hex: '#22c55e', nom: 'Vert' },
        { id: 'sarcelle',    hex: '#14b8a6', nom: 'Sarcelle' },
        { id: 'cyan',        hex: '#0ea5e9', nom: 'Cyan' },
        { id: 'bleu',        hex: '#3b82f6', nom: 'Bleu' },
        { id: 'indigo',      hex: '#6366f1', nom: 'Indigo' },
        { id: 'violet',      hex: '#8b5cf6', nom: 'Violet' },
        { id: 'pourpre',     hex: '#6b21a8', nom: 'Pourpre' },
        { id: 'noir',        hex: '#000000', nom: 'Noir' },
        { id: 'blanc',      hex: '#ffffff', nom: 'Blanc' }
    ];

    const COULEUR_DEFAUT = '#3b82f6'; // Bleu
    const RESOLUTION_REFERENCE = 1000; // Largeur de reference pour normaliser l'epaisseur

    // Flag pour masquer le bouton « Codes d'erreurs » (mode Modelisation)
    let masquerErreursFrancais = false;

    // Fleche double (pointes aux deux bouts)
    let flecheDouble = false;

    /* ===============================
       OUTILS
       =============================== */

    const OUTILS = {
        position: {
            id: 'position',
            nom: 'Position',
            icone: '✋',
            curseur: 'grab',
            type: 'position'
        },
        selection: {
            id: 'selection',
            nom: 'S\u00e9lection',
            icone: 'S\u00e9lection',
            curseur: 'default',
            type: 'selection'
        },
        stylo: {
            id: 'stylo',
            nom: 'Stylo',
            icone: 'Stylo',
            curseur: 'crosshair',
            epaisseurDefaut: 2,
            epaisseurMin: 1,
            epaisseurMax: 8,
            opacite: 1.0,
            composite: 'source-over',
            sensiblePression: true,
            facteurPression: 2.0 // multiplicateur max de l'epaisseur
        },
        surligneur: {
            id: 'surligneur',
            nom: 'Surligneur',
            icone: 'Surligneur',
            curseur: 'crosshair',
            type: 'surligneur',
            epaisseurDefaut: 20,
            epaisseurMin: 10,
            epaisseurMax: 40,
            opacite: 0.5,
            composite: 'multiply'
        },
        gomme: {
            id: 'gomme',
            nom: 'Gomme',
            icone: 'Gomme',
            curseur: 'pointer',
            mode: 'effacer-trait' // efface le trait entier au contact
        },
        texte: {
            id: 'texte',
            nom: 'Texte',
            icone: 'Texte',
            curseur: 'text',
            tailleDefaut: 14,
            tailleMin: 10,
            tailleMax: 32
        },
        cercle: {
            id: 'cercle',
            nom: 'Cercle',
            icone: 'Cercle',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        fleche: {
            id: 'fleche',
            nom: 'Fl\u00e8che',
            icone: 'Fl\u00e8che',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        rectangle: {
            id: 'rectangle',
            nom: 'Rect.',
            icone: 'Rect.',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        ligne: {
            id: 'ligne',
            nom: 'Ligne',
            icone: 'Ligne',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        ondule: {
            id: 'ondule',
            nom: 'Ondulé',
            icone: 'vague',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        crochet: {
            id: 'crochet',
            nom: 'Crochet',
            icone: '\u2714\uFE0E',
            couleurBouton: '#2e7d32',
            curseur: 'crosshair',
            type: 'symbole',
            taille: 30
        },
        croix: {
            id: 'croix',
            nom: 'Croix',
            icone: '\u2718',
            couleurBouton: '#c62828',
            curseur: 'crosshair',
            type: 'symbole',
            taille: 30
        },
        interrogation: {
            id: 'interrogation',
            nom: 'Interrogation',
            icone: '?',
            couleurBouton: '#e65100',
            curseur: 'crosshair',
            type: 'symbole',
            taille: 30
        },
        // Erreurs de français (codes 1-10)
        errfr_1:  { id: 'errfr_1',  nom: 'Construction syntaxique',  icone: '\u2460', couleurBouton: '#c62828', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_2:  { id: 'errfr_2',  nom: 'Subordonnée seule',       icone: '\u2461', couleurBouton: '#c62828', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_3:  { id: 'errfr_3',  nom: 'Ponctuation / guillemets', icone: '\u2462', couleurBouton: '#e65100', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_4:  { id: 'errfr_4',  nom: 'Accord dans le GN',       icone: '\u2463', couleurBouton: '#1565c0', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_5:  { id: 'errfr_5',  nom: 'Accord du pronom',        icone: '\u2464', couleurBouton: '#1565c0', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_6:  { id: 'errfr_6',  nom: 'Accord part. passé',      icone: '\u2465', couleurBouton: '#1565c0', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_7:  { id: 'errfr_7',  nom: 'Mot invariable',          icone: '\u2466', couleurBouton: '#7b1fa2', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_8:  { id: 'errfr_8',  nom: 'Déterminant',             icone: '\u2467', couleurBouton: '#7b1fa2', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_9:  { id: 'errfr_9',  nom: 'Vocabulaire / anglicisme', icone: '\u2468', couleurBouton: '#2e7d32', curseur: 'crosshair', type: 'symbole', taille: 24 },
        errfr_10: { id: 'errfr_10', nom: 'Orthographe / typo',      icone: '\u2469', couleurBouton: '#2e7d32', curseur: 'crosshair', type: 'symbole', taille: 24 }
    };

    /* ===============================
       AUTOCOLLANTS (Tampons de retroaction)
       =============================== */

    const DOSSIER_AUTOCOLLANTS = 'autocollants/';

    const AUTOCOLLANTS = [
        { id: 'bien',           nom: 'Bien',             fichier: 'qualité 1 bien.png',                    categorie: 'qualite' },
        { id: 'tres-bien',      nom: 'Très bien',        fichier: 'qualité 2 très bien.png',               categorie: 'qualite' },
        { id: 'brillant',       nom: 'Original',         fichier: 'qualité 3 brillant.png',                categorie: 'qualite' },
        { id: 'bon-lien',       nom: 'Bon lien',         fichier: 'bon lien logique.png',                  categorie: 'diagnostic' },
        { id: 'manque-lien',    nom: 'Manque de lien',   fichier: 'manque de lien.png',                    categorie: 'diagnostic' },
        { id: 'confusion',      nom: 'Confusion',        fichier: 'confusion2.png',                        categorie: 'diagnostic' },
        { id: 'repetitif',      nom: 'Répétitif',        fichier: 'répétitif.png',                         categorie: 'diagnostic' },
        { id: 'preuve-absente', nom: 'Preuve absente',   fichier: 'preuve absente.png',                    categorie: 'diagnostic' },
        { id: 'citation',       nom: 'Citation',         fichier: 'intégration citation.png',              categorie: 'diagnostic' },
        { id: 'approfondir',    nom: 'Approfondir',      fichier: 'approfondir.png',                       categorie: 'diagnostic' },
        { id: 'procedes',       nom: 'Procédés',         fichier: 'identifier les outils (procédés).png',  categorie: 'diagnostic' },
        { id: 'attention',      nom: 'Attention',        fichier: 'attention.png',                         categorie: 'diagnostic' }
    ];

    // Sauvegarder les valeurs par defaut des autocollants avant toute personnalisation
    const _defautsAutocollants = AUTOCOLLANTS.map(a => ({ ...a }));

    let imagesAutocollants = {};   // Cache { id: HTMLImageElement }
    let promessesAutocollants = {}; // Cache { id: Promise<HTMLImageElement> }
    let autocollantActif = null;   // ID de l'autocollant selectionne (ou null)
    let paletteAutoVisible = false;

    /**
     * Precharge les 12 images autocollants avec suivi onload/onerror
     */
    function prechargerAutocollants() {
        AUTOCOLLANTS.forEach(a => {
            const img = new Image();
            const promesse = new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn('[Travaux-Outils] Echec chargement autocollant:', a.fichier);
                    reject(new Error('Echec chargement: ' + a.fichier));
                };
            });
            img.src = DOSSIER_AUTOCOLLANTS + a.fichier;
            imagesAutocollants[a.id] = img;
            promessesAutocollants[a.id] = promesse;
        });
    }

    /**
     * Retourne la promesse de chargement d'un autocollant
     * @param {string} id - ID de l'autocollant
     * @returns {Promise<HTMLImageElement>|null}
     */
    function getPromesseAutocollant(id) {
        return promessesAutocollants[id] || null;
    }

    /**
     * Attend le chargement de tous les autocollants references dans les donnees d'une page
     * @param {Object} donneesPage - { stickers: [...] }
     * @returns {Promise<void>}
     */
    async function attendreChargementAutocollants(donneesPage) {
        if (!donneesPage || !donneesPage.stickers || donneesPage.stickers.length === 0) return;

        const promesses = donneesPage.stickers
            .map(stk => promessesAutocollants[stk.autocollantId])
            .filter(Boolean);

        await Promise.allSettled(promesses);
    }

    /**
     * Retourne l'image prechargee d'un autocollant
     * @param {string} id - ID de l'autocollant
     * @returns {HTMLImageElement|null}
     */
    function getImageAutocollant(id) {
        return imagesAutocollants[id] || null;
    }

    /**
     * Selectionne un autocollant (mode tampon)
     * @param {string} id - ID de l'autocollant
     */
    function setAutocollantActif(id) {
        autocollantActif = id;
        outilActif = 'tampon';

        // Mettre a jour le curseur avec l'image du tampon
        const canvas = document.getElementById('travaux-canvas-annotation');
        if (canvas) canvas.style.cursor = genererCurseurTampon(id);

        // Feedback visuel sur l'item selectionne dans la palette tampons
        const items = document.querySelectorAll('#travaux-palette-tampons .travaux-autocollant-item');
        items.forEach(item => item.classList.remove('actif'));
        const actif = document.querySelector(`#travaux-palette-tampons .travaux-autocollant-item[onclick*="'${id}'"]`);
        if (actif) actif.classList.add('actif');

        // Mettre a jour l'etat visuel de la palette annotation
        rafraichirPalette();
    }

    function getAutocollantActif() {
        return autocollantActif;
    }

    /**
     * Bascule la palette flottante d'autocollants (coin sup. droit du canvas)
     */
    function togglePaletteAutocollants() {
        let palette = document.getElementById('travaux-palette-tampons');

        if (palette) {
            palette.remove();
            paletteAutoVisible = false;
            return;
        }

        paletteAutoVisible = true;
        palette = document.createElement('div');
        palette.id = 'travaux-palette-tampons';
        palette.className = 'travaux-palette-flottante travaux-palette-tampons';

        // Barre de titre
        let html = '<div class="travaux-palette-barre">';
        html += '<span class="travaux-palette-titre">Tampons</span>';
        html += '<div style="display:flex; gap:2px;">';
        html += '<button class="travaux-palette-toggle" onclick="travauxOutils.ouvrirEditionRetroObservations()" title="Personnaliser les rétroactions">\u2699</button>';
        html += '<button class="travaux-palette-toggle" onclick="travauxOutils.togglePaletteTamponsReplie()" title="Replier">−</button>';
        html += '<button class="travaux-palette-toggle" onclick="travauxOutils.fermerPaletteAutocollants()" title="Fermer">×</button>';
        html += '</div></div>';

        // Contenu
        html += '<div class="travaux-palette-contenu" id="travaux-tampons-contenu">';

        // Symboles (crochet / croix)
        html += '<div class="travaux-autocollants-label">Contenu et méthode</div>';
        html += '<div class="travaux-autocollants-grille travaux-autocollants-grille--symboles">';
        const crochetActif = outilActif === 'crochet' ? ' actif' : '';
        const croixActif = outilActif === 'croix' ? ' actif' : '';
        const interroActif = outilActif === 'interrogation' ? ' actif' : '';
        html += `<div class="travaux-autocollant-item${crochetActif}" onclick="travauxOutils.setOutilActif('crochet')" title="Bien vu, exact, pertinent">`;
        html += `<span style="font-size:24px; color:#2e7d32; font-weight:bold;">\u2714\uFE0E</span>`;
        html += `<span>Exact</span></div>`;
        html += `<div class="travaux-autocollant-item${croixActif}" onclick="travauxOutils.setOutilActif('croix')" title="Erroné, inexact, +/- pertinent">`;
        html += `<span style="font-size:24px; color:#c62828; font-weight:bold;">\u2718</span>`;
        html += `<span>Erroné</span></div>`;
        html += `<div class="travaux-autocollant-item${interroActif}" onclick="travauxOutils.setOutilActif('interrogation')" title="Incertain, ambigu, pas clair">`;
        html += `<span style="font-size:24px; color:#e65100; font-weight:bold;">?</span>`;
        html += `<span>Incertain</span></div>`;
        html += '</div>';

        // Qualite
        html += '<div class="travaux-autocollants-label">Inférences / interprétation</div>';
        html += '<div class="travaux-autocollants-grille">';
        AUTOCOLLANTS.filter(a => a.categorie === 'qualite').forEach(a => {
            const imgSrc = imagesAutocollants[a.id] ? imagesAutocollants[a.id].src : DOSSIER_AUTOCOLLANTS + a.fichier;
            html += `<div class="travaux-autocollant-item" onclick="travauxOutils.setAutocollantActif('${a.id}')" title="${a.nom}">`;
            html += `<img src="${imgSrc}" alt="${a.nom}">`;
            html += `<span>${a.nom}</span></div>`;
        });
        html += '</div>';

        // Diagnostic
        html += '<div class="travaux-autocollants-label">Observations</div>';
        html += '<div class="travaux-autocollants-grille">';
        AUTOCOLLANTS.filter(a => a.categorie === 'diagnostic').forEach(a => {
            const imgSrc = imagesAutocollants[a.id] ? imagesAutocollants[a.id].src : DOSSIER_AUTOCOLLANTS + a.fichier;
            html += `<div class="travaux-autocollant-item" onclick="travauxOutils.setAutocollantActif('${a.id}')" title="${a.nom}">`;
            html += `<img src="${imgSrc}" alt="${a.nom}">`;
            html += `<span>${a.nom}</span></div>`;
        });
        html += '</div>';
        html += '</div>';

        palette.innerHTML = html;

        // Inserer dans la zone-document (comme la palette annotation)
        const zoneDocument = document.getElementById('travaux-conteneur-document');
        if (zoneDocument) {
            palette.style.top = '56px';
            palette.style.right = '12px';
            palette.style.left = 'auto';
            zoneDocument.appendChild(palette);
            configurerDragPaletteTampons();
        }
    }

    /**
     * Replier/deplier la palette tampons
     */
    function togglePaletteTamponsReplie() {
        const palette = document.getElementById('travaux-palette-tampons');
        if (!palette) return;
        palette.classList.toggle('replie');
        const btn = palette.querySelector('.travaux-palette-toggle');
        if (btn) btn.textContent = palette.classList.contains('replie') ? '+' : '−';
    }

    /**
     * Drag de la palette tampons
     */
    function configurerDragPaletteTampons() {
        const palette = document.getElementById('travaux-palette-tampons');
        const barre = palette?.querySelector('.travaux-palette-barre');
        if (!barre) return;
        barre.addEventListener('mousedown', function(e) {
            if (e.target.closest('.travaux-palette-toggle')) return;
            e.preventDefault();
            const startX = e.clientX, startY = e.clientY;
            const rect = palette.getBoundingClientRect();
            const container = document.getElementById('travaux-conteneur-document');
            const cRect = container.getBoundingClientRect();
            const startLeft = rect.left - cRect.left;
            const startTop = rect.top - cRect.top;
            // Passer de right a left pour le drag
            palette.style.right = 'auto';
            palette.style.left = startLeft + 'px';
            function onMove(e2) {
                palette.style.left = Math.max(0, startLeft + e2.clientX - startX) + 'px';
                palette.style.top = Math.max(0, startTop + e2.clientY - startY) + 'px';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    function fermerPaletteAutocollants() {
        paletteAutoVisible = false;
        const palette = document.getElementById('travaux-palette-tampons');
        if (palette) palette.remove();
    }

    // Precharger au lancement
    prechargerAutocollants();

    /* ===============================
       PALETTE ERREURS DE FRANÇAIS
       =============================== */

    const CODES_ERREURS_FR = [
        { id: 'errfr_1',  code: 1,  nom: 'Construction syntaxique / accord du verbe' },
        { id: 'errfr_2',  code: 2,  nom: 'Subordonnée employée seule' },
        { id: 'errfr_3',  code: 3,  nom: 'Ponctuation / guillemets' },
        { id: 'errfr_4',  code: 4,  nom: 'Accord dans le groupe du nom' },
        { id: 'errfr_5',  code: 5,  nom: 'Accord du pronom / lien avec son antécédent' },
        { id: 'errfr_6',  code: 6,  nom: 'Accord du participe passé' },
        { id: 'errfr_7',  code: 7,  nom: 'Mot invariable' },
        { id: 'errfr_8',  code: 8,  nom: 'Déterminant' },
        { id: 'errfr_9',  code: 9,  nom: 'Vocabulaire / anglicisme' },
        { id: 'errfr_10', code: 10, nom: 'Orthographe d\u2019usage / typographie' }
    ];

    // Sauvegarder les valeurs par defaut des erreurs FR avant toute personnalisation
    const _defautsNomsErrFr = {};
    const _defautsCouleursErrFr = {};
    CODES_ERREURS_FR.forEach(c => {
        _defautsNomsErrFr[c.id] = c.nom;
        _defautsCouleursErrFr[c.id] = OUTILS[c.id].couleurBouton;
    });

    /* ===============================
       RETROACTIONS PAR DEFAUT (Observations + Erreurs FR)
       =============================== */

    const RETROACTIONS_OBSERVATIONS_DEFAUT = {
        'bon-lien':       "Bonne relation entre deux idées.",
        'manque-lien':    "Manque de relation logique entre deux idées.",
        'confusion':      "Plusieurs idées sont présentées dans une même phrase ou un même passage sans qu'elles ne soient clairement définies.",
        'repetitif':      "Les mêmes mots ou les mêmes idées reviennent à plusieurs reprises dans une même phrase ou un même passage sans être approfondi. Parfois l'explication peut être tautologique.",
        'preuve-absente': "L'idée ou l'argument présenté n'est pas étayé par une citation probante.",
        'citation':       "L'intégration de la citation dans l'explication n'est pas fluide sur le plan syntaxique ou grammatical. Ce sont deux blocs distincts qui ne sont pas intégrés.",
        'approfondir':    "La méthode, l'idée ou l'argument exprimé a un potentiel, mais l'utilisation ou l'explication reste en surface. Des idées plus riches pourraient émerger avec un peu plus de travail.",
        'procedes':       "Les procédés ou les mécanismes littéraires ne sont pas identifiés.",
        'attention':      "L'idée est une généralisation hâtive, un préjugé, une idée sans fondement."
    };

    const RETROACTIONS_ERREURS_FR_DEFAUT = {
        'errfr_1':  "La plupart des erreurs concernent la construction syntaxique (sujet, prédicat, complément de phrase ou autres compléments) ou l'accord du verbe (accord avec le sujet, conjugaison, etc.). Il arrive que certaines phrases sont incomplètes ou confuses, ou encore que le lien entre le verbe et son sujet soit erroné. Vérifie que chaque phrase a bien un sujet et un verbe (et parfois un complément) en les identifiant dans l'interligne. Assure-toi qu'il n'y a pas trop de compléments (ce qui pourrait rendre la phrase confuse). Vérifie également la conjugaison et l'accord des verbes en utilisant des tableaux de conjugaison.",
        'errfr_2':  "La plupart des erreurs sont causées par des subordonnées employées seules. Elles sont construites comme des compléments qui ne se rattachent à aucun prédicat. Relis la phrase pour vérifier sa clarté et assure-toi que chaque subordonnée est rattachée à une phrase principale par un mot de liaison. On peut parfois aussi ajuster la ponctuation pour y remédier.",
        'errfr_3':  "La plupart des erreurs concernent l'utilisation de la ponctuation. Elle peut être relative au coordonnant, au complément de phrase, au complément du nom, à l'organisateur textuel, à une énumération (dont la juxtaposition de phrases) ou encore à une citation. La ponctuation fautive vient embrouiller la structure et la clarté des idées. Vérifie les règles de ponctuation pour les différents types de phrases et de propositions. Certaines conjonctions rendent obligatoire l'usage de la virgule. Utilise des guides de ponctuation pour vérifier cet usage.",
        'errfr_4':  "La plupart des erreurs concernent l'accord en genre et en nombre dans le groupe du nom (déterminant, nom, adjectif). Il devient plus difficile de comprendre le lien entre les mots si ces accords ne sont pas faits. Identifie dans l'interligne le genre et le nombre du nom, puis assure-toi que tous les éléments du groupe concordent.",
        'errfr_5':  "La plupart des erreurs concernent l'accord du pronom ou le lien avec son antécédent. Il devient plus difficile de comprendre l'objet dont on parle ou ce à quoi on fait référence quand il y a de l'ambiguïté sur ce plan. Relis ta phrase pour clarifier à quoi ou à qui chaque pronom se réfère. Assure-toi qu'il n'y a pas d'autres noms qui pourraient faire écran entre les deux. Vérifie le lien du pronom avec son antécédent et assure-toi que l'accord est correct.",
        'errfr_6':  "La plupart des erreurs concernent l'accord du participe passé. Révise les règles d'accord du participe passé avec avoir (accord avec le COD s'il est placé avant) et avec être (accord avec le sujet). Identifie ces éléments dans l'interligne, fais des flèches et vérifie les accords.",
        'errfr_7':  "La plupart des erreurs concernent les mots invariables, plus précisément l'usage de la préposition, de l'adverbe ou de la conjonction. L'orthographe de ces mots ne change jamais. Consulte les listes de mots invariables et l'usage qu'on en fait. Vérifie surtout le sens de ces mots, car ils sont parfois confondus les uns avec les autres.",
        'errfr_8':  "La plupart des erreurs concernent l'usage du déterminant. Choisis le déterminant approprié en fonction du nom et du contexte, puis vérifie qu'il concorde en genre et en nombre avec le nom qu'il accompagne.",
        'errfr_9':  "La plupart des erreurs concernent le vocabulaire, c'est-à-dire le sens d'un mot ou son utilisation dans un certain contexte. L'utilisation inexacte d'une citation entre aussi dans cette catégorie. Utilise systématiquement un dictionnaire pour vérifier le sens des mots. Surtout, méfie-toi des synonymes parce qu'ils renvoient toujours à un contexte très précis qui n'est peut-être pas celui dans lequel tu écris. Vérifie tes citations en les relisant attentivement dans l'œuvre. Évite les anglicismes (dû à, mettre l'emphase, canceller).",
        'errfr_10': "La plupart des erreurs concernent l'orthographe d'usage (lettre, chiffre) ou des éléments de typographie (majuscule, minuscule, soulignement, italique, etc.). Relis ton texte et vérifie systématiquement dans le dictionnaire les mots dont l'orthographe est incertain. Dans le cas de mots étrangers ou de noms de personnages, relis bien ton œuvre. N'oublie pas également que les titres d'œuvres ou de chapitres requièrent respectivement l'italique ou le soulignement (les guillemets fonctionnent aussi)."
    };

    /* ===============================
       LECTURE / ECRITURE RETROACTIONS PERSONNALISEES
       (Stockage NON-namespacé — indépendant du semestre)
       =============================== */

    function obtenirRetroactionsObservations() {
        return db.getSync('retroactionsObservations', null) || RETROACTIONS_OBSERVATIONS_DEFAUT;
    }

    function obtenirRetroactionsErreursFr() {
        return db.getSync('retroactionsErreursFr', null) || RETROACTIONS_ERREURS_FR_DEFAUT;
    }

    function sauvegarderRetroactionsObservations(obj) {
        db.setSync('retroactionsObservations', obj);
    }

    function sauvegarderRetroactionsErreursFr(obj) {
        db.setSync('retroactionsErreursFr', obj);
    }

    /* ===============================
       PERSONNALISATIONS (noms, icones, couleurs)
       Stockage NON-namespacé — indépendant du semestre
       =============================== */

    function obtenirPersonnalisationObservations() {
        return db.getSync('personnalisationObservations', null) || {};
    }

    function sauvegarderPersonnalisationObservations(obj) {
        db.setSync('personnalisationObservations', obj);
    }

    function obtenirPersonnalisationErreursFr() {
        return db.getSync('personnalisationErreursFr', null) || {};
    }

    function sauvegarderPersonnalisationErreursFr(obj) {
        db.setSync('personnalisationErreursFr', obj);
    }

    function obtenirOrdreErreursFr() {
        const ordre = db.getSync('ordreErreursFr', null);
        if (ordre && Array.isArray(ordre) && ordre.length === CODES_ERREURS_FR.length) return ordre;
        return CODES_ERREURS_FR.map(c => c.id);
    }

    function sauvegarderOrdreErreursFr(arr) {
        db.setSync('ordreErreursFr', arr);
    }

    function obtenirCodesOrdonnes() {
        const ordre = obtenirOrdreErreursFr();
        const map = {};
        CODES_ERREURS_FR.forEach(c => { map[c.id] = c; });
        return ordre.map(id => map[id]).filter(Boolean);
    }

    /**
     * Applique les personnalisations (noms, images, couleurs) directement
     * sur les objets AUTOCOLLANTS, CODES_ERREURS_FR et OUTILS.
     * Appelée au démarrage et après chaque sauvegarde.
     */
    function appliquerPersonnalisations() {
        // --- Observations (autocollants) ---
        const persObs = obtenirPersonnalisationObservations();
        AUTOCOLLANTS.forEach((a, i) => {
            const defaut = _defautsAutocollants[i];
            const pers = persObs[a.id];
            // Restaurer le nom par défaut puis appliquer la personnalisation
            a.nom = (pers && pers.nom) ? pers.nom : defaut.nom;
            // Image personnalisée en base64
            if (pers && pers.imageBase64) {
                const img = new Image();
                const promesse = new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error('Echec chargement image personnalisée: ' + a.id));
                });
                img.src = pers.imageBase64;
                imagesAutocollants[a.id] = img;
                promessesAutocollants[a.id] = promesse;
            } else {
                // Restaurer l'image par défaut depuis le fichier
                const img = new Image();
                const promesse = new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error('Echec chargement: ' + defaut.fichier));
                });
                img.src = DOSSIER_AUTOCOLLANTS + defaut.fichier;
                imagesAutocollants[a.id] = img;
                promessesAutocollants[a.id] = promesse;
            }
        });

        // --- Erreurs de français ---
        const persErr = obtenirPersonnalisationErreursFr();
        CODES_ERREURS_FR.forEach(c => {
            const pers = persErr[c.id];
            c.nom = (pers && pers.nom) ? pers.nom : _defautsNomsErrFr[c.id];
            OUTILS[c.id].couleurBouton = (pers && pers.couleur) ? pers.couleur : _defautsCouleursErrFr[c.id];
        });

        // Invalider le cache de curseurs (couleurs/images ont pu changer)
        invaliderCacheCurseurs();
    }

    // Appliquer les personnalisations au démarrage (après prechargerAutocollants)
    appliquerPersonnalisations();

    let paletteErrFrVisible = false;

    /**
     * Bascule la palette flottante des erreurs de français
     */
    function togglePaletteErreursFrancais() {
        let palette = document.getElementById('travaux-palette-erreurs-fr');

        if (palette) {
            palette.remove();
            paletteErrFrVisible = false;
            return;
        }

        paletteErrFrVisible = true;
        palette = document.createElement('div');
        palette.id = 'travaux-palette-erreurs-fr';
        palette.className = 'travaux-palette-flottante travaux-palette-erreurs-fr';

        // Barre de titre
        let html = '<div class="travaux-palette-barre">';
        html += '<span class="travaux-palette-titre">Erreurs de français</span>';
        html += '<div style="display:flex; gap:2px;">';
        html += '<button class="travaux-palette-toggle" onclick="travauxOutils.ouvrirEditionRetroErreursFr()" title="Personnaliser les rétroactions">\u2699</button>';
        html += '<button class="travaux-palette-toggle" onclick="travauxOutils.togglePaletteErrFrReplie()" title="Replier">\u2212</button>';
        html += '<button class="travaux-palette-toggle" onclick="travauxOutils.fermerPaletteErreursFrancais()" title="Fermer">\u00d7</button>';
        html += '</div></div>';

        // Contenu : liste verticale
        html += '<div class="travaux-palette-contenu" id="travaux-errfr-contenu">';
        html += '<div class="travaux-errfr-liste">';
        obtenirCodesOrdonnes().forEach((c, idx) => {
            const outil = OUTILS[c.id];
            const actif = outilActif === c.id ? ' actif' : '';
            html += `<div class="travaux-errfr-item${actif}" onclick="travauxOutils.setOutilActif('${c.id}')" title="${c.nom}">`;
            html += `<span class="travaux-errfr-numero" style="background:${outil.couleurBouton}">${idx + 1}</span>`;
            html += `<span class="travaux-errfr-nom">${c.nom}</span>`;
            html += `<span class="travaux-errfr-compteur u-hide" data-erreur="${c.id}"></span>`;
            html += '</div>';
        });
        html += '</div></div>';

        palette.innerHTML = html;

        // Inserer dans la zone-document
        const zoneDocument = document.getElementById('travaux-conteneur-document');
        if (zoneDocument) {
            palette.style.top = '56px';
            // Positionner à droite de la palette annotation (largeur réelle ou 170px par défaut)
            const paletteAnnot = document.getElementById('travaux-palette-flottante');
            const annotLeft = paletteAnnot ? (paletteAnnot.getBoundingClientRect().width + 10) : 240;
            palette.style.left = Math.round(annotLeft) + 'px';
            zoneDocument.appendChild(palette);
            configurerDragPaletteErrFr();
        }
    }

    function fermerPaletteErreursFrancais() {
        paletteErrFrVisible = false;
        const palette = document.getElementById('travaux-palette-erreurs-fr');
        if (palette) palette.remove();
    }

    function togglePaletteErrFrReplie() {
        const palette = document.getElementById('travaux-palette-erreurs-fr');
        if (!palette) return;
        palette.classList.toggle('replie');
        const btn = palette.querySelector('.travaux-palette-toggle');
        if (btn) btn.textContent = palette.classList.contains('replie') ? '+' : '\u2212';
    }

    function configurerDragPaletteErrFr() {
        const palette = document.getElementById('travaux-palette-erreurs-fr');
        const barre = palette?.querySelector('.travaux-palette-barre');
        if (!barre) return;
        barre.addEventListener('mousedown', function(e) {
            if (e.target.closest('.travaux-palette-toggle')) return;
            e.preventDefault();
            const startX = e.clientX, startY = e.clientY;
            const rect = palette.getBoundingClientRect();
            const container = document.getElementById('travaux-conteneur-document');
            const cRect = container.getBoundingClientRect();
            const startLeft = rect.left - cRect.left;
            const startTop = rect.top - cRect.top;
            palette.style.right = 'auto';
            palette.style.left = startLeft + 'px';
            function onMove(e2) {
                palette.style.left = Math.max(0, startLeft + e2.clientX - startX) + 'px';
                palette.style.top = Math.max(0, startTop + e2.clientY - startY) + 'px';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ===============================
       ETAT PALETTE
       =============================== */

    let outilActif = 'position';
    let couleurActive = COULEUR_DEFAUT;
    let epaisseurActive = OUTILS.stylo.epaisseurDefaut;
    let taillTexteActive = OUTILS.texte.tailleDefaut;

    /* ===============================
       GETTERS / SETTERS
       =============================== */

    function getOutilActif() {
        return OUTILS[outilActif] || OUTILS.stylo;
    }

    function setOutilActif(id) {
        if (OUTILS[id]) {
            outilActif = id;
            autocollantActif = null; // Desactiver le mode tampon
            // Restaurer l'epaisseur par defaut de l'outil
            if (OUTILS[id].epaisseurDefaut) {
                epaisseurActive = OUTILS[id].epaisseurDefaut;
            }
            // Mettre a jour le slider min/max selon l'outil
            const slider = document.querySelector('.travaux-slider-epaisseur');
            if (slider && OUTILS[id].epaisseurMin !== undefined) {
                slider.min = OUTILS[id].epaisseurMin;
                slider.max = OUTILS[id].epaisseurMax;
                slider.value = epaisseurActive;
            }
            // Feedback visuel sur la palette tampons (symboles crochet/croix/interrogation)
            const items = document.querySelectorAll('#travaux-palette-tampons .travaux-autocollant-item');
            items.forEach(item => item.classList.remove('actif'));
            const actif = document.querySelector(`#travaux-palette-tampons .travaux-autocollant-item[onclick*="'${id}'"]`);
            if (actif) actif.classList.add('actif');
            // Notifier le changement
            window.dispatchEvent(new CustomEvent('travaux-outil-change', {
                detail: { outil: OUTILS[id] }
            }));
            mettreAJourApercuTrait();
        }
    }

    function getCouleurActive() {
        const outil = getOutilActif();
        if (outil.couleurForce) return outil.couleurForce;
        return couleurActive;
    }

    function setCouleurActive(hex) {
        couleurActive = hex;
        window.dispatchEvent(new CustomEvent('travaux-couleur-change', {
            detail: { couleur: hex }
        }));
        mettreAJourApercuTrait();
    }

    function getEpaisseurActive() {
        return epaisseurActive;
    }

    function setEpaisseurActive(val) {
        const outil = getOutilActif();
        const minEp = outil.epaisseurMin || 1;
        const maxEp = outil.epaisseurMax || 20;
        epaisseurActive = Math.max(minEp, Math.min(maxEp, val));
        // Mettre a jour l'affichage pixels
        const pxLabel = document.getElementById('travaux-epaisseur-px');
        if (pxLabel) pxLabel.textContent = getEpaisseurReellePixels() + 'px';
        // Synchroniser le slider
        const slider = document.getElementById('travaux-slider-epaisseur');
        if (slider) slider.value = epaisseurActive;
        mettreAJourApercuTrait();
        window.dispatchEvent(new CustomEvent('travaux-epaisseur-change', {
            detail: { epaisseur: epaisseurActive }
        }));
    }

    function incrementerEpaisseur() {
        setEpaisseurActive(epaisseurActive + 1);
    }

    function decrementerEpaisseur() {
        setEpaisseurActive(epaisseurActive - 1);
    }

    function getTailleTexte() {
        return taillTexteActive;
    }

    function setTailleTexte(val) {
        taillTexteActive = val;
    }

    /* ===============================
       APERCU DU TRAIT EN TEMPS REEL
       =============================== */

    function mettreAJourApercuTrait() {
        const apercu = document.getElementById('travaux-apercu-trait');
        if (!apercu) return;
        const outil = getOutilActif();
        const couleur = getCouleurActive();
        const epaisseur = Math.max(outil.epaisseurMin || 1, Math.min(epaisseurActive, outil.epaisseurMax || 20));
        const opacite = outil.opacite || 1.0;
        // Hauteur du viewBox adaptee a l'epaisseur pour ne pas tronquer
        const vbH = Math.max(24, epaisseur + 8);
        const midY = vbH / 2;
        apercu.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 120 ' + vbH);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '10');
        line.setAttribute('y1', String(midY));
        line.setAttribute('x2', '110');
        line.setAttribute('y2', String(midY));
        line.setAttribute('stroke', couleur);
        line.setAttribute('stroke-width', epaisseur);
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', opacite);
        svg.appendChild(line);
        apercu.appendChild(svg);
    }

    /* ===============================
       CURSEUR PERSONNALISE (tampons + codes d'erreur)
       =============================== */

    let _curseurCache = {}; // { id: 'url(data:...) 16 16, crosshair' }

    function genererCurseurTampon(autocollantId) {
        if (_curseurCache['tampon_' + autocollantId]) return _curseurCache['tampon_' + autocollantId];
        const img = imagesAutocollants[autocollantId];
        if (!img || !img.complete || !img.naturalWidth) return 'copy';
        const taille = 32;
        const c = document.createElement('canvas');
        c.width = taille; c.height = taille;
        const ctx = c.getContext('2d');
        // Mode sombre : inverser
        const estModeSombre = !document.body.classList.contains('mode-clair');
        if (estModeSombre) ctx.filter = 'invert(1)';
        ctx.drawImage(img, 0, 0, taille, taille);
        const url = 'url(' + c.toDataURL() + ') 16 16, copy';
        _curseurCache['tampon_' + autocollantId] = url;
        return url;
    }

    function genererCurseurErrFr(outilId) {
        if (_curseurCache[outilId]) return _curseurCache[outilId];
        const outil = OUTILS[outilId];
        if (!outil) return 'crosshair';
        const code = outilId.replace('errfr_', '');
        const couleur = outil.couleurBouton || '#888';
        const taille = 32;
        const c = document.createElement('canvas');
        c.width = taille; c.height = taille;
        const ctx = c.getContext('2d');
        // Cercle colore
        ctx.fillStyle = couleur;
        ctx.beginPath();
        ctx.arc(taille / 2, taille / 2, taille / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        // Numero blanc
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.round(taille * 0.55) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(code, taille / 2, taille / 2 + 1);
        const url = 'url(' + c.toDataURL() + ') 16 16, crosshair';
        _curseurCache[outilId] = url;
        return url;
    }

    function invaliderCacheCurseurs() {
        _curseurCache = {};
    }

    /* ===============================
       COURBE DE PRESSION
       =============================== */

    /**
     * Applique une courbe de pression S (Hermite smoothstep)
     * pour un trait plus naturel
     * @param {number} pression - Pression brute (0-1)
     * @returns {number} Pression ajustee (0-1)
     */
    function courbeDePresson(pression) {
        if (pression <= 0) return 0;
        if (pression >= 1) return 1;
        // Hermite smoothstep: 3x^2 - 2x^3
        return pression * pression * (3 - 2 * pression);
    }

    /**
     * Calcule l'epaisseur effective en fonction de la pression
     * @param {number} pressionBrute - Pression du stylet (0-1)
     * @returns {number} Epaisseur effective en pixels
     */
    function calculerEpaisseurPression(pressionBrute) {
        const outil = getOutilActif();
        if (!outil.sensiblePression || pressionBrute <= 0) {
            return epaisseurActive;
        }

        const pressionAjustee = courbeDePresson(pressionBrute);
        const facteur = 0.5 + pressionAjustee * (outil.facteurPression - 0.5);
        return epaisseurActive * facteur;
    }

    /* ===============================
       EPAISSEUR RELATIVE A LA RESOLUTION
       =============================== */

    /**
     * Calcule l'epaisseur reelle en pixels ajustee a la resolution de l'image
     * @param {number} epaisseurLogique - Epaisseur logique (valeur du slider)
     * @returns {number} Epaisseur reelle en pixels canvas
     */
    function calculerEpaisseurReelle(epaisseurLogique) {
        const dims = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getDimensionsOriginales)
            ? travauxVisionneuse.getDimensionsOriginales()
            : null;
        const largeurRef = (dims && dims.w) ? dims.w : RESOLUTION_REFERENCE;
        return epaisseurLogique * (largeurRef / RESOLUTION_REFERENCE);
    }

    /**
     * Retourne l'epaisseur reelle actuelle en pixels (pour affichage)
     * @returns {number}
     */
    function getEpaisseurReellePixels() {
        return Math.round(calculerEpaisseurReelle(epaisseurActive));
    }

    /* ===============================
       GENERATION HTML PALETTE
       =============================== */

    /**
     * Genere le HTML de la palette d'outils
     * @returns {string} HTML
     */
    function genererHTMLPalette() {
        let html = '<div class="travaux-palette-flottante" id="travaux-palette-flottante">';

        // Barre de titre draggable
        html += '<div class="travaux-palette-barre">';
        html += '<span class="travaux-palette-titre">Annotation</span>';
        html += '<div>';
        html += '<button class="travaux-palette-toggle" onclick="travauxOutils.togglePaletteReplie()" title="Replier/Deplier">&#x2212;</button>';
        html += '</div>';
        html += '</div>';

        // Contenu (sections verticales)
        html += '<div class="travaux-palette-contenu">';

        // Outils de dessin
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Outils</div>';
        html += '<div class="travaux-palette-outils">';

        const outilsDessin = ['position', 'selection', 'stylo', 'surligneur', 'gomme', 'texte'];
        outilsDessin.forEach(id => {
            const outil = OUTILS[id];
            const actif = outilActif === id ? ' actif' : '';
            html += `<button class="travaux-btn-outil${actif}" data-outil="${id}" onclick="travauxOutils.setOutilActif('${id}')" title="${outil.nom}">${outil.icone}</button>`;
        });

        html += '</div></div>';

        // Formes et symboles
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Formes</div>';
        html += '<div class="travaux-palette-outils">';

        const outilsFormes = ['cercle', 'fleche', 'rectangle', 'ligne', 'ondule'];
        outilsFormes.forEach(id => {
            const outil = OUTILS[id];
            const actif = outilActif === id ? ' actif' : '';
            const styleCouleur = outil.couleurBouton ? ` style="color:${outil.couleurBouton}; font-weight:bold;"` : '';
            html += `<button class="travaux-btn-outil${actif}" data-outil="${id}" onclick="travauxOutils.setOutilActif('${id}')" title="${outil.nom}"${styleCouleur}>${outil.icone}</button>`;
        });

        html += '</div></div>';

        // Options fleche (visible quand outil fleche actif)
        html += '<div class="travaux-palette-section travaux-options-fleche" id="travaux-options-fleche"' + (outilActif === 'fleche' ? '' : ' style="display:none"') + '>';
        html += '<div class="travaux-palette-label">Options fl\u00e8che</div>';
        html += '<div class="travaux-palette-outils">';
        const dblActif = flecheDouble ? ' actif' : '';
        html += `<button class="travaux-btn-outil${dblActif}" id="travaux-btn-fleche-double" onclick="travauxOutils.toggleFlecheDouble()" title="Fl\u00e8che double (\u2194)">\u2194</button>`;
        html += '</div></div>';

        // Couleurs
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Couleur</div>';
        html += '<div class="travaux-palette-couleurs">';

        COULEURS.forEach(c => {
            const actif = couleurActive === c.hex ? ' actif' : '';
            html += `<button class="travaux-btn-couleur${actif}" data-couleur="${c.hex}" onclick="travauxOutils.setCouleurActive('${c.hex}')" title="${c.nom}" style="background-color: ${c.hex}"></button>`;
        });

        html += '</div></div>';

        // Epaisseur (slider + affichage pixels)
        const outilInit = getOutilActif();
        const minEp = outilInit.epaisseurMin || 1;
        const maxEp = outilInit.epaisseurMax || 20;
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Epaisseur <span id="travaux-epaisseur-px" class="travaux-epaisseur-px">' + getEpaisseurReellePixels() + 'px</span></div>';
        html += '<div class="travaux-epaisseur-controles">';
        html += `<button class="travaux-btn-epaisseur-inc" onclick="travauxOutils.decrementerEpaisseur()" title="Moins fin">\u2190</button>`;
        html += `<input type="range" class="travaux-slider-epaisseur" id="travaux-slider-epaisseur" min="${minEp}" max="${maxEp}" value="${epaisseurActive}" oninput="travauxOutils.setEpaisseurActive(parseInt(this.value))">`;
        html += `<button class="travaux-btn-epaisseur-inc" onclick="travauxOutils.incrementerEpaisseur()" title="Plus \u00e9pais">\u2192</button>`;
        html += '</div>';
        html += '<div class="travaux-apercu-trait" id="travaux-apercu-trait"></div>';
        html += '</div>';

        html += '</div>'; // fin .travaux-palette-contenu

        // Pied de palette : Undo / Redo / Effacer
        html += '<div class="travaux-palette-pied">';
        html += '<button id="travaux-btn-undo" class="travaux-palette-btn-pied" onclick="travauxAnnotation.annuler()" disabled title="Annuler (Ctrl+Z)">Annuler</button>';
        html += '<button id="travaux-btn-redo" class="travaux-palette-btn-pied" onclick="travauxAnnotation.retablir()" disabled title="Retablir (Ctrl+Y)">R\u00e9tablir</button>';
        html += '<button id="travaux-btn-supprimer" class="travaux-palette-btn-pied" onclick="travauxAnnotation.supprimerSelection()" disabled title="Supprimer la sélection (Delete)">Supprimer</button>';
        html += '<button class="travaux-palette-btn-pied travaux-palette-btn-danger" onclick="travauxAnnotation.effacerPage()" title="Effacer toute la page">Effacer</button>';
        html += '</div>';

        // Boutons toggle palettes secondaires
        html += '<div class="travaux-palette-pied travaux-palette-toggles">';
        if (!masquerErreursFrancais) {
            html += '<button class="travaux-palette-btn-pied" onclick="travauxOutils.togglePaletteErreursFrancais()" title="Codes d\'erreurs">\uD83D\uDCCE</button>';
        }
        html += '<button class="travaux-palette-btn-pied" onclick="travauxOutils.togglePaletteAutocollants()" title="R\u00e9troactions visuelles">\uD83D\uDD23</button>';
        html += '</div>';

        html += '</div>'; // fin .travaux-palette-flottante

        return html;
    }

    /**
     * Met a jour visuellement la palette (etats actifs)
     */
    function rafraichirPalette() {
        // Outils
        document.querySelectorAll('.travaux-btn-outil').forEach(btn => {
            if (btn.id === 'travaux-btn-tampons') {
                btn.classList.toggle('actif', outilActif === 'tampon');
            } else {
                btn.classList.toggle('actif', btn.dataset.outil === outilActif);
            }
        });

        // Couleurs
        document.querySelectorAll('.travaux-btn-couleur').forEach(btn => {
            btn.classList.toggle('actif', btn.dataset.couleur === couleurActive);
        });

        // Erreurs de français — selection visuelle
        const paletteErrFr = document.getElementById('travaux-palette-erreurs-fr');
        if (paletteErrFr) {
            paletteErrFr.querySelectorAll('.travaux-errfr-item').forEach(item => {
                const onclick = item.getAttribute('onclick') || '';
                const match = onclick.match(/setOutilActif\('(errfr_\d+)'\)/);
                item.classList.toggle('actif', match && match[1] === outilActif);
            });
        }

        // Options fleche : afficher/masquer selon outil actif
        const sectionFleche = document.getElementById('travaux-options-fleche');
        if (sectionFleche) {
            sectionFleche.style.display = outilActif === 'fleche' ? '' : 'none';
        }
        const btnDbl = document.getElementById('travaux-btn-fleche-double');
        if (btnDbl) {
            btnDbl.classList.toggle('actif', flecheDouble);
        }

        // Curseur du canvas (personnalise pour tampons et codes d'erreur)
        const canvas = document.getElementById('travaux-canvas-annotation');
        if (canvas) {
            if (outilActif === 'tampon' && autocollantActif) {
                canvas.style.cursor = genererCurseurTampon(autocollantActif);
            } else if (outilActif.startsWith('errfr_')) {
                canvas.style.cursor = genererCurseurErrFr(outilActif);
            } else {
                const outil = getOutilActif();
                canvas.style.cursor = outil.curseur || 'crosshair';
            }
        }
    }

    // Rafraichir la palette quand l'outil ou la couleur change
    window.addEventListener('travaux-outil-change', rafraichirPalette);
    window.addEventListener('travaux-couleur-change', rafraichirPalette);
    window.addEventListener('travaux-fleche-double-change', rafraichirPalette);
    // Invalider les curseurs personnalises au changement de theme
    window.addEventListener('themeChanged', function() { invaliderCacheCurseurs(); rafraichirPalette(); });

    /* ===============================
       PALETTE FLOTTANTE — DRAG & TOGGLE
       =============================== */

    /**
     * Configure le drag de la palette flottante par sa barre de titre
     */
    function configurerDragPalette() {
        const palette = document.getElementById('travaux-palette-flottante');
        const barre = palette?.querySelector('.travaux-palette-barre');
        if (!barre) return;
        barre.addEventListener('mousedown', function(e) {
            if (e.target.closest('.travaux-palette-toggle')) return;
            e.preventDefault();
            const startX = e.clientX, startY = e.clientY;
            const rect = palette.getBoundingClientRect();
            const container = document.getElementById('travaux-conteneur-document');
            const cRect = container.getBoundingClientRect();
            const startLeft = rect.left - cRect.left;
            const startTop = rect.top - cRect.top;
            function onMove(e2) {
                palette.style.left = Math.max(0, startLeft + e2.clientX - startX) + 'px';
                palette.style.top = Math.max(0, startTop + e2.clientY - startY) + 'px';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Double-clic sur la barre : reset taille
        barre.addEventListener('dblclick', function(e) {
            if (e.target.closest('.travaux-palette-toggle')) return;
            palette.style.width = '';
            palette.style.height = '';
        });
    }

    /**
     * Replie / deplie la palette flottante
     */
    function togglePaletteReplie() {
        const palette = document.getElementById('travaux-palette-flottante');
        if (!palette) return;
        palette.classList.toggle('replie');
        const btn = palette.querySelector('.travaux-palette-toggle');
        if (btn) {
            btn.innerHTML = palette.classList.contains('replie') ? '&#x002B;' : '&#x2212;';
        }
    }

    /* ===============================
       COMPTEURS ERREURS DE FRANÇAIS
       =============================== */

    function compterErreursFrancais() {
        const compteurs = {};
        CODES_ERREURS_FR.forEach(c => { compteurs[c.id] = 0; });
        const annotation = travauxAnnotation.getAnnotationCourante();
        if (!annotation || !annotation.pages) return compteurs;
        for (const pageKey of Object.keys(annotation.pages)) {
            const page = annotation.pages[pageKey];
            if (!page.shapes) continue;
            for (const forme of page.shapes) {
                if (forme.type && compteurs.hasOwnProperty(forme.type)) {
                    compteurs[forme.type]++;
                }
            }
        }
        return compteurs;
    }

    function mettreAJourCompteursErreurs() {
        const palette = document.getElementById('travaux-palette-erreurs-fr');
        if (!palette) return;
        const compteurs = compterErreursFrancais();
        CODES_ERREURS_FR.forEach(c => {
            const badge = palette.querySelector('.travaux-errfr-compteur[data-erreur="' + c.id + '"]');
            if (badge) {
                const count = compteurs[c.id] || 0;
                badge.textContent = count > 0 ? count : '';
                badge.classList.toggle('u-hide', count === 0);
            }
        });
    }

    window.addEventListener('travaux-annotation-modifiee', mettreAJourCompteursErreurs);

    /* ===============================
       MODALS EDITION RETROACTIONS
       =============================== */

    const DIAG_IDS = ['bon-lien','manque-lien','confusion','repetitif','preuve-absente','citation','approfondir','procedes','attention'];

    function ouvrirEditionRetroObservations() {
        // Supprimer modal existante
        const existant = document.getElementById('modal-retro-observations');
        if (existant) existant.remove();

        const retroActuelles = obtenirRetroactionsObservations();
        const persObs = obtenirPersonnalisationObservations();
        const overlay = document.createElement('div');
        overlay.id = 'modal-retro-observations';
        overlay.className = 'modal-overlay actif';

        let html = '<div class="modal-contenu travaux-retro-modal">';
        html += '<h2 style="margin-top:0">Rétroactions — Observations</h2>';
        html += '<p style="color:var(--texte-secondaire);font-size:0.85rem;margin-bottom:16px;">Ces textes apparaîtront dans la rétroaction générée pour l\'élève lorsque le tampon correspondant est utilisé. Cliquez sur l\'image pour la remplacer.</p>';

        AUTOCOLLANTS.filter(a => a.categorie === 'diagnostic').forEach(a => {
            const texte = retroActuelles[a.id] || '';
            const imgSrc = (persObs[a.id] && persObs[a.id].imageBase64) ? persObs[a.id].imageBase64 : DOSSIER_AUTOCOLLANTS + a.fichier;
            html += '<div class="travaux-retro-row" data-obs-id="' + a.id + '">';
            html += '<div class="travaux-retro-row-haut">';
            html += `<div class="travaux-retro-img-upload" data-obs-id="${a.id}" title="Cliquer pour changer l'image">`;
            html += `<img src="${imgSrc}" alt="${a.nom}" data-img-id="${a.id}">`;
            html += `<input type="file" accept="image/*" data-file-id="${a.id}" hidden>`;
            html += '</div>';
            html += `<input type="text" class="travaux-retro-nom-input" data-nom-id="${a.id}" value="${a.nom}">`;
            html += '</div>';
            html += `<textarea class="travaux-retro-textarea" data-retro-id="${a.id}" rows="3">${texte}</textarea>`;
            html += '</div>';
        });

        html += '<div class="travaux-retro-actions">';
        html += '<button class="btn-secondaire" onclick="travauxOutils.reinitialiserRetroObservations()">Réinitialiser</button>';
        html += '<button class="btn-secondaire" onclick="document.getElementById(\'modal-retro-observations\').remove()">Annuler</button>';
        html += '<button class="btn-principal" onclick="travauxOutils.enregistrerRetroObservations()">Enregistrer</button>';
        html += '</div>';
        html += '</div>';

        overlay.innerHTML = html;
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);

        // Wiring: clic sur l'image → ouvre le file input
        overlay.querySelectorAll('.travaux-retro-img-upload').forEach(wrap => {
            const imgEl = wrap.querySelector('img');
            const fileInput = wrap.querySelector('input[type="file"]');
            wrap.addEventListener('click', function(e) {
                if (e.target !== fileInput) fileInput.click();
            });
            fileInput.addEventListener('change', function() {
                const file = fileInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(ev) {
                    imgEl.src = ev.target.result;
                    imgEl.dataset.base64 = ev.target.result;
                };
                reader.readAsDataURL(file);
            });
        });
    }

    function enregistrerRetroObservations() {
        const modal = document.getElementById('modal-retro-observations');
        if (!modal) return;
        // Textes de rétroaction
        const retroObj = {};
        modal.querySelectorAll('textarea[data-retro-id]').forEach(ta => {
            retroObj[ta.dataset.retroId] = ta.value;
        });
        sauvegarderRetroactionsObservations(retroObj);
        // Personnalisations (noms + images)
        const persObj = obtenirPersonnalisationObservations();
        modal.querySelectorAll('input[data-nom-id]').forEach(inp => {
            const id = inp.dataset.nomId;
            if (!persObj[id]) persObj[id] = {};
            persObj[id].nom = inp.value;
        });
        modal.querySelectorAll('img[data-img-id]').forEach(img => {
            const id = img.dataset.imgId;
            if (!persObj[id]) persObj[id] = {};
            if (img.dataset.base64) {
                persObj[id].imageBase64 = img.dataset.base64;
            }
        });
        sauvegarderPersonnalisationObservations(persObj);
        appliquerPersonnalisations();
        rafraichirPalettesApresPersonnalisation();
        modal.remove();
    }

    function reinitialiserRetroObservations() {
        db.setSync('retroactionsObservations', null);
        db.setSync('personnalisationObservations', null);
        appliquerPersonnalisations();
        const modal = document.getElementById('modal-retro-observations');
        if (modal) {
            // Restaurer textes
            modal.querySelectorAll('textarea[data-retro-id]').forEach(ta => {
                ta.value = RETROACTIONS_OBSERVATIONS_DEFAUT[ta.dataset.retroId] || '';
            });
            // Restaurer noms
            modal.querySelectorAll('input[data-nom-id]').forEach(inp => {
                const defaut = _defautsAutocollants.find(a => a.id === inp.dataset.nomId);
                if (defaut) inp.value = defaut.nom;
            });
            // Restaurer images
            modal.querySelectorAll('img[data-img-id]').forEach(img => {
                const defaut = _defautsAutocollants.find(a => a.id === img.dataset.imgId);
                if (defaut) {
                    img.src = DOSSIER_AUTOCOLLANTS + defaut.fichier;
                    delete img.dataset.base64;
                }
            });
        }
    }

    function ouvrirEditionRetroErreursFr() {
        const existant = document.getElementById('modal-retro-erreurs-fr');
        if (existant) existant.remove();

        const retroActuelles = obtenirRetroactionsErreursFr();
        const codesOrdonnes = obtenirCodesOrdonnes();
        const overlay = document.createElement('div');
        overlay.id = 'modal-retro-erreurs-fr';
        overlay.className = 'modal-overlay actif';

        let html = '<div class="modal-contenu travaux-retro-modal">';
        html += '<h2 style="margin-top:0">R\u00e9troactions \u2014 Erreurs de fran\u00e7ais</h2>';
        html += '<p style="color:var(--texte-secondaire);font-size:0.85rem;margin-bottom:16px;">Ces textes appara\u00eetront dans la r\u00e9troaction g\u00e9n\u00e9r\u00e9e pour l\'\u00e9l\u00e8ve lorsque le code d\'erreur correspondant est utilis\u00e9. Cliquez sur la pastille pour changer sa couleur. Glissez \u2630 pour r\u00e9ordonner.</p>';

        html += '<div id="travaux-retro-errfr-liste">';
        codesOrdonnes.forEach((c, idx) => {
            const outil = OUTILS[c.id];
            const texte = retroActuelles[c.id] || '';
            html += '<div class="travaux-retro-row travaux-retro-draggable" data-err-id="' + c.id + '" draggable="true">';
            html += '<div class="travaux-retro-row-haut">';
            html += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>';
            html += '<div class="travaux-retro-couleur-wrap">';
            html += '<span class="travaux-retro-numero" style="background:' + outil.couleurBouton + '" data-pastille-id="' + c.id + '">' + (idx + 1) + '</span>';
            html += '<input type="color" value="' + outil.couleurBouton + '" data-color-id="' + c.id + '" title="Changer la couleur">';
            html += '</div>';
            html += '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + c.id + '" value="' + c.nom + '">';
            html += '</div>';
            html += '<textarea class="travaux-retro-textarea" data-retro-id="' + c.id + '" rows="3">' + texte + '</textarea>';
            html += '</div>';
        });
        html += '</div>';

        html += '<div class="travaux-retro-actions">';
        html += '<button class="btn-secondaire" onclick="travauxOutils.reinitialiserRetroErreursFr()">R\u00e9initialiser</button>';
        html += '<button class="btn-secondaire" onclick="document.getElementById(\'modal-retro-erreurs-fr\').remove()">Annuler</button>';
        html += '<button class="btn-principal" onclick="travauxOutils.enregistrerRetroErreursFr()">Enregistrer</button>';
        html += '</div>';
        html += '</div>';

        overlay.innerHTML = html;
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);

        // Wiring: changement couleur → met à jour la pastille en live
        overlay.querySelectorAll('input[data-color-id]').forEach(colorInput => {
            const pastille = overlay.querySelector('span[data-pastille-id="' + colorInput.dataset.colorId + '"]');
            colorInput.addEventListener('input', function() {
                if (pastille) pastille.style.background = colorInput.value;
            });
        });

        // Wiring: drag-and-drop pour réordonner
        configurerDragRetroErrFr(overlay.querySelector('#travaux-retro-errfr-liste'));
    }

    function configurerDragRetroErrFr(conteneur) {
        if (!conteneur) return;
        let draggedRow = null;

        conteneur.addEventListener('dragstart', function(e) {
            const row = e.target.closest('.travaux-retro-draggable');
            if (!row) return;
            draggedRow = row;
            row.classList.add('travaux-retro-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        });

        conteneur.addEventListener('dragend', function() {
            if (draggedRow) draggedRow.classList.remove('travaux-retro-dragging');
            draggedRow = null;
            conteneur.querySelectorAll('.travaux-retro-drag-over').forEach(el => el.classList.remove('travaux-retro-drag-over'));
        });

        conteneur.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const cible = e.target.closest('.travaux-retro-draggable');
            if (!cible || cible === draggedRow) return;
            conteneur.querySelectorAll('.travaux-retro-drag-over').forEach(el => el.classList.remove('travaux-retro-drag-over'));
            cible.classList.add('travaux-retro-drag-over');
        });

        conteneur.addEventListener('dragleave', function(e) {
            const cible = e.target.closest('.travaux-retro-draggable');
            if (cible) cible.classList.remove('travaux-retro-drag-over');
        });

        conteneur.addEventListener('drop', function(e) {
            e.preventDefault();
            const cible = e.target.closest('.travaux-retro-draggable');
            if (!cible || !draggedRow || cible === draggedRow) return;
            cible.classList.remove('travaux-retro-drag-over');
            // Inserer avant ou après selon la position relative
            const rows = Array.from(conteneur.querySelectorAll('.travaux-retro-draggable'));
            const idxDrag = rows.indexOf(draggedRow);
            const idxCible = rows.indexOf(cible);
            if (idxDrag < idxCible) {
                conteneur.insertBefore(draggedRow, cible.nextSibling);
            } else {
                conteneur.insertBefore(draggedRow, cible);
            }
            // Renuméroter
            renumeroterRetroErrFr(conteneur);
        });
    }

    function renumeroterRetroErrFr(conteneur) {
        const rows = conteneur.querySelectorAll('.travaux-retro-draggable');
        rows.forEach((row, idx) => {
            const pastille = row.querySelector('.travaux-retro-numero');
            if (pastille) pastille.textContent = idx + 1;
        });
    }

    function enregistrerRetroErreursFr() {
        const modal = document.getElementById('modal-retro-erreurs-fr');
        if (!modal) return;
        // Textes de rétroaction
        const retroObj = {};
        modal.querySelectorAll('textarea[data-retro-id]').forEach(ta => {
            retroObj[ta.dataset.retroId] = ta.value;
        });
        sauvegarderRetroactionsErreursFr(retroObj);
        // Personnalisations (noms + couleurs)
        const persObj = obtenirPersonnalisationErreursFr();
        modal.querySelectorAll('input[data-nom-id]').forEach(inp => {
            const id = inp.dataset.nomId;
            if (!persObj[id]) persObj[id] = {};
            persObj[id].nom = inp.value;
        });
        modal.querySelectorAll('input[data-color-id]').forEach(inp => {
            const id = inp.dataset.colorId;
            if (!persObj[id]) persObj[id] = {};
            persObj[id].couleur = inp.value;
        });
        sauvegarderPersonnalisationErreursFr(persObj);
        // Ordre personnalisé
        const liste = modal.querySelector('#travaux-retro-errfr-liste');
        if (liste) {
            const ordre = Array.from(liste.querySelectorAll('.travaux-retro-draggable'))
                .map(row => row.dataset.errId);
            sauvegarderOrdreErreursFr(ordre);
        }
        appliquerPersonnalisations();
        rafraichirPalettesApresPersonnalisation();
        modal.remove();
    }

    function reinitialiserRetroErreursFr() {
        db.setSync('retroactionsErreursFr', null);
        db.setSync('personnalisationErreursFr', null);
        db.setSync('ordreErreursFr', null);
        appliquerPersonnalisations();
        // Rouvrir le modal pour refleter l'ordre et les valeurs par defaut
        ouvrirEditionRetroErreursFr();
    }

    /* ===============================
       RAFRAICHIR PALETTES APRES PERSONNALISATION
       =============================== */

    /**
     * Ferme et rouvre les palettes visibles pour refléter les personnalisations.
     */
    function rafraichirPalettesApresPersonnalisation() {
        if (document.getElementById('travaux-palette-tampons')) {
            fermerPaletteAutocollants();
            togglePaletteAutocollants();
        }
        if (document.getElementById('travaux-palette-erreurs-fr')) {
            fermerPaletteErreursFrancais();
            togglePaletteErreursFrancais();
        }
    }

    /* ===============================
       FLECHE DOUBLE
       =============================== */

    function getFlecheDouble() { return flecheDouble; }

    function setFlecheDouble(val) {
        flecheDouble = !!val;
        window.dispatchEvent(new CustomEvent('travaux-fleche-double-change', { detail: { double: flecheDouble } }));
    }

    function toggleFlecheDouble() {
        setFlecheDouble(!flecheDouble);
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    /**
     * Active/desactive le masquage du bouton Codes d'erreurs
     * @param {boolean} val - true pour masquer
     */
    function setMasquerErreursFrancais(val) {
        masquerErreursFrancais = !!val;
    }

    window.travauxOutils = {
        // Constantes
        COULEURS: COULEURS,
        OUTILS: OUTILS,
        AUTOCOLLANTS: AUTOCOLLANTS,
        CODES_ERREURS_FR: CODES_ERREURS_FR,
        // Getters
        getOutilActif: getOutilActif,
        getCouleurActive: getCouleurActive,
        getEpaisseurActive: getEpaisseurActive,
        getTailleTexte: getTailleTexte,
        getImageAutocollant: getImageAutocollant,
        getPromesseAutocollant: getPromesseAutocollant,
        attendreChargementAutocollants: attendreChargementAutocollants,
        getAutocollantActif: getAutocollantActif,
        // Setters
        setOutilActif: setOutilActif,
        setCouleurActive: setCouleurActive,
        setEpaisseurActive: setEpaisseurActive,
        setTailleTexte: setTailleTexte,
        setAutocollantActif: setAutocollantActif,
        // Pression
        courbeDePresson: courbeDePresson,
        calculerEpaisseurPression: calculerEpaisseurPression,
        // Resolution
        calculerEpaisseurReelle: calculerEpaisseurReelle,
        getEpaisseurReellePixels: getEpaisseurReellePixels,
        RESOLUTION_REFERENCE: RESOLUTION_REFERENCE,
        // UI
        genererHTMLPalette: genererHTMLPalette,
        rafraichirPalette: rafraichirPalette,
        togglePaletteAutocollants: togglePaletteAutocollants,
        fermerPaletteAutocollants: fermerPaletteAutocollants,
        togglePaletteTamponsReplie: togglePaletteTamponsReplie,
        togglePaletteErreursFrancais: togglePaletteErreursFrancais,
        fermerPaletteErreursFrancais: fermerPaletteErreursFrancais,
        togglePaletteErrFrReplie: togglePaletteErrFrReplie,
        // Palette flottante
        configurerDragPalette: configurerDragPalette,
        togglePaletteReplie: togglePaletteReplie,
        // Compteurs erreurs
        compterErreursFrancais: compterErreursFrancais,
        mettreAJourCompteursErreurs: mettreAJourCompteursErreurs,
        // Retroactions personnalisées
        obtenirRetroactionsObservations: obtenirRetroactionsObservations,
        obtenirRetroactionsErreursFr: obtenirRetroactionsErreursFr,
        ouvrirEditionRetroObservations: ouvrirEditionRetroObservations,
        ouvrirEditionRetroErreursFr: ouvrirEditionRetroErreursFr,
        enregistrerRetroObservations: enregistrerRetroObservations,
        enregistrerRetroErreursFr: enregistrerRetroErreursFr,
        reinitialiserRetroObservations: reinitialiserRetroObservations,
        reinitialiserRetroErreursFr: reinitialiserRetroErreursFr,
        // Personnalisations (noms, icônes, couleurs)
        appliquerPersonnalisations: appliquerPersonnalisations,
        // Epaisseur increments
        incrementerEpaisseur: incrementerEpaisseur,
        decrementerEpaisseur: decrementerEpaisseur,
        // Fleche double
        getFlecheDouble: getFlecheDouble,
        setFlecheDouble: setFlecheDouble,
        toggleFlecheDouble: toggleFlecheDouble,
        // Contexte Modelisation
        setMasquerErreursFrancais: setMasquerErreursFrancais
    };

})();
