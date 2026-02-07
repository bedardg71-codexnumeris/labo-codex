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
                dessinerAnnotationsSurCtx(ctx, canvas.width, canvas.height, donneesPage);
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
            dessinerAnnotationsSurCtx(ctx, w, h, donneesPage);
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
    function dessinerAnnotationsSurCtx(ctx, w, h, donneesPage, scale) {
        if (scale == null) scale = EXPORT_SCALE;
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

        // Textes
        if (donneesPage.textAnnotations) {
            for (const texte of donneesPage.textAnnotations) {
                ctx.save();
                ctx.font = `${(texte.fontSize || 14) * scale}px sans-serif`;
                ctx.fillStyle = texte.color || '#FF0000';
                ctx.fillText(texte.text, texte.x * w, texte.y * h);
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
            const epaisseur = outil.sensiblePression
                ? travauxOutils.calculerEpaisseurPression(p.pressure) * (trait.lineWidth / outil.epaisseurDefaut) * scale
                : trait.lineWidth * scale;
            ctx.lineWidth = epaisseur;
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
        ctx.save();
        ctx.strokeStyle = forme.color;
        ctx.lineWidth = (forme.lineWidth || 2) * scale;
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
            case 'fleche': {
                const headLen = 15 * scale;
                const angle = Math.atan2(y2 - y1, x2 - x1);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
                ctx.stroke();
                break;
            }
            case 'crochet': {
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const size = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
                ctx.strokeStyle = forme.color || '#00AA00';
                ctx.lineWidth = 3 * scale;
                ctx.beginPath();
                ctx.moveTo(mx - size, my);
                ctx.lineTo(mx - size * 0.3, my + size * 0.8);
                ctx.lineTo(mx + size, my - size * 0.6);
                ctx.stroke();
                break;
            }
            case 'croix': {
                ctx.strokeStyle = forme.color || '#FF0000';
                ctx.lineWidth = 3 * scale;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.moveTo(x2, y1);
                ctx.lineTo(x1, y2);
                ctx.stroke();
                break;
            }
        }

        ctx.restore();
    }

    /* ===============================
       PAGE DE SYNTHESE
       =============================== */

    /**
     * Ajoute une page de synthese avec les cartouches de retroaction
     * @param {Object} doc - Instance jsPDF
     * @param {Object} fichier - Metadonnees du fichier
     */
    function ajouterPageSynthese(doc, fichier) {
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

        // Page lettre en mm
        doc.addPage([612, 792], 'portrait'); // 8.5x11 pouces en px a 72dpi
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const marge = 40;
        let y = marge;

        // Titre
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Synthese de la retroaction', pageW / 2, y, { align: 'center' });
        y += 30;

        // Informations
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Etudiant : ${evaluation.etudiantNom || fichier.etudiantDA}`, marge, y);
        y += 16;
        doc.text(`Production : ${evaluation.productionNom || ''}`, marge, y);
        y += 16;
        doc.text(`Grille : ${evaluation.grilleNom || ''}`, marge, y);
        y += 16;
        doc.text(`Date : ${new Date(evaluation.dateEvaluation).toLocaleDateString('fr-CA')}`, marge, y);
        y += 24;

        // Separateur
        doc.setDrawColor(200);
        doc.line(marge, y, pageW - marge, y);
        y += 16;

        // Criteres et retroaction
        if (evaluation.criteres && evaluation.criteres.length > 0) {
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text('Evaluation par critere', marge, y);
            y += 20;

            for (const critere of evaluation.criteres) {
                // Verifier s'il reste de la place
                if (y > pageH - 80) {
                    doc.addPage();
                    y = marge;
                }

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(`${critere.critereNom}`, marge, y);

                doc.setFont('helvetica', 'normal');
                doc.text(`   Niveau : ${critere.niveauSelectionne || '—'}`, marge + 200, y);
                y += 14;

                if (critere.retroaction) {
                    doc.setFontSize(10);
                    const lignes = doc.splitTextToSize(critere.retroaction, pageW - marge * 2 - 10);
                    for (const ligne of lignes) {
                        if (y > pageH - 40) {
                            doc.addPage();
                            y = marge;
                        }
                        doc.text(ligne, marge + 10, y);
                        y += 12;
                    }
                }

                y += 8;
            }
        }

        // Note finale
        if (y > pageH - 60) {
            doc.addPage();
            y = marge;
        }

        doc.setDrawColor(200);
        doc.line(marge, y, pageW - marge, y);
        y += 16;

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        if (evaluation.noteFinale != null) {
            doc.text(`Note finale : ${evaluation.noteFinale}%`, marge, y);
            y += 16;
        }
        if (evaluation.niveauFinal) {
            doc.text(`Niveau : ${evaluation.niveauFinal}`, marge, y);
            y += 20;
        }

        // Retroaction finale
        if (evaluation.retroactionFinale) {
            if (y > pageH - 80) {
                doc.addPage();
                y = marge;
            }

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Retroaction globale', marge, y);
            y += 14;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const lignes = doc.splitTextToSize(evaluation.retroactionFinale, pageW - marge * 2 - 10);
            for (const ligne of lignes) {
                if (y > pageH - 40) {
                    doc.addPage();
                    y = marge;
                }
                doc.text(ligne, marge + 10, y);
                y += 12;
            }
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
                dessinerAnnotationsSurCtx(ctx, canvas.width, canvas.height, donneesPage, scale);
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
        afficherRevisionExport: afficherRevisionExport,
        fermerRevision: fermerRevision,
        rendrePDFAvecAnnotations: rendrePDFAvecAnnotations,
        dessinerAnnotationsSurCtx: dessinerAnnotationsSurCtx
    };

})();
