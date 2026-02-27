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

        // Ajouter les evaluations si demande
        if (options.inclureEvaluations) {
            const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees'));
            const evalsProd = evaluations.filter(e => e.productionId === productionId);

            if (evalsProd.length > 0) {
                const evalJson = JSON.stringify(evalsProd, null, 2);
                dossier.file('evaluations.json', evalJson);
            }
        }

        return await zip.generateAsync({ type: 'blob' });
    }

    /**
     * Genere un ZIP filtre par etudiant, production, ou les deux
     * Inclut toujours : productions en PDF + evaluations en JSON
     * @param {string|null} da - DA de l'etudiant (null = tous)
     * @param {string|null} productionId - ID de la production (null = toutes)
     * @returns {Promise<Blob>} Le blob ZIP
     */
    async function exporterTravaux(da, productionId) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip non disponible');
        }

        const zip = new JSZip();
        let fichiers = travauxStockage.obtenirFichiersGroupeActif();

        if (da) {
            fichiers = fichiers.filter(f => f.etudiantDA === da);
        }
        if (productionId) {
            fichiers = fichiers.filter(f => f.productionId === productionId);
        }

        if (fichiers.length === 0) {
            throw new Error('Aucun fichier trouvé pour ces critères.');
        }

        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));

        for (const fichier of fichiers) {
            const blob = await travauxStockage.recupererBlob(fichier.id);
            if (!blob) continue;

            const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
            const sousDossier = etudiant
                ? `${etudiant.nom}_${etudiant.prenom}_${fichier.etudiantDA}`
                : (fichier.etudiantDA || 'non-associe');

            zip.file(`${sousDossier}/${fichier.nomFichier}`, blob);

            // Toujours inclure les annotations aplaties
            const annote = await genererFichierAnnote(fichier);
            if (annote) {
                const ext = fichier.nomFichier.split('.').pop();
                const nomAnnote = fichier.nomFichier.replace(`.${ext}`, `_annote.${ext}`);
                zip.file(`${sousDossier}/${nomAnnote}`, annote);
            }
        }

        // Toujours inclure les evaluations
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees'));
        let evalsFiltre = evaluations;
        if (da) evalsFiltre = evalsFiltre.filter(e => e.etudiantDA === da);
        if (productionId) evalsFiltre = evalsFiltre.filter(e => e.productionId === productionId);

        if (evalsFiltre.length > 0) {
            zip.file('evaluations.json', JSON.stringify(evalsFiltre, null, 2));
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
        let fichiers = travauxStockage.obtenirFichiersGroupeActif();
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const productions = obtenirDonneesSelonMode(cle('productions'));

        // Filtres optionnels
        if (options.da) {
            fichiers = fichiers.filter(f => f.etudiantDA === options.da);
        }
        if (options.productionId) {
            fichiers = fichiers.filter(f => f.productionId === options.productionId);
        }

        const trimestreActif = obtenirTrimestreActif();
        const nomArchive = trimestreActif ? trimestreActif.nom.replace(/\s/g, '_') : 'semestre';

        let traites = 0;

        // Structure: eleve/production/fichier
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

            // Toujours inclure les annotations aplaties
            const annote = await genererFichierAnnote(fichier);
            if (annote) {
                const ext = fichier.nomFichier.split('.').pop();
                const nomAnnote = fichier.nomFichier.replace(`.${ext}`, `_annote.${ext}`);
                zip.file(`${nomEtudiant}/${nomProduction}/${nomAnnote}`, annote);
            }

            traites++;
            if (onProgression) {
                onProgression(traites, fichiers.length);
            }
        }

        // Toujours inclure les evaluations
        let evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees'));
        if (options.da) evaluations = evaluations.filter(e => e.etudiantDA === options.da);
        if (options.productionId) evaluations = evaluations.filter(e => e.productionId === options.productionId);
        if (evaluations.length > 0) {
            zip.file('_evaluations.json', JSON.stringify(evaluations, null, 2));
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

    /**
     * Genere des PDFs annotes+synthese pour televersement Lea
     * Seuls les fichiers ayant une evaluation completee sont inclus
     * @param {string} productionId - ID de la production
     * @param {string|null} da - DA d'un etudiant specifique (null = tous)
     * @param {Function} onProgression - Callback(traites, total)
     * @returns {Promise<{blobs: Array<{blob: Blob, nom: string}>}>} Les PDFs generes
     */
    async function exporterPourLea(productionId, da, onProgression) {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif();
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees'));
        const productions = obtenirDonneesSelonMode(cle('productions'));
        const production = productions.find(p => p.id === productionId);
        const nomProd = (production?.titre || production?.nom || 'production')
            .replace(/[^a-zA-ZÀ-ÿ0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        // Filtrer les fichiers qui ont une évaluation pour cette production
        let fichiersAvecEval = fichiers.filter(f =>
            evaluations.some(e => e.etudiantDA === f.etudiantDA && e.productionId === productionId)
        );
        if (da) {
            fichiersAvecEval = fichiersAvecEval.filter(f => f.etudiantDA === da);
        }

        // 1 PDF par étudiant : privilégier le fichier de cette production
        const parEtudiant = new Map();
        for (const f of fichiersAvecEval) {
            const existant = parEtudiant.get(f.etudiantDA);
            if (!existant || (f.productionId === productionId && existant.productionId !== productionId)) {
                parEtudiant.set(f.etudiantDA, f);
            }
        }
        fichiersAvecEval = [...parEtudiant.values()];

        if (fichiersAvecEval.length === 0) {
            throw new Error('Aucune évaluation trouvée pour ces critères.');
        }

        let traites = 0;
        const total = fichiersAvecEval.length;
        const blobs = [];

        for (const fichier of fichiersAvecEval) {
            const { doc } = await travauxExportPDF.genererDocPDF(fichier.id, productionId);
            const pdfBlob = doc.output('blob');

            const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
            const nom = (etudiant?.nom || 'Inconnu').replace(/[^a-zA-ZÀ-ÿ-]/g, '');
            const daEtud = etudiant?.da || fichier.etudiantDA || '0000000';
            const nomFichier = `${nom}_${daEtud}_${nomProd}_Evalue.pdf`;

            blobs.push({ blob: pdfBlob, nom: nomFichier });
            traites++;
            if (onProgression) onProgression(traites, total);
        }

        return { blobs, nomProd };
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

        // PDF : utiliser le moteur d'export PDF partage
        if (fichier.typeMIME === 'application/pdf') {
            return await travauxExportPDF.rendrePDFAvecAnnotations(blob, annotation, {
                format: 'pdf', scale: 1.5, quality: 0.85
            });
        }

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
     * Delegue a la fonction partagee de travaux-export-pdf.js
     * (inclut le rendu des stickers)
     */
    function dessinerAnnotationsSurCanvas(ctx, donnees, w, h) {
        travauxExportPDF.dessinerAnnotationsSurCtx(ctx, w, h, donnees, 1);
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

            // Marquer tous les fichiers de cet etudiant comme exportes
            const fichiers = travauxStockage.obtenirFichiersEtudiant(da);
            fichiers.forEach(f => travauxStockage.marquerExporte(f.id));
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

            // Marquer tous les fichiers de cette production comme exportes
            const fichiers = travauxStockage.obtenirFichiersProduction(productionId);
            fichiers.forEach(f => travauxStockage.marquerExporte(f.id));
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export production:', e);
            alert('Erreur lors de l\'export: ' + e.message);
        }
    }

    /**
     * Lance l'export unifie (etudiant, production, ou les deux) et telecharge
     * @param {string|null} da - DA de l'etudiant (null = tous)
     * @param {string|null} productionId - ID de la production (null = toutes)
     */
    async function lancerExport(da, productionId) {
        try {
            const zip = await exporterTravaux(da, productionId);

            // Nom du fichier selon le filtre
            let nomZip = 'travaux';
            if (da) {
                const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
                const etudiant = etudiants.find(e => e.da === da);
                nomZip += '_' + (etudiant ? etudiant.nom + '_' + etudiant.prenom : da);
            }
            if (productionId) {
                const productions = obtenirDonneesSelonMode(cle('productions'));
                const prod = productions.find(p => p.id === productionId);
                const titreProd = (prod?.titre || prod?.nom || productionId).replace(/[^a-zA-Z0-9]/g, '_');
                nomZip += '_' + titreProd;
            }
            telechargerBlob(zip, nomZip + '.zip');

            // Marquer les fichiers comme exportes
            let fichiers = travauxStockage.obtenirFichiersGroupeActif();
            if (da) fichiers = fichiers.filter(f => f.etudiantDA === da);
            if (productionId) fichiers = fichiers.filter(f => f.productionId === productionId);
            fichiers.forEach(f => travauxStockage.marquerExporte(f.id));
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export:', e);
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

    /**
     * Lance l'export Lea pour une production et telecharge
     * 1 fichier → PDF direct, 2+ fichiers → ZIP
     * @param {string} productionId - ID de la production
     * @param {string|null} da - DA d'un etudiant specifique (null = tous)
     */
    async function lancerExportLea(productionId, da) {
        if (!productionId) {
            alert('Veuillez sélectionner une production.');
            return;
        }

        try {
            const date = new Date().toISOString().split('T')[0];

            const { blobs, nomProd } = await exporterPourLea(productionId, da, (traites, total) => {
                const pourcent = Math.round((traites / total) * 100);
                const barre = document.getElementById('travaux-barre-progression-lea');
                if (barre) barre.style.width = pourcent + '%';
                const texte = document.getElementById('travaux-texte-progression-lea');
                if (texte) texte.textContent = `${traites}/${total} fichiers traités...`;
            });

            if (blobs.length === 1) {
                // Un seul fichier → PDF direct
                telechargerBlob(blobs[0].blob, blobs[0].nom);
            } else {
                // Plusieurs fichiers → ZIP
                if (typeof JSZip === 'undefined') throw new Error('JSZip non disponible');
                const zip = new JSZip();
                for (const { blob, nom } of blobs) {
                    zip.file(nom, blob);
                }
                const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
                telechargerBlob(zipBlob, `Lea_${nomProd}_${date}.zip`);
            }
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export Lea:', e);
            alert('Erreur lors de l\'export Lea: ' + e.message);
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
       ALLEGEMENT EN LOT
       =============================== */

    /**
     * Convertit tous les fichiers exportes en fac-similes
     * @returns {Promise<void>}
     */
    async function lancerAllegement() {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif();
        const exportes = fichiers.filter(f => f.blobStatut === 'exporte');

        if (exportes.length === 0) {
            alert('Aucun fichier exporte a alleger.');
            return;
        }

        const continuer = confirm(
            `Alleger ${exportes.length} fichier(s) exporte(s) ?\n\n` +
            `Les originaux seront remplaces par des versions allegees (niveaux de gris, 800px).\n` +
            `Les annotations et evaluations sont conservees.`
        );
        if (!continuer) return;

        const resultat = await travauxStockage.allegerFichiersExportes((traites, total) => {
            const barre = document.getElementById('travaux-barre-progression');
            const texte = document.getElementById('travaux-texte-progression');
            if (barre) barre.style.width = Math.round((traites / total) * 100) + '%';
            if (texte) texte.textContent = `${traites}/${total} fichiers alleges...`;
        });

        alert(`Allegement termine : ${resultat.convertis} fichier(s) allege(s), ${resultat.erreurs} erreur(s).`);

        // Rafraichir l'UI
        if (typeof travauxUI !== 'undefined' && typeof travauxUI.afficherArchivage === 'function') {
            travauxUI.afficherArchivage();
        }
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxArchivage = {
        exporterParEtudiant: exporterParEtudiant,
        exporterParProduction: exporterParProduction,
        exporterTravaux: exporterTravaux,
        exporterSemestre: exporterSemestre,
        exporterPourLea: exporterPourLea,
        lancerExport: lancerExport,
        lancerExportEtudiant: lancerExportEtudiant,
        lancerExportProduction: lancerExportProduction,
        lancerExportSemestre: lancerExportSemestre,
        lancerExportLea: lancerExportLea,
        nettoyerProduction: nettoyerProduction,
        telechargerBlob: telechargerBlob,
        lancerAllegement: lancerAllegement
    };

})();
