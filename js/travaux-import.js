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
     * @returns {Promise<boolean>} true si les magic bytes correspondent à un format image/PDF supporte
     */
    async function validerMagicBytes(fichier) {
        try {
            // Lire 16 octets : suffisant pour PDF/PNG/JPEG (4) + WebP signature
            // a l'offset 8-11 + HEIF ftyp + brand a l'offset 8-11.
            var slice = fichier.slice(0, 16);
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
            // Necessite 12 octets minimum (offset 8-11). Le slice precedent
            // ne lisait que 8 octets, donc cette branche n'etait JAMAIS prise.
            if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;
            // HEIC/HEIF : ftyp a l'offset 4-7 + brand a l'offset 8-11.
            // Verifier le brand evite d'accepter MP4/MOV/3GP qui ont aussi ftyp.
            // Brands d'image legitimes : heic, heix, mif1, msf1, heim, heis, hevc,
            // hevx, avif (HEIF derive). Source : ISO/IEC 14496-12, ISO/IEC 23008-12.
            if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
                var brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
                var brandsImage = ['heic', 'heix', 'mif1', 'msf1', 'heim', 'heis', 'hevc', 'hevx', 'avif'];
                if (brandsImage.indexOf(brand) !== -1) return true;
                // Sinon : c'est un autre conteneur ISO BMFF (MP4, MOV, etc.) -> rejeter
                return false;
            }

            return false;
        } catch (e) {
            console.warn('[Travaux-Import] Impossible de lire les magic bytes:', e);
            // Sur erreur de lecture : refuser plutot qu'accepter. Le fallback
            // "accepter par defaut" defait completement le check de securite :
            // un attaquant pouvait fabriquer un fichier qui erreur a la lecture
            // pour bypasser la validation.
            return false;
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
     * Suffixe de PAGE d'une remise multi-fichiers, en fin de nom de production.
     *
     * #603 — Une remise Lea qui arrive en plusieurs pages est numerotee a la
     * main au dezippage : « …_Portrait_de_lecteur-p1__Remis_le_… » et
     * « …-p2__Remis_le_… ». Ce suffixe designe LA PAGE, pas une autre
     * production : le laisser dans `nomProduction` donne deux
     * `groupeDocumentId` differents pour un seul document.
     *
     * Formes reconnues, en FIN de chaine seulement : « -p2 », « _p 2 »,
     * « page 2 », « partie 2 », « part2 », « (2) ».
     */
    const SUFFIXE_PAGE = /[\s\-_]*(?:\((\d{1,3})\)|(?:p(?:age)?|part(?:ie)?)\s*(\d{1,3}))$/i;

    /**
     * Parse un nom de fichier au format Lea :
     * NOM_DA_Production_Remis_le_AAAA-MM-JJ_HHhMMmSSs.ext
     * ou NOM_DA_Production__Remis_le_AAAA-MM-JJ_HHhMMmSSs.ext
     * @param {string} nomFichier - Le nom complet du fichier
     * @returns {Object} { nom, da, nomProduction, page, dateRemise, raw }
     */
    function parserNomFichierLea(nomFichier) {
        const resultat = { nom: '', da: '', nomProduction: '', page: null, dateRemise: null, raw: nomFichier };

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

            // #603 — Detacher le suffixe de page AVANT que `nomProduction` ne
            // serve de cle de regroupement. Sans cela, « -p1 » et « -p2 »
            // fabriquent deux documents la ou il n'y en a qu'un : pas
            // d'assemblage multi-pages, et un faux doublon a la confirmation
            // d'import. Le suffixe n'est retire que s'il RESTE un nom de
            // production apres coup — « 9000200_p2 » sans titre garde le sien.
            const matchPage = resultat.nomProduction.match(SUFFIXE_PAGE);
            if (matchPage) {
                const resteProduction = resultat.nomProduction.slice(0, matchPage.index).replace(/[\s\-_]+$/, '').trim();
                if (resteProduction) {
                    resultat.page = parseInt(matchPage[1] || matchPage[2], 10);
                    resultat.nomProduction = resteProduction;
                }
            }
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
        marquerHeicNonDecodable(fichierPrepare);
        _thumbFile.push(fichierPrepare);
        _traiterThumbQueue();
    }

    /**
     * Marque, DÈS L'ENTRÉE DANS LA FILE, un HEIC que ce contexte ne peut pas décoder.
     *
     * Sans ce marquage, l'impossibilité ne se découvrait qu'au moment de la
     * miniature : le fichier s'affichait « Dimensions inconnues », comme un
     * fichier corrompu, et ne disait ni ce qu'il était ni quoi faire (#597).
     * Ouverte par double-clic, l'application ne PEUT PAS décoder un HEIC — voir
     * `HeicDecodeur.decodagePossible()`. Autant le dire tout de suite.
     *
     * @param {Object} fichierPrepare - Le fichier prepare (modifie sur place)
     * @returns {boolean} true si le fichier a été marqué comme non décodable
     */
    function marquerHeicNonDecodable(fichierPrepare) {
        if (!fichierPrepare || fichierPrepare.heicConverti) return false;
        if (typeof window.HeicDecodeur === 'undefined') return false;
        if (!window.HeicDecodeur.estHeic(fichierPrepare.fichier, fichierPrepare.nomFichier)) return false;
        if (window.HeicDecodeur.decodagePossible()) return false;

        fichierPrepare.heicEchec = true;
        fichierPrepare.heicRaison = 'L\'application est ouverte directement depuis le disque : '
            + 'elle ne peut pas décoder le format HEIC dans ce mode. Convertis la photo en JPEG '
            + 'avant de l\'importer, ou demande une remise en JPEG.';
        return true;
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
     * Beta 99.30 : Recense les fichiers de la file d'attente dont le DA détecté
     * appartient à un étudiant d'UN AUTRE groupe-cours du trimestre actif (ou
     * dont le coursId n'est pas celui du GC actif). Permet d'avertir l'utilisateur
     * qu'il importe potentiellement dans le mauvais contexte.
     *
     * @returns {Array<{gcId: string, groupe: string, gc: Object, count: number, das: string[]}>}
     *   Une entrée par GC concerné, ou [] si rien à signaler.
     */
    function detecterFichiersAutreGC() {
        try {
            const queue = obtenirFileDAttente();
            if (!queue || queue.length === 0) return [];

            // Lire la collection brute (non filtrée par GC actif)
            const tousEtudiants = (typeof db !== 'undefined' && typeof cle === 'function')
                ? (db.getSync(cle('groupeEtudiants'), []) || [])
                : [];
            const groupesCours = (typeof db !== 'undefined' && typeof cle === 'function')
                ? (db.getSync(cle('groupesCours'), []) || [])
                : [];
            if (!Array.isArray(tousEtudiants) || !Array.isArray(groupesCours)) return [];

            const gcActif = groupesCours.find(function(gc) { return gc && gc.actif; });
            const gcActifId = gcActif && gcActif.id;
            const normaliser = function(g) { return String(g || '').padStart(5, '0'); };

            // Recherche par nom dans la collection brute (logique alignée avec
            // trouverEtudiantParNom mais sans filtrage par GC actif).
            function chercherParNomEtendu(nomFichier) {
                if (!nomFichier) return null;
                const nomLower = nomFichier.toLowerCase().replace(/[_\-]/g, ' ');
                for (let i = 0; i < tousEtudiants.length; i++) {
                    const e = tousEtudiants[i];
                    if (!e) continue;
                    const nom = (e.nom || '').toLowerCase();
                    const prenom = (e.prenom || '').toLowerCase();
                    if (nom && prenom && nomLower.indexOf(nom) !== -1 && nomLower.indexOf(prenom) !== -1) return e;
                    if (nom && nom.length > 3 && nomLower.indexOf(nom) !== -1) return e;
                }
                return null;
            }

            const repartition = Object.create(null);
            queue.forEach(function(f) {
                if (!f) return;
                // Identifier l'étudiant probable. On NE se fie PAS à f.etudiantAssocie
                // pour décider si l'étudiant est du bon GC : obtenirDonneesSelonMode
                // filtre par coursId mais pas systématiquement par groupe, donc
                // f.etudiantAssocie peut pointer vers un étudiant d'un autre GC du
                // même cours. On revérifie ici via la collection brute.
                let etu = null;
                if (f.etudiantAssocie && f.etudiantAssocie.da) {
                    etu = tousEtudiants.find(function(e) { return e && e.da === f.etudiantAssocie.da; }) || f.etudiantAssocie;
                }
                if (!etu) {
                    const da = (f.parseLea && f.parseLea.da) || f.etudiantDA || f.daDetecte;
                    if (da) etu = tousEtudiants.find(function(e) { return e && e.da === da; });
                }
                if (!etu) etu = chercherParNomEtendu(f.nomFichier);
                if (!etu) return;
                // Retrouver le GC d'appartenance via coursId + groupe
                const groupeEtu = etu.groupe || etu.groupeReel;
                const gcCible = groupesCours.find(function(gc) {
                    return gc
                        && gc.coursId === etu.coursId
                        && normaliser(gc.groupeNum) === normaliser(groupeEtu);
                });
                if (!gcCible || gcCible.id === gcActifId) return;
                if (!repartition[gcCible.id]) {
                    repartition[gcCible.id] = {
                        gcId: gcCible.id,
                        groupe: gcCible.groupeNum || '?',
                        gc: gcCible,
                        count: 0,
                        das: []
                    };
                }
                repartition[gcCible.id].count++;
                if (etu.da && repartition[gcCible.id].das.indexOf(etu.da) === -1) {
                    repartition[gcCible.id].das.push(etu.da);
                }
            });

            return Object.keys(repartition).map(function(k) { return repartition[k]; });
        } catch (e) {
            console.warn('[Travaux-Import] Erreur detecterFichiersAutreGC:', e);
            return [];
        }
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
                // Sélecteur global explicite : prime sur parseLea (intention utilisateur forte)
                else if (productionSelectionnee) {
                    prepare.productionId = productionSelectionnee;
                    prepare.productionIdParLea = false;
                }
                // Pas de sélecteur global : matching par nom LEA si disponible
                else if (!prepare.productionId && prepare.parseLea && prepare.parseLea.nomProduction) {
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
        if (!fichierPrepare.fichier) {
            throw new Error('Le fichier original n\'est plus disponible (session expirée). Veuillez re-déposer le fichier.');
        }

        // Filet : la file peut contenir un HEIC non converti si la génération de
        // miniature n'a pas eu lieu (blob rattaché tardivement, échec passager).
        // Sans ce second passage, on archiverait un fichier illisible.
        try {
            await convertirSiHeic(fichierPrepare);
        } catch (e) {
            throw new Error('Le fichier « ' + (fichierPrepare.nomFichier || 'inconnu')
                + ' » est au format HEIC et n\'a pas pu être converti : ' + (e.message || e)
                + '. Demande une remise en JPEG ou en PDF.');
        }

        const typeMIME = fichierPrepare.typeMIME;
        let blob = fichierPrepare.fichier;

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
        // Les fichiers de reprise (jeton) et les livrables additionnels assumés
        // ne sont pas des doublons — ils coexistent avec l'original.
        //
        // #604 — `remplaceExistant` est le TROISIÈME contournement, et il
        // manquait. Sans lui, la branche « Remplacer l'existant » rappelait
        // cette fonction sur le même couple, récupérait le sentinel
        // `{doublon:true}` — donc n'importait RIEN — puis jetait quand même
        // l'ancien fichier à la corbeille. Les deux disparaissaient.
        if (fichierPrepare.etudiantDA && productionId &&
            !fichierPrepare.estReprise && !fichierPrepare.livrableAdditionnel &&
            !fichierPrepare.remplaceExistant) {
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
            // Un HEIC converti est archivé sous un nom en .jpg : le nom voyage
            // jusque dans l'export, et « .HEIC » sur un contenu JPEG ferait
            // échouer l'ouverture chez qui reçoit le fichier.
            nomFichier: fichierPrepare.heicConverti
                ? window.HeicDecodeur.renommerEnJpg(fichierPrepare.nomFichier)
                : fichierPrepare.nomFichier,
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
            estReprise: fichierPrepare.estReprise || false,
            // Livrable additionnel assumé (PDF + image, plusieurs versions, etc.)
            livrableAdditionnel: fichierPrepare.livrableAdditionnel || false
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

        // #558 B1 — PERSISTER le retrait, sinon sessionStorage garde les fichiers
        // déjà importés : au rechargement, `restaurerFileDAttente` les ressuscite
        // avec un blob nul et l'utilisateur voit des fantômes « à re-déposer »,
        // qu'il risque de ré-importer en doublon. La file en mémoire et la file
        // persistée doivent bouger ENSEMBLE.
        persisterFileDAttente();

        return { importes, erreurs, doublons: doublonsDetectes, total };
    }

    /**
     * Retire de la file les fichiers effectivement ecrits, et persiste le retrait.
     *
     * #604 — `importerTous` fait ce menage AVANT que les doublons ne soient
     * arbitres : les fichiers importes depuis la modale « Doublon detecte »
     * (remplacement, jeton, livrable additionnel, orphelin) restaient donc dans
     * la file, deja stockes mais affiches comme s'ils attendaient encore.
     * L'appelant rejoue ce menage APRES l'arbitrage.
     *
     * @returns {number} Nombre de fichiers retires
     */
    function purgerFichiersImportes() {
        const avant = fichiersEnAttente.length;
        fichiersEnAttente = fichiersEnAttente.filter(f => f.statut !== 'importe');
        const retires = avant - fichiersEnAttente.length;
        if (retires > 0) persisterFileDAttente();
        return retires;
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
            // #464 suite de porte (21 août 2026, relevé 2.5 de Grégoire) : ce site
            // appelait cle(chaîne vide) en croyant obtenir le préfixe du trimestre —
            // ce qui a toujours rendu la chaîne vide (fallthrough) : la file était PARTAGÉE entre
            // trimestres. 'pipeline_queue' est désormais une clé du registre
            // (CLES_NAMESPACEES) : cle() la préfixe réellement. File transitoire
            // (sessionStorage, métadonnées seules) — aucune migration nécessaire.
            const cleSession = (typeof cle === 'function') ? cle('pipeline_queue') : 'pipeline_queue';
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
                // #314 : ces deux drapeaux d'intention DOIVENT survivre au round-trip
                // sessionStorage. Sans eux, productionIdParLea redevient undefined au
                // restore → associerProductionGlobale('') efface une production détectée
                // par le parse Léa (perte silencieuse : « Non associé »).
                productionIdParLea: !!f.productionIdParLea,
                estReprise: !!f.estReprise,
                largeurOriginale: f.largeurOriginale || 0,
                hauteurOriginale: f.hauteurOriginale || 0,
                // #558 B3 — six champs qui manquaient, tous CONSOMMÉS ailleurs :
                // sans eux, le round-trip sessionStorage les perdait en silence.
                //   · productionIdParFichier : second drapeau d'intention, jumeau de
                //     productionIdParLea ci-dessus. C'est LUI que lit la protection
                //     #313 (travaux-ui.js) pour ne pas écraser un choix explicite —
                //     inopérante après reload tant qu'il ne survivait pas.
                //   · modeImport / dateFichier / nomDocumentLibre / operations : lus
                //     au rendu de la file ; perdus, la ligne se réaffiche vide ou
                //     retombe sur ses défauts.
                //   · skipBalance / format11x17 : lus par le pipeline batch. Perdus,
                //     un fichier explicitement exclu de la balance des blancs y
                //     repasse au rechargement.
                productionIdParFichier: !!f.productionIdParFichier,
                modeImport: f.modeImport || 'lea',
                // Normalisé en ISO : la valeur circule tantôt en Date, tantôt en
                // chaîne selon le chemin d'entrée (l. 493 vs 637).
                dateFichier: f.dateFichier
                    ? (f.dateFichier instanceof Date ? f.dateFichier.toISOString() : f.dateFichier)
                    : null,
                nomDocumentLibre: f.nomDocumentLibre || '',
                operations: Array.isArray(f.operations) ? f.operations : [],
                skipBalance: !!f.skipBalance,
                format11x17: !!f.format11x17
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
            // #464 suite de porte (21 août 2026, relevé 2.5 de Grégoire) : ce site
            // appelait cle(chaîne vide) en croyant obtenir le préfixe du trimestre —
            // ce qui a toujours rendu la chaîne vide (fallthrough) : la file était PARTAGÉE entre
            // trimestres. 'pipeline_queue' est désormais une clé du registre
            // (CLES_NAMESPACEES) : cle() la préfixe réellement. File transitoire
            // (sessionStorage, métadonnées seules) — aucune migration nécessaire.
            const cleSession = (typeof cle === 'function') ? cle('pipeline_queue') : 'pipeline_queue';
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
                // #314 : restaurer les drapeaux d'intention (cf. persisterFileDAttente).
                productionIdParLea: !!d.productionIdParLea,
                estReprise: !!d.estReprise,
                largeurOriginale: d.largeurOriginale || 0,
                hauteurOriginale: d.hauteurOriginale || 0,
                // #558 B3 — pendant de l'écriture : le mapping est explicite des
                // DEUX côtés, donc persister sans restaurer n'aurait servi à rien.
                productionIdParFichier: !!d.productionIdParFichier,
                modeImport: d.modeImport || 'lea',
                // Rendue en Date : le rendu fait `new Date(f.dateFichier)`, qui
                // accepte les deux, mais le reste du module manipule des Date.
                dateFichier: d.dateFichier ? new Date(d.dateFichier) : null,
                nomDocumentLibre: d.nomDocumentLibre || '',
                operations: Array.isArray(d.operations) ? d.operations : [],
                skipBalance: !!d.skipBalance,
                format11x17: !!d.format11x17
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
                // Si un sélecteur global explicite est actif (hors jeton), il primera —
                // ne pas matcher par parseLea ici. Le pipeline est marqué identifié quand
                // même puisque l'étudiant est connu ; productionId sera assigné par
                // ajouterFichiersEnAttente.
                const selecteurGlobalActif = productionSelectionnee
                    && productionSelectionnee !== '__jeton_reprise__';
                if (selecteurGlobalActif) {
                    fichierPrepare.pipelineStatut = 'identifie';
                } else {
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
            }
        } else if (fichierPrepare.estImage) {
            fichierPrepare.pipelineStatut = 'a-optimiser';
        }
        persisterFileDAttente();
    }

    /**
     * Convertit un HEIC en JPEG, sur place, dans l'entrée de la file.
     *
     * Aucun navigateur sauf Safari ne décode le HEIC : sans cette conversion,
     * le fichier traverse tout le pipeline sans miniature, sans dimensions et
     * sans être annotable (#597). On remplace donc le blob dès l'entrée, pour
     * que rien en aval n'ait à connaître ce format.
     *
     * Idempotente : rappelée sur une entrée déjà convertie, elle ne fait rien.
     *
     * @param {Object} fichierPrepare - Le fichier prepare (modifie sur place)
     * @returns {Promise<boolean>} true si une conversion a eu lieu
     */
    async function convertirSiHeic(fichierPrepare) {
        if (!fichierPrepare || fichierPrepare.heicConverti) return false;
        if (!fichierPrepare.fichier) return false;
        if (typeof window.HeicDecodeur === 'undefined') return false;
        if (!window.HeicDecodeur.estHeic(fichierPrepare.fichier, fichierPrepare.nomFichier)) return false;

        const resultat = await window.HeicDecodeur.convertirEnJpeg(fichierPrepare.fichier);

        // Le HEIC d'origine n'est lisible par rien ici : le remplacer PARTOUT,
        // y compris `fichierOriginal`, dont l'aperçu « Originaux » fait un
        // <img> direct (travaux-ui.js) qui échouerait sur le HEIC.
        fichierPrepare.fichier = resultat.blob;
        fichierPrepare.fichierOriginal = resultat.blob;
        fichierPrepare.typeMIME = 'image/jpeg';
        fichierPrepare.tailleFichier = resultat.blob.size;
        fichierPrepare.estImage = true;
        fichierPrepare.estPDF = false;
        fichierPrepare.largeurOriginale = resultat.largeur;
        fichierPrepare.hauteurOriginale = resultat.hauteur;
        fichierPrepare.heicConverti = true;

        // `nomFichier` reste celui du dépôt : c'est la clé de correspondance de
        // reattacherBlobs (session restaurée) et la source du parse Léa. Le
        // renommage en .jpg se fait à l'import, sur les métadonnées.
        return true;
    }

    /**
     * Genere la thumbnail d'un fichier en attente (async, fire-and-forget)
     * @param {Object} fichierPrepare - Le fichier prepare
     */
    async function genererThumbnailQueue(fichierPrepare) {
        try {
            // Avant toute chose : un HEIC devient un JPEG, sinon tout ce qui
            // suit échoue en silence.
            // Le marquage est REFAIT ici parce que `reattacherBlobs` (session
            // restaurée) appelle cette fonction SANS passer par
            // `planifierThumbnail` — et `heicEchec`/`heicRaison` ne survivent pas
            // au round-trip sessionStorage. Idempotent.
            marquerHeicNonDecodable(fichierPrepare);
            try {
                await convertirSiHeic(fichierPrepare);
            } catch (e) {
                console.warn('[Travaux-Import] Conversion HEIC echouee (' + fichierPrepare.nomFichier + '):', e.message || e);
                fichierPrepare.heicEchec = true;
                // La raison voyage jusqu'a l'interface : un echec qui ne dit pas
                // POURQUOI se lit comme un fichier corrompu (#597).
                if (!fichierPrepare.heicRaison) {
                    fichierPrepare.heicRaison = String(e.message || e);
                }
            }

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
        // Trier au sein de chaque groupe : numero de page d'abord, date ensuite.
        // #603 — Les pages d'une meme remise portent la MEME `dateRemise`
        // (Lea horodate la remise, pas le fichier) : la date seule ne departage
        // rien et l'ordre des pages retombait sur l'ordre de selection.
        groupes.forEach(fichiers => {
            fichiers.sort((a, b) => {
                const pa = a.parseLea && a.parseLea.page;
                const pb = b.parseLea && b.parseLea.page;
                if (pa && pb && pa !== pb) return pa - pb;
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
                            ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${echapperHtml(e.da)}" ${f.etudiantDA === e.da ? 'selected' : ''}>${echapperHtml(e.nom + ', ' + e.prenom)} (${e.da})</option>`).join('')}
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

            // Symetrie avec ajouterFichiersEnAttente : verifier les magic bytes
            // pour s'assurer que le contenu correspond au MIME declare. Sans ce
            // check, un attaquant pouvait reimporter un fichier malveillant
            // deguise (ex: HTML renomme en .pdf) sur un fichier deja accepte.
            const magicOk = await validerMagicBytes(nouveauFichier);
            if (!magicOk) {
                alert('Le contenu du fichier ne correspond pas a son extension. Reimport refuse.');
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

                notifications.succes('Fichier reimporte avec succes');

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

    /**
     * Beta 99.30 : Détecte les fichiers de la file d'attente dont le nom ne
     * contient aucun DA. Sans DA, l'association à l'étudiant n'est pas fiable
     * et le regroupement multi-pages ne fonctionne pas.
     *
     * @returns {Array<Object>} Les fichiers concernés (entrées de la queue)
     */
    function detecterFichiersSansDA() {
        try {
            const queue = obtenirFileDAttente();
            if (!queue || queue.length === 0) return [];
            return queue.filter(function(f) {
                if (!f) return false;
                const da = (f.parseLea && f.parseLea.da) || f.daDetecte;
                return !da;
            });
        } catch (e) {
            console.warn('[Travaux-Import] Erreur detecterFichiersSansDA:', e);
            return [];
        }
    }

    /**
     * Beta 99.30 : Détecte les fichiers de la file d'attente qui dupliquent un
     * fichier déjà importé dans le GC actif (même couple etudiantDA + productionId)
     * ou un autre fichier de la file. Une entrée par fichier "nouveau" en doublon.
     *
     * @returns {Array<{nouveau: Object, idxNouveau: number, stockes: Array, queue: Array}>}
     */
    function detecterDoublonsStockage() {
        try {
            const queue = obtenirFileDAttente();
            if (!queue || queue.length === 0) return [];

            const fichiersStockes = (typeof travauxStockage !== 'undefined'
                && typeof travauxStockage.obtenirFichiersGroupeActif === 'function')
                ? (travauxStockage.obtenirFichiersGroupeActif() || [])
                : [];

            const doublons = [];
            queue.forEach(function(fNouveau, idxNouveau) {
                if (!fNouveau) return;
                const da = fNouveau.etudiantDA;
                const prodId = fNouveau.productionId;
                if (!da || !prodId) return;
                const dejaStockes = fichiersStockes.filter(function(fS) {
                    return fS && fS.etudiantDA === da && fS.productionId === prodId;
                });
                // Beta 99.30 : les fichiers de la file qui partagent un même
                // groupeDocumentId non vide sont des pages d'un même document
                // (assemblage multi-pages automatique) — pas un doublon.
                const dansQueue = queue.slice(0, idxNouveau).filter(function(fA) {
                    if (!fA || fA.etudiantDA !== da || fA.productionId !== prodId) return false;
                    if (fNouveau.groupeDocumentId && fA.groupeDocumentId === fNouveau.groupeDocumentId) return false;
                    return true;
                });
                if (dejaStockes.length > 0 || dansQueue.length > 0) {
                    doublons.push({
                        nouveau: fNouveau,
                        idxNouveau: idxNouveau,
                        stockes: dejaStockes,
                        queue: dansQueue
                    });
                }
            });
            return doublons;
        } catch (e) {
            console.warn('[Travaux-Import] Erreur detecterDoublonsStockage:', e);
            return [];
        }
    }

    /**
     * Renomme un fichier en file d'attente avant import. Modifie uniquement
     * `nomFichier` (et `nomFichierLea` si présent — utilisé pour parser DA).
     * L'association étudiant/production déjà calculée est préservée.
     *
     * Cas d'usage : doublon détecté en modale « Confirmer l'import » — l'utilisateur
     * veut distinguer les deux fichiers (ex. « Artefact 9 - Partie 2 »).
     *
     * @param {number} idx - Index dans fichiersEnAttente
     * @param {string} nouveauNom - Nouveau nom (extension conservée si présente dans l'original)
     * @returns {boolean} true si renommage appliqué, false sinon
     */
    function renommerFichierDansFile(idx, nouveauNom) {
        if (typeof idx !== 'number' || idx < 0 || idx >= fichiersEnAttente.length) {
            return false;
        }
        const f = fichiersEnAttente[idx];
        if (!f) return false;
        const nettoye = (nouveauNom || '').trim();
        if (!nettoye) return false;

        // Préserver l'extension du fichier original si absente du nouveau nom
        const ancienNom = f.nomFichier || '';
        const matchExt = ancienNom.match(/\.[^./\\]+$/);
        let nomFinal = nettoye;
        if (matchExt && !nettoye.match(/\.[^./\\]+$/)) {
            nomFinal = nettoye + matchExt[0];
        }

        f.nomFichier = nomFinal;
        if (f.nomFichierLea !== undefined) {
            f.nomFichierLea = nomFinal;
        }
        persisterFileDAttente();
        return true;
    }

    /**
     * Beta 99.30 : Réévalue les associations DA→étudiant pour tous les fichiers
     * en file d'attente. Appelé après un changement de groupe-cours actif pour
     * que les fichiers parseLea reconnus s'associent correctement aux étudiants
     * du nouveau contexte.
     */
    function reevaluerAssociationsQueue() {
        if (!fichiersEnAttente || fichiersEnAttente.length === 0) return;
        fichiersEnAttente.forEach(function(f) {
            if (!f) return;
            const da = f.parseLea && f.parseLea.da ? f.parseLea.da : f.daDetecte;
            const etu = da ? trouverEtudiantParDA(da) : null;
            const fallback = !etu && f.nomFichier ? trouverEtudiantParNom(f.nomFichier) : null;
            const choisi = etu || fallback || null;
            f.etudiantAssocie = choisi;
            f.etudiantDA = choisi ? choisi.da : (da || '');
        });
        persisterFileDAttente();
    }

    window.travauxImport = {
        // Detection
        detecterDA: detecterDA,
        trouverEtudiantParDA: trouverEtudiantParDA,
        detecterFichiersAutreGC: detecterFichiersAutreGC,
        detecterFichiersSansDA: detecterFichiersSansDA,
        detecterDoublonsStockage: detecterDoublonsStockage,
        reevaluerAssociationsQueue: reevaluerAssociationsQueue,
        renommerFichierDansFile: renommerFichierDansFile,
        // Parser Lea
        parserNomFichierLea: parserNomFichierLea,
        // Validation
        estTypeAccepte: estTypeAccepte,
        validerMagicBytes: validerMagicBytes,
        // Conversion HEIC (#597) — exposee pour les sentinelles
        convertirSiHeic: convertirSiHeic,
        marquerHeicNonDecodable: marquerHeicNonDecodable,
        // File d'attente
        ajouterFichiersEnAttente: ajouterFichiersEnAttente,
        obtenirFileDAttente: obtenirFileDAttente,
        viderFileDAttente: viderFileDAttente,
        purgerFichiersImportes: purgerFichiersImportes,
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

    // Validation magic bytes — exposée pour la suite de tests automatisés
    // (Défense I, scénario I-02 polyglotte image+JS). Le check est utilisé
    // en interne par travaux-import, mais le test l'invoque directement.
    window.validerMagicBytes = validerMagicBytes;

})();
