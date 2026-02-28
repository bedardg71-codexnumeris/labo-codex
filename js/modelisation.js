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
    let sidebarReplie = false;
    const CLE_FICHIERS = 'fichiersModelisation';  // Cle localStorage distincte
    const PREFIXE_ID = 'FM_';      // Prefixe pour distinguer des fichiers travaux (FT_)

    /* ===============================
       INITIALISATION
       =============================== */

    function initialiserModelisation() {
        if (moduleInitialise) {
            // Deja initialise, juste rafraichir la liste
            chargerFichiers();
            afficherSidebar();
            return;
        }

        console.log('[Modelisation] Initialisation du module...');

        // Initialiser le stockage (attendre si necessaire)
        if (typeof travauxStockage !== 'undefined') {
            travauxStockage.initialiser();
        }

        // Initialiser la visionneuse (idempotent — configure PDF.js)
        if (typeof travauxVisionneuse !== 'undefined') {
            travauxVisionneuse.initialiser();
        }

        // Initialiser le moteur d'annotation (idempotent)
        if (typeof travauxAnnotation !== 'undefined') {
            travauxAnnotation.initialiser();
        }

        // Construire l'UI
        construireUI();

        // Charger la liste des fichiers
        chargerFichiers();
        afficherSidebar();

        moduleInitialise = true;
        console.log('[Modelisation] Module initialise');
    }

    /* ===============================
       CONSTRUCTION DE L'UI
       =============================== */

    function construireUI() {
        const conteneur = document.getElementById('model-conteneur-principal');
        if (!conteneur) return;

        // Eviter de re-creer si deja present
        if (document.getElementById('model-conteneur-document')) return;

        conteneur.innerHTML =
            '<div class="model-layout">' +

                '<!-- Visionneuse flex : sidebar + document -->' +
                '<div class="model-visionneuse-flex" id="model-visionneuse-flex">' +

                    '<!-- Sidebar -->' +
                    '<div class="travaux-sidebar" id="model-sidebar">' +
                        '<div class="travaux-sidebar-header">' +
                            '<button class="model-btn-ouvrir" onclick="window.modelisation.ouvrirFichierLocal()" style="width:100%">' +
                                '+ Ouvrir un fichier' +
                            '</button>' +
                        '</div>' +
                        '<div class="travaux-miniatures" id="model-liste-miniatures">' +
                            '<!-- Rempli dynamiquement -->' +
                        '</div>' +
                    '</div>' +

                    '<!-- Bouton replier sidebar (visible quand replie) -->' +
                    '<button class="model-btn-toggle-sidebar" id="model-btn-toggle-sidebar" onclick="window.modelisation.toggleSidebar()" title="Afficher/masquer la liste">' +
                        '\u25B6' +
                    '</button>' +

                    '<!-- Zone document -->' +
                    '<div class="travaux-zone-document" id="model-conteneur-document" style="flex:1; min-width:0;">' +

                        '<!-- Toolbar -->' +
                        '<div class="travaux-toolbar">' +
                            '<div class="travaux-toolbar-inner">' +
                                '<!-- GAUCHE : navigation pages -->' +
                                '<div class="travaux-toolbar-gauche">' +
                                    '<button id="model-btn-page-prec" class="travaux-btn-nav" onclick="travauxVisionneuse.pagePrecedente()" disabled title="Page precedente">&#x2190;</button>' +
                                    '<span id="model-indicateur-page">-- / --</span>' +
                                    '<button id="model-btn-page-suiv" class="travaux-btn-nav" onclick="travauxVisionneuse.pageSuivante()" disabled title="Page suivante">&#x2192;</button>' +
                                    '<span id="model-nom-fichier" class="model-toolbar-nom-fichier"></span>' +
                                '</div>' +

                                '<!-- CENTRE : navigation inter-documents -->' +
                                '<div class="travaux-toolbar-centre">' +
                                    '<button id="model-btn-fichier-prec" class="travaux-btn-nav" onclick="window.modelisation.fichierPrecedent()" disabled title="Fichier precedent">&#x276E;</button>' +
                                    '<span id="model-compteur-fichiers" class="model-compteur-fichiers"></span>' +
                                    '<button id="model-btn-fichier-suiv" class="travaux-btn-nav" onclick="window.modelisation.fichierSuivant()" disabled title="Fichier suivant">&#x276F;</button>' +
                                '</div>' +

                                '<!-- DROITE : zoom + fermer -->' +
                                '<div class="travaux-toolbar-droite">' +
                                    '<span id="model-indicateur-zoom" class="travaux-zoom-info">100%</span>' +
                                    '<button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoomPleineLargeur()" title="Ajuster a la largeur">Largeur</button>' +
                                    '<button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoomPleineHauteur()" title="Ajuster a la hauteur">Hauteur</button>' +
                                    '<button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoom100()" title="Zoom 100%">100%</button>' +
                                    '<button class="travaux-btn-zoom" onclick="travauxVisionneuse.recentrerVue()" title="Recentrer la vue">Recentrer</button>' +
                                    '<span class="travaux-separateur"></span>' +
                                    '<button class="travaux-btn-action" onclick="window.modelisation.fermerVisionneuse()" title="Fermer le fichier">Fermer</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<!-- Canvas container -->' +
                        '<div class="travaux-canvas-container" id="model-canvas-container">' +
                            '<div class="travaux-canvas-wrapper" id="model-canvas-wrapper">' +
                                '<canvas id="model-canvas-document"></canvas>' +
                                '<canvas id="model-canvas-surligneur" class="u-hide" style="pointer-events:none;"></canvas>' +
                                '<canvas id="model-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>' +

                '<!-- Placeholder quand aucun fichier ouvert -->' +
                '<div class="model-placeholder" id="model-placeholder-vide">' +
                    '<p>Ouvrir un fichier dans la barre laterale pour commencer.</p>' +
                '</div>' +

            '</div>';

        // Ecouter l'evenement travaux-page-rendue pour mettre a jour les indicateurs modelisation
        window.addEventListener('travaux-page-rendue', onPageRendue);
    }

    /* ===============================
       SIDEBAR — LISTE DES FICHIERS
       =============================== */

    function afficherSidebar() {
        const liste = document.getElementById('model-liste-miniatures');
        if (!liste) return;

        if (fichiers.length === 0) {
            liste.innerHTML = '<div class="model-sidebar-vide">Aucun fichier.</div>';
            mettreAJourPlaceholder();
            mettreAJourCompteurFichiers();
            return;
        }

        let html = '';
        fichiers.forEach(function(f) {
            const actif = f.id === fichierOuvertId ? ' actif' : '';
            const statut = determinerStatutModelisation(f);
            const thumbnail = f.thumbnailDataUrl
                ? '<img src="' + f.thumbnailDataUrl + '" alt="">'
                : '<span>' + (f.typeMIME === 'application/pdf' ? 'PDF' : 'IMG') + '</span>';

            html +=
                '<div class="travaux-miniature' + actif + '" data-id="' + f.id + '" onclick="window.modelisation.ouvrirFichier(\'' + f.id + '\')">' +
                    '<div class="travaux-miniature-thumb">' +
                        thumbnail +
                    '</div>' +
                    '<div class="model-miniature-info">' +
                        '<span class="travaux-miniature-nom" title="' + f.nomFichier + '">' + tronquerNom(f.nomFichier, 18) + '</span>' +
                        '<span class="travaux-badge-pill ' + statut.classe + '">' + statut.texte + '</span>' +
                    '</div>' +
                    '<button class="model-miniature-supprimer" onclick="event.stopPropagation(); window.modelisation.supprimerFichier(\'' + f.id + '\')" title="Supprimer">&times;</button>' +
                '</div>';
        });
        liste.innerHTML = html;

        mettreAJourPlaceholder();
        mettreAJourCompteurFichiers();
    }

    function determinerStatutModelisation(f) {
        var annotation = travauxStockage.obtenirAnnotationFichier(f.id);
        if (annotation && typeof travauxUI !== 'undefined' && travauxUI.annotationContientDuContenu(annotation)) {
            return { texte: 'Annote', classe: 'annote' };
        }
        return { texte: 'Importe', classe: 'importe' };
    }

    function mettreAJourPlaceholder() {
        var placeholder = document.getElementById('model-placeholder-vide');
        var flex = document.getElementById('model-visionneuse-flex');
        if (!placeholder || !flex) return;

        if (fichierOuvertId) {
            placeholder.style.display = 'none';
            flex.style.display = '';
        } else {
            placeholder.style.display = '';
            flex.style.display = 'none';
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
       TOGGLE SIDEBAR
       =============================== */

    function toggleSidebar() {
        var sidebar = document.getElementById('model-sidebar');
        var btn = document.getElementById('model-btn-toggle-sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('replie');
        sidebarReplie = sidebar.classList.contains('replie');
        if (btn) {
            btn.classList.toggle('visible', sidebarReplie);
            btn.innerHTML = sidebarReplie ? '&#x25B6;' : '&#x25C0;';
        }
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
    }

    /* ===============================
       OUVRIR UN FICHIER LOCAL
       =============================== */

    function ouvrirFichierLocal() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png,.heic';
        input.style.display = 'none';

        input.addEventListener('change', async function(e) {
            var file = e.target.files[0];
            if (!file) return;

            try {
                var blob = new Blob([await file.arrayBuffer()], { type: file.type });
                var id = PREFIXE_ID + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

                // Generer la miniature
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

                // Creer les metadonnees
                var metadata = {
                    id: id,
                    nomFichier: file.name,
                    typeMIME: file.type || 'application/pdf',
                    tailleFichier: file.size,
                    source: 'modelisation',
                    thumbnailDataUrl: thumbnailDataUrl,
                    dateImport: new Date().toISOString()
                };

                // Stocker le blob dans IndexedDB
                await travauxStockage.stockerBlob(id, blob, '', '');

                // Sauvegarder les metadonnees
                fichiers.push(metadata);
                sauvegarderFichiers();
                afficherSidebar();

                // Ouvrir le fichier dans la visionneuse
                await ouvrirFichierModelisation(id);

                console.log('[Modelisation] Fichier importe:', file.name);
            } catch (err) {
                console.error('[Modelisation] Erreur import fichier:', err);
                alert('Erreur lors de l\u2019importation du fichier.');
            }

            // Nettoyer l'input
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

        // Configurer le conteneur de la visionneuse
        var conteneurDoc = document.getElementById('model-conteneur-document');
        travauxVisionneuse.setConteneur(conteneurDoc);

        // Configurer les gestes zoom sur le canvas container
        var canvasContainer = document.getElementById('model-canvas-container');
        travauxVisionneuse.configurerGestesZoom(canvasContainer);

        // Recuperer le blob
        var blob = await travauxStockage.recupererBlob(id);
        if (!blob) {
            console.error('[Modelisation] Blob introuvable pour:', id);
            alert('Le fichier n\u2019a pas pu \u00eatre charge.');
            return;
        }

        // Ouvrir le fichier
        fichierOuvertId = id;
        mettreAJourPlaceholder();
        await travauxVisionneuse.ouvrirDepuisBlob(blob, metadata);

        // Afficher le nom du fichier dans la toolbar
        var nomEl = document.getElementById('model-nom-fichier');
        if (nomEl) nomEl.textContent = metadata.nomFichier;

        // Activer l'annotation automatiquement
        travauxAnnotation.activerAnnotation();

        // Creer le layout annotation partage (palette outils + tampons, sans codes)
        if (typeof travauxUI !== 'undefined' && travauxUI.creerLayoutAnnotation) {
            travauxUI.creerLayoutAnnotation({
                conteneurDocId: 'model-conteneur-document',
                canvasContainerId: 'model-canvas-container',
                afficherCodes: false
            });
        }

        // Rafraichir la sidebar pour marquer le fichier actif
        afficherSidebar();
    }

    /* ===============================
       FERMER LA VISIONNEUSE
       =============================== */

    function fermerVisionneuse() {
        // Sauvegarder les annotations avant de fermer
        if (travauxAnnotation.estActif()) {
            travauxAnnotation.desactiverAnnotation();
        }

        // Detruire le layout annotation partage
        if (typeof travauxUI !== 'undefined' && travauxUI.detruireLayoutAnnotation) {
            travauxUI.detruireLayoutAnnotation('model-conteneur-document');
        }

        travauxVisionneuse.fermerFichier();
        fichierOuvertId = null;

        // Supprimer la palette flottante si elle existe dans notre conteneur
        var palette = document.getElementById('travaux-palette-flottante');
        if (palette && palette.closest('#model-conteneur-document')) {
            palette.remove();
        }

        // Nettoyer le contexte
        travauxVisionneuse.setContext(null);
        travauxAnnotation.setContext(null);

        // Rafraichir la sidebar et afficher le placeholder
        mettreAJourPlaceholder();
        afficherSidebar();
    }

    /* ===============================
       SUPPRIMER UN FICHIER
       =============================== */

    async function supprimerFichierModelisation(id) {
        if (!confirm('Supprimer ce fichier et ses annotations ?')) return;

        // Fermer si c'est le fichier ouvert
        if (id === fichierOuvertId) {
            fermerVisionneuse();
        }

        // Supprimer le blob
        try {
            await travauxStockage.supprimerBlob(id);
        } catch (e) {
            console.warn('[Modelisation] Erreur suppression blob:', e);
        }

        // Supprimer les annotations liees
        try {
            var annotations = travauxStockage.obtenirAnnotations();
            var annotationsFiltrees = annotations.filter(function(a) { return a.fichierId !== id; });
            if (annotationsFiltrees.length !== annotations.length) {
                db.setSync(cle('annotationsTravaux'), annotationsFiltrees);
            }
        } catch (e) {
            console.warn('[Modelisation] Erreur suppression annotations:', e);
        }

        // Supprimer des metadonnees
        fichiers = fichiers.filter(function(f) { return f.id !== id; });
        sauvegarderFichiers();
        afficherSidebar();

        console.log('[Modelisation] Fichier supprime:', id);
    }

    /* ===============================
       MISE A JOUR NAVIGATION (listener)
       =============================== */

    function onPageRendue(e) {
        // Ne reagir que si on est dans le contexte modelisation
        if (!fichierOuvertId) return;
        var modelCanvas = document.getElementById('model-canvas-document');
        if (!modelCanvas) return;

        // Mettre a jour les indicateurs modelisation
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

        // Zoom
        var indicateurZoom = document.getElementById('model-indicateur-zoom');
        if (indicateurZoom) {
            indicateurZoom.textContent = Math.round(travauxVisionneuse.getZoomActuel() * 100) + '%';
        }
    }

    /* ===============================
       NETTOYAGE EN QUITTANT
       =============================== */

    function nettoyerModelisation() {
        console.log('[Modelisation] Nettoyage...');

        // Sauvegarder et desactiver l'annotation
        if (typeof travauxAnnotation !== 'undefined' && travauxAnnotation.estActif()) {
            travauxAnnotation.desactiverAnnotation();
        }

        // Detruire le layout annotation partage
        if (typeof travauxUI !== 'undefined' && travauxUI.detruireLayoutAnnotation) {
            travauxUI.detruireLayoutAnnotation('model-conteneur-document');
        }

        // Fermer le fichier dans la visionneuse
        if (fichierOuvertId && typeof travauxVisionneuse !== 'undefined') {
            travauxVisionneuse.fermerFichier();
            fichierOuvertId = null;
        }

        // Supprimer la palette flottante si elle existe dans notre conteneur
        var palette = document.getElementById('travaux-palette-flottante');
        if (palette && palette.closest('#model-conteneur-document')) {
            palette.remove();
        }

        // Remettre les contextes a null
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
        fichierSuivant: fichierSuivant,
        toggleSidebar: toggleSidebar
    };

    console.log('[Modelisation] Module charge');

})();
