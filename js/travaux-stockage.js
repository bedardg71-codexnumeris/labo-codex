/* ===============================
   MODULE: TRAVAUX - STOCKAGE
   Abstraction stockage pour fichiers travaux etudiants

   Gere le stockage des blobs (PDF, images) dans IndexedDB
   avec fallback et gestion quota.

   DEPENDANCES:
   - db.js (Database, IndexedDB)
   - trimestres.js (cle() pour namespacing)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       CONSTANTES
       =============================== */

    const SEUIL_ALERTE_QUOTA = 0.8; // 80%
    const MAX_THUMBNAIL_WIDTH = 200;
    const MAX_THUMBNAIL_HEIGHT = 280;
    const JPEG_QUALITY_THUMBNAIL = 0.7;

    /* ===============================
       FILE SYSTEM ACCESS API (Mac Chrome/Edge)
       =============================== */

    let fsapiDisponible = typeof window.showDirectoryPicker === 'function';
    let fsapiActif = false;
    let fsapiDirectoryHandle = null;
    const FSAPI_HANDLE_KEY = 'travaux_fsapi_handle';

    /* ===============================
       FSAPI - File System Access API
       =============================== */

    /**
     * Verifie si FSAPI est disponible et supporte
     * @returns {boolean}
     */
    function estFSAPIDisponible() {
        return fsapiDisponible;
    }

    /**
     * Demande a l'utilisateur de choisir un repertoire de travail via FSAPI
     * @returns {Promise<boolean>} true si reussi
     */
    async function configurerRepertoireFSAPI() {
        if (!fsapiDisponible) return false;

        try {
            fsapiDirectoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            // Verifier/creer le sous-dossier 'travaux'
            fsapiDirectoryHandle = await fsapiDirectoryHandle.getDirectoryHandle('Monitorage_Travaux', { create: true });
            fsapiActif = true;

            // Sauvegarder le handle pour persistance
            try {
                const root = await navigator.storage.getDirectory();
                // On ne peut pas serialiser un handle, mais on peut le stocker via IDB
                await stockerHandleFSAPI(fsapiDirectoryHandle);
            } catch (e) {
                console.warn('[Travaux-Stockage] Impossible de persister le handle FSAPI');
            }

            return true;
        } catch (e) {
            if (e.name !== 'AbortError') {
                console.error('[Travaux-Stockage] Erreur FSAPI:', e);
            }
            return false;
        }
    }

    /**
     * Stocke le handle FSAPI dans IndexedDB pour persistance entre sessions
     */
    async function stockerHandleFSAPI(handle) {
        return db.storeFSAPIHandle(handle);
    }

    /**
     * Recupere le handle FSAPI depuis IndexedDB
     * @returns {Promise<FileSystemDirectoryHandle|null>}
     */
    async function recupererHandleFSAPI() {
        return db.getFSAPIHandle();
    }

    /**
     * Tente de restaurer le handle FSAPI depuis une session precedente
     * @returns {Promise<boolean>}
     */
    async function restaurerFSAPI() {
        if (!fsapiDisponible) return false;

        const handle = await recupererHandleFSAPI();
        if (!handle) return false;

        try {
            // Verifier les permissions
            const permission = await handle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
                fsapiDirectoryHandle = handle;
                fsapiActif = true;
                return true;
            }

            // Demander la permission
            const newPermission = await handle.requestPermission({ mode: 'readwrite' });
            if (newPermission === 'granted') {
                fsapiDirectoryHandle = handle;
                fsapiActif = true;
                return true;
            }
        } catch (e) {
            console.warn('[Travaux-Stockage] Impossible de restaurer FSAPI:', e.message);
        }

        return false;
    }

    /**
     * Stocke un blob via FSAPI (fichier sur disque)
     * @param {string} id - ID du fichier
     * @param {Blob} blob - Le contenu
     * @returns {Promise<void>}
     */
    async function stockerBlobFSAPI(id, blob) {
        const fileHandle = await fsapiDirectoryHandle.getFileHandle(id, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
    }

    /**
     * Recupere un blob via FSAPI
     * @param {string} id - ID du fichier
     * @returns {Promise<Blob|null>}
     */
    async function recupererBlobFSAPI(id) {
        try {
            const fileHandle = await fsapiDirectoryHandle.getFileHandle(id);
            const file = await fileHandle.getFile();
            return file;
        } catch (e) {
            if (e.name === 'NotFoundError') return null;
            throw e;
        }
    }

    /**
     * Supprime un blob via FSAPI
     * @param {string} id - ID du fichier
     * @returns {Promise<void>}
     */
    async function supprimerBlobFSAPI(id) {
        try {
            await fsapiDirectoryHandle.removeEntry(id);
        } catch (e) {
            if (e.name !== 'NotFoundError') throw e;
        }
    }

    /**
     * @returns {boolean} true si FSAPI est actif
     */
    function estFSAPIActif() {
        return fsapiActif;
    }

    /* ===============================
       OPERATIONS BLOB
       =============================== */

    /**
     * T4 du chantier du démo (6 oct. 2026) : en démo, avec un dossier sur disque branché,
     * une copie s'écrirait dans le dossier RÉEL de l'enseignant. On refuse plutôt que
     * d'écrire en IndexedDB seulement : la lecture d'une copie passe elle aussi par le
     * dossier quand il est branché, la copie serait illisible.
     */
    const AVIS_DEMO_DOSSIER = 'Tu es dans la démo et ton dossier de copies sur disque est branché : '
        + 'les copies de la démo y entreraient. Quitte la démo pour importer tes vraies copies.';

    function refusDuDemoSurDisque() {
        return fsapiActif && typeof window.estEnModeDemo === 'function' && window.estEnModeDemo();
    }

    /**
     * Stocke un blob (fichier) dans IndexedDB
     * @param {string} id - ID du fichier travail (FT_xxx)
     * @param {Blob} blob - Le contenu du fichier
     * @param {string} etudiantDA - DA de l'etudiant
     * @param {string} productionId - ID de la production
     * @param {{notifier?: boolean}} [options] - notifier:false = le caller
     *        journalise lui-meme les echecs (import massif : une notification
     *        par blob refuse devient une avalanche de bandeaux, cf. #334 B).
     * @returns {Promise<void>}
     */
    async function stockerBlob(id, blob, etudiantDA, productionId, options) {
        const notifier = !options || options.notifier !== false;
        // Pas de limite de taille par fichier : l'ancienne limite de 20 Mo
        // reposait sur une hypothèse périmée (« IndexedDB ~50 Mo par origin » —
        // 36 Go mesurés sur l'iPad réel). Le quota global est gardé par le
        // pré-vol d'import (#334 A) et un vrai QuotaExceededError est journalisé
        // par l'import (#334 B). Retirée le 11 juin 2026, décision Grégoire.

        // T4 : rien du démo n'entre dans le dossier réel, quel que soit l'écrivain.
        if (refusDuDemoSurDisque()) {
            const refus = new Error(AVIS_DEMO_DOSSIER);
            refus.name = 'DemoDossierSurDisque';
            throw refus;
        }

        // FSAPI: fichier sur disque
        if (fsapiActif) {
            await stockerBlobFSAPI(id, blob);
            return;
        }

        // Délégation vers db.js (store fichiers unifié)
        try {
            await db.storeBlob({
                id: id,
                etudiantDA: etudiantDA,
                productionId: productionId,
                blob: blob,
                dateStored: new Date().toISOString()
            });
        } catch (err) {
            if (notifier && err?.name === 'QuotaExceededError') {
                notifications.erreur('Stockage plein', 'L\'espace de stockage est insuffisant. Supprimez des fichiers.');
            }
            console.error(`[Travaux-Stockage] Erreur stockage blob: ${id}`, err);
            throw err;
        }
    }

    /**
     * Recupere un blob depuis IndexedDB
     * @param {string} id - ID du fichier travail
     * @returns {Promise<Blob|null>} Le blob ou null si introuvable
     */
    async function recupererBlob(id) {
        // FSAPI: fichier sur disque
        if (fsapiActif) {
            return await recupererBlobFSAPI(id);
        }

        // Délégation vers db.js
        const record = await db.getBlob(id);
        return record && record.blob ? record.blob : null;
    }

    /**
     * Supprime un blob de IndexedDB
     * @param {string} id - ID du fichier travail
     * @returns {Promise<void>}
     */
    async function supprimerBlob(id) {
        // FSAPI: fichier sur disque
        if (fsapiActif) {
            await supprimerBlobFSAPI(id);
            return;
        }

        // Délégation vers db.js
        await db.deleteBlob(id);
    }

    /**
     * Recupere tous les blobs d'un etudiant
     * @param {string} da - DA de l'etudiant
     * @returns {Promise<Array>} Liste des enregistrements (sans blob pour performance)
     */
    async function listerBlobsEtudiant(da) {
        // Délégation vers db.js
        const records = await db.listBlobsByStudent(da);
        // Retourner les metadonnees sans les blobs (performance)
        return records.map(r => ({
            id: r.id,
            etudiantDA: r.etudiantDA,
            productionId: r.productionId,
            dateStored: r.dateStored,
            taille: r.blob ? r.blob.size : 0
        }));
    }

    /* ===============================
       METADONNEES FICHIERS
       =============================== */

    /**
     * Obtient la liste des fichiers travaux (metadonnees)
     * @returns {Array} Liste des fichiers travaux
     */
    function obtenirFichiersTravaux() {
        return db.getSync(cle('fichiersTravaux'), []);
    }

    /**
     * Lot F (D4) : les gestes de l'usager sur les copies (import, renommer, réassigner,
     * corbeille…) écrivent ici, hors du témoin commun : ce point le dit au codex, une
     * seule fois pour tous (`signalerEcritureUsager`). Les appelants de la machine
     * (migrations, purge au démarrage, drapeau « exporté ») passent `{ discret: true }`.
     * @param {string} cleEcrite
     * @param {{discret?: boolean}} [options]
     */
    function _signalerSiGeste(cleEcrite, options) {
        if (options && options.discret) return;
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cleEcrite);
    }

    /**
     * Sauvegarde la liste des fichiers travaux
     * @param {Array} fichiers - Liste mise a jour
     * @param {{discret?: boolean}} [options] - voir _signalerSiGeste
     */
    function sauvegarderFichiersTravaux(fichiers, options) {
        db.setSync(cle('fichiersTravaux'), fichiers);
        _signalerSiGeste(cle('fichiersTravaux'), options);
    }

    /**
     * Ajoute les metadonnees d'un fichier travail
     * @param {Object} metadonnees - Metadonnees du fichier
     * @returns {Object} Le fichier ajoute avec son ID
     */
    function ajouterFichierTravail(metadonnees) {
        const fichiers = obtenirFichiersTravaux();
        const id = genererIdUnique('FT_');

        const fichier = {
            id: id,
            etudiantDA: metadonnees.etudiantDA || '',
            productionId: metadonnees.productionId || '',
            coursId: metadonnees.coursId || '',
            groupeCoursId: metadonnees.groupeCoursId || '',
            nomFichier: metadonnees.nomFichier || '',
            typeMIME: metadonnees.typeMIME || '',
            tailleFichier: metadonnees.tailleFichier || 0,
            nombrePages: metadonnees.nombrePages || 1,
            stockage: fsapiActif ? 'fsapi' : 'indexeddb',
            thumbnailDataUrl: metadonnees.thumbnailDataUrl || '',
            dateImport: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            source: metadonnees.source || 'import-local',
            importePar: metadonnees.importePar || 'single',
            // Cycle de vie : present → exporte.
            // `facsimile` est un état HÉRITÉ : la fonctionnalité « alléger » qui
            // le produisait a été retirée le 28 août 2026 (décision Grégoire).
            // Les fichiers qui le portent déjà restent lisibles et gardent leur
            // badge — on ne peut simplement plus en créer de nouveaux.
            blobStatut: 'present',
            statut: metadonnees.productionId ? 'actif' : 'orphelin',  // Phase 6 : cycle de vie métier
            // Pipeline metadata
            nomFichierLea: metadonnees.nomFichierLea || '',
            leaParsed: metadonnees.leaParsed || null,
            groupeDocumentId: metadonnees.groupeDocumentId || '',
            format11x17: metadonnees.format11x17 || false,
            // Jeton de reprise
            evaluationId: metadonnees.evaluationId || '',
            estReprise: metadonnees.estReprise || false
        };

        // Extraire la thumbnail vers IDB (ne pas la stocker dans fichiersTravaux)
        if (fichier.thumbnailDataUrl) {
            stockerThumbnail(id, fichier.thumbnailDataUrl);
            fichier.thumbnailDataUrl = '';
        }

        fichiers.push(fichier);
        sauvegarderFichiersTravaux(fichiers);

        return fichier;
    }

    /**
     * Supprime un fichier travail (metadonnees + blob)
     * @param {string} id - ID du fichier
     * @returns {Promise<boolean>} true si supprime
     */
    async function supprimerFichierTravail(id) {
        // Supprimer le blob
        try {
            await supprimerBlob(id);
        } catch (e) {
            console.warn(`[Travaux-Stockage] Blob introuvable pour ${id}`);
        }
        // Supprimer la thumbnail IDB
        supprimerThumbnail(id).catch(function() {});

        // Supprimer les metadonnees
        const fichiers = obtenirFichiersTravaux();
        const index = fichiers.findIndex(f => f.id === id);
        if (index !== -1) {
            fichiers.splice(index, 1);
            sauvegarderFichiersTravaux(fichiers);
            return true;
        }
        return false;
    }

    /**
     * Obtient les fichiers d'un etudiant
     * @param {string} da - DA de l'etudiant
     * @returns {Array} Fichiers de l'etudiant
     */
    function obtenirFichiersEtudiant(da) {
        return obtenirFichiersTravaux().filter(f => f.etudiantDA === da);
    }

    /**
     * Obtient les fichiers d'une production
     * @param {string} productionId - ID de la production
     * @returns {Array} Fichiers de la production
     */
    function obtenirFichiersProduction(productionId) {
        // 🔧 FIX (24 fév 2026) : Filtrer par groupe-cours actif pour ne pas mélanger les groupes
        return obtenirFichiersGroupeActif().filter(f => f.productionId === productionId);
    }

    /**
     * Obtient un fichier par son ID
     * @param {string} id - ID du fichier
     * @returns {Object|null} Le fichier ou null
     */
    function obtenirFichierParId(id) {
        return obtenirFichiersTravaux().find(f => f.id === id) || null;
    }

    /**
     * Obtient les fichiers travaux filtrés par le groupe-cours actif.
     * Pour l'affichage UI uniquement — exclut les fichiers d'autres groupes-cours.
     * Filtre strict par groupeCoursId (un même cours peut avoir plusieurs groupes).
     * Les fichiers sans groupeCoursId (anciens imports pré-Beta 98) sont exclus.
     * @returns {Array} Fichiers du groupe-cours actif
     */
    function obtenirFichiersGroupeActif() {
        const fichiers = obtenirFichiersTravaux();
        const gcActif = db.getSync('groupeCoursActif', null);
        if (!gcActif || !gcActif.id) return fichiers;

        return fichiers.filter(f => f.groupeCoursId === gcActif.id);
    }

    /**
     * #1013 — les copies que les listes MONTRENT : celles du groupe-cours actif, sans celles
     * d'un élève supprimé (`dasElevesSupprimes`, import-export.js). Un filtre d'affichage :
     * rien n'est écrit, la liste stockée et le codex gardent tout. Les lecteurs qui comptent,
     * importent ou exportent restent sur `obtenirFichiersGroupeActif`.
     * @returns {Array}
     */
    function obtenirFichiersAffiches() {
        const fichiers = obtenirFichiersGroupeActif();
        const supprimes = typeof window.dasElevesSupprimes === 'function' ? window.dasElevesSupprimes() : null;
        if (!supprimes || supprimes.size === 0) return fichiers;
        return fichiers.filter(f => !f.etudiantDA || !supprimes.has(String(f.etudiantDA)));
    }

    // Champs protégés — seul reassocierFichier() peut les modifier
    const CHAMPS_PROTEGES = ['productionId', 'etudiantDA'];

    /**
     * Met a jour les metadonnees d'un fichier travail existant.
     * REFUSE productionId et etudiantDA (utiliser reassocierFichier pour ceux-ci).
     * @param {string} id - ID du fichier
     * @param {Object} modifications - Champs a modifier
     * @returns {boolean} true si mis a jour
     */
    function mettreAJourFichier(id, modifications) {
        const fichiers = obtenirFichiersTravaux();
        const idx = fichiers.findIndex(f => f.id === id);
        if (idx === -1) return false;

        // Filtrer les champs protégés
        const modifsSafe = {};
        for (const [champ, valeur] of Object.entries(modifications)) {
            if (CHAMPS_PROTEGES.includes(champ)) {
                console.warn(`[Travaux-Stockage] mettreAJourFichier() refuse le champ protégé "${champ}" — utiliser reassocierFichier()`);
            } else if (champ === 'thumbnailDataUrl' && valeur) {
                // Router la thumbnail vers IDB au lieu de la stocker dans fichiersTravaux
                stockerThumbnail(id, valeur);
                modifsSafe.thumbnailDataUrl = '';
            } else {
                modifsSafe[champ] = valeur;
            }
        }

        if (Object.keys(modifsSafe).length === 0) return false;

        Object.assign(fichiers[idx], modifsSafe);
        fichiers[idx].dateModification = new Date().toISOString();
        sauvegarderFichiersTravaux(fichiers);
        return true;
    }

    /**
     * Met a jour les metadonnees de plusieurs fichiers d'un coup.
     * REFUSE productionId et etudiantDA (utiliser reassocierFichiersBatch).
     * @param {Object} modifications - Map { fichierId: { champs a modifier } }
     * @returns {number} Nombre de fichiers mis a jour
     */
    function mettreAJourFichiersBatch(modifications, options) {
        const fichiers = obtenirFichiersTravaux();
        let compteur = 0;

        for (const [id, modifs] of Object.entries(modifications)) {
            const idx = fichiers.findIndex(f => f.id === id);
            if (idx === -1) continue;

            // Filtrer les champs protégés
            const modifsSafe = {};
            for (const [champ, valeur] of Object.entries(modifs)) {
                if (CHAMPS_PROTEGES.includes(champ)) {
                    console.warn(`[Travaux-Stockage] mettreAJourFichiersBatch() refuse "${champ}" pour ${id} — utiliser reassocierFichiersBatch()`);
                } else {
                    modifsSafe[champ] = valeur;
                }
            }

            if (Object.keys(modifsSafe).length > 0) {
                Object.assign(fichiers[idx], modifsSafe);
                fichiers[idx].dateModification = new Date().toISOString();
                compteur++;
            }
        }

        if (compteur > 0) {
            sauvegarderFichiersTravaux(fichiers, options);
        }
        return compteur;
    }

    /**
     * Réassocie un fichier à une nouvelle production et/ou un nouvel étudiant.
     * Seule fonction autorisée à modifier productionId et etudiantDA.
     * @param {string} id - ID du fichier
     * @param {Object} association - { productionId?, etudiantDA? }
     * @param {Object} [options] - { verificationSeule: false }
     * @returns {Object|boolean} résultat ou false si introuvable
     */
    function reassocierFichier(id, association, options) {
        const fichiers = obtenirFichiersTravaux();
        const idx = fichiers.findIndex(f => f.id === id);
        if (idx === -1) return false;

        const fichier = fichiers[idx];
        const nouveauDA = association.etudiantDA !== undefined ? association.etudiantDA : fichier.etudiantDA;
        const nouveauProdId = association.productionId !== undefined ? association.productionId : fichier.productionId;

        // Phase 5 : vérifications de conflit
        if (options && options.verificationSeule) {
            const resultat = { conflit: false, evaluationOrpheline: false };

            // Vérifier conflit : un autre fichier actif existe-t-il pour (DA, prodId) ?
            // Relecture Cowork du lot #932/#934 (22 sept. 2026) — SANS ÉLÈVE, PAS DE
            // CONFLIT. Deux copies non identifiées (DA vide) sous une même production
            // ne se remplacent pas : les comparer par `'' === ''` envoyait l'une à la
            // corbeille dès qu'on réassignait l'autre, sans nom dans la question.
            if (nouveauProdId && nouveauDA) {
                const existant = fichiers.find(f =>
                    f.id !== id &&
                    f.etudiantDA === nouveauDA &&
                    f.productionId === nouveauProdId
                );
                if (existant) {
                    resultat.conflit = true;
                    resultat.fichierExistant = existant;
                }
            }

            // Vérifier évaluation orpheline : une éval existe pour (DA, ancien prodId) ?
            if (fichier.productionId && fichier.productionId !== nouveauProdId) {
                const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
                const evalOrpheline = evaluations.find(e =>
                    !e.remplaceeParId &&
                    e.etudiantDA === fichier.etudiantDA &&
                    e.productionId === fichier.productionId
                );
                if (evalOrpheline) {
                    resultat.evaluationOrpheline = true;
                    resultat.evaluation = evalOrpheline;
                }
            }

            return resultat;
        }

        // Appliquer la réassociation
        if (association.productionId !== undefined) fichiers[idx].productionId = association.productionId;
        if (association.etudiantDA !== undefined) fichiers[idx].etudiantDA = association.etudiantDA;

        // Phase 6 : synchroniser le statut
        if (fichiers[idx].statut !== undefined) {
            fichiers[idx].statut = fichiers[idx].productionId ? 'actif' : 'orphelin';
        }

        fichiers[idx].dateModification = new Date().toISOString();
        sauvegarderFichiersTravaux(fichiers);

        return true;
    }

    /**
     * Réassocie plusieurs fichiers en batch (ex: transfert entre groupes).
     * @param {Object} associations - Map { fichierId: { productionId?, etudiantDA?, coursId?, groupeCoursId? } }
     * @returns {number} Nombre de fichiers réassociés
     */
    function reassocierFichiersBatch(associations) {
        const fichiers = obtenirFichiersTravaux();
        let compteur = 0;

        for (const [id, assoc] of Object.entries(associations)) {
            const idx = fichiers.findIndex(f => f.id === id);
            if (idx === -1) continue;

            if (assoc.productionId !== undefined) fichiers[idx].productionId = assoc.productionId;
            if (assoc.etudiantDA !== undefined) fichiers[idx].etudiantDA = assoc.etudiantDA;
            // Permettre coursId et groupeCoursId dans le batch (transfert entre groupes)
            if (assoc.coursId !== undefined) fichiers[idx].coursId = assoc.coursId;
            if (assoc.groupeCoursId !== undefined) fichiers[idx].groupeCoursId = assoc.groupeCoursId;

            // Phase 6 : synchroniser le statut
            if (fichiers[idx].statut !== undefined) {
                fichiers[idx].statut = fichiers[idx].productionId ? 'actif' : 'orphelin';
            }

            fichiers[idx].dateModification = new Date().toISOString();
            compteur++;
        }

        if (compteur > 0) {
            sauvegarderFichiersTravaux(fichiers);
        }
        return compteur;
    }

    /* ===============================
       GENERATION MINIATURES
       =============================== */

    /**
     * Genere une miniature pour une image
     * @param {Blob} blob - Le blob image
     * @returns {Promise<string>} Data URL de la miniature
     */
    function genererMiniatureImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);

                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;

                // Redimensionner en gardant les proportions
                if (w > MAX_THUMBNAIL_WIDTH) {
                    h = h * (MAX_THUMBNAIL_WIDTH / w);
                    w = MAX_THUMBNAIL_WIDTH;
                }
                if (h > MAX_THUMBNAIL_HEIGHT) {
                    w = w * (MAX_THUMBNAIL_HEIGHT / h);
                    h = MAX_THUMBNAIL_HEIGHT;
                }

                canvas.width = w;
                canvas.height = h;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY_THUMBNAIL));
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Erreur chargement image'));
            };

            img.src = url;
        });
    }

    /**
     * Genere une miniature pour la premiere page d'un PDF
     * @param {Blob} blob - Le blob PDF
     * @returns {Promise<{thumbnail: string, nombrePages: number}>}
     */
    async function genererMiniaturePDF(blob) {
        if (typeof pdfjsLib === 'undefined') {
            return { thumbnail: '', nombrePages: 1 };
        }

        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        // Redimensionner la miniature
        const thumbCanvas = document.createElement('canvas');
        let w = viewport.width;
        let h = viewport.height;

        if (w > MAX_THUMBNAIL_WIDTH) {
            h = h * (MAX_THUMBNAIL_WIDTH / w);
            w = MAX_THUMBNAIL_WIDTH;
        }

        thumbCanvas.width = w;
        thumbCanvas.height = h;
        thumbCanvas.getContext('2d').drawImage(canvas, 0, 0, w, h);

        return {
            thumbnail: thumbCanvas.toDataURL('image/jpeg', JPEG_QUALITY_THUMBNAIL),
            nombrePages: pdf.numPages
        };
    }

    /* ===============================
       STOCKAGE MINIATURES (IDB)
       Thumbnails stockees dans IDB keyvalue (cle thumbnail_{FT_id})
       pour eviter de gonfler fichiersTravaux dans localStorage.
       Cache memoire pour acces synchrone apres premier chargement.
       =============================== */

    const thumbnailCache = new Map();

    /**
     * Stocke une thumbnail dans IDB et le cache memoire
     * @param {string} fichierId - ID du fichier (FT_xxx)
     * @param {string} dataUrl - Data URL base64 de la miniature
     */
    function stockerThumbnail(fichierId, dataUrl) {
        if (!fichierId || !dataUrl) return;
        thumbnailCache.set(fichierId, dataUrl);
        // Ecriture IDB fire-and-forget (le cache memoire est la source synchrone)
        db.set('thumbnail_' + fichierId, dataUrl).catch(function(e) {
            console.warn('[Travaux-Stockage] Erreur stockage thumbnail IDB:', fichierId, e);
        });
    }

    /**
     * Recupere une thumbnail depuis le cache ou IDB (async)
     * @param {string} fichierId - ID du fichier (FT_xxx)
     * @returns {Promise<string>} Data URL ou '' si absente
     */
    async function obtenirThumbnail(fichierId) {
        if (!fichierId) return '';
        // Cache memoire (chaud apres migration ou premier chargement)
        var cached = thumbnailCache.get(fichierId);
        if (cached) return cached;
        // Fallback IDB
        try {
            var dataUrl = await db.get('thumbnail_' + fichierId, null);
            if (dataUrl) {
                thumbnailCache.set(fichierId, dataUrl);
                return dataUrl;
            }
        } catch (e) {
            console.warn('[Travaux-Stockage] Erreur lecture thumbnail IDB:', fichierId, e);
        }
        return '';
    }

    /**
     * Recupere une thumbnail depuis le cache memoire uniquement (synchrone)
     * Retourne '' si pas en cache — utile pour les templates innerHTML synchrones
     * @param {string} fichierId - ID du fichier (FT_xxx)
     * @returns {string} Data URL ou ''
     */
    function obtenirThumbnailSync(fichierId) {
        if (!fichierId) return '';
        return thumbnailCache.get(fichierId) || '';
    }

    /**
     * Supprime une thumbnail du cache et d'IDB
     * @param {string} fichierId - ID du fichier (FT_xxx)
     * @returns {Promise<void>}
     */
    async function supprimerThumbnail(fichierId) {
        if (!fichierId) return;
        thumbnailCache.delete(fichierId);
        try {
            await db.remove('thumbnail_' + fichierId);
        } catch (e) {
            console.warn('[Travaux-Stockage] Erreur suppression thumbnail IDB:', fichierId, e);
        }
    }

    /**
     * Charge les thumbnails manquantes dans un conteneur DOM
     * Cherche les elements avec data-thumbnail-id et remplit leur src depuis IDB
     * @param {Element} conteneur - Element DOM parent
     */
    async function chargerThumbnailsConteneur(conteneur) {
        if (!conteneur) return;
        var elements = conteneur.querySelectorAll('[data-thumbnail-id]');
        if (elements.length === 0) return;

        // Collecter les IDs uniques a charger
        var ids = [];
        for (var i = 0; i < elements.length; i++) {
            var id = elements[i].getAttribute('data-thumbnail-id');
            if (id && !thumbnailCache.has(id)) {
                ids.push(id);
            }
        }

        // Charger les thumbnails manquantes en parallèle
        await Promise.all(ids.map(function(id) { return obtenirThumbnail(id); }));

        // Appliquer les thumbnails aux elements
        for (var k = 0; k < elements.length; k++) {
            var el = elements[k];
            var thumbId = el.getAttribute('data-thumbnail-id');
            var url = thumbnailCache.get(thumbId);
            if (url) {
                if (el.tagName === 'IMG') {
                    el.src = url;
                    el.style.display = '';
                } else {
                    // Conteneur div : creer une img a l'interieur via DOM API
                    // plutot que innerHTML pour eviter une injection XSS si
                    // l'URL d'un thumbnail importe contenait des guillemets et
                    // un attribut event-handler. element.src = url assigne la
                    // chaine telle quelle sans la parser comme HTML.
                    el.textContent = '';
                    var img = document.createElement('img');
                    img.src = url;
                    img.alt = '';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';
                    el.appendChild(img);
                }
                // Masquer le placeholder frere
                var placeholder = el.nextElementSibling;
                if (placeholder && placeholder.tagName === 'SPAN') {
                    placeholder.style.display = 'none';
                }
            }
        }
    }

    /**
     * Pre-remplit le cache pour une liste d'IDs de fichiers
     * @param {Array<string>} fichierIds - Liste d'IDs de fichiers
     */
    async function prechargerThumbnails(fichierIds) {
        if (!fichierIds || fichierIds.length === 0) return;
        await Promise.all(fichierIds.map(function(id) { return obtenirThumbnail(id); }));
    }

    /* ===============================
       QUOTA ET STATISTIQUES
       =============================== */

    /**
     * Estime l'espace utilise par les fichiers travaux
     * @returns {Promise<Object>} {utilise, estimationTotal, pourcentage}
     */
    async function estimerQuota() {
        if (navigator.storage && navigator.storage.estimate) {
            const estimation = await navigator.storage.estimate();
            return {
                utilise: estimation.usage || 0,
                total: estimation.quota || 0,
                pourcentage: estimation.quota ? (estimation.usage / estimation.quota) : 0,
                alerteQuota: estimation.quota ? (estimation.usage / estimation.quota) >= SEUIL_ALERTE_QUOTA : false,
                utiliseFormate: formaterTaille(estimation.usage || 0),
                totalFormate: formaterTaille(estimation.quota || 0)
            };
        }

        return {
            utilise: 0, total: 0, pourcentage: 0,
            alerteQuota: false,
            utiliseFormate: 'Inconnu', totalFormate: 'Inconnu'
        };
    }

    /**
     * Formate une taille en bytes vers une chaine lisible
     * @param {number} bytes - Taille en bytes
     * @returns {string} Taille formatee
     */
    function formaterTaille(bytes) {
        if (bytes === 0) return '0 o';
        const unites = ['o', 'Ko', 'Mo', 'Go'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + unites[i];
    }

    /**
     * Compte le nombre total de fichiers et leur taille
     * @returns {Object} {nombre, tailleTotale, tailleFormatee}
     */
    function statistiquesFichiers() {
        const fichiers = obtenirFichiersTravaux();
        const tailleTotale = fichiers.reduce((acc, f) => acc + (f.tailleFichier || 0), 0);

        return {
            nombre: fichiers.length,
            tailleTotale: tailleTotale,
            tailleFormatee: formaterTaille(tailleTotale)
        };
    }

    /* ===============================
       ANNOTATIONS
       =============================== */

    /**
     * Obtient les annotations de travaux
     * @returns {Array} Liste des annotations
     */
    function obtenirAnnotations() {
        return db.getSync(cle('annotationsTravaux'), []);
    }

    /**
     * Sauvegarde les annotations
     * @param {Array} annotations - Liste des annotations
     * @param {{discret?: boolean}} [options] - voir _signalerSiGeste
     */
    function sauvegarderAnnotations(annotations, options) {
        db.setSync(cle('annotationsTravaux'), annotations);
        _signalerSiGeste(cle('annotationsTravaux'), options);
    }

    /**
     * Obtient l'annotation d'un fichier
     * @param {string} fichierId - ID du fichier
     * @returns {Object|null} L'annotation ou null
     */
    function obtenirAnnotationFichier(fichierId) {
        const annotations = obtenirAnnotations();
        return annotations.find(a => a.fichierId === fichierId) || null;
    }

    /**
     * Sauvegarde l'annotation d'un fichier
     * @param {Object} annotation - L'annotation a sauvegarder
     * @param {{discret?: boolean}} [options] - voir _signalerSiGeste
     */
    function sauvegarderAnnotationFichier(annotation, options) {
        const annotations = obtenirAnnotations();
        const index = annotations.findIndex(a => a.id === annotation.id);

        if (index !== -1) {
            annotations[index] = annotation;
        } else {
            annotations.push(annotation);
        }

        annotation.dateModification = new Date().toISOString();
        sauvegarderAnnotations(annotations, options);
    }

    /* ===============================
       CORBEILLE FICHIERS
       =============================== */

    const DUREE_CORBEILLE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

    /**
     * Obtient le contenu complet de la corbeille
     * @returns {Array} Tous les fichiers en corbeille
     */
    function obtenirCorbeilleComplete() {
        return db.getSync(cle('corbeilleFichiers'), []);
    }

    /**
     * Sauvegarde la corbeille
     * @param {Array} corbeille
     * @param {{discret?: boolean}} [options] - voir _signalerSiGeste
     */
    function sauvegarderCorbeille(corbeille, options) {
        db.setSync(cle('corbeilleFichiers'), corbeille);
        _signalerSiGeste(cle('corbeilleFichiers'), options);
    }

    /**
     * Obtient les fichiers en corbeille filtrés par le groupe-cours actif
     * @returns {Array}
     */
    function obtenirCorbeille() {
        const corbeille = obtenirCorbeilleComplete();
        const gcActif = db.getSync('groupeCoursActif', null);
        if (!gcActif || !gcActif.id) return corbeille;
        return corbeille.filter(f => f.groupeCoursId === gcActif.id);
    }

    /**
     * Déplace un fichier dans la corbeille (soft delete)
     * @param {string} id - ID du fichier
     * @returns {boolean} true si déplacé
     */
    function deplacerEnCorbeille(id) {
        const fichiers = obtenirFichiersTravaux();
        const index = fichiers.findIndex(f => f.id === id);
        if (index === -1) return false;

        // Copier les métadonnées + date de suppression
        const fichier = Object.assign({}, fichiers[index], {
            dateSuppression: new Date().toISOString()
        });

        // Ajouter à la corbeille
        const corbeille = obtenirCorbeilleComplete();
        corbeille.push(fichier);
        sauvegarderCorbeille(corbeille);

        // Retirer de la liste active (blob intact)
        fichiers.splice(index, 1);
        sauvegarderFichiersTravaux(fichiers);

        return true;
    }

    /**
     * Restaure un fichier depuis la corbeille
     * @param {string} id - ID du fichier
     * @returns {boolean} true si restauré
     */
    function restaurerDeCorbeille(id) {
        const corbeille = obtenirCorbeilleComplete();
        const index = corbeille.findIndex(f => f.id === id);
        if (index === -1) return false;

        // Retirer de la corbeille et enlever dateSuppression
        const fichier = Object.assign({}, corbeille[index]);
        delete fichier.dateSuppression;

        corbeille.splice(index, 1);
        sauvegarderCorbeille(corbeille);

        // Remettre dans la liste active
        const fichiers = obtenirFichiersTravaux();
        fichiers.push(fichier);
        sauvegarderFichiersTravaux(fichiers);

        return true;
    }

    /**
     * Supprime définitivement un fichier de la corbeille (blob + métadonnées)
     * @param {string} id - ID du fichier
     * @returns {Promise<boolean>}
     */
    async function supprimerDefinitivement(id) {
        // Supprimer le blob
        try {
            await supprimerBlob(id);
        } catch (e) {
            console.warn(`[Travaux-Stockage] Blob introuvable pour ${id}`);
        }
        // Supprimer la thumbnail IDB
        supprimerThumbnail(id).catch(function() {});

        // #572 — les annotations du fichier partent avec lui (elles restaient
        // orphelines en base, sans plus aucun fichier pour les lire).
        supprimerAnnotationsFichiers([id]);

        // Retirer de la corbeille
        const corbeille = obtenirCorbeilleComplete();
        const index = corbeille.findIndex(f => f.id === id);
        if (index !== -1) {
            corbeille.splice(index, 1);
            sauvegarderCorbeille(corbeille);
            return true;
        }
        return false;
    }

    /**
     * #572 — Retire les annotations des fichiers donnés (suppression définitive,
     * purge de la corbeille). N'écrit rien s'il n'y a rien à retirer.
     * @param {string[]} ids
     * @param {{discret?: boolean}} [options] - voir _signalerSiGeste
     * @returns {number} nombre d'annotations retirées
     */
    function supprimerAnnotationsFichiers(ids, options) {
        const cibles = new Set(ids || []);
        if (cibles.size === 0) return 0;
        const annotations = obtenirAnnotations();
        const restantes = annotations.filter(a => !(a && cibles.has(a.fichierId)));
        const retirees = annotations.length - restantes.length;
        if (retirees > 0) sauvegarderAnnotations(restantes, options);
        return retirees;
    }

    /**
     * Purge les fichiers expirés de la corbeille (> 30 jours)
     * @returns {Promise<number>} Nombre de fichiers purgés
     */
    async function purgerCorbeilleExpiree() {
        const corbeille = obtenirCorbeilleComplete();
        const maintenant = Date.now();
        const expirees = [];
        const restantes = [];

        for (const f of corbeille) {
            const dateSup = new Date(f.dateSuppression).getTime();
            if (maintenant - dateSup > DUREE_CORBEILLE_MS) {
                expirees.push(f);
            } else {
                restantes.push(f);
            }
        }

        if (expirees.length === 0) return 0;

        // #572 — leurs annotations aussi. Purge au démarrage : pas un geste (lot F).
        supprimerAnnotationsFichiers(expirees.map(f => f.id), { discret: true });

        // Supprimer les blobs expirés
        for (const f of expirees) {
            try {
                await supprimerBlob(f.id);
            } catch (e) {
                console.warn(`[Travaux-Stockage] Blob introuvable pour ${f.id}`);
            }
        }

        sauvegarderCorbeille(restantes, { discret: true });
        return expirees.length;
    }

    /**
     * Détruit définitivement les fichiers de corbeille DONNÉS (blobs + vignettes
     * + métadonnées).
     *
     * ⚠ #556 — LA LISTE EST OBLIGATOIRE, et c'est tout l'objet du correctif.
     * Cette fonction itérait `obtenirCorbeilleComplete()` puis terminait par
     * `sauvegarderCorbeille([])`, alors que son unique appelant — la modale
     * « Vider la corbeille ? » — n'annonce que la corbeille du groupe-cours
     * ACTIF (`obtenirCorbeille()`, filtrée). Les fichiers des AUTRES
     * groupes-cours du trimestre étaient donc détruits sans avoir jamais été
     * comptés à l'écran : perte définitive et silencieuse.
     * ⮕ Détruire toute la corbeille du trimestre reste possible, mais il faut
     * désormais le DEMANDER, en passant `obtenirCorbeilleComplete()`. Ce n'est
     * plus ce qu'on obtient par omission.
     *
     * @param {Array<Object>} fichiers - Les fichiers à détruire, c'est-à-dire
     *        exactement ceux qui ont été annoncés à l'utilisateur.
     * @returns {Promise<number>} Nombre de fichiers réellement retirés de la corbeille
     */
    async function viderCorbeille(fichiers) {
        if (!Array.isArray(fichiers)) {
            console.warn('[Travaux-Stockage] viderCorbeille appelée sans la liste des fichiers à détruire — aucune suppression (#556).');
            return 0;
        }
        if (fichiers.length === 0) return 0;

        const aDetruire = new Set(fichiers.map(f => f.id));

        for (const f of fichiers) {
            try {
                await supprimerBlob(f.id);
            } catch (e) {
                console.warn(`[Travaux-Stockage] Blob introuvable pour ${f.id}`);
            }
            supprimerThumbnail(f.id).catch(function() {});
        }

        // Relecture APRÈS les await : un fichier mis en corbeille pendant les
        // suppressions de blobs doit survivre à la réécriture des métadonnées.
        const avant = obtenirCorbeilleComplete();
        const restantes = avant.filter(f => !aDetruire.has(f.id));
        sauvegarderCorbeille(restantes);
        return avant.length - restantes.length;
    }

    /* ===============================
       CYCLE DE VIE DES BLOBS
       =============================== */

    /**
     * Migration : ajoute blobStatut = 'present' aux fichiers existants sans ce champ
     */
    function migrerBlobStatut() {
        const fichiers = obtenirFichiersTravaux();
        let modifie = false;
        for (const f of fichiers) {
            if (!f.blobStatut) {
                f.blobStatut = 'present';
                modifie = true;
            }
        }
        if (modifie) {
            sauvegarderFichiersTravaux(fichiers, { discret: true });
        }
    }

    /**
     * Marque un fichier comme exporte
     * @param {string} fichierId - ID du fichier
     */
    function marquerExporte(fichierId) {
        const fichiers = obtenirFichiersTravaux();
        const f = fichiers.find(x => x.id === fichierId);
        if (f) {
            f.blobStatut = 'exporte';
            f.dateExport = new Date().toISOString();
            sauvegarderFichiersTravaux(fichiers, { discret: true });
        }
    }


    /* ===============================
       MIGRATION THUMBNAILS
       =============================== */

    /**
     * Migration one-shot : extrait les thumbnailDataUrl de fichiersTravaux
     * et de la corbeille vers IDB keyvalue (cle thumbnail_{FT_id}).
     * Idempotente grace au flag _migration_thumbnails_done.
     */
    async function _migrerThumbnailsVersIDB() {
        if (db.getSync('_migration_thumbnails_done', false)) return;

        var compteur = 0;

        // 1. Migrer fichiersTravaux
        var fichiers = obtenirFichiersTravaux();
        for (var i = 0; i < fichiers.length; i++) {
            if (fichiers[i].thumbnailDataUrl) {
                await db.set('thumbnail_' + fichiers[i].id, fichiers[i].thumbnailDataUrl);
                thumbnailCache.set(fichiers[i].id, fichiers[i].thumbnailDataUrl);
                fichiers[i].thumbnailDataUrl = '';
                compteur++;
            }
        }
        if (compteur > 0) {
            sauvegarderFichiersTravaux(fichiers, { discret: true });
        }

        // 2. Migrer la corbeille
        var compteurCorbeille = 0;
        var corbeille = obtenirCorbeilleComplete();
        for (var j = 0; j < corbeille.length; j++) {
            if (corbeille[j].thumbnailDataUrl) {
                await db.set('thumbnail_' + corbeille[j].id, corbeille[j].thumbnailDataUrl);
                thumbnailCache.set(corbeille[j].id, corbeille[j].thumbnailDataUrl);
                corbeille[j].thumbnailDataUrl = '';
                compteurCorbeille++;
            }
        }
        if (compteurCorbeille > 0) {
            sauvegarderCorbeille(corbeille, { discret: true });
        }

        db.setSync('_migration_thumbnails_done', true);

        if (compteur + compteurCorbeille > 0) {
            console.warn('[Travaux-Stockage] Migration thumbnails: ' + (compteur + compteurCorbeille) + ' miniature(s) extraite(s) vers IDB');
        }
    }

    /* ===============================
       INITIALISATION
       =============================== */

    async function initialiserStockageTravaux() {
        try {
            // Le store fichiers est désormais géré par db.js (MonitoragePedagogique v2)

            // Tenter de restaurer le FSAPI si disponible
            if (fsapiDisponible) {
                const restaure = await restaurerFSAPI();
                if (restaure) {
                }
            }

            // Demander le stockage persistant si disponible
            if (navigator.storage && navigator.storage.persist) {
                const persistent = await navigator.storage.persist();
            }

            // Migration blobStatut pour fichiers existants
            migrerBlobStatut();

            // Migration thumbnails : extraire vers IDB pour desaturer localStorage
            await _migrerThumbnailsVersIDB();

            // Purger les fichiers expirés de la corbeille (> 30 jours)
            purgerCorbeilleExpiree();

        } catch (error) {
            console.error('[Travaux-Stockage] Erreur initialisation:', error);
        }
    }

    // #892 — « Exporté » n'est posé que sur ce qui est réellement parti depuis
    // 1.142.17 (#891, 16 sept. 2026). Une marque plus ancienne ne garantit rien,
    // et le stock mal marqué chez les testeurs le reste : on ne s'y fie pas.
    const BORNE_MARQUE_EXPORT_FIABLE = new Date(2026, 8, 16).getTime();

    /**
     * #892 — Trie les copies qu'on peut retirer SANS RIEN PERDRE. Fonction pure.
     *
     * Une copie n'est proposée que si son fichier est sorti, et que la marque
     * qui le dit est fiable : `blobStatut === 'exporte'`, une `dateExport`
     * lisible, postérieure à la borne du 16 septembre 2026, et aucune
     * annotation posée APRÈS l'export (ce travail-là n'est pas dans le fichier
     * sorti). L'âge ne sert qu'à ordonner la liste.
     *
     * @param {Array} fichiers - métadonnées des copies (le groupe affiché)
     * @param {Array} annotations - annotations du trimestre
     * @returns {{ aRetirer: Array, marqueAncienne: Array }}
     */
    function selectionnerCopiesARetirer(fichiers, annotations) {
        const derniereAnnotation = {};
        (annotations || []).forEach(a => {
            const t = Date.parse(a && a.dateModification);
            if (a && a.fichierId && !isNaN(t)) {
                derniereAnnotation[a.fichierId] = Math.max(derniereAnnotation[a.fichierId] || 0, t);
            }
        });

        const aRetirer = [];
        const marqueAncienne = [];
        (fichiers || []).forEach(f => {
            if (!f || f.blobStatut !== 'exporte') return;
            const exporteLe = Date.parse(f.dateExport);
            if (isNaN(exporteLe)) return;
            if (exporteLe < BORNE_MARQUE_EXPORT_FIABLE) {
                marqueAncienne.push(f);
                return;
            }
            if ((derniereAnnotation[f.id] || 0) > exporteLe) return;
            aRetirer.push(f);
        });

        aRetirer.sort((a, b) => Date.parse(a.dateExport) - Date.parse(b.dateExport));
        return { aRetirer: aRetirer, marqueAncienne: marqueAncienne };
    }

    /**
     * Retire des copies déjà exportées (blob, vignette, métadonnées).
     *
     * #892 — la garde est ICI, dans l'écrivain : chaque id est repassé par
     * `selectionnerCopiesARetirer` sur le stock relu au moment d'effacer. Un id
     * qui n'est pas (ou plus) une copie exportée est ignoré, quel que soit
     * l'appelant : cette fonction ne peut pas effacer un fichier non exporté.
     *
     * @param {Array} fichiersArchives - IDs des copies à retirer
     * @returns {Promise<number>} Nombre de fichiers supprimes
     */
    async function nettoyerFichiersArchives(fichiersArchives) {
        const permis = new Set(
            selectionnerCopiesARetirer(obtenirFichiersTravaux(), obtenirAnnotations()).aRetirer.map(f => f.id)
        );
        let supprimes = 0;
        for (const id of (fichiersArchives || [])) {
            if (!permis.has(id)) {
                console.warn(`[Travaux-Stockage] Nettoyage refusé pour ${id} : copie non exportée`);
                continue;
            }
            try {
                if (await supprimerFichierTravail(id)) supprimes++;
            } catch (e) {
                console.warn(`[Travaux-Stockage] Erreur nettoyage ${id}:`, e);
            }
        }
        return supprimes;
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxStockage = {
        // T4 du chantier du démo
        refusDuDemoSurDisque: refusDuDemoSurDisque,
        AVIS_DEMO_DOSSIER: AVIS_DEMO_DOSSIER,
        initialiser: initialiserStockageTravaux,
        // Blobs
        stockerBlob: stockerBlob,
        recupererBlob: recupererBlob,
        supprimerBlob: supprimerBlob,
        listerBlobsEtudiant: listerBlobsEtudiant,
        // Metadonnees
        obtenirFichiersTravaux: obtenirFichiersTravaux,
        obtenirFichiersGroupeActif: obtenirFichiersGroupeActif,
        obtenirFichiersAffiches: obtenirFichiersAffiches, // #1013
        ajouterFichierTravail: ajouterFichierTravail,
        supprimerFichierTravail: supprimerFichierTravail,
        obtenirFichiersEtudiant: obtenirFichiersEtudiant,
        obtenirFichiersProduction: obtenirFichiersProduction,
        obtenirFichierParId: obtenirFichierParId,
        mettreAJourFichier: mettreAJourFichier,
        mettreAJourFichiersBatch: mettreAJourFichiersBatch,
        reassocierFichier: reassocierFichier,
        reassocierFichiersBatch: reassocierFichiersBatch,
        // Miniatures — generation
        genererMiniatureImage: genererMiniatureImage,
        genererMiniaturePDF: genererMiniaturePDF,
        // Miniatures — stockage IDB
        stockerThumbnail: stockerThumbnail,
        obtenirThumbnail: obtenirThumbnail,
        obtenirThumbnailSync: obtenirThumbnailSync,
        supprimerThumbnail: supprimerThumbnail,
        chargerThumbnailsConteneur: chargerThumbnailsConteneur,
        prechargerThumbnails: prechargerThumbnails,
        // Quota
        estimerQuota: estimerQuota,
        formaterTaille: formaterTaille,
        statistiquesFichiers: statistiquesFichiers,
        // Annotations
        obtenirAnnotations: obtenirAnnotations,
        obtenirAnnotationFichier: obtenirAnnotationFichier,
        sauvegarderAnnotationFichier: sauvegarderAnnotationFichier,
        // FSAPI
        estFSAPIDisponible: estFSAPIDisponible,
        estFSAPIActif: estFSAPIActif,
        configurerRepertoireFSAPI: configurerRepertoireFSAPI,
        // Nettoyage
        selectionnerCopiesARetirer: selectionnerCopiesARetirer,
        nettoyerFichiersArchives: nettoyerFichiersArchives,
        // Cycle de vie des blobs
        marquerExporte: marquerExporte,
        // Sauvegarde (expose pour reimport)
        sauvegarderFichiersTravaux: sauvegarderFichiersTravaux,
        // Corbeille
        obtenirCorbeille: obtenirCorbeille,
        deplacerEnCorbeille: deplacerEnCorbeille,
        restaurerDeCorbeille: restaurerDeCorbeille,
        supprimerDefinitivement: supprimerDefinitivement,
        supprimerAnnotationsFichiers: supprimerAnnotationsFichiers,   // #572
        purgerCorbeilleExpiree: purgerCorbeilleExpiree,
        viderCorbeille: viderCorbeille
    };

})();
