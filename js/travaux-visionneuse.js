/* ===============================
   MODULE: TRAVAUX - VISIONNEUSE
   Rendu PDF (PDF.js) et images, zoom/pan, navigation pages

   DEPENDANCES:
   - libs/pdf.min.js (PDF.js)
   - travaux-stockage.js (recupererBlob)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    const ZOOM_MIN = 0.25;
    const ZOOM_MAX = 4.0;
    const ZOOM_PAS = 0.1;
    const ZOOM_DEFAUT = 1.0;
    const ZOOM_FIT = 'fit'; // Ajuster a la fenetre
    const ZOOM_FIT_WIDTH = 'fit-width';   // Pleine largeur
    const ZOOM_FIT_HEIGHT = 'fit-height'; // Pleine hauteur

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let fichierActuel = null;       // Metadonnees du fichier ouvert
    let pdfDocument = null;         // Instance PDF.js
    let pageActuelle = 1;
    let nombrePagesTotal = 1;
    let zoomActuel = ZOOM_DEFAUT;
    let modeZoom = ZOOM_FIT;        // 'fit' ou valeur numerique
    let canvasDocument = null;       // Canvas de rendu
    let ctxDocument = null;
    let conteneurVisionneuse = null;
    let enRendu = false;

    // Contexte externe (injection par module Modelisation)
    let contextExterne = null; // { canvasDocument } — injecte par module externe

    // Cache de pre-rendu pour pages adjacentes
    const cachePages = new Map(); // Map<numPage, {canvas, scale}>
    const MAX_CACHE_PAGES = 5;

    // Dimensions originales du document (avant zoom)
    let dimensionsOriginales = { w: 0, h: 0 };

    /* ===============================
       INITIALISATION PDF.js
       =============================== */

    /**
     * Configure PDF.js worker
     */
    function configurerPDFjs() {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdf.worker.min.js';
        } else {
            console.warn('[Travaux-Visionneuse] PDF.js non disponible');
        }
    }

    /* ===============================
       OUVERTURE FICHIER
       =============================== */

    /**
     * Ouvre un fichier dans la visionneuse
     * @param {string} fichierId - ID du fichier travail
     * @returns {Promise<boolean>} true si ouvert avec succes
     */
    async function ouvrirFichier(fichierId) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) {
            console.error('[Travaux-Visionneuse] Fichier introuvable:', fichierId);
            return false;
        }

        // Recuperer le blob
        const blob = await travauxStockage.recupererBlob(fichierId);
        if (!blob) {
            console.error('[Travaux-Visionneuse] Blob introuvable:', fichierId);
            return false;
        }

        // 🔧 FIX (5 mars 2026) : Nettoyer l'ancien document PDF et le cache de pages
        // avant d'ouvrir le nouveau fichier, pour éviter un flash de contenu stale.
        if (pdfDocument) {
            try { pdfDocument.cleanup(); } catch (_) { console.warn('[Visionneuse] PDF cleanup skipped:', _.message || _); }
            pdfDocument = null;
        }
        cachePages.clear();

        fichierActuel = fichier;
        pageActuelle = 1;
        modeZoom = ZOOM_FIT;

        if (fichier.typeMIME === 'application/pdf') {
            await ouvrirPDF(blob);
        } else if (fichier.typeMIME.startsWith('image/')) {
            await ouvrirImage(blob);
        }

        mettreAJourNavigation();
        recentrerVue();
        // Recentrer après que le layout soit finalisé (PDF/image async)
        // Double requestAnimationFrame pour attendre le rendu complet
        requestAnimationFrame(() => { requestAnimationFrame(() => recentrerVue()); });
        return true;
    }

    /**
     * Ouvre un PDF dans la visionneuse
     * @param {Blob} blob - Le blob PDF
     */
    async function ouvrirPDF(blob) {
        if (typeof pdfjsLib === 'undefined') {
            afficherErreur('PDF.js non disponible');
            return;
        }

        // try/catch pour gerer les rejets de pdfjsLib.getDocument :
        // PDF corrompu (InvalidPDFException), chiffre (PasswordException),
        // worker non charge (MissingPDFException). Sans ce catch, la rejection
        // remontait dans ouvrirFichier qui avait deja mis fichierActuel et
        // efface pdfDocument -> etat incoherent (claim un fichier ouvert avec
        // pdfDocument === null) sans erreur visible. Symetrie avec ouvrirImage
        // qui gere son img.onerror via afficherErreur.
        try {
            const arrayBuffer = await blob.arrayBuffer();
            pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            nombrePagesTotal = pdfDocument.numPages;
            await rendrePage(1);
        } catch (e) {
            console.error('[Travaux-Visionneuse] Erreur ouverture PDF:', e);
            pdfDocument = null;
            fichierActuel = null;
            afficherErreur('Erreur ouverture PDF');
        }
    }

    /**
     * Ouvre une image dans la visionneuse
     * @param {Blob} blob - Le blob image
     */
    async function ouvrirImage(blob) {
        pdfDocument = null;
        nombrePagesTotal = 1;

        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);
                rendreImage(img);
                resolve();
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                afficherErreur('Erreur chargement image');
                resolve();
            };

            img.src = url;
        });
    }

    /* ===============================
       RENDU
       =============================== */

    /**
     * Rend une page PDF sur le canvas
     * @param {number} numPage - Numero de page (1-indexed)
     */
    async function rendrePage(numPage) {
        if (!pdfDocument || enRendu) return;
        if (numPage < 1 || numPage > nombrePagesTotal) return;

        enRendu = true;
        pageActuelle = numPage;

        try {
            const page = await pdfDocument.getPage(numPage);

            // Stocker les dimensions originales (avant zoom)
            const viewportOriginal = page.getViewport({ scale: 1 });
            dimensionsOriginales = { w: viewportOriginal.width, h: viewportOriginal.height };

            const zoomEffectif = calculerZoomEffectif(page);
            const viewport = page.getViewport({ scale: zoomEffectif });

            // Verifier le cache
            const cached = cachePages.get(numPage);
            initialiserCanvas();

            if (cached && cached.scale === zoomEffectif) {
                // Utiliser la page pre-rendue
                canvasDocument.width = cached.canvas.width;
                canvasDocument.height = cached.canvas.height;
                ctxDocument.drawImage(cached.canvas, 0, 0);
            } else {
                // Rendre la page normalement
                canvasDocument.width = viewport.width;
                canvasDocument.height = viewport.height;
                await page.render({
                    canvasContext: ctxDocument,
                    viewport: viewport
                }).promise;
            }

            // Notifier pour l'overlay d'annotation
            window.dispatchEvent(new CustomEvent('travaux-page-rendue', {
                detail: {
                    page: numPage,
                    width: viewport.width,
                    height: viewport.height,
                    scale: zoomEffectif
                }
            }));

            // Pre-rendre les pages adjacentes en arriere-plan
            preRendreAdjacentes(numPage, zoomEffectif).catch(err => {
                console.warn('[Travaux-Visionneuse] Erreur pré-rendu adjacentes:', err);
            });

        } catch (e) {
            console.error('[Travaux-Visionneuse] Erreur rendu page:', e);
        }

        enRendu = false;
        mettreAJourNavigation();
    }

    /**
     * Pre-rend les pages adjacentes dans des canvas hors-ecran
     * @param {number} numPage - Page courante
     * @param {number} scale - Echelle de rendu
     */
    async function preRendreAdjacentes(numPage, scale) {
        if (!pdfDocument) return;

        // Nettoyer le cache si trop grand
        if (cachePages.size > MAX_CACHE_PAGES) {
            const pagesToKeep = new Set([numPage, numPage - 1, numPage + 1]);
            for (const key of cachePages.keys()) {
                if (!pagesToKeep.has(key)) {
                    cachePages.delete(key);
                }
            }
        }

        const pagesToRender = [];
        if (numPage + 1 <= nombrePagesTotal && !cachePages.has(numPage + 1)) {
            pagesToRender.push(numPage + 1);
        }
        if (numPage - 1 >= 1 && !cachePages.has(numPage - 1)) {
            pagesToRender.push(numPage - 1);
        }

        for (const num of pagesToRender) {
            try {
                const page = await pdfDocument.getPage(num);
                const viewport = page.getViewport({ scale: scale });
                const offscreen = document.createElement('canvas');
                offscreen.width = viewport.width;
                offscreen.height = viewport.height;
                const ctx = offscreen.getContext('2d');

                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                cachePages.set(num, { canvas: offscreen, scale: scale });
            } catch (e) {
                // Silencieux - le pre-rendu n'est pas critique
            }
        }
    }

    /**
     * Rend une image sur le canvas
     * @param {HTMLImageElement} img - L'image chargee
     */
    function rendreImage(img) {
        initialiserCanvas();

        // Stocker les dimensions originales (avant zoom)
        dimensionsOriginales = { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };

        const zoomEffectif = calculerZoomImage(img);
        const w = img.width * zoomEffectif;
        const h = img.height * zoomEffectif;

        canvasDocument.width = w;
        canvasDocument.height = h;
        ctxDocument.drawImage(img, 0, 0, w, h);

        // Stocker l'image pour re-rendu lors du zoom
        canvasDocument._imageSource = img;

        window.dispatchEvent(new CustomEvent('travaux-page-rendue', {
            detail: {
                page: 1,
                width: w,
                height: h,
                scale: zoomEffectif
            }
        }));

        mettreAJourNavigation();
    }

    /**
     * Calcule le zoom effectif pour un PDF
     * @param {Object} page - Page PDF.js
     * @returns {number} Scale a appliquer
     */
    function calculerZoomEffectif(page) {
        if (modeZoom !== ZOOM_FIT && modeZoom !== ZOOM_FIT_WIDTH && modeZoom !== ZOOM_FIT_HEIGHT) {
            return zoomActuel;
        }

        const viewport = page.getViewport({ scale: 1.0 });
        const conteneur = _obtenirConteneurZoom();
        if (!conteneur) return 1.0;

        const largeurDispo = conteneur.clientWidth - 40; // marge
        const hauteurDispo = conteneur.clientHeight - 40;

        if (modeZoom === ZOOM_FIT_WIDTH) {
            zoomActuel = Math.min(largeurDispo / viewport.width, ZOOM_MAX);
        } else if (modeZoom === ZOOM_FIT_HEIGHT) {
            zoomActuel = Math.min(hauteurDispo / viewport.height, ZOOM_MAX);
        } else {
            const scaleX = largeurDispo / viewport.width;
            const scaleY = hauteurDispo / viewport.height;
            zoomActuel = Math.min(scaleX, scaleY, 2.0); // cap a 2x
        }
        return zoomActuel;
    }

    /**
     * Retourne le conteneur de référence pour le calcul de zoom.
     */
    function _obtenirConteneurZoom() {
        return conteneurVisionneuse || document.getElementById('travaux-conteneur-document');
    }

    /**
     * Calcule le zoom effectif pour une image
     * @param {HTMLImageElement} img - L'image
     * @returns {number} Scale a appliquer
     */
    function calculerZoomImage(img) {
        if (modeZoom !== ZOOM_FIT && modeZoom !== ZOOM_FIT_WIDTH && modeZoom !== ZOOM_FIT_HEIGHT) {
            return zoomActuel;
        }

        const conteneur = _obtenirConteneurZoom();
        if (!conteneur) return 1.0;

        const largeurDispo = conteneur.clientWidth - 40;
        const hauteurDispo = conteneur.clientHeight - 40;

        if (modeZoom === ZOOM_FIT_WIDTH) {
            zoomActuel = Math.min(largeurDispo / img.width, ZOOM_MAX);
        } else if (modeZoom === ZOOM_FIT_HEIGHT) {
            zoomActuel = Math.min(hauteurDispo / img.height, ZOOM_MAX);
        } else {
            const scaleX = largeurDispo / img.width;
            const scaleY = hauteurDispo / img.height;
            zoomActuel = Math.min(scaleX, scaleY, 2.0);
        }
        return zoomActuel;
    }

    /**
     * Initialise ou recupere le canvas de rendu
     * Toujours rafraichir depuis le DOM (le HTML peut etre regenere)
     */
    function initialiserCanvas() {
        if (contextExterne && contextExterne.canvasDocument) {
            canvasDocument = contextExterne.canvasDocument;
        } else {
            canvasDocument = document.getElementById('travaux-canvas-document');
        }
        if (canvasDocument) {
            ctxDocument = canvasDocument.getContext('2d');
        }
    }

    /**
     * Affiche un message d'erreur dans la visionneuse
     * @param {string} message - Le message d'erreur
     */
    function afficherErreur(message) {
        initialiserCanvas();
        if (!canvasDocument) return;

        canvasDocument.width = 400;
        canvasDocument.height = 200;
        ctxDocument.fillStyle = '#f8f9fa';
        ctxDocument.fillRect(0, 0, 400, 200);
        ctxDocument.fillStyle = '#dc3545';
        ctxDocument.font = '16px sans-serif';
        ctxDocument.textAlign = 'center';
        ctxDocument.fillText(message, 200, 100);
    }

    /* ===============================
       NAVIGATION
       =============================== */

    /**
     * Page suivante
     */
    async function pageSuivante() {
        if (pageActuelle < nombrePagesTotal) {
            await rendrePage(pageActuelle + 1);
            recentrerVue();
        }
    }

    /**
     * Page precedente
     */
    async function pagePrecedente() {
        if (pageActuelle > 1) {
            await rendrePage(pageActuelle - 1);
            recentrerVue();
        }
    }

    /**
     * Aller a une page specifique
     * @param {number} num - Numero de page
     */
    async function allerAPage(num) {
        num = parseInt(num, 10);
        if (num >= 1 && num <= nombrePagesTotal) {
            await rendrePage(num);
            recentrerVue();
        }
    }

    /**
     * Met a jour l'affichage de la navigation de pages
     */
    function mettreAJourNavigation() {
        const indicateur = document.getElementById('travaux-indicateur-page');
        if (indicateur) {
            indicateur.textContent = `${pageActuelle} / ${nombrePagesTotal}`;
        }

        // Toolbar standard ET toolbar split-view (vue cote-a-cote). Ces 2
        // toolbars utilisent des IDs differents -- avant 99.30, seuls les
        // boutons standard etaient mis a jour, laissant les boutons split
        // disabled a perpetuite, rendant la navigation multi-pages impossible
        // dans la vue cote-a-cote.
        const btnsPrec = [
            document.getElementById('travaux-btn-page-prec'),
            document.getElementById('travaux-split-btn-page-prec')
        ].filter(Boolean);
        const btnsSuiv = [
            document.getElementById('travaux-btn-page-suiv'),
            document.getElementById('travaux-split-btn-page-suiv')
        ].filter(Boolean);

        btnsPrec.forEach(b => { b.disabled = pageActuelle <= 1; });
        btnsSuiv.forEach(b => { b.disabled = pageActuelle >= nombrePagesTotal; });

        // Zoom — mettre à jour le bouton zoom100 avec le pourcentage réel
        var btnZoom100 = document.getElementById('travaux-btn-zoom100');
        if (btnZoom100) {
            btnZoom100.textContent = Math.round(zoomActuel * 100) + '%';
        }
    }

    /* ===============================
       ZOOM
       =============================== */

    /**
     * Zoom avant
     */
    /**
     * Zoom avec recentrage : préserve le point focal (centre de la vue)
     */
    async function zoomAvecRecentrage(ancienZoom) {
        if (!conteneurGestesZoom) {
            await reRendrePageActuelle();
            return;
        }
        // Point focal = centre de la vue en coordonnees du contenu.
        // Symetrie (99.30) : appliquer la meme formule margin-aware que
        // finaliserPinchZoom (l. 803) et onWheelZoom -- la marge CSS du wrapper
        // ne scale pas avec le zoom, donc traiter cX*ratio comme uniformement
        // scale over-shifte le scroll de margin*(ratio-1) par clic. Sur 10
        // clics +/-, drift cumule ~100px du focal point.
        var viewX = conteneurGestesZoom.clientWidth / 2;
        var viewY = conteneurGestesZoom.clientHeight / 2;
        var contentX = conteneurGestesZoom.scrollLeft + viewX;
        var contentY = conteneurGestesZoom.scrollTop + viewY;
        var margin = getMarginWrapper();
        var ratio = ancienZoom > 0 ? zoomActuel / ancienZoom : 1;

        await reRendrePageActuelle();

        conteneurGestesZoom.scrollLeft = (contentX - margin.left) * ratio + margin.left - viewX;
        conteneurGestesZoom.scrollTop = (contentY - margin.top) * ratio + margin.top - viewY;
    }

    async function zoomAvant() {
        modeZoom = 'manual';
        var ancien = zoomActuel;
        zoomActuel = Math.min(zoomActuel + ZOOM_PAS, ZOOM_MAX);
        mettreAJourNavigation();
        cachePages.clear();
        await zoomAvecRecentrage(ancien);
    }

    /**
     * Zoom arriere
     */
    async function zoomArriere() {
        modeZoom = 'manual';
        var ancien = zoomActuel;
        zoomActuel = Math.max(zoomActuel - ZOOM_PAS, ZOOM_MIN);
        mettreAJourNavigation();
        cachePages.clear();
        await zoomAvecRecentrage(ancien);
    }

    /**
     * Ajuster a la fenetre
     */
    async function zoomAjuster() {
        modeZoom = ZOOM_FIT;
        cachePages.clear();
        await reRendrePageActuelle();
        recentrerVue();
    }

    /**
     * Zoom pleine largeur : le document couvre toute la largeur du conteneur
     */
    async function zoomPleineLargeur() {
        modeZoom = ZOOM_FIT_WIDTH;
        cachePages.clear();
        await reRendrePageActuelle();
        recentrerVue();
    }

    /**
     * Zoom pleine hauteur : le document tient en hauteur dans le conteneur
     */
    async function zoomPleineHauteur() {
        modeZoom = ZOOM_FIT_HEIGHT;
        cachePages.clear();
        await reRendrePageActuelle();
        recentrerVue();
    }

    /**
     * Zoom 100% : remet le zoom a exactement 1.0
     */
    async function zoom100() {
        modeZoom = 'manual';
        var ancien = zoomActuel;
        zoomActuel = 1.0;
        cachePages.clear();
        await zoomAvecRecentrage(ancien);
    }

    /**
     * Zoom a un niveau specifique (ex: 1.65 pour 165%)
     * @param {number} niveau - Facteur de zoom
     */
    async function setZoomManuel(niveau) {
        modeZoom = 'manual';
        zoomActuel = Math.max(ZOOM_MIN, Math.min(niveau, ZOOM_MAX));
        cachePages.clear();
        await reRendrePageActuelle();
    }

    /**
     * Re-rend la page actuelle (apres zoom)
     */
    async function reRendrePageActuelle() {
        if (pdfDocument) {
            await rendrePage(pageActuelle);
        } else if (canvasDocument && canvasDocument._imageSource) {
            rendreImage(canvasDocument._imageSource);
        }
    }

    /* ===============================
       GESTES ZOOM (Pinch & Molette)
       Safari: gesturestart/gesturechange (fiable pour bloquer le zoom natif)
       Chrome/Firefox: wheel avec ctrlKey (trackpad pinch)
       Touch events en fallback pour navigateurs non-Safari
       =============================== */

    let conteneurGestesZoom = null;
    let wrapperGestesZoom = null;
    const estSafari = typeof GestureEvent !== 'undefined';

    // Etat du geste molette (Mac trackpad / souris Ctrl+molette)
    let gesteZoomMolette = {
        actif: false,
        zoomDepart: 1,
        viewX: 0,
        viewY: 0,
        scrollXDepart: 0,
        scrollYDepart: 0,
        timer: null
    };

    // Etat du pinch (gesture Safari ou touch)
    let pinchState = {
        actif: false,
        zoomInitial: 1,
        zoomCible: null,
        origineFixee: false,
        centreX: 0,
        centreY: 0,
        // Touch-only
        distanceInitiale: 0
    };

    // Etat du pan (glisser-deplacer la vue)
    let panState = {
        actif: false,
        spaceActif: false,
        startX: 0,
        startY: 0,
        scrollXDepart: 0,
        scrollYDepart: 0
    };

    /**
     * Configure les gestes de zoom sur le conteneur du document
     * @param {HTMLElement} conteneur - .travaux-canvas-container
     */
    function configurerGestesZoom(conteneur) {
        if (!conteneur) return;
        conteneurGestesZoom = conteneur;
        wrapperGestesZoom = conteneur.querySelector('.travaux-canvas-wrapper');

        // Molette zoom (Chrome/Firefox trackpad pinch, ou Ctrl+molette souris)
        conteneur.addEventListener('wheel', onWheelZoom, { passive: false });

        if (estSafari) {
            // Safari (iPad + macOS) : gesturestart/gesturechange
            // Ces events sont les plus fiables pour bloquer le zoom natif Safari
            conteneur.addEventListener('gesturestart', onSafariGestureStart, { passive: false });
            conteneur.addEventListener('gesturechange', onSafariGestureChange, { passive: false });
            conteneur.addEventListener('gestureend', onSafariGestureEnd);
        } else {
            // Non-Safari : touch events classiques
            conteneur.addEventListener('touchstart', onPinchStart, { passive: false });
            conteneur.addEventListener('touchmove', onPinchMove, { passive: false });
            conteneur.addEventListener('touchend', onPinchEnd);
            conteneur.addEventListener('touchcancel', onPinchEnd);
        }

        // Prevention supplementaire : bloquer le zoom natif sur tout le document
        // quand un pinch est en cours dans notre zone
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });

        configurerPan(conteneur);

    }

    /**
     * Bloque le zoom natif a l'echelle du document pendant un pinch actif
     */
    function onDocumentTouchMove(e) {
        if (pinchState.actif && e.touches.length > 1) {
            e.preventDefault();
        }
    }

    /* --- Safari Gesture Events (iPad + macOS Safari) --- */

    /**
     * Debut du geste Safari (pinch detecte)
     */
    function onSafariGestureStart(e) {
        if (!fichierActuel) return;
        e.preventDefault();

        pinchState.actif = true;
        pinchState.zoomInitial = zoomActuel;
        pinchState.zoomCible = zoomActuel;
        pinchState.origineFixee = false;
    }

    /**
     * Mouvement du geste Safari - e.scale est cumulatif depuis gesturestart
     */
    function onSafariGestureChange(e) {
        if (!pinchState.actif || !fichierActuel) return;
        e.preventDefault();

        const zoomCible = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pinchState.zoomInitial * e.scale));

        if (wrapperGestesZoom) {
            // Fixer le centre de zoom une seule fois
            if (!pinchState.origineFixee) {
                const wrapperRect = wrapperGestesZoom.getBoundingClientRect();
                const cx = e.pageX - wrapperRect.left - window.scrollX;
                const cy = e.pageY - wrapperRect.top - window.scrollY;
                wrapperGestesZoom.style.transformOrigin = `${cx}px ${cy}px`;
                pinchState.origineFixee = true;

                const containerRect = conteneurGestesZoom.getBoundingClientRect();
                pinchState.centreX = e.pageX - containerRect.left - window.scrollX;
                pinchState.centreY = e.pageY - containerRect.top - window.scrollY;
            }

            const scaleVisuel = zoomCible / zoomActuel;
            wrapperGestesZoom.style.transform = `scale(${scaleVisuel})`;
            pinchState.zoomCible = zoomCible;
        }
    }

    /**
     * Fin du geste Safari - re-rendu a la resolution finale
     */
    async function onSafariGestureEnd(e) {
        if (!pinchState.actif) return;
        pinchState.actif = false;

        await finaliserPinchZoom();
    }

    /* --- Touch Events (non-Safari fallback) --- */

    /**
     * Distance euclidienne entre deux points de toucher
     */
    function distanceTouches(t1, t2) {
        return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }

    /**
     * Debut du pinch (deux doigts) - non-Safari
     */
    function onPinchStart(e) {
        if (e.touches.length !== 2 || !fichierActuel) return;

        e.preventDefault();
        pinchState.actif = true;
        pinchState.distanceInitiale = distanceTouches(e.touches[0], e.touches[1]);
        pinchState.zoomInitial = zoomActuel;
        pinchState.zoomCible = zoomActuel;
        pinchState.origineFixee = false;
    }

    /**
     * Mouvement du pinch - non-Safari
     */
    function onPinchMove(e) {
        if (!pinchState.actif || e.touches.length !== 2) return;

        e.preventDefault();

        const distanceCourante = distanceTouches(e.touches[0], e.touches[1]);
        const ratio = distanceCourante / pinchState.distanceInitiale;
        const zoomCible = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pinchState.zoomInitial * ratio));

        if (wrapperGestesZoom) {
            if (!pinchState.origineFixee) {
                const wrapperRect = wrapperGestesZoom.getBoundingClientRect();
                const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - wrapperRect.left;
                const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - wrapperRect.top;
                wrapperGestesZoom.style.transformOrigin = `${cx}px ${cy}px`;
                pinchState.origineFixee = true;

                const containerRect = conteneurGestesZoom.getBoundingClientRect();
                pinchState.centreX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - containerRect.left;
                pinchState.centreY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - containerRect.top;
            }

            const scaleVisuel = zoomCible / zoomActuel;
            wrapperGestesZoom.style.transform = `scale(${scaleVisuel})`;
            pinchState.zoomCible = zoomCible;
        }
    }

    /**
     * Fin du pinch - non-Safari
     */
    async function onPinchEnd(e) {
        if (!pinchState.actif) return;
        if (e.touches.length > 0) return;

        pinchState.actif = false;
        await finaliserPinchZoom();
    }

    /* --- Finalisation commune (Safari + non-Safari) --- */

    /**
     * Re-rend le document a la resolution finale apres un pinch
     */
    async function finaliserPinchZoom() {
        // Retirer le transform CSS de preview
        if (wrapperGestesZoom) {
            wrapperGestesZoom.style.transform = '';
            wrapperGestesZoom.style.transformOrigin = '';
        }

        const zoomCible = pinchState.zoomCible;
        if (!zoomCible || Math.abs(zoomCible - zoomActuel) < 0.01) return;

        const ancienZoom = zoomActuel;
        const ratio = zoomCible / ancienZoom;
        const viewX = pinchState.centreX || (conteneurGestesZoom.clientWidth / 2);
        const viewY = pinchState.centreY || (conteneurGestesZoom.clientHeight / 2);
        const contentX = conteneurGestesZoom.scrollLeft + viewX;
        const contentY = conteneurGestesZoom.scrollTop + viewY;
        const margin = getMarginWrapper();

        modeZoom = 'manual';
        zoomActuel = zoomCible;
        cachePages.clear();

        await reRendrePageActuelle();

        // Ajuster pour les marges fixes (seul le canvas scale, pas les marges)
        conteneurGestesZoom.scrollLeft = (contentX - margin.left) * ratio + margin.left - viewX;
        conteneurGestesZoom.scrollTop = (contentY - margin.top) * ratio + margin.top - viewY;

        pinchState.zoomCible = null;
    }

    /* --- Wheel Zoom (Mac trackpad / Ctrl+molette) --- */

    /**
     * Zoom via molette (Ctrl+molette ou pinch trackpad non-Safari)
     */
    function onWheelZoom(e) {
        if (!e.ctrlKey && !e.metaKey) return;
        if (!fichierActuel) return;
        if (pinchState.actif) return; // Safari gesture en cours, eviter le double-zoom

        e.preventDefault();

        const facteur = e.deltaY > 0 ? 0.97 : 1.03;
        const nouveauZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomActuel * facteur));
        if (Math.abs(nouveauZoom - zoomActuel) < 0.001) return;

        const rect = conteneurGestesZoom.getBoundingClientRect();

        if (!gesteZoomMolette.actif) {
            gesteZoomMolette.actif = true;
            gesteZoomMolette.zoomDepart = zoomActuel;
            gesteZoomMolette.scrollXDepart = conteneurGestesZoom.scrollLeft;
            gesteZoomMolette.scrollYDepart = conteneurGestesZoom.scrollTop;
        }

        gesteZoomMolette.viewX = e.clientX - rect.left;
        gesteZoomMolette.viewY = e.clientY - rect.top;

        modeZoom = 'manual';
        zoomActuel = nouveauZoom;
        mettreAJourNavigation();

        if (gesteZoomMolette.timer) clearTimeout(gesteZoomMolette.timer);
        gesteZoomMolette.timer = setTimeout(async () => {
            const ratio = zoomActuel / gesteZoomMolette.zoomDepart;
            const contentX = gesteZoomMolette.scrollXDepart + gesteZoomMolette.viewX;
            const contentY = gesteZoomMolette.scrollYDepart + gesteZoomMolette.viewY;
            const margin = getMarginWrapper();

            cachePages.clear();
            await reRendrePageActuelle();

            // Ajuster pour les marges fixes (seul le canvas scale, pas les marges)
            conteneurGestesZoom.scrollLeft = (contentX - margin.left) * ratio + margin.left - gesteZoomMolette.viewX;
            conteneurGestesZoom.scrollTop = (contentY - margin.top) * ratio + margin.top - gesteZoomMolette.viewY;

            gesteZoomMolette.actif = false;
        }, 100);
    }

    /* ===============================
       PAN (glisser-deplacer la vue)
       =============================== */

    function configurerPan(conteneur) {
        if (!conteneur) return;
        document.addEventListener('keydown', onPanKeyDown);
        document.addEventListener('keyup', onPanKeyUp);
        conteneur.addEventListener('pointerdown', onPanPointerDown);
        conteneur.addEventListener('pointermove', onPanPointerMove, { passive: true });
        conteneur.addEventListener('pointerup', onPanPointerUp);
        conteneur.addEventListener('pointercancel', onPanPointerUp);
        conteneur.addEventListener('mousedown', function(e) {
            if (e.button === 1) e.preventDefault(); // Empecher auto-scroll molette
        });

        // Curseur grab quand l'outil Position est actif
        window.addEventListener('travaux-outil-change', function(e) {
            if (!conteneurGestesZoom) return;
            if (e.detail.outil.id === 'position') {
                conteneurGestesZoom.classList.add('travaux-pan-pret');
            } else {
                conteneurGestesZoom.classList.remove('travaux-pan-pret');
            }
        });

        // Appliquer le curseur initial si l'outil actif est deja position
        if (typeof travauxOutils !== 'undefined' && travauxOutils.getOutilActif().id === 'position') {
            conteneur.classList.add('travaux-pan-pret');
        }
    }

    function onPanKeyDown(e) {
        if (e.key !== ' ' || e.repeat) return;
        if (e.target.matches('input, select, textarea, [contenteditable]')) return;
        if (!fichierActuel) return;
        e.preventDefault();
        panState.spaceActif = true;
        if (conteneurGestesZoom) conteneurGestesZoom.classList.add('travaux-pan-pret');
        window.dispatchEvent(new CustomEvent('travaux-pan-mode', { detail: { actif: true } }));
    }

    function onPanKeyUp(e) {
        if (e.key !== ' ') return;
        panState.spaceActif = false;
        if (!panState.actif && conteneurGestesZoom) {
            // Garder travaux-pan-pret si l'outil Position est actif
            var estModePosition = typeof travauxOutils !== 'undefined'
                && travauxOutils.getOutilActif().id === 'position';
            if (!estModePosition) {
                conteneurGestesZoom.classList.remove('travaux-pan-pret');
            }
            conteneurGestesZoom.classList.remove('travaux-pan-actif');
        }
        window.dispatchEvent(new CustomEvent('travaux-pan-mode', { detail: { actif: false } }));
    }

    function onPanPointerDown(e) {
        if (!fichierActuel) return;
        var estModePosition = typeof travauxOutils !== 'undefined'
            && travauxOutils.getOutilActif().id === 'position';
        var estSpaceDrag = panState.spaceActif && e.button === 0;
        var estMoletteMilieu = e.button === 1;
        var estPositionDrag = estModePosition && e.button === 0;
        if (!estSpaceDrag && !estMoletteMilieu && !estPositionDrag) return;
        e.preventDefault();
        e.stopPropagation();
        panState.actif = true;
        panState.startX = e.clientX;
        panState.startY = e.clientY;
        panState.scrollXDepart = conteneurGestesZoom.scrollLeft;
        panState.scrollYDepart = conteneurGestesZoom.scrollTop;
        if (conteneurGestesZoom) {
            conteneurGestesZoom.classList.add('travaux-pan-actif');
            conteneurGestesZoom.classList.remove('travaux-pan-pret');
            conteneurGestesZoom.setPointerCapture(e.pointerId);
        }
    }

    var _panRAF = null;
    function onPanPointerMove(e) {
        if (!panState.actif) return;
        // Stocker les dernières coordonnées
        panState.lastX = e.clientX;
        panState.lastY = e.clientY;
        // Throttle à 1 update par frame (fluidité)
        if (_panRAF) return;
        _panRAF = requestAnimationFrame(function() {
            _panRAF = null;
            var dx = panState.lastX - panState.startX;
            var dy = panState.lastY - panState.startY;
            conteneurGestesZoom.scrollLeft = panState.scrollXDepart - dx;
            conteneurGestesZoom.scrollTop = panState.scrollYDepart - dy;
        });
    }

    function onPanPointerUp(e) {
        if (!panState.actif) return;
        panState.actif = false;
        if (conteneurGestesZoom) {
            conteneurGestesZoom.classList.remove('travaux-pan-actif');
            var estModePosition = typeof travauxOutils !== 'undefined'
                && travauxOutils.getOutilActif().id === 'position';
            if (panState.spaceActif || estModePosition) {
                conteneurGestesZoom.classList.add('travaux-pan-pret');
            } else {
                conteneurGestesZoom.classList.remove('travaux-pan-pret');
            }
            try { conteneurGestesZoom.releasePointerCapture(e.pointerId); } catch(ex) { console.warn('[Visionneuse] pointer release skipped:', ex.message || ex); }
        }
    }

    function recentrerVue() {
        if (!conteneurGestesZoom) return;
        if (wrapperGestesZoom) {
            var wrapperCenterX = wrapperGestesZoom.offsetLeft + wrapperGestesZoom.offsetWidth / 2;
            var wrapperCenterY = wrapperGestesZoom.offsetTop + wrapperGestesZoom.offsetHeight / 2;
            conteneurGestesZoom.scrollLeft = wrapperCenterX - conteneurGestesZoom.clientWidth / 2;
            conteneurGestesZoom.scrollTop = wrapperCenterY - conteneurGestesZoom.clientHeight / 2;
        } else {
            conteneurGestesZoom.scrollLeft = (conteneurGestesZoom.scrollWidth - conteneurGestesZoom.clientWidth) / 2;
            conteneurGestesZoom.scrollTop = (conteneurGestesZoom.scrollHeight - conteneurGestesZoom.clientHeight) / 2;
        }
    }

    /**
     * Scroll pour aligner le haut du document avec le haut du viewport
     * Centre horizontalement
     */
    function scrollerEnHaut() {
        if (!conteneurGestesZoom) return;
        if (wrapperGestesZoom) {
            var wrapperCenterX = wrapperGestesZoom.offsetLeft + wrapperGestesZoom.offsetWidth / 2;
            conteneurGestesZoom.scrollLeft = wrapperCenterX - conteneurGestesZoom.clientWidth / 2;
            conteneurGestesZoom.scrollTop = wrapperGestesZoom.offsetTop;
        } else {
            conteneurGestesZoom.scrollLeft = (conteneurGestesZoom.scrollWidth - conteneurGestesZoom.clientWidth) / 2;
            conteneurGestesZoom.scrollTop = 0;
        }
    }

    /**
     * Retourne le margin du wrapper (pour les calculs de zoom centrage)
     */
    function getMarginWrapper() {
        if (!wrapperGestesZoom) return { left: 0, top: 0 };
        var cs = getComputedStyle(wrapperGestesZoom);
        return {
            left: parseInt(cs.marginLeft, 10) || 0,
            top: parseInt(cs.marginTop, 10) || 0
        };
    }

    function estModePanActif() {
        return panState.spaceActif || panState.actif;
    }

    /* ===============================
       FERMETURE
       =============================== */

    /**
     * Ferme le fichier actuel
     */
    function fermerFichier() {
        // destroy() libere completement le document cote worker PDF.js (canal,
        // ArrayBuffer transfere, polices decodees). Sans cet appel, le worker
        // maintient le document en memoire jusqu'a ce que le GC collecte le
        // proxy (non-deterministe). Sur sessions longues : leak cumulatif.
        if (pdfDocument) {
            try { pdfDocument.destroy(); } catch (_) { /* deja detruit, ignorer */ }
        }
        fichierActuel = null;
        pdfDocument = null;
        pageActuelle = 1;
        nombrePagesTotal = 1;
        zoomActuel = ZOOM_DEFAUT;
        modeZoom = ZOOM_FIT;
        cachePages.clear();

        if (canvasDocument) {
            canvasDocument.width = 0;
            canvasDocument.height = 0;
            canvasDocument._imageSource = null;
        }

        window.dispatchEvent(new CustomEvent('travaux-fichier-ferme'));
    }

    /* ===============================
       ACCESSEURS
       =============================== */

    function getFichierActuel() { return fichierActuel; }
    function getPageActuelle() { return pageActuelle; }
    function getNombrePagesTotal() { return nombrePagesTotal; }
    function getZoomActuel() { return zoomActuel; }
    function getCanvas() { return canvasDocument; }
    function getPdfDocument() { return pdfDocument; }
    function getDimensionsOriginales() { return dimensionsOriginales; }

    /**
     * Definit le conteneur de la visionneuse
     * @param {HTMLElement} element - Le conteneur
     */
    function setConteneur(element) {
        conteneurVisionneuse = element;
    }

    /* ===============================
       CONTEXTE EXTERNE (Modelisation)
       =============================== */

    /**
     * Injecte un contexte externe (canvas alternatifs)
     * Permet de reutiliser la visionneuse dans un autre conteneur
     * @param {Object|null} ctx - { canvasDocument } ou null pour reset
     */
    function setContext(ctx) {
        contextExterne = ctx || null;
    }

    /**
     * Ouvre un fichier depuis un blob et ses metadonnees (sans passer par travauxStockage)
     * Utilise par le module Modelisation
     * @param {Blob} blob - Le blob du fichier
     * @param {Object} metadata - { id, typeMIME, nomFichier, ... }
     * @returns {Promise<boolean>} true si ouvert avec succes
     */
    async function ouvrirDepuisBlob(blob, metadata) {
        // Nettoyage symetrique de ouvrirFichier (fix 5 mars 2026) : sans cleanup
        // ici, switcher entre documents via Modelisation laisse l'ancien
        // pdfDocument en memoire cote worker, et cachePages (key par numPage
        // seul) peut servir une page de l'ancien document si le zoom matche.
        if (pdfDocument) {
            try { pdfDocument.cleanup(); } catch (_) { /* noop */ }
            pdfDocument = null;
        }
        cachePages.clear();
        fichierActuel = metadata;
        pageActuelle = 1;
        modeZoom = ZOOM_FIT;

        if (metadata.typeMIME === 'application/pdf') {
            await ouvrirPDF(blob);
        } else if (metadata.typeMIME.startsWith('image/')) {
            await ouvrirImage(blob);
        }

        mettreAJourNavigation();
        recentrerVue();
        requestAnimationFrame(() => { requestAnimationFrame(() => recentrerVue()); });
        return true;
    }

    /* ===============================
       INITIALISATION
       =============================== */

    function initialiserVisionneuse() {
        configurerPDFjs();
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxVisionneuse = {
        initialiser: initialiserVisionneuse,
        setConteneur: setConteneur,
        setContext: setContext,
        ouvrirDepuisBlob: ouvrirDepuisBlob,
        // Ouverture
        ouvrirFichier: ouvrirFichier,
        fermerFichier: fermerFichier,
        // Navigation
        pageSuivante: pageSuivante,
        pagePrecedente: pagePrecedente,
        allerAPage: allerAPage,
        // Zoom
        zoomAvant: zoomAvant,
        zoomArriere: zoomArriere,
        zoomAjuster: zoomAjuster,
        zoomPleineLargeur: zoomPleineLargeur,
        zoomPleineHauteur: zoomPleineHauteur,
        zoom100: zoom100,
        setZoomManuel: setZoomManuel,
        configurerGestesZoom: configurerGestesZoom,
        // Accesseurs
        getFichierActuel: getFichierActuel,
        getPageActuelle: getPageActuelle,
        getNombrePagesTotal: getNombrePagesTotal,
        getZoomActuel: getZoomActuel,
        getCanvas: getCanvas,
        getPdfDocument: getPdfDocument,
        recentrerVue: recentrerVue,
        scrollerEnHaut: scrollerEnHaut,
        estModePanActif: estModePanActif,
        getDimensionsOriginales: getDimensionsOriginales
    };

})();
