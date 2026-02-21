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
    let modeCourant = 'annoter'; // 'annoter' | 'evaluer'

    function sauvegarderEtatSession() {
        const fichier = travauxVisionneuse.getFichierActuel();
        if (fichier) sessionStorage.setItem('travaux-dernier-fichier', fichier.id);
        sessionStorage.setItem('travaux-mode-courant', modeCourant);
    }

    function restaurerEtatSession() {
        const modeSauvegarde = sessionStorage.getItem('travaux-mode-courant');
        if (modeSauvegarde === 'annoter' || modeSauvegarde === 'evaluer') {
            modeCourant = modeSauvegarde;
        }
        return sessionStorage.getItem('travaux-dernier-fichier');
    }

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
            const etaitEnModeEvaluer = (modeCourant === 'evaluer');
            // Fermer les palettes eval AVANT rafraichirUI pour sauver les panneaux
            // (rafraichirUI → afficherFichiers détruit le conteneur document)
            if (document.getElementById('travaux-palette-eval-gauche')) {
                fermerModeEvaluation();
            }
            rafraichirUI();
            // Restaurer le mode Évaluer si c'était le mode actif avant navigation
            if (etaitEnModeEvaluer) {
                const fichier = travauxVisionneuse.getFichierActuel();
                if (fichier && fichier.etudiantDA && fichier.productionId) {
                    setTimeout(() => {
                        // Forcer la réouverture car basculerMode vérifie mode === modeCourant
                        modeCourant = 'annoter';
                        basculerMode('evaluer');
                    }, 200);
                }
            }
            return;
        }

        console.log('[Travaux-UI] Initialisation du module Travaux...');

        // Initialiser les sous-modules
        await travauxStockage.initialiser();
        travauxVisionneuse.initialiser();
        travauxAnnotation.initialiser();

        moduleInitialise = true;
        console.log('[Travaux-UI] Module Travaux initialise');

        const fichierRestaure = restaurerEtatSession();
        if (fichierRestaure) {
            const fichiers = travauxStockage.obtenirFichiersTravaux();
            if (fichiers.some(f => f.id === fichierRestaure)) {
                setTimeout(() => {
                    ouvrirFichier(fichierRestaure);
                    // Si le mode sauvegardé était "evaluer", le restaurer après ouverture du fichier
                    if (modeCourant === 'evaluer') {
                        setTimeout(() => basculerMode('evaluer'), 500);
                    }
                }, 200);
            }
        }

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

        const nbImages = queue.filter(f => f.estImage).length;

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

                ${zeroStateHTML}

                <!-- Pipeline -->
                <div class="pipeline-etapes-groupe" id="pipeline-etapes-groupe">
                    <div class="pipeline-section-titre"></div>
                    <div class="pipeline-etapes-contenu">

                    <!-- ETAPE 1 : Zone d'entree -->
                    <div class="pipeline-etape">
                        <div class="pipeline-etape-header">
                            <span class="pipeline-etape-numero">1</span>
                            <span class="pipeline-etape-titre">Sélection des fichiers</span>
                        </div>
                        <div id="travaux-drop-zone" class="travaux-drop-zone">
                            <div class="travaux-drop-zone-contenu">
                                <div class="travaux-drop-zone-icone">&#x1F4C1;</div>
                                <p>Glissez vos fichiers ici</p>
                                <p class="texte-muted">PDF, JPEG, PNG, HEIC — ou cliquez pour parcourir</p>
                            </div>
                        </div>
                    </div>

                    ${queue.length > 0 ? `
                    <div class="pipeline-connecteur"></div>

                    <!-- ETAPE 2 : Fichiers deposes (3 colonnes) -->
                    <div class="pipeline-etape">
                        <div class="pipeline-etape-header">
                            <span class="pipeline-etape-numero">2</span>
                            <span class="pipeline-etape-titre">Optimisation</span>
                            <span class="pipeline-etape-compteur">${nbImages} image(s)</span>
                        </div>
                        ${genererEtape2Colonnes(queue, groupes)}
                    </div>
                    ` : ''}

                    </div><!-- /pipeline-etapes-contenu -->
                </div><!-- /pipeline-etapes-groupe -->

                <!-- Section fichiers importes (toujours visible) -->
                <div class="pipeline-section-importes">
                    <h4>Fichiers importés (${fichiersTravaux.length})${stats.nombre > 0 ? ` <span class="texte-muted u-texte-petit">— ${stats.tailleFormatee} · ${fsapiActif ? 'Disque local' : 'IndexedDB'}</span>` : ''}</h4>
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

        // Lancer les previews apres le rendu si des fichiers sont en queue
        if (queue.length > 0) {
            mettreAJourPreviewsPipeline();
        }
    }

    /**
     * Affiche la grille de fichiers dans l'onglet Annoter et évaluer
     * État initial : sélection de fichier pour annotation
     */
    function afficherFichiers() {
        const conteneur = document.getElementById('evaluations-contenu-fichiers');
        if (!conteneur) return;

        conteneur.classList.remove('u-hide');
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
            <div class="conteneur travaux-fichiers-compact">
                ${genererGrilleFichiers(fichiersTravaux, 'ouvrirFichier')}
            </div>`;

        // Rendre la visionneuse permanente sous les badges
        afficherVisionneuse();
    }

    /**
     * Affiche la sous-section Visionneuse
     */
    function afficherVisionneuse() {
        // Eviter de re-creer si deja present
        if (document.getElementById('travaux-conteneur-document')) return;

        const conteneur = document.getElementById('evaluations-contenu-fichiers');
        if (!conteneur) return;

        const visionDiv = document.createElement('div');
        visionDiv.className = 'travaux-visionneuse-layout';
        visionDiv.innerHTML = `
                <div class="travaux-zone-document" id="travaux-conteneur-document">

                    <!-- Toolbar -->
                    <div class="travaux-toolbar">
                        <div class="travaux-toolbar-inner">
                            <!-- GAUCHE : navigation pages -->
                            <div class="travaux-toolbar-gauche">
                                <button id="travaux-btn-page-prec" class="travaux-btn-nav" onclick="travauxVisionneuse.pagePrecedente()" disabled title="Page précédente">&#x2190;</button>
                                <span id="travaux-indicateur-page">-- / --</span>
                                <button id="travaux-btn-page-suiv" class="travaux-btn-nav" onclick="travauxVisionneuse.pageSuivante()" disabled title="Page suivante">&#x2192;</button>
                            </div>

                            <!-- CENTRE : badge étudiant -->
                            <div class="travaux-toolbar-centre">
                                <span id="travaux-badge-fichier-actif" class="u-hide"></span>
                            </div>

                            <!-- DROITE : zoom + séparateur + actions -->
                            <div class="travaux-toolbar-droite">
                                <span id="travaux-indicateur-zoom" class="travaux-zoom-info">100%</span>
                                <button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoomPleineLargeur()" title="Ajuster à la largeur">Largeur</button>
                                <button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoomPleineHauteur()" title="Ajuster à la hauteur">Hauteur</button>
                                <button class="travaux-btn-zoom" onclick="travauxVisionneuse.zoom100()" title="Zoom 100%">100%</button>
                                <button class="travaux-btn-zoom" onclick="travauxVisionneuse.recentrerVue()" title="Recentrer la vue">Recentrer</button>
                                <span class="travaux-separateur"></span>
                                <button id="travaux-btn-annoter" class="travaux-btn-action actif" onclick="travauxUI.basculerMode('annoter')">Annoter</button>
                                <button id="travaux-btn-evaluer" class="travaux-btn-action travaux-btn-action-vert u-hide" onclick="travauxUI.basculerMode('evaluer')" title="Évaluer cette production">Évaluer</button>
                                <button id="travaux-btn-alleger" class="travaux-btn-action u-hide" onclick="travauxUI.allegerFichier(travauxVisionneuse.getFichierActuel()?.id)" title="Alléger ce fichier">Alléger</button>
                                <button id="travaux-btn-reimporter" class="travaux-btn-action u-hide" onclick="travauxUI.reimporterFichier(travauxVisionneuse.getFichierActuel()?.id)" title="Re-importer l'original">Re-importer</button>
                            </div>
                        </div>
                    </div>

                    <!-- Canvas container -->
                    <div class="travaux-canvas-container" id="travaux-canvas-container">
                        <div class="travaux-canvas-wrapper" id="travaux-canvas-wrapper">
                            <canvas id="travaux-canvas-document"></canvas>
                            <canvas id="travaux-canvas-surligneur" class="u-hide" style="pointer-events:none;"></canvas>
                            <canvas id="travaux-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>
                        </div>
                        <div id="travaux-placeholder-visionneuse" class="travaux-placeholder">
                            <p>Cliquez sur un fichier ci-dessus pour l'ouvrir</p>
                        </div>
                    </div>

                    <!-- Palettes flottantes (annotation, tampons, evaluation) inserees dynamiquement par JS -->
                </div>
        `;
        conteneur.appendChild(visionDiv);

        // Configurer la visionneuse
        const conteneurDoc = document.getElementById('travaux-conteneur-document');
        travauxVisionneuse.setConteneur(conteneurDoc);

        // Gestes zoom (pinch iPad / trackpad Mac)
        const canvasContainer = document.getElementById('travaux-canvas-container');
        travauxVisionneuse.configurerGestesZoom(canvasContainer);

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

        const fichiersTravaux = travauxStockage.obtenirFichiersTravaux();

        conteneur.innerHTML = `
            <h3>Archivage des travaux</h3>
            <p class="texte-muted">${stats.nombre} fichier(s) en stock (${stats.tailleFormatee})</p>

            ${genererGrilleFichiers(fichiersTravaux, 'ouvrirPreviewInline')}

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
     * Calcule les dimensions cibles apres uniformisation 200 DPI
     * Reprend la logique de uniformiser200DPI() sans toucher aux pixels
     * @param {Object} f - Fichier prepare
     * @returns {{w: number, h: number}} Dimensions cibles
     */
    function calculerDimensionsCibles(f) {
        if (f.estPDF || !f.largeurOriginale || !f.hauteurOriginale) {
            return { w: 0, h: 0 };
        }

        const optDPI = document.getElementById('pipeline-opt-dpi')?.checked;
        if (!optDPI) {
            return { w: f.largeurOriginale, h: f.hauteurOriginale };
        }

        let w = f.largeurOriginale;
        let h = f.hauteurOriginale;

        let maxW, maxH;
        if (w > 2500 || h > 2500) {
            maxW = 2200; maxH = 3400;
        } else {
            maxW = 1700; maxH = 2200;
        }

        if (w <= maxW && h <= maxH) {
            return { w, h };
        }

        const ratio = Math.min(maxW / w, maxH / h);
        return { w: Math.round(w * ratio), h: Math.round(h * ratio) };
    }

    /**
     * Estime la taille fichier apres traitement
     * JPEG 0.88 ≈ 0.3 bytes/pixel. PDF : taille inchangee.
     * @param {number} w - Largeur cible
     * @param {number} h - Hauteur cible
     * @param {Object} f - Fichier prepare
     * @returns {number} Taille estimee en octets
     */
    function estimerTailleFichier(w, h, f) {
        if (f.estPDF || w === 0 || h === 0) {
            return f.tailleFichier;
        }
        return Math.round(w * h * 0.3);
    }

    /**
     * Genere un thumbnail de preview avec effets de traitement appliques
     * @param {Object} f - Fichier prepare
     * @param {number} index - Index dans la queue
     */
    async function genererPreviewThumbnail(f, index) {
        const conteneur = document.getElementById('pipeline-preview-' + index);
        if (!conteneur) return;

        if (f.estPDF) {
            if (f.thumbnailDataUrl) {
                conteneur.innerHTML = `<img src="${f.thumbnailDataUrl}" alt="">`;
            } else {
                conteneur.innerHTML = '<span class="pipeline-icone-placeholder">&#x1F4C4;</span>';
            }
            return;
        }

        // Utiliser le blob original pour une preview de qualite
        const source = f.fichier || null;
        if (!source && !f.thumbnailDataUrl) {
            conteneur.innerHTML = '<span class="pipeline-icone-placeholder">&#x1F5BC;</span>';
            return;
        }

        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                if (source) {
                    const url = URL.createObjectURL(source);
                    img._blobUrl = url;
                    img.src = url;
                } else {
                    img.src = f.thumbnailDataUrl;
                }
            });
            if (img._blobUrl) URL.revokeObjectURL(img._blobUrl);

            // Preview a 400px max pour une bonne nettete
            const maxPreviewW = 400;
            const scale = Math.min(1, maxPreviewW / img.width);
            const cw = Math.round(img.width * scale);
            const ch = Math.round(img.height * scale);

            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, cw, ch);

            // Appliquer balance des blancs si checkbox cochee
            const optBalance = document.getElementById('pipeline-opt-balance')?.checked;
            if (optBalance) {
                const imgData = ctx.getImageData(0, 0, cw, ch);
                const d = imgData.data;
                const totalPixels = d.length / 4;

                const luminosites = new Float32Array(totalPixels);
                for (let i = 0; i < totalPixels; i++) {
                    const idx = i * 4;
                    luminosites[i] = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
                }

                const sorted = Float32Array.from(luminosites).sort();
                const seuil = sorted[Math.floor(totalPixels * 0.95)];

                let sumR = 0, sumG = 0, sumB = 0, count = 0;
                for (let i = 0; i < totalPixels; i++) {
                    if (luminosites[i] >= seuil) {
                        const idx = i * 4;
                        sumR += d[idx];
                        sumG += d[idx + 1];
                        sumB += d[idx + 2];
                        count++;
                    }
                }

                if (count > 0) {
                    const rFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(sumR / count, 1)));
                    const gFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(sumG / count, 1)));
                    const bFactor = Math.max(0.5, Math.min(2.0, 255 / Math.max(sumB / count, 1)));

                    for (let i = 0; i < d.length; i += 4) {
                        d[i]     = Math.min(255, Math.round(d[i]     * rFactor));
                        d[i + 1] = Math.min(255, Math.round(d[i + 1] * gFactor));
                        d[i + 2] = Math.min(255, Math.round(d[i + 2] * bFactor));
                    }
                    ctx.putImageData(imgData, 0, 0);
                }
            }

            const imgResult = document.createElement('img');
            imgResult.src = canvas.toDataURL('image/jpeg', 0.92);
            conteneur.innerHTML = '';
            conteneur.appendChild(imgResult);
        } catch (e) {
            console.warn('[Pipeline] Erreur preview thumbnail:', f.nomFichier, e);
            conteneur.innerHTML = '<span class="pipeline-icone-placeholder">&#x1F5BC;</span>';
        }
    }

    /**
     * Met a jour les previews et les infos de la colonne droite (debounced)
     */
    let _previewTimer = null;
    function mettreAJourPreviewsPipeline() {
        if (_previewTimer) clearTimeout(_previewTimer);
        _previewTimer = setTimeout(_mettreAJourPreviewsPipelineImpl, 300);
    }

    function _mettreAJourPreviewsPipelineImpl() {
        const queue = travauxImport.obtenirFileDAttente();

        queue.forEach((f, index) => {
            // Mettre a jour resolution cible et taille estimee
            const dims = calculerDimensionsCibles(f);
            const tailleEst = estimerTailleFichier(dims.w, dims.h, f);

            const resEl = document.getElementById('pipeline-res-cible-' + index);
            const tailleEl = document.getElementById('pipeline-taille-cible-' + index);

            if (resEl) {
                resEl.textContent = f.estPDF
                    ? 'PDF (aucun traitement)'
                    : `${dims.w} x ${dims.h}`;
            }
            if (tailleEl) {
                tailleEl.textContent = travauxStockage.formaterTaille(tailleEst);
            }

            // Generer la thumbnail originale (colonne gauche)
            genererOriginalThumbnail(f, index);
            // Generer le preview canvas (colonne droite)
            genererPreviewThumbnail(f, index);
        });
    }

    /**
     * Genere la thumbnail originale pour la colonne Originaux
     * @param {Object} f - Fichier prepare
     * @param {number} index - Index dans la queue
     */
    async function genererOriginalThumbnail(f, index) {
        const conteneur = document.getElementById('pipeline-original-' + index);
        if (!conteneur) return;

        const source = f.fichier || null;
        if (!source) {
            // Fallback sur thumbnailDataUrl
            if (f.thumbnailDataUrl) {
                conteneur.innerHTML = `<img src="${f.thumbnailDataUrl}" alt="">`;
            }
            return;
        }

        try {
            const url = URL.createObjectURL(source);
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });
            URL.revokeObjectURL(url);

            // Thumbnail a 120px max
            const scale = Math.min(1, 120 / Math.max(img.width, img.height));
            const cw = Math.round(img.width * scale);
            const ch = Math.round(img.height * scale);

            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);

            const imgResult = document.createElement('img');
            imgResult.src = canvas.toDataURL('image/jpeg', 0.85);
            conteneur.innerHTML = '';
            conteneur.appendChild(imgResult);
        } catch (e) {
            // Fallback silencieux
            if (f.thumbnailDataUrl) {
                conteneur.innerHTML = `<img src="${f.thumbnailDataUrl}" alt="">`;
            }
        }
    }

    /**
     * Genere l'etape 2 en layout 3 colonnes
     * @param {Array} queue - File d'attente
     * @param {Map} groupes - Groupes de documents
     * @returns {string} HTML
     */
    function genererEtape2Colonnes(queue, groupes) {
        const nbImages = queue.filter(f => f.estImage).length;
        const productions = obtenirDonneesSelonMode(cle('productions'));

        // Production globale actuelle (prendre celle du premier fichier qui en a une)
        const prodActuelle = queue.find(f => f.productionId)?.productionId || '';

        // === Colonne gauche : Originaux ===
        let colGauche = '<div class="pipeline-col-originaux">';
        colGauche += '<div class="pipeline-col-titre">Originaux</div>';
        queue.forEach((f, index) => {
            const thumb = f.thumbnailDataUrl;
            const icone = f.estPDF ? '&#x1F4C4;' : '&#x1F5BC;';
            const nomCourt = (f.parseLea.nom || f.nomFichier).substring(0, 12);
            const resolution = (f.largeurOriginale && f.hauteurOriginale)
                ? `${f.largeurOriginale} x ${f.hauteurOriginale}`
                : 'PDF';
            const poids = travauxStockage.formaterTaille(f.tailleFichier);

            colGauche += `<div class="pipeline-fichier-colonne">
                <div class="pipeline-fichier-thumb-col" id="pipeline-original-${index}">
                    ${thumb ? `<img src="${thumb}" alt="">` : `<span class="pipeline-icone-placeholder">${icone}</span>`}
                </div>
                <div class="pipeline-fichier-meta-col">
                    <span class="pipeline-meta-nom" title="${echapperHtml(f.nomFichier)}">${echapperHtml(nomCourt)}</span>
                    <span class="pipeline-meta-resolution">${resolution}</span>
                    <span class="pipeline-meta-taille">${poids}</span>
                </div>
            </div>`;
        });
        colGauche += '</div>';

        // === Colonne centre : Traitement ===
        let colCentre = '<div class="pipeline-col-controles">';
        colCentre += '<div class="pipeline-col-titre">Traitement</div>';

        colCentre += '<ul class="pipeline-checklist">';
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-balance" checked onchange="travauxUI.mettreAJourPreviewsPipeline()"> Balance des blancs</label></li>`;
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-dpi" checked onchange="travauxUI.mettreAJourPreviewsPipeline()"> Uniformisation 200 DPI</label></li>`;
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-doublons" checked> Détection doublons (manuel)</label></li>`;
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-assemblage" checked> Assemblage automatique (par nom / production)</label></li>`;
        colCentre += '</ul>';

        colCentre += `<div class="pipeline-production-selecteur">
            <label>Production</label>
            <select class="form-select" id="pipeline-select-production" onchange="travauxUI.associerProductionGlobale(this.value)">
                <option value="">-- Choisir une production --</option>
                ${productions.map(p => `<option value="${p.id}" ${prodActuelle === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
            </select>
        </div>`;

        colCentre += `<div class="texte-muted u-texte-petit">${nbImages} image(s)</div>`;

        colCentre += `<div class="pipeline-boutons-groupe">
            <button class="btn btn-secondaire" onclick="travauxUI.ouvrirPreparation()">Réglages spécifiques</button>
            <button class="btn btn-principal" onclick="travauxUI.appliquerEtImporter()">Appliquer et importer</button>
            <button class="btn btn-secondaire" onclick="travauxImport.viderFileDAttente(); travauxUI.afficherImport();">Annuler tout</button>
        </div>`;

        colCentre += `<div class="pipeline-progression-container u-hide" id="pipeline-traitement-progression">
            <div class="pipeline-progression-barre" id="pipeline-traitement-barre"></div>
        </div>
        <div id="pipeline-traitement-texte" class="texte-muted"></div>`;

        colCentre += '</div>';

        // === Colonne droite : Apercu ===
        let colDroite = '<div class="pipeline-col-previews">';
        colDroite += '<div class="pipeline-col-titre">Aperçu</div>';
        queue.forEach((f, index) => {
            const dims = calculerDimensionsCibles(f);
            const tailleEst = estimerTailleFichier(dims.w, dims.h, f);
            const resCible = f.estPDF
                ? 'PDF (aucun traitement)'
                : `${dims.w} x ${dims.h}`;

            colDroite += `<div class="pipeline-fichier-colonne">
                <div class="pipeline-fichier-thumb-col" id="pipeline-preview-${index}">
                    ${f.thumbnailDataUrl ? `<img src="${f.thumbnailDataUrl}" alt="">` : `<span class="pipeline-icone-placeholder">${f.estPDF ? '&#x1F4C4;' : '&#x1F5BC;'}</span>`}
                </div>
                <div class="pipeline-fichier-meta-col">
                    <span class="pipeline-meta-resolution" id="pipeline-res-cible-${index}">${resCible}</span>
                    <span class="pipeline-meta-taille" id="pipeline-taille-cible-${index}">${travauxStockage.formaterTaille(tailleEst)}</span>
                </div>
            </div>`;
        });
        colDroite += '</div>';

        return `<div class="pipeline-3col-grid">${colGauche}${colCentre}${colDroite}</div>`;
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

        if (conteneur) conteneur.classList.remove('u-hide');
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
     * Associe une production a tous les fichiers de la queue
     * @param {string} productionId - ID de la production
     */
    function associerProductionGlobale(productionId) {
        const queue = travauxImport.obtenirFileDAttente();
        queue.forEach(f => {
            f.productionId = productionId;
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
     * Verifie qu'une annotation contient du contenu reel (strokes, textes, formes ou stickers)
     */
    function annotationContientDuContenu(annotation) {
        if (!annotation || !annotation.pages) return false;
        for (const page of Object.values(annotation.pages)) {
            if (page.strokes && page.strokes.length > 0) return true;
            if (page.textAnnotations && page.textAnnotations.length > 0) return true;
            if (page.shapes && page.shapes.length > 0) return true;
            if (page.stickers && page.stickers.length > 0) return true;
        }
        return false;
    }

    /**
     * Genere un badge compact pour un fichier importe
     * @param {Object} f - Le fichier
     * @returns {string} HTML
     */
    function genererBadgeFichierImporte(f, action) {
        action = action || 'ouvrirPreviewInline';
        const etudiant = travauxImport.trouverEtudiantParDA(f.etudiantDA);
        const nomEtudiant = etudiant
            ? `${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}`
            : (f.etudiantDA || 'Non associé');

        // Déterminer le statut le plus avancé
        let statutTexte = 'Importé';
        let statutClasse = 'importe';

        const annotation = travauxStockage.obtenirAnnotationFichier(f.id);
        if (annotation && annotationContientDuContenu(annotation)) {
            statutTexte = 'Annoté';
            statutClasse = 'annote';
        }

        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        const evaluation = evaluations.find(e =>
            e.etudiantDA === f.etudiantDA && e.productionId === f.productionId
        );
        if (evaluation) {
            statutTexte = 'Évalué';
            statutClasse = 'evalue';
        }

        return `<div class="travaux-badge-importe" data-fichier-id="${f.id}" onclick="travauxUI.${action}('${f.id}')" title="${echapperHtml(f.nomFichier)}">
        <span class="travaux-badge-nom">${nomEtudiant}</span>
        <span class="travaux-badge-pill ${statutClasse}">${statutTexte}</span>
        <button class="travaux-badge-supprimer" onclick="event.stopPropagation(); travauxUI.supprimerFichierImporte('${f.id}')" title="Supprimer">&times;</button>
    </div>`;
    }

    /**
     * Genere la grille de fichiers importes, regroupes par production
     * @param {Array} fichiers - Les fichiers
     * @returns {string} HTML
     */
    function genererGrilleFichiers(fichiers, action) {
        if (fichiers.length === 0) return '';

        const productions = obtenirDonneesSelonMode(cle('productions'));

        // Grouper par productionId
        const groupes = {};
        fichiers.forEach(f => {
            const pid = f.productionId || '__aucune__';
            if (!groupes[pid]) groupes[pid] = [];
            groupes[pid].push(f);
        });

        let html = '<div class="travaux-grille-fichiers">';

        // Afficher chaque production
        productions.forEach(p => {
            const g = groupes[p.id];
            if (!g || g.length === 0) return;
            html += `<h5 class="travaux-groupe-production-titre">${echapperHtml(p.titre || p.nom || p.id)} (${g.length})</h5>`;
            html += '<div class="travaux-badges-groupe">';
            g.forEach(f => { html += genererBadgeFichierImporte(f, action); });
            html += '</div>';
            delete groupes[p.id];
        });

        // Fichiers sans production
        const sansProduction = groupes['__aucune__'];
        if (sansProduction && sansProduction.length > 0) {
            html += `<h5 class="travaux-groupe-production-titre">Non associés (${sansProduction.length})</h5>`;
            html += '<div class="travaux-badges-groupe">';
            sansProduction.forEach(f => { html += genererBadgeFichierImporte(f, action); });
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

        // Fermer le mode evaluation si actif (remet les panneaux dans leur conteneur d'origine
        // avant que afficherFichiers() ne détruise le DOM de la visionneuse)
        if (document.getElementById('travaux-palette-eval-gauche')) {
            fermerModeEvaluation();
        }
        // Masquer la section evaluation si visible (fallback)
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (evalDiv) evalDiv.classList.add('u-hide');

        // Highlight du badge actif : pill → "EN COURS" orange
        document.querySelectorAll('.travaux-badge-importe').forEach(b => {
            const estActif = b.dataset.fichierId === fichierId;
            b.classList.toggle('actif', estActif);
            const pill = b.querySelector('.travaux-badge-pill');
            if (!pill) return;
            if (estActif) {
                // Sauvegarder le texte/classe d'origine pour restauration
                if (!pill.dataset.origTexte) {
                    pill.dataset.origTexte = pill.textContent;
                    pill.dataset.origClasse = pill.className.replace('travaux-badge-pill', '').trim();
                }
                pill.textContent = 'EN COURS';
                pill.className = 'travaux-badge-pill en-cours';
            } else if (pill.dataset.origTexte) {
                // Restaurer l'etat d'origine
                pill.textContent = pill.dataset.origTexte;
                pill.className = 'travaux-badge-pill ' + pill.dataset.origClasse;
                delete pill.dataset.origTexte;
                delete pill.dataset.origClasse;
            }
        });

        // Attendre que la visionneuse soit prete
        setTimeout(async () => {
            const placeholder = document.getElementById('travaux-placeholder-visionneuse');
            if (placeholder) placeholder.classList.add('u-hide');

            await travauxVisionneuse.ouvrirFichier(fichierId);

            // Afficher le bouton evaluer
            const btnEvaluer = document.getElementById('travaux-btn-evaluer');
            if (btnEvaluer) btnEvaluer.classList.remove('u-hide');

            // Auto-activer l'annotation
            travauxAnnotation.activerAnnotation();
            // Replier la sidebar
            const sidebar = document.getElementById('travaux-sidebar');
            if (sidebar) sidebar.classList.add('replie');
            const btnToggle = document.getElementById('travaux-btn-toggle-sidebar');
            if (btnToggle) { btnToggle.classList.add('visible'); btnToggle.innerHTML = '&#x25B6;'; }
            // Highlight Annoter
            const btnAnnoter = document.getElementById('travaux-btn-annoter');
            if (btnAnnoter) btnAnnoter.classList.add('actif');

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


            // Badge etudiant dans la toolbar — afficher "EN COURS" en orange
            const badgeFichier = document.getElementById('travaux-badge-fichier-actif');
            if (badgeFichier && fichierOuvert) {
                badgeFichier.innerHTML = genererBadgeFichierImporte(fichierOuvert, 'ouvrirFichier');
                badgeFichier.classList.remove('u-hide');
                const pillToolbar = badgeFichier.querySelector('.travaux-badge-pill');
                if (pillToolbar) {
                    pillToolbar.textContent = 'EN COURS';
                    pillToolbar.className = 'travaux-badge-pill en-cours';
                }
                // Desactiver le onclick et le bouton supprimer dans cette copie toolbar
                const badgeCopie = badgeFichier.querySelector('.travaux-badge-importe');
                if (badgeCopie) { badgeCopie.onclick = null; badgeCopie.style.cursor = 'default'; }
                const btnSupp = badgeFichier.querySelector('.travaux-badge-supprimer');
                if (btnSupp) btnSupp.remove();
            }

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

            sauvegarderEtatSession();
            // Si mode sauvegarde etait 'evaluer', basculer
            if (modeCourant === 'evaluer') {
                // Forcer la bascule (modeCourant est deja 'evaluer' depuis restaurerEtatSession)
                modeCourant = 'annoter';
                basculerMode('evaluer');
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
     * Appliquer et importer — fusionne traitement + identification + import
     * Lit les checkboxes, traite les images, identifie, force pret→identifie, importe
     */
    async function appliquerEtImporter() {
        const queue = travauxImport.obtenirFileDAttente();
        if (queue.length === 0) {
            afficherModalePipeline('Import', '<p>Aucun fichier à importer.</p>',
                [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
            return;
        }

        // Verifier que les blobs sont disponibles
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

        const optBalance = document.getElementById('pipeline-opt-balance')?.checked;
        const optDPI = document.getElementById('pipeline-opt-dpi')?.checked;
        const optDoublons = document.getElementById('pipeline-opt-doublons')?.checked;
        const optAssemblage = document.getElementById('pipeline-opt-assemblage')?.checked;

        // Si doublons cochee, detecter les vrais doublons et afficher la modale
        if (optDoublons) {
            const doublons = detecterDoublons(queue);
            if (doublons.length > 0) {
                afficherModaleDoublonsEtImporter(queue, doublons);
                return;
            }
        }

        // === Traitement batch (images a-optimiser) ===
        const images = queue.filter(f => f.pipelineStatut === 'a-optimiser');
        const BATCH_SIZE = 10;
        let traites = 0;
        const total = images.length;

        if (total > 0) {
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

                await new Promise(r => setTimeout(r, 0));
            }
        }

        // === Assemblage PDF si coche ===
        if (optAssemblage) {
            await assemblerGroupesPipeline(queue);
        }

        // === Auto-identification ===
        identifierAutoPipeline();

        // === Forcer tous les fichiers pret → identifie (import sans blocage) ===
        queue.forEach(f => {
            if (f.pipelineStatut === 'pret') {
                f.pipelineStatut = 'identifie';
            }
        });

        // === Import ===
        const resultat = await travauxImport.importerTous(null, (i, totalImport) => {
            const pourcent = Math.round((i / totalImport) * 100);
            const barre = document.getElementById('pipeline-traitement-barre');
            if (barre) barre.style.width = pourcent + '%';
            const texte = document.getElementById('pipeline-traitement-texte');
            if (texte) texte.textContent = `${i}/${totalImport} fichier(s) importés...`;
        });

        afficherImport();

        afficherModalePipeline('Import terminé',
            `<p>${resultat.importes} fichier(s) importé(s)${resultat.erreurs > 0 ? `, ${resultat.erreurs} erreur(s)` : ''}.</p>
            <p class="pipeline-message-succes">Ces documents sont prêts pour l'annotation et l'évaluation.</p>`,
            [{ label: 'OK', classe: 'btn-principal', action: () => {} }]);
    }

    /**
     * Detecte les vrais doublons dans la queue
     * Compare les noms de fichiers exacts (seule l'extension est ignoree)
     * Deux fichiers avec des horodatages differents = deux remises distinctes
     * @param {Array} queue - File d'attente
     * @returns {Array} Groupes de doublons [{cle, fichiers}]
     */
    function detecterDoublons(queue) {
        const groupes = new Map();

        queue.forEach(f => {
            // Comparer sans extension uniquement (nom exact sinon)
            const cle = f.nomFichier.replace(/\.[^.]+$/, '');

            if (!groupes.has(cle)) groupes.set(cle, []);
            groupes.get(cle).push(f);
        });

        return Array.from(groupes.entries())
            .filter(([, fichiers]) => fichiers.length > 1)
            .map(([cle, fichiers]) => ({ cle, fichiers }));
    }

    /**
     * Modale doublons adaptee pour appliquerEtImporter
     * Apres resolution des doublons, relance appliquerEtImporter
     * @param {Array} queue - File d'attente
     * @param {Array} doublons - Groupes de doublons detectes
     */
    function afficherModaleDoublonsEtImporter(queue, doublons) {
        let html = '<div class="modal-section"><p>Cochez les fichiers à supprimer :</p>';
        doublons.forEach(({ cle: cleGroupe, fichiers }) => {
            html += `<div class="pipeline-doublon-groupe"><strong>${echapperHtml(cleGroupe)}</strong>`;
            fichiers.forEach((f) => {
                const idx = queue.indexOf(f);
                html += `<div class="pipeline-doublon-item"><label><input type="checkbox" class="doublon-check" data-index="${idx}"> ${echapperHtml(f.nomFichier)} (${travauxStockage.formaterTaille(f.tailleFichier)})</label></div>`;
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
                    appliquerEtImporter();
                }},
                { label: 'Annuler', classe: 'btn-secondaire', action: () => {
                    document.getElementById('pipeline-opt-doublons').checked = false;
                    appliquerEtImporter();
                }}
            ]
        );
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
        basculerMode('evaluer');
    }

    function basculerMode(mode) {
        if (mode === modeCourant) return;
        const btnAnnoter = document.getElementById('travaux-btn-annoter');
        const btnEvaluer = document.getElementById('travaux-btn-evaluer');

        if (mode === 'evaluer') {
            const fichier = travauxVisionneuse.getFichierActuel();
            if (!fichier || !fichier.etudiantDA || !fichier.productionId) {
                alert('Ce fichier n\'est pas associé à un étudiant ou une production.');
                return;
            }
            modeCourant = 'evaluer';
            masquerPalettesAnnotation();
            afficherPalettesEval(fichier);
            if (btnAnnoter) btnAnnoter.classList.remove('actif');
            if (btnEvaluer) btnEvaluer.classList.add('actif');
        } else {
            modeCourant = 'annoter';
            masquerPalettesEval();
            afficherPalettesAnnotation();
            if (btnAnnoter) btnAnnoter.classList.add('actif');
            if (btnEvaluer) btnEvaluer.classList.remove('actif');
        }
        sauvegarderEtatSession();
    }

    function masquerPalettesAnnotation() {
        ['travaux-palette-flottante', 'travaux-palette-tampons', 'travaux-palette-erreurs-fr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('u-hide');
        });
    }

    function afficherPalettesAnnotation() {
        ['travaux-palette-flottante', 'travaux-palette-tampons', 'travaux-palette-erreurs-fr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('u-hide');
        });
    }

    function afficherPalettesEval(fichier) {
        // Ne creer que si pas deja presentes
        if (document.getElementById('travaux-palette-eval-gauche')) return;

        const conteneurDoc = document.getElementById('travaux-conteneur-document');
        if (!conteneurDoc) return;

        // Creer les 3 palettes flottantes eval
        const panneauGauche = document.getElementById('travaux-eval-gauche');
        const panneauDroite = document.getElementById('travaux-eval-droite');
        const panneauRetro = document.getElementById('travaux-eval-retroaction');

        if (panneauGauche) {
            const paletteG = creerPaletteEval('travaux-palette-eval-gauche', 'Paramètres', panneauGauche);
            paletteG.style.top = '56px';
            paletteG.style.left = '12px';
            conteneurDoc.appendChild(paletteG);
            configurerDragPaletteEval('travaux-palette-eval-gauche');
        }

        if (panneauDroite) {
            const paletteD = creerPaletteEval('travaux-palette-eval-droite', 'Évaluation', panneauDroite);
            paletteD.style.top = '56px';
            paletteD.style.right = '12px';
            paletteD.style.left = 'auto';
            conteneurDoc.appendChild(paletteD);
            configurerDragPaletteEval('travaux-palette-eval-droite');
        }

        if (panneauRetro) {
            const paletteR = creerPaletteEval('travaux-palette-eval-retro', 'Rétroaction', panneauRetro);
            paletteR.style.bottom = '12px';
            paletteR.style.left = '50%';
            paletteR.style.transform = 'translateX(-50%)';
            conteneurDoc.appendChild(paletteR);
            configurerDragPaletteEval('travaux-palette-eval-retro');

            // Bouton Copier compact dans la barre de titre
            const barreRetro = paletteR.querySelector('.travaux-palette-barre');
            if (barreRetro) {
                const btnCopier = document.createElement('button');
                btnCopier.className = 'btn btn-compact';
                btnCopier.textContent = 'Copier';
                btnCopier.title = 'Copier dans le presse-papier';
                btnCopier.style.cssText = 'font-size:10px; padding:2px 8px; margin-right:4px;';
                btnCopier.addEventListener('click', function() { copierRetroaction(1); });
                const btnToggle = barreRetro.querySelector('.travaux-palette-toggle');
                barreRetro.insertBefore(btnCopier, btnToggle);
            }
        }

        // Auto-replier Paramètres au clic sur Évaluation
        if (panneauDroite) {
            const paletteD = document.getElementById('travaux-palette-eval-droite');
            if (paletteD) {
                paletteD.addEventListener('pointerdown', function() {
                    const paletteG = document.getElementById('travaux-palette-eval-gauche');
                    if (paletteG && !paletteG.classList.contains('replie')) {
                        togglePaletteEvalReplie('travaux-palette-eval-gauche');
                    }
                });
            }
        }

        // 4e palette : Jetons (positionnée sous Paramètres, côté gauche)
        const panneauJetons = document.getElementById('travaux-eval-jetons');
        if (panneauJetons) {
            const paletteJ = creerPaletteEval('travaux-palette-eval-jetons', 'Jetons', panneauJetons);
            paletteJ.style.top = '55%';
            paletteJ.style.left = '12px';
            conteneurDoc.appendChild(paletteJ);
            configurerDragPaletteEval('travaux-palette-eval-jetons');
        }

        // Peupler les dropdowns (les fonctions d'evaluation.js remplissent les selects)
        if (typeof chargerListeEtudiantsEval === 'function') chargerListeEtudiantsEval();
        if (typeof chargerGroupesEval === 'function') chargerGroupesEval();
        if (typeof chargerProductionsDansSelect === 'function') chargerProductionsDansSelect();
        if (typeof chargerGrillesDansSelect === 'function') chargerGrillesDansSelect();
        if (typeof chargerEchellePerformance === 'function') chargerEchellePerformance();

        // Afficher les labels d'identite
        remplirLabelsIdentite(fichier);

        // Pre-remplir le formulaire d'evaluation avec retry robuste
        preRemplirEvaluation(fichier.etudiantDA, fichier.productionId);

        // Peupler la palette jetons
        peuplementPaletteJetons(fichier);
    }

    function masquerPalettesEval() {
        if (document.getElementById('travaux-palette-eval-gauche')) {
            fermerModeEvaluation();
        }
    }

    /**
     * Cree une palette flottante eval qui enveloppe un panneau existant
     * @param {string} id - ID de la palette
     * @param {string} titre - Titre affiche dans la barre
     * @param {HTMLElement} panneauContenu - Le panneau existant a deplacer dans la palette
     * @returns {HTMLElement} La palette creee
     */
    function creerPaletteEval(id, titre, panneauContenu) {
        const palette = document.createElement('div');
        palette.id = id;
        palette.className = 'travaux-palette-flottante travaux-palette-eval';

        // Barre de titre (draggable)
        const barre = document.createElement('div');
        barre.className = 'travaux-palette-barre';
        barre.innerHTML = `
            <span class="travaux-palette-titre">${titre}</span>
            <button class="travaux-palette-toggle" onclick="travauxUI.togglePaletteEvalReplie('${id}')" title="Replier/Déplier">&#x2212;</button>
        `;
        palette.appendChild(barre);

        // Contenu : deplacer le panneau existant
        const contenu = document.createElement('div');
        contenu.className = 'travaux-palette-contenu';

        // Cacher le header du panneau (remplace par la barre de palette)
        const panneauHeader = panneauContenu.querySelector('.travaux-panneau-header');
        if (panneauHeader) panneauHeader.style.display = 'none';

        panneauContenu.classList.remove('u-hide');
        contenu.appendChild(panneauContenu);
        palette.appendChild(contenu);

        return palette;
    }

    /**
     * Remplit les labels d'identite (etudiant + production) dans la palette Parametres
     * @param {Object} fichier - Fichier actuel de la visionneuse
     */
    function remplirLabelsIdentite(fichier) {
        const etudiant = travauxImport.trouverEtudiantParDA(fichier.etudiantDA);
        const productions = obtenirDonneesSelonMode(cle('productions'));
        const production = productions ? productions.find(p => p.id === fichier.productionId) : null;

        const labelEtud = document.getElementById('travaux-eval-label-etudiant');
        if (labelEtud) {
            labelEtud.textContent = etudiant
                ? `${etudiant.prenom} ${etudiant.nom} (${etudiant.da})`
                : (fichier.etudiantDA || 'Non associé');
        }
        const labelProd = document.getElementById('travaux-eval-label-production');
        if (labelProd) {
            labelProd.textContent = production
                ? (production.titre || production.nom)
                : 'Non associée';
        }
    }

    /**
     * Bascule la visibilite de la section correction d'identite
     */
    function toggleCorrectionIdentite() {
        const sectionIdentite = document.getElementById('travaux-eval-identite');
        const sectionCorrection = document.getElementById('travaux-eval-correction');
        if (!sectionIdentite || !sectionCorrection) return;

        const estCache = sectionCorrection.classList.contains('u-hide');
        if (estCache) {
            sectionIdentite.classList.add('u-hide');
            sectionCorrection.classList.remove('u-hide');
        } else {
            sectionCorrection.classList.add('u-hide');
            sectionIdentite.classList.remove('u-hide');
        }
    }

    /**
     * Applique la correction d'identite (etudiant/production) au fichier importe
     */
    function appliquerCorrectionIdentite() {
        const fichier = travauxVisionneuse.getFichierActuel();
        if (!fichier) return;

        const selectEtud = document.getElementById('selectEtudiantEval');
        const selectProd = document.getElementById('selectProduction1');
        const nouveauDA = selectEtud ? selectEtud.value : '';
        const nouveauProdId = selectProd ? selectProd.value : '';

        if (!nouveauDA && !nouveauProdId) {
            alert('Veuillez sélectionner un·e étudiant·e ou une production.');
            return;
        }

        // Mettre a jour le fichier importe
        const modifications = {};
        if (nouveauDA) modifications.etudiantDA = nouveauDA;
        if (nouveauProdId) modifications.productionId = nouveauProdId;
        travauxStockage.mettreAJourFichier(fichier.id, modifications);

        // Mettre a jour l'objet fichier en memoire
        if (nouveauDA) fichier.etudiantDA = nouveauDA;
        if (nouveauProdId) fichier.productionId = nouveauProdId;

        // Rafraichir les labels
        remplirLabelsIdentite(fichier);

        // Refermer la section correction
        toggleCorrectionIdentite();

        // Re-trigger le pre-remplissage avec les nouvelles valeurs
        preRemplirEvaluation(fichier.etudiantDA, fichier.productionId);
    }

    /**
     * Ferme le mode evaluation : remet les panneaux dans leur conteneur d'origine
     */
    function fermerModeEvaluation() {
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');

        const ids = ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro', 'travaux-palette-eval-jetons'];
        const panneauIds = ['travaux-eval-gauche', 'travaux-eval-droite', 'travaux-eval-retroaction', 'travaux-eval-jetons'];

        for (let i = 0; i < ids.length; i++) {
            const palette = document.getElementById(ids[i]);
            if (!palette) continue;

            const panneau = document.getElementById(panneauIds[i]);
            if (panneau) {
                // Re-afficher le header du panneau
                const panneauHeader = panneau.querySelector('.travaux-panneau-header');
                if (panneauHeader) panneauHeader.style.display = '';

                panneau.classList.add('u-hide');
                if (evalDiv) evalDiv.appendChild(panneau);
            }
            palette.remove();
        }

        // Remettre la section identite visible et masquer la correction
        const sectionIdentite = document.getElementById('travaux-eval-identite');
        const sectionCorrection = document.getElementById('travaux-eval-correction');
        if (sectionIdentite) sectionIdentite.classList.remove('u-hide');
        if (sectionCorrection) sectionCorrection.classList.add('u-hide');
    }

    /**
     * Configure le drag d'une palette eval par sa barre de titre
     * @param {string} paletteId - ID de la palette
     */
    function configurerDragPaletteEval(paletteId) {
        const palette = document.getElementById(paletteId);
        const barre = palette?.querySelector('.travaux-palette-barre');
        if (!barre) return;

        barre.addEventListener('mousedown', function(e) {
            if (e.target.closest('.travaux-palette-toggle')) return;
            e.preventDefault();

            const startX = e.clientX, startY = e.clientY;
            const rect = palette.getBoundingClientRect();
            const container = document.getElementById('travaux-conteneur-document');
            const cRect = container.getBoundingClientRect();
            const startLeft = rect.left - cRect.left;
            const startTop = rect.top - cRect.top;

            // Convertir right/transform en left au premier move
            palette.style.right = 'auto';
            palette.style.transform = 'none';
            palette.style.bottom = 'auto';
            palette.style.left = startLeft + 'px';
            palette.style.top = startTop + 'px';

            function onMove(e2) {
                palette.style.left = Math.max(0, startLeft + e2.clientX - startX) + 'px';
                palette.style.top = Math.max(0, startTop + e2.clientY - startY) + 'px';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Double-clic sur la barre : reset taille
        barre.addEventListener('dblclick', function(e) {
            if (e.target.closest('.travaux-palette-toggle')) return;
            palette.style.width = '';
            palette.style.height = '';
        });
    }

    /**
     * Replie / deplie une palette eval
     * @param {string} paletteId - ID de la palette
     */
    function togglePaletteEvalReplie(paletteId) {
        const palette = document.getElementById(paletteId);
        if (!palette) return;
        palette.classList.toggle('replie');
        const btn = palette.querySelector('.travaux-palette-toggle');
        if (btn) {
            btn.innerHTML = palette.classList.contains('replie') ? '&#x002B;' : '&#x2212;';
        }
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

            // Defaut "Remis" car le fichier a ete importe (donc remis)
            var selectRemise = document.getElementById('remiseProduction1');
            if (selectRemise) {
                selectRemise.value = 'remis';
                if (typeof changerStatutRemise === 'function') {
                    changerStatutRemise(1);
                }
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
        const visStandard = document.getElementById('evaluations-contenu-fichiers');
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
                        <canvas id="travaux-canvas-surligneur" class="u-hide" style="pointer-events:none;"></canvas>
                        <canvas id="travaux-canvas-annotation" class="u-hide" style="pointer-events:none;"></canvas>
                    </div>
                </div>
                <!-- Palette flottante inseree dynamiquement par activerAnnotation() -->
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
                afficherFichiers();
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
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (evalDiv) evalDiv.classList.add('u-hide');
        // Retirer le highlight actif et restaurer les pills originaux
        document.querySelectorAll('.travaux-badge-importe.actif').forEach(b => {
            b.classList.remove('actif');
            const pill = b.querySelector('.travaux-badge-pill');
            if (pill && pill.dataset.origTexte) {
                pill.textContent = pill.dataset.origTexte;
                pill.className = 'travaux-badge-pill ' + pill.dataset.origClasse;
                delete pill.dataset.origTexte;
                delete pill.dataset.origClasse;
            }
        });
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
       PALETTE JETONS
       =============================== */

    /**
     * Peuple la palette flottante des jetons pour le fichier courant
     * @param {Object} fichier - Le fichier actuellement ouvert
     */
    function peuplementPaletteJetons(fichier) {
        const conteneur = document.getElementById('travaux-jetons-contenu');
        if (!conteneur || !fichier?.etudiantDA) return;

        const config = typeof obtenirConfigJetons === 'function' ? obtenirConfigJetons() : null;
        if (!config || !config.actif) {
            conteneur.innerHTML = '<p class="texte-aide" style="padding:8px; font-size:0.8rem; color:var(--gris-moyen);">Système de jetons désactivé</p>';
            return;
        }

        const statut = typeof obtenirStatutJetonsEtudiant === 'function'
            ? obtenirStatutJetonsEtudiant(fichier.etudiantDA) : {};
        const types = typeof obtenirTousTypesJetons === 'function'
            ? obtenirTousTypesJetons() : [];

        if (types.length === 0) {
            conteneur.innerHTML = '<p class="texte-aide" style="padding:8px; font-size:0.8rem; color:var(--gris-moyen);">Aucun type de jeton configuré</p>';
            return;
        }

        let html = '<div style="display:flex; flex-direction:column; gap:8px; padding:4px;">';

        for (const type of types) {
            const s = statut[type.id] || { utilises: 0, total: type.nombreTotal || 0, restants: type.nombreTotal || 0 };
            const couleur = type.id === 'delai' ? 'var(--orange-accent, #e67e22)'
                          : type.id === 'reprise' ? 'var(--bleu-moyen, #3498db)'
                          : type.id === 'repriseCiblee' ? 'var(--violet-accent, #9b59b6)'
                          : 'var(--gris-moyen, #95a5a6)';

            html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; background:var(--surface-conteneur, #162c36); border-radius:6px; border-left:3px solid ${couleur};">
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" id="travaux-checkbox-jeton-${type.id}"
                           onchange="travauxUI.gererCheckboxJetonPalette('${type.id}')"
                           style="accent-color:${couleur};">
                    <span style="font-size:0.8rem; font-weight:600; color:var(--texte-principal, #e0e0e0);">${echapperHtml(type.nom)}</span>
                </div>
                <span style="font-size:0.75rem; color:var(--gris-moyen); white-space:nowrap;">${s.restants} / ${s.total}</span>
            </div>`;
        }

        html += '</div>';
        conteneur.innerHTML = html;
    }

    /**
     * Handler pour les checkboxes de la palette jetons flottante
     * Délègue aux fonctions existantes de evaluation.js
     * @param {string} typeId - L'identifiant du type de jeton
     */
    function gererCheckboxJetonPalette(typeId) {
        // Synchroniser avec les checkboxes de la palette Paramètres (optionsJetons)
        const checkboxPalette = document.getElementById(`travaux-checkbox-jeton-${typeId}`);
        const estCoche = checkboxPalette?.checked || false;

        if (typeId === 'delai') {
            const checkboxOriginal = document.getElementById('checkboxJetonDelai');
            if (checkboxOriginal) checkboxOriginal.checked = estCoche;
            if (typeof gererChangementCheckboxJetonDelai === 'function') {
                gererChangementCheckboxJetonDelai();
            }
        } else if (typeId === 'reprise') {
            const checkboxOriginal = document.getElementById('checkboxJetonReprise');
            if (checkboxOriginal) checkboxOriginal.checked = estCoche;
            if (typeof gererChangementCheckboxJetonReprise === 'function') {
                gererChangementCheckboxJetonReprise();
            }
        } else if (typeId === 'repriseCiblee') {
            const checkboxOriginal = document.getElementById('checkboxJetonRepriseCiblee');
            if (checkboxOriginal) checkboxOriginal.checked = estCoche;
            if (typeof gererChangementCheckboxJetonRepriseCiblee === 'function') {
                gererChangementCheckboxJetonRepriseCiblee();
            }
        } else {
            // Jeton personnalisé
            const fichier = travauxVisionneuse.getFichierActuel();
            if (!fichier?.etudiantDA) return;

            if (estCoche) {
                if (typeof attribuerJetonPersonnalise === 'function') {
                    attribuerJetonPersonnalise(fichier.etudiantDA, typeId, 'Appliqué depuis palette jetons');
                }
            } else {
                if (typeof retirerJetonPersonnalise === 'function') {
                    retirerJetonPersonnalise(fichier.etudiantDA, typeId);
                }
            }
        }

        // Rafraîchir les compteurs de la palette après action
        const fichier = travauxVisionneuse.getFichierActuel();
        if (fichier) {
            setTimeout(() => peuplementPaletteJetons(fichier), 300);
        }
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
        appliquerEtImporter: appliquerEtImporter,
        mettreAJourPreviewsPipeline: mettreAJourPreviewsPipeline,
        associerEtudiantPipeline: associerEtudiantPipeline,
        associerProductionPipeline: associerProductionPipeline,
        associerProductionGlobale: associerProductionGlobale,
        identifierAutoPipeline: identifierAutoPipeline,
        rafraichirPipelineUI: rafraichirPipelineUI,
        // Archivage
        lancerArchivageEtudiant: lancerArchivageEtudiant,
        lancerArchivageProduction: lancerArchivageProduction,
        lancerArchivageSemestre: lancerArchivageSemestre,
        // Annotation → Evaluation
        evaluerDepuisAnnotation: evaluerDepuisAnnotation,
        basculerMode: basculerMode,
        getModeCourant: function() { return modeCourant; },
        fermerModeEvaluation: fermerModeEvaluation,
        togglePaletteEvalReplie: togglePaletteEvalReplie,
        toggleCorrectionIdentite: toggleCorrectionIdentite,
        appliquerCorrectionIdentite: appliquerCorrectionIdentite,
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
        rafraichirUI: rafraichirUI,
        // Palette jetons
        gererCheckboxJetonPalette: gererCheckboxJetonPalette,
        peuplementPaletteJetons: peuplementPaletteJetons,
        // Utilitaires
        annotationContientDuContenu: annotationContientDuContenu
    };

    // Alias pour navigation.js
    window.initialiserModuleTravaux = initialiserModuleTravaux;

})();
