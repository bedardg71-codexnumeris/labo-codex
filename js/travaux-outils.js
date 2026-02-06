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
        { id: 'rouge',  hex: '#FF0000', nom: 'Rouge' },
        { id: 'bleu',   hex: '#0066FF', nom: 'Bleu' },
        { id: 'vert',   hex: '#00AA00', nom: 'Vert' },
        { id: 'orange', hex: '#FF8800', nom: 'Orange' },
        { id: 'noir',   hex: '#000000', nom: 'Noir' },
        { id: 'violet', hex: '#8800CC', nom: 'Violet' }
    ];

    const COULEUR_DEFAUT = '#FF0000'; // Rouge

    /* ===============================
       OUTILS
       =============================== */

    const OUTILS = {
        stylo: {
            id: 'stylo',
            nom: 'Stylo',
            icone: 'M', // sera remplace par SVG dans le HTML
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
            icone: 'H',
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
            icone: 'E',
            curseur: 'pointer',
            mode: 'effacer-trait' // efface le trait entier au contact
        },
        texte: {
            id: 'texte',
            nom: 'Texte',
            icone: 'T',
            curseur: 'text',
            tailleDefaut: 14,
            tailleMin: 10,
            tailleMax: 32
        },
        cercle: {
            id: 'cercle',
            nom: 'Cercle',
            icone: 'O',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        fleche: {
            id: 'fleche',
            nom: 'Fleche',
            icone: '->',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2
        },
        rectangle: {
            id: 'rectangle',
            nom: 'Rectangle',
            icone: '[]',
            curseur: 'crosshair',
            type: 'forme',
            epaisseurDefaut: 2,
            remplir: false
        },
        crochet: {
            id: 'crochet',
            nom: 'Crochet',
            icone: 'V',
            curseur: 'crosshair',
            type: 'symbole',
            taille: 30
        },
        croix: {
            id: 'croix',
            nom: 'Croix',
            icone: 'X',
            curseur: 'crosshair',
            type: 'symbole',
            taille: 30
        }
    };

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

        const outilsDessin = ['stylo', 'surligneur', 'gomme', 'texte'];
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

        // Couleurs
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Couleur</div>';
        html += '<div class="travaux-palette-couleurs">';

        COULEURS.forEach(c => {
            const actif = couleurActive === c.hex ? ' actif' : '';
            html += `<button class="travaux-btn-couleur${actif}" data-couleur="${c.hex}" onclick="travauxOutils.setCouleurActive('${c.hex}')" title="${c.nom}" style="background-color: ${c.hex}"></button>`;
        });

        html += '</div></div>';

        // Epaisseur (slider)
        html += '<div class="travaux-palette-section">';
        html += '<div class="travaux-palette-label">Epaisseur</div>';
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
            btn.classList.toggle('actif', btn.dataset.outil === outilActif);
        });

        // Couleurs
        document.querySelectorAll('.travaux-btn-couleur').forEach(btn => {
            btn.classList.toggle('actif', btn.dataset.couleur === couleurActive);
        });

        // Curseur du canvas
        const canvas = document.getElementById('travaux-canvas-annotation');
        if (canvas) {
            const outil = getOutilActif();
            canvas.style.cursor = outil.curseur || 'crosshair';
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
        // Getters
        getOutilActif: getOutilActif,
        getCouleurActive: getCouleurActive,
        getEpaisseurActive: getEpaisseurActive,
        getTailleTexte: getTailleTexte,
        // Setters
        setOutilActif: setOutilActif,
        setCouleurActive: setCouleurActive,
        setEpaisseurActive: setEpaisseurActive,
        setTailleTexte: setTailleTexte,
        // Pression
        courbeDePresson: courbeDePresson,
        calculerEpaisseurPression: calculerEpaisseurPression,
        // UI
        genererHTMLPalette: genererHTMLPalette,
        rafraichirPalette: rafraichirPalette
    };

})();
