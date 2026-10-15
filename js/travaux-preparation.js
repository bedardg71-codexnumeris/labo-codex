/* ===============================
   MODULE: TRAVAUX - PREPARATION
   Poste de preparation des images AVANT import.
   Outils semi-automatiques : rotation, crop, perspective (+ auto-detection),
   luminosite, contraste, exposition, balance des blancs, niveaux de gris.

   Pile de transformations non-destructive.
   Deux modes de rendu : apercu interactif (1600px) et final (pleine resolution).

   DEPENDANCES:
   - travaux-import.js (fichiersEnAttente)
   - travaux-stockage.js (obtenirThumbnailSync)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    const TAILLE_APERCU = 1600;       // Copie de travail max px
    const MESH_N = 8;                 // Subdivision perspective apercu
    const POIGNEE_TAILLE = 44;        // px (Apple HIG)
    const POIGNEE_RAYON  = 10;        // px — rayon visuel des poignees (crop + perspective)
    const LOUPE_TAILLE = 100;         // px
    const LOUPE_ZOOM = 2;
    const ROTATION_FINE_MIN = -15;
    const ROTATION_FINE_MAX = 15;
    const LUMINOSITE_MIN = -100;
    const LUMINOSITE_MAX = 100;
    const CONTRASTE_MIN = -100;
    const CONTRASTE_MAX = 100;
    const EXPOSITION_MIN = -20;          // -2.0 EV
    const EXPOSITION_MAX = 20;           // +2.0 EV
    const BATCH_SIZE = 10000;         // Pixels par lot pour le rendu final
    const PERSPECTIVE_MARGE_MAX = 1.0;   // limites des coins perspective (-1.0 a 2.0)

    // Workspace zoomable (3 couches imbriquees)
    const PREP_WORKSPACE_MULT = 3;       // workspace = 3x image dans chaque dimension
    const PREP_ZOOM_MIN = 0.15;
    const PREP_ZOOM_MAX = 4;
    const PREP_ZOOM_WHEEL_FACTOR = 1.08;

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let actif = false;
    let timerBoutonsOutils = null;    // #572 : id du setInterval, pour pouvoir l'arrêter
    let fichiers = [];                // Copies locales des fichiers en attente
    let indexActuel = 0;              // Fichier courant
    let queueOffset = 0;             // Decalage dans la queue pour mode fichier unique
    let imageOriginale = null;        // Image pleine resolution du fichier courant
    let imageTravail = null;          // Canvas copie de travail (1600px)
    let canvasApercu = null;          // Canvas d'apercu visible
    let ctxApercu = null;
    let operations = [];              // Pile d'operations pour le fichier courant

    // Cache geometrie (canvas intermediaire pre-calcule)
    let canvasGeometrique = null;     // Canvas avec ops geometriques appliquees

    // Etat des outils interactifs
    let outilActif = null;            // 'crop' | 'perspective' | 'balance' | null
    let cropRect = null;              // {x, y, width, height} en fractions 0-1
    let perspectiveCorners = null;    // [{x,y}, {x,y}, {x,y}, {x,y}] en fractions 0-1
    let poigneeActive = -1;           // Index de la poignee draggee (-1 = aucune)
    let cropDragState = null;         // Etat du drag pour le crop
    let perspectiveFill = 'white';  // 'none' | 'white' | 'auto'

    // Etat zoom/pan du workspace
    let prepZoom = 1;
    let prepEspaceW = 0;              // largeur workspace (pixels non-zoomes)
    let prepEspaceH = 0;              // hauteur workspace
    let prepOffsetX = 0;              // position X de l'image dans le workspace
    let prepOffsetY = 0;              // position Y de l'image dans le workspace
    let prepScrollContainer = null;
    let prepEspaceWrapper = null;
    let prepEspace = null;
    let canvasOverlay = null;
    let ctxOverlay = null;

    // Assemblage multi-pages
    let selections = new Set();       // Indices des fichiers selectionnes pour grouper
    let documentGroups = new Map();   // Map<groupId, [indices]>

    // Callbacks
    let onTerminer = null;            // Callback quand l'utilisateur confirme

    /* ===============================
       ENTREE / SORTIE DU POSTE
       =============================== */

    /**
     * Ouvre le poste de preparation avec les fichiers en attente.
     *
     * Deux modes :
     * - Mode import standard (offset >= 0) : écrit les blobs traités dans
     *   `travauxImport.obtenirFileDAttente()[i + offset].fichier`. Le callback
     *   n'est pas utilisé. Appelle `window.rafraichirImportTravaux()` après.
     * - Mode ad-hoc (offset === -1) : ne touche pas à la queue d'import.
     *   Appelle `callback(fichiersTraites)` à la confirmation OU au « Passer »
     *   avec un tableau de fichiers où `f.blobTraite` contient le blob traité
     *   (ou null/undefined si pas d'opérations — utiliser `f.fichier` comme
     *   fallback). Sur fermeture par X, callback non appelé (abandon).
     *
     * @param {Array} fichiersEnAttente - Liste des fichiers prepares
     * @param {Function} callback - Appele avec les fichiers traites en mode ad-hoc
     * @param {number} offset - 0+ pour mode import standard, -1 pour mode ad-hoc
     */
    function ouvrir(fichiersEnAttente, callback, offset) {
        if (!fichiersEnAttente || fichiersEnAttente.length === 0) return;

        queueOffset = (typeof offset === 'number') ? offset : 0;
        fichiers = fichiersEnAttente.map(f => ({
            ...f,
            operations: [],
            blobTraite: null,
            groupeId: null
        }));
        indexActuel = 0;
        onTerminer = callback;
        actif = true;
        selections.clear();
        documentGroups.clear();

        afficherUI();
        chargerFichier(0);
    }

    /**
     * Ferme le poste de preparation sans appliquer
     */
    function fermer() {
        libererMemoire();
        actif = false;
        // #572 — arrêter le timer des boutons d'outils : la modale est retirée
        // du DOM juste après, le timer n'aurait plus rien à observer.
        if (timerBoutonsOutils) {
            clearInterval(timerBoutonsOutils);
            timerBoutonsOutils = null;
        }
        const modal = document.getElementById('travaux-preparation-modal');
        if (modal) modal.remove();
    }

    /**
     * Passe l'étape de préparation.
     *
     * - Mode import standard : ferme la modale, les blobs originaux restent
     *   dans `fichiersEnAttente` (l'import standard les utilise tels quels).
     * - Mode ad-hoc (offset === -1) : appelle `callback(fichiers)` avec les
     *   blobs originaux pour signaler que l'utilisateur veut ajouter les pages
     *   sans préparation.
     */
    function passer() {
        const modeAdHoc = (queueOffset === -1);
        const callbackToCall = (modeAdHoc && typeof onTerminer === 'function') ? onTerminer : null;
        const fichiersCopie = Array.isArray(fichiers) ? fichiers.slice() : [];
        fermer();
        if (callbackToCall) callbackToCall(fichiersCopie);
    }

    /**
     * Confirme et applique les transformations
     */
    async function confirmer() {
        // Auto-confirmer l'outil actif s'il reste en attente
        if (outilActif === 'perspective' && perspectiveCorners) {
            appliquerPerspective();
        } else if (outilActif === 'crop' && cropRect) {
            appliquerCrop();
        }

        // Compter les fichiers a traiter
        const aTraiter = fichiers.filter(f => f.operations.length > 0);
        aTraiter.forEach((f, idx) => {
        });

        if (aTraiter.length === 0) {
            // #877 — en mode ad hoc (« + Ajouter des pages »), rien à traiter
            // veut dire « ajoute les pages telles quelles » : c'est `passer()`.
            // Cette branche fermait la modale sans rappeler l'éditeur, et
            // « Confirmer » ne produisait rien (rapport du 15 sept. 2026, 19 h 01).
            if (queueOffset === -1) {
                passer();
                return;
            }
            fermer();
            if (typeof window.rafraichirImportTravaux === 'function') {
                window.rafraichirImportTravaux();
            }
            return;
        }

        // Afficher la progression
        const btnConfirmer = document.getElementById('prep-btn-confirmer');
        const barreContainer = document.getElementById('prep-progress-bar');
        const barreFill = document.getElementById('prep-progress-fill');
        const barreText = document.getElementById('prep-progress-text');
        if (btnConfirmer) {
            btnConfirmer.disabled = true;
            btnConfirmer.textContent = 'Traitement...';
        }
        if (barreContainer) barreContainer.style.display = 'flex';

        let traites = 0;
        let reussis = 0;
        const modeAdHoc = (queueOffset === -1);
        const queue = modeAdHoc ? null : travauxImport.obtenirFileDAttente();

        for (let i = 0; i < fichiers.length; i++) {
            const f = fichiers[i];
            if (f.operations.length === 0) continue;

            traites++;
            const pct = Math.round((traites / aTraiter.length) * 100);
            if (barreFill) barreFill.style.width = pct + '%';
            if (barreText) barreText.textContent = `${traites} / ${aTraiter.length}`;

            try {
                const blobFinal = await renduFinal(f);

                if (blobFinal) {
                    // Toujours stocker dans f pour mode ad-hoc / inspection
                    f.blobTraite = blobFinal;

                    if (!modeAdHoc && queue && queue[i + queueOffset]) {
                        queue[i + queueOffset].fichier = blobFinal;
                        queue[i + queueOffset].tailleFichier = blobFinal.size;
                        // Regenerer la thumbnail pour que le pipeline affiche l'image corrigee
                        queue[i + queueOffset].thumbnailDataUrl = null;
                        // Ecrire les operations dans la queue pour affichage colonne droite.
                        // #884 — AJOUTER, pas remplacer : `ouvrir()` repart d'une pile
                        // vide sur un blob DÉJÀ traité ; la liste complète est ce que
                        // « Re-déposer les fichiers » rejoue sur l'original.
                        const dejaCuites = Array.isArray(queue[i + queueOffset].operations)
                            ? queue[i + queueOffset].operations : [];
                        queue[i + queueOffset].operations = dejaCuites.concat(f.operations);
                    }
                    reussis++;
                }
            } catch (err) {
                console.error(`[Travaux-Preparation] Erreur rendu fichier ${i} (${f.nomFichier}):`, err);
            }
        }


        // Conserver onTerminer avant fermer() (qui libère l'état)
        const callbackToCall = (modeAdHoc && typeof onTerminer === 'function') ? onTerminer : null;
        const fichiersCopie = modeAdHoc ? fichiers.slice() : null;

        // #884 — la liste des réglages doit survivre à un rechargement : c'est
        // elle qui permet de les réappliquer au re-dépôt.
        if (!modeAdHoc && typeof travauxImport.persisterFileDAttente === 'function') {
            travauxImport.persisterFileDAttente();
        }

        fermer();

        if (callbackToCall) {
            callbackToCall(fichiersCopie);
        } else if (typeof window.rafraichirImportTravaux === 'function') {
            // Rafraichir l'UI d'import (mode standard)
            window.rafraichirImportTravaux();
        }
    }

    /* ===============================
       GESTION MEMOIRE
       =============================== */

    function libererMemoire() {
        if (imageTravail) {
            imageTravail.width = 0;
            imageTravail.height = 0;
            imageTravail = null;
        }
        if (canvasGeometrique) {
            canvasGeometrique.width = 0;
            canvasGeometrique.height = 0;
            canvasGeometrique = null;
        }
        if (canvasApercu) {
            canvasApercu.width = 0;
            canvasApercu.height = 0;
        }
        if (canvasOverlay) {
            canvasOverlay.width = 0;
            canvasOverlay.height = 0;
        }
        imageOriginale = null;
        operations = [];
        outilActif = null;
        cropRect = null;
        perspectiveCorners = null;
        // Reset zoom state
        prepZoom = 1;
        prepScrollContainer = null;
        prepEspaceWrapper = null;
        prepEspace = null;
        canvasOverlay = null;
        ctxOverlay = null;
    }

    /* ===============================
       CHARGEMENT FICHIER
       =============================== */

    /**
     * Charge un fichier pour l'edition
     * @param {number} index - Index dans la liste
     */
    async function chargerFichier(index) {
        if (index < 0 || index >= fichiers.length) return;

        // Auto-confirmer l'outil actif du fichier precedent avant de changer
        if (outilActif === 'perspective' && perspectiveCorners) {
            appliquerPerspective();
        } else if (outilActif === 'crop' && cropRect) {
            appliquerCrop();
        }

        // Liberer l'image precedente
        imageOriginale = null;
        if (imageTravail) {
            imageTravail.width = 0;
            imageTravail = null;
        }

        indexActuel = index;
        const f = fichiers[index];
        operations = f.operations;
        outilActif = null;
        cropRect = null;
        perspectiveCorners = null;
        canvasGeometrique = null;

        // Charger l'image
        const blob = f.fichier;
        if (!blob) { console.warn('[Prep] Blob absent — fichier restaure depuis session?'); return; }

        try {
            imageOriginale = await chargerImage(blob);
            imageTravail = creerCopieTravail(imageOriginale);
        } catch (err) {
            console.error('[Prep] Erreur chargement image:', err);
            return;
        }

        mettreAJourApercu();
        prepZoomFit();
        mettreAJourMiniatures();
        mettreAJourNavigation();
        syncOptImport();
    }

    /**
     * Charge une image depuis un blob/File
     * @param {Blob|File} blob
     * @returns {Promise<HTMLImageElement>}
     */
    function chargerImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Erreur chargement')); };
            img.src = url;
        });
    }

    /**
     * Cree une copie de travail redimensionnee a TAILLE_APERCU px
     * @param {HTMLImageElement} img
     * @returns {HTMLCanvasElement}
     */
    function creerCopieTravail(img) {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (w > TAILLE_APERCU || h > TAILLE_APERCU) {
            if (w > h) {
                h = Math.round(h * (TAILLE_APERCU / w));
                w = TAILLE_APERCU;
            } else {
                w = Math.round(w * (TAILLE_APERCU / h));
                h = TAILLE_APERCU;
            }
        }

        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        return canvas;
    }

    /* ===============================
       PILE D'OPERATIONS
       =============================== */

    /**
     * Determine si une operation est geometrique (necessite un redessin)
     */
    function estOperationGeometrique(op) {
        return op.type === 'rotation90' || op.type === 'fineRotation' ||
               op.type === 'crop' || op.type === 'perspective' || op.type === 'whiteBalance';
    }

    function ajouterOperation(op) {
        operations.push(op);
        fichiers[indexActuel].operations = operations;

        if (estOperationGeometrique(op)) {
            canvasGeometrique = null;
            mettreAJourApercu();
        } else {
            mettreAJourFiltresTempsReel();
        }
    }

    /**
     * Annule la derniere operation (undo)
     */
    function annulerDerniere() {
        if (operations.length === 0) return;
        operations.pop();
        fichiers[indexActuel].operations = operations;
        canvasGeometrique = null;
        mettreAJourApercu();
    }

    /**
     * Reinitialise toutes les operations
     */
    function reinitialiser() {
        operations = [];
        fichiers[indexActuel].operations = operations;
        outilActif = null;
        cropRect = null;
        perspectiveCorners = null;
        canvasGeometrique = null;
        mettreAJourApercu();
    }

    /* ===============================
       ZOOM / PAN DU WORKSPACE
       =============================== */

    function calculerEspaceParams() {
        const source = canvasGeometrique || imageTravail;
        if (!source) return;
        prepEspaceW = source.width * PREP_WORKSPACE_MULT;
        prepEspaceH = source.height * PREP_WORKSPACE_MULT;
        prepOffsetX = source.width;   // 1x image de marge a gauche
        prepOffsetY = source.height;  // 1x image de marge en haut
    }

    function prepAppliquerZoom() {
        if (!prepEspace || !prepEspaceWrapper) return;
        prepEspace.style.transform = 'scale(' + prepZoom + ')';
        prepEspaceWrapper.style.width = (prepEspaceW * prepZoom) + 'px';
        prepEspaceWrapper.style.height = (prepEspaceH * prepZoom) + 'px';
        var info = document.getElementById('prep-zoom-info');
        if (info) info.textContent = Math.round(prepZoom * 100) + '%';
        // Mettre a jour les boutons preset
        var zoomArrondi = Math.round(prepZoom * 100);
        document.querySelectorAll('.prep-btn-zoom').forEach(function(btn) {
            var val = btn.dataset.zoom;
            if (val && val !== 'fit') {
                btn.classList.toggle('actif', Math.round(parseFloat(val) * 100) === zoomArrondi);
            }
        });
    }

    function prepZoomer(clientX, clientY, facteur) {
        var oldZoom = prepZoom;
        prepZoom = Math.max(PREP_ZOOM_MIN, Math.min(PREP_ZOOM_MAX, prepZoom * facteur));
        if (prepZoom === oldZoom) return;
        prepAppliquerZoom();
        // Zoom-to-cursor : garder le point sous le curseur stable
        var rect = prepScrollContainer.getBoundingClientRect();
        var cx = clientX - rect.left, cy = clientY - rect.top;
        var espX = (cx + prepScrollContainer.scrollLeft) / oldZoom;
        var espY = (cy + prepScrollContainer.scrollTop) / oldZoom;
        prepScrollContainer.scrollLeft = espX * prepZoom - cx;
        prepScrollContainer.scrollTop = espY * prepZoom - cy;
    }

    function prepZoomFit() {
        var source = canvasGeometrique || imageTravail;
        if (!source || !prepScrollContainer) return;
        var vpW = prepScrollContainer.clientWidth;
        var vpH = prepScrollContainer.clientHeight;
        prepZoom = Math.min(vpW / (source.width * 1.4), vpH / (source.height * 1.4), 2);
        prepZoom = Math.max(PREP_ZOOM_MIN, Math.min(PREP_ZOOM_MAX, prepZoom));
        prepAppliquerZoom();
        prepCentrerSurImage();
    }

    function prepCentrerSurImage() {
        var source = canvasGeometrique || imageTravail;
        if (!source || !prepScrollContainer) return;
        var cx = (prepOffsetX + source.width / 2) * prepZoom;
        var cy = (prepOffsetY + source.height / 2) * prepZoom;
        prepScrollContainer.scrollLeft = cx - prepScrollContainer.clientWidth / 2;
        prepScrollContainer.scrollTop = cy - prepScrollContainer.clientHeight / 2;
    }

    /* ===============================
       RENDU APERCU (interactif)
       =============================== */

    /**
     * Recalcule le canvas intermediaire avec les operations geometriques uniquement
     * (rotation, crop, perspective, whiteBalance)
     */
    function mettreAJourGeometrie() {
        if (!imageTravail) return;

        let tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageTravail.width;
        tempCanvas.height = imageTravail.height;
        tempCanvas.getContext('2d').drawImage(imageTravail, 0, 0);

        for (const op of operations) {
            if (estOperationGeometrique(op)) {
                tempCanvas = appliquerOperationApercu(tempCanvas, op);
            }
        }

        canvasGeometrique = tempCanvas;
    }

    /**
     * Applique toutes les operations sur la copie de travail et affiche l'apercu.
     * Utilise le cache geometrique quand disponible.
     * Canvas image (apercu) = image seule, Canvas overlay = poignees.
     */
    function mettreAJourApercu() {
        if (!imageTravail || !canvasApercu) return;

        // Recalculer la geometrie si necessaire
        if (!canvasGeometrique) {
            mettreAJourGeometrie();
        }

        const source = canvasGeometrique;

        calculerEspaceParams();

        // Canvas image = taille exacte de l'image, positionne a l'offset
        canvasApercu.width = source.width;
        canvasApercu.height = source.height;
        canvasApercu.style.left = prepOffsetX + 'px';
        canvasApercu.style.top = prepOffsetY + 'px';
        canvasApercu.style.width = '';
        canvasApercu.style.height = '';
        ctxApercu.drawImage(source, 0, 0);

        // Appliquer les filtres CSS via style (GPU)
        canvasApercu.style.filter = construireFiltresCSS(operations);

        // Overlay = taille du workspace entier
        canvasOverlay.width = prepEspaceW;
        canvasOverlay.height = prepEspaceH;

        // Espace container
        prepEspace.style.width = prepEspaceW + 'px';
        prepEspace.style.height = prepEspaceH + 'px';

        prepAppliquerZoom();
        mettreAJourOverlay();
    }

    /**
     * Dessine les poignees sur le canvas overlay (rapide, appele pendant le drag).
     */
    function mettreAJourOverlay() {
        if (!ctxOverlay) return;
        ctxOverlay.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
        const source = canvasGeometrique || imageTravail;
        if (!source) return;

        if (outilActif === 'crop' && cropRect) {
            dessinerCrop(ctxOverlay, source.width, source.height);
        }
        if (outilActif === 'perspective' && perspectiveCorners) {
            dessinerPerspective(ctxOverlay, source.width, source.height, prepOffsetX, prepOffsetY);
        }
    }

    /**
     * Met a jour uniquement les filtres CSS (brightness/contrast/grayscale)
     * directement via canvas.style.filter — ultra-rapide, aucun redessin canvas.
     */
    function mettreAJourFiltresTempsReel() {
        if (!canvasApercu) return;
        canvasApercu.style.filter = construireFiltresCSS(operations);
    }

    /**
     * Construit la chaine de filtres CSS pour luminosite/contraste/NdG
     * @param {Array} ops - Pile d'operations
     * @returns {string} Chaine de filtres CSS
     */
    function construireFiltresCSS(ops) {
        const parts = [];
        for (const op of ops) {
            if (op.type === 'brightness') {
                parts.push(`brightness(${100 + op.value}%)`);
            } else if (op.type === 'contrast') {
                parts.push(`contrast(${100 + op.value}%)`);
            } else if (op.type === 'exposure') {
                // Courbe exponentielle : 2^EV (stops photo)
                parts.push(`brightness(${Math.pow(2, op.value / 10) * 100}%)`);
            } else if (op.type === 'grayscale' && op.active) {
                parts.push('grayscale(1)');
            }
        }
        return parts.length > 0 ? parts.join(' ') : '';
    }

    /**
     * Applique une seule operation geometrique sur un canvas (apercu)
     * @param {HTMLCanvasElement} source - Canvas source
     * @param {Object} op - Operation
     * @returns {HTMLCanvasElement} Canvas resultat
     */
    function appliquerOperationApercu(source, op) {
        const ctx = source.getContext('2d');

        switch (op.type) {
            case 'rotation90': {
                const result = document.createElement('canvas');
                if (op.direction === 'cw') {
                    result.width = source.height;
                    result.height = source.width;
                    const rCtx = result.getContext('2d');
                    rCtx.translate(result.width, 0);
                    rCtx.rotate(Math.PI / 2);
                    rCtx.drawImage(source, 0, 0);
                } else {
                    result.width = source.height;
                    result.height = source.width;
                    const rCtx = result.getContext('2d');
                    rCtx.translate(0, result.height);
                    rCtx.rotate(-Math.PI / 2);
                    rCtx.drawImage(source, 0, 0);
                }
                return result;
            }

            case 'fineRotation': {
                const rad = op.degrees * Math.PI / 180;
                const cos = Math.abs(Math.cos(rad));
                const sin = Math.abs(Math.sin(rad));
                const nw = Math.ceil(source.width * cos + source.height * sin);
                const nh = Math.ceil(source.width * sin + source.height * cos);

                const result = document.createElement('canvas');
                result.width = nw;
                result.height = nh;
                const rCtx = result.getContext('2d');
                rCtx.translate(nw / 2, nh / 2);
                rCtx.rotate(rad);
                rCtx.drawImage(source, -source.width / 2, -source.height / 2);
                return result;
            }

            case 'crop': {
                const sx = Math.round(op.x * source.width);
                const sy = Math.round(op.y * source.height);
                const sw = Math.round(op.width * source.width);
                const sh = Math.round(op.height * source.height);

                const result = document.createElement('canvas');
                result.width = sw;
                result.height = sh;
                result.getContext('2d').drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
                return result;
            }

            case 'perspective': {
                return appliquerPerspectiveMesh(source, op.corners, op.fill);
            }

            case 'whiteBalance': {
                const imgData = source.getContext('2d').getImageData(0, 0, source.width, source.height);
                const d = imgData.data;
                for (let i = 0; i < d.length; i += 4) {
                    d[i]     = Math.min(255, Math.round(d[i]     * op.rFactor));
                    d[i + 1] = Math.min(255, Math.round(d[i + 1] * op.gFactor));
                    d[i + 2] = Math.min(255, Math.round(d[i + 2] * op.bFactor));
                }
                source.getContext('2d').putImageData(imgData, 0, 0);
                return source;
            }

            // brightness, contrast, grayscale sont traites par CSS filter
            default:
                return source;
        }
    }

    /* ===============================
       CORRECTION DE PERSPECTIVE
       =============================== */

    /**
     * Apercu : subdivision mesh N=8 (128 triangles)
     * Pour chaque cellule de la grille, calcule les 4 coins source par
     * interpolation bilineaire des coins utilisateur, puis dessine 2 triangles
     * avec ctx.setTransform() + ctx.clip() + ctx.drawImage()
     *
     * @param {HTMLCanvasElement} source - Image source
     * @param {Array} corners - [{x,y}, {x,y}, {x,y}, {x,y}] en fractions 0-1 (TL, TR, BR, BL)
     * @returns {HTMLCanvasElement} Canvas avec perspective corrigee
     */
    function appliquerPerspectiveMesh(source, corners, fill) {
        const w = source.width;
        const h = source.height;
        const result = document.createElement('canvas');
        result.width = w;
        result.height = h;
        const ctx = result.getContext('2d');

        // Pre-remplissage du fond
        if (fill && fill !== 'none') {
            const fillColor = fill === 'auto' ? echantillonnerCouleurPage(source) : fill;
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, w, h);
        }

        // Coins source en pixels
        const c = corners.map(p => ({ x: p.x * w, y: p.y * h }));

        for (let row = 0; row < MESH_N; row++) {
            for (let col = 0; col < MESH_N; col++) {
                const u0 = col / MESH_N;
                const u1 = (col + 1) / MESH_N;
                const v0 = row / MESH_N;
                const v1 = (row + 1) / MESH_N;

                // Points destination (grille reguliere)
                const dx0 = u0 * w, dy0 = v0 * h;
                const dx1 = u1 * w, dy1 = v0 * h;
                const dx2 = u1 * w, dy2 = v1 * h;
                const dx3 = u0 * w, dy3 = v1 * h;

                // Points source (interpolation bilineaire des 4 coins)
                const sx0 = interpBilineaire(c, u0, v0);
                const sx1 = interpBilineaire(c, u1, v0);
                const sx2 = interpBilineaire(c, u1, v1);
                const sx3 = interpBilineaire(c, u0, v1);

                // Dessiner 2 triangles pour cette cellule
                dessinerTriangle(ctx, source,
                    sx0.x, sx0.y, sx1.x, sx1.y, sx2.x, sx2.y,
                    dx0, dy0, dx1, dy1, dx2, dy2
                );
                dessinerTriangle(ctx, source,
                    sx0.x, sx0.y, sx2.x, sx2.y, sx3.x, sx3.y,
                    dx0, dy0, dx2, dy2, dx3, dy3
                );
            }
        }

        return result;
    }

    /**
     * Interpolation bilineaire d'un point dans le quadrilatere defini par 4 coins
     * @param {Array} c - 4 coins [{x,y}] (TL, TR, BR, BL)
     * @param {number} u - Coordonnee horizontale 0-1
     * @param {number} v - Coordonnee verticale 0-1
     * @returns {{x, y}} Position interpolee
     */
    function interpBilineaire(c, u, v) {
        const x = (1 - u) * (1 - v) * c[0].x + u * (1 - v) * c[1].x +
                  u * v * c[2].x + (1 - u) * v * c[3].x;
        const y = (1 - u) * (1 - v) * c[0].y + u * (1 - v) * c[1].y +
                  u * v * c[2].y + (1 - u) * v * c[3].y;
        return { x, y };
    }

    /**
     * Dessine un triangle de l'image source vers la destination via affine transform
     */
    function dessinerTriangle(ctx, img,
        sx0, sy0, sx1, sy1, sx2, sy2,
        dx0, dy0, dx1, dy1, dx2, dy2
    ) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(dx0, dy0);
        ctx.lineTo(dx1, dy1);
        ctx.lineTo(dx2, dy2);
        ctx.closePath();
        ctx.clip();

        // Calcul de la matrice affine : src → dst
        // [sx0, sy0] → [dx0, dy0]
        // [sx1, sy1] → [dx1, dy1]
        // [sx2, sy2] → [dx2, dy2]
        const denom = (sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1));
        if (Math.abs(denom) < 0.001) { ctx.restore(); return; }

        const a = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
        const b = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
        const e = (dx0 * (sx1 * sy2 - sx2 * sy1) + dx1 * (sx2 * sy0 - sx0 * sy2) + dx2 * (sx0 * sy1 - sx1 * sy0)) / denom;

        const cc = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
        const d = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
        const f = (dy0 * (sx1 * sy2 - sx2 * sy1) + dy1 * (sx2 * sy0 - sx0 * sy2) + dy2 * (sx0 * sy1 - sx1 * sy0)) / denom;

        ctx.setTransform(a, cc, b, d, e, f);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
    }

    /**
     * Rendu final pixel-par-pixel avec interpolation bilineaire
     * Pour chaque pixel destination (u,v), calcule la position source par
     * interpolation bilineaire inverse des 4 coins
     *
     * @param {Object} fichierData - Donnees du fichier
     * @returns {Promise<Blob>} Blob final JPEG
     */
    async function renduFinal(fichierData) {
        if (!fichierData.fichier || fichierData.operations.length === 0) {
            return null;
        }

        const img = await chargerImage(fichierData.fichier);
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);

        // Appliquer les operations
        for (const op of fichierData.operations) {
            if (op.type === 'perspective') {
                canvas = await renduPerspectivePixel(canvas, op.corners, op.fill);
            } else if (op.type === 'whiteBalance') {
                const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                const d = imgData.data;
                for (let i = 0; i < d.length; i += 4) {
                    d[i]     = Math.min(255, Math.round(d[i]     * op.rFactor));
                    d[i + 1] = Math.min(255, Math.round(d[i + 1] * op.gFactor));
                    d[i + 2] = Math.min(255, Math.round(d[i + 2] * op.bFactor));
                }
                canvas.getContext('2d').putImageData(imgData, 0, 0);
            } else if (op.type === 'brightness' || op.type === 'contrast' || op.type === 'exposure' || op.type === 'grayscale') {
                // Appliquer via CSS filter
                const temp = document.createElement('canvas');
                temp.width = canvas.width;
                temp.height = canvas.height;
                const tCtx = temp.getContext('2d');
                tCtx.filter = construireFiltresCSS([op]);
                tCtx.drawImage(canvas, 0, 0);
                tCtx.filter = 'none';
                canvas = temp;
            } else {
                canvas = appliquerOperationApercu(canvas, op);
            }
        }

        // Convertir en blob JPEG
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                canvas.width = 0;
                if (!blob) {
                    reject(new Error('toBlob a retourne null'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.92);
        });
    }

    /**
     * Rendu perspective pixel-par-pixel avec interpolation bilineaire
     * Pour chaque pixel destination, calcule la position source
     * Traitement par lots pour garder l'UI reactive
     *
     * @param {HTMLCanvasElement} source
     * @param {Array} corners - 4 coins en fractions 0-1
     * @returns {Promise<HTMLCanvasElement>}
     */
    function renduPerspectivePixel(source, corners, fill) {
        return new Promise((resolve, reject) => {
            try {
                const w = source.width;
                const h = source.height;
                const srcData = source.getContext('2d').getImageData(0, 0, w, h);
                const srcPixels = srcData.data;

                const result = document.createElement('canvas');
                result.width = w;
                result.height = h;
                const dstData = result.getContext('2d').createImageData(w, h);
                const dstPixels = dstData.data;

                // Pre-remplissage des pixels
                if (fill && fill !== 'none') {
                    const fillColor = fill === 'auto' ? echantillonnerCouleurPage(source) : fill;
                    const tmp = document.createElement('canvas');
                    tmp.width = 1; tmp.height = 1;
                    const tmpCtx = tmp.getContext('2d');
                    tmpCtx.fillStyle = fillColor;
                    tmpCtx.fillRect(0, 0, 1, 1);
                    const [fr, fg, fb] = tmpCtx.getImageData(0, 0, 1, 1).data;
                    for (let i = 0; i < dstPixels.length; i += 4) {
                        dstPixels[i] = fr; dstPixels[i+1] = fg;
                        dstPixels[i+2] = fb; dstPixels[i+3] = 255;
                    }
                }

                const c = corners.map(p => ({ x: p.x * w, y: p.y * h }));
                let pixelIndex = 0;
                const totalPixels = w * h;

                // Timeout de securite : 60 secondes max
                const timeout = setTimeout(() => {
                    console.warn('[Travaux-Preparation] renduPerspectivePixel timeout — fallback mesh');
                    result.getContext('2d').putImageData(dstData, 0, 0);
                    resolve(result);
                }, 60000);

                function traiterLot() {
                    try {
                        const fin = Math.min(pixelIndex + BATCH_SIZE, totalPixels);

                        for (; pixelIndex < fin; pixelIndex++) {
                            const dx = pixelIndex % w;
                            const dy = Math.floor(pixelIndex / w);
                            const u = dx / w;
                            const v = dy / h;

                            const src = interpBilineaire(c, u, v);

                            const sx = src.x;
                            const sy = src.y;
                            const x0 = Math.floor(sx);
                            const y0 = Math.floor(sy);
                            const x1 = Math.min(x0 + 1, w - 1);
                            const y1 = Math.min(y0 + 1, h - 1);

                            if (x0 < 0 || x0 >= w || y0 < 0 || y0 >= h) continue;

                            const fx = sx - x0;
                            const fy = sy - y0;
                            const fx1 = 1 - fx;
                            const fy1 = 1 - fy;

                            const i00 = (y0 * w + x0) * 4;
                            const i10 = (y0 * w + x1) * 4;
                            const i01 = (y1 * w + x0) * 4;
                            const i11 = (y1 * w + x1) * 4;

                            const di = pixelIndex * 4;

                            for (let ch = 0; ch < 4; ch++) {
                                dstPixels[di + ch] = Math.round(
                                    srcPixels[i00 + ch] * fx1 * fy1 +
                                    srcPixels[i10 + ch] * fx * fy1 +
                                    srcPixels[i01 + ch] * fx1 * fy +
                                    srcPixels[i11 + ch] * fx * fy
                                );
                            }
                        }

                        if (pixelIndex < totalPixels) {
                            setTimeout(traiterLot, 0);
                        } else {
                            clearTimeout(timeout);
                            result.getContext('2d').putImageData(dstData, 0, 0);
                            resolve(result);
                        }
                    } catch (err) {
                        clearTimeout(timeout);
                        console.error('[Travaux-Preparation] Erreur dans traiterLot:', err);
                        result.getContext('2d').putImageData(dstData, 0, 0);
                        resolve(result);
                    }
                }

                traiterLot();
            } catch (err) {
                console.error('[Travaux-Preparation] Erreur init renduPerspectivePixel:', err);
                reject(err);
            }
        });
    }

    /* ===============================
       DESSIN DES OUTILS INTERACTIFS
       =============================== */

    function dessinerPoignee(ctx, cx, cy, active) {
        var r = POIGNEE_RAYON / prepZoom;     // rayon constant a l'ecran
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = active ? 'rgba(220, 235, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        ctx.lineWidth = 1.5 / prepZoom;       // epaisseur constante a l'ecran
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Dessine le rectangle de crop avec les poignees (en coordonnees workspace)
     */
    function dessinerCrop(ctx, w, h) {
        if (!cropRect) return;

        var x = cropRect.x * w + prepOffsetX;
        var y = cropRect.y * h + prepOffsetY;
        var rw = cropRect.width * w;
        var rh = cropRect.height * h;

        // Zone sombre autour du crop (zone image uniquement)
        var ix = prepOffsetX, iy = prepOffsetY;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(ix, iy, w, cropRect.y * h);                                            // haut
        ctx.fillRect(ix, y, cropRect.x * w, rh);                                            // gauche
        ctx.fillRect(x + rw, y, w - (cropRect.x + cropRect.width) * w, rh);                  // droite
        ctx.fillRect(ix, y + rh, w, h - (cropRect.y + cropRect.height) * h);                 // bas

        // Bordure du crop
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2 / prepZoom;
        ctx.strokeRect(x, y, rw, rh);

        // Poignees aux 4 coins
        var coins = [
            { px: x, py: y },
            { px: x + rw, py: y },
            { px: x + rw, py: y + rh },
            { px: x, py: y + rh }
        ];

        var coinActif = (cropDragState && cropDragState.mode === 'resize') ? cropDragState.corner : -1;
        coins.forEach(function(c, i) {
            dessinerPoignee(ctx, c.px, c.py, i === coinActif);
        });
    }

    /**
     * Dessine les poignees de perspective (en coordonnees workspace)
     */
    function dessinerPerspective(ctx, w, h, offsetX, offsetY) {
        if (!perspectiveCorners) return;
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1 / prepZoom;
        ctx.strokeRect(offsetX, offsetY, w, h);

        var points = perspectiveCorners.map(function(p) {
            return {
                x: p.x * w + offsetX,
                y: p.y * h + offsetY
            };
        });

        // Lignes du quadrilatere
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
        ctx.lineWidth = 2 / prepZoom;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < 4; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        points.forEach(function(p, i) {
            dessinerPoignee(ctx, p.x, p.y, i === poigneeActive);
        });
    }

    /* ===============================
       INTERACTIONS POINTER
       =============================== */

    /**
     * Configure les Pointer Events sur le canvas overlay
     */
    function configurerInteractions() {
        if (!canvasOverlay) return;

        canvasOverlay.addEventListener('pointerdown', onPointerDown);
        canvasOverlay.addEventListener('pointermove', onPointerMove);
        canvasOverlay.addEventListener('pointerup', onPointerUp);
        canvasOverlay.addEventListener('pointercancel', onPointerUp);
    }

    function getCanvasPos(e) {
        var rect = prepScrollContainer.getBoundingClientRect();
        // Position dans le workspace (pixels non-zoomes)
        var wsX = (e.clientX - rect.left + prepScrollContainer.scrollLeft) / prepZoom;
        var wsY = (e.clientY - rect.top + prepScrollContainer.scrollTop) / prepZoom;
        // Normaliser par rapport a l'image (0-1)
        var source = canvasGeometrique || imageTravail;
        return {
            x: (wsX - prepOffsetX) / source.width,
            y: (wsY - prepOffsetY) / source.height
        };
    }

    function onPointerDown(e) {
        var pos = getCanvasPos(e);
        var source = canvasGeometrique || imageTravail;

        if (outilActif === 'balance') {
            // Echantillonner le pixel clique depuis le canvas apercu
            var imgX = Math.round(pos.x * source.width);
            var imgY = Math.round(pos.y * source.height);
            imgX = Math.max(0, Math.min(source.width - 1, imgX));
            imgY = Math.max(0, Math.min(source.height - 1, imgY));
            var pixel = ctxApercu.getImageData(imgX, imgY, 1, 1).data;
            var r = pixel[0], g = pixel[1], b = pixel[2];

            // Eviter division par zero
            if (r < 5 && g < 5 && b < 5) {
                outilActif = null;
                canvasOverlay.style.cursor = '';
                return;
            }

            // Calculer les facteurs de correction, limites entre 0.5 et 2.0
            var rFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(r, 1)));
            var gFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(g, 1)));
            var bFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(b, 1)));

            ajouterOperation({ type: 'whiteBalance', rFactor: rFactor, gFactor: gFactor, bFactor: bFactor });
            outilActif = null;
            canvasOverlay.style.cursor = '';
            return;
        }

        if (outilActif === 'perspective' && perspectiveCorners) {
            // Seuil hit-test adapte au zoom
            var seuilPersp = POIGNEE_TAILLE / (prepZoom * 2 * source.width);
            for (var i = 0; i < 4; i++) {
                var dx = pos.x - perspectiveCorners[i].x;
                var dy = pos.y - perspectiveCorners[i].y;
                if (Math.sqrt(dx * dx + dy * dy) < seuilPersp) {
                    poigneeActive = i;
                    canvasOverlay.setPointerCapture(e.pointerId);
                    return;
                }
            }
        }

        if (outilActif === 'crop') {
            // Demarrer un nouveau crop ou deplacer un existant
            if (!cropRect) {
                cropRect = { x: pos.x, y: pos.y, width: 0, height: 0 };
                cropDragState = { startX: pos.x, startY: pos.y, mode: 'create' };
            } else {
                // Seuil hit-test adapte au zoom
                var seuilCrop = POIGNEE_TAILLE / (prepZoom * 2 * source.width);

                var coins = [
                    { x: cropRect.x, y: cropRect.y },
                    { x: cropRect.x + cropRect.width, y: cropRect.y },
                    { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
                    { x: cropRect.x, y: cropRect.y + cropRect.height }
                ];

                var coinTouche = -1;
                for (var j = 0; j < 4; j++) {
                    var cdx = Math.abs(pos.x - coins[j].x);
                    var cdy = Math.abs(pos.y - coins[j].y);
                    if (cdx < seuilCrop && cdy < seuilCrop) {
                        coinTouche = j;
                        break;
                    }
                }

                if (coinTouche >= 0) {
                    cropDragState = { mode: 'resize', corner: coinTouche, startX: pos.x, startY: pos.y, original: { x: cropRect.x, y: cropRect.y, width: cropRect.width, height: cropRect.height } };
                } else if (pos.x >= cropRect.x && pos.x <= cropRect.x + cropRect.width &&
                           pos.y >= cropRect.y && pos.y <= cropRect.y + cropRect.height) {
                    cropDragState = { mode: 'move', startX: pos.x, startY: pos.y, original: { x: cropRect.x, y: cropRect.y, width: cropRect.width, height: cropRect.height } };
                } else {
                    cropRect = { x: pos.x, y: pos.y, width: 0, height: 0 };
                    cropDragState = { startX: pos.x, startY: pos.y, mode: 'create' };
                }
            }
            canvasOverlay.setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e) {
        var pos = getCanvasPos(e);

        if (outilActif === 'perspective' && poigneeActive >= 0) {
            var limMin = -PERSPECTIVE_MARGE_MAX;
            var limMax = 1 + PERSPECTIVE_MARGE_MAX;
            perspectiveCorners[poigneeActive] = {
                x: Math.max(limMin, Math.min(limMax, pos.x)),
                y: Math.max(limMin, Math.min(limMax, pos.y))
            };
            mettreAJourOverlay();
            return;
        }

        if (outilActif === 'crop' && cropDragState) {
            if (cropDragState.mode === 'create') {
                cropRect.width = Math.max(0, pos.x - cropDragState.startX);
                cropRect.height = Math.max(0, pos.y - cropDragState.startY);
            } else if (cropDragState.mode === 'move') {
                var dx = pos.x - cropDragState.startX;
                var dy = pos.y - cropDragState.startY;
                cropRect.x = Math.max(0, Math.min(1 - cropDragState.original.width, cropDragState.original.x + dx));
                cropRect.y = Math.max(0, Math.min(1 - cropDragState.original.height, cropDragState.original.y + dy));
            } else if (cropDragState.mode === 'resize') {
                var o = cropDragState.original;
                var corner = cropDragState.corner;
                if (corner === 0) {
                    cropRect.x = Math.min(pos.x, o.x + o.width);
                    cropRect.y = Math.min(pos.y, o.y + o.height);
                    cropRect.width = o.x + o.width - cropRect.x;
                    cropRect.height = o.y + o.height - cropRect.y;
                } else if (corner === 1) {
                    cropRect.y = Math.min(pos.y, o.y + o.height);
                    cropRect.width = Math.max(0, pos.x - o.x);
                    cropRect.height = o.y + o.height - cropRect.y;
                } else if (corner === 2) {
                    cropRect.width = Math.max(0, pos.x - o.x);
                    cropRect.height = Math.max(0, pos.y - o.y);
                } else if (corner === 3) {
                    cropRect.x = Math.min(pos.x, o.x + o.width);
                    cropRect.width = o.x + o.width - cropRect.x;
                    cropRect.height = Math.max(0, pos.y - o.y);
                }
            }
            mettreAJourOverlay();
        }
    }

    function onPointerUp(e) {
        if (outilActif === 'perspective' && poigneeActive >= 0) {
            poigneeActive = -1;
        }
        if (outilActif === 'crop' && cropDragState) {
            cropDragState = null;
        }
    }

    /* ===============================
       EVENEMENTS ZOOM (molette, pinch, boutons)
       =============================== */

    function configurerZoomEvents() {
        if (!prepScrollContainer) return;

        // Molette Ctrl+wheel → zoom vers le curseur
        prepScrollContainer.addEventListener('wheel', function(e) {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                var facteur = e.deltaY < 0 ? PREP_ZOOM_WHEEL_FACTOR : 1 / PREP_ZOOM_WHEEL_FACTOR;
                prepZoomer(e.clientX, e.clientY, facteur);
            }
        }, { passive: false });

        // Pinch macOS (gesturestart/change/end)
        var gestureBaseZoom = 1;
        prepScrollContainer.addEventListener('gesturestart', function(e) {
            e.preventDefault();
            gestureBaseZoom = prepZoom;
        });
        prepScrollContainer.addEventListener('gesturechange', function(e) {
            e.preventDefault();
            var oldZoom = prepZoom;
            prepZoom = Math.max(PREP_ZOOM_MIN, Math.min(PREP_ZOOM_MAX, gestureBaseZoom * e.scale));
            if (prepZoom !== oldZoom) {
                prepAppliquerZoom();
                var rect = prepScrollContainer.getBoundingClientRect();
                var cx = e.clientX - rect.left, cy = e.clientY - rect.top;
                var espX = (cx + prepScrollContainer.scrollLeft) / oldZoom;
                var espY = (cy + prepScrollContainer.scrollTop) / oldZoom;
                prepScrollContainer.scrollLeft = espX * prepZoom - cx;
                prepScrollContainer.scrollTop = espY * prepZoom - cy;
            }
        });
        prepScrollContainer.addEventListener('gestureend', function(e) {
            e.preventDefault();
        });

        // Pinch tactile (2 doigts)
        var touchStartDist = 0;
        var touchStartZoom = 1;
        var touchStartCenter = { x: 0, y: 0 };
        prepScrollContainer.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                var dx = e.touches[1].clientX - e.touches[0].clientX;
                var dy = e.touches[1].clientY - e.touches[0].clientY;
                touchStartDist = Math.sqrt(dx * dx + dy * dy);
                touchStartZoom = prepZoom;
                touchStartCenter = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
            }
        }, { passive: true });
        prepScrollContainer.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2 && touchStartDist > 0) {
                var dx = e.touches[1].clientX - e.touches[0].clientX;
                var dy = e.touches[1].clientY - e.touches[0].clientY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var scale = dist / touchStartDist;
                var oldZoom = prepZoom;
                prepZoom = Math.max(PREP_ZOOM_MIN, Math.min(PREP_ZOOM_MAX, touchStartZoom * scale));
                if (prepZoom !== oldZoom) {
                    prepAppliquerZoom();
                    var cx = touchStartCenter.x, cy = touchStartCenter.y;
                    var rect = prepScrollContainer.getBoundingClientRect();
                    var lx = cx - rect.left, ly = cy - rect.top;
                    var espX = (lx + prepScrollContainer.scrollLeft) / oldZoom;
                    var espY = (ly + prepScrollContainer.scrollTop) / oldZoom;
                    prepScrollContainer.scrollLeft = espX * prepZoom - lx;
                    prepScrollContainer.scrollTop = espY * prepZoom - ly;
                }
            }
        }, { passive: true });
        prepScrollContainer.addEventListener('touchend', function() {
            touchStartDist = 0;
        }, { passive: true });

        // Boutons preset (Fit / 50% / 100% / 150%)
        document.querySelectorAll('.prep-btn-zoom').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var val = btn.dataset.zoom;
                if (val === 'fit') {
                    prepZoomFit();
                } else {
                    prepZoom = parseFloat(val);
                    prepAppliquerZoom();
                    prepCentrerSurImage();
                }
            });
        });
    }

    /* ===============================
       ACTIONS DES OUTILS
       =============================== */

    function rotation90CW() {
        ajouterOperation({ type: 'rotation90', direction: 'cw' });
    }

    function rotation90CCW() {
        ajouterOperation({ type: 'rotation90', direction: 'ccw' });
    }

    function rotationFine(degrees) {
        if (degrees === 0) return;
        // Retirer la derniere rotation fine s'il y en a une
        if (operations.length > 0 && operations[operations.length - 1].type === 'fineRotation') {
            operations.pop();
        }
        ajouterOperation({ type: 'fineRotation', degrees: parseFloat(degrees) });
    }

    function resetRotationFine() {
        if (operations.length > 0 && operations[operations.length - 1].type === 'fineRotation') {
            operations.pop();
        }
        const slider = document.getElementById('prep-rotation-fine');
        if (slider) slider.value = 0;
        fichiers[indexActuel].operations = operations;
        canvasGeometrique = null;
        mettreAJourApercu();
    }

    function activerCrop() {
        outilActif = 'crop';
        cropRect = { x: 0.02, y: 0.02, width: 0.96, height: 0.96 };
        mettreAJourApercu();
    }

    function appliquerCrop() {
        if (!cropRect || cropRect.width <= 0 || cropRect.height <= 0) return;
        ajouterOperation({
            type: 'crop',
            x: cropRect.x,
            y: cropRect.y,
            width: cropRect.width,
            height: cropRect.height
        });
        outilActif = null;
        cropRect = null;
    }

    function activerPerspective() {
        outilActif = 'perspective';
        perspectiveCorners = [
            { x: 0.05, y: 0.05 },  // TL
            { x: 0.95, y: 0.05 },  // TR
            { x: 0.95, y: 0.95 },  // BR
            { x: 0.05, y: 0.95 }   // BL
        ];
        mettreAJourApercu();
    }

    /* ===============================
       DETECTION AUTOMATIQUE DES COINS
       Pipeline : downscale → grayscale → blur → Canny → filtre contraste (papier/fond) → Hough → coins
       Fallback : Canny brut → Hough si le filtre contraste donne < 4 lignes
       =============================== */

    const DETECT_SIZE = 400;          // Taille max pour la detection (vitesse)
    const HOUGH_THETA_RES = 1;        // Resolution angulaire en degres
    const HOUGH_RHO_RES = 1;          // Resolution en pixels
    const CANNY_LOW = 30;             // Seuil bas Canny
    const CANNY_HIGH = 90;            // Seuil haut Canny

    /**
     * Detecte automatiquement les 4 coins du document dans l'image
     * et positionne les poignees de perspective dessus.
     */
    function detecterCoinsAuto() {
        if (!imageTravail) return;

        outilActif = 'perspective';
        const coins = detecterCoinsDocument(imageTravail);

        if (coins) {
            perspectiveCorners = coins;
        } else {
            // Fallback : coins par defaut si detection echoue
            perspectiveCorners = [
                { x: 0.05, y: 0.05 },
                { x: 0.95, y: 0.05 },
                { x: 0.95, y: 0.95 },
                { x: 0.05, y: 0.95 }
            ];
        }
        mettreAJourApercu();
    }

    /**
     * Pipeline complete de detection des bords d'un document.
     * Detecte les BORDS (pas les coins) puis extrapole les coins
     * par intersection des droites — fonctionne meme quand les coins
     * sont hors cadre.
     *
     * @param {HTMLCanvasElement} source - Canvas source
     * @returns {Array|null} 4 coins [{x,y}] en fractions 0-1, ou null si echec
     */
    function detecterCoinsDocument(source) {
        const w = source.width;
        const h = source.height;

        // 1. Downscale pour la vitesse
        const scale = Math.min(1, DETECT_SIZE / Math.max(w, h));
        const dw = Math.round(w * scale);
        const dh = Math.round(h * scale);

        const small = document.createElement('canvas');
        small.width = dw;
        small.height = dh;
        small.getContext('2d').drawImage(source, 0, 0, dw, dh);

        const ctx = small.getContext('2d');
        const imgData = ctx.getImageData(0, 0, dw, dh);
        const pixels = imgData.data;

        // 2. Grayscale
        const gray = new Float32Array(dw * dh);
        for (let i = 0; i < gray.length; i++) {
            const idx = i * 4;
            gray[i] = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
        }

        // 3. Gaussian blur 5x5
        const blurred = gaussianBlur5x5(gray, dw, dh);

        // 4. Canny edge detection
        const edges = cannyEdgeDetection(blurred, dw, dh);

        // 5. Filtrer : ne garder que les aretes a fort contraste lumineux.
        //    Frontiere papier/fond = contraste eleve (papier clair vs bureau).
        //    Texte, grain du bois, surlignages = contraste faible (deux cotes similaires).
        //    Ceci preserve l'inclinaison reelle des bords (pas d'escalier morphologique).
        const paperEdges = filtrerAretesDocument(edges, blurred, dw, dh);
        let nbPaper = 0;
        for (let i = 0; i < paperEdges.length; i++) if (paperEdges[i]) nbPaper++;

        // 6. Hough sur les aretes filtrees
        let seuilHough = Math.max(20, Math.round(Math.min(dw, dh) * 0.09));
        let lines = houghLines(paperEdges, dw, dh, seuilHough);

        // Fallback : aretes Canny brutes si pas assez de lignes
        if (lines.length < 4) {
            seuilHough = Math.max(40, Math.round(Math.min(dw, dh) * 0.20));
            lines = houghLines(edges, dw, dh, seuilHough);
        }

        if (lines.length < 2) {
            return null;
        }

        // 8. Clustering des lignes par angle (tolerance 8°)
        const clusters = clusteriserLignesParAngle(lines, 8);

        // 8b. Fusionner les clusters proches a cause du wraparound 0°/180°
        //     (ex: theta~175° et theta~3° = meme direction, 8° d'ecart)
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                if (diffAngle180(clusters[i][0].theta, clusters[j][0].theta) <= 18) {
                    clusters[i] = clusters[i].concat(clusters[j]);
                    clusters.splice(j, 1);
                    j--;
                }
            }
        }

        if (clusters.length < 2) {
            return null;
        }

        // 9. Essayer toutes les paires de clusters quasi-perpendiculaires
        //    et garder celle qui produit le plus grand quadrilatere valide.
        //    Ceci evite de prendre les lignes de texte (0°/90°) au lieu des bords du document.
        const distMin = Math.min(dw, dh) * 0.1;
        const cx = dw / 2, cy = dh / 2;
        const candidats = [];

        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                // Les 2 clusters doivent etre quasi-perpendiculaires (60-120°)
                // Un document est rectangulaire : ses bords forment des angles proches de 90°.
                const angleDiff = diffAngle180(clusters[i][0].theta, clusters[j][0].theta);
                if (angleDiff < 60 || angleDiff > 120) continue;

                // Top 3 paires par cluster — le scoring final (surface)
                // departage, ce qui permet de battre les lignes d'ombre.
                const pairesA = trouverBordsOpposes(clusters[i], distMin, cx, cy, 3);
                const pairesB = trouverBordsOpposes(clusters[j], distMin, cx, cy, 3);
                if (pairesA.length === 0 || pairesB.length === 0) continue;

                for (const pa of pairesA) {
                    for (const pb of pairesB) {
                        // Calculer les 4 intersections
                        const inters = [];
                        for (const l1 of pa.paire) {
                            for (const l2 of pb.paire) {
                                const pt = intersectionLignes(l1, l2);
                                if (pt) inters.push(pt);
                            }
                        }
                        if (inters.length !== 4) continue;

                        const coins = ordonnerCoins(inters);
                        const result = coins.map(p => ({
                            x: p.x / dw,
                            y: p.y / dh
                        }));

                        // Valider les limites
                        const valide = result.every(p =>
                            p.x >= -PERSPECTIVE_MARGE_MAX && p.x <= 1 + PERSPECTIVE_MARGE_MAX &&
                            p.y >= -PERSPECTIVE_MARGE_MAX && p.y <= 1 + PERSPECTIVE_MARGE_MAX
                        );
                        if (!valide) continue;

                        const surface = surfaceQuad(result);
                        if (surface < 0.05) continue;

                        // Penaliser les coins tres eloignes du cadre image
                        // Un coin a x=-0.88 est suspect ; un coin a x=-0.05 est normal
                        let penalite = 1;
                        for (const p of result) {
                            const hors = Math.max(0, -p.x, p.x - 1, -p.y, p.y - 1);
                            if (hors > 0.1) penalite *= 1 / (1 + (hors - 0.1) * 5);
                        }
                        const score = surface * penalite;

                        candidats.push({
                            result,
                            surface,
                            score,
                            theta1: Math.round(clusters[i][0].theta),
                            theta2: Math.round(clusters[j][0].theta)
                        });
                    }
                }
            }
        }

        // Trier et logger les top 5 candidats pour debug
        candidats.sort((a, b) => b.score - a.score);
        const top5 = candidats.slice(0, 5);

        if (candidats.length === 0) {
            return null;
        }

        // Prendre le candidat avec le meilleur score (surface ponderee par proximite au cadre)
        candidats.sort((a, b) => b.score - a.score);
        const meilleur = candidats[0];

        return meilleur.result;
    }

    /**
     * Regroupe les lignes en clusters de directions similaires.
     * Deux lignes sont dans le meme cluster si leur theta differe de < toleranceDeg.
     * Gere le wrap-around 0°/180° (les lignes a 2° et 178° sont paralleles).
     *
     * @param {Array} lines - Lignes Hough [{rho, theta, votes}]
     * @param {number} toleranceDeg - Tolerance angulaire en degres
     * @returns {Array<Array>} Clusters de lignes
     */
    function clusteriserLignesParAngle(lines, toleranceDeg) {
        const clusters = [];

        for (const line of lines) {
            let placed = false;
            for (const cluster of clusters) {
                // Comparer avec l'angle moyen du cluster
                const refTheta = cluster[0].theta;
                if (diffAngle180(line.theta, refTheta) < toleranceDeg) {
                    cluster.push(line);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                clusters.push([line]);
            }
        }

        // Garder seulement les clusters avec au moins 1 ligne significative
        return clusters.filter(c => c.length >= 1);
    }

    /**
     * Difference angulaire en tenant compte du wrap 0°/180°
     * (en Hough, theta=0° et theta=180° representent des lignes paralleles)
     */
    function diffAngle180(a, b) {
        let d = Math.abs(a - b) % 180;
        return Math.min(d, 180 - d);
    }

    /**
     * Dans un cluster de lignes quasi-paralleles, trouve les 2 lignes
     * les plus eloignees l'une de l'autre (= les 2 bords opposes du document).
     * Utilise la distance perpendiculaire depuis le centre de l'image
     * pour gerer correctement les clusters fusionnes (theta variable).
     *
     * @param {Array} cluster - Lignes du cluster
     * @param {number} distMin - Distance minimale entre les 2 bords (pixels)
     * @param {number} cx - Centre X de l'image
     * @param {number} cy - Centre Y de l'image
     * @param {number} [topN=3] - Nombre de paires candidates a retourner
     * @returns {Array} Tableau de { paire: [ligne1, ligne2], score, dist }
     */
    function trouverBordsOpposes(cluster, distMin, cx, cy, topN) {
        topN = topN || 3;
        if (cluster.length < 2) {
            return [];
        }

        // Distance signee de chaque ligne au centre de l'image
        // d = cx*cos(theta) + cy*sin(theta) - rho
        // Positif = la ligne est du cote "gauche/haut" du centre
        // Negatif = la ligne est du cote "droit/bas" du centre
        const withDist = cluster.map(line => {
            const rad = line.theta * Math.PI / 180;
            const d = cx * Math.cos(rad) + cy * Math.sin(rad) - line.rho;
            return { line, d };
        });

        // Trier par distance au centre
        withDist.sort((a, b) => a.d - b.d);

        // Collecter toutes les paires valides, scorees par
        // distance * log(votes). Le log compresse l'avantage des
        // lignes a forte densite (ombres) pour laisser la distance
        // (= ecart reel entre les 2 bords) dominer.
        const paires = [];

        for (let i = 0; i < withDist.length; i++) {
            for (let j = i + 1; j < withDist.length; j++) {
                const dist = Math.abs(withDist[j].d - withDist[i].d);
                if (dist < distMin) continue;

                const score = dist * (Math.log(withDist[i].line.votes) + Math.log(withDist[j].line.votes));
                paires.push({
                    paire: [withDist[i].line, withDist[j].line],
                    score,
                    dist
                });
            }
        }

        // Retourner les top N paires par score.
        // Le scoring final (surface du quadrilatere) departage.
        paires.sort((a, b) => b.score - a.score);
        return paires.slice(0, topN);
    }

    /**
     * Seuil d'Otsu — trouve le seuil optimal separant deux classes
     * (papier clair vs fond sombre) dans une image en niveaux de gris.
     * @param {Float32Array} gray - Pixels en niveaux de gris (0-255)
     * @param {number} w - Largeur
     * @param {number} h - Hauteur
     * @returns {number} Seuil optimal (0-255)
     */
    function seuilOtsu(gray, w, h) {
        const hist = new Uint32Array(256);
        const n = w * h;
        for (let i = 0; i < n; i++) {
            hist[Math.min(255, Math.max(0, Math.round(gray[i])))]++;
        }

        let sumTotal = 0;
        for (let i = 0; i < 256; i++) sumTotal += i * hist[i];

        let sumB = 0, wB = 0;
        let maxVariance = 0, seuil = 128;

        for (let t = 0; t < 256; t++) {
            wB += hist[t];
            if (wB === 0) continue;
            const wF = n - wB;
            if (wF === 0) break;

            sumB += t * hist[t];
            const mB = sumB / wB;
            const mF = (sumTotal - sumB) / wF;
            const variance = wB * wF * (mB - mF) * (mB - mF);

            if (variance > maxVariance) {
                maxVariance = variance;
                seuil = t;
            }
        }

        return seuil;
    }

    /**
     * Fermeture morphologique (dilatation puis erosion) sur masque binaire.
     * Comble les trous internes du masque (texte, petites images)
     * pour ne garder que le contour global du document.
     *
     * @param {Uint8Array} mask - Masque binaire (0 ou 255)
     * @param {number} w - Largeur
     * @param {number} h - Hauteur
     * @param {number} rayon - Rayon du noyau carre
     * @returns {Uint8Array} Masque ferme
     */
    function fermetureMorphologique(mask, w, h, rayon) {
        // Dilatation : un pixel devient 255 si au moins un voisin est 255
        const dilated = new Uint8Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let found = false;
                for (let dy = -rayon; dy <= rayon && !found; dy++) {
                    for (let dx = -rayon; dx <= rayon && !found; dx++) {
                        const ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < h && nx >= 0 && nx < w && mask[ny * w + nx]) found = true;
                    }
                }
                if (found) dilated[y * w + x] = 255;
            }
        }

        // Erosion : un pixel reste 255 seulement si tous les voisins sont 255
        const result = new Uint8Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let allSet = true;
                for (let dy = -rayon; dy <= rayon && allSet; dy++) {
                    for (let dx = -rayon; dx <= rayon && allSet; dx++) {
                        const ny = y + dy, nx = x + dx;
                        if (ny < 0 || ny >= h || nx < 0 || nx >= w || !dilated[ny * w + nx]) allSet = false;
                    }
                }
                if (allSet) result[y * w + x] = 255;
            }
        }

        return result;
    }

    /**
     * Extrait les pixels de bordure d'un masque binaire.
     * Un pixel est «bordure» s'il est blanc (papier) et a au moins
     * un voisin noir (fond) parmi ses 4-voisins a l'interieur de l'image.
     *
     * Les pixels de papier touchant le bord de l'image ne sont PAS
     * marques comme bordure — evite de detecter le cadrage photo
     * comme un bord de document.
     *
     * @param {Uint8Array} mask - Masque binaire
     * @param {number} w - Largeur
     * @param {number} h - Hauteur
     * @returns {Uint8Array} Carte binaire des bordures
     */
    function extraireBordure(mask, w, h) {
        const boundary = new Uint8Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (!mask[y * w + x]) continue;
                let isBord = false;
                if (y > 0 && !mask[(y - 1) * w + x]) isBord = true;
                if (!isBord && y < h - 1 && !mask[(y + 1) * w + x]) isBord = true;
                if (!isBord && x > 0 && !mask[y * w + (x - 1)]) isBord = true;
                if (!isBord && x < w - 1 && !mask[y * w + (x + 1)]) isBord = true;
                if (isBord) boundary[y * w + x] = 255;
            }
        }
        return boundary;
    }

    /**
     * Gaussian blur 5x5
     */
    function gaussianBlur5x5(src, w, h) {
        const kernel = [
            1, 4, 7, 4, 1,
            4, 16, 26, 16, 4,
            7, 26, 41, 26, 7,
            4, 16, 26, 16, 4,
            1, 4, 7, 4, 1
        ];
        const kSum = 273;
        const dst = new Float32Array(w * h);

        for (let y = 2; y < h - 2; y++) {
            for (let x = 2; x < w - 2; x++) {
                let sum = 0;
                let ki = 0;
                for (let ky = -2; ky <= 2; ky++) {
                    for (let kx = -2; kx <= 2; kx++) {
                        sum += src[(y + ky) * w + (x + kx)] * kernel[ki++];
                    }
                }
                dst[y * w + x] = sum / kSum;
            }
        }
        return dst;
    }

    /**
     * Filtre les aretes Canny pour ne garder que les frontieres papier/fond.
     * Pour chaque pixel d'arete, on echantillonne la luminosite de part et d'autre
     * (perpendiculairement au gradient). On garde seulement les aretes ou :
     *   - Le contraste est significatif (> 25)
     *   - Le cote le plus clair est lumineux (> 130) = probablement du papier
     *   - Le cote le plus sombre est fonce (< 140) = probablement du bureau
     *     (elimine les ombres du telephone : papier 200 vs papier ombre 140+)
     * Ceci elimine : texte (deux cotes clairs), grain du bois (deux cotes moyens),
     * surlignages (contraste faible), et preserve l'angle reel des bords du document.
     */
    function filtrerAretesDocument(edges, gray, w, h) {
        const filtered = new Uint8Array(w * h);
        const R = 3; // rayon d'echantillonnage perpendiculaire
        for (let y = R; y < h - R; y++) {
            for (let x = R; x < w - R; x++) {
                if (!edges[y * w + x]) continue;
                // Direction du gradient (perpendiculaire a l'arete)
                const gx = gray[y * w + (x + 1)] - gray[y * w + (x - 1)];
                const gy = gray[(y + 1) * w + x] - gray[(y - 1) * w + x];
                const mag = Math.sqrt(gx * gx + gy * gy);
                if (mag < 1) continue;
                const nx = gx / mag;
                const ny = gy / mag;
                // Echantillonner la luminosite de chaque cote
                let sideA = 0, sideB = 0, count = 0;
                for (let r = 1; r <= R; r++) {
                    const ax = Math.round(x + nx * r), ay = Math.round(y + ny * r);
                    const bx = Math.round(x - nx * r), by = Math.round(y - ny * r);
                    if (ax >= 0 && ax < w && ay >= 0 && ay < h &&
                        bx >= 0 && bx < w && by >= 0 && by < h) {
                        sideA += gray[ay * w + ax];
                        sideB += gray[by * w + bx];
                        count++;
                    }
                }
                if (count === 0) continue;
                sideA /= count;
                sideB /= count;
                const contrast = Math.abs(sideA - sideB);
                const maxSide = Math.max(sideA, sideB);
                const minSide = Math.min(sideA, sideB);
                // Frontiere papier/fond :
                //   - contraste significatif (> 25)
                //   - un cote clair = papier (max > 130)
                //   - un cote sombre = bureau (min < 140)
                // Le seuil 140 est entre le bureau eclaire (~125-135) et le
                // papier ombre par le telephone (~140-160). Elimine les ombres
                // (min=140+ rejete) tout en gardant le bureau eclaire (min~130 garde).
                if (contrast > 25 && maxSide > 130 && minSide < 140) {
                    filtered[y * w + x] = 255;
                }
            }
        }
        return filtered;
    }

    /**
     * Canny edge detection simplifie
     * @returns {Uint8Array} Carte binaire des aretes (0 ou 255)
     */
    function cannyEdgeDetection(src, w, h) {
        // Sobel X et Y
        const gx = new Float32Array(w * h);
        const gy = new Float32Array(w * h);
        const mag = new Float32Array(w * h);
        const dir = new Float32Array(w * h);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;
                // Sobel X
                gx[idx] = -src[(y - 1) * w + (x - 1)] - 2 * src[y * w + (x - 1)] - src[(y + 1) * w + (x - 1)]
                          + src[(y - 1) * w + (x + 1)] + 2 * src[y * w + (x + 1)] + src[(y + 1) * w + (x + 1)];
                // Sobel Y
                gy[idx] = -src[(y - 1) * w + (x - 1)] - 2 * src[(y - 1) * w + x] - src[(y - 1) * w + (x + 1)]
                          + src[(y + 1) * w + (x - 1)] + 2 * src[(y + 1) * w + x] + src[(y + 1) * w + (x + 1)];

                mag[idx] = Math.sqrt(gx[idx] * gx[idx] + gy[idx] * gy[idx]);
                dir[idx] = Math.atan2(gy[idx], gx[idx]);
            }
        }

        // Non-maximum suppression
        const nms = new Float32Array(w * h);
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;
                const angle = (dir[idx] * 180 / Math.PI + 180) % 180;
                let m1 = 0, m2 = 0;

                if (angle < 22.5 || angle >= 157.5) {
                    m1 = mag[idx - 1];
                    m2 = mag[idx + 1];
                } else if (angle < 67.5) {
                    m1 = mag[(y - 1) * w + (x + 1)];
                    m2 = mag[(y + 1) * w + (x - 1)];
                } else if (angle < 112.5) {
                    m1 = mag[(y - 1) * w + x];
                    m2 = mag[(y + 1) * w + x];
                } else {
                    m1 = mag[(y - 1) * w + (x - 1)];
                    m2 = mag[(y + 1) * w + (x + 1)];
                }

                nms[idx] = (mag[idx] >= m1 && mag[idx] >= m2) ? mag[idx] : 0;
            }
        }

        // Double seuil + hysteresis
        const edges = new Uint8Array(w * h);
        const STRONG = 255;
        const WEAK = 75;

        for (let i = 0; i < nms.length; i++) {
            if (nms[i] >= CANNY_HIGH) edges[i] = STRONG;
            else if (nms[i] >= CANNY_LOW) edges[i] = WEAK;
        }

        // Hysteresis : connecter les faibles aux forts
        let changed = true;
        while (changed) {
            changed = false;
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = y * w + x;
                    if (edges[idx] !== WEAK) continue;

                    // Verifier les 8 voisins
                    if (edges[(y - 1) * w + (x - 1)] === STRONG || edges[(y - 1) * w + x] === STRONG ||
                        edges[(y - 1) * w + (x + 1)] === STRONG || edges[y * w + (x - 1)] === STRONG ||
                        edges[y * w + (x + 1)] === STRONG || edges[(y + 1) * w + (x - 1)] === STRONG ||
                        edges[(y + 1) * w + x] === STRONG || edges[(y + 1) * w + (x + 1)] === STRONG) {
                        edges[idx] = STRONG;
                        changed = true;
                    }
                }
            }
        }

        // Supprimer les faibles restants
        for (let i = 0; i < edges.length; i++) {
            if (edges[i] !== STRONG) edges[i] = 0;
        }

        return edges;
    }

    /**
     * Transformee de Hough pour la detection de lignes
     * @param {Uint8Array} edges - Carte binaire des aretes
     * @param {number} w - Largeur
     * @param {number} h - Hauteur
     * @param {number} seuil - Nombre minimum de votes
     * @returns {Array} Lignes detectees [{rho, theta, votes}]
     */
    function houghLines(edges, w, h, seuil) {
        const maxRho = Math.ceil(Math.sqrt(w * w + h * h));
        const thetaSteps = Math.ceil(180 / HOUGH_THETA_RES);
        const rhoSteps = 2 * maxRho + 1;

        // Precalculer cos/sin
        const cosTable = new Float32Array(thetaSteps);
        const sinTable = new Float32Array(thetaSteps);
        for (let t = 0; t < thetaSteps; t++) {
            const rad = (t * HOUGH_THETA_RES) * Math.PI / 180;
            cosTable[t] = Math.cos(rad);
            sinTable[t] = Math.sin(rad);
        }

        // Accumulateur
        const accum = new Uint32Array(thetaSteps * rhoSteps);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (edges[y * w + x] === 0) continue;
                for (let t = 0; t < thetaSteps; t++) {
                    const rho = Math.round(x * cosTable[t] + y * sinTable[t]) + maxRho;
                    accum[t * rhoSteps + rho]++;
                }
            }
        }

        // Extraire les pics au-dessus du seuil
        const lines = [];
        for (let t = 0; t < thetaSteps; t++) {
            for (let r = 0; r < rhoSteps; r++) {
                const votes = accum[t * rhoSteps + r];
                if (votes < seuil) continue;

                // Suppression des non-maxima locaux (fenetre 5x5)
                let estMax = true;
                for (let dt = -2; dt <= 2 && estMax; dt++) {
                    for (let dr = -2; dr <= 2 && estMax; dr++) {
                        if (dt === 0 && dr === 0) continue;
                        const nt = t + dt;
                        const nr = r + dr;
                        if (nt >= 0 && nt < thetaSteps && nr >= 0 && nr < rhoSteps) {
                            if (accum[nt * rhoSteps + nr] > votes) estMax = false;
                        }
                    }
                }

                if (estMax) {
                    lines.push({
                        rho: r - maxRho,
                        theta: t * HOUGH_THETA_RES,
                        votes: votes
                    });
                }
            }
        }

        lines.sort((a, b) => b.votes - a.votes);
        return lines;
    }

    /**
     * Intersection de deux lignes Hough (rho, theta)
     * @returns {{x, y}|null}
     */
    function intersectionLignes(l1, l2) {
        const t1 = l1.theta * Math.PI / 180;
        const t2 = l2.theta * Math.PI / 180;

        const cos1 = Math.cos(t1), sin1 = Math.sin(t1);
        const cos2 = Math.cos(t2), sin2 = Math.sin(t2);

        const det = cos1 * sin2 - cos2 * sin1;
        if (Math.abs(det) < 1e-6) return null;  // Paralleles

        return {
            x: (l1.rho * sin2 - l2.rho * sin1) / det,
            y: (l2.rho * cos1 - l1.rho * cos2) / det
        };
    }

    /**
     * Ordonne 4 points en TL, TR, BR, BL
     */
    function ordonnerCoins(points) {
        // Centroid
        const cx = points.reduce((s, p) => s + p.x, 0) / 4;
        const cy = points.reduce((s, p) => s + p.y, 0) / 4;

        const tl = points.filter(p => p.x < cx && p.y < cy)[0];
        const tr = points.filter(p => p.x >= cx && p.y < cy)[0];
        const br = points.filter(p => p.x >= cx && p.y >= cy)[0];
        const bl = points.filter(p => p.x < cx && p.y >= cy)[0];

        if (!tl || !tr || !br || !bl) {
            // Fallback : trier par angle depuis le centroid
            const sorted = points.slice().sort((a, b) => {
                return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
            });
            // Le plus en haut-gauche en premier (angle ~= -135°)
            // Trouver celui avec x+y minimal (top-left)
            let minIdx = 0;
            let minSum = Infinity;
            for (let i = 0; i < sorted.length; i++) {
                const sum = sorted[i].x + sorted[i].y;
                if (sum < minSum) { minSum = sum; minIdx = i; }
            }
            const ordered = [];
            for (let i = 0; i < 4; i++) {
                ordered.push(sorted[(minIdx + i) % 4]);
            }
            return ordered;
        }

        return [tl, tr, br, bl];
    }

    /**
     * Surface d'un quadrilatere (Shoelace formula) en fractions
     */
    function surfaceQuad(pts) {
        let area = 0;
        for (let i = 0; i < 4; i++) {
            const j = (i + 1) % 4;
            area += pts[i].x * pts[j].y;
            area -= pts[j].x * pts[i].y;
        }
        return Math.abs(area) / 2;
    }

    function appliquerPerspective() {
        if (!perspectiveCorners) return;
        ajouterOperation({
            type: 'perspective',
            corners: perspectiveCorners.map(p => ({ ...p })),
            fill: perspectiveFill
        });
        outilActif = null;
        perspectiveCorners = null;
    }

    function changerRemplissagePerspective(value) {
        perspectiveFill = value;
    }

    function echantillonnerCouleurPage(source) {
        const ctx = source.getContext('2d');
        const w = source.width, h = source.height;
        const points = [
            [2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3],
            [Math.floor(w/2), 2], [2, Math.floor(h/2)]
        ];
        let r = 0, g = 0, b = 0, n = 0;
        for (const [px, py] of points) {
            const d = ctx.getImageData(px, py, 1, 1).data;
            if (d[3] > 128) { r += d[0]; g += d[1]; b += d[2]; n++; }
        }
        if (n === 0) return '#ffffff';
        return `rgb(${Math.round(r/n)},${Math.round(g/n)},${Math.round(b/n)})`;
    }

    function changerLuminosite(value) {
        // Retirer la derniere luminosite s'il y en a une
        if (operations.length > 0 && operations[operations.length - 1].type === 'brightness') {
            operations.pop();
        }
        if (value !== 0) {
            operations.push({ type: 'brightness', value: parseInt(value) });
            fichiers[indexActuel].operations = operations;
        } else {
            fichiers[indexActuel].operations = operations;
        }
        mettreAJourFiltresTempsReel();
    }

    function changerContraste(value) {
        if (operations.length > 0 && operations[operations.length - 1].type === 'contrast') {
            operations.pop();
        }
        if (value !== 0) {
            operations.push({ type: 'contrast', value: parseInt(value) });
            fichiers[indexActuel].operations = operations;
        } else {
            fichiers[indexActuel].operations = operations;
        }
        mettreAJourFiltresTempsReel();
    }

    function changerExposition(value) {
        if (operations.length > 0 && operations[operations.length - 1].type === 'exposure') {
            operations.pop();
        }
        const v = parseInt(value);
        if (v !== 0) {
            operations.push({ type: 'exposure', value: v });
            fichiers[indexActuel].operations = operations;
        } else {
            fichiers[indexActuel].operations = operations;
        }
        // Afficher la valeur en EV
        const lbl = document.getElementById('prep-exposition-valeur');
        if (lbl) lbl.textContent = v === 0 ? '0' : (v > 0 ? '+' : '') + (v / 10).toFixed(1) + ' EV';
        mettreAJourFiltresTempsReel();
    }

    function basculerNiveauxDeGris() {
        // Toggle : si la derniere op est grayscale, la retirer
        const derniere = operations[operations.length - 1];
        if (derniere && derniere.type === 'grayscale') {
            operations.pop();
            fichiers[indexActuel].operations = operations;
            mettreAJourFiltresTempsReel();
        } else {
            operations.push({ type: 'grayscale', active: true });
            fichiers[indexActuel].operations = operations;
            mettreAJourFiltresTempsReel();
        }
    }

    /**
     * Active l'outil pipette balance des blancs
     */
    function activerBalanceBlancs() {
        if (outilActif === 'balance') {
            // Desactiver si deja actif
            outilActif = null;
            if (canvasOverlay) canvasOverlay.style.cursor = '';
            return;
        }
        outilActif = 'balance';
        if (canvasOverlay) canvasOverlay.style.cursor = 'crosshair';
    }

    /* ===============================
       OPTIONS IMPORT PAR FICHIER
       =============================== */

    /**
     * #559 — Résout le fichier de la FILE D'IMPORT correspondant au fichier
     * courant, ou `null` s'il n'y en a pas.
     *
     * Le poste de préparation sert deux modes, et un seul a une file.
     * `queueOffset === -1` signale le mode ad hoc (« Ajouter des pages ») : le
     * document travaillé ne vient PAS de la file d'import. Or
     * `indexActuel + queueOffset` reste un index PARFAITEMENT VALIDE dans cette
     * file dès que `indexActuel >= 1` — l'écriture atterrissait donc sur un
     * autre fichier de la file, dont l'utilisateur modifiait les réglages sans
     * le savoir et sans rien voir.
     *
     * Le reste du module tient déjà cette distinction (`modeAdHoc` aux l. 150 et
     * 194, garde `!modeAdHoc` de la boucle de traitement l. 213). Les trois
     * fonctions d'options l'avaient perdue ; ce helper la leur rend, en un seul
     * endroit à corriger.
     *
     * @returns {Object|null} L'entrée de file, ou null (mode ad hoc, file vide,
     *   index hors bornes)
     */
    function _fichierDeFileCourant() {
        if (queueOffset === -1) return null;
        const queue = travauxImport.obtenirFileDAttente();
        return (queue && queue[indexActuel + queueOffset]) || null;
    }

    /**
     * Met a jour les checkboxes Import selon les flags du fichier courant
     *
     * #559 : masque la section quand il n'y a pas de fichier de file. Les deux
     * drapeaux ne sont consommés QUE par le pipeline batch, qui itère la file
     * (`travaux-ui.js`) — en mode ad hoc ils n'ont donc aucun consommateur.
     * Laisser les cases visibles les rendrait inertes en silence : on remplacerait
     * un bug par un mensonge d'interface.
     */
    function syncOptImport() {
        const qf = _fichierDeFileCourant();

        const section = document.getElementById('prep-section-import');
        if (section) section.classList.toggle('u-hide', !qf);
        if (!qf) return;

        const cbBalance = document.getElementById('prep-opt-balance');
        const cbResolution = document.getElementById('prep-opt-resolution');
        if (cbBalance) cbBalance.checked = !!qf.skipBalance;
        if (cbResolution) cbResolution.checked = !!qf.format11x17;
    }

    /**
     * Change le flag balance des blancs pour le fichier courant
     * @param {boolean} checked - true = appliquer la balance, false = ignorer
     */
    function changerOptBalance(checked) {
        const qf = _fichierDeFileCourant();
        if (!qf) return;
        qf.skipBalance = !checked;
    }

    /**
     * Change le flag resolution originale pour le fichier courant
     * @param {boolean} checked - true = conserver la resolution originale
     */
    function changerOptResolution(checked) {
        const qf = _fichierDeFileCourant();
        if (!qf) return;
        qf.format11x17 = checked;
    }

    /* ===============================
       ASSEMBLAGE MULTI-PAGES
       =============================== */

    /**
     * Bascule la selection d'un fichier pour le groupement
     * @param {number} index - Index du fichier
     */
    function toggleSelection(index) {
        if (selections.has(index)) {
            selections.delete(index);
        } else {
            selections.add(index);
        }
        mettreAJourMiniatures();
    }

    /**
     * Groupe les fichiers selectionnes en un document multi-pages
     */
    function grouperSelection() {
        if (selections.size < 2) return;

        const groupeId = genererIdUnique('GRP_');
        const indices = Array.from(selections).sort((a, b) => a - b);

        indices.forEach(i => {
            fichiers[i].groupeId = groupeId;
        });

        documentGroups.set(groupeId, indices);
        selections.clear();
        mettreAJourMiniatures();
    }

    /**
     * Degroupe un document multi-pages
     * @param {string} groupeId
     */
    function degrouper(groupeId) {
        const indices = documentGroups.get(groupeId);
        if (indices) {
            indices.forEach(i => {
                fichiers[i].groupeId = null;
            });
            documentGroups.delete(groupeId);
        }
        mettreAJourMiniatures();
    }

    /**
     * Assemblage automatique : regroupe les fichiers par DA + nomProduction
     * (via parseLea), trie par dateRemise, et appelle grouperSelection() pour chaque groupe.
     */
    function assemblerAuto() {
        const groupesAuto = new Map();

        fichiers.forEach((f, i) => {
            const p = f.parseLea || {};
            if (p.da && p.nomProduction) {
                const cleGroupe = p.da + '_' + p.nomProduction.replace(/\s+/g, '-').toLowerCase();
                if (!groupesAuto.has(cleGroupe)) groupesAuto.set(cleGroupe, []);
                groupesAuto.get(cleGroupe).push({ index: i, dateRemise: p.dateRemise });
            }
        });

        let nbGroupes = 0;
        groupesAuto.forEach((membres) => {
            if (membres.length < 2) return;

            // Trier par dateRemise
            membres.sort((a, b) => {
                if (!a.dateRemise && !b.dateRemise) return 0;
                if (!a.dateRemise) return 1;
                if (!b.dateRemise) return -1;
                return a.dateRemise - b.dateRemise;
            });

            // Selectionner les indices puis grouper
            selections.clear();
            membres.forEach(m => selections.add(m.index));
            grouperSelection();
            nbGroupes++;
        });

        selections.clear();
        mettreAJourMiniatures();
    }

    /* ===============================
       NAVIGATION
       =============================== */

    function fichierPrecedent() {
        if (indexActuel > 0) {
            chargerFichier(indexActuel - 1);
        }
    }

    function fichierSuivant() {
        if (indexActuel < fichiers.length - 1) {
            chargerFichier(indexActuel + 1);
        }
    }

    function mettreAJourNavigation() {
        // Compteur texte
        const nav = document.getElementById('prep-navigation');
        if (nav) {
            nav.textContent = `${indexActuel + 1} / ${fichiers.length} images`;
        }

        const btnPrec = document.getElementById('prep-btn-prec');
        const btnSuiv = document.getElementById('prep-btn-suiv');
        if (btnPrec) btnPrec.disabled = indexActuel <= 0;
        if (btnSuiv) btnSuiv.disabled = indexActuel >= fichiers.length - 1;

        // Indicateur operations
        const nbOps = document.getElementById('prep-nb-ops');
        if (nbOps) {
            nbOps.textContent = operations.length > 0 ? `${operations.length} op.` : '';
        }

        // Carrousel de miniatures (3 max : precedent, courant, suivant)
        const carousel = document.getElementById('prep-header-carousel');
        if (carousel) {
            let html = '';
            const indices = [];
            if (indexActuel > 0) indices.push(indexActuel - 1);
            indices.push(indexActuel);
            if (indexActuel < fichiers.length - 1) indices.push(indexActuel + 1);

            indices.forEach(i => {
                const f = fichiers[i];
                const estActif = i === indexActuel;
                const thumb = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
                let imgSrc = '';
                if (thumb) {
                    imgSrc = thumb;
                } else if (f.fichier) {
                    imgSrc = URL.createObjectURL(f.fichier);
                }
                html += `<div class="prep-header-thumb${estActif ? ' actif' : ''}" data-action="travauxPreparation.chargerFichier" data-param="${i}" title="${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : (f.nomFichier || ''))}">`;
                if (imgSrc) {
                    html += `<img src="${imgSrc}" alt="">`;
                } else {
                    html += `<span style="font-size:1.2rem; display:flex; align-items:center; justify-content:center; height:100%;">${f.estPDF ? '&#x1F4C4;' : '&#x1F5BC;'}</span>`;
                }
                html += '</div>';
            });

            carousel.innerHTML = html;
            // Charger les thumbnails async si necessaire
            if (typeof travauxStockage !== 'undefined') {
                travauxStockage.chargerThumbnailsConteneur(carousel);
            }
        }
    }

    /* ===============================
       MISE A JOUR MINIATURES
       =============================== */

    function mettreAJourMiniatures() {
        const conteneur = document.getElementById('prep-miniatures');
        if (!conteneur) return;

        let html = '';
        fichiers.forEach((f, i) => {
            const classes = ['prep-mini'];
            if (i === indexActuel) classes.push('actif');
            if (selections.has(i)) classes.push('selectionne');
            if (f.operations.length > 0) classes.push('modifie');

            html += `
                <div class="${classes.join(' ')}" data-action="travauxPreparation.chargerFichier" data-param="${i}">
                    <span class="prep-mini-nom">${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : (f.nomFichier || ''))}</span>
                    <button class="prep-mini-check" data-stop data-action="travauxPreparation.toggleSelection" data-param="${i}" title="Selectionner">
                        ${selections.has(i) ? '&#x2611;' : '&#x2610;'}
                    </button>
                </div>`;
        });

        conteneur.innerHTML = html;
    }

    /* ===============================
       INTERFACE UTILISATEUR
       =============================== */

    function afficherUI() {
        // Retirer un modal existant
        const existant = document.getElementById('travaux-preparation-modal');
        if (existant) existant.remove();

        const modal = document.createElement('div');
        modal.id = 'travaux-preparation-modal';
        modal.className = 'prep-page';

        modal.innerHTML = `
                <!-- Barre compacte -->
                <div class="prep-header-bar">
                    <button class="btn btn-petit" data-action="travauxPreparation.fermer">&#x2190; Retour</button>
                    <div class="prep-header-nav">
                        <button class="btn-icon" id="prep-btn-prec" data-action="travauxPreparation.fichierPrecedent">&#x2190;</button>
                        <div class="prep-header-carousel" id="prep-header-carousel"></div>
                        <button class="btn-icon" id="prep-btn-suiv" data-action="travauxPreparation.fichierSuivant">&#x2192;</button>
                        <span id="prep-navigation" style="font-size:0.8rem; margin-left:6px;" class="texte-muted"></span>
                        <span id="prep-nb-ops" class="texte-muted" style="font-size:0.8rem; margin-left:4px;"></span>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button class="btn btn-secondaire btn-petit" data-action="travauxPreparation.passer">Passer</button>
                        <button class="btn btn-principal btn-petit" id="prep-btn-confirmer" data-action="travauxPreparation.confirmerTout">Confirmer les r\u00e9glages sp\u00e9cifiques</button>
                    </div>
                </div>
                <div class="prep-progress-bar" id="prep-progress-bar" style="display:none;">
                    <div class="prep-progress-fill" id="prep-progress-fill"></div>
                    <span class="prep-progress-text" id="prep-progress-text"></span>
                </div>

                <!-- Zone de travail plein ecran -->
                <div class="prep-workspace">
                    <div class="prep-canvas-scroll" id="prep-canvas-scroll">
                        <div id="prep-espace-wrapper">
                            <div id="prep-espace">
                                <canvas id="prep-canvas-apercu"></canvas>
                                <canvas id="prep-canvas-overlay"></canvas>
                            </div>
                        </div>
                    </div>
                    <button class="prep-btn-canvas" id="prep-btn-appliquer-crop"
                            data-action="travauxPreparation.appliquerCrop"
                            style="display:none;">Confirmer le recadrage</button>
                    <button class="prep-btn-canvas" id="prep-btn-appliquer-persp"
                            data-action="travauxPreparation.appliquerPerspective"
                            style="display:none;">Confirmer perspective</button>

                    <!-- Barre de zoom -->
                    <div class="prep-zoom-bar" id="prep-zoom-bar">
                        <button class="prep-btn-zoom" data-zoom="fit">Fit</button>
                        <button class="prep-btn-zoom" data-zoom="0.5">50%</button>
                        <button class="prep-btn-zoom" data-zoom="1">100%</button>
                        <button class="prep-btn-zoom" data-zoom="1.5">150%</button>
                        <span class="prep-zoom-info" id="prep-zoom-info">100%</span>
                    </div>

                    <!-- Palette Reglages specifiques (flottante, draggable) -->
                    <div class="prep-palette prep-palette-etendu" id="prep-palette-outils" style="top:12px; left:12px;">
                        <div class="prep-palette-barre" data-drag="prep-palette-outils">
                            <span class="prep-palette-titre">Réglages spécifiques</span>
                            <button class="prep-palette-toggle" data-action="travauxPreparation.togglePalette" data-param="outils">&#x2212;</button>
                        </div>
                        <div class="prep-palette-contenu">

                            <!-- Section Fichiers -->
                            <div class="prep-section" id="prep-section-fichiers">
                                <div class="prep-section-label" data-action="travauxPreparation.toggleSection" data-param="fichiers">Fichiers</div>
                                <div class="prep-section-sous-titre">navigation et assemblage</div>
                                <div class="prep-section-body">
                                    <div id="prep-miniatures" class="prep-mini-liste"></div>
                                    <div class="prep-btn-row">
                                        <button class="prep-btn" data-action="travauxPreparation.grouperSelection" id="prep-btn-grouper">Grouper</button>
                                        <button class="prep-btn" data-action="travauxPreparation.assemblerAuto">Assemblage auto</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Section Rotation -->
                            <div class="prep-section" id="prep-section-rotation">
                                <div class="prep-section-label" data-action="travauxPreparation.toggleSection" data-param="rotation">Rotation</div>
                                <div class="prep-section-sous-titre">orientation du document</div>
                                <div class="prep-section-body">
                                    <div class="prep-btn-row">
                                        <button class="prep-btn" data-action="travauxPreparation.rotation90CCW" title="90 anti-horaire">&#x21BA; 90°</button>
                                        <button class="prep-btn" data-action="travauxPreparation.rotation90CW" title="90 horaire">&#x21BB; 90°</button>
                                    </div>
                                    <div class="prep-slider-groupe">
                                        <label>Fine <span id="prep-rotation-valeur" class="texte-muted">0°</span>
                                            <button class="prep-btn-reset-rotation" id="prep-btn-reset-rotation"
                                                    data-action="travauxPreparation.resetRotationFine"
                                                    title="Remettre a 0°" style="display:none;">&#x21BA; 0°</button>
                                        </label>
                                        <input type="range" id="prep-rotation-fine" min="${ROTATION_FINE_MIN}" max="${ROTATION_FINE_MAX}" value="0" step="0.5"
                                               data-on-input="travauxPreparation.rotationFineHandler">
                                    </div>
                                </div>
                            </div>

                            <!-- Section Decoupe -->
                            <div class="prep-section" id="prep-section-decoupe">
                                <div class="prep-section-label" data-action="travauxPreparation.toggleSection" data-param="decoupe">Découpe</div>
                                <div class="prep-section-sous-titre">cadrage et perspective</div>
                                <div class="prep-section-body">
                                    <div class="prep-btn-row">
                                        <button class="prep-btn" data-action="travauxPreparation.activerCrop">Recadrage</button>
                                        <button class="prep-btn" data-action="travauxPreparation.activerPerspective">Perspective</button>
                                    </div>
                                    <div class="prep-option-row" id="prep-persp-fill-row" style="display:none;">
                                        <label class="prep-option-label">Remplissage</label>
                                        <select id="prep-persp-fill" class="prep-select"
                                                data-on-change="travauxPreparation.changerRemplissagePerspectiveHandler">
                                            <option value="none">Aucun (transparent)</option>
                                            <option value="white" selected>Blanc</option>
                                            <option value="auto">Auto (couleur de page)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Section Image -->
                            <div class="prep-section" id="prep-section-image">
                                <div class="prep-section-label" data-action="travauxPreparation.toggleSection" data-param="image">Image</div>
                                <div class="prep-section-sous-titre">ajustements visuels</div>
                                <div class="prep-section-body">
                                    <div class="prep-slider-groupe">
                                        <label>Luminosité</label>
                                        <input type="range" id="prep-luminosite" min="${LUMINOSITE_MIN}" max="${LUMINOSITE_MAX}" value="0"
                                               data-on-input="travauxPreparation.changerLuminositeHandler">
                                    </div>
                                    <div class="prep-slider-groupe">
                                        <label>Contraste</label>
                                        <input type="range" id="prep-contraste" min="${CONTRASTE_MIN}" max="${CONTRASTE_MAX}" value="0"
                                               data-on-input="travauxPreparation.changerContrasteHandler">
                                    </div>
                                    <div class="prep-slider-groupe">
                                        <label>Exposition <span id="prep-exposition-valeur" class="texte-muted">0</span></label>
                                        <input type="range" id="prep-exposition" min="${EXPOSITION_MIN}" max="${EXPOSITION_MAX}" value="0" step="1"
                                               data-on-input="travauxPreparation.changerExpositionHandler">
                                    </div>
                                    <div class="prep-btn-row">
                                        <button class="prep-btn" id="prep-btn-balance" data-action="travauxPreparation.activerBalanceBlancs">Balance des blancs</button>
                                        <button class="prep-btn" data-action="travauxPreparation.basculerNiveauxDeGris">Niveaux de gris</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Section Import (reglages par fichier) -->
                            <div class="prep-section" id="prep-section-import">
                                <div class="prep-section-label" data-action="travauxPreparation.toggleSection" data-param="import">Import</div>
                                <div class="prep-section-sous-titre">r\u00e9glages par fichier</div>
                                <div class="prep-section-body">
                                    <div class="prep-option-row">
                                        <label class="prep-option-label">
                                            <input type="checkbox" id="prep-opt-balance"
                                                   data-on-change="travauxPreparation.changerOptBalanceHandler">
                                            Ne pas appliquer la balance des blancs à ce document
                                        </label>
                                    </div>
                                    <div class="prep-option-row">
                                        <label class="prep-option-label">
                                            <input type="checkbox" id="prep-opt-resolution"
                                                   data-on-change="travauxPreparation.changerOptResolutionHandler">
                                            Conserver la r\u00e9solution originale
                                        </label>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="prep-palette-footer">
                            <button class="prep-btn" data-action="travauxPreparation.annulerDerniere">Annuler</button>
                            <button class="prep-btn" data-action="travauxPreparation.reinitialiser">Réinit.</button>
                        </div>
                    </div>
                </div>
        `;

        document.body.appendChild(modal);

        // Recuperer les refs DOM du workspace zoomable
        canvasApercu = document.getElementById('prep-canvas-apercu');
        ctxApercu = canvasApercu.getContext('2d');
        canvasOverlay = document.getElementById('prep-canvas-overlay');
        ctxOverlay = canvasOverlay.getContext('2d');
        prepScrollContainer = document.getElementById('prep-canvas-scroll');
        prepEspaceWrapper = document.getElementById('prep-espace-wrapper');
        prepEspace = document.getElementById('prep-espace');

        // Configurer les interactions
        configurerInteractions();
        configurerZoomEvents();
        configurerDragPalettes();

        // Mettre a jour les boutons d'outils periodiquement.
        // #572 — un `setInterval` nu ici fuyait : la fonction est appelée à
        // CHAQUE ouverture du poste de préparation, et rien ne nettoyait le
        // timer précédent. Après dix ouvertures, dix timers tournaient encore à
        // 200 ms sur une modale fermée. Pas de bug visible (`verifierBoutonsOutils`
        // sort tôt sur `!actif`), mais une accumulation qui ne s'arrête jamais.
        if (timerBoutonsOutils) clearInterval(timerBoutonsOutils);
        timerBoutonsOutils = setInterval(verifierBoutonsOutils, 200);
    }

    /**
     * Verifie et met a jour l'etat visuel des boutons d'outils
     */
    function verifierBoutonsOutils() {
        if (!actif) return;

        const btnCrop = document.getElementById('prep-btn-appliquer-crop');
        const btnPersp = document.getElementById('prep-btn-appliquer-persp');
        if (btnCrop) btnCrop.style.display = outilActif === 'crop' ? 'block' : 'none';
        if (btnPersp) btnPersp.style.display = outilActif === 'perspective' ? 'block' : 'none';

        const fillRow = document.getElementById('prep-persp-fill-row');
        if (fillRow) fillRow.style.display = outilActif === 'perspective' ? 'flex' : 'none';

        // Feedback visuel balance des blancs
        const btnBalance = document.getElementById('prep-btn-balance');
        if (btnBalance) {
            btnBalance.classList.toggle('actif', outilActif === 'balance');
        }

        // Mise a jour valeur rotation fine
        const rotSlider = document.getElementById('prep-rotation-fine');
        const rotVal = document.getElementById('prep-rotation-valeur');
        if (rotSlider && rotVal) {
            rotVal.textContent = rotSlider.value + '°';
        }
        const btnReset = document.getElementById('prep-btn-reset-rotation');
        if (btnReset && rotSlider) {
            btnReset.style.display = parseFloat(rotSlider.value) !== 0 ? 'inline' : 'none';
        }
    }

    /**
     * Replier / deplier une palette
     */
    function togglePalette(id) {
        const palette = document.getElementById('prep-palette-' + id);
        if (!palette) return;
        palette.classList.toggle('replie');
        const btn = palette.querySelector('.prep-palette-toggle');
        if (btn) btn.textContent = palette.classList.contains('replie') ? '+' : '\u2212';
    }

    /**
     * Replier / deplier une section (dropdown)
     */
    function toggleSection(id) {
        const section = document.getElementById('prep-section-' + id);
        if (!section) return;
        section.classList.toggle('replie');
    }

    /**
     * Rend les palettes draggables par leur barre de titre
     */
    function configurerDragPalettes() {
        document.querySelectorAll('.prep-palette-barre').forEach(barre => {
            barre.addEventListener('mousedown', function(e) {
                if (e.target.closest('.prep-palette-toggle')) return;
                e.preventDefault();

                const palette = barre.closest('.prep-palette');
                const workspace = palette.parentElement;
                const wRect = workspace.getBoundingClientRect();
                const pRect = palette.getBoundingClientRect();

                const startX = e.clientX;
                const startY = e.clientY;
                const startLeft = pRect.left - wRect.left;
                const startTop = pRect.top - wRect.top;

                // Passer en positionnement left/top
                palette.style.right = 'auto';
                palette.style.bottom = 'auto';
                palette.style.left = startLeft + 'px';
                palette.style.top = startTop + 'px';

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
        });
    }

    /* ===============================
       BALANCE DES BLANCS AUTOMATIQUE (BATCH)
       =============================== */

    /**
     * Applique automatiquement la balance des blancs sur un blob image.
     * Echantillonne la zone la plus claire (top 5% des pixels en luminosite),
     * calcule les facteurs de correction RGB, et applique la correction.
     * @param {Blob} blob - Le blob image a traiter
     * @returns {Promise<Blob>} Le blob corrige
     */
    function autoBalanceBlancs(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const d = imgData.data;
                const totalPixels = d.length / 4;

                // Collecter la luminosite de chaque pixel
                const luminosites = new Float32Array(totalPixels);
                for (let i = 0; i < totalPixels; i++) {
                    const idx = i * 4;
                    luminosites[i] = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
                }

                // Trouver le seuil top 5%
                const sorted = Float32Array.from(luminosites).sort();
                const seuil = sorted[Math.floor(totalPixels * 0.95)];

                // Moyenne RGB des pixels les plus clairs
                let sumR = 0, sumG = 0, sumB = 0, count = 0;
                for (let i = 0; i < totalPixels; i++) {
                    if (luminosites[i] >= seuil) {
                        const idx = i * 4;
                        sumR += d[idx];
                        sumG += d[idx + 1];
                        sumB += d[idx + 2];
                        count++;
                    }
                }

                if (count === 0) {
                    canvas.toBlob(b => resolve(b), 'image/jpeg', 0.92);
                    return;
                }

                const avgR = sumR / count;
                const avgG = sumG / count;
                const avgB = sumB / count;

                // Eviter division par zero, limiter les facteurs entre 0.5 et 2.0
                const rFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(avgR, 1)));
                const gFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(avgG, 1)));
                const bFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(avgB, 1)));

                // Appliquer pixel par pixel
                for (let i = 0; i < d.length; i += 4) {
                    d[i]     = Math.min(255, Math.round(d[i]     * rFactor));
                    d[i + 1] = Math.min(255, Math.round(d[i + 1] * gFactor));
                    d[i + 2] = Math.min(255, Math.round(d[i + 2] * bFactor));
                }

                ctx.putImageData(imgData, 0, 0);
                canvas.toBlob(
                    (blobResult) => resolve(blobResult),
                    'image/jpeg',
                    0.92
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(blob); // fallback: garder l'original
            };

            img.src = url;
        });
    }

    /* ===============================
       WRAPPERS DELEGATION (Phase 5)
       =============================== */

    /** Handler oninput pour rotationFine(value) */
    function rotationFineHandler(el) {
        rotationFine(el.value);
    }

    /** Handler oninput pour changerLuminosite(value) */
    function changerLuminositeHandler(el) {
        changerLuminosite(el.value);
    }

    /** Handler oninput pour changerContraste(value) */
    function changerContrasteHandler(el) {
        changerContraste(el.value);
    }

    /** Handler oninput pour changerExposition(value) */
    function changerExpositionHandler(el) {
        changerExposition(el.value);
    }

    /** Handler onchange pour changerRemplissagePerspective(value) */
    function changerRemplissagePerspectiveHandler(el) {
        changerRemplissagePerspective(el.value);
    }

    /** Handler onchange pour changerOptBalance(!checked) — note: negation */
    function changerOptBalanceHandler(el) {
        changerOptBalance(!el.checked);
    }

    /** Handler onchange pour changerOptResolution(checked) */
    function changerOptResolutionHandler(el) {
        changerOptResolution(el.checked);
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxPreparation = {
        ouvrir: ouvrir,
        fermer: fermer,
        passer: passer,
        confirmerTout: confirmer,
        // Navigation
        chargerFichier: chargerFichier,
        fichierPrecedent: fichierPrecedent,
        fichierSuivant: fichierSuivant,
        // Outils
        rotation90CW: rotation90CW,
        rotation90CCW: rotation90CCW,
        rotationFine: rotationFine,
        resetRotationFine: resetRotationFine,
        activerCrop: activerCrop,
        appliquerCrop: appliquerCrop,
        activerPerspective: activerPerspective,
        appliquerPerspective: appliquerPerspective,
        changerRemplissagePerspective: changerRemplissagePerspective,
        changerLuminosite: changerLuminosite,
        changerContraste: changerContraste,
        changerExposition: changerExposition,
        basculerNiveauxDeGris: basculerNiveauxDeGris,
        activerBalanceBlancs: activerBalanceBlancs,
        changerOptBalance: changerOptBalance,
        changerOptResolution: changerOptResolution,
        annulerDerniere: annulerDerniere,
        reinitialiser: reinitialiser,
        // Assemblage
        toggleSelection: toggleSelection,
        grouperSelection: grouperSelection,
        degrouper: degrouper,
        assemblerAuto: assemblerAuto,
        // Palettes
        togglePalette: togglePalette,
        toggleSection: toggleSection,
        // Wrappers delegation (Phase 5)
        rotationFineHandler: rotationFineHandler,
        changerLuminositeHandler: changerLuminositeHandler,
        changerContrasteHandler: changerContrasteHandler,
        changerExpositionHandler: changerExpositionHandler,
        changerRemplissagePerspectiveHandler: changerRemplissagePerspectiveHandler,
        changerOptBalanceHandler: changerOptBalanceHandler,
        changerOptResolutionHandler: changerOptResolutionHandler,
        // Zoom
        prepZoomFit: prepZoomFit,
        // Batch
        autoBalanceBlancs: autoBalanceBlancs,
        // #884 — rejeu des réglages sur un fichier re-déposé (travaux-import.js)
        renduFinal: renduFinal,
        // Etat
        get actif() { return actif; }
    };


})();
