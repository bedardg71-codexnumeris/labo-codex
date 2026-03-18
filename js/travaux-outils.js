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

    // Mode pointes de fleche : 'fin' | 'debut' | 'double' | 'aucune'
    let flechePointes = 'fin';

    // Cache des curseurs personnalisés (tampons + codes d'erreur)
    let _curseurCache = {};

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
            nom: 'Ligne',
            icone: 'Ligne',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        rectangle: {
            id: 'rectangle',
            nom: 'Rectangle',
            icone: 'Rectangle',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        // ligne retiré de la palette — rétrocompatibilité assurée au rendu
        // (les données existantes type:'ligne' sont rendues via normaliserPointes)
        ondule: {
            id: 'ondule',
            nom: 'Vague',
            icone: 'Vague',
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
        // --- Contenu et méthode (6) ---
        { id: 'contenu-exact',       nom: 'Exact',        fichier: 'contenu-exact.png',        categorie: 'contenu' },
        { id: 'contenu-bien',        nom: 'Bien',         fichier: 'contenu-bien.png',         categorie: 'contenu' },
        { id: 'contenu-tres-bien',   nom: 'Tr\u00e8s bien', fichier: 'contenu-tres-bien.png',  categorie: 'contenu' },
        { id: 'contenu-incertain',   nom: 'Incertain',    fichier: 'contenu-incertain.png',    categorie: 'contenu' },
        { id: 'contenu-incomplet',   nom: 'Incomplet',    fichier: 'contenu-incomplet.png',    categorie: 'contenu' },
        { id: 'contenu-inexact',     nom: 'Inexact',      fichier: 'contenu-inexact.png',      categorie: 'contenu' },
        // --- Compréhension (4) ---
        { id: 'comp-uni',            nom: 'Uni',          fichier: 'comprehension-uni.png',         categorie: 'comprehension' },
        { id: 'comp-multi',          nom: 'Multi',        fichier: 'comprehension-multi.png',       categorie: 'comprehension' },
        { id: 'comp-relationnel',    nom: 'Relationnel',  fichier: 'comprehension-relationnel.png', categorie: 'comprehension' },
        { id: 'comp-etendu',         nom: '\u00c9tendu',  fichier: 'comprehension-etendu.png',      categorie: 'comprehension' },
        // --- Observations (12) ---
        { id: 'obs-approfondir',     nom: 'Approfondir',      fichier: 'observations-approfondir.png',  categorie: 'observations' },
        { id: 'obs-attention',       nom: 'Attention',         fichier: 'observations-attention.png',    categorie: 'observations' },
        { id: 'obs-confusion',       nom: 'Confusion',         fichier: 'observations-confusion.png',   categorie: 'observations' },
        { id: 'obs-hoc',             nom: 'HOC',               fichier: 'observations-hoc.png',         categorie: 'observations' },
        { id: 'obs-integration',     nom: 'Int\u00e9gration',  fichier: 'observations-integration.png', categorie: 'observations' },
        { id: 'obs-mecanisme',       nom: 'M\u00e9canisme',    fichier: 'observations-mecanisme.png',   categorie: 'observations' },
        { id: 'obs-procede',         nom: 'Proc\u00e9d\u00e9', fichier: 'observations-procede.png',     categorie: 'observations' },
        { id: 'obs-relation',        nom: 'Relation',          fichier: 'observations-relation.png',    categorie: 'observations' },
        { id: 'obs-repetition',      nom: 'R\u00e9p\u00e9tition', fichier: 'observations-repetition.png', categorie: 'observations' },
        { id: 'obs-rupture',         nom: 'Rupture',           fichier: 'observations-rupture.png',     categorie: 'observations' },
        { id: 'obs-sans-preuve',     nom: 'Sans preuve',       fichier: 'observations-sans-preuve.png', categorie: 'observations' },
        { id: 'obs-soupcon',         nom: 'Soup\u00e7on',      fichier: 'observations-soupcon.png',     categorie: 'observations' },
        // --- Legacy (évaluations antérieures) ---
        { id: 'bien',           nom: 'Bien',             fichier: 'qualit\u00e9 1 bien.png',                    categorie: 'qualite', legacy: true },
        { id: 'tres-bien',      nom: 'Tr\u00e8s bien',   fichier: 'qualit\u00e9 2 tr\u00e8s bien.png',         categorie: 'qualite', legacy: true },
        { id: 'brillant',       nom: 'Original',         fichier: 'qualit\u00e9 3 brillant.png',                categorie: 'qualite', legacy: true },
        { id: 'bon-lien',       nom: 'Bon lien',         fichier: 'bon lien logique.png',                       categorie: 'diagnostic', legacy: true },
        { id: 'manque-lien',    nom: 'Manque de lien',   fichier: 'manque de lien.png',                         categorie: 'diagnostic', legacy: true },
        { id: 'confusion',      nom: 'Confusion',        fichier: 'confusion2.png',                             categorie: 'diagnostic', legacy: true },
        { id: 'repetitif',      nom: 'R\u00e9p\u00e9titif', fichier: 'r\u00e9p\u00e9titif.png',                categorie: 'diagnostic', legacy: true },
        { id: 'preuve-absente', nom: 'Preuve absente',   fichier: 'preuve absente.png',                         categorie: 'diagnostic', legacy: true },
        { id: 'citation',       nom: 'Citation',         fichier: 'int\u00e9gration citation.png',              categorie: 'diagnostic', legacy: true },
        { id: 'approfondir',    nom: 'Approfondir',      fichier: 'approfondir.png',                            categorie: 'diagnostic', legacy: true },
        { id: 'procedes',       nom: 'Proc\u00e9d\u00e9s', fichier: 'identifier les outils (proc\u00e9d\u00e9s).png', categorie: 'diagnostic', legacy: true },
        { id: 'attention',      nom: 'Attention',        fichier: 'attention.png',                              categorie: 'diagnostic', legacy: true }
    ];

    // Sauvegarder les valeurs par defaut des autocollants avant toute personnalisation
    const _defautsAutocollants = AUTOCOLLANTS.map(a => ({ ...a }));

    /**
     * Charge les tampons personnalises depuis IDB et les ajoute a AUTOCOLLANTS
     */
    function chargerTamponsPersonnalises() {
        var customs = db.getSync('tamponsPersonnalises', []);
        if (!Array.isArray(customs)) return;
        customs.forEach(function(c) {
            if (!c.id || AUTOCOLLANTS.find(function(a) { return a.id === c.id; })) return;
            AUTOCOLLANTS.push({
                id: c.id,
                nom: c.nom || 'Nouveau',
                fichier: '',
                categorie: c.categorie || 'diagnostic',
                custom: true
            });
        });
    }

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

        // Contenu (réutilise la fonction partagée)
        html += '<div class="travaux-palette-contenu" id="travaux-tampons-contenu">';
        html += genererContenuTampons();
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

    // Charger les tampons personnalises puis precharger
    chargerTamponsPersonnalises();
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

    // Valeurs par defaut des symboles (crochet/croix/interrogation)
    const _defautsSymboles = {
        crochet:       { nom: 'Crochet',       couleur: '#2e7d32', icone: '\u2714\uFE0E' },
        croix:         { nom: 'Croix',          couleur: '#c62828', icone: '\u2718' },
        interrogation: { nom: 'Interrogation',  couleur: '#e65100', icone: '?' }
    };

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

    // Noms des categories de tampons
    const NOMS_CATEGORIES_DEFAUT = {
        contenu: 'Contenu et m\u00e9thode',
        comprehension: 'Compr\u00e9hension',
        observations: 'Observations'
    };

    function obtenirNomsCategories() {
        return db.getSync('nomsCategoriesTampons', null) || { ...NOMS_CATEGORIES_DEFAUT };
    }

    function sauvegarderNomsCategories(obj) {
        db.setSync('nomsCategoriesTampons', obj);
    }

    // Symboles Unicode personnalises (au-dela des 3 built-in)
    function obtenirSymbolesPerso() {
        return db.getSync('symbolesUnicodePerso', null) || [];
    }

    function sauvegarderSymbolesPerso(arr) {
        db.setSync('symbolesUnicodePerso', arr);
    }

    // Categories personnalisees (au-dela des 3 built-in)
    function obtenirCategoriesPerso() {
        return db.getSync('categoriesPerso', null) || [];
    }

    function sauvegarderCategoriesPerso(arr) {
        db.setSync('categoriesPerso', arr);
    }

    // Couleurs des categories
    function obtenirCouleursCategories() {
        return db.getSync('couleursCategories', null) || {};
    }

    function sauvegarderCouleursCategories(obj) {
        db.setSync('couleursCategories', obj);
    }

    /**
     * Retourne la couleur de categorie pour un autocollant donne.
     * @param {string} autocollantId - ID de l'autocollant
     * @returns {string|null} Couleur hex ou null
     */
    function obtenirCouleurCategorieAutocollant(autocollantId) {
        var autocollant = AUTOCOLLANTS.find(function(a) { return a.id === autocollantId; });
        if (!autocollant) return null;
        var couleurs = obtenirCouleursCategories();
        return couleurs[autocollant.categorie] || null;
    }

    var CATEGORIES_BUILTIN = ['contenu', 'comprehension', 'observations'];

    function obtenirOrdreCategories() {
        var ordre = db.getSync('ordreCategories', null);
        // Construire la liste complete : built-in + perso
        var tous = CATEGORIES_BUILTIN.slice();
        obtenirCategoriesPerso().forEach(function(c) { tous.push(c.id); });
        if (ordre && Array.isArray(ordre)) {
            var result = ordre.filter(function(id) { return tous.indexOf(id) !== -1; });
            tous.forEach(function(id) { if (result.indexOf(id) === -1) result.push(id); });
            return result;
        }
        return tous;
    }

    function sauvegarderOrdreCategories(arr) {
        db.setSync('ordreCategories', arr);
    }

    // Migration : l'ancien flag _aDesCustoms masquait tous les built-in dès qu'un
    // custom existait, ce qui corrompait aussi elementsMasques. Nettoyer une fois.
    (function() {
        var customs = db.getSync('tamponsPersonnalises', null);
        if (customs && Array.isArray(customs) && customs.length > 0) {
            var masques = db.getSync('elementsMasques', null);
            if (masques && Array.isArray(masques) && masques.length > 10) {
                // Corruption probable — réinitialiser
                db.setSync('elementsMasques', null);
                console.log('[Travaux-Outils] elementsMasques corrompus nettoyés (' + masques.length + ' entrées)');
            }
        }
    })();

    function obtenirOrdreAutocollants(categorie) {
        const key = 'ordreAutocollants_' + categorie;
        const ordre = db.getSync(key, null);
        const ids = AUTOCOLLANTS.filter(function(a) {
            if (a.legacy) return false;
            return a.categorie === categorie;
        }).map(a => a.id);
        if (ordre && Array.isArray(ordre)) {
            // Garder les IDs valides dans l'ordre sauvegarde, ajouter les nouveaux a la fin
            var result = ordre.filter(function(id) { return ids.indexOf(id) !== -1; });
            ids.forEach(function(id) { if (result.indexOf(id) === -1) result.push(id); });
            return result;
        }
        return ids;
    }

    function sauvegarderOrdreAutocollants(categorie, arr) {
        db.setSync('ordreAutocollants_' + categorie, arr);
    }

    function obtenirAutocollantsOrdonnes(categorie) {
        const ordre = obtenirOrdreAutocollants(categorie);
        const map = {};
        AUTOCOLLANTS.forEach(a => { map[a.id] = a; });
        return ordre.map(id => map[id]).filter(Boolean);
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
            const defaut = _defautsAutocollants[i]; // undefined pour les tampons custom
            const pers = persObs[a.id];
            // Restaurer le nom par défaut puis appliquer la personnalisation
            a.nom = (pers && pers.nom) ? pers.nom : (defaut ? defaut.nom : a.nom);
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
            } else if (defaut && defaut.fichier) {
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
            // Tampons custom sans image : pas d'entrée dans le cache (placeholder gere par le rendu)
        });

        // --- Symboles built-in (crochet / croix / interrogation) ---
        ['crochet', 'croix', 'interrogation'].forEach(function(id) {
            var pers = persObs[id];
            var def = _defautsSymboles[id];
            OUTILS[id].nom = (pers && pers.nom) ? pers.nom : def.nom;
            OUTILS[id].couleurBouton = (pers && pers.couleur) ? pers.couleur : def.couleur;
            OUTILS[id].icone = (pers && pers.icone) ? pers.icone : def.icone;
        });

        // --- Symboles Unicode personnalisés ---
        // Nettoyer les anciens symboles custom de OUTILS
        Object.keys(OUTILS).forEach(function(k) { if (OUTILS[k].customSymbole) delete OUTILS[k]; });
        obtenirSymbolesPerso().forEach(function(s) {
            OUTILS[s.id] = {
                id: s.id,
                nom: s.nom || 'Symbole',
                icone: s.icone || '?',
                couleurBouton: s.couleur || '#888888',
                curseur: 'crosshair',
                type: 'symbole',
                taille: 30,
                customSymbole: true
            };
        });

        // --- Couleur de categorie sur les symboles ---
        var couleursCat = obtenirCouleursCategories();
        if (couleursCat.symboles) {
            ['crochet', 'croix', 'interrogation'].forEach(function(id) {
                OUTILS[id].couleurBouton = couleursCat.symboles;
            });
            obtenirSymbolesPerso().forEach(function(s) {
                if (OUTILS[s.id]) OUTILS[s.id].couleurBouton = couleursCat.symboles;
            });
        }

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
    try { appliquerPersonnalisations(); } catch (e) { console.error('[Travaux-Outils] Erreur appliquerPersonnalisations:', e); }

    /* ===============================
       CONTENU RÉUTILISABLE DES PALETTES
       (pour ancrage colonne droite ET flottant)
       =============================== */

    /**
     * Génère le HTML interne de la liste des erreurs de français.
     * Utilisé par la colonne droite ancrée ET la palette flottante.
     * @returns {string} HTML de la .travaux-errfr-liste
     */
    function genererContenuErreursFr() {
        let html = '<div class="travaux-errfr-liste">';
        obtenirCodesOrdonnes().forEach((c, idx) => {
            const outil = OUTILS[c.id];
            const actif = outilActif === c.id ? ' actif' : '';
            html += `<div class="travaux-errfr-item${actif}" onclick="travauxOutils.setOutilActif('${c.id}')" title="${c.nom}">`;
            html += `<span class="travaux-errfr-numero" style="background:${outil.couleurBouton}">${idx + 1}</span>`;
            html += `<span class="travaux-errfr-nom">${c.nom}</span>`;
            html += `<span class="travaux-errfr-compteur u-hide" data-erreur="${c.id}"></span>`;
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    /**
     * Génère le HTML interne des tampons (symboles + qualité + diagnostic).
     * Utilisé par la colonne droite ancrée ET la palette flottante.
     * @returns {string} HTML des 3 grilles d'autocollants
     */
    function genererContenuTampons() {
        let html = '';
        const nomsCat = obtenirNomsCategories();
        var catsMasquees = db.getSync('categoriesMasquees', null) || [];
        var elemMasques = db.getSync('elementsMasques', null) || [];

        // Helper: generer une grille de tampons image
        function _htmlTamponsImage(categorie, coulCat) {
            var r = '';
            var borderStyle = '';
            obtenirAutocollantsOrdonnes(categorie).forEach(function(a) {
                if (elemMasques.indexOf(a.id) !== -1) return;
                var imgSrc = imagesAutocollants[a.id] ? imagesAutocollants[a.id].src : (a.fichier ? DOSSIER_AUTOCOLLANTS + a.fichier : '');
                var actif = (getAutocollantActif() === a.id) ? ' actif' : '';
                r += '<div class="travaux-autocollant-item' + actif + '"' + (borderStyle ? ' style="' + borderStyle + '"' : '') + ' onclick="travauxOutils.setAutocollantActif(\'' + a.id + '\')" title="' + a.nom + '">';
                if (imgSrc) {
                    r += '<img src="' + imgSrc + '" alt="' + a.nom + '">';
                } else {
                    r += '<span style="font-size:24px; opacity:0.3;">?</span>';
                }
                r += '<span>' + a.nom + '</span></div>';
            });
            return r;
        }

        // Generer les categories dans l'ordre personnalise
        var couleursCat = obtenirCouleursCategories();
        obtenirOrdreCategories().forEach(function(catId) {
            if (catsMasquees.indexOf(catId) !== -1) return;
            var nomCat = nomsCat[catId] || catId;
            var coulCat = couleursCat[catId];
            var styleCat = coulCat ? ' style="border-left:3px solid ' + coulCat + '; padding-left:6px;"' : '';
            html += '<div class="travaux-autocollants-label"' + styleCat + '>' + nomCat + '</div>';

            if (catId === 'symboles') {
                html += '<div class="travaux-autocollants-grille travaux-autocollants-grille--symboles">';
                ['crochet', 'croix', 'interrogation'].forEach(function(id) {
                    if (elemMasques.indexOf(id) !== -1) return;
                    var outil = OUTILS[id];
                    var actif = outilActif === id ? ' actif' : '';
                    html += '<div class="travaux-autocollant-item' + actif + '" onclick="travauxOutils.setOutilActif(\'' + id + '\')" title="' + outil.nom + '">';
                    html += '<span style="font-size:24px; color:' + outil.couleurBouton + '; font-weight:bold;">' + outil.icone + '</span>';
                    html += '<span>' + outil.nom + '</span></div>';
                });
                obtenirSymbolesPerso().forEach(function(s) {
                    var outil = OUTILS[s.id];
                    if (!outil) return;
                    var actif = outilActif === s.id ? ' actif' : '';
                    html += '<div class="travaux-autocollant-item' + actif + '" onclick="travauxOutils.setOutilActif(\'' + s.id + '\')" title="' + outil.nom + '">';
                    html += '<span style="font-size:24px; color:' + outil.couleurBouton + '; font-weight:bold;">' + outil.icone + '</span>';
                    html += '<span>' + outil.nom + '</span></div>';
                });
                html += _htmlTamponsImage('symboles', coulCat);
                html += '</div>';
            } else {
                html += '<div class="travaux-autocollants-grille">';
                html += _htmlTamponsImage(catId, coulCat);
                html += '</div>';
            }
        });

        return html;
    }

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

        // Contenu : liste verticale (réutilise la fonction partagée)
        html += '<div class="travaux-palette-contenu" id="travaux-errfr-contenu">';
        html += genererContenuErreursFr();
        html += '</div>';

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
        const ordre = obtenirOrdreErreursFr();
        const code = ordre.indexOf(outilId) + 1 || outilId.replace('errfr_', '');
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
            // Bouton Dupliquer juste apres Selection
            if (id === 'selection') {
                html += '<button class="travaux-btn-outil" id="travaux-btn-dupliquer" onclick="travauxAnnotation.dupliquerSelection()" title="Dupliquer la s\u00e9lection">Dupliquer</button>';
            }
        });

        html += '</div></div>';

        // Formes (grille 2x2 : Cercle+Ligne / Rect.+Vague)
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Formes</div>';
        html += '<div class="travaux-palette-outils travaux-palette-outils--grille2x2">';

        const outilsFormes = ['cercle', 'rectangle', 'fleche', 'ondule'];
        outilsFormes.forEach(id => {
            const outil = OUTILS[id];
            const actif = outilActif === id ? ' actif' : '';
            const styleCouleur = outil.couleurBouton ? ` style="color:${outil.couleurBouton}; font-weight:bold;"` : '';
            html += `<button class="travaux-btn-outil${actif}" data-outil="${id}" onclick="travauxOutils.setOutilActif('${id}')" title="${outil.nom}"${styleCouleur}>${outil.icone}</button>`;
        });

        html += '</div></div>';

        // Options extrémités : 4 modes de pointes (visible quand outil fleche ou ondule actif)
        const montrerExtremites = outilActif === 'fleche' || outilActif === 'ondule';
        html += '<div class="travaux-palette-section travaux-options-fleche" id="travaux-options-fleche"' + (montrerExtremites ? '' : ' style="display:none"') + '>';
        html += '<div class="travaux-palette-label">Extr\u00e9mit\u00e9s</div>';
        html += '<div class="travaux-palette-outils">';
        const modes = [
            { val: 'debut', label: '\u2190', titre: 'Pointe au d\u00e9but (\u2190)' },
            { val: 'double', label: '\u2194', titre: 'Double pointe (\u2194)' },
            { val: 'fin', label: '\u2192', titre: 'Pointe \u00e0 la fin (\u2192)' },
            { val: 'aucune', label: '\u2014', titre: 'Aucune pointe (\u2014)' }
        ];
        modes.forEach(m => {
            const act = flechePointes === m.val ? ' actif' : '';
            html += `<button class="travaux-btn-outil${act}" data-pointes="${m.val}" onclick="travauxOutils.setFlechePointes('${m.val}')" title="${m.titre}">${m.label}</button>`;
        });
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
        html += '<button class="travaux-palette-btn-pied travaux-palette-btn-danger" onclick="travauxAnnotation.effacerPage()" title="Effacer toute la page">Effacer tout</button>';
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

        // Options extrémités : afficher/masquer selon outil actif + maj boutons pointes
        const sectionFleche = document.getElementById('travaux-options-fleche');
        if (sectionFleche) {
            sectionFleche.style.display = (outilActif === 'fleche' || outilActif === 'ondule') ? '' : 'none';
            sectionFleche.querySelectorAll('[data-pointes]').forEach(btn => {
                btn.classList.toggle('actif', btn.dataset.pointes === flechePointes);
            });
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
    window.addEventListener('travaux-fleche-pointes-change', rafraichirPalette);
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
        const nomsCat = obtenirNomsCategories();
        const overlay = document.createElement('div');
        overlay.id = 'modal-retro-observations';
        overlay.className = 'modal-overlay actif';

        let html = '<div class="modal-contenu travaux-retro-modal">';
        html += '<h2 style="margin-top:0">R\u00e9troactions \u2014 Observations</h2>';
        html += '<p style="color:var(--texte-secondaire);font-size:0.85rem;margin-bottom:16px;">Ces textes appara\u00eetront dans la r\u00e9troaction g\u00e9n\u00e9r\u00e9e pour l\'\u00e9l\u00e8ve lorsque le tampon correspondant est utilis\u00e9. Cliquez sur l\'image pour la remplacer. Glissez \u2630 pour r\u00e9ordonner.</p>';

        // Noms des categories editables
        var catsPerso = obtenirCategoriesPerso();
        // Determiner les categories masquees
        var catsMasquees = db.getSync('categoriesMasquees', null) || [];
        // Toutes les categories (built-in + perso), affichees sauf masquees
        var catPersoMap = {};
        catsPerso.forEach(function(c) { catPersoMap[c.id] = c; });
        var ordreCategories = obtenirOrdreCategories();
        var couleursCat = obtenirCouleursCategories();

        html += '<div id="travaux-retro-categories" style="margin-bottom:16px; display:flex; flex-direction:column; gap:6px;">';
        ordreCategories.forEach(function(catId) {
            if (catsMasquees.indexOf(catId) !== -1) return;
            var estPerso = !!catPersoMap[catId];
            var coulCat = couleursCat[catId] || '#888888';
            html += '<div class="travaux-retro-cat-draggable" style="display:flex; gap:8px; align-items:center;" data-cat-row="' + catId + '"' + (estPerso ? ' data-cat-perso-id="' + catId + '"' : '') + ' draggable="true">';
            html += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner" style="cursor:grab;">\u2630</span>';
            html += '<button class="travaux-retro-btn-supprimer" onclick="travauxOutils.supprimerCategorieRetroObs(\'' + catId + '\')" title="Supprimer la cat\u00e9gorie" style="min-width:auto;">&times;</button>';
            html += '<div class="travaux-retro-couleur" style="background:' + coulCat + ';" data-couleur-cat-id="' + catId + '" title="Couleur de la cat\u00e9gorie">';
            html += '<input type="color" class="travaux-retro-couleur-input" data-color-cat-id="' + catId + '" value="' + coulCat + '">';
            html += '</div>';
            html += '<input type="text" class="travaux-retro-nom-input" data-cat-id="' + catId + '"' + (estPerso ? ' data-cat-perso-id="' + catId + '"' : '') + ' value="' + (nomsCat[catId] || '') + '">';
            html += '</div>';
        });
        html += '<button class="btn btn-secondaire" onclick="travauxOutils.ajouterCategorieRetroObs()" style="margin-top:4px;font-size:0.8rem;align-self:flex-start;">+ Ajouter une cat\u00e9gorie</button>';
        html += '</div>';

        // Helper pour generer une ligne de tampon
        function _htmlRowTampon(a, texte, imgSrc) {
            var estCustom = a.custom ? ' data-custom="true"' : '';
            var btnSuppr = '<button class="travaux-retro-btn-supprimer" onclick="travauxOutils.supprimerTamponRetroObs(\'' + a.id + '\')" title="Supprimer">&times;</button>';
            var r = '<div class="travaux-retro-row travaux-retro-draggable" data-obs-id="' + a.id + '"' + estCustom + ' draggable="true">';
            r += '<div class="travaux-retro-row-haut">';
            r += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>';
            r += '<div class="travaux-retro-img-upload" data-obs-id="' + a.id + '" title="Cliquer pour changer l\'image">';
            r += '<img src="' + imgSrc + '" alt="' + a.nom + '" data-img-id="' + a.id + '"' + (imgSrc ? '' : ' style="opacity:0.3"') + '>';
            r += '<input type="file" accept="image/*" data-file-id="' + a.id + '" hidden>';
            r += '</div>';
            r += '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + a.id + '" value="' + a.nom + '"' + (a.custom ? ' placeholder="Nom du tampon"' : '') + '>';
            r += btnSuppr;
            r += '</div>';
            r += '<textarea class="travaux-retro-textarea" data-retro-id="' + a.id + '" rows="3">' + texte + '</textarea>';
            r += '</div>';
            return r;
        }

        // Helper pour generer une ligne de symbole Unicode
        function _htmlRowSymbole(id, outil, texte, estCustom) {
            var couleur = outil.couleurBouton;
            var btnSuppr = '<button class="travaux-retro-btn-supprimer" onclick="travauxOutils.supprimerSymboleRetroObs(\'' + id + '\')" title="Supprimer">&times;</button>';
            var r = '<div class="travaux-retro-row' + (estCustom ? ' travaux-retro-draggable' : '') + '" data-obs-id="' + id + '"' + (estCustom ? ' data-sym-custom="true" draggable="true"' : '') + '>';
            r += '<div class="travaux-retro-row-haut">';
            if (estCustom) r += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>';
            r += '<div class="travaux-retro-couleur" style="background:' + couleur + ';" data-couleur-id="' + id + '" title="Changer la couleur">';
            r += '<input type="color" class="travaux-retro-couleur-input" data-color-id="' + id + '" value="' + couleur + '">';
            r += '</div>';
            r += '<input type="text" class="travaux-retro-icone-input" data-icone-id="' + id + '" value="' + outil.icone + '" title="Caract\u00e8re Unicode" style="color:' + couleur + ';">';
            r += '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + id + '" value="' + outil.nom + '"' + (estCustom ? ' placeholder="Nom du symbole"' : '') + '>';
            r += btnSuppr;
            r += '</div>';
            r += '<textarea class="travaux-retro-textarea" data-retro-id="' + id + '" rows="3">' + texte + '</textarea>';
            r += '</div>';
            return r;
        }

        // Determiner les elements masques
        var elemMasques = db.getSync('elementsMasques', null) || [];

        // Generer les sections de toutes les categories dans l'ordre
        ordreCategories.forEach(function(catId) {
            if (catsMasquees.indexOf(catId) !== -1) return;
            var nomCat = nomsCat[catId] || catId;
            html += '<div class="travaux-retro-cat-label" style="font-weight:600; margin:12px 0 6px; color:var(--texte-principal);" data-cat-section="' + catId + '">' + nomCat + '</div>';

            if (catId === 'symboles') {
                // Symboles built-in
                html += '<div id="travaux-retro-obs-liste-symboles">';
                ['crochet', 'croix', 'interrogation'].forEach(function(id) {
                    if (elemMasques.indexOf(id) !== -1) return;
                    html += _htmlRowSymbole(id, OUTILS[id], retroActuelles[id] || '', false);
                });
                html += '</div>';
                // Symboles Unicode personnalises
                html += '<div id="travaux-retro-obs-liste-symboles-unicode">';
                var symPerso = obtenirSymbolesPerso();
                symPerso.forEach(function(s) {
                    var outil = OUTILS[s.id] || { nom: s.nom || 'Symbole', icone: s.icone || '?', couleurBouton: s.couleur || '#888888' };
                    html += _htmlRowSymbole(s.id, outil, retroActuelles[s.id] || '', true);
                });
                html += '</div>';
                // Tampons image de la categorie symboles
                html += '<div id="travaux-retro-obs-liste-symboles-custom">';
                obtenirAutocollantsOrdonnes('symboles').forEach(function(a) {
                    if (elemMasques.indexOf(a.id) !== -1) return;
                    var texte = retroActuelles[a.id] || '';
                    var imgSrc = (persObs[a.id] && persObs[a.id].imageBase64) ? persObs[a.id].imageBase64 : (a.fichier ? DOSSIER_AUTOCOLLANTS + a.fichier : '');
                    html += _htmlRowTampon(a, texte, imgSrc);
                });
                html += '</div>';
                html += '<div style="display:flex; gap:8px; margin-top:8px;">';
                html += '<button class="btn btn-secondaire" onclick="travauxOutils.ajouterSymboleRetroObs()" style="font-size:0.8rem;">+ Symbole</button>';
                html += '<button class="btn btn-secondaire" onclick="travauxOutils.ajouterTamponRetroObs(\'symboles\')" style="font-size:0.8rem;">+ Tampon image</button>';
                html += '</div>';
            } else {
                // Categorie tampons image (qualite, diagnostic, ou perso)
                html += '<div id="travaux-retro-obs-liste-' + catId + '">';
                obtenirAutocollantsOrdonnes(catId).forEach(function(a) {
                    if (elemMasques.indexOf(a.id) !== -1) return;
                    var texte = retroActuelles[a.id] || '';
                    var imgSrc = (persObs[a.id] && persObs[a.id].imageBase64) ? persObs[a.id].imageBase64 : (a.fichier ? DOSSIER_AUTOCOLLANTS + a.fichier : '');
                    html += _htmlRowTampon(a, texte, imgSrc);
                });
                html += '</div>';
                html += '<button class="btn btn-secondaire" onclick="travauxOutils.ajouterTamponRetroObs(\'' + catId + '\')" style="margin-top:8px;font-size:0.8rem;">+ Ajouter</button>';
            }
        });

        html += '<div style="display:flex; gap:8px; margin:16px 0 8px; border-top:1px solid var(--bordure-claire); padding-top:12px;">';
        html += '<button class="btn btn-secondaire" onclick="travauxOutils.exporterTampons()" style="font-size:0.8rem;">Exporter mes tampons</button>';
        html += '<button class="btn btn-secondaire" onclick="document.getElementById(\'fichier-import-tampons\').click()" style="font-size:0.8rem;">Importer des tampons</button>';
        html += '<input type="file" id="fichier-import-tampons" accept=".json" style="display:none;" onchange="travauxOutils.importerTampons(event)">';
        html += '</div>';

        html += '<div class="travaux-retro-actions">';
        html += '<button class="btn btn-annuler" onclick="travauxOutils.reinitialiserRetroObservations()">R\u00e9initialiser</button>';
        html += '<button class="btn btn-secondaire" onclick="document.getElementById(\'modal-retro-observations\').remove()">Annuler</button>';
        html += '<button class="btn btn-principal" onclick="travauxOutils.enregistrerRetroObservations()">Enregistrer</button>';
        html += '</div>';
        html += '</div>';

        overlay.innerHTML = html;
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);

        // Wiring: clic sur l'image → ouvre le file input
        overlay.querySelectorAll('.travaux-retro-img-upload').forEach(function(wrap) {
            var imgEl = wrap.querySelector('img');
            var fileInput = wrap.querySelector('input[type="file"]');
            wrap.addEventListener('click', function(e) {
                if (e.target !== fileInput) fileInput.click();
            });
            fileInput.addEventListener('change', function() {
                var file = fileInput.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(ev) {
                    imgEl.src = ev.target.result;
                    imgEl.dataset.base64 = ev.target.result;
                };
                reader.readAsDataURL(file);
            });
        });

        // Wiring: clic sur pastille couleur → ouvre le color picker
        overlay.querySelectorAll('.travaux-retro-couleur').forEach(function(pastille) {
            var colorInput = pastille.querySelector('input[type="color"]');
            pastille.addEventListener('click', function(e) {
                if (e.target !== colorInput) colorInput.click();
            });
            colorInput.addEventListener('input', function() {
                pastille.style.background = colorInput.value;
                // Mettre a jour la couleur de l'input icone a cote
                var row = pastille.closest('.travaux-retro-row');
                if (row) {
                    var iconeInput = row.querySelector('.travaux-retro-icone-input');
                    if (iconeInput) iconeInput.style.color = colorInput.value;
                }
            });
        });

        // Wiring: drag-and-drop pour les elements de chaque categorie
        ordreCategories.forEach(function(catId) {
            if (catId === 'symboles') {
                configurerDragRetroObs(overlay.querySelector('#travaux-retro-obs-liste-symboles-unicode'));
                configurerDragRetroObs(overlay.querySelector('#travaux-retro-obs-liste-symboles-custom'));
            } else {
                configurerDragRetroObs(overlay.querySelector('#travaux-retro-obs-liste-' + catId));
            }
        });

        // Wiring: drag-and-drop pour reordonner les categories
        configurerDragCategories(overlay.querySelector('#travaux-retro-categories'));
    }

    function configurerDragCategories(conteneur) {
        if (!conteneur) return;
        var draggedRow = null;
        var SELECTOR = '.travaux-retro-cat-draggable';

        conteneur.addEventListener('dragstart', function(e) {
            var row = e.target.closest(SELECTOR);
            if (!row) return;
            draggedRow = row;
            row.classList.add('travaux-retro-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        });

        conteneur.addEventListener('dragend', function() {
            if (draggedRow) draggedRow.classList.remove('travaux-retro-dragging');
            draggedRow = null;
            conteneur.querySelectorAll('.travaux-retro-drag-over').forEach(function(el) { el.classList.remove('travaux-retro-drag-over'); });
        });

        conteneur.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            var cible = e.target.closest(SELECTOR);
            if (!cible || cible === draggedRow) return;
            conteneur.querySelectorAll('.travaux-retro-drag-over').forEach(function(el) { el.classList.remove('travaux-retro-drag-over'); });
            cible.classList.add('travaux-retro-drag-over');
        });

        conteneur.addEventListener('dragleave', function(e) {
            var cible = e.target.closest(SELECTOR);
            if (cible) cible.classList.remove('travaux-retro-drag-over');
        });

        conteneur.addEventListener('drop', function(e) {
            e.preventDefault();
            var cible = e.target.closest(SELECTOR);
            if (!cible || !draggedRow || cible === draggedRow) return;
            cible.classList.remove('travaux-retro-drag-over');
            var rows = Array.from(conteneur.querySelectorAll(SELECTOR));
            var idxDrag = rows.indexOf(draggedRow);
            var idxCible = rows.indexOf(cible);
            if (idxDrag < idxCible) {
                conteneur.insertBefore(draggedRow, cible.nextSibling);
            } else {
                conteneur.insertBefore(draggedRow, cible);
            }
            // Reordonner les sections du corps de la modale
            var modal = conteneur.closest('.travaux-retro-modal');
            if (!modal) return;
            var actionsDiv = modal.querySelector('.travaux-retro-actions');
            var nouvelOrdre = Array.from(conteneur.querySelectorAll(SELECTOR)).map(function(r) { return r.dataset.catRow; });
            // Collecter les blocs de chaque section (label + contenu jusqu'au prochain label)
            var blocs = {};
            modal.querySelectorAll('[data-cat-section]').forEach(function(label) {
                var catId = label.dataset.catSection;
                var elements = [label];
                var next = label.nextElementSibling;
                while (next && !next.dataset.catSection && !next.classList.contains('travaux-retro-actions')) {
                    elements.push(next);
                    next = next.nextElementSibling;
                }
                blocs[catId] = elements;
            });
            // Re-inserer dans le nouvel ordre
            nouvelOrdre.forEach(function(catId) {
                if (!blocs[catId]) return;
                blocs[catId].forEach(function(el) {
                    actionsDiv.parentNode.insertBefore(el, actionsDiv);
                });
            });
        });
    }

    function configurerDragRetroObs(conteneur) {
        if (!conteneur) return;
        var draggedRow = null;

        conteneur.addEventListener('dragstart', function(e) {
            var row = e.target.closest('.travaux-retro-draggable');
            if (!row) return;
            draggedRow = row;
            row.classList.add('travaux-retro-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        });

        conteneur.addEventListener('dragend', function() {
            if (draggedRow) draggedRow.classList.remove('travaux-retro-dragging');
            draggedRow = null;
            conteneur.querySelectorAll('.travaux-retro-drag-over').forEach(function(el) { el.classList.remove('travaux-retro-drag-over'); });
        });

        conteneur.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            var cible = e.target.closest('.travaux-retro-draggable');
            if (!cible || cible === draggedRow) return;
            conteneur.querySelectorAll('.travaux-retro-drag-over').forEach(function(el) { el.classList.remove('travaux-retro-drag-over'); });
            cible.classList.add('travaux-retro-drag-over');
        });

        conteneur.addEventListener('dragleave', function(e) {
            var cible = e.target.closest('.travaux-retro-draggable');
            if (cible) cible.classList.remove('travaux-retro-drag-over');
        });

        conteneur.addEventListener('drop', function(e) {
            e.preventDefault();
            var cible = e.target.closest('.travaux-retro-draggable');
            if (!cible || !draggedRow || cible === draggedRow) return;
            cible.classList.remove('travaux-retro-drag-over');
            var rows = Array.from(conteneur.querySelectorAll('.travaux-retro-draggable'));
            var idxDrag = rows.indexOf(draggedRow);
            var idxCible = rows.indexOf(cible);
            if (idxDrag < idxCible) {
                conteneur.insertBefore(draggedRow, cible.nextSibling);
            } else {
                conteneur.insertBefore(draggedRow, cible);
            }
        });
    }

    function enregistrerRetroObservations() {
        const modal = document.getElementById('modal-retro-observations');
        if (!modal) return;
        // Textes de retroaction
        const retroObj = {};
        modal.querySelectorAll('textarea[data-retro-id]').forEach(function(ta) {
            retroObj[ta.dataset.retroId] = ta.value;
        });
        sauvegarderRetroactionsObservations(retroObj);
        // Personnalisations (noms + images)
        const persObj = obtenirPersonnalisationObservations();
        modal.querySelectorAll('input[data-nom-id]').forEach(function(inp) {
            const id = inp.dataset.nomId;
            if (!persObj[id]) persObj[id] = {};
            persObj[id].nom = inp.value;
        });
        modal.querySelectorAll('img[data-img-id]').forEach(function(img) {
            const id = img.dataset.imgId;
            if (!persObj[id]) persObj[id] = {};
            if (img.dataset.base64) {
                persObj[id].imageBase64 = img.dataset.base64;
            }
        });
        // Couleurs des symboles
        modal.querySelectorAll('input[data-color-id]').forEach(function(inp) {
            const id = inp.dataset.colorId;
            if (!persObj[id]) persObj[id] = {};
            persObj[id].couleur = inp.value;
        });
        // Icones des symboles
        modal.querySelectorAll('input[data-icone-id]').forEach(function(inp) {
            const id = inp.dataset.iconeId;
            if (!persObj[id]) persObj[id] = {};
            persObj[id].icone = inp.value;
        });
        sauvegarderPersonnalisationObservations(persObj);

        // Symboles Unicode personnalises
        var symbolesPerso = [];
        var listeSymUnicode = modal.querySelector('#travaux-retro-obs-liste-symboles-unicode');
        if (listeSymUnicode) {
            listeSymUnicode.querySelectorAll('.travaux-retro-row[data-sym-custom="true"]').forEach(function(row) {
                var id = row.dataset.obsId;
                var iconeInput = row.querySelector('input[data-icone-id]');
                var nomInput = row.querySelector('input[data-nom-id]');
                var colorInput = row.querySelector('input[data-color-id]');
                symbolesPerso.push({
                    id: id,
                    icone: iconeInput ? iconeInput.value : '?',
                    nom: nomInput ? nomInput.value : 'Symbole',
                    couleur: colorInput ? colorInput.value : '#888888'
                });
            });
        }
        sauvegarderSymbolesPerso(symbolesPerso);

        // Categories personnalisees
        var catsPerso = [];
        modal.querySelectorAll('input[data-cat-perso-id]').forEach(function(inp) {
            catsPerso.push({ id: inp.dataset.catPersoId, nom: inp.value });
        });
        sauvegarderCategoriesPerso(catsPerso);

        // Detecter les categories masquees (built-in absentes du DOM)
        var catsMasquees = db.getSync('categoriesMasquees', null) || [];
        CATEGORIES_BUILTIN.forEach(function(catId) {
            var present = !!modal.querySelector('[data-cat-row="' + catId + '"]');
            var idx = catsMasquees.indexOf(catId);
            if (!present && idx === -1) catsMasquees.push(catId);
            else if (present && idx !== -1) catsMasquees.splice(idx, 1);
        });
        // Categories perso supprimees : deja gerees (absentes de catsPerso)
        db.setSync('categoriesMasquees', catsMasquees.length > 0 ? catsMasquees : null);

        // Detecter les elements masques (symboles/tampons built-in supprimes du DOM)
        var elemMasques = [];
        var idsBuiltinSymboles = ['crochet', 'croix', 'interrogation'];
        var idsBuiltinAutocollants = _defautsAutocollants.map(function(a) { return a.id; });
        idsBuiltinSymboles.concat(idsBuiltinAutocollants).forEach(function(id) {
            if (!modal.querySelector('[data-obs-id="' + id + '"]')) {
                elemMasques.push(id);
            }
        });
        db.setSync('elementsMasques', elemMasques.length > 0 ? elemMasques : null);

        // Noms des categories (built-in + perso)
        const nomsCat = obtenirNomsCategories();
        modal.querySelectorAll('input[data-cat-id]').forEach(function(inp) {
            nomsCat[inp.dataset.catId] = inp.value;
        });
        sauvegarderNomsCategories(nomsCat);

        // Couleurs des categories
        var couleursCat = {};
        modal.querySelectorAll('input[data-color-cat-id]').forEach(function(inp) {
            couleursCat[inp.dataset.colorCatId] = inp.value;
        });
        sauvegarderCouleursCategories(couleursCat);

        // Sauvegarder l'ordre des categories
        var catContainer = modal.querySelector('#travaux-retro-categories');
        if (catContainer) {
            var ordreAct = Array.from(catContainer.querySelectorAll('.travaux-retro-cat-draggable'))
                .map(function(r) { return r.dataset.catRow; });
            sauvegarderOrdreCategories(ordreAct);
        }

        // Collecter les tampons personnalises et l'ordre par categorie
        var catIds = CATEGORIES_BUILTIN.slice();
        catsPerso.forEach(function(c) { catIds.push(c.id); });
        var customs = [];
        catIds.forEach(function(cat) {
            const liste = modal.querySelector('#travaux-retro-obs-liste-' + cat + '-custom') || modal.querySelector('#travaux-retro-obs-liste-' + cat);
            if (liste) {
                const ordre = Array.from(liste.querySelectorAll('.travaux-retro-draggable'))
                    .map(function(row) { return row.dataset.obsId; });
                sauvegarderOrdreAutocollants(cat, ordre);
                // Reperer les tampons custom
                liste.querySelectorAll('.travaux-retro-draggable[data-custom="true"]').forEach(function(row) {
                    var nomInput = row.querySelector('input[data-nom-id]');
                    customs.push({
                        id: row.dataset.obsId,
                        nom: nomInput ? nomInput.value : 'Nouveau',
                        categorie: cat
                    });
                });
            }
        });
        db.setSync('tamponsPersonnalises', customs);
        // Synchroniser AUTOCOLLANTS avec les customs
        for (var i = AUTOCOLLANTS.length - 1; i >= 0; i--) {
            if (AUTOCOLLANTS[i].custom) AUTOCOLLANTS.splice(i, 1);
        }
        customs.forEach(function(c) {
            AUTOCOLLANTS.push({ id: c.id, nom: c.nom, fichier: '', categorie: c.categorie, custom: true });
        });
        appliquerPersonnalisations();
        rafraichirPalettesApresPersonnalisation();
        modal.remove();
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Tampons et r\u00e9troactions enregistr\u00e9s');
        }
    }

    function reinitialiserRetroObservations() {
        if (!confirm('R\u00e9initialiser tous les tampons, cat\u00e9gories, couleurs et r\u00e9troactions ?\n\nCette action est irr\u00e9versible. Pense \u00e0 exporter tes tampons avant si tu veux les conserver.')) return;
        // Nettoyer les ordres des categories perso avant de les supprimer
        obtenirCategoriesPerso().forEach(function(cat) {
            db.setSync('ordreAutocollants_' + cat.id, null);
        });
        db.setSync('retroactionsObservations', null);
        db.setSync('personnalisationObservations', null);
        db.setSync('nomsCategoriesTampons', null);
        db.setSync('ordreAutocollants_symboles', null);
        db.setSync('ordreAutocollants_contenu', null);
        db.setSync('ordreAutocollants_comprehension', null);
        db.setSync('ordreAutocollants_observations', null);
        db.setSync('ordreAutocollants_qualite', null);
        db.setSync('ordreAutocollants_diagnostic', null);
        db.setSync('symbolesUnicodePerso', null);
        db.setSync('categoriesPerso', null);
        db.setSync('categoriesMasquees', null);
        db.setSync('elementsMasques', null);
        db.setSync('ordreCategories', null);
        db.setSync('couleursCategories', null);
        // Supprimer les tampons personnalises
        db.setSync('tamponsPersonnalises', null);
        for (var i = AUTOCOLLANTS.length - 1; i >= 0; i--) {
            if (AUTOCOLLANTS[i].custom) AUTOCOLLANTS.splice(i, 1);
        }
        // Supprimer les symboles custom de OUTILS
        Object.keys(OUTILS).forEach(function(k) { if (OUTILS[k].customSymbole) delete OUTILS[k]; });
        // Restaurer les valeurs par defaut des symboles built-in
        ['crochet', 'croix', 'interrogation'].forEach(function(id) {
            OUTILS[id].nom = _defautsSymboles[id].nom;
            OUTILS[id].couleurBouton = _defautsSymboles[id].couleur;
            OUTILS[id].icone = _defautsSymboles[id].icone;
        });
        appliquerPersonnalisations();
        // Rouvrir le modal pour refleter l'ordre et les valeurs par defaut
        ouvrirEditionRetroObservations();
    }

    /**
     * Ajoute un nouveau tampon dans la modale (symboles, qualite ou diagnostic)
     */
    function ajouterTamponRetroObs(categorie) {
        var liste = document.getElementById('travaux-retro-obs-liste-' + categorie + '-custom') || document.getElementById('travaux-retro-obs-liste-' + categorie);
        if (!liste) return;

        var id = 'custom-' + Date.now();
        var div = document.createElement('div');
        div.className = 'travaux-retro-row travaux-retro-draggable';
        div.dataset.obsId = id;
        div.dataset.custom = 'true';
        div.setAttribute('draggable', 'true');

        div.innerHTML =
            '<div class="travaux-retro-row-haut">' +
                '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>' +
                '<div class="travaux-retro-img-upload" data-obs-id="' + id + '" title="Cliquer pour changer l\'image">' +
                    '<img src="" alt="Nouveau" data-img-id="' + id + '" style="opacity:0.3">' +
                    '<input type="file" accept="image/*" data-file-id="' + id + '" hidden>' +
                '</div>' +
                '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + id + '" value="" placeholder="Nom du tampon">' +
                '<button class="travaux-retro-btn-supprimer" onclick="travauxOutils.supprimerTamponRetroObs(\'' + id + '\')" title="Supprimer">&times;</button>' +
            '</div>' +
            '<textarea class="travaux-retro-textarea" data-retro-id="' + id + '" rows="3"></textarea>';

        liste.appendChild(div);

        // Brancher le clic image → file input
        var wrap = div.querySelector('.travaux-retro-img-upload');
        var imgEl = wrap.querySelector('img');
        var fileInput = wrap.querySelector('input[type="file"]');
        wrap.addEventListener('click', function(e) {
            if (e.target !== fileInput) fileInput.click();
        });
        fileInput.addEventListener('change', function() {
            var file = fileInput.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                imgEl.src = ev.target.result;
                imgEl.dataset.base64 = ev.target.result;
                imgEl.style.opacity = '1';
            };
            reader.readAsDataURL(file);
        });

        // Re-configurer le drag pour la liste
        configurerDragRetroObs(liste);

        // Focus sur le champ nom
        var nomInput = div.querySelector('input[data-nom-id]');
        if (nomInput) nomInput.focus();
    }

    /**
     * Supprime un tampon personnalise de la modale
     */
    function supprimerTamponRetroObs(id) {
        var row = document.querySelector('.travaux-retro-draggable[data-obs-id="' + id + '"]');
        if (row) row.remove();
    }

    /**
     * Ajoute un nouveau symbole Unicode personnalise dans la modale
     */
    function ajouterSymboleRetroObs() {
        var liste = document.getElementById('travaux-retro-obs-liste-symboles-unicode');
        if (!liste) return;

        var id = 'sym-' + Date.now();
        var couleur = '#888888';
        var div = document.createElement('div');
        div.className = 'travaux-retro-row travaux-retro-draggable';
        div.dataset.obsId = id;
        div.dataset.symCustom = 'true';
        div.setAttribute('draggable', 'true');

        div.innerHTML =
            '<div class="travaux-retro-row-haut">' +
                '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>' +
                '<div class="travaux-retro-couleur" style="background:' + couleur + ';" data-couleur-id="' + id + '" title="Changer la couleur">' +
                    '<input type="color" class="travaux-retro-couleur-input" data-color-id="' + id + '" value="' + couleur + '">' +
                '</div>' +
                '<input type="text" class="travaux-retro-icone-input" data-icone-id="' + id + '" value="" placeholder="\u2605" title="Caract\u00e8re Unicode" style="color:' + couleur + ';">' +
                '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + id + '" value="" placeholder="Nom du symbole">' +
                '<button class="travaux-retro-btn-supprimer" onclick="travauxOutils.supprimerSymboleRetroObs(\'' + id + '\')" title="Supprimer">&times;</button>' +
            '</div>' +
            '<textarea class="travaux-retro-textarea" data-retro-id="' + id + '" rows="3"></textarea>';

        liste.appendChild(div);

        // Brancher le color picker
        var pastille = div.querySelector('.travaux-retro-couleur');
        var colorInput = pastille.querySelector('input[type="color"]');
        pastille.addEventListener('click', function(e) {
            if (e.target !== colorInput) colorInput.click();
        });
        colorInput.addEventListener('input', function() {
            pastille.style.background = colorInput.value;
            var iconeInput = div.querySelector('.travaux-retro-icone-input');
            if (iconeInput) iconeInput.style.color = colorInput.value;
        });

        // Re-configurer le drag
        configurerDragRetroObs(liste);

        // Focus sur le champ icone
        var iconeInput = div.querySelector('.travaux-retro-icone-input');
        if (iconeInput) iconeInput.focus();
    }

    function supprimerSymboleRetroObs(id) {
        var row = document.querySelector('.travaux-retro-row[data-obs-id="' + id + '"]');
        if (row) row.remove();
    }

    /**
     * Ajoute une nouvelle categorie personnalisee dans la modale
     */
    function ajouterCategorieRetroObs() {
        var id = 'cat-' + Date.now();
        var nom = 'Nouvelle cat\u00e9gorie';

        // Ajouter la ligne dans la zone des noms de categories
        var catContainer = document.getElementById('travaux-retro-categories');
        if (!catContainer) return;
        var btnAjouter = catContainer.querySelector('button');
        var rowDiv = document.createElement('div');
        rowDiv.className = 'travaux-retro-cat-draggable';
        rowDiv.style.cssText = 'display:flex; gap:8px; align-items:center;';
        rowDiv.dataset.catRow = id;
        rowDiv.dataset.catPersoId = id;
        rowDiv.setAttribute('draggable', 'true');
        var coulDefaut = '#888888';
        rowDiv.innerHTML =
            '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner" style="cursor:grab;">\u2630</span>' +
            '<button class="travaux-retro-btn-supprimer" onclick="travauxOutils.supprimerCategorieRetroObs(\'' + id + '\')" title="Supprimer la cat\u00e9gorie" style="min-width:auto;">&times;</button>' +
            '<div class="travaux-retro-couleur" style="background:' + coulDefaut + ';" data-couleur-cat-id="' + id + '" title="Couleur de la cat\u00e9gorie">' +
                '<input type="color" class="travaux-retro-couleur-input" data-color-cat-id="' + id + '" value="' + coulDefaut + '">' +
            '</div>' +
            '<input type="text" class="travaux-retro-nom-input" data-cat-id="' + id + '" data-cat-perso-id="' + id + '" value="' + nom + '">';
        catContainer.insertBefore(rowDiv, btnAjouter);

        // Brancher le color picker de la nouvelle categorie
        var pastille = rowDiv.querySelector('.travaux-retro-couleur');
        var colorInput = pastille.querySelector('input[type="color"]');
        pastille.addEventListener('click', function(e) {
            if (e.target !== colorInput) colorInput.click();
        });
        colorInput.addEventListener('input', function() {
            pastille.style.background = colorInput.value;
        });

        // Ajouter la section de tampons dans le corps de la modale
        var modalContenu = catContainer.closest('.travaux-retro-modal');
        var actionsDiv = modalContenu.querySelector('.travaux-retro-actions');
        var catLabel = document.createElement('div');
        catLabel.className = 'travaux-retro-cat-label';
        catLabel.style.cssText = 'font-weight:600; margin:12px 0 6px; color:var(--texte-principal);';
        catLabel.textContent = nom;
        catLabel.dataset.catSection = id;

        var catListe = document.createElement('div');
        catListe.id = 'travaux-retro-obs-liste-' + id;

        var catBtn = document.createElement('button');
        catBtn.className = 'btn btn-secondaire';
        catBtn.style.cssText = 'margin-top:8px;font-size:0.8rem;';
        catBtn.textContent = '+ Ajouter';
        catBtn.onclick = function() { ajouterTamponRetroObs(id); };

        actionsDiv.parentNode.insertBefore(catLabel, actionsDiv);
        actionsDiv.parentNode.insertBefore(catListe, actionsDiv);
        actionsDiv.parentNode.insertBefore(catBtn, actionsDiv);

        // Synchroniser le nom quand on le modifie dans le champ en haut
        var nomInput = rowDiv.querySelector('input[data-cat-id]');
        nomInput.addEventListener('input', function() {
            catLabel.textContent = nomInput.value;
        });

        configurerDragRetroObs(catListe);
        nomInput.focus();
        nomInput.select();
    }

    function supprimerCategorieRetroObs(catId) {
        // Supprimer la ligne de nom en haut
        var row = document.querySelector('[data-cat-row="' + catId + '"]');
        if (row) row.remove();
        // Supprimer la section dans le corps (label + listes + boutons)
        var section = document.querySelector('[data-cat-section="' + catId + '"]');
        if (section) {
            // Collecter tous les elements de cette section (label, listes, boutons)
            // jusqu'au prochain label de categorie ou la zone d'actions
            var next = section.nextElementSibling;
            section.remove();
            while (next && !next.classList.contains('travaux-retro-cat-label') && !next.classList.contains('travaux-retro-actions')) {
                var toRemove = next;
                next = next.nextElementSibling;
                toRemove.remove();
            }
        }
    }

    /* ===============================
       EXPORT / IMPORT TAMPONS (Bibliothèque)
       =============================== */

    /**
     * Convertit une Image preloadée en base64 PNG
     */
    function imageVersBase64(img) {
        if (!img || !img.complete || !img.naturalWidth) return null;
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
            return canvas.toDataURL('image/png');
        } catch (e) {
            return null;
        }
    }

    /**
     * Exporte tous les tampons actuels (catégories, images, rétroactions, symboles)
     */
    async function exporterTampons() {
        // Sauvegarder d'abord les modifications en cours si la modale est ouverte
        var modal = document.getElementById('modal-retro-observations');
        if (modal) enregistrerRetroObservations();

        var persObs = obtenirPersonnalisationObservations();
        var retroObs = obtenirRetroactionsObservations();
        var couleursCat = obtenirCouleursCategories();
        var nomsCat = obtenirNomsCategories();
        var ordreCategories = obtenirOrdreCategories();
        var catsPerso = obtenirCategoriesPerso();
        var symPerso = obtenirSymbolesPerso();
        var catsMasquees = db.getSync('categoriesMasquees', null) || [];
        var elemMasques = db.getSync('elementsMasques', null) || [];

        // Collecter les tampons image (non-legacy, non-masques)
        var tampons = [];
        AUTOCOLLANTS.forEach(function(a) {
            if (a.legacy) return;
            if (elemMasques.indexOf(a.id) !== -1) return;
            var base64 = null;
            // Image personnalisee en base64
            if (persObs[a.id] && persObs[a.id].imageBase64) {
                base64 = persObs[a.id].imageBase64;
            } else if (imagesAutocollants[a.id]) {
                base64 = imageVersBase64(imagesAutocollants[a.id]);
            }
            tampons.push({
                id: a.id,
                nom: (persObs[a.id] && persObs[a.id].nom) || a.nom,
                categorie: a.categorie,
                imageBase64: base64,
                retroaction: retroObs[a.id] || '',
                custom: a.custom || false
            });
        });

        // Collecter les symboles Unicode built-in (non-masques)
        var symbolesBuiltin = [];
        ['crochet', 'croix', 'interrogation'].forEach(function(id) {
            if (elemMasques.indexOf(id) !== -1) return;
            var outil = OUTILS[id];
            symbolesBuiltin.push({
                id: id,
                icone: outil.icone,
                nom: outil.nom,
                couleur: outil.couleurBouton,
                retroaction: retroObs[id] || ''
            });
        });

        // Construire les categories
        var categories = [];
        ordreCategories.forEach(function(catId) {
            if (catsMasquees.indexOf(catId) !== -1) return;
            categories.push({
                id: catId,
                nom: nomsCat[catId] || catId,
                couleur: couleursCat[catId] || null,
                builtin: CATEGORIES_BUILTIN.indexOf(catId) !== -1
            });
        });

        var contenu = {
            categories: categories,
            tampons: tampons,
            symbolesBuiltin: symbolesBuiltin,
            symbolesPerso: symPerso
        };

        if (tampons.length === 0 && symPerso.length === 0 && symbolesBuiltin.length === 0) {
            alert('Aucun tampon \u00e0 exporter.');
            return;
        }

        // Demander metadonnees CC
        var metaEnrichies = typeof demanderMetadonneesEnrichies === 'function'
            ? await demanderMetadonneesEnrichies('Tampons d\u2019observation', tampons.length + ' tampon(s)')
            : {};
        if (!metaEnrichies) return; // Annule

        var donnees = ajouterMetadonn\u00e9esCC(contenu, 'tampons', 'Tampons d\u2019observation', metaEnrichies);
        var nomFichier = genererNomFichierCC('tampons', 'Tampons-observation', donnees.metadata.version);

        var blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(tampons.length + ' tampon(s) export\u00e9(s)');
        }
    }

    /**
     * Importe des tampons depuis un fichier JSON
     */
    function importerTampons(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var donnees = JSON.parse(e.target.result);
                window._tamponsImportEnAttente = donnees;

                var estCC = typeof verifierLicenceCC === 'function' && verifierLicenceCC(donnees);
                var message = estCC
                    ? '<div style="margin-bottom:12px;">' + genererBadgeCC(donnees.metadata) + '</div>'
                    : '';

                var contenu = donnees.contenu || donnees;
                var nbTampons = (contenu.tampons || []).length;
                var nbSymPerso = (contenu.symbolesPerso || []).length;
                var nbCats = (contenu.categories || []).length;

                message += '<p><strong>Importer cette biblioth\u00e8que de tampons ?</strong></p>';
                message += '<p style="color:var(--texte-secondaire);font-size:0.85rem;">';
                message += nbTampons + ' tampon(s), ' + nbCats + ' cat\u00e9gorie(s)';
                if (nbSymPerso > 0) message += ', ' + nbSymPerso + ' symbole(s) Unicode';
                message += '</p>';
                message += '<p style="color:var(--texte-secondaire);font-size:0.85rem;">Les tampons actuels seront remplac\u00e9s.</p>';

                var modal = document.createElement('div');
                modal.innerHTML =
                    '<div class="modal-js-overlay" style="z-index: 10001;">' +
                        '<div class="modal-js-contenu" style="max-width: 500px;">' +
                            message +
                            '<div style="display:flex; gap:8px; margin-top:15px; justify-content:flex-end;">' +
                                '<button class="btn btn-secondaire" onclick="this.closest(\'.modal-js-overlay\').parentElement.remove(); delete window._tamponsImportEnAttente;">Annuler</button>' +
                                '<button class="btn btn-principal" onclick="travauxOutils.confirmerImportTampons(window._tamponsImportEnAttente); this.closest(\'.modal-js-overlay\').parentElement.remove(); delete window._tamponsImportEnAttente;">Importer</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                document.body.appendChild(modal);

            } catch (err) {
                console.error('[Tampons] Erreur import:', err);
                alert('Erreur lors de la lecture du fichier.\n' + err.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    /**
     * Confirme l'import et applique les tampons
     */
    function confirmerImportTampons(donnees) {
        try {
            var contenu = donnees.contenu || donnees;
            var tamponsImport = contenu.tampons || [];
            var categoriesImport = contenu.categories || [];
            var symBuiltinImport = contenu.symbolesBuiltin || [];
            var symPersoImport = contenu.symbolesPerso || [];

            // 1. Restaurer les categories
            var nomsCat = {};
            var couleursCat = {};
            var catsPerso = [];
            var ordreCategories = [];
            categoriesImport.forEach(function(cat) {
                nomsCat[cat.id] = cat.nom;
                if (cat.couleur) couleursCat[cat.id] = cat.couleur;
                ordreCategories.push(cat.id);
                if (!cat.builtin && CATEGORIES_BUILTIN.indexOf(cat.id) === -1) {
                    catsPerso.push({ id: cat.id, nom: cat.nom });
                }
            });
            sauvegarderNomsCategories(nomsCat);
            sauvegarderCouleursCategories(couleursCat);
            sauvegarderCategoriesPerso(catsPerso);
            sauvegarderOrdreCategories(ordreCategories);

            // 2. Restaurer les tampons image
            var persObj = {};
            var retroObj = {};
            var customs = [];

            // Supprimer les anciens tampons custom
            for (var i = AUTOCOLLANTS.length - 1; i >= 0; i--) {
                if (AUTOCOLLANTS[i].custom) AUTOCOLLANTS.splice(i, 1);
            }

            tamponsImport.forEach(function(t) {
                // Stocker l'image en base64
                if (t.imageBase64) {
                    if (!persObj[t.id]) persObj[t.id] = {};
                    persObj[t.id].imageBase64 = t.imageBase64;
                    persObj[t.id].nom = t.nom;
                }
                if (t.retroaction) retroObj[t.id] = t.retroaction;

                // Verifier si c'est un autocollant existant ou custom
                var existant = AUTOCOLLANTS.find(function(a) { return a.id === t.id; });
                if (!existant) {
                    customs.push({ id: t.id, nom: t.nom, categorie: t.categorie });
                    AUTOCOLLANTS.push({ id: t.id, nom: t.nom, fichier: '', categorie: t.categorie, custom: true });
                }
            });
            db.setSync('tamponsPersonnalises', customs.length > 0 ? customs : null);
            sauvegarderPersonnalisationObservations(persObj);
            sauvegarderRetroactionsObservations(retroObj);

            // 3. Restaurer les symboles Unicode
            // Built-in : stocker les personnalisations
            symBuiltinImport.forEach(function(s) {
                if (!persObj[s.id]) persObj[s.id] = {};
                persObj[s.id].nom = s.nom;
                persObj[s.id].couleur = s.couleur;
                persObj[s.id].icone = s.icone;
                if (s.retroaction) retroObj[s.id] = s.retroaction;
            });
            // Perso
            sauvegarderSymbolesPerso(symPersoImport);

            // Re-sauvegarder avec les symboles
            sauvegarderPersonnalisationObservations(persObj);
            sauvegarderRetroactionsObservations(retroObj);

            // 4. Nettoyer les masques
            db.setSync('categoriesMasquees', null);
            db.setSync('elementsMasques', null);

            // 5. Appliquer et rafraichir
            appliquerPersonnalisations();
            rafraichirPalettesApresPersonnalisation();

            // Rouvrir la modale si elle etait ouverte
            var modalObs = document.getElementById('modal-retro-observations');
            if (modalObs) {
                modalObs.remove();
                ouvrirEditionRetroObservations();
            }

            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces(tamponsImport.length + ' tampon(s) import\u00e9(s)');
            }
        } catch (err) {
            console.error('[Tampons] Erreur confirmerImport:', err);
            alert('Erreur lors de l\u2019import.\n' + err.message);
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

        const modeSynthese = obtenirModeSyntheseErrFr();
        html += '<div class="travaux-errfr-reglage">';
        html += '<span class="travaux-errfr-reglage-label">Synth\u00e8se PDF\u00a0:</span>';
        html += '<label><input type="radio" name="errfr-synthese" value="principale"' + (modeSynthese === 'principale' ? ' checked' : '') + ' onchange="travauxOutils.changerModeSyntheseErrFr(\'principale\')"> Erreur principale</label>';
        html += '<label><input type="radio" name="errfr-synthese" value="toutes"' + (modeSynthese === 'toutes' ? ' checked' : '') + ' onchange="travauxOutils.changerModeSyntheseErrFr(\'toutes\')"> Toutes les erreurs</label>';
        html += '</div>';

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
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Codes d\u2019erreurs et r\u00e9troactions enregistr\u00e9s');
        }
    }

    function reinitialiserRetroErreursFr() {
        if (!confirm('R\u00e9initialiser tous les codes d\u2019erreurs et r\u00e9troactions ?\n\nCette action est irr\u00e9versible.')) return;
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
     * Détecte si les palettes sont ancrées (colonne droite) ou flottantes.
     */
    function rafraichirPalettesApresPersonnalisation() {
        // Palettes ancrées dans la colonne droite — re-rendre le contenu in-place
        const ancreErrFr = document.getElementById('annot-errfr-contenu');
        if (ancreErrFr) {
            ancreErrFr.innerHTML = genererContenuErreursFr();
        }
        const ancreTampons = document.getElementById('annot-tampons-contenu');
        if (ancreTampons) {
            ancreTampons.innerHTML = genererContenuTampons();
        }

        // Fallback flottant (vue côte-à-côte)
        if (!ancreErrFr && document.getElementById('travaux-palette-erreurs-fr')) {
            fermerPaletteErreursFrancais();
            togglePaletteErreursFrancais();
        }
        if (!ancreTampons && document.getElementById('travaux-palette-tampons')) {
            fermerPaletteAutocollants();
            togglePaletteAutocollants();
        }
    }

    /* ===============================
       FLECHE POINTES (4 modes)
       =============================== */

    function getFlechePointes() { return flechePointes; }

    function setFlechePointes(val) {
        if (['fin', 'debut', 'double', 'aucune'].indexOf(val) === -1) val = 'fin';
        flechePointes = val;
        window.dispatchEvent(new CustomEvent('travaux-fleche-pointes-change', { detail: { pointes: flechePointes } }));
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

    function changerModeSyntheseErrFr(mode) {
        db.setSync('errfrModeSynthese', mode);
    }

    function obtenirModeSyntheseErrFr() {
        return db.getSync('errfrModeSynthese', 'principale');
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
        // Contenu réutilisable (colonne droite + flottant)
        genererContenuErreursFr: genererContenuErreursFr,
        genererContenuTampons: genererContenuTampons,
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
        ajouterTamponRetroObs: ajouterTamponRetroObs,
        supprimerTamponRetroObs: supprimerTamponRetroObs,
        ajouterSymboleRetroObs: ajouterSymboleRetroObs,
        supprimerSymboleRetroObs: supprimerSymboleRetroObs,
        ajouterCategorieRetroObs: ajouterCategorieRetroObs,
        supprimerCategorieRetroObs: supprimerCategorieRetroObs,
        exporterTampons: exporterTampons,
        importerTampons: importerTampons,
        confirmerImportTampons: confirmerImportTampons,
        reinitialiserRetroErreursFr: reinitialiserRetroErreursFr,
        // Personnalisations (noms, icônes, couleurs)
        appliquerPersonnalisations: appliquerPersonnalisations,
        obtenirCouleurCategorieAutocollant: obtenirCouleurCategorieAutocollant,
        // Epaisseur increments
        incrementerEpaisseur: incrementerEpaisseur,
        decrementerEpaisseur: decrementerEpaisseur,
        // Fleche pointes (4 modes)
        getFlechePointes: getFlechePointes,
        setFlechePointes: setFlechePointes,
        // Contexte Modelisation
        setMasquerErreursFrancais: setMasquerErreursFrancais,
        // Catégories tampons (noms, ordre)
        obtenirNomsCategories: obtenirNomsCategories,
        obtenirOrdreCategories: obtenirOrdreCategories,
        // Ordre personnalisé des erreurs FR
        obtenirOrdreErreursFr: obtenirOrdreErreursFr,
        // Mode synthèse erreurs FR (principale / toutes)
        changerModeSyntheseErrFr: changerModeSyntheseErrFr,
        obtenirModeSyntheseErrFr: obtenirModeSyntheseErrFr
    };

})();
