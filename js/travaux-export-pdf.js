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
            marges: { haut: 13, bas: 13, gauche: 13, droite: 13 },
            couleurs: { titreSection: [3,46,92], textePrincipal: [51,51,51],
                        texteSecondaire: [102,102,102], bordure: [204,204,204],
                        fondEntete: [245,245,245] },
            polices: { titrePrincipal: 18, titreSection: 14, sousTitre: 12,
                       texteNormal: 10, textePetit: 9 }
        };
    }
    const MM_TO_PX = 612 / 215.9;
    function mm(v) { return v * MM_TO_PX; }

    /* ===============================
       EXPORT PDF PRINCIPAL
       =============================== */

    /**
     * Exporte le fichier courant en PDF avec annotations et synthese
     * @param {string} fichierId - ID du fichier a exporter
     */
    async function exporterPDF(fichierId) {
        if (!fichierId) {
            alert('Aucun fichier selectionne.');
            return;
        }

        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) {
            alert('Fichier introuvable.');
            return;
        }

        const blob = await travauxStockage.recupererBlob(fichierId);
        if (!blob) {
            alert('Impossible de recuperer le fichier.');
            return;
        }

        const annotation = travauxStockage.obtenirAnnotationFichier(fichierId);

        try {
            let doc;
            if (fichier.typeMIME === 'application/pdf') {
                doc = await exporterDepuisPDF(blob, annotation);
            } else {
                doc = await exporterDepuisImage(blob, annotation);
            }

            // Ajouter la page de synthese si une evaluation existe
            ajouterPageSynthese(doc, fichier);

            // Telecharger
            const nomSortie = fichier.nomFichier.replace(/\.[^.]+$/, '') + '_annote.pdf';
            doc.save(nomSortie);

            // Marquer le fichier comme exporte (cycle de vie)
            travauxStockage.marquerExporte(fichierId);

            console.log('[Travaux-Export] PDF exporte:', nomSortie);
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
        // Traits
        if (donneesPage.strokes) {
            for (const trait of donneesPage.strokes) {
                dessinerTrait(ctx, w, h, trait, scale);
            }
        }

        // Formes
        if (donneesPage.shapes) {
            for (const forme of donneesPage.shapes) {
                dessinerForme(ctx, w, h, forme, scale);
            }
        }

        // Textes (avec support multiligne)
        if (donneesPage.textAnnotations) {
            const ratioResolutionTexte = w / travauxOutils.RESOLUTION_REFERENCE;
            for (const texte of donneesPage.textAnnotations) {
                const fontSize = (texte.fontSize || 14) * ratioResolutionTexte;
                ctx.save();
                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillStyle = texte.color || '#FF0000';

                const lignes = (texte.text || '').split('\n');
                const interligne = fontSize * 1.3;
                const xPx = texte.x * w;
                const yPx = texte.y * h;

                for (let i = 0; i < lignes.length; i++) {
                    ctx.fillText(lignes[i], xPx, yPx + i * interligne);
                }

                ctx.restore();
            }
        }

        // Autocollants
        if (donneesPage.stickers) {
            for (const stk of donneesPage.stickers) {
                const img = travauxOutils.getImageAutocollant(stk.autocollantId);
                if (img && img.complete) {
                    ctx.drawImage(img, stk.x * w, stk.y * h, stk.width * w, stk.height * h);
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
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

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
            case 'ligne':
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                break;
            case 'fleche': {
                const headLen = Math.max(12 * ratioResolution, ctx.lineWidth * 5);
                const headAngle = Math.PI / 8;
                const angle = Math.atan2(y2 - y1, x2 - x1);
                const baseX = x2 - headLen * Math.cos(angle);
                const baseY = y2 - headLen * Math.sin(angle);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(baseX, baseY);
                ctx.stroke();
                const ax = x2 - headLen * Math.cos(angle - headAngle);
                const ay = y2 - headLen * Math.sin(angle - headAngle);
                const bx = x2 - headLen * Math.cos(angle + headAngle);
                const by = y2 - headLen * Math.sin(angle + headAngle);
                ctx.fillStyle = ctx.strokeStyle;
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                ctx.lineTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.closePath();
                ctx.fill();
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
                    const numE = forme.type.replace('errfr_', '');
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
        if (infos.etudiant) lignesDroite.push('Etudiant : ' + infos.etudiant);
        if (infos.production) lignesDroite.push('Production : ' + infos.production);
        if (infos.date) lignesDroite.push('Date : ' + infos.date);
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
        let nomEnseignant = '';
        try {
            if (typeof db !== 'undefined' && db.getSync) {
                const profil = db.getSync('profilEnseignant', {});
                if (profil && profil.prenom && profil.nom) {
                    nomEnseignant = profil.prenom + ' ' + profil.nom;
                }
            }
        } catch(e) { /* silencieux */ }
        if (nomEnseignant) {
            doc.setFont('helvetica', 'normal');
            doc.text(nomEnseignant, margeG, yPied);
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
    function ajouterPageSynthese(doc, fichier) {
        const cfg = getCfg();
        const margeG = mm(cfg.marges.gauche);
        const margeD = mm(cfg.marges.droite);

        // Chercher l'evaluation correspondante
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees'));
        const evaluation = evaluations.find(e =>
            e.etudiantDA === fichier.etudiantDA &&
            e.productionId === fichier.productionId
        );

        if (!evaluation) {
            console.log('[Travaux-Export] Pas d\'evaluation trouvee, page de synthese omise');
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
        const dateEval = evaluation.dateEvaluation
            ? new Date(evaluation.dateEvaluation).toLocaleDateString('fr-CA')
            : '';
        let y = ajouterEnteteRetroaction(doc, 'Synthese de la retroaction', {
            etudiant: evaluation.etudiantNom || fichier.etudiantDA || '',
            production: evaluation.productionNom || '',
            date: dateEval
        });

        // Nom de la grille (italique, gris)
        if (evaluation.grilleNom) {
            doc.setFontSize(cfg.polices.texteNormal);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...cfg.couleurs.texteSecondaire);
            doc.text('Grille : ' + evaluation.grilleNom, margeG, y);
            y += mm(6);
        }

        // --- EVALUATION PAR CRITERE (tableau autoTable) ---
        if (evaluation.criteres && evaluation.criteres.length > 0) {
            doc.setFontSize(cfg.polices.titreSection);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.titreSection);
            doc.text('EVALUATION PAR CRITERE', margeG, y);
            y += mm(4);

            const donneesCriteres = evaluation.criteres.map(c => [
                c.critereNom || '',
                c.niveauSelectionne || '\u2014',
                c.ponderation ? c.ponderation + '%' : '\u2014',
                c.retroaction || ''
            ]);

            doc.autoTable({
                startY: y,
                head: [['Critere', 'Niveau', 'Pond.', 'Retroaction']],
                body: donneesCriteres,
                theme: 'grid',
                headStyles: {
                    fillColor: cfg.couleurs.titreSection,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: cfg.polices.textePetit
                },
                bodyStyles: {
                    fontSize: cfg.polices.textePetit,
                    textColor: cfg.couleurs.textePrincipal,
                    cellPadding: mm(1.5)
                },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.25 },
                    1: { cellWidth: largeurContenu * 0.10, halign: 'center' },
                    2: { cellWidth: largeurContenu * 0.10, halign: 'center' },
                    3: { cellWidth: largeurContenu * 0.55 }
                },
                margin: { left: margeG, right: margeD },
                didDrawPage: function() {
                    // autoTable gere les sauts de page automatiquement
                }
            });

            y = doc.lastAutoTable.finalY + mm(6);
        }

        // --- NOTE FINALE + NIVEAU ---
        if (y > seuilPage) {
            doc.addPage([612, 792], 'portrait');
            y = mm(cfg.marges.haut);
        }

        if (evaluation.noteFinale != null || evaluation.niveauFinal) {
            doc.setDrawColor(...cfg.couleurs.bordure);
            doc.setLineWidth(0.5);
            doc.line(margeG, y, pageW - margeD, y);
            y += mm(5);

            doc.setFontSize(cfg.polices.sousTitre);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.textePrincipal);

            let texteNote = '';
            if (evaluation.noteFinale != null) texteNote += 'Note finale : ' + evaluation.noteFinale + '%';
            if (evaluation.noteFinale != null && evaluation.niveauFinal) texteNote += '    ';
            if (evaluation.niveauFinal) texteNote += 'Niveau : ' + evaluation.niveauFinal;
            doc.text(texteNote, margeG, y);
            y += mm(8);
        }

        // --- RETROACTION GLOBALE ---
        if (evaluation.retroactionFinale) {
            if (y > seuilPage) {
                doc.addPage([612, 792], 'portrait');
                y = mm(cfg.marges.haut);
            }

            doc.setFontSize(cfg.polices.titreSection);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.titreSection);
            doc.text('RETROACTION GLOBALE', margeG, y);
            y += mm(5);

            doc.setFontSize(cfg.polices.texteNormal);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...cfg.couleurs.textePrincipal);
            const lignes = doc.splitTextToSize(evaluation.retroactionFinale, largeurContenu);
            for (const ligne of lignes) {
                if (y > seuilPage) {
                    doc.addPage([612, 792], 'portrait');
                    y = mm(cfg.marges.haut);
                }
                doc.text(ligne, margeG, y);
                y += mm(4);
            }
            y += mm(4);
        }

        // --- SYNTHESE DES ANNOTATIONS VISUELLES ---
        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
        const statsVisuelles = compterAnnotationsDetailees(annotation);

        if (statsVisuelles.totalTampons > 0 || statsVisuelles.totalErreursFr > 0) {
            y = ajouterSyntheseVisuelle(doc, y, statsVisuelles, seuilPage);
        }

        // --- PIEDS DE PAGE ---
        finaliserPagesSynthese(doc, premierePageSynthese);
    }

    /**
     * Ajoute la section de synthese visuelle (tampons + erreurs de francais)
     * @param {Object} doc - Instance jsPDF
     * @param {number} posY - Position Y courante
     * @param {Object} stats - Resultat de compterAnnotationsDetailees
     * @param {number} seuilPage - Seuil Y pour saut de page
     * @returns {number} Nouvelle posY
     */
    function ajouterSyntheseVisuelle(doc, posY, stats, seuilPage) {
        const cfg = getCfg();
        const margeG = mm(cfg.marges.gauche);
        const margeD = mm(cfg.marges.droite);
        const pageW = doc.internal.pageSize.getWidth();
        const largeurContenu = pageW - margeG - margeD;
        let y = posY;

        // Titre de section
        if (y > seuilPage) {
            doc.addPage([612, 792], 'portrait');
            y = mm(cfg.marges.haut);
        }

        doc.setFontSize(cfg.polices.titreSection);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...cfg.couleurs.titreSection);
        doc.text('SYNTHESE DES ANNOTATIONS VISUELLES', margeG, y);
        y += mm(6);

        // --- Tableau des tampons ---
        if (stats.totalTampons > 0) {
            doc.setFontSize(cfg.polices.texteNormal);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.textePrincipal);
            doc.text('Tampons utilises :', margeG, y);
            y += mm(3);

            const autocollantsDef = travauxOutils.AUTOCOLLANTS;
            const donnesTampons = [];

            // Trier : qualite d'abord, puis diagnostic
            const ids = Object.keys(stats.tampons);
            const tries = ids.sort((a, b) => {
                const defA = autocollantsDef.find(x => x.id === a);
                const defB = autocollantsDef.find(x => x.id === b);
                const catA = defA?.categorie === 'qualite' ? 0 : 1;
                const catB = defB?.categorie === 'qualite' ? 0 : 1;
                if (catA !== catB) return catA - catB;
                return a.localeCompare(b);
            });

            for (const id of tries) {
                const def = autocollantsDef.find(x => x.id === id);
                donnesTampons.push([
                    def?.nom || id,
                    def?.categorie === 'qualite' ? 'Qualite' : 'Diagnostic',
                    String(stats.tampons[id])
                ]);
            }

            if (y > seuilPage) {
                doc.addPage([612, 792], 'portrait');
                y = mm(cfg.marges.haut);
            }

            doc.autoTable({
                startY: y,
                head: [['Tampon', 'Categorie', 'Nombre']],
                body: donnesTampons,
                theme: 'grid',
                headStyles: {
                    fillColor: cfg.couleurs.fondEntete,
                    textColor: cfg.couleurs.titreSection,
                    fontStyle: 'bold',
                    fontSize: cfg.polices.textePetit
                },
                bodyStyles: {
                    fontSize: cfg.polices.textePetit,
                    textColor: cfg.couleurs.textePrincipal,
                    cellPadding: mm(1.2)
                },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.40 },
                    1: { cellWidth: largeurContenu * 0.35 },
                    2: { cellWidth: largeurContenu * 0.25, halign: 'center' }
                },
                margin: { left: margeG, right: margeD }
            });

            y = doc.lastAutoTable.finalY + mm(6);
        }

        // --- Tableau des erreurs de francais ---
        if (stats.totalErreursFr > 0) {
            doc.setFontSize(cfg.polices.texteNormal);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...cfg.couleurs.textePrincipal);

            if (y > seuilPage) {
                doc.addPage([612, 792], 'portrait');
                y = mm(cfg.marges.haut);
            }

            doc.text('Erreurs de francais :', margeG, y);
            y += mm(3);

            const codesErreurs = travauxOutils.CODES_ERREURS_FR;
            const donnesErreurs = [];

            // Trier par numero de code
            const typesErreurs = Object.keys(stats.erreursFr).sort((a, b) => {
                const numA = parseInt(a.replace('errfr_', ''), 10);
                const numB = parseInt(b.replace('errfr_', ''), 10);
                return numA - numB;
            });

            for (const type of typesErreurs) {
                const num = type.replace('errfr_', '');
                const def = codesErreurs.find(c => c.id === type);
                donnesErreurs.push([
                    num,
                    def?.nom || type,
                    String(stats.erreursFr[type])
                ]);
            }

            // Ligne total en gras
            donnesErreurs.push(['', 'Total des erreurs', String(stats.totalErreursFr)]);

            doc.autoTable({
                startY: y,
                head: [['Code', 'Type d\'erreur', 'Nombre']],
                body: donnesErreurs,
                theme: 'grid',
                headStyles: {
                    fillColor: cfg.couleurs.fondEntete,
                    textColor: cfg.couleurs.titreSection,
                    fontStyle: 'bold',
                    fontSize: cfg.polices.textePetit
                },
                bodyStyles: {
                    fontSize: cfg.polices.textePetit,
                    textColor: cfg.couleurs.textePrincipal,
                    cellPadding: mm(1.2)
                },
                columnStyles: {
                    0: { cellWidth: largeurContenu * 0.12, halign: 'center' },
                    1: { cellWidth: largeurContenu * 0.63 },
                    2: { cellWidth: largeurContenu * 0.25, halign: 'center' }
                },
                margin: { left: margeG, right: margeD },
                didParseCell: function(data) {
                    // Derniere ligne (total) en gras
                    if (data.section === 'body' && data.row.index === donnesErreurs.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            y = doc.lastAutoTable.finalY + mm(4);
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
            alert('Etudiant ou production non specifie.');
            return;
        }

        // Trouver le fichier associe
        const fichiers = travauxStockage.obtenirFichiersTravaux();
        const fichier = fichiers.find(f => f.etudiantDA === da && f.productionId === productionId);

        if (!fichier) {
            alert('Aucun fichier trouve pour cet etudiant et cette production.');
            return;
        }

        const blob = await travauxStockage.recupererBlob(fichier.id);
        if (!blob) {
            alert('Impossible de recuperer le fichier.');
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
            const etudiant = obtenirDonneesSelonMode(cle('groupeEtudiants')).find(e => e.da === da);
            const nomEtudiant = etudiant ? `${etudiant.prenom}_${etudiant.nom}` : da;
            const nomSortie = `dossier_${nomEtudiant}_${productionId}.pdf`;
            doc.save(nomSortie);

            // Marquer le fichier comme exporte (cycle de vie)
            travauxStockage.marquerExporte(fichier.id);

            console.log('[Travaux-Export] Dossier complet exporte:', nomSortie);
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

        // Chercher l'evaluation
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees'));
        const evaluation = evaluations.find(e =>
            e.etudiantDA === fichier.etudiantDA &&
            e.productionId === fichier.productionId
        );

        let html = `
            <div class="modal-overlay actif" id="travaux-modal-revision" onclick="if(event.target===this)travauxExportPDF.fermerRevision()">
                <div class="modal-contenu" style="max-width:600px;max-height:80vh;overflow-y:auto;">
                    <h3>Revision avant export</h3>
                    <div class="travaux-revision-stats">
                        <p><strong>Fichier :</strong> ${echapperHtml(fichier.nomFichier)}</p>
                        <p><strong>Etudiant :</strong> ${echapperHtml(evaluation?.etudiantNom || fichier.etudiantDA || 'Non associe')}</p>
                        <p><strong>Pages annotees :</strong> ${stats.pagesAnnotees} sur ${stats.pagesTotal}</p>
                        <p><strong>Traits :</strong> ${stats.traits} | <strong>Formes :</strong> ${stats.formes} | <strong>Textes :</strong> ${stats.textes}</p>`;

        if (stats.autocollants > 0) {
            html += `<p><strong>Autocollants :</strong> ${stats.autocollants} (${stats.autoQualite} qualite, ${stats.autoDiagnostic} diagnostic)</p>`;
        }

        html += '</div>';

        if (evaluation) {
            html += '<div class="travaux-revision-evaluation">';
            html += `<h4>Evaluation : ${echapperHtml(evaluation.grilleNom || '')}</h4>`;

            if (evaluation.criteres && evaluation.criteres.length > 0) {
                html += '<ul class="travaux-revision-criteres">';
                for (const c of evaluation.criteres) {
                    const extrait = c.retroaction ? c.retroaction.substring(0, 80) + (c.retroaction.length > 80 ? '...' : '') : '—';
                    html += `<li><strong>${echapperHtml(c.critereNom)}</strong> — ${echapperHtml(c.niveauSelectionne || '—')}<br><span class="texte-muted">${echapperHtml(extrait)}</span></li>`;
                }
                html += '</ul>';
            }

            if (evaluation.noteFinale != null) {
                html += `<p><strong>Note :</strong> ${evaluation.noteFinale}%</p>`;
            }
            if (evaluation.niveauFinal) {
                html += `<p><strong>Niveau :</strong> ${echapperHtml(evaluation.niveauFinal)}</p>`;
            }

            html += '</div>';
        } else {
            html += '<p class="texte-muted">Aucune evaluation trouvee pour ce fichier. La page de synthese ne sera pas incluse.</p>';
        }

        html += `
                    <div class="travaux-revision-actions">
                        <button class="btn btn-secondaire" onclick="travauxExportPDF.fermerRevision()">Modifier</button>
                        <button class="btn btn-principal" onclick="travauxExportPDF.fermerRevision(); travauxExportPDF.exporterPDF('${fichierId}');">Exporter le PDF</button>
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

    window.travauxExportPDF = {
        exporterPDF: exporterPDF,
        exporterDossierComplet: exporterDossierComplet,
        afficherRevisionExport: afficherRevisionExport,
        fermerRevision: fermerRevision,
        rendrePDFAvecAnnotations: rendrePDFAvecAnnotations,
        dessinerAnnotationsSurCtx: dessinerAnnotationsSurCtx
    };

})();
