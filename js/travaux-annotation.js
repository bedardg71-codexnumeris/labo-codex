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

    /* ===============================
       INITIALISATION
       =============================== */

    /**
     * Initialise le moteur d'annotation
     */
    function initialiserAnnotation() {
        // Ecouter le rendu de page pour synchroniser
        window.addEventListener('travaux-page-rendue', (e) => {
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
                canvasAnnotation.style.display = 'none';
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
            if (canvas) canvas.style.display = 'none';
            return;
        }

        // Il y a des annotations - les afficher en lecture seule
        canvasAnnotation = document.getElementById('travaux-canvas-annotation');
        if (!canvasAnnotation) return;

        ctxAnnotation = canvasAnnotation.getContext('2d');
        annotationCourante = annotation;
        fichierId = fichierActuel.id;

        dimensionnerCanvasAnnotation(width, height);
        canvasAnnotation.style.display = 'block';
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

        canvasAnnotation.style.display = 'block';
        canvasAnnotation.style.pointerEvents = 'auto';

        // Afficher la palette
        const palette = document.getElementById('travaux-palette-container');
        if (palette) {
            palette.innerHTML = travauxOutils.genererHTMLPalette();
            palette.style.display = 'block';
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

        // Garder le canvas visible en lecture seule (annotations restent affichees)
        if (canvasAnnotation) {
            canvasAnnotation.style.pointerEvents = 'none';
            // NE PAS cacher le canvas - les annotations doivent rester visibles
        }

        const palette = document.getElementById('travaux-palette-container');
        if (palette) {
            palette.style.display = 'none';
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
                shapes: []
            };
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
        // Rejet de paume: ignorer le touch en mode annotation (seulement pen et mouse)
        if (e.pointerType === 'touch') {
            return;
        }

        e.preventDefault();

        const rect = canvasAnnotation.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Coordonnees normalisees (0-1)
        const xNorm = x / canvasAnnotation.width;
        const yNorm = y / canvasAnnotation.height;

        const outil = travauxOutils.getOutilActif();

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
        if (!enDessin) return;
        if (e.pointerType === 'touch') return;

        e.preventDefault();

        const rect = canvasAnnotation.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xNorm = x / canvasAnnotation.width;
        const yNorm = y / canvasAnnotation.height;

        const outil = travauxOutils.getOutilActif();

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

            // Dessiner le segment
            const epaisseur = travauxOutils.calculerEpaisseurPression(pression);

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
       GOMME
       =============================== */

    /**
     * Efface le trait le plus proche du point donne
     * @param {number} xNorm - X normalise
     * @param {number} yNorm - Y normalise
     */
    function effacerTraitAuContact(xNorm, yNorm) {
        const donneesPage = obtenirDonneesPage();
        const seuil = 0.02; // Distance de detection

        // Chercher un trait a effacer
        for (let i = donneesPage.strokes.length - 1; i >= 0; i--) {
            const trait = donneesPage.strokes[i];
            for (const point of trait.points) {
                const dist = Math.sqrt(Math.pow(point.x - xNorm, 2) + Math.pow(point.y - yNorm, 2));
                if (dist < seuil) {
                    // Supprimer le trait
                    const supprime = donneesPage.strokes.splice(i, 1)[0];
                    empilerUndo('suppression-trait', supprime);
                    reRendreAnnotations();
                    planifierSauvegarde();
                    return;
                }
            }
        }

        // Chercher une forme a effacer
        for (let i = donneesPage.shapes.length - 1; i >= 0; i--) {
            const forme = donneesPage.shapes[i];
            const cx = (forme.x1 + forme.x2) / 2;
            const cy = (forme.y1 + forme.y2) / 2;
            const dist = Math.sqrt(Math.pow(cx - xNorm, 2) + Math.pow(cy - yNorm, 2));
            if (dist < seuil * 3) {
                const supprime = donneesPage.shapes.splice(i, 1)[0];
                empilerUndo('suppression-forme', supprime);
                reRendreAnnotations();
                planifierSauvegarde();
                return;
            }
        }
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
            const epaisseur = outil.sensiblePression
                ? travauxOutils.calculerEpaisseurPression(p.pressure) * (trait.lineWidth / travauxOutils.OUTILS[trait.tool].epaisseurDefaut)
                : trait.lineWidth;
            ctxAnnotation.lineWidth = epaisseur;
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

        ctxAnnotation.save();
        ctxAnnotation.strokeStyle = forme.color;
        ctxAnnotation.lineWidth = forme.lineWidth || 2;
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

        ctx.strokeStyle = color || '#00AA00';
        ctx.lineWidth = 3;
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
        ctx.strokeStyle = color || '#FF0000';
        ctx.lineWidth = 3;
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
            case 'suppression-trait':
                donneesPage.strokes.push(action.donnees);
                break;
            case 'suppression-forme':
                donneesPage.shapes.push(action.donnees);
                break;
        }

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
            annotationCourante.pages[page] = { strokes: [], textAnnotations: [], shapes: [] };
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
            case 'suppression-trait':
                donneesPage.strokes = donneesPage.strokes.filter(s => s.id !== action.donnees.id);
                break;
            case 'suppression-forme':
                donneesPage.shapes = donneesPage.shapes.filter(s => s.id !== action.donnees.id);
                break;
        }

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
            shapes: []
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
