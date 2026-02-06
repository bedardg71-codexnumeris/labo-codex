/* ===============================
   MODULE: TRAVAUX - ARCHIVAGE
   Generation ZIP/PDF, export portfolio

   DEPENDANCES:
   - libs/jszip.min.js (JSZip)
   - travaux-stockage.js
   - travaux-annotation.js (pour aplatir annotations)
   - trimestres.js (cle())
   =============================== */

(function() {
    'use strict';

    /* ===============================
       GENERATION ZIP
       =============================== */

    /**
     * Genere un ZIP contenant les travaux d'un etudiant
     * @param {string} da - DA de l'etudiant
     * @param {Object} options - Options d'export
     * @returns {Promise<Blob>} Le blob ZIP
     */
    async function exporterParEtudiant(da, options = {}) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip non disponible');
        }

        const zip = new JSZip();
        const fichiers = travauxStockage.obtenirFichiersEtudiant(da);
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const etudiant = etudiants.find(e => e.da === da);

        const nomDossier = etudiant
            ? `${etudiant.nom}_${etudiant.prenom}_${da}`
            : `etudiant_${da}`;

        const dossier = zip.folder(nomDossier);

        // Ajouter les fichiers originaux
        for (const fichier of fichiers) {
            const blob = await travauxStockage.recupererBlob(fichier.id);
            if (blob) {
                dossier.file(`originaux/${fichier.nomFichier}`, blob);
            }

            // Ajouter les annotations aplaties si demande
            if (options.inclureAnnotes) {
                const annote = await genererFichierAnnote(fichier);
                if (annote) {
                    const ext = fichier.nomFichier.split('.').pop();
                    const nomAnnote = fichier.nomFichier.replace(`.${ext}`, `_annote.${ext}`);
                    dossier.file(`annotes/${nomAnnote}`, annote);
                }
            }
        }

        // Ajouter les evaluations si demande
        if (options.inclureEvaluations) {
            const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees'));
            const evalsEtudiant = evaluations.filter(e => e.etudiantDA === da);

            if (evalsEtudiant.length > 0) {
                const evalJson = JSON.stringify(evalsEtudiant, null, 2);
                dossier.file('evaluations.json', evalJson);
            }
        }

        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * Genere un ZIP contenant les travaux d'une production
     * @param {string} productionId - ID de la production
     * @param {Object} options - Options d'export
     * @returns {Promise<Blob>} Le blob ZIP
     */
    async function exporterParProduction(productionId, options = {}) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip non disponible');
        }

        const zip = new JSZip();
        const fichiers = travauxStockage.obtenirFichiersProduction(productionId);
        const productions = obtenirDonneesSelonMode(cle('productions'));
        const production = productions.find(p => p.id === productionId);

        const nomDossier = production
            ? (production.titre || production.nom || productionId).replace(/[^a-zA-Z0-9]/g, '_')
            : productionId;

        const dossier = zip.folder(nomDossier);

        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));

        for (const fichier of fichiers) {
            const blob = await travauxStockage.recupererBlob(fichier.id);
            if (!blob) continue;

            const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
            const sousDossier = etudiant
                ? `${etudiant.nom}_${etudiant.prenom}_${fichier.etudiantDA}`
                : (fichier.etudiantDA || 'non-associe');

            dossier.file(`${sousDossier}/${fichier.nomFichier}`, blob);

            if (options.inclureAnnotes) {
                const annote = await genererFichierAnnote(fichier);
                if (annote) {
                    const ext = fichier.nomFichier.split('.').pop();
                    const nomAnnote = fichier.nomFichier.replace(`.${ext}`, `_annote.${ext}`);
                    dossier.file(`${sousDossier}/${nomAnnote}`, annote);
                }
            }
        }

        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * Genere un ZIP complet du semestre
     * @param {Object} options - Options d'export
     * @param {Function} onProgression - Callback de progression
     * @returns {Promise<Blob>} Le blob ZIP
     */
    async function exporterSemestre(options = {}, onProgression) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip non disponible');
        }

        const zip = new JSZip();
        const fichiers = travauxStockage.obtenirFichiersTravaux();
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const productions = obtenirDonneesSelonMode(cle('productions'));

        const trimestreActif = obtenirTrimestreActif();
        const nomArchive = trimestreActif ? trimestreActif.nom.replace(/\s/g, '_') : 'semestre';

        let traites = 0;

        for (const fichier of fichiers) {
            const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
            const production = productions.find(p => p.id === fichier.productionId);

            const nomEtudiant = etudiant
                ? `${etudiant.nom}_${etudiant.prenom}_${fichier.etudiantDA}`
                : (fichier.etudiantDA || 'non-associe');

            const nomProduction = production
                ? (production.titre || production.nom || '').replace(/[^a-zA-Z0-9]/g, '_')
                : 'sans-production';

            const blob = await travauxStockage.recupererBlob(fichier.id);
            if (blob) {
                zip.file(`${nomEtudiant}/${nomProduction}/${fichier.nomFichier}`, blob);
            }

            traites++;
            if (onProgression) {
                onProgression(traites, fichiers.length);
            }
        }

        // Ajouter un fichier resume
        const resume = {
            export: nomArchive,
            date: new Date().toISOString(),
            nbFichiers: fichiers.length,
            nbEtudiants: new Set(fichiers.map(f => f.etudiantDA).filter(Boolean)).size,
            nbProductions: new Set(fichiers.map(f => f.productionId).filter(Boolean)).size
        };
        zip.file('_resume.json', JSON.stringify(resume, null, 2));

        return await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
    }

    /* ===============================
       FICHIER ANNOTE (Aplatir annotations)
       =============================== */

    /**
     * Genere une version annotee d'un fichier
     * Pour les images: dessine les annotations sur l'image
     * Pour les PDF: genere une image annotee par page
     * @param {Object} fichier - Metadonnees du fichier
     * @returns {Promise<Blob|null>} Le fichier annote ou null
     */
    async function genererFichierAnnote(fichier) {
        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
        if (!annotation || Object.keys(annotation.pages || {}).length === 0) {
            return null;
        }

        const blob = await travauxStockage.recupererBlob(fichier.id);
        if (!blob) return null;

        if (fichier.typeMIME.startsWith('image/')) {
            return await aplatirAnnotationsImage(blob, annotation);
        }

        // Pour les PDF, retourner null pour l'instant
        // (aplatir un PDF requiert la reconstruction via PDF.js + canvas)
        return null;
    }

    /**
     * Aplatit les annotations sur une image
     * @param {Blob} imageBlob - L'image originale
     * @param {Object} annotation - Les annotations
     * @returns {Promise<Blob>} L'image avec annotations
     */
    async function aplatirAnnotationsImage(imageBlob, annotation) {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(imageBlob);

            img.onload = () => {
                URL.revokeObjectURL(url);

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // Dessiner l'image originale
                ctx.drawImage(img, 0, 0);

                // Dessiner les annotations de la page 0
                const donnees = annotation.pages[0];
                if (donnees) {
                    dessinerAnnotationsSurCanvas(ctx, donnees, img.width, img.height);
                }

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };

            img.src = url;
        });
    }

    /**
     * Dessine des annotations sur un canvas
     * @param {CanvasRenderingContext2D} ctx - Contexte 2D
     * @param {Object} donnees - Donnees de page
     * @param {number} w - Largeur
     * @param {number} h - Hauteur
     */
    function dessinerAnnotationsSurCanvas(ctx, donnees, w, h) {
        // Traits
        for (const trait of (donnees.strokes || [])) {
            if (!trait.points || trait.points.length < 2) continue;

            ctx.save();
            ctx.globalAlpha = trait.opacity || 1.0;
            ctx.strokeStyle = trait.color;
            ctx.lineWidth = trait.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(trait.points[0].x * w, trait.points[0].y * h);

            for (let i = 1; i < trait.points.length; i++) {
                ctx.lineTo(trait.points[i].x * w, trait.points[i].y * h);
            }

            ctx.stroke();
            ctx.restore();
        }

        // Formes
        for (const forme of (donnees.shapes || [])) {
            ctx.save();
            ctx.strokeStyle = forme.color;
            ctx.lineWidth = forme.lineWidth || 2;

            const x1 = forme.x1 * w, y1 = forme.y1 * h;
            const x2 = forme.x2 * w, y2 = forme.y2 * h;

            switch (forme.type) {
                case 'rectangle':
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                    break;
                case 'cercle': {
                    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
                    const rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2;
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                }
                case 'fleche': {
                    const headLen = 15;
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
                    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                    const sz = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(mx - sz, my);
                    ctx.lineTo(mx - sz * 0.3, my + sz * 0.8);
                    ctx.lineTo(mx + sz, my - sz * 0.6);
                    ctx.stroke();
                    break;
                }
                case 'croix':
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.moveTo(x2, y1);
                    ctx.lineTo(x1, y2);
                    ctx.stroke();
                    break;
            }
            ctx.restore();
        }

        // Textes
        for (const texte of (donnees.textAnnotations || [])) {
            ctx.save();
            ctx.font = `${texte.fontSize || 14}px sans-serif`;
            ctx.fillStyle = texte.color || '#FF0000';
            ctx.fillText(texte.text, texte.x * w, texte.y * h);
            ctx.restore();
        }
    }

    /* ===============================
       TELECHARGER
       =============================== */

    /**
     * Telecharge un blob comme fichier
     * @param {Blob} blob - Le blob a telecharger
     * @param {string} nomFichier - Le nom du fichier
     */
    function telechargerBlob(blob, nomFichier) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Lance l'export par etudiant et telecharge
     * @param {string} da - DA de l'etudiant
     * @param {Object} options - Options
     */
    async function lancerExportEtudiant(da, options = {}) {
        try {
            const zip = await exporterParEtudiant(da, options);
            const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
            const etudiant = etudiants.find(e => e.da === da);
            const nom = etudiant ? `${etudiant.nom}_${etudiant.prenom}` : da;
            telechargerBlob(zip, `travaux_${nom}.zip`);
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export etudiant:', e);
            alert('Erreur lors de l\'export: ' + e.message);
        }
    }

    /**
     * Lance l'export par production et telecharge
     * @param {string} productionId - ID de la production
     * @param {Object} options - Options
     */
    async function lancerExportProduction(productionId, options = {}) {
        try {
            const zip = await exporterParProduction(productionId, options);
            telechargerBlob(zip, `travaux_production_${productionId}.zip`);
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export production:', e);
            alert('Erreur lors de l\'export: ' + e.message);
        }
    }

    /**
     * Lance l'export du semestre complet et telecharge
     * @param {Object} options - Options
     */
    async function lancerExportSemestre(options = {}) {
        try {
            const trimestreActif = obtenirTrimestreActif();
            const nom = trimestreActif ? trimestreActif.id : 'semestre';

            const zip = await exporterSemestre(options, (traites, total) => {
                const pourcent = Math.round((traites / total) * 100);
                const barre = document.getElementById('travaux-barre-progression');
                if (barre) barre.style.width = pourcent + '%';
                const texte = document.getElementById('travaux-texte-progression');
                if (texte) texte.textContent = `${traites}/${total} fichiers traites...`;
            });

            telechargerBlob(zip, `archive_travaux_${nom}_${new Date().toISOString().split('T')[0]}.zip`);
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export semestre:', e);
            alert('Erreur lors de l\'export: ' + e.message);
        }
    }

    /* ===============================
       NETTOYAGE POST-ARCHIVAGE
       =============================== */

    /**
     * Supprime les fichiers d'une production apres archivage
     * @param {string} productionId - ID de la production
     * @returns {Promise<number>} Nombre de fichiers supprimes
     */
    async function nettoyerProduction(productionId) {
        const fichiers = travauxStockage.obtenirFichiersProduction(productionId);
        let supprimes = 0;

        for (const fichier of fichiers) {
            await travauxStockage.supprimerFichierTravail(fichier.id);
            supprimes++;
        }

        return supprimes;
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxArchivage = {
        exporterParEtudiant: exporterParEtudiant,
        exporterParProduction: exporterParProduction,
        exporterSemestre: exporterSemestre,
        lancerExportEtudiant: lancerExportEtudiant,
        lancerExportProduction: lancerExportProduction,
        lancerExportSemestre: lancerExportSemestre,
        nettoyerProduction: nettoyerProduction,
        telechargerBlob: telechargerBlob
    };

})();
