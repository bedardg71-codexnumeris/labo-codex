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

    const NOM_STORE = 'fichiers';
    const DB_VERSION = 2;
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
       STORE FICHIERS (IndexedDB)
       =============================== */

    let fichiersDB = null;
    let fichiersDBReady = false;

    /**
     * Initialise le store fichiers dans IndexedDB
     * Ouvre ou met a jour la base MonitorageFichiers
     */
    async function initialiserStoreFichiers() {
        if (fichiersDBReady) return fichiersDB;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MonitorageFichiers', DB_VERSION);

            request.onerror = () => {
                console.error('[Travaux-Stockage] Erreur ouverture IndexedDB fichiers');
                reject(request.error);
            };

            request.onsuccess = (event) => {
                fichiersDB = event.target.result;
                fichiersDBReady = true;
                console.log('[Travaux-Stockage] Store fichiers pret');
                resolve(fichiersDB);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(NOM_STORE)) {
                    const store = db.createObjectStore(NOM_STORE, { keyPath: 'id' });
                    store.createIndex('etudiantDA', 'etudiantDA', { unique: false });
                    store.createIndex('productionId', 'productionId', { unique: false });
                    console.log('[Travaux-Stockage] Store fichiers cree');
                }
            };
        });
    }

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

            console.log('[Travaux-Stockage] FSAPI configure:', fsapiDirectoryHandle.name);
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
        await initialiserStoreFichiers();
        return new Promise((resolve, reject) => {
            const tx = fichiersDB.transaction([NOM_STORE], 'readwrite');
            const store = tx.objectStore(NOM_STORE);
            store.put({ id: FSAPI_HANDLE_KEY, handle: handle, dateStored: new Date().toISOString() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Recupere le handle FSAPI depuis IndexedDB
     * @returns {Promise<FileSystemDirectoryHandle|null>}
     */
    async function recupererHandleFSAPI() {
        await initialiserStoreFichiers();
        return new Promise((resolve) => {
            const tx = fichiersDB.transaction([NOM_STORE], 'readonly');
            const store = tx.objectStore(NOM_STORE);
            const req = store.get(FSAPI_HANDLE_KEY);
            req.onsuccess = () => {
                if (req.result && req.result.handle) {
                    resolve(req.result.handle);
                } else {
                    resolve(null);
                }
            };
            req.onerror = () => resolve(null);
        });
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
                console.log('[Travaux-Stockage] FSAPI restaure:', handle.name);
                return true;
            }

            // Demander la permission
            const newPermission = await handle.requestPermission({ mode: 'readwrite' });
            if (newPermission === 'granted') {
                fsapiDirectoryHandle = handle;
                fsapiActif = true;
                console.log('[Travaux-Stockage] FSAPI re-autorise:', handle.name);
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
        console.log(`[Travaux-Stockage] Blob FSAPI stocke: ${id} (${(blob.size / 1024).toFixed(1)} KB)`);
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
            console.log(`[Travaux-Stockage] Blob FSAPI supprime: ${id}`);
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
     * Stocke un blob (fichier) dans IndexedDB
     * @param {string} id - ID du fichier travail (FT_xxx)
     * @param {Blob} blob - Le contenu du fichier
     * @param {string} etudiantDA - DA de l'etudiant
     * @param {string} productionId - ID de la production
     * @returns {Promise<void>}
     */
    async function stockerBlob(id, blob, etudiantDA, productionId) {
        // FSAPI: fichier sur disque
        if (fsapiActif) {
            await stockerBlobFSAPI(id, blob);
            return;
        }

        // Fallback: IndexedDB
        await initialiserStoreFichiers();

        return new Promise((resolve, reject) => {
            const transaction = fichiersDB.transaction([NOM_STORE], 'readwrite');
            const store = transaction.objectStore(NOM_STORE);

            const enregistrement = {
                id: id,
                etudiantDA: etudiantDA,
                productionId: productionId,
                blob: blob,
                dateStored: new Date().toISOString()
            };

            const request = store.put(enregistrement);

            request.onsuccess = () => {
                console.log(`[Travaux-Stockage] Blob stocke: ${id} (${(blob.size / 1024).toFixed(1)} KB)`);
                resolve();
            };

            request.onerror = () => {
                console.error(`[Travaux-Stockage] Erreur stockage blob: ${id}`, request.error);
                reject(request.error);
            };
        });
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

        // Fallback: IndexedDB
        await initialiserStoreFichiers();

        return new Promise((resolve, reject) => {
            const transaction = fichiersDB.transaction([NOM_STORE], 'readonly');
            const store = transaction.objectStore(NOM_STORE);
            const request = store.get(id);

            request.onsuccess = () => {
                if (request.result && request.result.blob) {
                    resolve(request.result.blob);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error(`[Travaux-Stockage] Erreur lecture blob: ${id}`, request.error);
                reject(request.error);
            };
        });
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

        // Fallback: IndexedDB
        await initialiserStoreFichiers();

        return new Promise((resolve, reject) => {
            const transaction = fichiersDB.transaction([NOM_STORE], 'readwrite');
            const store = transaction.objectStore(NOM_STORE);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`[Travaux-Stockage] Blob supprime: ${id}`);
                resolve();
            };

            request.onerror = () => {
                console.error(`[Travaux-Stockage] Erreur suppression blob: ${id}`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Recupere tous les blobs d'un etudiant
     * @param {string} da - DA de l'etudiant
     * @returns {Promise<Array>} Liste des enregistrements (sans blob pour performance)
     */
    async function listerBlobsEtudiant(da) {
        await initialiserStoreFichiers();

        return new Promise((resolve, reject) => {
            const transaction = fichiersDB.transaction([NOM_STORE], 'readonly');
            const store = transaction.objectStore(NOM_STORE);
            const index = store.index('etudiantDA');
            const request = index.getAll(da);

            request.onsuccess = () => {
                // Retourner les metadonnees sans les blobs (performance)
                const resultats = (request.result || []).map(r => ({
                    id: r.id,
                    etudiantDA: r.etudiantDA,
                    productionId: r.productionId,
                    dateStored: r.dateStored,
                    taille: r.blob ? r.blob.size : 0
                }));
                resolve(resultats);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
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
     * Sauvegarde la liste des fichiers travaux
     * @param {Array} fichiers - Liste mise a jour
     */
    function sauvegarderFichiersTravaux(fichiers) {
        db.setSync(cle('fichiersTravaux'), fichiers);
    }

    /**
     * Ajoute les metadonnees d'un fichier travail
     * @param {Object} metadonnees - Metadonnees du fichier
     * @returns {Object} Le fichier ajoute avec son ID
     */
    function ajouterFichierTravail(metadonnees) {
        const fichiers = obtenirFichiersTravaux();
        const id = 'FT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

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
            blobStatut: 'present'  // Cycle de vie: present → exporte → facsimile
        };

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
        return obtenirFichiersTravaux().filter(f => f.productionId === productionId);
    }

    /**
     * Obtient un fichier par son ID
     * @param {string} id - ID du fichier
     * @returns {Object|null} Le fichier ou null
     */
    function obtenirFichierParId(id) {
        return obtenirFichiersTravaux().find(f => f.id === id) || null;
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
     */
    function sauvegarderAnnotations(annotations) {
        db.setSync(cle('annotationsTravaux'), annotations);
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
     */
    function sauvegarderAnnotationFichier(annotation) {
        const annotations = obtenirAnnotations();
        const index = annotations.findIndex(a => a.id === annotation.id);

        if (index !== -1) {
            annotations[index] = annotation;
        } else {
            annotations.push(annotation);
        }

        annotation.dateModification = new Date().toISOString();
        sauvegarderAnnotations(annotations);
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
            sauvegarderFichiersTravaux(fichiers);
            console.log('[Travaux-Stockage] Migration blobStatut effectuee');
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
            sauvegarderFichiersTravaux(fichiers);
        }
    }

    /**
     * Convertit un fichier en fac-simile (version allegee)
     * Niveaux de gris, 800px max, JPEG 0.5
     * Poids cible : ~30-80 Ko (vs 1-12 Mo l'original)
     *
     * @param {string} fichierId - ID du fichier
     * @returns {Promise<boolean>} true si conversion reussie
     */
    async function convertirEnFacsimile(fichierId) {
        const blob = await recupererBlob(fichierId);
        if (!blob) return false;

        const fichiers = obtenirFichiersTravaux();
        const fichier = fichiers.find(f => f.id === fichierId);
        if (!fichier) return false;

        try {
            let facsimileBlob;

            if (fichier.typeMIME.startsWith('image/')) {
                facsimileBlob = await genererFacsimileImage(blob);
            } else if (fichier.typeMIME === 'application/pdf') {
                // Pour les PDF, convertir la premiere page en image allegee
                facsimileBlob = await genererFacsimilePDF(blob);
            } else {
                return false;
            }

            if (!facsimileBlob) return false;

            // Remplacer le blob original par le fac-simile
            await stockerBlob(fichierId, facsimileBlob, fichier.etudiantDA, fichier.productionId);

            // Mettre a jour les metadonnees
            fichier.blobStatut = 'facsimile';
            fichier.dateFacsimile = new Date().toISOString();
            fichier.tailleFichier = facsimileBlob.size;
            fichier.dateModification = new Date().toISOString();
            sauvegarderFichiersTravaux(fichiers);

            console.log(`[Travaux-Stockage] Fac-simile cree: ${fichierId} (${formaterTaille(facsimileBlob.size)})`);
            return true;
        } catch (e) {
            console.error('[Travaux-Stockage] Erreur fac-simile:', e);
            return false;
        }
    }

    /**
     * Genere un fac-simile image : niveaux de gris, 800px max, JPEG 0.5
     * @param {Blob} blob - Image originale
     * @returns {Promise<Blob>}
     */
    function genererFacsimileImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);

                let w = img.width;
                let h = img.height;
                const MAX_DIM = 800;

                if (w > MAX_DIM || h > MAX_DIM) {
                    if (w > h) {
                        h = Math.round(h * (MAX_DIM / w));
                        w = MAX_DIM;
                    } else {
                        w = Math.round(w * (MAX_DIM / h));
                        h = MAX_DIM;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');

                // Appliquer niveaux de gris via filter
                ctx.filter = 'grayscale(1)';
                ctx.drawImage(img, 0, 0, w, h);
                ctx.filter = 'none';

                canvas.toBlob(resolve, 'image/jpeg', 0.5);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Erreur chargement image'));
            };

            img.src = url;
        });
    }

    /**
     * Genere un fac-simile PDF : premiere page en NdG, 800px, JPEG 0.5
     * @param {Blob} blob - PDF original
     * @returns {Promise<Blob>}
     */
    async function genererFacsimilePDF(blob) {
        if (typeof pdfjsLib === 'undefined') return null;

        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.0 });
        let scale = 1.0;
        const MAX_DIM = 800;

        if (viewport.width > MAX_DIM || viewport.height > MAX_DIM) {
            scale = Math.min(MAX_DIM / viewport.width, MAX_DIM / viewport.height);
        }

        const scaledViewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

        // Appliquer niveaux de gris
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gris = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = data[i + 1] = data[i + 2] = gris;
        }
        ctx.putImageData(imageData, 0, 0);

        return new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.5);
        });
    }

    /**
     * Allegement en lot : convertit tous les fichiers 'exporte' en fac-similes
     * @param {Function} onProgression - Callback (traites, total)
     * @returns {Promise<{convertis: number, erreurs: number}>}
     */
    async function allegerFichiersExportes(onProgression) {
        const fichiers = obtenirFichiersTravaux();
        const exportes = fichiers.filter(f => f.blobStatut === 'exporte');
        let convertis = 0;
        let erreurs = 0;

        for (let i = 0; i < exportes.length; i++) {
            const ok = await convertirEnFacsimile(exportes[i].id);
            if (ok) convertis++;
            else erreurs++;

            if (onProgression) {
                onProgression(i + 1, exportes.length);
            }
        }

        return { convertis, erreurs };
    }

    /* ===============================
       INITIALISATION
       =============================== */

    async function initialiserStockageTravaux() {
        try {
            await initialiserStoreFichiers();

            // Tenter de restaurer le FSAPI si disponible
            if (fsapiDisponible) {
                const restaure = await restaurerFSAPI();
                if (restaure) {
                    console.log('[Travaux-Stockage] FSAPI restaure depuis session precedente');
                }
            }

            // Demander le stockage persistant si disponible
            if (navigator.storage && navigator.storage.persist) {
                const persistent = await navigator.storage.persist();
                console.log(`[Travaux-Stockage] Stockage persistant: ${persistent ? 'accorde' : 'refuse'}`);
            }

            // Migration blobStatut pour fichiers existants
            migrerBlobStatut();

            console.log(`[Travaux-Stockage] Module initialise (mode: ${fsapiActif ? 'FSAPI' : 'IndexedDB'})`);
        } catch (error) {
            console.error('[Travaux-Stockage] Erreur initialisation:', error);
        }
    }

    /**
     * Propose le nettoyage des fichiers archives
     * @param {Array} fichiersArchives - IDs des fichiers archives
     * @returns {Promise<number>} Nombre de fichiers supprimes
     */
    async function nettoyerFichiersArchives(fichiersArchives) {
        let supprimes = 0;
        for (const id of fichiersArchives) {
            try {
                await supprimerFichierTravail(id);
                supprimes++;
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
        initialiser: initialiserStockageTravaux,
        // Blobs
        stockerBlob: stockerBlob,
        recupererBlob: recupererBlob,
        supprimerBlob: supprimerBlob,
        listerBlobsEtudiant: listerBlobsEtudiant,
        // Metadonnees
        obtenirFichiersTravaux: obtenirFichiersTravaux,
        ajouterFichierTravail: ajouterFichierTravail,
        supprimerFichierTravail: supprimerFichierTravail,
        obtenirFichiersEtudiant: obtenirFichiersEtudiant,
        obtenirFichiersProduction: obtenirFichiersProduction,
        obtenirFichierParId: obtenirFichierParId,
        // Miniatures
        genererMiniatureImage: genererMiniatureImage,
        genererMiniaturePDF: genererMiniaturePDF,
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
        nettoyerFichiersArchives: nettoyerFichiersArchives,
        // Cycle de vie des blobs
        marquerExporte: marquerExporte,
        convertirEnFacsimile: convertirEnFacsimile,
        allegerFichiersExportes: allegerFichiersExportes,
        // Sauvegarde (expose pour reimport)
        sauvegarderFichiersTravaux: sauvegarderFichiersTravaux
    };

})();
