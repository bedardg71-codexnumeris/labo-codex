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

    // Patterns pour detecter un DA dans le nom de fichier
    // Ex: "1234567_travail.pdf", "Beaulieu_Emma_1234567.pdf", etc.
    const PATTERNS_DA = [
        /\b(\d{7})\b/,                    // 7 chiffres contigus
        /DA[_\-\s]?(\d{7})/i,             // DA1234567 ou DA_1234567
        /(\d{7})[_\-\s]/,                 // 1234567_ au debut
        /[_\-\s](\d{7})\./,               // _1234567. avant extension
    ];

    // Compression images iPad
    const MAX_IMAGE_DIMENSION = 2000;
    const JPEG_QUALITY_IMPORT = 0.85;

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let fichiersEnAttente = [];
    let productionSelectionnee = '';
    let importEnCours = false;

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
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        return etudiants.find(e => e.da === da) || null;
    }

    /**
     * Tente de jumeler par nom dans le fichier
     * @param {string} nomFichier - Le nom du fichier
     * @returns {Object|null} L'etudiant trouve ou null
     */
    function trouverEtudiantParNom(nomFichier) {
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
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
                        console.log(`[Travaux-Import] Image compressee: ${(blob.size/1024).toFixed(0)}KB -> ${(blobCompresse.size/1024).toFixed(0)}KB`);
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

        return {
            fichier: fichier,
            nomFichier: fichier.name,
            typeMIME: typeMIME,
            tailleFichier: fichier.size,
            daDetecte: daDetecte,
            etudiantAssocie: etudiant,
            etudiantDA: etudiant ? etudiant.da : daDetecte,
            estPDF: estPDF(typeMIME),
            estImage: estImage(typeMIME),
            statut: 'en-attente'
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
                fichiersEnAttente.push(prepare);
                acceptes.push(prepare);
            } else {
                console.warn(`[Travaux-Import] Type refuse: ${fichier.name} (${fichier.type})`);
            }
        }

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

        // Creer les metadonnees
        const metadonnees = {
            etudiantDA: fichierPrepare.etudiantDA,
            productionId: productionId,
            nomFichier: fichierPrepare.nomFichier,
            typeMIME: typeMIME,
            tailleFichier: blob.size,
            nombrePages: nombrePages,
            thumbnailDataUrl: thumbnail,
            source: 'import-local',
            importePar: 'single'
        };

        // Ajouter les metadonnees
        const fichierTravail = travauxStockage.ajouterFichierTravail(metadonnees);

        // Stocker le blob
        await travauxStockage.stockerBlob(
            fichierTravail.id,
            blob,
            fichierPrepare.etudiantDA,
            productionId
        );

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
        const total = fichiersEnAttente.length;

        for (let i = 0; i < fichiersEnAttente.length; i++) {
            const fichier = fichiersEnAttente[i];
            if (fichier.statut === 'importe') continue;

            try {
                await importerFichier(fichier, productionId);
                importes++;
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

        return { importes, erreurs, total };
    }

    /**
     * Vide la liste des fichiers en attente
     */
    function viderFileDAttente() {
        fichiersEnAttente = [];
    }

    /**
     * Retourne les fichiers en attente
     * @returns {Array}
     */
    function obtenirFileDAttente() {
        return fichiersEnAttente;
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
        zone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = EXTENSIONS_ACCEPTEES.join(',');

            input.addEventListener('change', () => {
                if (input.files.length > 0) {
                    const prepares = ajouterFichiersEnAttente(input.files);
                    if (onFichiersAjoutes) {
                        onFichiersAjoutes(prepares);
                    }
                }
            });

            input.click();
        });
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

        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));

        let html = '<div class="travaux-file-attente">';

        fichiersEnAttente.forEach((f, index) => {
            const etudiantNom = f.etudiantAssocie
                ? `${echapperHtml(f.etudiantAssocie.prenom)} ${echapperHtml(f.etudiantAssocie.nom)}`
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
                        <select class="form-select travaux-select-etudiant" data-index="${index}" onchange="travauxImport.changerEtudiant(${index}, this.value)">
                            <option value="">-- Associer --</option>
                            ${etudiants.map(e => `<option value="${e.da}" ${f.etudiantDA === e.da ? 'selected' : ''}>${echapperHtml(e.prenom + ' ' + e.nom)} (${e.da})</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn-supprimer-fichier" onclick="travauxImport.retirerFichier(${index})" title="Retirer">
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
            // Rafraichir l'affichage
            if (typeof window.rafraichirImportTravaux === 'function') {
                window.rafraichirImportTravaux();
            }
        }
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxImport = {
        // Detection
        detecterDA: detecterDA,
        trouverEtudiantParDA: trouverEtudiantParDA,
        // Validation
        estTypeAccepte: estTypeAccepte,
        // File d'attente
        ajouterFichiersEnAttente: ajouterFichiersEnAttente,
        obtenirFileDAttente: obtenirFileDAttente,
        viderFileDAttente: viderFileDAttente,
        changerEtudiant: changerEtudiant,
        retirerFichier: retirerFichier,
        // Import
        importerFichier: importerFichier,
        importerTous: importerTous,
        // Drag & Drop
        initialiserDropZone: initialiserDropZone,
        // UI
        genererHTMLFileDAttente: genererHTMLFileDAttente,
        // Etat
        get importEnCours() { return importEnCours; }
    };

})();
