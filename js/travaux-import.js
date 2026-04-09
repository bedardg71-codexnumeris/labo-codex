/* ===============================
   MODULE: TRAVAUX - IMPORT
   Import de fichiers travaux (PDF, images)
   Drag-drop, import en masse, jumelage auto par DA

   DEPENDANCES:
   - travaux-stockage.js (stockerBlob, ajouterFichierTravail, etc.)
   - trimestres.js (cle())
   - config.js (echapperHtml)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    const TYPES_ACCEPTES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/heic',
        'image/heif',
        'image/webp'
    ];

    const EXTENSIONS_ACCEPTEES = ['.pdf', '.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'];

    /**
     * Vérifie les magic bytes d'un fichier pour confirmer son type réel.
     * @param {File|Blob} fichier - Le fichier à vérifier
     * @returns {Promise<boolean>} true si les magic bytes correspondent au type déclaré
     */
    async function validerMagicBytes(fichier) {
        try {
            var slice = fichier.slice(0, 8);
            var buffer = await slice.arrayBuffer();
            var bytes = new Uint8Array(buffer);
            if (bytes.length < 4) return false;

            // PDF : %PDF (25 50 44 46)
            if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return true;
            // PNG : 89 50 4E 47
            if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;
            // JPEG : FF D8 FF
            if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;
            // WebP : RIFF....WEBP (52 49 46 46 xx xx xx xx 57 45 42 50)
            if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes.length >= 12 &&
                bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;
            // HEIC/HEIF : ftyp (xx xx xx xx 66 74 79 70) — offset 4
            if (bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return true;

            return false;
        } catch (e) {
            console.warn('[Travaux-Import] Impossible de lire les magic bytes:', e);
            return true; // En cas d'erreur, accepter par défaut (fallback gracieux)
        }
    }

    // Patterns pour detecter un DA dans le nom de fichier
    // Ex: "1234567_travail.pdf", "Beaulieu_Emma_1234567.pdf", etc.
    const PATTERNS_DA = [
        /\b(\d{7})\b/,                    // 7 chiffres contigus
        /DA[_\-\s]?(\d{7})/i,             // DA1234567 ou DA_1234567
        /(\d{7})[_\-\s]/,                 // 1234567_ au debut
        /[_\-\s](\d{7})\./,               // _1234567. avant extension
    ];

    /* ===============================
       PARSER NOM FICHIER LEA
       =============================== */

    /**
     * Parse un nom de fichier au format Lea :
     * NOM_DA_Production_Remis_le_AAAA-MM-JJ_HHhMMmSSs.ext
     * ou NOM_DA_Production__Remis_le_AAAA-MM-JJ_HHhMMmSSs.ext
     * @param {string} nomFichier - Le nom complet du fichier
     * @returns {Object} { nom, da, nomProduction, dateRemise, raw }
     */
    function parserNomFichierLea(nomFichier) {
        const resultat = { nom: '', da: '', nomProduction: '', dateRemise: null, raw: nomFichier };

        // Retirer l'extension
        const sanExt = nomFichier.replace(/\.[^.]+$/, '');

        // Separer sur _Remis_le_ ou __Remis_le_
        const separateur = /_?_Remis_le_/;
        const parties = sanExt.split(separateur);

        if (parties.length < 2) return resultat;

        const partieIdentite = parties[0];
        const partieDate = parties.slice(1).join('_Remis_le_');

        // Parser la date : AAAA-MM-JJ_HHhMMmSSs
        const matchDate = partieDate.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})h(\d{2})m(\d{2})s/);
        if (matchDate) {
            resultat.dateRemise = new Date(
                parseInt(matchDate[1]), parseInt(matchDate[2]) - 1, parseInt(matchDate[3]),
                parseInt(matchDate[4]), parseInt(matchDate[5]), parseInt(matchDate[6])
            );
        }

        // Extraire le DA depuis la partie identite
        resultat.da = detecterDA(partieIdentite);

        if (resultat.da) {
            // Trouver la position du DA dans la chaine
            const indexDA = partieIdentite.indexOf(resultat.da);

            // Nom = tout avant le DA (nettoye des separateurs)
            resultat.nom = partieIdentite.substring(0, indexDA).replace(/[_\-]+$/, '').replace(/_/g, ' ').trim();

            // Production = tout apres le DA (nettoye des separateurs)
            resultat.nomProduction = partieIdentite.substring(indexDA + resultat.da.length).replace(/^[_\-]+/, '').replace(/_/g, ' ').trim();
        }

        return resultat;
    }

    // Compression images iPad (1400px, JPEG 0.80 pour import standard)
    const MAX_IMAGE_DIMENSION = 1400;
    const JPEG_QUALITY_IMPORT = 0.80;

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let fichiersEnAttente = [];
    let productionSelectionnee = '';
    let importEnCours = false;

    // Limiteur de concurrence pour la génération de thumbnails
    const THUMB_CONCURRENCE_MAX = 4;
    let _thumbEnCours = 0;
    let _thumbFile = [];
    let _thumbRefreshTimer = null;

    function _planifierRefreshUI() {
        if (_thumbRefreshTimer) return;
        _thumbRefreshTimer = setTimeout(function() {
            _thumbRefreshTimer = null;
            if (typeof window.rafraichirPipelineUI === 'function') {
                window.rafraichirPipelineUI();
            }
        }, 500);
    }

    async function _traiterThumbQueue() {
        while (_thumbEnCours < THUMB_CONCURRENCE_MAX && _thumbFile.length > 0) {
            const fichierPrepare = _thumbFile.shift();
            _thumbEnCours++;
            genererThumbnailQueue(fichierPrepare)
                .catch(function(err) { console.warn('[Travaux-Import] Erreur thumbnail:', err); })
                .finally(function() {
                    _thumbEnCours--;
                    _traiterThumbQueue();
                });
        }
    }

    function planifierThumbnail(fichierPrepare) {
        _thumbFile.push(fichierPrepare);
        _traiterThumbQueue();
    }

    /* ===============================
       DETECTION DA
       =============================== */

    /**
     * Tente d'extraire un DA depuis un nom de fichier
     * @param {string} nomFichier - Le nom du fichier
     * @returns {string} Le DA detecte ou chaine vide
     */
    function detecterDA(nomFichier) {
        for (const pattern of PATTERNS_DA) {
            const match = nomFichier.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    }

    /**
     * Tente de jumeler un DA a un etudiant du groupe
     * @param {string} da - Le DA detecte
     * @returns {Object|null} L'etudiant trouve ou null
     */
    function trouverEtudiantParDA(da) {
        if (!da) return null;
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        return etudiants.find(e => e.da === da) || null;
    }

    /**
     * Tente de jumeler par nom dans le fichier
     * @param {string} nomFichier - Le nom du fichier
     * @returns {Object|null} L'etudiant trouve ou null
     */
    function trouverEtudiantParNom(nomFichier) {
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const nomLower = nomFichier.toLowerCase().replace(/[_\-]/g, ' ');

        for (const etudiant of etudiants) {
            const nom = (etudiant.nom || '').toLowerCase();
            const prenom = (etudiant.prenom || '').toLowerCase();

            if (nom && prenom && nomLower.includes(nom) && nomLower.includes(prenom)) {
                return etudiant;
            }
            if (nom && nom.length > 3 && nomLower.includes(nom)) {
                return etudiant;
            }
        }
        return null;
    }

    /* ===============================
       VALIDATION FICHIERS
       =============================== */

    /**
     * Verifie si un fichier est d'un type accepte
     * @param {File} fichier - Le fichier a verifier
     * @returns {boolean}
     */
    function estTypeAccepte(fichier) {
        if (TYPES_ACCEPTES.includes(fichier.type)) return true;
        const ext = '.' + fichier.name.split('.').pop().toLowerCase();
        return EXTENSIONS_ACCEPTEES.includes(ext);
    }

    /**
     * Determine le type MIME a partir du fichier
     * @param {File} fichier - Le fichier
     * @returns {string} Type MIME
     */
    function determinerTypeMIME(fichier) {
        if (fichier.type) return fichier.type;
        const ext = fichier.name.split('.').pop().toLowerCase();
        const types = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png',
            'heic': 'image/heic', 'heif': 'image/heif',
            'webp': 'image/webp'
        };
        return types[ext] || 'application/octet-stream';
    }

    /**
     * Verifie si c'est un PDF
     * @param {string} typeMIME - Le type MIME
     * @returns {boolean}
     */
    function estPDF(typeMIME) {
        return typeMIME === 'application/pdf';
    }

    /**
     * Verifie si c'est une image
     * @param {string} typeMIME - Le type MIME
     * @returns {boolean}
     */
    function estImage(typeMIME) {
        return typeMIME.startsWith('image/');
    }

    /* ===============================
       COMPRESSION IMAGES
       =============================== */

    /**
     * Compresse une image si necessaire (iPad)
     * Redimensionne et convertit en JPEG
     * @param {Blob} blob - Le blob image original
     * @param {string} typeMIME - Le type MIME
     * @returns {Promise<Blob>} Le blob compresse
     */
    async function compresserImageSiNecessaire(blob, typeMIME) {
        // Les PDF ne sont pas compresses
        if (estPDF(typeMIME)) return blob;

        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);

                let w = img.width;
                let h = img.height;

                // Pas de compression si deja petit
                if (w <= MAX_IMAGE_DIMENSION && h <= MAX_IMAGE_DIMENSION) {
                    resolve(blob);
                    return;
                }

                // Redimensionner
                if (w > h) {
                    h = Math.round(h * (MAX_IMAGE_DIMENSION / w));
                    w = MAX_IMAGE_DIMENSION;
                } else {
                    w = Math.round(w * (MAX_IMAGE_DIMENSION / h));
                    h = MAX_IMAGE_DIMENSION;
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                canvas.toBlob(
                    (blobCompresse) => {
                        resolve(blobCompresse);
                    },
                    'image/jpeg',
                    JPEG_QUALITY_IMPORT
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(blob); // fallback: garder l'original
            };

            img.src = url;
        });
    }

    /* ===============================
       IMPORT FICHIERS
       =============================== */

    /**
     * Traite un fichier pour l'import
     * @param {File} fichier - Le fichier a importer
     * @returns {Object} Infos du fichier en attente
     */
    function preparerFichier(fichier) {
        const typeMIME = determinerTypeMIME(fichier);
        const daDetecte = detecterDA(fichier.name);
        const etudiant = trouverEtudiantParDA(daDetecte) || trouverEtudiantParNom(fichier.name);
        const parseLea = parserNomFichierLea(fichier.name);

        // Cle de regroupement pour assemblage multi-pages
        let groupeDocumentId = '';
        if (parseLea.da && parseLea.nomProduction) {
            // Format LEA complet : DA + nom production
            groupeDocumentId = parseLea.da + '_' + parseLea.nomProduction.replace(/\s+/g, '-');
        } else if (daDetecte && productionSelectionnee) {
            // Fallback : DA detecte + production globale selectionnee
            groupeDocumentId = daDetecte + '_' + productionSelectionnee;
        } else if (daDetecte) {
            // Fallback minimal : regrouper par DA seul
            groupeDocumentId = daDetecte + '_auto';
        }

        return {
            fichier: fichier,
            fichierOriginal: fichier,
            nomFichier: fichier.name,
            typeMIME: typeMIME,
            tailleFichier: fichier.size,
            daDetecte: daDetecte,
            etudiantAssocie: etudiant,
            etudiantDA: etudiant ? etudiant.da : daDetecte,
            estPDF: estPDF(typeMIME),
            estImage: estImage(typeMIME),
            statut: 'en-attente',
            // Pipeline
            parseLea: parseLea,
            pipelineStatut: 'apercu',
            groupeDocumentId: groupeDocumentId,
            thumbnailDataUrl: null,
            productionId: '',
            // Metadata import
            modeImport: 'lea',
            nomDocumentLibre: '',
            dateFichier: new Date(fichier.lastModified),
            operations: []
        };
    }

    /**
     * Ajoute des fichiers a la liste d'attente
     * @param {FileList|Array} fichiers - Les fichiers a ajouter
     * @returns {Array} Les fichiers prepares
     */
    function ajouterFichiersEnAttente(fichiers) {
        const acceptes = [];

        for (const fichier of fichiers) {
            if (estTypeAccepte(fichier)) {
                const prepare = preparerFichier(fichier);
                detecterFormatEtRouter(prepare);
                // Tenter le matching par nom LEA si parseLea a identifié une production
                // (plus fiable que le sélecteur global qui applique aveuglément)
                if (!prepare.productionId && prepare.parseLea && prepare.parseLea.nomProduction) {
                    const productions = obtenirDonneesSelonMode('productions');
                    const nomNorm = normaliserNomProduction(prepare.parseLea.nomProduction);
                    if (nomNorm && productions.length) {
                        const prodTrouvee = productions.find(p => {
                            const titre = normaliserNomProduction(p.titre || p.nom || '');
                            return titre && correspondanceProduction(titre, nomNorm);
                        }) || productions.find(p => {
                            const titre = normaliserNomProduction(p.titre || p.nom || '');
                            return titre && correspondanceProduction(nomNorm, titre);
                        });
                        if (prodTrouvee) {
                            prepare.productionId = prodTrouvee.id;
                            prepare.productionIdParLea = true;
                        }
                    }
                }
                // Mode jeton de reprise : marquer les fichiers ajoutés pendant que le mode est actif
                if (productionSelectionnee === '__jeton_reprise__') {
                    prepare.estReprise = true;
                    prepare.productionIdParLea = false;
                    // Le productionId sera défini par le sous-sélecteur de jeton
                    var jetonProd = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('travaux-jeton-production') : '';
                    if (jetonProd) {
                        prepare.productionId = jetonProd;
                    }
                }
                // Fallback final : production globale selectionnee (mode normal)
                else if (productionSelectionnee && !prepare.productionId) {
                    prepare.productionId = productionSelectionnee;
                }
                fichiersEnAttente.push(prepare);
                acceptes.push(prepare);
                // Générer les thumbnails via le planificateur (max 4 concurrentes)
                planifierThumbnail(prepare);
            } else {
                console.warn(`[Travaux-Import] Type refuse: ${fichier.name} (${fichier.type})`);
            }
        }

        persisterFileDAttente();
        return acceptes;
    }

    /**
     * Importe un seul fichier
     * @param {Object} fichierPrepare - Le fichier prepare
     * @param {string} productionId - ID de la production
     * @returns {Promise<Object>} Le fichier importe
     */
    async function importerFichier(fichierPrepare, productionId) {
        const typeMIME = fichierPrepare.typeMIME;
        let blob = fichierPrepare.fichier;

        if (!blob) {
            throw new Error('Le fichier original n\'est plus disponible (session expirée). Veuillez re-déposer le fichier.');
        }

        // Validation magic bytes (A2 — audit sécurité)
        var magicValide = await validerMagicBytes(blob);
        if (!magicValide) {
            throw new Error('Le fichier « ' + (fichierPrepare.nomFichier || 'inconnu') + ' » ne correspond pas à un format d\'image ou PDF valide. Il a peut-être été renommé.');
        }

        // Compresser les images si necessaire
        if (fichierPrepare.estImage) {
            blob = await compresserImageSiNecessaire(blob, typeMIME);
        }

        // Generer la miniature
        let thumbnail = '';
        let nombrePages = 1;

        if (fichierPrepare.estPDF) {
            try {
                const result = await travauxStockage.genererMiniaturePDF(blob);
                thumbnail = result.thumbnail;
                nombrePages = result.nombrePages;
            } catch (e) {
                console.warn('[Travaux-Import] Erreur miniature PDF:', e);
            }
        } else if (fichierPrepare.estImage) {
            try {
                thumbnail = await travauxStockage.genererMiniatureImage(blob);
            } catch (e) {
                console.warn('[Travaux-Import] Erreur miniature image:', e);
            }
        }

        // Phase 4 : vérifier s'il existe déjà un fichier actif avec (etudiantDA, productionId)
        // Les fichiers de reprise (jeton) ne sont pas des doublons — ils coexistent avec l'original
        if (fichierPrepare.etudiantDA && productionId && !fichierPrepare.estReprise) {
            const existants = travauxStockage.obtenirFichiersGroupeActif()
                .filter(f => f.etudiantDA === fichierPrepare.etudiantDA && f.productionId === productionId);
            if (existants.length > 0) {
                return { doublon: true, fichierExistant: existants[0], fichierPrepare: fichierPrepare, productionId: productionId };
            }
        }

        // Identifier le cours actif pour taguer le fichier
        const coursActif = (typeof db !== 'undefined') ? db.getSync('infoCours', null) : null;
        const gcActif = (typeof db !== 'undefined') ? db.getSync('groupeCoursActif', null) : null;

        // Creer les metadonnees
        const metadonnees = {
            etudiantDA: fichierPrepare.etudiantDA,
            productionId: productionId,
            coursId: coursActif ? coursActif.id : '',
            groupeCoursId: gcActif ? gcActif.id : '',
            nomFichier: fichierPrepare.nomFichier,
            typeMIME: typeMIME,
            tailleFichier: blob.size,
            nombrePages: nombrePages,
            thumbnailDataUrl: thumbnail,
            source: 'import-local',
            importePar: 'single',
            // Pipeline metadata
            nomFichierLea: fichierPrepare.nomFichier,
            leaParsed: fichierPrepare.parseLea || null,
            groupeDocumentId: fichierPrepare.groupeDocumentId || '',
            // Metadata import (LEA / Libre)
            modeImport: fichierPrepare.modeImport || 'lea',
            nomDocumentLibre: fichierPrepare.nomDocumentLibre || '',
            dateFichier: fichierPrepare.dateFichier ? fichierPrepare.dateFichier.toISOString() : null,
            format11x17: fichierPrepare.format11x17 || false,
            // Jeton de reprise
            evaluationId: fichierPrepare.evaluationId || '',
            estReprise: fichierPrepare.estReprise || false
        };

        // Ajouter les metadonnees
        const fichierTravail = travauxStockage.ajouterFichierTravail(metadonnees);

        // Stocker le blob (avec rollback des métadonnées si échec)
        try {
            await travauxStockage.stockerBlob(
                fichierTravail.id,
                blob,
                fichierPrepare.etudiantDA,
                productionId
            );
        } catch (e) {
            // Rollback : supprimer les métadonnées orphelines
            travauxStockage.supprimerFichierTravail(fichierTravail.id);
            throw e;
        }

        fichierPrepare.statut = 'importe';
        fichierPrepare.id = fichierTravail.id;

        return fichierTravail;
    }

    /**
     * Importe tous les fichiers en attente
     * @param {string} productionId - ID de la production cible
     * @param {Function} onProgression - Callback de progression (index, total)
     * @returns {Promise<Object>} Resultat de l'import {importes, erreurs}
     */
    async function importerTous(productionId, onProgression) {
        if (importEnCours) {
            console.warn('[Travaux-Import] Import deja en cours');
            return { importes: 0, erreurs: 0 };
        }

        importEnCours = true;
        let importes = 0;
        let erreurs = 0;
        const doublonsDetectes = [];
        const total = fichiersEnAttente.length;

        for (let i = 0; i < fichiersEnAttente.length; i++) {
            const fichier = fichiersEnAttente[i];
            if (fichier.statut === 'importe') continue;

            try {
                // En mode pipeline, la productionId individuelle du fichier prime sur la globale
                const prodId = fichier.productionId || productionId || '';
                const resultat = await importerFichier(fichier, prodId);

                // Phase 4 : détection de doublons
                if (resultat && resultat.doublon) {
                    doublonsDetectes.push(resultat);
                    fichier.statut = 'doublon';
                    console.warn(`[Travaux-Import] Doublon détecté: ${fichier.nomFichier} (${fichier.etudiantDA}, ${prodId})`);
                } else {
                    importes++;
                }
            } catch (e) {
                console.error(`[Travaux-Import] Erreur import ${fichier.nomFichier}:`, e);
                fichier.statut = 'erreur';
                fichier.erreur = e.message;
                erreurs++;
            }

            if (onProgression) {
                onProgression(i + 1, total);
            }
        }

        importEnCours = false;

        // Nettoyer les fichiers importes avec succes
        fichiersEnAttente = fichiersEnAttente.filter(f => f.statut !== 'importe');

        return { importes, erreurs, doublons: doublonsDetectes, total };
    }

    /**
     * Vide la liste des fichiers en attente
     */
    function viderFileDAttente() {
        fichiersEnAttente = [];
        persisterFileDAttente();
    }

    /**
     * Retourne les fichiers en attente
     * @returns {Array}
     */
    function obtenirFileDAttente() {
        return fichiersEnAttente;
    }

    /* ===============================
       PERSISTANCE SESSIONSTORE
       =============================== */

    /**
     * Persiste les metadonnees de la file d'attente dans sessionStorage.
     * Les blobs File ne sont pas serialisables — on ne garde que les metadonnees.
     */
    function persisterFileDAttente() {
        try {
            const cleSession = 'pipeline_queue_' + (typeof cle === 'function' ? cle('') : 'default');
            const donnees = fichiersEnAttente.map(f => ({
                nomFichier: f.nomFichier,
                typeMIME: f.typeMIME,
                tailleFichier: f.tailleFichier,
                daDetecte: f.daDetecte,
                etudiantDA: f.etudiantDA,
                estPDF: f.estPDF,
                estImage: f.estImage,
                statut: f.statut,
                parseLea: f.parseLea,
                pipelineStatut: f.pipelineStatut,
                groupeDocumentId: f.groupeDocumentId,
                // thumbnailDataUrl omis : regeneree depuis le blob au reattachement
                productionId: f.productionId,
                largeurOriginale: f.largeurOriginale || 0,
                hauteurOriginale: f.hauteurOriginale || 0
            }));
            sessionStorage.setItem(cleSession, JSON.stringify(donnees));
        } catch (e) {
            console.warn('[Travaux-Import] Erreur persistance sessionStorage:', e);
        }
    }

    /**
     * Restaure les metadonnees de la file d'attente depuis sessionStorage.
     * Les fichiers restaures ont fichier=null (blob absent) — l'utilisateur
     * doit re-deposer le fichier pour le traiter/importer.
     */
    function restaurerFileDAttente() {
        try {
            const cleSession = 'pipeline_queue_' + (typeof cle === 'function' ? cle('') : 'default');
            const json = sessionStorage.getItem(cleSession);
            if (!json) return;

            const donnees = JSON.parse(json);
            if (!Array.isArray(donnees) || donnees.length === 0) return;

            fichiersEnAttente = donnees.map(d => ({
                fichier: null,
                nomFichier: d.nomFichier || '',
                typeMIME: d.typeMIME || '',
                tailleFichier: d.tailleFichier || 0,
                daDetecte: d.daDetecte || '',
                etudiantAssocie: d.etudiantDA ? trouverEtudiantParDA(d.etudiantDA) : null,
                etudiantDA: d.etudiantDA || '',
                estPDF: !!d.estPDF,
                estImage: !!d.estImage,
                statut: d.statut || 'en-attente',
                parseLea: d.parseLea || { nom: '', da: '', nomProduction: '', dateRemise: null, raw: '' },
                pipelineStatut: d.pipelineStatut || 'apercu',
                groupeDocumentId: d.groupeDocumentId || '',
                thumbnailDataUrl: null, // regeneree au reattachement des blobs
                productionId: d.productionId || '',
                largeurOriginale: d.largeurOriginale || 0,
                hauteurOriginale: d.hauteurOriginale || 0
            }));

        } catch (e) {
            console.warn('[Travaux-Import] Erreur restauration sessionStorage:', e);
        }
    }

    /* ===============================
       PIPELINE : DETECTION FORMAT ET ROUTAGE
       =============================== */

    /**
     * Detecte le format d'un fichier et route vers le bon statut pipeline
     * PDF → 'pret' (ou 'identifie' si parseLea reussit)
     * Image → 'a-optimiser'
     * @param {Object} fichierPrepare - Le fichier prepare
     */
    /**
     * Normalise un nom de production pour la comparaison.
     * LEA transforme le nom original en retirant accents et caractères
     * spéciaux (°, /, parenthèses, etc.). On reproduit la même chose
     * pour que "Artefact n°3" (titre) matche "Artefact n3" (fichier LEA).
     */
    function normaliserNomProduction(nom) {
        return nom.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // accents : é→e, è→e, etc.
            .replace(/[^a-z0-9\s]/g, '')                        // retirer °, /, (, ), #, etc.
            .replace(/(^|\s)n\s*(\d)/g, '$1$2')                 // "n1" isolé → "1" (résidu de n°)
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Match avec word boundary : "labo 1" matche "labo 1 portrait" mais PAS "labo 10"
     */
    function correspondanceProduction(titreNorm, nomNorm) {
        if (titreNorm === nomNorm) return true;
        const escaped = nomNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('(^|\\s)' + escaped + '(\\s|$)');
        return re.test(titreNorm);
    }

    function detecterFormatEtRouter(fichierPrepare) {
        if (fichierPrepare.estPDF) {
            // Les PDF sont prets directement
            fichierPrepare.pipelineStatut = 'pret';
            // Si parseLea a reussi et on trouve un etudiant, passer en identifie
            if (fichierPrepare.parseLea.da && fichierPrepare.etudiantAssocie) {
                const productions = obtenirDonneesSelonMode('productions');
                const prodTrouvee = productions.find(p => {
                    const titre = normaliserNomProduction(p.titre || p.nom || '');
                    const nomProd = normaliserNomProduction(fichierPrepare.parseLea.nomProduction);
                    return nomProd && titre && (correspondanceProduction(titre, nomProd) || correspondanceProduction(nomProd, titre));
                });
                if (prodTrouvee) {
                    fichierPrepare.productionId = prodTrouvee.id;
                    fichierPrepare.productionIdParLea = true;
                    fichierPrepare.pipelineStatut = 'identifie';
                }
            }
        } else if (fichierPrepare.estImage) {
            fichierPrepare.pipelineStatut = 'a-optimiser';
        }
        persisterFileDAttente();
    }

    /**
     * Genere la thumbnail d'un fichier en attente (async, fire-and-forget)
     * @param {Object} fichierPrepare - Le fichier prepare
     */
    async function genererThumbnailQueue(fichierPrepare) {
        try {
            if (fichierPrepare.estImage) {
                fichierPrepare.thumbnailDataUrl = await travauxStockage.genererMiniatureImage(fichierPrepare.fichier);
                // Stocker les dimensions originales pour detection paysage
                try {
                    const imgUrl = URL.createObjectURL(fichierPrepare.fichier);
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = imgUrl;
                    });
                    fichierPrepare.largeurOriginale = img.naturalWidth;
                    fichierPrepare.hauteurOriginale = img.naturalHeight;
                    URL.revokeObjectURL(imgUrl);
                } catch (e) {
                    console.warn('[Travaux-Import] Erreur dimensions image:', e);
                }
            } else if (fichierPrepare.estPDF) {
                const result = await travauxStockage.genererMiniaturePDF(fichierPrepare.fichier);
                fichierPrepare.thumbnailDataUrl = result.thumbnail;
                fichierPrepare.nombrePages = result.nombrePages;
            }
        } catch (e) {
            console.warn('[Travaux-Import] Erreur thumbnail queue:', e);
        }
        persisterFileDAttente();
        // Planifier un refresh UI groupé (évite 68 re-renders)
        _planifierRefreshUI();
    }

    /**
     * Regroupe les fichiers en attente par groupeDocumentId
     * @returns {Map<string, Array>} Map de cle de regroupement vers fichiers
     */
    function regrouperParDocument() {
        const groupes = new Map();
        fichiersEnAttente.forEach(f => {
            const cle = f.groupeDocumentId || ('_solo_' + f.nomFichier);
            if (!groupes.has(cle)) groupes.set(cle, []);
            groupes.get(cle).push(f);
        });
        // Trier au sein de chaque groupe par dateRemise
        groupes.forEach(fichiers => {
            fichiers.sort((a, b) => {
                const da = a.parseLea.dateRemise;
                const db = b.parseLea.dateRemise;
                if (!da && !db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                return da - db;
            });
        });
        return groupes;
    }

    /* ===============================
       DRAG & DROP
       =============================== */

    /**
     * Initialise la zone de drag-and-drop
     * @param {HTMLElement} zone - L'element zone de depot
     * @param {Function} onFichiersAjoutes - Callback appele avec les fichiers prepares
     */
    function initialiserDropZone(zone, onFichiersAjoutes) {
        if (!zone) return;

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');

            const fichiers = e.dataTransfer.files;
            if (fichiers.length > 0) {
                const prepares = ajouterFichiersEnAttente(fichiers);
                if (onFichiersAjoutes) {
                    onFichiersAjoutes(prepares);
                }
            }
        });

        // Support clic pour ouvrir le selecteur
        // L'input doit etre dans le DOM pour que Safari declenche le change event
        zone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = EXTENSIONS_ACCEPTEES.join(',');
            input.style.position = 'absolute';
            input.style.opacity = '0';
            input.style.pointerEvents = 'none';
            document.body.appendChild(input);

            input.addEventListener('change', () => {
                if (input.files.length > 0) {
                    const prepares = ajouterFichiersEnAttente(input.files);
                    if (onFichiersAjoutes) {
                        onFichiersAjoutes(prepares);
                    }
                }
                input.remove();
            });

            input.click();
        });
    }

    /* ===============================
       ASSEMBLAGE PDF MULTI-IMAGES
       =============================== */

    /**
     * Assemble un groupe d'images en un seul PDF via jsPDF
     * @param {Array} fichiersDuGroupe - Liste de fichiers prepares (images)
     * @param {number} [dpi=250] - DPI pour la conversion pixels → mm
     * @returns {Promise<Blob>} Le blob PDF assemble
     */
    async function assemblerPDFGroupe(fichiersDuGroupe, dpi) {
        const { jsPDF } = window.jspdf;
        let doc = null;

        for (let i = 0; i < fichiersDuGroupe.length; i++) {
            const f = fichiersDuGroupe[i];
            const blob = f.fichier;

            // Charger l'image
            const imgData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Obtenir les dimensions de l'image
            const dims = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = reject;
                img.src = imgData;
            });

            // Dimensions en mm
            const mmPerPx = 25.4 / (dpi || 250);
            const pageW = dims.width * mmPerPx;
            const pageH = dims.height * mmPerPx;

            if (i === 0) {
                doc = new jsPDF({
                    orientation: pageW > pageH ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: [pageW, pageH]
                });
            } else {
                doc.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
            }

            doc.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
        }

        if (!doc) throw new Error('Aucune image a assembler');
        return doc.output('blob');
    }

    /* ===============================
       INTERFACE LISTE FICHIERS EN ATTENTE
       =============================== */

    /**
     * Genere le HTML de la liste des fichiers en attente
     * @returns {string} HTML
     */
    function genererHTMLFileDAttente() {
        if (fichiersEnAttente.length === 0) {
            return '<p class="texte-muted">Aucun fichier en attente</p>';
        }

        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');

        let html = '<div class="travaux-file-attente">';

        fichiersEnAttente.forEach((f, index) => {
            const etudiantNom = f.etudiantAssocie
                ? `${echapperHtml(f.etudiantAssocie.nom)}, ${echapperHtml(f.etudiantAssocie.prenom)}`
                : (f.etudiantDA ? `DA: ${echapperHtml(f.etudiantDA)}` : 'Non associe');

            const icone = f.estPDF ? '&#x1F4C4;' : '&#x1F5BC;';
            const taille = travauxStockage.formaterTaille(f.tailleFichier);
            const statutClass = f.statut === 'erreur' ? 'statut-erreur' : '';

            html += `
                <div class="travaux-fichier-item ${statutClass}" data-index="${index}">
                    <span class="travaux-fichier-icone">${icone}</span>
                    <div class="travaux-fichier-info">
                        <div class="travaux-fichier-nom">${echapperHtml(f.nomFichier)}</div>
                        <div class="travaux-fichier-details">${taille}</div>
                    </div>
                    <div class="travaux-fichier-etudiant">
                        <select class="form-select travaux-select-etudiant" data-index="${index}" data-on-change="travauxImportChangerEtudiant" data-param="${index}">
                            <option value="">-- Associer --</option>
                            ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${e.da}" ${f.etudiantDA === e.da ? 'selected' : ''}>${echapperHtml(e.nom + ', ' + e.prenom)} (${e.da})</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn-supprimer-fichier" data-action="travauxImportRetirerFichier" data-param="${index}" title="Retirer">
                        &times;
                    </button>
                </div>`;
        });

        html += '</div>';
        return html;
    }

    /**
     * Change l'association etudiant d'un fichier en attente
     * @param {number} index - Index dans la file d'attente
     * @param {string} da - Nouveau DA
     */
    function changerEtudiant(index, da) {
        if (index >= 0 && index < fichiersEnAttente.length) {
            fichiersEnAttente[index].etudiantDA = da;
            fichiersEnAttente[index].etudiantAssocie = trouverEtudiantParDA(da);
        }
    }

    /**
     * Retire un fichier de la file d'attente
     * @param {number} index - Index du fichier a retirer
     */
    function retirerFichier(index) {
        if (index >= 0 && index < fichiersEnAttente.length) {
            fichiersEnAttente.splice(index, 1);
            persisterFileDAttente();
            // Rafraichir l'affichage
            if (typeof window.rafraichirImportTravaux === 'function') {
                window.rafraichirImportTravaux();
            }
        }
    }

    /* ===============================
       RE-IMPORT (Cycle de vie des blobs)
       =============================== */

    /**
     * Ouvre le file picker pour reimporter un fichier (fac-simile -> original)
     * Le nouveau blob remplace l'ancien avec le MEME id
     * @param {string} fichierId - ID du fichier existant
     */
    async function reimporterFichier(fichierId) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) {
            alert('Fichier introuvable.');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = EXTENSIONS_ACCEPTEES.join(',');

        input.addEventListener('change', async () => {
            if (!input.files || input.files.length === 0) return;

            const nouveauFichier = input.files[0];
            if (!estTypeAccepte(nouveauFichier)) {
                alert('Type de fichier non accepte.');
                return;
            }

            try {
                let blob = nouveauFichier;
                const typeMIME = determinerTypeMIME(nouveauFichier);

                // Compresser si c'est une image
                if (estImage(typeMIME)) {
                    blob = await compresserImageSiNecessaire(blob, typeMIME);
                }

                // Stocker avec le MEME id
                await travauxStockage.stockerBlob(
                    fichierId,
                    blob,
                    fichier.etudiantDA,
                    fichier.productionId
                );

                // Mettre a jour les metadonnees
                const fichiers = travauxStockage.obtenirFichiersTravaux();
                const idx = fichiers.findIndex(f => f.id === fichierId);
                if (idx !== -1) {
                    fichiers[idx].tailleFichier = blob.size;
                    fichiers[idx].blobStatut = 'present';
                    fichiers[idx].dateModification = new Date().toISOString();
                    delete fichiers[idx].dateFacsimile;
                    travauxStockage.sauvegarderFichiersTravaux(fichiers);
                }

                // Regenerer la miniature
                let thumbnail = '';
                if (estImage(typeMIME)) {
                    try { thumbnail = await travauxStockage.genererMiniatureImage(blob); } catch (e) { console.warn('[Travaux-Import] image thumbnail generation failed:', e.message || e); }
                } else if (estPDF(typeMIME)) {
                    try {
                        const result = await travauxStockage.genererMiniaturePDF(blob);
                        thumbnail = result.thumbnail;
                    } catch (e) { console.warn('[Travaux-Import] PDF thumbnail generation failed:', e.message || e); }
                }
                if (thumbnail && idx !== -1) {
                    fichiers[idx].thumbnailDataUrl = thumbnail;
                    travauxStockage.sauvegarderFichiersTravaux(fichiers);
                }

                if (typeof afficherNotificationSucces === 'function') {
                    afficherNotificationSucces('Fichier reimporte avec succes');
                }

                // Rafraichir l'UI
                if (typeof travauxUI !== 'undefined' && typeof travauxUI.rafraichirUI === 'function') {
                    travauxUI.rafraichirUI();
                }
            } catch (e) {
                console.error('[Travaux-Import] Erreur reimport:', e);
                alert('Erreur lors du reimport: ' + e.message);
            }
        });

        input.click();
    }

    /* ===============================
       RE-ATTACHEMENT DES BLOBS (session restaurée)
       =============================== */

    /**
     * Re-attache les blobs File aux entrées de la queue restaurée depuis sessionStorage.
     * Correspondance par nom de fichier exact (nomFichier === fichier.name).
     * @param {FileList|Array} fichiers - Les fichiers re-déposés par l'utilisateur
     * @returns {number} Le nombre de fichiers rattachés
     */
    function reattacherBlobs(fichiers) {
        let rattaches = 0;
        for (const fichier of fichiers) {
            const index = fichiersEnAttente.findIndex(f => f.nomFichier === fichier.name && !f.fichier);
            if (index === -1) continue;
            fichiersEnAttente[index].fichier = fichier;
            fichiersEnAttente[index].fichierOriginal = fichier;
            if (!fichiersEnAttente[index].thumbnailDataUrl) {
                genererThumbnailQueue(fichiersEnAttente[index]).catch(err => {
                    console.warn('[Travaux-Import] Erreur génération thumbnail:', err);
                });
            }
            rattaches++;
        }
        if (rattaches > 0) persisterFileDAttente();
        return rattaches;
    }

    /* ===============================
       INITIALISATION : RESTAURER LA FILE
       =============================== */

    restaurerFileDAttente();

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    /**
     * Monte un fichier d'un cran dans la file d'attente (index - 1)
     * @param {number} index - Position actuelle du fichier
     */
    function monterFichier(index) {
        if (index <= 0 || index >= fichiersEnAttente.length) return;
        const tmp = fichiersEnAttente[index - 1];
        fichiersEnAttente[index - 1] = fichiersEnAttente[index];
        fichiersEnAttente[index] = tmp;
        persisterFileDAttente();
    }

    /**
     * Descend un fichier d'un cran dans la file d'attente (index + 1)
     * @param {number} index - Position actuelle du fichier
     */
    function descendreFichier(index) {
        if (index < 0 || index >= fichiersEnAttente.length - 1) return;
        const tmp = fichiersEnAttente[index + 1];
        fichiersEnAttente[index + 1] = fichiersEnAttente[index];
        fichiersEnAttente[index] = tmp;
        persisterFileDAttente();
    }

    /**
     * Definit la production globale selectionnee
     * @param {string} id - ID de la production
     */
    function setProductionGlobale(id) {
        productionSelectionnee = id || '';
    }

    /**
     * Retourne la production globale selectionnee
     * @returns {string}
     */
    function getProductionGlobale() {
        return productionSelectionnee;
    }

    /* ===============================
       DECOMPOSITION / REASSEMBLAGE PDF
       (Editeur de pages)
       =============================== */

    /**
     * Decompose un PDF importe en pages individuelles (images JPEG)
     * @param {string} fichierId - ID du fichier importe
     * @returns {Promise<Array>} Tableau de {pageNum, blob, dataUrl, largeur, hauteur}
     */
    async function decomposerPDF(fichierId) {
        const blob = await travauxStockage.recupererBlob(fichierId);
        if (!blob) throw new Error('Blob introuvable pour ' + fichierId);

        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js non disponible');
        }

        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 1000 / page.getViewport({ scale: 1 }).width;
            const viewport = page.getViewport({ scale: scale });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const pageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));

            pages.push({
                pageNum: i,
                blob: pageBlob,
                dataUrl: dataUrl,
                largeur: viewport.width,
                hauteur: viewport.height
            });
        }

        return pages;
    }

    /**
     * Reassemble un tableau de pages (blobs images) en un PDF
     * @param {Array} pages - Tableau de {blob, largeur, hauteur}
     * @returns {Promise<Blob>} Le blob PDF reassemble
     */
    async function reassemblerPages(pages) {
        const { jsPDF } = window.jspdf;
        let doc = null;

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const blob = page.blob;

            // Charger en dataURL
            const imgData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Dimensions en mm (250 DPI)
            const mmPerPx = 25.4 / 250;
            const pageW = page.largeur * mmPerPx;
            const pageH = page.hauteur * mmPerPx;

            if (i === 0) {
                doc = new jsPDF({
                    orientation: pageW > pageH ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: [pageW, pageH]
                });
            } else {
                doc.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
            }

            doc.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
        }

        if (!doc) throw new Error('Aucune page a reassembler');
        return doc.output('blob');
    }

    window.travauxImport = {
        // Detection
        detecterDA: detecterDA,
        trouverEtudiantParDA: trouverEtudiantParDA,
        // Parser Lea
        parserNomFichierLea: parserNomFichierLea,
        // Validation
        estTypeAccepte: estTypeAccepte,
        // File d'attente
        ajouterFichiersEnAttente: ajouterFichiersEnAttente,
        obtenirFileDAttente: obtenirFileDAttente,
        viderFileDAttente: viderFileDAttente,
        changerEtudiant: changerEtudiant,
        retirerFichier: retirerFichier,
        monterFichier: monterFichier,
        descendreFichier: descendreFichier,
        // Pipeline
        detecterFormatEtRouter: detecterFormatEtRouter,
        regrouperParDocument: regrouperParDocument,
        assemblerPDFGroupe: assemblerPDFGroupe,
        // Import
        importerFichier: importerFichier,
        importerTous: importerTous,
        reimporterFichier: reimporterFichier,
        reattacherBlobs: reattacherBlobs,
        // Drag & Drop
        initialiserDropZone: initialiserDropZone,
        // UI
        genererHTMLFileDAttente: genererHTMLFileDAttente,
        // Production globale
        setProductionGlobale: setProductionGlobale,
        getProductionGlobale: getProductionGlobale,
        // Editeur de pages
        decomposerPDF: decomposerPDF,
        reassemblerPages: reassemblerPages,
        // Etat
        get importEnCours() { return importEnCours; }
    };

    // Wrappers délégués (data-action / data-on-change)
    window.travauxImportRetirerFichier = function(index) {
        travauxImport.retirerFichier(Number(index));
    };
    window.travauxImportChangerEtudiant = function(index, el) {
        travauxImport.changerEtudiant(Number(index), el.value);
    };

})();
