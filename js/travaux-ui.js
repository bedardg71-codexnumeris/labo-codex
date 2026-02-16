/* ===============================
   MODULE: TRAVAUX - UI COORDINATEUR
   Layout principal, raccourcis clavier, initialisation
   Coordonne tous les sous-modules travaux

   DEPENDANCES:
   - travaux-stockage.js
   - travaux-import.js
   - travaux-visionneuse.js
   - travaux-annotation.js
   - travaux-outils.js
   - travaux-archivage.js
   =============================== */

(function() {
    'use strict';

    /* ===============================
       ETAT
       =============================== */

    let moduleInitialise = false;
    let vueCoteACote = false;
    let sidebarManuelReplie = false;

    /* ===============================
       SCROLL VIRTUEL
       =============================== */

    const HAUTEUR_MINIATURE = 100; // px, hauteur d'une miniature
    const BUFFER_MINIATURES = 5;   // miniatures en buffer haut/bas
    let scrollVirtuelActif = false;
    let fichiersPourScroll = [];
    let conteneurScroll = null;
    let viewportScroll = null;

    /* ===============================
       INITIALISATION
       =============================== */

    /**
     * Initialise le module complet Travaux
     */
    async function initialiserModuleTravaux() {
        if (moduleInitialise) {
            rafraichirUI();
            return;
        }

        console.log('[Travaux-UI] Initialisation du module Travaux...');

        // Initialiser les sous-modules
        await travauxStockage.initialiser();
        travauxVisionneuse.initialiser();
        travauxAnnotation.initialiser();

        // Ecouter les evenements d'annotation (une seule fois)
        window.addEventListener('travaux-annotation-activee', () => {
            const btnAnnoter = document.getElementById('travaux-btn-annoter');
            const undoRedo = document.getElementById('travaux-undo-redo');
            if (btnAnnoter) { btnAnnoter.textContent = 'Terminer'; btnAnnoter.classList.add('actif'); }
            if (undoRedo) undoRedo.classList.remove('u-hide');
            // Replier la sidebar pour maximiser l'espace d'annotation
            const sidebar = document.getElementById('travaux-sidebar');
            if (sidebar) sidebar.classList.add('replie');
            const btnToggle = document.getElementById('travaux-btn-toggle-sidebar');
            if (btnToggle) {
                btnToggle.classList.add('visible');
                btnToggle.innerHTML = '&#x25B6;';
            }
        });

        window.addEventListener('travaux-annotation-desactivee', () => {
            const btnAnnoter = document.getElementById('travaux-btn-annoter');
            const undoRedo = document.getElementById('travaux-undo-redo');
            if (btnAnnoter) { btnAnnoter.textContent = 'Annoter'; btnAnnoter.classList.remove('actif'); }
            if (undoRedo) undoRedo.classList.add('u-hide');
            // Redeployer la sidebar seulement si pas manuellement repliee
            const sidebar = document.getElementById('travaux-sidebar');
            const btnToggle = document.getElementById('travaux-btn-toggle-sidebar');
            if (!sidebarManuelReplie) {
                if (sidebar) sidebar.classList.remove('replie');
                if (btnToggle) {
                    btnToggle.classList.remove('visible');
                    btnToggle.innerHTML = '&#x25C0;';
                }
            } else {
                if (btnToggle) {
                    btnToggle.classList.add('visible');
                    btnToggle.innerHTML = '&#x25B6;';
                }
            }
        });

        moduleInitialise = true;
        console.log('[Travaux-UI] Module Travaux initialise');

        rafraichirUI();
    }

    /* ===============================
       SOUS-SECTIONS
       =============================== */

    /**
     * Affiche la sous-section Import
     */
    function afficherImport() {
        const conteneur = document.getElementById('evaluations-contenu-import');
        if (!conteneur) return;

        const fichiersTravaux = travauxStockage.obtenirFichiersTravaux();
        const stats = travauxStockage.statistiquesFichiers();

        // Productions disponibles
        const productions = obtenirDonneesSelonMode(cle('productions'));

        const fsapiDispo = travauxStockage.estFSAPIDisponible();
        const fsapiActif = travauxStockage.estFSAPIActif();

        // Zero-state pour les novices
        const aideActive = typeof estAideContextuelleActive === 'function' && estAideContextuelleActive();
        const zeroStateHTML = (fichiersTravaux.length === 0 && aideActive) ? `
            <div class="travaux-zero-state">
                <div class="zero-state-icone">&#x1F4DD;</div>
                <h3>Annoter les travaux de tes étudiants</h3>
                <p class="texte-muted">
                    L'annotation te permet de marquer directement sur les copies :
                    surlignage, commentaires, symboles et autocollants de rétroaction.
                </p>
                <div class="zero-state-etapes">
                    <div class="zero-state-etape">
                        <span class="etape-numero">1</span>
                        <div>
                            <strong>Choisis la production concernée</strong>
                            <small>Le travail ou l'examen que tu corriges</small>
                        </div>
                    </div>
                    <div class="zero-state-etape">
                        <span class="etape-numero">2</span>
                        <div>
                            <strong>Importe les copies</strong>
                            <small>Glisse des fichiers PDF ou images dans la zone ci-dessous</small>
                        </div>
                    </div>
                    <div class="zero-state-etape">
                        <span class="etape-numero">3</span>
                        <div>
                            <strong>Annote et exporte</strong>
                            <small>Marque les copies, puis exporte les PDF annotés</small>
                        </div>
                    </div>
                </div>
            </div>` : '';

        conteneur.innerHTML = `
            <div class="travaux-import-header">
                <h3>Importer des travaux
                    <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle">📍</button>
                </h3>
                <div class="travaux-stats-rapides">
                    <span>${stats.nombre} fichier(s) en stock</span>
                    <span>${stats.tailleFormatee}</span>
                    <span class="travaux-mode-stockage">${fsapiActif ? 'Disque local' : 'IndexedDB'}</span>
                </div>
            </div>

            ${zeroStateHTML}

            ${fsapiDispo ? `
            <div class="travaux-fsapi-config">
                ${fsapiActif
                    ? '<span class="travaux-fsapi-statut actif">Stockage sur disque actif</span>'
                    : `<button class="btn btn-secondaire" onclick="travauxUI.configurerFSAPI()">Configurer le stockage sur disque</button>
                       <span class="texte-muted">Recommande sur Mac - les fichiers restent sur votre disque</span>`
                }
            </div>` : ''}

            <div class="travaux-select-production">
                <label>Production concernée :
                    <span class="tooltip-aide" title="Choisis la production (travail, examen) à laquelle correspondent les copies que tu vas importer. Cela permet d'associer les fichiers aux évaluations.">📍</span>
                </label>
                <select id="travaux-select-production" class="form-select">
                    <option value="">-- Sélectionner --</option>
                    ${productions.map(p => `<option value="${p.id}">${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                </select>
            </div>

            <div id="travaux-drop-zone" class="travaux-drop-zone">
                <div class="travaux-drop-zone-contenu">
                    <div class="travaux-drop-zone-icone">&#x1F4C1;</div>
                    <p>Glissez vos fichiers ici</p>
                    <p class="texte-muted">PDF, JPEG, PNG, HEIC</p>
                    <p class="texte-muted">ou cliquez pour parcourir</p>
                </div>
            </div>

            <div id="travaux-file-attente-container">
                ${travauxImport.genererHTMLFileDAttente()}
            </div>

            <div class="travaux-import-actions" ${travauxImport.obtenirFileDAttente().length === 0 ? 'style="display:none"' : ''}>
                <button class="btn btn-principal" onclick="travauxUI.lancerImport()">
                    Importer ${travauxImport.obtenirFileDAttente().length} fichier(s)
                </button>
                <button class="btn btn-secondaire" onclick="travauxImport.viderFileDAttente(); travauxUI.afficherImport();">
                    Annuler
                </button>
            </div>

            <div id="travaux-progression-import" style="display:none">
                <div class="travaux-barre-progression-container">
                    <div id="travaux-barre-progression" class="travaux-barre-progression"></div>
                </div>
                <div id="travaux-texte-progression" class="texte-muted"></div>
            </div>

            ${fichiersTravaux.length > 0 ? genererGrilleFichiers(fichiersTravaux) : ''}
        `;

        // Initialiser le drag-drop
        const dropZone = document.getElementById('travaux-drop-zone');
        travauxImport.initialiserDropZone(dropZone, (prepares) => {
            rafraichirImportUI();
        });
    }

    /**
     * Affiche la sous-section Visionneuse
     */
    function afficherVisionneuse() {
        const conteneur = document.getElementById('evaluations-contenu-visionneuse');
        if (!conteneur) return;

        const fichiersTravaux = travauxStockage.obtenirFichiersTravaux();

        conteneur.innerHTML = `
            <div class="travaux-visionneuse-layout">
                <!-- Sidebar miniatures -->
                <div class="travaux-sidebar" id="travaux-sidebar">
                    <div class="travaux-sidebar-header">
                        <h4>Fichiers</h4>
                        <select id="travaux-filtre-etudiant" class="form-select" onchange="travauxUI.filtrerParEtudiant(this.value)">
                            <option value="">Tous les etudiants</option>
                            ${genererOptionsEtudiants()}
                        </select>
                    </div>
                    <div class="travaux-miniatures" id="travaux-miniatures">
                        ${genererMiniatures(fichiersTravaux)}
                    </div>
                </div>

                <!-- Zone document + annotation -->
                <div class="travaux-zone-document" id="travaux-conteneur-document">
                    <!-- Bouton toggle sidebar (visible quand sidebar repliee) -->
                    <button class="travaux-btn-toggle-sidebar" id="travaux-btn-toggle-sidebar" onclick="travauxUI.toggleSidebar()" title="Afficher les fichiers">&#x25C0;</button>

                    <!-- Toolbar -->
                    <div class="travaux-toolbar">
                        <div class="travaux-toolbar-gauche">
                            <button class="btn btn-petit" onclick="travauxUI.retourImport()" title="Retour a la liste">&#x2190; Retour</button>
                            <span id="travaux-nom-fichier" class="travaux-nom-fichier">Aucun fichier ouvert</span>
                        </div>
                        <div class="travaux-toolbar-centre">
                            <button id="travaux-btn-page-prec" class="btn-icon" onclick="travauxVisionneuse.pagePrecedente()" disabled title="Page precedente">&#x2190;</button>
                            <span id="travaux-indicateur-page">-- / --</span>
                            <button id="travaux-btn-page-suiv" class="btn-icon" onclick="travauxVisionneuse.pageSuivante()" disabled title="Page suivante">&#x2192;</button>
                        </div>
                        <div class="travaux-toolbar-droite">
                            <button class="btn btn-petit" onclick="travauxVisionneuse.zoomPleineLargeur()" title="Ajuster a la largeur du conteneur">Pleine largeur</button>
                            <button class="btn btn-petit" onclick="travauxVisionneuse.zoomPleineHauteur()" title="Ajuster a la hauteur du conteneur">Pleine hauteur</button>
                            <span id="travaux-indicateur-zoom">100%</span>
                            <span class="travaux-separateur"></span>
                            <button id="travaux-btn-annoter" class="btn btn-petit" onclick="travauxAnnotation.basculerAnnotation()">Annoter</button>
                            <button id="travaux-btn-export-pdf" class="btn btn-petit u-hide" onclick="travauxExportPDF.afficherRevisionExport(travauxVisionneuse.getFichierActuel()?.id)" title="Exporter PDF annote">Exporter PDF</button>
                            <button id="travaux-btn-evaluer" class="btn btn-petit u-hide" onclick="travauxUI.evaluerDepuisAnnotation()" title="Evaluer cette production">Evaluer</button>
                        </div>
                    </div>

                    <!-- Canvas container -->
                    <div class="travaux-canvas-container" id="travaux-canvas-container">
                        <div class="travaux-canvas-wrapper" id="travaux-canvas-wrapper">
                            <canvas id="travaux-canvas-document"></canvas>
                            <canvas id="travaux-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>
                        </div>
                        <div id="travaux-placeholder-visionneuse" class="travaux-placeholder">
                            <p>Selectionnez un fichier dans la sidebar pour l'ouvrir</p>
                        </div>
                    </div>

                    <!-- Palette d'outils (masquee par defaut) -->
                    <div id="travaux-palette-container" class="u-hide"></div>

                    <!-- Undo/Redo (masques par defaut) -->
                    <div class="travaux-undo-redo u-hide" id="travaux-undo-redo">
                        <button id="travaux-btn-undo" class="btn-icon" onclick="travauxAnnotation.annuler()" disabled title="Annuler (Ctrl+Z)">&#x21A9;</button>
                        <button id="travaux-btn-redo" class="btn-icon" onclick="travauxAnnotation.retablir()" disabled title="Retablir (Ctrl+Y)">&#x21AA;</button>
                        <button class="btn-icon btn-danger-petit" onclick="travauxAnnotation.effacerPage()" title="Effacer la page">&#x1F5D1;</button>
                    </div>
                </div>
            </div>
        `;

        // Restaurer l'etat de la sidebar depuis la session
        sidebarManuelReplie = sessionStorage.getItem('travaux-sidebar-replie') === '1';
        if (sidebarManuelReplie) {
            const sidebar = document.getElementById('travaux-sidebar');
            const btnToggle = document.getElementById('travaux-btn-toggle-sidebar');
            if (sidebar) sidebar.classList.add('replie');
            if (btnToggle) {
                btnToggle.classList.add('visible');
                btnToggle.innerHTML = '&#x25B6;';
            }
        }

        // Configurer la visionneuse
        const conteneurDoc = document.getElementById('travaux-conteneur-document');
        travauxVisionneuse.setConteneur(conteneurDoc);

        // Gestes zoom (pinch iPad / trackpad Mac)
        const canvasContainer = document.getElementById('travaux-canvas-container');
        travauxVisionneuse.configurerGestesZoom(canvasContainer);

        // Initialiser le scroll virtuel si necessaire
        initialiserScrollVirtuel();

    }

    /**
     * Affiche la sous-section Archivage
     */
    function afficherArchivage() {
        const conteneur = document.getElementById('evaluations-contenu-archivage');
        if (!conteneur) return;

        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const productions = obtenirDonneesSelonMode(cle('productions'));
        const stats = travauxStockage.statistiquesFichiers();

        conteneur.innerHTML = `
            <h3>Archivage des travaux</h3>
            <p class="texte-muted">${stats.nombre} fichier(s) en stock (${stats.tailleFormatee})</p>

            <div class="travaux-archivage-options">
                <!-- Export par étudiant -->
                <div class="travaux-archivage-carte">
                    <h4>Par étudiant</h4>
                    <p class="texte-muted">Télécharger tous les travaux d'un étudiant</p>
                    <select id="travaux-archivage-etudiant" class="form-select">
                        <option value="">-- Choisir un étudiant --</option>
                        ${etudiants.map(e => `<option value="${e.da}">${echapperHtml(e.prenom + ' ' + e.nom)} (${e.da})</option>`).join('')}
                    </select>
                    <div class="travaux-archivage-checks">
                        <label><input type="checkbox" id="arch-etudiant-annotes" checked> Inclure annotés</label>
                        <label><input type="checkbox" id="arch-etudiant-evals"> Inclure évaluations</label>
                    </div>
                    <button class="btn btn-principal" onclick="travauxUI.lancerArchivageEtudiant()">Télécharger ZIP</button>
                </div>

                <!-- Export par production -->
                <div class="travaux-archivage-carte">
                    <h4>Par production</h4>
                    <p class="texte-muted">Télécharger tous les travaux d'une production</p>
                    <select id="travaux-archivage-production" class="form-select">
                        <option value="">-- Choisir une production --</option>
                        ${productions.map(p => `<option value="${p.id}">${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                    </select>
                    <div class="travaux-archivage-checks">
                        <label><input type="checkbox" id="arch-prod-annotes" checked> Inclure annotés</label>
                    </div>
                    <button class="btn btn-principal" onclick="travauxUI.lancerArchivageProduction()">Télécharger ZIP</button>
                </div>

                <!-- Export semestre complet -->
                <div class="travaux-archivage-carte">
                    <h4>Semestre complet</h4>
                    <p class="texte-muted">Archive complète de tous les travaux du semestre</p>
                    <div id="travaux-texte-progression" class="texte-muted"></div>
                    <div class="travaux-barre-progression-container">
                        <div id="travaux-barre-progression" class="travaux-barre-progression"></div>
                    </div>
                    <button class="btn btn-principal" onclick="travauxUI.lancerArchivageSemestre()">Télécharger archive complète</button>
                </div>
            </div>

            <!-- Quota stockage -->
            <div class="travaux-quota-section">
                <h4>Espace de stockage</h4>
                <div id="travaux-quota-info">Chargement...</div>
            </div>
        `;

        // Charger les infos quota
        chargerQuota();
    }

    /* ===============================
       HELPERS UI
       =============================== */

    /**
     * Genere la grille de fichiers importes
     * @param {Array} fichiers - Les fichiers
     * @returns {string} HTML
     */
    function genererGrilleFichiers(fichiers) {
        if (fichiers.length === 0) return '';

        let html = '<div class="travaux-grille-fichiers"><h4>Fichiers importés</h4><div class="travaux-grille">';

        fichiers.forEach(f => {
            const thumb = f.thumbnailDataUrl || '';
            const icone = f.typeMIME === 'application/pdf' ? '&#x1F4C4;' : '&#x1F5BC;';
            const etudiant = travauxImport.trouverEtudiantParDA(f.etudiantDA);
            const nomEtudiant = etudiant
                ? `${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}`
                : (f.etudiantDA || 'Non associé');

            html += `
                <div class="travaux-grille-item" onclick="travauxUI.ouvrirFichier('${f.id}')" title="${echapperHtml(f.nomFichier)}">
                    <div class="travaux-grille-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<span class="travaux-grille-icone">${icone}</span>`}
                    </div>
                    <div class="travaux-grille-info">
                        <div class="travaux-grille-nom">${echapperHtml(f.nomFichier)}</div>
                        <div class="travaux-grille-etudiant">${nomEtudiant}</div>
                    </div>
                </div>`;
        });

        html += '</div></div>';
        return html;
    }

    /**
     * Genere les miniatures pour la sidebar
     * Pour 50+ fichiers, utilise le scroll virtuel
     * @param {Array} fichiers - Les fichiers
     * @returns {string} HTML
     */
    function genererMiniatures(fichiers) {
        if (fichiers.length === 0) {
            return '<p class="texte-muted" style="padding: 16px;">Aucun fichier importe</p>';
        }

        // Scroll virtuel pour grandes listes
        if (fichiers.length > 50) {
            fichiersPourScroll = fichiers;
            scrollVirtuelActif = true;
            const hauteurTotale = fichiers.length * HAUTEUR_MINIATURE;
            return `<div class="travaux-miniatures-virtuelles" id="travaux-scroll-virtuel" style="height: 100%; overflow-y: auto;">
                <div class="travaux-miniatures-viewport" id="travaux-scroll-viewport" style="height: ${hauteurTotale}px; position: relative;"></div>
            </div>`;
        }

        scrollVirtuelActif = false;
        return genererMiniaturesHTML(fichiers);
    }

    /**
     * Genere le HTML des miniatures (sans scroll virtuel)
     * @param {Array} fichiers
     * @returns {string} HTML
     */
    function genererMiniaturesHTML(fichiers) {
        let html = '';
        fichiers.forEach(f => {
            const thumb = f.thumbnailDataUrl || '';
            const icone = f.typeMIME === 'application/pdf' ? '&#x1F4C4;' : '&#x1F5BC;';
            const actif = travauxVisionneuse.getFichierActuel()?.id === f.id ? ' actif' : '';

            html += `
                <div class="travaux-miniature${actif}" data-fichier-id="${f.id}" onclick="travauxUI.ouvrirFichier('${f.id}')">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<span>${icone}</span>`}
                    </div>
                    <div class="travaux-miniature-nom">${echapperHtml(f.nomFichier)}</div>
                </div>`;
        });
        return html;
    }

    /**
     * Initialise le scroll virtuel apres injection du HTML
     */
    function initialiserScrollVirtuel() {
        if (!scrollVirtuelActif) return;

        conteneurScroll = document.getElementById('travaux-scroll-virtuel');
        viewportScroll = document.getElementById('travaux-scroll-viewport');
        if (!conteneurScroll || !viewportScroll) return;

        conteneurScroll.addEventListener('scroll', onScrollVirtuel);
        rendreMiniaturesVisibles();
    }

    /**
     * Callback de scroll virtuel
     */
    function onScrollVirtuel() {
        requestAnimationFrame(rendreMiniaturesVisibles);
    }

    /**
     * Rend uniquement les miniatures visibles + buffer
     */
    function rendreMiniaturesVisibles() {
        if (!conteneurScroll || !viewportScroll || fichiersPourScroll.length === 0) return;

        const scrollTop = conteneurScroll.scrollTop;
        const hauteurVisible = conteneurScroll.clientHeight;

        const indexDebut = Math.max(0, Math.floor(scrollTop / HAUTEUR_MINIATURE) - BUFFER_MINIATURES);
        const indexFin = Math.min(
            fichiersPourScroll.length,
            Math.ceil((scrollTop + hauteurVisible) / HAUTEUR_MINIATURE) + BUFFER_MINIATURES
        );

        let html = '';
        for (let i = indexDebut; i < indexFin; i++) {
            const f = fichiersPourScroll[i];
            const thumb = f.thumbnailDataUrl || '';
            const icone = f.typeMIME === 'application/pdf' ? '&#x1F4C4;' : '&#x1F5BC;';
            const actif = travauxVisionneuse.getFichierActuel()?.id === f.id ? ' actif' : '';
            const top = i * HAUTEUR_MINIATURE;

            html += `
                <div class="travaux-miniature travaux-miniature-virtuelle${actif}" data-fichier-id="${f.id}"
                     style="top: ${top}px; height: ${HAUTEUR_MINIATURE}px;"
                     onclick="travauxUI.ouvrirFichier('${f.id}')">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<span>${icone}</span>`}
                    </div>
                    <div class="travaux-miniature-nom">${echapperHtml(f.nomFichier)}</div>
                </div>`;
        }

        viewportScroll.innerHTML = html;
    }

    /**
     * Genere les options de select pour les etudiants
     * @returns {string} HTML options
     */
    function genererOptionsEtudiants() {
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        return etudiants.map(e =>
            `<option value="${e.da}">${echapperHtml(e.prenom + ' ' + e.nom)}</option>`
        ).join('');
    }

    /* ===============================
       ACTIONS
       =============================== */

    /**
     * Configure le stockage FSAPI (File System Access API)
     */
    async function configurerFSAPI() {
        const resultat = await travauxStockage.configurerRepertoireFSAPI();
        if (resultat) {
            afficherImport(); // Rafraichir l'UI
        }
    }

    /**
     * Lance l'import des fichiers en attente
     */
    async function lancerImport() {
        const productionId = document.getElementById('travaux-select-production')?.value || '';

        if (travauxImport.obtenirFileDAttente().length === 0) {
            alert('Aucun fichier a importer');
            return;
        }

        const progression = document.getElementById('travaux-progression-import');
        if (progression) progression.classList.remove('u-hide');

        const resultat = await travauxImport.importerTous(productionId, (i, total) => {
            const pourcent = Math.round((i / total) * 100);
            const barre = document.getElementById('travaux-barre-progression');
            if (barre) barre.style.width = pourcent + '%';
            const texte = document.getElementById('travaux-texte-progression');
            if (texte) texte.textContent = `${i}/${total} fichier(s) importés...`;
        });

        if (progression) progression.classList.add('u-hide');

        // Rafraichir l'affichage
        afficherImport();

        alert(`Import terminé : ${resultat.importes} fichier(s) importé(s), ${resultat.erreurs} erreur(s)`);
    }

    /**
     * Ouvre un fichier dans la visionneuse
     * @param {string} fichierId - ID du fichier
     */
    async function ouvrirFichier(fichierId) {
        // Toggle interne : masquer import, afficher visionneuse
        const importDiv = document.getElementById('evaluations-contenu-import');
        const visDiv = document.getElementById('evaluations-contenu-visionneuse');
        if (importDiv) importDiv.classList.add('u-hide');
        if (visDiv) visDiv.classList.remove('u-hide');
        afficherVisionneuse();

        // Attendre que la visionneuse soit prete
        setTimeout(async () => {
            const placeholder = document.getElementById('travaux-placeholder-visionneuse');
            if (placeholder) placeholder.classList.add('u-hide');

            await travauxVisionneuse.ouvrirFichier(fichierId);

            // Afficher les boutons export PDF et evaluer
            const btnExport = document.getElementById('travaux-btn-export-pdf');
            if (btnExport) btnExport.classList.remove('u-hide');
            const btnEvaluer = document.getElementById('travaux-btn-evaluer');
            if (btnEvaluer) btnEvaluer.classList.remove('u-hide');

            // Mettre a jour la miniature active
            document.querySelectorAll('.travaux-miniature').forEach(m => {
                m.classList.toggle('actif', m.dataset.fichierId === fichierId);
            });

            // Bulle de decouverte au premier fichier ouvert (aide-contextuelle)
            if (typeof estAideContextuelleActive === 'function' && estAideContextuelleActive()
                && !sessionStorage.getItem('travaux_bulle_annoter_vu')) {
                setTimeout(function() {
                    if (typeof afficherBulleDecouverte === 'function') {
                        afficherBulleDecouverte({
                            cible: '#travaux-btn-annoter',
                            message: 'Clique ici pour activer les outils d\'annotation : stylo, surlignage, formes et autocollants.',
                            position: 'bas'
                        });
                    }
                    sessionStorage.setItem('travaux_bulle_annoter_vu', 'true');
                }, 500);
            }
        }, 100);
    }

    /**
     * Bascule la sidebar repliee/deployee
     */
    function toggleSidebar() {
        const sidebar = document.getElementById('travaux-sidebar');
        const btnToggle = document.getElementById('travaux-btn-toggle-sidebar');
        if (!sidebar) return;

        sidebar.classList.toggle('replie');
        const estReplie = sidebar.classList.contains('replie');

        // Mettre a jour la fleche directionnelle
        if (btnToggle) {
            btnToggle.classList.toggle('visible', estReplie);
            btnToggle.innerHTML = estReplie ? '&#x25B6;' : '&#x25C0;';
        }

        // Memoriser le choix manuel
        sidebarManuelReplie = estReplie;
        sessionStorage.setItem('travaux-sidebar-replie', estReplie ? '1' : '0');
    }

    /**
     * Filtre les miniatures par etudiant
     * @param {string} da - DA de l'etudiant (vide = tous)
     */
    function filtrerParEtudiant(da) {
        let fichiers = travauxStockage.obtenirFichiersTravaux();
        if (da) {
            fichiers = fichiers.filter(f => f.etudiantDA === da);
        }

        const conteneur = document.getElementById('travaux-miniatures');
        if (conteneur) {
            conteneur.innerHTML = genererMiniatures(fichiers);
            initialiserScrollVirtuel();
        }
    }

    /**
     * Lance l'archivage par etudiant
     */
    function lancerArchivageEtudiant() {
        const da = document.getElementById('travaux-archivage-etudiant')?.value;
        if (!da) {
            alert('Sélectionnez un étudiant');
            return;
        }

        const options = {
            inclureAnnotes: document.getElementById('arch-etudiant-annotes')?.checked,
            inclureEvaluations: document.getElementById('arch-etudiant-evals')?.checked
        };

        travauxArchivage.lancerExportEtudiant(da, options);
    }

    /**
     * Lance l'archivage par production
     */
    function lancerArchivageProduction() {
        const productionId = document.getElementById('travaux-archivage-production')?.value;
        if (!productionId) {
            alert('Selectionnez une production');
            return;
        }

        const options = {
            inclureAnnotes: document.getElementById('arch-prod-annotes')?.checked
        };

        travauxArchivage.lancerExportProduction(productionId, options);
    }

    /**
     * Lance l'archivage du semestre
     */
    function lancerArchivageSemestre() {
        travauxArchivage.lancerExportSemestre();
    }

    /**
     * Charge et affiche les infos de quota
     */
    async function chargerQuota() {
        const info = document.getElementById('travaux-quota-info');
        if (!info) return;

        const quota = await travauxStockage.estimerQuota();
        const stats = travauxStockage.statistiquesFichiers();
        const pourcent = Math.round(quota.pourcentage * 100);
        const couleurBarre = pourcent >= 90 ? 'var(--rouge-erreur)' : (pourcent >= 70 ? 'var(--btn-annuler)' : 'var(--bleu-clair)');

        const fsapiDispo = travauxStockage.estFSAPIDisponible();
        const fsapiActif = travauxStockage.estFSAPIActif();

        info.innerHTML = `
            <div class="travaux-quota-barre-container">
                <div class="travaux-quota-barre" style="width: ${pourcent}%; background: ${couleurBarre};"></div>
            </div>
            <p>${quota.utiliseFormate} utilises sur ${quota.totalFormate} (${pourcent}%)</p>
            <p>${stats.nombre} fichier(s) travaux (${stats.tailleFormatee})</p>
            <p class="texte-muted">Mode: ${fsapiActif ? 'Fichiers sur disque (FSAPI)' : 'IndexedDB'}</p>
            ${quota.alerteQuota ? `
                <div class="alerte alerte-attention" style="margin-top: 8px; padding: 10px; border-radius: 8px;">
                    <strong>Espace bientot plein</strong>
                    <p>Archivez et nettoyez les anciens travaux pour liberer de l'espace.</p>
                    <button class="btn btn-petit" onclick="travauxUI.proposerNettoyage()">Proposer un nettoyage</button>
                    ${fsapiDispo && !fsapiActif ? '<button class="btn btn-petit btn-secondaire" onclick="travauxUI.configurerFSAPI()">Passer au stockage disque</button>' : ''}
                </div>` : ''}
        `;
    }

    /**
     * Propose le nettoyage des anciens fichiers
     */
    async function proposerNettoyage() {
        const fichiers = travauxStockage.obtenirFichiersTravaux();
        if (fichiers.length === 0) {
            alert('Aucun fichier a nettoyer.');
            return;
        }

        // Trier par date d'import (plus ancien en premier)
        const tries = [...fichiers].sort((a, b) =>
            new Date(a.dateImport) - new Date(b.dateImport)
        );

        const moitie = Math.ceil(tries.length / 2);
        const anciens = tries.slice(0, moitie);
        const tailleLiberee = anciens.reduce((acc, f) => acc + (f.tailleFichier || 0), 0);

        const confirmation = confirm(
            `Supprimer les ${anciens.length} fichiers les plus anciens ?\n` +
            `Cela liberera environ ${travauxStockage.formaterTaille(tailleLiberee)}.\n\n` +
            `Assurez-vous d'avoir archive ces fichiers avant de les supprimer.`
        );

        if (!confirmation) return;

        const ids = anciens.map(f => f.id);
        const supprimes = await travauxStockage.nettoyerFichiersArchives(ids);
        alert(`${supprimes} fichier(s) supprime(s).`);

        // Rafraichir
        afficherArchivage();
    }

    /* ===============================
       ANNOTATION → EVALUATION
       =============================== */

    /**
     * Navigue vers l'evaluation avec l'etudiant et la production pre-remplis
     * depuis la visionneuse d'annotation
     */
    function evaluerDepuisAnnotation() {
        const fichier = travauxVisionneuse.getFichierActuel();
        if (!fichier) {
            alert('Aucun fichier ouvert.');
            return;
        }

        const da = fichier.etudiantDA;
        const productionId = fichier.productionId;

        if (!da || !productionId) {
            alert('Ce fichier n\'est pas associé à un étudiant ou une production.');
            return;
        }

        // Utiliser la fonction existante de liste-evaluations.js
        if (typeof evaluerProduction === 'function') {
            evaluerProduction(da, productionId);
        } else {
            console.error('[Travaux-UI] Fonction evaluerProduction non disponible');
            alert('Erreur: Module d\'evaluation non charge.');
        }
    }

    /* ===============================
       VUE COTE A COTE (Integration evaluation)
       =============================== */

    /**
     * Ouvre un fichier en vue cote-a-cote avec la grille d'evaluation
     * @param {string} fichierId - ID du fichier
     * @param {HTMLElement} conteneurGrille - Le conteneur de la grille
     */
    async function ouvrirVueCoteACote(fichierId, conteneurGrille) {
        vueCoteACote = true;

        // Creer la mise en page cote-a-cote
        const parent = conteneurGrille.parentElement;
        parent.classList.add('travaux-split-view');

        // Creer le conteneur travail
        let conteneurTravail = document.getElementById('travaux-split-travail');
        if (!conteneurTravail) {
            conteneurTravail = document.createElement('div');
            conteneurTravail.id = 'travaux-split-travail';
            conteneurTravail.className = 'travaux-split-panel';
            parent.insertBefore(conteneurTravail, conteneurGrille);
        }

        conteneurTravail.innerHTML = `
            <div class="travaux-zone-document" id="travaux-split-document-container">
                <div class="travaux-toolbar">
                    <button id="travaux-btn-page-prec" class="btn-icon" onclick="travauxVisionneuse.pagePrecedente()" disabled>&lt;</button>
                    <span id="travaux-indicateur-page">-- / --</span>
                    <button id="travaux-btn-page-suiv" class="btn-icon" onclick="travauxVisionneuse.pageSuivante()" disabled>&gt;</button>
                    <button class="btn btn-petit" onclick="travauxAnnotation.basculerAnnotation()">Annoter</button>
                    <button class="btn-icon" onclick="travauxUI.fermerVueCoteACote()" title="Fermer">&times;</button>
                </div>
                <div class="travaux-canvas-container">
                    <div class="travaux-canvas-wrapper">
                        <canvas id="travaux-canvas-document"></canvas>
                        <canvas id="travaux-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>
                    </div>
                </div>
                <div id="travaux-palette-container" class="u-hide"></div>
            </div>
        `;

        conteneurGrille.classList.add('travaux-split-panel');

        travauxVisionneuse.setConteneur(document.getElementById('travaux-split-document-container'));

        // Gestes zoom (pinch iPad / trackpad Mac)
        const splitCanvasContainer = conteneurTravail.querySelector('.travaux-canvas-container');
        travauxVisionneuse.configurerGestesZoom(splitCanvasContainer);

        await travauxVisionneuse.ouvrirFichier(fichierId);
    }

    /**
     * Ferme la vue cote-a-cote
     */
    function fermerVueCoteACote() {
        vueCoteACote = false;
        travauxVisionneuse.fermerFichier();
        travauxAnnotation.desactiverAnnotation();

        const conteneurTravail = document.getElementById('travaux-split-travail');
        if (conteneurTravail) {
            conteneurTravail.parentElement.classList.remove('travaux-split-view');
            conteneurTravail.remove();
        }

        document.querySelectorAll('.travaux-split-panel').forEach(el => {
            el.classList.remove('travaux-split-panel');
        });
    }

    /* ===============================
       RAFRAICHISSEMENT
       =============================== */

    /**
     * Rafraichit l'UI complete
     */
    function rafraichirUI() {
        const sousSection = sousSectionActive;
        if (!sousSection) return;

        switch (sousSection) {
            case 'evaluations-travaux':
                const visDiv = document.getElementById('evaluations-contenu-visionneuse');
                if (visDiv && !visDiv.classList.contains('u-hide')) {
                    afficherVisionneuse();
                } else {
                    afficherImport();
                }
                break;
            case 'evaluations-archivage':
                afficherArchivage();
                break;
        }
    }

    /**
     * Rafraichit la zone d'import (apres ajout/retrait de fichiers)
     */
    function rafraichirImportUI() {
        const conteneurAttente = document.getElementById('travaux-file-attente-container');
        if (conteneurAttente) {
            conteneurAttente.innerHTML = travauxImport.genererHTMLFileDAttente();
        }

        const actions = document.querySelector('.travaux-import-actions');
        if (actions) {
            toggleDisplay(actions, travauxImport.obtenirFileDAttente().length > 0);
            const btn = actions.querySelector('.btn-principal');
            if (btn) {
                btn.textContent = `Importer ${travauxImport.obtenirFileDAttente().length} fichier(s)`;
            }
        }
    }

    /**
     * Retour a la vue import depuis la visionneuse
     */
    function retourImport() {
        const importDiv = document.getElementById('evaluations-contenu-import');
        const visDiv = document.getElementById('evaluations-contenu-visionneuse');
        if (importDiv) importDiv.classList.remove('u-hide');
        if (visDiv) visDiv.classList.add('u-hide');
        afficherImport();
    }

    // Fonction globale pour le callback de rafraichissement
    window.rafraichirImportTravaux = rafraichirImportUI;

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxUI = {
        initialiser: initialiserModuleTravaux,
        // Sous-sections
        afficherImport: afficherImport,
        afficherVisionneuse: afficherVisionneuse,
        afficherArchivage: afficherArchivage,
        // Actions
        configurerFSAPI: configurerFSAPI,
        lancerImport: lancerImport,
        ouvrirFichier: ouvrirFichier,
        filtrerParEtudiant: filtrerParEtudiant,
        toggleSidebar: toggleSidebar,
        retourImport: retourImport,
        // Archivage
        lancerArchivageEtudiant: lancerArchivageEtudiant,
        lancerArchivageProduction: lancerArchivageProduction,
        lancerArchivageSemestre: lancerArchivageSemestre,
        // Annotation → Evaluation
        evaluerDepuisAnnotation: evaluerDepuisAnnotation,
        // Vue cote-a-cote
        ouvrirVueCoteACote: ouvrirVueCoteACote,
        fermerVueCoteACote: fermerVueCoteACote,
        // Quota / nettoyage
        proposerNettoyage: proposerNettoyage,
        // Rafraichissement
        rafraichirUI: rafraichirUI
    };

    // Alias pour navigation.js
    window.initialiserModuleTravaux = initialiserModuleTravaux;

})();
