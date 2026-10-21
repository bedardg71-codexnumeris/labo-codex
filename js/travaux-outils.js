/* ===============================
   MODULE: TRAVAUX - OUTILS D'ANNOTATION
   Definitions des outils (stylo, surligneur, texte, formes)
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

    /**
     * BACKLOG #287 (28 mai 2026) — Picker couleur custom réutilisable.
     * Génère un <details> HTML5 (toggle natif) + popover absolute avec grille
     * des 12 couleurs prédéfinies + bouton « Personnalisé » qui rouvre le
     * picker natif macOS pour les couleurs hors palette. L'<input type="color">
     * d'origine reste présent en hidden : il continue de porter les
     * `data-*` du caller pour la sauvegarde, et reçoit AUSSI à chaque
     * sélection grille un event `input` ET un event `change` dispatchés
     * manuellement — afin de couvrir à la fois les listeners directs
     * `addEventListener('input', ...)` (tampons) ET le dispatcher global
     * `data-on-change` du projet (échelles).
     *
     * @param {string} couleurCourante - hex (#rrggbb)
     * @param {object} opts
     *   - dataAttrs: {key: val} — attributs `data-*` à poser sur l'input hidden
     *   - summaryClass: 'travaux-retro-couleur' (def) | 'travaux-retro-numero' | autre
     *   - summaryContent: contenu HTML du <summary> (numéro p.ex.)
     *   - dataPastilleId: id à exposer en data-pastille-id sur le summary
     *   - inputExtra: chaîne HTML ajoutée à l'input hidden (rare)
     * @returns {string} HTML : <details>...</details><input type="color" hidden>
     */
    var _compteurPickerCouleur = 0;
    function renderPickerCouleur(couleurCourante, opts) {
        opts = opts || {};
        // Essai iPad de Grégoire sur 1.114.0 : « Personnalisé… » ne faisait rien.
        // Il réveillait l'input caché (0 × 0, opacité nulle) par `click()`, que
        // iPadOS peut refuser. Une ÉTIQUETTE liée à l'input, elle, est activée
        // par le navigateur lui-même, au doigt comme à la souris — d'où un id.
        var inputId = 'travaux-couleur-perso-' + (++_compteurPickerCouleur);
        var summaryClass = opts.summaryClass || 'travaux-retro-couleur';
        var summaryContent = opts.summaryContent || '';
        // #467 — catégories et couleurs viennent aussi d'un fichier de tampons importé.
        var couleurHtml = echapperHtml(couleurCourante || '');
        var dataPastilleAttr = opts.dataPastilleId ? ' data-pastille-id="' + echapperHtml(opts.dataPastilleId) + '"' : '';
        var inputDataAttrs = '';
        if (opts.dataAttrs) {
            Object.keys(opts.dataAttrs).forEach(function(key) {
                inputDataAttrs += ' data-' + key + '="' + echapperHtml(opts.dataAttrs[key]) + '"';
            });
        }
        var inputExtra = opts.inputExtra || '';
        var couleurLower = (couleurCourante || '').toLowerCase();
        var grille = COULEURS.map(function(c) {
            var actif = (c.hex.toLowerCase() === couleurLower) ? ' actif' : '';
            return '<button type="button" class="travaux-btn-couleur' + actif + '" '
                 + 'style="background:' + c.hex + '" '
                 + 'data-couleur="' + c.hex + '" '
                 + 'data-action="travauxOutils.choisirCouleurPalette" '
                 + 'title="' + c.nom + '"></button>';
        }).join('');
        return '<details class="travaux-retro-couleur-picker">'
             +   '<summary class="' + summaryClass + '" style="background:' + couleurHtml + ';"' + dataPastilleAttr + ' title="Changer la couleur">' + summaryContent + '</summary>'
             +   '<div class="travaux-retro-couleur-popover">'
             +     '<div class="travaux-retro-couleur-grille">' + grille + '</div>'
             +     '<label class="travaux-btn-couleur-perso" for="' + inputId + '">Personnalisé&hellip;</label>'
             +   '</div>'
             + '</details>'
             + '<input type="color" class="travaux-retro-couleur-input" id="' + inputId + '"'
             +   inputDataAttrs
             +   inputExtra
             +   ' value="' + couleurHtml + '">';
    }

    /**
     * Handler clic sur une couleur de la grille : sync l'input hidden frère
     * + ferme le picker. Dispatch des events `input` ET `change` pour
     * couvrir à la fois les listeners directs (tampons, l. ≈ 2335) ET le
     * dispatcher `data-on-change` du projet (échelles, modifierNiveau*).
     */
    function choisirCouleurPalette(el) {
        if (!el) return;
        var couleur = el.getAttribute('data-couleur');
        if (!couleur) return;
        var details = el.closest('details');
        if (!details) return;
        var input = details.parentNode.querySelector('input[type="color"]');
        if (!input) return;
        input.value = couleur;
        // Essai iPad de Grégoire sur 1.114.0 : « les couleurs ne se sélectionnent
        // pas ». Elles s'écrivaient, mais rien ne repeignait la pastille — seul
        // l'écran de réglage le faisait, par un câblage à lui. C'est l'événement
        // `input` dispatché ci-dessous qui la repeint désormais, pour tous les
        // sélecteurs et les deux chemins (pastille, sélecteur natif) : un seul.
        // Déclencher input + change pour réactiver les sync existants (input :
        // listeners directs tampons ; change : dispatcher data-on-change échelles).
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        // Fermer le picker
        details.open = false;
    }

    // Toute couleur reçue par l'input d'un sélecteur — pastille cliquée ou
    // sélecteur natif (« Personnalisé… ») — repeint sa pastille (le <summary>)
    // et marque la pastille active. Pour tous les sélecteurs, sans câblage par
    // écran : une définition.
    document.addEventListener('input', function(e) {
        var input = e.target;
        if (!input || !input.matches || !input.matches('input.travaux-retro-couleur-input')) return;
        var details = input.parentNode && input.parentNode.querySelector('details.travaux-retro-couleur-picker');
        if (!details) return;
        var pastille = details.querySelector('summary');
        if (pastille) pastille.style.background = input.value;
        details.querySelectorAll('.travaux-btn-couleur').forEach(function(b) {
            b.classList.toggle('actif', (b.getAttribute('data-couleur') || '').toLowerCase() === String(input.value).toLowerCase());
        });
    }, true);
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

    var ICONS_DIR = 'icons/';

    const OUTILS = {
        position: {
            id: 'position',
            nom: 'Position',
            icone: '<img src="' + ICONS_DIR + 'icon-drag.svg" alt="Position" class="outil-svg-icon">',
            curseur: 'move',
            type: 'position'
        },
        selection: {
            id: 'selection',
            nom: 'S\u00e9lection',
            icone: '<img src="' + ICONS_DIR + 'icon-move-right.svg" alt="S\u00e9lection" class="outil-svg-icon">',
            curseur: 'grab',
            type: 'selection'
        },
        stylo: {
            id: 'stylo',
            nom: 'Stylo',
            icone: '<img src="' + ICONS_DIR + 'icon-pencil.svg" alt="Stylo" class="outil-svg-icon">',
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
            icone: '<img src="' + ICONS_DIR + 'icon-marker-pen.svg" alt="Surligneur" class="outil-svg-icon">',
            curseur: 'crosshair',
            type: 'surligneur',
            epaisseurDefaut: 20,
            epaisseurMin: 10,
            epaisseurMax: 40,
            opacite: 0.5,
            composite: 'multiply'
        },
        texte: {
            id: 'texte',
            nom: 'Texte',
            icone: '<img src="' + ICONS_DIR + 'icon-text.svg" alt="Texte" class="outil-svg-icon">',
            curseur: 'text',
            tailleDefaut: 14,
            tailleMin: 10,
            tailleMax: 32
        },
        cercle: {
            id: 'cercle',
            nom: 'Cercle',
            icone: '<img src="' + ICONS_DIR + 'icon-circle.svg" alt="Cercle" class="outil-svg-icon">',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        fleche: {
            id: 'fleche',
            nom: 'Ligne',
            icone: '<img src="' + ICONS_DIR + 'icon-line.svg" alt="Ligne" class="outil-svg-icon">',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        rectangle: {
            id: 'rectangle',
            nom: 'Rectangle',
            icone: '<img src="' + ICONS_DIR + 'icon-square.svg" alt="Rectangle" class="outil-svg-icon">',
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
            icone: '<img src="' + ICONS_DIR + 'icon-squiggly-line.svg" alt="Vague" class="outil-svg-icon">',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        pointille: {
            id: 'pointille',
            nom: 'Pointill\u00e9',
            icone: '<img src="' + ICONS_DIR + 'icon-dashed-line.svg" alt="Pointill\u00e9" class="outil-svg-icon">',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            tirets: [6, 4]
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
    };

    // 3 sept. 2026 — LES CODES D'ERREUR SONT GÉNÉRÉS depuis la liste courante
    // (`codesAnnotation`, js/codes-annotation.js) : les dix du repli au chargement,
    // ceux de la grille de la copie dès qu'une copie est ouverte
    // (`_regenererOutilsCodes`). Une seule source pour l'identifiant, le nom et
    // la couleur. Plus d'icône Unicode ①…⑩ : aucun chemin ne la lisait — le
    // curseur, la copie et le PDF DESSINENT le nombre. Sans le module (bancs Node
    // qui ne chargent que ce fichier), aucun code : rien ne casse.
    _regenererOutilsCodes();

    /* ===============================
       AUTOCOLLANTS (Tampons de retroaction)
       =============================== */

    const DOSSIER_AUTOCOLLANTS = 'autocollants/';

    const AUTOCOLLANTS = [
        // --- Action (RLO) (6) ---
        // Les fichiers PNG conservent leur nom physique `contenu-*.png` — le mapping vit ici.
        { id: 'action-reperage',     nom: 'Rep\u00e9rage', fichier: 'icons8-check-mark.svg',   categorie: 'action' },
        { id: 'action-liaison',      nom: 'Liaison',      fichier: 'icons8-verified-account.svg', categorie: 'action' },
        { id: 'action-ouverture',    nom: 'Ouverture',    fichier: 'icons8-approval.svg',      categorie: 'action' },
        { id: 'action-incertain',    nom: 'Incertain',    fichier: 'icons8-help.svg',          categorie: 'action' },
        { id: 'action-incomplet',    nom: 'Incomplet',    fichier: 'icons8-in-progress.svg',   categorie: 'action' },
        { id: 'action-inexact',      nom: 'Inexact',      fichier: 'icons8-cancel.svg',        categorie: 'action' },
        // --- Compréhension (4) ---
        { id: 'comp-uni',            nom: 'Unistructurel',   fichier: 'solo/comprehension-uni.svg',         categorie: 'comprehension' },
        { id: 'comp-multi',          nom: 'Multistructurel', fichier: 'solo/comprehension-multi.svg',       categorie: 'comprehension' },
        { id: 'comp-relationnel',    nom: 'Relationnel',  fichier: 'solo/comprehension-relationnel.svg', categorie: 'comprehension' },
        { id: 'comp-etendu',         nom: '\u00c9tendu',       fichier: 'solo/comprehension-etendu.svg',      categorie: 'comprehension' },
        // --- Observations (12) ---
        { id: 'obs-approfondir',     nom: 'Approfondir',      fichier: 'icons8-construction.svg',       categorie: 'observations' },
        { id: 'obs-attention',       nom: 'Attention',         fichier: 'icons8-high-risk.svg',          categorie: 'observations' },
        { id: 'obs-confusion',       nom: 'Confusion',         fichier: 'icons8-confusion-avec-pointe.svg', categorie: 'observations' },
        { id: 'obs-hoc',             nom: 'Id. directrice',    fichier: 'icons8-development-skill.svg', categorie: 'observations' },
        { id: 'obs-integration',     nom: 'Int\u00e9gration',  fichier: 'icons8-communication.svg',     categorie: 'observations' },
        { id: 'obs-mecanisme',       nom: 'Id. principale',    fichier: 'icons8-gears.svg',         categorie: 'observations' },
        { id: 'obs-procede',         nom: 'Id. secondaire',    fichier: 'icons8-advanced-search.svg', categorie: 'observations' },
        { id: 'obs-relation',        nom: 'Relation',          fichier: 'icons8-link.svg',              categorie: 'observations' },
        { id: 'obs-repetition',      nom: 'R\u00e9p\u00e9tition', fichier: 'icons8-refresh.svg',           categorie: 'observations' },
        { id: 'obs-rupture',         nom: 'Rupture',           fichier: 'icons8-broken-link.svg',       categorie: 'observations' },
        { id: 'obs-sans-preuve',     nom: 'Sans preuve',       fichier: 'icons8-delete-message.svg',    categorie: 'observations' },
        { id: 'obs-soupcon',         nom: 'Soup\u00e7on IA',        fichier: 'icons8-science-fiction.svg',    categorie: 'observations' },
        { id: 'obs-longueur',        nom: 'Détour',            fichier: 'icons8-squiggly-arrow.svg',    categorie: 'observations' },
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
        { id: 'attention',      nom: 'Attention',        fichier: 'attention.png',                              categorie: 'diagnostic', legacy: true },
        // --- Jetons (#240) : tampons texte ROUGE MAJUSCULE, appos\u00e9s en cliquant le mot du
        //     jeton dans le formulaire d'\u00e9valuation. Pas de fichier image : rendus en texte
        //     (cf. dessinerAutocollant). `categorie: 'jeton'` les exclut de la palette tampons
        //     (qui ne rend que action/comprehension/observations + perso). `jetonType` mappe
        //     vers la checkbox \u00e0 cocher automatiquement apr\u00e8s apposition.
        { id: 'jeton-delai',          nom: 'Jeton de d\u00e9lai',          texteTampon: 'JETON DE D\u00c9LAI',          categorie: 'jeton', jetonType: 'delai' },
        { id: 'jeton-reprise',        nom: 'Jeton de reprise',        texteTampon: 'JETON DE REPRISE',        categorie: 'jeton', jetonType: 'reprise' }
        // #563 (29 août 2026) : le tampon « JETON DE REPRISE CIBLÉE » est retiré avec la
        // case qu'il cochait — un tampon qui n'applique plus rien n'a pas à exister.
    ];

    // Map jetonType (delai/reprise/repriseCiblee) -> id d'autocollant texte (#240).
    const TAMPONS_JETON_PAR_TYPE = {
        delai: 'jeton-delai',
        reprise: 'jeton-reprise',
        repriseCiblee: 'jeton-reprise-ciblee'
    };

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
            if (!a.fichier) return; // Tampons personnalisés sans fichier image
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
     * Retourne l'objet autocollant du catalogue (ou null). #240 : utilisé par
     * l'annotation pour détecter un tampon texte (`texteTampon`) vs image.
     * @param {string} id - ID de l'autocollant
     * @returns {Object|null}
     */
    function getAutocollant(id) {
        return AUTOCOLLANTS.find(function(a) { return a.id === id; }) || null;
    }

    /**
     * #240 — Active le mode tampon pour le jeton donné (delai/reprise/repriseCiblee).
     * Apposé sur le travail annoté, ce tampon texte coche automatiquement la checkbox
     * du jeton (cf. poserAutocollant dans travaux-annotation.js).
     * @param {string} jetonType - 'delai' | 'reprise' | 'repriseCiblee'
     */
    function activerTamponJeton(jetonType) {
        const id = TAMPONS_JETON_PAR_TYPE[jetonType];
        if (!id) {
            console.warn('[Travaux-Outils] Type de jeton inconnu pour le tampon :', jetonType);
            return;
        }
        setAutocollantActif(id);
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
            majEtatBtnToggle('btn-toggle-tampons', false);
            return;
        }

        paletteAutoVisible = true;
        palette = document.createElement('div');
        palette.id = 'travaux-palette-tampons';
        palette.className = 'palette-flottante';

        // Barre de titre
        let html = '<div class="palette-flottante-barre">';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.ouvrirEditionRetroObservations" title="Personnaliser"><img src="' + ICONS_DIR + 'icon-gear.svg" alt="" class="outil-svg-icon palette-toggle-icon"></button>';
        html += '<span class="palette-flottante-titre"><span class="palette-grip" aria-hidden="true" title="Glisser pour déplacer">⠿</span>Tampons</span>';
        html += '<div style="display:flex; gap:2px;">';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.layoutPaletteH" data-param="travaux-palette-tampons" title="Disposition horizontale">\u2194</button>';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.layoutPaletteV" data-param="travaux-palette-tampons" title="Disposition verticale">\u2195</button>';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.togglePaletteTamponsReplie" title="Replier/D\u00e9plier">\u2212</button>';
        html += '</div></div>';

        // Contenu (réutilise la fonction partagée)
        html += '<div class="palette-flottante-contenu" id="travaux-tampons-contenu">';
        html += genererContenuTampons();
        html += '</div>';

        palette.innerHTML = html;

        // Insérer dans le layout annotation — bas à droite, moitié inférieure
        const layout = document.getElementById('travaux-zone-canvas') || document.getElementById('travaux-conteneur-document');
        if (layout) {
            palette.style.top = 'calc(50% + 6px)';
            palette.style.right = '12px';
            palette.style.left = 'auto';
            palette.style.height = 'calc(50% - 18px)';
            layout.appendChild(palette);
            configurerDragPalette(palette, layout);
        }
        majEtatBtnToggle('btn-toggle-tampons', true);
    }

    /**
     * Replier/deplier la palette tampons
     */
    function togglePaletteTamponsReplie() {
        const palette = document.getElementById('travaux-palette-tampons');
        if (!palette) return;
        palette.classList.toggle('replie');
        var btns = palette.querySelectorAll('.palette-flottante-barre .palette-flottante-toggle');
        var btn = btns[btns.length - 1];
        if (btn) btn.textContent = palette.classList.contains('replie') ? '+' : '\u2212';
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

    // 3 sept. 2026 — LA LISTE DES CODES VIENT DE `codesAnnotation`
    // (js/codes-annotation.js, chargé avant ce module). La constante des dix
    // codes n'existe plus ici : les dix codes d'hier sont le REPLI du module, et
    // une grille dont le critère algorithmique porte le geste d'activation
    // fournit les siens — ses sous-critères. Ce fichier ne garde que l'ÉCRAN qui
    // règle le repli (noms, couleurs, ordre, textes : quatre clés globales) et
    // la palette.
    //   _codesRepli()     les dix, personnalisés — l'écran de réglage, les défauts
    //   _codesCourants()  ceux de la copie ouverte (sa grille, sinon le repli)
    // `_grilleCourante` est posée à l'ouverture d'une copie (lot 2) ; nulle, la
    // palette montre le repli — exactement hier.
    var _grilleCourante = null;
    function _codes() {
        return (typeof window !== 'undefined' && window.codesAnnotation) ? window.codesAnnotation : null;
    }
    function _codesRepli() { var t = _codes(); return t ? t.listeCodes(null) : []; }
    function _codesCourants() { var t = _codes(); return t ? t.listeCodes(_grilleCourante) : []; }

    /**
     * Consigne du 3 sept. 2026 (16 h) — UNE SEULE SOURCE PAR COPIE, ET L'ÉCRAN LE
     * DIT. Règle arrêtée par Grégoire : les paramètres de la palette sont
     * indépendants de la grille ; mais quand une grille algorithmique a coché
     * « Utiliser ces sous-critères comme codes d'annotation », ils sont en
     * LECTURE SEULE, et la source est la grille. La copie ouverte est alors
     * GOUVERNÉE : l'engrenage de la palette porte la phrase ci-dessous et
     * l'écran de réglage qu'il ouvre n'offre qu'elle (coup d'œil de Grégoire :
     * pas de bandeau dans l'espace de travail). ⛔ L'édition du REPLI n'est pas
     * retirée : les dix codes portent les noms courts, couleurs et ordre de
     * Grégoire, et c'est ici la seule façon de les régler.
     */
    function _copieGouvernee() {
        var t = _codes();
        return !!(t && _grilleCourante && t.estActive(_grilleCourante));
    }

    /** La phrase de Grégoire, telle quelle. « X » est le NOM de la grille, jamais un identifiant. */
    function _phraseSourceCodes() {
        var nom = (_grilleCourante && typeof _grilleCourante.nom === 'string') ? _grilleCourante.nom.trim() : '';
        return 'Les codes de cette copie viennent de sa grille « ' + (nom || 'sans nom') + ' ». Pour les modifier, ouvre la grille.';
    }

    /** Les entrées `errfr_*` d'OUTILS suivent la liste courante — et rien d'autre n'y reste. */
    function _regenererOutilsCodes() {
        Object.keys(OUTILS).forEach(function(k) { if (k.indexOf('errfr_') === 0) delete OUTILS[k]; });
        _codesCourants().forEach(function(t) {
            OUTILS[t.id] = { id: t.id, nom: t.nom, couleurBouton: t.couleur, curseur: 'crosshair', type: 'symbole', taille: 24 };
        });
    }

    /**
     * Lot 2 (3 sept. 2026) — la copie ouverte impose sa grille. Appelé à
     * `travaux-fichier-ouvert` (visionneuse) avec la grille résolue par
     * `codesAnnotation.grilleDeCopie` — copie orpheline, grille sans geste ou
     * introuvable : null, donc le repli — et à `travaux-fichier-ferme` avec null.
     * Régénère les outils, invalide les curseurs (le numéro d'un même code peut
     * changer d'une grille à l'autre), rend la palette et les compteurs. Un code
     * actif que la liste ne connaît plus laisse la place au stylo.
     */
    function _poserGrilleCourante(grille) {
        _grilleCourante = grille || null;
        _regenererOutilsCodes();
        invaliderCacheCurseurs();
        if (typeof outilActif === 'string' && outilActif.indexOf('errfr_') === 0 && !OUTILS[outilActif]) {
            setOutilActif('stylo');
        }
        rafraichirPalettesApresPersonnalisation();
        mettreAJourCompteursErreurs();
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('travaux-fichier-ouvert', function(e) {
            var t = _codes();
            var fichier = (e && e.detail) ? e.detail.fichier : null;
            _poserGrilleCourante(t ? t.grilleDeCopie(fichier) : null);
        });
        window.addEventListener('travaux-fichier-ferme', function() { _poserGrilleCourante(null); });
    }

    // Valeurs par defaut des symboles (crochet/croix/interrogation)
    const _defautsSymboles = {
        crochet:       { nom: 'Crochet',       couleur: '#2e7d32', icone: '\u2714\uFE0E' },
        croix:         { nom: 'Croix',          couleur: '#c62828', icone: '\u2718' },
        interrogation: { nom: 'Interrogation',  couleur: '#e65100', icone: '?' }
    };

    // Sauvegarder les valeurs par defaut des erreurs FR avant toute personnalisation
    const _defautsNomsErrFr = {};
    const _defautsCouleursErrFr = {};
    (_codes() ? _codes().REPLI_DEFAUT : []).forEach(r => {
        _defautsNomsErrFr[r.id] = r.nom;
        _defautsCouleursErrFr[r.id] = r.couleur;
    });

    /* ===============================
       RETROACTIONS PAR DEFAUT (Observations + Erreurs FR)
       =============================== */

    const RETROACTIONS_OBSERVATIONS_DEFAUT = {
        // === Actions (RLO + qualité du raisonnement) ===
        'action-reperage':    "L'étudiant·e repère un élément, le nomme correctement, le restitue avec exactitude.",
        'action-liaison':     "L'étudiant·e infère, relie des éléments entre eux, interprète.",
        'action-ouverture':   "L'étudiant·e transfère à d'autres contextes, généralise, dépasse le cadre immédiat.",
        'action-incertain':   "L'explication ou le raisonnement est ambigu.",
        'action-incomplet':   "L'explication ou le raisonnement est inachevé.",
        'action-inexact':     "L'explication ou le raisonnement comporte une erreur factuelle.",

        // === Observations ===
        'obs-hoc':            "L'idée directrice n'est pas adéquatement identifiée.",
        'obs-mecanisme':      "L'idée principale n'est pas adéquatement identifiée ou expliquée.",
        'obs-procede':        "L'idée secondaire n'est pas adéquatement identifiée ou expliquée.",
        'obs-relation':       "Les idées sont logiquement liées.",
        'obs-rupture':        "Des idées distinctes sont juxtaposées sans lien logique entre elles.",
        'obs-approfondir':    "L'idée a un potentiel à développer davantage.",
        'obs-longueur':       "L'idée nécessite de la synthèse et de la concision.",
        'obs-confusion':      "Plusieurs idées sont entremêlées dans une même explication sans relations explicites.",
        'obs-repetition':     "L'idée est exprimée à plusieurs reprises sans approfondissement.",
        'obs-sans-preuve':    "L'idée n'est pas soutenue par une preuve.",
        'obs-integration':    "La preuve n'est pas syntaxiquement ou grammaticalement intégrée dans l'explication.",
        'obs-attention':      "L'idée est une généralisation, un jugement de valeur ou un biais.",
        'obs-soupcon':        "Il y a un soupçon d'utilisation non permise de l'intelligence artificielle.",

        // === Compréhension (niveaux SOLO) ===
        'comp-uni':           "Quelques concepts sont identifiés isolément.",
        'comp-multi':         "Les concepts sont multiples mais isolés.",
        'comp-relationnel':   "Les concepts sont multiples et reliés.",
        'comp-etendu':        "Les concepts sont intégrés et étendus à d'autres contextes."
    };

    // 3 sept. 2026 — les rétroactions par défaut des dix codes ont été DÉPLACÉES
    // dans js/codes-annotation.js (`RETROACTIONS_DEFAUT`), texte pour texte.

    /* ===============================
       LECTURE / ECRITURE RETROACTIONS PERSONNALISEES
       (Stockage NON-namespacé — indépendant du semestre)
       =============================== */

    function obtenirRetroactionsObservations() {
        return db.getSync('retroactionsObservations', null) || RETROACTIONS_OBSERVATIONS_DEFAUT;
    }

    function obtenirRetroactionsErreursFr() {
        return db.getSync('retroactionsErreursFr', null) || (_codes() ? _codes().RETROACTIONS_DEFAUT : {});
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
        action: 'Action',
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

    var CATEGORIES_BUILTIN = ['action', 'comprehension', 'observations'];

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

            }
        }
    })();

    // =========================================================================
    // MIGRATION RLO — IDs `contenu-*` → `action-*` (chantier 4, avril 2026)
    // =========================================================================
    // Renomme les 6 tampons de la catégorie Contenu/méthode pour refléter la
    // terminologie officielle (Repérage, Liaison, Ouverture + les 3 en difficulté).
    // Parcourt toutes les annotations de tous les semestres et réécrit les
    // `autocollantId` stockés. Renomme aussi les personnalisations de catégorie
    // (noms, ordres, couleurs) de `contenu` vers `action`.
    //
    // Idempotente : protégée par le flag `migrationRLO_ids_v1_done`.
    // S'exécute au démarrage après `db-ready` (certaines annotations volumineuses
    // vivent dans memoryCache chargé par syncToLocalStorageCache).

    const CLE_FLAG_MIGRATION_RLO = 'migrationRLO_ids_v1_done';

    const MAP_IDS_RLO = {
        'contenu-exact':     'action-reperage',
        'contenu-bien':      'action-liaison',
        'contenu-tres-bien': 'action-ouverture',
        'contenu-incertain': 'action-incertain',
        'contenu-incomplet': 'action-incomplet',
        'contenu-inexact':   'action-inexact'
    };

    function migrerIdsActionsRLO() {
        try {
            if (db.getSync(CLE_FLAG_MIGRATION_RLO, false) === true) return;

            var stickersMigres = 0;
            var clesAnnotationsMigrees = 0;

            // 1. Annotations : parcourir toutes les clés *annotationsTravaux
            //    (namespacées par semestre : h2026_annotationsTravaux, a2025_..., etc.)
            var clesStockage = new Set(Object.keys(localStorage));
            if (db && db.memoryCache && typeof db.memoryCache.keys === 'function') {
                var iter = db.memoryCache.keys();
                var suivant = iter.next();
                while (!suivant.done) {
                    clesStockage.add(suivant.value);
                    suivant = iter.next();
                }
            }

            clesStockage.forEach(function(cleStockage) {
                if (!cleStockage || cleStockage.indexOf('annotationsTravaux') === -1) return;
                var annotations = db.getSync(cleStockage, null);
                if (!Array.isArray(annotations)) return;

                var modifiee = false;
                annotations.forEach(function(annotation) {
                    if (!annotation || !annotation.pages || typeof annotation.pages !== 'object') return;
                    Object.keys(annotation.pages).forEach(function(numPage) {
                        var page = annotation.pages[numPage];
                        if (!page || !Array.isArray(page.stickers)) return;
                        page.stickers.forEach(function(sticker) {
                            if (sticker && sticker.autocollantId && MAP_IDS_RLO[sticker.autocollantId]) {
                                sticker.autocollantId = MAP_IDS_RLO[sticker.autocollantId];
                                modifiee = true;
                                stickersMigres++;
                            }
                        });
                    });
                });

                if (modifiee) {
                    db.setSync(cleStockage, annotations);
                    clesAnnotationsMigrees++;
                }
            });

            // 2. Noms de catégories personnalisés : renommer la clé `contenu` en `action`
            var noms = db.getSync('nomsCategoriesTampons', null);
            if (noms && typeof noms === 'object' && 'contenu' in noms) {
                if (!('action' in noms)) noms.action = noms.contenu;
                delete noms.contenu;
                db.setSync('nomsCategoriesTampons', noms);
            }

            // 3. Ordre des tampons dans la catégorie : renommer la clé + remapper les IDs
            var ordreCat = db.getSync('ordreAutocollants_contenu', null);
            if (Array.isArray(ordreCat)) {
                var nouvelOrdre = ordreCat.map(function(id) { return MAP_IDS_RLO[id] || id; });
                // Ne pas écraser un ordre déjà défini pour `action` (peu probable mais sûr)
                if (db.getSync('ordreAutocollants_action', null) === null) {
                    db.setSync('ordreAutocollants_action', nouvelOrdre);
                }
                db.removeSync('ordreAutocollants_contenu');
            }

            // 4. Couleurs de catégorie : renommer la clé interne
            var couleurs = db.getSync('couleursCategories', null);
            if (couleurs && typeof couleurs === 'object' && 'contenu' in couleurs) {
                if (!('action' in couleurs)) couleurs.action = couleurs.contenu;
                delete couleurs.contenu;
                db.setSync('couleursCategories', couleurs);
            }

            // 5. Ordre des catégories : remplacer `contenu` par `action` dans la liste
            var ordreCats = db.getSync('ordreCategories', null);
            if (Array.isArray(ordreCats)) {
                var iContenu = ordreCats.indexOf('contenu');
                if (iContenu !== -1) {
                    if (ordreCats.indexOf('action') === -1) {
                        ordreCats[iContenu] = 'action';
                    } else {
                        ordreCats.splice(iContenu, 1);
                    }
                    db.setSync('ordreCategories', ordreCats);
                }
            }

            // 6. Catégories masquées : remplacer `contenu` par `action`
            var catsMasquees = db.getSync('categoriesMasquees', null);
            if (Array.isArray(catsMasquees)) {
                var iCM = catsMasquees.indexOf('contenu');
                if (iCM !== -1) {
                    if (catsMasquees.indexOf('action') === -1) {
                        catsMasquees[iCM] = 'action';
                    } else {
                        catsMasquees.splice(iCM, 1);
                    }
                    db.setSync('categoriesMasquees', catsMasquees);
                }
            }

            // 7. Éléments masqués : remapper les IDs `contenu-*` → `action-*`
            var elemMasques = db.getSync('elementsMasques', null);
            if (Array.isArray(elemMasques)) {
                var elemModifie = false;
                for (var iE = 0; iE < elemMasques.length; iE++) {
                    if (MAP_IDS_RLO[elemMasques[iE]]) {
                        elemMasques[iE] = MAP_IDS_RLO[elemMasques[iE]];
                        elemModifie = true;
                    }
                }
                if (elemModifie) db.setSync('elementsMasques', elemMasques);
            }

            // 8. Raccourcis clavier : renommer les clés `contenu-*` → `action-*`
            var racc = db.getSync('raccourcisAnnotation', null);
            if (racc && typeof racc === 'object') {
                var raccModifie = false;
                Object.keys(MAP_IDS_RLO).forEach(function(ancien) {
                    if (ancien in racc) {
                        var nouveau = MAP_IDS_RLO[ancien];
                        if (!(nouveau in racc)) racc[nouveau] = racc[ancien];
                        delete racc[ancien];
                        raccModifie = true;
                    }
                });
                if (raccModifie) db.setSync('raccourcisAnnotation', racc);
            }

            db.setSync(CLE_FLAG_MIGRATION_RLO, true);
            // Silencieux sur installation vierge (0 sticker à migrer).
            if (stickersMigres > 0 || clesAnnotationsMigrees > 0) {
                console.warn('[travaux-outils] Migration RLO effectuée. Stickers migrés : '
                    + stickersMigres + ' (dans ' + clesAnnotationsMigrees + ' clé(s) d\'annotations)');
            }
        } catch (e) {
            console.error('[travaux-outils] Erreur pendant la migration RLO :', e);
        }
    }

    // Hook de démarrage : attendre que db soit prêt (certaines annotations peuvent
    // vivre uniquement dans memoryCache, chargé par syncToLocalStorageCache).
    //
    // ⚠ #414 (8 août 2026) : la garde était `db.ready` — vrai dès la fin
    // d'`init()`, soit avant que `syncToLocalStorageCache()` ait hydraté
    // `memoryCache`. C'est exactement la condition que le commentaire ci-dessus
    // cherchait à éviter : les annotations volumineuses vivant en IDB seul
    // étaient invisibles, la migration les sautait, et son drapeau
    // `migrationRLO_ids_v1_done` fermait la porte définitivement.
    window.auDbPret(migrerIdsActionsRLO);

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

    // #760 — Titres des catégories que les réglages ne nomment pas : les anciens
    // tampons (copies annotées avant le catalogue actuel) et un tampon que le
    // catalogue ne connaît plus (tampon personnel supprimé depuis).
    const NOMS_CATEGORIES_HORS_REGLAGES = {
        qualite: 'Qualité',
        diagnostic: 'Diagnostic',
        autres: 'Autres tampons'
    };

    /**
     * #760 (24 sept. 2026) — CE QUE L'ÉLÈVE LIT DES TAMPONS D'UNE COPIE : le seul
     * lecteur. La rétroaction générale (bloc « Observations »), la spécifique et le
     * PDF de synthèse le lisent ; chacun ne garde que sa mise en forme.
     *
     * Les réglages sont relus À CHAQUE APPEL (« les observations reposent sur les
     * paramètres actualisés », Grégoire, 24 sept.) : tampons personnels, noms,
     * textes, catégories personnelles, leurs noms et leur ordre. `AUTOCOLLANTS`
     * n'est pas la source : il n'est rafraîchi qu'au chargement du module et à
     * l'enregistrement du modal, pas après un import.
     *
     * - Un tampon posé n'est jamais tu : ancien tampon, tampon masqué de la palette,
     *   tampon personnel supprimé depuis (catégorie « autres »).
     * - Les jetons ne sont pas des observations : absents.
     * - Texte : clé PRÉSENTE dans l'objet enregistré → le choix de l'utilisateur,
     *   même vide ; clé ABSENTE → le texte par défaut. `obtenirRetroactionsObservations`
     *   rend l'objet enregistré OU les défauts, jamais leur fusion : un objet
     *   enregistré avant l'ajout d'un tampon n'a pas son texte.
     *
     * @param {Object} comptes - { autocollantId: nombre } (ex. `stats.tampons`)
     * @returns {Array<{id: string, nom: string, tampons: Array<{id: string, nom: string, texte: string, nombre: number}>}>}
     *   Catégories dans l'ordre des réglages (puis les catégories hors réglages),
     *   tampons dans l'ordre de leur catégorie ; seules les catégories utilisées.
     */
    function observationsDesTampons(comptes) {
        if (!comptes || typeof comptes !== 'object') return [];
        const idsJetons = Object.keys(TAMPONS_JETON_PAR_TYPE).map(k => TAMPONS_JETON_PAR_TYPE[k]);

        // Catalogue courant : le catalogue livré, puis les tampons personnels enregistrés.
        const catalogue = {};
        const rangCatalogue = {};
        _defautsAutocollants.forEach(a => { catalogue[a.id] = { id: a.id, nom: a.nom, categorie: a.categorie }; });
        const customs = db.getSync('tamponsPersonnalises', null);
        (Array.isArray(customs) ? customs : []).forEach(c => {
            if (c && c.id && !catalogue[c.id]) {
                catalogue[c.id] = { id: c.id, nom: c.nom || '', categorie: c.categorie || 'diagnostic' };
            }
        });
        Object.keys(catalogue).forEach((id, i) => { rangCatalogue[id] = i; });

        const persObs = obtenirPersonnalisationObservations();
        const textesEnregistres = db.getSync('retroactionsObservations', null);
        const texteDe = (id) => {
            if (textesEnregistres && Object.prototype.hasOwnProperty.call(textesEnregistres, id)) {
                const t = textesEnregistres[id];
                return (t == null) ? '' : String(t);
            }
            return RETROACTIONS_OBSERVATIONS_DEFAUT[id] || '';
        };

        // Les tampons posés, rangés par catégorie.
        const parCategorie = {};
        Object.keys(comptes).forEach(id => {
            const nombre = Number(comptes[id]) || 0;
            if (nombre <= 0) return;
            const def = catalogue[id];
            if ((def && def.categorie === 'jeton') || idsJetons.indexOf(id) !== -1) return;
            const cat = def ? def.categorie : 'autres';
            const nomPerso = persObs[id] && persObs[id].nom;
            (parCategorie[cat] = parCategorie[cat] || []).push({
                id: id,
                nom: nomPerso || (def && def.nom) || id,
                texte: texteDe(id),
                nombre: nombre
            });
        });

        // Ordre des catégories : celui des réglages, puis les autres dans l'ordre du catalogue.
        const ordreCats = obtenirOrdreCategories().slice();
        ['qualite', 'diagnostic'].concat(Object.keys(parCategorie), ['autres']).forEach(cat => {
            if (ordreCats.indexOf(cat) === -1) ordreCats.push(cat);
        });
        const noms = obtenirNomsCategories();
        const catsPerso = obtenirCategoriesPerso();

        const resultat = [];
        ordreCats.forEach(cat => {
            const tampons = parCategorie[cat];
            if (!tampons) return;
            // Ordre des tampons : celui des réglages de la catégorie, puis le catalogue.
            const ordreRegle = db.getSync('ordreAutocollants_' + cat, null);
            const rang = (id) => {
                const r = Array.isArray(ordreRegle) ? ordreRegle.indexOf(id) : -1;
                if (r !== -1) return r;
                return 100000 + (rangCatalogue[id] !== undefined ? rangCatalogue[id] : 100000);
            };
            tampons.sort((a, b) => (rang(a.id) - rang(b.id)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
            const perso = catsPerso.find(c => c && c.id === cat);
            resultat.push({
                id: cat,
                nom: noms[cat] || (perso && perso.nom) || NOMS_CATEGORIES_DEFAUT[cat] || NOMS_CATEGORIES_HORS_REGLAGES[cat] || cat,
                tampons: tampons
            });
        });
        return resultat;
    }

    function obtenirPersonnalisationErreursFr() {
        return db.getSync('personnalisationErreursFr', null) || {};
    }

    function sauvegarderPersonnalisationErreursFr(obj) {
        db.setSync('personnalisationErreursFr', obj);
    }

    // `obtenirOrdreErreursFr` est parti (lot 2) : l'ordre du repli se lit dans
    // `codesAnnotation` (numéro = position), et plus personne ne le lisait ici.
    // `sauvegarderOrdreErreursFr` reste : c'est l'écran de réglage qui l'écrit.

    function sauvegarderOrdreErreursFr(arr) {
        db.setSync('ordreErreursFr', arr);
    }

    /** Les dix du repli, dans l'ordre personnalisé — ce que l'écran de réglage édite. */
    function obtenirCodesOrdonnes() {
        return _codesRepli();
    }

    /* ===============================
       RACCOURCIS CLAVIER ANNOTATION
       =============================== */

    var _raccourcisCache = null;

    /**
     * Retourne le dictionnaire des raccourcis { itemId: touche }.
     * Génère les défauts si la clé n'existe pas encore.
     */
    // Raccourcis par défaut pour les outils/formes (lettres)
    var RACCOURCIS_OUTILS_DEFAUT = {
        position: 'v',     // V = déplacer (View)
        selection: 's',    // S = sélection
        stylo: 'd',        // D = dessiner
        surligneur: 'h',   // H = highlight
        texte: 't',        // T = texte
        cercle: 'o',       // O = ovale
        rectangle: 'r',    // R = rectangle
        fleche: 'l',       // L = ligne
        pointille: 'p',    // P = pointillé
        ondule: 'w'        // W = wave
    };

    function obtenirRaccourcisAnnotation() {
        if (_raccourcisCache) return _raccourcisCache;
        var stored = db.getSync('raccourcisAnnotation', null);
        if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
            // Enrichir avec les raccourcis outils manquants (sans écraser)
            var modifie = false;
            var touchesUtilisees = new Set(Object.values(stored));
            Object.keys(RACCOURCIS_OUTILS_DEFAUT).forEach(function(id) {
                if (!(id in stored)) {
                    var touche = RACCOURCIS_OUTILS_DEFAUT[id];
                    if (!touchesUtilisees.has(touche)) {
                        stored[id] = touche;
                        touchesUtilisees.add(touche);
                        modifie = true;
                    }
                }
            });
            if (modifie) db.setSync('raccourcisAnnotation', stored);
            _raccourcisCache = stored;
            return _raccourcisCache;
        }
        // Générer les défauts : codes 1-9, 0 + outils/formes
        var defauts = {};
        var codes = obtenirCodesOrdonnes();
        codes.forEach(function(c, idx) {
            defauts[c.id] = idx < 9 ? String(idx + 1) : '0';
        });
        Object.keys(RACCOURCIS_OUTILS_DEFAUT).forEach(function(id) {
            defauts[id] = RACCOURCIS_OUTILS_DEFAUT[id];
        });
        // Ne persister les défauts que si IDB a fini de charger.
        // Sinon les raccourcis personnalisés (en IDB) seraient écrasés
        // avant d'avoir été synchronisés en mémoire.
        //
        // ⚠ #414 (8 août 2026) : cette garde était `db.ready` — et ne faisait
        // donc PAS ce que la phrase ci-dessus annonce. `db.ready` passe à vrai
        // à la fin d'`init()`, soit AVANT `syncToLocalStorageCache()` : sur ce
        // créneau, `stored` est vide (les raccourcis personnalisés ne sont
        // encore qu'en IDB), on tombe dans cette branche « générer les défauts »,
        // et on ÉCRASE les raccourcis de l'utilisateur avec les défauts —
        // exactement l'accident que la garde devait empêcher. Seul
        // `window.dbReady` signifie « les données sont lisibles ».
        //
        // Repli sûr quand la DB n'est pas prête : on renvoie les défauts SANS
        // les persister, et l'invalidation du cache à `db-ready` (plus bas)
        // force un recalcul dès que les vraies valeurs sont hydratées.
        if (window.dbReady) {
            db.setSync('raccourcisAnnotation', defauts);
        }
        _raccourcisCache = defauts;
        return _raccourcisCache;
    }

    /**
     * Assigne une touche à un item (ou null pour supprimer le raccourci).
     */
    function definirRaccourci(itemId, touche) {
        var raccourcis = obtenirRaccourcisAnnotation();
        if (touche) {
            // Retirer la touche d'un éventuel ancien item
            Object.keys(raccourcis).forEach(function(id) {
                if (raccourcis[id] === touche) raccourcis[id] = '';
            });
            raccourcis[itemId] = touche;
        } else {
            raccourcis[itemId] = '';
        }
        db.setSync('raccourcisAnnotation', raccourcis);
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('raccourcisAnnotation');   // lot F : geste hors témoin (définir un raccourci)
        _raccourcisCache = raccourcis;
    }

    /**
     * Lookup inverse : touche → itemId (ou null).
     */
    function obtenirItemParTouche(touche) {
        var raccourcis = obtenirRaccourcisAnnotation();
        var ids = Object.keys(raccourcis);
        for (var i = 0; i < ids.length; i++) {
            if (raccourcis[ids[i]] === touche) return ids[i];
        }
        return null;
    }

    /**
     * Retourne la touche assignée à un item (ou null).
     */
    function obtenirRaccourciPourItem(itemId) {
        var raccourcis = obtenirRaccourcisAnnotation();
        return raccourcis[itemId] || null;
    }

    /**
     * Détermine le type d'un item par son ID et l'active.
     * @returns {boolean} true si un item a été activé
     */
    function activerItemParId(itemId) {
        if (!itemId) return false;
        // Code erreur français
        if (itemId.startsWith('errfr_') && OUTILS[itemId]) {
            setOutilActif(itemId);
            return true;
        }
        // Tampon (autocollant)
        if (AUTOCOLLANTS.some(function(a) { return a.id === itemId; })) {
            setAutocollantActif(itemId);
            return true;
        }
        // Outil de dessin
        if (OUTILS[itemId]) {
            setOutilActif(itemId);
            return true;
        }
        return false;
    }

    /**
     * Invalide le cache (après réordonnancement des codes, par ex.)
     */
    function invaliderCacheRaccourcis() {
        _raccourcisCache = null;
    }

    // Quand IDB finit de charger, invalider le cache des raccourcis
    // pour que la prochaine lecture récupère les vrais raccourcis
    // (au lieu des défauts temporaires générés avant le chargement IDB)
    //
    // #414 : `once: false` — l'invalidation doit être rejouée à CHAQUE
    // `db-ready`, l'événement étant réémis après un import (les raccourcis
    // importés doivent chasser ceux du cache). Le rattrapage couvre le cas où
    // l'événement est déjà passé : sans lui, le cache gardait les défauts
    // temporaires générés avant l'hydratation d'IDB.
    window.auDbPret(function() {
        _raccourcisCache = null;
    }, { once: false });

    /**
     * Applique les personnalisations (noms, images, couleurs) directement
     * sur les objets AUTOCOLLANTS et OUTILS (les codes d'erreur se lisent dans
     * `codesAnnotation` ; seule leur couleur est recopiée sur l'outil).
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

        // --- Codes d'erreur : les outils suivent la liste courante (repli
        // personnalisé, ou grille de la copie ouverte) — noms et couleurs compris.
        _regenererOutilsCodes();

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
        // Copie gouvernée par sa grille : la phrase qui le dit vit derrière
        // l'engrenage (voir la barre de titre et `ouvrirEditionRetroErreursFr`),
        // pas ici — coup d'œil de Grégoire : un bandeau prenait trop de place dans
        // l'espace de travail, et le message parle des paramètres que l'engrenage ouvre.
        let html = '<div class="travaux-errfr-liste">';
        const codes = _codesCourants();
        // 21 oct. 2026 (étape 0) — un critère né depuis l'étape 0 sans sous-critère n'a AUCUN code
        // (`codesAnnotation`, la marque) : plus les dix du français. La palette le dit, et où agir.
        if (!codes.length) html += '<p class="travaux-errfr-vide">Aucun code : ajoute des sous-critères à ton critère algorithmique, dans la grille.</p>';
        codes.forEach((c) => {
            const actif = outilActif === c.id ? ' actif' : '';
            const raccourci = obtenirRaccourciPourItem(c.id);
            // `c.id` vient d'un champ libre du gabarit (le code d'un sous-critère) :
            // échappé, règle 1 — même si le module ne laisse passer qu'un jeton sûr.
            html += `<div class="travaux-errfr-item${actif}" data-action="travauxOutils.setOutilActif" data-param="${echapperHtml(c.id)}" title="${echapperHtml(c.nom)}${raccourci ? ' [' + raccourci + ']' : ''}">`;
            html += `<span class="travaux-errfr-numero" style="background:${echapperHtml(c.couleur)}">${echapperHtml(String(c.numero))}</span>`;
            html += `<span class="travaux-errfr-nom">${echapperHtml(c.nom)}</span>`;
            html += `<span class="travaux-errfr-compteur u-hide" data-erreur="${echapperHtml(c.id)}"></span>`;
            if (raccourci) html += `<span class="raccourci-badge">${raccourci}</span>`;
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
        // Toggle RLO : la catégorie `action` ne s'affiche dans la palette que
        // si l'observation des actions est activée (sinon les 6 tampons RLO
        // polluent l'espace de travail de l'enseignant).
        var actionsRloActif = (typeof obtenirPreference === 'function')
            && obtenirPreference('activerActionsRLO') === true;
        // Toggle SOLO : la catégorie `comprehension` (tampons Unistructurel /
        // Multistructurel / Relationnel / Étendu) suit la préférence Taxonomie
        // SOLO (défaut : activée), sur le même patron que la catégorie `action`.
        var soloActif = (typeof obtenirPreference === 'function')
            && obtenirPreference('afficherDescriptionsSOLO') !== false;

        // Helper: generer une grille de tampons image
        function _htmlTamponsImage(categorie, coulCat) {
            var r = '';
            var borderStyle = '';
            obtenirAutocollantsOrdonnes(categorie).forEach(function(a) {
                if (elemMasques.indexOf(a.id) !== -1) return;
                var imgSrc = imagesAutocollants[a.id] ? imagesAutocollants[a.id].src : (a.fichier ? DOSSIER_AUTOCOLLANTS + a.fichier : '');
                var actif = (getAutocollantActif() === a.id) ? ' actif' : '';
                var racc = obtenirRaccourciPourItem(a.id);
                r += '<div class="travaux-autocollant-item' + actif + '"' + (borderStyle ? ' style="' + borderStyle + '"' : '') + ' data-action="travauxOutils.setAutocollantActif" data-param="' + echapperHtml(a.id) + '" title="' + echapperHtml(a.nom) + (racc ? ' [' + racc + ']' : '') + '">';
                if (racc) r += '<span class="raccourci-badge raccourci-badge--coin">' + racc + '</span>';
                if (imgSrc) {
                    r += '<img src="' + echapperHtml(imgSrc) + '" alt="' + echapperHtml(a.nom) + '">';
                } else {
                    r += '<span style="font-size:24px; opacity:0.3;">?</span>';
                }
                r += '<span>' + echapperHtml(a.nom) + '</span></div>';
            });
            return r;
        }

        // Generer les categories dans l'ordre personnalise
        var couleursCat = obtenirCouleursCategories();
        obtenirOrdreCategories().forEach(function(catId) {
            if (catsMasquees.indexOf(catId) !== -1) return;
            if (catId === 'action' && !actionsRloActif) return;
            if (catId === 'comprehension' && !soloActif) return;
            var nomCat = nomsCat[catId] || catId;
            var coulCat = couleursCat[catId];
            var styleCat = coulCat ? ' style="border-left:3px solid ' + coulCat + '; padding-left:6px;"' : '';
            // echapperHtml : les noms de catégories sont personnalisables (nomsCategoriesTampons)
            html += '<div class="travaux-autocollants-label"' + styleCat + '>' + echapperHtml(nomCat);
            // Accès au guide SOLO depuis la catégorie Compréhension (module guides-pedagogiques.js)
            if (catId === 'comprehension') {
                html += '<button class="travaux-categorie-guide-btn" data-action="ouvrirGuidePedagogique" data-param="solo" data-stop title="Guide SOLO" aria-label="Ouvrir le guide SOLO">?</button>';
            }
            html += '</div>';

            if (catId === 'symboles') {
                html += '<div class="travaux-autocollants-grille travaux-autocollants-grille--symboles">';
                ['crochet', 'croix', 'interrogation'].forEach(function(id) {
                    if (elemMasques.indexOf(id) !== -1) return;
                    var outil = OUTILS[id];
                    var actif = outilActif === id ? ' actif' : '';
                    html += '<div class="travaux-autocollant-item' + actif + '" data-action="travauxOutils.setOutilActif" data-param="' + id + '" title="' + echapperHtml(outil.nom) + '">';
                    html += '<span style="font-size:24px; color:' + echapperHtml(outil.couleurBouton) + '; font-weight:bold;">' + echapperHtml(outil.icone) + '</span>';
                    html += '<span>' + echapperHtml(outil.nom) + '</span></div>';
                });
                obtenirSymbolesPerso().forEach(function(s) {
                    var outil = OUTILS[s.id];
                    if (!outil) return;
                    var actif = outilActif === s.id ? ' actif' : '';
                    html += '<div class="travaux-autocollant-item' + actif + '" data-action="travauxOutils.setOutilActif" data-param="' + echapperHtml(s.id) + '" title="' + echapperHtml(outil.nom) + '">';
                    html += '<span style="font-size:24px; color:' + echapperHtml(outil.couleurBouton) + '; font-weight:bold;">' + echapperHtml(outil.icone) + '</span>';
                    html += '<span>' + echapperHtml(outil.nom) + '</span></div>';
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
            majEtatBtnToggle('btn-toggle-codes', false);
            return;
        }

        paletteErrFrVisible = true;
        palette = document.createElement('div');
        palette.id = 'travaux-palette-erreurs-fr';
        palette.className = 'palette-flottante';

        // Barre de titre
        let html = '<div class="palette-flottante-barre">';
        // Copie gouvernée par sa grille : l'engrenage reste (coup d'œil de Grégoire),
        // il porte la phrase et l'écran qu'il ouvre ne montre qu'elle.
        var titreEngrenage = _copieGouvernee() ? _phraseSourceCodes() : 'Personnaliser';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.ouvrirEditionRetroErreursFr" title="' + echapperHtml(titreEngrenage) + '"><img src="' + ICONS_DIR + 'icon-gear.svg" alt="" class="outil-svg-icon palette-toggle-icon"></button>';
        html += '<span class="palette-flottante-titre"><span class="palette-grip" aria-hidden="true" title="Glisser pour déplacer">⠿</span>Codes <span id="travaux-errfr-total-header" style="font-weight:400; font-size:0.75rem; color:var(--texte-secondaire);"></span></span>';
        html += '<div style="display:flex; gap:2px;">';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.layoutPaletteH" data-param="travaux-palette-erreurs-fr" title="Disposition horizontale">\u2194</button>';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.layoutPaletteV" data-param="travaux-palette-erreurs-fr" title="Disposition verticale">\u2195</button>';
        html += '<button class="palette-flottante-toggle" data-action="travauxOutils.togglePaletteErrFrReplie" title="Replier/D\u00e9plier">\u2212</button>';
        html += '</div></div>';

        // Contenu : liste verticale (réutilise la fonction partagée)
        html += '<div class="palette-flottante-contenu" id="travaux-errfr-contenu">';
        html += genererContenuErreursFr();
        html += '</div>';

        palette.innerHTML = html;

        // Insérer dans le layout annotation — haut à droite, moitié supérieure
        const layout = document.getElementById('travaux-zone-canvas') || document.getElementById('travaux-conteneur-document');
        if (layout) {
            palette.style.top = '12px';
            palette.style.right = '12px';
            palette.style.left = 'auto';
            palette.style.height = 'calc(50% - 18px)';
            layout.appendChild(palette);
            configurerDragPalette(palette, layout);
        }
        majEtatBtnToggle('btn-toggle-codes', true);
    }

    function fermerPaletteErreursFrancais() {
        paletteErrFrVisible = false;
        majEtatBtnToggle('btn-toggle-codes', false);
        const palette = document.getElementById('travaux-palette-erreurs-fr');
        if (palette) palette.remove();
    }

    function togglePaletteErrFrReplie() {
        const palette = document.getElementById('travaux-palette-erreurs-fr');
        if (!palette) return;
        palette.classList.toggle('replie');
        var btns = palette.querySelectorAll('.palette-flottante-barre .palette-flottante-toggle');
        var btn = btns[btns.length - 1];
        if (btn) btn.textContent = palette.classList.contains('replie') ? '+' : '\u2212';
    }

    /**
     * Met à jour l'état actif/inactif d'un bouton emoji dans la palette annotation
     */
    function majEtatBtnToggle(btnId, actif) {
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.toggle('actif', actif);
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
        const vbH = Math.max(24, epaisseur + 12);
        const midY = vbH / 2;
        const pointes = flechePointes || 'aucune';
        const estLigne = outil.id === 'fleche' || outil.id === 'ondule' || outil.id === 'pointille';
        const marge = estLigne && pointes !== 'aucune' ? 16 : 10;

        apercu.innerHTML = '';
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 120 ' + vbH);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Dessiner selon le type d'outil
        if (outil.id === 'ondule') {
            // Vague sinusoïdale
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var d = 'M ' + marge + ' ' + midY;
            var len = 120 - 2 * marge;
            for (var i = 1; i <= len; i++) {
                var px = marge + i;
                var py = midY + Math.sin(i / 8 * Math.PI) * 4;
                d += ' L ' + px + ' ' + py.toFixed(1);
            }
            path.setAttribute('d', d);
            path.setAttribute('stroke', couleur);
            path.setAttribute('stroke-width', epaisseur);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('opacity', opacite);
            svg.appendChild(path);
        } else {
            // Ligne droite (pleine ou pointillée)
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(marge));
            line.setAttribute('y1', String(midY));
            line.setAttribute('x2', String(120 - marge));
            line.setAttribute('y2', String(midY));
            line.setAttribute('stroke', couleur);
            line.setAttribute('stroke-width', epaisseur);
            line.setAttribute('stroke-linecap', 'round');
            line.setAttribute('opacity', opacite);
            if (outil.id === 'pointille') {
                line.setAttribute('stroke-dasharray', (epaisseur * 3) + ' ' + (epaisseur * 2));
            }
            svg.appendChild(line);
        }

        // Pointes de flèche
        if (estLigne && pointes !== 'aucune') {
            var headSize = Math.max(6, epaisseur * 2);
            if (pointes === 'fin' || pointes === 'double') {
                _svgPointe(svg, 120 - marge, midY, headSize, couleur, 0);
            }
            if (pointes === 'debut' || pointes === 'double') {
                _svgPointe(svg, marge, midY, headSize, couleur, Math.PI);
            }
        }

        apercu.appendChild(svg);
    }

    function _svgPointe(svg, x, y, size, couleur, angle) {
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        var cos = Math.cos, sin = Math.sin;
        var a1 = angle + 2.75, a2 = angle - 2.75;
        var pts = x + ',' + y + ' '
            + (x + cos(a1) * size).toFixed(1) + ',' + (y + sin(a1) * size).toFixed(1) + ' '
            + (x + cos(a2) * size).toFixed(1) + ',' + (y + sin(a2) * size).toFixed(1);
        p.setAttribute('points', pts);
        p.setAttribute('fill', couleur);
        svg.appendChild(p);
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
        // Lot 2 — le numéro vient de la liste de la grille courante (ou du repli :
        // la position dans l'ordre, comme hier).
        const code = _codes() ? _codes().code(_grilleCourante, outilId).numero : outilId.replace('errfr_', '');
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
        let html = '<div class="palette-flottante" id="travaux-palette-flottante">';

        // Barre de titre (draggable + toggle)
        html += '<div class="palette-flottante-barre">';
        html += '<span class="palette-flottante-titre"><span class="palette-grip" aria-hidden="true" title="Glisser pour déplacer">⠿</span>Annotation</span>';
        html += '<button class="palette-flottante-toggle" id="travaux-btn-reglages-annotation" title="Personnaliser"><img src="' + ICONS_DIR + 'icon-gear.svg" alt="" class="outil-svg-icon palette-toggle-icon"></button>';
        html += '<button class="palette-flottante-toggle" id="travaux-palette-toggle" data-action="travauxOutils.togglePaletteReplie" title="Réduire la palette">&#x2212;</button>';
        html += '</div>';

        // Contenu (sections verticales)
        html += '<div class="palette-flottante-contenu">';

        // Boutons d'action
        html += '<div class="groupe-boutons-colonne">';
        html += '<div class="groupe-boutons-ligne">';
        html += '<button id="travaux-btn-supprimer" class="btn btn-secondaire btn-tres-compact btn-icon-compact u-flex-1" data-action="travauxAnnotation.supprimerSelection" disabled title="Supprimer la s\u00e9lection (Delete)"><img src="' + ICONS_DIR + 'icons8-trash.svg" alt="Supprimer" class="outil-svg-icon"></button>';
        html += '<button id="travaux-btn-undo" class="btn btn-secondaire btn-tres-compact btn-icon-compact u-flex-1" data-action="travauxAnnotation.annuler" disabled title="Annuler (Ctrl+Z)"><img src="' + ICONS_DIR + 'icon-undo.svg" alt="Annuler" class="outil-svg-icon"></button>';
        html += '<button id="travaux-btn-redo" class="btn btn-secondaire btn-tres-compact btn-icon-compact u-flex-1" data-action="travauxAnnotation.retablir" disabled title="R\u00e9tablir (Ctrl+Y)"><img src="' + ICONS_DIR + 'icon-redo.svg" alt="R\u00e9tablir" class="outil-svg-icon"></button>';
        html += '</div>';
        html += '<div class="groupe-boutons-ligne">';
        html += '<button class="btn btn-supprimer btn-tres-compact u-flex-1" data-action="travauxAnnotation.effacerPage" title="Effacer toute la page">Effacer tout</button>';
        html += '</div>';
        // Info étudiant/production (même info que palette Paramètres)
        html += '<div id="travaux-annot-identite" class="travaux-eval-identite" style="margin-top: 6px;">';
        html += '<div style="display:flex; align-items:center; gap:6px;"><span class="travaux-eval-label-val" id="travaux-annot-label-etudiant" style="font-weight: 600;">--</span>';
        html += '<button class="btn-profil-rapide" id="travaux-annot-btn-profil" data-action="ouvrirProfilDepuisAnnotation" title="Voir le profil de l\u2019\u00e9l\u00e8ve"><img src="' + ICONS_DIR + 'icon-profile.svg" alt="" class="outil-svg-icon"></button></div>';
        html += '<span class="travaux-eval-label-val travaux-eval-label-production" id="travaux-annot-label-production">--</span>';
        html += '</div>';
        html += '</div>';

        html += '<hr class="separateur-horizontal">';

        // Outils de dessin
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Outils</div>';
        html += '<div class="travaux-palette-outils">';

        // #467 (relecture de Cowork, 9 oct.) : l'icône des outils et des formes est une balise
        // <img> écrite par l'application (OUTILS) ; aucune personnalisation ni import ne la
        // réécrit (appliquerPersonnalisations ne touche que les trois symboles). Elle part donc
        // telle quelle ; seul le nom, qui reste du texte, est échappé dans le title.
        const outilsDessin = ['position', 'selection', 'stylo', 'surligneur', 'texte'];
        outilsDessin.forEach(id => {
            const outil = OUTILS[id];
            const actif = outilActif === id ? ' actif' : '';
            const raccourci = obtenirRaccourciPourItem(id);
            html += `<button class="travaux-btn-outil${actif}" data-outil="${id}" data-action="travauxOutils.setOutilActif" data-param="${id}" title="${echapperHtml(outil.nom)}${raccourci ? ' [' + raccourci + ']' : ''}">${outil.icone}${raccourci ? '<span class="raccourci-badge">' + raccourci + '</span>' : ''}</button>`;
            // Bouton Dupliquer juste apres Selection
            if (id === 'selection') {
                html += '<button class="travaux-btn-outil" id="travaux-btn-dupliquer" data-action="travauxAnnotation.dupliquerSelection" title="Dupliquer la s\u00e9lection"><img src="' + ICONS_DIR + 'icon-duplicate.svg" alt="Dupliquer" class="outil-svg-icon"></button>';
            }
        });

        html += '</div></div>';

        // Formes
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Formes</div>';
        html += '<div class="travaux-palette-outils">';

        const outilsFormes = ['cercle', 'rectangle', 'fleche', 'pointille', 'ondule'];
        outilsFormes.forEach(id => {
            const outil = OUTILS[id];
            const actif = outilActif === id ? ' actif' : '';
            const styleCouleur = outil.couleurBouton ? ` style="color:${echapperHtml(outil.couleurBouton)}; font-weight:bold;"` : '';
            const raccourci = obtenirRaccourciPourItem(id);
            html += `<button class="travaux-btn-outil${actif}" data-outil="${id}" data-action="travauxOutils.setOutilActif" data-param="${id}" title="${echapperHtml(outil.nom)}${raccourci ? ' [' + raccourci + ']' : ''}"${styleCouleur}>${outil.icone}${raccourci ? '<span class="raccourci-badge">' + raccourci + '</span>' : ''}</button>`;
        });

        html += '</div></div>';

        // Options extrémités (visible quand outil fleche ou ondule actif)
        html += '<div class="travaux-palette-section travaux-options-fleche" id="travaux-options-fleche">';
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
            html += `<button class="travaux-btn-outil${act}" data-pointes="${m.val}" data-action="travauxOutils.setFlechePointes" data-param="${m.val}" title="${m.titre}">${m.label}</button>`;
        });
        html += '</div></div>';

        html += '<hr class="separateur-horizontal">';

        // Couleurs (sans label — les pastilles sont explicites)
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-couleurs">';

        COULEURS.forEach(c => {
            const actif = couleurActive === c.hex ? ' actif' : '';
            html += `<button class="travaux-btn-couleur${actif}" data-couleur="${c.hex}" data-action="travauxOutils.setCouleurActive" data-param="${c.hex}" title="${echapperHtml(c.nom)}" style="background-color: ${c.hex}"></button>`;
        });

        html += '</div></div>';

        // Epaisseur (slider + affichage pixels)
        const outilInit = getOutilActif();
        const minEp = outilInit.epaisseurMin || 1;
        const maxEp = outilInit.epaisseurMax || 20;
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-epaisseur-header">';
        html += '<img src="' + ICONS_DIR + 'icon-line-width.svg" alt="Epaisseur" class="travaux-epaisseur-icone outil-svg-icon">';
        html += '<span id="travaux-epaisseur-px" class="travaux-epaisseur-px">' + getEpaisseurReellePixels() + 'px</span>';
        html += '</div>';
        html += '<div class="travaux-epaisseur-controles">';
        html += `<button class="travaux-btn-epaisseur-inc" data-action="travauxOutils.decrementerEpaisseur" title="Moins fin">\u2190</button>`;
        html += `<input type="range" class="travaux-slider-epaisseur" id="travaux-slider-epaisseur" min="${minEp}" max="${maxEp}" value="${epaisseurActive}" data-on-input="travauxOutils.setEpaisseurActiveFromSlider">`;
        html += `<button class="travaux-btn-epaisseur-inc" data-action="travauxOutils.incrementerEpaisseur" title="Plus \u00e9pais">\u2192</button>`;
        html += '</div>';
        html += '<div class="travaux-apercu-trait" id="travaux-apercu-trait"></div>';

        html += '</div>'; // fin .palette-flottante-contenu

        // Barre d'outils en bas
        html += '<div class="palette-flottante-bas-btns">';
        html += '<button class="palette-flottante-aide-btn" data-action="tamponsBibliotheque.afficherBibliothequeTampons" title="Bibliothèque de tampons"><img src="' + ICONS_DIR + 'icons8-library-2.svg" alt="" class="outil-svg-icon palette-bas-icon"></button>';
        html += '<button class="palette-flottante-aide-btn" id="btn-toggle-codes" data-action="travauxOutils.togglePaletteErreursFrancais" title="Afficher/masquer les codes"><img src="' + ICONS_DIR + 'icons8-traffic-light.svg" alt="" class="outil-svg-icon palette-bas-icon"></button>';
        html += '<button class="palette-flottante-aide-btn" id="btn-toggle-tampons" data-action="travauxOutils.togglePaletteAutocollants" title="Afficher/masquer les tampons"><img src="' + ICONS_DIR + 'icons8-rubber-stamp.svg" alt="" class="outil-svg-icon palette-bas-icon"></button>';
        html += '</div>';

        html += '</div>'; // fin .palette-flottante

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
                // Lot 2 — les items portent `data-param` (zéro handler inline) ; l'ancien
                // motif `onclick` ne trouvait plus rien, et un code non numérique n'y
                // aurait pas passé.
                item.classList.toggle('actif', item.dataset.param === outilActif);
            });
        }

        // Options extrémités : afficher/masquer selon outil actif + maj boutons pointes
        const sectionFleche = document.getElementById('travaux-options-fleche');
        if (sectionFleche) {
            sectionFleche.style.display = '';
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
    /**
     * Configure le drag d'une palette flottante par sa barre de titre.
     * Fonctionne avec .palette-flottante-barre (nouveau) et .travaux-palette-barre (legacy).
     * @param {HTMLElement} palette - L'élément palette
     * @param {HTMLElement} [conteneur] - Le conteneur de référence (défaut : travaux-conteneur-document)
     */
    /** Z-index courant pour le focus des palettes */
    var _paletteZIndex = 80;

    /**
     * Monte le z-index d'une palette au-dessus des autres (focus)
     */
    function focusPalette(palette) {
        if (!palette) return;
        _paletteZIndex++;
        if (_paletteZIndex > 99) {
            // Plafond atteint : remettre toutes les palettes au z-index de base
            document.querySelectorAll('.palette-flottante, .travaux-palette-flottante').forEach(function(p) {
                p.style.zIndex = 80;
            });
            _paletteZIndex = 81;
        }
        palette.style.zIndex = _paletteZIndex;
    }

    /**
     * Disposition horizontale : palette en bandeau (largeur max, hauteur limitée)
     */
    function layoutPaletteH(paletteId) {
        var palette = document.getElementById(paletteId);
        var conteneur = document.getElementById('travaux-zone-canvas') || document.getElementById('travaux-conteneur-document');
        if (!palette || !conteneur) return;
        var cRect = conteneur.getBoundingClientRect();
        palette.style.left = '12px';
        palette.style.right = 'auto';
        palette.style.width = (cRect.width - 24) + 'px';
        // HAUTEUR AU CONTENU, PAS 60 % DE LA ZONE — #774 (6 sept. 2026).
        // La formule d'origine (`cRect.height * 0.6`) donnait la même bande à une
        // palette de dix codes qu'à une palette de cent : sur la capture d'iPad de
        // Grégoire, ses dix codes tenaient en deux lignes et les quatre cinquièmes
        // du bandeau, vides, couvraient la copie de l'élève. En bandeau, la largeur
        // est déjà maximale : c'est elle qui décide du nombre de lignes, donc la
        // hauteur utile se MESURE, elle ne se postule pas.
        // `height: auto` avant la mesure, et non `''` : la règle
        // `.palette-flottante[style*="height"] .palette-flottante-contenu` lève le
        // plafond du contenu sur la présence du mot dans le style en ligne — sans
        // lui, le contenu serait replafonné le temps de la mesure. La lecture
        // d'`offsetHeight` force le reflow. La zone reste le plafond dur : une
        // palette plus haute qu'elle deviendrait insaisissable.
        palette.style.height = 'auto';
        palette.style.height = Math.min(palette.offsetHeight, cRect.height - 24) + 'px';
        sauvegarderPositionPalette(palette);
    }

    /**
     * Disposition verticale : palette en colonne droite (200px, hauteur max)
     */
    function layoutPaletteV(paletteId) {
        var palette = document.getElementById(paletteId);
        var conteneur = document.getElementById('travaux-zone-canvas') || document.getElementById('travaux-conteneur-document');
        if (!palette || !conteneur) return;
        var cRect = conteneur.getBoundingClientRect();
        palette.style.right = '12px';
        palette.style.left = 'auto';
        palette.style.width = '200px';
        palette.style.height = (cRect.height - 24) + 'px';
        sauvegarderPositionPalette(palette);
    }

    /**
     * Sauvegarde la position d'une palette dans localStorage
     */
    function sauvegarderPositionPalette(palette) {
        if (!palette || !palette.id) return;
        try {
            localStorage.setItem(palette.id + '-pos', JSON.stringify({
                left: palette.style.left,
                right: palette.style.right || '',
                top: palette.style.top,
                width: palette.style.width || '',
                height: palette.style.height || ''
            }));
        } catch(e) { /* quota */ }
    }

    /**
     * Restaure la position d'une palette depuis localStorage
     */
    function restaurerPositionPalette(palette) {
        if (!palette || !palette.id) return;
        try {
            const raw = localStorage.getItem(palette.id + '-pos');
            if (!raw) return;
            const pos = JSON.parse(raw);
            if (pos.right && pos.right !== 'auto' && (!pos.left || pos.left === 'auto')) {
                palette.style.right = pos.right;
                palette.style.left = 'auto';
            } else if (pos.left) {
                palette.style.left = pos.left;
                palette.style.right = 'auto';
            }
            if (pos.top) palette.style.top = pos.top;
            if (pos.width) palette.style.width = pos.width;
            if (pos.height) palette.style.height = pos.height;
            // Borner au conteneur : une position sauvegardée dans un autre
            // layout (plein écran, fenêtre plus étroite) peut placer la
            // palette hors zone → palette invisible alors qu'elle existe.
            const cont = palette.offsetParent || palette.parentElement;
            if (cont && cont.clientWidth > 100) {
                const maxLeft = cont.clientWidth - 60;
                const maxTop = cont.clientHeight - 40;
                if (palette.offsetLeft > maxLeft) {
                    palette.style.left = Math.max(0, maxLeft) + 'px';
                    palette.style.right = 'auto';
                }
                if (palette.offsetLeft < 0) {
                    palette.style.left = '0px';
                    palette.style.right = 'auto';
                }
                if (palette.offsetTop > maxTop) palette.style.top = Math.max(0, maxTop) + 'px';
                if (palette.offsetTop < 0) palette.style.top = '0px';
            }
        } catch(e) { /* JSON parse error */ }
    }

    /**
     * Pose une poignée de redimensionnement (coin inférieur droit) sur une palette
     * flottante et la fait fonctionner en Pointer Events — #773 (6 sept. 2026).
     *
     * ⚠ POURQUOI UNE POIGNÉE EN JS ET PAS `resize: both` : WebKit sur iPadOS ne
     * rend AUCUNE poignée native de `resize` au toucher — la propriété est lue,
     * rien n'est saisissable. Mesuré par Grégoire sur son iPad le 6 sept. 2026
     * (Safari 26.6, palette Codes : « je ne suis pas capable de saisir le coin
     * inférieur droit »). La limite était déjà nommée au #144 (11 juin) : le
     * glisser avait été porté en Pointer Events, pas le redimensionnement.
     *
     * Même mécanique que le glisser de la barre (ci-dessous) : `pointerdown`,
     * `setPointerCapture`, `touch-action: none` sur la poignée (styles.css,
     * `.palette-poignee-redim`) pour que Safari ne cède pas le geste au défilement.
     * La taille est persistée avec la position (`sauvegarderPositionPalette`), ce
     * que le `resize` natif ne faisait jamais : une palette redimensionnée à la
     * souris reprenait sa taille par défaut au rechargement.
     *
     * Une palette positionnée par `right` grandirait vers la gauche : le bord
     * gauche est figé avant le geste, comme le fait le glisser.
     */
    function configurerPoigneeRedimension(palette, conteneur) {
        if (!palette || palette.querySelector(':scope > .palette-poignee-redim')) return;
        const poignee = document.createElement('div');
        poignee.className = 'palette-poignee-redim';
        poignee.setAttribute('role', 'separator');
        poignee.setAttribute('aria-label', 'Redimensionner la palette');
        poignee.title = 'Glisser pour redimensionner';
        palette.appendChild(poignee);

        // La palette est son propre conteneur de défilement : une poignée absolue
        // part avec le contenu défilé. La ramener au coin VISIBLE à chaque scroll.
        palette.addEventListener('scroll', function() {
            poignee.style.transform = palette.scrollTop ? 'translateY(' + palette.scrollTop + 'px)' : '';
        }, { passive: true });

        poignee.addEventListener('pointerdown', function(e) {
            if (!e.isPrimary) return;
            if (palette.classList.contains('replie')) return;
            e.preventDefault();
            const pointerId = e.pointerId;
            const startX = e.clientX, startY = e.clientY;
            const rect = palette.getBoundingClientRect();
            const startW = rect.width, startH = rect.height;
            const cont = conteneur || palette.offsetParent || document.getElementById('travaux-conteneur-document');
            if (cont) {
                palette.style.left = (rect.left - cont.getBoundingClientRect().left) + 'px';
                palette.style.right = 'auto';
            }
            function onMove(e2) {
                if (e2.pointerId !== pointerId) return;
                // Les planchers CSS (min-width, hauteur de la barre) gardent le dernier mot.
                palette.style.width = Math.max(80, startW + e2.clientX - startX) + 'px';
                palette.style.height = Math.max(48, startH + e2.clientY - startY) + 'px';
            }
            function onUp(e2) {
                if (e2.pointerId !== pointerId) return;
                poignee.removeEventListener('pointermove', onMove);
                poignee.removeEventListener('pointerup', onUp);
                poignee.removeEventListener('pointercancel', onUp);
                sauvegarderPositionPalette(palette);
            }
            poignee.setPointerCapture(pointerId);
            poignee.addEventListener('pointermove', onMove);
            poignee.addEventListener('pointerup', onUp);
            poignee.addEventListener('pointercancel', onUp);
        });
    }

    function configurerDragPalette(palette, conteneur) {
        if (!palette) {
            palette = document.getElementById('travaux-palette-flottante');
        }
        const barre = palette?.querySelector('.palette-flottante-barre') || palette?.querySelector('.travaux-palette-barre');
        if (!barre) return;

        // Restaurer la position persistée
        restaurerPositionPalette(palette);

        // Focus (z-index) au pointerdown sur la palette entière (souris, doigt, stylet)
        palette.addEventListener('pointerdown', function() { focusPalette(palette); });

        // Pointer Events : couvre souris, doigt (iPad) et Apple Pencil avec une
        // seule mécanique. Nécessite touch-action:none sur la barre (styles.css)
        // pour que le geste ne soit pas happé par le défilement natif.
        // ⚠⚠ L'EXEMPTION PORTE SUR `button`, PAS SUR UNE CLASSE — ET C'EST MESURÉ.
        //
        // Avant le 31 août 2026, elle nommait `.palette-flottante-toggle` et
        // `.travaux-palette-toggle`. Le cadenas de la palette Paramètres
        // (`travaux-ui.js`, `#btnVerrouPalette`, classes `btn btn-compact`) n'en
        // portait aucune : appuyer dessus ne faisait RIEN — pas d'action, pas de
        // message, pas d'erreur. Signalé par Grégoire depuis l'écran Évaluation, où
        // il rendait le déverrouillage d'une évaluation IMPOSSIBLE (#644).
        //
        // ⚠ LA CAUSE N'EST PAS `preventDefault()`, ET C'EST CONTRE-INTUITIF. Mesuré
        // dans WebKit, les deux gestes isolés : `preventDefault()` seul laisse passer
        // le `click` (1/1) ; `setPointerCapture()` seule le supprime (0/1), témoin
        // sans geste à 1/1. C'est la CAPTURE qui mord : elle redirige le `pointerup`
        // vers la barre, `pointerdown` et `pointerup` n'atterrissent plus sur la même
        // cible, et aucun `click` ne se forme. La spec Pointer Events ne tranche pas
        // ce point — le moteur décide, donc on le mesure.
        //
        // ⮕ POURQUOI `button` PLUTÔT QUE D'AJOUTER LA CLASSE AU CADENAS : le défaut
        // n'est pas ce bouton-là, c'est que TOUT bouton posé dans une barre de palette
        // sans la classe magique est avalé en silence. Vérifié avant d'élargir : les
        // 13 éléments qui portent les deux classes exemptées sont TOUS des `<button>`,
        // donc `closest('button')` les subsume sans rien changer pour eux. Le titre et
        // la poignée ne sont pas des boutons : le glisser reste entier.
        // Verrouillé par `tests/integration/palette-barre-boutons-clic-644.spec.js`,
        // qui rougit dans les DEUX sens (clic avalé / glisser mangé).
        barre.addEventListener('pointerdown', function(e) {
            if (e.target.closest('button')) return;
            if (!e.isPrimary) return;
            e.preventDefault();
            const pointerId = e.pointerId;
            const startX = e.clientX, startY = e.clientY;
            const rect = palette.getBoundingClientRect();
            const cont = conteneur || document.getElementById('travaux-conteneur-document');
            const cRect = cont.getBoundingClientRect();
            const startLeft = rect.left - cRect.left;
            const startTop = rect.top - cRect.top;
            // Convertir right → left pour le drag (palettes positionnées avec right)
            palette.style.right = 'auto';
            palette.style.left = startLeft + 'px';
            function onMove(e2) {
                if (e2.pointerId !== pointerId) return;
                palette.style.left = Math.max(0, startLeft + e2.clientX - startX) + 'px';
                palette.style.top = Math.max(0, startTop + e2.clientY - startY) + 'px';
            }
            function onUp(e2) {
                if (e2.pointerId !== pointerId) return;
                barre.removeEventListener('pointermove', onMove);
                barre.removeEventListener('pointerup', onUp);
                barre.removeEventListener('pointercancel', onUp);
                sauvegarderPositionPalette(palette);
            }
            // La capture redirige les pointermove/up vers la barre même quand
            // le pointeur sort de la palette — pas d'écouteurs sur document.
            barre.setPointerCapture(pointerId);
            barre.addEventListener('pointermove', onMove);
            barre.addEventListener('pointerup', onUp);
            barre.addEventListener('pointercancel', onUp);
        });

        // Coin inférieur droit : redimensionnement au doigt, au stylet ou à la souris (#773).
        configurerPoigneeRedimension(palette, conteneur);

        // Double-clic sur la barre : reset taille et position sauvegardée
        // Même exemption qu'au `pointerdown` ci-dessus, et pour la même raison : un
        // double-clic sur un bouton de la barre ne doit pas réinitialiser la palette.
        barre.addEventListener('dblclick', function(e) {
            if (e.target.closest('button')) return;
            palette.style.width = '';
            palette.style.height = '';
            sauvegarderPositionPalette(palette);
        });
    }

    /**
     * Replie / deplie la palette flottante annotation
     */
    function togglePaletteReplie() {
        const palette = document.getElementById('travaux-palette-flottante');
        if (!palette) return;
        palette.classList.toggle('replie');
        // #936 — par son id : la barre porte d'abord la roue (même classe), qu'un
        // querySelector de classe remplaçait par « − » / « + ».
        const btn = document.getElementById('travaux-palette-toggle');
        if (btn) {
            btn.innerHTML = palette.classList.contains('replie') ? '&#x002B;' : '&#x2212;';
        }
    }

    /**
     * Ouvre la modale de configuration des raccourcis outils/formes
     */
    function afficherRaccourcis() {
        var existant = document.getElementById('modal-raccourcis-outils');
        if (existant) existant.remove();

        var outilsIds = ['position', 'selection', 'stylo', 'surligneur', 'texte',
                         'cercle', 'rectangle', 'fleche', 'pointille', 'ondule'];

        var lignes = outilsIds.map(function(id) {
            var outil = OUTILS[id];
            var raccourci = obtenirRaccourciPourItem(id) || '';
            return '<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">' +
                '<span style="width:120px; font-size:0.9rem;">' + echapperHtml(outil.nom) + '</span>' +
                '<input type="text" class="travaux-retro-raccourci-input" data-raccourci-id="' + id + '" value="' + echapperHtml(raccourci) + '" maxlength="1" placeholder="\u2328" title="Raccourci clavier (1 touche)" style="width:36px; text-align:center; font-size:0.9rem; padding:4px;">' +
                '</div>';
        }).join('');

        var html = '<div class="modal-overlay actif">' +
            '<div class="modal-contenu" style="max-width:320px; padding:20px;">' +
            '<h3 style="margin:0 0 12px;">Raccourcis outils</h3>' +
            '<p style="font-size:0.85rem; color:var(--texte-secondaire); margin-bottom:12px;">Ctrl+Z : Annuler &middot; Ctrl+Y : R\u00e9tablir &middot; Delete : Supprimer &middot; Echap : Position</p>' +
            lignes +
            '<div style="display:flex; gap:8px; margin-top:12px;">' +
            '<button class="btn btn-principal btn-tres-compact u-flex-1" id="raccourcis-outils-sauver">Enregistrer</button>' +
            '<button class="btn btn-annuler btn-tres-compact" id="raccourcis-outils-fermer">Fermer</button>' +
            '</div></div></div>';

        var modal = document.createElement('div');
        modal.id = 'modal-raccourcis-outils';
        modal.innerHTML = html;
        document.body.appendChild(modal);

        document.getElementById('raccourcis-outils-sauver').addEventListener('click', function() {
            modal.querySelectorAll('input[data-raccourci-id]').forEach(function(inp) {
                var id = inp.dataset.raccourciId;
                var touche = inp.value.trim().toLowerCase();
                if (touche.length === 1) {
                    definirRaccourci(id, touche);
                } else if (touche === '') {
                    definirRaccourci(id, null);
                }
            });
            rafraichirPalettesApresPersonnalisation();
            modal.remove();
            notifications.succes('Raccourcis outils enregistr\u00e9s');
        });

        document.getElementById('raccourcis-outils-fermer').addEventListener('click', function() {
            modal.remove();
        });
    }

    /* ===============================
       COMPTEURS ERREURS DE FRANÇAIS
       =============================== */

    function compterErreursFrancais() {
        const compteurs = {};
        _codesCourants().forEach(t => { compteurs[t.id] = 0; });
        const annotation = travauxAnnotation.getAnnotationCourante();
        if (!annotation || !annotation.pages) return compteurs;
        for (const pageKey of Object.keys(annotation.pages)) {
            const page = annotation.pages[pageKey];
            if (!page.shapes) continue;
            for (const forme of page.shapes) {
                // Lot 2 — TOUT code errfr_* compte, connu de la liste courante ou
                // non : un code posé sous une autre grille reste une erreur sur la
                // copie, et il ne disparaît pas du total parce que la palette a changé.
                if (forme.type && typeof forme.type === 'string' && forme.type.indexOf('errfr_') === 0) {
                    compteurs[forme.type] = (compteurs[forme.type] || 0) + 1;
                }
            }
        }
        return compteurs;
    }

    /**
     * 21 oct. 2026 (décision de Grégoire, 8 h 38) — LE POIDS DES CODES POSÉS : chaque code pèse la
     * pondération de son sous-critère (`codesAnnotation`, `poids`) ; 1 en repli et pour un code que
     * la grille ne connaît plus, comme hier. Arrondie au dix-millième (des poids de 0,1 s'additionnent).
     * `grille` : celle de la copie ouverte, par défaut (les bancs la passent).
     */
    function sommePondereeErreurs(compteurs, grille) {
        const t = _codes();
        const g = (grille === undefined) ? _grilleCourante : grille;
        const somme = Object.keys(compteurs).reduce((s, id) => {
            const c = t ? t.code(g, id) : null;
            const poids = (c && isFinite(Number(c.poids))) ? Number(c.poids) : 1;
            return s + (compteurs[id] || 0) * poids;
        }, 0);
        return Math.round(somme * 10000) / 10000;
    }

    function mettreAJourCompteursErreurs() {
        const compteurs = compterErreursFrancais();
        // Le total additionne TOUS les codes posés ; les badges ne montrent que
        // ceux que la palette affiche.
        const total = Object.keys(compteurs).reduce((somme, id) => somme + (compteurs[id] || 0), 0);

        // Badges et total d'entête : seulement si la palette CODES est ouverte.
        // Bug 2026-10-20 (Grégoire) : cette garde arrêtait TOUTE la fonction, et le
        // champ « Nombre d'erreurs » ne suivait plus les codes quand la palette
        // était fermée — la note partait sur 0 erreur.
        const palette = document.getElementById('travaux-palette-erreurs-fr');
        if (palette) {
            _codesCourants().forEach(c => {
                const count = compteurs[c.id] || 0;
                const idSur = (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') ? CSS.escape(c.id) : c.id.replace(/["\\]/g, '');
                const badge = palette.querySelector('.travaux-errfr-compteur[data-erreur="' + idSur + '"]');
                if (badge) {
                    badge.textContent = count > 0 ? count : '';
                    badge.classList.toggle('u-hide', count === 0);
                }
            });

            const spanTotal = document.getElementById('travaux-errfr-total-header');
            if (spanTotal) {
                spanTotal.textContent = total > 0 ? '(' + total + ' erreur' + (total > 1 ? 's' : '') + ')' : '';
            }
        }

        // Propager le total dans le champ « Nombre d'erreurs » du critère algorithmique
        // UNIQUEMENT s'il y a des tampons d'erreurs (total > 0). Sinon on ne touche
        // pas au champ : sans cette garde, une saisie MANUELLE du nombre d'erreurs
        // (sans tampons) était écrasée par 0 à chaque appel — notamment via
        // `_forcerRecalculAlgorithmiqueAvantSauvegarde` avant la sauvegarde.
        //
        // #700 (16 sept. 2026) — ET JUSQU'À 0 quand le champ contient ENCORE le total que les
        // annotations de CETTE copie y ont écrit : retirer tous les tampons laissait l'ancien compte,
        // et la note se calcule sur ce champ. La mémoire porte la copie parce que le même champ sert
        // à toutes (#671) : un 3 écrit pour une copie ne doit pas effacer le 3 tapé pour une autre.
        // Une valeur tapée, ou écrite par le chargement d'une évaluation, ne correspond pas à la
        // mémoire (ou le champ recréé n'en a plus) : elle reste. Spec `erreurs-700-…`.
        const inputErreurs = document.querySelector('input[id^="eval_erreurs_"]');
        if (!inputErreurs) return;
        const annotation = travauxAnnotation.getAnnotationCourante();
        const fichierId = (annotation && annotation.fichierId) || '';
        // 21 oct. 2026 : le champ reçoit le nombre BRUT, et la somme pondérée qui lui revient
        // (`poserErreursDuChamp`, evaluation-calcul.js) — c'est elle que la formule reçoit.
        const poser = (n, pondere) => {
            if (typeof window.poserErreursDuChamp === 'function') window.poserErreursDuChamp(inputErreurs, n, pondere);
            else inputErreurs.value = n;
        };
        if (total > 0) {
            poser(total, sommePondereeErreurs(compteurs));
            inputErreurs.dataset.totalAnnotations = String(total);
            inputErreurs.dataset.totalAnnotationsFichier = fichierId;
            inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (fichierId
            && inputErreurs.dataset.totalAnnotationsFichier === fichierId
            && inputErreurs.value === inputErreurs.dataset.totalAnnotations) {
            poser(0);
            delete inputErreurs.dataset.totalAnnotations;
            delete inputErreurs.dataset.totalAnnotationsFichier;
            inputErreurs.dispatchEvent(new Event('input', { bubbles: true }));
        }
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
        html += '<p style="color:var(--texte-secondaire);font-size:0.85rem;margin-bottom:16px;">Ces textes appara\u00eetront dans la r\u00e9troaction g\u00e9n\u00e9r\u00e9e pour l\'\u00e9l\u00e8ve lorsque le tampon correspondant est utilis\u00e9. Clique sur l\'image pour la remplacer. Glissez \u2630 pour r\u00e9ordonner.</p>';

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
            var coulCat = couleursCat[catId] || '#000000';
            var menuCatHTML = BibliothequeUI.renderMenuActions([
                { label: 'Supprimer la cat\u00e9gorie', action: 'travauxOutils.supprimerCategorieRetroObs', param: catId, classe: 'btn-supprimer', title: 'Supprimer cette cat\u00e9gorie' }
            ], 'cat-' + catId);
            html += '<div class="travaux-retro-cat-draggable" style="display:flex; gap:8px; align-items:center;" data-cat-row="' + echapperHtml(catId) + '"' + (estPerso ? ' data-cat-perso-id="' + echapperHtml(catId) + '"' : '') + ' draggable="true">';
            html += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner" style="cursor:grab;">\u2630</span>';
            html += renderPickerCouleur(coulCat, { dataAttrs: { 'color-cat-id': catId } });
            html += '<input type="text" class="travaux-retro-nom-input" data-cat-id="' + echapperHtml(catId) + '"' + (estPerso ? ' data-cat-perso-id="' + echapperHtml(catId) + '"' : '') + ' value="' + echapperHtml((nomsCat[catId] || '')) + '">';
            html += menuCatHTML;
            html += '</div>';
        });
        html += '<button class="btn btn-secondaire" data-action="travauxOutils.ajouterCategorieRetroObs" style="margin-top:4px;font-size:0.8rem;align-self:flex-start;">+ Ajouter une cat\u00e9gorie</button>';
        html += '</div>';

        // Helper pour generer une ligne de tampon (Phase C #267 \u2014 menu \u22ee remplace \ud83d\uddd1)
        function _htmlRowTampon(a, texte, imgSrc) {
            var estCustom = a.custom ? ' data-custom="true"' : '';
            var menuHTML = BibliothequeUI.renderMenuActions([
                { label: 'Supprimer', action: 'travauxOutils.supprimerTamponRetroObs', param: a.id, classe: 'btn-supprimer', title: 'Supprimer cette ligne' }
            ], 'tampon-' + a.id);
            var raccourci = obtenirRaccourciPourItem(a.id) || '';
            var r = '<div class="travaux-retro-row travaux-retro-draggable" data-obs-id="' + a.id + '"' + estCustom + ' draggable="true">';
            r += '<div class="travaux-retro-row-haut">';
            r += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>';
            r += '<div class="travaux-retro-img-upload" data-obs-id="' + echapperHtml(a.id) + '" title="Cliquer pour changer l\'image">';
            r += '<img src="' + echapperHtml(imgSrc) + '" alt="' + echapperHtml(a.nom) + '" data-img-id="' + echapperHtml(a.id) + '"' + (imgSrc ? '' : ' style="opacity:0.3"') + '>';
            r += '<input type="file" accept="image/*" data-file-id="' + echapperHtml(a.id) + '" hidden>';
            r += '</div>';
            r += '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + echapperHtml(a.id) + '" value="' + echapperHtml(a.nom) + '"' + (a.custom ? ' placeholder="Nom du tampon"' : '') + '>';
            r += '<input type="text" class="travaux-retro-raccourci-input" data-raccourci-id="' + echapperHtml(a.id) + '" value="' + echapperHtml(raccourci) + '" maxlength="1" placeholder="\u2328" title="Raccourci clavier (1 touche)">';
            r += menuHTML;
            r += '</div>';
            r += '<textarea class="travaux-retro-textarea" data-retro-id="' + echapperHtml(a.id) + '" rows="3">' + echapperHtml(texte) + '</textarea>';
            r += '</div>';
            return r;
        }

        // Helper pour generer une ligne de symbole Unicode (Phase C #267 \u2014 menu \u22ee remplace \ud83d\uddd1)
        function _htmlRowSymbole(id, outil, texte, estCustom) {
            var couleur = outil.couleurBouton;
            var menuHTML = estCustom
                ? BibliothequeUI.renderMenuActions([
                    { label: 'Supprimer', action: 'travauxOutils.supprimerSymboleRetroObs', param: id, classe: 'btn-supprimer', title: 'Supprimer ce symbole' }
                ], 'sym-' + id)
                : '';
            var raccourci = obtenirRaccourciPourItem(id) || '';
            var r = '<div class="travaux-retro-row' + (estCustom ? ' travaux-retro-draggable' : '') + '" data-obs-id="' + id + '"' + (estCustom ? ' data-sym-custom="true" draggable="true"' : '') + '>';
            r += '<div class="travaux-retro-row-haut">';
            if (estCustom) r += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>';
            r += renderPickerCouleur(couleur, { dataAttrs: { 'color-id': id } });
            r += '<input type="text" class="travaux-retro-icone-input" data-icone-id="' + echapperHtml(id) + '" value="' + echapperHtml(outil.icone) + '" title="Caract\u00e8re Unicode" style="color:' + echapperHtml(couleur) + ';">';
            r += '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + echapperHtml(id) + '" value="' + echapperHtml(outil.nom) + '"' + (estCustom ? ' placeholder="Nom du symbole"' : '') + '>';
            r += '<input type="text" class="travaux-retro-raccourci-input" data-raccourci-id="' + echapperHtml(id) + '" value="' + echapperHtml(raccourci) + '" maxlength="1" placeholder="\u2328" title="Raccourci clavier (1 touche)">';
            r += menuHTML;
            r += '</div>';
            r += '<textarea class="travaux-retro-textarea" data-retro-id="' + echapperHtml(id) + '" rows="3">' + echapperHtml(texte) + '</textarea>';
            r += '</div>';
            return r;
        }

        // Determiner les elements masques
        var elemMasques = db.getSync('elementsMasques', null) || [];

        // Generer les sections de toutes les categories dans l'ordre
        ordreCategories.forEach(function(catId) {
            if (catsMasquees.indexOf(catId) !== -1) return;
            var nomCat = nomsCat[catId] || catId;
            html += '<div class="travaux-retro-cat-label" style="font-weight:600; margin:12px 0 6px; color:var(--texte-principal);" data-cat-section="' + echapperHtml(catId) + '">' + echapperHtml(nomCat) + '</div>';

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
                html += '<button class="btn btn-secondaire" data-action="travauxOutils.ajouterSymboleRetroObs" style="font-size:0.8rem;">+ Symbole</button>';
                html += '<button class="btn btn-secondaire" data-action="travauxOutils.ajouterTamponRetroObs" data-param="symboles" style="font-size:0.8rem;">+ Tampon image</button>';
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
                html += '<button class="btn btn-secondaire" data-action="travauxOutils.ajouterTamponRetroObs" data-param="' + catId + '" style="margin-top:8px;font-size:0.8rem;">+ Ajouter</button>';
            }
        });

        html += '<div style="display:flex; gap:8px; margin:16px 0 8px; border-top:1px solid var(--bordure-claire); padding-top:12px;">';
        html += '<button class="btn btn-secondaire" data-action="travauxOutils.exporterTampons" style="font-size:0.8rem;">Exporter mes tampons</button>';
        html += '<button class="btn btn-secondaire" data-action="travauxOutils.ouvrirFilePickerImportTampons" style="font-size:0.8rem;">Importer des tampons</button>';
        html += '<input type="file" id="fichier-import-tampons" accept=".json" style="display:none;" data-on-change="travauxOutils.importerTampons">';
        html += '</div>';

        html += '<div class="travaux-retro-actions">';
        html += '<button class="btn btn-annuler" data-action="travauxOutils.reinitialiserRetroObservations">R\u00e9initialiser</button>';
        html += '<button class="btn btn-secondaire" data-action="travauxOutils.fermerModalRetroObservations">Annuler</button>';
        html += '<button class="btn btn-principal" data-action="travauxOutils.enregistrerRetroObservations">Enregistrer</button>';
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

        // Wiring picker couleur custom (#287) : sync visuel pastille +
        // icône-à-côté quand l'input couleur frère reçoit un changement
        // (clic dans la grille via dispatchEvent, ou picker natif via
        // « Personnalisé »). Le toggle du <details> est géré nativement.
        overlay.querySelectorAll('details.travaux-retro-couleur-picker').forEach(function(details) {
            var summary = details.querySelector('summary');
            var colorInput = details.parentNode.querySelector('input[type="color"]');
            if (!summary || !colorInput) return;
            colorInput.addEventListener('input', function() {
                summary.style.background = colorInput.value;
                var row = details.closest('.travaux-retro-row');
                if (row) {
                    var iconeInput = row.querySelector('.travaux-retro-icone-input');
                    if (iconeInput) iconeInput.style.color = colorInput.value;
                    var numero = row.querySelector('.travaux-retro-numero');
                    if (numero && numero !== summary) numero.style.background = colorInput.value;
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

        // Raccourcis clavier
        modal.querySelectorAll('input[data-raccourci-id]').forEach(function(inp) {
            var id = inp.dataset.raccourciId;
            var touche = inp.value.trim().toLowerCase();
            if (touche.length === 1) {
                definirRaccourci(id, touche);
            } else if (touche === '') {
                definirRaccourci(id, null);
            }
        });

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
        notifications.succes('Tampons et r\u00e9troactions enregistr\u00e9s');
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('tamponsPersonnalises');   // lot F : geste hors témoin (enregistrer les tampons et rétroactions)
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
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('tamponsPersonnalises');   // lot F : geste hors témoin (réinitialiser les tampons)
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

        var menuTamponHTML = BibliothequeUI.renderMenuActions([
            { label: 'Supprimer', action: 'travauxOutils.supprimerTamponRetroObs', param: id, classe: 'btn-supprimer', title: 'Supprimer ce tampon' }
        ], 'tampon-' + id);

        div.innerHTML =
            '<div class="travaux-retro-row-haut">' +
                '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>' +
                '<div class="travaux-retro-img-upload" data-obs-id="' + id + '" title="Cliquer pour changer l\'image">' +
                    '<img src="" alt="Nouveau" data-img-id="' + id + '" style="opacity:0.3">' +
                    '<input type="file" accept="image/*" data-file-id="' + id + '" hidden>' +
                '</div>' +
                '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + id + '" value="" placeholder="Nom du tampon">' +
                menuTamponHTML +
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

        var menuSymHTML = BibliothequeUI.renderMenuActions([
            { label: 'Supprimer', action: 'travauxOutils.supprimerSymboleRetroObs', param: id, classe: 'btn-supprimer', title: 'Supprimer ce symbole' }
        ], 'sym-' + id);

        div.innerHTML =
            '<div class="travaux-retro-row-haut">' +
                '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>' +
                renderPickerCouleur(couleur, { dataAttrs: { 'color-id': id } }) +
                '<input type="text" class="travaux-retro-icone-input" data-icone-id="' + id + '" value="" placeholder="\u2605" title="Caract\u00e8re Unicode" style="color:' + couleur + ';">' +
                '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + id + '" value="" placeholder="Nom du symbole">' +
                menuSymHTML +
            '</div>' +
            '<textarea class="travaux-retro-textarea" data-retro-id="' + id + '" rows="3"></textarea>';

        liste.appendChild(div);

        // Brancher le picker couleur custom (#287) : sync pastille + icône
        var details = div.querySelector('details.travaux-retro-couleur-picker');
        var summary = details ? details.querySelector('summary') : null;
        var colorInput = div.querySelector('input[type="color"]');
        if (summary && colorInput) {
            colorInput.addEventListener('input', function() {
                summary.style.background = colorInput.value;
                var iconeInput = div.querySelector('.travaux-retro-icone-input');
                if (iconeInput) iconeInput.style.color = colorInput.value;
            });
        }

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
        var menuNouveauCatHTML = BibliothequeUI.renderMenuActions([
            { label: 'Supprimer la cat\u00e9gorie', action: 'travauxOutils.supprimerCategorieRetroObs', param: id, classe: 'btn-supprimer', title: 'Supprimer cette cat\u00e9gorie' }
        ], 'cat-' + id);
        rowDiv.innerHTML =
            '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner" style="cursor:grab;">\u2630</span>' +
            renderPickerCouleur(coulDefaut, { dataAttrs: { 'color-cat-id': id } }) +
            '<input type="text" class="travaux-retro-nom-input" data-cat-id="' + id + '" data-cat-perso-id="' + id + '" value="' + nom + '">' +
            menuNouveauCatHTML;
        catContainer.insertBefore(rowDiv, btnAjouter);

        // Brancher le picker couleur custom (#287) sur la nouvelle catégorie
        var details = rowDiv.querySelector('details.travaux-retro-couleur-picker');
        var summary = details ? details.querySelector('summary') : null;
        var colorInput = rowDiv.querySelector('input[type="color"]');
        if (summary && colorInput) {
            colorInput.addEventListener('input', function() {
                summary.style.background = colorInput.value;
            });
        }

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
        // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
        var nomFichier = genererNomFichierExport('tampons', { inclureLicence: true, precisionDate: 'minute' });

        var blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        notifications.succes(tampons.length + ' tampon(s) export\u00e9(s)');
    }

    /**
     * Importe des tampons depuis un fichier JSON
     */
    function importerTampons(eventOuEl) {
        var target = eventOuEl.target || eventOuEl;
        var file = target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var donnees = JSON.parse(e.target.result);
                window._tamponsImportEnAttente = donnees;

                var estCC = typeof verifierLicenceCC === 'function' && verifierLicenceCC(donnees);

                var contenu = donnees.contenu || donnees;
                var nbTampons = (contenu.tampons || []).length;
                var nbSymPerso = (contenu.symbolesPerso || []).length;
                var nbCats = (contenu.categories || []).length;

                // Stats p\u00e9dagogiques (chiffres d\u00e9riv\u00e9s des tableaux, s\u00fbrs par construction)
                var stats = nbTampons + ' tampon(s), ' + nbCats + ' cat\u00e9gorie(s)';
                if (nbSymPerso > 0) stats += ', ' + nbSymPerso + ' symbole(s) Unicode';

                // D\u00e9fense A : badge CC rendu dans une iframe sandbox isol\u00e9e.
                // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md \u00a7D-01.
                // La classe `modal-import-tampons` cible la fermeture sans
                // impacter la biblioth\u00e8que ouverte en arri\u00e8re-plan.
                var modal = document.createElement('div');
                modal.classList.add('modal-import-tampons');
                modal.innerHTML =
                    '<div class="modal-js-overlay" style="z-index: 10001;">' +
                        '<div class="modal-js-contenu" style="max-width: 500px;">' +
                            '<div data-apercu-cc-slot style="margin-bottom:12px;"></div>' +
                            '<p><strong>Importer cette biblioth\u00e8que de tampons ?</strong></p>' +
                            '<p style="color:var(--texte-secondaire);font-size:0.85rem;" data-tampons-stats></p>' +
                            '<p style="color:var(--texte-secondaire);font-size:0.85rem;">Les tampons actuels seront remplac\u00e9s.</p>' +
                            '<div style="display:flex; gap:8px; margin-top:15px; justify-content:flex-end;">' +
                                '<button class="btn btn-secondaire" data-action="travauxOutils.fermerModalImportTampons">Annuler</button>' +
                                '<button class="btn btn-principal" data-action="travauxOutils.confirmerEtFermerImportTampons">Importer</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                document.body.appendChild(modal);

                // textContent : pas d'interpolation HTML pour les stats num\u00e9riques.
                var spanStats = modal.querySelector('[data-tampons-stats]');
                if (spanStats) spanStats.textContent = stats;

                if (estCC && window.ApercuSandbox && typeof genererBadgeCC === 'function') {
                    var slot = modal.querySelector('[data-apercu-cc-slot]');
                    if (slot) {
                        window.ApercuSandbox.afficher(slot, genererBadgeCC(donnees.metadata), {
                            hauteurMin: 120,
                            hauteurMax: 500
                        });
                    }
                }

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
            // #467 — noms, catégories et symboles reçus n'entrent pas bruts : toute
            // chaîne du fichier perd ses balises (import-export.js). Aucun schéma ne
            // couvre cette structure ; rien n'est jeté.
            donnees = window.retirerBalisesProfond(donnees);
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

            notifications.succes(tamponsImport.length + ' tampon(s) import\u00e9(s)');
            if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('tamponsPersonnalises');   // lot F : geste hors témoin (importer un fichier de tampons)
        } catch (err) {
            console.error('[Tampons] Erreur confirmerImport:', err);
            alert('Erreur lors de l\u2019import.\n' + err.message);
        }
    }

    function ouvrirEditionRetroErreursFr() {
        const existant = document.getElementById('modal-retro-erreurs-fr');
        if (existant) existant.remove();

        // Copie gouvernée par sa grille : l'écran n'édite pas, il dit où aller.
        if (_copieGouvernee()) {
            const garde = document.createElement('div');
            garde.id = 'modal-retro-erreurs-fr';
            garde.className = 'modal-overlay actif';
            garde.innerHTML = '<div class="modal-contenu travaux-retro-modal">'
                + '<h2 style="margin-top:0">Rétroactions — Codes d\'annotation</h2>'
                + '<p class="travaux-errfr-source">' + echapperHtml(_phraseSourceCodes()) + '</p>'
                + '<div class="travaux-retro-actions"><button class="btn btn-principal" data-action="travauxOutils.fermerModalRetroErreursFr">Fermer</button></div>'
                + '</div>';
            document.body.appendChild(garde);
            return;
        }

        const retroActuelles = obtenirRetroactionsErreursFr();
        const codesOrdonnes = obtenirCodesOrdonnes();
        const overlay = document.createElement('div');
        overlay.id = 'modal-retro-erreurs-fr';
        overlay.className = 'modal-overlay actif';

        let html = '<div class="modal-contenu travaux-retro-modal">';
        // Codes par grille (3 sept. 2026) — mots approuvés par Grégoire : le titre ne
        // dit plus la discipline ; la phrase dit à quoi servent ces dix codes (le
        // repli) depuis qu'une grille peut porter les siens.
        html += '<h2 style="margin-top:0">Rétroactions — Codes d\'annotation</h2>';
        html += '<p style="color:var(--texte-secondaire);font-size:0.85rem;margin-bottom:16px;">Ces dix codes servent à toute copie dont la grille ne porte pas ses propres codes (une grille active les siens dans Conception, sous son critère algorithmique). Ces textes apparaîtront dans la rétroaction générée pour l\'élève lorsque le code correspondant est posé. Clique sur la pastille pour changer sa couleur. Glissez \u2630 pour réordonner.</p>';

        const modeSynthese = obtenirModeSyntheseErrFr();
        html += '<div class="travaux-errfr-reglage">';
        html += '<span class="travaux-errfr-reglage-label">Synth\u00e8se PDF\u00a0:</span>';
        html += '<label><input type="radio" name="errfr-synthese" value="principale"' + (modeSynthese === 'principale' ? ' checked' : '') + ' data-on-change="travauxOutils.changerModeSyntheseErrFr" data-param="principale"> Erreur principale</label>';
        html += '<label><input type="radio" name="errfr-synthese" value="toutes"' + (modeSynthese === 'toutes' ? ' checked' : '') + ' data-on-change="travauxOutils.changerModeSyntheseErrFr" data-param="toutes"> Toutes les erreurs</label>';
        html += '</div>';

        html += '<div id="travaux-retro-errfr-liste">';
        codesOrdonnes.forEach((c, idx) => {
            const texte = retroActuelles[c.id] || '';
            const menuErrHTML = BibliothequeUI.renderMenuActions([
                { label: 'R\u00e9initialiser au d\u00e9faut', action: 'travauxOutils.reinitialiserCodeErrFr', param: c.id, classe: 'btn-secondaire', title: 'Restaurer le nom et la couleur d\u2019origine' }
            ], 'errfr-' + c.id);
            html += '<div class="travaux-retro-row travaux-retro-draggable" data-err-id="' + echapperHtml(c.id) + '" draggable="true">';
            html += '<div class="travaux-retro-row-haut">';
            html += '<span class="travaux-retro-drag-handle" title="Glisser pour r\u00e9ordonner">\u2630</span>';
            html += renderPickerCouleur(c.couleur, {
                dataAttrs: { 'color-id': c.id },
                summaryClass: 'travaux-retro-numero',
                summaryContent: String(idx + 1),
                dataPastilleId: c.id
            });
            var raccourci = obtenirRaccourciPourItem(c.id) || '';
            html += '<input type="text" class="travaux-retro-nom-input" data-nom-id="' + echapperHtml(c.id) + '" value="' + echapperHtml(c.nom) + '">';
            html += '<input type="text" class="travaux-retro-raccourci-input" data-raccourci-id="' + echapperHtml(c.id) + '" value="' + echapperHtml(raccourci) + '" maxlength="1" placeholder="\u2328" title="Raccourci clavier (1 touche)">';
            html += menuErrHTML;
            html += '</div>';
            html += '<textarea class="travaux-retro-textarea" data-retro-id="' + echapperHtml(c.id) + '" rows="3">' + echapperHtml(texte) + '</textarea>';
            html += '</div>';
        });
        html += '</div>';

        html += '<div class="travaux-retro-actions">';
        html += '<button class="btn btn-annuler" data-action="travauxOutils.reinitialiserRetroErreursFr">R\u00e9initialiser</button>';
        html += '<button class="btn btn-secondaire" data-action="travauxOutils.fermerModalRetroErreursFr">Annuler</button>';
        html += '<button class="btn btn-principal" data-action="travauxOutils.enregistrerRetroErreursFr">Enregistrer</button>';
        html += '</div>';
        html += '</div>';

        overlay.innerHTML = html;
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);

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
        // Raccourcis clavier
        modal.querySelectorAll('input[data-raccourci-id]').forEach(function(inp) {
            var id = inp.dataset.raccourciId;
            var touche = inp.value.trim().toLowerCase();
            if (touche.length === 1) {
                definirRaccourci(id, touche);
            } else if (touche === '') {
                definirRaccourci(id, null);
            }
        });
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
        notifications.succes('Codes d\u2019erreurs et r\u00e9troactions enregistr\u00e9s');
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('retroactionsErreursFr');   // lot F : geste hors témoin (enregistrer les codes d'erreurs)
    }

    function reinitialiserRetroErreursFr() {
        if (!confirm('R\u00e9initialiser tous les codes d\u2019erreurs et r\u00e9troactions ?\n\nCette action est irr\u00e9versible.')) return;
        db.setSync('retroactionsErreursFr', null);
        db.setSync('personnalisationErreursFr', null);
        db.setSync('ordreErreursFr', null);
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('retroactionsErreursFr');   // lot F : geste hors témoin (réinitialiser les codes d'erreurs)
        appliquerPersonnalisations();
        // Rouvrir le modal pour refleter l'ordre et les valeurs par defaut
        ouvrirEditionRetroErreursFr();
    }

    /**
     * Phase C #267 \u2014 R\u00e9initialise un seul code d'erreur (nom + couleur) \u00e0
     * sa valeur par d\u00e9faut, dans la modale ouverte. La r\u00e9troaction et le
     * raccourci sont conserv\u00e9s. Persistance au prochain \u00ab Enregistrer \u00bb.
     */
    function reinitialiserCodeErrFr(id) {
        var modal = document.getElementById('modal-retro-erreurs-fr');
        if (!modal) return;
        var nomDef = _defautsNomsErrFr[id];
        var coulDef = _defautsCouleursErrFr[id];
        var nomInput = modal.querySelector('input[data-nom-id="' + id + '"]');
        if (nomInput && nomDef !== undefined) nomInput.value = nomDef;
        var colorInput = modal.querySelector('input[data-color-id="' + id + '"]');
        if (colorInput && coulDef) colorInput.value = coulDef;
        var pastille = modal.querySelector('span[data-pastille-id="' + id + '"]');
        if (pastille && coulDef) pastille.style.background = coulDef;
    }

    /* ===============================
       RAFRAICHIR PALETTES APRES PERSONNALISATION
       =============================== */

    /**
     * Ferme et rouvre les palettes visibles pour refléter les personnalisations.
     * Détecte si les palettes sont ancrées (colonne droite) ou flottantes.
     */
    function rafraichirPalettesApresPersonnalisation() {
        // Palette Annotation — rafraîchir les boutons outils et formes (badges raccourcis)
        const paletteAnnot = document.getElementById('travaux-palette-flottante');
        if (paletteAnnot) {
            const contenu = paletteAnnot.querySelector('.palette-flottante-contenu');
            if (contenu) {
                // Sauvegarder l'identité affichée
                const etudLabel = document.getElementById('travaux-annot-label-etudiant');
                const prodLabel = document.getElementById('travaux-annot-label-production');
                const etudTxt = etudLabel ? etudLabel.textContent : '--';
                const prodTxt = prodLabel ? prodLabel.textContent : '--';

                // Régénérer le contenu
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = genererHTMLPalette();
                const nouveauContenu = tempDiv.querySelector('.palette-flottante-contenu');
                if (nouveauContenu) {
                    contenu.innerHTML = nouveauContenu.innerHTML;
                }

                // Restaurer l'identité
                const newEtud = document.getElementById('travaux-annot-label-etudiant');
                const newProd = document.getElementById('travaux-annot-label-production');
                if (newEtud) newEtud.textContent = etudTxt;
                if (newProd) newProd.textContent = prodTxt;
            }
        }

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
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager('errfrModeSynthese');   // lot F : geste hors témoin (mode de synthèse des erreurs)
    }

    function obtenirModeSyntheseErrFr() {
        return db.getSync('errfrModeSynthese', 'principale');
    }

    /* ===============================
       WRAPPERS DELEGATION (Phase 5)
       =============================== */

    /** Handler slider épaisseur (oninput) */
    function setEpaisseurActiveFromSlider(el) {
        setEpaisseurActive(parseInt(el.value));
    }

    /** Ouvrir file picker import tampons */
    function ouvrirFilePickerImportTampons() {
        var input = document.getElementById('fichier-import-tampons');
        if (input) input.click();
    }

    /** Fermer modal retro observations */
    function fermerModalRetroObservations() {
        var modal = document.getElementById('modal-retro-observations');
        if (modal) modal.remove();
    }

    /** Fermer modal retro erreurs français */
    function fermerModalRetroErreursFr() {
        var modal = document.getElementById('modal-retro-erreurs-fr');
        if (modal) modal.remove();
    }

    /** Fermer modal import tampons */
    function fermerModalImportTampons() {
        // Cibler le wrapper d'import par sa classe dédiée (pas `.modal-js-overlay`,
        // qui matche aussi la bibliothèque ouverte en arrière-plan dont le parent
        // est `<body>` → `.remove()` effacerait toute l'application).
        var wrapper = document.querySelector('.modal-import-tampons');
        if (wrapper) wrapper.remove();
        delete window._tamponsImportEnAttente;
    }

    /** Confirmer import tampons + fermer */
    function confirmerEtFermerImportTampons() {
        confirmerImportTampons(window._tamponsImportEnAttente);
        fermerModalImportTampons();
    }

    // #287 — Auto-fermeture des autres pickers couleur quand un nouveau
    // s'ouvre. Évite plusieurs popovers superposés à l'écran.
    document.addEventListener('toggle', function(e) {
        if (!e.target.matches || !e.target.matches('details.travaux-retro-couleur-picker')) return;
        if (!e.target.open) return;
        document.querySelectorAll('details.travaux-retro-couleur-picker[open]').forEach(function(d) {
            if (d !== e.target) d.open = false;
        });
    }, true);
    // Coup d'œil de Grégoire (3 sept. 2026) : « il n'est pas possible de fermer la
    // palette de couleurs quand je clique à côté ». Un <details> natif ne se
    // referme que par son résumé. ⮕ Tout pointeur posé HORS d'un sélecteur ouvert
    // le referme — souris et doigt, avant tout clic — pour tous les sélecteurs
    // (palette, échelles, sous-critères) : une définition, pas une par écran.
    document.addEventListener('pointerdown', function(e) {
        var ouverts = document.querySelectorAll('details.travaux-retro-couleur-picker[open]');
        if (!ouverts.length) return;
        var cible = e.target;
        ouverts.forEach(function(d) {
            if (!(cible instanceof Node) || !d.contains(cible)) d.open = false;
        });
    }, true);

    window.travauxOutils = {
        // Constantes
        COULEURS: COULEURS,
        OUTILS: OUTILS,
        AUTOCOLLANTS: AUTOCOLLANTS,
        // Getters
        getOutilActif: getOutilActif,
        getCouleurActive: getCouleurActive,
        getEpaisseurActive: getEpaisseurActive,
        getTailleTexte: getTailleTexte,
        getImageAutocollant: getImageAutocollant,
        getAutocollant: getAutocollant,
        getPromesseAutocollant: getPromesseAutocollant,
        attendreChargementAutocollants: attendreChargementAutocollants,
        getAutocollantActif: getAutocollantActif,
        // Setters
        setOutilActif: setOutilActif,
        setCouleurActive: setCouleurActive,
        setEpaisseurActive: setEpaisseurActive,
        setTailleTexte: setTailleTexte,
        setAutocollantActif: setAutocollantActif,
        activerTamponJeton: activerTamponJeton,
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
        restaurerPositionPalette: restaurerPositionPalette,
        focusPalette: focusPalette,
        togglePaletteReplie: togglePaletteReplie,
        layoutPaletteH: layoutPaletteH,
        layoutPaletteV: layoutPaletteV,
        afficherRaccourcis: afficherRaccourcis,
        // Raccourcis clavier annotation
        obtenirRaccourcisAnnotation: obtenirRaccourcisAnnotation,
        definirRaccourci: definirRaccourci,
        obtenirItemParTouche: obtenirItemParTouche,
        obtenirRaccourciPourItem: obtenirRaccourciPourItem,
        activerItemParId: activerItemParId,
        invaliderCacheRaccourcis: invaliderCacheRaccourcis,
        // Contenu réutilisable (colonne droite + flottant)
        genererContenuErreursFr: genererContenuErreursFr,
        genererContenuTampons: genererContenuTampons,
        rafraichirPalettesApresPersonnalisation: rafraichirPalettesApresPersonnalisation,
        // Compteurs erreurs
        compterErreursFrancais: compterErreursFrancais,
        mettreAJourCompteursErreurs: mettreAJourCompteursErreurs,
        sommePondereeErreurs: sommePondereeErreurs,   // 21 oct. 2026 — exposée pour les bancs
        // Retroactions personnalisées
        obtenirRetroactionsObservations: obtenirRetroactionsObservations,
        obtenirRetroactionsErreursFr: obtenirRetroactionsErreursFr,
        // Lot 2 — la grille de la copie ouverte (null = repli), lue par le dessin et le PDF.
        grilleCourante: function() { return _grilleCourante; },
        ouvrirEditionRetroObservations: ouvrirEditionRetroObservations,
        ouvrirEditionRetroErreursFr: ouvrirEditionRetroErreursFr,
        enregistrerRetroObservations: enregistrerRetroObservations,
        enregistrerRetroErreursFr: enregistrerRetroErreursFr,
        reinitialiserRetroObservations: reinitialiserRetroObservations,
        reinitialiserCodeErrFr: reinitialiserCodeErrFr,
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
        // #760 — ce que l'élève lit des tampons d'une copie (seul lecteur)
        observationsDesTampons: observationsDesTampons,
        // Ordre personnalisé des erreurs FR
        // Mode synthèse erreurs FR (principale / toutes)
        changerModeSyntheseErrFr: changerModeSyntheseErrFr,
        obtenirModeSyntheseErrFr: obtenirModeSyntheseErrFr,
        // Bibliothèque de tampons — accès aux données
        obtenirAutocollants: function() { return AUTOCOLLANTS; },
        obtenirImageAutocollant: function(id) { return imagesAutocollants[id] || null; },
        // Wrappers delegation (Phase 5)
        setEpaisseurActiveFromSlider: setEpaisseurActiveFromSlider,
        ouvrirFilePickerImportTampons: ouvrirFilePickerImportTampons,
        fermerModalRetroObservations: fermerModalRetroObservations,
        fermerModalRetroErreursFr: fermerModalRetroErreursFr,
        fermerModalImportTampons: fermerModalImportTampons,
        confirmerEtFermerImportTampons: confirmerEtFermerImportTampons,
        // #287 — Picker couleur custom (réutilisable hors travaux-outils)
        renderPickerCouleur: renderPickerCouleur,
        choisirCouleurPalette: choisirCouleurPalette
    };

})();
