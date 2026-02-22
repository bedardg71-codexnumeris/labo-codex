/* ===============================
   MODULE: MODELISATION
   Outil d'annotation en projection (Boite a outils)
   Reutilise travaux-visionneuse, travaux-annotation, travaux-outils

   DEPENDANCES:
   - travaux-stockage.js (stockage blobs IndexedDB)
   - travaux-visionneuse.js (rendu PDF/images)
   - travaux-annotation.js (dessin, surlignage, formes)
   - travaux-outils.js (palette d'outils)
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

    /* ===============================
       INITIALISATION
       =============================== */

    function initialiserModelisation() {
        if (moduleInitialise) {
            // Deja initialise, juste rafraichir la liste
            chargerFichiers();
            afficherListeFichiers();
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
        afficherListeFichiers();

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

        conteneur.innerHTML = `
            <div class="model-layout">
                <!-- En-tete -->
                <div class="model-entete">
                    <div class="model-entete-gauche">
                        <h2 class="model-titre">Modelisation</h2>
                        <span class="model-sous-titre">Annotation en projection</span>
                    </div>
                    <div class="model-entete-droite">
                        <button class="model-btn-ouvrir" onclick="window.modelisation.ouvrirFichierLocal()">
                            + Ouvrir un fichier
                        </button>
                        <span class="model-compteur" id="model-compteur-fichiers"></span>
                    </div>
                </div>

                <!-- Grille des fichiers -->
                <div class="model-grille-fichiers" id="model-grille-fichiers">
                    <!-- Rempli dynamiquement -->
                </div>

                <!-- Visionneuse -->
                <div class="travaux-visionneuse-layout" id="model-visionneuse-layout" style="display:none;">
                    <div class="travaux-zone-document" id="model-conteneur-document">

                        <!-- Toolbar -->
                        <div class="travaux-toolbar">
                            <div class="travaux-toolbar-inner">
                                <!-- GAUCHE : navigation pages -->
                                <div class="travaux-toolbar-gauche">
                                    <button id="model-btn-page-prec" class="travaux-btn-nav" onclick="travauxVisionneuse.pagePrecedente()" disabled title="Page precedente">&#x2190;</button>
                                    <span id="model-indicateur-page">-- / --</span>
                                    <button id="model-btn-page-suiv" class="travaux-btn-nav" onclick="travauxVisionneuse.pageSuivante()" disabled title="Page suivante">&#x2192;</button>
                                    <span id="model-nom-fichier" style="margin-left: 12px; opacity: 0.7; font-size: 0.85em;"></span>
                                </div>

                                <!-- CENTRE : vide -->
                                <div class="travaux-toolbar-centre"></div>

                                <!-- DROITE : zoom + fermer -->
                                <div class="travaux-toolbar-droite">
                                    <span id="model-indicateur-zoom" class="travaux-zoom-info">100%</span>
                                    <button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoomPleineLargeur()" title="Ajuster a la largeur">Largeur</button>
                                    <button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoomPleineHauteur()" title="Ajuster a la hauteur">Hauteur</button>
                                    <button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoom100()" title="Zoom 100%">100%</button>
                                    <button class="travaux-btn-zoom" onclick="travauxVisionneuse.recentrerVue()" title="Recentrer la vue">Recentrer</button>
                                    <span class="travaux-separateur"></span>
                                    <button class="travaux-btn-action" onclick="window.modelisation.fermerVisionneuse()" title="Fermer le fichier">Fermer</button>
                                </div>
                            </div>
                        </div>

                        <!-- Canvas container -->
                        <div class="travaux-canvas-container" id="model-canvas-container">
                            <div class="travaux-canvas-wrapper" id="model-canvas-wrapper">
                                <canvas id="model-canvas-document"></canvas>
                                <canvas id="model-canvas-surligneur" class="u-hide" style="pointer-events:none;"></canvas>
                                <canvas id="model-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>
                            </div>
                        </div>

                        <!-- Palettes flottantes inserees dynamiquement -->
                    </div>
                </div>
            </div>
        `;

        // Ecouter l'evenement travaux-page-rendue pour mettre a jour les indicateurs modelisation
        window.addEventListener('travaux-page-rendue', onPageRendue);
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

    function afficherListeFichiers() {
        const grille = document.getElementById('model-grille-fichiers');
        const compteur = document.getElementById('model-compteur-fichiers');
        if (!grille) return;

        if (compteur) {
            compteur.textContent = fichiers.length > 0
                ? fichiers.length + ' fichier' + (fichiers.length > 1 ? 's' : '')
                : '';
        }

        if (fichiers.length === 0) {
            grille.innerHTML = `
                <div class="model-placeholder">
                    <p>Aucun fichier. Cliquez sur « Ouvrir un fichier » pour commencer.</p>
                </div>
            `;
            return;
        }

        let html = '';
        fichiers.forEach(f => {
            const actif = f.id === fichierOuvertId ? ' model-fichier-actif' : '';
            const thumbnail = f.thumbnailDataUrl
                ? `<img src="${f.thumbnailDataUrl}" alt="" class="model-fichier-thumb">`
                : `<div class="model-fichier-thumb-placeholder">${f.typeMIME === 'application/pdf' ? 'PDF' : 'IMG'}</div>`;

            html += `
                <div class="model-fichier-carte${actif}" data-id="${f.id}" onclick="window.modelisation.ouvrirFichier('${f.id}')">
                    <div class="model-fichier-apercu">
                        ${thumbnail}
                    </div>
                    <div class="model-fichier-info">
                        <span class="model-fichier-nom" title="${f.nomFichier}">${tronquerNom(f.nomFichier, 20)}</span>
                    </div>
                    <button class="model-fichier-supprimer" onclick="event.stopPropagation(); window.modelisation.supprimerFichier('${f.id}')" title="Supprimer">&times;</button>
                </div>
            `;
        });
        grille.innerHTML = html;
    }

    function tronquerNom(nom, max) {
        if (nom.length <= max) return nom;
        const ext = nom.lastIndexOf('.');
        if (ext > 0) {
            const base = nom.substring(0, ext);
            const extension = nom.substring(ext);
            const maxBase = max - extension.length - 1;
            return base.substring(0, maxBase) + '\u2026' + extension;
        }
        return nom.substring(0, max - 1) + '\u2026';
    }

    /* ===============================
       OUVRIR UN FICHIER LOCAL
       =============================== */

    function ouvrirFichierLocal() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png,.heic';
        input.style.display = 'none';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const blob = new Blob([await file.arrayBuffer()], { type: file.type });
                const id = PREFIXE_ID + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

                // Generer la miniature
                let thumbnailDataUrl = '';
                try {
                    if (file.type === 'application/pdf') {
                        const result = await travauxStockage.genererMiniaturePDF(blob);
                        thumbnailDataUrl = result.thumbnail;
                    } else if (file.type.startsWith('image/')) {
                        thumbnailDataUrl = await travauxStockage.genererMiniatureImage(blob);
                    }
                } catch (err) {
                    console.warn('[Modelisation] Erreur generation miniature:', err);
                }

                // Creer les metadonnees
                const metadata = {
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
                afficherListeFichiers();

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
        const metadata = fichiers.find(f => f.id === id);
        if (!metadata) {
            console.error('[Modelisation] Fichier introuvable:', id);
            return;
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
        travauxOutils.setMasquerErreursFrancais(true);

        // Configurer le conteneur de la visionneuse
        const conteneurDoc = document.getElementById('model-conteneur-document');
        travauxVisionneuse.setConteneur(conteneurDoc);

        // Configurer les gestes zoom sur le canvas container
        const canvasContainer = document.getElementById('model-canvas-container');
        travauxVisionneuse.configurerGestesZoom(canvasContainer);

        // Recuperer le blob
        const blob = await travauxStockage.recupererBlob(id);
        if (!blob) {
            console.error('[Modelisation] Blob introuvable pour:', id);
            alert('Le fichier n\u2019a pas pu \u00eatre charge.');
            return;
        }

        // Afficher la visionneuse
        const visionneuseLayout = document.getElementById('model-visionneuse-layout');
        if (visionneuseLayout) visionneuseLayout.style.display = '';

        // Ouvrir le fichier
        fichierOuvertId = id;
        await travauxVisionneuse.ouvrirDepuisBlob(blob, metadata);

        // Afficher le nom du fichier dans la toolbar
        const nomEl = document.getElementById('model-nom-fichier');
        if (nomEl) nomEl.textContent = metadata.nomFichier;

        // Activer l'annotation automatiquement
        travauxAnnotation.activerAnnotation();

        // Rafraichir la liste pour marquer le fichier actif
        afficherListeFichiers();
    }

    /* ===============================
       FERMER LA VISIONNEUSE
       =============================== */

    function fermerVisionneuse() {
        // Sauvegarder les annotations avant de fermer
        if (travauxAnnotation.estActif()) {
            travauxAnnotation.desactiverAnnotation();
        }
        travauxVisionneuse.fermerFichier();
        fichierOuvertId = null;

        // Masquer la visionneuse
        const visionneuseLayout = document.getElementById('model-visionneuse-layout');
        if (visionneuseLayout) visionneuseLayout.style.display = 'none';

        // Supprimer la palette flottante si elle existe dans notre conteneur
        const palette = document.getElementById('travaux-palette-flottante');
        if (palette && palette.closest('#model-conteneur-document')) {
            palette.remove();
        }

        // Nettoyer le contexte
        travauxVisionneuse.setContext(null);
        travauxAnnotation.setContext(null);
        travauxOutils.setMasquerErreursFrancais(false);

        // Rafraichir la liste
        afficherListeFichiers();
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
            const annotations = travauxStockage.obtenirAnnotations();
            const annotationsFiltrees = annotations.filter(a => a.fichierId !== id);
            if (annotationsFiltrees.length !== annotations.length) {
                db.setSync(cle('annotationsTravaux'), annotationsFiltrees);
            }
        } catch (e) {
            console.warn('[Modelisation] Erreur suppression annotations:', e);
        }

        // Supprimer des metadonnees
        fichiers = fichiers.filter(f => f.id !== id);
        sauvegarderFichiers();
        afficherListeFichiers();

        console.log('[Modelisation] Fichier supprime:', id);
    }

    /* ===============================
       MISE A JOUR NAVIGATION (listener)
       =============================== */

    function onPageRendue(e) {
        // Ne reagir que si on est dans le contexte modelisation
        if (!fichierOuvertId) return;
        const modelCanvas = document.getElementById('model-canvas-document');
        if (!modelCanvas) return;

        const detail = e.detail;

        // Mettre a jour les indicateurs modelisation
        const indicateur = document.getElementById('model-indicateur-page');
        if (indicateur) {
            const total = travauxVisionneuse.getNombrePagesTotal();
            const page = travauxVisionneuse.getPageActuelle();
            indicateur.textContent = page + ' / ' + total;
        }

        const btnPrec = document.getElementById('model-btn-page-prec');
        const btnSuiv = document.getElementById('model-btn-page-suiv');
        const page = travauxVisionneuse.getPageActuelle();
        const total = travauxVisionneuse.getNombrePagesTotal();
        if (btnPrec) btnPrec.disabled = page <= 1;
        if (btnSuiv) btnSuiv.disabled = page >= total;

        // Zoom
        const indicateurZoom = document.getElementById('model-indicateur-zoom');
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

        // Fermer le fichier dans la visionneuse
        if (fichierOuvertId && typeof travauxVisionneuse !== 'undefined') {
            travauxVisionneuse.fermerFichier();
            fichierOuvertId = null;
        }

        // Supprimer la palette flottante si elle existe dans notre conteneur
        const palette = document.getElementById('travaux-palette-flottante');
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
        if (typeof travauxOutils !== 'undefined') {
            travauxOutils.setMasquerErreursFrancais(false);
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
        nettoyer: nettoyerModelisation
    };

    console.log('[Modelisation] Module charge');

})();
