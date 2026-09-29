/* ===============================
   MODULE: TRAVAUX - MOTEUR D'ANNOTATION
   Canvas overlay, dessin au stylet, undo/redo, pression
   Support Apple Pencil (Pointer Events, rejet paume)

   DEPENDANCES:
   - travaux-outils.js (palette, couleurs, epaisseurs)
   - travaux-visionneuse.js (canvas document, page courante)
   - travaux-stockage.js (sauvegarder/charger annotations)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    const MAX_UNDO = 50;
    const SAUVEGARDE_DELAI = 2000; // ms, debounce auto-save

    // Reference locale aux modules externes (resolue au premier acces)
    function _outils() { return window.travauxOutils; }

    /**
     * Normalise la propriete pointes d'une forme fleche/ligne
     * Retrocompatibilite : ligne → 'aucune', fleche sans pointes → 'fin', double:true → 'double'
     */
    function normaliserPointes(forme) {
        if (forme.pointes) return forme.pointes;
        if (forme.double) return 'double';
        if (forme.type === 'ligne' || forme.type === 'ondule') return 'aucune';
        return 'fin';
    }

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let canvasAnnotation = null;
    let ctxAnnotation = null;
    let canvasSurligneur = null;
    let ctxSurligneur = null;
    let annotationActive = false; // Mode annotation actif/inactif
    let enDessin = false;
    let traitEnCours = null;
    let annotationCourante = null; // L'annotation JSON complete
    let fichierId = null;

    // Historique undo/redo
    let pileUndo = [];
    let pileRedo = [];

    // Timer sauvegarde automatique
    let timerSauvegarde = null;

    // Forme en cours de dessin
    let formeEnCours = null;
    let formeOrigine = null;

    // Mode selection (multi-selection)
    let annotationSelectionnee = null;  // { type, index, data, bbox } — element principal
    // #943 (retour de Grégoire, 24 sept. 2026) — une ligne qu'on vient de tracer reste sélectionnée,
    // ses poignées actives, SANS passer par l'outil Sélection : on la courbe (ou on en tire une
    // extrémité) avec l'outil Ligne encore en main. `selectionApresTrace` distingue cette sélection
    // légère d'une sélection faite exprès : elle n'absorbe ni couleur, ni épaisseur, ni pointes (ces
    // réglages visent la PROCHAINE ligne) et tombe au changement d'outil ou au tracé suivant.
    // ⚠ Le drapeau ne vaut qu'avec une sélection posée : les huit sites qui vident la sélection
    // (annuler, rétablir, changement de page…) peuvent le laisser vrai, sans effet — la reprise des
    // poignées exige `annotationSelectionnee`, et `deselectionner()` le remet à faux.
    let selectionApresTrace = false;
    let dragPoigneeApresTrace = false;
    let selectionsMultiples = [];       // [{ type, index, data, bbox }, ...]
    let poigneeActive = null;           // null | 'move' | 'nw' | 'ne' | 'sw' | 'se'
    let deplacementOrigine = null;      // { x, y }
    let dimensionsOriginales = null;    // bbox avant transformation
    let donneesAvantModif = null;       // snapshot pour undo
    let donneesMultiplesAvantModif = null; // snapshots multi-selection pour undo
    let rectangleSelection = null;      // { x1, y1, x2, y2 } — marquee en cours
    let modePanActif = false;
    let modeRedimensionnementSticker = false;

    // Presse-papiers annotations : sur window pour persister entre fichiers/étudiants
    // même si le module est désactivé/réactivé
    if (!window._annotationClipboard) window._annotationClipboard = null;

    // Contexte externe (injection par module Modelisation)
    let contextExterne = null; // { canvasAnnotation, canvasSurligneur, conteneurPalette }

    /* ===============================
       INITIALISATION
       =============================== */

    /**
     * Initialise le moteur d'annotation
     */
    function initialiserAnnotation() {
        // Ecouter le rendu de page pour synchroniser
        window.addEventListener('travaux-page-rendue', (e) => {
            // Deselectionner au changement de page (evite sélection fantome)
            annotationSelectionnee = null;
            selectionsMultiples = [];
            poigneeActive = null;

            if (annotationActive) {
                dimensionnerCanvasAnnotation(e.detail.width, e.detail.height);
                chargerAnnotationsPage();
            } else {
                // Afficher les annotations en lecture seule si elles existent
                afficherAnnotationsLectureSeule(e.detail.width, e.detail.height);
            }
        });

        // Ecouter la fermeture de fichier
        window.addEventListener('travaux-fichier-ferme', () => {
            desactiverAnnotation();
            // Flusher l'auto-save évaluation (erreurs de français en cours)
            if (typeof window._flusherAutoSave === 'function') {
                window._flusherAutoSave();
            }
            // Cacher les canvas quand le fichier est ferme
            if (canvasAnnotation) {
                canvasAnnotation.classList.add('u-hide');
            }
            if (canvasSurligneur) {
                canvasSurligneur.classList.add('u-hide');
            }
        });

        // Sauvegarder les annotations ET flusher l'évaluation avant rechargement/fermeture
        window.addEventListener('beforeunload', () => {
            const traitEnAttente = !!timerSauvegarde;
            if (timerSauvegarde) {
                clearTimeout(timerSauvegarde);
                timerSauvegarde = null;
            }
            if (annotationActive && annotationCourante) {
                // Lot F : un geste n'est signalé au codex que s'il restait un trait en
                // attente ; sinon, la même écriture, discrète (rien n'a changé).
                sauvegarderAnnotation(traitEnAttente ? undefined : { discret: true });
            }
            // Flusher l'auto-save évaluation en attente
            if (typeof window._flusherAutoSave === 'function') {
                window._flusherAutoSave();
            }
        });

    }

    /**
     * Affiche les annotations en lecture seule (sans activer le mode edition)
     * Appele automatiquement quand une page est rendue
     */
    function afficherAnnotationsLectureSeule(width, height) {
        const fichierActuel = travauxVisionneuse.getFichierActuel();
        if (!fichierActuel) return;

        const annotation = travauxStockage.obtenirAnnotationFichier(fichierActuel.id);
        if (!annotation) {
            // Pas d'annotations - cacher les canvas
            const canvas = (contextExterne && contextExterne.canvasAnnotation) || document.getElementById('travaux-canvas-annotation');
            if (canvas) canvas.classList.add('u-hide');
            const canvasSurl = (contextExterne && contextExterne.canvasSurligneur) || document.getElementById('travaux-canvas-surligneur');
            if (canvasSurl) canvasSurl.classList.add('u-hide');
            return;
        }

        // Il y a des annotations - les afficher en lecture seule
        canvasAnnotation = (contextExterne && contextExterne.canvasAnnotation) || document.getElementById('travaux-canvas-annotation');
        if (!canvasAnnotation) return;

        canvasSurligneur = (contextExterne && contextExterne.canvasSurligneur) || document.getElementById('travaux-canvas-surligneur');
        ctxAnnotation = canvasAnnotation.getContext('2d');
        if (canvasSurligneur) ctxSurligneur = canvasSurligneur.getContext('2d');

        annotationCourante = annotation;
        fichierId = fichierActuel.id;

        dimensionnerCanvasAnnotation(width, height);
        canvasAnnotation.classList.remove('u-hide');
        canvasAnnotation.style.pointerEvents = 'none';
        if (canvasSurligneur) canvasSurligneur.classList.remove('u-hide');
        reRendreAnnotations();
    }

    /**
     * Active le mode annotation
     */
    function activerAnnotation() {
        if (contextExterne && contextExterne.canvasAnnotation) {
            canvasAnnotation = contextExterne.canvasAnnotation;
        } else {
            canvasAnnotation = document.getElementById('travaux-canvas-annotation');
        }
        if (!canvasAnnotation) return;

        if (contextExterne && contextExterne.canvasSurligneur) {
            canvasSurligneur = contextExterne.canvasSurligneur;
        } else {
            canvasSurligneur = document.getElementById('travaux-canvas-surligneur');
        }
        ctxAnnotation = canvasAnnotation.getContext('2d');
        if (canvasSurligneur) ctxSurligneur = canvasSurligneur.getContext('2d');

        annotationActive = true;
        fichierId = travauxVisionneuse.getFichierActuel()?.id;

        // Charger l'annotation existante ou en creer une nouvelle
        annotationCourante = travauxStockage.obtenirAnnotationFichier(fichierId);
        if (!annotationCourante) {
            annotationCourante = creerAnnotationVide();
        }

        // Dimensionner le canvas annotation au-dessus du canvas document
        const canvasDoc = travauxVisionneuse.getCanvas();
        if (canvasDoc) {
            dimensionnerCanvasAnnotation(canvasDoc.width, canvasDoc.height);
        }

        // Activer les evenements pointer
        attacherEvenements();
        chargerAnnotationsPage();

        // Mettre à jour les compteurs d'erreurs après chargement des annotations
        if (typeof travauxOutils !== 'undefined' && typeof travauxOutils.mettreAJourCompteursErreurs === 'function') {
            travauxOutils.mettreAJourCompteursErreurs();
        }

        canvasAnnotation.classList.remove('u-hide');
        canvasAnnotation.style.pointerEvents = 'auto';
        if (canvasSurligneur) canvasSurligneur.classList.remove('u-hide');

        // Si l'outil actif est "position", garder pointer-events none
        if (_outils().getOutilActif().id === 'position') {
            canvasAnnotation.style.pointerEvents = 'none';
        }

        // Deplier la palette annotation si elle existe deja, sinon la creer
        const paletteExistante = document.getElementById('travaux-palette-flottante');
        if (paletteExistante) {
            if (paletteExistante.classList.contains('replie')) {
                paletteExistante.classList.remove('replie');
                const btnR = document.getElementById('travaux-palette-toggle') /* #936 : pas la roue */;
                if (btnR) btnR.textContent = '\u2212';
            }
        } else {
            if (contextExterne && contextExterne.conteneurPalette) {
                // Vue côte-à-côte : palette flottante (comportement inchangé)
                const zoneDocument = contextExterne.conteneurPalette;
                const paletteDiv = document.createElement('div');
                paletteDiv.innerHTML = _outils().genererHTMLPalette();
                zoneDocument.appendChild(paletteDiv.firstElementChild);
                _outils().configurerDragPalette();
            } else {
                // Mode normal : layout ancré
                travauxUI.creerLayoutAnnotation();
            }
        }

        // Les palettes tampons et erreurs ne sont pas creees automatiquement
        // L'utilisateur les ouvre manuellement via les boutons de la palette d'annotation

        window.dispatchEvent(new CustomEvent('travaux-annotation-activee'));
    }

    /**
     * Desactive le mode annotation
     */
    function desactiverAnnotation() {
        if (!annotationActive) return;

        // Flush du debounce en attente avant sauvegarde finale
        const traitEnAttente = !!timerSauvegarde;
        if (timerSauvegarde) {
            clearTimeout(timerSauvegarde);
            timerSauvegarde = null;
        }

        // Lot F : signalé au codex seulement s'il restait un trait en attente.
        sauvegarderAnnotation(traitEnAttente ? undefined : { discret: true });
        detacherEvenements();
        annotationActive = false;

        // Deselectionner
        annotationSelectionnee = null;
        selectionsMultiples = [];
        poigneeActive = null;

        // Garder le canvas visible en lecture seule (annotations restent affichees)
        if (canvasAnnotation) {
            canvasAnnotation.style.pointerEvents = 'none';
            // NE PAS cacher le canvas - les annotations doivent rester visibles
        }

        // Replier la palette annotation (elle reste visible)
        const paletteFlottante = document.getElementById('travaux-palette-flottante');
        if (paletteFlottante && !paletteFlottante.classList.contains('replie')) {
            paletteFlottante.classList.add('replie');
            const btnR = document.getElementById('travaux-palette-toggle') /* #936 : pas la roue */;
            if (btnR) btnR.textContent = '+';
        }

        pileUndo = [];
        pileRedo = [];

        window.dispatchEvent(new CustomEvent('travaux-annotation-desactivee'));
    }

    /**
     * Bascule le mode annotation
     */
    function basculerAnnotation() {
        if (annotationActive) {
            desactiverAnnotation();
        } else {
            activerAnnotation();
        }
    }

    /* ===============================
       MODELE DE DONNEES
       =============================== */

    /**
     * Cree une annotation vide
     * @returns {Object} Annotation vide
     */
    function creerAnnotationVide() {
        return {
            id: 'ANN_' + Date.now(),
            fichierId: fichierId,
            etudiantDA: travauxVisionneuse.getFichierActuel()?.etudiantDA || '',
            productionId: travauxVisionneuse.getFichierActuel()?.productionId || '',
            pages: {},
            version: 1,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString()
        };
    }

    /**
     * Obtient les donnees de la page courante dans l'annotation
     * @returns {Object} Donnees de la page
     */
    function obtenirDonneesPage() {
        if (!annotationCourante || !annotationCourante.pages) {
            return { strokes: [], textAnnotations: [], shapes: [], stickers: [] };
        }
        const page = travauxVisionneuse.getPageActuelle() - 1; // 0-indexed
        if (!annotationCourante.pages[page]) {
            annotationCourante.pages[page] = {
                strokes: [],
                textAnnotations: [],
                shapes: [],
                stickers: []
            };
        }
        // Migration: ajouter stickers si absent (annotations existantes)
        if (!annotationCourante.pages[page].stickers) {
            annotationCourante.pages[page].stickers = [];
        }
        return annotationCourante.pages[page];
    }

    /* ===============================
       DIMENSIONNEMENT
       =============================== */

    /**
     * Dimensionne le canvas annotation pour superposer le canvas document
     * @param {number} width - Largeur
     * @param {number} height - Hauteur
     */
    function dimensionnerCanvasAnnotation(width, height) {
        if (!canvasAnnotation) return;
        canvasAnnotation.width = width;
        canvasAnnotation.height = height;
        if (canvasSurligneur) {
            canvasSurligneur.width = width;
            canvasSurligneur.height = height;
        }
    }

    /* ===============================
       EVENEMENTS POINTER (Apple Pencil support)
       =============================== */

    function attacherEvenements() {
        if (!canvasAnnotation) return;

        canvasAnnotation.addEventListener('pointerdown', onPointerDown);
        canvasAnnotation.addEventListener('pointermove', onPointerMove);
        canvasAnnotation.addEventListener('pointerup', onPointerUp);
        canvasAnnotation.addEventListener('pointercancel', onPointerUp);

        // Empecher le scroll/zoom sur le canvas
        canvasAnnotation.style.touchAction = 'none';

        // Laisser les gesture events Safari traverser pour le pinch-to-zoom
        // (preventDefault empeche le zoom natif, l'event bulle vers le conteneur)
        canvasAnnotation.addEventListener('gesturestart', onGesturePassthrough, { passive: false });
        canvasAnnotation.addEventListener('gesturechange', onGesturePassthrough, { passive: false });

        // Raccourcis clavier
        document.addEventListener('keydown', onKeyDown);

        // Pan mode (Space+drag)
        window.addEventListener('travaux-pan-mode', onPanModeChange);

        // Outil change (position vs dessin)
        window.addEventListener('travaux-outil-change', onOutilChange);

        // Re-rendre au changement de theme (inversion autocollants)
        window.addEventListener('themeChanged', onThemeChanged);

        // Double-clic pour mode redimensionnement stickers
        canvasAnnotation.addEventListener('dblclick', onDoubleClick);

        // Changement couleur/epaisseur sur selection
        window.addEventListener('travaux-couleur-change', onCouleurChange);
        window.addEventListener('travaux-epaisseur-change', onEpaisseurChange);

        // Fleche pointes change sur selection
        window.addEventListener('travaux-fleche-pointes-change', onFlechePointesChange);
    }

    function detacherEvenements() {
        if (!canvasAnnotation) return;

        canvasAnnotation.removeEventListener('pointerdown', onPointerDown);
        canvasAnnotation.removeEventListener('pointermove', onPointerMove);
        canvasAnnotation.removeEventListener('pointerup', onPointerUp);
        canvasAnnotation.removeEventListener('pointercancel', onPointerUp);
        canvasAnnotation.removeEventListener('gesturestart', onGesturePassthrough);
        canvasAnnotation.removeEventListener('gesturechange', onGesturePassthrough);

        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('travaux-pan-mode', onPanModeChange);
        window.removeEventListener('travaux-outil-change', onOutilChange);
        window.removeEventListener('themeChanged', onThemeChanged);
        canvasAnnotation.removeEventListener('dblclick', onDoubleClick);
        window.removeEventListener('travaux-couleur-change', onCouleurChange);
        window.removeEventListener('travaux-epaisseur-change', onEpaisseurChange);
        window.removeEventListener('travaux-fleche-pointes-change', onFlechePointesChange);
    }

    /**
     * Debut du trait / interaction
     */
    function onPointerDown(e) {
        const outil = _outils().getOutilActif();

        if (modePanActif) return;
        if (outil.id === 'position') return;

        // Mode selection : accepter touch (doigt) en plus de pen/mouse (Apple Pencil exception)
        if (outil.type === 'selection') {
            if (e.pointerType !== 'pen' && e.pointerType !== 'mouse' && e.pointerType !== 'touch') return;
        } else {
            // Rejet de paume: ignorer le touch en mode annotation (seulement pen et mouse)
            if (e.pointerType === 'touch') {
                return;
            }
        }

        e.preventDefault();

        // Démarrer le chrono évaluation à la première annotation
        if (typeof travauxUI !== 'undefined' && travauxUI.demarrerChrono) {
            travauxUI.demarrerChrono();
        }

        // Auto-basculer en mode Annoter si en mode Evaluer
        if (typeof travauxUI !== 'undefined' && travauxUI.getModeCourant
            && travauxUI.getModeCourant() === 'evaluer') {
            travauxUI.basculerMode('annoter');
        }

        const rect = canvasAnnotation.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Coordonnees normalisees (0-1)
        const xNorm = x / canvasAnnotation.width;
        const yNorm = y / canvasAnnotation.height;

        const outilActifId = outil.id;

        // Mode selection
        if (outil.type === 'selection') {
            const shiftKey = e.shiftKey;
            selectionApresTrace = false;   // #943 — sous l'outil Sélection, c'est une sélection ordinaire

            // Verifier si on clique sur une poignee de la selection existante (mono-selection seulement)
            if (annotationSelectionnee && selectionsMultiples.length <= 1) {
                const poignee = detecterPoignee(xNorm, yNorm, annotationSelectionnee.bbox, annotationSelectionnee);
                if (poignee) {
                    if (poignee === 'cp' || (annotationSelectionnee.type !== 'stroke' &&
                        (annotationSelectionnee.type !== 'sticker' || modeRedimensionnementSticker))) {
                        poigneeActive = poignee;
                        deplacementOrigine = { x: xNorm, y: yNorm };
                        dimensionsOriginales = { ...annotationSelectionnee.bbox };
                        donneesAvantModif = clonerDonneesAnnotation(annotationSelectionnee);
                        enDessin = true;
                        return;
                    }
                }
            }

            // Verifier si on clique dans la bbox combinee (deplacement multi)
            if (selectionsMultiples.length > 0) {
                const bboxCombinee = calculerBBoxCombinee(selectionsMultiples);
                if (xNorm >= bboxCombinee.x1 && xNorm <= bboxCombinee.x2 &&
                    yNorm >= bboxCombinee.y1 && yNorm <= bboxCombinee.y2 && !shiftKey) {
                    poigneeActive = 'move';
                    deplacementOrigine = { x: xNorm, y: yNorm };
                    donneesMultiplesAvantModif = selectionsMultiples.map(s => clonerDonneesAnnotation(s));
                    enDessin = true;
                    return;
                }
            }

            // Nouveau hit-test
            const hit = trouverAnnotationAuPoint(xNorm, yNorm);
            if (hit) {
                if (shiftKey) {
                    // Shift+clic : toggle dans la multi-selection
                    const dejaIdx = selectionsMultiples.findIndex(s =>
                        s.type === hit.type && s.index === hit.index);
                    if (dejaIdx !== -1) {
                        selectionsMultiples.splice(dejaIdx, 1);
                    } else {
                        selectionsMultiples.push(hit);
                    }
                    annotationSelectionnee = selectionsMultiples.length > 0
                        ? selectionsMultiples[selectionsMultiples.length - 1] : null;
                    reRendreAnnotations();
                } else {
                    // Clic simple : selection unique + debut deplacement
                    selectionsMultiples = [hit];
                    annotationSelectionnee = hit;
                    poigneeActive = 'move';
                    deplacementOrigine = { x: xNorm, y: yNorm };
                    donneesMultiplesAvantModif = [clonerDonneesAnnotation(hit)];
                    donneesAvantModif = donneesMultiplesAvantModif[0];
                    dimensionsOriginales = { ...hit.bbox };
                    enDessin = true;
                    reRendreAnnotations();
                }
            } else {
                if (shiftKey) {
                    // Shift+clic dans le vide : ne rien faire
                } else {
                    // Clic dans le vide : demarrer rectangle de selection (marquee)
                    deselectionner();
                    rectangleSelection = { x1: xNorm, y1: yNorm, x2: xNorm, y2: yNorm };
                    enDessin = true;
                }
            }
            return;
        }

        // Mode tampon : poser un autocollant
        if (outilActifId === 'tampon' || _outils().getAutocollantActif()) {
            const autoId = _outils().getAutocollantActif();
            if (autoId) {
                poserAutocollant(autoId, xNorm, yNorm);
            }
            return;
        }

        if (outil.id === 'gomme') {
            effacerTraitAuContact(xNorm, yNorm);
            enDessin = true;
            return;
        }

        if (outil.id === 'texte') {
            // #889 : un clic sur un texte existant l'ouvre en édition. Seul le double-clic de
            // l'outil Sélection le faisait ; l'outil Texte posait un 2e bloc par-dessus.
            const hitTexte = trouverAnnotationAuPoint(xNorm, yNorm);
            if (hitTexte && hitTexte.type === 'text') {
                editerTexte(hitTexte.data);
                return;
            }
            ajouterTexte(xNorm, yNorm);
            return;
        }

        if (outil.type === 'forme' || outil.type === 'symbole') {
            if (outil.type === 'symbole') {
                ajouterSymbole(outil.id, xNorm, yNorm);
                return;
            }
            // #943 — la ligne qu'on vient de tracer : un clic sur l'une de ses poignées la courbe
            // (point de contrôle) ou en tire une extrémité ; ailleurs, on trace une nouvelle ligne.
            if (selectionApresTrace && annotationSelectionnee && selectionsMultiples.length <= 1) {
                const poignee = detecterPoignee(xNorm, yNorm, annotationSelectionnee.bbox, annotationSelectionnee);
                if (poignee) {
                    poigneeActive = poignee;
                    deplacementOrigine = { x: xNorm, y: yNorm };
                    dimensionsOriginales = { ...annotationSelectionnee.bbox };
                    donneesAvantModif = clonerDonneesAnnotation(annotationSelectionnee);
                    donneesMultiplesAvantModif = [donneesAvantModif];
                    dragPoigneeApresTrace = true;
                    enDessin = true;
                    return;
                }
                deselectionner();
            }
            // Debut forme
            formeOrigine = { x: xNorm, y: yNorm };
            formeEnCours = {
                id: 'SH_' + Date.now(),
                type: outil.id,
                color: _outils().getCouleurActive(),
                lineWidth: _outils().getEpaisseurActive(),
                x1: xNorm, y1: yNorm,
                x2: xNorm, y2: yNorm
            };
            if (outil.id === 'ondule') {
                formeEnCours.amplitude = 6;
                formeEnCours.wavelength = 30;
            }
            if (outil.id === 'pointille') {
                formeEnCours.tirets = outil.tirets || [6, 4];
            }
            if (outil.id === 'fleche' || outil.id === 'ondule' || outil.id === 'pointille') {
                formeEnCours.pointes = _outils().getFlechePointes();
            }
            enDessin = true;
            return;
        }

        // Surligneur click-drag-release (meme pattern que les autres formes)
        if (outil.id === 'surligneur') {
            formeOrigine = { x: xNorm, y: yNorm };
            formeEnCours = {
                id: 'SH_' + Date.now(), type: 'surligneur',
                color: _outils().getCouleurActive(),
                lineWidth: _outils().getEpaisseurActive(),
                opacity: outil.opacite || 0.5,
                x1: xNorm, y1: yNorm, x2: xNorm, y2: yNorm
            };
            enDessin = true;
            return;
        }

        // Debut d'un trait (stylo)
        enDessin = true;
        const pression = e.pressure || 0.5;

        traitEnCours = {
            id: 'S_' + Date.now(),
            tool: outil.id,
            color: _outils().getCouleurActive(),
            lineWidth: _outils().getEpaisseurActive(),
            opacity: outil.opacite || 1.0,
            points: [{ x: xNorm, y: yNorm, pressure: pression }]
        };

        // Commencer a dessiner
        ctxAnnotation.beginPath();
        ctxAnnotation.moveTo(x, y);
    }

    /**
     * Mouvement du stylet
     */
    function onPointerMove(e) {
        const outil = _outils().getOutilActif();

        const rect = canvasAnnotation.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xNorm = x / canvasAnnotation.width;
        const yNorm = y / canvasAnnotation.height;

        // Mode selection : curseur contextuel meme sans drag
        if (outil.type === 'selection' && !enDessin) {
            mettreAJourCurseurSelection(xNorm, yNorm);
            return;
        }

        if (!enDessin) return;

        // Mode selection : drag en cours — et #943, la poignée d'une ligne tout juste tracée
        if (outil.type === 'selection' || dragPoigneeApresTrace) {
            if (e.pointerType !== 'pen' && e.pointerType !== 'mouse' && e.pointerType !== 'touch') return;
            e.preventDefault();

            // Rectangle de selection (marquee)
            if (rectangleSelection) {
                rectangleSelection.x2 = xNorm;
                rectangleSelection.y2 = yNorm;
                reRendreAnnotations();
                dessinerMarquee(rectangleSelection);
                return;
            }

            if (!deplacementOrigine) return;

            const dx = xNorm - deplacementOrigine.x;
            const dy = yNorm - deplacementOrigine.y;

            if (poigneeActive === 'move') {
                // Deplacement multi-selection
                for (const sel of selectionsMultiples) {
                    appliquerDeplacement(sel, dx, dy);
                }
                deplacementOrigine = { x: xNorm, y: yNorm };
            } else if (poigneeActive === 'cp' && annotationSelectionnee) {
                // Drag du point de controle Bezier
                annotationSelectionnee.data.cx = xNorm;
                annotationSelectionnee.data.cy = yNorm;
                annotationSelectionnee.bbox = calculerBBox(annotationSelectionnee.type, annotationSelectionnee.data);
            } else if (poigneeActive && annotationSelectionnee) {
                appliquerRedimensionnement(annotationSelectionnee, poigneeActive, xNorm, yNorm);
            }

            reRendreAnnotations();
            return;
        }

        if (e.pointerType === 'touch') return;

        e.preventDefault();

        // Gomme en mode glissant
        if (outil.id === 'gomme') {
            effacerTraitAuContact(xNorm, yNorm);
            return;
        }

        // Forme en cours
        if (formeEnCours) {
            formeEnCours.x2 = xNorm;
            formeEnCours.y2 = yNorm;
            // Re-dessiner le canvas annotation avec la forme temporaire
            reRendreAnnotations();
            dessinerFormeTemporaire(formeEnCours);
            return;
        }

        // Trait en cours
        if (!traitEnCours) return;

        // Utiliser les evenements coalescees pour fluidite (Apple Pencil)
        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

        for (const ce of events) {
            const cx = ce.clientX - rect.left;
            const cy = ce.clientY - rect.top;
            const cxNorm = cx / canvasAnnotation.width;
            const cyNorm = cy / canvasAnnotation.height;
            const pression = ce.pressure || 0.5;

            traitEnCours.points.push({ x: cxNorm, y: cyNorm, pressure: pression });

            // Dessiner le segment (epaisseur ajustee a la resolution)
            const epaisseurPression = _outils().calculerEpaisseurPression(pression);
            const epaisseur = _outils().calculerEpaisseurReelle(epaisseurPression);

            ctxAnnotation.save();
            ctxAnnotation.globalAlpha = outil.opacite || 1.0;
            ctxAnnotation.globalCompositeOperation = outil.composite || 'source-over';
            ctxAnnotation.strokeStyle = _outils().getCouleurActive();
            ctxAnnotation.lineWidth = epaisseur;
            const estSurlLive = (outil.id === 'surligneur');
            ctxAnnotation.lineCap = estSurlLive ? 'butt' : 'round';
            ctxAnnotation.lineJoin = estSurlLive ? 'bevel' : 'round';
            ctxAnnotation.lineTo(cx, cy);
            ctxAnnotation.stroke();
            ctxAnnotation.beginPath();
            ctxAnnotation.moveTo(cx, cy);
            ctxAnnotation.restore();
        }
    }

    /**
     * Fin du trait
     */
    function onPointerUp(e) {
        if (!enDessin) return;

        const outil = _outils().getOutilActif();

        // Mode selection : finaliser le drag — et #943, la poignée d'une ligne tout juste tracée
        // (même fin : l'annulation « modification » s'empile, la sélection reste pour un autre geste).
        if (outil.type === 'selection' || dragPoigneeApresTrace) {
            if (e.pointerType !== 'pen' && e.pointerType !== 'mouse' && e.pointerType !== 'touch') return;
            enDessin = false;
            dragPoigneeApresTrace = false;

            // Finaliser le rectangle de selection (marquee)
            if (rectangleSelection) {
                const rx1 = Math.min(rectangleSelection.x1, rectangleSelection.x2);
                const ry1 = Math.min(rectangleSelection.y1, rectangleSelection.y2);
                const rx2 = Math.max(rectangleSelection.x1, rectangleSelection.x2);
                const ry2 = Math.max(rectangleSelection.y1, rectangleSelection.y2);
                // Selectionner uniquement si le rectangle a une taille significative
                if (Math.abs(rx2 - rx1) > 0.005 && Math.abs(ry2 - ry1) > 0.005) {
                    selectionsMultiples = trouverAnnotationsDansRect(rx1, ry1, rx2, ry2);
                    annotationSelectionnee = selectionsMultiples.length > 0
                        ? selectionsMultiples[0] : null;
                }
                rectangleSelection = null;
                reRendreAnnotations();
                return;
            }

            // Undo pour deplacement/redimensionnement multi
            if (donneesMultiplesAvantModif && poigneeActive) {
                let aChange = false;
                const undoItems = [];
                for (let i = 0; i < selectionsMultiples.length; i++) {
                    const sel = selectionsMultiples[i];
                    const avant = donneesMultiplesAvantModif[i];
                    if (!avant) continue;
                    const apres = clonerDonneesAnnotation(sel);
                    if (JSON.stringify(avant) !== JSON.stringify(apres)) {
                        aChange = true;
                        undoItems.push({ type: sel.type, index: sel.index, avant: avant, apres: apres });
                    }
                }
                if (aChange) {
                    empilerUndo('modification-multiple', undoItems);
                    planifierSauvegarde();
                }
            }

            poigneeActive = null;
            deplacementOrigine = null;
            dimensionsOriginales = null;
            donneesAvantModif = null;
            donneesMultiplesAvantModif = null;
            return;
        }

        if (e.pointerType === 'touch') return;

        enDessin = false;

        // Forme terminee (y compris surligneur en click-drag-release)
        if (formeEnCours) {
            // Seuil minimum : ignorer les clics accidentels sans mouvement
            if (Math.abs(formeEnCours.x2 - formeEnCours.x1) < 0.003 && Math.abs(formeEnCours.y2 - formeEnCours.y1) < 0.003) {
                formeEnCours = null;
                formeOrigine = null;
                reRendreAnnotations();
                return;
            }
            const donneesPage = obtenirDonneesPage();
            donneesPage.shapes.push(formeEnCours);
            empilerUndo('ajout-forme', formeEnCours);
            // #943 — une ligne tracée reste sélectionnée, ses poignées visibles et actives.
            if (estLigneAPoignees(formeEnCours)) {
                const index = donneesPage.shapes.length - 1;
                const sel = { type: 'shape', index: index, data: formeEnCours, bbox: calculerBBox('shape', formeEnCours) };
                selectionsMultiples = [sel];
                annotationSelectionnee = sel;
                selectionApresTrace = true;
            }
            formeEnCours = null;
            formeOrigine = null;
            reRendreAnnotations();
            planifierSauvegarde();
            return;
        }

        // Trait termine
        if (traitEnCours && traitEnCours.points.length > 1) {
            const donneesPage = obtenirDonneesPage();
            donneesPage.strokes.push(traitEnCours);
            empilerUndo('ajout-trait', traitEnCours);
            planifierSauvegarde();
        }

        traitEnCours = null;
    }

    /**
     * Laisse passer les gesture events Safari pour le pinch-to-zoom
     * preventDefault bloque le zoom natif, l'event bulle vers le conteneur
     */
    function onGesturePassthrough(e) {
        e.preventDefault();
        // L'event bulle naturellement vers le conteneur ou le zoom est gere
    }

    function onPanModeChange(e) {
        modePanActif = e.detail.actif;
        if (canvasAnnotation) {
            if (modePanActif) {
                canvasAnnotation.style.pointerEvents = 'none';
            } else if (annotationActive) {
                // Restaurer selon l'outil actif
                if (_outils().getOutilActif().id === 'position') {
                    canvasAnnotation.style.pointerEvents = 'none';
                } else {
                    canvasAnnotation.style.pointerEvents = 'auto';
                }
            }
        }
    }

    function onOutilChange(e) {
        if (!canvasAnnotation || !annotationActive) return;

        // Annuler une forme en cours si on change d'outil
        if (formeEnCours) {
            formeEnCours = null; formeOrigine = null; enDessin = false;
            reRendreAnnotations();
        }

        // #943 — la sélection d'une ligne tout juste tracée appartient à l'outil Ligne : elle tombe
        // au changement d'outil, sauf vers l'outil Sélection, où elle devient une sélection ordinaire.
        if (selectionApresTrace) {
            if (e.detail.outil.type === 'selection') selectionApresTrace = false;
            else deselectionner();
        }

        if (e.detail.outil.id === 'position') {
            canvasAnnotation.style.pointerEvents = 'none';
        } else {
            canvasAnnotation.style.pointerEvents = 'auto';
        }
    }

    function onThemeChanged() {
        reRendreAnnotations();
    }

    function onDoubleClick(e) {
        const outil = _outils().getOutilActif();
        if (outil.type !== 'selection') return;
        const rect = canvasAnnotation.getBoundingClientRect();
        const xNorm = (e.clientX - rect.left) / canvasAnnotation.width;
        const yNorm = (e.clientY - rect.top) / canvasAnnotation.height;
        // Si on double-clique sur un sticker deja selectionne
        if (annotationSelectionnee && annotationSelectionnee.type === 'sticker') {
            const bbox = annotationSelectionnee.bbox;
            if (xNorm >= bbox.x1 && xNorm <= bbox.x2 && yNorm >= bbox.y1 && yNorm <= bbox.y2) {
                modeRedimensionnementSticker = true;
                reRendreAnnotations();
                return;
            }
        }
        // Double-clic sur un texte : editer en place
        const hit = trouverAnnotationAuPoint(xNorm, yNorm);
        if (hit && hit.type === 'text') {
            editerTexte(hit.data);
            return;
        }
        // Double-clic sur un sticker non selectionne
        if (hit && hit.type === 'sticker') {
            selectionsMultiples = [hit];
            annotationSelectionnee = hit;
            modeRedimensionnementSticker = true;
            reRendreAnnotations();
        }
    }

    /**
     * Raccourcis clavier
     */
    function onKeyDown(e) {
        if (!annotationActive) return;

        // Ne pas intercepter les touches dans les champs de formulaire
        if (e.target.matches('input, select, textarea, [contenteditable]')) return;

        // Laisser Space passer au module visionneuse pour le pan
        if (e.key === ' ') return;

        // Escape : annuler une forme en cours de dessin (surligneur, rectangle, etc.)
        if (e.key === 'Escape' && formeEnCours) {
            e.preventDefault();
            formeEnCours = null; formeOrigine = null; enDessin = false;
            reRendreAnnotations();
            return;
        }

        // Delete/Backspace : supprimer les annotations selectionnees
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectionsMultiples.length > 0) {
            e.preventDefault();
            supprimerSelection();
            return;
        }

        // Escape : quitter le mode redimensionnement sticker, ou deselectionner
        if (e.key === 'Escape' && selectionsMultiples.length > 0) {
            e.preventDefault();
            if (modeRedimensionnementSticker) {
                modeRedimensionnementSticker = false;
                reRendreAnnotations();
                return;
            }
            deselectionner();
            return;
        }

        // Ctrl/Cmd + C : Copier annotations sélectionnées
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey && selectionsMultiples.length > 0) {
            e.preventDefault();
            copierSelection();
            return;
        }

        // Ctrl/Cmd + V : Coller annotations
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey && window._annotationClipboard) {
            e.preventDefault();
            collerAnnotations();
            return;
        }

        // Ctrl/Cmd + Z : Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            annuler();
        }

        // Ctrl/Cmd + Shift + Z ou Ctrl/Cmd + Y : Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || e.key === 'y')) {
            e.preventDefault();
            retablir();
            return;
        }

        // Raccourcis codes/tampons : touches sans modificateur
        if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
            if (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirItemParTouche) {
                var itemId = travauxOutils.obtenirItemParTouche(e.key);
                if (itemId && travauxOutils.activerItemParId(itemId)) {
                    e.preventDefault();
                }
            }
        }
    }

    /* ===============================
       AUTOCOLLANTS (pose sur le canvas)
       =============================== */

    /**
     * Pose un autocollant a la position donnee
     * @param {string} autocollantId - ID de l'autocollant
     * @param {number} xNorm - X normalise (0-1)
     * @param {number} yNorm - Y normalise (0-1)
     */
    function poserAutocollant(autocollantId, xNorm, yNorm) {
        // #240 — Tampon JETON : autocollant texte (pas d'image). Rendu en ROUGE
        // MAJUSCULE, coche automatiquement la checkbox du jeton après apposition.
        const def = _outils().getAutocollant ? _outils().getAutocollant(autocollantId) : null;
        if (def && def.texteTampon) {
            poserTamponTexte(def, xNorm, yNorm);
            return;
        }

        const tailleBase = 0.04; // 4% de la largeur du document (~66% de l'ancien 6%)
        const img = _outils().getImageAutocollant(autocollantId);
        const ratio = (img && img.naturalWidth && img.naturalHeight)
            ? img.naturalHeight / img.naturalWidth
            : 1;
        // Convertir la hauteur normalisée en tenant compte du ratio canvas
        const canvasRatio = canvasAnnotation.width / canvasAnnotation.height;
        const stickerW = tailleBase;
        const stickerH = tailleBase * ratio * canvasRatio;

        const sticker = {
            id: 'STK_' + Date.now(),
            autocollantId: autocollantId,
            x: xNorm - stickerW / 2,
            y: yNorm - stickerH / 2,
            width: stickerW,
            height: stickerH
        };
        // Stocker la couleur de categorie pour le rendu teinte
        var coulCat = _outils().obtenirCouleurCategorieAutocollant(autocollantId);
        if (coulCat) sticker.tint = coulCat;

        const donneesPage = obtenirDonneesPage();
        donneesPage.stickers.push(sticker);
        empilerUndo('ajout-autocollant', sticker);
        reRendreAnnotations();
        planifierSauvegarde();
    }

    /**
     * #240 — Pose un tampon JETON texte (ROUGE MAJUSCULE) à la position donnée.
     * Réutilise la machinerie sticker (undo, sauvegarde, sélection, export PDF) : le
     * sticker porte `texteTampon` au lieu d'une image, rendu par dessinerAutocollant.
     * Après apposition, coche automatiquement la checkbox du jeton correspondant.
     * @param {Object} def - Entrée du catalogue AUTOCOLLANTS (texteTampon, jetonType)
     * @param {number} xNorm - X normalisé (0-1)
     * @param {number} yNorm - Y normalisé (0-1)
     */
    function poserTamponTexte(def, xNorm, yNorm) {
        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const outils = _outils();
        const scale = w / (outils && outils.RESOLUTION_REFERENCE ? outils.RESOLUTION_REFERENCE : 1000);
        // Taille de référence ~22px à la résolution de référence (lisible à l'export).
        const fontSize = 22 * scale;
        const texte = def.texteTampon;

        // Mesurer la largeur du texte pour dimensionner la bbox (sélection/hit-test).
        ctxAnnotation.save();
        ctxAnnotation.font = 'bold ' + fontSize + 'px sans-serif';
        const largeurTextePx = ctxAnnotation.measureText(texte).width;
        ctxAnnotation.restore();

        const stickerW = (largeurTextePx / w) || 0.1;
        const stickerH = (fontSize * 1.2) / h;

        const sticker = {
            id: 'STK_' + Date.now(),
            autocollantId: def.id,
            texteTampon: texte,
            jetonType: def.jetonType || null,
            x: xNorm - stickerW / 2,
            y: yNorm - stickerH / 2,
            width: stickerW,
            height: stickerH
        };

        const donneesPage = obtenirDonneesPage();
        donneesPage.stickers.push(sticker);
        empilerUndo('ajout-autocollant', sticker);
        reRendreAnnotations();
        planifierSauvegarde();

        // Cocher automatiquement la checkbox du jeton correspondant.
        if (def.jetonType && typeof cocherCheckboxJeton === 'function') {
            cocherCheckboxJeton(def.jetonType);
        }
    }

    /**
     * #240 — Coche (et déclenche) la checkbox du jeton correspondant après apposition
     * du tampon. Réutilise les handlers existants (gererChangementCheckboxJeton*) en
     * simulant un changement, pour passer par la même logique d'application du jeton.
     * @param {string} jetonType - 'delai' | 'reprise'
     */
    function cocherCheckboxJeton(jetonType) {
        const map = {
            delai: { id: 'checkboxJetonDelai', handler: 'gererChangementCheckboxJetonDelai' },
            reprise: { id: 'checkboxJetonReprise', handler: 'gererChangementCheckboxJetonReprise' }
            // #563 (29 août 2026) : plus de route « repriseCiblee » — la case et le
            // tampon qui l'appliquaient sont retirés.
        };
        const cible = map[jetonType];
        if (!cible) return;
        const checkbox = document.getElementById(cible.id);
        if (!checkbox || checkbox.checked) return; // déjà coché : ne rien refaire
        checkbox.checked = true;
        if (typeof window[cible.handler] === 'function') {
            window[cible.handler]();
        }
    }

    /**
     * Dessine un autocollant sur le canvas
     * @param {Object} sticker - Donnees du sticker
     */
    function dessinerAutocollant(sticker) {
        if (!_outils()) return;

        // #240 — Tampon JETON texte (ROUGE MAJUSCULE), pas d'image.
        if (sticker.texteTampon) {
            dessinerTamponTexte(sticker);
            return;
        }

        const img = _outils().getImageAutocollant(sticker.autocollantId);
        if (!img) return;

        if (!img.complete) {
            // Image pas encore chargee: attacher un listener one-shot pour re-rendre
            img.addEventListener('load', function onStickerLoad() {
                img.removeEventListener('load', onStickerLoad);
                reRendreAnnotations();
            });
            return;
        }

        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;

        const sx = sticker.x * w;
        const sy = sticker.y * h;
        const sw = sticker.width * w;
        const sh = sticker.height * h;

        const estModeSombre = !document.body.classList.contains('mode-clair');

        // Teinte de categorie : dessiner l'image coloree
        var tint = sticker.tint || (_outils().obtenirCouleurCategorieAutocollant ? _outils().obtenirCouleurCategorieAutocollant(sticker.autocollantId) : null);
        if (tint) {
            // Canvas temporaire pour coloriser l'image noire
            var tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = Math.round(sw) || 1;
            tmpCanvas.height = Math.round(sh) || 1;
            var tmpCtx = tmpCanvas.getContext('2d');

            // 1. Dessiner l'image (noir + alpha)
            if (estModeSombre) tmpCtx.filter = 'invert(1)';
            tmpCtx.drawImage(img, 0, 0, tmpCanvas.width, tmpCanvas.height);
            tmpCtx.filter = 'none';

            // 2. Remplacer la couleur des pixels par la teinte, en gardant l'alpha
            tmpCtx.globalCompositeOperation = 'source-in';
            tmpCtx.fillStyle = tint;
            tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

            ctxAnnotation.drawImage(tmpCanvas, sx, sy, sw, sh);
        } else if (estModeSombre) {
            ctxAnnotation.save();
            ctxAnnotation.filter = 'invert(1)';
            ctxAnnotation.drawImage(img, sx, sy, sw, sh);
            ctxAnnotation.restore();
        } else {
            ctxAnnotation.drawImage(img, sx, sy, sw, sh);
        }
    }

    /**
     * #240 — Dessine un tampon JETON texte (ROUGE MAJUSCULE) sur le canvas.
     * La couleur rouge est imposée (rouge sémantique du jeton) et reste lisible dans les
     * deux modes ; l'export PDF rend ce canvas tel quel → le jeton apparaît clairement.
     * @param {Object} sticker - Données du sticker (texteTampon, x, y, width, height)
     */
    function dessinerTamponTexte(sticker) {
        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const outils = _outils();
        const scale = w / (outils && outils.RESOLUTION_REFERENCE ? outils.RESOLUTION_REFERENCE : 1000);
        const fontSize = 22 * scale;

        const sx = sticker.x * w;
        const sy = sticker.y * h;

        ctxAnnotation.save();
        ctxAnnotation.font = 'bold ' + fontSize + 'px sans-serif';
        ctxAnnotation.fillStyle = '#d32f2f'; // rouge jeton
        ctxAnnotation.textAlign = 'left';
        ctxAnnotation.textBaseline = 'top';
        // Léger contour blanc pour rester lisible sur fonds variés (texte foncé du travail).
        ctxAnnotation.lineWidth = Math.max(1, fontSize * 0.08);
        ctxAnnotation.strokeStyle = 'rgba(255,255,255,0.85)';
        ctxAnnotation.lineJoin = 'round';
        ctxAnnotation.strokeText(sticker.texteTampon, sx, sy);
        ctxAnnotation.fillText(sticker.texteTampon, sx, sy);
        ctxAnnotation.restore();
    }

    /* ===============================
       GOMME
       =============================== */

    /**
     * Efface l'annotation la plus proche du point donne
     * Utilise le hit-testing reutilisable
     * @param {number} xNorm - X normalise
     * @param {number} yNorm - Y normalise
     */
    function effacerTraitAuContact(xNorm, yNorm) {
        const hit = trouverAnnotationAuPoint(xNorm, yNorm);
        if (!hit) return;

        // La gomme n'efface que les annotations du surligneur
        const estSurligneur = (hit.type === 'stroke' && hit.data.tool === 'surligneur')
                           || (hit.type === 'shape' && hit.data.type === 'surligneur');
        if (!estSurligneur) return;

        const donneesPage = obtenirDonneesPage();

        switch (hit.type) {
            case 'stroke': {
                const supprime = donneesPage.strokes.splice(hit.index, 1)[0];
                empilerUndo('suppression-trait', supprime);
                break;
            }
            case 'shape': {
                const supprime = donneesPage.shapes.splice(hit.index, 1)[0];
                empilerUndo('suppression-forme', supprime);
                break;
            }
        }

        reRendreAnnotations();
        planifierSauvegarde();
    }

    /* ===============================
       TEXTE
       =============================== */

    /**
     * Ajoute une annotation texte a la position
     * @param {number} xNorm - X normalise
     * @param {number} yNorm - Y normalise
     */
    function ajouterTexte(xNorm, yNorm) {
        // Supprimer un textarea inline existant
        const ancien = document.getElementById('travaux-texte-inline');
        if (ancien) ancien.remove();

        const conteneur = document.getElementById('travaux-conteneur-document');
        if (!conteneur || !canvasAnnotation) return;

        const tailleCourante = _outils().getTailleTexte();
        const couleur = _outils().getCouleurActive();

        // Calculer la position pixel a partir des coordonnees normalisees
        const canvasRect = canvasAnnotation.getBoundingClientRect();
        const posX = xNorm * canvasRect.width + canvasRect.left - conteneur.getBoundingClientRect().left;
        const posY = yNorm * canvasRect.height + canvasRect.top - conteneur.getBoundingClientRect().top;
        // Taille de police CSS scalée comme sur le canvas
        const resRef = _outils().RESOLUTION_REFERENCE || 1000;
        const fontSizeCss = tailleCourante * canvasRect.width / resRef;

        // Creer le textarea inline
        const textarea = document.createElement('textarea');
        textarea.id = 'travaux-texte-inline';
        textarea.style.cssText = `
            position: absolute;
            left: ${posX}px;
            top: ${posY}px;
            min-width: 120px;
            min-height: 32px;
            max-width: 400px;
            background: transparent;
            border: 2px dashed ${couleur};
            border-radius: 4px;
            color: ${couleur};
            font-family: sans-serif;
            font-size: ${fontSizeCss}px;
            padding: 4px 6px;
            resize: both;
            outline: none;
            z-index: 1000;
            overflow: hidden;
        `;
        textarea.placeholder = 'Texte…';

        conteneur.appendChild(textarea);

        // Empecher que le clic de creation ne confirme immediatement
        let pret = false;
        setTimeout(() => { pret = true; }, 100);

        textarea.focus();

        function confirmerTexte() {
            const texte = textarea.value.trim();
            // Capturer la largeur du textarea avant de le supprimer
            const canvasRect2 = canvasAnnotation.getBoundingClientRect();
            const largeurNorm = textarea.offsetWidth / canvasRect2.width;
            textarea.remove();

            if (!texte) return;

            const ann = {
                id: 'TXT_' + Date.now(),
                x: xNorm,
                y: yNorm,
                text: texte,
                fontSize: tailleCourante,
                color: couleur,
                width: largeurNorm
            };

            const donneesPage = obtenirDonneesPage();
            donneesPage.textAnnotations.push(ann);
            empilerUndo('ajout-texte', ann);
            reRendreAnnotations();
            planifierSauvegarde();
        }

        function annulerTexte() {
            textarea.remove();
        }

        // Enter (sans Shift) : confirmer ; Shift+Enter : saut de ligne
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                confirmerTexte();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                annulerTexte();
            }
        });

        // Clic exterieur : confirmer
        function onClickExterieur(e) {
            if (!pret) return;
            if (!textarea.contains(e.target)) {
                document.removeEventListener('pointerdown', onClickExterieur, true);
                confirmerTexte();
            }
        }
        document.addEventListener('pointerdown', onClickExterieur, true);
    }

    /**
     * Edite un texte existant en place (double-clic)
     * @param {Object} data - L'objet textAnnotation a modifier
     */
    function editerTexte(data) {
        const ancien = document.getElementById('travaux-texte-inline');
        if (ancien) ancien.remove();

        const conteneur = document.getElementById('travaux-conteneur-document');
        if (!conteneur || !canvasAnnotation) return;

        const canvasRect = canvasAnnotation.getBoundingClientRect();
        const conteneurRect = conteneur.getBoundingClientRect();
        const posX = data.x * canvasRect.width + canvasRect.left - conteneurRect.left;
        const posY = data.y * canvasRect.height + canvasRect.top - conteneurRect.top;
        const fontSize = data.fontSize || 14;
        const couleur = data.color || '#FF0000';
        const largeurPx = data.width ? data.width * canvasRect.width : 200;
        // Taille de police CSS scalée comme sur le canvas
        const resRef = (_outils() && _outils().RESOLUTION_REFERENCE) || 1000;
        const fontSizeCss = fontSize * canvasRect.width / resRef;

        // Masquer le texte sur le canvas pendant l'edition
        const texteOriginal = data.text;
        data.text = '';
        reRendreAnnotations();

        const textarea = document.createElement('textarea');
        textarea.id = 'travaux-texte-inline';
        textarea.value = texteOriginal;
        textarea.style.cssText = `
            position: absolute;
            left: ${posX}px;
            top: ${posY - fontSizeCss * 1.3}px;
            min-width: 120px;
            min-height: 32px;
            width: ${largeurPx}px;
            max-width: 400px;
            background: transparent;
            border: 2px dashed ${couleur};
            border-radius: 4px;
            color: ${couleur};
            font-family: sans-serif;
            font-size: ${fontSizeCss}px;
            padding: 4px 6px;
            resize: both;
            outline: none;
            z-index: 1000;
            overflow: hidden;
        `;

        conteneur.appendChild(textarea);

        // Deselectionner pour ne pas voir les poignees
        annotationSelectionnee = null;
        selectionsMultiples = [];

        let pret = false;
        setTimeout(() => { pret = true; }, 100);

        textarea.focus();
        textarea.select();

        function confirmer() {
            const nouveauTexte = textarea.value.trim();
            const canvasRect2 = canvasAnnotation.getBoundingClientRect();
            const nouvelleLargeur = textarea.offsetWidth / canvasRect2.width;
            textarea.remove();
            document.removeEventListener('pointerdown', onClickExt, true);

            if (!nouveauTexte) {
                // Texte vide : restaurer l'original
                data.text = texteOriginal;
            } else if (nouveauTexte !== texteOriginal || nouvelleLargeur !== data.width) {
                const avant = JSON.parse(JSON.stringify(data));
                avant.text = texteOriginal;
                data.text = nouveauTexte;
                data.width = nouvelleLargeur;
                const apres = JSON.parse(JSON.stringify(data));
                empilerUndo('modification-annotation', { type: 'text', avant: avant, apres: apres });
                planifierSauvegarde();
            } else {
                data.text = texteOriginal;
            }
            reRendreAnnotations();
        }

        function annuler() {
            textarea.remove();
            document.removeEventListener('pointerdown', onClickExt, true);
            data.text = texteOriginal;
            reRendreAnnotations();
        }

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                confirmer();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                annuler();
            }
        });

        function onClickExt(e) {
            if (!pret) return;
            if (!textarea.contains(e.target)) {
                document.removeEventListener('pointerdown', onClickExt, true);
                confirmer();
            }
        }
        document.addEventListener('pointerdown', onClickExt, true);
    }

    /* ===============================
       SYMBOLES (crochet, croix)
       =============================== */

    /**
     * Ajoute un symbole a la position
     * @param {string} type - 'crochet' ou 'croix'
     * @param {number} xNorm - X normalise
     * @param {number} yNorm - Y normalise
     */
    function ajouterSymbole(type, xNorm, yNorm) {
        const outil = _outils().OUTILS[type];
        const taille = (outil.taille || 30) / _outils().RESOLUTION_REFERENCE;

        // Couleur selon le type de symbole (personnalisable via OUTILS)
        let couleurSymbole;
        if (type === 'crochet' || type === 'croix' || type === 'interrogation' || type.startsWith('sym-')) {
            couleurSymbole = outil.couleurBouton;
        } else if (type.startsWith('errfr_')) {
            couleurSymbole = outil.couleurBouton || '#888888';
        } else {
            couleurSymbole = _outils().getCouleurActive();
        }

        const forme = {
            id: 'SH_' + Date.now(),
            type: type,
            color: couleurSymbole,
            lineWidth: 3,
            x1: xNorm - taille / 2,
            y1: yNorm - taille / 2,
            x2: xNorm + taille / 2,
            y2: yNorm + taille / 2
        };
        // Stocker l'icone dans la forme pour les symboles Unicode
        if (outil.icone && (type === 'crochet' || type === 'croix' || type === 'interrogation' || type.startsWith('sym-'))) {
            forme.icone = outil.icone;
        }

        const donneesPage = obtenirDonneesPage();
        donneesPage.shapes.push(forme);
        empilerUndo('ajout-forme', forme);
        reRendreAnnotations();
        planifierSauvegarde();
    }

    /* ===============================
       SELECTION : HIT-TESTING & BOUNDING BOX
       =============================== */

    /**
     * Calcule la bounding box normalisee d'une annotation
     * @param {string} type - 'stroke' | 'shape' | 'text' | 'sticker'
     * @param {Object} data - Donnees de l'annotation
     * @returns {{ x1: number, y1: number, x2: number, y2: number }}
     */
    function calculerBBox(type, data) {
        switch (type) {
            case 'stroke': {
                let minX = 1, minY = 1, maxX = 0, maxY = 0;
                const pad = (data.lineWidth || 2) / (canvasAnnotation?.width || 1000);
                for (const p of data.points) {
                    if (p.x < minX) minX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y > maxY) maxY = p.y;
                }
                return { x1: minX - pad, y1: minY - pad, x2: maxX + pad, y2: maxY + pad };
            }
            case 'shape': {
                let sx1 = Math.min(data.x1, data.x2);
                let sy1 = Math.min(data.y1, data.y2);
                let sx2 = Math.max(data.x1, data.x2);
                let sy2 = Math.max(data.y1, data.y2);
                // Inclure le point de controle Bezier dans la bbox
                if (data.type === 'fleche' && data.cx != null && data.cy != null) {
                    if (data.cx < sx1) sx1 = data.cx;
                    if (data.cy < sy1) sy1 = data.cy;
                    if (data.cx > sx2) sx2 = data.cx;
                    if (data.cy > sy2) sy2 = data.cy;
                }
                return { x1: sx1, y1: sy1, x2: sx2, y2: sy2 };
            }
            case 'text': {
                const w = canvasAnnotation?.width || 1000;
                const h = canvasAnnotation?.height || 1000;
                const outils = _outils();
                const scaleT = w / (outils ? outils.RESOLUTION_REFERENCE : 1000);
                const fontSize = (data.fontSize || 14) * scaleT;
                const ctx = ctxAnnotation || document.createElement('canvas').getContext('2d');
                ctx.font = `${fontSize}px sans-serif`;
                const lignesBrutes = (data.text || '').split('\n');
                const interligne = fontSize * 1.3;
                const textH = fontSize / h;

                let bboxW, nbLignes;
                if (data.width && data.width > 0) {
                    // Largeur fixe + word-wrap
                    bboxW = data.width;
                    const maxWidthPx = data.width * w;
                    nbLignes = 0;
                    for (const ligne of lignesBrutes) {
                        nbLignes += wrapLigne(ctx, ligne, maxWidthPx).length;
                    }
                } else {
                    // Ancien mode : largeur automatique
                    let maxTextW = 0;
                    for (const ligne of lignesBrutes) {
                        const lw = ctx.measureText(ligne).width / w;
                        if (lw > maxTextW) maxTextW = lw;
                    }
                    bboxW = maxTextW;
                    nbLignes = lignesBrutes.length;
                }
                const totalH = (nbLignes * interligne) / h;
                return { x1: data.x, y1: data.y - textH, x2: data.x + bboxW, y2: data.y + totalH };
            }
            case 'sticker':
                return { x1: data.x, y1: data.y, x2: data.x + data.width, y2: data.y + data.height };
            default:
                return { x1: 0, y1: 0, x2: 0, y2: 0 };
        }
    }

    /**
     * Distance d'un point a un segment
     */
    function distancePointSegment(px, py, ax, ay, bx, by) {
        const dx = bx - ax, dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.sqrt((px - ax) * (px - ax) + (py - ay) * (py - ay));
        let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = ax + t * dx, projY = ay + t * dy;
        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    }

    /**
     * Teste la proximite d'un point a une fleche (droite ou courbe Bezier)
     */
    function testProximiteFleche(forme, px, py, seuil) {
        if (forme.cx != null && forme.cy != null) {
            // Courbe quadratique : echantillonner ~20 points
            const steps = 20;
            const x0 = forme.x1, y0 = forme.y1;
            const cx = forme.cx, cy = forme.cy;
            const x1 = forme.x2, y1 = forme.y2;
            let prevX = x0, prevY = y0;
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const inv = 1 - t;
                const qx = inv * inv * x0 + 2 * inv * t * cx + t * t * x1;
                const qy = inv * inv * y0 + 2 * inv * t * cy + t * t * y1;
                if (distancePointSegment(px, py, prevX, prevY, qx, qy) < seuil) return true;
                prevX = qx; prevY = qy;
            }
            return false;
        }
        // Fleche droite
        return distancePointSegment(px, py, forme.x1, forme.y1, forme.x2, forme.y2) < seuil;
    }

    /**
     * Trouve l'annotation la plus proche du point (topmost first)
     * @param {number} xNorm - X normalise (0-1)
     * @param {number} yNorm - Y normalise (0-1)
     * @returns {{ type: string, index: number, data: Object, bbox: Object }|null}
     */
    function trouverAnnotationAuPoint(xNorm, yNorm) {
        const donneesPage = obtenirDonneesPage();
        const seuil = 0.02;

        // Stickers (topmost = dernier dans le tableau)
        if (donneesPage.stickers) {
            for (let i = donneesPage.stickers.length - 1; i >= 0; i--) {
                const stk = donneesPage.stickers[i];
                if (xNorm >= stk.x && xNorm <= stk.x + stk.width &&
                    yNorm >= stk.y && yNorm <= stk.y + stk.height) {
                    return { type: 'sticker', index: i, data: stk, bbox: calculerBBox('sticker', stk) };
                }
            }
        }

        // Textes
        for (let i = donneesPage.textAnnotations.length - 1; i >= 0; i--) {
            const texte = donneesPage.textAnnotations[i];
            const bbox = calculerBBox('text', texte);
            if (xNorm >= bbox.x1 && xNorm <= bbox.x2 && yNorm >= bbox.y1 && yNorm <= bbox.y2) {
                return { type: 'text', index: i, data: texte, bbox: bbox };
            }
        }

        // Formes
        for (let i = donneesPage.shapes.length - 1; i >= 0; i--) {
            const forme = donneesPage.shapes[i];
            const bbox = calculerBBox('shape', forme);

            // Fleches et lignes : hit-testing specifique (droite ou courbe)
            if (forme.type === 'fleche' || forme.type === 'ligne' || forme.type === 'ondule' || forme.type === 'pointille') {
                if (testProximiteFleche(forme, xNorm, yNorm, seuil)) {
                    return { type: 'shape', index: i, data: forme, bbox: bbox };
                }
                continue;
            }

            // Proximite des bords (pas de l'interieur)
            const nearX = Math.min(Math.abs(xNorm - bbox.x1), Math.abs(xNorm - bbox.x2));
            const nearY = Math.min(Math.abs(yNorm - bbox.y1), Math.abs(yNorm - bbox.y2));
            const insideX = xNorm >= bbox.x1 - seuil && xNorm <= bbox.x2 + seuil;
            const insideY = yNorm >= bbox.y1 - seuil && yNorm <= bbox.y2 + seuil;
            if (insideX && insideY && (nearX < seuil * 2 || nearY < seuil * 2)) {
                return { type: 'shape', index: i, data: forme, bbox: bbox };
            }
            // Pour les symboles (crochet, croix), accepter aussi le centre
            if ((forme.type === 'crochet' || forme.type === 'croix' || forme.type === 'surligneur') && insideX && insideY) {
                return { type: 'shape', index: i, data: forme, bbox: bbox };
            }
        }

        // Traits
        for (let i = donneesPage.strokes.length - 1; i >= 0; i--) {
            const trait = donneesPage.strokes[i];
            for (const point of trait.points) {
                const dist = Math.sqrt(Math.pow(point.x - xNorm, 2) + Math.pow(point.y - yNorm, 2));
                if (dist < seuil) {
                    return { type: 'stroke', index: i, data: trait, bbox: calculerBBox('stroke', trait) };
                }
            }
        }

        return null;
    }

    /**
     * #943 — les formes dont la sélection porte des poignées d'extrémité et un point de courbure
     * (les mêmes que `detecterPoignee` sait lire) : la ligne (fléchée ou non), l'ancienne ligne, la vague.
     */
    function estLigneAPoignees(forme) {
        return !!forme && (forme.type === 'fleche' || forme.type === 'ligne' || forme.type === 'ondule');
    }

    /**
     * Detecte si le point est sur une poignee de la selection
     * @returns {string|null} 'nw' | 'ne' | 'sw' | 'se' | null
     */
    function detecterPoignee(xNorm, yNorm, bbox, sel) {
        const taille = 12 / (canvasAnnotation?.width || 1000); // 12px en normalise

        // Fleche/ligne : poignees directes sur les extremites + point de controle
        if (sel && sel.type === 'shape' && estLigneAPoignees(sel.data)) {
            const data = sel.data;
            // Point de controle Bezier (prioritaire)
            const cpX = data.cx != null ? data.cx : (data.x1 + data.x2) / 2;
            const cpY = data.cy != null ? data.cy : (data.y1 + data.y2) / 2;
            if (Math.abs(xNorm - cpX) < taille && Math.abs(yNorm - cpY) < taille) {
                return 'cp';
            }
            // Extremite p1 (debut)
            if (Math.abs(xNorm - data.x1) < taille && Math.abs(yNorm - data.y1) < taille) {
                return 'p1';
            }
            // Extremite p2 (fin / pointe)
            if (Math.abs(xNorm - data.x2) < taille && Math.abs(yNorm - data.y2) < taille) {
                return 'p2';
            }
            return null;
        }

        // Autres formes : coins du bbox
        const coins = {
            nw: { x: bbox.x1, y: bbox.y1 },
            ne: { x: bbox.x2, y: bbox.y1 },
            sw: { x: bbox.x1, y: bbox.y2 },
            se: { x: bbox.x2, y: bbox.y2 }
        };

        for (const [id, coin] of Object.entries(coins)) {
            if (Math.abs(xNorm - coin.x) < taille && Math.abs(yNorm - coin.y) < taille) {
                return id;
            }
        }
        return null;
    }

    /**
     * Dessine le cadre de selection et les poignees (multi-selection)
     */
    function dessinerSelection() {
        if (selectionsMultiples.length === 0 || !ctxAnnotation || !canvasAnnotation) return;

        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;

        ctxAnnotation.save();

        // Cadre individuel pour chaque element selectionne
        // (sauf fleche/ligne en mono-selection : controlée par ses extremites)
        const skipBboxFleche = selectionsMultiples.length === 1
            && selectionsMultiples[0].type === 'shape'
            && (selectionsMultiples[0].data.type === 'fleche' || selectionsMultiples[0].data.type === 'ligne');
        for (const sel of selectionsMultiples) {
            if (skipBboxFleche && sel.type === 'shape' && (sel.data.type === 'fleche' || sel.data.type === 'ligne' || sel.data.type === 'ondule')) continue;
            const bbox = sel.bbox;
            const x = bbox.x1 * w;
            const y = bbox.y1 * h;
            const bw = (bbox.x2 - bbox.x1) * w;
            const bh = (bbox.y2 - bbox.y1) * h;

            ctxAnnotation.strokeStyle = '#065dbb';
            ctxAnnotation.lineWidth = 1.5;
            ctxAnnotation.setLineDash([4, 3]);
            ctxAnnotation.strokeRect(x, y, bw, bh);
            ctxAnnotation.setLineDash([]);
        }

        // Bbox combinee + poignees
        const bboxC = calculerBBoxCombinee(selectionsMultiples);
        const cx = bboxC.x1 * w;
        const cy = bboxC.y1 * h;
        const cw = (bboxC.x2 - bboxC.x1) * w;
        const ch = (bboxC.y2 - bboxC.y1) * h;

        // Cadre exterieur (plus epais si multi)
        if (selectionsMultiples.length > 1) {
            ctxAnnotation.strokeStyle = '#065dbb';
            ctxAnnotation.lineWidth = 2;
            ctxAnnotation.setLineDash([6, 4]);
            ctxAnnotation.strokeRect(cx, cy, cw, ch);
            ctxAnnotation.setLineDash([]);
        }

        // Poignees (mono-selection seulement)
        if (selectionsMultiples.length === 1) {
            const sel = selectionsMultiples[0];
            const estFleche = sel.type === 'shape' && (sel.data.type === 'fleche' || sel.data.type === 'ligne' || sel.data.type === 'ondule');

            if (estFleche) {
                // Fleche : poignees aux extremites (pas de rectangle englobant)
                const data = sel.data;
                const p1x = data.x1 * w, p1y = data.y1 * h;
                const p2x = data.x2 * w, p2y = data.y2 * h;
                const taille = 8;

                // Poignees carrees aux extremites p1 et p2
                const endpoints = [{ x: p1x, y: p1y }, { x: p2x, y: p2y }];
                for (const ep of endpoints) {
                    ctxAnnotation.fillStyle = '#ffffff';
                    ctxAnnotation.strokeStyle = '#065dbb';
                    ctxAnnotation.lineWidth = 2;
                    ctxAnnotation.fillRect(ep.x - taille / 2, ep.y - taille / 2, taille, taille);
                    ctxAnnotation.strokeRect(ep.x - taille / 2, ep.y - taille / 2, taille, taille);
                }

                // Handle circulaire du point de controle Bezier
                const cpNormX = data.cx != null ? data.cx : (data.x1 + data.x2) / 2;
                const cpNormY = data.cy != null ? data.cy : (data.y1 + data.y2) / 2;
                const cpPxX = cpNormX * w;
                const cpPxY = cpNormY * h;

                // Ligne pointillee du milieu de la fleche au handle
                const midX = ((data.x1 + data.x2) / 2) * w;
                const midY = ((data.y1 + data.y2) / 2) * h;
                ctxAnnotation.strokeStyle = '#065dbb';
                ctxAnnotation.lineWidth = 1;
                ctxAnnotation.setLineDash([3, 3]);
                ctxAnnotation.beginPath();
                ctxAnnotation.moveTo(midX, midY);
                ctxAnnotation.lineTo(cpPxX, cpPxY);
                ctxAnnotation.stroke();
                ctxAnnotation.setLineDash([]);

                const rayon = 6;
                ctxAnnotation.fillStyle = '#ffffff';
                ctxAnnotation.strokeStyle = '#065dbb';
                ctxAnnotation.lineWidth = 2;
                ctxAnnotation.beginPath();
                ctxAnnotation.arc(cpPxX, cpPxY, rayon, 0, Math.PI * 2);
                ctxAnnotation.fill();
                ctxAnnotation.stroke();
            } else {
                // Autres formes : poignees aux 4 coins du bbox
                const afficherPoignees = sel.type !== 'sticker' || modeRedimensionnementSticker;
                if (afficherPoignees) {
                    const taille = 8;
                    const coins = [
                        { x: cx, y: cy },
                        { x: cx + cw, y: cy },
                        { x: cx, y: cy + ch },
                        { x: cx + cw, y: cy + ch }
                    ];
                    for (const coin of coins) {
                        ctxAnnotation.fillStyle = '#ffffff';
                        ctxAnnotation.strokeStyle = '#065dbb';
                        ctxAnnotation.lineWidth = 2;
                        ctxAnnotation.fillRect(coin.x - taille / 2, coin.y - taille / 2, taille, taille);
                        ctxAnnotation.strokeRect(coin.x - taille / 2, coin.y - taille / 2, taille, taille);
                    }
                }
            }
        }

        ctxAnnotation.restore();
    }

    /**
     * Calcule la bbox combinee d'un ensemble de selections
     */
    function calculerBBoxCombinee(selections) {
        let x1 = 1, y1 = 1, x2 = 0, y2 = 0;
        for (const sel of selections) {
            if (sel.bbox.x1 < x1) x1 = sel.bbox.x1;
            if (sel.bbox.y1 < y1) y1 = sel.bbox.y1;
            if (sel.bbox.x2 > x2) x2 = sel.bbox.x2;
            if (sel.bbox.y2 > y2) y2 = sel.bbox.y2;
        }
        return { x1, y1, x2, y2 };
    }

    /**
     * Dessine le rectangle de selection (marquee) en cours
     */
    function dessinerMarquee(rect) {
        if (!ctxAnnotation || !canvasAnnotation) return;
        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const x = Math.min(rect.x1, rect.x2) * w;
        const y = Math.min(rect.y1, rect.y2) * h;
        const rw = Math.abs(rect.x2 - rect.x1) * w;
        const rh = Math.abs(rect.y2 - rect.y1) * h;

        ctxAnnotation.save();
        ctxAnnotation.fillStyle = 'rgba(6, 93, 187, 0.08)';
        ctxAnnotation.fillRect(x, y, rw, rh);
        ctxAnnotation.strokeStyle = '#065dbb';
        ctxAnnotation.lineWidth = 1;
        ctxAnnotation.setLineDash([4, 3]);
        ctxAnnotation.strokeRect(x, y, rw, rh);
        ctxAnnotation.setLineDash([]);
        ctxAnnotation.restore();
    }

    /**
     * Trouve toutes les annotations dont la bbox est incluse dans le rectangle
     */
    function trouverAnnotationsDansRect(rx1, ry1, rx2, ry2) {
        const donneesPage = obtenirDonneesPage();
        const resultats = [];

        // Stickers
        if (donneesPage.stickers) {
            for (let i = 0; i < donneesPage.stickers.length; i++) {
                const bbox = calculerBBox('sticker', donneesPage.stickers[i]);
                if (bboxIntersecte(bbox, rx1, ry1, rx2, ry2)) {
                    resultats.push({ type: 'sticker', index: i, data: donneesPage.stickers[i], bbox: bbox });
                }
            }
        }
        // Textes
        for (let i = 0; i < donneesPage.textAnnotations.length; i++) {
            const bbox = calculerBBox('text', donneesPage.textAnnotations[i]);
            if (bboxIntersecte(bbox, rx1, ry1, rx2, ry2)) {
                resultats.push({ type: 'text', index: i, data: donneesPage.textAnnotations[i], bbox: bbox });
            }
        }
        // Formes
        for (let i = 0; i < donneesPage.shapes.length; i++) {
            const bbox = calculerBBox('shape', donneesPage.shapes[i]);
            if (bboxIntersecte(bbox, rx1, ry1, rx2, ry2)) {
                resultats.push({ type: 'shape', index: i, data: donneesPage.shapes[i], bbox: bbox });
            }
        }
        // Traits
        for (let i = 0; i < donneesPage.strokes.length; i++) {
            const bbox = calculerBBox('stroke', donneesPage.strokes[i]);
            if (bboxIntersecte(bbox, rx1, ry1, rx2, ry2)) {
                resultats.push({ type: 'stroke', index: i, data: donneesPage.strokes[i], bbox: bbox });
            }
        }
        return resultats;
    }

    /**
     * Verifie si une bbox intersecte un rectangle
     */
    function bboxIntersecte(bbox, rx1, ry1, rx2, ry2) {
        return bbox.x2 >= rx1 && bbox.x1 <= rx2 && bbox.y2 >= ry1 && bbox.y1 <= ry2;
    }

    /**
     * Deselectionne l'annotation active
     */
    function deselectionner() {
        annotationSelectionnee = null;
        selectionApresTrace = false;       // #943
        dragPoigneeApresTrace = false;
        selectionsMultiples = [];
        poigneeActive = null;
        deplacementOrigine = null;
        dimensionsOriginales = null;
        donneesAvantModif = null;
        donneesMultiplesAvantModif = null;
        modeRedimensionnementSticker = false;
        rectangleSelection = null;
        reRendreAnnotations();
    }

    /**
     * Applique un deplacement a une annotation
     */
    function appliquerDeplacement(sel, dx, dy) {
        switch (sel.type) {
            case 'stroke':
                for (const p of sel.data.points) {
                    p.x += dx;
                    p.y += dy;
                }
                break;
            case 'shape':
                sel.data.x1 += dx;
                sel.data.y1 += dy;
                sel.data.x2 += dx;
                sel.data.y2 += dy;
                // Deplacer le point de controle Bezier
                if (sel.data.cx != null) { sel.data.cx += dx; sel.data.cy += dy; }
                break;
            case 'text':
                sel.data.x += dx;
                sel.data.y += dy;
                break;
            case 'sticker':
                sel.data.x += dx;
                sel.data.y += dy;
                break;
        }
        // Recalculer la bbox
        sel.bbox = calculerBBox(sel.type, sel.data);
    }

    /**
     * Applique un redimensionnement (formes, stickers, texte seulement)
     */
    function appliquerRedimensionnement(sel, poignee, xNorm, yNorm) {
        if (sel.type === 'stroke') return; // Pas de resize pour les traits en V1

        // Fleche/ligne : deplacement direct des extremites
        if (sel.type === 'shape' && (sel.data.type === 'fleche' || sel.data.type === 'ligne' || sel.data.type === 'ondule') && (poignee === 'p1' || poignee === 'p2')) {
            if (poignee === 'p1') {
                sel.data.x1 = xNorm;
                sel.data.y1 = yNorm;
            } else {
                sel.data.x2 = xNorm;
                sel.data.y2 = yNorm;
            }
            sel.bbox = calculerBBox(sel.type, sel.data);
            return;
        }

        const bbox = dimensionsOriginales;

        if (sel.type === 'shape') {
            // Verifier si c'est un symbole (doit garder ses proportions 1:1)
            const estSymbole = sel.data.type === 'crochet' || sel.data.type === 'croix'
                || sel.data.type === 'interrogation' || (sel.data.type && sel.data.type.startsWith('errfr_'));

            if (estSymbole) {
                // Contraindre a un carre : utiliser la plus grande distance comme cote
                const origW = bbox.x2 - bbox.x1;
                const origH = bbox.y2 - bbox.y1;
                let dx, dy, delta;
                switch (poignee) {
                    case 'se':
                        dx = xNorm - bbox.x1; dy = yNorm - bbox.y1;
                        delta = Math.max(dx, dy);
                        sel.data.x2 = bbox.x1 + delta; sel.data.y2 = bbox.y1 + delta;
                        break;
                    case 'sw':
                        dx = bbox.x2 - xNorm; dy = yNorm - bbox.y1;
                        delta = Math.max(dx, dy);
                        sel.data.x1 = bbox.x2 - delta; sel.data.y2 = bbox.y1 + delta;
                        break;
                    case 'ne':
                        dx = xNorm - bbox.x1; dy = bbox.y2 - yNorm;
                        delta = Math.max(dx, dy);
                        sel.data.x2 = bbox.x1 + delta; sel.data.y1 = bbox.y2 - delta;
                        break;
                    case 'nw':
                        dx = bbox.x2 - xNorm; dy = bbox.y2 - yNorm;
                        delta = Math.max(dx, dy);
                        sel.data.x1 = bbox.x2 - delta; sel.data.y1 = bbox.y2 - delta;
                        break;
                }
            } else {
                // Sauvegarder l'ancienne bbox pour scaler le point de controle
                const oldX1 = sel.data.x1, oldY1 = sel.data.y1;
                const oldX2 = sel.data.x2, oldY2 = sel.data.y2;
                switch (poignee) {
                    case 'nw': sel.data.x1 = xNorm; sel.data.y1 = yNorm; break;
                    case 'ne': sel.data.x2 = xNorm; sel.data.y1 = yNorm; break;
                    case 'sw': sel.data.x1 = xNorm; sel.data.y2 = yNorm; break;
                    case 'se': sel.data.x2 = xNorm; sel.data.y2 = yNorm; break;
                }
                // Scaler le point de controle Bezier proportionnellement
                if (sel.data.cx != null && (sel.data.type === 'fleche' || sel.data.type === 'ligne' || sel.data.type === 'ondule')) {
                    const oldW = oldX2 - oldX1;
                    const oldH = oldY2 - oldY1;
                    const newW = sel.data.x2 - sel.data.x1;
                    const newH = sel.data.y2 - sel.data.y1;
                    if (Math.abs(oldW) > 0.001 && Math.abs(oldH) > 0.001) {
                        sel.data.cx = sel.data.x1 + (sel.data.cx - oldX1) * (newW / oldW);
                        sel.data.cy = sel.data.y1 + (sel.data.cy - oldY1) * (newH / oldH);
                    }
                }
            }
        } else if (sel.type === 'sticker') {
            // Conserver les proportions : ratio original width/height
            const origW = bbox.x2 - bbox.x1;
            const origH = bbox.y2 - bbox.y1;
            const ratio = origW > 0 ? origH / origW : 1;

            let newW;
            switch (poignee) {
                case 'nw':
                    newW = bbox.x2 - xNorm;
                    sel.data.width = newW;
                    sel.data.height = newW * ratio;
                    sel.data.x = bbox.x2 - newW;
                    sel.data.y = bbox.y2 - newW * ratio;
                    break;
                case 'ne':
                    newW = xNorm - bbox.x1;
                    sel.data.width = newW;
                    sel.data.height = newW * ratio;
                    sel.data.y = bbox.y2 - newW * ratio;
                    break;
                case 'sw':
                    newW = bbox.x2 - xNorm;
                    sel.data.width = newW;
                    sel.data.height = newW * ratio;
                    sel.data.x = bbox.x2 - newW;
                    break;
                case 'se':
                    newW = xNorm - bbox.x1;
                    sel.data.width = newW;
                    sel.data.height = newW * ratio;
                    break;
            }
        } else if (sel.type === 'text') {
            // Ajuster la largeur du bloc texte (le texte se redistribue)
            let newW;
            switch (poignee) {
                case 'ne': case 'se': newW = xNorm - bbox.x1; break;
                case 'nw': case 'sw': newW = bbox.x2 - xNorm; sel.data.x = xNorm; break;
                default: newW = bbox.x2 - bbox.x1;
            }
            if (newW > 0.02) {
                sel.data.width = newW;
            }
        }

        sel.bbox = calculerBBox(sel.type, sel.data);
    }

    /**
     * Applique une nouvelle couleur aux elements selectionnes
     */
    function appliquerCouleurSelection(nouvelleCouleur) {
        if (selectionsMultiples.length === 0) return;

        const snapshots = selectionsMultiples.map(s => clonerDonneesAnnotation(s));

        for (const sel of selectionsMultiples) {
            if (sel.data.color !== undefined) {
                sel.data.color = nouvelleCouleur;
            }
        }

        empilerUndo('modification-multiple', selectionsMultiples.map((s, i) => ({
            type: s.type, index: s.index,
            avant: snapshots[i],
            apres: clonerDonneesAnnotation(s)
        })));

        reRendreAnnotations();
        planifierSauvegarde();
    }

    /**
     * Applique une nouvelle epaisseur aux elements selectionnes
     */
    function appliquerEpaisseurSelection(nouvelleEpaisseur) {
        if (selectionsMultiples.length === 0) return;

        const snapshots = selectionsMultiples.map(s => clonerDonneesAnnotation(s));

        for (const sel of selectionsMultiples) {
            if (sel.data.lineWidth !== undefined) {
                sel.data.lineWidth = nouvelleEpaisseur;
                sel.bbox = calculerBBox(sel.type, sel.data);
            }
        }

        empilerUndo('modification-multiple', selectionsMultiples.map((s, i) => ({
            type: s.type, index: s.index,
            avant: snapshots[i],
            apres: clonerDonneesAnnotation(s)
        })));

        reRendreAnnotations();
        planifierSauvegarde();
    }

    function onCouleurChange(e) {
        if (!annotationActive) return;
        // #943 — la couleur choisie après un tracé vise la PROCHAINE ligne, pas celle qu'on vient de tracer.
        if (selectionApresTrace) { deselectionner(); return; }
        if (selectionsMultiples.length > 0) {
            appliquerCouleurSelection(e.detail.couleur);
        }
    }

    function onEpaisseurChange(e) {
        if (!annotationActive) return;
        if (selectionApresTrace) { deselectionner(); return; }   // #943 — même règle que la couleur
        if (selectionsMultiples.length > 0) {
            appliquerEpaisseurSelection(e.detail.epaisseur);
        }
    }

    function onFlechePointesChange(e) {
        if (!annotationActive) return;
        if (selectionApresTrace) { deselectionner(); return; }   // #943 — même règle que la couleur
        if (selectionsMultiples.length === 0) return;
        const val = e.detail.pointes;
        const snapshots = selectionsMultiples.map(s => clonerDonneesAnnotation(s));
        let modifie = false;
        for (const sel of selectionsMultiples) {
            if (sel.type === 'shape' && (sel.data.type === 'fleche' || sel.data.type === 'ligne' || sel.data.type === 'ondule')) {
                sel.data.pointes = val;
                delete sel.data.double; // nettoyage legacy
                modifie = true;
            }
        }
        if (modifie) {
            empilerUndo('modification-multiple', selectionsMultiples.map((s, i) => ({
                type: s.type, index: s.index,
                avant: snapshots[i],
                apres: clonerDonneesAnnotation(s)
            })));
            reRendreAnnotations();
            planifierSauvegarde();
        }
    }

    /**
     * Clone les donnees d'une annotation pour undo
     */
    function clonerDonneesAnnotation(sel) {
        return JSON.parse(JSON.stringify(sel.data));
    }

    /**
     * Duplique les annotations selectionnees avec un petit decalage
     */
    function dupliquerSelection() {
        if (selectionsMultiples.length === 0) return;

        const donneesPage = obtenirDonneesPage();
        const DECALAGE = 0.02; // 2% du canvas
        const nouveauxElements = [];

        for (const sel of selectionsMultiples) {
            const clone = JSON.parse(JSON.stringify(sel.data));
            // Nouvel ID unique
            clone.id = (clone.id || '').replace(/^[A-Z_]+/, m => m) + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

            // Decaler selon le type
            if (sel.type === 'stroke') {
                for (const p of clone.points) {
                    p.x += DECALAGE;
                    p.y += DECALAGE;
                }
                donneesPage.strokes.push(clone);
                const idx = donneesPage.strokes.length - 1;
                nouveauxElements.push({ type: 'stroke', index: idx, data: clone, bbox: calculerBBox('stroke', clone) });
            } else if (sel.type === 'shape') {
                clone.x1 += DECALAGE; clone.y1 += DECALAGE;
                clone.x2 += DECALAGE; clone.y2 += DECALAGE;
                if (clone.cx != null) { clone.cx += DECALAGE; clone.cy += DECALAGE; }
                donneesPage.shapes.push(clone);
                const idx = donneesPage.shapes.length - 1;
                nouveauxElements.push({ type: 'shape', index: idx, data: clone, bbox: calculerBBox('shape', clone) });
            } else if (sel.type === 'text') {
                clone.x += DECALAGE; clone.y += DECALAGE;
                donneesPage.textAnnotations.push(clone);
                const idx = donneesPage.textAnnotations.length - 1;
                nouveauxElements.push({ type: 'text', index: idx, data: clone, bbox: calculerBBox('text', clone) });
            } else if (sel.type === 'sticker') {
                clone.x += DECALAGE; clone.y += DECALAGE;
                donneesPage.stickers.push(clone);
                const idx = donneesPage.stickers.length - 1;
                nouveauxElements.push({ type: 'sticker', index: idx, data: clone, bbox: calculerBBox('sticker', clone) });
            }
        }

        if (nouveauxElements.length > 0) {
            empilerUndo('duplication-multiple', nouveauxElements.map(s => ({
                type: s.type, data: JSON.parse(JSON.stringify(s.data))
            })));
            // Selectionner les copies
            selectionsMultiples = nouveauxElements;
            annotationSelectionnee = nouveauxElements[nouveauxElements.length - 1];
            reRendreAnnotations();
            planifierSauvegarde();
        }
    }

    /**
     * Copie les annotations selectionnees dans le presse-papiers interne
     */
    function copierSelection() {
        if (selectionsMultiples.length === 0) return;

        window._annotationClipboard = selectionsMultiples.map(function(sel) {
            return { type: sel.type, data: JSON.parse(JSON.stringify(sel.data)) };
        });

        var n = window._annotationClipboard.length;
        notifications.succes(n + ' annotation' + (n > 1 ? 's copiées' : ' copiée'));
    }

    /**
     * Colle les annotations du presse-papiers dans le canvas courant
     */
    function collerAnnotations() {
        if (!window._annotationClipboard || window._annotationClipboard.length === 0) return;

        var donneesPage = obtenirDonneesPage();
        var DECALAGE = 0.02;
        var nouveauxElements = [];

        for (var i = 0; i < window._annotationClipboard.length; i++) {
            var item = window._annotationClipboard[i];
            var clone = JSON.parse(JSON.stringify(item.data));
            // Generer un nouvel ID unique
            clone.id = (item.type === 'stroke' ? 'STR_' : item.type === 'shape' ? 'SHP_' : item.type === 'sticker' ? 'STK_' : 'TXT_') + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

            if (item.type === 'stroke') {
                for (var j = 0; j < clone.points.length; j++) {
                    clone.points[j].x += DECALAGE;
                    clone.points[j].y += DECALAGE;
                }
                donneesPage.strokes.push(clone);
                var idxS = donneesPage.strokes.length - 1;
                nouveauxElements.push({ type: 'stroke', index: idxS, data: clone, bbox: calculerBBox('stroke', clone) });
            } else if (item.type === 'shape') {
                clone.x1 += DECALAGE; clone.y1 += DECALAGE;
                clone.x2 += DECALAGE; clone.y2 += DECALAGE;
                if (clone.cx != null) { clone.cx += DECALAGE; clone.cy += DECALAGE; }
                donneesPage.shapes.push(clone);
                var idxH = donneesPage.shapes.length - 1;
                nouveauxElements.push({ type: 'shape', index: idxH, data: clone, bbox: calculerBBox('shape', clone) });
            } else if (item.type === 'text') {
                clone.x += DECALAGE; clone.y += DECALAGE;
                donneesPage.textAnnotations.push(clone);
                var idxT = donneesPage.textAnnotations.length - 1;
                nouveauxElements.push({ type: 'text', index: idxT, data: clone, bbox: calculerBBox('text', clone) });
            } else if (item.type === 'sticker') {
                clone.x += DECALAGE; clone.y += DECALAGE;
                donneesPage.stickers.push(clone);
                var idxK = donneesPage.stickers.length - 1;
                nouveauxElements.push({ type: 'sticker', index: idxK, data: clone, bbox: calculerBBox('sticker', clone) });
            }
        }

        if (nouveauxElements.length > 0) {
            empilerUndo('coller-annotations', nouveauxElements.map(function(s) {
                return { type: s.type, data: JSON.parse(JSON.stringify(s.data)) };
            }));
            selectionsMultiples = nouveauxElements;
            annotationSelectionnee = nouveauxElements[nouveauxElements.length - 1];
            reRendreAnnotations();
            planifierSauvegarde();

            var n = nouveauxElements.length;
            notifications.succes(n + ' annotation' + (n > 1 ? 's collées' : ' collée'));
        }
    }

    /**
     * Met a jour l'etat enabled/disabled du bouton Supprimer
     */
    function mettreAJourBoutonSupprimer() {
        const btn = document.getElementById('travaux-btn-supprimer');
        if (btn) btn.disabled = (selectionsMultiples.length === 0);
    }

    /**
     * Supprime l'annotation selectionnee
     */
    function supprimerSelection() {
        if (selectionsMultiples.length === 0) return;

        const donneesPage = obtenirDonneesPage();

        // Trier par index decroissant pour supprimer sans decaler les indices
        const parType = { stroke: [], shape: [], text: [], sticker: [] };
        for (const sel of selectionsMultiples) {
            if (sel.type === 'stroke') parType.stroke.push(sel);
            else if (sel.type === 'shape') parType.shape.push(sel);
            else if (sel.type === 'text') parType.text.push(sel);
            else if (sel.type === 'sticker') parType.sticker.push(sel);
        }

        // Supprimer par index decroissant dans chaque categorie
        for (const sel of parType.sticker.sort((a, b) => b.index - a.index)) {
            donneesPage.stickers.splice(sel.index, 1);
        }
        for (const sel of parType.text.sort((a, b) => b.index - a.index)) {
            donneesPage.textAnnotations.splice(sel.index, 1);
        }
        for (const sel of parType.shape.sort((a, b) => b.index - a.index)) {
            donneesPage.shapes.splice(sel.index, 1);
        }
        for (const sel of parType.stroke.sort((a, b) => b.index - a.index)) {
            donneesPage.strokes.splice(sel.index, 1);
        }

        empilerUndo('suppression-multiple', selectionsMultiples.map(s => ({
            type: s.type, data: clonerDonneesAnnotation(s)
        })));

        annotationSelectionnee = null;
        selectionsMultiples = [];
        reRendreAnnotations();
        planifierSauvegarde();
    }

    /**
     * Met a jour le curseur en fonction de la position pour le mode selection
     */
    function mettreAJourCurseurSelection(xNorm, yNorm) {
        if (!canvasAnnotation) return;

        // Poignees de redimensionnement (mono-selection)
        if (selectionsMultiples.length === 1 && annotationSelectionnee) {
            const poignee = detecterPoignee(xNorm, yNorm, annotationSelectionnee.bbox, annotationSelectionnee);
            if (poignee) {
                const curseurs = { nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize', cp: 'grab', p1: 'grab', p2: 'grab' };
                canvasAnnotation.style.cursor = curseurs[poignee] || 'move';
                return;
            }
        }

        // Dans la bbox combinee = move
        if (selectionsMultiples.length > 0) {
            const bboxC = calculerBBoxCombinee(selectionsMultiples);
            if (xNorm >= bboxC.x1 && xNorm <= bboxC.x2 && yNorm >= bboxC.y1 && yNorm <= bboxC.y2) {
                canvasAnnotation.style.cursor = 'move';
                return;
            }
        }

        // Survol d'une annotation = move
        const hit = trouverAnnotationAuPoint(xNorm, yNorm);
        canvasAnnotation.style.cursor = hit ? 'move' : 'crosshair';
    }

    /* ===============================
       RENDU ANNOTATIONS
       =============================== */

    /**
     * Re-dessine toutes les annotations de la page courante
     */
    function reRendreAnnotations() {
        if (!ctxAnnotation || !canvasAnnotation) return;

        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;

        // Effacer le canvas annotation
        ctxAnnotation.clearRect(0, 0, w, h);

        // Effacer le canvas surligneur
        if (ctxSurligneur && canvasSurligneur) {
            ctxSurligneur.clearRect(0, 0, w, h);
        }

        const donneesPage = obtenirDonneesPage();

        // Dessiner les traits
        for (const trait of donneesPage.strokes) {
            // Anciens traits surligneur → canvas surligneur (mix-blend-mode: multiply)
            if (trait.tool === 'surligneur' && ctxSurligneur) {
                dessinerTrait(trait, ctxSurligneur);
            } else {
                dessinerTrait(trait, ctxAnnotation);
            }
        }

        // Dessiner les formes
        for (const forme of donneesPage.shapes) {
            // Nouvelles formes surligneur → canvas surligneur
            if (forme.type === 'surligneur' && ctxSurligneur) {
                dessinerForme(forme, ctxSurligneur);
            } else {
                dessinerForme(forme, ctxAnnotation);
            }
        }

        // Dessiner les textes
        for (const texte of donneesPage.textAnnotations) {
            dessinerTexte(texte);
        }

        // Dessiner les autocollants
        if (donneesPage.stickers) {
            for (const sticker of donneesPage.stickers) {
                dessinerAutocollant(sticker);
            }
        }

        // Dessiner la selection si active
        dessinerSelection();

        // Mettre a jour l'etat du bouton Supprimer
        mettreAJourBoutonSupprimer();
    }

    /**
     * Dessine un trait complet
     * @param {Object} trait - Donnees du trait
     */
    function dessinerTrait(trait, ctx) {
        if (!trait.points || trait.points.length < 2) return;
        if (!_outils()) return; // Module pas encore charge
        ctx = ctx || ctxAnnotation;

        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const outils = _outils();
        const outil = outils.OUTILS[trait.tool] || outils.OUTILS.stylo;
        const dims = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getDimensionsOriginales)
            ? travauxVisionneuse.getDimensionsOriginales() : null;
        const largeurRef = (dims && dims.w) ? dims.w : outils.RESOLUTION_REFERENCE;
        const ratioResolution = largeurRef / outils.RESOLUTION_REFERENCE;

        ctx.save();
        ctx.globalAlpha = trait.opacity || 1.0;
        ctx.strokeStyle = trait.color;
        const estSurl = (trait.tool === 'surligneur');
        ctx.lineCap = estSurl ? 'butt' : 'round';
        ctx.lineJoin = estSurl ? 'bevel' : 'round';

        ctx.beginPath();
        const p0 = trait.points[0];
        ctx.moveTo(p0.x * w, p0.y * h);

        for (let i = 1; i < trait.points.length; i++) {
            const p = trait.points[i];
            const epaisseurLogique = outil.sensiblePression
                ? outils.calculerEpaisseurPression(p.pressure) * (trait.lineWidth / outil.epaisseurDefaut)
                : trait.lineWidth;
            ctx.lineWidth = epaisseurLogique * ratioResolution;
            ctx.lineTo(p.x * w, p.y * h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x * w, p.y * h);
        }

        ctx.restore();
    }

    /**
     * Dessine une forme
     * @param {Object} forme - Donnees de la forme
     */
    function dessinerForme(forme, ctx) {
        if (!_outils()) return; // Module pas encore charge
        ctx = ctx || ctxAnnotation;
        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const outils = _outils();
        const dims = (typeof travauxVisionneuse !== 'undefined' && travauxVisionneuse.getDimensionsOriginales)
            ? travauxVisionneuse.getDimensionsOriginales() : null;
        const largeurRef = (dims && dims.w) ? dims.w : outils.RESOLUTION_REFERENCE;
        const ratioResolution = largeurRef / outils.RESOLUTION_REFERENCE;

        ctx.save();
        ctx.strokeStyle = forme.color;
        ctx.lineWidth = (forme.lineWidth || 2) * ratioResolution;
        ctx.lineCap = 'round';

        const x1 = forme.x1 * w, y1 = forme.y1 * h;
        const x2 = forme.x2 * w, y2 = forme.y2 * h;

        switch (forme.type) {
            case 'rectangle':
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                break;

            case 'cercle': {
                const cx = (x1 + x2) / 2;
                const cy = (y1 + y2) / 2;
                const rx = Math.abs(x2 - x1) / 2;
                const ry = Math.abs(y2 - y1) / 2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }

            case 'ondule': {
                const amplitude = (forme.amplitude || 6) * ratioResolution;
                const wavelength = (forme.wavelength || 30) * ratioResolution;
                const dx = x2 - x1;
                const dy = y2 - y1;
                const lineLen = Math.sqrt(dx * dx + dy * dy);
                if (lineLen < 1) break;
                const headLen = Math.max(12, ctx.lineWidth * 5);
                const headAngle = Math.PI / 8;
                const pointes = normaliserPointes(forme);
                const pointeDebut = pointes === 'debut' || pointes === 'double';
                const pointeFin = pointes === 'fin' || pointes === 'double';
                // Vecteurs unitaires : tangent (along) et normal (perpendicular)
                const tx = dx / lineLen;
                const ty = dy / lineLen;
                const nx = -ty;
                const ny = tx;
                // Raccourcir la vague aux extremites pour laisser place aux pointes
                const startDist = pointeDebut ? headLen : 0;
                const endDist = pointeFin ? lineLen - headLen : lineLen;
                ctx.beginPath();
                ctx.moveTo(x1 + tx * startDist, y1 + ty * startDist);
                const steps = Math.max(Math.ceil(lineLen), 1);
                for (let i = 1; i <= steps; i++) {
                    const t = i / steps;
                    const dist = t * lineLen;
                    if (dist < startDist || dist > endDist) continue;
                    const phase = (dist / wavelength) * Math.PI * 2;
                    const offset = Math.sin(phase) * amplitude;
                    ctx.lineTo(
                        x1 + tx * dist + nx * offset,
                        y1 + ty * dist + ny * offset
                    );
                }
                ctx.stroke();
                // Pointes
                const angle = Math.atan2(dy, dx);
                if (pointeFin) {
                    dessinerPointeFleche(ctx, x2, y2, angle, headLen, headAngle);
                }
                if (pointeDebut) {
                    dessinerPointeFleche(ctx, x1, y1, angle + Math.PI, headLen, headAngle);
                }
                break;
            }

            case 'pointille': {
                var ep = (forme.lineWidth || 2) * ratioResolution;
                var dash = ep * 3;
                var gap = ep * 2;
                ctx.setLineDash([dash, gap]);
                dessinerFleche(ctx, x1, y1, x2, y2, forme);
                ctx.setLineDash([]);
                break;
            }

            case 'surligneur':
                ctx.lineCap = 'butt';
                ctx.globalAlpha = forme.opacity || 0.5;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                break;

            case 'ligne': // fallthrough — rendu via dessinerFleche avec pointes='aucune'
            case 'fleche':
                dessinerFleche(ctx, x1, y1, x2, y2, forme);
                break;

            case 'crochet':
            case 'croix':
            case 'interrogation':
                dessinerSymboleUnicode(ctx, x1, y1, x2, y2, forme.color, forme.icone || _outils().OUTILS[forme.type].icone);
                break;

            default:
                // Erreurs de français (errfr_1 a errfr_10)
                if (forme.type.startsWith('errfr_')) {
                    dessinerErreurFrancais(ctx, x1, y1, x2, y2, forme.color, forme.type);
                } else if (forme.type.startsWith('sym-') && _outils().OUTILS[forme.type]) {
                    // Symboles Unicode personnalises
                    dessinerSymboleUnicode(ctx, x1, y1, x2, y2, forme.color, forme.icone || _outils().OUTILS[forme.type].icone);
                }
                break;
        }

        ctx.restore();
    }

    /**
     * Dessine une pointe de fleche (triangle plein)
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} tipX - X de la pointe
     * @param {number} tipY - Y de la pointe
     * @param {number} angle - Angle de la direction (radians)
     * @param {number} headLen - Longueur de la pointe
     * @param {number} headAngle - Demi-ouverture du triangle
     */
    function dessinerPointeFleche(ctx, tipX, tipY, angle, headLen, headAngle) {
        const ax = tipX - headLen * Math.cos(angle - headAngle);
        const ay = tipY - headLen * Math.sin(angle - headAngle);
        const bx = tipX - headLen * Math.cos(angle + headAngle);
        const by = tipY - headLen * Math.sin(angle + headAngle);

        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Dessine une fleche (droite ou courbe, simple ou double)
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x1 - Debut X pixel
     * @param {number} y1 - Debut Y pixel
     * @param {number} x2 - Fin X pixel
     * @param {number} y2 - Fin Y pixel
     * @param {Object} [forme] - Donnees de la forme (cx, cy, double)
     */
    function dessinerFleche(ctx, x1, y1, x2, y2, forme) {
        const headLen = Math.max(12, ctx.lineWidth * 5);
        const headAngle = Math.PI / 8;
        const w = canvasAnnotation ? canvasAnnotation.width : 1;
        const h = canvasAnnotation ? canvasAnnotation.height : 1;
        const pointes = normaliserPointes(forme || {});
        const pointeDebut = pointes === 'debut' || pointes === 'double';
        const pointeFin = pointes === 'fin' || pointes === 'double';
        const aCourbe = forme && forme.cx != null && forme.cy != null;

        if (aCourbe) {
            // Point de controle en pixels
            const cpx = forme.cx * w;
            const cpy = forme.cy * h;

            // Tangentes aux extremites d'une courbe quadratique B(t) = (1-t)²P0 + 2(1-t)tC + t²P1
            // B'(0) = 2(C - P0), B'(1) = 2(P1 - C)
            const angleEnd = Math.atan2(y2 - cpy, x2 - cpx);
            const angleStartOut = Math.atan2(cpy - y1, cpx - x1); // tangente sortante au start

            // Raccourcir la tige aux extremites pour les pointes
            let endX = x2, endY = y2;
            if (pointeFin) {
                endX = x2 - headLen * Math.cos(angleEnd);
                endY = y2 - headLen * Math.sin(angleEnd);
            }

            let startX = x1, startY = y1;
            if (pointeDebut) {
                startX = x1 + headLen * Math.cos(angleStartOut);
                startY = y1 + headLen * Math.sin(angleStartOut);
            }

            // Tige courbe (quadraticCurveTo)
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(cpx, cpy, endX, endY);
            ctx.stroke();

            // Pointe a la fin
            if (pointeFin) {
                dessinerPointeFleche(ctx, x2, y2, angleEnd, headLen, headAngle);
            }

            // Pointe au debut
            if (pointeDebut) {
                dessinerPointeFleche(ctx, x1, y1, angleStartOut + Math.PI, headLen, headAngle);
            }
        } else {
            // Fleche droite
            const angle = Math.atan2(y2 - y1, x2 - x1);

            let startX = x1, startY = y1;
            if (pointeDebut) {
                startX = x1 + headLen * Math.cos(angle);
                startY = y1 + headLen * Math.sin(angle);
            }

            // Base de la pointe end (ou la tige s'arrete)
            let endX = x2, endY = y2;
            if (pointeFin) {
                endX = x2 - headLen * Math.cos(angle);
                endY = y2 - headLen * Math.sin(angle);
            }

            // Tige
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Pointe end
            if (pointeFin) {
                dessinerPointeFleche(ctx, x2, y2, angle, headLen, headAngle);
            }

            // Pointe start
            if (pointeDebut) {
                dessinerPointeFleche(ctx, x1, y1, angle + Math.PI, headLen, headAngle);
            }
        }
    }

    /**
     * Dessine un crochet (caractere ✔︎)
     */
    /**
     * Dessine un symbole Unicode generique (crochet, croix, interrogation, custom)
     */
    function dessinerSymboleUnicode(ctx, x1, y1, x2, y2, color, icone) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const size = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));

        ctx.fillStyle = color || '#888888';
        ctx.font = 'bold ' + size + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icone || '?', mx, my);
    }

    /**
     * Dessine un cercle numerote pour les erreurs de français
     */
    function dessinerErreurFrancais(ctx, x1, y1, x2, y2, color, type) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const rayon = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
        // Lot 2 (3 sept. 2026) — le numéro vient de la liste de la grille de la
        // copie ouverte (`codesAnnotation`) : le code du sous-critère sous une
        // grille activée, la position dans l'ordre personnalisé en repli (hier).
        // Un code que la liste ne connaît pas garde son numéro : jamais effacé.
        let numero = type.replace('errfr_', '');
        if (typeof codesAnnotation !== 'undefined' && typeof travauxOutils !== 'undefined' && travauxOutils.grilleCourante) {
            numero = codesAnnotation.code(travauxOutils.grilleCourante(), type).numero;
        }

        // Cercle rempli
        ctx.fillStyle = color || '#888888';
        ctx.beginPath();
        ctx.arc(mx, my, rayon, 0, Math.PI * 2);
        ctx.fill();

        // Numero blanc au centre
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.round(rayon * 1.2) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(numero, mx, my);
    }

    /**
     * Découpe une ligne de texte en sous-lignes tenant dans maxWidthPx.
     */
    function wrapLigne(ctx, ligne, maxWidthPx) {
        if (!ligne) return [''];
        const mots = ligne.split(' ');
        const result = [];
        let courante = '';
        for (const mot of mots) {
            const test = courante ? courante + ' ' + mot : mot;
            if (ctx.measureText(test).width > maxWidthPx && courante) {
                result.push(courante);
                courante = mot;
            } else {
                courante = test;
            }
        }
        if (courante) result.push(courante);
        return result.length ? result : [''];
    }

    function dessinerTexte(texte) {
        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const outils = _outils();
        const scale = w / (outils ? outils.RESOLUTION_REFERENCE : 1000);
        const fontSize = (texte.fontSize || 14) * scale;

        ctxAnnotation.save();
        ctxAnnotation.font = `${fontSize}px sans-serif`;
        ctxAnnotation.fillStyle = texte.color || '#FF0000';

        const interligne = fontSize * 1.3;
        const xPx = texte.x * w;
        const yPx = texte.y * h;

        // Word-wrap si une largeur est définie
        const maxWidthPx = texte.width ? texte.width * w : 0;
        const lignesBrutes = (texte.text || '').split('\n');
        let lignesFinales;

        if (maxWidthPx > 0) {
            lignesFinales = [];
            for (const ligne of lignesBrutes) {
                lignesFinales.push(...wrapLigne(ctxAnnotation, ligne, maxWidthPx));
            }
        } else {
            lignesFinales = lignesBrutes;
        }

        for (let i = 0; i < lignesFinales.length; i++) {
            ctxAnnotation.fillText(lignesFinales[i], xPx, yPx + i * interligne);
        }

        ctxAnnotation.restore();
    }

    /**
     * Dessine une forme temporaire (pendant le dessin)
     * @param {Object} forme - Donnees de la forme
     */
    function dessinerFormeTemporaire(forme) {
        if (forme.type === 'surligneur' && ctxSurligneur) {
            dessinerForme(forme, ctxSurligneur);
        } else {
            dessinerForme(forme);
        }
    }

    /* ===============================
       CHARGEMENT ANNOTATIONS PAGE
       =============================== */

    /**
     * Charge et dessine les annotations de la page courante
     */
    function chargerAnnotationsPage() {
        if (!annotationCourante) return;
        reRendreAnnotations();
    }

    /* ===============================
       UNDO / REDO
       =============================== */

    /**
     * Empile une action dans la pile undo
     * @param {string} type - Type d'action
     * @param {Object} donnees - Donnees de l'action
     */
    function empilerUndo(type, donnees) {
        const page = travauxVisionneuse.getPageActuelle() - 1;
        pileUndo.push({ type, donnees, page });

        if (pileUndo.length > MAX_UNDO) {
            pileUndo.shift();
        }

        // Vider la pile redo
        pileRedo = [];

        mettreAJourBoutonsUndoRedo();
    }

    /**
     * Annule la derniere action
     */
    function annuler() {
        if (pileUndo.length === 0) return;

        const action = pileUndo.pop();
        pileRedo.push(action);

        const page = action.page;
        if (!annotationCourante.pages[page]) return;

        const donneesPage = annotationCourante.pages[page];

        switch (action.type) {
            case 'ajout-trait':
                donneesPage.strokes = donneesPage.strokes.filter(s => s.id !== action.donnees.id);
                break;
            case 'ajout-forme':
                donneesPage.shapes = donneesPage.shapes.filter(s => s.id !== action.donnees.id);
                break;
            case 'ajout-texte':
                donneesPage.textAnnotations = donneesPage.textAnnotations.filter(t => t.id !== action.donnees.id);
                break;
            case 'ajout-autocollant':
                if (donneesPage.stickers) {
                    donneesPage.stickers = donneesPage.stickers.filter(s => s.id !== action.donnees.id);
                }
                break;
            case 'suppression-trait':
                donneesPage.strokes.push(action.donnees);
                break;
            case 'suppression-forme':
                donneesPage.shapes.push(action.donnees);
                break;
            case 'suppression-texte':
                donneesPage.textAnnotations.push(action.donnees);
                break;
            case 'suppression-autocollant':
                if (!donneesPage.stickers) donneesPage.stickers = [];
                donneesPage.stickers.push(action.donnees);
                break;
            case 'modification-annotation':
                restaurerAnnotation(donneesPage, action.donnees.type, action.donnees.avant);
                break;
            case 'duplication-multiple':
            case 'coller-annotations':
                // Annuler duplication/collage = supprimer les clones
                for (const item of action.donnees) {
                    if (item.type === 'stroke') donneesPage.strokes = donneesPage.strokes.filter(s => s.id !== item.data.id);
                    else if (item.type === 'shape') donneesPage.shapes = donneesPage.shapes.filter(s => s.id !== item.data.id);
                    else if (item.type === 'text') donneesPage.textAnnotations = donneesPage.textAnnotations.filter(t => t.id !== item.data.id);
                    else if (item.type === 'sticker' && donneesPage.stickers) donneesPage.stickers = donneesPage.stickers.filter(s => s.id !== item.data.id);
                }
                break;
            case 'suppression-multiple':
                // Restaurer tous les elements supprimes
                for (const item of action.donnees) {
                    if (item.type === 'stroke') donneesPage.strokes.push(item.data);
                    else if (item.type === 'shape') donneesPage.shapes.push(item.data);
                    else if (item.type === 'text') donneesPage.textAnnotations.push(item.data);
                    else if (item.type === 'sticker') {
                        if (!donneesPage.stickers) donneesPage.stickers = [];
                        donneesPage.stickers.push(item.data);
                    }
                }
                break;
            case 'modification-multiple':
                // Restaurer les etats avant modification
                for (const item of action.donnees) {
                    restaurerAnnotation(donneesPage, item.type, item.avant);
                }
                break;
            case 'effacer-page':
                // Restaurer tout le contenu de la page
                donneesPage.strokes = JSON.parse(JSON.stringify(action.donnees.strokes));
                donneesPage.textAnnotations = JSON.parse(JSON.stringify(action.donnees.textAnnotations));
                donneesPage.shapes = JSON.parse(JSON.stringify(action.donnees.shapes));
                donneesPage.stickers = JSON.parse(JSON.stringify(action.donnees.stickers));
                break;
        }

        // Deselectionner apres undo
        annotationSelectionnee = null;
        selectionsMultiples = [];
        reRendreAnnotations();
        planifierSauvegarde();
        mettreAJourBoutonsUndoRedo();
    }

    /**
     * Retablit la derniere action annulee
     */
    function retablir() {
        if (pileRedo.length === 0) return;

        const action = pileRedo.pop();
        pileUndo.push(action);

        const page = action.page;
        if (!annotationCourante.pages[page]) {
            annotationCourante.pages[page] = { strokes: [], textAnnotations: [], shapes: [], stickers: [] };
        }

        const donneesPage = annotationCourante.pages[page];

        switch (action.type) {
            case 'ajout-trait':
                donneesPage.strokes.push(action.donnees);
                break;
            case 'ajout-forme':
                donneesPage.shapes.push(action.donnees);
                break;
            case 'ajout-texte':
                donneesPage.textAnnotations.push(action.donnees);
                break;
            case 'ajout-autocollant':
                if (!donneesPage.stickers) donneesPage.stickers = [];
                donneesPage.stickers.push(action.donnees);
                break;
            case 'suppression-trait':
                donneesPage.strokes = donneesPage.strokes.filter(s => s.id !== action.donnees.id);
                break;
            case 'suppression-forme':
                donneesPage.shapes = donneesPage.shapes.filter(s => s.id !== action.donnees.id);
                break;
            case 'suppression-texte':
                donneesPage.textAnnotations = donneesPage.textAnnotations.filter(t => t.id !== action.donnees.id);
                break;
            case 'suppression-autocollant':
                if (donneesPage.stickers) {
                    donneesPage.stickers = donneesPage.stickers.filter(s => s.id !== action.donnees.id);
                }
                break;
            case 'modification-annotation':
                restaurerAnnotation(donneesPage, action.donnees.type, action.donnees.apres);
                break;
            case 'duplication-multiple':
            case 'coller-annotations':
                // Re-ajouter les clones
                for (const item of action.donnees) {
                    if (item.type === 'stroke') donneesPage.strokes.push(JSON.parse(JSON.stringify(item.data)));
                    else if (item.type === 'shape') donneesPage.shapes.push(JSON.parse(JSON.stringify(item.data)));
                    else if (item.type === 'text') donneesPage.textAnnotations.push(JSON.parse(JSON.stringify(item.data)));
                    else if (item.type === 'sticker') {
                        if (!donneesPage.stickers) donneesPage.stickers = [];
                        donneesPage.stickers.push(JSON.parse(JSON.stringify(item.data)));
                    }
                }
                break;
            case 'suppression-multiple':
                // Re-supprimer tous les elements
                for (const item of action.donnees) {
                    if (item.type === 'stroke') donneesPage.strokes = donneesPage.strokes.filter(s => s.id !== item.data.id);
                    else if (item.type === 'shape') donneesPage.shapes = donneesPage.shapes.filter(s => s.id !== item.data.id);
                    else if (item.type === 'text') donneesPage.textAnnotations = donneesPage.textAnnotations.filter(t => t.id !== item.data.id);
                    else if (item.type === 'sticker' && donneesPage.stickers) donneesPage.stickers = donneesPage.stickers.filter(s => s.id !== item.data.id);
                }
                break;
            case 'modification-multiple':
                // Restaurer les etats apres modification
                for (const item of action.donnees) {
                    restaurerAnnotation(donneesPage, item.type, item.apres);
                }
                break;
            case 'effacer-page':
                // Re-vider la page
                donneesPage.strokes = [];
                donneesPage.textAnnotations = [];
                donneesPage.shapes = [];
                donneesPage.stickers = [];
                break;
        }

        // Deselectionner apres redo
        annotationSelectionnee = null;
        selectionsMultiples = [];
        reRendreAnnotations();
        planifierSauvegarde();
        mettreAJourBoutonsUndoRedo();
    }

    /**
     * Met a jour l'etat des boutons undo/redo
     */
    function mettreAJourBoutonsUndoRedo() {
        const btnUndo = document.getElementById('travaux-btn-undo');
        const btnRedo = document.getElementById('travaux-btn-redo');

        if (btnUndo) btnUndo.disabled = pileUndo.length === 0;
        if (btnRedo) btnRedo.disabled = pileRedo.length === 0;
    }

    /**
     * Restaure les donnees d'une annotation (pour undo/redo de modification)
     * @param {Object} donneesPage - Donnees de la page
     * @param {string} type - Type d'annotation
     * @param {Object} donnees - Donnees a restaurer
     */
    function restaurerAnnotation(donneesPage, type, donnees) {
        switch (type) {
            case 'stroke': {
                const idx = donneesPage.strokes.findIndex(s => s.id === donnees.id);
                if (idx >= 0) donneesPage.strokes[idx] = JSON.parse(JSON.stringify(donnees));
                break;
            }
            case 'shape': {
                const idx = donneesPage.shapes.findIndex(s => s.id === donnees.id);
                if (idx >= 0) donneesPage.shapes[idx] = JSON.parse(JSON.stringify(donnees));
                break;
            }
            case 'text': {
                const idx = donneesPage.textAnnotations.findIndex(t => t.id === donnees.id);
                if (idx >= 0) donneesPage.textAnnotations[idx] = JSON.parse(JSON.stringify(donnees));
                break;
            }
            case 'sticker': {
                if (!donneesPage.stickers) break;
                const idx = donneesPage.stickers.findIndex(s => s.id === donnees.id);
                if (idx >= 0) donneesPage.stickers[idx] = JSON.parse(JSON.stringify(donnees));
                break;
            }
        }
    }

    /* ===============================
       SAUVEGARDE
       =============================== */

    /**
     * Planifie une sauvegarde avec debounce
     */
    function planifierSauvegarde() {
        if (timerSauvegarde) {
            clearTimeout(timerSauvegarde);
        }
        timerSauvegarde = setTimeout(() => {
            sauvegarderAnnotation();
            window.dispatchEvent(new CustomEvent('travaux-annotation-modifiee'));
        }, SAUVEGARDE_DELAI);
    }

    /**
     * Sauvegarde l'annotation courante
     * @param {{discret?: boolean}} [options] - `discret` : réécriture sans trait neuf, que
     *   le codex n'a pas à apprendre (lot F, voir travaux-stockage `_signalerSiGeste`)
     */
    function sauvegarderAnnotation(options) {
        if (!annotationCourante) return;

        annotationCourante.dateModification = new Date().toISOString();
        travauxStockage.sauvegarderAnnotationFichier(annotationCourante, options);
    }

    /**
     * Efface toutes les annotations de la page courante
     */
    function effacerPage() {
        if (!annotationCourante) return;

        const page = travauxVisionneuse.getPageActuelle() - 1;
        const donneesPage = annotationCourante.pages[page];
        if (!donneesPage) return;

        // Sauvegarder le contenu actuel pour le undo
        const sauvegarde = {
            strokes: JSON.parse(JSON.stringify(donneesPage.strokes || [])),
            textAnnotations: JSON.parse(JSON.stringify(donneesPage.textAnnotations || [])),
            shapes: JSON.parse(JSON.stringify(donneesPage.shapes || [])),
            stickers: JSON.parse(JSON.stringify(donneesPage.stickers || []))
        };

        // Verifier qu'il y a quelque chose a effacer
        const total = sauvegarde.strokes.length + sauvegarde.textAnnotations.length
                    + sauvegarde.shapes.length + sauvegarde.stickers.length;
        if (total === 0) return;

        // Vider la page
        annotationCourante.pages[page] = {
            strokes: [],
            textAnnotations: [],
            shapes: [],
            stickers: []
        };

        empilerUndo('effacer-page', sauvegarde);

        annotationSelectionnee = null;
        selectionsMultiples = [];
        reRendreAnnotations();
        planifierSauvegarde();
        mettreAJourBoutonsUndoRedo();
    }

    /* ===============================
       ACCESSEURS
       =============================== */

    function estActif() { return annotationActive; }
    function getAnnotationCourante() { return annotationCourante; }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    /**
     * Injecte un contexte externe (canvas alternatifs)
     * @param {Object|null} ctx - { canvasAnnotation, canvasSurligneur, conteneurPalette } ou null
     */
    function setContext(ctx) {
        contextExterne = ctx || null;
    }

    window.travauxAnnotation = {
        initialiser: initialiserAnnotation,
        setContext: setContext,
        // Mode
        activerAnnotation: activerAnnotation,
        desactiverAnnotation: desactiverAnnotation,
        basculerAnnotation: basculerAnnotation,
        estActif: estActif,
        // Undo/Redo
        annuler: annuler,
        retablir: retablir,
        // Actions
        dupliquerSelection: dupliquerSelection,
        copierSelection: copierSelection,
        collerAnnotations: collerAnnotations,
        supprimerSelection: supprimerSelection,
        effacerPage: effacerPage,
        sauvegarderAnnotation: sauvegarderAnnotation,
        // Accesseurs
        getAnnotationCourante: getAnnotationCourante,
        reRendreAnnotations: reRendreAnnotations
    };

})();
