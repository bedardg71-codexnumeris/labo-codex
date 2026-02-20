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
     * Affiche la sous-section Import en mode pipeline vertical
     */
    function afficherImport() {
        const conteneur = document.getElementById('evaluations-contenu-import');
        if (!conteneur) return;

        const fichiersTravaux = travauxStockage.obtenirFichiersTravaux();
        const stats = travauxStockage.statistiquesFichiers();
        const queue = travauxImport.obtenirFileDAttente();
        const groupes = travauxImport.regrouperParDocument();

        const fsapiDispo = travauxStockage.estFSAPIDisponible();
        const fsapiActif = travauxStockage.estFSAPIActif();

        const nbPDF = queue.filter(f => f.estPDF).length;
        const nbImages = queue.filter(f => f.estImage).length;
        const nbAOptimiser = queue.filter(f => f.pipelineStatut === 'a-optimiser').length;
        const nbPret = queue.filter(f => f.pipelineStatut === 'pret').length;
        const nbIdentifie = queue.filter(f => f.pipelineStatut === 'identifie').length;
        const tousIdentifies = queue.length > 0 && queue.every(f => f.pipelineStatut === 'identifie');
        const aDesImagesAOptimiser = nbAOptimiser > 0;

        // Zero-state pour les novices
        const aideActive = typeof estAideContextuelleActive === 'function' && estAideContextuelleActive();
        const zeroStateHTML = (fichiersTravaux.length === 0 && queue.length === 0 && aideActive) ? `
            <div class="travaux-zero-state">
                <div class="zero-state-icone">&#x1F4DD;</div>
                <h3>Annoter les travaux de tes étudiants</h3>
                <p class="texte-muted">
                    L'annotation te permet de marquer directement sur les copies :
                    surlignage, commentaires, symboles et autocollants de retroaction.
                </p>
                <div class="zero-state-etapes">
                    <div class="zero-state-etape">
                        <span class="etape-numero">1</span>
                        <div>
                            <strong>Déposez vos fichiers</strong>
                            <small>Glissez des PDF ou images dans la zone ci-dessous</small>
                        </div>
                    </div>
                    <div class="zero-state-etape">
                        <span class="etape-numero">2</span>
                        <div>
                            <strong>Traitez et identifiez</strong>
                            <small>Le pipeline optimise et associe automatiquement</small>
                        </div>
                    </div>
                    <div class="zero-state-etape">
                        <span class="etape-numero">3</span>
                        <div>
                            <strong>Importez et annotez</strong>
                            <small>Les fichiers sont stockés et prêts à annoter</small>
                        </div>
                    </div>
                </div>
            </div>` : '';

        conteneur.innerHTML = `
            <div class="pipeline-page">

                <div class="travaux-import-header">
                    <h3>Préparer et importer
                        <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle"></button>
                    </h3>
                    <div class="pipeline-stats">
                        ${queue.length > 0 ? `${queue.length} fichier(s) en file — ${travauxStockage.formaterTaille(queue.reduce((s, f) => s + f.tailleFichier, 0))}` : ''}
                        ${stats.nombre > 0 ? ` | ${stats.nombre} en stock (${stats.tailleFormatee})` : ''}
                        <span class="travaux-mode-stockage">${fsapiActif ? 'Disque local' : 'IndexedDB'}</span>
                    </div>
                </div>

                ${fsapiDispo ? `
                <div class="travaux-fsapi-config">
                    ${fsapiActif
                        ? '<span class="travaux-fsapi-statut actif">Stockage sur disque actif</span>'
                        : `<button class="btn btn-secondaire" onclick="travauxUI.configurerFSAPI()">Configurer le stockage sur disque</button>
                           <span class="texte-muted">Recommande sur Mac</span>`
                    }
                </div>` : ''}

                <!-- Selecteur de production global -->
                <div class="pipeline-production-selecteur">
                    <label>Production visée</label>
                    <select id="pipeline-production-globale" class="form-select" onchange="travauxUI.changerProductionGlobalePipeline(this.value)">
                        <option value="">-- Aucune --</option>
                        ${obtenirDonneesSelonMode(cle('productions')).map(p => `<option value="${p.id}" ${travauxImport.getProductionGlobale() === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                    </select>
                </div>

                ${zeroStateHTML}

                <!-- Pipeline repliable -->
                <div class="pipeline-etapes-groupe${queue.length === 0 ? ' replie' : ''}" id="pipeline-etapes-groupe">
                    <div class="pipeline-etapes-toggle" onclick="travauxUI.togglePipelineEtapes()">
                        <span id="pipeline-toggle-fleche">${queue.length === 0 ? '&#x25B6;' : '&#x25BC;'}</span>
                        <span>Pipeline d'import${queue.length > 0 ? ` (${queue.length} fichier(s))` : ''}</span>
                    </div>
                    <div class="pipeline-etapes-contenu">

                    <!-- ETAPE 1 : Zone d'entree -->
                    <div class="pipeline-etape">
                        <div class="pipeline-etape-header">
                            <span class="pipeline-etape-numero">1</span>
                            <span class="pipeline-etape-titre">Zone d'entrée</span>
                            <span class="pipeline-etape-compteur">${nbAOptimiser > 0 ? nbAOptimiser + ' fichier(s)' : ''}</span>
                        </div>
                        <div id="travaux-drop-zone" class="travaux-drop-zone">
                            <div class="travaux-drop-zone-contenu">
                                <div class="travaux-drop-zone-icone">&#x1F4C1;</div>
                                <p>Glissez vos fichiers ici</p>
                                <p class="texte-muted">PDF, JPEG, PNG, HEIC — ou cliquez pour parcourir</p>
                            </div>
                        </div>
                        ${(() => {
                            const entree = queue.filter(f => f.pipelineStatut === 'a-optimiser');
                            return entree.length > 0 ? genererPreviewsEntree(entree) : '';
                        })()}
                    </div>

                    ${queue.length > 0 ? `
                    <div class="pipeline-connecteur"></div>

                    <!-- ETAPE 2 : Detection du format -->
                    <div class="pipeline-etape">
                        <div class="pipeline-etape-header">
                            <span class="pipeline-etape-numero">2</span>
                            <span class="pipeline-etape-titre">Détection du format</span>
                        </div>
                        ${genererResumeDetection(queue)}
                    </div>

                    <div class="pipeline-connecteur"></div>

                    <!-- ETAPE 3 : Traitement -->
                    <div class="pipeline-etape ${!aDesImagesAOptimiser ? 'pipeline-etape-inactive' : ''}">
                        <div class="pipeline-etape-header">
                            <span class="pipeline-etape-numero">3</span>
                            <span class="pipeline-etape-titre">Traitement</span>
                            <span class="pipeline-etape-compteur">${nbAOptimiser > 0 ? nbAOptimiser + ' image(s) à traiter' : 'Aucune image à traiter'}</span>
                        </div>
                        ${genererSectionTraitement(queue, groupes)}
                    </div>

                    <div class="pipeline-connecteur"></div>

                    <!-- ETAPE 4 : Identification -->
                    <div class="pipeline-etape">
                        <div class="pipeline-etape-header">
                            <span class="pipeline-etape-numero">4</span>
                            <span class="pipeline-etape-titre">Identification</span>
                            <span class="pipeline-etape-compteur">${nbIdentifie}/${queue.length} identifié(s)</span>
                        </div>
                        ${genererSectionIdentification(queue)}
                    </div>

                    <div class="pipeline-connecteur"></div>

                    <!-- Bouton Importer -->
                    <div class="pipeline-bouton-importer">
                        ${genererBoutonsActionsPipeline(queue)}
                    </div>

                    <div id="travaux-progression-import" class="u-hide">
                        <div class="pipeline-progression-container">
                            <div id="travaux-barre-progression" class="pipeline-progression-barre"></div>
                        </div>
                        <div id="travaux-texte-progression" class="texte-muted"></div>
                    </div>
                    ` : ''}

                    </div><!-- /pipeline-etapes-contenu -->
                </div><!-- /pipeline-etapes-groupe -->

                <!-- Section fichiers importes (toujours visible) -->
                <div class="pipeline-section-importes">
                    <h4>Fichiers importés (${fichiersTravaux.length})</h4>
                    ${fichiersTravaux.length > 0
                        ? genererGrilleFichiers(fichiersTravaux)
                        : '<p class="texte-muted">Aucun fichier importé pour le moment.</p>'}
                </div>

            </div>
        `;

        // Initialiser le drag-drop
        const dropZone = document.getElementById('travaux-drop-zone');
        travauxImport.initialiserDropZone(dropZone, (prepares) => {
            identifierAutoPipeline();
            rafraichirPipelineUI();
        });
    }

    /**
     * Toggle la visibilite du groupe d'etapes du pipeline
     */
    function togglePipelineEtapes() {
        const groupe = document.getElementById('pipeline-etapes-groupe');
        if (!groupe) return;
        groupe.classList.toggle('replie');
        const fleche = document.getElementById('pipeline-toggle-fleche');
        if (fleche) {
            fleche.innerHTML = groupe.classList.contains('replie') ? '&#x25B6;' : '&#x25BC;';
        }
    }

    /**
     * Affiche la grille de fichiers dans l'onglet Annoter et évaluer
     * État initial : sélection de fichier pour annotation
     */
    function afficherFichiers() {
        const conteneur = document.getElementById('evaluations-contenu-fichiers');
        if (!conteneur) return;

        // S'assurer que la grille est visible et la visionneuse masquée
        conteneur.classList.remove('u-hide');
        const visDiv = document.getElementById('evaluations-contenu-visionneuse');
        if (visDiv) visDiv.classList.add('u-hide');
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (evalDiv) evalDiv.classList.add('u-hide');

        const fichiersTravaux = travauxStockage.obtenirFichiersTravaux();

        if (fichiersTravaux.length === 0) {
            conteneur.innerHTML = `
                <div class="conteneur">
                    <h2>Annoter et évaluer</h2>
                    <p class="text-muted">Aucun fichier importé. Importez des travaux depuis l'onglet « Préparer et importer ».</p>
                </div>`;
            return;
        }

        conteneur.innerHTML = `
            <div class="conteneur">
                <h2>Annoter et évaluer</h2>
                <p class="text-muted">Sélectionnez un fichier pour commencer l'annotation</p>
                ${genererGrilleFichiers(fichiersTravaux)}
            </div>`;
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
                            <option value="">Tous les étudiants</option>
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
                            <button class="btn btn-petit" onclick="travauxUI.retourFichiers()" title="Retour à la grille">&#x2190; Retour</button>
                            <span id="travaux-nom-fichier" class="travaux-nom-fichier">Aucun fichier ouvert</span>
                            <span id="travaux-badge-statut" class="u-hide"></span>
                        </div>
                        <div class="travaux-toolbar-centre">
                            <button id="travaux-btn-page-prec" class="btn-icon" onclick="travauxVisionneuse.pagePrecedente()" disabled title="Page précédente">&#x2190;</button>
                            <span id="travaux-indicateur-page">-- / --</span>
                            <button id="travaux-btn-page-suiv" class="btn-icon" onclick="travauxVisionneuse.pageSuivante()" disabled title="Page suivante">&#x2192;</button>
                        </div>
                        <div class="travaux-toolbar-droite">
                            <button class="btn btn-petit" onclick="travauxVisionneuse.zoomPleineLargeur()" title="Ajuster à la largeur du conteneur">Pleine largeur</button>
                            <button class="btn btn-petit" onclick="travauxVisionneuse.zoomPleineHauteur()" title="Ajuster à la hauteur du conteneur">Pleine hauteur</button>
                            <span id="travaux-indicateur-zoom">100%</span>
                            <span class="travaux-separateur"></span>
                            <button id="travaux-btn-annoter" class="btn btn-petit" onclick="travauxAnnotation.basculerAnnotation()">Annoter</button>
                            <button id="travaux-btn-export-pdf" class="btn btn-petit u-hide" onclick="travauxExportPDF.afficherRevisionExport(travauxVisionneuse.getFichierActuel()?.id)" title="Exporter PDF annoté">Exporter PDF</button>
                            <button id="travaux-btn-evaluer" class="btn btn-ajouter btn-petit u-hide" onclick="travauxUI.evaluerDepuisAnnotation()" title="Évaluer cette production">Évaluer</button>
                            <button id="travaux-btn-alleger" class="btn btn-petit u-hide" onclick="travauxUI.allegerFichier(travauxVisionneuse.getFichierActuel()?.id)" title="Alléger ce fichier">Alléger</button>
                            <button id="travaux-btn-reimporter" class="btn btn-petit u-hide" onclick="travauxUI.reimporterFichier(travauxVisionneuse.getFichierActuel()?.id)" title="Re-importer l'original">Re-importer</button>
                        </div>
                    </div>

                    <!-- Canvas container -->
                    <div class="travaux-canvas-container" id="travaux-canvas-container">
                        <div class="travaux-canvas-wrapper" id="travaux-canvas-wrapper">
                            <canvas id="travaux-canvas-document"></canvas>
                            <canvas id="travaux-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>
                        </div>
                        <div id="travaux-placeholder-visionneuse" class="travaux-placeholder">
                            <p>Sélectionnez un fichier dans la sidebar pour l'ouvrir</p>
                        </div>
                    </div>

                    <!-- Palette d'outils (masquee par defaut) -->
                    <div id="travaux-palette-container" class="u-hide"></div>

                    <!-- Undo/Redo (masques par defaut) -->
                    <div class="travaux-undo-redo u-hide" id="travaux-undo-redo">
                        <button id="travaux-btn-undo" class="btn-icon" onclick="travauxAnnotation.annuler()" disabled title="Annuler (Ctrl+Z)">&#x21A9;</button>
                        <button id="travaux-btn-redo" class="btn-icon" onclick="travauxAnnotation.retablir()" disabled title="Rétablir (Ctrl+Y)">&#x21AA;</button>
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
                        ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${e.da}">${echapperHtml(e.nom + ', ' + e.prenom)} (${e.da})</option>`).join('')}
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

            <!-- Allegement -->
            <div class="travaux-archivage-carte">
                <h4>Alléger les travaux exportés</h4>
                <p class="texte-muted">Convertit les originaux exportés en fac-similés (NdG, 800px). Les annotations et évaluations sont conservées.</p>
                <button class="btn btn-secondaire" onclick="travauxArchivage.lancerAllegement()">Alléger les travaux exportés</button>
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

    /* ===============================
       PIPELINE HELPERS
       =============================== */

    /**
     * Genere la grille de miniatures de la zone d'entree
     * @param {Array} queue - File d'attente
     * @returns {string} HTML
     */
    function genererPreviewsEntree(queue) {
        let html = '<div class="pipeline-previews-grille">';
        queue.forEach((f, index) => {
            const thumb = f.thumbnailDataUrl;
            const icone = f.estPDF ? '&#x1F4C4;' : '&#x1F5BC;';
            const nomCourt = f.parseLea.nom
                ? f.parseLea.nom.substring(0, 10)
                : f.nomFichier.substring(0, 10);
            html += `<div class="pipeline-preview-mini" title="${echapperHtml(f.nomFichier)}">
                ${thumb ? `<img src="${thumb}" alt="">` : `<span style="font-size:1.5rem">${icone}</span>`}
                <span class="pipeline-mini-nom">${echapperHtml(nomCourt)}</span>
            </div>`;
        });
        html += '</div>';
        return html;
    }

    /**
     * Genere le resume de detection format (PDF vs images)
     * @param {Array} queue - File d'attente
     * @returns {string} HTML
     */
    function genererResumeDetection(queue) {
        const nbPDF = queue.filter(f => f.estPDF).length;
        const nbImages = queue.filter(f => f.estImage).length;
        let html = '<div class="pipeline-resume-detection">';
        if (nbPDF > 0) {
            html += `<div class="pipeline-resume-item">
                <span class="pipeline-resume-icone">&#x1F4C4;</span>
                <span>${nbPDF} PDF (prêts)</span>
            </div>`;
        }
        if (nbImages > 0) {
            html += `<div class="pipeline-resume-item">
                <span class="pipeline-resume-icone">&#x1F5BC;</span>
                <span>${nbImages} image(s)</span>
            </div>`;
        }
        html += '</div>';
        return html;
    }

    /**
     * Genere la section traitement (checklist d'optimisation)
     * @param {Array} queue - File d'attente
     * @param {Map} groupes - Groupes de documents
     * @returns {string} HTML
     */
    function genererSectionTraitement(queue, groupes) {
        const nbImages = queue.filter(f => f.estImage).length;
        const nbGroupes = Array.from(groupes.values()).filter(g => g.length > 1 && g.some(f => f.estImage)).length;

        // Detection images en paysage
        const imagesPaysage = queue.filter(f => f.estImage && f.largeurOriginale && f.hauteurOriginale && f.largeurOriginale > f.hauteurOriginale * 1.1);
        let alerteRotation = '';
        if (imagesPaysage.length > 0) {
            alerteRotation = `<div class="pipeline-alerte-rotation">&#x26A0; ${imagesPaysage.length} image(s) potentiellement en paysage — rotation recommandée</div>`;
        }

        let html = '<ul class="pipeline-checklist">';
        html += `<li><label><input type="checkbox" id="pipeline-opt-balance" checked> Balance des blancs auto</label></li>`;
        html += `<li><label><input type="checkbox" id="pipeline-opt-rotation" checked> Rotation (interactif)</label></li>`;
        html += `<li><label><input type="checkbox" id="pipeline-opt-dpi" checked> Uniformisation 200 DPI</label></li>`;
        html += `<li><label><input type="checkbox" id="pipeline-opt-doublons" checked> Détection doublons (manuel)</label></li>`;
        html += `<li><label><input type="checkbox" id="pipeline-opt-assemblage" checked> Assemblage PDF${nbGroupes > 0 ? ` (${nbGroupes} groupe(s))` : ''}</label></li>`;
        html += '</ul>';
        html += alerteRotation;

        html += `<div style="margin-top:10px">
            <button class="btn btn-principal" onclick="travauxUI.lancerTraitementPipeline()" ${nbImages === 0 ? 'disabled' : ''}>
                Lancer le traitement
            </button>
        </div>`;

        html += `<div class="pipeline-progression-container" id="pipeline-traitement-progression" style="display:none">
            <div class="pipeline-progression-barre" id="pipeline-traitement-barre"></div>
        </div>
        <div id="pipeline-traitement-texte" class="texte-muted"></div>`;

        return html;
    }

    /**
     * Genere la section d'identification (badges + dropdowns)
     * @param {Array} queue - File d'attente
     * @returns {string} HTML
     */
    function genererSectionIdentification(queue) {
        const fichiersCibles = queue.filter(f => f.pipelineStatut === 'pret' || f.pipelineStatut === 'identifie');
        if (fichiersCibles.length === 0 && queue.length > 0) {
            return '<p class="texte-muted">Les fichiers seront disponibles après le traitement.</p>';
        }
        if (queue.length === 0) {
            return '<p class="texte-muted">Aucun fichier en file.</p>';
        }

        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const productions = obtenirDonneesSelonMode(cle('productions'));

        let html = '<div class="pipeline-identification-liste">';

        queue.forEach((f, index) => {
            const badge = genererBadgePipeline(f);
            const etudiantNom = f.etudiantAssocie
                ? `${echapperHtml(f.etudiantAssocie.nom)}, ${echapperHtml(f.etudiantAssocie.prenom)}`
                : '';

            // Production associee
            const prod = productions.find(p => p.id === f.productionId);
            const prodNom = prod ? echapperHtml(prod.titre || prod.nom || prod.id) : '';

            html += `<div class="pipeline-identification-item">`;
            html += badge;

            if (f.pipelineStatut === 'identifie') {
                html += `<span class="pipeline-fichier-nom-lea">${prodNom} — ${etudiantNom}</span>`;
            } else {
                // Dropdown etudiant
                html += `<select class="form-select" onchange="travauxUI.associerEtudiantPipeline(${index}, this.value)" style="font-size:0.8rem;max-width:180px">
                    <option value="">-- Étudiant --</option>
                    ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${e.da}" ${f.etudiantDA === e.da ? 'selected' : ''}>${echapperHtml(e.nom + ', ' + e.prenom)}</option>`).join('')}
                </select>`;
                // Dropdown production
                html += `<select class="form-select" onchange="travauxUI.associerProductionPipeline(${index}, this.value)" style="font-size:0.8rem;max-width:180px">
                    <option value="">-- Production --</option>
                    ${productions.map(p => `<option value="${p.id}" ${f.productionId === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                </select>`;
            }

            html += `<button class="btn-supprimer-fichier" onclick="travauxImport.retirerFichier(${index}); travauxUI.rafraichirPipelineUI();" title="Retirer">&times;</button>`;
            html += `</div>`;
        });

        html += '</div>';

        return html;
    }

    /**
     * Genere le badge pipeline d'un fichier
     * @param {Object} fichier - Le fichier prepare
     * @returns {string} HTML du badge
     */
    function genererBadgePipeline(fichier) {
        switch (fichier.pipelineStatut) {
            case 'apercu':
                return '<span class="pipeline-badge pipeline-badge-a-optimiser">Aperçu</span>';
            case 'a-optimiser':
                return '<span class="pipeline-badge pipeline-badge-a-optimiser"><span class="pipeline-pastille pipeline-pastille-a-optimiser"></span> À optimiser</span>';
            case 'pret':
                return '<span class="pipeline-badge pipeline-badge-pret"><span class="pipeline-pastille pipeline-pastille-pret"></span> Prêt</span>';
            case 'identifie':
                return '<span class="pipeline-badge pipeline-badge-identifie">Identifié</span>';
            default:
                return '<span class="pipeline-badge">' + echapperHtml(fichier.pipelineStatut || '?') + '</span>';
        }
    }

    /**
     * Genere les boutons d'action du pipeline (importer)
     * @param {Array} queue - File d'attente
     * @returns {string} HTML
     */
    function genererBoutonsActionsPipeline(queue) {
        const tousIdentifies = queue.length > 0 && queue.every(f => f.pipelineStatut === 'identifie');
        return `
            <button class="btn btn-principal" onclick="travauxUI.lancerImportPipeline()" ${!tousIdentifies ? 'disabled title="Tous les fichiers doivent être identifiés"' : ''}>
                Importer ${queue.length} fichier(s)
            </button>
            <button class="btn btn-secondaire" onclick="travauxImport.viderFileDAttente(); travauxUI.afficherImport();">
                Annuler tout
            </button>`;
    }

    /**
     * Rafraichit l'interface pipeline sans remonter la drop zone
     */
    function rafraichirPipelineUI() {
        afficherImport();
    }

    /**
     * Met a jour la barre de progression du pipeline
     * @param {number} fait - Nombre fait
     * @param {number} total - Nombre total
     */
    function afficherProgressionPipeline(fait, total) {
        const conteneur = document.getElementById('pipeline-traitement-progression');
        const barre = document.getElementById('pipeline-traitement-barre');
        const texte = document.getElementById('pipeline-traitement-texte');

        if (conteneur) conteneur.style.display = '';
        if (barre) barre.style.width = Math.round((fait / total) * 100) + '%';
        if (texte) texte.textContent = `${fait}/${total} fichier(s) traités...`;
    }

    /**
     * Associe un etudiant a un fichier dans le pipeline
     * @param {number} index - Index dans la file
     * @param {string} da - DA de l'etudiant
     */
    function associerEtudiantPipeline(index, da) {
        const queue = travauxImport.obtenirFileDAttente();
        if (index < 0 || index >= queue.length) return;

        queue[index].etudiantDA = da;
        queue[index].etudiantAssocie = travauxImport.trouverEtudiantParDA(da);

        // Passer en identifie si etudiant + production
        if (queue[index].etudiantDA && queue[index].productionId &&
            (queue[index].pipelineStatut === 'pret' || queue[index].pipelineStatut === 'identifie')) {
            queue[index].pipelineStatut = 'identifie';
        } else if (queue[index].pipelineStatut === 'identifie') {
            queue[index].pipelineStatut = 'pret';
        }

        rafraichirPipelineUI();
    }

    /**
     * Associe une production a un fichier dans le pipeline
     * @param {number} index - Index dans la file
     * @param {string} productionId - ID de la production
     */
    function associerProductionPipeline(index, productionId) {
        const queue = travauxImport.obtenirFileDAttente();
        if (index < 0 || index >= queue.length) return;

        queue[index].productionId = productionId;

        // Passer en identifie si etudiant + production
        if (queue[index].etudiantDA && queue[index].productionId &&
            (queue[index].pipelineStatut === 'pret' || queue[index].pipelineStatut === 'identifie')) {
            queue[index].pipelineStatut = 'identifie';
        } else if (queue[index].pipelineStatut === 'identifie') {
            queue[index].pipelineStatut = 'pret';
        }

        rafraichirPipelineUI();
    }

    /**
     * Change la production globale du pipeline et applique aux fichiers sans production
     * @param {string} productionId - ID de la production
     */
    function changerProductionGlobalePipeline(productionId) {
        travauxImport.setProductionGlobale(productionId);
        const queue = travauxImport.obtenirFileDAttente();
        queue.forEach(f => {
            if (!f.productionId && productionId) {
                f.productionId = productionId;
            }
        });
        identifierAutoPipeline();
        rafraichirPipelineUI();
    }

    /**
     * Tente d'identifier automatiquement les fichiers via parseLea
     */
    function identifierAutoPipeline() {
        const queue = travauxImport.obtenirFileDAttente();
        const productions = obtenirDonneesSelonMode(cle('productions'));
        let modifies = 0;

        queue.forEach(f => {
            if (f.pipelineStatut === 'identifie') return;

            // Essayer de trouver l'etudiant par DA
            if (!f.etudiantAssocie && f.parseLea.da) {
                f.etudiantAssocie = travauxImport.trouverEtudiantParDA(f.parseLea.da);
                if (f.etudiantAssocie) f.etudiantDA = f.etudiantAssocie.da;
            }

            // Essayer de trouver la production par nom
            if (!f.productionId && f.parseLea.nomProduction) {
                const nomProd = f.parseLea.nomProduction.toLowerCase();
                const prodTrouvee = productions.find(p => {
                    const titre = (p.titre || p.nom || '').toLowerCase();
                    return nomProd && titre && (titre.includes(nomProd) || nomProd.includes(titre));
                });
                if (prodTrouvee) f.productionId = prodTrouvee.id;
            }

            // Passer en identifie si tout est present
            if (f.etudiantDA && f.productionId &&
                (f.pipelineStatut === 'pret' || f.pipelineStatut === 'a-optimiser' || f.pipelineStatut === 'apercu')) {
                if (f.pipelineStatut !== 'a-optimiser') {
                    f.pipelineStatut = 'identifie';
                }
                modifies++;
            }
        });

        rafraichirPipelineUI();
        if (modifies > 0) {
            console.log(`[Travaux-UI] Identification automatique: ${modifies} fichier(s) identifie(s)`);
        }
    }

    /**
     * Genere les boutons d'action de la file d'attente (legacy, garde pour compat)
     * Appele au rendu initial ET au rafraichissement apres drop
     * @returns {string} HTML
     */
    function genererBoutonsActions() {
        const queue = travauxImport.obtenirFileDAttente();
        const aDesImages = queue.some(f => f.estImage);
        return `
            <button class="btn btn-principal" onclick="travauxUI.lancerImport()">
                Importer ${queue.length} fichier(s)
            </button>
            ${aDesImages ? `
            <button class="btn btn-secondaire" onclick="travauxUI.ouvrirPreparation()" title="Préparer les images avant import (rotation, crop, perspective, luminosité)">
                Préparer les images
            </button>` : ''}
            <button class="btn btn-secondaire" onclick="travauxImport.viderFileDAttente(); travauxUI.afficherImport();">
                Annuler
            </button>`;
    }

    /**
     * Genere un badge compact pour un fichier importe
     * @param {Object} f - Le fichier
     * @returns {string} HTML
     */
    function genererBadgeFichierImporte(f) {
        const etudiant = travauxImport.trouverEtudiantParDA(f.etudiantDA);
        const nomEtudiant = etudiant
            ? `${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}`
            : (f.etudiantDA || 'Non associé');
        const icone = f.typeMIME === 'application/pdf' ? '&#x1F4C4;' : '&#x1F5BC;';
        return `<div class="travaux-badge-importe" onclick="travauxUI.ouvrirPreviewInline('${f.id}')" title="${echapperHtml(f.nomFichier)}">
        <span class="travaux-badge-icone">${icone}</span>
        <span class="travaux-badge-nom">${nomEtudiant}</span>
        <span class="travaux-badge-pill">Importé</span>
    </div>`;
    }

    /**
     * Genere la grille de fichiers importes, regroupes par production
     * @param {Array} fichiers - Les fichiers
     * @returns {string} HTML
     */
    function genererGrilleFichiers(fichiers) {
        if (fichiers.length === 0) return '';

        const productions = obtenirDonneesSelonMode(cle('productions'));

        // Grouper par productionId
        const groupes = {};
        fichiers.forEach(f => {
            const pid = f.productionId || '__aucune__';
            if (!groupes[pid]) groupes[pid] = [];
            groupes[pid].push(f);
        });

        let html = '<div class="travaux-grille-fichiers"><h4>Fichiers importés</h4>';

        // Afficher chaque production
        productions.forEach(p => {
            const g = groupes[p.id];
            if (!g || g.length === 0) return;
            html += `<h5 class="travaux-groupe-production-titre">${echapperHtml(p.titre || p.nom || p.id)} (${g.length})</h5>`;
            html += '<div class="travaux-badges-groupe">';
            g.forEach(f => { html += genererBadgeFichierImporte(f); });
            html += '</div>';
            delete groupes[p.id];
        });

        // Fichiers sans production
        const sansProduction = groupes['__aucune__'];
        if (sansProduction && sansProduction.length > 0) {
            html += `<h5 class="travaux-groupe-production-titre">Non associés (${sansProduction.length})</h5>`;
            html += '<div class="travaux-badges-groupe">';
            sansProduction.forEach(f => { html += genererBadgeFichierImporte(f); });
            html += '</div>';
        }

        html += '</div>';
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
            return '<p class="texte-muted" style="padding: 16px;">Aucun fichier importé</p>';
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

            // Badge cycle de vie
            let badge = '';
            if (f.blobStatut === 'facsimile') {
                badge = '<span class="travaux-badge-facsimile" title="Version allegee">FAC</span>';
            } else if (f.blobStatut === 'exporte') {
                badge = '<span class="travaux-badge-exporte" title="Exporte">EXP</span>';
            }

            html += `
                <div class="travaux-miniature${actif}" data-fichier-id="${f.id}" onclick="travauxUI.ouvrirFichier('${f.id}')">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<span>${icone}</span>`}
                        ${badge}
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

            // Badge cycle de vie
            let badge = '';
            if (f.blobStatut === 'facsimile') {
                badge = '<span class="travaux-badge-facsimile" title="Version allegee">FAC</span>';
            } else if (f.blobStatut === 'exporte') {
                badge = '<span class="travaux-badge-exporte" title="Exporte">EXP</span>';
            }

            html += `
                <div class="travaux-miniature travaux-miniature-virtuelle${actif}" data-fichier-id="${f.id}"
                     style="top: ${top}px; height: ${HAUTEUR_MINIATURE}px;"
                     onclick="travauxUI.ouvrirFichier('${f.id}')">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<span>${icone}</span>`}
                        ${badge}
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
        return [...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e =>
            `<option value="${e.da}">${echapperHtml(e.nom + ', ' + e.prenom)}</option>`
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
     * Lance l'import des fichiers en attente (legacy — utilise production globale)
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
     * Lance l'import pipeline — chaque fichier a deja sa production assignee
     */
    async function lancerImportPipeline() {
        const queue = travauxImport.obtenirFileDAttente();
        if (queue.length === 0) {
            afficherModalePipeline('Import', '<p>Aucun fichier à importer.</p>',
                [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
            return;
        }

        if (!queue.every(f => f.pipelineStatut === 'identifie')) {
            afficherModalePipeline('Import', '<p>Tous les fichiers doivent être identifiés avant l\'import.</p>',
                [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
            return;
        }

        // Verifier que les blobs sont disponibles (perdus apres refresh page)
        const sansBlob = queue.filter(f => !f.fichier);
        if (sansBlob.length > 0) {
            afficherModalePipeline('Fichiers expirés',
                `<p>${sansBlob.length} fichier(s) ne sont plus disponibles en mémoire (la page a été rechargée).</p>
                <p>Veuillez vider la file et re-déposer vos fichiers.</p>`,
                [{ label: 'Vider la file', classe: 'btn-principal', action: () => {
                    travauxImport.viderFileDAttente();
                    afficherImport();
                }}]);
            return;
        }

        const progression = document.getElementById('travaux-progression-import');
        if (progression) progression.classList.remove('u-hide');

        // Importer avec la productionId de chaque fichier individuel
        const resultat = await travauxImport.importerTous(null, (i, total) => {
            const pourcent = Math.round((i / total) * 100);
            const barre = document.getElementById('travaux-barre-progression');
            if (barre) barre.style.width = pourcent + '%';
            const texte = document.getElementById('travaux-texte-progression');
            if (texte) texte.textContent = `${i}/${total} fichier(s) importés...`;
        });

        if (progression) progression.classList.add('u-hide');

        afficherImport();

        afficherModalePipeline('Import terminé',
            `<p>${resultat.importes} fichier(s) importé(s)${resultat.erreurs > 0 ? `, ${resultat.erreurs} erreur(s)` : ''}.</p>
            <p class="pipeline-message-succes">Ces documents sont prêts pour l'annotation et l'évaluation.</p>`,
            [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
    }

    /**
     * Ouvre un fichier dans la visionneuse
     * @param {string} fichierId - ID du fichier
     */
    async function ouvrirFichier(fichierId) {
        // Naviguer vers l'onglet Annoter et évaluer si pas déjà dessus
        if (typeof afficherSousSection === 'function') {
            const sousSectionActive = document.querySelector('#evaluations-annoter.sous-section.active') ||
                                       document.querySelector('#evaluations-annoter.sous-section[style*="display: block"]');
            if (!sousSectionActive || sousSectionActive.offsetParent === null) {
                afficherSousSection('evaluations-annoter');
            }
        }

        // Toggle interne : masquer grille fichiers, afficher visionneuse
        const fichiersDiv = document.getElementById('evaluations-contenu-fichiers');
        const visDiv = document.getElementById('evaluations-contenu-visionneuse');
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (fichiersDiv) fichiersDiv.classList.add('u-hide');
        if (visDiv) visDiv.classList.remove('u-hide');
        if (evalDiv) evalDiv.classList.add('u-hide');
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

            // Boutons et badge cycle de vie
            const fichierOuvert = travauxVisionneuse.getFichierActuel();
            const badgeStatut = document.getElementById('travaux-badge-statut');
            const btnAlleger = document.getElementById('travaux-btn-alleger');
            const btnReimporter = document.getElementById('travaux-btn-reimporter');

            if (fichierOuvert) {
                const statut = fichierOuvert.blobStatut || 'present';

                // Badge
                if (badgeStatut) {
                    if (statut === 'facsimile') {
                        badgeStatut.textContent = 'Version allegee';
                        badgeStatut.className = 'travaux-badge-facsimile';
                        badgeStatut.classList.remove('u-hide');
                    } else if (statut === 'exporte') {
                        badgeStatut.textContent = 'Exporte';
                        badgeStatut.className = 'travaux-badge-exporte';
                        badgeStatut.classList.remove('u-hide');
                    } else {
                        badgeStatut.classList.add('u-hide');
                    }
                }

                // Bouton alleger : visible si exporte
                if (btnAlleger) {
                    if (statut === 'exporte') btnAlleger.classList.remove('u-hide');
                    else btnAlleger.classList.add('u-hide');
                }

                // Bouton reimporter : visible si facsimile
                if (btnReimporter) {
                    if (statut === 'facsimile') btnReimporter.classList.remove('u-hide');
                    else btnReimporter.classList.add('u-hide');
                }
            }

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
       PREPARATION DES IMAGES
       =============================== */

    /**
     * Supprime un fichier importe apres confirmation
     * @param {string} fichierId - ID du fichier
     */
    async function supprimerFichierImporte(fichierId) {
        if (!confirm('Supprimer ce fichier importé ?')) return;

        await travauxStockage.supprimerFichierTravail(fichierId);

        // Rafraichir la vue courante
        const sousSection = sousSectionActive;
        if (sousSection === 'evaluations-importer') {
            afficherImport();
        } else if (sousSection === 'evaluations-annoter') {
            afficherFichiers();
        }
    }

    /**
     * Ouvre le poste de preparation avec les fichiers en attente
     */
    function ouvrirPreparation() {
        const queue = travauxImport.obtenirFileDAttente();
        if (queue.length === 0) {
            alert('Aucun fichier en attente');
            return;
        }

        // Filtrer seulement les images (pas les PDF)
        const images = queue.filter(f => f.estImage);
        if (images.length === 0) {
            alert('Aucune image à préparer (les PDF ne nécessitent pas de préparation)');
            return;
        }

        travauxPreparation.ouvrir(queue, function() {
            rafraichirImportUI();
        });
    }

    /* ===============================
       TRAITEMENT PIPELINE (BATCH)
       =============================== */

    /**
     * Lance le traitement par lot des images dans le pipeline
     * Lit les checkboxes, traite par lots de 10, met a jour la progression
     */
    async function lancerTraitementPipeline() {
        const queue = travauxImport.obtenirFileDAttente();
        const images = queue.filter(f => f.pipelineStatut === 'a-optimiser');

        if (images.length === 0) {
            afficherModalePipeline('Traitement', '<p>Aucune image à traiter.</p>',
                [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
            return;
        }

        // Verifier que les blobs sont disponibles
        const sansBlob = images.filter(f => !f.fichier);
        if (sansBlob.length > 0) {
            afficherModalePipeline('Fichiers expirés',
                `<p>${sansBlob.length} image(s) ne sont plus disponibles en mémoire (la page a été rechargée).</p>
                <p>Veuillez vider la file et re-déposer vos fichiers.</p>`,
                [{ label: 'Vider la file', classe: 'btn-principal', action: () => {
                    travauxImport.viderFileDAttente();
                    afficherImport();
                }}]);
            return;
        }

        const optBalance = document.getElementById('pipeline-opt-balance')?.checked;
        const optRotation = document.getElementById('pipeline-opt-rotation')?.checked;
        const optDPI = document.getElementById('pipeline-opt-dpi')?.checked;
        const optDoublons = document.getElementById('pipeline-opt-doublons')?.checked;
        const optAssemblage = document.getElementById('pipeline-opt-assemblage')?.checked;

        // Si rotation cochee, ouvrir le mode interactif d'abord
        if (optRotation) {
            const imagesQueue = queue.filter(f => f.estImage);
            travauxPreparation.ouvrir(imagesQueue, function() {
                // Apres rotation, relancer le batch sans rotation
                document.getElementById('pipeline-opt-rotation').checked = false;
                lancerTraitementPipeline();
            });
            return;
        }

        // Si doublons cochee, afficher la modale de detection manuelle
        if (optDoublons) {
            afficherModaleDoublons(queue);
            return;
        }

        const BATCH_SIZE = 10;
        let traites = 0;
        const total = images.length;

        for (let i = 0; i < images.length; i += BATCH_SIZE) {
            const lot = images.slice(i, i + BATCH_SIZE);

            await Promise.all(lot.map(async (f) => {
                let blob = f.fichier;

                // Balance des blancs auto
                if (optBalance && typeof travauxPreparation.autoBalanceBlancs === 'function') {
                    try {
                        blob = await travauxPreparation.autoBalanceBlancs(blob);
                    } catch (e) {
                        console.warn('[Pipeline] Erreur balance blancs:', f.nomFichier, e);
                    }
                }

                // Uniformisation 200 DPI
                if (optDPI) {
                    try {
                        blob = await uniformiser200DPI(blob);
                    } catch (e) {
                        console.warn('[Pipeline] Erreur uniformisation DPI:', f.nomFichier, e);
                    }
                }

                f.fichier = blob;
                f.tailleFichier = blob.size;
                f.pipelineStatut = 'pret';
                traites++;

                afficherProgressionPipeline(traites, total);
            }));

            // Yield au navigateur entre chaque lot
            await new Promise(r => setTimeout(r, 0));
        }

        // Auto-identifier les fichiers dont le parseLea a reussi
        identifierAutoPipeline();

        // Assemblage PDF des groupes
        if (optAssemblage) {
            await assemblerGroupesPipeline(queue);
        }

        rafraichirPipelineUI();

        afficherModalePipeline('Traitement terminé',
            `<p>${traites} image(s) traitée(s) avec succès.</p>`,
            [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
    }

    /**
     * Uniformise une image a 200 DPI
     * Lettre (8.5"x11") : 1700x2200px max — si deux dimensions <= 2500px
     * Tabloid (11"x17") : 2200x3400px max — si une dimension > 2500px
     * @param {Blob} blob - Le blob image
     * @returns {Promise<Blob>} Le blob redimensionne
     */
    function uniformiser200DPI(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);

                let w = img.width;
                let h = img.height;

                // Determiner le format cible par seuil de dimension
                let maxW, maxH;
                if (w > 2500 || h > 2500) {
                    // Tabloid 11"x17" a 200 DPI
                    maxW = 2200;
                    maxH = 3400;
                } else {
                    // Lettre 8.5"x11" a 200 DPI
                    maxW = 1700;
                    maxH = 2200;
                }

                // Redimensionner proportionnellement si necessaire
                if (w <= maxW && h <= maxH) {
                    resolve(blob);
                    return;
                }

                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                canvas.toBlob(
                    (blobResult) => resolve(blobResult),
                    'image/jpeg',
                    0.88
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(blob);
            };

            img.src = url;
        });
    }

    /**
     * Assemble les groupes d'images en PDF via le pipeline
     * @param {Array} queue - File d'attente complete
     */
    async function assemblerGroupesPipeline(queue) {
        const groupes = travauxImport.regrouperParDocument();

        for (const [cle, fichiers] of groupes) {
            // Seulement les groupes de >= 2 images
            const images = fichiers.filter(f => f.estImage);
            if (images.length < 2) continue;

            try {
                const pdfBlob = await travauxImport.assemblerPDFGroupe(images);

                // Remplacer les images par un seul PDF dans la queue
                const premierFichier = images[0];
                const indexPremier = queue.indexOf(premierFichier);

                // Retirer tous les fichiers du groupe sauf le premier
                for (let i = images.length - 1; i >= 1; i--) {
                    const idx = queue.indexOf(images[i]);
                    if (idx !== -1) queue.splice(idx, 1);
                }

                // Transformer le premier en PDF
                if (indexPremier !== -1) {
                    const f = queue[queue.indexOf(premierFichier)] || premierFichier;
                    f.fichier = pdfBlob;
                    f.tailleFichier = pdfBlob.size;
                    f.typeMIME = 'application/pdf';
                    f.estPDF = true;
                    f.estImage = false;
                    f.pipelineStatut = 'pret';
                    f.nomFichier = f.nomFichier.replace(/\.[^.]+$/, '.pdf');

                    // Regenerer la thumbnail
                    try {
                        const result = await travauxStockage.genererMiniaturePDF(pdfBlob);
                        f.thumbnailDataUrl = result.thumbnail;
                        f.nombrePages = result.nombrePages;
                    } catch (e) {}
                }

                console.log(`[Pipeline] Groupe "${cle}" assemble : ${images.length} images → 1 PDF`);
            } catch (e) {
                console.error(`[Pipeline] Erreur assemblage groupe "${cle}":`, e);
            }
        }
    }

    /**
     * Affiche une modale simple de detection manuelle de doublons
     * @param {Array} queue - File d'attente
     */
    function afficherModaleDoublons(queue) {
        const groupes = travauxImport.regrouperParDocument();
        const groupesMultiples = Array.from(groupes.entries()).filter(([, f]) => f.length > 1);

        if (groupesMultiples.length === 0) {
            afficherModalePipeline(
                'Aucun doublon',
                '<p>Aucun doublon potentiel détecté.</p>',
                [{ label: 'OK', classe: 'btn-principal', action: () => {
                    document.getElementById('pipeline-opt-doublons').checked = false;
                    lancerTraitementPipeline();
                }}]
            );
            return;
        }

        let html = '<div class="modal-section"><p>Cochez les fichiers à supprimer :</p>';

        groupesMultiples.forEach(([cleGroupe, fichiers]) => {
            html += `<div style="margin-bottom:16px"><strong>${echapperHtml(cleGroupe)}</strong>`;
            fichiers.forEach((f) => {
                const idx = queue.indexOf(f);
                html += `<div style="padding:4px 0"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" class="doublon-check" data-index="${idx}"> ${echapperHtml(f.nomFichier)} (${travauxStockage.formaterTaille(f.tailleFichier)})</label></div>`;
            });
            html += '</div>';
        });
        html += '</div>';

        afficherModalePipeline(
            'Detection de doublons',
            html,
            [
                { label: 'Supprimer et continuer', classe: 'btn-principal', action: (overlay) => {
                    const checks = overlay.querySelectorAll('.doublon-check:checked');
                    const indices = Array.from(checks).map(c => parseInt(c.dataset.index)).sort((a, b) => b - a);
                    indices.forEach(idx => travauxImport.retirerFichier(idx));
                    document.getElementById('pipeline-opt-doublons').checked = false;
                    lancerTraitementPipeline();
                }},
                { label: 'Annuler', classe: 'btn-secondaire', action: () => {
                    document.getElementById('pipeline-opt-doublons').checked = false;
                    lancerTraitementPipeline();
                }}
            ]
        );
    }

    /**
     * Affiche une modale selon le design system (.modal-overlay, .modal-contenu, etc.)
     * @param {string} titre - Titre de la modale
     * @param {string} contenuHTML - Contenu HTML du corps
     * @param {Array} boutons - [{label, classe, action(overlay)}]
     */
    function afficherModalePipeline(titre, contenuHTML, boutons) {
        // Retirer une modale existante si deja presente
        const existante = document.getElementById('pipeline-modal-overlay');
        if (existante) existante.remove();

        const overlay = document.createElement('div');
        overlay.id = 'pipeline-modal-overlay';
        overlay.className = 'modal-overlay actif';

        const boutonsHTML = boutons.map((b, i) =>
            `<button class="btn ${b.classe}" data-btn-index="${i}">${echapperHtml(b.label)}</button>`
        ).join('');

        overlay.innerHTML = `
            <div class="modal-contenu modal-compact">
                <button class="modal-fermer" id="pipeline-modal-fermer">&times;</button>
                <h3 class="modal-titre">${echapperHtml(titre)}</h3>
                ${contenuHTML}
                <div class="modal-actions">
                    ${boutonsHTML}
                </div>
            </div>`;

        document.body.appendChild(overlay);

        // Fermer via le X
        document.getElementById('pipeline-modal-fermer').onclick = () => overlay.remove();

        // Fermer en cliquant l'overlay (pas le contenu)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        // Brancher les boutons
        boutons.forEach((b, i) => {
            const btn = overlay.querySelector(`[data-btn-index="${i}"]`);
            if (btn) {
                btn.onclick = () => {
                    if (b.action) b.action(overlay);
                    overlay.remove();
                };
            }
        });
    }

    /* ===============================
       ACTIONS CYCLE DE VIE
       =============================== */

    /**
     * Allege un fichier specifique (exporte → fac-simile)
     * @param {string} fichierId
     */
    async function allegerFichier(fichierId) {
        const ok = await travauxStockage.convertirEnFacsimile(fichierId);
        if (ok) {
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Fichier allégé en fac-similé');
            }
            rafraichirUI();
        } else {
            alert('Erreur lors de l\'allègement');
        }
    }

    /**
     * Change la production associee a un fichier deja importe
     * @param {string} fichierId - ID du fichier
     * @param {string} productionId - Nouvel ID de production
     */
    function changerProductionFichier(fichierId, productionId) {
        const ok = travauxStockage.mettreAJourFichier(fichierId, { productionId: productionId });
        if (ok) {
            console.log('[Travaux-UI] Production mise a jour pour', fichierId, '→', productionId);
        }
    }

    /**
     * Lance le reimport d'un fichier (fac-simile → original)
     * @param {string} fichierId
     */
    function reimporterFichier(fichierId) {
        travauxImport.reimporterFichier(fichierId);
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

        // Toggler le panneau d'évaluation dans l'onglet Annoter et évaluer
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (evalDiv) {
            const estVisible = !evalDiv.classList.contains('u-hide');
            if (estVisible) {
                evalDiv.classList.add('u-hide');
                return;
            }
            evalDiv.classList.remove('u-hide');
        }

        // Pre-remplir le formulaire d'evaluation avec retry robuste
        preRemplirEvaluation(da, productionId);
    }

    /**
     * Pre-remplit les selects etudiant/production avec une boucle de retry
     * @param {string} da - DA de l'etudiant
     * @param {string} productionId - ID de la production
     */
    function preRemplirEvaluation(da, productionId) {
        let essais = 0;
        const MAX_ESSAIS = 10;
        const INTERVALLE = 150;

        function tentative() {
            essais++;
            const selectEtudiant = document.getElementById('selectEtudiantEval');

            if (!selectEtudiant) {
                if (essais < MAX_ESSAIS) { setTimeout(tentative, INTERVALLE); }
                return;
            }

            // Selectionner l'etudiant
            selectEtudiant.value = da;
            if (typeof chargerEvaluationsEtudiant === 'function') {
                chargerEvaluationsEtudiant();
            }

            // Attendre que l'option production apparaisse dans le select
            attendreOptionProduction(productionId);
        }

        function attendreOptionProduction(prodId) {
            let essaisProd = 0;

            function tenterProduction() {
                essaisProd++;
                const selectProduction = document.getElementById('selectProduction1');
                if (!selectProduction) {
                    if (essaisProd < MAX_ESSAIS) { setTimeout(tenterProduction, INTERVALLE); }
                    return;
                }

                // Verifier que l'option existe dans le select
                const optionExiste = Array.from(selectProduction.options).some(o => o.value === prodId);
                if (!optionExiste && essaisProd < MAX_ESSAIS) {
                    setTimeout(tenterProduction, INTERVALLE);
                    return;
                }

                if (optionExiste) {
                    selectProduction.value = prodId;
                    selectProduction.dispatchEvent(new Event('change'));
                }
            }

            setTimeout(tenterProduction, INTERVALLE);
        }

        setTimeout(tentative, INTERVALLE);
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

        // Masquer la visionneuse standard pour eviter les conflits d'IDs canvas
        const visStandard = document.getElementById('evaluations-contenu-visionneuse');
        if (visStandard) visStandard.classList.add('u-hide');

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
                    <button id="travaux-split-btn-page-prec" class="btn-icon" onclick="travauxVisionneuse.pagePrecedente()" disabled>&lt;</button>
                    <span id="travaux-indicateur-page">-- / --</span>
                    <button id="travaux-split-btn-page-suiv" class="btn-icon" onclick="travauxVisionneuse.pageSuivante()" disabled>&gt;</button>
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
            case 'evaluations-importer':
                afficherImport();
                break;
            case 'evaluations-annoter':
                const visDiv = document.getElementById('evaluations-contenu-visionneuse');
                if (visDiv && !visDiv.classList.contains('u-hide')) {
                    afficherVisionneuse();
                } else {
                    afficherFichiers();
                }
                break;
            case 'evaluations-exporter':
                afficherArchivage();
                break;
        }
    }

    /**
     * Rafraichit la zone d'import (apres ajout/retrait de fichiers)
     * En mode pipeline, re-rend toute la page
     */
    function rafraichirImportUI() {
        // Mode pipeline : re-rendre tout
        if (document.querySelector('.pipeline-page')) {
            rafraichirPipelineUI();
            return;
        }

        const conteneurAttente = document.getElementById('travaux-file-attente-container');
        if (conteneurAttente) {
            conteneurAttente.innerHTML = travauxImport.genererHTMLFileDAttente();
        }

        const actions = document.querySelector('.travaux-import-actions');
        if (actions) {
            const queueLength = travauxImport.obtenirFileDAttente().length;
            toggleDisplay(actions, queueLength > 0);
            actions.innerHTML = genererBoutonsActions();
        }
    }

    /**
     * Retour a la grille de fichiers depuis la visionneuse (onglet Annoter)
     */
    function retourFichiers() {
        const fichiersDiv = document.getElementById('evaluations-contenu-fichiers');
        const visDiv = document.getElementById('evaluations-contenu-visionneuse');
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (fichiersDiv) fichiersDiv.classList.remove('u-hide');
        if (visDiv) visDiv.classList.add('u-hide');
        if (evalDiv) evalDiv.classList.add('u-hide');
        afficherFichiers();
    }

    /**
     * Retour a la vue import (compat legacy)
     */
    function retourImport() {
        retourFichiers();
    }

    // Fonctions globales pour les callbacks de rafraichissement
    window.rafraichirImportTravaux = rafraichirImportUI;
    window.rafraichirPipelineUI = rafraichirPipelineUI;

    /* ===============================
       PREVIEW INLINE (Apercu dans la page)
       =============================== */

    /**
     * Ouvre un apercu Quick Look (overlay plein ecran, style macOS)
     * @param {string} fichierId - ID du fichier
     */
    async function ouvrirPreviewInline(fichierId) {
        try {
            const blob = await travauxStockage.recupererBlob(fichierId);
            if (!blob) {
                console.warn('[Travaux-UI] Blob introuvable pour preview:', fichierId);
                return;
            }

            const fichier = travauxStockage.obtenirFichierParId(fichierId);
            const estPDF = fichier && fichier.typeMIME === 'application/pdf';

            const state = {
                fichierId: fichierId,
                blob: blob,
                estPDF: estPDF,
                pageActuelle: 1,
                totalPages: 1,
                pdfDoc: null
            };

            if (estPDF && typeof pdfjsLib !== 'undefined') {
                const arrayBuffer = await blob.arrayBuffer();
                state.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                state.totalPages = state.pdfDoc.numPages;
            }

            // Retirer un overlay existant (nullifie _previewInlineState)
            fermerPreviewInline();

            window._previewInlineState = state;

            const overlay = document.createElement('div');
            overlay.id = 'pipeline-preview-overlay';
            overlay.className = 'preview-quicklook-overlay';

            // Fermer en cliquant le fond
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) fermerPreviewInline();
            });

            overlay.innerHTML = `
                <div class="preview-quicklook-contenu">
                    <canvas id="pipeline-preview-canvas"></canvas>
                    ${state.totalPages > 1 ? `
                    <button class="preview-quicklook-fleche preview-quicklook-prec" id="pipeline-prev-btn" onclick="event.stopPropagation(); travauxUI.previewPagePrec()">&#x25C0;</button>
                    <button class="preview-quicklook-fleche preview-quicklook-suiv" id="pipeline-next-btn" onclick="event.stopPropagation(); travauxUI.previewPageSuiv()">&#x25B6;</button>
                    <span class="preview-quicklook-page" id="pipeline-preview-page-info">1 / ${state.totalPages}</span>
                    ` : ''}
                </div>
            `;

            document.body.appendChild(overlay);

            // Fermer avec Echap
            overlay._onKeyDown = (e) => {
                if (e.key === 'Escape') fermerPreviewInline();
                if (e.key === 'ArrowLeft') previewPagePrec();
                if (e.key === 'ArrowRight') previewPageSuiv();
            };
            document.addEventListener('keydown', overlay._onKeyDown);

            await rendrePagePreview(state);

        } catch (e) {
            console.error('[Travaux-UI] Erreur preview inline:', e);
        }
    }

    /**
     * Rend la page courante du preview Quick Look
     */
    async function rendrePagePreview(state) {
        const canvas = document.getElementById('pipeline-preview-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (state.estPDF && state.pdfDoc) {
            const page = await state.pdfDoc.getPage(state.pageActuelle);
            const scale = Math.min(1.5, (window.innerHeight * 0.85) / page.getViewport({ scale: 1 }).height);
            const viewport = page.getViewport({ scale: scale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        } else {
            const img = new Image();
            const url = URL.createObjectURL(state.blob);
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });
            const maxH = window.innerHeight * 0.85;
            const maxW = window.innerWidth * 0.85;
            const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
            canvas.width = Math.round(img.naturalWidth * ratio);
            canvas.height = Math.round(img.naturalHeight * ratio);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
        }

        const pageInfo = document.getElementById('pipeline-preview-page-info');
        if (pageInfo) pageInfo.textContent = `${state.pageActuelle} / ${state.totalPages}`;

        const prevBtn = document.getElementById('pipeline-prev-btn');
        const nextBtn = document.getElementById('pipeline-next-btn');
        if (prevBtn) prevBtn.style.opacity = state.pageActuelle <= 1 ? '0.3' : '';
        if (nextBtn) nextBtn.style.opacity = state.pageActuelle >= state.totalPages ? '0.3' : '';
    }

    /**
     * Page precedente
     */
    function previewPagePrec() {
        const state = window._previewInlineState;
        if (!state || state.pageActuelle <= 1) return;
        state.pageActuelle--;
        rendrePagePreview(state);
    }

    /**
     * Page suivante
     */
    function previewPageSuiv() {
        const state = window._previewInlineState;
        if (!state || state.pageActuelle >= state.totalPages) return;
        state.pageActuelle++;
        rendrePagePreview(state);
    }

    /**
     * Ferme le preview Quick Look
     */
    function fermerPreviewInline() {
        const overlay = document.getElementById('pipeline-preview-overlay');
        if (overlay) {
            if (overlay._onKeyDown) document.removeEventListener('keydown', overlay._onKeyDown);
            overlay.remove();
        }
        window._previewInlineState = null;
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxUI = {
        initialiser: initialiserModuleTravaux,
        // Sous-sections
        afficherImport: afficherImport,
        afficherFichiers: afficherFichiers,
        afficherVisionneuse: afficherVisionneuse,
        afficherArchivage: afficherArchivage,
        // Actions
        configurerFSAPI: configurerFSAPI,
        lancerImport: lancerImport,
        ouvrirFichier: ouvrirFichier,
        filtrerParEtudiant: filtrerParEtudiant,
        toggleSidebar: toggleSidebar,
        retourFichiers: retourFichiers,
        retourImport: retourImport,
        // Pipeline
        lancerTraitementPipeline: lancerTraitementPipeline,
        lancerImportPipeline: lancerImportPipeline,
        associerEtudiantPipeline: associerEtudiantPipeline,
        associerProductionPipeline: associerProductionPipeline,
        identifierAutoPipeline: identifierAutoPipeline,
        changerProductionGlobalePipeline: changerProductionGlobalePipeline,
        togglePipelineEtapes: togglePipelineEtapes,
        rafraichirPipelineUI: rafraichirPipelineUI,
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
        // Preparation
        ouvrirPreparation: ouvrirPreparation,
        // Suppression
        supprimerFichierImporte: supprimerFichierImporte,
        // Cycle de vie
        allegerFichier: allegerFichier,
        reimporterFichier: reimporterFichier,
        // Association production
        changerProductionFichier: changerProductionFichier,
        // Preview inline
        ouvrirPreviewInline: ouvrirPreviewInline,
        previewPagePrec: previewPagePrec,
        previewPageSuiv: previewPageSuiv,
        fermerPreviewInline: fermerPreviewInline,
        // Rafraichissement
        rafraichirUI: rafraichirUI
    };

    // Alias pour navigation.js
    window.initialiserModuleTravaux = initialiserModuleTravaux;

})();
