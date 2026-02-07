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

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let canvasAnnotation = null;
    let ctxAnnotation = null;
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

    // Mode selection
    let annotationSelectionnee = null;  // { type, index, data, bbox }
    let poigneeActive = null;           // null | 'move' | 'nw' | 'ne' | 'sw' | 'se'
    let deplacementOrigine = null;      // { x, y }
    let dimensionsOriginales = null;    // bbox avant transformation
    let donneesAvantModif = null;       // snapshot pour undo

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
            // Cacher le canvas quand le fichier est ferme
            if (canvasAnnotation) {
                canvasAnnotation.classList.add('u-hide');
            }
        });

        console.log('[Travaux-Annotation] Module initialise');
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
            // Pas d'annotations - cacher le canvas
            const canvas = document.getElementById('travaux-canvas-annotation');
            if (canvas) canvas.classList.add('u-hide');
            return;
        }

        // Il y a des annotations - les afficher en lecture seule
        canvasAnnotation = document.getElementById('travaux-canvas-annotation');
        if (!canvasAnnotation) return;

        ctxAnnotation = canvasAnnotation.getContext('2d');
        annotationCourante = annotation;
        fichierId = fichierActuel.id;

        dimensionnerCanvasAnnotation(width, height);
        canvasAnnotation.classList.remove('u-hide');
        canvasAnnotation.style.pointerEvents = 'none';
        reRendreAnnotations();
    }

    /**
     * Active le mode annotation
     */
    function activerAnnotation() {
        canvasAnnotation = document.getElementById('travaux-canvas-annotation');
        if (!canvasAnnotation) return;

        ctxAnnotation = canvasAnnotation.getContext('2d');
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

        canvasAnnotation.classList.remove('u-hide');
        canvasAnnotation.style.pointerEvents = 'auto';

        // Afficher la palette
        const palette = document.getElementById('travaux-palette-container');
        if (palette) {
            palette.innerHTML = travauxOutils.genererHTMLPalette();
            palette.classList.remove('u-hide');
        }

        window.dispatchEvent(new CustomEvent('travaux-annotation-activee'));
    }

    /**
     * Desactive le mode annotation
     */
    function desactiverAnnotation() {
        if (!annotationActive) return;

        sauvegarderAnnotation();
        detacherEvenements();
        annotationActive = false;

        // Deselectionner
        annotationSelectionnee = null;
        poigneeActive = null;

        // Garder le canvas visible en lecture seule (annotations restent affichees)
        if (canvasAnnotation) {
            canvasAnnotation.style.pointerEvents = 'none';
            // NE PAS cacher le canvas - les annotations doivent rester visibles
        }

        const palette = document.getElementById('travaux-palette-container');
        if (palette) {
            palette.classList.add('u-hide');
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
    }

    /**
     * Debut du trait / interaction
     */
    function onPointerDown(e) {
        const outil = travauxOutils.getOutilActif();

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

        const rect = canvasAnnotation.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Coordonnees normalisees (0-1)
        const xNorm = x / canvasAnnotation.width;
        const yNorm = y / canvasAnnotation.height;

        const outilActifId = outil.id;

        // Mode selection
        if (outil.type === 'selection') {
            // Verifier si on clique sur une poignee de la selection existante
            if (annotationSelectionnee) {
                const poignee = detecterPoignee(xNorm, yNorm, annotationSelectionnee.bbox);
                if (poignee) {
                    // Redimensionnement (sauf traits)
                    if (annotationSelectionnee.type !== 'stroke') {
                        poigneeActive = poignee;
                        deplacementOrigine = { x: xNorm, y: yNorm };
                        dimensionsOriginales = { ...annotationSelectionnee.bbox };
                        donneesAvantModif = clonerDonneesAnnotation(annotationSelectionnee);
                        enDessin = true;
                        return;
                    }
                }

                // Verifier si on clique dans la bbox (deplacement)
                const bbox = annotationSelectionnee.bbox;
                if (xNorm >= bbox.x1 && xNorm <= bbox.x2 && yNorm >= bbox.y1 && yNorm <= bbox.y2) {
                    poigneeActive = 'move';
                    deplacementOrigine = { x: xNorm, y: yNorm };
                    dimensionsOriginales = { ...annotationSelectionnee.bbox };
                    donneesAvantModif = clonerDonneesAnnotation(annotationSelectionnee);
                    enDessin = true;
                    return;
                }
            }

            // Nouveau hit-test
            const hit = trouverAnnotationAuPoint(xNorm, yNorm);
            if (hit) {
                annotationSelectionnee = hit;
                poigneeActive = 'move';
                deplacementOrigine = { x: xNorm, y: yNorm };
                dimensionsOriginales = { ...hit.bbox };
                donneesAvantModif = clonerDonneesAnnotation(hit);
                enDessin = true;
                reRendreAnnotations();
            } else {
                // Clic dans le vide -> deselectionner
                deselectionner();
            }
            return;
        }

        // Mode tampon : poser un autocollant
        if (outilActifId === 'tampon' || travauxOutils.getAutocollantActif()) {
            const autoId = travauxOutils.getAutocollantActif();
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
            ajouterTexte(xNorm, yNorm);
            return;
        }

        if (outil.type === 'forme' || outil.type === 'symbole') {
            if (outil.type === 'symbole') {
                ajouterSymbole(outil.id, xNorm, yNorm);
                return;
            }
            // Debut forme
            formeOrigine = { x: xNorm, y: yNorm };
            formeEnCours = {
                id: 'SH_' + Date.now(),
                type: outil.id,
                color: travauxOutils.getCouleurActive(),
                lineWidth: travauxOutils.getEpaisseurActive(),
                x1: xNorm, y1: yNorm,
                x2: xNorm, y2: yNorm
            };
            enDessin = true;
            return;
        }

        // Debut d'un trait (stylo ou surligneur)
        enDessin = true;
        const pression = e.pressure || 0.5;

        traitEnCours = {
            id: 'S_' + Date.now(),
            tool: outil.id,
            color: travauxOutils.getCouleurActive(),
            lineWidth: travauxOutils.getEpaisseurActive(),
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
        const outil = travauxOutils.getOutilActif();

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

        // Mode selection : drag en cours
        if (outil.type === 'selection') {
            if (e.pointerType !== 'pen' && e.pointerType !== 'mouse' && e.pointerType !== 'touch') return;
            e.preventDefault();

            if (!annotationSelectionnee || !deplacementOrigine) return;

            const dx = xNorm - deplacementOrigine.x;
            const dy = yNorm - deplacementOrigine.y;

            if (poigneeActive === 'move') {
                appliquerDeplacement(annotationSelectionnee, dx, dy);
                deplacementOrigine = { x: xNorm, y: yNorm };
            } else if (poigneeActive) {
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
            const epaisseurPression = travauxOutils.calculerEpaisseurPression(pression);
            const epaisseur = travauxOutils.calculerEpaisseurReelle(epaisseurPression);

            ctxAnnotation.save();
            ctxAnnotation.globalAlpha = outil.opacite || 1.0;
            ctxAnnotation.globalCompositeOperation = outil.composite || 'source-over';
            ctxAnnotation.strokeStyle = travauxOutils.getCouleurActive();
            ctxAnnotation.lineWidth = epaisseur;
            ctxAnnotation.lineCap = 'round';
            ctxAnnotation.lineJoin = 'round';
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

        const outil = travauxOutils.getOutilActif();

        // Mode selection : finaliser le drag
        if (outil.type === 'selection') {
            if (e.pointerType !== 'pen' && e.pointerType !== 'mouse' && e.pointerType !== 'touch') return;
            enDessin = false;

            if (annotationSelectionnee && donneesAvantModif && poigneeActive) {
                // Verifier si les donnees ont change
                const apres = clonerDonneesAnnotation(annotationSelectionnee);
                const avantStr = JSON.stringify(donneesAvantModif);
                const apresStr = JSON.stringify(apres);
                if (avantStr !== apresStr) {
                    empilerUndo('modification-annotation', {
                        type: annotationSelectionnee.type,
                        index: annotationSelectionnee.index,
                        avant: donneesAvantModif,
                        apres: apres
                    });
                    planifierSauvegarde();
                }
            }

            poigneeActive = null;
            deplacementOrigine = null;
            dimensionsOriginales = null;
            donneesAvantModif = null;
            return;
        }

        if (e.pointerType === 'touch') return;

        enDessin = false;

        // Forme terminee
        if (formeEnCours) {
            const donneesPage = obtenirDonneesPage();
            donneesPage.shapes.push(formeEnCours);
            empilerUndo('ajout-forme', formeEnCours);
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

    /**
     * Raccourcis clavier
     */
    function onKeyDown(e) {
        if (!annotationActive) return;

        // Ne pas intercepter les touches dans les champs de formulaire
        if (e.target.matches('input, select, textarea, [contenteditable]')) return;

        // Delete/Backspace : supprimer l'annotation selectionnee
        if ((e.key === 'Delete' || e.key === 'Backspace') && annotationSelectionnee) {
            e.preventDefault();
            supprimerSelection();
            return;
        }

        // Escape : deselectionner
        if (e.key === 'Escape' && annotationSelectionnee) {
            e.preventDefault();
            deselectionner();
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
        const tailleBase = 0.06; // 6% de la largeur du document
        const img = travauxOutils.getImageAutocollant(autocollantId);
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

        const donneesPage = obtenirDonneesPage();
        donneesPage.stickers.push(sticker);
        empilerUndo('ajout-autocollant', sticker);
        reRendreAnnotations();
        planifierSauvegarde();
    }

    /**
     * Dessine un autocollant sur le canvas
     * @param {Object} sticker - Donnees du sticker
     */
    function dessinerAutocollant(sticker) {
        const img = travauxOutils.getImageAutocollant(sticker.autocollantId);
        if (!img || !img.complete) return;

        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;

        const sx = sticker.x * w;
        const sy = sticker.y * h;
        const sw = sticker.width * w;
        const sh = sticker.height * h;

        ctxAnnotation.drawImage(img, sx, sy, sw, sh);
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
            case 'text': {
                const supprime = donneesPage.textAnnotations.splice(hit.index, 1)[0];
                empilerUndo('suppression-texte', supprime);
                break;
            }
            case 'sticker': {
                const supprime = donneesPage.stickers.splice(hit.index, 1)[0];
                empilerUndo('suppression-autocollant', supprime);
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
        const texte = prompt('Commentaire :');
        if (!texte || !texte.trim()) return;

        const annotation = {
            id: 'TXT_' + Date.now(),
            x: xNorm,
            y: yNorm,
            text: texte.trim(),
            fontSize: travauxOutils.getTailleTexte(),
            color: travauxOutils.getCouleurActive()
        };

        const donneesPage = obtenirDonneesPage();
        donneesPage.textAnnotations.push(annotation);
        empilerUndo('ajout-texte', annotation);
        reRendreAnnotations();
        planifierSauvegarde();
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
        const outil = travauxOutils.OUTILS[type];
        const taille = (outil.taille || 30) / canvasAnnotation.width;

        const forme = {
            id: 'SH_' + Date.now(),
            type: type,
            color: travauxOutils.getCouleurActive(),
            lineWidth: 3,
            x1: xNorm - taille / 2,
            y1: yNorm - taille / 2,
            x2: xNorm + taille / 2,
            y2: yNorm + taille / 2
        };

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
            case 'shape':
                return {
                    x1: Math.min(data.x1, data.x2),
                    y1: Math.min(data.y1, data.y2),
                    x2: Math.max(data.x1, data.x2),
                    y2: Math.max(data.y1, data.y2)
                };
            case 'text': {
                const fontSize = data.fontSize || 14;
                const w = canvasAnnotation?.width || 1000;
                const h = canvasAnnotation?.height || 1000;
                // Estimer la largeur du texte
                const ctx = ctxAnnotation || document.createElement('canvas').getContext('2d');
                ctx.font = `${fontSize}px sans-serif`;
                const textW = ctx.measureText(data.text).width / w;
                const textH = fontSize / h;
                return { x1: data.x, y1: data.y - textH, x2: data.x + textW, y2: data.y + textH * 0.3 };
            }
            case 'sticker':
                return { x1: data.x, y1: data.y, x2: data.x + data.width, y2: data.y + data.height };
            default:
                return { x1: 0, y1: 0, x2: 0, y2: 0 };
        }
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
            // Proximite des bords (pas de l'interieur)
            const nearX = Math.min(Math.abs(xNorm - bbox.x1), Math.abs(xNorm - bbox.x2));
            const nearY = Math.min(Math.abs(yNorm - bbox.y1), Math.abs(yNorm - bbox.y2));
            const insideX = xNorm >= bbox.x1 - seuil && xNorm <= bbox.x2 + seuil;
            const insideY = yNorm >= bbox.y1 - seuil && yNorm <= bbox.y2 + seuil;
            if (insideX && insideY && (nearX < seuil * 2 || nearY < seuil * 2)) {
                return { type: 'shape', index: i, data: forme, bbox: bbox };
            }
            // Pour les symboles (crochet, croix), accepter aussi le centre
            if ((forme.type === 'crochet' || forme.type === 'croix') && insideX && insideY) {
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
     * Detecte si le point est sur une poignee de la selection
     * @returns {string|null} 'nw' | 'ne' | 'sw' | 'se' | null
     */
    function detecterPoignee(xNorm, yNorm, bbox) {
        const taille = 12 / (canvasAnnotation?.width || 1000); // 12px en normalise
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
     * Dessine le cadre de selection et les poignees
     */
    function dessinerSelection() {
        if (!annotationSelectionnee || !ctxAnnotation || !canvasAnnotation) return;

        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const bbox = annotationSelectionnee.bbox;

        const x = bbox.x1 * w;
        const y = bbox.y1 * h;
        const bw = (bbox.x2 - bbox.x1) * w;
        const bh = (bbox.y2 - bbox.y1) * h;

        ctxAnnotation.save();

        // Cadre pointille bleu
        ctxAnnotation.strokeStyle = '#065dbb';
        ctxAnnotation.lineWidth = 2;
        ctxAnnotation.setLineDash([6, 4]);
        ctxAnnotation.strokeRect(x, y, bw, bh);
        ctxAnnotation.setLineDash([]);

        // Poignees aux 4 coins (8px, blanc avec bordure bleue)
        const taille = 8;
        const coins = [
            { x: x, y: y },
            { x: x + bw, y: y },
            { x: x, y: y + bh },
            { x: x + bw, y: y + bh }
        ];

        for (const coin of coins) {
            ctxAnnotation.fillStyle = '#ffffff';
            ctxAnnotation.strokeStyle = '#065dbb';
            ctxAnnotation.lineWidth = 2;
            ctxAnnotation.fillRect(coin.x - taille / 2, coin.y - taille / 2, taille, taille);
            ctxAnnotation.strokeRect(coin.x - taille / 2, coin.y - taille / 2, taille, taille);
        }

        ctxAnnotation.restore();
    }

    /**
     * Deselectionne l'annotation active
     */
    function deselectionner() {
        annotationSelectionnee = null;
        poigneeActive = null;
        deplacementOrigine = null;
        dimensionsOriginales = null;
        donneesAvantModif = null;
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

        const bbox = dimensionsOriginales;

        if (sel.type === 'shape') {
            switch (poignee) {
                case 'nw': sel.data.x1 = xNorm; sel.data.y1 = yNorm; break;
                case 'ne': sel.data.x2 = xNorm; sel.data.y1 = yNorm; break;
                case 'sw': sel.data.x1 = xNorm; sel.data.y2 = yNorm; break;
                case 'se': sel.data.x2 = xNorm; sel.data.y2 = yNorm; break;
            }
        } else if (sel.type === 'sticker') {
            switch (poignee) {
                case 'nw':
                    sel.data.width = (bbox.x2 - xNorm);
                    sel.data.height = (bbox.y2 - yNorm);
                    sel.data.x = xNorm;
                    sel.data.y = yNorm;
                    break;
                case 'ne':
                    sel.data.width = (xNorm - bbox.x1);
                    sel.data.height = (bbox.y2 - yNorm);
                    sel.data.y = yNorm;
                    break;
                case 'sw':
                    sel.data.width = (bbox.x2 - xNorm);
                    sel.data.height = (yNorm - bbox.y1);
                    sel.data.x = xNorm;
                    break;
                case 'se':
                    sel.data.width = (xNorm - bbox.x1);
                    sel.data.height = (yNorm - bbox.y1);
                    break;
            }
        } else if (sel.type === 'text') {
            // Ajuster fontSize proportionnellement
            const origW = bbox.x2 - bbox.x1;
            let newW;
            switch (poignee) {
                case 'ne': case 'se': newW = xNorm - bbox.x1; break;
                case 'nw': case 'sw': newW = bbox.x2 - xNorm; sel.data.x = xNorm; break;
                default: newW = origW;
            }
            if (origW > 0 && newW > 0) {
                const ratio = newW / origW;
                // Utiliser la fontSize originale (avant drag) pour eviter la croissance exponentielle
                const fontSizeOriginal = (donneesAvantModif && donneesAvantModif.fontSize) || sel.data.fontSize || 14;
                sel.data.fontSize = Math.max(8, Math.round(fontSizeOriginal * ratio));
            }
        }

        sel.bbox = calculerBBox(sel.type, sel.data);
    }

    /**
     * Clone les donnees d'une annotation pour undo
     */
    function clonerDonneesAnnotation(sel) {
        return JSON.parse(JSON.stringify(sel.data));
    }

    /**
     * Supprime l'annotation selectionnee
     */
    function supprimerSelection() {
        if (!annotationSelectionnee) return;

        const donneesPage = obtenirDonneesPage();
        const sel = annotationSelectionnee;

        switch (sel.type) {
            case 'stroke':
                donneesPage.strokes.splice(sel.index, 1);
                empilerUndo('suppression-trait', sel.data);
                break;
            case 'shape':
                donneesPage.shapes.splice(sel.index, 1);
                empilerUndo('suppression-forme', sel.data);
                break;
            case 'text':
                donneesPage.textAnnotations.splice(sel.index, 1);
                empilerUndo('suppression-texte', sel.data);
                break;
            case 'sticker':
                donneesPage.stickers.splice(sel.index, 1);
                empilerUndo('suppression-autocollant', sel.data);
                break;
        }

        annotationSelectionnee = null;
        reRendreAnnotations();
        planifierSauvegarde();
    }

    /**
     * Met a jour le curseur en fonction de la position pour le mode selection
     */
    function mettreAJourCurseurSelection(xNorm, yNorm) {
        if (!canvasAnnotation) return;

        if (annotationSelectionnee) {
            const poignee = detecterPoignee(xNorm, yNorm, annotationSelectionnee.bbox);
            if (poignee) {
                const curseurs = { nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize' };
                canvasAnnotation.style.cursor = curseurs[poignee];
                return;
            }
            // Dans la bbox = move
            const bbox = annotationSelectionnee.bbox;
            if (xNorm >= bbox.x1 && xNorm <= bbox.x2 && yNorm >= bbox.y1 && yNorm <= bbox.y2) {
                canvasAnnotation.style.cursor = 'move';
                return;
            }
        }

        // Survol d'une annotation = move
        const hit = trouverAnnotationAuPoint(xNorm, yNorm);
        canvasAnnotation.style.cursor = hit ? 'move' : 'default';
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

        const donneesPage = obtenirDonneesPage();

        // Dessiner les traits
        for (const trait of donneesPage.strokes) {
            dessinerTrait(trait);
        }

        // Dessiner les formes
        for (const forme of donneesPage.shapes) {
            dessinerForme(forme);
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
    }

    /**
     * Dessine un trait complet
     * @param {Object} trait - Donnees du trait
     */
    function dessinerTrait(trait) {
        if (!trait.points || trait.points.length < 2) return;

        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const outil = travauxOutils.OUTILS[trait.tool] || travauxOutils.OUTILS.stylo;
        const ratioResolution = w / travauxOutils.RESOLUTION_REFERENCE;

        ctxAnnotation.save();
        ctxAnnotation.globalAlpha = trait.opacity || 1.0;
        ctxAnnotation.globalCompositeOperation = outil.composite || 'source-over';
        ctxAnnotation.strokeStyle = trait.color;
        ctxAnnotation.lineCap = 'round';
        ctxAnnotation.lineJoin = 'round';

        ctxAnnotation.beginPath();
        const p0 = trait.points[0];
        ctxAnnotation.moveTo(p0.x * w, p0.y * h);

        for (let i = 1; i < trait.points.length; i++) {
            const p = trait.points[i];
            const epaisseurLogique = outil.sensiblePression
                ? travauxOutils.calculerEpaisseurPression(p.pressure) * (trait.lineWidth / outil.epaisseurDefaut)
                : trait.lineWidth;
            ctxAnnotation.lineWidth = epaisseurLogique * ratioResolution;
            ctxAnnotation.lineTo(p.x * w, p.y * h);
            ctxAnnotation.stroke();
            ctxAnnotation.beginPath();
            ctxAnnotation.moveTo(p.x * w, p.y * h);
        }

        ctxAnnotation.restore();
    }

    /**
     * Dessine une forme
     * @param {Object} forme - Donnees de la forme
     */
    function dessinerForme(forme) {
        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;
        const ratioResolution = w / travauxOutils.RESOLUTION_REFERENCE;

        ctxAnnotation.save();
        ctxAnnotation.strokeStyle = forme.color;
        ctxAnnotation.lineWidth = (forme.lineWidth || 2) * ratioResolution;
        ctxAnnotation.lineCap = 'round';

        const x1 = forme.x1 * w, y1 = forme.y1 * h;
        const x2 = forme.x2 * w, y2 = forme.y2 * h;

        switch (forme.type) {
            case 'rectangle':
                ctxAnnotation.strokeRect(x1, y1, x2 - x1, y2 - y1);
                break;

            case 'cercle': {
                const cx = (x1 + x2) / 2;
                const cy = (y1 + y2) / 2;
                const rx = Math.abs(x2 - x1) / 2;
                const ry = Math.abs(y2 - y1) / 2;
                ctxAnnotation.beginPath();
                ctxAnnotation.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctxAnnotation.stroke();
                break;
            }

            case 'fleche':
                dessinerFleche(ctxAnnotation, x1, y1, x2, y2);
                break;

            case 'crochet':
                dessinerCrochet(ctxAnnotation, x1, y1, x2, y2, forme.color);
                break;

            case 'croix':
                dessinerCroix(ctxAnnotation, x1, y1, x2, y2, forme.color);
                break;
        }

        ctxAnnotation.restore();
    }

    /**
     * Dessine une fleche
     */
    function dessinerFleche(ctx, x1, y1, x2, y2) {
        const headLen = 15;
        const angle = Math.atan2(y2 - y1, x2 - x1);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Pointe de fleche
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    /**
     * Dessine un crochet (checkmark)
     */
    function dessinerCrochet(ctx, x1, y1, x2, y2, color) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const size = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
        const ratioResolution = (canvasAnnotation ? canvasAnnotation.width : 1000) / travauxOutils.RESOLUTION_REFERENCE;

        ctx.strokeStyle = color || '#00AA00';
        ctx.lineWidth = 3 * ratioResolution;
        ctx.beginPath();
        ctx.moveTo(mx - size, my);
        ctx.lineTo(mx - size * 0.3, my + size * 0.8);
        ctx.lineTo(mx + size, my - size * 0.6);
        ctx.stroke();
    }

    /**
     * Dessine une croix (X)
     */
    function dessinerCroix(ctx, x1, y1, x2, y2, color) {
        const ratioResolution = (canvasAnnotation ? canvasAnnotation.width : 1000) / travauxOutils.RESOLUTION_REFERENCE;
        ctx.strokeStyle = color || '#FF0000';
        ctx.lineWidth = 3 * ratioResolution;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x2, y1);
        ctx.lineTo(x1, y2);
        ctx.stroke();
    }

    /**
     * Dessine un texte
     * @param {Object} texte - Donnees texte
     */
    function dessinerTexte(texte) {
        const w = canvasAnnotation.width;
        const h = canvasAnnotation.height;

        ctxAnnotation.save();
        ctxAnnotation.font = `${texte.fontSize || 14}px sans-serif`;
        ctxAnnotation.fillStyle = texte.color || '#FF0000';
        ctxAnnotation.fillText(texte.text, texte.x * w, texte.y * h);
        ctxAnnotation.restore();
    }

    /**
     * Dessine une forme temporaire (pendant le dessin)
     * @param {Object} forme - Donnees de la forme
     */
    function dessinerFormeTemporaire(forme) {
        dessinerForme(forme);
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
        }

        // Deselectionner apres undo
        annotationSelectionnee = null;
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
        }

        // Deselectionner apres redo
        annotationSelectionnee = null;
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
        }, SAUVEGARDE_DELAI);
    }

    /**
     * Sauvegarde l'annotation courante
     */
    function sauvegarderAnnotation() {
        if (!annotationCourante) return;

        annotationCourante.dateModification = new Date().toISOString();
        travauxStockage.sauvegarderAnnotationFichier(annotationCourante);
        console.log('[Travaux-Annotation] Annotation sauvegardee');
    }

    /**
     * Efface toutes les annotations de la page courante
     */
    function effacerPage() {
        if (!annotationCourante) return;

        const page = travauxVisionneuse.getPageActuelle() - 1;
        annotationCourante.pages[page] = {
            strokes: [],
            textAnnotations: [],
            shapes: [],
            stickers: []
        };

        pileUndo = [];
        pileRedo = [];

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

    window.travauxAnnotation = {
        initialiser: initialiserAnnotation,
        // Mode
        activerAnnotation: activerAnnotation,
        desactiverAnnotation: desactiverAnnotation,
        basculerAnnotation: basculerAnnotation,
        estActif: estActif,
        // Undo/Redo
        annuler: annuler,
        retablir: retablir,
        // Actions
        effacerPage: effacerPage,
        sauvegarderAnnotation: sauvegarderAnnotation,
        // Accesseurs
        getAnnotationCourante: getAnnotationCourante,
        reRendreAnnotations: reRendreAnnotations
    };

})();
