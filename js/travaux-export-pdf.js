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

    // Config PDF reutilisee depuis export-pdf.js
    function getCfg() {
        return window.ExportPDF?.config || {
            marges: { haut: 30, bas: 25.4, gauche: 25.4, droite: 25.4 },
            couleurs: { titreSection: [3,46,92], textePrincipal: [51,51,51],
                        texteSecondaire: [102,102,102], bordure: [204,204,204],
                        fondEntete: [245,245,245] },
            polices: { titrePrincipal: 20, titreSection: 15, sousTitre: 13,
                       texteNormal: 12, textePetit: 12 }
        };
    }
    const MM_TO_PX = 612 / 215.9;
    function mm(v) { return v * MM_TO_PX; }

    /* ===============================
       EXPORT PDF PRINCIPAL
       =============================== */

    /**
     * Genere un document jsPDF complet (pages annotees + synthese) sans telecharger
     * @param {string} fichierId - ID du fichier
     * @returns {Promise<{doc: Object, nomSortie: string, fichierId: string}>}
     */
    async function genererDocPDF(fichierId, productionIdOverride) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) throw new Error('Fichier introuvable');

        const blob = await travauxStockage.recupererBlob(fichierId);
        if (!blob) throw new Error('Blob introuvable');

        const annotation = travauxStockage.obtenirAnnotationFichier(fichierId);

        let doc;
        if (fichier.typeMIME === 'application/pdf') {
            doc = await exporterDepuisPDF(blob, annotation);
        } else {
            doc = await exporterDepuisImage(blob, annotation);
        }

        ajouterPageSynthese(doc, fichier, productionIdOverride);

        // ✅ ANONYMISATION (Tier 0.2) : anonymiser le nom du fichier de sortie
        const nomFichierAff = typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(fichier.nomFichier, fichier.etudiantDA) : fichier.nomFichier;
        const nomSortie = nomFichierAff.replace(/\.[^.]+$/, '') + '_annote.pdf';
        return { doc, nomSortie, fichierId };
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

        try {
            const { doc, nomSortie } = await genererDocPDF(fichierId);
            doc.save(nomSortie);
            travauxStockage.marquerExporte(fichierId);
        } catch (e) {
            console.error('[Travaux-Export] Erreur export PDF:', e);
            alert('Erreur lors de l\'export PDF. Voir la console.');
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
            case 'crochet': {
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const size = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
                ctx.fillStyle = forme.color || '#2e7d32';
                ctx.font = size + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\u2714\uFE0E', mx, my);
                break;
            }
            case 'croix': {
                const mxC = (x1 + x2) / 2;
                const myC = (y1 + y2) / 2;
                const sizeC = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
                ctx.fillStyle = forme.color || '#c62828';
                ctx.font = sizeC + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\u2718', mxC, myC);
                break;
            }
            case 'interrogation': {
                const mxI = (x1 + x2) / 2;
                const myI = (y1 + y2) / 2;
                const sizeI = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
                ctx.fillStyle = forme.color || '#e65100';
                ctx.font = 'bold ' + sizeI + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', mxI, myI);
                break;
            }
            default:
                // Erreurs de français (errfr_1 a errfr_10)
                if (forme.type.startsWith('errfr_')) {
                    const mxE = (x1 + x2) / 2;
                    const myE = (y1 + y2) / 2;
                    const rayonE = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
                    // Utiliser la position dans l'ordre personnalisé
                    let numE = forme.type.replace('errfr_', '');
                    if (typeof travauxOutils !== 'undefined' && travauxOutils.obtenirOrdreErreursFr) {
                        const ordreE = travauxOutils.obtenirOrdreErreursFr();
                        const idxE = ordreE.indexOf(forme.type);
                        if (idxE !== -1) numE = idxE + 1;
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
    function ajouterEnteteRetroaction(doc, titre, infos) {
        const cfg = getCfg();
        const pageW = doc.internal.pageSize.getWidth();
        const margeG = mm(cfg.marges.gauche);
        const margeD = mm(cfg.marges.droite);
        let y = mm(cfg.marges.haut);

        // Titre a gauche
        doc.setFontSize(cfg.polices.titrePrincipal);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...cfg.couleurs.titreSection);
        doc.text(titre, margeG, y);

        // Infos a droite
        doc.setFontSize(cfg.polices.textePetit);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...cfg.couleurs.texteSecondaire);
        const lignesDroite = [];
        if (infos.etudiant) lignesDroite.push('\u00c9tudiant\u00b7e : ' + infos.etudiant);
        if (infos.date) lignesDroite.push('Date de l\'\u00e9valuation : ' + infos.date);
        let yDroite = y - (lignesDroite.length - 1) * mm(4);
        for (const ligne of lignesDroite) {
            doc.text(ligne, pageW - margeD, yDroite, { align: 'right' });
            yDroite += mm(4);
        }

        y += mm(6);

        // Ligne separatrice
        doc.setDrawColor(...cfg.couleurs.bordure);
        doc.setLineWidth(0.5);
        doc.line(margeG, y, pageW - margeD, y);
        y += mm(6);

        return y;
    }

    /**
     * Ajoute le pied de page sur une page de synthese
     * @param {Object} doc - Instance jsPDF
     * @param {number} page - Numero de page (1-indexed dans les pages de synthese)
     * @param {number} total - Total de pages de synthese
     */
    function ajouterPiedPageSynthese(doc, page, total) {
        const cfg = getCfg();
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margeG = mm(cfg.marges.gauche);
        const margeD = mm(cfg.marges.droite);
        const yPied = pageH - mm(cfg.marges.bas);

        // Ligne separatrice
        doc.setDrawColor(...cfg.couleurs.bordure);
        doc.setLineWidth(0.5);
        doc.line(margeG, yPied - mm(3), pageW - margeD, yPied - mm(3));

        doc.setFontSize(cfg.polices.textePetit);
        doc.setTextColor(...cfg.couleurs.texteSecondaire);

        // Nom enseignant a gauche
        // Priorité : 1) obtenirNomEnseignantActif (via groupeCours), 2) select enseignant du trimestre, 3) premier de la liste enseignants
        let nomEnseignant = '';
        try {
            nomEnseignant = (typeof obtenirNomEnseignantActif === 'function')
                ? (obtenirNomEnseignantActif() || '')
                : '';
            // Fallback vers la liste enseignants (profil sélectionné ou premier)
            if (!nomEnseignant && typeof db !== 'undefined' && db.getSync) {
                const enseignants = db.getSync('enseignants', []);
                // Essayer le select du trimestre
                const selectEns = document.getElementById('v2-selectEnseignant');
                const ensId = selectEns?.value;
                const ens = ensId ? enseignants.find(e => e.id === ensId) : (enseignants[0] || null);
                if (ens && ens.prenom && ens.nom) {
                    nomEnseignant = ens.prenom + ' ' + ens.nom;
                }
            }
        } catch(e) { console.warn('[PDF-Export] enseignant name lookup skipped:', e.message || e); }

        // Cours actif pour le pied de page (via groupe-cours du trimestre)
        let codeCoursPied = '';
        try {
            if (typeof db !== 'undefined' && db.getSync) {
                const trimId = window.trimestreActif || db.getSync('trimestreActif', '');
                if (trimId) {
                    const groupesCours = db.getSync(trimId + '_groupesCours', []);
                    const gcActif = groupesCours.find(gc => gc.actif);
                    if (gcActif && gcActif.coursId) {
                        const cours = db.getSync('cours', []);
                        const listeCours = db.getSync('listeCours', []);
                        const coursInfo = cours.find(c => c.id === gcActif.coursId) || listeCours.find(c => c.id === gcActif.coursId);
                        if (coursInfo) {
                            const sigle = coursInfo.codeCours || coursInfo.sigle || coursInfo.code || '';
                            const titre = coursInfo.nomCours || coursInfo.titre || coursInfo.nom || '';
                            codeCoursPied = [sigle, titre].filter(Boolean).join(' — ');
                        }
                    }
                }
            }
        } catch(e) { console.warn('[PDF-Export] cours code lookup skipped:', e.message || e); }

        // Construire le texte du pied de page gauche
        let textePiedGauche = '';
        if (nomEnseignant && codeCoursPied) {
            textePiedGauche = nomEnseignant + ' — ' + codeCoursPied;
        } else {
            textePiedGauche = nomEnseignant || codeCoursPied;
        }

        if (textePiedGauche) {
            doc.setFont('helvetica', 'normal');
            doc.text(textePiedGauche, margeG, yPied);
        }

        // Pagination centre
        if (total > 1) {
            doc.setFont('helvetica', 'normal');
            doc.text('Page ' + page + '/' + total, pageW / 2, yPied, { align: 'center' });
        }

        // Licence a droite
        doc.setFont('helvetica', 'italic');
        doc.text('CC BY-NC-SA', pageW - margeD, yPied, { align: 'right' });
    }

    /**
     * Finalise les pieds de page sur toutes les pages de synthese
     * @param {Object} doc - Instance jsPDF
     * @param {number} premierePageSynthese - Numero de la premiere page de synthese (1-indexed)
     */
    function finaliserPagesSynthese(doc, premierePageSynthese) {
        const totalPages = doc.internal.getNumberOfPages();
        const totalSynthese = totalPages - premierePageSynthese + 1;
        for (let i = 0; i < totalSynthese; i++) {
            doc.setPage(premierePageSynthese + i);
            ajouterPiedPageSynthese(doc, i + 1, totalSynthese);
        }
    }

    /* ===============================
       COMPTAGE DETAILLE DES ANNOTATIONS
       =============================== */

    /**
     * Compte les tampons et erreurs de francais dans les annotations
     * @param {Object|null} annotation - Donnees d'annotation du fichier
     * @returns {Object} { tampons: {id: count}, erreursFr: {type: count}, totalTampons, totalErreursFr }
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
       PAGE DE SYNTHESE
       =============================== */

    /**
     * Ajoute une page de synthese formatee avec tableaux et synthese visuelle
     * @param {Object} doc - Instance jsPDF
     * @param {Object} fichier - Metadonnees du fichier
     */
    function ajouterPageSynthese(doc, fichier, productionIdOverride) {
        const cfg = getCfg();
        const margeG = mm(cfg.marges.gauche);
        const margeD = mm(cfg.marges.droite);

        // Résolution centralisée fichier → évaluation
        // Si un productionIdOverride est fourni, construire un pseudo-fichier pour la recherche
        const fichierRecherche = productionIdOverride
            ? { ...fichier, productionId: productionIdOverride }
            : fichier;
        const evaluation = travauxResolution.trouverEvaluationPourFichier(fichierRecherche);

        // Log si ambiguïté détectée (Phase 2)
        const avert = travauxResolution.dernierAvertissement && travauxResolution.dernierAvertissement();
        if (avert) {
            console.warn('[Travaux-Export] Ambiguïté lors de la résolution pour la page de synthèse:', avert);
        }

        if (!evaluation) {
            return;
        }

        // Page lettre en px (8.5x11 pouces a 72dpi)
        doc.addPage([612, 792], 'portrait');
        const premierePageSynthese = doc.internal.getNumberOfPages();
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const largeurContenu = pageW - margeG - margeD;
        const seuilPage = pageH - mm(cfg.marges.bas) - mm(8);

        // En-tete formate
        const dateObj = evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation) : null;
        const dateEval = dateObj
            ? dateObj.toLocaleDateString('fr-CA', { timeZone: 'America/Toronto' }) + ' \u00e0 ' + dateObj.toLocaleTimeString('fr-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit' })
            : '';
        const titreProduction = evaluation.productionNom || '';
        const titrePdf = titreProduction ? '\u00c9VALUATION \u2014 ' + titreProduction : '\u00c9VALUATION';
        // ✅ ANONYMISATION (Tier 0.1) : utiliser le nom anonymisé si le mode est actif
        const nomAnonyme = typeof anonymiserNom === 'function' ? anonymiserNom(fichier.etudiantDA) : null;
        const nomEtudiantEntete = (nomAnonyme || evaluation.etudiantNom || '') + (fichier.etudiantDA && !nomAnonyme ? ' (' + fichier.etudiantDA + ')' : '');
        let y = ajouterEnteteRetroaction(doc, titrePdf, {
            etudiant: nomEtudiantEntete,
            date: dateEval
        });

        // --- EN-TETE PERSONNALISE (selon optionsAffichage) ---
        const opts = evaluation.optionsAffichage || {};
        let production = null;
        let etudiant = null;
        let cours = null;
        try {
            // ✅ ANONYMISATION (Tier 0.1) : clé de base (obtenirDonneesSelonMode applique cle() en interne)
            const productions = obtenirDonneesSelonMode('productions');
            production = productions.find(p => p.id === evaluation.productionId) || null;
        } catch(e) { console.warn('[PDF-Export] production lookup skipped:', e.message || e); }
        try {
            const coursCollection = db.getSync('cours', []);
            if (production && production.coursId) {
                cours = coursCollection.find(c => c.id === production.coursId) || null;
            }
            // Fallback vers le cours actif
            if (!cours && coursCollection.length > 0) {
                cours = coursCollection.find(c => c.actif) || coursCollection[0];
            }
        } catch(e) { console.warn('[PDF-Export] cours lookup skipped:', e.message || e); }

        // Nom du cours et code
        if (cours && (cours.codeCours || cours.nomCours)) {
            doc.setFontSize(cfg.polices.texteNormal);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.textePrincipal);
            let texteCours = '';
            if (cours.codeCours) texteCours += cours.codeCours;
            if (cours.codeCours && cours.nomCours) texteCours += ' — ';
            if (cours.nomCours) texteCours += cours.nomCours;
            doc.text(texteCours, margeG, y);
            y += mm(5);
        }

        // Nom de la grille (italique, gris)
        if (evaluation.grilleNom) {
            doc.setFontSize(cfg.polices.texteNormal);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...cfg.couleurs.texteSecondaire);
            doc.text('Grille : ' + evaluation.grilleNom, margeG, y);
            y += mm(6);
        }
        try {
            // ✅ ANONYMISATION (Tier 0.1) : clé de base sans double namespace
            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
            etudiant = etudiants.find(e => e.da === fichier.etudiantDA) || null;
        } catch(e) { console.warn('[PDF-Export] etudiant lookup skipped:', e.message || e); }

        doc.setFontSize(cfg.polices.texteNormal);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...cfg.couleurs.textePrincipal);

        // Helper pour texte long avec wrapping
        function ajouterTexteWrappe(label, texte) {
            const lignes = doc.splitTextToSize(label + texte, largeurContenu);
            for (const ligne of lignes) {
                doc.text(ligne, margeG, y);
                y += mm(4.5);
            }
            y += mm(1);
        }

        if (opts.description && production && production.description) {
            ajouterTexteWrappe('Production : ', production.description);
        }
        if (opts.objectif && production && production.objectif) {
            ajouterTexteWrappe('Objectif : ', production.objectif);
        }
        if (opts.tache && production && production.tache) {
            ajouterTexteWrappe('Tâche : ', production.tache);
        }


        // --- LAYOUT 2 COLONNES ---
        const colGap = mm(3);
        const colLargeur = (largeurContenu - colGap) / 2;
        const colDroiteX = margeG + colLargeur + colGap;
        const margeDroiteColG = pageW - margeG - colLargeur;
        const yDebutColonnes = y;
        const pageDebutColonnes = doc.internal.getCurrentPageInfo().pageNumber;

        // =============== COLONNE GAUCHE : Critères + Note ===============
        let yGauche = yDebutColonnes;

        // Charger la cartouche pour les textes de contexte
        let cartouchePdf = null;
        if (evaluation.cartoucheId && evaluation.grilleId) {
            try {
                const cartouches = db.getSync('cartouches_' + evaluation.grilleId, []);
                cartouchePdf = cartouches.find(function(c) { return c.id === evaluation.cartoucheId; }) || null;
            } catch(e) { console.warn('[PDF-Export] cartouche lookup skipped:', e.message || e); }
        }

        if (evaluation.criteres && evaluation.criteres.length > 0) {
            doc.setFontSize(cfg.polices.titreSection - 2);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.titreSection);
            doc.text('R\u00e9troaction g\u00e9n\u00e9rale', margeG, yGauche);
            yGauche += mm(3);

            // Contexte de la retroaction generale (depuis la cartouche, ou rien)
            var texteContexteGeneral = (cartouchePdf && cartouchePdf.contexte) ? cartouchePdf.contexte : '';
            if (texteContexteGeneral) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(cfg.polices.textePetit - 1);
                doc.setTextColor(...cfg.couleurs.texteSecondaire);
                const lignesNoteGen = doc.splitTextToSize(texteContexteGeneral, colLargeur);
                doc.text(lignesNoteGen, margeG, yGauche);
                yGauche += lignesNoteGen.length * mm(3.5) + mm(2);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...cfg.couleurs.textePrincipal);
            }

            // Chercher la grille pour les descriptions de criteres
            let grilleDef = null;
            try {
                const grilles = db.getSync('grillesTemplates', []);
                grilleDef = grilles.find(g => g.id === evaluation.grilleId) || null;
            } catch(e) { console.warn('[PDF-Export] grille lookup skipped:', e.message || e); }

            // Trier : forces (M/E) en premier, defis (I/D) ensuite
            const ordreNiveau = { 'E': 0, 'M': 1, 'D': 2, 'I': 3 };
            const criteresTriees = [...evaluation.criteres].sort((a, b) => {
                const nA = ordreNiveau[a.niveauSelectionne] ?? 4;
                const nB = ordreNiveau[b.niveauSelectionne] ?? 4;
                return nA - nB;
            });

            const niveauxParLigne = [];
            const donneesCriteres = criteresTriees.map(c => {
                niveauxParLigne.push(c.niveauSelectionne || '');
                let cellCritere = c.critereNom || '';
                if (grilleDef && grilleDef.criteres) {
                    const critDef = grilleDef.criteres.find(gc => gc.nom === c.critereNom || gc.id === c.critereId);
                    if (critDef && critDef.description) {
                        cellCritere += '\n' + critDef.description;
                    }
                }
                // ✅ ANONYMISATION (Tier 0.3) : anonymiser les prénoms dans les rétroactions
                const retroAnon = typeof anonymiserTexteRetroaction === 'function'
                    ? anonymiserTexteRetroaction(c.retroaction || '', evaluation.etudiantDA)
                    : (c.retroaction || '');
                return [
                    cellCritere,
                    c.niveauSelectionne || '\u2014',
                    retroAnon
                ];
            });

            doc.autoTable({
                startY: yGauche,
                head: [['Crit\u00e8re', 'Niv.', 'R\u00e9troaction']],
                body: donneesCriteres,
                theme: 'grid',
                headStyles: {
                    fillColor: cfg.couleurs.titreSection,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: cfg.polices.textePetit - 1
                },
                bodyStyles: {
                    fontSize: cfg.polices.textePetit - 1,
                    textColor: cfg.couleurs.textePrincipal,
                    cellPadding: mm(1.2)
                },
                columnStyles: {
                    0: { cellWidth: colLargeur * 0.22 },
                    1: { cellWidth: colLargeur * 0.08, halign: 'center' },
                    2: { cellWidth: colLargeur * 0.70 }
                },
                margin: { left: margeG, right: margeDroiteColG },
                willDrawCell: function(data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        const raw = data.cell.raw || '';
                        if (raw.includes('\n')) {
                            data.cell.text = [''];
                        }
                    }
                },
                didParseCell: function(data) {
                    if (data.section === 'body') {
                        if (data.column.index === 0) {
                            const texte = data.cell.text.join('\n');
                            if (!texte.includes('\n')) {
                                data.cell.styles.fontStyle = 'bold';
                            }
                        }
                    }
                },
                didDrawCell: function(data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        const raw = data.cell.raw || '';
                        const parties = raw.split('\n');
                        if (parties.length > 1) {
                            const x = data.cell.x + data.cell.padding('left');
                            const fontSize = data.cell.styles.fontSize;
                            const lineH = fontSize * 0.352 * 1.15;
                            let yCell = data.cell.y + data.cell.padding('top') + fontSize * 0.352;
                            const maxW = data.cell.width - data.cell.padding('left') - data.cell.padding('right');
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(fontSize);
                            doc.setTextColor(...data.cell.styles.textColor);
                            const lignesNom = doc.splitTextToSize(parties[0], maxW);
                            doc.text(lignesNom, x, yCell);
                            yCell += lignesNom.length * lineH + lineH * 0.5;
                            const descFontSize = fontSize - 1;
                            doc.setFont('helvetica', 'italic');
                            doc.setFontSize(descFontSize);
                            const lignesDesc = doc.splitTextToSize(parties.slice(1).join('\n'), maxW);
                            doc.text(lignesDesc, x, yCell, { lineHeightFactor: 1.15 });
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(fontSize);
                        }
                    }
                }
            });

            yGauche = doc.lastAutoTable.finalY + mm(6);
        }

        // --- NOTE FINALE + NIVEAU (colonne gauche) ---
        let modeNote = null;
        if (opts.affichageNote) modeNote = opts.affichageNote;
        if (!modeNote) {
            const radioUI = document.querySelector('input[name="affichageNote1"]:checked');
            if (radioUI) modeNote = radioUI.value;
        }
        if (!modeNote) {
            try {
                const pratiqueId = typeof obtenirPratiqueActiveGroupeCours === 'function'
                    ? obtenirPratiqueActiveGroupeCours() : null;
                const configurations = db.getSync('pratiquesConfigurables', []);
                const pratiqueActive = pratiqueId ? configurations.find(p => p.id === pratiqueId) : null;
                if (pratiqueActive && pratiqueActive.affichageNote) modeNote = pratiqueActive.affichageNote;
            } catch(e) { console.warn('[PDF-Export] pratique affichageNote fallback:', e.message || e); }
        }
        if (!modeNote) modeNote = 'complet';

        if (evaluation.noteFinale != null || evaluation.niveauFinal) {
            if (yGauche > seuilPage) {
                doc.addPage([612, 792], 'portrait');
                yGauche = mm(cfg.marges.haut);
            }
            doc.setFontSize(cfg.polices.texteNormal);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.textePrincipal);

            let texteNote = '';
            if (modeNote === 'lettre') {
                if (evaluation.niveauFinal) texteNote = 'Niveau : ' + evaluation.niveauFinal;
            } else {
                if (evaluation.noteFinale != null) texteNote += 'Note : ' + evaluation.noteFinale + '%';
                if (evaluation.noteFinale != null && evaluation.niveauFinal) texteNote += '  ';
                if (evaluation.niveauFinal) texteNote += evaluation.niveauFinal;
            }
            if (texteNote) {
                doc.text(texteNote, margeG, yGauche);
                yGauche += mm(5);
            }
        }

        // =============== COLONNE DROITE : Tampons + Erreurs ===============
        doc.setPage(pageDebutColonnes);
        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
        const statsVisuelles = compterAnnotationsDetailees(annotation);

        let yDroite = yDebutColonnes;
        if (statsVisuelles.totalTampons > 0 || statsVisuelles.totalErreursFr > 0) {
            yDroite = ajouterSyntheseVisuelle(doc, yDebutColonnes, statsVisuelles, seuilPage, {
                margeG: colDroiteX,
                margeD: margeD,
                largeur: colLargeur,
                contexteSpecifique: (cartouchePdf && cartouchePdf.contexteSpecifique) ? cartouchePdf.contexteSpecifique : ''
            });
        }

        // --- BILAN (colonne droite, sous tampons/erreurs) ---
        var NOMS_NIV = { 'E': '\u00c9tendu', 'M': 'Ma\u00eetris\u00e9', 'D': 'En d\u00e9veloppement', 'I': 'Incomplet' };
        var ORDRE_NIV = { 'E': 4, 'M': 3, 'D': 2, 'I': 1, '0': 0 };
        var da = evaluation.etudiantDA;

        // Charger l'historique de l'eleve
        var historiqueEleve = [];
        try {
            // ✅ ANONYMISATION (Tier 0.1) : passer par obtenirDonneesSelonMode pour namespace + filtrage cours
            var toutesEvals = obtenirDonneesSelonMode('evaluationsSauvegardees');
            historiqueEleve = toutesEvals
                .filter(function(e) { return e.etudiantDA === da && !e.remplaceeParId && e.id !== evaluation.id; })
                .sort(function(a, b) { return new Date(b.dateEvaluation) - new Date(a.dateEvaluation); })
                .slice(0, 5);
        } catch(e) { console.warn('[PDF-Export] historique eleve load skipped:', e.message || e); }
        var evalPrecedente = historiqueEleve.length > 0 ? historiqueEleve[0] : null;

        // Charger la grille pour les descriptions de criteres
        var grilleBilan = null;
        try {
            var grillesBilan = db.getSync('grillesTemplates', []);
            grilleBilan = grillesBilan.find(function(g) { return g.id === evaluation.grilleId; }) || null;
        } catch(e) { console.warn('[PDF-Export] grille bilan lookup skipped:', e.message || e); }

        // Detecter les patrons recurrents (I/D sur 3 productions)
        var nomsPatrons = [];
        if (historiqueEleve.length >= 2 && evaluation.criteres) {
            var cH1 = {}; var cH2 = {};
            if (historiqueEleve[0] && historiqueEleve[0].criteres) historiqueEleve[0].criteres.forEach(function(c) { cH1[c.critereNom] = c.niveauSelectionne; });
            if (historiqueEleve[1] && historiqueEleve[1].criteres) historiqueEleve[1].criteres.forEach(function(c) { cH2[c.critereNom] = c.niveauSelectionne; });
            evaluation.criteres.forEach(function(c) {
                if ((c.niveauSelectionne === 'I' || c.niveauSelectionne === 'D') &&
                    (cH1[c.critereNom] === 'I' || cH1[c.critereNom] === 'D') &&
                    (cH2[c.critereNom] === 'I' || cH2[c.critereNom] === 'D')) {
                    nomsPatrons.push(c.critereNom);
                }
            });
        }

        // Construire les lignes du bilan
        var bilanLignes = [];
        var wCol = colLargeur - mm(4);

        if (evaluation.criteres && evaluation.criteres.length > 0) {
            // Priorités (2 plus faibles avec description de la grille)
            var defis = evaluation.criteres
                .filter(function(c) { return c.niveauSelectionne === 'I' || c.niveauSelectionne === 'D'; })
                .sort(function(a, b) { return (ORDRE_NIV[a.niveauSelectionne] || 0) - (ORDRE_NIV[b.niveauSelectionne] || 0); });
            var tousMaitrises = defis.length === 0;

            if (defis.length > 0) {
                for (var ip = 0; ip < Math.min(2, defis.length); ip++) {
                    var d = defis[ip];
                    var descCrit = '';
                    if (grilleBilan && grilleBilan.criteres) {
                        var critDef = grilleBilan.criteres.find(function(gc) { return gc.nom === d.critereNom || gc.id === d.critereId; });
                        if (critDef && critDef.description) descCrit = critDef.description.toLowerCase();
                    }
                    var txtPrio = descCrit ? descCrit : d.critereNom;
                    txtPrio += ' (' + d.critereNom + ' ' + (NOMS_NIV[d.niveauSelectionne] || '') + ')';
                    if (nomsPatrons.indexOf(d.critereNom) !== -1) {
                        txtPrio += '. Cet objectif est prioritaire depuis 3 productions';
                    }
                    bilanLignes.push({ type: 'priorite', texte: txtPrio });
                }
                // Ta force (en contexte, seulement si des défis existent)
                var meilleur = null; var meilleurOrdre = 0;
                evaluation.criteres.forEach(function(c) {
                    var o = ORDRE_NIV[c.niveauSelectionne] || 0;
                    if (o > meilleurOrdre) { meilleurOrdre = o; meilleur = c; }
                });
                if (meilleur && (meilleur.niveauSelectionne === 'M' || meilleur.niveauSelectionne === 'E')) {
                    bilanLignes.push({ type: 'force', texte: 'Ta force : ' + meilleur.critereNom + ' (' + (NOMS_NIV[meilleur.niveauSelectionne] || '') + ')' });
                }
            } else if (tousMaitrises && statsVisuelles && statsVisuelles.totalErreursFr > 0) {
                bilanLignes.push({ type: 'priorite', texte: 'Tous les crit\u00e8res sont ma\u00eetris\u00e9s. Concentre-toi sur la qualit\u00e9 du fran\u00e7ais (' + statsVisuelles.totalErreursFr + ' erreur' + (statsVisuelles.totalErreursFr > 1 ? 's' : '') + ' annot\u00e9e' + (statsVisuelles.totalErreursFr > 1 ? 's' : '') + ').' });
            } else if (tousMaitrises) {
                var maitriseLongtemps = evalPrecedente && evalPrecedente.criteres &&
                    evalPrecedente.criteres.every(function(c) { return c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E'; });
                if (maitriseLongtemps) {
                    bilanLignes.push({ type: 'force', texte: 'Tous les crit\u00e8res sont ma\u00eetris\u00e9s depuis plus d\u2019un artefact. Tu peux aider tes coll\u00e8gues \u2014 c\u2019est une excellente fa\u00e7on d\u2019\u00e9tendre tes comp\u00e9tences vers le niveau \u00c9 (transfert \u00e0 d\u2019autres contextes).' });
                } else {
                    bilanLignes.push({ type: 'force', texte: 'Tous les crit\u00e8res sont ma\u00eetris\u00e9s. Continue sur cette lanc\u00e9e !' });
                }
            }
        }

        // Tampons actionnables (top 2 + retroaction)
        if (statsVisuelles.totalTampons > 0) {
            var retroObsBilan = travauxOutils.obtenirRetroactionsObservations();
            var autocollantsBilan = travauxOutils.AUTOCOLLANTS;
            var idsTries = Object.keys(statsVisuelles.tampons).sort(function(a, b) { return statsVisuelles.tampons[b] - statsVisuelles.tampons[a]; });
            var tampAff = 0;
            var lignesTamp = [];
            for (var it = 0; it < idsTries.length && tampAff < 2; it++) {
                var tid = idsTries[it];
                var retroT = retroObsBilan[tid] || '';
                if (!retroT) continue;
                var tDef = autocollantsBilan.find(function(a) { return a.id === tid; });
                var tNom = tDef ? tDef.nom : tid;
                var tNb = statsVisuelles.tampons[tid];
                var retroTronq = retroT.length > 80 ? retroT.substring(0, 80) + '...' : retroT;
                lignesTamp.push({ type: 'tampon', texte: tNom + ' (' + tNb + ' occurrence' + (tNb > 1 ? 's' : '') + ') -- ' + retroTronq });
                tampAff++;
            }
            if (lignesTamp.length > 0) {
                bilanLignes.push({ type: 'titre', texte: 'Points r\u00e9currents :' });
                for (var lt = 0; lt < lignesTamp.length; lt++) bilanLignes.push(lignesTamp[lt]);
            }
        }

        // Francais (total + type principal)
        if (statsVisuelles.totalErreursFr > 0) {
            var codesErrBilan = travauxOutils.CODES_ERREURS_FR;
            var typesPrinc = Object.keys(statsVisuelles.erreursFr).sort(function(a, b) { return statsVisuelles.erreursFr[b] - statsVisuelles.erreursFr[a]; });
            var nomErrPrinc = '';
            if (typesPrinc.length > 0) {
                var codePrinc = codesErrBilan.find(function(c) { return c.id === typesPrinc[0]; });
                nomErrPrinc = codePrinc ? codePrinc.nom : '';
            }
            bilanLignes.push({ type: 'francais', texte: 'Fran\u00e7ais : ' + statsVisuelles.totalErreursFr + ' erreur' + (statsVisuelles.totalErreursFr > 1 ? 's' : '') + (nomErrPrinc ? ' (principalement : ' + nomErrPrinc + ')' : '') });
        }

        // Progression (comparaison de l'élève avec lui-même)
        if (evalPrecedente && evaluation.niveauFinal && evalPrecedente.niveauFinal) {
            var nivAct = evaluation.niveauFinal;
            var nivPre = evalPrecedente.niveauFinal;
            var ordreAct = ORDRE_NIV[nivAct] || 0;
            var ordrePre = ORDRE_NIV[nivPre] || 0;
            if (ordreAct >= ordrePre) {
                var prodPrec = evalPrecedente.productionNom || 'la production pr\u00e9c\u00e9dente';
                if (ordreAct > ordrePre) {
                    bilanLignes.push({ type: 'progression', texte: 'Progr\u00e8s : ' + nivPre + ' \u2192 ' + nivAct + ' depuis ' + prodPrec });
                }
                // Parcours sur plusieurs productions
                if (historiqueEleve.length >= 2) {
                    var niveaux = [ordreAct];
                    for (var ih = 0; ih < historiqueEleve.length; ih++) niveaux.push(ORDRE_NIV[historiqueEleve[ih].niveauFinal] || 0);
                    var moitie = Math.floor(niveaux.length / 2);
                    var moyR = 0; var moyA = 0;
                    for (var ir = 0; ir < moitie; ir++) moyR += niveaux[ir]; moyR /= moitie;
                    for (var ia = moitie; ia < niveaux.length; ia++) moyA += niveaux[ia]; moyA /= (niveaux.length - moitie);
                    if (moyR >= moyA - 0.3) {
                        var tend = moyR > moyA + 0.3 ? 'en progr\u00e8s' : 'en consolidation';
                        bilanLignes.push({ type: 'tendance', texte: 'Parcours sur ' + niveaux.length + ' productions : ' + tend });
                    }
                }
            }
        }

        // Amelioration reconnue
        if (evalPrecedente && evaluation.criteres) {
            var criteresPrec = {};
            if (evalPrecedente.criteres) evalPrecedente.criteres.forEach(function(c) { criteresPrec[c.critereNom] = c.niveauSelectionne; });
            var ameliorations = [];
            evaluation.criteres.forEach(function(c) {
                var nivP = criteresPrec[c.critereNom];
                if (nivP && (nivP === 'I' || nivP === 'D') && (c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E')) {
                    ameliorations.push(c.critereNom);
                }
            });
            if (ameliorations.length > 0) {
                bilanLignes.push({ type: 'amelioration', texte: 'Tu as progress\u00e9 en ' + ameliorations.join(' et ') + '.' });
            }
        }

        // 🔧 REFONTE (29 mars 2026) : Portrait complet des jetons utilisés
        // Affiche un compteur global X / 2 + détail par artefact
        if (typeof obtenirConfigJetons === 'function' && da) {
            try {
                var configJetons = obtenirConfigJetons();
                if (configJetons && configJetons.actif) {
                    var maxJetons = configJetons.reprise ? configJetons.reprise.nombre : 2;
                    // ✅ ANONYMISATION (Tier 0.1) : clé de base sans double namespace
                    var toutesEvals = obtenirDonneesSelonMode('evaluationsSauvegardees');
                    var productions = obtenirDonneesSelonMode('productions') || [];

                    // Collecter les jetons utilisés (évaluations actives seulement)
                    var jetonsUtilises = [];
                    toutesEvals.filter(function(e) {
                        return e.etudiantDA === da && !e.remplaceeParId;
                    }).forEach(function(e) {
                        var prod = productions.find(function(p) { return p.id === e.productionId; });
                        var nomProd = prod ? (prod.titre || prod.nom || e.productionId) : e.productionId;
                        if (e.jetonDelaiApplique) {
                            jetonsUtilises.push({ type: 'D\u00e9lai', artefact: nomProd });
                        }
                        if (e.jetonRepriseApplique || e.repriseDeId) {
                            jetonsUtilises.push({ type: 'Reprise', artefact: nomProd });
                        }
                        if (e.jetonRepriseCibleeApplique) {
                            jetonsUtilises.push({ type: 'Reprise cibl\u00e9e', artefact: nomProd });
                        }
                    });

                    var nbUtilises = jetonsUtilises.length;
                    bilanLignes.push({ type: 'jetons', texte: 'Jetons utilis\u00e9s : ' + nbUtilises + ' / ' + maxJetons });
                    if (nbUtilises > 0) {
                        jetonsUtilises.forEach(function(j) {
                            bilanLignes.push({ type: 'jetons', texte: '  \u2022 ' + j.type + ' \u2014 ' + j.artefact });
                        });
                    }
                }
            } catch(e) { console.warn('[PDF-Export] jetons calculation skipped:', e.message || e); }
        }

        // --- RENDU du Bilan sous forme de tableau (même style que Rétroaction) ---
        // Construire les 3 rangées du tableau Bilan
        var bilanTableBody = [];

        // Rangée 1 : Se concentrer sur...
        var texteConcentrer = '';
        var forceTexte = bilanLignes.filter(function(l) { return l.type === 'force'; }).map(function(l) { return l.texte; }).join('\n');
        var prioTextes = bilanLignes.filter(function(l) { return l.type === 'priorite'; }).map(function(l) { return '- ' + l.texte; }).join('\n');
        if (forceTexte) texteConcentrer += forceTexte + '\n';
        if (prioTextes) texteConcentrer += prioTextes;
        if (!texteConcentrer) texteConcentrer = 'Aucun d\u00e9fi identifi\u00e9.';
        bilanTableBody.push(['Pr\u00e9sentement,\nil faut se\nconcentrer sur...', texteConcentrer.trim()]);

        // Rangée 2 : Points récurrents
        var texteRecurrents = '';
        var tampTextes = bilanLignes.filter(function(l) { return l.type === 'tampon'; }).map(function(l) { return '- ' + l.texte; }).join('\n');
        if (tampTextes) texteRecurrents += tampTextes;
        var frTextes = bilanLignes.filter(function(l) { return l.type === 'francais'; }).map(function(l) { return l.texte; }).join('\n');
        if (frTextes) texteRecurrents += (texteRecurrents ? '\n' : '') + frTextes;
        var progTextes = bilanLignes.filter(function(l) { return l.type === 'progression' || l.type === 'tendance'; }).map(function(l) { return l.texte; }).join('\n');
        if (progTextes) texteRecurrents += (texteRecurrents ? '\n' : '') + progTextes;
        var amelTextes = bilanLignes.filter(function(l) { return l.type === 'amelioration'; }).map(function(l) { return l.texte; }).join('\n');
        if (amelTextes) texteRecurrents += (texteRecurrents ? '\n' : '') + amelTextes;
        if (!texteRecurrents) texteRecurrents = 'Aucun point r\u00e9current.';
        bilanTableBody.push(['Points\nr\u00e9currents', texteRecurrents.trim()]);

        // Rangée 3 : Jetons utilisés
        var jetonsLignes = bilanLignes.filter(function(l) { return l.type === 'jetons'; });
        var texteJetons = jetonsLignes.map(function(l) { return l.texte; }).join('\n');
        if (!texteJetons) texteJetons = 'Aucun jeton utilis\u00e9.';
        bilanTableBody.push(['Jetons\nutilis\u00e9s', texteJetons.trim()]);

        if (yDroite + mm(30) > seuilPage) {
            doc.addPage([612, 792], 'portrait');
            yDroite = mm(cfg.marges.haut);
        }

        // Titre de section
        doc.setFontSize(cfg.polices.titreSection - 2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...cfg.couleurs.titreSection);
        doc.text('Bilan', colDroiteX, yDroite);
        yDroite += mm(5);

        // Description (même style que Rétroaction générale/spécifique)
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(cfg.polices.textePetit - 2);
        doc.setTextColor(...cfg.couleurs.texteSecondaire);
        var descBilan = 'Mes standards sont tr\u00e8s \u00e9lev\u00e9s \u00e0 ton \u00e9gard parce que je crois que tu as tout ce qu\u2019il faut pour les atteindre et j\u2019ai confiance en toi. Si tu as besoin d\u2019aide, viens me voir.\nSelon toi, quel aspect de ta production m\u00e9riterait le plus d\u2019attention ?';
        var descRendu = doc.splitTextToSize(descBilan, colLargeur);
        for (var idesc = 0; idesc < descRendu.length; idesc++) {
            doc.text(descRendu[idesc], colDroiteX, yDroite);
            yDroite += mm(3.5);
        }
        yDroite += mm(2);

        doc.autoTable({
            startY: yDroite,
            head: [['Section', 'D\u00e9tail']],
            body: bilanTableBody,
            theme: 'grid',
            headStyles: {
                fillColor: cfg.couleurs.titreSection,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: cfg.polices.textePetit - 1
            },
            bodyStyles: {
                fontSize: cfg.polices.textePetit - 2,
                textColor: cfg.couleurs.textePrincipal,
                cellPadding: mm(1.2)
            },
            columnStyles: {
                0: { cellWidth: colLargeur * 0.25, fontStyle: 'bold', fontSize: cfg.polices.textePetit - 1 },
                1: { cellWidth: colLargeur * 0.75 }
            },
            margin: { left: colDroiteX, right: mm(cfg.marges.droite) },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 0) {
                    data.cell.styles.valign = 'middle';
                }
            }
        });

        yDroite = doc.lastAutoTable.finalY + mm(4);

        yDroite += mm(0.5);


        // =============== SUITE (pleine largeur) ===============
        y = Math.max(yGauche, yDroite) + mm(10);

        // --- PIEDS DE PAGE ---
        finaliserPagesSynthese(doc, premierePageSynthese);
    }

    /**
     * Convertit l'image d'un autocollant en dataURL PNG
     * @param {string} id - ID de l'autocollant
     * @returns {string|null} dataURL ou null si indisponible
     */
    function autocollantToDataURL(id, tint) {
        const img = travauxOutils.getImageAutocollant(id);
        if (!img || !img.complete) return null;
        try {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            if (tint) {
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = tint;
                ctx.fillRect(0, 0, c.width, c.height);
            }
            return c.toDataURL('image/png');
        } catch(e) {
            return null;
        }
    }

    /**
     * Ajoute la section de synthese visuelle (tampons + erreurs de francais)
     * @param {Object} doc - Instance jsPDF
     * @param {number} posY - Position Y courante
     * @param {Object} stats - Resultat de compterAnnotationsDetailees
     * @param {number} seuilPage - Seuil Y pour saut de page
     * @param {Object} [zone] - Zone de rendu (layout 2 colonnes) { margeG, margeD, largeur }
     * @returns {number} Nouvelle posY
     */
    function _hexVersRgb(hex) {
        if (!hex) return null;
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        return [parseInt(hex.substring(0,2),16), parseInt(hex.substring(2,4),16), parseInt(hex.substring(4,6),16)];
    }

    function ajouterSyntheseVisuelle(doc, posY, stats, seuilPage, zone) {
        const cfg = getCfg();
        const pageW = doc.internal.pageSize.getWidth();
        // Si zone fournie, utiliser ses dimensions (layout 2 colonnes)
        const margeG = zone ? zone.margeG : mm(cfg.marges.gauche);
        const margeD = zone ? zone.margeD : mm(cfg.marges.droite);
        const largeurContenu = zone ? zone.largeur : (pageW - mm(cfg.marges.gauche) - mm(cfg.marges.droite));
        let y = posY;

        // --- Tampons par categorie ---
        if (stats.totalTampons > 0) {
            if (y > seuilPage) {
                doc.addPage([612, 792], 'portrait');
                y = mm(cfg.marges.haut);
            }

            doc.setFontSize(cfg.polices.titreSection - 2);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.titreSection);
            doc.text('R\u00e9troaction sp\u00e9cifique', margeG, y);
            y += mm(3);

            // Contexte retroaction specifique (depuis la cartouche)
            var texteContexteSpec = (zone && zone.contexteSpecifique) ? zone.contexteSpecifique : '';
            if (texteContexteSpec) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(cfg.polices.textePetit - 1);
                doc.setTextColor(...cfg.couleurs.texteSecondaire);
                var lignesSpec = doc.splitTextToSize(texteContexteSpec, largeurContenu);
                doc.text(lignesSpec, margeG, y);
                y += lignesSpec.length * mm(3.5) + mm(2);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...cfg.couleurs.textePrincipal);
            }

            const autocollantsDef = travauxOutils.AUTOCOLLANTS;
            const retroObs = travauxOutils.obtenirRetroactionsObservations();
            const nomsCat = travauxOutils.obtenirNomsCategories();
            const ordreCategories = travauxOutils.obtenirOrdreCategories();
            const imgSize = mm(4);

            // Grouper les tampons utilises par categorie (exclure legacy)
            const couleursCat = travauxOutils.obtenirCouleurCategorieAutocollant
                ? null : null; // juste pour reference
            const couleursParCat = {};
            try {
                var cc = db.getSync('couleursCategories', null) || {};
                for (var k in cc) couleursParCat[k] = _hexVersRgb(cc[k]);
            } catch(e) { console.warn('[PDF-Export] couleurs categories load skipped:', e.message || e); }

            for (const catId of ordreCategories) {
                const tamponsCat = autocollantsDef.filter(a => !a.legacy && a.categorie === catId);
                const tamponsUtilises = tamponsCat.filter(a => stats.tampons[a.id]);
                if (tamponsUtilises.length === 0) continue;

                const couleurCat = couleursParCat[catId] || cfg.couleurs.texteSecondaire;

                // Nom de la categorie
                doc.setFontSize(cfg.polices.textePetit);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...cfg.couleurs.textePrincipal);
                doc.text(nomsCat[catId] || catId, margeG, y);
                y += mm(3);

                const donnesCat = [];
                const imagesCat = {};

                // Couleur hex pour teinte des images
                var hexCat = null;
                try {
                    var ccRaw = db.getSync('couleursCategories', null) || {};
                    hexCat = ccRaw[catId] || null;
                } catch(e) { console.warn('[PDF-Export] hex couleur categorie load skipped:', e.message || e); }

                for (let i = 0; i < tamponsUtilises.length; i++) {
                    const a = tamponsUtilises[i];
                    const retroTexte = retroObs[a.id] || '';
                    donnesCat.push([
                        '      ' + a.nom,
                        String(stats.tampons[a.id]),
                        retroTexte
                    ]);
                    const dataUrl = autocollantToDataURL(a.id, hexCat);
                    if (dataUrl) imagesCat[i] = dataUrl;
                }

                if (y > seuilPage) {
                    doc.addPage([612, 792], 'portrait');
                    y = mm(cfg.marges.haut);
                }

                doc.autoTable({
                    startY: y,
                    head: [['Tampon', 'Nb', 'R\u00e9troaction']],
                    body: donnesCat,
                    theme: 'grid',
                    headStyles: {
                        fillColor: cfg.couleurs.titreSection,
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: cfg.polices.textePetit - 1
                    },
                    bodyStyles: {
                        fontSize: cfg.polices.textePetit - 1,
                        textColor: cfg.couleurs.textePrincipal,
                        cellPadding: mm(1),
                        minCellHeight: imgSize + mm(0.5)
                    },
                    columnStyles: {
                        0: { cellWidth: largeurContenu * 0.28 },
                        1: { cellWidth: largeurContenu * 0.10, halign: 'center' },
                        2: { cellWidth: largeurContenu * 0.62, fontSize: cfg.polices.textePetit - 2 }
                    },
                    margin: { left: margeG, right: margeD },
                    didDrawCell: function(data) {
                        if (data.section === 'body' && data.column.index === 0) {
                            const dataUrl = imagesCat[data.row.index];
                            if (dataUrl) {
                                const cellY = data.cell.y + (data.cell.height - imgSize) / 2;
                                doc.addImage(dataUrl, 'PNG', data.cell.x + mm(0.5), cellY, imgSize, imgSize);
                            }
                        }
                    }
                });

                y = doc.lastAutoTable.finalY + mm(4);
            }

            y += mm(4);
        }

        // --- Erreurs de francais (toutes, triees par frequence) ---
        if (stats.totalErreursFr > 0) {
            if (y > seuilPage) {
                doc.addPage([612, 792], 'portrait');
                y = mm(cfg.marges.haut);
            }

            doc.setFontSize(cfg.polices.textePetit);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.titreSection);
            doc.text('Erreurs de fran\u00e7ais', margeG, y);
            y += mm(4);

            const retroFr = travauxOutils.obtenirRetroactionsErreursFr();
            const ordreRecap = travauxOutils.obtenirOrdreErreursFr
                ? travauxOutils.obtenirOrdreErreursFr() : [];

            // Trier par frequence decroissante, garder les 3 plus frequentes
            const typesErreurs = Object.keys(stats.erreursFr).sort((a, b) =>
                stats.erreursFr[b] - stats.erreursFr[a]
            ).slice(0, 3);

            const donnesErreurs = [];
            for (const type of typesErreurs) {
                const idxNum = ordreRecap.indexOf(type);
                const num = idxNum !== -1 ? idxNum + 1 : type.replace('errfr_', '');
                donnesErreurs.push([
                    num,
                    String(stats.erreursFr[type]),
                    retroFr[type] || ''
                ]);
            }

            // Ligne total
            donnesErreurs.push(['Total', String(stats.totalErreursFr), '']);

            doc.autoTable({
                startY: y,
                head: [['Code', 'Nb', 'R\u00e9troaction']],
                body: donnesErreurs,
                theme: 'grid',
                headStyles: {
                    fillColor: cfg.couleurs.titreSection,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: cfg.polices.textePetit - 1
                },
                bodyStyles: {
                    fontSize: cfg.polices.textePetit - 1,
                    textColor: cfg.couleurs.textePrincipal,
                    cellPadding: mm(1)
                },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.10, halign: 'center' },
                    1: { cellWidth: largeurContenu * 0.10, halign: 'center' },
                    2: { cellWidth: largeurContenu * 0.80, fontSize: cfg.polices.textePetit - 2 }
                },
                margin: { left: margeG, right: margeD },
                didParseCell: function(data) {
                    // Seule la ligne total est en gras avec fond
                    if (data.section === 'body' && data.row.index === donnesErreurs.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = cfg.couleurs.fondEntete;
                    }
                }
            });

            y = doc.lastAutoTable.finalY + mm(6);
        } else if (stats.totalTampons > 0) {
            // S'il y a des tampons mais aucune erreur, le mentionner
            doc.setFontSize(cfg.polices.textePetit - 1);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...cfg.couleurs.texteSecondaire);
            doc.text('Aucune erreur de fran\u00e7ais annot\u00e9e.', margeG, y);
            y += mm(5);
        }

        return y;
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
            alert('Aucun fichier trouve pour cet etudiant et cette production.');
            return;
        }

        const blob = await travauxStockage.recupererBlob(fichier.id);
        if (!blob) {
            alert('Impossible de récupérer le fichier.');
            return;
        }

        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);

        try {
            let doc;
            if (fichier.typeMIME === 'application/pdf') {
                doc = await exporterDepuisPDF(blob, annotation);
            } else {
                doc = await exporterDepuisImage(blob, annotation);
            }

            // Ajouter la page de synthese (grille + retroaction)
            ajouterPageSynthese(doc, fichier);

            // Telecharger
            // ✅ ANONYMISATION (Tier 0.1) : clé de base — prenom/nom sont anonymisés par obtenirDonneesSelonMode
            const etudiant = obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === da);
            const nomEtudiant = etudiant ? `${etudiant.prenom}_${etudiant.nom}` : da;
            const nomSortie = `dossier_${nomEtudiant}_${productionId}.pdf`;
            doc.save(nomSortie);

            // Marquer le fichier comme exporte (cycle de vie)
            travauxStockage.marquerExporte(fichier.id);

        } catch (e) {
            console.error('[Travaux-Export] Erreur export dossier complet:', e);
            alert('Erreur lors de l\'export du dossier. Voir la console.');
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
            html += `<p><strong>Autocollants :</strong> ${stats.autocollants} (${stats.autoQualite} qualite, ${stats.autoDiagnostic} diagnostic)</p>`;
        }

        html += '</div>';

        if (evaluation) {
            html += '<div class="travaux-revision-evaluation">';
            html += `<h4>Évaluation : ${echapperHtml(evaluation.grilleNom || '')}</h4>`;

            if (evaluation.criteres && evaluation.criteres.length > 0) {
                html += '<ul class="travaux-revision-criteres">';
                for (const c of evaluation.criteres) {
                    // ✅ ANONYMISATION (Tier 0.3) : anonymiser les prénoms dans les rétroactions
                    const retroTexte = typeof anonymiserTexteRetroaction === 'function'
                        ? anonymiserTexteRetroaction(c.retroaction || '', evaluation.etudiantDA)
                        : (c.retroaction || '');
                    const extrait = retroTexte ? retroTexte.substring(0, 80) + (retroTexte.length > 80 ? '...' : '') : '—';
                    html += `<li><strong>${echapperHtml(c.critereNom)}</strong> — ${echapperHtml(c.niveauSelectionne || '—')}<br><span class="texte-muted">${echapperHtml(extrait)}</span></li>`;
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
                    const cfgs = db.getSync('pratiquesConfigurables', []);
                    const mods = db.getSync('modalitesEvaluation', {});
                    const pId = mods.pratique;
                    const pActive = pId ? (cfgs.find(p => p.id === pId) || cfgs.find(p => p.type === pId)) : null;
                    if (pActive?.affichageNote === 'lettre') modeNotePreview = 'lettre';
                } catch(e) { console.warn('[PDF-Export] pratique affichageNote preview fallback:', e.message || e); }
            }

            if (modeNotePreview === 'lettre') {
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
                        <button class="btn btn-principal" data-action="_travauxRevisionExporter" data-param="${fichierId}">Exporter le PDF</button>
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
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'preview-quicklook-overlay';
        overlay.innerHTML = '<div class="preview-pdf-chargement">Génération du PDF...</div>';
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
        previewPDFPageSuiv: previewPDFPageSuiv
    };

})();
