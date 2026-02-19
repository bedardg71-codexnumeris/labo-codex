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

    const COULEUR_DEFAUT = '#ff8c00'; // Orange
    const RESOLUTION_REFERENCE = 1000; // Largeur de reference pour normaliser l'epaisseur

    /* ===============================
       OUTILS
       =============================== */

    const OUTILS = {
        selection: {
            id: 'selection',
            nom: 'Selection',
            icone: '☝️',
            curseur: 'default',
            type: 'selection'
        },
        stylo: {
            id: 'stylo',
            nom: 'Stylo',
            icone: '🖊️',
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
            icone: '﹏',
            curseur: 'crosshair',
            epaisseurDefaut: 20,
            epaisseurMin: 10,
            epaisseurMax: 40,
            opacite: 0.3,
            composite: 'multiply',
            sensiblePression: true,
            facteurPression: 1.5,
            couleurForce: '#FFFF00' // jaune par defaut
        },
        gomme: {
            id: 'gomme',
            nom: 'Gomme',
            icone: '🚫',
            curseur: 'pointer',
            mode: 'effacer-trait' // efface le trait entier au contact
        },
        texte: {
            id: 'texte',
            nom: 'Texte',
            icone: '💬',
            curseur: 'text',
            tailleDefaut: 14,
            tailleMin: 10,
            tailleMax: 32
        },
        cercle: {
            id: 'cercle',
            nom: 'Cercle',
            icone: '⭕️',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        fleche: {
            id: 'fleche',
            nom: 'Fleche',
            icone: '➔',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        rectangle: {
            id: 'rectangle',
            nom: 'Rectangle',
            icone: '🔲',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        crochet: {
            id: 'crochet',
            nom: 'Crochet',
            icone: '✅',
            curseur: 'crosshair',
            type: 'symbole',
            taille: 30
        },
        croix: {
            id: 'croix',
            nom: 'Croix',
            icone: '❎',
            curseur: 'crosshair',
            type: 'symbole',
            taille: 30
        }
    };

    /* ===============================
       AUTOCOLLANTS (Tampons de retroaction)
       =============================== */

    const DOSSIER_AUTOCOLLANTS = 'autocollants/';

    const AUTOCOLLANTS = [
        { id: 'bien',           nom: 'Bien',             fichier: 'qualité 1 bien.png',                    categorie: 'qualite' },
        { id: 'tres-bien',      nom: 'Très bien',        fichier: 'qualité 2 très bien.png',               categorie: 'qualite' },
        { id: 'brillant',       nom: 'Brillant',         fichier: 'qualité 3 brillant.png',                categorie: 'qualite' },
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
        fermerPaletteAutocollants();

        // Mettre a jour le curseur
        const canvas = document.getElementById('travaux-canvas-annotation');
        if (canvas) canvas.style.cursor = 'copy';

        // Mettre a jour l'etat visuel de la palette
        rafraichirPalette();
    }

    function getAutocollantActif() {
        return autocollantActif;
    }

    /**
     * Bascule la palette d'autocollants (popup fixe au-dessus du bouton)
     */
    function togglePaletteAutocollants() {
        let popup = document.getElementById('travaux-popup-autocollants');

        if (popup) {
            // Fermer
            popup.remove();
            paletteAutoVisible = false;
            return;
        }

        // Creer le popup
        paletteAutoVisible = true;
        popup = document.createElement('div');
        popup.id = 'travaux-popup-autocollants';
        popup.className = 'travaux-popup-autocollants visible';

        // Texte introductif si aide contextuelle active
        const aideActive = typeof estAideContextuelleActive === 'function' && estAideContextuelleActive();
        let html = aideActive
            ? '<div class="autocollants-aide">📍 Appose un autocollant pour donner une rétroaction visuelle rapide. Les verts soulignent les forces, les oranges signalent des points à travailler.</div>'
            : '';

        // Qualite (rang du haut)
        html += '<div class="travaux-autocollants-label">Qualite</div>';
        html += '<div class="travaux-autocollants-grille">';
        AUTOCOLLANTS.filter(a => a.categorie === 'qualite').forEach(a => {
            html += `<div class="travaux-autocollant-item" onclick="travauxOutils.setAutocollantActif('${a.id}')" title="${a.nom}">`;
            html += `<img src="${DOSSIER_AUTOCOLLANTS}${a.fichier}" alt="${a.nom}">`;
            html += `<span>${a.nom}</span></div>`;
        });
        html += '</div>';

        // Diagnostic (rang du bas)
        html += '<div class="travaux-autocollants-label">Diagnostic</div>';
        html += '<div class="travaux-autocollants-grille">';
        AUTOCOLLANTS.filter(a => a.categorie === 'diagnostic').forEach(a => {
            html += `<div class="travaux-autocollant-item" onclick="travauxOutils.setAutocollantActif('${a.id}')" title="${a.nom}">`;
            html += `<img src="${DOSSIER_AUTOCOLLANTS}${a.fichier}" alt="${a.nom}">`;
            html += `<span>${a.nom}</span></div>`;
        });
        html += '</div>';

        popup.innerHTML = html;
        document.body.appendChild(popup);

        // Positionner au-dessus du bouton Tampons
        const btn = document.getElementById('travaux-btn-tampons');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            popup.style.left = rect.left + 'px';
            popup.style.bottom = (window.innerHeight - rect.top + 8) + 'px';

            // Ajuster si depasse a droite
            const popupRect = popup.getBoundingClientRect();
            if (popupRect.right > window.innerWidth - 8) {
                popup.style.left = (window.innerWidth - popupRect.width - 8) + 'px';
            }
            // Ajuster si depasse en haut
            if (popupRect.top < 8) {
                popup.style.bottom = 'auto';
                popup.style.top = (rect.bottom + 8) + 'px';
            }
        }

        // Fermer au clic exterieur
        setTimeout(() => {
            document.addEventListener('pointerdown', fermerPopupSiExterieur, { once: true });
        }, 0);
    }

    function fermerPopupSiExterieur(e) {
        const popup = document.getElementById('travaux-popup-autocollants');
        if (popup && !popup.contains(e.target) && e.target.id !== 'travaux-btn-tampons') {
            popup.remove();
            paletteAutoVisible = false;
        } else if (popup) {
            // Re-attacher si clic dans le popup
            document.addEventListener('pointerdown', fermerPopupSiExterieur, { once: true });
        }
    }

    function fermerPaletteAutocollants() {
        paletteAutoVisible = false;
        const popup = document.getElementById('travaux-popup-autocollants');
        if (popup) popup.remove();
    }

    // Precharger au lancement
    prechargerAutocollants();

    /* ===============================
       ETAT PALETTE
       =============================== */

    let outilActif = 'stylo';
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
            fermerPaletteAutocollants();
            // Restaurer l'epaisseur par defaut de l'outil
            if (OUTILS[id].epaisseurDefaut) {
                epaisseurActive = OUTILS[id].epaisseurDefaut;
            }
            // Notifier le changement
            window.dispatchEvent(new CustomEvent('travaux-outil-change', {
                detail: { outil: OUTILS[id] }
            }));
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
    }

    function getEpaisseurActive() {
        return epaisseurActive;
    }

    function setEpaisseurActive(val) {
        epaisseurActive = val;
        // Mettre a jour l'affichage pixels
        const pxLabel = document.getElementById('travaux-epaisseur-px');
        if (pxLabel) pxLabel.textContent = getEpaisseurReellePixels() + 'px';
    }

    function getTailleTexte() {
        return taillTexteActive;
    }

    function setTailleTexte(val) {
        taillTexteActive = val;
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
        const canvas = document.getElementById('travaux-canvas-document');
        const largeurImage = canvas ? canvas.width : RESOLUTION_REFERENCE;
        return epaisseurLogique * (largeurImage / RESOLUTION_REFERENCE);
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
        let html = '<div class="travaux-palette">';

        // Outils de dessin
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Outils</div>';
        html += '<div class="travaux-palette-outils">';

        const outilsDessin = ['selection', 'stylo', 'surligneur', 'gomme', 'texte'];
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

        const outilsFormes = ['cercle', 'fleche', 'rectangle', 'crochet', 'croix'];
        outilsFormes.forEach(id => {
            const outil = OUTILS[id];
            const actif = outilActif === id ? ' actif' : '';
            html += `<button class="travaux-btn-outil${actif}" data-outil="${id}" onclick="travauxOutils.setOutilActif('${id}')" title="${outil.nom}">${outil.icone}</button>`;
        });

        html += '</div></div>';

        // Tampons (autocollants)
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Tampons</div>';
        const tamponActif = outilActif === 'tampon' ? ' actif' : '';
        html += `<button class="travaux-btn-outil${tamponActif}" id="travaux-btn-tampons" onclick="travauxOutils.togglePaletteAutocollants()" title="Tampons de retroaction">&#x1F3F7;</button>`;
        html += '</div>';

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
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Epaisseur <span id="travaux-epaisseur-px" class="travaux-epaisseur-px">' + getEpaisseurReellePixels() + 'px</span></div>';
        html += `<input type="range" class="travaux-slider-epaisseur" min="1" max="20" value="${epaisseurActive}" oninput="travauxOutils.setEpaisseurActive(parseInt(this.value))">`;
        html += '</div>';

        html += '</div>';

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

        // Curseur du canvas
        const canvas = document.getElementById('travaux-canvas-annotation');
        if (canvas) {
            if (outilActif === 'tampon') {
                canvas.style.cursor = 'copy';
            } else {
                const outil = getOutilActif();
                canvas.style.cursor = outil.curseur || 'crosshair';
            }
        }
    }

    // Rafraichir la palette quand l'outil ou la couleur change
    window.addEventListener('travaux-outil-change', rafraichirPalette);
    window.addEventListener('travaux-couleur-change', rafraichirPalette);

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

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
        togglePaletteAutocollants: togglePaletteAutocollants
    };

})();
