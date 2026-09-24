/* ===============================
   MODULE: TRAVAUX - EXPORT PDF
   Genere un PDF unique : pages annotees + page de synthese

   DEPENDANCES:
   - libs/jspdf.umd.min.js (jsPDF)
   - libs/pdf.min.js (PDF.js - rendu des pages)
   - travaux-stockage.js (blobs, annotations)
   - travaux-visionneuse.js (fichier actuel, pdfDocument)
   - travaux-outils.js (images autocollants)
   =============================== */

(function() {
    'use strict';

    const EXPORT_SCALE = 2.0; // Rendu a 2x pour qualite d'impression


    /* ===============================
       EXPORT PDF PRINCIPAL
       =============================== */

    /**
     * Genere un document jsPDF complet (pages annotees + synthese) sans telecharger
     * @param {string} fichierId - ID du fichier
     * @returns {Promise<{doc: Object, nomSortie: string, fichierId: string}>}
     */
    // Lot 2 (3 sept. 2026) — la grille de la copie en cours d'export, posée à
    // l'entrée (`genererDocPDF`, que la prévisualisation emprunte aussi) et lue
    // par `dessinerForme` : le numéro d'un code sur le PDF est celui de la liste
    // de CETTE copie, pas de la copie ouverte à l'écran. Null = repli (position
    // dans l'ordre, comme hier).
    let _grilleExport = null;
    function _poserGrilleExport(fichier) {
        _grilleExport = (typeof codesAnnotation !== 'undefined' && fichier) ? codesAnnotation.grilleDeCopie(fichier) : null;
    }

    async function genererDocPDF(fichierId, productionIdOverride) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) throw new Error('Fichier introuvable');
        _poserGrilleExport(fichier);

        const blob = await travauxStockage.recupererBlob(fichierId);
        if (!blob) throw new Error('Blob introuvable');

        const annotation = travauxStockage.obtenirAnnotationFichier(fichierId);

        let doc;
        if (fichier.typeMIME === 'application/pdf') {
            doc = await exporterDepuisPDF(blob, annotation);
        } else {
            doc = await exporterDepuisImage(blob, annotation);
        }

        // #565 — le statut est REMONTÉ à l'appelant : une copie livrée sans sa
        // page de rétroaction doit pouvoir être nommée dans le bilan d'export,
        // au lieu de partir sur Léa sans que personne ne le sache.
        const synthese = await ajouterPageSynthese(doc, fichier, productionIdOverride);

        // ✅ ANONYMISATION (Tier 0.2) : anonymiser le nom du fichier de sortie
        const nomFichierAff = typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA) : fichier.nomFichier;
        const nomSortie = nomFichierAff.replace(/\.[^.]+$/, '') + '_annote.pdf';
        return { doc, nomSortie, fichierId, synthese };
    }

    /**
     * Exporte le fichier courant en PDF avec annotations et synthese
     * @param {string} fichierId - ID du fichier a exporter
     */
    async function exporterPDF(fichierId) {
        if (!fichierId) {
            alert('Aucun fichier sélectionné.');
            return;
        }

        const _hasProg = typeof window.afficherProgression === 'function';
        if (_hasProg) {
            window.afficherProgression('Export PDF');
            window.majProgression(20, 'Rendu des pages annotées…');
        }

        try {
            const { doc, nomSortie, synthese } = await genererDocPDF(fichierId);
            if (_hasProg) window.majProgression(90, 'Téléchargement…');
            doc.save(nomSortie);
            travauxStockage.marquerExporte(fichierId);
            // #674 — le PDF est livré, mais si sa rétroaction ne conclut pas, on le DIT.
            if (synthese && synthese.ajoutee && synthese.avertissement) {
                alert('Le PDF a été exporté, mais ' + synthese.avertissement + '.');
            }
        } catch (e) {
            console.error('[Travaux-Export] Erreur export PDF:', e);
            alert('Erreur lors de l\'export PDF. Voir la console.');
        } finally {
            if (_hasProg) window.masquerProgression();
        }
    }

    /* ===============================
       EXPORT DEPUIS PDF
       =============================== */

    /**
     * Cree un jsPDF a partir d'un blob PDF avec annotations
     * @param {Blob} blob - Le blob PDF original
     * @param {Object|null} annotation - Les annotations
     * @returns {Promise<Object>} Instance jsPDF
     */
    async function exporterDepuisPDF(blob, annotation) {
        const arrayBuffer = await blob.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        try {
            const numPages = pdfDoc.numPages;

            // Premiere page pour le format
            const premierePage = await pdfDoc.getPage(1);
            const vp0 = premierePage.getViewport({ scale: EXPORT_SCALE });
            const isLandscape = vp0.width > vp0.height;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'px',
                format: [vp0.width, vp0.height],
                compress: true
            });

            for (let i = 1; i <= numPages; i++) {
                if (i > 1) {
                    const page = await pdfDoc.getPage(i);
                    const vp = page.getViewport({ scale: EXPORT_SCALE });
                    doc.addPage([vp.width, vp.height], vp.width > vp.height ? 'landscape' : 'portrait');
                }

                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: EXPORT_SCALE });

                // Canvas temporaire pour la page
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                // Rendre la page originale
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                // Dessiner les annotations par-dessus
                const donneesPage = annotation?.pages?.[i - 1];
                if (donneesPage) {
                    await dessinerAnnotationsSurCtx(ctx, canvas.width, canvas.height, donneesPage);
                }

                // Ajouter au PDF
                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                doc.addImage(dataUrl, 'JPEG', 0, 0, viewport.width, viewport.height);
            }

            return doc;
        } finally {
            // Sans destroy(), le worker PDF.js retient l'ArrayBuffer + les polices
            // decodees pour le document. Sur des sessions d'export en lot la
            // memoire grimpe a plusieurs centaines de Mo. (ultrareview 2)
            try { await pdfDoc.destroy(); } catch (e) { /* deja detruit */ }
        }
    }

    /* ===============================
       EXPORT DEPUIS IMAGE
       =============================== */

    /**
     * Cree un jsPDF a partir d'un blob image avec annotations
     * @param {Blob} blob - Le blob image
     * @param {Object|null} annotation - Les annotations
     * @returns {Promise<Object>} Instance jsPDF
     */
    async function exporterDepuisImage(blob, annotation) {
        const img = await chargerImage(blob);

        const w = img.width * EXPORT_SCALE;
        const h = img.height * EXPORT_SCALE;
        const isLandscape = w > h;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'px',
            format: [w, h],
            compress: true
        });

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, w, h);

        // Dessiner les annotations
        const donneesPage = annotation?.pages?.[0];
        if (donneesPage) {
            await dessinerAnnotationsSurCtx(ctx, w, h, donneesPage);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        doc.addImage(dataUrl, 'JPEG', 0, 0, w, h);

        return doc;
    }

    /**
     * Charge une image depuis un blob
     * @param {Blob} blob
     * @returns {Promise<HTMLImageElement>}
     */
    function chargerImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Erreur chargement image')); };
            img.src = url;
        });
    }

    /* ===============================
       DESSIN DES ANNOTATIONS
       (miroir simplifie de travaux-annotation.js)
       =============================== */

    /**
     * Découpe une ligne de texte en sous-lignes tenant dans maxWidthPx (identique à wrapLigne du canvas).
     */
    function wrapLignePdf(ctx, ligne, maxWidthPx) {
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

    /**
     * Dessine toutes les annotations d'une page sur un contexte canvas
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} w - Largeur du canvas
     * @param {number} h - Hauteur du canvas
     * @param {Object} donneesPage - { strokes, shapes, textAnnotations, stickers }
     */
    async function dessinerAnnotationsSurCtx(ctx, w, h, donneesPage, scale) {
        if (scale == null) scale = EXPORT_SCALE;

        // Attendre le chargement de tous les autocollants references
        await travauxOutils.attendreChargementAutocollants(donneesPage);

        // Surligneurs d'abord (en dessous des autres annotations)
        if (donneesPage.strokes) {
            for (const trait of donneesPage.strokes) {
                if (trait.tool === 'surligneur') dessinerTrait(ctx, w, h, trait, scale);
            }
        }
        if (donneesPage.shapes) {
            for (const forme of donneesPage.shapes) {
                if (forme.type === 'surligneur') dessinerForme(ctx, w, h, forme, scale);
            }
        }

        // Traits (hors surligneurs)
        if (donneesPage.strokes) {
            for (const trait of donneesPage.strokes) {
                if (trait.tool !== 'surligneur') dessinerTrait(ctx, w, h, trait, scale);
            }
        }

        // Formes (hors surligneurs)
        if (donneesPage.shapes) {
            for (const forme of donneesPage.shapes) {
                if (forme.type !== 'surligneur') dessinerForme(ctx, w, h, forme, scale);
            }
        }

        // Textes (avec support multiligne et word-wrap)
        if (donneesPage.textAnnotations) {
            const ratioResolutionTexte = w / travauxOutils.RESOLUTION_REFERENCE;
            for (const texte of donneesPage.textAnnotations) {
                const fontSize = (texte.fontSize || 14) * ratioResolutionTexte;
                ctx.save();
                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillStyle = texte.color || '#FF0000';

                const interligne = fontSize * 1.3;
                const xPx = texte.x * w;
                const yPx = texte.y * h;

                // Word-wrap si une largeur est définie (identique au canvas d'annotation)
                const maxWidthPx = texte.width ? texte.width * w : 0;
                const lignesBrutes = (texte.text || '').split('\n');
                let lignesFinales;

                if (maxWidthPx > 0) {
                    lignesFinales = [];
                    for (const ligne of lignesBrutes) {
                        lignesFinales.push(...wrapLignePdf(ctx, ligne, maxWidthPx));
                    }
                } else {
                    lignesFinales = lignesBrutes;
                }

                for (let i = 0; i < lignesFinales.length; i++) {
                    ctx.fillText(lignesFinales[i], xPx, yPx + i * interligne);
                }

                ctx.restore();
            }
        }

        // Autocollants (avec teinte de categorie)
        if (donneesPage.stickers) {
            for (const stk of donneesPage.stickers) {
                const img = travauxOutils.getImageAutocollant(stk.autocollantId);
                if (img && img.complete) {
                    const tint = stk.tint || (travauxOutils.obtenirCouleurCategorieAutocollant
                        ? travauxOutils.obtenirCouleurCategorieAutocollant(stk.autocollantId) : null);
                    const sx = stk.x * w;
                    const sy = stk.y * h;
                    const sw = Math.round(stk.width * w) || 1;
                    const sh = Math.round(stk.height * h) || 1;
                    if (tint) {
                        const tmpCanvas = document.createElement('canvas');
                        tmpCanvas.width = sw;
                        tmpCanvas.height = sh;
                        const tmpCtx = tmpCanvas.getContext('2d');
                        tmpCtx.drawImage(img, 0, 0, sw, sh);
                        tmpCtx.globalCompositeOperation = 'source-in';
                        tmpCtx.fillStyle = tint;
                        tmpCtx.fillRect(0, 0, sw, sh);
                        ctx.drawImage(tmpCanvas, sx, sy, sw, sh);
                    } else {
                        ctx.drawImage(img, sx, sy, sw, sh);
                    }
                }
            }
        }
    }

    /**
     * Dessine un trait
     */
    function dessinerTrait(ctx, w, h, trait, scale) {
        if (!trait.points || trait.points.length < 2) return;

        const outil = travauxOutils.OUTILS[trait.tool] || travauxOutils.OUTILS.stylo;
        const ratioResolution = w / travauxOutils.RESOLUTION_REFERENCE;

        ctx.save();
        ctx.globalAlpha = trait.opacity || 1.0;
        ctx.globalCompositeOperation = outil.composite || 'source-over';
        ctx.strokeStyle = trait.color;
        const estSurl = (trait.tool === 'surligneur');
        ctx.lineCap = estSurl ? 'butt' : 'round';
        ctx.lineJoin = estSurl ? 'bevel' : 'round';

        ctx.beginPath();
        ctx.moveTo(trait.points[0].x * w, trait.points[0].y * h);

        for (let i = 1; i < trait.points.length; i++) {
            const p = trait.points[i];
            const epaisseurLogique = outil.sensiblePression
                ? travauxOutils.calculerEpaisseurPression(p.pressure) * (trait.lineWidth / outil.epaisseurDefaut)
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
     * Normalise la propriete pointes d'une forme fleche/ligne (retrocompat)
     */
    function normaliserPointes(forme) {
        if (forme.pointes) return forme.pointes;
        if (forme.double) return 'double';
        if (forme.type === 'ligne' || forme.type === 'ondule') return 'aucune';
        return 'fin';
    }

    /**
     * Dessine un symbole Unicode (crochet, croix, interrogation, sym-*) au PDF
     * Miroir de dessinerSymboleUnicode dans travaux-annotation.js.
     */
    function dessinerSymboleUnicodePDF(ctx, x1, y1, x2, y2, color, icone) {
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
     * Dessine une pointe de fleche (triangle plein) pour l'export PDF
     */
    function drawArrowhead(ctx, tipX, tipY, angle, headLen, headAngle) {
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
     * Dessine une forme
     */
    function dessinerForme(ctx, w, h, forme, scale) {
        const ratioResolution = w / travauxOutils.RESOLUTION_REFERENCE;

        ctx.save();
        ctx.strokeStyle = forme.color;
        ctx.lineWidth = (forme.lineWidth || 2) * ratioResolution;
        ctx.lineCap = 'round';

        const x1 = forme.x1 * w, y1 = forme.y1 * h;
        const x2 = forme.x2 * w, y2 = forme.y2 * h;

        switch (forme.type) {
            case 'surligneur':
                ctx.lineCap = 'butt';
                ctx.globalAlpha = forme.opacity || 0.5;
                ctx.globalCompositeOperation = 'multiply';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                break;
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
                const ampOnd = (forme.amplitude || 6) * ratioResolution;
                const wlOnd = (forme.wavelength || 30) * ratioResolution;
                const dxOnd = x2 - x1;
                const dyOnd = y2 - y1;
                const lineLenOnd = Math.sqrt(dxOnd * dxOnd + dyOnd * dyOnd);
                if (lineLenOnd < 1) break;
                const headLenOnd = Math.max(12 * ratioResolution, ctx.lineWidth * 5);
                const headAngleOnd = Math.PI / 8;
                const pointesOnd = normaliserPointes(forme);
                const pdOnd = pointesOnd === 'debut' || pointesOnd === 'double';
                const pfOnd = pointesOnd === 'fin' || pointesOnd === 'double';
                const txO = dxOnd / lineLenOnd;
                const tyO = dyOnd / lineLenOnd;
                const nxO = -tyO;
                const nyO = txO;
                const startDistOnd = pdOnd ? headLenOnd : 0;
                const endDistOnd = pfOnd ? lineLenOnd - headLenOnd : lineLenOnd;
                ctx.beginPath();
                ctx.moveTo(x1 + txO * startDistOnd, y1 + tyO * startDistOnd);
                const stepsOnd = Math.max(Math.ceil(lineLenOnd), 1);
                for (let i = 1; i <= stepsOnd; i++) {
                    const t = i / stepsOnd;
                    const dist = t * lineLenOnd;
                    if (dist < startDistOnd || dist > endDistOnd) continue;
                    const phase = (dist / wlOnd) * Math.PI * 2;
                    const offset = Math.sin(phase) * ampOnd;
                    ctx.lineTo(x1 + txO * dist + nxO * offset, y1 + tyO * dist + nyO * offset);
                }
                ctx.stroke();
                const angleOnd = Math.atan2(dyOnd, dxOnd);
                if (pfOnd) drawArrowhead(ctx, x2, y2, angleOnd, headLenOnd, headAngleOnd);
                if (pdOnd) drawArrowhead(ctx, x1, y1, angleOnd + Math.PI, headLenOnd, headAngleOnd);
                break;
            }
            case 'pointille': {
                // Ligne pointillee : on configure le dash pattern et on
                // tombe en fallthrough vers le rendu fleche/ligne, qui
                // dessinera la trajectoire avec ce dash actif. ctx.restore()
                // en fin de fonction remet setLineDash a la valeur sauvee. (ultrareview 2)
                const epP = (forme.lineWidth || 2) * ratioResolution;
                ctx.setLineDash([epP * 3, epP * 2]);
            }
            // eslint-disable-next-line no-fallthrough
            case 'ligne': // fallthrough — rendu via fleche avec pointes='aucune'
            case 'fleche': {
                const headLen = Math.max(12 * ratioResolution, ctx.lineWidth * 5);
                const headAngle = Math.PI / 8;
                const pointes = normaliserPointes(forme);
                const pointeDebut = pointes === 'debut' || pointes === 'double';
                const pointeFin = pointes === 'fin' || pointes === 'double';
                const aCourbe = forme.cx != null && forme.cy != null;

                if (aCourbe) {
                    const cpx = forme.cx * w;
                    const cpy = forme.cy * h;
                    const angleEnd = Math.atan2(y2 - cpy, x2 - cpx);
                    const angleStartCorr = Math.atan2(cpy - y1, cpx - x1);

                    let endX = x2, endY = y2;
                    if (pointeFin) {
                        endX = x2 - headLen * Math.cos(angleEnd);
                        endY = y2 - headLen * Math.sin(angleEnd);
                    }

                    let sx = x1, sy = y1;
                    if (pointeDebut) {
                        sx = x1 + headLen * Math.cos(angleStartCorr);
                        sy = y1 + headLen * Math.sin(angleStartCorr);
                    }

                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.quadraticCurveTo(cpx, cpy, endX, endY);
                    ctx.stroke();

                    if (pointeFin) {
                        drawArrowhead(ctx, x2, y2, angleEnd, headLen, headAngle);
                    }

                    if (pointeDebut) {
                        drawArrowhead(ctx, x1, y1, angleStartCorr + Math.PI, headLen, headAngle);
                    }
                } else {
                    const angle = Math.atan2(y2 - y1, x2 - x1);
                    let sx = x1, sy = y1;
                    if (pointeDebut) {
                        sx = x1 + headLen * Math.cos(angle);
                        sy = y1 + headLen * Math.sin(angle);
                    }
                    let endX = x2, endY = y2;
                    if (pointeFin) {
                        endX = x2 - headLen * Math.cos(angle);
                        endY = y2 - headLen * Math.sin(angle);
                    }
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    if (pointeFin) {
                        drawArrowhead(ctx, x2, y2, angle, headLen, headAngle);
                    }

                    if (pointeDebut) {
                        drawArrowhead(ctx, x1, y1, angle + Math.PI, headLen, headAngle);
                    }
                }
                break;
            }
            case 'crochet':
            case 'croix':
            case 'interrogation': {
                // Icone resolu depuis la forme (creation time) avec fallback
                // sur OUTILS courant. Avant : codes Unicode hardcodes qui
                // ignoraient toute personnalisation de l'icone et omettaient
                // la graisse 'bold' (incoherent avec le canvas). (ultrareview 2)
                const icone = forme.icone
                    || (travauxOutils.OUTILS[forme.type] && travauxOutils.OUTILS[forme.type].icone);
                dessinerSymboleUnicodePDF(ctx, x1, y1, x2, y2, forme.color, icone);
                break;
            }
            default:
                // Erreurs de français (errfr_1 a errfr_10)
                if (forme.type.startsWith('errfr_')) {
                    const mxE = (x1 + x2) / 2;
                    const myE = (y1 + y2) / 2;
                    const rayonE = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
                    // Lot 2 — le numéro vient de la liste de la grille de la copie
                    // exportée (`_grilleExport`) ; repli = position dans l'ordre.
                    let numE = forme.type.replace('errfr_', '');
                    if (typeof codesAnnotation !== 'undefined') {
                        numE = codesAnnotation.code(_grilleExport, forme.type).numero;
                    }
                    ctx.fillStyle = forme.color || '#888888';
                    ctx.beginPath();
                    ctx.arc(mxE, myE, rayonE, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold ' + Math.round(rayonE * 1.2) + 'px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(numE, mxE, myE);
                } else if (forme.type.startsWith('sym-')
                        && travauxOutils.OUTILS[forme.type]) {
                    // Symboles Unicode personnalises — miroir du default de
                    // travaux-annotation.js dessinerForme. Avant : silencieusement
                    // ignores a l'export PDF. (ultrareview 2)
                    const iconeS = forme.icone || travauxOutils.OUTILS[forme.type].icone;
                    dessinerSymboleUnicodePDF(ctx, x1, y1, x2, y2, forme.color, iconeS);
                }
                break;
        }

        ctx.restore();
    }

    /* ===============================
       HELPERS PAGE DE SYNTHESE
       =============================== */

    /**
     * Ajoute l'en-tete formate de la page de synthese
     * @param {Object} doc - Instance jsPDF
     * @param {string} titre - Titre principal
     * @param {Object} infos - { etudiant, production, date }
     * @returns {number} posY apres l'en-tete
     */
    function compterAnnotationsDetailees(annotation) {
        const stats = { tampons: {}, erreursFr: {}, totalTampons: 0, totalErreursFr: 0 };
        if (!annotation || !annotation.pages) return stats;

        for (const [_, donneesPage] of Object.entries(annotation.pages)) {
            // Tampons (autocollants)
            if (donneesPage.stickers) {
                for (const stk of donneesPage.stickers) {
                    const id = stk.autocollantId;
                    stats.tampons[id] = (stats.tampons[id] || 0) + 1;
                    stats.totalTampons++;
                }
            }
            // Erreurs de francais (formes type errfr_*)
            if (donneesPage.shapes) {
                for (const forme of donneesPage.shapes) {
                    if (forme.type && forme.type.startsWith('errfr_')) {
                        stats.erreursFr[forme.type] = (stats.erreursFr[forme.type] || 0) + 1;
                        stats.totalErreursFr++;
                    }
                }
            }
        }

        return stats;
    }

    /* ===============================
       PAGE DE SYNTHESE (rendu HTML rasterisé)
       =============================== */

    // Largeur Letter US à 96 DPI ; la hauteur s'adapte au contenu (la page peut
    // dépasser 11" — le PDF accepte des pages de hauteur arbitraire, l'élève
    // scrolle sur cellulaire). Rasterisation à 2x pour qualité d'impression.
    const SYNTH_PAGE_W = 816;
    const SYNTH_PAGE_H_MIN = 1056;     // min Letter US 11"
    const SYNTH_RASTER_SCALE = 2;

    /**
     * Ajoute une page de synthèse au document jsPDF en rasterisant le rendu HTML
     * de syntheseRetroactionRendu via html2canvas. Pure refonte du rendu :
     * aucune nouvelle donnée n'est calculée, tout vient de l'évaluation, de
     * l'annotation et des sources existantes (cartouche, grille, échelle,
     * historique). Si l'évaluation ou la lib html2canvas est absente, la page
     * de synthèse est omise — mais plus en silence (#565).
     *
     * #565 : chaque sortie DIT ce qui s'est passé. Auparavant tous les chemins
     * d'échec faisaient `return` nu ou se contentaient d'un `console.warn`, si
     * bien qu'une copie pouvait être téléversée sur Léa sans sa page de
     * rétroaction sans que personne ne le sache — alors que c'est la promesse du
     * bouton. La fonction ne LANCE pas pour autant : un échec de synthèse ne doit
     * pas coûter le PDF annoté, qui lui est bon. C'est l'appelant qui décide
     * quoi faire de la raison.
     *
     * @param {Object} doc - Instance jsPDF (en cours d'assemblage par genererDocPDF)
     * @param {Object} fichier - Métadonnées du fichier annoté
     * @param {string} [productionIdOverride] - Production cible si différente du fichier
     * @returns {Promise<{ajoutee: boolean, raison: string|null}>} `ajoutee` faux
     *   n'est pas toujours une anomalie : « aucune évaluation enregistrée » est
     *   légitime en export unitaire et anormal en export Léa.
     */
    async function ajouterPageSynthese(doc, fichier, productionIdOverride) {
        // 1. Pré-requis : modules + lib disponibles
        if (typeof html2canvas !== 'function' ||
            typeof syntheseRetroactionData === 'undefined' ||
            typeof syntheseRetroactionRendu === 'undefined') {
            console.warn('[Synthèse] Modules ou html2canvas indisponibles — page de synthèse omise.');
            return { ajoutee: false, raison: 'les composants de mise en page ne sont pas chargés' };
        }

        // 2. Résoudre l'évaluation pour ce fichier
        const evaluation = trouverEvaluationPourSynthese(fichier, productionIdOverride);
        if (!evaluation) {
            // Cas de l'élève sans évaluation enregistrée. Légitime en export
            // unitaire ; ANORMAL en export Léa, qui part des évaluations actives.
            // C'est l'appelant qui juge, d'où la raison remontée plutôt qu'un
            // silence.
            return { ajoutee: false, raison: 'aucune évaluation enregistrée pour cette copie' };
        }

        // 3. Récupérer l'annotation (peut être null). #912 — sans copie, `fichier.id` est
        // absent : on ne cherche pas, sinon une annotation orpheline (sans `fichierId`)
        // répondrait et ses tampons paraîtraient sur la page d'un élève qui n'a rien remis ici.
        const annotation = fichier.id ? travauxStockage.obtenirAnnotationFichier(fichier.id) : null;

        // 4. Construire le shape Feedback
        const feedback = syntheseRetroactionData.construireFeedback(evaluation, fichier, annotation);
        if (!feedback) return { ajoutee: false, raison: 'les données de rétroaction n\'ont pas pu être assemblées' };

        // #674 — LA PORTE DU PDF DE L'ÉLÈVE (seul appelant de `construireFeedback`).
        // Quand la note ne porte pas sur toute la grille, la page est produite mais
        // REFUSE DE CONCLURE (pas de niveau général, ce qui manque est nommé — rendu),
        // et l'enseignant·e l'apprend ICI, avant de remettre la copie, pas en la
        // relisant : une note trop haute passe, un avertissement ne passe pas.
        const avertissement = (feedback.portee && feedback.portee.incomplete)
            ? 'la note de cette copie ne porte pas sur toute la grille (' + feedback.portee.texte + ') : la page de rétroaction le dit et ne conclut pas'
            : null;

        // 5. Générer le HTML
        const html = syntheseRetroactionRendu.rendreSyntheseHTML(feedback);

        // 6. Insérer hors-écran pour permettre la rasterisation
        const conteneur = document.createElement('div');
        conteneur.style.cssText = 'position: fixed; left: -10000px; top: 0; width: ' + SYNTH_PAGE_W + 'px; pointer-events: none;';
        conteneur.innerHTML = html;
        document.body.appendChild(conteneur);

        try {
            // 7. Mesurer la hauteur réelle du fragment (≥ 11" Letter US)
            const cible = conteneur.firstElementChild;
            if (!cible) return { ajoutee: false, raison: 'le gabarit de synthèse est vide' };
            // Forcer le min-height à 1056 px puis mesurer ; le rendu peut dépasser
            // si le contenu (bilan détaillé + toutes erreurs FE) est dense.
            const hauteurReelle = Math.max(SYNTH_PAGE_H_MIN, cible.scrollHeight, cible.offsetHeight);

            // 8. Rasteriser à la hauteur réelle
            const canvas = await html2canvas(cible, {
                scale: SYNTH_RASTER_SCALE,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                width: SYNTH_PAGE_W,
                height: hauteurReelle
            });

            // 9. Ajouter une nouvelle page jsPDF de la même taille (rasterisée 2x)
            const pageW = SYNTH_PAGE_W * SYNTH_RASTER_SCALE;
            const pageH = hauteurReelle * SYNTH_RASTER_SCALE;
            doc.addPage([pageW, pageH], 'portrait');
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            doc.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH);
            return { ajoutee: true, raison: null, avertissement: avertissement };
        } catch (e) {
            console.error('[Synthèse] Échec de rasterisation :', e);
            return { ajoutee: false, raison: 'échec de la mise en image : ' + (e && e.message ? e.message : e) };
        } finally {
            document.body.removeChild(conteneur);
        }
    }

    /**
     * Résout l'évaluation à présenter dans la synthèse depuis le fichier annoté.
     * Si productionIdOverride est fourni (cas réassociation), on cherche l'éval
     * pour ce DA + cette production. Sinon on délègue à travauxResolution.
     */
    function trouverEvaluationPourSynthese(fichier, productionIdOverride) {
        if (!fichier || !fichier.etudiantDA) return null;
        const productionId = productionIdOverride || fichier.productionId;
        // Sans productionId resolu, on ne peut pas garantir que l'evaluation
        // retournee correspond au fichier => abandon plutot que mode permissif
        // qui retourne la derniere eval de l'eleve toutes productions confondues.
        if (!productionId) return null;

        let evaluations = [];
        if (typeof obtenirDonneesSelonMode === 'function') {
            evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        } else {
            const cleEff = (typeof window.cle === 'function') ? window.cle('evaluationsSauvegardees') : 'evaluationsSauvegardees';
            evaluations = db.getSync(cleEff, []) || [];
        }

        const candidates = evaluations
            .filter(e => e.etudiantDA === fichier.etudiantDA && !e.remplaceeParId)
            .filter(e => e.productionId === productionId);

        if (!candidates.length) return null;
        return candidates.sort((a, b) => new Date(b.dateEvaluation || 0) - new Date(a.dateEvaluation || 0))[0];
    }

    /* ===============================
       EXPORT DOSSIER COMPLET
       (travail annote + grille remplie + retroaction)
       =============================== */

    /**
     * Exporte un dossier complet : pages annotees + page de synthese
     * Peut etre appele depuis la page d'evaluation (sans fichier ouvert dans la visionneuse)
     * @param {string} da - DA de l'etudiant
     * @param {string} productionId - ID de la production
     */
    async function exporterDossierComplet(da, productionId) {
        if (!da || !productionId) {
            alert('Étudiant ou production non spécifié.');
            return;
        }

        // Trouver le fichier associé (résolution centralisée)
        const fichier = travauxResolution.trouverFichierPourEvaluation({ etudiantDA: da, productionId });

        if (!fichier) {
            // #912 — sans copie, « Dossier PDF » rend la synthèse seule (Grégoire, 17 sept. 2026).
            return exporterSyntheseSeule(da, productionId);
        }

        const blob = await travauxStockage.recupererBlob(fichier.id);
        if (!blob) {
            alert('Impossible de récupérer le fichier.');
            return;
        }

        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);

        const _hasProg = typeof window.afficherProgression === 'function';
        if (_hasProg) {
            window.afficherProgression('Export dossier complet');
            window.majProgression(15, 'Rendu des pages annotées…');
        }

        try {
            let doc;
            if (fichier.typeMIME === 'application/pdf') {
                doc = await exporterDepuisPDF(blob, annotation);
            } else {
                doc = await exporterDepuisImage(blob, annotation);
            }

            if (_hasProg) window.majProgression(70, 'Ajout de la page de synthèse…');

            // Ajouter la page de synthese (grille + retroaction)
            const synthese = await ajouterPageSynthese(doc, fichier, productionId);

            if (_hasProg) window.majProgression(90, 'Téléchargement…');

            // Telecharger
            // ✅ ANONYMISATION (Tier 0.1) : clé de base — prenom/nom sont anonymisés par obtenirDonneesSelonMode
            const etudiant = obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === da);
            const nomEtudiant = etudiant ? `${etudiant.prenom}_${etudiant.nom}` : da;
            const nomSortie = `dossier_${nomEtudiant}_${productionId}.pdf`;
            doc.save(nomSortie);

            // Marquer le fichier comme exporte (cycle de vie)
            travauxStockage.marquerExporte(fichier.id);

            // #565 — le PDF est livré, mais s'il lui manque la page de
            // rétroaction, on le DIT. Après le téléchargement : le fichier
            // annoté reste bon, ce n'est pas un échec d'export.
            if (synthese && !synthese.ajoutee) {
                alert('Le PDF a été exporté, mais SANS sa page de rétroaction (' + synthese.raison + ').');
            } else if (synthese && synthese.avertissement) {
                // #674 — la page est là, mais elle ne conclut pas : dit avant la remise.
                alert('Le PDF a été exporté, mais ' + synthese.avertissement + '.');
            }

        } catch (e) {
            console.error('[Travaux-Export] Erreur export dossier complet:', e);
            alert('Erreur lors de l\'export du dossier. Voir la console.');
        } finally {
            if (_hasProg) window.masquerProgression();
        }
    }

    /**
     * #912 (17 sept. 2026) — « Dossier PDF » pour une évaluation SANS copie : la synthèse seule.
     *
     * Décision de Grégoire : un PDF d'une page, LA MÊME synthèse que celle remise avec une
     * copie, sans section d'annotations ; aucun bouton neuf. Cas vécu : tout son Automne 2025,
     * 303 évaluations faites avec les grilles, aucune copie importée.
     *
     * Même moteur, même gabarit : `ajouterPageSynthese` fait tout le travail (dont la porte
     * #674 et les filtres de ce qui part vers l'élève, qui vivent dans `construireFeedback` et
     * dans le rendu). Un document jsPDF naît avec une page blanche : on la retire une fois la
     * synthèse ajoutée. Rien n'est écrit : ni `marquerExporte` (aucun fichier), ni évaluation.
     */
    async function exporterSyntheseSeule(da, productionId) {
        const sansCopie = { id: null, etudiantDA: da, productionId: productionId };
        if (!trouverEvaluationPourSynthese(sansCopie, productionId)) {
            alert('Aucune copie ni évaluation enregistrée pour cet·te étudiant·e et cette production.');
            return;
        }

        const _hasProg = typeof window.afficherProgression === 'function';
        if (_hasProg) {
            window.afficherProgression('Export de la synthèse');
            window.majProgression(40, 'Mise en page de la rétroaction…');
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: [SYNTH_PAGE_W * SYNTH_RASTER_SCALE, SYNTH_PAGE_H_MIN * SYNTH_RASTER_SCALE], compress: true });

            const synthese = await ajouterPageSynthese(doc, sansCopie, productionId);
            if (!synthese || !synthese.ajoutee) {
                // Sans la page, il ne reste qu'une feuille blanche : on ne la remet pas.
                alert('La rétroaction n\'a pas pu être exportée (' + ((synthese && synthese.raison) || 'raison inconnue') + ').');
                return;
            }
            doc.deletePage(1);

            if (_hasProg) window.majProgression(90, 'Téléchargement…');

            // ✅ ANONYMISATION (Tier 0.1) : prenom/nom sont anonymisés par obtenirDonneesSelonMode
            const etudiant = obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === da);
            const nomEtudiant = etudiant ? `${etudiant.prenom}_${etudiant.nom}` : da;
            doc.save(`synthese_${nomEtudiant}_${productionId}.pdf`);

            // #674 — la page est là, mais elle ne conclut pas : dit avant la remise.
            if (synthese.avertissement) {
                alert('Le PDF a été exporté, mais ' + synthese.avertissement + '.');
            }
        } catch (e) {
            console.error('[Travaux-Export] Erreur export de la synthèse seule:', e);
            alert('Erreur lors de l\'export de la synthèse. Voir la console.');
        } finally {
            if (_hasProg) window.masquerProgression();
        }
    }

    /* ===============================
       ECRAN DE REVISION AVANT EXPORT
       =============================== */

    /**
     * Affiche un modal de revision avant export
     * @param {string} fichierId - ID du fichier
     */
    function afficherRevisionExport(fichierId) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) {
            alert('Fichier introuvable.');
            return;
        }

        const annotation = travauxStockage.obtenirAnnotationFichier(fichierId);
        const stats = compterAnnotations(annotation);

        // Chercher l'évaluation (résolution centralisée)
        const evaluation = travauxResolution.trouverEvaluationPourFichier(fichier);

        let html = `
            <div class="modal-overlay actif" id="travaux-modal-revision" data-close-on-bg="travauxExportPDF.fermerRevision">
                <div class="modal-contenu" style="max-width:600px;max-height:80vh;overflow-y:auto;">
                    <h3>Révision avant export</h3>
                    <div class="travaux-revision-stats">
                        <p><strong>Fichier :</strong> ${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA) : fichier.nomFichier)}</p>
                        <p><strong>Étudiant :</strong> ${echapperHtml((typeof anonymiserNom === 'function' && anonymiserNom(evaluation?.etudiantDA || fichier.etudiantDA)) || evaluation?.etudiantNom || fichier.etudiantDA || 'Non associé')}</p>
                        <p><strong>Pages annotées :</strong> ${stats.pagesAnnotees} sur ${stats.pagesTotal}</p>
                        <p><strong>Traits :</strong> ${stats.traits} | <strong>Formes :</strong> ${stats.formes} | <strong>Textes :</strong> ${stats.textes}</p>`;

        if (stats.autocollants > 0) {
            // Ne pas ventiler par categorie : les anciennes categories
            // 'qualite'/'diagnostic' sont legacy (cf. synthese-retroaction-data.js
            // commentaire « legacy -> ignoree »). La nouvelle taxonomie est
            // action / observations / comprehension. Le PDF lui-meme passe
            // par compterAnnotationsDetailees (voie correcte). Le modal de
            // revision n'a pas besoin du detail. (nit1)
            html += `<p><strong>Autocollants :</strong> ${stats.autocollants}</p>`;
        }

        html += '</div>';

        if (evaluation) {
            html += '<div class="travaux-revision-evaluation">';
            html += `<h4>Évaluation : ${echapperHtml(evaluation.grilleNom || '')}</h4>`;

            if (evaluation.criteres && evaluation.criteres.length > 0) {
                html += '<ul class="travaux-revision-criteres">';
                for (const c of evaluation.criteres) {
                    // ⚠ #672 — APERÇU ENSEIGNANT, pas le PDF remis. Sur une évaluation
                    // enregistrée AVANT le 1er septembre 2026 en mode simple,
                    // `c.retroaction` porte l'amorce « Saisissez les erreurs et le nombre
                    // de mots » : le div `comm_<critereId>` recevait `.value` au lieu de
                    // `textContent`. Le PDF remis est rattrapé par la garde d'amorces de
                    // `synthese-retroaction-data.js` ; cet extrait de 80 caractères, non.
                    // Laissé tel quel volontairement : il ne va à personne d'autre qu'à
                    // l'enseignant·e, et le doubler ici dupliquerait la cascade.
                    // ✅ ANONYMISATION (Tier 0.3) : anonymiser les prénoms dans les rétroactions
                    const retroTexte = typeof anonymiserTexteRetroaction === 'function'
                        ? anonymiserTexteRetroaction(c.retroaction || '', evaluation.etudiantDA)
                        : (c.retroaction || '');
                    const extrait = retroTexte ? retroTexte.substring(0, 80) + (retroTexte.length > 80 ? '…' : '') : '—';
                    // Lot 3 (4 sept. 2026) — un critère analytique se lit par son chiffre, ici
                    // comme sur le PDF remis : « 24 / 30 », pas le niveau déduit.
                    const lecture = (typeof c.points === 'number' && !isNaN(c.points))
                        ? `${c.points} / ${c.ponderation}` : (c.niveauSelectionne || '—');
                    html += `<li><strong>${echapperHtml(c.critereNom)}</strong> — ${echapperHtml(lecture)}<br><span class="texte-muted">${echapperHtml(extrait)}</span></li>`;
                }
                html += '</ul>';
            }

            // Respecter le mode d'affichage de la note (lettre vs complet)
            // Priorité : évaluation sauvegardée > pratique active > défaut
            let modeNotePreview = 'complet';
            if (evaluation.optionsAffichage?.affichageNote) {
                modeNotePreview = evaluation.optionsAffichage.affichageNote;
            } else {
                try {
                    // Lot N1b (21 sept. 2026) : l'entrée de bibliothèque que rend LA désignation — par son id,
                    // jamais « la première pratique du même type ». Sans pratique assignée : note complète.
                    const pActive = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive().donnees : null;
                    if (pActive?.affichageNote === 'lettre') modeNotePreview = 'lettre';
                } catch(e) { console.warn('[PDF-Export] pratique affichageNote preview fallback:', e.message || e); }
            }

            // #941 lot S1 (décision A) — une copie en points : sa note, jamais un niveau.
            const enPointsPreview = typeof evaluationEnPoints === 'function' && evaluationEnPoints(evaluation);
            if (enPointsPreview) {
                if (evaluation.noteFinale != null) {
                    html += `<p><strong>Note :</strong> ${evaluation.noteFinale}%</p>`;
                }
            } else if (modeNotePreview === 'lettre') {
                if (evaluation.niveauFinal) {
                    html += `<p><strong>Niveau de performance :</strong> ${echapperHtml(evaluation.niveauFinal)}</p>`;
                }
            } else {
                if (evaluation.noteFinale != null) {
                    html += `<p><strong>Note :</strong> ${evaluation.noteFinale}%</p>`;
                }
                if (evaluation.niveauFinal) {
                    html += `<p><strong>Niveau :</strong> ${echapperHtml(evaluation.niveauFinal)}</p>`;
                }
            }

            html += '</div>';
        } else {
            html += '<p class="texte-muted">Aucune évaluation trouvée pour ce fichier. La page de synthèse ne sera pas incluse.</p>';
        }

        html += `
                    <div class="travaux-revision-actions">
                        <button class="btn btn-secondaire" data-action="travauxExportPDF.fermerRevision">Modifier</button>
                        <button class="btn btn-principal" data-action="_travauxRevisionExporter" data-param="${echapperHtml(fichierId)}">Exporter le PDF</button>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Ferme le modal de revision
     */
    function fermerRevision() {
        const modal = document.getElementById('travaux-modal-revision');
        if (modal) modal.remove();
    }

    /**
     * Compte les annotations d'un fichier
     * @param {Object|null} annotation
     * @returns {Object} Statistiques
     */
    function compterAnnotations(annotation) {
        const stats = {
            pagesTotal: travauxVisionneuse.getNombrePagesTotal(),
            pagesAnnotees: 0,
            traits: 0,
            formes: 0,
            textes: 0,
            autocollants: 0,
            autoQualite: 0,
            autoDiagnostic: 0
        };

        if (!annotation || !annotation.pages) return stats;

        const autocollantsDef = travauxOutils.AUTOCOLLANTS;

        for (const [_, donneesPage] of Object.entries(annotation.pages)) {
            let pageAnnotee = false;

            if (donneesPage.strokes?.length > 0) {
                stats.traits += donneesPage.strokes.length;
                pageAnnotee = true;
            }
            if (donneesPage.shapes?.length > 0) {
                stats.formes += donneesPage.shapes.length;
                pageAnnotee = true;
            }
            if (donneesPage.textAnnotations?.length > 0) {
                stats.textes += donneesPage.textAnnotations.length;
                pageAnnotee = true;
            }
            if (donneesPage.stickers?.length > 0) {
                stats.autocollants += donneesPage.stickers.length;
                pageAnnotee = true;

                for (const stk of donneesPage.stickers) {
                    const def = autocollantsDef.find(a => a.id === stk.autocollantId);
                    if (def?.categorie === 'qualite') stats.autoQualite++;
                    else stats.autoDiagnostic++;
                }
            }

            if (pageAnnotee) stats.pagesAnnotees++;
        }

        return stats;
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    /**
     * Rend un PDF avec annotations aplaties
     * @param {Blob} blob - Le blob PDF original
     * @param {Object} annotation - Les annotations
     * @param {Object} options - { format: 'pdf', scale: 1.5, quality: 0.85, onProgression: Function }
     * @returns {Promise<Blob>} Le PDF aplati comme blob
     */
    async function rendrePDFAvecAnnotations(blob, annotation, options = {}) {
        const scale = options.scale || EXPORT_SCALE;
        const quality = options.quality || 0.92;
        const onProgression = options.onProgression || null;

        const arrayBuffer = await blob.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        try {
            const numPages = pdfDoc.numPages;

            const premierePage = await pdfDoc.getPage(1);
            const vp0 = premierePage.getViewport({ scale: scale });
            const isLandscape = vp0.width > vp0.height;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'px',
                format: [vp0.width, vp0.height],
                compress: true
            });

            for (let i = 1; i <= numPages; i++) {
                if (i > 1) {
                    const page = await pdfDoc.getPage(i);
                    const vp = page.getViewport({ scale: scale });
                    doc.addPage([vp.width, vp.height], vp.width > vp.height ? 'landscape' : 'portrait');
                }

                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: scale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                const donneesPage = annotation?.pages?.[i - 1];
                if (donneesPage) {
                    await dessinerAnnotationsSurCtx(ctx, canvas.width, canvas.height, donneesPage, scale);
                }

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                doc.addImage(dataUrl, 'JPEG', 0, 0, viewport.width, viewport.height);

                if (onProgression) {
                    onProgression(i, numPages);
                }
            }

            return doc.output('blob');
        } finally {
            // Voir exporterDepuisPDF : meme leak worker PDF.js sans destroy(). (ultrareview 2)
            try { await pdfDoc.destroy(); } catch (e) { /* deja detruit */ }
        }
    }

    /* ===============================
       PREVISUALISATION PDF (overlay QuickLook)
       =============================== */

    /**
     * Ouvre un overlay de previsualisation du PDF complet (annotations + synthese)
     * @param {string} fichierId - ID du fichier a previsualiser
     */
    async function previsualiserPDF(fichierId) {
        const overlayId = 'preview-pdf-export-overlay';
        let overlay = document.getElementById(overlayId);
        // Si un overlay existe deja (re-ouverture), passer par fermerPreviewPDF()
        // pour decrocher le keydown listener, detruire le pdfDoc precedent et
        // vider _previewPDFState. Sans ca, listener et worker s'accumulaient. (ultrareview 2)
        if (overlay) fermerPreviewPDF();

        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'preview-quicklook-overlay';
        overlay.innerHTML = '<div class="preview-pdf-chargement">Génération du PDF…</div>';
        document.body.appendChild(overlay);

        try {
            const { doc, nomSortie, fichierId: fId } = await genererDocPDF(fichierId);
            const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });

            const arrayBuffer = await pdfBlob.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdfDoc.numPages;

            window._previewPDFState = {
                pdfDoc, totalPages, pageActuelle: 1,
                doc, nomSortie, fichierId: fId
            };

            overlay.innerHTML = `
                <div class="preview-quicklook-contenu">
                    <canvas id="preview-pdf-canvas"></canvas>
                    <div class="preview-pdf-barre-bas">
                        ${totalPages > 1 ? `
                        <button class="preview-quicklook-fleche preview-quicklook-prec" data-action="travauxExportPDF.previewPDFPagePrec" data-stop>&#x25C0;</button>
                        <span class="preview-quicklook-page" id="preview-pdf-page-info">1 / ${totalPages}</span>
                        <button class="preview-quicklook-fleche preview-quicklook-suiv" data-action="travauxExportPDF.previewPDFPageSuiv" data-stop>&#x25B6;</button>
                        ` : ''}
                        <button class="btn btn-principal preview-pdf-telecharger" data-action="travauxExportPDF.telechargerDepuisPreview" data-stop>Télécharger PDF</button>
                    </div>
                </div>
            `;

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) fermerPreviewPDF();
            });

            overlay._onKeyDown = (e) => {
                if (e.key === 'Escape') fermerPreviewPDF();
                if (e.key === 'ArrowLeft') previewPDFPagePrec();
                if (e.key === 'ArrowRight') previewPDFPageSuiv();
            };
            document.addEventListener('keydown', overlay._onKeyDown);

            await rendrePagePreviewPDF(1);

        } catch (e) {
            console.error('[Travaux-Export] Erreur previsualisation:', e);
            overlay.innerHTML = '<div class="preview-pdf-chargement">Erreur de génération.</div>';
            setTimeout(() => overlay.remove(), 2000);
        }
    }

    /**
     * Rend une page du PDF de previsualisation sur le canvas
     * @param {number} numPage - Numero de page (1-indexed)
     */
    async function rendrePagePreviewPDF(numPage) {
        const state = window._previewPDFState;
        if (!state) return;

        const canvas = document.getElementById('preview-pdf-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const page = await state.pdfDoc.getPage(numPage);
        const scale = Math.min(1.5, (window.innerHeight * 0.85) / page.getViewport({ scale: 1 }).height);
        const viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const pageInfo = document.getElementById('preview-pdf-page-info');
        if (pageInfo) pageInfo.textContent = `${numPage} / ${state.totalPages}`;

        const fleches = document.querySelectorAll('#preview-pdf-export-overlay .preview-quicklook-fleche');
        if (fleches.length >= 2) {
            fleches[0].style.opacity = numPage <= 1 ? '0.3' : '';
            fleches[1].style.opacity = numPage >= state.totalPages ? '0.3' : '';
        }
    }

    function previewPDFPagePrec() {
        const state = window._previewPDFState;
        if (!state || state.pageActuelle <= 1) return;
        state.pageActuelle--;
        rendrePagePreviewPDF(state.pageActuelle);
    }

    function previewPDFPageSuiv() {
        const state = window._previewPDFState;
        if (!state || state.pageActuelle >= state.totalPages) return;
        state.pageActuelle++;
        rendrePagePreviewPDF(state.pageActuelle);
    }

    function fermerPreviewPDF() {
        const overlay = document.getElementById('preview-pdf-export-overlay');
        if (overlay) {
            if (overlay._onKeyDown) document.removeEventListener('keydown', overlay._onKeyDown);
            overlay.remove();
        }
        // Liberer les ressources PDF.js cote worker. Sans destroy(), le
        // worker maintient le document en memoire (table d'annotations,
        // polices decodees, ArrayBuffer transfere). Une session de correction
        // de 30 PDF accumulait plusieurs centaines de Mo. (nit2)
        if (window._previewPDFState && window._previewPDFState.pdfDoc) {
            try {
                window._previewPDFState.pdfDoc.destroy().catch(function() {});
            } catch (e) {
                // destroy() peut throw si deja detruit -- ignorer
            }
        }
        window._previewPDFState = null;
    }

    function telechargerDepuisPreview() {
        const state = window._previewPDFState;
        if (!state) return;
        state.doc.save(state.nomSortie);
        travauxStockage.marquerExporte(state.fichierId);
        fermerPreviewPDF();
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    // Wrapper multi-statement pour data-action (fermer revision + exporter)
    window._travauxRevisionExporter = function(fichierId) {
        fermerRevision();
        exporterPDF(fichierId);
    };

    window.travauxExportPDF = {
        genererDocPDF: genererDocPDF,
        exporterPDF: exporterPDF,
        exporterDossierComplet: exporterDossierComplet,
        afficherRevisionExport: afficherRevisionExport,
        fermerRevision: fermerRevision,
        rendrePDFAvecAnnotations: rendrePDFAvecAnnotations,
        dessinerAnnotationsSurCtx: dessinerAnnotationsSurCtx,
        previsualiserPDF: previsualiserPDF,
        telechargerDepuisPreview: telechargerDepuisPreview,
        fermerPreviewPDF: fermerPreviewPDF,
        previewPDFPagePrec: previewPDFPagePrec,
        previewPDFPageSuiv: previewPDFPageSuiv,
        compterAnnotationsDetailees: compterAnnotationsDetailees
    };

})();
