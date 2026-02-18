/* ===============================
   MODULE: TRAVAUX - PREPARATION
   Poste de preparation des images AVANT import.
   Outils semi-automatiques : rotation, crop, perspective,
   luminosite, contraste, niveaux de gris.

   Pile de transformations non-destructive.
   Deux modes de rendu : apercu interactif (1600px) et final (pleine resolution).

   DEPENDANCES:
   - travaux-import.js (fichiersEnAttente)
   - travaux-stockage.js (formaterTaille)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    const TAILLE_APERCU = 1600;       // Copie de travail max px
    const MESH_N = 8;                 // Subdivision perspective apercu
    const POIGNEE_TAILLE = 44;        // px (Apple HIG)
    const LOUPE_TAILLE = 100;         // px
    const LOUPE_ZOOM = 2;
    const ROTATION_FINE_MIN = -15;
    const ROTATION_FINE_MAX = 15;
    const LUMINOSITE_MIN = -100;
    const LUMINOSITE_MAX = 100;
    const CONTRASTE_MIN = -100;
    const CONTRASTE_MAX = 100;
    const BATCH_SIZE = 10000;         // Pixels par lot pour le rendu final

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let actif = false;
    let fichiers = [];                // Copies locales des fichiers en attente
    let indexActuel = 0;              // Fichier courant
    let imageOriginale = null;        // Image pleine resolution du fichier courant
    let imageTravail = null;          // Canvas copie de travail (1600px)
    let canvasApercu = null;          // Canvas d'apercu visible
    let ctxApercu = null;
    let operations = [];              // Pile d'operations pour le fichier courant

    // Etat des outils interactifs
    let outilActif = null;            // 'crop' | 'perspective' | null
    let cropRect = null;              // {x, y, width, height} en fractions 0-1
    let perspectiveCorners = null;    // [{x,y}, {x,y}, {x,y}, {x,y}] en fractions 0-1
    let poigneeActive = -1;           // Index de la poignee draggee (-1 = aucune)
    let cropDragState = null;         // Etat du drag pour le crop

    // Assemblage multi-pages
    let selections = new Set();       // Indices des fichiers selectionnes pour grouper
    let documentGroups = new Map();   // Map<groupId, [indices]>

    // Callbacks
    let onTerminer = null;            // Callback quand l'utilisateur confirme

    /* ===============================
       ENTREE / SORTIE DU POSTE
       =============================== */

    /**
     * Ouvre le poste de preparation avec les fichiers en attente
     * @param {Array} fichiersEnAttente - Liste des fichiers prepares par travaux-import
     * @param {Function} callback - Appele avec les blobs traites a la confirmation
     */
    function ouvrir(fichiersEnAttente, callback) {
        if (!fichiersEnAttente || fichiersEnAttente.length === 0) return;

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
        const modal = document.getElementById('travaux-preparation-modal');
        if (modal) modal.remove();
    }

    /**
     * Passe l'import sans preparation
     */
    function passer() {
        fermer();
        // Les blobs originaux restent inchanges dans fichiersEnAttente
    }

    /**
     * Confirme et applique les transformations
     */
    async function confirmer() {
        // Appliquer le rendu final sur chaque fichier modifie
        for (let i = 0; i < fichiers.length; i++) {
            const f = fichiers[i];
            if (f.operations.length > 0) {
                const blobFinal = await renduFinal(f);
                if (blobFinal && onTerminer) {
                    // Remplacer le blob dans la file d'attente
                    const original = travauxImport.obtenirFileDAttente()[i];
                    if (original) {
                        original.fichier = blobFinal;
                        original.tailleFichier = blobFinal.size;
                    }
                }
            }
        }

        fermer();

        // Rafraichir l'UI d'import
        if (typeof window.rafraichirImportTravaux === 'function') {
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
        if (canvasApercu) {
            canvasApercu.width = 0;
            canvasApercu.height = 0;
        }
        imageOriginale = null;
        operations = [];
        outilActif = null;
        cropRect = null;
        perspectiveCorners = null;
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

        // Charger l'image
        const blob = f.fichier;
        if (!blob) return;

        imageOriginale = await chargerImage(blob);
        imageTravail = creerCopieTravail(imageOriginale);

        mettreAJourApercu();
        mettreAJourMiniatures();
        mettreAJourNavigation();
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
     * Ajoute une operation a la pile
     * @param {Object} op - L'operation
     */
    function ajouterOperation(op) {
        operations.push(op);
        fichiers[indexActuel].operations = operations;
        mettreAJourApercu();
    }

    /**
     * Annule la derniere operation (undo)
     */
    function annulerDerniere() {
        if (operations.length === 0) return;
        operations.pop();
        fichiers[indexActuel].operations = operations;
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
        mettreAJourApercu();
    }

    /* ===============================
       RENDU APERCU (interactif)
       =============================== */

    /**
     * Applique toutes les operations sur la copie de travail et affiche l'apercu
     */
    function mettreAJourApercu() {
        if (!imageTravail || !canvasApercu) return;

        const ctx = ctxApercu;
        let source = imageTravail;
        let w = imageTravail.width;
        let h = imageTravail.height;

        // Appliquer les operations une par une
        let tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        let tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(source, 0, 0);

        for (const op of operations) {
            const result = appliquerOperationApercu(tempCanvas, op);
            tempCanvas = result;
        }

        // Construire la chaine de filtres CSS
        const filtres = construireFiltresCSS(operations);

        // Ajuster le canvas d'apercu
        canvasApercu.width = tempCanvas.width;
        canvasApercu.height = tempCanvas.height;
        ctx.clearRect(0, 0, canvasApercu.width, canvasApercu.height);

        if (filtres) {
            ctx.filter = filtres;
        }

        ctx.drawImage(tempCanvas, 0, 0);
        ctx.filter = 'none';

        // Dessiner les poignees si un outil est actif
        if (outilActif === 'crop' && cropRect) {
            dessinerCrop(ctx, canvasApercu.width, canvasApercu.height);
        }
        if (outilActif === 'perspective' && perspectiveCorners) {
            dessinerPerspective(ctx, canvasApercu.width, canvasApercu.height);
        }

        // Liberer le canvas temporaire
        tempCanvas.width = 0;
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
                return appliquerPerspectiveMesh(source, op.corners);
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
    function appliquerPerspectiveMesh(source, corners) {
        const w = source.width;
        const h = source.height;
        const result = document.createElement('canvas');
        result.width = w;
        result.height = h;
        const ctx = result.getContext('2d');

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

        // Appliquer les operations geometriques
        for (const op of fichierData.operations) {
            if (op.type === 'perspective') {
                canvas = await renduPerspectivePixel(canvas, op.corners);
            } else if (op.type === 'brightness' || op.type === 'contrast' || op.type === 'grayscale') {
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
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                canvas.width = 0;
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
    function renduPerspectivePixel(source, corners) {
        return new Promise(resolve => {
            const w = source.width;
            const h = source.height;
            const srcData = source.getContext('2d').getImageData(0, 0, w, h);
            const srcPixels = srcData.data;

            const result = document.createElement('canvas');
            result.width = w;
            result.height = h;
            const dstData = result.getContext('2d').createImageData(w, h);
            const dstPixels = dstData.data;

            const c = corners.map(p => ({ x: p.x * w, y: p.y * h }));
            let pixelIndex = 0;
            const totalPixels = w * h;

            function traiterLot() {
                const fin = Math.min(pixelIndex + BATCH_SIZE, totalPixels);

                for (; pixelIndex < fin; pixelIndex++) {
                    const dx = pixelIndex % w;
                    const dy = Math.floor(pixelIndex / w);
                    const u = dx / w;
                    const v = dy / h;

                    // Position source par interpolation bilineaire
                    const src = interpBilineaire(c, u, v);

                    // Echantillonnage bilineaire (4 pixels voisins)
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
                    result.getContext('2d').putImageData(dstData, 0, 0);
                    resolve(result);
                }
            }

            traiterLot();
        });
    }

    /* ===============================
       DESSIN DES OUTILS INTERACTIFS
       =============================== */

    /**
     * Dessine le rectangle de crop avec les poignees
     */
    function dessinerCrop(ctx, w, h) {
        if (!cropRect) return;

        const x = cropRect.x * w;
        const y = cropRect.y * h;
        const rw = cropRect.width * w;
        const rh = cropRect.height * h;

        // Zone sombre autour du crop
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, w, y);                          // haut
        ctx.fillRect(0, y, x, rh);                          // gauche
        ctx.fillRect(x + rw, y, w - x - rw, rh);            // droite
        ctx.fillRect(0, y + rh, w, h - y - rh);             // bas

        // Bordure du crop
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, rw, rh);

        // Poignees aux 4 coins
        const coins = [
            { px: x, py: y },
            { px: x + rw, py: y },
            { px: x + rw, py: y + rh },
            { px: x, py: y + rh }
        ];

        ctx.fillStyle = '#fff';
        coins.forEach(c => {
            ctx.fillRect(c.px - 6, c.py - 6, 12, 12);
        });
    }

    /**
     * Dessine les poignees de perspective
     */
    function dessinerPerspective(ctx, w, h) {
        if (!perspectiveCorners) return;

        const points = perspectiveCorners.map(p => ({
            x: p.x * w,
            y: p.y * h
        }));

        // Lignes du quadrilatere
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < 4; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Poignees 44x44px
        const demiPoignee = POIGNEE_TAILLE / 2;
        points.forEach((p, i) => {
            ctx.fillStyle = i === poigneeActive ? 'rgba(0, 150, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = 'rgba(0, 100, 200, 1)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(p.x, p.y, demiPoignee / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    /* ===============================
       INTERACTIONS POINTER
       =============================== */

    /**
     * Configure les Pointer Events sur le canvas d'apercu
     */
    function configurerInteractions() {
        if (!canvasApercu) return;

        canvasApercu.addEventListener('pointerdown', onPointerDown);
        canvasApercu.addEventListener('pointermove', onPointerMove);
        canvasApercu.addEventListener('pointerup', onPointerUp);
        canvasApercu.addEventListener('pointercancel', onPointerUp);
    }

    function getCanvasPos(e) {
        const rect = canvasApercu.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
        };
    }

    function onPointerDown(e) {
        const pos = getCanvasPos(e);

        if (outilActif === 'perspective' && perspectiveCorners) {
            // Detecter si on touche une poignee
            const seuil = POIGNEE_TAILLE / (2 * canvasApercu.getBoundingClientRect().width);
            for (let i = 0; i < 4; i++) {
                const dx = pos.x - perspectiveCorners[i].x;
                const dy = pos.y - perspectiveCorners[i].y;
                if (Math.sqrt(dx * dx + dy * dy) < seuil) {
                    poigneeActive = i;
                    canvasApercu.setPointerCapture(e.pointerId);
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
                // Detecter coin de resize ou zone de deplacement
                const sx = canvasApercu.getBoundingClientRect().width;
                const seuil = 20 / sx;

                const coins = [
                    { x: cropRect.x, y: cropRect.y },
                    { x: cropRect.x + cropRect.width, y: cropRect.y },
                    { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
                    { x: cropRect.x, y: cropRect.y + cropRect.height }
                ];

                let coinTouche = -1;
                for (let i = 0; i < 4; i++) {
                    const dx = Math.abs(pos.x - coins[i].x);
                    const dy = Math.abs(pos.y - coins[i].y);
                    if (dx < seuil && dy < seuil) {
                        coinTouche = i;
                        break;
                    }
                }

                if (coinTouche >= 0) {
                    cropDragState = { mode: 'resize', corner: coinTouche, startX: pos.x, startY: pos.y, original: { ...cropRect } };
                } else if (pos.x >= cropRect.x && pos.x <= cropRect.x + cropRect.width &&
                           pos.y >= cropRect.y && pos.y <= cropRect.y + cropRect.height) {
                    cropDragState = { mode: 'move', startX: pos.x, startY: pos.y, original: { ...cropRect } };
                } else {
                    cropRect = { x: pos.x, y: pos.y, width: 0, height: 0 };
                    cropDragState = { startX: pos.x, startY: pos.y, mode: 'create' };
                }
            }
            canvasApercu.setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e) {
        const pos = getCanvasPos(e);

        if (outilActif === 'perspective' && poigneeActive >= 0) {
            perspectiveCorners[poigneeActive] = {
                x: Math.max(0, Math.min(1, pos.x)),
                y: Math.max(0, Math.min(1, pos.y))
            };
            mettreAJourApercu();
            return;
        }

        if (outilActif === 'crop' && cropDragState) {
            if (cropDragState.mode === 'create') {
                cropRect.width = Math.max(0, pos.x - cropDragState.startX);
                cropRect.height = Math.max(0, pos.y - cropDragState.startY);
            } else if (cropDragState.mode === 'move') {
                const dx = pos.x - cropDragState.startX;
                const dy = pos.y - cropDragState.startY;
                cropRect.x = Math.max(0, Math.min(1 - cropDragState.original.width, cropDragState.original.x + dx));
                cropRect.y = Math.max(0, Math.min(1 - cropDragState.original.height, cropDragState.original.y + dy));
            } else if (cropDragState.mode === 'resize') {
                const o = cropDragState.original;
                const corner = cropDragState.corner;
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
            mettreAJourApercu();
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

    function appliquerPerspective() {
        if (!perspectiveCorners) return;
        ajouterOperation({
            type: 'perspective',
            corners: perspectiveCorners.map(p => ({ ...p }))
        });
        outilActif = null;
        perspectiveCorners = null;
    }

    function changerLuminosite(value) {
        // Retirer la derniere luminosite s'il y en a une
        if (operations.length > 0 && operations[operations.length - 1].type === 'brightness') {
            operations.pop();
        }
        if (value !== 0) {
            ajouterOperation({ type: 'brightness', value: parseInt(value) });
        } else {
            fichiers[indexActuel].operations = operations;
            mettreAJourApercu();
        }
    }

    function changerContraste(value) {
        if (operations.length > 0 && operations[operations.length - 1].type === 'contrast') {
            operations.pop();
        }
        if (value !== 0) {
            ajouterOperation({ type: 'contrast', value: parseInt(value) });
        } else {
            fichiers[indexActuel].operations = operations;
            mettreAJourApercu();
        }
    }

    function basculerNiveauxDeGris() {
        // Toggle : si la derniere op est grayscale, la retirer
        const derniere = operations[operations.length - 1];
        if (derniere && derniere.type === 'grayscale') {
            operations.pop();
            fichiers[indexActuel].operations = operations;
            mettreAJourApercu();
        } else {
            ajouterOperation({ type: 'grayscale', active: true });
        }
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

        const groupeId = 'GRP_' + Date.now();
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
        const nav = document.getElementById('prep-navigation');
        if (nav) {
            nav.textContent = `${indexActuel + 1} / ${fichiers.length}`;
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
    }

    /* ===============================
       MISE A JOUR MINIATURES
       =============================== */

    function mettreAJourMiniatures() {
        const conteneur = document.getElementById('prep-miniatures');
        if (!conteneur) return;

        let html = '';
        fichiers.forEach((f, i) => {
            const actif = i === indexActuel ? ' actif' : '';
            const selectionne = selections.has(i) ? ' selectionne' : '';
            const groupe = f.groupeId ? ` groupe-${f.groupeId}` : '';
            const modifie = f.operations.length > 0 ? ' modifie' : '';

            html += `
                <div class="prep-miniature${actif}${selectionne}${modifie}${groupe}"
                     data-index="${i}"
                     onclick="travauxPreparation.chargerFichier(${i})">
                    <div class="prep-mini-nom">${echapperHtml(f.nomFichier || '')}</div>
                    ${f.operations.length > 0 ? '<span class="prep-mini-badge">*</span>' : ''}
                    <button class="prep-mini-select" onclick="event.stopPropagation(); travauxPreparation.toggleSelection(${i})" title="Selectionner pour grouper">
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
        modal.className = 'modal-overlay actif';
        modal.style.cssText = 'z-index:9999; display:flex; align-items:stretch; justify-content:center; padding:0;';

        modal.innerHTML = `
            <div class="prep-layout" style="display:flex; width:100%; height:100%; background:var(--fond-principal); flex-direction:column;">
                <!-- Barre du haut -->
                <div class="prep-header" style="display:flex; align-items:center; justify-content:space-between; padding:8px 16px; border-bottom:1px solid var(--bordure-legere); flex-shrink:0;">
                    <button class="btn btn-petit" onclick="travauxPreparation.fermer()">&#x2190; Retour</button>
                    <h3 style="margin:0; font-size:1.1rem;">Preparation des travaux</h3>
                    <div>
                        <button class="btn btn-secondaire" onclick="travauxPreparation.passer()">Passer</button>
                        <button class="btn btn-principal" onclick="travauxPreparation.confirmerTout()">Appliquer et importer</button>
                    </div>
                </div>

                <!-- Corps principal -->
                <div class="prep-body" style="display:flex; flex:1; overflow:hidden;">
                    <!-- Miniatures (gauche) -->
                    <div class="prep-panel-miniatures" style="width:180px; overflow-y:auto; border-right:1px solid var(--bordure-legere); flex-shrink:0;">
                        <div id="prep-miniatures"></div>
                        <div style="padding:8px;">
                            <button class="btn btn-petit" onclick="travauxPreparation.grouperSelection()" id="prep-btn-grouper" style="width:100%; margin-top:4px;">Grouper selection</button>
                        </div>
                    </div>

                    <!-- Canvas apercu (centre) -->
                    <div class="prep-panel-apercu" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:auto; background:var(--fond-secondaire); position:relative;">
                        <canvas id="prep-canvas-apercu" style="max-width:100%; max-height:100%; object-fit:contain;"></canvas>
                        <!-- Navigation -->
                        <div style="display:flex; align-items:center; gap:12px; padding:8px; flex-shrink:0;">
                            <button class="btn-icon" id="prep-btn-prec" onclick="travauxPreparation.fichierPrecedent()">&#x2190;</button>
                            <span id="prep-navigation">1 / 1</span>
                            <button class="btn-icon" id="prep-btn-suiv" onclick="travauxPreparation.fichierSuivant()">&#x2192;</button>
                            <span id="prep-nb-ops" class="texte-muted" style="margin-left:8px;"></span>
                        </div>
                    </div>

                    <!-- Outils (droite) -->
                    <div class="prep-panel-outils" style="width:220px; overflow-y:auto; border-left:1px solid var(--bordure-legere); padding:12px; flex-shrink:0;">
                        <h4 style="margin:0 0 12px 0; font-size:0.95rem;">Outils</h4>

                        <!-- Rotation 90 -->
                        <div class="prep-outil-groupe">
                            <div style="display:flex; gap:4px;">
                                <button class="btn btn-secondaire btn-petit" onclick="travauxPreparation.rotation90CCW()" title="Rotation 90 anti-horaire" style="flex:1;">&#x21BA; 90°</button>
                                <button class="btn btn-secondaire btn-petit" onclick="travauxPreparation.rotation90CW()" title="Rotation 90 horaire" style="flex:1;">&#x21BB; 90°</button>
                            </div>
                        </div>

                        <!-- Rotation fine -->
                        <div class="prep-outil-groupe">
                            <label style="font-size:0.85rem;">Rotation fine</label>
                            <input type="range" id="prep-rotation-fine" min="${ROTATION_FINE_MIN}" max="${ROTATION_FINE_MAX}" value="0" step="0.5"
                                   oninput="travauxPreparation.rotationFine(this.value)" style="width:100%;">
                            <span id="prep-rotation-valeur" class="texte-muted" style="font-size:0.8rem;">0°</span>
                        </div>

                        <!-- Recadrage -->
                        <div class="prep-outil-groupe">
                            <button class="btn btn-secondaire btn-petit" onclick="travauxPreparation.activerCrop()" style="width:100%;">Recadrage</button>
                            <button class="btn btn-principal btn-petit" id="prep-btn-appliquer-crop" onclick="travauxPreparation.appliquerCrop()" style="width:100%; display:none;">Appliquer crop</button>
                        </div>

                        <!-- Perspective -->
                        <div class="prep-outil-groupe">
                            <button class="btn btn-secondaire btn-petit" onclick="travauxPreparation.activerPerspective()" style="width:100%;">Perspective</button>
                            <button class="btn btn-principal btn-petit" id="prep-btn-appliquer-persp" onclick="travauxPreparation.appliquerPerspective()" style="width:100%; display:none;">Appliquer perspective</button>
                        </div>

                        <!-- Luminosite -->
                        <div class="prep-outil-groupe">
                            <label style="font-size:0.85rem;">Luminosite</label>
                            <input type="range" id="prep-luminosite" min="${LUMINOSITE_MIN}" max="${LUMINOSITE_MAX}" value="0"
                                   oninput="travauxPreparation.changerLuminosite(this.value)" style="width:100%;">
                        </div>

                        <!-- Contraste -->
                        <div class="prep-outil-groupe">
                            <label style="font-size:0.85rem;">Contraste</label>
                            <input type="range" id="prep-contraste" min="${CONTRASTE_MIN}" max="${CONTRASTE_MAX}" value="0"
                                   oninput="travauxPreparation.changerContraste(this.value)" style="width:100%;">
                        </div>

                        <!-- Niveaux de gris -->
                        <div class="prep-outil-groupe">
                            <button class="btn btn-secondaire btn-petit" onclick="travauxPreparation.basculerNiveauxDeGris()" style="width:100%;">Niveaux de gris</button>
                        </div>

                        <hr style="border:none; border-top:1px solid var(--bordure-legere); margin:12px 0;">

                        <!-- Actions -->
                        <div class="prep-outil-groupe">
                            <button class="btn btn-petit" onclick="travauxPreparation.annulerDerniere()" style="width:100%;">Annuler derniere op.</button>
                            <button class="btn btn-petit" onclick="travauxPreparation.reinitialiser()" style="width:100%; margin-top:4px;">Reinitialiser</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Recuperer le canvas
        canvasApercu = document.getElementById('prep-canvas-apercu');
        ctxApercu = canvasApercu.getContext('2d');

        // Configurer les interactions
        configurerInteractions();

        // Observer les changements d'outil pour montrer/masquer les boutons
        const observer = new MutationObserver(() => {
            const btnCrop = document.getElementById('prep-btn-appliquer-crop');
            const btnPersp = document.getElementById('prep-btn-appliquer-persp');
            if (btnCrop) btnCrop.style.display = outilActif === 'crop' ? 'block' : 'none';
            if (btnPersp) btnPersp.style.display = outilActif === 'perspective' ? 'block' : 'none';
        });

        // Mettre a jour les boutons d'outils periodiquement via requestAnimationFrame
        function verifierBoutonsOutils() {
            if (!actif) return;
            const btnCrop = document.getElementById('prep-btn-appliquer-crop');
            const btnPersp = document.getElementById('prep-btn-appliquer-persp');
            if (btnCrop) btnCrop.style.display = outilActif === 'crop' ? 'block' : 'none';
            if (btnPersp) btnPersp.style.display = outilActif === 'perspective' ? 'block' : 'none';

            // Mise a jour valeur rotation fine
            const rotSlider = document.getElementById('prep-rotation-fine');
            const rotVal = document.getElementById('prep-rotation-valeur');
            if (rotSlider && rotVal) {
                rotVal.textContent = rotSlider.value + '°';
            }
        }

        // Appeler periodiquement
        setInterval(verifierBoutonsOutils, 200);
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
        activerCrop: activerCrop,
        appliquerCrop: appliquerCrop,
        activerPerspective: activerPerspective,
        appliquerPerspective: appliquerPerspective,
        changerLuminosite: changerLuminosite,
        changerContraste: changerContraste,
        basculerNiveauxDeGris: basculerNiveauxDeGris,
        annulerDerniere: annulerDerniere,
        reinitialiser: reinitialiser,
        // Assemblage
        toggleSelection: toggleSelection,
        grouperSelection: grouperSelection,
        degrouper: degrouper,
        // Etat
        get actif() { return actif; }
    };

    console.log('[Travaux-Preparation] Module charge');

})();
