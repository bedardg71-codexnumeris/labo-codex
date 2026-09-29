/* ===============================
   MODULE: MODELISATION
   Outil d'annotation en projection (Boite a outils)
   Reutilise travaux-visionneuse, travaux-annotation, travaux-outils
   Palette d'annotation partagee via travauxUI.creerLayoutAnnotation()

   DEPENDANCES:
   - travaux-stockage.js (stockage blobs IndexedDB)
   - travaux-visionneuse.js (rendu PDF/images)
   - travaux-annotation.js (dessin, surlignage, formes)
   - travaux-outils.js (palette d'outils)
   - travaux-ui.js (layout annotation partage)
   =============================== */

(function() {
    'use strict';

    /* ===============================
       ETAT DU MODULE
       =============================== */

    let fichiers = [];              // Liste des fichiers modelisation
    let fichierOuvertId = null;     // ID du fichier actuellement ouvert
    let moduleInitialise = false;
    const CLE_FICHIERS = 'fichiersModelisation';  // Cle localStorage distincte
    const PREFIXE_ID = 'FM_';      // Prefixe pour distinguer des fichiers travaux (FT_)
    const SESSION_KEY_FICHIER = 'model-dernier-fichier';

    /* ===============================
       INITIALISATION
       =============================== */

    function initialiserModelisation() {
        if (moduleInitialise) {
            chargerFichiers();
            afficherCarrousel();
            // Restaurer le fichier ouvert si on revient d'une autre section
            var dernierFichier = sessionStorage.getItem(SESSION_KEY_FICHIER);
            if (dernierFichier && !fichierOuvertId && fichiers.some(function(f) { return f.id === dernierFichier; })) {
                ouvrirFichierModelisation(dernierFichier);
            }
            return;
        }


        if (typeof travauxStockage !== 'undefined') {
            travauxStockage.initialiser();
        }
        if (typeof travauxVisionneuse !== 'undefined') {
            travauxVisionneuse.initialiser();
        }
        if (typeof travauxAnnotation !== 'undefined') {
            travauxAnnotation.initialiser();
        }

        construireUI();
        chargerFichiers();
        afficherCarrousel();

        moduleInitialise = true;
    }

    /* ===============================
       CONSTRUCTION DE L'UI
       =============================== */

    function construireUI() {
        var conteneur = document.getElementById('model-conteneur-principal');
        if (!conteneur) return;
        if (document.getElementById('model-conteneur-document')) return;

        conteneur.innerHTML =
            '<div class="model-layout">' +

                '<!-- Zone document (pleine largeur) -->' +
                '<div class="travaux-zone-document model-zone-document" id="model-conteneur-document">' +

                    '<!-- Toolbar unique (badges + outils) -->' +
                    '<div class="annot-toolbar" id="model-toolbar">' +
                        '<div class="annot-toolbar-fichiers">' +
                            '<button class="model-btn-ouvrir-compact" data-action="modelisation.ouvrirFichierLocal" title="Ouvrir un fichier">+ Ouvrir</button>' +
                            '<div id="model-carrousel-badges" class="annot-toolbar-badges-zone"></div>' +
                        '</div>' +
                        '<div class="annot-toolbar-separateur"></div>' +
                        '<div class="annot-toolbar-outils">' +
                            '<button id="model-btn-page-prec" class="travaux-btn-nav" data-action="travauxVisionneuse.pagePrecedente" disabled title="Page precedente"><img src="icons/icon-chevron-left.svg" alt="" class="nav-seq-icon"></button>' +
                            '<span id="model-indicateur-page">-- / --</span>' +
                            '<button id="model-btn-page-suiv" class="travaux-btn-nav" data-action="travauxVisionneuse.pageSuivante" disabled title="Page suivante"><img src="icons/icon-chevron-right.svg" alt="" class="nav-seq-icon"></button>' +
                            '<span class="travaux-separateur"></span>' +
                            '<button id="model-btn-fichier-prec" class="travaux-btn-nav" data-action="modelisation.fichierPrecedent" disabled title="Fichier precedent"><img src="icons/icon-chevron-left.svg" alt="" class="nav-seq-icon"></button>' +
                            '<span id="model-compteur-fichiers" class="model-compteur-fichiers"></span>' +
                            '<button id="model-btn-fichier-suiv" class="travaux-btn-nav" data-action="modelisation.fichierSuivant" disabled title="Fichier suivant"><img src="icons/icon-chevron-right.svg" alt="" class="nav-seq-icon"></button>' +
                            '<span class="travaux-separateur"></span>' +
                            '<button class="travaux-btn-nav" data-action="travauxVisionneuse.zoomPleineLargeur" title="Ajuster a la largeur"><img src="icons/icon-resize-horizontal.svg" alt="" class="nav-seq-icon"></button>' +
                            '<button class="travaux-btn-nav" data-action="travauxVisionneuse.zoomPleineHauteur" title="Ajuster a la hauteur"><img src="icons/icon-resize-vertical.svg" alt="" class="nav-seq-icon"></button>' +
                            '<button class="travaux-btn-zoom" data-action="travauxVisionneuse.zoom100" title="Zoom 100%">100%</button>' +
                            '<span class="travaux-separateur"></span>' +
                            '<button class="travaux-btn-action" data-action="modelisation.fermerVisionneuse" title="Fermer le fichier">Fermer</button>' +
                        '</div>' +
                    '</div>' +

                    '<!-- Canvas container -->' +
                    '<div class="travaux-canvas-container" id="model-canvas-container" style="display:none;">' +
                        '<div class="travaux-canvas-wrapper" id="model-canvas-wrapper">' +
                            '<canvas id="model-canvas-document"></canvas>' +
                            '<canvas id="model-canvas-surligneur" class="u-hide" style="pointer-events:none;"></canvas>' +
                            '<canvas id="model-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>' +
                        '</div>' +
                    '</div>' +

                    '<!-- Placeholder -->' +
                    '<div class="model-placeholder" id="model-placeholder-vide">' +
                        '<p>Cliquer sur « + Ouvrir » pour importer un fichier.</p>' +
                    '</div>' +

                '</div>' +
            '</div>';

        window.addEventListener('travaux-page-rendue', onPageRendue);
    }

    /* ===============================
       CARROUSEL HORIZONTAL DE BADGES
       =============================== */

    function afficherCarrousel() {
        var zone = document.getElementById('model-carrousel-badges');
        if (!zone) return;

        if (fichiers.length === 0) {
            zone.innerHTML = '';
            mettreAJourPlaceholder();
            mettreAJourCompteurFichiers();
            return;
        }

        var html = '';
        fichiers.forEach(function(f) {
            var actif = f.id === fichierOuvertId ? ' actif' : '';
            var statut = determinerStatutModelisation(f);
            html +=
                '<div class="annot-badge' + actif + '" data-id="' + f.id + '" data-action="modelisation.ouvrirFichier" data-param="' + f.id + '" title="' + f.nomFichier + '">' +
                    '<span class="annot-badge-nom">' + tronquerNom(f.nomFichier, 22) + '</span>' +
                    '<span class="travaux-badge-pill ' + statut.classe + '">' + statut.texte + '</span>' +
                    '<button class="annot-badge-supprimer" data-stop data-action="modelisation.supprimerFichier" data-param="' + f.id + '" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>' +
                '</div>';
        });
        zone.innerHTML = html;

        mettreAJourPlaceholder();
        mettreAJourCompteurFichiers();
    }

    function determinerStatutModelisation(f) {
        var annotation = travauxStockage.obtenirAnnotationFichier(f.id);
        if (annotation && typeof travauxUI !== 'undefined' && travauxUI.annotationContientDuContenu(annotation)) {
            return { texte: 'Annot\u00e9', classe: 'annote' };
        }
        return { texte: 'Import\u00e9', classe: 'importe' };
    }

    function mettreAJourPlaceholder() {
        var placeholder = document.getElementById('model-placeholder-vide');
        var canvas = document.getElementById('model-canvas-container');

        if (fichierOuvertId) {
            if (placeholder) placeholder.style.display = 'none';
            if (canvas) canvas.style.display = '';
        } else {
            if (placeholder) placeholder.style.display = '';
            if (canvas) canvas.style.display = 'none';
        }
    }

    function tronquerNom(nom, max) {
        if (nom.length <= max) return nom;
        var ext = nom.lastIndexOf('.');
        if (ext > 0) {
            var base = nom.substring(0, ext);
            var extension = nom.substring(ext);
            var maxBase = max - extension.length - 1;
            return base.substring(0, maxBase) + '\u2026' + extension;
        }
        return nom.substring(0, max - 1) + '\u2026';
    }

    /* ===============================
       NAVIGATION INTER-DOCUMENTS
       =============================== */

    function fichierPrecedent() {
        if (!fichierOuvertId || fichiers.length <= 1) return;
        var idx = fichiers.findIndex(function(f) { return f.id === fichierOuvertId; });
        if (idx <= 0) return;
        ouvrirFichierModelisation(fichiers[idx - 1].id);
    }

    function fichierSuivant() {
        if (!fichierOuvertId || fichiers.length <= 1) return;
        var idx = fichiers.findIndex(function(f) { return f.id === fichierOuvertId; });
        if (idx < 0 || idx >= fichiers.length - 1) return;
        ouvrirFichierModelisation(fichiers[idx + 1].id);
    }

    function mettreAJourCompteurFichiers() {
        var compteur = document.getElementById('model-compteur-fichiers');
        var btnPrec = document.getElementById('model-btn-fichier-prec');
        var btnSuiv = document.getElementById('model-btn-fichier-suiv');

        if (!fichierOuvertId || fichiers.length === 0) {
            if (compteur) compteur.textContent = '';
            if (btnPrec) btnPrec.disabled = true;
            if (btnSuiv) btnSuiv.disabled = true;
            return;
        }

        var idx = fichiers.findIndex(function(f) { return f.id === fichierOuvertId; });
        if (idx < 0) return;

        if (compteur) compteur.textContent = (idx + 1) + ' / ' + fichiers.length;
        if (btnPrec) btnPrec.disabled = idx <= 0;
        if (btnSuiv) btnSuiv.disabled = idx >= fichiers.length - 1;
    }

    /* ===============================
       GESTION DES FICHIERS
       =============================== */

    function chargerFichiers() {
        try {
            fichiers = db.getSync(cle(CLE_FICHIERS), []);
        } catch (e) {
            fichiers = [];
        }
    }

    function sauvegarderFichiers() {
        db.setSync(cle(CLE_FICHIERS), fichiers);
        if (window.signalerEcritureUsager) window.signalerEcritureUsager(cle(CLE_FICHIERS));   // lot F : geste hors témoin (modélisation : ouvrir un fichier, supprimer)
    }

    /* ===============================
       OUVRIR UN FICHIER LOCAL
       =============================== */

    function ouvrirFichierLocal() {
        var input = document.createElement('input');
        input.type = 'file';
        // #597 : ce sélecteur annonce le .heic, que ce contexte ne sait pas
        // toujours décoder (aucun décodage possible quand l'application est
        // ouverte par double-clic — voir HeicDecodeur.decodagePossible). Le
        // pipeline d'import le DIT désormais ; ce chemin-ci ne le dit pas encore.
        input.accept = '.pdf,.jpg,.jpeg,.png,.heic';
        input.style.display = 'none';

        input.addEventListener('change', async function(e) {
            var file = e.target.files[0];
            if (!file) return;

            try {
                var blob = new Blob([await file.arrayBuffer()], { type: file.type });
                var id = genererIdUnique(PREFIXE_ID);

                var thumbnailDataUrl = '';
                try {
                    if (file.type === 'application/pdf') {
                        var result = await travauxStockage.genererMiniaturePDF(blob);
                        thumbnailDataUrl = result.thumbnail;
                    } else if (file.type.startsWith('image/')) {
                        thumbnailDataUrl = await travauxStockage.genererMiniatureImage(blob);
                    }
                } catch (err) {
                    console.warn('[Modelisation] Erreur generation miniature:', err);
                }

                var metadata = {
                    id: id,
                    nomFichier: file.name,
                    typeMIME: file.type || 'application/pdf',
                    tailleFichier: file.size,
                    source: 'modelisation',
                    thumbnailDataUrl: '',
                    dateImport: new Date().toISOString()
                };

                // Stocker la thumbnail dans IDB (pas dans les metadonnees)
                if (thumbnailDataUrl) {
                    travauxStockage.stockerThumbnail(id, thumbnailDataUrl);
                }

                await travauxStockage.stockerBlob(id, blob, '', '');
                fichiers.push(metadata);
                sauvegarderFichiers();
                afficherCarrousel();
                await ouvrirFichierModelisation(id);
            } catch (err) {
                console.error('[Modelisation] Erreur import fichier:', err);
                alert('Erreur lors de l\u2019importation du fichier.');
            }

            input.remove();
        });

        document.body.appendChild(input);
        input.click();
    }

    /* ===============================
       OUVRIR UN FICHIER MODELISATION
       =============================== */

    async function ouvrirFichierModelisation(id) {
        var metadata = fichiers.find(function(f) { return f.id === id; });
        if (!metadata) {
            console.error('[Modelisation] Fichier introuvable:', id);
            return;
        }

        // Si un fichier est deja ouvert, sauvegarder et detruire le layout annotation
        if (fichierOuvertId && fichierOuvertId !== id) {
            if (travauxAnnotation.estActif()) {
                travauxAnnotation.desactiverAnnotation();
            }
            travauxVisionneuse.fermerFichier();
            if (typeof travauxUI !== 'undefined' && travauxUI.detruireLayoutAnnotation) {
                travauxUI.detruireLayoutAnnotation('model-conteneur-document');
            }
        }

        // Injecter le contexte dans les modules
        travauxVisionneuse.setContext({
            canvasDocument: document.getElementById('model-canvas-document')
        });
        travauxAnnotation.setContext({
            canvasAnnotation: document.getElementById('model-canvas-annotation'),
            canvasSurligneur: document.getElementById('model-canvas-surligneur'),
            conteneurPalette: document.getElementById('model-conteneur-document')
        });

        var conteneurDoc = document.getElementById('model-conteneur-document');
        travauxVisionneuse.setConteneur(conteneurDoc);

        var canvasContainer = document.getElementById('model-canvas-container');
        travauxVisionneuse.configurerGestesZoom(canvasContainer);

        var blob = await travauxStockage.recupererBlob(id);
        if (!blob) {
            console.error('[Modelisation] Blob introuvable pour:', id);
            alert('Le fichier n\u2019a pas pu \u00eatre charge.');
            return;
        }

        // Ouvrir le fichier
        fichierOuvertId = id;
        sessionStorage.setItem(SESSION_KEY_FICHIER, id);
        mettreAJourPlaceholder();
        await travauxVisionneuse.ouvrirDepuisBlob(blob, metadata);

        // Activer l'annotation
        travauxAnnotation.activerAnnotation();

        // Creer le layout annotation partage (palette outils + tampons, sans codes)
        if (typeof travauxUI !== 'undefined' && travauxUI.creerLayoutAnnotation) {
            travauxUI.creerLayoutAnnotation({
                conteneurDocId: 'model-conteneur-document',
                canvasContainerId: 'model-canvas-container',
                afficherCodes: false
            });
        }

        // Ajuster le zoom apres que le layout flex ait ses dimensions
        // Double rAF pour attendre le reflow complet du layout flex
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                travauxVisionneuse.zoomPleineHauteur();
                setTimeout(function() { travauxVisionneuse.scrollerEnHaut(); }, 150);
            });
        });

        afficherCarrousel();
    }

    /* ===============================
       FERMER LA VISIONNEUSE
       =============================== */

    function fermerVisionneuse() {
        if (travauxAnnotation.estActif()) {
            travauxAnnotation.desactiverAnnotation();
        }

        if (typeof travauxUI !== 'undefined' && travauxUI.detruireLayoutAnnotation) {
            travauxUI.detruireLayoutAnnotation('model-conteneur-document');
        }

        travauxVisionneuse.fermerFichier();
        fichierOuvertId = null;
        sessionStorage.removeItem(SESSION_KEY_FICHIER);

        var palette = document.getElementById('travaux-palette-flottante');
        if (palette && palette.closest('#model-conteneur-document')) {
            palette.remove();
        }

        travauxVisionneuse.setContext(null);
        travauxAnnotation.setContext(null);

        mettreAJourPlaceholder();
        afficherCarrousel();
    }

    /* ===============================
       SUPPRIMER UN FICHIER
       =============================== */

    async function supprimerFichierModelisation(id) {
        if (!confirm('Supprimer ce fichier et ses annotations ?')) return;

        if (id === fichierOuvertId) {
            fermerVisionneuse();
        }

        try {
            await travauxStockage.supprimerBlob(id);
        } catch (e) {
            console.warn('[Modelisation] Erreur suppression blob:', e);
        }

        try {
            var annotations = travauxStockage.obtenirAnnotations();
            var annotationsFiltrees = annotations.filter(function(a) { return a.fichierId !== id; });
            if (annotationsFiltrees.length !== annotations.length) {
                db.setSync(cle('annotationsTravaux'), annotationsFiltrees);
            }
        } catch (e) {
            console.warn('[Modelisation] Erreur suppression annotations:', e);
        }

        fichiers = fichiers.filter(function(f) { return f.id !== id; });
        sauvegarderFichiers();
        afficherCarrousel();

    }

    /* ===============================
       MISE A JOUR NAVIGATION (listener)
       =============================== */

    function onPageRendue(e) {
        if (!fichierOuvertId) return;
        var modelCanvas = document.getElementById('model-canvas-document');
        if (!modelCanvas) return;

        var indicateur = document.getElementById('model-indicateur-page');
        if (indicateur) {
            var totalPages = travauxVisionneuse.getNombrePagesTotal();
            var pageCour = travauxVisionneuse.getPageActuelle();
            indicateur.textContent = pageCour + ' / ' + totalPages;
        }

        var btnPrec = document.getElementById('model-btn-page-prec');
        var btnSuiv = document.getElementById('model-btn-page-suiv');
        var page = travauxVisionneuse.getPageActuelle();
        var total = travauxVisionneuse.getNombrePagesTotal();
        if (btnPrec) btnPrec.disabled = page <= 1;
        if (btnSuiv) btnSuiv.disabled = page >= total;

        var indicateurZoom = document.getElementById('model-indicateur-zoom');
        if (indicateurZoom) {
            indicateurZoom.textContent = Math.round(travauxVisionneuse.getZoomActuel() * 100) + '%';
        }
    }

    /* ===============================
       NETTOYAGE EN QUITTANT
       =============================== */

    function nettoyerModelisation() {

        if (typeof travauxAnnotation !== 'undefined' && travauxAnnotation.estActif()) {
            travauxAnnotation.desactiverAnnotation();
        }

        if (typeof travauxUI !== 'undefined' && travauxUI.detruireLayoutAnnotation) {
            travauxUI.detruireLayoutAnnotation('model-conteneur-document');
        }

        if (fichierOuvertId && typeof travauxVisionneuse !== 'undefined') {
            travauxVisionneuse.fermerFichier();
            fichierOuvertId = null;
        }

        var palette = document.getElementById('travaux-palette-flottante');
        if (palette && palette.closest('#model-conteneur-document')) {
            palette.remove();
        }

        if (typeof travauxVisionneuse !== 'undefined') {
            travauxVisionneuse.setContext(null);
        }
        if (typeof travauxAnnotation !== 'undefined') {
            travauxAnnotation.setContext(null);
        }
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.initialiserModelisation = initialiserModelisation;
    window.modelisation = {
        ouvrirFichier: ouvrirFichierModelisation,
        supprimerFichier: supprimerFichierModelisation,
        ouvrirFichierLocal: ouvrirFichierLocal,
        fermerVisionneuse: fermerVisionneuse,
        nettoyer: nettoyerModelisation,
        fichierPrecedent: fichierPrecedent,
        fichierSuivant: fichierSuivant
    };


})();
