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
    let fichierSelectionneIndex = -1; // -1 = aucune selection dans le pipeline
    let productionFiltreActive = sessionStorage.getItem('travaux-filtre-production') || '';
    let _htmlBadgesGrille = ''; // HTML badges pré-généré pour injection dans toolbar unique
    let _htmlDropdownProduction = ''; // HTML dropdown production séparé (fixe, hors scroll)
    let selectionFusion = new Set(); // IDs des fichiers selectionnes pour fusion

    /* ===============================
       CHRONO ÉVALUATION
       =============================== */

    let _chronoDebut = null;       // Date.now() du début
    let _chronoFichierId = null;   // fichier actif
    let _chronoInterval = null;    // setInterval pour affichage live

    function _formaterDuree(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return min + ':' + String(sec).padStart(2, '0');
    }

    // IDs des badges/wrappers chrono dans les deux palettes
    var _chronoBadgeIds = ['travaux-chrono-badge', 'annot-chrono-badge'];
    var _chronoWrapperIds = ['travaux-chrono-palette', 'annot-chrono-palette'];

    function _majAffichageChrono() {
        var texte = _chronoDebut ? '\u23f1\ufe0f ' + _formaterDuree(Date.now() - _chronoDebut) : '\u23f1\ufe0f --:--';
        _chronoBadgeIds.forEach(function(id) {
            var badge = document.getElementById(id);
            if (!badge) return;
            badge.textContent = texte;
            if (_chronoDebut) badge.classList.add('actif');
            else badge.classList.remove('actif');
        });
    }

    function demarrerChrono() {
        const prefs = db.getSync('preferencesAffichage', {});
        _afficherWrapperChrono(prefs.chronoEvaluation);
        if (!prefs.chronoEvaluation) return;
        if (_chronoDebut) return; // déjà en cours
        _chronoDebut = Date.now();
        const fichier = travauxVisionneuse.getFichierActuel();
        _chronoFichierId = fichier ? fichier.id : null;
        _majAffichageChrono();
        _chronoInterval = setInterval(_majAffichageChrono, 1000);
    }

    function _afficherWrapperChrono(visible) {
        _chronoWrapperIds.forEach(function(id) {
            var wrapper = document.getElementById(id);
            if (wrapper) {
                if (visible) wrapper.classList.remove('u-hide');
                else wrapper.classList.add('u-hide');
            }
        });
    }

    function arreterChrono() {
        if (!_chronoDebut) return;
        const dureeMs = Date.now() - _chronoDebut;
        if (_chronoInterval) { clearInterval(_chronoInterval); _chronoInterval = null; }

        // Stocker dans les 20 dernières entrées
        const cleStock = cle('chronoEvaluations');
        let historique = db.getSync(cleStock, []);
        historique.push({ dureeMs: dureeMs, date: new Date().toISOString() });
        if (historique.length > 20) historique = historique.slice(-20);
        db.setSync(cleStock, historique);

        // Calculer la moyenne des 5 dernières
        const cinqDernieres = historique.slice(-5);
        const moyenneMs = cinqDernieres.reduce((s, e) => s + e.dureeMs, 0) / cinqDernieres.length;

        // Afficher résultat + moyenne dans les deux palettes
        var texteResultat = '\u23f1\ufe0f ' + _formaterDuree(dureeMs) + ' (moy. ' + _formaterDuree(moyenneMs) + ')';
        _chronoBadgeIds.forEach(function(id) {
            var badge = document.getElementById(id);
            if (badge) {
                badge.textContent = texteResultat;
                badge.classList.remove('actif');
            }
        });

        _chronoDebut = null;
        _chronoFichierId = null;
    }

    function getDureeMs() {
        return _chronoDebut ? Date.now() - _chronoDebut : null;
    }

    function resetChrono() {
        if (_chronoInterval) { clearInterval(_chronoInterval); _chronoInterval = null; }
        _chronoDebut = null;
        _chronoFichierId = null;
        _majAffichageChrono();
    }

    function sauvegarderEtatSession() {
        const fichier = travauxVisionneuse.getFichierActuel();
        if (fichier) sessionStorage.setItem('travaux-dernier-fichier', fichier.id);
        sessionStorage.setItem('travaux-mode-courant', modeCourant);
    }

    function restaurerEtatSession() {
        // Toujours demarrer en mode "annoter" (l'utilisateur bascule manuellement vers Evaluer)
        modeCourant = 'annoter';
        return sessionStorage.getItem('travaux-dernier-fichier');
    }

    /* ===============================
       SPLITTER (séparateurs redimensionnables)
       =============================== */

    const STORAGE_KEY_PANNEAUX = 'travaux-panneaux-largeurs';

    function persisterLargeursPanneaux(key, width) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PANNEAUX);
            const obj = raw ? JSON.parse(raw) : {};
            obj[key] = width;
            localStorage.setItem(STORAGE_KEY_PANNEAUX, JSON.stringify(obj));
        } catch (_) { console.warn('[Travaux-UI] panel width save skipped (quota or invalid JSON):', _.message || _); }
    }

    function obtenirLargeurPanneau(key) {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PANNEAUX);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            return obj[key] != null ? obj[key] : null;
        } catch (_) { return null; }
    }

    function restaurerLargeurPanneau(panel, storageKey) {
        const w = obtenirLargeurPanneau(storageKey);
        if (w != null && panel) {
            panel.style.flexBasis = w + 'px';
        }
    }

    // Migration one-time : supprimer les anciennes largeurs eval persistées
    // pour que les nouveaux défauts (plus étroits) prennent effet.
    (function migrerLargeursEval() {
        const MIGRATION_KEY = 'travaux-migration-eval-widths-v2';
        if (localStorage.getItem(MIGRATION_KEY)) return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PANNEAUX);
            if (raw) {
                const obj = JSON.parse(raw);
                delete obj['eval-params'];
                delete obj['eval-evaluation'];
                delete obj['eval-retro'];
                localStorage.setItem(STORAGE_KEY_PANNEAUX, JSON.stringify(obj));
            }
        } catch (_) { console.warn('[Travaux-UI] eval widths migration skipped:', _.message || _); }
        localStorage.setItem(MIGRATION_KEY, '1');
    })();

    /**
     * Crée un séparateur draggable entre deux colonnes flex.
     * @param {Object} opts
     * @param {string} opts.id - ID du splitter
     * @param {string} opts.storageKey - Clé de persistence localStorage
     * @param {'left'|'right'} opts.side - Côté du panneau redimensionné
     * @param {number} opts.minWidth - Largeur minimale du panneau
     * @param {number} opts.maxWidth - Largeur maximale du panneau
     * @returns {HTMLDivElement}
     */
    function creerSplitter({ id, storageKey, side, minWidth, maxWidth }) {
        const handle = document.createElement('div');
        handle.className = 'splitter-handle';
        handle.id = id;

        function getPanel() {
            return side === 'left'
                ? handle.previousElementSibling
                : handle.nextElementSibling;
        }

        function getDefaultWidth(panel) {
            // Lire la valeur CSS initiale de flex-basis depuis la feuille de style
            const cs = window.getComputedStyle(panel);
            const fb = cs.flexBasis;
            return fb && fb !== 'auto' ? parseFloat(fb) : panel.getBoundingClientRect().width;
        }

        function startDrag(startX) {
            const panel = getPanel();
            if (!panel) return null;
            const startWidth = panel.getBoundingClientRect().width;
            handle.classList.add('splitter-active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            return { panel, startWidth, startX };
        }

        function onDrag(state, clientX) {
            if (!state) return;
            const delta = side === 'left'
                ? clientX - state.startX
                : state.startX - clientX;
            const newW = Math.min(maxWidth, Math.max(minWidth, state.startWidth + delta));
            state.panel.style.flexBasis = newW + 'px';
        }

        function endDrag(state) {
            if (!state) return;
            handle.classList.remove('splitter-active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            const finalW = state.panel.getBoundingClientRect().width;
            persisterLargeursPanneaux(storageKey, Math.round(finalW));
        }

        // Mouse events
        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const state = startDrag(e.clientX);
            if (!state) return;
            function onMove(e2) { onDrag(state, e2.clientX); }
            function onUp() {
                endDrag(state);
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Touch events (iPad)
        handle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const state = startDrag(touch.clientX);
            if (!state) return;
            function onTouchMove(e2) {
                e2.preventDefault();
                onDrag(state, e2.touches[0].clientX);
            }
            function onTouchEnd() {
                endDrag(state);
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
            }
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }, { passive: false });

        // Double-clic → reset à la largeur CSS par défaut
        handle.addEventListener('dblclick', function() {
            const panel = getPanel();
            if (!panel) return;
            panel.style.flexBasis = '';
            try {
                const raw = localStorage.getItem(STORAGE_KEY_PANNEAUX);
                if (raw) {
                    const obj = JSON.parse(raw);
                    delete obj[storageKey];
                    localStorage.setItem(STORAGE_KEY_PANNEAUX, JSON.stringify(obj));
                }
            } catch (_) { console.warn('[Travaux-UI] panel width reset skipped:', _.message || _); }
        });

        return handle;
    }

    /**
     * Crée un séparateur horizontal draggable entre deux sections flex (colonne).
     * Redimensionne le panneau du dessus (flexBasis en hauteur).
     */
    function creerSplitterH({ id, storageKey, minHeight, maxHeight }) {
        const handle = document.createElement('div');
        handle.className = 'splitter-handle splitter-handle-h';
        handle.id = id;

        function getPanel() {
            return handle.previousElementSibling;
        }

        function startDrag(startY) {
            const panel = getPanel();
            if (!panel) return null;
            const startHeight = panel.getBoundingClientRect().height;
            handle.classList.add('splitter-active');
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
            return { panel, startHeight, startY };
        }

        function onDrag(state, clientY) {
            if (!state) return;
            const delta = clientY - state.startY;
            const newH = Math.min(maxHeight, Math.max(minHeight, state.startHeight + delta));
            state.panel.style.flexBasis = newH + 'px';
            state.panel.style.flexGrow = '0';
        }

        function endDrag(state) {
            if (!state) return;
            handle.classList.remove('splitter-active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            const finalH = state.panel.getBoundingClientRect().height;
            persisterLargeursPanneaux(storageKey, Math.round(finalH));
        }

        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const state = startDrag(e.clientY);
            if (!state) return;
            function onMove(e2) { onDrag(state, e2.clientY); }
            function onUp() {
                endDrag(state);
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        handle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const state = startDrag(touch.clientY);
            if (!state) return;
            function onTouchMove(e2) {
                e2.preventDefault();
                onDrag(state, e2.touches[0].clientY);
            }
            function onTouchEnd() {
                endDrag(state);
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
            }
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }, { passive: false });

        // Double-clic → reset
        handle.addEventListener('dblclick', function() {
            const panel = getPanel();
            if (!panel) return;
            panel.style.flexBasis = '';
            panel.style.flexGrow = '';
            try {
                const raw = localStorage.getItem(STORAGE_KEY_PANNEAUX);
                if (raw) {
                    const obj = JSON.parse(raw);
                    delete obj[storageKey];
                    localStorage.setItem(STORAGE_KEY_PANNEAUX, JSON.stringify(obj));
                }
            } catch (_) { console.warn('[Travaux-UI] panel width reset skipped:', _.message || _); }
        });

        return handle;
    }

    /**
     * Restaure la hauteur persistée d'un panneau (pour splitters horizontaux).
     */
    function restaurerHauteurPanneau(panel, storageKey) {
        const h = obtenirLargeurPanneau(storageKey);
        if (h != null && panel) {
            panel.style.flexBasis = h + 'px';
            panel.style.flexGrow = '0';
        }
    }

    /* ===============================
       LAYOUT ANNOTATION ANCRÉ
       =============================== */

    function creerLayoutAnnotation(options) {
        options = options || {};
        const conteneurDocId = options.conteneurDocId || 'travaux-conteneur-document';
        const canvasContainerId = options.canvasContainerId || 'travaux-canvas-container';

        const conteneurDoc = document.getElementById(conteneurDocId);
        if (!conteneurDoc) return;

        // Ne pas recréer si déjà présent dans CE conteneur
        if (conteneurDoc.querySelector('.annot-layout-flex')) return;

        // --- Conteneur principal (position relative pour les palettes flottantes) ---
        const layoutFlex = document.createElement('div');
        layoutFlex.className = 'annot-layout-flex';
        if (conteneurDocId === 'travaux-conteneur-document') {
            layoutFlex.id = 'annot-layout-flex';
        }

        // --- Colonne document (prend tout l'espace) ---
        const colDoc = document.createElement('div');
        colDoc.className = 'annot-col-document';
        colDoc.id = 'annot-col-document';
        const canvasContainer = document.getElementById(canvasContainerId);
        if (canvasContainer) {
            colDoc.appendChild(canvasContainer);
        }
        layoutFlex.appendChild(colDoc);

        // --- Palette Annotation (flottante, positionnée par-dessus le canvas) ---
        const paletteDiv = document.createElement('div');
        paletteDiv.innerHTML = travauxOutils.genererHTMLPalette();
        const paletteEl = paletteDiv.firstElementChild;
        // Position par défaut : top-left
        paletteEl.style.top = '12px';
        paletteEl.style.left = '12px';
        layoutFlex.appendChild(paletteEl);

        // Insérer après la toolbar (.annot-toolbar ou .travaux-toolbar)
        const toolbar = conteneurDoc.querySelector('.annot-toolbar') || conteneurDoc.querySelector('.travaux-toolbar');
        if (toolbar) {
            toolbar.after(layoutFlex);
        } else {
            conteneurDoc.appendChild(layoutFlex);
        }

        // Marquer le conteneur
        conteneurDoc.classList.add('mode-annot-actif');
    }

    function detruireLayoutAnnotation(conteneurDocId) {
        conteneurDocId = conteneurDocId || 'travaux-conteneur-document';
        const conteneurDoc = document.getElementById(conteneurDocId);
        if (!conteneurDoc) return;

        // Trouver le layout dans CE conteneur (pas globalement)
        const layoutFlex = conteneurDoc.querySelector('.annot-layout-flex');
        if (!layoutFlex) return;

        // Remettre le canvas dans le conteneur principal
        const canvasContainerId = conteneurDocId === 'travaux-conteneur-document'
            ? 'travaux-canvas-container'
            : 'model-canvas-container';
        const canvasContainer = document.getElementById(canvasContainerId);
        if (canvasContainer) {
            conteneurDoc.appendChild(canvasContainer);
        }

        // Supprimer la palette d'annotation
        const palette = layoutFlex.querySelector('#travaux-palette-flottante');
        if (palette) palette.remove();

        layoutFlex.remove();

        conteneurDoc.classList.remove('mode-annot-actif');
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
            // 🔧 FIX (6 mars 2026) : Si un callback _apresOuvertureFichier est en attente
            // (ex: consulterEvaluationDepuisListe va ouvrir un fichier spécifique),
            // ne pas détruire/reconstruire le DOM — le ouvrirFichier() imminent s'en charge.
            // Sinon rafraichirUI → afficherFichiers détruit la visionneuse et crée une course.
            if (window._apresOuvertureFichier) {
                modeCourant = 'annoter';
                // S'assurer que le conteneur fichiers est visible (il peut être masqué
                // si le formulaire standalone était affiché par un consulter sans fichier)
                const conteneurFichiers = document.getElementById('evaluations-contenu-fichiers');
                if (conteneurFichiers) conteneurFichiers.classList.remove('u-hide');
                const evalDiv = document.getElementById('evaluations-contenu-evaluation');
                if (evalDiv) evalDiv.classList.add('u-hide');
                return;
            }

            // Navigation vers l'onglet Exporter : ne pas detruire la session d'annotation,
            // juste afficher la vue d'archivage
            if (sousSectionActive === 'evaluations-exporter') {
                afficherArchivage();
                return;
            }

            // Retour sur l'onglet Annoter : restaurer la session
            if (sousSectionActive === 'evaluations-annoter') {
                // Cas 1 : fichier deja ouvert dans la visionneuse — juste reactiver
                const fichierOuvert = travauxVisionneuse.getFichierActuel();
                if (fichierOuvert) {
                    if (typeof travauxAnnotation !== 'undefined' && travauxAnnotation.activerAnnotation) {
                        travauxAnnotation.activerAnnotation();
                    }
                    return;
                }
                // Cas 2 : pas de fichier ouvert mais un dernier fichier en session
                // (le module a ete initialise depuis un autre onglet, la restauration
                // initiale a ete ignoree car sousSectionActive n'etait pas 'annoter')
                const dernierFichier = sessionStorage.getItem('travaux-dernier-fichier');
                if (dernierFichier) {
                    const fichiers = travauxStockage.obtenirFichiersGroupeActif();
                    if (fichiers.some(function(f) { return f.id === dernierFichier; })) {
                        modeCourant = 'annoter';
                        rafraichirUI();
                        setTimeout(function() { ouvrirFichier(dernierFichier); }, 200);
                        return;
                    }
                }
            }

            const etaitEnModeEvaluer = (modeCourant === 'evaluer');
            // Forcer la sauvegarde des annotations AVANT de reconstruire le DOM
            // (sinon les annotations non sauvegardées sont perdues lors de la navigation)
            if (typeof travauxAnnotation !== 'undefined' && travauxAnnotation.desactiverAnnotation) {
                travauxAnnotation.desactiverAnnotation();
            }
            // Fermer les palettes eval AVANT rafraichirUI pour sauver les panneaux
            // (rafraichirUI → afficherFichiers détruit le conteneur document)
            if (document.getElementById('travaux-palette-eval-gauche')) {
                if (typeof sauvegarderSelectionsEvaluation === 'function') {
                    sauvegarderSelectionsEvaluation();
                }
                fermerModeEvaluation();
            }
            // Toujours réinitialiser modeCourant à 'annoter' après navigation
            // (sinon basculerMode('evaluer') retourne immédiatement si modeCourant est resté à 'evaluer')
            modeCourant = 'annoter';
            rafraichirUI();
            // Restaurer le mode Évaluer si c'était le mode actif avant navigation
            // 🔧 FIX (29 mars 2026) : Ne restaurer QUE sur l'onglet Annoter.
            // Sur Importer (éditeur) ou Exporter, la restauration déclenche
            // preRemplirEvaluation → chargerEvaluationExistanteSiPresente →
            // modifierEvaluationParId qui écrase l'éditeur après ~1 seconde.
            if (etaitEnModeEvaluer && sousSectionActive === 'evaluations-annoter') {
                const fichier = travauxVisionneuse.getFichierActuel();
                if (fichier && fichier.etudiantDA) {
                    setTimeout(() => {
                        basculerMode('evaluer');
                    }, 200);
                }
            }
            return;
        }


        // Initialiser les sous-modules
        await travauxStockage.initialiser();
        travauxVisionneuse.initialiser();
        travauxAnnotation.initialiser();

        moduleInitialise = true;

        // Corriger les groupeCoursId des fichiers orphelins
        corrigerGroupeCoursIdFichiers();

        const fichierRestaure = restaurerEtatSession();
        // 🔧 FIX (6 mars 2026) : Ne pas auto-restaurer un fichier si un callback
        // _apresOuvertureFichier est en attente — sinon l'auto-restauration consomme
        // le callback avant que le fichier cible ne soit ouvert.
        if (fichierRestaure && !window._apresOuvertureFichier) {
            const fichiers = travauxStockage.obtenirFichiersGroupeActif();
            if (fichiers.some(f => f.id === fichierRestaure)) {
                // Ne restaurer que si on est sur l'onglet Annoter (pas Importer/Exporter)
                setTimeout(() => {
                    var sousSection = (typeof sousSectionActive !== 'undefined') ? sousSectionActive : '';
                    if (sousSection !== 'evaluations-annoter') return;
                    // Vérifier à nouveau — le callback peut avoir été défini entre-temps
                    if (window._apresOuvertureFichier) return;
                    ouvrirFichier(fichierRestaure);
                }, 200);
            }
        }

        rafraichirUI();
    }

    /* ===============================
       AVERTISSEMENT RÉSOLUTION (Phase 2)
       =============================== */

    /**
     * Affiche une notification non-bloquante pour les ambiguïtés de résolution.
     * @param {Object} avertissement - Objet retourné par travauxResolution.dernierAvertissement()
     */
    function afficherAvertissementResolution(avertissement) {
        if (!avertissement) return;
        // Supprimer un avertissement précédent
        const ancien = document.getElementById('resolution-avertissement');
        if (ancien) ancien.remove();

        const msg = avertissement.type === 'ambiguite-evaluation'
            ? `Ambiguïté : ${avertissement.candidats.length} évaluations trouvées pour (${avertissement.da}, ${avertissement.productionId})`
            : `Ambiguïté : ${avertissement.candidats.length} fichiers trouvés pour (${avertissement.da}, ${avertissement.productionId})`;

        const div = document.createElement('div');
        div.id = 'resolution-avertissement';
        div.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:10000;padding:10px 16px;background:var(--couleur-attention,#f0ad4e);color:var(--couleur-texte-sombre,#333);font-size:14px;text-align:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)';
        div.textContent = msg;
        div.title = 'Cliquez pour fermer';
        div.addEventListener('click', () => div.remove());
        document.body.appendChild(div);

        // Auto-dismiss après 8 secondes
        setTimeout(() => { if (div.parentNode) div.remove(); }, 8000);
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

        const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();
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
                            <strong>Dépose tes fichiers</strong>
                            <small>Glisse des PDF ou images dans la zone ci-dessous</small>
                        </div>
                    </div>
                    <div class="zero-state-etape">
                        <span class="etape-numero">2</span>
                        <div>
                            <strong>Traite et identifie</strong>
                            <small>Le pipeline optimise et associe automatiquement</small>
                        </div>
                    </div>
                    <div class="zero-state-etape">
                        <span class="etape-numero">3</span>
                        <div>
                            <strong>Importe et annote</strong>
                            <small>Les fichiers sont stockés et prêts à annoter</small>
                        </div>
                    </div>
                </div>
            </div>` : '';

        conteneur.innerHTML = `
            <div class="pipeline-page">

                <div class="travaux-import-header">
                    <h3>Préparer et importer
                        <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle">📍</button>
                    </h3>
                    <div class="pipeline-stats">
                        ${queue.length > 0 ? `${queue.length} fichier(s) en file — ${travauxStockage.formaterTaille(queue.reduce((s, f) => s + f.tailleFichier, 0))}` : ''}
                    </div>
                </div>

                ${fsapiDispo ? `
                <div class="travaux-fsapi-config" data-tooltip="travaux-fsapi-config">
                    ${fsapiActif
                        ? '<span class="travaux-fsapi-statut actif">Stockage sur disque actif</span>'
                        : `<button class="btn btn-secondaire" data-action="travauxUI.configurerFSAPI">Configurer le stockage sur disque</button>
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
                                <p>Glisse tes fichiers ici</p>
                                <p class="texte-muted">PDF, JPEG, PNG, HEIC — ou clique pour parcourir</p>
                            </div>
                        </div>
                    </div>

                    ${queue.length > 0 ? `
                    <div class="pipeline-connecteur"></div>

                    <!-- ETAPE 2 : Fichiers deposes (3 colonnes) -->
                    <div class="pipeline-etape">
                        <div class="pipeline-etape-header">
                            <span class="pipeline-etape-numero">2</span>
                            <span class="pipeline-etape-titre" data-tooltip="travaux-pipeline-optimisation">Optimisation</span>
                            <span class="pipeline-etape-compteur">${nbImages} image(s)</span>
                        </div>
                        ${genererEtape2Colonnes(queue, groupes)}
                    </div>

                    <div class="pipeline-actions-import">
                        <div class="pipeline-boutons-groupe" style="flex-direction:row;justify-content:center;">
                            <button class="btn btn-principal" data-action="travauxUI.appliquerEtImporter">Importer</button>
                            <button class="btn btn-secondaire" data-action="travauxUI.annulerImport">Annuler tout</button>
                        </div>
                        <div class="pipeline-progression-container u-hide" id="pipeline-traitement-progression">
                            <div class="pipeline-progression-barre" id="pipeline-traitement-barre"></div>
                        </div>
                        <div id="pipeline-traitement-texte" class="texte-muted"></div>
                    </div>
                    ` : ''}

                    </div><!-- /pipeline-etapes-contenu -->
                </div><!-- /pipeline-etapes-groupe -->

                ${(() => {
                    const sansProduction = queue.filter(f => !f.productionId).length;
                    if (sansProduction > 0) {
                        return `<div class="info-box info-box--attention" style="margin-top: 12px;">
                            ⚠️ ${sansProduction} fichier(s) ne sont associés à aucune production.
                            Vérifie que les productions ont été créées dans « Construction de la note ».
                        </div>`;
                    }
                    return '';
                })()}

            </div>
        `;

        // Initialiser le drag-drop
        const dropZone = document.getElementById('travaux-drop-zone');
        travauxImport.initialiserDropZone(dropZone, (prepares) => {
            identifierAutoPipeline();
            rafraichirPipelineUI();
        });

        // Charger les thumbnails async pour les placeholders data-thumbnail-id
        travauxStockage.chargerThumbnailsConteneur(conteneur);

        // Lancer les previews apres le rendu si des fichiers sont en queue
        if (queue.length > 0) {
            mettreAJourPreviewsPipeline();
        }

        // Synchroniser le scroll entre colonnes gauche et droite
        requestAnimationFrame(() => initialiserSyncScrollColonnes());
    }

    /**
     * Affiche la grille de fichiers dans l'onglet Annoter et évaluer
     * État initial : sélection de fichier pour annotation
     */
    function afficherFichiers() {
        // Ne pas écraser le formulaire d'évaluation si modifierEvaluation() est en cours
        // (sinon rafraichirUI masque le formulaire avant qu'il ne soit rendu visible)
        if (window._modifierEvaluationEnCours) return;

        const conteneur = document.getElementById('evaluations-contenu-fichiers');
        if (!conteneur) return;

        conteneur.classList.remove('u-hide');
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (evalDiv) evalDiv.classList.add('u-hide');

        const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();

        if (fichiersTravaux.length === 0) {
            conteneur.innerHTML = `
                <div class="conteneur">
                    <h2>Annoter et évaluer <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle">📍</button></h2>
                    <p class="text-muted">Aucun fichier importé. Importe des travaux depuis l'onglet « Préparer et importer ».</p>
                </div>`;
            return;
        }

        // Stocker le HTML badges pour injection dans la toolbar (Phase A — 1 rangée)
        _htmlBadgesGrille = genererGrilleFichiers(fichiersTravaux, 'ouvrirFichier');

        // Si la visionneuse est déjà ouverte, la recréer avec les badges à jour
        if (document.getElementById('travaux-conteneur-document')) {
            conteneur.innerHTML = '';
            afficherVisionneuse();
            if (productionFiltreActive) {
                filtrerBadgesParProduction();
            }
            return;
        }

        // État A — Afficher le tableau de fichiers (vue par défaut)
        conteneur.innerHTML = genererTableauFichiers(fichiersTravaux);

        // Post-render : initialiser les valeurs des <select> de production
        fichiersTravaux.forEach(f => {
            if (f.productionId) {
                const sel = document.getElementById('travaux-tableau-prod-' + f.id);
                if (sel) sel.value = f.productionId;
            }
        });

        // Brancher le « tout sélectionner »
        const cbTout = document.getElementById('travaux-tableau-tout-selectionner');
        if (cbTout) {
            cbTout.addEventListener('change', function() {
                const cbs = document.querySelectorAll('#travaux-tableau-fichiers .travaux-tableau-checkbox');
                cbs.forEach(cb => {
                    // Ne cocher que les lignes visibles
                    if (!cb.closest('tr').classList.contains('u-hide')) {
                        cb.checked = cbTout.checked;
                    }
                });
            });
        }

        // Appliquer le filtre production persisté
        if (productionFiltreActive) {
            filtrerTableauFichiers();
        }
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

                    <!-- Toolbar unique (badges + outils — Phase A) -->
                    <div class="annot-toolbar">
                        ${_htmlDropdownProduction ? `<div class="annot-toolbar-production">${_htmlDropdownProduction}</div>` : ''}
                        <div class="annot-toolbar-fichiers travaux-fichiers-compact">
                            ${_htmlBadgesGrille}
                        </div>
                        <div class="annot-toolbar-separateur"></div>
                        <div class="annot-toolbar-outils">
                            <button id="travaux-btn-page-prec" class="travaux-btn-nav" data-action="travauxVisionneuse.pagePrecedente" disabled title="Page précédente">&#x2190;</button>
                            <span id="travaux-indicateur-page">-- / --</span>
                            <button id="travaux-btn-page-suiv" class="travaux-btn-nav" data-action="travauxVisionneuse.pageSuivante" disabled title="Page suivante">&#x2192;</button>
                            <span class="travaux-separateur"></span>
                            <button id="travaux-btn-badge-prec" class="travaux-btn-nav" data-action="travauxUI.badgePrecedent" disabled title="Fichier précédent">&#x2190;</button>
                            <span id="travaux-compteur-badge" class="travaux-compteur-badge">-- / --</span>
                            <button id="travaux-btn-badge-suiv" class="travaux-btn-nav" data-action="travauxUI.badgeSuivant" disabled title="Fichier suivant">&#x2192;</button>
                            <span class="travaux-separateur"></span>
                            <button class="travaux-btn-nav" data-action="travauxVisionneuse.zoomPleineLargeur" title="Ajuster à la largeur">&#x2194;</button>
                            <button class="travaux-btn-nav" data-action="travauxVisionneuse.zoomPleineHauteur" title="Ajuster à la hauteur">&#x2195;</button>
                            <button id="travaux-btn-zoom100" class="travaux-btn-zoom" data-action="travauxVisionneuse.zoom100" title="Remettre à 100%">100%</button>
                            <span class="travaux-separateur"></span>
                            <button id="travaux-btn-annoter" class="travaux-btn-action actif" data-action="travauxUI.basculerMode" data-param="annoter" data-tooltip="travaux-btn-annoter">Annoter</button>
                            <button id="travaux-btn-evaluer" class="travaux-btn-action travaux-btn-action-vert u-hide" data-action="travauxUI.basculerMode" data-param="evaluer" title="Évaluer cette production" data-tooltip="travaux-btn-evaluer">Évaluer</button>
                            <button id="travaux-btn-alleger" class="travaux-btn-action u-hide" data-action="travauxUI.allegerFichierActuel" title="Alléger ce fichier" data-tooltip="travaux-btn-alleger">Alléger</button>
                            <button id="travaux-btn-reimporter" class="travaux-btn-action u-hide" data-action="travauxUI.reimporterFichierActuel" title="Re-importer l'original" data-tooltip="travaux-btn-reimporter">Re-importer</button>
                            <!-- Chronomètre déplacé dans la palette Paramètres -->
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
                            <p>Clique sur un fichier ci-dessus pour l'ouvrir</p>
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

        const tousEtudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const productions = obtenirDonneesSelonMode(cle('productions'));
        const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();
        const dasActifs = new Set(fichiersTravaux.map(f => f.etudiantDA).filter(Boolean));
        const etudiants = tousEtudiants.filter(e => dasActifs.has(e.da));
        const tailleFiltree = fichiersTravaux.reduce((acc, f) => acc + (f.tailleFichier || 0), 0);
        const tailleFormatee = tailleFiltree >= 1048576
            ? (tailleFiltree / 1048576).toFixed(1) + ' Mo'
            : (tailleFiltree / 1024).toFixed(1) + ' Ko';

        conteneur.innerHTML = `
            <h3>Archivage des travaux <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle">📍</button></h3>
            <p class="texte-muted">${fichiersTravaux.length} fichier(s) en stock (${tailleFormatee})</p>

            ${genererGrilleFichiers(fichiersTravaux, 'ouvrirPreviewInline')}

            <div class="travaux-archivage-options">
                <!-- Exporter des travaux -->
                <div class="travaux-archivage-carte">
                    <h4>Exporter des travaux</h4>
                    <p class="texte-muted">Évaluations en JSON + productions en PDF</p>
                    <div class="travaux-archivage-filtres">
                        <div class="groupe-form">
                            <label>Production</label>
                            <select id="travaux-archivage-production" class="form-select">
                                <option value="">— Toutes —</option>
                                ${productions.map(p => `<option value="${p.id}">${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="groupe-form">
                            <label>Étudiant·e</label>
                            <select id="travaux-archivage-etudiant" class="form-select">
                                <option value="">— Tous —</option>
                                ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${e.da}">${e.nom ? echapperHtml(e.nom + ', ' + e.prenom) : echapperHtml(e.prenom)} (${e.daAffichage || e.da})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-principal" data-action="travauxUI.lancerArchivage">Télécharger</button>
                </div>

                <!-- Semestre complet -->
                <div class="travaux-archivage-carte">
                    <h4>Semestre complet</h4>
                    <p class="texte-muted">Toutes les productions en PDF classées par élève + évaluations en JSON</p>
                    <div class="travaux-archivage-filtres">
                        <div class="groupe-form">
                            <label>Production</label>
                            <select id="travaux-archivage-semestre-production" class="form-select">
                                <option value="">— Toutes —</option>
                                ${productions.map(p => `<option value="${p.id}">${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="groupe-form">
                            <label>Étudiant·e</label>
                            <select id="travaux-archivage-semestre-etudiant" class="form-select">
                                <option value="">— Tous —</option>
                                ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${e.da}">${e.nom ? echapperHtml(e.nom + ', ' + e.prenom) : echapperHtml(e.prenom)} (${e.daAffichage || e.da})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div id="travaux-texte-progression" class="texte-muted"></div>
                    <div class="travaux-barre-progression-container">
                        <div id="travaux-barre-progression" class="travaux-barre-progression"></div>
                    </div>
                    <button class="btn btn-principal" data-action="travauxUI.lancerArchivageSemestre">Télécharger archive</button>
                </div>

                <!-- Export Lea -->
                <div class="travaux-archivage-carte">
                    <h4>Export Lea</h4>
                    <p class="texte-muted">Production annotée + évaluation (note et rétroaction) en PDF pour téléversement dans Lea</p>
                    <div class="travaux-archivage-filtres">
                        <div class="groupe-form">
                            <label>Production</label>
                            <select id="travaux-archivage-lea-production" class="form-select" data-on-change="travauxUI.mettreAJourCompteurLea">
                                <option value="">— Choisir —</option>
                                ${productions.map(p => `<option value="${p.id}">${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="groupe-form">
                            <label>Étudiant·e</label>
                            <select id="travaux-archivage-lea-etudiant" class="form-select" data-on-change="travauxUI.mettreAJourCompteurLea">
                                <option value="">— Tous —</option>
                                ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${e.da}">${e.nom ? echapperHtml(e.nom + ', ' + e.prenom) : echapperHtml(e.prenom)} (${e.daAffichage || e.da})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <label style="display:flex;align-items:center;gap:6px;margin-top:6px;cursor:pointer">
                        <input type="checkbox" id="travaux-lea-reprises-seulement" data-on-change="travauxUI.mettreAJourCompteurLea">
                        Reprises seulement
                    </label>
                    <div id="travaux-lea-compteur" class="texte-muted"></div>
                    <div id="travaux-texte-progression-lea" class="texte-muted"></div>
                    <div class="travaux-barre-progression-container">
                        <div id="travaux-barre-progression-lea" class="travaux-barre-progression"></div>
                    </div>
                    <button class="btn btn-confirmer" data-action="travauxUI.lancerExportLea">Exporter pour Lea</button>
                </div>
            </div>

            <!-- Allegement -->
            <div class="travaux-archivage-carte">
                <h4 data-tooltip="travaux-archivage-alleger">Alléger les travaux exportés</h4>
                <p class="texte-muted">Convertit les originaux exportés en fac-similés (NdG, 800px). Les annotations et évaluations sont conservées.</p>
                <button class="btn btn-secondaire" data-action="travauxArchivage.lancerAllegement">Alléger les travaux exportés</button>
            </div>

            <!-- Quota stockage -->
            <div class="travaux-quota-section">
                <h4>Espace de stockage</h4>
                <div id="travaux-quota-info">Chargement...</div>
            </div>
        `;

        // Charger les infos quota
        chargerQuota();

        // Appliquer le filtre de production si actif (dropdown sélectionné au rendu)
        if (productionFiltreActive) {
            const selectArchivage = conteneur.querySelector('.travaux-filtre-production');
            if (selectArchivage) filtrerBadgesParProduction(selectArchivage);
        }
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
        if (!optDPI || f.format11x17) {
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
            var pdfThumb = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
            if (pdfThumb) {
                conteneur.innerHTML = `<img src="${pdfThumb}" alt="">`;
            } else {
                conteneur.innerHTML = '<span class="pipeline-icone-placeholder">&#x1F4C4;</span>';
            }
            return;
        }

        // Utiliser le blob original pour une preview de qualite
        const source = f.fichier || null;
        var imgThumb = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
        if (!source && !imgThumb) {
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
                    img.src = imgThumb;
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
            // Generer le preview post-traitement (colonne droite)
            genererPreviewThumbnail(f, index);
        });

        // Generer la preview centre si un fichier est selectionne
        if (fichierSelectionneIndex >= 0 && fichierSelectionneIndex < queue.length) {
            genererPreviewCentre(queue[fichierSelectionneIndex], fichierSelectionneIndex);
        }
    }

    /**
     * Genere la thumbnail originale pour la colonne Originaux
     * @param {Object} f - Fichier prepare
     * @param {number} index - Index dans la queue
     */
    async function genererOriginalThumbnail(f, index) {
        const conteneur = document.getElementById('pipeline-original-' + index);
        if (!conteneur) return;

        // Toujours utiliser le blob original (pas le blob traite)
        const source = f.fichierOriginal || f.fichier || null;
        if (!source) {
            // Fallback sur thumbnail IDB
            var origFallback = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
            if (origFallback) {
                conteneur.innerHTML = `<img src="${origFallback}" alt="">`;
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
            var origCatchFallback = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
            if (origCatchFallback) {
                conteneur.innerHTML = `<img src="${origCatchFallback}" alt="">`;
            }
        }
    }

    /**
     * Decode une operation de preparation en texte lisible
     */
    function decrireOperation(op) {
        if (!op || !op.type) return '';
        switch (op.type) {
            case 'rotation': return 'Rotation ' + (op.angle > 0 ? '+' : '') + op.angle + '\u00b0';
            case 'perspective': return 'Perspective';
            case 'crop': return 'Rognage';
            case 'contraste': return 'Contraste ' + (op.valeur > 0 ? '+' : '') + op.valeur;
            case 'luminosite': return 'Luminosit\u00e9 ' + (op.valeur > 0 ? '+' : '') + op.valeur;
            case 'niveaux-gris': return 'Niveaux de gris';
            case 'inverser': return 'Inversion';
            case 'balance-blancs': return 'Balance des blancs';
            default: return op.type;
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

        // Production globale actuelle (prioriser le choix explicite de l'utilisateur)
        const prodActuelle = travauxImport.getProductionGlobale()
            || queue.find(f => f.productionId && !f.productionIdParLea)?.productionId
            || sessionStorage.getItem('travaux-pipeline-production')
            || '';

        // Jetons de reprise : vérifier si le système est actif
        const configJetons = (typeof obtenirConfigJetons === 'function') ? obtenirConfigJetons() : null;
        const jetonsActifs = configJetons && configJetons.actif;
        const modeJetonActif = queue.some(f => f.estReprise);

        // === Colonne gauche : Originaux (apercu pre-traitement) ===
        // Index des groupes multi-fichiers pour affichage visuel
        const groupesMulti = new Map(); // groupeDocumentId → [indices]
        queue.forEach((f, index) => {
            if (f.groupeDocumentId) {
                if (!groupesMulti.has(f.groupeDocumentId)) groupesMulti.set(f.groupeDocumentId, []);
                groupesMulti.get(f.groupeDocumentId).push(index);
            }
        });
        // Ne garder que les groupes avec 2+ fichiers
        for (const [cle, indices] of groupesMulti) {
            if (indices.length < 2) groupesMulti.delete(cle);
        }

        let colGauche = '<div class="pipeline-col-originaux">';
        colGauche += '<div class="pipeline-col-titre">Originaux</div>';
        const groupesOuverts = new Set(); // pour tracker les debuts de groupe

        queue.forEach((f, index) => {
            const thumb = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
            const icone = f.estPDF ? '&#x1F4C4;' : '&#x1F5BC;';
            const nomCourt = (f.parseLea.nom || f.nomFichier).substring(0, 18);
            const resolution = (f.largeurOriginale && f.hauteurOriginale)
                ? `${f.largeurOriginale} x ${f.hauteurOriginale}`
                : 'PDF';
            const poids = travauxStockage.formaterTaille(f.tailleFichier);
            const selectionne = (index === fichierSelectionneIndex);

            // Debut d'un groupe multi-fichiers
            const groupeId = f.groupeDocumentId;
            const indicesGroupe = groupeId ? groupesMulti.get(groupeId) : null;
            if (indicesGroupe && !groupesOuverts.has(groupeId)) {
                groupesOuverts.add(groupeId);
                colGauche += `<div class="pipeline-groupe-encadre" data-groupe-id="${echapperHtml(groupeId)}">
                    <div class="pipeline-groupe-entete">
                        <span class="pipeline-groupe-badge">${indicesGroupe.length} pages &rarr; 1 PDF</span>
                        <button class="pipeline-groupe-defaire" data-stop data-action="travauxUI.defaireGroupePipeline" data-param="${echapperHtml(groupeId)}" title="Défaire le regroupement">&times;</button>
                    </div>`;
            }

            colGauche += `<div class="pipeline-fichier-ligne${selectionne ? ' pipeline-fichier-selectionne' : ''}${indicesGroupe ? ' pipeline-fichier-groupe' : ''}" data-action="travauxUI.selectionnerFichierPipeline" data-param="${index}">
                <span class="pipeline-fichier-numero">${index + 1}</span>
                <div class="pipeline-reorder-btns">
                    <button class="pipeline-btn-reorder" data-stop data-action="travauxUI.monterFichierPipeline" data-param="${index}" ${index === 0 ? 'disabled' : ''} title="Monter">&uarr;</button>
                    <button class="pipeline-btn-reorder" data-stop data-action="travauxUI.descendreFichierPipeline" data-param="${index}" ${index === queue.length - 1 ? 'disabled' : ''} title="Descendre">&darr;</button>
                </div>
                <div class="pipeline-fichier-thumb-col" id="pipeline-original-${index}">
                    ${thumb ? `<img src="${thumb}" alt="">` : `<span class="pipeline-icone-placeholder">${icone}</span>`}
                </div>
                <div class="pipeline-fichier-meta-col">
                    <span class="pipeline-meta-nom" title="${echapperHtml(f.nomFichier)}">${echapperHtml(nomCourt)}</span>
                    <span class="pipeline-meta-resolution">${resolution}</span>
                    <span class="pipeline-meta-taille">${poids}</span>
                </div>
                <button class="pipeline-btn-retirer" data-stop data-action="travauxUI.retirerFichierPipeline" data-param="${index}" title="Retirer ce fichier">&times;</button>
            </div>`;

            // Fin d'un groupe multi-fichiers
            if (indicesGroupe && index === indicesGroupe[indicesGroupe.length - 1]) {
                colGauche += '</div>'; // fermer .pipeline-groupe-encadre
            }
        });
        colGauche += '</div>';

        // === Colonne centre : Reglages globaux + Preview ===
        let colCentre = '<div class="pipeline-col-centre">';

        // Zone A : Reglages globaux (toujours visible)
        colCentre += '<div class="pipeline-centre-global">';
        colCentre += '<div class="pipeline-col-titre">Inspecteur</div>';

        colCentre += `<div class="pipeline-production-selecteur">
            <label>Production</label>
            <select class="form-select" id="pipeline-select-production" data-on-change="travauxUI.associerProductionGlobale">
                <option value="">-- Choisir une production --</option>
                ${productions.map(p => `<option value="${p.id}" ${prodActuelle === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                ${jetonsActifs ? `<option value="__jeton_reprise__" ${prodActuelle === '__jeton_reprise__' || modeJetonActif ? 'selected' : ''}>Jeton de reprise</option>` : ''}
            </select>
        </div>`;
        // Sous-sélecteur : quelle production le jeton cible-t-il ?
        if (prodActuelle === '__jeton_reprise__' || modeJetonActif) {
            const prodJeton = queue.find(f => f.estReprise && f.productionId)?.productionId
                || sessionStorage.getItem('travaux-jeton-production')
                || '';
            colCentre += `<div class="pipeline-jeton-sous-select" id="pipeline-jeton-production">
                <label>Pour quelle production ?</label>
                <select class="form-select" data-on-change="travauxUI.associerJetonProduction">
                    <option value="">-- Choisir --</option>
                    ${productions.map(p => `<option value="${p.id}" ${prodJeton === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                </select>
            </div>`;
        }

        colCentre += '<p class="texte-muted u-texte-petit" style="margin:8px 0 4px 0;">R\u00e9glages par d\u00e9faut\u00a0:</p>';

        colCentre += '<ul class="pipeline-checklist">';
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-dpi" checked data-on-change="travauxUI.mettreAJourPreviewsPipeline"> Uniformisation 200 dpi</label></li>`;
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-balance" checked data-on-change="travauxUI.mettreAJourPreviewsPipeline"> Balance des blancs</label></li>`;
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-doublons" checked> D\u00e9tection doublons (manuel)</label></li>`;
        colCentre += `<li><label><input type="checkbox" id="pipeline-opt-assemblage" checked> Assemblage automatique (par nom / production)</label></li>`;
        colCentre += '</ul>';

        // Alerte globale : blobs manquants après restauration session
        const nbBlobsManquants = queue.filter(f => !f.fichier).length;
        if (nbBlobsManquants > 0) {
            colCentre += `<div class="pipeline-alerte-blobs" style="margin-top:8px; padding:8px 10px; background: var(--orange-pale, rgba(255,152,0,0.1)); border-radius: var(--radius); border-left: 3px solid var(--orange);">
                <p class="u-texte-petit" style="margin:0 0 6px 0; color: var(--orange);"><strong>${nbBlobsManquants} fichier${nbBlobsManquants > 1 ? 's' : ''}</strong> ${nbBlobsManquants > 1 ? 'doivent' : 'doit'} \u00eatre re-d\u00e9pos\u00e9${nbBlobsManquants > 1 ? 's' : ''} (session restaur\u00e9e).</p>
                <button class="btn btn-secondaire btn-sm" data-action="travauxUI.redeposerFichiers">Re-d\u00e9poser les fichiers</button>
            </div>`;
        }

        const fSel = queue[fichierSelectionneIndex];
        const btnReglagesDisabled = fichierSelectionneIndex < 0 || !fSel?.estImage || !fSel?.fichier;
        colCentre += `<button class="btn btn-secondaire" style="margin-top:8px;" ${btnReglagesDisabled ? 'disabled' : ''} data-action="travauxUI.ouvrirPreparationFichier" data-param="${fichierSelectionneIndex}">R\u00e9glages sp\u00e9cifiques</button>`;

        colCentre += '</div>'; // fin pipeline-centre-global

        // Zone B : Apercu (conditionnelle)
        colCentre += '<div class="pipeline-centre-preview">';
        if (fichierSelectionneIndex >= 0 && fichierSelectionneIndex < queue.length) {
            const f = queue[fichierSelectionneIndex];
            const idx = fichierSelectionneIndex;
            const dims = calculerDimensionsCibles(f);
            const tailleEst = estimerTailleFichier(dims.w, dims.h, f);
            const resCible = f.estPDF ? 'PDF (aucun traitement)' : `${dims.w} x ${dims.h}`;

            colCentre += '<div class="pipeline-col-titre">Aper\u00e7u</div>';

            // Grande preview
            colCentre += `<div class="pipeline-preview-centre" id="pipeline-preview-centre">
                <span class="pipeline-icone-placeholder">&#x1F5BC;</span>
            </div>`;

            // Metadata du fichier
            colCentre += '<p class="texte-muted u-texte-petit" style="margin:10px 0 4px 0;">M\u00e9tadonn\u00e9es</p>';
            const modeLea = f.modeImport !== 'autre';
            const dateVal = f.dateFichier ? new Date(f.dateFichier).toISOString().substring(0, 10) : '';
            const nomEtudiant = f.etudiantAssocie
                ? echapperHtml((f.etudiantAssocie.prenom || '') + ' ' + (f.etudiantAssocie.nom || ''))
                : '';

            colCentre += '<div class="pipeline-meta-champs" style="margin-top:4px;">';
            // Toggle LEA/Autre
            colCentre += `<div class="pipeline-mode-toggle">
                <label class="pipeline-radio-label">
                    <input type="radio" name="pipeline-mode-${idx}" value="lea"
                        ${modeLea ? 'checked' : ''}
                        data-on-change="travauxUI.toggleModeImport" data-param="${idx}" data-param2="lea">
                    LEA
                </label>
                <label class="pipeline-radio-label">
                    <input type="radio" name="pipeline-mode-${idx}" value="autre"
                        ${!modeLea ? 'checked' : ''}
                        data-on-change="travauxUI.toggleModeImport" data-param="${idx}" data-param2="autre">
                    Autre
                </label>
            </div>`;

            // Champs communs LEA et Autre (auto-remplis en LEA, vides/editables en Autre)
            colCentre += `<div class="pipeline-champ">
                <label>\u00c9tudiant</label>
                <input type="text" class="pipeline-input-etudiant" id="pipeline-etudiant-${idx}"
                    value="${modeLea ? nomEtudiant : echapperHtml(f.etudiantManuel || '')}" placeholder="Rechercher..."
                    data-on-input="travauxUI.rechercherEtudiant" data-param="${idx}"
                    data-on-focusin="travauxUI.ouvrirListeEtudiants"
                    autocomplete="off">
                <div class="pipeline-autocomplete-liste u-hide" id="pipeline-autocomplete-${idx}"></div>
            </div>`;
            colCentre += `<div class="pipeline-champ">
                <label>Production</label>
                <select class="form-select pipeline-select-petit" data-on-change="travauxUI.changerProductionPipeline" data-param="${idx}">
                    <option value="">--</option>
                    ${productions.map(p => `<option value="${p.id}" ${f.productionId === p.id && !f.estReprise ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                    ${jetonsActifs ? `<option value="__jeton_reprise__" ${f.estReprise ? 'selected' : ''}>Jeton de reprise</option>` : ''}
                </select>
            </div>`;
            // Sous-sélecteur par fichier pour jeton
            if (f.estReprise) {
                colCentre += `<div class="pipeline-champ pipeline-jeton-sous-select">
                    <label>Pour quelle production ?</label>
                    <select class="form-select pipeline-select-petit" data-on-change="travauxUI.changerJetonProductionPipeline" data-param="${idx}">
                        <option value="">--</option>
                        ${productions.map(p => `<option value="${p.id}" ${f.productionId === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                    </select>
                </div>`;
            }
            colCentre += `<div class="pipeline-champ">
                <label>Date</label>
                <input type="date" class="pipeline-input-date" value="${dateVal}" data-on-change="travauxUI.changerDateFichier" data-param="${idx}">
            </div>`;

            colCentre += '</div>'; // fin pipeline-meta-champs

            // Lien deselectionner
            colCentre += `<a href="#" class="texte-muted u-texte-petit" style="margin-top:6px;display:inline-block;" data-prevent data-action="travauxUI.deselectionnerFichierPipeline">D\u00e9s\u00e9lectionner</a>`;
        } else {
            // Placeholder
            colCentre += `<div class="pipeline-preview-placeholder">
                <span style="font-size:2rem;opacity:0.3;">&#x1F5BC;</span>
                <p class="texte-muted">Clique sur un fichier \u00e0 gauche pour le pr\u00e9visualiser</p>
            </div>`;
        }
        colCentre += '</div>'; // fin pipeline-centre-preview
        colCentre += '</div>'; // fin pipeline-col-centre

        // === Colonne droite : Apercu post-traitement ===
        let colDroite = '<div class="pipeline-col-confirmes">';
        colDroite += '<div class="pipeline-col-titre">Aper\u00e7u</div>';
        queue.forEach((f, index) => {
            const dims = calculerDimensionsCibles(f);
            const tailleEst = estimerTailleFichier(dims.w, dims.h, f);
            const resCible = f.estPDF ? 'PDF' : `${dims.w} x ${dims.h}`;
            const thumb = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
            const nomEtudiant = f.etudiantAssocie
                ? echapperHtml(f.etudiantAssocie.nom || '')
                : '';

            let badgeSpecifique = '';
            if (f.operations && f.operations.length > 0) {
                const listeOps = f.operations.map(decrireOperation).filter(Boolean).join(', ');
                badgeSpecifique = `<span class="pipeline-badge pipeline-badge-specifique">Sp\u00e9cifique</span>`;
                badgeSpecifique += `<span class="pipeline-meta-ops texte-muted">${echapperHtml(listeOps)}</span>`;
            }

            colDroite += `<div class="pipeline-fichier-colonne">
                <span class="pipeline-fichier-numero">${index + 1}</span>
                <div class="pipeline-fichier-thumb-col" id="pipeline-preview-${index}">
                    ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span class="pipeline-icone-placeholder">${f.estPDF ? '&#x1F4C4;' : '&#x1F5BC;'}</span>`}
                </div>
                <div class="pipeline-fichier-meta-col">
                    ${badgeSpecifique}
                    ${nomEtudiant ? `<span class="pipeline-meta-nom">${nomEtudiant}</span>` : ''}
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
     * Preserve les positions de scroll des colonnes gauche/droite
     */
    function rafraichirPipelineUI() {
        const queue = travauxImport.obtenirFileDAttente();
        if (fichierSelectionneIndex >= queue.length) fichierSelectionneIndex = -1;

        // Sauvegarder les positions de scroll avant re-rendu
        const colG = document.querySelector('.pipeline-col-originaux');
        const scrollGauche = colG ? colG.scrollTop : 0;

        afficherImport();

        // Restaurer les positions de scroll apres re-rendu
        requestAnimationFrame(() => {
            const newColG = document.querySelector('.pipeline-col-originaux');
            const newColD = document.querySelector('.pipeline-col-confirmes');
            if (newColG) newColG.scrollTop = scrollGauche;
            if (newColD) newColD.scrollTop = scrollGauche;
            initialiserSyncScrollColonnes();
        });
    }

    /**
     * Selectionne un fichier dans la colonne gauche du pipeline
     * @param {number} index - Index du fichier dans la queue
     */
    function selectionnerFichierPipeline(index) {
        fichierSelectionneIndex = index;

        // Sauvegarder le scroll avant re-rendu
        const colG = document.querySelector('.pipeline-col-originaux');
        const scrollAvant = colG ? colG.scrollTop : 0;

        const queue = travauxImport.obtenirFileDAttente();
        if (fichierSelectionneIndex >= queue.length) fichierSelectionneIndex = -1;
        afficherImport();

        // Restaurer le scroll et defiler vers le fichier selectionne
        requestAnimationFrame(() => {
            const newColG = document.querySelector('.pipeline-col-originaux');
            const newColD = document.querySelector('.pipeline-col-confirmes');
            if (newColG) newColG.scrollTop = scrollAvant;
            if (newColD) newColD.scrollTop = scrollAvant;

            // Defiler vers le fichier selectionne si hors de la vue
            const selectionne = newColG?.querySelector('.pipeline-fichier-selectionne');
            if (selectionne && newColG) {
                const rect = selectionne.getBoundingClientRect();
                const contRect = newColG.getBoundingClientRect();
                if (rect.top < contRect.top || rect.bottom > contRect.bottom) {
                    selectionne.scrollIntoView({ block: 'nearest', behavior: 'instant' });
                    if (newColD) newColD.scrollTop = newColG.scrollTop;
                }
            }
            initialiserSyncScrollColonnes();
        });
    }

    /**
     * Synchronise le scroll entre les colonnes gauche et droite du pipeline.
     * Appelee apres chaque re-rendu pour reattacher les listeners.
     */
    function initialiserSyncScrollColonnes() {
        const colG = document.querySelector('.pipeline-col-originaux');
        const colD = document.querySelector('.pipeline-col-confirmes');
        if (!colG || !colD) return;

        let enSync = false;
        colG.addEventListener('scroll', function() {
            if (enSync) return;
            enSync = true;
            colD.scrollTop = colG.scrollTop;
            enSync = false;
        });
        colD.addEventListener('scroll', function() {
            if (enSync) return;
            enSync = true;
            colG.scrollTop = colD.scrollTop;
            enSync = false;
        });
    }

    /**
     * Deselectionne le fichier courant dans le pipeline
     */
    function deselectionnerFichierPipeline() {
        fichierSelectionneIndex = -1;
        rafraichirPipelineUI();
    }

    /**
     * Defait le regroupement d'un groupe dans le pipeline
     * Vide le groupeDocumentId de tous les fichiers du groupe
     * @param {string} groupeId - L'identifiant du groupe
     */
    function defaireGroupePipeline(groupeId) {
        const queue = travauxImport.obtenirFileDAttente();
        queue.forEach(f => {
            if (f.groupeDocumentId === groupeId) {
                f.groupeDocumentId = '';
            }
        });
        rafraichirPipelineUI();
    }

    /**
     * Monte un fichier d'un cran dans le pipeline et ajuste la selection
     * @param {number} index - Index du fichier a monter
     */
    function monterFichierPipeline(index) {
        travauxImport.monterFichier(index);
        if (fichierSelectionneIndex === index) fichierSelectionneIndex = index - 1;
        else if (fichierSelectionneIndex === index - 1) fichierSelectionneIndex = index;
        rafraichirPipelineUI();
    }

    /**
     * Descend un fichier d'un cran dans le pipeline et ajuste la selection
     * @param {number} index - Index du fichier a descendre
     */
    function descendreFichierPipeline(index) {
        travauxImport.descendreFichier(index);
        if (fichierSelectionneIndex === index) fichierSelectionneIndex = index + 1;
        else if (fichierSelectionneIndex === index + 1) fichierSelectionneIndex = index;
        rafraichirPipelineUI();
    }

    /**
     * Retire un fichier de la queue depuis la colonne gauche du pipeline
     * @param {number} index - Index du fichier dans la queue
     */
    function retirerFichierPipeline(index) {
        const queue = travauxImport.obtenirFileDAttente();
        const nom = (queue[index] && queue[index].nomFichier) || 'ce fichier';
        if (!confirm(`Retirer « ${nom} » de la liste ?`)) return;
        // Ajuster la selection si necessaire
        if (fichierSelectionneIndex === index) {
            fichierSelectionneIndex = -1;
        } else if (fichierSelectionneIndex > index) {
            fichierSelectionneIndex--;
        }
        travauxImport.retirerFichier(index);
    }

    /**
     * Ouvre un sélecteur de fichiers pour re-déposer les blobs manquants
     * après une restauration de session (les File ne sont pas sérialisables).
     */
    function redeposerFichiers() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,.jpg,.jpeg,.png,.heic,.heif';
        input.style.cssText = 'position:fixed;top:-9999px;opacity:0;pointer-events:none;';
        document.body.appendChild(input);
        input.addEventListener('change', function() {
            if (input.files && input.files.length > 0) {
                const rattaches = travauxImport.reattacherBlobs(input.files);
                rafraichirPipelineUI();
            }
            document.body.removeChild(input);
        });
        input.click();
    }

    /**
     * Ouvre le poste de preparation pour UN seul fichier
     * @param {number} index - Index du fichier dans la queue
     */
    function ouvrirPreparationFichier(index) {
        const queue = travauxImport.obtenirFileDAttente();
        if (!queue[index]) return;
        if (!queue[index].estImage) {
            alert('Les PDF ne n\u00e9cessitent pas de pr\u00e9paration.');
            return;
        }

        travauxPreparation.ouvrir([queue[index]], function() {
            fichierSelectionneIndex = -1;
            rafraichirImportUI();
        }, index);
    }

    /**
     * Genere une grande preview pour la zone centre du pipeline
     * @param {Object} f - Fichier prepare
     * @param {number} index - Index dans la queue
     */
    async function genererPreviewCentre(f, index) {
        const conteneur = document.getElementById('pipeline-preview-centre');
        if (!conteneur) return;

        if (f.estPDF) {
            var centreThumbPdf = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
            if (centreThumbPdf) {
                conteneur.innerHTML = `<img src="${centreThumbPdf}" alt="" style="max-width:100%;max-height:500px;object-fit:contain;">`;
            } else {
                conteneur.innerHTML = '<span class="pipeline-icone-placeholder" style="font-size:3rem;">&#x1F4C4;</span>';
            }
            return;
        }

        const source = f.fichier || null;
        var centreThumbImg = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
        if (!source && !centreThumbImg) {
            conteneur.innerHTML = '<span class="pipeline-icone-placeholder" style="font-size:3rem;">&#x1F5BC;</span>';
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
                    img.src = centreThumbImg;
                }
            });
            if (img._blobUrl) URL.revokeObjectURL(img._blobUrl);

            // Preview a 600px max pour la zone centre
            const maxPreviewW = 600;
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
            imgResult.style.maxWidth = '100%';
            imgResult.style.maxHeight = '500px';
            imgResult.style.objectFit = 'contain';
            conteneur.innerHTML = '';
            conteneur.appendChild(imgResult);
        } catch (e) {
            console.warn('[Pipeline] Erreur preview centre:', f.nomFichier, e);
            conteneur.innerHTML = '<span class="pipeline-icone-placeholder" style="font-size:3rem;">&#x1F5BC;</span>';
        }
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
    function associerProductionGlobale(productionIdOuEl) {
        var productionId = (typeof productionIdOuEl === 'object' && productionIdOuEl !== null) ? productionIdOuEl.value : productionIdOuEl;

        // Mode jeton de reprise : ne pas associer directement, marquer comme reprise
        // Le choix explicite "Jeton" par l'utilisateur prime sur l'identification LEA
        if (productionId === '__jeton_reprise__') {
            const queue = travauxImport.obtenirFileDAttente();
            queue.forEach(f => {
                f.estReprise = true;
                f.productionId = ''; // sera défini par le sous-sélecteur
                f.productionIdParLea = false; // l'utilisateur a explicitement choisi jeton
            });
            travauxImport.setProductionGlobale('__jeton_reprise__');
            sessionStorage.setItem('travaux-pipeline-production', '__jeton_reprise__');
            rafraichirPipelineUI();
            return;
        }

        const queue = travauxImport.obtenirFileDAttente();
        queue.forEach(f => {
            // Écraser sauf si identifié automatiquement par le parseur LEA
            if (!f.productionIdParLea) {
                f.productionId = productionId;
                f.estReprise = false; // retour au mode normal
            }
        });
        travauxImport.setProductionGlobale(productionId);
        sessionStorage.setItem('travaux-pipeline-production', productionId || '');
        sessionStorage.removeItem('travaux-jeton-production');
        identifierAutoPipeline();
        rafraichirPipelineUI();
    }

    /**
     * Associe la production cible pour un jeton de reprise (sélecteur global)
     */
    function associerJetonProduction(productionIdOuEl) {
        var productionId = (typeof productionIdOuEl === 'object' && productionIdOuEl !== null) ? productionIdOuEl.value : productionIdOuEl;
        const queue = travauxImport.obtenirFileDAttente();
        queue.forEach(f => {
            if (f.estReprise) {
                f.productionId = productionId;
            }
        });
        // Persister le choix pour que le sous-sélecteur le retrouve au rafraîchissement
        sessionStorage.setItem('travaux-jeton-production', productionId || '');
        rafraichirPipelineUI();
    }

    /**
     * Change la production cible d'un jeton de reprise pour un fichier individuel
     */
    function changerJetonProductionPipeline(index, productionIdOuEl) {
        var productionId = (typeof productionIdOuEl === 'object' && productionIdOuEl !== null) ? productionIdOuEl.value : productionIdOuEl;
        const queue = travauxImport.obtenirFileDAttente();
        if (!queue[index]) return;
        queue[index].productionId = productionId;
        rafraichirPipelineUI();
    }

    /**
     * Normalise un nom de production pour la comparaison.
     * LEA transforme le nom original en retirant accents et caractères
     * spéciaux (°, /, parenthèses, etc.). On reproduit la même chose
     * pour que le titre dans l'app matche le nom extrait du fichier LEA.
     */
    function normaliserNomProductionPipeline(nom) {
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
    function correspondanceProductionPipeline(titreNorm, nomNorm) {
        if (titreNorm === nomNorm) return true;
        const escaped = nomNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('(^|\\s)' + escaped + '(\\s|$)');
        return re.test(titreNorm);
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
            // Normalisation : LEA nomme "Artefact_n1" → "Artefact n1", mais le titre est "Artefact 1"
            if (!f.productionId && f.parseLea.nomProduction) {
                const nomProd = normaliserNomProductionPipeline(f.parseLea.nomProduction);
                const prodTrouvee = productions.find(p => {
                    const titre = normaliserNomProductionPipeline(p.titre || p.nom || '');
                    return nomProd && titre && (correspondanceProductionPipeline(titre, nomProd) || correspondanceProductionPipeline(nomProd, titre));
                });
                if (prodTrouvee) {
                    f.productionId = prodTrouvee.id;
                    f.productionIdParLea = true;
                }
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
            <button class="btn btn-principal" data-action="travauxUI.lancerImport">
                Importer ${queue.length} fichier(s)
            </button>
            ${aDesImages ? `
            <button class="btn btn-secondaire" data-action="travauxUI.ouvrirPreparation" title="Préparer les images avant import (rotation, crop, perspective, luminosité)">
                Préparer les images
            </button>` : ''}
            <button class="btn btn-secondaire" data-action="travauxUI.annulerImport">
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
        const nomReel = etudiant
            ? (etudiant.nom ? `${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}` : echapperHtml(etudiant.prenom))
            : (f.etudiantDA || 'Non associé');
        const nomEtudiant = (typeof anonymiserNom === 'function' && anonymiserNom(f.etudiantDA)) || nomReel;

        // Déterminer le statut le plus avancé selon le workflow
        let statutTexte = 'Importé';
        let statutClasse = 'importe';

        const annotation = travauxStockage.obtenirAnnotationFichier(f.id);
        if (annotation && annotationContientDuContenu(annotation)) {
            statutTexte = 'Annoté';
            statutClasse = 'annote';
        }

        const evaluation = travauxResolution.trouverEvaluationPourFichier(f);
        if (evaluation) {
            statutTexte = 'Évalué';
            statutClasse = 'evalue';
        }

        // 🔧 FIX (29 mars 2026) : Indicateurs reprise/remplacée dans les badges
        // Étoile ★ pour les reprises (comme le profil Engagement)
        // Opacité réduite pour les originales remplacées
        // Utiliser le flag du FICHIER (pas de l'évaluation) pour distinguer
        // l'original de la reprise — trouverEvaluationPourFichier retourne
        // la même évaluation (reprise) pour les deux fichiers.
        const estReprise = f.estReprise === true;
        // L'original est remplacé si l'évaluation trouvée est une reprise mais le fichier ne l'est pas
        const estRemplacee = !estReprise && evaluation && (evaluation.repriseDeId || evaluation.jetonRepriseCibleeApplique);
        const indicateurReprise = estReprise
            ? '<span class="profil-texte-petit" title="Reprise" style="margin-left:2px">★</span>'
            : '';

        const verrou = (evaluation && evaluation.verrouillee)
            ? '<span class="travaux-badge-verrou" title="Évaluation verrouillée">\u{1F512}</span>'
            : '';

        // Badge evalue/remis sur la page d'archivage → previsualisation PDF complete
        const actionName = (evaluation && action === 'ouvrirPreviewInline')
            ? 'travauxExportPDF.previsualiserPDF'
            : `travauxUI.${action}`;

        const estSelFusion = selectionFusion.has(f.id);
        const checkboxFusion = `<input type="checkbox" class="fusion-checkbox" ${estSelFusion ? 'checked' : ''} data-stop data-action="travauxUI.toggleSelectionFusion" data-param="${f.id}" title="Sélectionner pour fusion">`;

        return `<div class="annot-badge${estSelFusion ? ' annot-badge-fusion-selectionne' : ''}${estRemplacee ? ' eval-remplacee' : ''}" data-fichier-id="${f.id}" data-etudiant-da="${f.etudiantDA || ''}" draggable="true" data-drag-data="text/fichier-id:${f.id}" data-action="${actionName}" data-param="${f.id}" title="${echapperHtml(f.nomFichier)}${estRemplacee ? ' (Remplacée par reprise)' : ''}${estReprise ? ' (Reprise)' : ''}">
        ${checkboxFusion}
        <span class="annot-badge-nom">${nomEtudiant}</span>
        <span class="travaux-badge-pill ${statutClasse}">${statutTexte}</span>${indicateurReprise}${evaluation ? `<button class="travaux-badge-retro" data-stop data-action="travauxUI.afficherRetroaction" data-param="${f.id}" title="Aperçu rétroaction">\u{1F4AC}</button>` : ''}${verrou}
        <button class="annot-badge-supprimer" data-stop data-action="travauxUI.supprimerFichierImporte" data-param="${f.id}" title="Supprimer">&times;</button>
    </div>`;
    }

    /**
     * Corrige le groupeCoursId des fichiers à partir de l'appartenance réelle
     * des étudiants. S'exécute une fois à l'initialisation du module.
     */
    function corrigerGroupeCoursIdFichiers() {
        const fichiers = travauxStockage.obtenirFichiersTravaux();
        if (!fichiers.length) return;

        const tousEtudiants = db.getSync(cle('groupeEtudiants'), []);
        const tousGC = db.getSync(cle('groupesCours'), []);
        const normaliserGroupe = (g) => String(g || '').padStart(5, '0');
        const daVersGcId = {};
        tousEtudiants.forEach(e => {
            if (!e.da || !e.groupe) return;
            const gc = tousGC.find(gc =>
                gc.coursId === e.coursId &&
                normaliserGroupe(gc.groupe) === normaliserGroupe(e.groupe)
            );
            if (gc) daVersGcId[e.da] = gc.id;
        });

        const modifications = {};
        fichiers.forEach(f => {
            if (!f.etudiantDA) return;
            const gcReel = daVersGcId[f.etudiantDA];
            if (gcReel && f.groupeCoursId !== gcReel) {
                modifications[f.id] = { groupeCoursId: gcReel };
            }
        });

        const nbMisAJour = Object.keys(modifications).length;
        if (nbMisAJour > 0) {
            travauxStockage.mettreAJourFichiersBatch(modifications);
        }
    }

    /**
     * Determine le statut d'un fichier (importe, annote, evalue)
     */
    function determinerStatutFichier(f, evaluations) {
        const evaluation = travauxResolution.trouverEvaluationPourFichier(f);
        if (evaluation) return 'evalue';
        const annotation = travauxStockage.obtenirAnnotationFichier(f.id);
        if (annotation && annotationContientDuContenu(annotation)) return 'annote';
        return 'importe';
    }

    /**
     * Genere un resume compact des statuts pour un groupe de fichiers
     */
    function genererResumeStatuts(fichiers, evaluations) {
        let nbEvalue = 0, nbAnnote = 0, nbImporte = 0;
        fichiers.forEach(f => {
            const s = determinerStatutFichier(f, evaluations);
            if (s === 'evalue') nbEvalue++;
            else if (s === 'annote') nbAnnote++;
            else nbImporte++;
        });
        const parts = [];
        if (nbEvalue > 0) parts.push(`<span class="travaux-compteur-pill evalue">${nbEvalue} évalué${nbEvalue > 1 ? 's' : ''}</span>`);
        if (nbAnnote > 0) parts.push(`<span class="travaux-compteur-pill annote">${nbAnnote} annoté${nbAnnote > 1 ? 's' : ''}</span>`);
        if (nbImporte > 0) parts.push(`<span class="travaux-compteur-pill importe">${nbImporte} importé${nbImporte > 1 ? 's' : ''}</span>`);
        return parts.join(' ');
    }

    function genererGrilleFichiers(fichiers, action) {
        if (fichiers.length === 0) return '';

        const productions = obtenirDonneesSelonMode(cle('productions'));
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];

        // Grouper par productionId
        const groupes = {};
        fichiers.forEach(f => {
            const pid = f.productionId || '__aucune__';
            if (!groupes[pid]) groupes[pid] = [];
            groupes[pid].push(f);
        });

        // Dropdown filtre de production (toutes les productions, même sans fichier)
        let htmlDropdown = '';
        if (productions.length >= 1) {
            htmlDropdown += '<select class="controle-form travaux-filtre-production" data-on-change="travauxUI.filtrerBadgesParProduction">';
            if (productions.length > 1) {
                htmlDropdown += '<option value="">Toutes les productions</option>';
            }
            productions.forEach(p => {
                const nb = (groupes[p.id] && groupes[p.id].length) || 0;
                const sel = (productionFiltreActive === p.id) ? ' selected' : '';
                htmlDropdown += `<option value="${p.id}"${sel}>${echapperHtml(p.titre || p.nom || p.id)} (${nb})</option>`;
            });
            htmlDropdown += '</select>';
        }

        // Bouton de fusion (visible quand 2+ fichiers du meme etudiant sont selectionnes)
        let htmlFusion = '';
        if (selectionFusion.size >= 2) {
            // Verifier que tous les fichiers selectionnes sont du meme etudiant
            const dasSelectionnes = new Set();
            selectionFusion.forEach(function(id) {
                const fSel = fichiers.find(function(fx) { return fx.id === id; });
                if (fSel && fSel.etudiantDA) dasSelectionnes.add(fSel.etudiantDA);
            });
            if (dasSelectionnes.size === 1) {
                htmlFusion = `<button class="btn btn-principal btn-fusion-fichiers" data-action="travauxUI.fusionnerFichiers">Fusionner (${selectionFusion.size})</button>`;
            } else if (dasSelectionnes.size > 1) {
                htmlFusion = `<span class="texte-muted u-texte-petit fusion-avertissement">Les fichiers sélectionnés doivent appartenir au même étudiant</span>`;
            }
        }
        if (selectionFusion.size > 0) {
            htmlFusion += `<button class="btn btn-secondaire btn-petit" data-action="travauxUI.annulerSelectionFusion">Annuler sélection</button>`;
        }

        // Stocker le dropdown séparément pour l'afficher hors du scroll dans la toolbar
        _htmlDropdownProduction = htmlDropdown;

        // En mode toolbar (ouvrirFichier), le dropdown est extrait hors du scroll
        const inclureDropdownInline = (action !== 'ouvrirFichier');

        let html = '<div class="travaux-grille-fichiers">';
        html += `<div class="travaux-badges-entete">${inclureDropdownInline ? htmlDropdown : ''}${htmlFusion ? `<div class="travaux-fusion-actions">${htmlFusion}</div>` : ''}<div class="travaux-badges-liste">`;

        // Afficher chaque production
        productions.forEach(p => {
            const g = groupes[p.id];
            if (!g || g.length === 0) return;
            const resume = genererResumeStatuts(g, evaluations);
            html += `<h5 class="travaux-groupe-production-titre">${echapperHtml(p.titre || p.nom || p.id)} (${g.length}) <span class="travaux-compteurs-groupe">${resume}</span></h5>`;
            html += `<div class="travaux-badges-groupe" data-production-id="${p.id}">`;
            g.forEach(f => { html += genererBadgeFichierImporte(f, action); });
            html += '</div>';
            delete groupes[p.id];
        });

        // Fichiers sans production
        const sansProduction = groupes['__aucune__'];
        if (sansProduction && sansProduction.length > 0) {
            const resume = genererResumeStatuts(sansProduction, evaluations);
            html += `<h5 class="travaux-groupe-production-titre">Non associés (${sansProduction.length}) <span class="travaux-compteurs-groupe">${resume}</span></h5>`;
            html += '<div class="travaux-badges-groupe" data-production-id="__aucune__">';
            sansProduction.forEach(f => { html += genererBadgeFichierImporte(f, action); });
            html += '</div>';
        }

        html += '</div></div></div>';
        return html;
    }

    /**
     * Génère un tableau de fichiers pour l'onglet « Annoter et évaluer »
     * Remplace l'affichage par badges dans l'état initial (avant ouverture visionneuse)
     * @param {Array} fichiers - Liste des fichiers importés
     * @returns {string} HTML du tableau complet avec filtres
     */
    function genererTableauFichiers(fichiers) {
        if (fichiers.length === 0) return '';

        const productions = obtenirDonneesSelonMode(cle('productions'));
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];

        // Options pour le select de production
        const optionsProductions = productions.map(p =>
            `<option value="${p.id}">${echapperHtml(p.titre || p.nom || p.id)}</option>`
        ).join('');

        // Dropdown filtre production
        let htmlFiltreProduction = '<option value="">Toutes les productions</option>';
        productions.forEach(p => {
            const sel = (productionFiltreActive === p.id) ? ' selected' : '';
            htmlFiltreProduction += `<option value="${p.id}"${sel}>${echapperHtml(p.titre || p.nom || p.id)}</option>`;
        });

        // Générer les lignes
        let htmlLignes = '';
        fichiers.forEach(f => {
            htmlLignes += genererLigneTableauFichier(f, productions, evaluations, optionsProductions);
        });

        return `
            <div class="conteneur" id="travaux-tableau-fichiers-conteneur">
                <h2>Annoter et évaluer <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle">📍</button></h2>
                <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
                    <select class="controle-form controle-form-compact" id="travaux-tableau-filtre-production" data-on-change="travauxUI.filtrerTableauFichiers">
                        ${htmlFiltreProduction}
                    </select>
                    <select class="controle-form controle-form-compact" id="travaux-tableau-filtre-statut" data-on-change="travauxUI.filtrerTableauFichiers">
                        <option value="">Tous les statuts</option>
                        <option value="importe">Importé</option>
                        <option value="annote">Annoté</option>
                        <option value="evalue">Évalué</option>
                    </select>
                    <input type="text" class="controle-form controle-form-compact" id="travaux-tableau-filtre-recherche" placeholder="Rechercher\u2026" data-on-input="travauxUI.filtrerTableauFichiers" style="max-width: 220px;">
                </div>
                <table class="tableau" id="travaux-tableau-fichiers">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;"><input type="checkbox" id="travaux-tableau-tout-selectionner" title="Tout sélectionner"></th>
                            <th>Nom</th>
                            <th>DA</th>
                            <th>Production</th>
                            <th style="text-align: center;">Statut</th>
                            <th style="text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlLignes}
                    </tbody>
                </table>
                <p class="texte-muted" id="travaux-tableau-aucun-resultat" style="display: none; padding: 16px 0;">Aucun fichier ne correspond aux filtres.</p>
            </div>`;
    }

    /**
     * Génère une ligne <tr> pour un fichier dans le tableau
     * @param {Object} f - Fichier
     * @param {Array} productions - Liste des productions
     * @param {Array} evaluations - Liste des évaluations
     * @param {string} optionsProductions - HTML des <option> pour le select production
     * @returns {string} HTML de la ligne
     */
    function genererLigneTableauFichier(f, productions, evaluations, optionsProductions) {
        const etudiant = travauxImport.trouverEtudiantParDA(f.etudiantDA);
        const nomReel = etudiant
            ? (etudiant.nom ? `${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}` : echapperHtml(etudiant.prenom))
            : (f.etudiantDA ? 'Inconnu' : 'Non associé');
        const nomComplet = (typeof anonymiserNom === 'function' && anonymiserNom(f.etudiantDA)) || nomReel;
        const da = f.etudiantDA || '—';

        // Statut
        const statut = determinerStatutFichier(f, evaluations);
        const statutLabels = { importe: 'Importé', annote: 'Annoté', evalue: 'Évalué' };

        // Select production avec valeur pré-sélectionnée
        const selectId = `travaux-tableau-prod-${f.id}`;

        return `<tr data-fichier-id="${f.id}" data-statut="${statut}" data-production-id="${f.productionId || ''}" data-etudiant-da="${f.etudiantDA || ''}">
            <td style="text-align: center;"><input type="checkbox" class="travaux-tableau-checkbox" data-fichier-id="${f.id}"></td>
            <td>${nomComplet}</td>
            <td>${echapperHtml(da)}</td>
            <td><select class="controle-form controle-form-compact travaux-tableau-select-prod" id="${selectId}" data-fichier-id="${f.id}" data-on-change="travauxUI.changerProductionFichierDepuisTableau">
                <option value="">— Aucune —</option>
                ${optionsProductions}
            </select></td>
            <td style="text-align: center;"><span class="travaux-badge-pill ${statut}">${statutLabels[statut]}</span></td>
            <td style="text-align: center;"><button class="btn btn-petit btn-principal" data-action="travauxUI.ouvrirFichier" data-param="${f.id}">Annoter</button></td>
        </tr>`;
    }

    /**
     * Filtre les lignes du tableau de fichiers par production, statut et recherche
     */
    function filtrerTableauFichiers() {
        const tableau = document.getElementById('travaux-tableau-fichiers');
        if (!tableau) return;

        const filtreProduction = (document.getElementById('travaux-tableau-filtre-production') || {}).value || '';
        const filtreStatut = (document.getElementById('travaux-tableau-filtre-statut') || {}).value || '';
        const filtreRecherche = ((document.getElementById('travaux-tableau-filtre-recherche') || {}).value || '').toLowerCase().trim();

        // Persister le filtre production (cohérence avec les badges toolbar)
        productionFiltreActive = filtreProduction;
        sessionStorage.setItem('travaux-filtre-production', filtreProduction);

        let nbVisibles = 0;
        const lignes = tableau.querySelectorAll('tbody tr');
        lignes.forEach(tr => {
            const prodId = tr.dataset.productionId || '';
            const statut = tr.dataset.statut || '';
            const texte = tr.textContent.toLowerCase();

            const matchProd = !filtreProduction || prodId === filtreProduction;
            const matchStatut = !filtreStatut || statut === filtreStatut;
            const matchRecherche = !filtreRecherche || texte.includes(filtreRecherche);

            if (matchProd && matchStatut && matchRecherche) {
                tr.classList.remove('u-hide');
                nbVisibles++;
            } else {
                tr.classList.add('u-hide');
            }
        });

        // Message « aucun résultat »
        const msgAucun = document.getElementById('travaux-tableau-aucun-resultat');
        if (msgAucun) msgAucun.style.display = nbVisibles === 0 ? '' : 'none';
    }

    /**
     * Rafraîchit le tableau de fichiers (re-rend afficherFichiers)
     */
    function rafraichirTableauFichiers() {
        afficherFichiers();
    }

    /**
     * Filtre les badges affichés selon la production sélectionnée dans le dropdown
     */
    function filtrerBadgesParProduction(selectElement) {
        // Trouver le select : soit passé en argument (onchange), soit chercher dans le conteneur annoter
        const select = selectElement || document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
        const productionId = select ? select.value : '';
        productionFiltreActive = productionId;
        sessionStorage.setItem('travaux-filtre-production', productionId);

        // Scoper au conteneur parent du select pour éviter d'affecter les autres onglets
        // Le select peut être dans .travaux-grille-fichiers (archivage) ou .annot-toolbar (toolbar fixe)
        const conteneur = select ? (select.closest('.travaux-grille-fichiers') || select.closest('.annot-toolbar')) : null;
        const groupes = conteneur
            ? conteneur.querySelectorAll('.travaux-badges-groupe')
            : document.querySelectorAll('.travaux-badges-groupe');

        groupes.forEach(groupe => {
            const pid = groupe.getAttribute('data-production-id');
            if (!productionId || pid === productionId) {
                groupe.style.display = '';
            } else {
                groupe.style.display = 'none';
            }
        });

        // Masquer/afficher aussi les titres de production
        const titres = conteneur
            ? conteneur.querySelectorAll('.travaux-groupe-production-titre')
            : document.querySelectorAll('.travaux-groupe-production-titre');
        titres.forEach(titre => {
            const nextGroupe = titre.nextElementSibling;
            if (nextGroupe && nextGroupe.classList.contains('travaux-badges-groupe')) {
                titre.style.display = nextGroupe.style.display;
            }
        });

        // 🔧 FIX (5 mars 2026) : Auto-navigation UNIQUEMENT quand l'utilisateur change
        // manuellement le dropdown (selectElement est un <select> HTML passé par onchange).
        // Ne JAMAIS auto-naviguer lors d'un appel programmatique (filtrerBadgesParProduction()
        // sans argument) — cela écrasait la sélection explicite de l'utilisateur.
        const estChangementManuel = selectElement && selectElement.tagName === 'SELECT';
        const dansArchivage = select && select.closest('#evaluations-contenu-archivage');
        if (estChangementManuel && conteneur && !dansArchivage) {
            const fichierActuel = travauxVisionneuse.getFichierActuel();
            const fichierMasque = fichierActuel && productionId && fichierActuel.productionId !== productionId;
            if (!fichierActuel || fichierMasque) {
                const premierBadge = conteneur.querySelector('.travaux-badges-groupe[style=""] .annot-badge, .travaux-badges-groupe:not([style*="none"]) .annot-badge');
                if (premierBadge && premierBadge.dataset.fichierId) {
                    ouvrirFichier(premierBadge.dataset.fichierId);
                }
            }
        }

        // Rafraîchir le compteur pour refléter le filtre
        mettreAJourCompteurBadge();
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
            const thumb = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
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
                <div class="travaux-miniature${actif}" data-fichier-id="${f.id}" data-action="travauxUI.ouvrirFichier" data-param="${f.id}">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span>${icone}</span>`}
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
            const thumb = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
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
                     data-action="travauxUI.ouvrirFichier" data-param="${f.id}">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span>${icone}</span>`}
                        ${badge}
                    </div>
                    <div class="travaux-miniature-nom">${echapperHtml(f.nomFichier)}</div>
                </div>`;
        }

        viewportScroll.innerHTML = html;
        travauxStockage.chargerThumbnailsConteneur(viewportScroll);
    }

    /**
     * Genere les options de select pour les etudiants
     * @returns {string} HTML options
     */
    function genererOptionsEtudiants() {
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        return [...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e =>
            `<option value="${e.da}">${e.nom ? echapperHtml(e.nom + ', ' + e.prenom) : echapperHtml(e.prenom)}</option>`
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
        const selectProd = document.getElementById('travaux-select-production');
        const productionId = selectProd?.value || '';
        const queue = travauxImport.obtenirFileDAttente();

        if (queue.length === 0) {
            alert('Aucun fichier a importer');
            return;
        }

        const nomProduction = selectProd?.selectedOptions[0]?.textContent?.trim() || '';
        const msgProd = productionId && nomProduction
            ? `associés à la production « ${nomProduction} »`
            : 'sans production associée';
        const selectGC = document.getElementById('selectGroupeCoursHeader');
        const nomGroupe = selectGC?.selectedOptions[0]?.textContent?.trim() || '';
        const msgGroupe = nomGroupe ? `dans le groupe « ${nomGroupe} » et ` : '';

        if (!confirm(`${queue.length} fichier(s) seront importés ${msgGroupe}${msgProd}.\n\nConfirmer l\u2019importation ?`)) return;

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
        // Reset du chrono au changement de fichier
        resetChrono();

        // 🔧 FIX (29 mars 2026) : Nettoyer les flags orphelins d'une opération
        // précédente. Sans callback en attente, ces flags sont des résidus qui
        // contaminent le flux suivant (ex: Consulter via profil après un Consulter
        // cassé via la liste).
        if (!window._apresOuvertureFichier) {
            if (window._resterEnModeAnnoter) window._resterEnModeAnnoter = false;
            if (window._modifierEvaluationEnCours) window._modifierEvaluationEnCours = false;
        }

        // Mémoriser le mode courant AVANT fermeture (pour le restaurer après chargement)
        const modeAvantNavigation = modeCourant;

        // Naviguer vers l'onglet Annoter et évaluer si pas déjà dessus
        if (typeof afficherSousSection === 'function') {
            const sousSectionActive = document.querySelector('#evaluations-annoter.sous-section.active') ||
                                       document.querySelector('#evaluations-annoter.sous-section[style*="display: block"]');
            if (!sousSectionActive || sousSectionActive.offsetParent === null) {
                afficherSousSection('evaluations-annoter');
            }
        }

        // Si le tableau est affiché (pas de visionneuse), créer la visionneuse d'abord
        if (!document.getElementById('travaux-conteneur-document')) {
            const conteneur = document.getElementById('evaluations-contenu-fichiers');
            if (conteneur) {
                conteneur.innerHTML = '';
                afficherVisionneuse();
                if (productionFiltreActive) {
                    filtrerBadgesParProduction();
                }
            }
        }

        // Fermer le mode evaluation si actif (remet les panneaux dans leur conteneur d'origine
        // avant que afficherFichiers() ne détruise le DOM de la visionneuse)
        if (document.getElementById('travaux-palette-eval-gauche')) {
            // Sauvegarder les sélections (grille, échelle, cartouche) avant destruction
            if (typeof sauvegarderSelectionsEvaluation === 'function') {
                sauvegarderSelectionsEvaluation();
            }
            fermerModeEvaluation();
            // Réinitialiser modeCourant pour que basculerMode('evaluer') fonctionne ensuite
            modeCourant = 'annoter';
            // Réafficher le layout annotation (masqué par masquerPalettesAnnotation lors du passage en eval)
            afficherPalettesAnnotation();
            // Remettre mode-annot-actif si le layout existe
            const conteneurDocR = document.getElementById('travaux-conteneur-document');
            if (conteneurDocR && document.getElementById('annot-layout-flex')) {
                conteneurDocR.classList.add('mode-annot-actif');
            }
        }
        // Masquer la section evaluation si visible (fallback)
        // Ne pas masquer si modifierEvaluation() est en cours de chargement
        const evalDiv = document.getElementById('evaluations-contenu-evaluation');
        if (evalDiv && !window._modifierEvaluationEnCours) evalDiv.classList.add('u-hide');

        // Highlight du badge actif : pill → "EN COURS" orange
        document.querySelectorAll('.annot-badge').forEach(b => {
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
                // Si déjà évalué, afficher ÉVALUÉ (vert) au lieu de EN COURS
                if (pill.dataset.origClasse === 'evalue') {
                    pill.textContent = 'ÉVALUÉ';
                    pill.className = 'travaux-badge-pill evalue';
                } else {
                    pill.textContent = 'EN COURS';
                    pill.className = 'travaux-badge-pill en-cours';
                }
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

            // Vérifier la résolution fichier→évaluation pour détecter les ambiguïtés
            const fichierOuvert = travauxVisionneuse.getFichierActuel && travauxVisionneuse.getFichierActuel();
            if (fichierOuvert && typeof travauxResolution !== 'undefined') {
                travauxResolution.trouverEvaluationPourFichier(fichierOuvert);
                const avert = travauxResolution.dernierAvertissement && travauxResolution.dernierAvertissement();
                if (avert) {
                    afficherAvertissementResolution(avert);
                }
            }

            // Afficher le bouton evaluer
            const btnEvaluer = document.getElementById('travaux-btn-evaluer');
            if (btnEvaluer) btnEvaluer.classList.remove('u-hide');

            // Replier la sidebar
            const sidebar = document.getElementById('travaux-sidebar');
            if (sidebar) sidebar.classList.add('replie');
            const btnToggle = document.getElementById('travaux-btn-toggle-sidebar');
            if (btnToggle) { btnToggle.classList.add('visible'); btnToggle.innerHTML = '&#x25B6;'; }

            // Charger les annotations du nouveau fichier (nécessaire dans les deux modes)
            travauxAnnotation.activerAnnotation();

            // Restaurer le mode courant (Annoter ou Évaluer) sans flash
            // 🔧 FIX (5 mars 2026) : Ne PAS re-basculer en mode évaluer si un callback
            // _apresOuvertureFichier est en attente — le callback fera lui-même le
            // basculement avec modifierEvaluationParId, évitant un double setup
            // (preRemplirEvaluation + modifierEvaluationParId en parallèle).
            if (modeAvantNavigation === 'evaluer' && !window._apresOuvertureFichier && !window._resterEnModeAnnoter) {
                const fichierNav = travauxVisionneuse.getFichierActuel();
                if (fichierNav && fichierNav.etudiantDA) {
                    basculerMode('evaluer');
                }
            } else if (modeAvantNavigation !== 'evaluer') {
                // Mode annotation par défaut
                travauxVisionneuse.zoomPleineHauteur();
                const btnAnnoter = document.getElementById('travaux-btn-annoter');
                if (btnAnnoter) btnAnnoter.classList.add('actif');
                const btnEvaluerReset = document.getElementById('travaux-btn-evaluer');
                if (btnEvaluerReset) btnEvaluerReset.classList.remove('actif');
            }

            // Aligner le haut du document avec le haut du viewport après la transition CSS du sidebar (0.3s)
            setTimeout(() => travauxVisionneuse.scrollerEnHaut(), 350);

            // Boutons et badge cycle de vie
            // NB: fichierOuvert déjà déclaré plus haut (ligne résolution)
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

            // Scroll le badge actif dans le strip toolbar pour qu'il soit visible
            const badgeActifEl = document.querySelector('.annot-toolbar-fichiers .annot-badge.actif');
            if (badgeActifEl) badgeActifEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

            // Mettre à jour la pill statut dans la palette Paramètres
            if (fichierOuvert && typeof mettreAJourPillStatut === 'function') {
                const selRemise = document.getElementById('remiseProduction1');
                mettreAJourPillStatut(selRemise ? selRemise.value : 'importe');
            }

            // Mettre à jour le compteur de badges (navigation fichiers)
            mettreAJourCompteurBadge();

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

            // Callback post-ouverture (utilisé par consulterEvaluation pour enchaîner
            // basculerMode('evaluer') + chargement évaluation APRÈS que le fichier soit prêt)
            if (typeof window._apresOuvertureFichier === 'function') {
                const cb = window._apresOuvertureFichier;
                window._apresOuvertureFichier = null;
                cb();
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
        let fichiers = travauxStockage.obtenirFichiersGroupeActif();
        if (da) {
            fichiers = fichiers.filter(f => f.etudiantDA === da);
        }

        const conteneur = document.getElementById('travaux-miniatures');
        if (conteneur) {
            conteneur.innerHTML = genererMiniatures(fichiers);
            initialiserScrollVirtuel();
            // Charger les thumbnails async pour les placeholders
            travauxStockage.chargerThumbnailsConteneur(conteneur);
        }
    }

    /**
     * Lance l'archivage unifié (étudiant, production, ou les deux)
     */
    function lancerArchivage() {
        const da = document.getElementById('travaux-archivage-etudiant')?.value || null;
        const productionId = document.getElementById('travaux-archivage-production')?.value || null;

        if (!da && !productionId) {
            alert('Sélectionne au moins un étudiant ou une production');
            return;
        }

        travauxArchivage.lancerExport(da, productionId);
    }

    // Rétrocompatibilité
    function lancerArchivageEtudiant() { lancerArchivage(); }
    function lancerArchivageProduction() { lancerArchivage(); }

    /**
     * Lance l'archivage du semestre (structure dossiers élève/production)
     */
    function lancerArchivageSemestre() {
        const da = document.getElementById('travaux-archivage-semestre-etudiant')?.value || null;
        const productionId = document.getElementById('travaux-archivage-semestre-production')?.value || null;
        travauxArchivage.lancerExportSemestre({ da, productionId });
    }

    /**
     * Lance l'export Lea depuis l'UI
     */
    function lancerExportLea() {
        const productionId = document.getElementById('travaux-archivage-lea-production')?.value;
        if (!productionId) {
            alert('Veuillez sélectionner une production.');
            return;
        }
        const da = document.getElementById('travaux-archivage-lea-etudiant')?.value || null;
        const reprisesSeulement = document.getElementById('travaux-lea-reprises-seulement')?.checked || false;
        travauxArchivage.lancerExportLea(productionId, da, reprisesSeulement);
    }

    /**
     * Met a jour le compteur d'evaluations pour la selection Lea
     */
    function mettreAJourCompteurLea() {
        const compteur = document.getElementById('travaux-lea-compteur');
        if (!compteur) return;

        const productionId = document.getElementById('travaux-archivage-lea-production')?.value;
        const da = document.getElementById('travaux-archivage-lea-etudiant')?.value || null;
        const reprisesSeulement = document.getElementById('travaux-lea-reprises-seulement')?.checked || false;

        if (!productionId) {
            compteur.textContent = '';
            return;
        }

        // Compter les étudiants évalués (1 PDF par étudiant)
        const dasGroupeActif = new Set(
            travauxStockage.obtenirFichiersGroupeActif().map(f => f.etudiantDA).filter(Boolean)
        );
        let evalsComptees = (obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [])
            .filter(e => e.productionId === productionId && !e.remplaceeParId && dasGroupeActif.has(e.etudiantDA));
        if (reprisesSeulement) {
            evalsComptees = evalsComptees.filter(e => e.repriseDeId || e.jetonRepriseCibleeApplique);
        }
        const dasEvalues = new Set(evalsComptees.map(e => e.etudiantDA));

        if (da) {
            compteur.textContent = dasEvalues.has(da) ? '1 évaluation prête' : 'Aucune évaluation';
        } else {
            const label = reprisesSeulement ? 'reprise(s)' : 'évaluation(s)';
            compteur.textContent = dasEvalues.size > 0
                ? `${dasEvalues.size} ${label} pour ${dasEvalues.size} étudiant(s)`
                : reprisesSeulement ? 'Aucune reprise trouvée' : 'Aucune évaluation trouvée';
        }
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
                    <button class="btn btn-petit" data-action="travauxUI.proposerNettoyage">Proposer un nettoyage</button>
                    ${fsapiDispo && !fsapiActif ? '<button class="btn btn-petit btn-secondaire" data-action="travauxUI.configurerFSAPI">Passer au stockage disque</button>' : ''}
                </div>` : ''}
        `;
    }

    /**
     * Propose le nettoyage des anciens fichiers
     */
    async function proposerNettoyage() {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif();
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
            `Assure-toi d'avoir archivé ces fichiers avant de les supprimer.`
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
        // 1. Obtenir les infos du fichier AVANT suppression
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) return;

        // 2. Vérifier s'il existe une évaluation associée
        const evalAssociee = travauxResolution.trouverEvaluationPourFichier(fichier);

        // 3. Adapter le message de confirmation
        if (evalAssociee) {
            const choix = confirm(
                'Ce fichier a une évaluation associée (' + (evalAssociee.noteFinale || evalAssociee.note || '--') + '%).\n\n' +
                'Veux-tu supprimer le fichier ET l\'évaluation ?\n\n' +
                '(OK = supprimer les deux, Annuler = ne rien supprimer)'
            );
            if (!choix) return;

            // Supprimer l'évaluation
            const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
            const evaluationsMaj = evaluations.filter(e => e.id !== evalAssociee.id);
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluationsMaj);
        } else {
            if (!confirm('Supprimer ce fichier importé ?')) return;
        }

        // 4. Supprimer le fichier (blob + métadonnées)
        await travauxStockage.supprimerFichierTravail(fichierId);

        // 5. Rafraichir la vue courante
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
        }, 0);
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
                <p>Vide la file et re-dépose tes fichiers.</p>`,
                [{ label: 'Vider la file', classe: 'btn-principal', action: () => {
                    travauxImport.viderFileDAttente();
                    afficherImport();
                }}]);
            return;
        }

        // Confirmation de la production et du groupe avant import
        const selectProd = document.getElementById('pipeline-select-production');
        var nomProduction = selectProd?.selectedOptions[0]?.textContent?.trim() || '';
        // Si mode jeton, préciser la production cible
        if (selectProd && selectProd.value === '__jeton_reprise__') {
            var selectJetonProd = document.querySelector('#pipeline-jeton-production select');
            var nomProdCible = selectJetonProd?.selectedOptions[0]?.textContent?.trim() || '';
            if (nomProdCible && nomProdCible !== '-- Choisir --') {
                nomProduction = 'Jeton de reprise pour ' + nomProdCible;
            }
        }
        const nbFichiers = queue.length;
        const msgProduction = nomProduction && selectProd.value
            ? `associés à la production <strong>${echapperHtml(nomProduction)}</strong>`
            : `<strong>sans production associée</strong>`;
        const selectGC = document.getElementById('selectGroupeCoursHeader');
        const nomGroupe = selectGC?.selectedOptions[0]?.textContent?.trim() || '';
        const msgGroupe = nomGroupe
            ? `dans le groupe <strong>${echapperHtml(nomGroupe)}</strong>`
            : '';

        afficherModalePipeline('Confirmer l\u2019import',
            `<p>${nbFichiers} fichier(s) seront importés ${msgGroupe} et ${msgProduction}.</p>
            <p>Confirmer l\u2019importation ?</p>`,
            [
                { label: 'Oui, importer', classe: 'btn-principal', action: () => executerImportPipeline() },
                { label: 'Revenir aux réglages', classe: 'btn-secondaire', action: () => {} }
            ]);
    }

    async function executerImportPipeline() {
        const queue = travauxImport.obtenirFileDAttente();

        const optDPI = document.getElementById('pipeline-opt-dpi')?.checked;
        const optBalance = document.getElementById('pipeline-opt-balance')?.checked;
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

                    // Balance des blancs auto (globale + par fichier : activee sauf si skipBalance)
                    if (optBalance && !f.skipBalance && typeof travauxPreparation.autoBalanceBlancs === 'function') {
                        try {
                            blob = await travauxPreparation.autoBalanceBlancs(blob);
                        } catch (e) {
                            console.warn('[Pipeline] Erreur balance blancs:', f.nomFichier, e);
                        }
                    }

                    // Uniformisation 200 dpi (par fichier : sauf si format11x17)
                    if (optDPI && !f.format11x17) {
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

        // Phase 4 : traiter les doublons détectés
        if (resultat.doublons && resultat.doublons.length > 0) {
            await traiterDoublonsImport(resultat.doublons);
        }

        // Phase Jetons : appliquer les jetons de reprise pour les fichiers importés comme reprises
        const nbJetons = await appliquerJetonsReprisePostImport();

        afficherImport();

        if (typeof afficherNotificationSucces === 'function') {
            const msg = `${resultat.importes} fichier(s) import\u00e9(s)`;
            var details = [];
            if (resultat.erreurs > 0) details.push(resultat.erreurs + ' erreur(s)');
            if (resultat.doublons && resultat.doublons.length > 0) details.push(resultat.doublons.length + ' doublon(s) traité(s)');
            if (nbJetons > 0) details.push(nbJetons + ' jeton(s) de reprise appliqué(s)');
            afficherNotificationSucces(msg, details.join(' — '));
        }
    }

    /**
     * Phase 4 : traite les doublons détectés pendant l'import.
     * Affiche une modale pour chaque doublon avec 3 choix.
     * @param {Array} doublons - Résultats de type { doublon: true, fichierExistant, fichierPrepare, productionId }
     */
    async function traiterDoublonsImport(doublons) {
        var annule = false;
        var configJetons = (typeof obtenirConfigJetons === 'function') ? obtenirConfigJetons() : null;
        var jetonsActifs = configJetons && configJetons.actif;

        for (var i = 0; i < doublons.length; i++) {
            if (annule) break;
            var d = doublons[i];
            var etudiant = travauxImport.trouverEtudiantParDA(d.fichierExistant.etudiantDA);
            var nomEtudiant = etudiant ? (etudiant.prenom + ' ' + etudiant.nom) : d.fichierExistant.etudiantDA;
            var productions = db.getSync(cle('productions'), []);
            var prod = productions.find(function(p) { return p.id === d.productionId; });
            var nomProd = prod ? (prod.titre || prod.nom) : d.productionId;
            var compteur = (doublons.length > 1) ? ' (' + (i + 1) + '/' + doublons.length + ')' : '';

            // Vérifier si un jeton de reprise est disponible pour cet élève
            var boutonJeton = '';
            if (jetonsActifs && d.fichierExistant.etudiantDA && typeof verifierDisponibiliteJeton === 'function') {
                var jetonDispo = verifierDisponibiliteJeton(d.fichierExistant.etudiantDA, 'reprise');
                if (jetonDispo) {
                    boutonJeton = '<button class="btn btn-secondaire" data-choix="jeton" style="border-color:var(--attention);">Appliquer comme jeton de reprise' +
                        '<span style="display:block;font-size:11px;font-weight:400;opacity:0.8;">Les deux fichiers sont conserv\u00e9s. L\u2019\u00e9valuation originale est archiv\u00e9e.</span>' +
                    '</button>';
                }
            }

            var choix = await new Promise(function(resolve) {
                var overlay = document.createElement('div');
                overlay.className = 'modal-overlay actif';
                overlay.style.zIndex = '10001';
                overlay.innerHTML =
                    '<div class="modal-contenu" style="max-width:520px;padding:24px">' +
                        '<h3 style="margin-top:0">Doublon d\u00e9tect\u00e9' + echapperHtml(compteur) + '</h3>' +
                        '<p>Un fichier existe d\u00e9j\u00e0 pour <strong>' + echapperHtml(nomEtudiant) + '</strong> \u2014 <strong>' + echapperHtml(nomProd) + '</strong>.</p>' +
                        '<p style="font-size:13px;color:var(--couleur-texte-secondaire)">' +
                            'Existant\u00a0: ' + echapperHtml(d.fichierExistant.nomFichier) + '<br>' +
                            'Nouveau\u00a0: ' + echapperHtml(d.fichierPrepare.nomFichier) +
                        '</p>' +
                        '<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;">' +
                            boutonJeton +
                            '<button class="btn btn-principal" data-choix="remplacer">Remplacer l\u2019existant' +
                                '<span style="display:block;font-size:11px;font-weight:400;opacity:0.8;">L\u2019ancien fichier est envoy\u00e9 \u00e0 la corbeille. Le nouveau prend sa place.</span>' +
                            '</button>' +
                            '<button class="btn btn-secondaire" data-choix="garder">Garder l\u2019existant' +
                                '<span style="display:block;font-size:11px;font-weight:400;opacity:0.8;">Le nouveau fichier est ignor\u00e9. Rien ne change.</span>' +
                            '</button>' +
                            '<button class="btn btn-secondaire" data-choix="orphelin">Importer sans association' +
                                '<span style="display:block;font-size:11px;font-weight:400;opacity:0.8;">Le nouveau fichier est import\u00e9 mais n\u2019est li\u00e9 \u00e0 aucune production.</span>' +
                            '</button>' +
                            '<button class="btn btn-secondaire" data-choix="annuler" style="margin-top:4px;opacity:0.7;">Annuler' +
                                '<span style="display:block;font-size:11px;font-weight:400;opacity:0.8;">Arr\u00eater le traitement des doublons. Les fichiers restants ne seront pas import\u00e9s.</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>';
                document.body.appendChild(overlay);
                overlay.querySelectorAll('button').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        overlay.remove();
                        resolve(btn.dataset.choix);
                    });
                });
            });

            if (choix === 'annuler') {
                annule = true;
            } else if (choix === 'jeton') {
                // Importer comme reprise + appliquer le jeton
                d.fichierPrepare.estReprise = true;
                try {
                    var fichierImporte = await travauxImport.importerFichier(d.fichierPrepare, d.productionId);
                    if (fichierImporte && !fichierImporte.doublon) {
                        // Trouver l'évaluation active et appliquer le jeton
                        var evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
                        var evalActive = evaluations.find(function(e) {
                            return e.etudiantDA === d.fichierExistant.etudiantDA &&
                                e.productionId === d.productionId && !e.remplaceeParId;
                        });
                        if (evalActive) {
                            var nouvelleEval = appliquerJetonReprise(evalActive.id, null, { silencieux: true });
                            if (nouvelleEval) {
                                travauxStockage.mettreAJourFichier(fichierImporte.id, { evaluationId: nouvelleEval.id });
                                if (!d.fichierExistant.evaluationId) {
                                    travauxStockage.mettreAJourFichier(d.fichierExistant.id, { evaluationId: evalActive.id });
                                }
                                afficherNotificationSucces('Jeton de reprise appliqu\u00e9 pour ' + echapperHtml(nomEtudiant));
                            }
                        }
                    }
                } catch (e) {
                    console.error('[Travaux-UI] Erreur import jeton:', e);
                }
            } else if (choix === 'remplacer') {
                travauxStockage.deplacerEnCorbeille(d.fichierExistant.id);
                try {
                    await travauxImport.importerFichier(d.fichierPrepare, d.productionId);
                } catch (e) {
                    console.error('[Travaux-UI] Erreur import remplacement:', e);
                }
            } else if (choix === 'orphelin') {
                try {
                    await travauxImport.importerFichier(d.fichierPrepare, '');
                } catch (e) {
                    console.error('[Travaux-UI] Erreur import orphelin:', e);
                }
            }
            // 'garder' → ne rien faire
        }
    }

    /**
     * Applique automatiquement les jetons de reprise pour les fichiers importés comme reprises.
     * Cherche l'évaluation active correspondante, crée la nouvelle éval, et lie les fichiers.
     * @returns {number} Nombre de jetons appliqués
     */
    async function appliquerJetonsReprisePostImport() {
        if (typeof travauxStockage === 'undefined' || typeof appliquerJetonReprise !== 'function') return 0;

        // Trouver les fichiers marqués comme reprises sans evaluationId
        var tousLesFichiers = travauxStockage.obtenirFichiersTravaux();
        var fichiersReprise = tousLesFichiers.filter(function(f) {
            return f.estReprise && !f.evaluationId && f.etudiantDA && f.productionId;
        });

        if (fichiersReprise.length === 0) return 0;

        // Dédoublonner : garder seulement le fichier le plus récent par (DA, productionId)
        var parCle = {};
        for (var k = 0; k < fichiersReprise.length; k++) {
            var cleUnique = fichiersReprise[k].etudiantDA + '_' + fichiersReprise[k].productionId;
            var existant = parCle[cleUnique];
            if (!existant || new Date(fichiersReprise[k].dateImport || 0) > new Date(existant.dateImport || 0)) {
                parCle[cleUnique] = fichiersReprise[k];
            }
        }
        fichiersReprise = Object.values(parCle);

        var evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        var compteur = 0;
        var echecsSansEval = [];

        for (var i = 0; i < fichiersReprise.length; i++) {
            var fichier = fichiersReprise[i];
            var etudiant = travauxImport.trouverEtudiantParDA(fichier.etudiantDA);
            var nomEtudiant = etudiant ? (etudiant.prenom + ' ' + etudiant.nom) : fichier.etudiantDA;

            // Vérifier si un jeton a déjà été appliqué pour ce (DA, productionId)
            var repriseExistante = evaluations.find(function(e) {
                return e.etudiantDA === fichier.etudiantDA &&
                    e.productionId === fichier.productionId &&
                    e.jetonRepriseApplique && !e.remplaceeParId;
            });
            if (repriseExistante) {
                // Jeton déjà appliqué — lier le fichier à l'évaluation existante
                travauxStockage.mettreAJourFichier(fichier.id, { evaluationId: repriseExistante.id });
                compteur++;
                continue;
            }

            // Trouver l'évaluation active (originale) pour ce (DA, productionId)
            var evaluation = evaluations.find(function(e) {
                return e.etudiantDA === fichier.etudiantDA &&
                    e.productionId === fichier.productionId &&
                    !e.remplaceeParId;
            });
            if (!evaluation) {
                echecsSansEval.push(nomEtudiant);
                continue;
            }

            // Trouver le fichier original (PAS la reprise)
            var fichiersEtudiant = travauxStockage.obtenirFichiersEtudiant(fichier.etudiantDA);
            var fichierOriginal = null;
            for (var j = 0; j < fichiersEtudiant.length; j++) {
                var fo = fichiersEtudiant[j];
                if (fo.productionId === fichier.productionId && fo.id !== fichier.id && !fo.estReprise) {
                    fichierOriginal = fo;
                    break;
                }
            }

            // Appliquer le jeton de reprise (silencieux)
            var nouvelleEval = appliquerJetonReprise(evaluation.id, null, { silencieux: true });
            if (!nouvelleEval) {
                // Ne pas notifier si c'est juste une limite — le fichier est importé quand même
                continue;
            }

            // Lier le fichier de reprise à la nouvelle évaluation
            travauxStockage.mettreAJourFichier(fichier.id, { evaluationId: nouvelleEval.id });

            // Lier le fichier original à l'évaluation archivée
            if (fichierOriginal && !fichierOriginal.evaluationId) {
                travauxStockage.mettreAJourFichier(fichierOriginal.id, { evaluationId: evaluation.id });
            }

            // Rafraîchir la liste des évaluations pour la prochaine itération
            evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
            compteur++;
        }

        // Notification consolidée
        if (echecsSansEval.length > 0) {
            afficherNotificationErreur(
                'Jetons non appliqués',
                'Aucune évaluation existante trouvée pour : ' + echecsSansEval.join(', ') +
                '. Les fichiers ont été importés, mais le jeton doit être appliqué manuellement.'
            );
        }

        return compteur;
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
        let html = '<div class="modal-section"><p>Coche les fichiers à supprimer :</p>';
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
                    } catch (e) { console.warn('[Travaux-UI] PDF thumbnail regeneration failed:', e.message || e); }
                }

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
                <button class="modal-fermer" data-action="fermerOverlayParent">&times;</button>
                <h3 class="modal-titre">${echapperHtml(titre)}</h3>
                ${contenuHTML}
                <div class="modal-actions">
                    ${boutonsHTML}
                </div>
            </div>`;

        document.body.appendChild(overlay);

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
    async function changerProductionFichier(fichierId, nouveauProductionId) {
        // Phase 5 : vérifier les conflits et évaluations orphelines avant de réassocier
        const verif = travauxStockage.reassocierFichier(fichierId, { productionId: nouveauProductionId }, { verificationSeule: true });

        if (verif && verif.conflit) {
            const productions = db.getSync(cle('productions'), []);
            const prod = productions.find(p => p.id === nouveauProductionId);
            const nomProd = prod ? (prod.titre || prod.nom) : nouveauProductionId;
            const confirme = confirm(`Un fichier existe déjà pour cette production (${nomProd}). Remplacer l'existant ?`);
            if (!confirme) return;
            travauxStockage.deplacerEnCorbeille(verif.fichierExistant.id);
        }

        if (verif && verif.evaluationOrpheline) {
            const confirme = confirm('L\'évaluation pour l\'ancienne production perdra son fichier associé. Continuer ?');
            if (!confirme) return;
        }

        const ok = travauxStockage.reassocierFichier(fichierId, { productionId: nouveauProductionId });
        if (ok) {
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
        // Permettre la re-creation si le mode est 'evaluer' mais les palettes n'existent plus
        if (mode === modeCourant) {
            if (mode === 'evaluer' && !document.getElementById('travaux-palette-eval-gauche')) {
                modeCourant = 'annoter';
            } else {
                return;
            }
        }
        const btnAnnoter = document.getElementById('travaux-btn-annoter');
        const btnEvaluer = document.getElementById('travaux-btn-evaluer');

        if (mode === 'evaluer') {
            const fichier = travauxVisionneuse.getFichierActuel();
            if (!fichier || !fichier.etudiantDA) {
                alert('Ce fichier n\'est pas associé à un étudiant.');
                return;
            }
            modeCourant = 'evaluer';
            // Afficher le chronomètre dans la palette si la préférence est active
            _afficherWrapperChrono(db.getSync('preferencesAffichage', {}).chronoEvaluation);

            // Si le layout eval existe déjà (caché), le réafficher sans recréer
            const evalFlexExistant = document.getElementById('eval-layout-flex');
            if (evalFlexExistant) {
                masquerPalettesAnnotation();
                evalFlexExistant.classList.remove('u-hide');
                const conteneurDoc = document.getElementById('travaux-conteneur-document');
                if (conteneurDoc) conteneurDoc.classList.add('mode-eval-actif');
                if (conteneurDoc) conteneurDoc.classList.remove('mode-annot-actif');
                // Remettre le canvas dans le wrapper eval
                const canvasContainer = document.getElementById('travaux-canvas-container');
                const evalColDoc = document.getElementById('eval-col-document');
                if (canvasContainer && evalColDoc) evalColDoc.appendChild(canvasContainer);
            } else {
                // Première fois : créer le layout eval
                // Extraire le canvas du layout annotation avant de construire le layout eval
                const annotColDoc = document.getElementById('annot-col-document');
                const conteneurDoc = document.getElementById('travaux-conteneur-document');
                const canvasContainer = document.getElementById('travaux-canvas-container');

                if (annotColDoc && canvasContainer && conteneurDoc) {
                    conteneurDoc.appendChild(canvasContainer);
                } else if (!annotColDoc && canvasContainer && conteneurDoc) {
                    if (canvasContainer.parentElement !== conteneurDoc) {
                        conteneurDoc.appendChild(canvasContainer);
                    }
                }
                // Retirer mode-annot-actif pendant le mode évaluation
                if (conteneurDoc) conteneurDoc.classList.remove('mode-annot-actif');
                masquerPalettesAnnotation();
                afficherPalettesEval(fichier);
            }
            if (btnAnnoter) btnAnnoter.classList.remove('actif');
            if (btnEvaluer) btnEvaluer.classList.add('actif');
            // Pleine hauteur par défaut en mode évaluation
            // 🔧 FIX (5 mars 2026) : double RAF pour attendre que le layout ait ses dimensions finales
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    travauxVisionneuse.zoomPleineHauteur();
                    setTimeout(() => travauxVisionneuse.scrollerEnHaut(), 100);
                });
            });
            // Si productionId manquant, ouvrir le panneau correction d'identité
            if (!fichier.productionId) {
                setTimeout(() => toggleCorrectionIdentite(), 100);
            }
        } else {
            modeCourant = 'annoter';
            masquerPalettesEval();
            afficherPalettesAnnotation();
            // Remettre mode-annot-actif si le layout annotation existe
            const conteneurDocA = document.getElementById('travaux-conteneur-document');
            if (conteneurDocA && document.getElementById('annot-layout-flex')) {
                conteneurDocA.classList.add('mode-annot-actif');
            }
            if (btnAnnoter) btnAnnoter.classList.add('actif');
            if (btnEvaluer) btnEvaluer.classList.remove('actif');
            // Pleine hauteur par défaut en mode annotation
            // 🔧 FIX (5 mars 2026) : double RAF pour attendre que le layout ait ses dimensions finales
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    travauxVisionneuse.zoomPleineHauteur();
                    setTimeout(() => travauxVisionneuse.scrollerEnHaut(), 100);
                });
            });
        }
        sauvegarderEtatSession();
    }

    function masquerPalettesAnnotation() {
        // Masquer le layout annotation ancré
        const annotLayout = document.getElementById('annot-layout-flex');
        if (annotLayout) annotLayout.classList.add('u-hide');
        // Masquer les palettes secondaires (tampons, erreurs-fr restent flottantes)
        ['travaux-palette-tampons', 'travaux-palette-erreurs-fr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('u-hide');
        });
        // Fallback: masquer aussi la palette si elle est hors layout (vue côte-à-côte)
        const paletteFlottante = document.getElementById('travaux-palette-flottante');
        if (paletteFlottante && !annotLayout) paletteFlottante.classList.add('u-hide');
    }

    function afficherPalettesAnnotation() {
        // Afficher le layout annotation ancré s'il existe
        const annotLayout = document.getElementById('annot-layout-flex');
        if (annotLayout) {
            annotLayout.classList.remove('u-hide');
            // Défense en profondeur : s'assurer que les sections ancrées sont visibles
            ['travaux-palette-erreurs-fr', 'travaux-palette-tampons'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('u-hide');
            });
            return;
        }
        // Fallback: palette flottante (vue côte-à-côte)
        const paletteAnnot = document.getElementById('travaux-palette-flottante');
        if (paletteAnnot) paletteAnnot.classList.remove('u-hide');
    }

    function afficherPalettesEval(fichier) {
        // Ne creer que si pas deja presentes
        if (document.getElementById('travaux-palette-eval-gauche')) return;

        const conteneurDoc = document.getElementById('travaux-conteneur-document');
        if (!conteneurDoc) return;

        // Creer les panneaux
        const panneauGauche = document.getElementById('travaux-eval-gauche');
        const panneauDroite = document.getElementById('travaux-eval-droite');
        const panneauRetro = document.getElementById('travaux-eval-retroaction');

        // Créer le conteneur (position relative pour les palettes flottantes)
        const evalFlex = document.createElement('div');
        evalFlex.id = 'eval-layout-flex';
        evalFlex.className = 'eval-layout-flex';

        // --- Colonne document : le canvas occupe tout l'espace ---
        const canvasContainer = document.getElementById('travaux-canvas-container');
        const centreWrapper = document.createElement('div');
        centreWrapper.className = 'eval-col-document';
        centreWrapper.id = 'eval-col-document';
        if (canvasContainer) {
            centreWrapper.appendChild(canvasContainer);
        } else {
            console.warn('[afficherPalettesEval] canvas-container introuvable — layout eval incomplet');
        }
        evalFlex.appendChild(centreWrapper);

        // --- Palette Paramètres (flottante, top-left) ---
        const paletteG = panneauGauche ? creerPaletteEval('travaux-palette-eval-gauche', 'Paramètres', panneauGauche) : null;
        if (paletteG) {
            paletteG.style.top = '12px';
            paletteG.style.left = '12px';

            // Bouton cadenas compact dans la barre de titre
            const barreParam = paletteG.querySelector('.palette-flottante-barre');
            if (barreParam) {
                const btnVerrou = document.createElement('button');
                btnVerrou.id = 'btnVerrouPalette';
                btnVerrou.className = 'btn btn-compact';
                btnVerrou.title = 'Verrouiller/Déverrouiller l\'évaluation';
                btnVerrou.style.cssText = 'font-size:12px; padding:2px 6px; margin-right:4px; display:none;';
                btnVerrou.textContent = '\u{1F513}';
                btnVerrou.addEventListener('click', function() {
                    if (typeof basculerVerrouillageEvaluationCourante === 'function') {
                        basculerVerrouillageEvaluationCourante();
                    }
                });
                const btnToggle = barreParam.querySelector('.palette-flottante-toggle');
                barreParam.insertBefore(btnVerrou, btnToggle);
            }

            evalFlex.appendChild(paletteG);
        }

        // --- Palette Évaluation (flottante, right) ---
        const paletteD = panneauDroite ? creerPaletteEval('travaux-palette-eval-droite', 'Évaluation', panneauDroite) : null;
        if (paletteD) {
            paletteD.style.top = '12px';
            paletteD.style.right = '300px';
            paletteD.style.left = 'auto';
            evalFlex.appendChild(paletteD);
        }

        // --- Palette Rétroaction (flottante, far-right) ---
        const paletteR = panneauRetro ? creerPaletteEval('travaux-palette-eval-retro', 'Rétroaction', panneauRetro) : null;
        if (paletteR) {
            paletteR.style.top = '12px';
            paletteR.style.right = '12px';
            paletteR.style.left = 'auto';

            // Bouton Copier compact dans la barre de titre
            const barreRetro = paletteR.querySelector('.palette-flottante-barre');
            if (barreRetro) {
                // 2e ligne : radios + boutons Copier / Copier tout
                const ligne2 = document.createElement('div');
                ligne2.style.cssText = 'display:flex; align-items:center; gap:6px; width:100%; font-size:0.7rem;';

                const radiosDiv = document.createElement('div');
                radiosDiv.className = 'retro-vues-radios';
                ['Générale', 'Spécifique', 'Bilan'].forEach(function(label, idx) {
                    var val = ['generale', 'specifique', 'bilan'][idx];
                    var lbl = document.createElement('label');
                    var radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'vueRetroaction';
                    radio.value = val;
                    if (idx === 0) radio.checked = true;
                    radio.addEventListener('change', function() { basculerVueRetroaction(val); });
                    lbl.appendChild(radio);
                    lbl.appendChild(document.createTextNode(' ' + label));
                    radiosDiv.appendChild(lbl);
                });
                ligne2.appendChild(radiosDiv);

                // Spacer
                var spacer = document.createElement('span');
                spacer.style.flex = '1';
                ligne2.appendChild(spacer);

                // Bouton Copier (section active)
                const btnCopier = document.createElement('button');
                btnCopier.className = 'btn btn-compact';
                btnCopier.textContent = 'Copier';
                btnCopier.title = 'Copier la section active';
                btnCopier.style.cssText = 'font-size:10px; padding:2px 6px;';
                btnCopier.addEventListener('click', function() { copierRetroaction(1); });
                ligne2.appendChild(btnCopier);

                // Bouton Copier tout
                const btnCopierTout = document.createElement('button');
                btnCopierTout.className = 'btn btn-compact';
                btnCopierTout.textContent = 'Copier tout';
                btnCopierTout.title = 'Copier les 3 sections';
                btnCopierTout.style.cssText = 'font-size:10px; padding:2px 6px;';
                btnCopierTout.addEventListener('click', function() { copierToutRetroaction(); });
                ligne2.appendChild(btnCopierTout);

                barreRetro.appendChild(ligne2);
            }
            evalFlex.appendChild(paletteR);
        }

        // Insérer le layout sous la toolbar
        const toolbar = conteneurDoc.querySelector('.travaux-toolbar');
        if (toolbar) {
            toolbar.after(evalFlex);
        } else {
            conteneurDoc.appendChild(evalFlex);
        }

        // Configurer le drag pour chaque palette flottante
        if (paletteG) configurerDragPaletteEval('travaux-palette-eval-gauche');
        if (paletteD) configurerDragPaletteEval('travaux-palette-eval-droite');
        if (paletteR) configurerDragPaletteEval('travaux-palette-eval-retro');

        // Marquer le conteneur en mode eval (pour CSS)
        conteneurDoc.classList.add('mode-eval-actif');


        // Bloquer la mémorisation pendant le setup pour ne pas écraser les bonnes valeurs
        window._bloquerMemorisation = true;

        // Capturer les sélections sauvegardées AVANT le setup (qui déclenche des change
        // events via preRemplirEvaluation → memoriserSelectionsEvaluation écrase le DB)
        const savedRaw = (typeof db !== 'undefined') ? db.getSync('dernieresSelectionsEvaluation', null) : null;
        const selectionsCache = savedRaw ? ((typeof savedRaw === 'string') ? JSON.parse(savedRaw) : savedRaw) : null;

        // Peupler les dropdowns (les fonctions d'evaluation.js remplissent les selects)
        if (typeof chargerListeEtudiantsEval === 'function') chargerListeEtudiantsEval();
        if (typeof chargerGroupesEval === 'function') chargerGroupesEval();
        if (typeof chargerProductionsDansSelect === 'function') chargerProductionsDansSelect();
        if (typeof chargerGrillesDansSelect === 'function') chargerGrillesDansSelect();
        if (typeof chargerEchellePerformance === 'function') chargerEchellePerformance();

        // Pré-remplir les selects cachés directement depuis fichier (synchrone, fiable)
        // Ces selects sont dans travaux-eval-correction (u-hide) et lus par sauvegarderEvaluation()
        const selEtud = document.getElementById('selectEtudiantEval');
        if (selEtud && fichier.etudiantDA) {
            selEtud.value = fichier.etudiantDA;
        }

        // Pré-remplir la production depuis le fichier ou l'évaluation liée (via fichierId)
        const productionIdDuFichier = fichier.productionId || '';
        let productionIdEffective = productionIdDuFichier;
        if (!productionIdEffective) {
            const evalLiee = travauxResolution.trouverEvaluationPourFichier(fichier);
            if (evalLiee?.productionId) {
                productionIdEffective = evalLiee.productionId;
            }
        }

        const selProd = document.getElementById('selectProduction1');
        if (selProd && productionIdEffective) {
            selProd.value = productionIdEffective;
        }

        // Initialiser evaluationEnCours si absent (requis par chargerGrilleSelectionnee)
        if (!window.evaluationEnCours) {
            window.evaluationEnCours = {
                etudiantDA: fichier.etudiantDA || '',
                productionId: productionIdEffective || '',
                grilleId: '',
                echelleId: '',
                cartoucheId: '',
                criteres: {},
                donneesAlgorithmiques: {},
                statutRemise: 'evalue'
            };
        }

        // Pré-sélectionner la grille associée à la production (si disponible)
        const productions = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode('productions')
            : (typeof db !== 'undefined' ? db.getSync(cle('productions'), []) : []);
        const prod = productionIdEffective ? productions.find(p => p.id === productionIdEffective) : null;
        if (prod && prod.grilleId) {
            const selG = document.getElementById('selectGrille1');
            if (selG && Array.from(selG.options).some(o => o.value === prod.grilleId)) {
                selG.value = prod.grilleId;
                window.evaluationEnCours.grilleId = prod.grilleId;
                if (typeof chargerGrilleSelectionnee === 'function') chargerGrilleSelectionnee();
            }

            // 🆕 Pré-sélectionner l'échelle depuis la production
            if (prod.echelleId) {
                const selE = document.getElementById('selectEchelle1');
                if (selE && Array.from(selE.options).some(o => o.value === prod.echelleId)) {
                    selE.value = prod.echelleId;
                    window.evaluationEnCours.echelleId = prod.echelleId;
                }
            }

            // 🆕 Pré-sélectionner la cartouche (avec délai car les options dépendent de chargerGrilleSelectionnee)
            if (prod.cartoucheId) {
                setTimeout(() => {
                    const selC = document.getElementById('selectCartoucheEval');
                    if (selC && Array.from(selC.options).some(o => o.value === prod.cartoucheId)) {
                        selC.value = prod.cartoucheId;
                        window.evaluationEnCours.cartoucheId = prod.cartoucheId;
                        selC.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }, 150);
            }
        }

        // Statut de remise par défaut : importé (fichier importé)
        const selRemise = document.getElementById('remiseProduction1');
        if (selRemise) selRemise.value = 'importe';
        if (typeof mettreAJourPillStatut === 'function') mettreAJourPillStatut('importe');

        // Afficher les labels d'identite (avec productionId effective en fallback)
        remplirLabelsIdentite(fichier, productionIdEffective);

        // Initialiser affichageNote depuis la pratique active (avant preRemplirEvaluation
        // qui peut prendre du temps — l'utilisateur voit le bon radio immédiatement)
        if (typeof cocherOptionsParDefaut === 'function') cocherOptionsParDefaut();

        // Pre-remplir le formulaire d'evaluation avec retry robuste
        // (gère le chaînage complet : étudiant → productions → grille → évaluation existante)
        preRemplirEvaluation(fichier.etudiantDA, productionIdEffective);

        // Attacher les événements de mémorisation pour persister les sélections
        if (typeof attacherEvenementsMemorisation === 'function') {
            attacherEvenementsMemorisation();
        }

        // Restaurer grille/échelle/cartouche si aucune évaluation existante ne les a remplis
        // Utilise selectionsCache (capturé avant le setup) pour éviter les valeurs écrasées
        // Délai suffisant pour que preRemplirEvaluation ait fini son chaînage
        setTimeout(() => {
            if (!selectionsCache) {
                // Pas de cache — débloquer la mémorisation quand même
                window._bloquerMemorisation = false;
                return;
            }
            const selG = document.getElementById('selectGrille1');
            const selE = document.getElementById('selectEchelle1');
            const selC = document.getElementById('selectCartoucheEval');

            // Restaurer la grille si vide
            if (selG && !selG.value && selectionsCache.grille) {
                selG.value = selectionsCache.grille;
                selG.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Restaurer échelle et cartouche si vides (avec délai pour laisser
            // chargerGrilleSelectionnee() repeupler les options cartouche)
            setTimeout(() => {
                if (selE && !selE.value && selectionsCache.echelle) {
                    selE.value = selectionsCache.echelle;
                }
                if (selC && !selC.value && selectionsCache.cartouche) {
                    selC.value = selectionsCache.cartouche;
                    selC.dispatchEvent(new Event('change', { bubbles: true }));
                }
                // Débloquer la mémorisation maintenant que la restauration est terminée
                window._bloquerMemorisation = false;
            }, 200);
        }, 2500);

        // Peupler les jetons dynamiquement (source unique via optionsJetons)
        if (typeof peuplementOptJetons === 'function') {
            peuplementOptJetons();
            var optJetons = document.getElementById('optionsJetons');
            if (optJetons) optJetons.classList.remove('u-hide');
        }
        // Re-sync après que preRemplirEvaluation ait mis à jour evaluationEnCours
        setTimeout(function() {
            if (typeof peuplementOptJetons === 'function') peuplementOptJetons();
        }, 2000);
    }

    function masquerPalettesEval() {
        // 🔧 FIX (24 mars 2026) : Cacher au lieu de détruire pour préserver l'état de l'évaluation
        var evalFlex = document.getElementById('eval-layout-flex');
        if (evalFlex) {
            evalFlex.classList.add('u-hide');
            // Remettre le canvas dans le conteneur document principal
            var canvasContainer = document.getElementById('travaux-canvas-container');
            var conteneurDoc = document.getElementById('travaux-conteneur-document');
            var annotColDoc = document.getElementById('annot-col-document');
            if (canvasContainer && annotColDoc) {
                annotColDoc.appendChild(canvasContainer);
            } else if (canvasContainer && conteneurDoc) {
                conteneurDoc.appendChild(canvasContainer);
            }
            conteneurDoc.classList.remove('mode-eval-actif');
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
        palette.className = 'palette-flottante travaux-palette-eval';

        // Barre de titre (draggable)
        const barre = document.createElement('div');
        barre.className = 'palette-flottante-barre';
        barre.innerHTML = `
            <span class="palette-flottante-titre">${echapperHtml(titre)}</span>
            <button class="palette-flottante-toggle" data-action="travauxUI.togglePaletteEvalReplie" data-param="${id}" title="Replier/Déplier">&#x2212;</button>
        `;
        palette.appendChild(barre);

        // Contenu : deplacer le panneau existant
        const contenu = document.createElement('div');
        contenu.className = 'palette-flottante-contenu';

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
    function remplirLabelsIdentite(fichier, productionIdOverride) {
        const etudiant = travauxImport.trouverEtudiantParDA(fichier.etudiantDA);
        const productions = obtenirDonneesSelonMode(cle('productions'));
        const prodId = productionIdOverride || fichier.productionId;
        const production = (productions && prodId) ? productions.find(p => p.id === prodId) : null;

        const labelEtud = document.getElementById('travaux-eval-label-etudiant');
        if (labelEtud) {
            labelEtud.textContent = etudiant
                ? `${etudiant.prenom} ${etudiant.nom} (${etudiant.daAffichage || etudiant.da})`
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

        // Mettre a jour le fichier importe (champs d'identité via reassocierFichier)
        const association = {};
        if (nouveauDA) association.etudiantDA = nouveauDA;
        if (nouveauProdId) association.productionId = nouveauProdId;

        // Phase 5 : vérifier les conflits avant de réassocier
        const verif = travauxStockage.reassocierFichier(fichier.id, association, { verificationSeule: true });
        if (verif && verif.conflit) {
            if (!confirm('Un fichier existe déjà pour cet étudiant et cette production. Remplacer ?')) return;
            travauxStockage.deplacerEnCorbeille(verif.fichierExistant.id);
        }
        if (verif && verif.evaluationOrpheline) {
            if (!confirm('L\'évaluation pour l\'ancienne production perdra son fichier associé. Continuer ?')) return;
        }

        travauxStockage.reassocierFichier(fichier.id, association);

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
        let evalDiv = document.getElementById('evaluations-contenu-evaluation');
        const conteneurDoc = document.getElementById('travaux-conteneur-document');

        // 🔧 FIX (5 mars 2026) : Si le conteneur d'évaluation n'existe plus, le recréer
        // pour pouvoir y remettre les panneaux (sinon palette.remove() les détruit)
        if (!evalDiv) {
            const annoterSection = document.getElementById('evaluations-annoter');
            if (annoterSection) {
                const div = document.createElement('div');
                div.id = 'evaluations-contenu-evaluation';
                div.className = 'u-hide';
                annoterSection.appendChild(div);
                evalDiv = div;
            }
        }

        // Remettre le canvas container : dans le layout annotation s'il existe, sinon dans le conteneur document
        const canvasContainer = document.getElementById('travaux-canvas-container');
        const annotColDoc = document.getElementById('annot-col-document');
        if (canvasContainer && annotColDoc) {
            annotColDoc.appendChild(canvasContainer);
        } else if (canvasContainer && conteneurDoc) {
            conteneurDoc.appendChild(canvasContainer);
        }

        // Panneau jetons unifié dans optionsJetons — rien à restaurer

        const ids = ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'];
        const panneauIds = ['travaux-eval-gauche', 'travaux-eval-droite', 'travaux-eval-retroaction'];

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

        // Supprimer le layout flex
        const evalFlex = document.getElementById('eval-layout-flex');
        if (evalFlex) evalFlex.remove();

        // Retirer la classe mode eval
        if (conteneurDoc) conteneurDoc.classList.remove('mode-eval-actif');

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
        if (!palette) return;
        const layout = document.getElementById('eval-layout-flex') || document.getElementById('travaux-conteneur-document');
        travauxOutils.configurerDragPalette(palette, layout);
    }

    /**
     * Replie / deplie une palette eval
     * @param {string} paletteId - ID de la palette
     */
    function togglePaletteEvalReplie(paletteId) {
        const palette = document.getElementById(paletteId);
        if (!palette) return;
        palette.classList.toggle('replie');
        const btn = palette.querySelector('.palette-flottante-toggle');
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
        // 🔧 FIX (20 mars 2026) : Ne pas pré-remplir si modifierEvaluation est en cours
        // (sinon preRemplirEvaluation charge la reprise active et écrase l'originale remplacée)
        if (window._modifierEvaluationEnCours) {
            return;
        }
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

            // Defaut "Importé" car le fichier a été importé
            var selectRemise = document.getElementById('remiseProduction1');
            if (selectRemise) {
                selectRemise.value = 'importe';
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

                    // Vérifier si une évaluation existante doit être chargée
                    // (reprises, évaluations modifiées, etc.)
                    setTimeout(function() {
                        chargerEvaluationExistanteSiPresente(da, prodId);
                    }, 300);
                }
            }

            setTimeout(tenterProduction, INTERVALLE);
        }

        setTimeout(tentative, INTERVALLE);
    }

    /**
     * Charge une évaluation existante dans evaluationEnCours si elle existe.
     * Corrige le cas où la visionneuse ouvre un fichier pour un (DA, productionId)
     * qui a déjà été évalué — sans ceci, evaluationEnCours reste undefined et la sauvegarde échoue.
     */
    function chargerEvaluationExistanteSiPresente(da, productionId) {
        if (window._modifierEvaluationEnCours) return;
        var evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        // Chercher l'évaluation active (non remplacée) pour ce (DA, productionId)
        var evalActive = evaluations.find(function(e) {
            return e.etudiantDA === da && e.productionId === productionId && !e.remplaceeParId;
        });
        if (evalActive && typeof window.modifierEvaluationParId === 'function') {
            window.modifierEvaluationParId(evalActive.id);
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
                    <button id="travaux-split-btn-page-prec" class="btn-icon" data-action="travauxVisionneuse.pagePrecedente" disabled>&lt;</button>
                    <span id="travaux-indicateur-page">-- / --</span>
                    <button id="travaux-split-btn-page-suiv" class="btn-icon" data-action="travauxVisionneuse.pageSuivante" disabled>&gt;</button>
                    <button class="btn btn-petit" data-action="travauxAnnotation.basculerAnnotation">Annoter</button>
                    <button class="btn-icon" data-action="travauxUI.fermerVueCoteACote" title="Fermer">&times;</button>
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
        document.querySelectorAll('.annot-badge.actif').forEach(b => {
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
                    <button class="preview-quicklook-fleche preview-quicklook-prec" id="pipeline-prev-btn" data-stop data-action="travauxUI.previewPagePrec">&#x25C0;</button>
                    <button class="preview-quicklook-fleche preview-quicklook-suiv" id="pipeline-next-btn" data-stop data-action="travauxUI.previewPageSuiv">&#x25B6;</button>
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

    // peuplementPaletteJetons, gererCheckboxJetonPalette, mettreAJourEtatJetonsPalette
    // SUPPRIMÉS — jetons unifiés dans optionsJetons via peuplementOptJetons() (evaluation.js)

    /* ===============================
       METADATA PIPELINE (LEA / Autre)
       =============================== */

    let debounceRechercheTimer = null;

    /**
     * Bascule le mode import d'un fichier (lea / autre)
     */
    function toggleModeImport(index, mode) {
        const queue = travauxImport.obtenirFileDAttente();
        if (!queue[index]) return;
        queue[index].modeImport = mode || (queue[index].modeImport === 'autre' ? 'lea' : 'autre');
        rafraichirPipelineUI();
    }

    /**
     * Recherche un etudiant par query (nom, prenom, DA)
     */
    function rechercherEtudiant(index, queryOuEl) {
        var query = (typeof queryOuEl === 'object' && queryOuEl !== null) ? queryOuEl.value : queryOuEl;
        clearTimeout(debounceRechercheTimer);
        debounceRechercheTimer = setTimeout(() => {
            const liste = document.getElementById('pipeline-autocomplete-' + index);
            if (!liste) return;

            const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
            if (!etudiants || !etudiants.length) { liste.classList.add('u-hide'); return; }

            const q = (query || '').toLowerCase().trim();
            const filtres = q
                ? etudiants.filter(e => {
                    const nom = ((e.prenom || '') + ' ' + (e.nom || '') + ' ' + (e.daAffichage || e.da || '')).toLowerCase();
                    return nom.includes(q);
                })
                : etudiants;

            if (filtres.length === 0) { liste.classList.add('u-hide'); return; }

            liste.innerHTML = filtres.slice(0, 20).map(e =>
                `<div class="pipeline-autocomplete-item" data-on-mousedown="travauxUI.selectionnerEtudiant" data-param="${index}" data-param2="${echapperHtml(e.da || '')}">${echapperHtml((e.prenom || '') + ' ' + (e.nom || ''))} <span class="texte-muted">${echapperHtml(e.daAffichage || e.da || '')}</span></div>`
            ).join('');
            liste.classList.remove('u-hide');
        }, 200);
    }

    /**
     * Selectionne un etudiant pour un fichier
     */
    function selectionnerEtudiant(index, da) {
        const queue = travauxImport.obtenirFileDAttente();
        if (!queue[index]) return;
        const etudiants = obtenirDonneesSelonMode(cle('groupeEtudiants'));
        const etudiant = etudiants.find(e => e.da === da);
        queue[index].etudiantDA = da;
        queue[index].etudiantAssocie = etudiant || null;
        // Mettre a jour le champ
        const input = document.getElementById('pipeline-etudiant-' + index);
        if (input && etudiant) {
            input.value = (etudiant.prenom || '') + ' ' + (etudiant.nom || '');
        }
        const liste = document.getElementById('pipeline-autocomplete-' + index);
        if (liste) liste.classList.add('u-hide');
    }

    /**
     * Ouvre la liste complete des etudiants au focus
     */
    function ouvrirListeEtudiants(index) {
        rechercherEtudiant(index, '');
    }

    /**
     * Change la date d'un fichier
     */
    function changerDateFichier(index, dateStrOuEl) {
        var dateStr = (typeof dateStrOuEl === 'object' && dateStrOuEl !== null) ? dateStrOuEl.value : dateStrOuEl;
        const queue = travauxImport.obtenirFileDAttente();
        if (!queue[index]) return;
        queue[index].dateFichier = dateStr ? new Date(dateStr) : null;
    }

    /**
     * Change le nom de document libre
     */
    function changerNomDocumentLibre(index, nom) {
        const queue = travauxImport.obtenirFileDAttente();
        if (!queue[index]) return;
        queue[index].nomDocumentLibre = nom;
    }

    /**
     * Change la production d'un fichier dans le pipeline (queue)
     */
    function changerProductionPipeline(index, productionIdOuEl) {
        var productionId = (typeof productionIdOuEl === 'object' && productionIdOuEl !== null) ? productionIdOuEl.value : productionIdOuEl;
        const queue = travauxImport.obtenirFileDAttente();
        if (!queue[index]) return;

        if (productionId === '__jeton_reprise__') {
            queue[index].estReprise = true;
            queue[index].productionId = ''; // sera défini par le sous-sélecteur
            queue[index].productionIdParLea = false;
            rafraichirPipelineUI();
            return;
        }

        queue[index].productionId = productionId;
        queue[index].productionIdParLea = false;
        queue[index].estReprise = false;
        rafraichirPipelineUI();
    }

    /* ===============================
       EDITEUR DE PAGES
       =============================== */

    // Etat local de l'editeur de pages
    let editionFichierId = null;
    let editionPages = [];
    let editionPageSelectionnee = 0;
    let editionModeFusion = false;
    let editionFichiersASupprimer = []; // IDs des fichiers a supprimer apres fusion

    /**
     * Initialise la zone de drop pour l'edition (zone droite)
     * Ecoute le drag d'un badge importe
     */
    function initialiserDropZoneEdition() {
        const zone = document.getElementById('travaux-drop-zone-edition');
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

            const fichierId = e.dataTransfer.getData('text/fichier-id');
            if (fichierId) {
                ouvrirEditeurPages(fichierId);
            }
        });
    }

    /**
     * Ouvre l'editeur de pages pour un fichier importe
     * @param {string} fichierId - ID du fichier
     */
    async function ouvrirEditeurPages(fichierId) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) {
            console.warn('[Editeur Pages] Fichier introuvable:', fichierId);
            return;
        }

        // Accepter PDF et images
        const estPDF = fichier.typeMIME === 'application/pdf';
        const estImage = fichier.typeMIME && fichier.typeMIME.startsWith('image/');
        if (!estPDF && !estImage) {
            alert('L\'éditeur de pages accepte les fichiers PDF et images.');
            return;
        }

        editionFichierId = fichierId;
        editionPages = [];
        editionPageSelectionnee = 0;
        editionModeFusion = false;
        editionFichiersASupprimer = [];

        // Afficher le conteneur d'edition avec message de chargement
        const etudiant = travauxImport.trouverEtudiantParDA(fichier.etudiantDA);
        const nomEtudiant = etudiant
            ? (etudiant.nom ? `${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}` : echapperHtml(etudiant.prenom))
            : (fichier.etudiantDA || 'Document');

        const conteneur = document.getElementById('evaluations-contenu-import');
        if (!conteneur) return;

        const messageChargement = estPDF ? 'Décomposition du PDF en pages...' : 'Chargement de l\'image...';

        // Injecter l'editeur dans le conteneur principal
        conteneur.innerHTML = `
            <div class="editeur-pages-conteneur">
                <div class="editeur-pages-entete">
                    <h4>\u00c9dition : ${nomEtudiant}</h4>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondaire" data-action="ouvrirProprieteFichier" data-param="${fichierId}">Propri\u00e9t\u00e9s</button>
                        <button class="btn btn-secondaire" data-action="travauxUI.fermerEditeurPages">Annuler</button>
                    </div>
                </div>
                <div class="editeur-pages-message-chargement" id="editeur-chargement">
                    ${messageChargement}
                </div>
            </div>
        `;

        try {
            if (estPDF) {
                // Decomposer le PDF en pages
                editionPages = await travauxImport.decomposerPDF(fichierId);
            } else {
                // Charger l'image comme page unique
                const blob = await travauxStockage.recupererBlob(fichierId);
                if (!blob) throw new Error('Blob introuvable pour ' + fichierId);

                const dataUrl = await new Promise(function(resolve, reject) {
                    const reader = new FileReader();
                    reader.onload = function() { resolve(reader.result); };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                const dims = await new Promise(function(resolve, reject) {
                    const img = new Image();
                    img.onload = function() { resolve({ width: img.width, height: img.height }); };
                    img.onerror = reject;
                    img.src = dataUrl;
                });
                editionPages = [{
                    pageNum: 1,
                    blob: blob,
                    dataUrl: dataUrl,
                    largeur: dims.width,
                    hauteur: dims.height
                }];
            }

            if (editionPages.length === 0) {
                document.getElementById('editeur-chargement').textContent = 'Aucune page trouvée.';
                return;
            }

            // Rendre l'editeur complet
            renderEditeurPages(nomEtudiant);
        } catch (err) {
            console.error('[Editeur Pages] Erreur chargement:', err);
            const chargement = document.getElementById('editeur-chargement');
            if (chargement) {
                chargement.textContent = 'Erreur lors du chargement du fichier.';
            }
        }
    }

    /**
     * Affiche le contenu de l'editeur de pages
     * @param {string} nomEtudiant - Nom affiche dans l'entete
     */
    function renderEditeurPages(nomEtudiant) {
        const conteneur = document.querySelector('.editeur-pages-conteneur');
        if (!conteneur) return;

        // Recalculer le nom si pas fourni
        if (!nomEtudiant && editionFichierId) {
            const fichier = travauxStockage.obtenirFichierParId(editionFichierId);
            if (fichier) {
                const etudiant = travauxImport.trouverEtudiantParDA(fichier.etudiantDA);
                nomEtudiant = etudiant
                    ? (etudiant.nom ? `${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}` : echapperHtml(etudiant.prenom))
                    : (fichier.etudiantDA || 'Document');
            }
        }

        // Generer la liste des pages
        let htmlListe = '';
        editionPages.forEach((page, index) => {
            const sel = index === editionPageSelectionnee ? 'selectionnee' : '';
            htmlListe += `
                <div class="editeur-page-item ${sel}" data-action="travauxUI.selectionnerPageEditeur" data-param="${index}">
                    <span class="editeur-page-num">${index + 1}</span>
                    <img class="editeur-page-thumb" src="${page.dataUrl}" alt="Page ${index + 1}">
                    <div class="editeur-page-actions">
                        <button class="editeur-page-btn" data-stop data-action="travauxUI.monterPageEditeur" data-param="${index}" ${index === 0 ? 'disabled' : ''} title="Monter">&#x25B2;</button>
                        <button class="editeur-page-btn" data-stop data-action="travauxUI.descendrePageEditeur" data-param="${index}" ${index === editionPages.length - 1 ? 'disabled' : ''} title="Descendre">&#x25BC;</button>
                        <button class="editeur-page-btn" data-stop data-action="travauxUI.pivoterPageEditeur" data-param="${index}" title="Pivoter 90°">&#x21BB;</button>
                        <button class="editeur-page-btn editeur-page-btn-supprimer" data-stop data-action="travauxUI.supprimerPageEditeur" data-param="${index}" title="Supprimer" ${editionPages.length <= 1 ? 'disabled' : ''}>&times;</button>
                    </div>
                </div>`;
        });

        // Preview de la page selectionnee
        const pageActive = editionPages[editionPageSelectionnee];
        const previewSrc = pageActive ? pageActive.dataUrl : '';

        conteneur.innerHTML = `
            <div class="editeur-pages-entete">
                <h4>Édition : ${nomEtudiant || 'Document'} — ${editionPages.length} page(s)</h4>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-secondaire" data-action="ouvrirProprieteFichier" data-param="${editionFichierId}">Propri\u00e9t\u00e9s</button>
                    <button class="btn btn-secondaire" data-action="travauxUI.fermerEditeurPages">Annuler</button>
                </div>
            </div>
            <div class="editeur-pages-layout">
                <div class="editeur-pages-liste">
                    ${htmlListe}
                </div>
                <div class="editeur-pages-preview">
                    ${previewSrc ? `<img src="${previewSrc}" alt="Preview page ${editionPageSelectionnee + 1}">` : '<p class="texte-muted">Aucune page</p>'}
                    <div class="editeur-pages-boutons">
                        <button class="btn btn-secondaire" data-action="travauxUI.ajouterPagesEditeur">+ Ajouter des pages</button>
                        <button class="btn btn-secondaire" data-action="travauxUI.ouvrirModalFusionEditeur">Fusionner</button>
                        <button class="btn btn-principal" data-action="travauxUI.sauvegarderEdition">Sauvegarder</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Selectionne une page dans l'editeur
     */
    function selectionnerPageEditeur(index) {
        if (index < 0 || index >= editionPages.length) return;
        editionPageSelectionnee = index;
        renderEditeurPages();
    }

    /**
     * Monte une page d'un cran
     */
    function monterPageEditeur(index) {
        if (index <= 0 || index >= editionPages.length) return;
        const temp = editionPages[index];
        editionPages[index] = editionPages[index - 1];
        editionPages[index - 1] = temp;
        // Suivre la page deplacee
        if (editionPageSelectionnee === index) editionPageSelectionnee = index - 1;
        else if (editionPageSelectionnee === index - 1) editionPageSelectionnee = index;
        renderEditeurPages();
    }

    /**
     * Descend une page d'un cran
     */
    function descendrePageEditeur(index) {
        if (index < 0 || index >= editionPages.length - 1) return;
        const temp = editionPages[index];
        editionPages[index] = editionPages[index + 1];
        editionPages[index + 1] = temp;
        // Suivre la page deplacee
        if (editionPageSelectionnee === index) editionPageSelectionnee = index + 1;
        else if (editionPageSelectionnee === index + 1) editionPageSelectionnee = index;
        renderEditeurPages();
    }

    /**
     * Supprime une page de l'editeur
     */
    function supprimerPageEditeur(index) {
        if (editionPages.length <= 1) return;
        editionPages.splice(index, 1);
        if (editionPageSelectionnee >= editionPages.length) {
            editionPageSelectionnee = editionPages.length - 1;
        }
        renderEditeurPages();
    }

    /**
     * Pivote une page de 90 degres dans le sens horaire
     */
    function pivoterPageEditeur(index) {
        var page = editionPages[index];
        if (!page) return;

        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            // Inverser largeur/hauteur pour rotation 90°
            canvas.width = img.height;
            canvas.height = img.width;
            var ctx = canvas.getContext('2d');
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            page.dataUrl = canvas.toDataURL('image/png');
            var ancienneLargeur = page.largeur;
            page.largeur = page.hauteur;
            page.hauteur = ancienneLargeur;

            // Mettre a jour le blob
            canvas.toBlob(function(blob) {
                if (blob) page.blob = blob;
                renderEditeurPages();
            }, 'image/png');
        };
        img.src = page.dataUrl;
    }

    /**
     * Ajoute des pages depuis un selecteur de fichier
     */
    function ajouterPagesEditeur() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', async () => {
            if (input.files.length === 0) { input.remove(); return; }

            for (const fichier of input.files) {
                if (fichier.type === 'application/pdf') {
                    // Decomposer le PDF en pages
                    const arrayBuffer = await fichier.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const pageData = await rendrePagePDF(pdf, i);
                        editionPages.push(pageData);
                    }
                } else if (fichier.type.startsWith('image/')) {
                    // Ajouter l'image comme page
                    const dataUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(fichier);
                    });
                    const dims = await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve({ width: img.width, height: img.height });
                        img.onerror = reject;
                        img.src = dataUrl;
                    });
                    editionPages.push({
                        pageNum: editionPages.length + 1,
                        blob: fichier,
                        dataUrl: dataUrl,
                        largeur: dims.width,
                        hauteur: dims.height
                    });
                }
            }

            input.remove();
            renderEditeurPages();
        });

        input.click();
    }

    /**
     * Rend une page PDF en image (utilitaire pour l'editeur)
     * @param {PDFDocumentProxy} pdf - Document PDF
     * @param {number} pageNum - Numero de page (1-based)
     * @returns {Promise<Object>} {pageNum, blob, dataUrl, largeur, hauteur}
     */
    async function rendrePagePDF(pdf, pageNum) {
        const page = await pdf.getPage(pageNum);
        const scale = 800 / page.getViewport({ scale: 1 }).width;
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));

        return {
            pageNum: pageNum,
            blob: blob,
            dataUrl: dataUrl,
            largeur: viewport.width,
            hauteur: viewport.height
        };
    }

    /**
     * Sauvegarde les modifications de l'editeur de pages
     */
    async function sauvegarderEdition() {
        if (!editionFichierId || editionPages.length === 0) return;

        const fichier = travauxStockage.obtenirFichierParId(editionFichierId);
        if (!fichier) return;

        try {
            // Reassembler le PDF
            const nouveauBlob = await travauxImport.reassemblerPages(editionPages);

            // Remplacer le blob stocke
            await travauxStockage.stockerBlob(editionFichierId, nouveauBlob, fichier.etudiantDA, fichier.productionId);

            // Generer une nouvelle miniature a partir de la premiere page
            let thumbnailDataUrl = '';
            try {
                const miniature = await travauxStockage.genererMiniaturePDF(nouveauBlob);
                thumbnailDataUrl = miniature.thumbnail || '';
            } catch (e) {
                console.warn('[Editeur Pages] Miniature non regeneree:', e);
            }

            // Mettre a jour les metadonnees — si c'etait une image, ca devient un PDF
            const modifications = {
                nombrePages: editionPages.length,
                tailleFichier: nouveauBlob.size,
                typeMIME: 'application/pdf',
                dateModification: new Date().toISOString()
            };
            if (thumbnailDataUrl) {
                modifications.thumbnailDataUrl = thumbnailDataUrl;
            }
            // Mettre a jour le nom de fichier si c'etait une image
            if (fichier.typeMIME && fichier.typeMIME.startsWith('image/')) {
                const nomSansExt = (fichier.nomFichier || 'document').replace(/\.[^.]+$/, '');
                modifications.nomFichier = nomSansExt + '.pdf';
            }
            travauxStockage.mettreAJourFichier(editionFichierId, modifications);

            // Mode fusion : supprimer les fichiers excedentaires
            if (editionModeFusion && editionFichiersASupprimer.length > 0) {
                for (const idASupprimer of editionFichiersASupprimer) {
                    try {
                        await travauxStockage.supprimerFichierTravail(idASupprimer);
                    } catch (e) {
                        console.warn('[Editeur Pages] Erreur suppression fichier fusionne:', idASupprimer, e);
                    }
                }
            }

            // Fermer l'editeur et rafraichir
            const nbPages = modifications.nombrePages;
            const estFusion = editionModeFusion;
            editionFichierId = null;
            editionPages = [];
            editionPageSelectionnee = 0;
            editionModeFusion = false;
            editionFichiersASupprimer = [];
            selectionFusion.clear();
            afficherImport();

            // Notification
            if (typeof afficherNotificationSucces === 'function') {
                const message = estFusion
                    ? 'Fichiers fusionnés (' + nbPages + ' pages)'
                    : 'Document mis à jour (' + nbPages + ' pages)';
                afficherNotificationSucces(message);
            }
        } catch (err) {
            console.error('[Editeur Pages] Erreur sauvegarde:', err);
            alert('Erreur lors de la sauvegarde : ' + err.message);
        }
    }

    /**
     * Ferme l'editeur de pages sans sauvegarder
     */
    function fermerEditeurPages() {
        editionFichierId = null;
        editionPages = [];
        editionPageSelectionnee = 0;
        editionModeFusion = false;
        editionFichiersASupprimer = [];
        afficherImport();
    }

    /* ===============================
       FUSION DEPUIS L'EDITEUR DE PAGES
       =============================== */

    /**
     * Ouvre la modale de selection de documents internes a fusionner
     * dans l'editeur de pages courant.
     */
    function ouvrirModalFusionEditeur() {
        if (!editionFichierId) return;

        // Obtenir tous les fichiers du groupe actif
        var tousFichiers = travauxStockage.obtenirFichiersGroupeActif();

        // Exclure le fichier en cours d'edition et ceux deja marques pour suppression
        var exclus = new Set([editionFichierId].concat(editionFichiersASupprimer));
        var fichiersDispo = tousFichiers.filter(function(f) {
            if (exclus.has(f.id)) return false;
            // Exclure les types non supportes
            var estPDF = f.typeMIME === 'application/pdf';
            var estImage = f.typeMIME && f.typeMIME.startsWith('image/');
            if (!estPDF && !estImage) return false;
            // Exclure les fichiers evalues
            var evaluation = travauxResolution.trouverEvaluationPourFichier(f);
            if (evaluation) return false;
            return true;
        });

        if (fichiersDispo.length === 0) {
            alert('Aucun document disponible pour la fusion.\n(Les documents évalués sont exclus.)');
            return;
        }

        // Collecter les etudiants et productions pour les filtres
        var etudiantsMap = {};
        var productionsMap = {};
        fichiersDispo.forEach(function(f) {
            if (f.etudiantDA) {
                var etu = travauxImport.trouverEtudiantParDA(f.etudiantDA);
                if (etu && !etudiantsMap[f.etudiantDA]) {
                    etudiantsMap[f.etudiantDA] = etu.nom
                        ? (etu.nom + ', ' + etu.prenom)
                        : etu.prenom;
                }
            }
            if (f.productionId) {
                if (!productionsMap[f.productionId]) {
                    var prods = obtenirDonneesSelonMode(cle('productions')) || [];
                    var prod = prods.find(function(p) { return p.id === f.productionId; });
                    productionsMap[f.productionId] = prod ? prod.titre : f.productionId;
                }
            }
        });

        // Options etudiants
        var optionsEtudiants = '<option value="">Tous les étudiants</option>';
        Object.keys(etudiantsMap).sort(function(a, b) {
            return etudiantsMap[a].localeCompare(etudiantsMap[b]);
        }).forEach(function(da) {
            optionsEtudiants += '<option value="' + da + '">' + echapperHtml(etudiantsMap[da]) + '</option>';
        });

        // Options productions
        var optionsProductions = '<option value="">Toutes les productions</option>';
        Object.keys(productionsMap).sort(function(a, b) {
            return productionsMap[a].localeCompare(productionsMap[b]);
        }).forEach(function(pid) {
            optionsProductions += '<option value="' + pid + '">' + echapperHtml(productionsMap[pid]) + '</option>';
        });

        // Construire la liste des fichiers
        var htmlFichiers = _genererListeFichiersFusion(fichiersDispo, etudiantsMap, productionsMap);

        var html = `
        <div class="modal-overlay actif" id="modal-fusion-editeur" data-close-on-bg="travauxUI.fermerModalFusionEditeur">
            <div class="modal-contenu modal-fusion-editeur-contenu">
                <button class="modal-fermer" data-action="travauxUI.fermerModalFusionEditeur">&times;</button>
                <h3 class="modal-titre">Fusionner des documents</h3>

                <div class="fusion-editeur-filtres">
                    <select id="fusion-filtre-etudiant" data-on-change="travauxUI.filtrerModalFusion">
                        ${optionsEtudiants}
                    </select>
                    <select id="fusion-filtre-production" data-on-change="travauxUI.filtrerModalFusion">
                        ${optionsProductions}
                    </select>
                    <span id="fusion-compteur-selection" class="fusion-compteur">0 sélectionné(s)</span>
                </div>

                <div class="fusion-editeur-liste" id="fusion-editeur-liste">
                    ${htmlFichiers}
                </div>

                <div class="modal-actions">
                    <button class="btn btn-secondaire" data-action="travauxUI.fermerModalFusionEditeur">Annuler</button>
                    <button class="btn btn-principal" id="btn-confirmer-fusion-editeur" data-action="travauxUI.confirmerFusionEditeur" disabled>Fusionner la sélection</button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        // Charger les thumbnails async pour la modale fusion
        var modalFusion = document.getElementById('modal-fusion-editeur');
        if (modalFusion) travauxStockage.chargerThumbnailsConteneur(modalFusion);
    }

    /**
     * Genere le HTML de la liste des fichiers pour la modale fusion
     */
    function _genererListeFichiersFusion(fichiers, etudiantsMap, productionsMap) {
        if (fichiers.length === 0) {
            return '<p class="texte-muted" style="text-align:center;padding:24px;">Aucun document disponible.</p>';
        }

        var html = '';
        fichiers.forEach(function(f) {
            var nomEtudiant = f.etudiantDA && etudiantsMap[f.etudiantDA]
                ? echapperHtml(etudiantsMap[f.etudiantDA])
                : (f.etudiantDA || 'Non associé');
            var nomProduction = f.productionId && productionsMap[f.productionId]
                ? echapperHtml(productionsMap[f.productionId])
                : 'Non associé';
            var pages = f.nombrePages ? f.nombrePages + ' p.' : '1 p.';
            var thumbUrl = f.thumbnailDataUrl || travauxStockage.obtenirThumbnailSync(f.id);
            var thumb = thumbUrl
                ? '<img class="fusion-fichier-thumb" src="' + thumbUrl + '" alt="">'
                : '<div class="fusion-fichier-thumb fusion-fichier-thumb-vide" data-thumbnail-id="' + f.id + '"></div>';

            html += `
                <label class="fusion-fichier-item" data-etudiant="${f.etudiantDA || ''}" data-production="${f.productionId || ''}">
                    <input type="checkbox" class="fusion-fichier-check" value="${f.id}" data-on-change="travauxUI.majCompteurFusion">
                    ${thumb}
                    <div class="fusion-fichier-info">
                        <span class="fusion-fichier-nom">${echapperHtml(f.nomFichier || 'Document')}</span>
                        <span class="fusion-fichier-meta">${nomEtudiant} — ${nomProduction} — ${pages}</span>
                    </div>
                </label>`;
        });
        return html;
    }

    /**
     * Filtre la liste dans la modale selon les selects etudiant/production
     */
    function filtrerModalFusion() {
        var filtreEtudiant = document.getElementById('fusion-filtre-etudiant').value;
        var filtreProduction = document.getElementById('fusion-filtre-production').value;
        var items = document.querySelectorAll('#fusion-editeur-liste .fusion-fichier-item');

        items.forEach(function(item) {
            var matchEtu = !filtreEtudiant || item.getAttribute('data-etudiant') === filtreEtudiant;
            var matchProd = !filtreProduction || item.getAttribute('data-production') === filtreProduction;
            item.style.display = (matchEtu && matchProd) ? '' : 'none';
        });
    }

    /**
     * Met a jour le compteur de selection et l'etat du bouton confirmer
     */
    function majCompteurFusion() {
        var checks = document.querySelectorAll('#fusion-editeur-liste .fusion-fichier-check:checked');
        var compteur = document.getElementById('fusion-compteur-selection');
        var btnConfirmer = document.getElementById('btn-confirmer-fusion-editeur');
        if (compteur) compteur.textContent = checks.length + ' sélectionné(s)';
        if (btnConfirmer) btnConfirmer.disabled = checks.length === 0;
    }

    /**
     * Confirme la fusion : charge les pages des fichiers selectionnes
     * et les ajoute dans l'editeur courant.
     */
    async function confirmerFusionEditeur() {
        var checks = document.querySelectorAll('#fusion-editeur-liste .fusion-fichier-check:checked');
        if (checks.length === 0) return;

        var idsSelectionnes = [];
        checks.forEach(function(cb) { idsSelectionnes.push(cb.value); });

        // Fermer la modale
        fermerModalFusionEditeur();

        // Afficher un message de chargement dans le preview
        var preview = document.querySelector('.editeur-pages-preview img');
        if (preview) {
            preview.style.opacity = '0.4';
        }

        try {
            for (var i = 0; i < idsSelectionnes.length; i++) {
                var fId = idsSelectionnes[i];
                var fichier = travauxStockage.obtenirFichierParId(fId);
                if (!fichier) continue;

                var estPDF = fichier.typeMIME === 'application/pdf';
                if (estPDF) {
                    var pages = await travauxImport.decomposerPDF(fId);
                    editionPages = editionPages.concat(pages);
                } else {
                    // Image : charger comme page unique
                    var blob = await travauxStockage.recupererBlob(fId);
                    if (!blob) continue;

                    var dataUrl = await new Promise(function(resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function() { resolve(reader.result); };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    var dims = await new Promise(function(resolve, reject) {
                        var img = new Image();
                        img.onload = function() { resolve({ width: img.width, height: img.height }); };
                        img.onerror = reject;
                        img.src = dataUrl;
                    });
                    editionPages.push({
                        pageNum: editionPages.length + 1,
                        blob: blob,
                        dataUrl: dataUrl,
                        largeur: dims.width,
                        hauteur: dims.height
                    });
                }

                // Marquer le fichier pour suppression apres sauvegarde
                if (editionFichiersASupprimer.indexOf(fId) === -1) {
                    editionFichiersASupprimer.push(fId);
                }
            }

            // Activer le mode fusion
            editionModeFusion = true;

            // Re-rendre l'editeur
            renderEditeurPages();

            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces(idsSelectionnes.length + ' document(s) ajouté(s) à la fusion');
            }
        } catch (err) {
            console.error('[Fusion Editeur] Erreur chargement:', err);
            alert('Erreur lors du chargement des documents : ' + err.message);
            renderEditeurPages();
        }
    }

    /**
     * Ferme la modale de fusion editeur
     */
    function fermerModalFusionEditeur() {
        var modal = document.getElementById('modal-fusion-editeur');
        if (modal) modal.remove();
    }

    /* ===============================
       FUSION MULTI-FICHIERS
       =============================== */

    /**
     * Toggle la selection d'un fichier pour la fusion
     * @param {string} fichierId - ID du fichier
     */
    function toggleSelectionFusion(fichierId) {
        if (selectionFusion.has(fichierId)) {
            selectionFusion.delete(fichierId);
        } else {
            selectionFusion.add(fichierId);
        }
        // Re-rendre la grille pour mettre a jour les visuels
        afficherImport();
    }

    /**
     * Annule toute la selection de fusion
     */
    function annulerSelectionFusion() {
        selectionFusion.clear();
        afficherImport();
    }

    /**
     * Fusionne les fichiers selectionnes en un seul PDF
     * Ouvre l'editeur de pages en mode fusion
     */
    async function fusionnerFichiers() {
        if (selectionFusion.size < 2) return;

        const fichiersIds = Array.from(selectionFusion);
        const fichiers = fichiersIds
            .map(function(id) { return travauxStockage.obtenirFichierParId(id); })
            .filter(Boolean);

        if (fichiers.length < 2) return;

        // Verifier que tous sont du meme etudiant
        const das = new Set(fichiers.map(function(f) { return f.etudiantDA; }));
        if (das.size !== 1) {
            alert('Les fichiers doivent appartenir au même étudiant pour être fusionnés.');
            return;
        }

        // Le premier fichier devient le receptacle
        const fichierPrincipal = fichiers[0];
        editionFichierId = fichierPrincipal.id;
        editionPages = [];
        editionPageSelectionnee = 0;
        editionModeFusion = true;
        editionFichiersASupprimer = fichiersIds.slice(1); // tous sauf le premier

        const etudiant = travauxImport.trouverEtudiantParDA(fichierPrincipal.etudiantDA);
        const nomEtudiant = etudiant
            ? (etudiant.nom ? `${echapperHtml(etudiant.nom)}, ${echapperHtml(etudiant.prenom)}` : echapperHtml(etudiant.prenom))
            : (fichierPrincipal.etudiantDA || 'Document');

        const conteneur = document.getElementById('evaluations-contenu-import');
        if (!conteneur) return;

        conteneur.innerHTML = `
            <div class="editeur-pages-conteneur">
                <div class="editeur-pages-entete">
                    <h4>Fusion : ${nomEtudiant} (${fichiers.length} fichiers)</h4>
                    <button class="btn btn-secondaire" data-action="travauxUI.fermerEditeurPages">Annuler</button>
                </div>
                <div class="editeur-pages-message-chargement" id="editeur-chargement">
                    Chargement des fichiers...
                </div>
            </div>
        `;

        try {
            // Charger toutes les pages de tous les fichiers
            for (const f of fichiers) {
                const estPDF = f.typeMIME === 'application/pdf';

                if (estPDF) {
                    const pages = await travauxImport.decomposerPDF(f.id);
                    editionPages = editionPages.concat(pages);
                } else {
                    // Image : charger comme page unique
                    const blob = await travauxStockage.recupererBlob(f.id);
                    if (!blob) continue;

                    const dataUrl = await new Promise(function(resolve, reject) {
                        const reader = new FileReader();
                        reader.onload = function() { resolve(reader.result); };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    const dims = await new Promise(function(resolve, reject) {
                        const img = new Image();
                        img.onload = function() { resolve({ width: img.width, height: img.height }); };
                        img.onerror = reject;
                        img.src = dataUrl;
                    });
                    editionPages.push({
                        pageNum: editionPages.length + 1,
                        blob: blob,
                        dataUrl: dataUrl,
                        largeur: dims.width,
                        hauteur: dims.height
                    });
                }
            }

            if (editionPages.length === 0) {
                document.getElementById('editeur-chargement').textContent = 'Aucune page trouvée.';
                return;
            }

            renderEditeurPages(nomEtudiant);
        } catch (err) {
            console.error('[Fusion] Erreur chargement:', err);
            const chargement = document.getElementById('editeur-chargement');
            if (chargement) {
                chargement.textContent = 'Erreur lors du chargement des fichiers.';
            }
        }
    }

    /* ===============================
       MODAL RETROACTION (ARCHIVAGE)
       =============================== */

    /**
     * Affiche un modal d'aperçu/édition de la rétroaction globale
     * pour un fichier évalué depuis la page d'archivage.
     * @param {string} fichierId - ID du fichier
     */
    function afficherRetroaction(fichierId) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) return;

        const evaluation = travauxResolution.trouverEvaluationPourFichier(fichier);
        // Indicateur visuel si ambiguïté détectée
        const avert = travauxResolution.dernierAvertissement && travauxResolution.dernierAvertissement();
        if (avert) {
            afficherAvertissementResolution(avert);
        }
        if (!evaluation) return;

        const etudiant = travauxImport.trouverEtudiantParDA(fichier.etudiantDA);
        const nomEtudiant = etudiant
            ? (etudiant.nom ? `${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}` : echapperHtml(etudiant.prenom))
            : echapperHtml(evaluation.etudiantNom || fichier.etudiantDA || 'Inconnu');

        // Tableau des critères en lecture seule
        let criteresHTML = '';
        if (evaluation.criteres && evaluation.criteres.length > 0) {
            const lignes = evaluation.criteres.map(c => {
                const extrait = c.retroaction ? echapperHtml(c.retroaction.substring(0, 120)) : '';
                return `<li>
                    <strong>${echapperHtml(c.critereNom || '')}</strong>
                    <span class="niveau">${echapperHtml(c.niveauSelectionne || '—')}</span>
                    <span class="retro-texte">${extrait}</span>
                </li>`;
            }).join('');
            criteresHTML = `
                <h4 style="margin: 12px 0 4px;">Critères</h4>
                <ul class="travaux-retro-criteres">${lignes}</ul>`;
        }

        // Lire le réglage affichageNote de la pratique active du groupe-cours
        let modeNote = 'complet';
        try {
            const pratiqueId = typeof obtenirPratiqueActiveGroupeCours === 'function'
                ? obtenirPratiqueActiveGroupeCours() : null;
            const configurations = db.getSync('pratiquesConfigurables', []);
            const pratiqueActive = pratiqueId ? configurations.find(p => p.id === pratiqueId) : null;
            if (pratiqueActive?.affichageNote === 'lettre') modeNote = 'lettre';
        } catch(e) { console.warn('[Travaux-UI] pratique affichageNote fallback:', e.message || e); }

        let noteHTML;
        if (modeNote === 'lettre') {
            noteHTML = `Niveau : <strong>${echapperHtml(evaluation.niveauFinal || '—')}</strong>`;
        } else {
            noteHTML = `Note : <strong>${evaluation.noteFinale != null ? evaluation.noteFinale + '%' : '—'}</strong> &nbsp;|&nbsp; Niveau : <strong>${echapperHtml(evaluation.niveauFinal || '—')}</strong>`;
        }

        // Construire le modal
        const html = `
        <div class="modal-overlay actif" id="travaux-modal-retroaction" data-close-on-bg="travauxUI.fermerModalRetroaction">
            <div class="modal-contenu" style="max-width: 620px;">
                <button class="modal-fermer" data-action="travauxUI.fermerModalRetroaction">&times;</button>
                <h3 class="modal-titre">Rétroaction — ${nomEtudiant}</h3>

                <div class="travaux-retro-entete">
                    <div>Production : <strong>${echapperHtml(evaluation.productionNom || '—')}</strong></div>
                    <div>Grille : <strong>${echapperHtml(evaluation.grilleNom || '—')}</strong></div>
                    <div>${noteHTML}</div>
                </div>

                ${criteresHTML}

                <h4 style="margin: 12px 0 4px;">Rétroaction globale</h4>
                <textarea id="travaux-modal-retro-texte" class="travaux-retro-textarea">${echapperHtml(evaluation.retroactionFinale || '')}</textarea>

                <div class="modal-actions" style="margin-top: 12px;">
                    <button class="btn btn-secondaire" data-action="travauxUI.fermerModalRetroaction">Annuler</button>
                    <button class="btn btn-principal" data-action="travauxUI.sauvegarderRetroactionDepuisModal" data-param="${fichierId}">Sauvegarder</button>
                </div>
            </div>
        </div>`;

        // Retirer un modal existant
        const existant = document.getElementById('travaux-modal-retroaction');
        if (existant) existant.remove();

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Sauvegarde la rétroaction modifiée depuis le modal.
     * Ne modifie que retroactionFinale et dateModification.
     * @param {string} fichierId - ID du fichier
     */
    function sauvegarderRetroactionDepuisModal(fichierId) {
        const textarea = document.getElementById('travaux-modal-retro-texte');
        if (!textarea) return;

        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) return;

        const evalTrouvee = travauxResolution.trouverEvaluationPourFichier(fichier);
        if (!evalTrouvee) return;
        let evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        const index = evaluations.findIndex(e => e.id === evalTrouvee.id);

        if (index === -1) return;

        evaluations[index].retroactionFinale = textarea.value;
        evaluations[index].dateModification = new Date().toISOString();
        const resultat = sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations);

        fermerModalRetroaction();

        if (resultat === true) {
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Rétroaction sauvegardée');
            }
        } else if (resultat === 'quota') {
            if (typeof afficherNotificationErreur === 'function') {
                afficherNotificationErreur('Espace de stockage insuffisant', 'Impossible de sauvegarder la rétroaction.');
            }
        }
    }

    /**
     * Ferme le modal de rétroaction.
     */
    function fermerModalRetroaction() {
        const modal = document.getElementById('travaux-modal-retroaction');
        if (modal) modal.remove();
    }

    /* ===============================
       TRANSFERT ENTRE GROUPES-COURS
       =============================== */

    /**
     * Ouvre la modale de transfert de fichiers vers un autre groupe-cours
     */
    function ouvrirModalTransfert() {
        // Fichiers du groupe actif
        const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();
        if (fichiersTravaux.length === 0) return;

        // Groupes-cours du trimestre
        const groupesCours = db.getSync(cle('groupesCours'), []);
        const gcActif = db.getSync('groupeCoursActif', null);
        const gcActifId = gcActif ? gcActif.id : null;

        // Hydrater les labels (pattern entites-ui.js)
        const cours = db.getSync('cours', []);
        const listeCours = db.getSync('listeCours', []);
        const enseignants = db.getSync('enseignants', []);
        const horaires = db.getSync(cle('horaires'), []);

        const groupesCibles = groupesCours
            .filter(gc => gc.id !== gcActifId)
            .map(gc => {
                let coursInfo = cours.find(c => c.id === gc.coursId);
                if (!coursInfo) {
                    coursInfo = listeCours.find(c => c.id === gc.coursId || c.sigle === gc.coursId);
                }
                coursInfo = coursInfo || {};
                const ens = enseignants.find(e => e.id === gc.enseignantId) || {};
                const sigle = coursInfo.codeCours || coursInfo.code || coursInfo.sigle || null;
                const groupe = gc.groupeNum || gc.groupe || '00001';
                const nomEns = ens.prenom ? `${ens.prenom} ${(ens.nom || '').charAt(0)}.` : '';
                let label = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;
                if (nomEns) label += ` - ${nomEns}`;
                return { id: gc.id, coursId: gc.coursId, label: label };
            });

        if (groupesCibles.length === 0) {
            alert('Aucun autre groupe-cours disponible pour le transfert.');
            return;
        }

        // Determiner le statut de chaque fichier
        const evaluations = obtenirDonneesSelonMode(cle('evaluationsSauvegardees')) || [];
        const lignesFichiers = fichiersTravaux.map(f => {
            const etudiant = travauxImport.trouverEtudiantParDA(f.etudiantDA);
            const nomEtudiant = etudiant
                ? (etudiant.nom ? `${etudiant.nom}, ${etudiant.prenom}` : etudiant.prenom)
                : (f.etudiantDA || 'Non associé');

            let statut = 'importé';
            const annotation = travauxStockage.obtenirAnnotationFichier(f.id);
            if (annotation && annotationContientDuContenu(annotation)) {
                statut = 'annoté';
            }
            const evaluation = evaluations.find(e =>
                e.etudiantDA === f.etudiantDA && e.productionId === f.productionId
            );
            if (evaluation) statut = 'évalué';

            return { id: f.id, nom: f.nomFichier, etudiant: nomEtudiant, statut: statut };
        });

        // Construire la modale
        const optionsGroupes = groupesCibles.map(g =>
            `<option value="${g.id}" data-cours-id="${g.coursId}">${echapperHtml(g.label)}</option>`
        ).join('');

        const lignesHTML = lignesFichiers.map(f => `
            <label class="transfert-fichier-ligne">
                <input type="checkbox" value="${f.id}" class="transfert-checkbox-fichier">
                <span class="transfert-fichier-nom" title="${echapperHtml(f.nom)}">${echapperHtml(f.etudiant)}</span>
                <span class="travaux-badge-pill ${f.statut === 'annoté' ? 'annote' : f.statut === 'évalué' ? 'evalue' : 'importe'}">${f.statut}</span>
            </label>
        `).join('');

        const hasAnnotations = lignesFichiers.some(f => f.statut === 'annoté' || f.statut === 'évalué');

        const overlay = document.createElement('div');
        overlay.id = 'transfert-modal-overlay';
        overlay.className = 'modal-overlay actif';
        overlay.innerHTML = `
            <div class="modal-contenu modal-compact" style="max-width: 560px;">
                <button class="modal-fermer" data-action="fermerOverlayParent">&times;</button>
                <h3 class="modal-titre">Transférer des fichiers</h3>

                <label style="font-size: 0.85em; color: var(--texte-secondaire);">Groupe cible :</label>
                <select id="transfert-groupe-cible" class="controle-form" style="margin: 6px 0 12px 0; width: 100%;">
                    ${optionsGroupes}
                </select>

                <div class="transfert-liste-fichiers">
                    <label class="transfert-tout-selectionner">
                        <input type="checkbox" id="transfert-tout-selectionner">
                        Tout sélectionner (${lignesFichiers.length} fichiers)
                    </label>
                    ${lignesHTML}
                </div>

                <div class="transfert-avertissement">
                    Le lien avec la production sera effacé. Tu pourras réassigner les fichiers dans le groupe cible.
                    ${hasAnnotations ? '<br>Les annotations seront conservées.' : ''}
                </div>

                <div class="modal-actions">
                    <button class="btn btn-principal" id="transfert-btn-executer" disabled>Transférer 0 fichier(s)</button>
                    <button class="btn btn-secondaire" data-action="fermerOverlayParent">Annuler</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        // Evenements
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // Tout selectionner
        const toutSelCheckbox = document.getElementById('transfert-tout-selectionner');
        const checkboxes = overlay.querySelectorAll('.transfert-checkbox-fichier');
        const btnExec = document.getElementById('transfert-btn-executer');

        function mettreAJourCompteur() {
            const selectionnes = overlay.querySelectorAll('.transfert-checkbox-fichier:checked');
            const n = selectionnes.length;
            btnExec.textContent = `Transférer ${n} fichier(s)`;
            btnExec.disabled = (n === 0);
        }

        toutSelCheckbox.addEventListener('change', () => {
            checkboxes.forEach(cb => { cb.checked = toutSelCheckbox.checked; });
            mettreAJourCompteur();
        });

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                toutSelCheckbox.checked = (overlay.querySelectorAll('.transfert-checkbox-fichier:checked').length === checkboxes.length);
                mettreAJourCompteur();
            });
        });

        // Bouton transfert
        btnExec.onclick = () => {
            const selectionnes = Array.from(overlay.querySelectorAll('.transfert-checkbox-fichier:checked')).map(cb => cb.value);
            const selectCible = document.getElementById('transfert-groupe-cible');
            const cibleId = selectCible.value;
            const cibleCoursId = selectCible.selectedOptions[0].getAttribute('data-cours-id');
            if (selectionnes.length === 0 || !cibleId) return;
            executerTransfert(selectionnes, cibleId, cibleCoursId);
            overlay.remove();
        };
    }

    /**
     * Execute le transfert de fichiers vers un autre groupe-cours
     * @param {Array} fichierIds - IDs des fichiers a transferer
     * @param {string} groupeCoursCibleId - ID du groupe-cours cible
     * @param {string} coursCibleId - ID du cours cible
     */
    function executerTransfert(fichierIds, groupeCoursCibleId, coursCibleId) {
        const associations = {};
        fichierIds.forEach(id => {
            associations[id] = {
                coursId: coursCibleId,
                groupeCoursId: groupeCoursCibleId,
                productionId: ''
            };
        });

        const nb = travauxStockage.reassocierFichiersBatch(associations);

        // Rafraichir l'affichage
        afficherImport();

        // Notification
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(`${nb} fichier(s) transféré(s) vers le groupe cible`);
        }

    }

    /* ===============================
       COMPTEUR DE BADGES (navigation fichiers)
       =============================== */

    /**
     * Retourne la liste de fichiers filtrée par la production active (si applicable).
     */
    function obtenirFichiersNavigables() {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif();
        if (!productionFiltreActive) return fichiers;
        return fichiers.filter(f => f.productionId === productionFiltreActive);
    }

    function mettreAJourCompteurBadge() {
        const fichiers = obtenirFichiersNavigables();
        const fichierActuel = travauxVisionneuse.getFichierActuel();
        const index = fichierActuel ? fichiers.findIndex(f => f.id === fichierActuel.id) : -1;

        const texte = index >= 0 ? `${index + 1} / ${fichiers.length}` : `-- / ${fichiers.length || '--'}`;
        const precDisabled = index <= 0;
        const suivDisabled = index < 0 || index >= fichiers.length - 1;

        // Mettre à jour le compteur toolbar (annotation)
        const ind1 = document.getElementById('travaux-compteur-badge');
        if (ind1) ind1.textContent = texte;
        const bp1 = document.getElementById('travaux-btn-badge-prec');
        if (bp1) bp1.disabled = precDisabled;
        const bs1 = document.getElementById('travaux-btn-badge-suiv');
        if (bs1) bs1.disabled = suivDisabled;

        // Mettre à jour le compteur header (Fichiers importés)
        const ind2 = document.getElementById('travaux-compteur-badge-txt-header');
        if (ind2) ind2.textContent = texte;
        const bp2 = document.getElementById('travaux-btn-badge-prec-header');
        if (bp2) bp2.disabled = precDisabled;
        const bs2 = document.getElementById('travaux-btn-badge-suiv-header');
        if (bs2) bs2.disabled = suivDisabled;
    }

    function badgePrecedent() {
        const fichiers = obtenirFichiersNavigables();
        const fichierActuel = travauxVisionneuse.getFichierActuel();
        if (!fichierActuel) return;
        const index = fichiers.findIndex(f => f.id === fichierActuel.id);
        if (index > 0) ouvrirFichier(fichiers[index - 1].id);
    }

    function badgeSuivant() {
        const fichiers = obtenirFichiersNavigables();
        const fichierActuel = travauxVisionneuse.getFichierActuel();
        if (!fichierActuel) return;
        const index = fichiers.findIndex(f => f.id === fichierActuel.id);
        if (index >= 0 && index < fichiers.length - 1) ouvrirFichier(fichiers[index + 1].id);
    }

    /* ===============================
       CHANGEMENT DE MODE (anonymisation)
       =============================== */

    window.addEventListener('modeChanged', function() {
        // Regénérer les badges fichiers pour appliquer/retirer l'anonymisation
        var conteneurBadges = document.querySelector('.travaux-badges-liste');
        if (conteneurBadges) {
            afficherFichiers();
        }
    });

    /* ===============================
       WRAPPERS DELEGATION (Phase 5)
       =============================== */

    /** Annuler import : vide la file + rafraîchit l'UI */
    function annulerImport() {
        travauxImport.viderFileDAttente();
        afficherImport();
    }

    /** Alléger le fichier actuellement ouvert dans la visionneuse */
    function allegerFichierActuel() {
        var fichier = travauxVisionneuse.getFichierActuel();
        if (fichier && fichier.id) allegerFichier(fichier.id);
    }

    /** Re-importer le fichier actuellement ouvert dans la visionneuse */
    function reimporterFichierActuel() {
        var fichier = travauxVisionneuse.getFichierActuel();
        if (fichier && fichier.id) reimporterFichier(fichier.id);
    }

    /** Changer la production d'un fichier depuis le tableau (onchange select) */
    function changerProductionFichierDepuisTableau(el) {
        var fichierId = el.dataset.fichierId;
        var value = el.value;
        changerProductionFichier(fichierId, value);
        var row = el.closest('tr');
        if (row) row.dataset.productionId = value;
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
        badgePrecedent: badgePrecedent,
        badgeSuivant: badgeSuivant,
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
        associerJetonProduction: associerJetonProduction,
        changerJetonProductionPipeline: changerJetonProductionPipeline,
        identifierAutoPipeline: identifierAutoPipeline,
        rafraichirPipelineUI: rafraichirPipelineUI,
        // Archivage
        lancerArchivage: lancerArchivage,
        lancerArchivageEtudiant: lancerArchivageEtudiant,
        lancerArchivageProduction: lancerArchivageProduction,
        lancerArchivageSemestre: lancerArchivageSemestre,
        lancerExportLea: lancerExportLea,
        mettreAJourCompteurLea: mettreAJourCompteurLea,
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
        ouvrirPreparationFichier: ouvrirPreparationFichier,
        selectionnerFichierPipeline: selectionnerFichierPipeline,
        deselectionnerFichierPipeline: deselectionnerFichierPipeline,
        defaireGroupePipeline: defaireGroupePipeline,
        retirerFichierPipeline: retirerFichierPipeline,
        redeposerFichiers: redeposerFichiers,
        monterFichierPipeline: monterFichierPipeline,
        descendreFichierPipeline: descendreFichierPipeline,
        // Suppression
        supprimerFichierImporte: supprimerFichierImporte,
        // Cycle de vie
        allegerFichier: allegerFichier,
        reimporterFichier: reimporterFichier,
        // Chrono évaluation
        demarrerChrono: demarrerChrono,
        arreterChrono: arreterChrono,
        getDureeMs: getDureeMs,
        resetChrono: resetChrono,
        // Association production
        changerProductionFichier: changerProductionFichier,
        // Preview inline
        ouvrirPreviewInline: ouvrirPreviewInline,
        previewPagePrec: previewPagePrec,
        previewPageSuiv: previewPageSuiv,
        fermerPreviewInline: fermerPreviewInline,
        // Rafraichissement
        rafraichirUI: rafraichirUI,
        // Palette jetons (unifiée dans optionsJetons via peuplementOptJetons)
        // Filtres badges
        filtrerBadgesParProduction: filtrerBadgesParProduction,
        // Tableau fichiers (vue par défaut Annoter et évaluer)
        filtrerTableauFichiers: filtrerTableauFichiers,
        rafraichirTableauFichiers: rafraichirTableauFichiers,
        // Utilitaires
        annotationContientDuContenu: annotationContientDuContenu,
        // Metadata pipeline (LEA / Autre)
        toggleModeImport: toggleModeImport,
        rechercherEtudiant: rechercherEtudiant,
        selectionnerEtudiant: selectionnerEtudiant,
        ouvrirListeEtudiants: ouvrirListeEtudiants,
        changerDateFichier: changerDateFichier,
        changerNomDocumentLibre: changerNomDocumentLibre,
        changerProductionPipeline: changerProductionPipeline,
        // Fusion multi-fichiers
        toggleSelectionFusion: toggleSelectionFusion,
        annulerSelectionFusion: annulerSelectionFusion,
        fusionnerFichiers: fusionnerFichiers,
        // Editeur de pages
        ouvrirEditeurPages: ouvrirEditeurPages,
        fermerEditeurPages: fermerEditeurPages,
        selectionnerPageEditeur: selectionnerPageEditeur,
        monterPageEditeur: monterPageEditeur,
        descendrePageEditeur: descendrePageEditeur,
        supprimerPageEditeur: supprimerPageEditeur,
        pivoterPageEditeur: pivoterPageEditeur,
        ajouterPagesEditeur: ajouterPagesEditeur,
        sauvegarderEdition: sauvegarderEdition,
        // Fusion depuis editeur
        ouvrirModalFusionEditeur: ouvrirModalFusionEditeur,
        confirmerFusionEditeur: confirmerFusionEditeur,
        fermerModalFusionEditeur: fermerModalFusionEditeur,
        filtrerModalFusion: filtrerModalFusion,
        majCompteurFusion: majCompteurFusion,
        // Rétroaction (archivage)
        afficherRetroaction: afficherRetroaction,
        sauvegarderRetroactionDepuisModal: sauvegarderRetroactionDepuisModal,
        fermerModalRetroaction: fermerModalRetroaction,
        // Transfert entre groupes
        ouvrirModalTransfert: ouvrirModalTransfert,
        // Layout annotation ancré
        creerLayoutAnnotation: creerLayoutAnnotation,
        detruireLayoutAnnotation: detruireLayoutAnnotation,
        // Wrappers délégation (Phase 5)
        annulerImport: annulerImport,
        allegerFichierActuel: allegerFichierActuel,
        reimporterFichierActuel: reimporterFichierActuel,
        changerProductionFichierDepuisTableau: changerProductionFichierDepuisTableau
    };

    // Alias pour navigation.js
    window.initialiserModuleTravaux = initialiserModuleTravaux;

})();
