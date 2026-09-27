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
    let modeCourant = 'annoter'; // 'annoter' | 'evaluer' — n'écrire que par _setModeCourant (#798)
    let fichierSelectionneIndex = -1; // -1 = aucune selection dans le pipeline
    let productionFiltreActive = sessionStorage.getItem('travaux-filtre-production') || '';
    // #558 B2 — le choix « Rés. max. » ne vivait QUE dans le DOM. Le select est
    // re-généré à chaque rendu du pipeline avec `selected` codé en dur sur 250 :
    // un autre choix était silencieusement écrasé, alors que la valeur est
    // réellement utilisée (uniformisation DPI du traitement par lots). Mémorisé
    // ici, et en session comme le filtre de production ci-dessus.
    let dpiPipelineChoisi = sessionStorage.getItem('travaux-pipeline-dpi') || '250';
    let _htmlBadgesGrille = ''; // HTML badges pré-généré pour injection dans toolbar unique
    let _htmlDropdownProduction = ''; // HTML dropdown production séparé (fixe, hors scroll)
    let selectionFusion = new Set(); // IDs des fichiers selectionnes pour fusion

    /* ===============================
       CHRONO ÉVALUATION
       =============================== */

    let _chronoDebut = null;       // Date.now() du début du segment actif
    let _chronoFichierId = null;   // fichier actif
    let _chronoInterval = null;    // setInterval pour affichage live
    let _chronoPaused = false;     // en pause ?
    let _chronoElapsed = 0;        // ms accumulées avant la pause courante

    function _formaterDuree(ms) {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return min + ':' + String(sec).padStart(2, '0');
    }

    function _chronoTotalMs() {
        if (_chronoDebut) return _chronoElapsed + (Date.now() - _chronoDebut);
        return _chronoElapsed;
    }

    // Badge chrono, dans la barre du haut de la visionneuse (retour testeur du 23 sept. 2026)
    var _chronoBadgeIds = ['chrono-badge'];
    var _CHRONO_TITRE = 'Démarre à la 1re annotation et s\'arrête à l\'enregistrement.';

    function _majAffichageChrono() {
        // Le groupe n'existe dans la barre que si la préférence est cochée.
        var groupe = document.getElementById('travaux-chrono-toolbar');
        if (groupe) groupe.classList.toggle('u-hide', obtenirPreference('chronoEvaluation') !== true);
        var total = _chronoTotalMs();
        var enCours = _chronoDebut && !_chronoPaused;
        var chronoActif = enCours || _chronoPaused;
        var texte = (total > 0 || enCours) ? _formaterDuree(total) : '--:--';
        _chronoBadgeIds.forEach(function(id) {
            var badge = document.getElementById(id);
            if (!badge) return;
            badge.textContent = texte;
            badge.classList.toggle('actif', enCours);
            badge.classList.toggle('pause', _chronoPaused);
        });
        // Bouton unique pause/play (palette flottante)
        var btn = document.getElementById('chrono-btn-pause');
        if (btn) {
            btn.style.display = chronoActif ? '' : 'none';
            btn.textContent = _chronoPaused ? '\u25b6\ufe0f' : '\u23f8\ufe0f';
            btn.title = _chronoPaused ? 'Reprendre (ou annoter)' : 'Pause';
        }
    }

    function demarrerChrono() {
        if (!obtenirPreference('chronoEvaluation')) return;
        // Si en pause → reprendre automatiquement
        if (_chronoPaused) {
            reprendreChrono();
            return;
        }
        if (_chronoDebut) return; // déjà en cours
        _chronoDebut = Date.now();
        _chronoElapsed = 0;
        _chronoPaused = false;
        const fichier = travauxVisionneuse.getFichierActuel();
        _chronoFichierId = fichier ? fichier.id : null;
        _majAffichageChrono();
        _chronoInterval = setInterval(_majAffichageChrono, 1000);

        // Rappels de bien-être (Phase 4 Rythme)
        if (typeof Rythme !== 'undefined' && Rythme.verifierBienEtre) {
            Rythme.verifierBienEtre();
        }

        // Afficher la moyenne pour cette activité dès le démarrage
        var ec = window.evaluationEnCours;
        var productionId = ec ? ec.productionId : null;
        if (productionId) {
            var prods = (typeof obtenirDonneesSelonMode === 'function')
                ? obtenirDonneesSelonMode('productions')
                : db.getSync(cle('productions'), []);
            var prod = prods.find(function(p) { return p.id === productionId; });
            var activite = prod ? (prod.activiteApprentissage || prod.description || null) : null;
            if (activite) {
                var historique = db.getSync(cle('chronoEvaluations'), []);
                var moyenneInfo = _calculerMoyenneActivite(historique, activite);
                _afficherInfoMoyenne(moyenneInfo);
            }
        }
    }

    function pauserChrono() {
        if (!_chronoDebut || _chronoPaused) return;
        _chronoElapsed += Date.now() - _chronoDebut;
        _chronoDebut = null;
        _chronoPaused = true;
        if (_chronoInterval) { clearInterval(_chronoInterval); _chronoInterval = null; }
        _majAffichageChrono();
    }

    function reprendreChrono() {
        if (!_chronoPaused) return;
        _chronoPaused = false;
        _chronoDebut = Date.now();
        _majAffichageChrono();
        _chronoInterval = setInterval(_majAffichageChrono, 1000);
    }

    function togglePauseChrono() {
        if (_chronoPaused) reprendreChrono();
        else pauserChrono();
    }

    function arreterChrono() {
        if (!_chronoDebut && _chronoElapsed === 0) return;
        const dureeMs = _chronoTotalMs();
        if (_chronoInterval) { clearInterval(_chronoInterval); _chronoInterval = null; }
        // Arrêter les rappels de bien-être
        if (typeof Rythme !== 'undefined' && Rythme.arreterRappelPause) {
            Rythme.arreterRappelPause();
        }

        // Identifier l'activité d'apprentissage en cours
        var ec = window.evaluationEnCours;
        var productionId = ec ? ec.productionId : null;
        var activite = null;
        var productionNom = null;
        if (productionId) {
            var prods = (typeof obtenirDonneesSelonMode === 'function')
                ? obtenirDonneesSelonMode('productions')
                : db.getSync(cle('productions'), []);
            var prod = prods.find(function(p) { return p.id === productionId; });
            if (prod) {
                activite = prod.activiteApprentissage || prod.description || null;
                productionNom = prod.titre || prod.nom;
            }
        }

        // Stocker dans les 200 dernières entrées (groupées par activité)
        const cleStock = cle('chronoEvaluations');
        let historique = db.getSync(cleStock, []);
        historique.push({
            dureeMs: dureeMs,
            date: new Date().toISOString(),
            activite: activite,
            productionId: productionId,
            productionNom: productionNom,
            etudiantDA: ec ? (ec.etudiantDA || '') : '',
            groupeCoursId: ec ? (ec.groupeCoursId || '') : ''
        });
        if (historique.length > 200) historique = historique.slice(-200);
        db.setSync(cleStock, historique);

        // Calculer la moyenne pour cette activité d'apprentissage
        var moyenneInfo = _calculerMoyenneActivite(historique, activite);

        // Afficher résultat + moyenne dans les badges
        var texteResultat = _formaterDuree(dureeMs) + ' (moy. ' + _formaterDuree(moyenneInfo.moyenneMs) + ')';
        _chronoBadgeIds.forEach(function(id) {
            var badge = document.getElementById(id);
            if (badge) {
                badge.textContent = texteResultat;
                badge.classList.remove('actif');
                badge.classList.remove('pause');
            }
        });

        // Afficher le détail dans la ligne d'info
        _afficherInfoMoyenne(moyenneInfo);

        _chronoDebut = null;
        _chronoFichierId = null;
        _chronoElapsed = 0;
        _chronoPaused = false;
        _majAffichageChrono();
    }

    /**
     * Calcule la moyenne des durées pour une activité d'apprentissage.
     * Regroupe par activité (ex: "Rédaction") plutôt que par production spécifique.
     * Fallback sur productionId pour les anciennes entrées sans champ activite.
     * @returns {{ moyenneMs: number, count: number, activite: string|null }}
     */
    function _calculerMoyenneActivite(historique, activite) {
        var entrees;
        if (activite) {
            entrees = historique.filter(function(e) { return e.activite === activite; });
        } else {
            entrees = historique;
        }
        if (entrees.length === 0) return { moyenneMs: 0, count: 0, activite: null };
        var somme = entrees.reduce(function(s, e) { return s + e.dureeMs; }, 0);
        return {
            moyenneMs: somme / entrees.length,
            count: entrees.length,
            activite: activite || null
        };
    }

    /**
     * Affiche l'info moyenne en infobulle du chrono : dans la barre, une seconde
     * ligne n'a pas de place.
     */
    function _afficherInfoMoyenne(moyenneInfo) {
        var el = document.getElementById('travaux-chrono-toolbar');
        if (!el) return;
        if (moyenneInfo.count < 2) {
            el.title = _CHRONO_TITRE;
            return;
        }
        var nom = moyenneInfo.activite || '';
        el.title = 'Moy. ' + _formaterDuree(moyenneInfo.moyenneMs) + ' × ' + moyenneInfo.count + (nom ? ' · ' + nom : '') + '\n' + _CHRONO_TITRE;
    }

    function getDureeMs() {
        return (_chronoDebut || _chronoElapsed > 0) ? _chronoTotalMs() : null;
    }

    function resetChrono() {
        if (_chronoInterval) { clearInterval(_chronoInterval); _chronoInterval = null; }
        _chronoDebut = null;
        _chronoFichierId = null;
        _chronoElapsed = 0;
        _chronoPaused = false;
        _majAffichageChrono();
    }

    function sauvegarderEtatSession() {
        const fichier = travauxVisionneuse.getFichierActuel();
        if (fichier) sessionStorage.setItem('travaux-dernier-fichier', fichier.id);
        sessionStorage.setItem('travaux-mode-courant', modeCourant);
    }

    function restaurerEtatSession() {
        // Toujours demarrer en mode "annoter" (l'utilisateur bascule manuellement vers Evaluer)
        _setModeCourant('annoter');
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
            // ⚠ LE DRAPEAU EST POSÉ DANS LE MÊME try QUE LA MIGRATION (1er sept. 2026).
            // Il vivait DEHORS, après le catch. Quand localStorage est saturé, ce
            // `setItem` de deux octets lève un QuotaExceededError NON RATTRAPÉ, dans
            // une IIFE de haut niveau : l'initialisation du module s'arrête là, et
            // l'écran d'évaluation reste sur « Chargement… » pour toujours.
            // Mesuré chez Grégoire le 31 août 2026 au soir, magasin plein — le même
            // quota refusait aussi une écriture de QUATRE octets.
            // ⮕ La migration est une COMMODITÉ d'affichage (des largeurs de panneau).
            // Elle n'a pas le droit d'empêcher l'application de démarrer. Si le
            // drapeau ne peut pas être posé, la migration sera simplement retentée
            // au prochain démarrage : elle est idempotente.
            localStorage.setItem(MIGRATION_KEY, '1');
        } catch (_) { console.warn('[Travaux-UI] eval widths migration skipped:', _.message || _); }
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
       DROPDOWN ACTIONS (Annoter / Évaluer)
       =============================== */

    function _configurerDropdownActions() {
        var btn = document.getElementById('travaux-btn-actions');
        var dropdown = document.getElementById('travaux-actions-dropdown');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('ouvert');
        });
        // Fermer au clic ailleurs
        document.addEventListener('click', function() {
            dropdown.classList.remove('ouvert');
        });
        // Fermer après un clic dans le menu (l'action est déjà déléguée par data-action)
        dropdown.addEventListener('click', function() {
            dropdown.classList.remove('ouvert');
        });

        // Le bouton vient d'être (re)créé : il prend le mode courant.
        _rafraichirLabelBtnActions();
    }

    /**
     * #798 — LE MODE EST LA SOURCE, LE LIBELLÉ EN EST LA VUE.
     *
     * Rapport testeur du 9 sept. 2026 : « le bouton affiche Évaluer alors que
     * nous sommes en mode Annotation ». Le libellé se posait à la main, et
     * SEPT chemins de navigation remettaient `modeCourant` à « annoter » sans
     * le dire au bouton — SIX, comptés au grep (retour sur l'onglet, ouverture
     * d'un fichier depuis un badge, restauration de session, reprise du dernier
     * fichier, réinitialisation après navigation, fermeture du mode
     * évaluation). Passer par `_setModeCourant` est
     * désormais le seul moyen de changer de mode : les deux ne peuvent plus
     * diverger.
     */
    function _setModeCourant(mode) {
        modeCourant = (mode === 'evaluer') ? 'evaluer' : 'annoter';
        _rafraichirLabelBtnActions();
    }

    /** Réécrit le libellé du bouton Actions d'après `modeCourant`. */
    function _rafraichirLabelBtnActions() {
        var btn = document.getElementById('travaux-btn-actions');
        if (btn) btn.textContent = (modeCourant === 'evaluer' ? 'Évaluer' : 'Annoter') + ' \u25BE';
    }

    /* ===============================
       LAYOUT ANNOTATION (palettes flottantes)
       =============================== */

    function creerLayoutAnnotation(options) {
        options = options || {};
        const conteneurDocId = options.conteneurDocId || 'travaux-conteneur-document';

        const conteneurDoc = document.getElementById(conteneurDocId);
        if (!conteneurDoc) return;

        // Ne pas recréer si la palette annotation existe déjà
        if (conteneurDoc.querySelector('#travaux-palette-flottante')) return;

        const zoneCanvas = conteneurDoc.querySelector('#travaux-zone-canvas') || conteneurDoc;

        // --- Palette Annotation (flottante par-dessus le canvas, top-left) ---
        const paletteDiv = document.createElement('div');
        paletteDiv.innerHTML = travauxOutils.genererHTMLPalette();
        const paletteEl = paletteDiv.firstElementChild;
        paletteEl.style.top = '12px';
        paletteEl.style.left = '12px';
        zoneCanvas.appendChild(paletteEl);
        travauxOutils.configurerDragPalette(paletteEl, zoneCanvas);

        // Bouton réglages annotation (click direct — le dispatcher ne traverse pas le canvas overlay)
        const btnReglagesAnnot = document.getElementById('travaux-btn-reglages-annotation');
        if (btnReglagesAnnot) {
            btnReglagesAnnot.addEventListener('click', function(e) {
                e.stopPropagation();
                travauxOutils.afficherRaccourcis();
            });
        }

        // Ouvrir les palettes Codes et Tampons par défaut
        if (typeof travauxOutils !== 'undefined') {
            if (!document.getElementById('travaux-palette-erreurs-fr') && travauxOutils.togglePaletteErreursFrancais) {
                travauxOutils.togglePaletteErreursFrancais();
            }
            if (!document.getElementById('travaux-palette-tampons') && travauxOutils.togglePaletteAutocollants) {
                travauxOutils.togglePaletteAutocollants();
            }
        }
    }

    function detruireLayoutAnnotation(conteneurDocId) {
        conteneurDocId = conteneurDocId || 'travaux-conteneur-document';
        const conteneurDoc = document.getElementById(conteneurDocId);
        if (!conteneurDoc) return;

        // Supprimer la palette d'annotation
        const palette = conteneurDoc.querySelector('#travaux-palette-flottante');
        if (palette) palette.remove();
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
                _setModeCourant('annoter');
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
                // #868 (15 sept. 2026) — « Évaluer » SANS copie arrive : ne rien rouvrir, ni la
                // copie encore ouverte (cas 1), ni son mode Évaluer. Sinon elle reprenait les
                // panneaux, et le formulaire affichait SA production (mesuré au navigateur).
                // Le cas 2 et la restauration initiale lisent `travaux-dernier-fichier`, que
                // `_evaluerSansCopie` (evaluation.js) retire. Drapeau dédié, pas
                // `_modifierEvaluationEnCours` : liste-evaluations.js arme celui-là en COMPTANT
                // sur la restauration des palettes.
                if (window._evaluerSansCopieEnCours) {
                    if (typeof travauxAnnotation !== 'undefined' && travauxAnnotation.desactiverAnnotation) {
                        travauxAnnotation.desactiverAnnotation();   // enregistre les annotations en cours
                    }
                    if (document.getElementById('travaux-palette-eval-gauche')) fermerModeEvaluation();
                    _setModeCourant('annoter');
                    return;
                }
                // Cas 1 : fichier deja ouvert dans la visionneuse — reactiver + restaurer palettes
                // #881 — la copie ouverte a pu partir à la corbeille depuis « Exporter et
                // archiver » : ne pas la rouvrir, laisser la reconstruction générale plus bas.
                const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();
                const fichierOuvertBrut = travauxVisionneuse.getFichierActuel();
                const fichierOuvert = (fichierOuvertBrut && fichiersTravaux.some(function(f) { return f.id === fichierOuvertBrut.id; }))
                    ? fichierOuvertBrut : null;
                if (fichierOuvert) {
                    // Régénérer les badges toolbar à CHAQUE retour. #881 (16 sept. 2026) — la
                    // garde « bande vide » laissait en place les badges d'avant une suppression
                    // faite dans « Exporter et archiver » : les copies jetées restaient au carrousel.
                    const badgeStrip = document.querySelector('.annot-toolbar-fichiers');
                    if (badgeStrip && fichiersTravaux.length > 0) {
                        const defilement = badgeStrip.scrollLeft;
                        _htmlBadgesGrille = genererGrilleFichiers(fichiersTravaux, 'ouvrirFichier');
                        badgeStrip.innerHTML = _htmlBadgesGrille;
                        badgeStrip.scrollLeft = defilement;
                        // Marquer le badge actif
                        const badgeActif = badgeStrip.querySelector('[data-fichier-id="' + fichierOuvert.id + '"]');
                        if (badgeActif) badgeActif.classList.add('actif');
                        // Le dropdown production porte des compteurs : le remplacer, ou le restaurer si absent
                        const prodExistant = document.querySelector('.annot-toolbar-production');
                        if (prodExistant) {
                            prodExistant.innerHTML = _htmlDropdownProduction;
                        } else if (_htmlDropdownProduction) {
                            var prodDiv = document.createElement('div');
                            prodDiv.className = 'annot-toolbar-production';
                            prodDiv.innerHTML = _htmlDropdownProduction;
                            badgeStrip.parentNode.insertBefore(prodDiv, badgeStrip);
                        }
                        if (productionFiltreActive) filtrerBadgesParProduction();
                    }
                    if (typeof travauxAnnotation !== 'undefined' && travauxAnnotation.activerAnnotation) {
                        travauxAnnotation.activerAnnotation();
                    }
                    // Restaurer les palettes flottantes (annotation ou évaluation)
                    if (modeCourant === 'evaluer' && fichierOuvert.etudiantDA) {
                        basculerMode('evaluer');
                    } else {
                        afficherPalettesAnnotation();
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
                        _setModeCourant('annoter');
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
            _setModeCourant('annoter');
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
        div.title = 'Clique pour fermer';
        div.addEventListener('click', () => div.remove());
        document.body.appendChild(div);

        // Auto-dismiss après 8 secondes
        setTimeout(() => { if (div.parentNode) div.remove(); }, 8000);
    }

    /* ===============================
       SOUS-SECTIONS
       =============================== */

    /**
     * Liste les formats que l'application peut RÉELLEMENT lire ici.
     *
     * Le HEIC n'est annoncé que si ce contexte sait le décoder. Ouverte par
     * double-clic, l'application ne le peut pas (#597) : l'annoncer quand même
     * promettait un format qu'elle refusait ensuite en silence.
     *
     * @returns {string} La liste des formats, pour un texte d'interface
     */
    function formatsAcceptesLibelle() {
        const heicLisible = typeof window.HeicDecodeur !== 'undefined'
            && window.HeicDecodeur.decodagePossible();
        return heicLisible ? 'PDF, JPEG, PNG, HEIC' : 'PDF, JPEG, PNG';
    }

    /**
     * Dit, à l'endroit où l'utilisateur clique, si le dossier choisi sera
     * mémorisé d'une session à l'autre.
     *
     * L'ancien texte disait « Recommandé sur Mac » : doublement inexact. Ce
     * n'est pas la machine qui décide mais le NAVIGATEUR (`showDirectoryPicker`
     * n'existe ni dans Safari ni dans Firefox — sur une tablette, aucun
     * navigateur ne l'a, et ce bloc ne s'affiche même pas). Et surtout, il
     * passait sous silence la raison pour laquelle le stockage « ne tient pas »
     * au rechargement : la persistance du dossier est DÉSACTIVÉE PAR DÉFAUT,
     * par choix de sécurité (Défense D, MODELE-MENACES §D-03). Sans cette
     * phrase, le réglage se cherche dans Réglages sans savoir qu'il existe.
     *
     * @returns {string} Le rappel à afficher sous le bouton
     */
    function messageRappelDossierFSAPI() {
        const memorise = window.db && typeof window.db.getFSAPIPersistance === 'function'
            && window.db.getFSAPIPersistance();
        return memorise
            ? 'Le dossier choisi est mémorisé d\'une session à l\'autre.'
            : 'L\'accès au dossier sera redemandé à chaque démarrage. Pour le mémoriser : '
              + 'Réglages > Préférences > Sécurité.';
    }

    /**
     * Affiche la sous-section Import en mode pipeline vertical
     */
    function afficherImport() {
        const conteneur = document.getElementById('evaluations-contenu-import');
        if (!conteneur) return;

        const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();
        const queue = travauxImport.obtenirFileDAttente();
        // #609 (T3.2) — `regrouperParDocument()` était appelée ici pour être
        // passée à `genererEtape2Colonnes`, qui ne l'a jamais lue : elle
        // reconstruit son propre index à partir de `f.groupeDocumentId`.
        // Retiré avec le paramètre mort, pour qu'aucun lecteur ne croie que le
        // rendu de l'étape 2 dépend de la clé de regroupement.

        const fsapiDispo = travauxStockage.estFSAPIDisponible();
        const fsapiActif = travauxStockage.estFSAPIActif();

        const nbImages = queue.filter(f => f.estImage).length;

        // Zero-state pour les novices
        const aideActive = typeof estAideContextuelleActive === 'function' && estAideContextuelleActive();
        const zeroStateHTML = (fichiersTravaux.length === 0 && queue.length === 0 && aideActive) ? `
            <div class="travaux-zero-state">
                <div class="zero-state-icone">&#x1F4DD;</div>
                <h3>Prépare et importe les copies de tes étudiant·es</h3>
                <p class="texte-muted">
                    Dépose les copies numérisées (PDF ou images) : le processus les optimise,
                    regroupe les pages d'une même copie et les associe à une production, prêtes à annoter.
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
                            <small>Le processus optimise et associe automatiquement</small>
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
                        <button class="btn-aide-contextuelle" data-aide="evaluations-importer" aria-label="Aide contextuelle"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button>
                    </h3>
                    <div class="pipeline-stats">
                        ${queue.length > 0 ? `${queue.length} ${window.pluriel(queue.length, 'fichier', 'fichiers')} en file — ${travauxStockage.formaterTaille(queue.reduce((s, f) => s + f.tailleFichier, 0))}` : ''}
                    </div>
                </div>

                ${fsapiDispo ? `
                <div class="travaux-fsapi-config" data-tooltip="travaux-fsapi-config">
                    ${fsapiActif
                        ? '<span class="travaux-fsapi-statut actif">Stockage sur disque actif</span>'
                        : `<button class="btn btn-secondaire" data-action="travauxUI.configurerFSAPI">Configurer le stockage sur disque</button>
                           <span class="texte-muted">${messageRappelDossierFSAPI()}</span>`
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
                                <div class="travaux-drop-zone-icone"><img src="icons/icon-plus.svg" alt="" class="drop-zone-icon"></div>
                                <p>Glisse tes fichiers ici</p>
                                <p class="texte-muted">${formatsAcceptesLibelle()} — ou clique pour parcourir</p>
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
                            <span class="pipeline-etape-compteur">${nbImages} ${window.pluriel(nbImages, 'image', 'images')}</span>
                        </div>
                        ${genererEtape2Colonnes(queue)}
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
                            <img src="icons/icons8-high-priority.svg" alt="" class="alerte-icone"> ${sansProduction} ${window.pluriel(sansProduction, 'fichier', 'fichiers')} ${window.pluriel(sansProduction, "n'est associé", 'ne sont associés')} à aucune production.
                            Vérifie que les productions ont été créées dans « Productions étudiantes » (onglet Conception).
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
            // #911 (17 sept. 2026) — sauver les panneaux eval avant d'écraser le conteneur, comme la
            // branche « visionneuse déjà ouverte » plus bas. Une copie évaluée dans un trimestre, puis
            // bascule vers un trimestre SANS copie (Automne 2025 de Grégoire) : les trois panneaux du
            // formulaire, encore dans les palettes, partaient avec la visionneuse — plus aucune
            // évaluation ne s'ouvrait jusqu'au rechargement (« Timeout : les critères de la grille ne
            // sont pas rendus », `listeCriteresGrille1` absent du DOM).
            if (document.getElementById('travaux-palette-eval-gauche')) {
                fermerModeEvaluation();
                _setModeCourant('annoter');
            }
            conteneur.innerHTML = `
                <div class="conteneur" style="padding: 24px;">
                    <h2 style="margin: 0 0 12px 0;">Annoter et évaluer <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button></h2>
                    <p class="text-muted" style="margin: 0;">Aucun fichier importé. Importe des travaux depuis l'onglet « Préparer et importer ».</p>
                </div>`;
            return;
        }

        // Stocker le HTML badges pour injection dans la toolbar (Phase A — 1 rangée)
        _htmlBadgesGrille = genererGrilleFichiers(fichiersTravaux, 'ouvrirFichier');

        // Si la visionneuse est déjà ouverte, la recréer avec les badges à jour
        if (document.getElementById('travaux-conteneur-document')) {
            // Sauver les panneaux eval avant de détruire le DOM
            if (document.getElementById('travaux-palette-eval-gauche')) {
                fermerModeEvaluation();
            }
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

        // Supprimer le padding de la section parente (comme Planification)
        const section = document.getElementById('section-evaluations');
        if (section) section.classList.add('visionneuse-ouverte');

        const visionDiv = document.createElement('div');
        visionDiv.className = 'travaux-visionneuse-layout';
        visionDiv.innerHTML = `
                <div class="travaux-zone-document" id="travaux-conteneur-document">

                    <!-- Toolbar unique (badges + outils — Phase A) -->
                    <div class="annot-toolbar">
                        <div class="actions-menu" id="travaux-actions-menu">
                            <button class="travaux-btn-action" id="travaux-btn-actions">Actions &#x25BE;</button>
                            <div class="actions-dropdown" id="travaux-actions-dropdown">
                                <button class="actions-item" id="travaux-btn-annoter" data-action="travauxUI.basculerMode" data-param="annoter">Annoter</button>
                                <button class="actions-item actions-item-vert" id="travaux-btn-evaluer" data-action="travauxUI.basculerMode" data-param="evaluer">Évaluer</button>
                                <div class="actions-separateur"></div>
                                <button class="actions-item" id="travaux-btn-editer" data-action="editerFichierDepuisEvaluation">Modifier</button>
                                <!-- Re-importer : opération sur fichier, disponible dans Exporter et archiver -->
                                <!-- Retour testeur du 23 sept. 2026 — la couleur du fond quitte la barre du haut pour ce menu. -->
                                <div class="actions-separateur"></div>
                                <div class="actions-sous-titre">Fond du canevas</div>
                                <div class="actions-fond-swatches" id="travaux-fond-swatches">
                                    <button class="travaux-fond-swatch" data-fond="" title="D\u00e9faut (suit le th\u00e8me)" style="background:var(--surface-conteneur, #142428); border:2px solid var(--accent-primaire)"></button>
                                    <button class="travaux-fond-swatch" data-fond="#142428" title="Oc\u00e9an" style="background:#142428"></button>
                                    <button class="travaux-fond-swatch" data-fond="#1a2744" title="Nuit" style="background:#1a2744"></button>
                                    <button class="travaux-fond-swatch" data-fond="#2c3e50" title="Ardoise" style="background:#2c3e50"></button>
                                    <button class="travaux-fond-swatch" data-fond="#4a6580" title="Acier" style="background:#4a6580"></button>
                                    <button class="travaux-fond-swatch" data-fond="#3d3d3d" title="Graphite" style="background:#3d3d3d"></button>
                                    <button class="travaux-fond-swatch" data-fond="#4a4a3e" title="S\u00e9pia" style="background:#4a4a3e"></button>
                                    <button class="travaux-fond-swatch" data-fond="#6b7b6e" title="Lichen" style="background:#6b7b6e"></button>
                                    <button class="travaux-fond-swatch" data-fond="#8a9aaa" title="Brume" style="background:#8a9aaa"></button>
                                    <button class="travaux-fond-swatch" data-fond="#c5cdd5" title="Givre" style="background:#c5cdd5"></button>
                                    <button class="travaux-fond-swatch" data-fond="#d4cfc4" title="Parchemin" style="background:#d4cfc4"></button>
                                    <button class="travaux-fond-swatch" data-fond="#e8e4da" title="Cr\u00e8me" style="background:#e8e4da"></button>
                                </div>
                            </div>
                        </div>
                        ${_htmlDropdownProduction ? `<div class="annot-toolbar-production">${_htmlDropdownProduction}</div>` : ''}
                        <div class="annot-toolbar-fichiers travaux-fichiers-compact">
                            ${_htmlBadgesGrille}
                        </div>
                        <div class="annot-toolbar-separateur"></div>
                        <div class="annot-toolbar-outils">
                            <button id="travaux-btn-page-prec" class="travaux-btn-nav" data-action="travauxVisionneuse.pagePrecedente" disabled title="Page précédente"><img src="icons/icon-chevron-left.svg" alt="" class="nav-seq-icon"></button>
                            <span id="travaux-indicateur-page">-- / --</span>
                            <button id="travaux-btn-page-suiv" class="travaux-btn-nav" data-action="travauxVisionneuse.pageSuivante" disabled title="Page suivante"><img src="icons/icon-chevron-right.svg" alt="" class="nav-seq-icon"></button>
                            <span class="travaux-separateur"></span>
                            <button id="travaux-btn-zoom100" class="travaux-btn-zoom" data-action="travauxVisionneuse.zoom100" title="Remettre à 100%">100%</button>
                            <span class="travaux-separateur"></span>
                            <button class="travaux-btn-nav" id="travaux-btn-plein-ecran" data-action="travauxUI.togglePleinEcran" title="Plein \u00e9cran"><img src="icons/icon-fit-to-width.svg" alt="" class="nav-seq-icon"></button>
                            <!-- Retour testeur du 23 sept. 2026 — le chronomètre revient dans la barre : en palette, il prenait de la place sur la copie. -->
                            <div id="travaux-chrono-toolbar" class="travaux-chrono-toolbar u-hide" title="Démarre à la 1re annotation et s'arrête à l'enregistrement.">
                                <span class="travaux-separateur"></span>
                                <img src="icons/icons8-stopwatch.svg" alt="Chronomètre" class="nav-seq-icon travaux-chrono-icone">
                                <span id="chrono-badge" class="travaux-chrono-badge">--:--</span>
                                <button id="chrono-btn-pause" class="chrono-btn-etat" data-action="travauxUI.togglePauseChrono" style="display:none" title="Pause">\u23f8\ufe0f</button>
                            </div>
                        </div>
                    </div>

                    <!-- Zone canvas + palettes flottantes -->
                    <div class="travaux-zone-canvas" id="travaux-zone-canvas">
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
                        <!-- Palettes flottantes inserees dynamiquement par JS -->
                    </div>
                </div>
        `;
        conteneur.appendChild(visionDiv);

        // Menu déroulant Actions
        _configurerDropdownActions();

        // Couleur de fond du canvas
        initialiserFondCanvas();

        // Chrono : visible selon la préférence, avec son état courant
        _majAffichageChrono();

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

        const tousEtudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const productions = obtenirDonneesSelonMode('productions');
        const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();
        const dasActifs = new Set(fichiersTravaux.map(f => f.etudiantDA).filter(Boolean));
        const etudiants = tousEtudiants.filter(e => dasActifs.has(e.da));
        const tailleFiltree = fichiersTravaux.reduce((acc, f) => acc + (f.tailleFichier || 0), 0);
        const tailleFormatee = tailleFiltree >= 1048576
            ? (tailleFiltree / 1048576).toFixed(1) + ' Mo'
            : (tailleFiltree / 1024).toFixed(1) + ' Ko';

        conteneur.innerHTML = `
            <h3>Exporter et archiver <button class="btn-aide-contextuelle" data-aide="archiver-travaux" aria-label="Aide contextuelle"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button></h3>
            <p class="texte-muted">${fichiersTravaux.length} ${pluriel(fichiersTravaux.length, 'fichier', 'fichiers')} en stock (${tailleFormatee})</p>

            ${fichiersTravaux.length > 0
                ? genererGrilleFichiers(fichiersTravaux, 'ouvrirPreviewInline')
                : `<p class="placeholder-vide">Aucun fichier en stock pour ce groupe. Importe des travaux dans « Préparer et importer » : ils apparaîtront ici, prêts à être exportés ou archivés.</p>`}

            <div class="travaux-archivage-options">
                <!-- Allégement : fonctionnalité RETIRÉE le 28 août 2026 (décision Grégoire). Le statut « facsimile » subsiste en lecture pour les fichiers déjà allégés. -->

                <!-- Exporter des travaux (#895 : seule carte d'export par ZIP ; « Toutes / Tous » = tout le groupe) -->
                <div class="travaux-archivage-carte">
                    <h4>Exporter des travaux</h4>
                    <p class="texte-muted">Évaluations en JSON + productions en PDF</p>
                    <div class="travaux-archivage-filtres">
                        <div class="groupe-form">
                            <label>Production</label>
                            <select id="travaux-archivage-production" class="controle-form">
                                <option value="">— Toutes —</option>
                                ${productions.map(p => `<option value="${echapperHtml(p.id)}">${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="groupe-form">
                            <label>Étudiant·e</label>
                            <select id="travaux-archivage-etudiant" class="controle-form">
                                <option value="">— Tous —</option>
                                ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${echapperHtml(e.da)}">${e.nom ? echapperHtml(e.nom + ', ' + e.prenom) : echapperHtml(e.prenom)} (${e.daAffichage || e.da})</option>`).join('')}
                            </select>
                        </div>
                        <div class="groupe-form">
                            <label>Dossiers</label>
                            <select id="travaux-archivage-forme" class="controle-form">
                                <option value="etudiant-production">Par étudiant·e et production</option>
                                <option value="etudiant">Par étudiant·e</option>
                            </select>
                        </div>
                    </div>
                    <label style="display:flex;align-items:center;gap:6px;margin-top:6px;cursor:pointer">
                        <input type="checkbox" id="travaux-archivage-compression" checked>
                        Compresser l'archive
                    </label>
                    <div id="travaux-texte-progression" class="texte-muted"></div>
                    <div class="travaux-barre-progression-container">
                        <div id="travaux-barre-progression" class="travaux-barre-progression"></div>
                    </div>
                    <button id="travaux-archivage-telecharger" class="btn btn-principal" data-action="travauxUI.lancerArchivage">Télécharger</button>
                    <!-- #949 : visible pendant un export seulement ; à l'arrêt, rien n'est téléchargé -->
                    <button id="travaux-archivage-arreter" class="btn btn-secondaire" data-action="travauxUI.arreterArchivage" style="display:none">Arrêter l'export</button>
                </div>

                <!-- Export Lea -->
                <div class="travaux-archivage-carte">
                    <h4>Export Léa</h4>
                    <p class="texte-muted">Production annotée + évaluation (note et rétroaction) en PDF pour téléversement dans Léa</p>
                    <div class="travaux-archivage-filtres">
                        <div class="groupe-form">
                            <label>Production</label>
                            <select id="travaux-archivage-lea-production" class="controle-form" data-on-change="travauxUI.mettreAJourCompteurLea">
                                <option value="">— Choisir —</option>
                                ${productions.map(p => `<option value="${echapperHtml(p.id)}">${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="groupe-form">
                            <label>Étudiant·e</label>
                            <select id="travaux-archivage-lea-etudiant" class="controle-form" data-on-change="travauxUI.mettreAJourCompteurLea">
                                <option value="">— Tous —</option>
                                ${[...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e => `<option value="${echapperHtml(e.da)}">${e.nom ? echapperHtml(e.nom + ', ' + e.prenom) : echapperHtml(e.prenom)} (${e.daAffichage || e.da})</option>`).join('')}
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
                    <button class="btn btn-confirmer" data-action="travauxUI.lancerExportLea">Exporter pour Léa</button>
                </div>
            </div>


            <!-- Quota stockage -->
            <div class="travaux-quota-section">
                <h4>Espace de stockage</h4>
                <div id="travaux-quota-info">Chargement…</div>
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
     * Calcule les dimensions cibles apres uniformisation DPI
     * Reprend la logique de uniformiser200DPI() sans toucher aux pixels
     * @param {Object} f - Fichier prepare
     * @returns {{w: number, h: number}} Dimensions cibles
     */
    function calculerDimensionsCibles(f) {
        if (f.estPDF || !f.largeurOriginale || !f.hauteurOriginale) {
            return { w: 0, h: 0 };
        }

        const dpi = parseInt(document.getElementById('pipeline-opt-dpi')?.value) || 0;
        if (!dpi || f.format11x17) {
            return { w: f.largeurOriginale, h: f.hauteurOriginale };
        }

        let w = f.largeurOriginale;
        let h = f.hauteurOriginale;

        let maxW, maxH;
        if (w > 2500 || h > 2500) {
            // Tabloid 11"x17"
            maxW = Math.round(11 * dpi); maxH = Math.round(17 * dpi);
        } else {
            // Lettre 8.5"x11"
            maxW = Math.round(8.5 * dpi); maxH = Math.round(11 * dpi);
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

    /* ===============================
       TRAITEMENT AUTOMATIQUE DES IMAGES (#598)
       =============================== */

    // Réglage global de la balance des blancs. Constante POUR L'INSTANT : les
    // cases de l'écran Optimisation ont été retirées en Beta 99.30 (1er mai
    // 2026) et le volet B de #598 les fera revenir sous forme de réglage
    // persistant. Ce qui compte aujourd'hui, c'est qu'un SEUL endroit décide.
    const BALANCE_GLOBALE_ACTIVE = true;

    /**
     * Dit si un fichier reçoit la balance des blancs.
     *
     * SSOT de la décision (#598 volet A). Avant, trois sites décidaient chacun
     * de leur côté : l'import lisait `optBalance = true` en dur, tandis que les
     * deux aperçus lisaient `pipeline-opt-balance`, un élément retiré de l'UI et
     * recréé nulle part. `?.checked` rendait donc `undefined` — les aperçus
     * n'appliquaient JAMAIS la balance, alors que l'import l'appliquait
     * TOUJOURS. Ce que l'utilisateur validait à l'écran n'était pas ce qui était
     * archivé, et aucun réglage n'aurait pu corriger ça : la condition était
     * constante.
     *
     * @param {Object} f - Le fichier de la file d'attente
     * @returns {boolean} true si la balance doit être appliquée
     */
    function balanceActiveePour(f) {
        // `skipBalance` est une EXCEPTION par fichier, posée dans « Modifier ».
        // Elle ne peut qu'enlever le traitement, jamais l'ajouter.
        return BALANCE_GLOBALE_ACTIVE && !(f && f.skipBalance);
    }

    /**
     * Applique la balance des blancs sur un canvas d'aperçu, sur place.
     *
     * Même algorithme que `travauxPreparation.autoBalanceBlancs`, qui traite les
     * fichiers à l'import : moyenne RVB des 5 % de pixels les plus clairs, gain
     * par canal plafonné entre 0,5 et 2,0. L'aperçu opère sur le canvas déjà
     * réduit plutôt que sur le blob d'origine — 44 vignettes en pleine
     * résolution seraient prohibitives — mais le résultat visuel est le même.
     *
     * @param {CanvasRenderingContext2D} ctx - Le contexte du canvas d'aperçu
     * @param {number} cw - Largeur du canvas
     * @param {number} ch - Hauteur du canvas
     */
    function appliquerBalanceBlancsCanvas(ctx, cw, ch) {
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

        if (count === 0) return;

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

    /**
     * Ce qui tient la place d'une vignette sans image.
     *
     * L'ancien glyphe (une page à coin replié, aplatie par le filtre des
     * icônes) se lisait comme l'image cassée de Chrome — et il paraissait
     * justement là où une image manque (rapport du 15 sept. 2026, 17 h 26 :
     * « des icônes cassées »). Chaque état porte désormais son signe :
     *  · 'echec'   — HEIC non décodé, aperçu en erreur : triangle d'avertissement ;
     *  · 'absent'  — rien à lire (fichier à re-déposer, manquant) : cercle barré ;
     *  · 'attente' — miniature en cours de calcul : points de suspension.
     * Un PDF garde son 📄, sauf en échec. Rend le CONTENU seulement : chaque
     * site garde son enveloppe et sa taille. N'y entrent que des constantes.
     */
    const SIGNES_APERCU_ABSENT = {
        echec:   { icone: 'icons/icons8-warning.svg',   texte: 'Aperçu impossible' },
        absent:  { icone: 'icons/icon-unavailable.svg', texte: 'Sans aperçu' },
        attente: { icone: '',                           texte: 'Aperçu en cours\u2026' }
    };

    /**
     * @param {Object|null} f - Fichier de la file ou fichier stocké
     * @param {{etat?: string, avecTexte?: boolean}} [options] - `etat` force
     *        l'état ; `avecTexte` écrit le mot sous le signe (grand aperçu)
     * @returns {string} HTML composé de constantes
     */
    function contenuApercuAbsent(f, options) {
        const opts = options || {};
        let etat = opts.etat;
        if (!etat) {
            if (f && f.heicEchec) etat = 'echec';
            else if (f && f.fichier) etat = 'attente';
            else etat = 'absent';
        }
        const estPDF = !!(f && (f.estPDF || f.typeMIME === 'application/pdf'));
        if (estPDF && etat !== 'echec') return '&#x1F4C4;';
        const signe = SIGNES_APERCU_ABSENT[etat] || SIGNES_APERCU_ABSENT.absent;
        const marque = signe.icone
            ? '<img class="pipeline-icone-placeholder-img" src="' + signe.icone + '" alt="">'
            : '<span class="pipeline-apercu-points" aria-hidden="true">\u2026</span>';
        if (opts.avecTexte) {
            return marque + '<span class="pipeline-apercu-texte">' + signe.texte + '</span>';
        }
        return '<span class="pipeline-apercu-signe" role="img" aria-label="' + signe.texte
            + '" title="' + signe.texte + '">' + marque + '</span>';
    }

    /**
     * Pose l'emplacement dans un conteneur déjà rendu (aperçus calculés après
     * coup). Passe par le DOM plutôt que par un innerHTML concaténé : seul le
     * contenu de contenuApercuAbsent — des constantes, jamais un champ du
     * fichier (verrouillé par sa sentinelle) — est lu comme HTML.
     */
    function poserApercuAbsent(conteneur, f, options, taillePolice) {
        const enveloppe = document.createElement('span');
        enveloppe.className = 'pipeline-icone-placeholder';
        if (taillePolice) enveloppe.style.fontSize = taillePolice;
        enveloppe.innerHTML = contenuApercuAbsent(f, options); // security-ok: contenuApercuAbsent ne compose que des constantes
        conteneur.replaceChildren(enveloppe);
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

        // Cache : réutiliser la preview déjà générée (évite de re-décoder le blob)
        const optBalance = balanceActiveePour(f);
        const cacheKey = optBalance ? 'bal' : 'raw';
        // Cache double : garder les deux versions (bal/raw) pour éviter de recalculer au toggle
        if (!f._previewCache) f._previewCache = {};
        if (f._previewCache[cacheKey]) {
            conteneur.innerHTML = `<img src="${f._previewCache[cacheKey]}" alt="">`;
            return;
        }

        // Utiliser le blob original pour une preview de qualite
        const source = f.fichier || null;
        var imgThumb = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
        if (!source && !imgThumb) {
            poserApercuAbsent(conteneur, f);
            return;
        }

        let blobUrl = null;
        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                if (source) {
                    blobUrl = URL.createObjectURL(source);
                    img.src = blobUrl;
                } else {
                    img.src = imgThumb;
                }
            });

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

            // #598 volet A : l'apercu montre ce qui sera reellement archive.
            if (optBalance) {
                appliquerBalanceBlancsCanvas(ctx, cw, ch);
            }

            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            f._previewCache[cacheKey] = dataUrl;

            const imgResult = document.createElement('img');
            imgResult.src = dataUrl;
            conteneur.innerHTML = '';
            conteneur.appendChild(imgResult);
        } catch (e) {
            console.warn('[Pipeline] Erreur preview thumbnail:', f.nomFichier, e);
            poserApercuAbsent(conteneur, f, { etat: 'echec' });
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        }
    }

    /**
     * Met a jour les previews et les infos de la colonne droite (debounced)
     */
    let _previewTimer = null;
    function mettreAJourPreviewsPipeline() {
        // #558 B2 — capter le choix AVANT tout re-rendu : c'est le seul endroit
        // où le select signale un changement, et sa valeur ne survivait nulle part.
        const selDpi = document.getElementById('pipeline-opt-dpi');
        if (selDpi) {
            dpiPipelineChoisi = selDpi.value;
            try {
                sessionStorage.setItem('travaux-pipeline-dpi', dpiPipelineChoisi);
            } catch (e) {
                console.warn('[Travaux-UI] Choix DPI non persisté :', e);
            }
        }
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

        // Cache : réutiliser la thumbnail déjà générée (évite de re-décoder le blob)
        if (f._cachedOriginalThumb) {
            conteneur.innerHTML = `<img src="${f._cachedOriginalThumb}" alt="">`;
            return;
        }

        // PDF : réutiliser la miniature pré-rendue par pdf.js. Passer un blob PDF à
        // <img> donne un canvas 0x0 sur Safari, qui rend un fond uni (presque noir
        // en mode sombre via --gris-tres-pale).
        if (f.estPDF) {
            const pdfThumb = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
            if (pdfThumb) {
                f._cachedOriginalThumb = pdfThumb;
                conteneur.innerHTML = `<img src="${pdfThumb}" alt="">`;
            } else {
                conteneur.innerHTML = '<span class="pipeline-icone-placeholder">&#x1F4C4;</span>';
            }
            return;
        }

        // Toujours utiliser le blob original (pas le blob traite)
        const source = f.fichierOriginal || f.fichier || null;
        if (!source) {
            // Fallback sur thumbnail IDB
            var origFallback = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
            if (origFallback) {
                f._cachedOriginalThumb = origFallback;
                conteneur.innerHTML = `<img src="${origFallback}" alt="">`;
            }
            return;
        }

        let url = null;
        try {
            url = URL.createObjectURL(source);
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });

            // Thumbnail a 120px max
            const scale = Math.min(1, 120 / Math.max(img.width, img.height));
            const cw = Math.round(img.width * scale);
            const ch = Math.round(img.height * scale);

            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            f._cachedOriginalThumb = dataUrl;

            const imgResult = document.createElement('img');
            imgResult.src = dataUrl;
            conteneur.innerHTML = '';
            conteneur.appendChild(imgResult);
        } catch (e) {
            // Fallback silencieux
            var origCatchFallback = f.thumbnailDataUrl || await travauxStockage.obtenirThumbnail(f.id);
            if (origCatchFallback) {
                f._cachedOriginalThumb = origCatchFallback;
                conteneur.innerHTML = `<img src="${origCatchFallback}" alt="">`;
            }
        } finally {
            if (url) URL.revokeObjectURL(url);
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
    function genererEtape2Colonnes(queue) {
        const nbImages = queue.filter(f => f.estImage).length;
        const productions = obtenirDonneesSelonMode('productions');

        // Production globale actuelle (prioriser le choix explicite de l'utilisateur)
        // #313 : un choix PAR-FICHIER (« Modifier ») n'est pas une production globale —
        // l'afficher dans le sélecteur global créait la divergence visuelle du bug.
        const prodActuelle = travauxImport.getProductionGlobale()
            || queue.find(f => f.productionId && !f.productionIdParLea && !f.productionIdParFichier)?.productionId
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
            const icone = contenuApercuAbsent(f);
            // ✅ ANONYMISATION (Tier 0.2) : anonymiser les noms de fichiers affichés
            const nomFichierAff = typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier;
            const nomLeaAff = typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.parseLea.nom, f.etudiantDA) : f.parseLea.nom;
            const nomCourt = (nomLeaAff || nomFichierAff).substring(0, 18);
            // #597 : ce libellé disait « PDF » dès que les dimensions manquaient.
            // Un HEIC non décodé s'affichait donc comme un PDF — c'est ce qui a
            // fait chercher la panne du côté de la prévisualisation PDF, qui
            // fonctionnait. Le libellé dit maintenant ce qu'il sait.
            // #597 : un fichier dont le décodage a échoué le DIT, plutôt que de
            // laisser une vignette vide sans explication. « Dimensions inconnues »
            // remplace l'ancien repli « PDF », qui affichait un HEIC comme un PDF.
            let resolution;
            if (f.largeurOriginale && f.hauteurOriginale) {
                resolution = `${f.largeurOriginale} x ${f.hauteurOriginale}`;
            } else if (f.estPDF) {
                resolution = 'PDF';
            } else if (f.heicEchec) {
                resolution = 'HEIC non décodé';
            } else {
                resolution = 'Dimensions inconnues';
            }
            const poids = travauxStockage.formaterTaille(f.tailleFichier);
            const selectionne = (index === fichierSelectionneIndex);

            // Debut d'un groupe multi-fichiers
            const groupeId = f.groupeDocumentId;
            const indicesGroupe = groupeId ? groupesMulti.get(groupeId) : null;
            if (indicesGroupe && !groupesOuverts.has(groupeId)) {
                groupesOuverts.add(groupeId);
                colGauche += `<div class="pipeline-groupe-encadre" data-groupe-id="${echapperHtml(groupeId)}">
                    <div class="pipeline-groupe-entete">
                        <span class="pipeline-groupe-badge">${indicesGroupe.length} ${indicesGroupe.some(i => queue[i].estPDF) ? 'fichiers' : 'pages'} &rarr; 1 PDF</span>
                        <button class="pipeline-groupe-defaire" data-stop data-action="travauxUI.defaireGroupePipeline" data-param="${echapperHtml(groupeId)}" title="Défaire le regroupement"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                    </div>`;
            }

            colGauche += `<div class="pipeline-fichier-ligne${selectionne ? ' pipeline-fichier-selectionne' : ''}${indicesGroupe ? ' pipeline-fichier-groupe' : ''}" data-action="travauxUI.selectionnerFichierPipeline" data-param="${index}">
                <span class="pipeline-fichier-numero">${index + 1}</span>
                <div class="pipeline-reorder-btns">
                    <button class="pipeline-btn-reorder" data-stop data-action="travauxUI.monterFichierPipeline" data-param="${index}" ${index === 0 ? 'disabled' : ''} title="Monter"><img src="icons/icon-chevron-up.svg" alt="" class="editeur-page-icon"></button>
                    <button class="pipeline-btn-reorder" data-stop data-action="travauxUI.descendreFichierPipeline" data-param="${index}" ${index === queue.length - 1 ? 'disabled' : ''} title="Descendre"><img src="icons/icon-chevron-down.svg" alt="" class="editeur-page-icon"></button>
                </div>
                <div class="pipeline-fichier-thumb-col" id="pipeline-original-${index}">
                    ${thumb ? `<img src="${thumb}" alt="">` : `<span class="pipeline-icone-placeholder">${icone}</span>`}
                </div>
                <div class="pipeline-fichier-meta-col">
                    <span class="pipeline-meta-nom" title="${echapperHtml(nomFichierAff)}">${echapperHtml(nomCourt)}</span>
                    <span class="pipeline-meta-resolution"${f.heicRaison ? ` title="${echapperHtml(f.heicRaison)}"` : ''}>${resolution}</span>
                    <span class="pipeline-meta-taille">${poids}</span>
                </div>
                <button class="pipeline-btn-retirer" data-stop data-action="travauxUI.retirerFichierPipeline" data-param="${index}" title="Retirer ce fichier"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
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
            <select class="controle-form" id="pipeline-select-production" data-on-change="travauxUI.associerProductionGlobale">
                <option value="">— Choisir une production —</option>
                ${productions.map(p => `<option value="${echapperHtml(p.id)}" ${prodActuelle === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                ${jetonsActifs ? `<option value="__jeton_reprise__" ${prodActuelle === '__jeton_reprise__' || modeJetonActif ? 'selected' : ''}>Jeton de reprise</option>` : ''}
            </select>
            <p class="texte-muted u-texte-petit" style="margin:4px 0 0 0;">S'applique à tout le lot. Une correction faite via « Modifier » sur un fichier est conservée.</p>
        </div>`;
        // Sous-sélecteur : quelle production le jeton cible-t-il ?
        if (prodActuelle === '__jeton_reprise__' || modeJetonActif) {
            const prodJeton = queue.find(f => f.estReprise && f.productionId)?.productionId
                || sessionStorage.getItem('travaux-jeton-production')
                || '';
            colCentre += `<div class="pipeline-jeton-sous-select" id="pipeline-jeton-production">
                <label>Pour quelle production ?</label>
                <select class="controle-form" data-on-change="travauxUI.associerJetonProduction">
                    <option value="">— Choisir —</option>
                    ${productions.map(p => `<option value="${echapperHtml(p.id)}" ${prodJeton === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                </select>
            </div>`;
        }


        // « Rés. max. » + bouton réglages spécifiques sur une seule ligne
        // (gain d'espace vertical ; le titre « Réglages par défaut : » est retiré).
        const fSel = queue[fichierSelectionneIndex];
        const btnReglagesDisabled = fichierSelectionneIndex < 0 || !fSel?.estImage || !fSel?.fichier;
        // #558 B2 — `selected` calculé d'après le choix mémorisé, plus codé en dur.
        const optionsDpi = [['0', 'désactivée'], ['200', '200 dpi'], ['250', '250 dpi'], ['300', '300 dpi']]
            .map(([v, libelle]) => `<option value="${v}"${v === dpiPipelineChoisi ? ' selected' : ''}>${libelle}</option>`)
            .join('');
        colCentre += `<div class="pipeline-reglages-ligne" style="display:flex; align-items:center; gap:10px; margin:8px 0 4px 0;"><label style="white-space:nowrap;">Rés. max. <select id="pipeline-opt-dpi" data-on-change="travauxUI.mettreAJourPreviewsPipeline" class="controle-form-compact" style="width:auto;display:inline-block;font-size:inherit;padding:2px 4px;">${optionsDpi}</select></label><button class="btn btn-secondaire" ${btnReglagesDisabled ? 'disabled' : ''} data-action="travauxUI.ouvrirPreparationFichier" data-param="${fichierSelectionneIndex}" title="Réglages spécifiques" aria-label="Réglages spécifiques"><img src="icons/icon-gear.svg" alt="" class="btn-inline-icon"></button></div>`;

        // Alerte globale : blobs manquants après restauration session
        const nbBlobsManquants = queue.filter(f => !f.fichier && !f.reglagesEnRejeu).length;
        if (nbBlobsManquants > 0) {
            colCentre += `<div class="pipeline-alerte-blobs" style="margin-top:8px; padding:8px 10px; background: var(--alerte-fond-attention)); border-radius: var(--radius-moyen); border-left: 3px solid var(--alerte-texte-attention);">
                <p class="u-texte-petit" style="margin:0 0 6px 0; color: var(--alerte-texte-attention);"><strong>${nbBlobsManquants} fichier${nbBlobsManquants > 1 ? 's' : ''}</strong> ${nbBlobsManquants > 1 ? 'doivent' : 'doit'} \u00eatre re-d\u00e9pos\u00e9${nbBlobsManquants > 1 ? 's' : ''} (session restaur\u00e9e).</p>
                <button class="btn btn-secondaire btn-sm" data-action="travauxUI.redeposerFichiers">Re-d\u00e9poser les fichiers</button>
            </div>`;
        }

        colCentre += '</div>'; // fin pipeline-centre-global

        // Zone B : Apercu (conditionnelle)
        colCentre += '<div class="pipeline-centre-preview">';
        if (fichierSelectionneIndex >= 0 && fichierSelectionneIndex < queue.length) {
            const f = queue[fichierSelectionneIndex];
            const idx = fichierSelectionneIndex;
            const dims = calculerDimensionsCibles(f);
            const tailleEst = estimerTailleFichier(dims.w, dims.h, f);
            const resCible = f.estPDF ? 'PDF (aucun traitement)' : `${dims.w} x ${dims.h}`;

            colCentre += '<div class="pipeline-col-titre">Aper\u00e7u page par page</div>';

            // Grande preview
            colCentre += `<div class="pipeline-preview-centre" id="pipeline-preview-centre">
                <span class="pipeline-icone-placeholder">${contenuApercuAbsent(f, { avecTexte: true })}</span>
            </div>`;

            // La raison d'un HEIC non décodé ne vivait que dans l'infobulle de
            // « HEIC non décodé » : rien au clic, et aucun survol sur iPad
            // (rapport du 15 sept. 2026, 17 h 26). Elle s'écrit ici, en clair.
            if (f.heicEchec) {
                colCentre += '<div class="alerte alerte-attention pipeline-heic-raison">'
                    + '<strong>HEIC non décodé :</strong> '
                    + echapperHtml(f.heicRaison || 'le navigateur n’a pas pu lire cette photo.')
                    + '</div>';
            }

            // Metadata du fichier
            colCentre += '<p class="texte-muted u-texte-petit" style="margin:10px 0 4px 0;">Informations du fichier</p>';
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
                <label>Modifier</label>
                <select class="controle-form pipeline-select-petit" data-on-change="travauxUI.changerProductionPipeline" data-param="${idx}">
                    <option value="">—</option>
                    ${productions.map(p => `<option value="${echapperHtml(p.id)}" ${f.productionId === p.id && !f.estReprise ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
                    ${jetonsActifs ? `<option value="__jeton_reprise__" ${f.estReprise ? 'selected' : ''}>Jeton de reprise</option>` : ''}
                </select>
                <p class="texte-muted u-texte-petit" style="margin:4px 0 0 0;">Ce fichier seulement — le sélecteur global « Production » ne l'écrasera pas.</p>
            </div>`;
            // Sous-sélecteur par fichier pour jeton
            if (f.estReprise) {
                colCentre += `<div class="pipeline-champ pipeline-jeton-sous-select">
                    <label>Pour quelle production ?</label>
                    <select class="controle-form pipeline-select-petit" data-on-change="travauxUI.changerJetonProductionPipeline" data-param="${idx}">
                        <option value="">—</option>
                        ${productions.map(p => `<option value="${echapperHtml(p.id)}" ${f.productionId === p.id ? 'selected' : ''}>${echapperHtml(p.titre || p.nom || p.id)}</option>`).join('')}
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
                    ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span class="pipeline-icone-placeholder">${contenuApercuAbsent(f)}</span>`}
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
     * Debouncé pour éviter les re-renders multiples lors d'actions rapides.
     */
    let _rafraichirTimer = null;

    function rafraichirPipelineUI() {
        if (_rafraichirTimer) clearTimeout(_rafraichirTimer);
        _rafraichirTimer = setTimeout(_rafraichirPipelineUIImpl, 150);
    }

    function _rafraichirPipelineUIImpl() {
        _rafraichirTimer = null;
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
     * Optimisé : swap CSS instantané + re-render déféré pour le panneau central
     * @param {number} index - Index du fichier dans la queue
     */
    function selectionnerFichierPipeline(index) {
        const ancienIndex = fichierSelectionneIndex;
        fichierSelectionneIndex = index;

        const queue = travauxImport.obtenirFileDAttente();
        if (fichierSelectionneIndex >= queue.length) fichierSelectionneIndex = -1;

        // Feedback visuel instantané : swap de classe CSS sans re-render
        const colG = document.querySelector('.pipeline-col-originaux');
        if (colG) {
            const lignes = colG.querySelectorAll('.pipeline-fichier-ligne');
            lignes.forEach((ligne, i) => {
                ligne.classList.toggle('pipeline-fichier-selectionne', i === fichierSelectionneIndex);
            });
        }

        // Re-render déféré pour mettre à jour le panneau central (aperçu, métadonnées)
        rafraichirPipelineUI();
    }

    /**
     * Synchronise le scroll entre les colonnes gauche et droite du pipeline.
     * Appelee apres chaque re-rendu pour reattacher les listeners.
     * Utilise des références nommées pour éviter l'accumulation de listeners.
     */
    let _scrollSyncG = null;
    let _scrollSyncD = null;
    let _scrollSyncColG = null;
    let _scrollSyncColD = null;

    function initialiserSyncScrollColonnes() {
        // Retirer les anciens listeners si les éléments ont changé (re-render innerHTML)
        if (_scrollSyncColG && _scrollSyncG) {
            _scrollSyncColG.removeEventListener('scroll', _scrollSyncG);
        }
        if (_scrollSyncColD && _scrollSyncD) {
            _scrollSyncColD.removeEventListener('scroll', _scrollSyncD);
        }

        const colG = document.querySelector('.pipeline-col-originaux');
        const colD = document.querySelector('.pipeline-col-confirmes');
        if (!colG || !colD) return;

        let enSync = false;
        _scrollSyncG = function() {
            if (enSync) return;
            enSync = true;
            colD.scrollTop = colG.scrollTop;
            enSync = false;
        };
        _scrollSyncD = function() {
            if (enSync) return;
            enSync = true;
            colG.scrollTop = colD.scrollTop;
            enSync = false;
        };
        _scrollSyncColG = colG;
        _scrollSyncColD = colD;

        colG.addEventListener('scroll', _scrollSyncG);
        colD.addEventListener('scroll', _scrollSyncD);
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
                // #610 — le retour est un objet, et son `rattaches` était
                // jusqu'ici calculé puis jeté. Un fichier écarté en silence est
                // indistinguable d'un fichier rattaché : c'est exactement ce qui
                // permettait à un blob de rejoindre la mauvaise ligne sans trace.
                const bilan = travauxImport.reattacherBlobs(input.files);
                if (bilan.ignores.length > 0) {
                    notifications.avertissement(
                        bilan.ignores.length + ' fichier(s) non reconnu(s)',
                        bilan.ignores.join(', ') + ' \u2014 nom ou taille diff\u00e9rents de ce qui \u00e9tait dans la file. '
                        + 'V\u00e9rifie qu\u2019il s\u2019agit bien des fichiers d\u00e9pos\u00e9s au d\u00e9part.'
                    );
                } else if (bilan.rattaches > 0) {
                    notifications.succes(bilan.rattaches + ' fichier(s) rattach\u00e9(s)');
                }
                rafraichirPipelineUI();
                // #884 — les réglages spécifiques se réappliquent en arrière-plan ;
                // un échec est DIT : le fichier part alors sans correction.
                if (bilan.rejeu) {
                    bilan.rejeu.then(function(r) {
                        if (r.echecs.length > 0) {
                            notifications.avertissement(
                                'R\u00e9glages sp\u00e9cifiques non r\u00e9appliqu\u00e9s',
                                r.echecs.join(', ') + ' \u2014 ces fichiers sont rattach\u00e9s sans correction. Rouvre leurs r\u00e9glages sp\u00e9cifiques avant d\u2019importer.'
                            );
                        } else if (r.rejoues.length > 0) {
                            notifications.succes('R\u00e9glages sp\u00e9cifiques r\u00e9appliqu\u00e9s (' + r.rejoues.length + ')');
                        }
                        rafraichirPipelineUI();
                    });
                }
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
            poserApercuAbsent(conteneur, f, { avecTexte: true }, '3rem');
            return;
        }

        let blobUrl = null;
        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                if (source) {
                    blobUrl = URL.createObjectURL(source);
                    img.src = blobUrl;
                } else {
                    img.src = centreThumbImg;
                }
            });

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

            // #598 volet A : l'apercu montre ce qui sera reellement archive.
            if (balanceActiveePour(f)) {
                appliquerBalanceBlancsCanvas(ctx, cw, ch);
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
            poserApercuAbsent(conteneur, f, { etat: 'echec', avecTexte: true }, '3rem');
        } finally {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
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
     * Associe une production a tous les fichiers de la queue
     *
     * 🔧 #313 (2 juillet 2026, décision Grégoire 29 juin) : le sélecteur GLOBAL
     * ne réécrit plus un choix PAR-FICHIER divergent fait via « Modifier »
     * (marqueur productionIdParFichier) — fin de l'écrasement silencieux.
     * L'ancien setter par-fichier associerProductionPipeline (zéro appelant)
     * a été retiré dans la même passe (zéro-dette).
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
            // #313 : un choix PAR-FICHIER divergent (« Modifier ») est préservé —
            // le global ne l'écrase plus silencieusement.
            if (f.productionIdParFichier && f.productionId && f.productionId !== productionId) {
                return;
            }
            // Sélecteur global explicite : prime sur parseLea (intention utilisateur forte).
            // Si productionId vide, on désélectionne et on laisse parseLea reprendre la main.
            if (productionId) {
                f.productionId = productionId;
                f.productionIdParLea = false;
                f.estReprise = false; // retour au mode normal
            } else if (!f.productionIdParLea && !f.productionIdParFichier) {
                f.productionId = '';
                f.estReprise = false;
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
        const productions = obtenirDonneesSelonMode('productions');
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
        // Beta 99.30 : ne marquer "Évalué" que si au moins un critère a été noté.
        // Une évaluation sauvegardée sans critère (ex. juste un jeton de délai
        // appliqué) ne doit pas écraser l'état Annoté/Importé.
        const evaluationNotee = evaluation
            && Array.isArray(evaluation.criteres)
            && evaluation.criteres.length > 0;
        if (evaluationNotee) {
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
            ? '<span class="travaux-badge-verrou" title="Évaluation verrouillée"><img src="icons/icon-lock.svg" alt="" class="btn-inline-icon"></span>'
            : '';

        // Badge evalue/remis sur la page d'archivage → previsualisation PDF complete
        const actionName = (evaluation && action === 'ouvrirPreviewInline')
            ? 'travauxExportPDF.previsualiserPDF'
            : `travauxUI.${action}`;

        const estSelFusion = selectionFusion.has(f.id);
        const checkboxFusion = `<input type="checkbox" class="fusion-checkbox" ${estSelFusion ? 'checked' : ''} data-stop data-action="travauxUI.toggleSelectionFusion" data-param="${f.id}" title="Sélectionner pour fusion">`;

        // Bouton Supprimer visible uniquement en vue Archivage (action ouvrirPreviewInline)
        // Permet de retirer les copies multiples directement depuis la grille de fichiers.
        const estVueArchivage = (action === 'ouvrirPreviewInline');
        const boutonSupprimer = estVueArchivage
            ? `<button class="travaux-badge-supprimer" data-stop data-action="travauxUI.supprimerFichierBadge" data-param="${f.id}" title="Déplacer ce fichier à la corbeille"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>`
            : '';

        return `<div class="annot-badge${estSelFusion ? ' annot-badge-fusion-selectionne' : ''}${estRemplacee ? ' eval-remplacee' : ''}" data-fichier-id="${f.id}" data-etudiant-da="${f.etudiantDA || ''}" draggable="true" data-drag-data="text/fichier-id:${f.id}" data-action="${actionName}" data-param="${f.id}" title="${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier)}${estRemplacee ? ' (Remplacée par reprise)' : ''}${estReprise ? ' (Reprise)' : ''}">
        ${checkboxFusion}
        <span class="annot-badge-nom">${nomEtudiant}</span>
        <span class="travaux-badge-pill ${statutClasse}">${statutTexte}</span>${indicateurReprise}${evaluation ? `<button class="travaux-badge-retro" data-stop data-action="travauxUI.afficherRetroaction" data-param="${f.id}" title="Aperçu rétroaction"><img src="icons/icons8-speaker-notes.svg" alt="" class="btn-inline-icon"></button>` : ''}${verrou}${boutonSupprimer}
    </div>`;
    }

    /**
     * Corrige le groupeCoursId des fichiers à partir de l'appartenance réelle
     * des étudiants. S'exécute une fois à l'initialisation du module.
     */
    function corrigerGroupeCoursIdFichiers() {
        const fichiers = travauxStockage.obtenirFichiersTravaux();
        if (!fichiers.length) return;

        // ACCÈS DIRECT INTENTIONNEL — correction cross-cours, doit lire TOUS les étudiants du trimestre
        const tousEtudiants = db.getSync(cle('groupeEtudiants'), []);
        const tousGC = db.getSync(cle('groupesCours'), []);
        const normaliserGroupe = (g) => String(g || '').padStart(5, '0');
        const daVersGcId = {};
        tousEtudiants.forEach(e => {
            if (!e.da || !e.groupe) return;
            const gc = tousGC.find(gc =>
                gc.coursId === e.coursId &&
                normaliserGroupe(gc.groupeNum) === normaliserGroupe(e.groupe)
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

        const productions = obtenirDonneesSelonMode('productions');
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

        // Grouper par productionId
        const groupes = {};
        fichiers.forEach(f => {
            const pid = f.productionId || '__aucune__';
            if (!groupes[pid]) groupes[pid] = [];
            groupes[pid].push(f);
        });

        // Compteur "(N)" si N étudiants distincts == N fichiers,
        // sinon "(N él. · M fich.)" pour signaler une asymétrie. Les cas
        // marqués comme validés (travauxDoublonsUI) sont ramenés à 1 fichier
        // compté par étudiant (ils ne signalent plus une asymétrie suspecte).
        const compteurEtudiantsFichiers = (lst, prodId) => {
            let nbE, nbF;
            if (typeof travauxDoublonsUI !== 'undefined' &&
                typeof travauxDoublonsUI.compterAvecValidations === 'function') {
                const infos = travauxDoublonsUI.compterAvecValidations(lst, prodId);
                nbE = infos.nbE;
                nbF = infos.nbF;
            } else {
                nbF = lst.length;
                nbE = new Set(lst.map(f => f.etudiantDA).filter(Boolean)).size;
            }
            return (nbF === nbE) ? `(${nbE})` : `(${nbE} él. · ${nbF} fich.)`;
        };

        // Dropdown filtre de production (toutes les productions, même sans fichier)
        let htmlDropdown = '';
        if (productions.length >= 1) {
            htmlDropdown += '<select class="controle-form travaux-filtre-production" data-on-change="travauxUI.filtrerBadgesParProduction">';
            if (productions.length > 1) {
                htmlDropdown += '<option value="">Toutes les productions</option>';
            }
            productions.forEach(p => {
                const lst = groupes[p.id] || [];
                const compteur = lst.length === 0 ? '(0)' : compteurEtudiantsFichiers(lst, p.id);
                const sel = (productionFiltreActive === p.id) ? ' selected' : '';
                htmlDropdown += `<option value="${echapperHtml(p.id)}"${sel}>${echapperHtml(p.titre || p.nom || p.id)} ${compteur}</option>`;
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
            const compteur = compteurEtudiantsFichiers(g, p.id);
            html += `<h5 class="travaux-groupe-production-titre">${echapperHtml(p.titre || p.nom || p.id)} ${compteur} <span class="travaux-compteurs-groupe">${resume}</span></h5>`;
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

        const productions = obtenirDonneesSelonMode('productions');
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

        // Options pour le select de production
        const optionsProductions = productions.map(p =>
            `<option value="${echapperHtml(p.id)}">${echapperHtml(p.titre || p.nom || p.id)}</option>`
        ).join('');

        // Dropdown filtre production
        let htmlFiltreProduction = '<option value="">Toutes les productions</option>';
        productions.forEach(p => {
            const sel = (productionFiltreActive === p.id) ? ' selected' : '';
            htmlFiltreProduction += `<option value="${echapperHtml(p.id)}"${sel}>${echapperHtml(p.titre || p.nom || p.id)}</option>`;
        });

        // Générer les lignes
        let htmlLignes = '';
        fichiers.forEach(f => {
            htmlLignes += genererLigneTableauFichier(f, productions, evaluations, optionsProductions);
        });

        return `
            <div class="conteneur" id="travaux-tableau-fichiers-conteneur">
                <h2>Annoter et évaluer <button class="btn-aide-contextuelle" data-aide="evaluations-annoter" aria-label="Aide contextuelle"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button></h2>
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
            const icone = contenuApercuAbsent(f, { etat: f.blobStatut === 'manquant' ? 'absent' : 'attente' });
            const actif = travauxVisionneuse.getFichierActuel()?.id === f.id ? ' actif' : '';

            // Badge cycle de vie
            let badge = '';
            if (f.blobStatut === 'facsimile') {
                badge = '<span class="travaux-badge-facsimile" title="Version allegee">FAC</span>';
            } else if (f.blobStatut === 'exporte') {
                badge = '<span class="travaux-badge-exporte" title="Exporte">EXP</span>';
            } else if (f.blobStatut === 'manquant') {
                badge = '<span class="travaux-badge-manquant" title="Fichier manquant (import incomplet)">MNQ</span>';
            }

            html += `
                <div class="travaux-miniature${actif}" data-fichier-id="${f.id}" data-action="travauxUI.ouvrirFichier" data-param="${f.id}">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span>${icone}</span>`}
                        ${badge}
                    </div>
                    <div class="travaux-miniature-nom">${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier)}</div>
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
            const icone = contenuApercuAbsent(f, { etat: f.blobStatut === 'manquant' ? 'absent' : 'attente' });
            const actif = travauxVisionneuse.getFichierActuel()?.id === f.id ? ' actif' : '';
            const top = i * HAUTEUR_MINIATURE;

            // Badge cycle de vie
            let badge = '';
            if (f.blobStatut === 'facsimile') {
                badge = '<span class="travaux-badge-facsimile" title="Version allegee">FAC</span>';
            } else if (f.blobStatut === 'exporte') {
                badge = '<span class="travaux-badge-exporte" title="Exporte">EXP</span>';
            } else if (f.blobStatut === 'manquant') {
                badge = '<span class="travaux-badge-manquant" title="Fichier manquant (import incomplet)">MNQ</span>';
            }

            html += `
                <div class="travaux-miniature travaux-miniature-virtuelle${actif}" data-fichier-id="${f.id}"
                     style="top: ${top}px; height: ${HAUTEUR_MINIATURE}px;"
                     data-action="travauxUI.ouvrirFichier" data-param="${f.id}">
                    <div class="travaux-miniature-thumb">
                        ${thumb ? `<img src="${thumb}" alt="">` : `<img data-thumbnail-id="${f.id}" src="" alt="" style="display:none"><span>${icone}</span>`}
                        ${badge}
                    </div>
                    <div class="travaux-miniature-nom">${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier)}</div>
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
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        return [...etudiants].sort((a,b) => (a.nom||'').localeCompare(b.nom||'')).map(e =>
            `<option value="${echapperHtml(e.da)}">${e.nom ? echapperHtml(e.nom + ', ' + e.prenom) : echapperHtml(e.prenom)}</option>`
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
            alert('Aucun fichier à importer.');
            return;
        }

        const nomProduction = selectProd?.selectedOptions[0]?.textContent?.trim() || '';
        const msgProd = productionId && nomProduction
            ? `associés à la production « ${nomProduction} »`
            : 'sans production associée';
        const selectGC = document.getElementById('selectGroupeCoursHeader');
        const nomGroupe = selectGC?.selectedOptions[0]?.textContent?.trim() || '';
        const msgGroupe = nomGroupe ? `dans le groupe « ${nomGroupe} » et ` : '';

        if (!confirm(`${queue.length} ${window.pluriel(queue.length, 'fichier', 'fichiers')} ${window.pluriel(queue.length, 'sera importé', 'seront importés')} ${msgGroupe}${msgProd}.\n\nConfirmer l\u2019importation ?`)) return;

        const progression = document.getElementById('travaux-progression-import');
        if (progression) progression.classList.remove('u-hide');

        const resultat = await travauxImport.importerTous(productionId, (i, total) => {
            const pourcent = Math.round((i / total) * 100);
            const barre = document.getElementById('travaux-barre-progression');
            if (barre) barre.style.width = pourcent + '%';
            const texte = document.getElementById('travaux-texte-progression');
            if (texte) texte.textContent = `${i}/${total} ${window.pluriel(total, 'fichier', 'fichiers')} importés...`;
        });

        if (progression) progression.classList.add('u-hide');

        // Rafraichir l'affichage
        afficherImport();

        alert(`Import terminé : ${resultat.importes} ${window.pluriel(resultat.importes, 'fichier', 'fichiers')} ${window.pluriel(resultat.importes, 'importé', 'importés')}, ${resultat.erreurs} ${window.pluriel(resultat.erreurs, 'erreur', 'erreurs')}`);
    }

    /**
     * Ouvre un fichier dans la visionneuse
     * @param {string} fichierId - ID du fichier
     */
    async function ouvrirFichier(fichierId, _deuxiemePassage) {
        // Reset du chrono au changement de fichier
        resetChrono();

        // 🔧 FIX (29 mars 2026) : Nettoyer les flags orphelins d'une opération
        // précédente. Sans callback en attente, ces flags sont des résidus qui
        // contaminent le flux suivant (ex: Consulter via profil après un Consulter
        // cassé via la liste).
        if (!window._apresOuvertureFichier) {
            if (window._modifierEvaluationEnCours) window._modifierEvaluationEnCours = false;
        }

        // Mémoriser le mode courant AVANT fermeture (pour le restaurer après chargement)
        const modeAvantNavigation = modeCourant;

        // Naviguer vers l'onglet Annoter et évaluer si pas déjà dessus
        if (typeof afficherSousSection === 'function') {
            const sousSectionActive = document.querySelector('#evaluations-annoter.sous-section.active') ||
                                       document.querySelector('#evaluations-annoter.sous-section[style*="display: block"]');
            if (!sousSectionActive || sousSectionActive.offsetParent === null) {
                // #761 (6 sept. 2026) — ARRIVER D'ABORD, OUVRIR ENSUITE. `afficherSousSection` ne
                // bascule jamais la section parente (navigation.js) : appelé depuis le profil
                // (Suivi › Travaux soumis, la vignette d'un travail), ce geste activait
                // `#evaluations-annoter` dans une section cachée et laissait la section Suivi
                // affichée sans aucune sous-section active — une page vide (rapport de Grégoire,
                // BUG_grégoire_2026-09-06_07-32-11 ; spec `profil-travaux-761-…`). Et même arrivé,
                // ouvrir tout de suite entrait en course avec `initialiserModuleTravaux`, lancé à
                // +100 ms par l'arrivée sur la sous-section (première initialisation :
                // `rafraichirUI` reconstruit la grille ; sinon restauration d'un « dernier fichier »
                // de session). Les trois autres entrées hors section (liste des évaluations,
                // « Annoter et évaluer » du profil) font ce protocole elles-mêmes — la section, le
                // drapeau, la sous-section, puis 200 à 500 ms. Ici, c'est le geste qui le fait, pour
                // tout appelant, et il se rappelle une fois arrivé (second passage : la sous-section
                // est alors active et cette branche ne rejoue pas ; si l'arrivée a échoué, le second
                // passage reprend le chemin d'hier plutôt que de boucler).
                if (!_deuxiemePassage) {
                    if (typeof afficherSection === 'function') {
                        const sectionEvaluations = document.getElementById('section-evaluations');
                        if (sectionEvaluations && !sectionEvaluations.classList.contains('active')) {
                            afficherSection('evaluations');
                        }
                    }
                    // Le drapeau que `initialiserModuleTravaux` respecte : ne pas restaurer une autre
                    // copie ni reconstruire le DOM sous l'ouverture qui vient. Consommé en fin d'ouverture.
                    if (!window._apresOuvertureFichier) window._apresOuvertureFichier = function() {};
                    afficherSousSection('evaluations-annoter');
                    setTimeout(function() { ouvrirFichier(fichierId, true); }, 500);
                    return;
                }
                afficherSousSection('evaluations-annoter');
            }
        }

        // Si le tableau est affiché (pas de visionneuse), créer la visionneuse d'abord
        if (!document.getElementById('travaux-conteneur-document')) {
            const conteneur = document.getElementById('evaluations-contenu-fichiers');
            if (conteneur) {
                // Générer les badges si pas encore fait (ex: session restaurée sans passer par afficherFichiers)
                if (!_htmlBadgesGrille) {
                    const fichiersTravaux = travauxStockage.obtenirFichiersGroupeActif();
                    if (fichiersTravaux.length > 0) {
                        _htmlBadgesGrille = genererGrilleFichiers(fichiersTravaux, 'ouvrirFichier');
                    }
                }
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
            _setModeCourant('annoter');
            // Réafficher les palettes annotation (masquées lors du passage en eval)
            afficherPalettesAnnotation();
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

            // Activer l'option Évaluer dans le menu Actions
            const btnEvaluer = document.getElementById('travaux-btn-evaluer');
            if (btnEvaluer) btnEvaluer.disabled = false;

            // Replier la sidebar
            const sidebar = document.getElementById('travaux-sidebar');
            if (sidebar) sidebar.classList.add('replie');
            const btnToggle = document.getElementById('travaux-btn-toggle-sidebar');
            if (btnToggle) { btnToggle.classList.add('visible'); btnToggle.innerHTML = '&#x25B6;'; }

            // Charger les annotations du nouveau fichier (nécessaire dans les deux modes)
            travauxAnnotation.activerAnnotation();

            // Mettre à jour les labels identité dans la palette Annotation
            if (fichierOuvert) {
                remplirLabelsIdentite(fichierOuvert);
            }

            // Restaurer le mode courant (Annoter ou Évaluer) sans flash
            // 🔧 FIX (5 mars 2026) : Ne PAS re-basculer en mode évaluer si un callback
            // _apresOuvertureFichier est en attente — le callback fera lui-même le
            // basculement avec modifierEvaluationParId, évitant un double setup
            // (preRemplirEvaluation + modifierEvaluationParId en parallèle).
            if (modeAvantNavigation === 'evaluer' && !window._apresOuvertureFichier) {
                const fichierNav = travauxVisionneuse.getFichierActuel();
                if (fichierNav && fichierNav.etudiantDA) {
                    basculerMode('evaluer');
                }
            } else if (modeAvantNavigation !== 'evaluer') {
                // Mode annotation par défaut
                // #651 (16 sept. 2026) — installer AUSSI ses palettes. Revenir dans Évaluations
                // après le mode Évaluer passe par la réinitialisation générale de
                // `initialiserModuleTravaux`, qui ferme les palettes d'évaluation et remet le mode
                // à « annoter » sans rendre les palettes d'annotation : la flottante gardait le
                // `u-hide` de `masquerPalettesAnnotation`, et « Annoter » depuis la liste ouvrait la
                // copie sans outils (rapport de Grégoire, 31 août ; spec `liste-651-…`).
                afficherPalettesAnnotation();
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
                    } else if (statut === 'manquant') {
                        badgeStatut.textContent = 'Fichier manquant — rouvre le codex après avoir libéré de l\'espace';
                        badgeStatut.className = 'travaux-badge-manquant';
                        badgeStatut.classList.remove('u-hide');
                    } else {
                        badgeStatut.classList.add('u-hide');
                    }
                }

                // Option Re-importer : active si allégé (facsimile)
                if (btnReimporter) btnReimporter.disabled = (statut !== 'facsimile');
            }

            // Scroll le badge actif dans le strip toolbar pour qu'il soit visible
            const badgeActifEl = document.querySelector('.annot-toolbar-fichiers .annot-badge.actif');
            if (badgeActifEl) badgeActifEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

            // Mettre à jour la pill statut dans la palette Paramètres
            if (fichierOuvert && typeof mettreAJourPillStatut === 'function') {
                const selRemise = document.getElementById('remiseProduction1');
                mettreAJourPillStatut(selRemise ? selRemise.value : 'importe');
            }

            // Bulle de decouverte au premier fichier ouvert (aide-contextuelle)
            if (typeof estAideContextuelleActive === 'function' && estAideContextuelleActive()
                && !sessionStorage.getItem('travaux_bulle_annoter_vu')) {
                setTimeout(function() {
                    if (window.accompagnement && typeof window.accompagnement.afficherBulleDecouverte === 'function') {
                        window.accompagnement.afficherBulleDecouverte({
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
     * #895 — « Télécharger » de la carte « Exporter des travaux ». Aucune
     * sélection n'est invalide : « Toutes / Tous » exporte tout le groupe.
     */
    function lancerArchivage() {
        travauxArchivage.lancerExport({
            da: document.getElementById('travaux-archivage-etudiant')?.value || null,
            productionId: document.getElementById('travaux-archivage-production')?.value || null,
            forme: document.getElementById('travaux-archivage-forme')?.value || 'etudiant-production',
            compression: document.getElementById('travaux-archivage-compression')?.checked !== false
        });
    }

    /**
     * #949 — « Arrêter l'export » de la même carte.
     */
    function arreterArchivage() {
        travauxArchivage.arreterExport();
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

        // #566 — LE COMPTEUR LIT LA SÉLECTION RÉELLE DE L'EXPORT. Il refaisait la
        // sélection à sa manière, sans résoudre les fichiers : une évaluation sans
        // fichier était comptée, puis ignorée en silence à l'export. Le chiffre
        // annoncé est désormais le nombre de PDF que l'export PRODUIRA, et ce qui
        // n'en produira pas est dit.
        if (typeof travauxArchivage === 'undefined' || typeof travauxArchivage.selectionnerEvaluationsLea !== 'function') {
            compteur.textContent = '';
            return;
        }
        const selection = travauxArchivage.selectionnerEvaluationsLea(productionId, da, reprisesSeulement);
        const nbPdf = selection.fichiers.length;
        const nbSans = selection.sansFichier.length;
        const label = reprisesSeulement ? 'reprise' : 'évaluation';

        if (da) {
            compteur.textContent = nbPdf > 0
                ? `1 ${label} prête`
                : (nbSans > 0 ? `1 ${label}, mais aucun fichier : pas de PDF` : `Aucune ${label}`);
        } else if (nbPdf === 0 && nbSans === 0) {
            compteur.textContent = reprisesSeulement ? 'Aucune reprise trouvée' : 'Aucune évaluation trouvée';
        } else {
            compteur.textContent = `${nbPdf} PDF pour ${nbPdf} étudiant(s)`
                + (nbSans > 0 ? ` — ${nbSans} ${label}(s) sans fichier, sans PDF` : '');
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
            <p>${quota.utiliseFormate} utilisés sur ${quota.totalFormate} (${pourcent}&nbsp;%)</p>
            <p>${stats.nombre} ${window.pluriel(stats.nombre, 'fichier', 'fichiers')} de travaux (${stats.tailleFormatee})</p>
            <p class="texte-muted">Rangement : ${fsapiActif ? 'fichiers sur ton disque' : 'dans le navigateur'}</p>
            ${quota.alerteQuota ? `
                <div class="alerte alerte-attention" style="margin-top: 8px; padding: 10px; border-radius: 8px;">
                    <strong>L'espace est presque plein.</strong>
                    <p>Exporte tes anciens travaux avant d'en importer d'autres.</p>
                    <button class="btn btn-petit" data-action="travauxUI.proposerNettoyage">Proposer un nettoyage</button>
                    ${fsapiDispo && !fsapiActif ? '<button class="btn btn-petit btn-secondaire" data-action="travauxUI.configurerFSAPI">Passer au stockage disque</button>' : ''}
                </div>` : ''}
        `;
    }

    /**
     * #892 — « Proposer un nettoyage » ne propose que ce qui est DÉJÀ EXPORTÉ.
     *
     * Le tri vit dans `travauxStockage.selectionnerCopiesARetirer` (marque
     * d'export fiable, rien d'annoté depuis), et l'écrivain le refait avant
     * d'effacer. Ici : la liste est VUE avant le geste, et sans copie exportée
     * rien ne s'efface. Textes validés par Grégoire le 20 sept. 2026 (accords
     * au singulier compris) : aucun mot neuf sans repasser par lui.
     */
    function proposerNettoyage() {
        const fichiers = travauxStockage.obtenirFichiersGroupeActif();
        const tri = travauxStockage.selectionnerCopiesARetirer(fichiers, travauxStockage.obtenirAnnotations());
        const aRetirer = tri.aRetirer;
        const nbAnciennes = tri.marqueAncienne.length;

        const phraseAnciennes = nbAnciennes === 0 ? '' : (nbAnciennes === 1
            ? '<p class="texte-muted">1 copie porte une marque d\'exportation antérieure au 16 septembre 2026, que l\'application ne garantit pas. Elle n\'est pas proposée : exporte-la de nouveau si tu veux la retirer.</p>'
            : `<p class="texte-muted">${nbAnciennes} copies portent une marque d'exportation antérieure au 16 septembre 2026, que l'application ne garantit pas. Elles ne sont pas proposées : exporte-les de nouveau si tu veux les retirer.</p>`);

        if (aRetirer.length === 0) {
            afficherModalePipeline('Rien à retirer sans risque',
                '<p>Aucune copie de ce groupe n\'a encore été exportée : les retirer les perdrait. Exporte-les d\'abord dans « Exporter et archiver », puis reviens ici.</p>' + phraseAnciennes,
                [{ label: 'Fermer', classe: 'btn-secondaire' }]);
            return;
        }

        const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];
        const productions = obtenirDonneesSelonMode('productions') || [];
        let nbEvaluees = 0;
        const lignes = aRetirer.map(f => {
            const e = etudiants.find(x => x && x.da === f.etudiantDA);
            const p = productions.find(x => x && x.id === f.productionId);
            const nomEleve = e ? `${e.nom || ''}, ${e.prenom || ''}` : (f.etudiantDA || f.nomFichier || '');
            const nomProduction = p ? (p.titre || p.nom || f.productionId) : (f.productionId || '');
            const exporteeLe = new Date(f.dateExport).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
            if (travauxResolution.trouverEvaluationPourFichier(f)) nbEvaluees++;
            return `<li data-fichier-id="${echapperHtml(f.id)}">
                    <span><strong>${echapperHtml(nomEleve)}</strong> · ${echapperHtml(nomProduction)}</span>
                    <span class="texte-muted">${echapperHtml(travauxStockage.formaterTaille(f.tailleFichier || 0))} · exportée le ${echapperHtml(exporteeLe)}</span>
                </li>`;
        }).join('');

        const phraseEvaluees = nbEvaluees === 0 ? '' : (nbEvaluees === 1
            ? '<p>1 de ces copies est évaluée. Son évaluation reste : la note, la grille et la rétroaction ne bougent pas. Seule la copie annotée ne s\'ouvrira plus ici.</p>'
            : `<p>${nbEvaluees} de ces copies sont évaluées. Leur évaluation reste : la note, la grille et la rétroaction ne bougent pas. Seule la copie annotée ne s'ouvrira plus ici.</p>`);

        const n = aRetirer.length;
        const taille = travauxStockage.formaterTaille(aRetirer.reduce((acc, f) => acc + (f.tailleFichier || 0), 0));
        const intro = n === 1
            ? 'Cette copie a déjà été exportée : son fichier existe ailleurs, sur ton ordinateur. La retirer d\'ici libère de l\'espace tout de suite. Les copies qui n\'ont pas encore été exportées ne sont jamais proposées.'
            : 'Ces copies ont déjà été exportées : leur fichier existe ailleurs, sur ton ordinateur. Les retirer d\'ici libère de l\'espace tout de suite. Les copies qui n\'ont pas encore été exportées ne sont jamais proposées.';
        // La liste CAPTURÉE à l'affichage est celle qui part (#556) : pas de relecture au clic.
        const ids = aRetirer.map(f => f.id);

        afficherModalePipeline('Libérer de l\'espace',
            `<p>${intro}</p><ul class="travaux-nettoyage-liste">${lignes}</ul>${phraseEvaluees}${phraseAnciennes}`,
            [
                { label: 'Annuler', classe: 'btn-secondaire' },
                {
                    label: n === 1 ? `Retirer cette copie (${taille})` : `Retirer ces ${n} copies (${taille})`,
                    classe: 'btn-principal',
                    action: async () => {
                        const retirees = await travauxStockage.nettoyerFichiersArchives(ids);
                        const bilan = retirees === n
                            ? (n === 1 ? '1 copie retirée' : `${n} copies retirées`)
                            : `${retirees} copies retirées sur ${n}`;
                        if (typeof notifications !== 'undefined' && typeof notifications.succes === 'function') {
                            notifications.succes(bilan);
                        }
                        afficherArchivage();
                    }
                }
            ]);
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

            // Supprimer l'évaluation — lecture brute (read-modify-write) : le tableau filtré par
            // cours de `obtenirDonneesSelonMode` réécrit sans les évaluations des autres cours
            // du trimestre (lot A de l'enregistrement, 26 sept. 2026).
            const evaluations = db.getSync(cle('evaluationsSauvegardees'), []) || [];
            const evaluationsMaj = evaluations.filter(e => e.id !== evalAssociee.id);
            // Lot B (relecture de Cowork, « commenter ») : si cette écriture échoue, le fichier est
            // quand même supprimé plus bas — une évaluation sans copie, état que l'application
            // connaît déjà ; l'usager a demandé la suppression, et le témoin dit l'échec.
            sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluationsMaj,
                { geste: 'Suppression de l\'évaluation du fichier' });
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

        // #884 — un fichier re-déposé dont les réglages sont en cours de
        // réapplication n'a pas encore son blob : ni « expiré », ni importable.
        const enRejeu = queue.filter(f => f.reglagesEnRejeu);
        if (enRejeu.length > 0) {
            notifications.info(enRejeu.length + ' fichier(s) : r\u00e9glages sp\u00e9cifiques en cours de r\u00e9application. Relance l\u2019import dans un instant.');
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
            if (nomProdCible && nomProdCible !== '— Choisir —') {
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

        // Beta 99.30 : D\u00e9tecter les fichiers qui correspondent \u00e0 des \u00e9tudiants
        // d'un autre groupe-cours et alerter l'utilisateur dans la modale.
        const autreGC = (typeof travauxImport.detecterFichiersAutreGC === 'function')
            ? travauxImport.detecterFichiersAutreGC()
            : [];
        let bandeauAutreGC = '';
        const boutonsBascule = [];
        if (autreGC.length > 0) {
            const totalAutre = autreGC.reduce(function(s, g) { return s + g.count; }, 0);
            const lignes = autreGC.map(function(g) {
                const labelGr = 'gr. ' + String(g.groupe || '?').padStart(5, '0');
                return '<li>' + echapperHtml(labelGr) + ' \u2014 ' + g.count + ' fichier' + (g.count > 1 ? 's' : '') + '</li>';
            }).join('');
            bandeauAutreGC = '<div class="travaux-bandeau-autre-gc">'
                + '<p><strong>Attention\u00a0:</strong> ' + totalAutre + ' fichier' + (totalAutre > 1 ? 's correspondent' : ' correspond')
                + ' \u00e0 des \u00e9tudiants d\u2019un autre groupe-cours\u00a0:</p>'
                + '<ul>' + lignes + '</ul>'
                + '<p class="texte-muted u-texte-petit">Tu peux importer quand m\u00eame (les fichiers seront non identifi\u00e9s) ou basculer ci-dessous.</p>'
                + '</div>';
            autreGC.forEach(function(g) {
                const labelGr = 'gr. ' + String(g.groupe || '?').padStart(5, '0');
                boutonsBascule.push({
                    label: 'Basculer vers ' + labelGr,
                    classe: 'btn-secondaire',
                    action: function() { basculerVersGCDepuisModale(g.gcId); }
                });
            });
        }

        // Beta 99.30 : Fichiers sans DA détectable dans le nom — l'association
        // à un étudiant n'est pas fiable et le regroupement multi-pages ne
        // fonctionnera pas. Avertissement non bloquant.
        const fichiersSansDA = (typeof travauxImport.detecterFichiersSansDA === 'function')
            ? travauxImport.detecterFichiersSansDA()
            : [];
        let bandeauSansDA = '';
        if (fichiersSansDA.length > 0) {
            const lignesND = fichiersSansDA.map(function(f) {
                const nomAff = typeof anonymiserNomFichier === 'function'
                    ? anonymiserNomFichier(f.nomFichier, f.etudiantDA)
                    : f.nomFichier;
                return '<li>' + echapperHtml(nomAff) + '</li>';
            }).join('');
            bandeauSansDA = '<div class="travaux-bandeau-sans-da">'
                + '<p><strong>Fichier' + (fichiersSansDA.length > 1 ? 's' : '') + ' sans DA détectable :</strong></p>'
                + '<ul>' + lignesND + '</ul>'
                // #612 T6.4 — TEXTE DE GRÉGOIRE, posé tel quel (1er sept. 2026).
                // L'ancien annonçait que « l'association devra être faite
                // manuellement » : conséquence DISPARUE depuis #611, qui apparie
                // par le NOM. Un fichier sans DA n'a donc pas de DA — il est bien
                // recensé ici — mais son élève EST trouvé. Ce qu'il perd, c'est le
                // regroupement multi-pages, et rien d'autre.
                // ⮕ La règle : dire la conséquence RÉELLE et le geste qui la lève.
                + '<p class="texte-muted u-texte-petit">Ces fichiers ne portent pas de DA. L\'élève peut tout de même être trouvé par son nom, mais les pages d\'une même production ne seront pas regroupées automatiquement. Ajoutez le DA au nom du fichier pour que le regroupement se fasse.</p>'
                + '</div>';
        }

        // #612 T6.4 — LE DA QUI NE CORRESPOND À PERSONNE DANS CE GROUPE.
        // `detecterFichiersDAInconnu` (T6.3) existait sans consommateur : le
        // fichier était stocké sous un DA inexistant, et rien ne le disait.
        // Même règle de rédaction que ci-dessus : ce qui se passe, et quoi faire.
        const fichiersDAInconnu = (typeof travauxImport.detecterFichiersDAInconnu === 'function')
            ? travauxImport.detecterFichiersDAInconnu()
            : [];
        let bandeauDAInconnu = '';
        if (fichiersDAInconnu.length > 0) {
            const lignesDI = fichiersDAInconnu.map(function(f) {
                const nomAff = typeof anonymiserNomFichier === 'function'
                    ? anonymiserNomFichier(f.nomFichier, f.etudiantDA)
                    : f.nomFichier;
                return '<li>' + echapperHtml(nomAff) + ' <span class="texte-muted">(DA ' + echapperHtml(f.daDetecte || '?') + ')</span></li>';
            }).join('');
            bandeauDAInconnu = '<div class="travaux-bandeau-da-inconnu">'
                + '<p><strong>DA sans élève dans ce groupe :</strong></p>'
                + '<ul>' + lignesDI + '</ul>'
                + '<p class="texte-muted u-texte-petit">Le DA lu dans ces noms de fichiers ne correspond à aucun·e élève inscrit·e dans le groupe-cours actif. Les fichiers seront importés et apparaîtront dans la liste des évaluations comme non associés, sans note possible. Vérifiez le DA dans le nom du fichier, ou basculez sur le groupe-cours auquel appartiennent ces élèves.</p>'
                + '</div>';
        }

        // Beta 99.30 : Détection des doublons (fichiers déjà importés ou présents
        // plusieurs fois dans la file pour le même couple étudiant + production).
        const doublonsDetectes = (typeof travauxImport.detecterDoublonsStockage === 'function')
            ? travauxImport.detecterDoublonsStockage()
            : [];
        let bandeauDoublons = '';
        if (doublonsDetectes.length > 0) {
            const productions = obtenirDonneesSelonMode('productions');
            function _nomProd(prodId) {
                const p = productions.find(function(x) { return x && x.id === prodId; });
                return p ? (p.titre || p.nom || prodId) : (prodId || '?');
            }
            function _nomEtudiant(d) {
                if (d.nouveau && d.nouveau.etudiantAssocie) {
                    return (d.nouveau.etudiantAssocie.nom || '') + ', ' + (d.nouveau.etudiantAssocie.prenom || '');
                }
                return d.nouveau && d.nouveau.etudiantDA ? d.nouveau.etudiantDA : 'Étudiant inconnu';
            }
            function _formatDate(iso) {
                if (!iso) return '';
                try {
                    const dt = new Date(iso);
                    return dt.toLocaleString('fr-CA', { dateStyle: 'short', timeStyle: 'short' });
                } catch (e) { return ''; }
            }
            const lignesD = doublonsDetectes.map(function(d) {
                const nomEt = echapperHtml(_nomEtudiant(d));
                const titreProd = echapperHtml(_nomProd(d.nouveau.productionId));
                const idx = d.idxNouveau;
                const nomFichierAff = typeof anonymiserNomFichier === 'function'
                    ? anonymiserNomFichier(d.nouveau.nomFichier || '', d.nouveau.etudiantDA)
                    : (d.nouveau.nomFichier || '');
                let detail = '';
                if (d.stockes.length > 0) {
                    const datesStockes = d.stockes
                        .map(function(fS) { return _formatDate(fS.dateImport); })
                        .filter(Boolean)
                        .join(', ');
                    detail = ' (déjà importé' + (d.stockes.length > 1 ? 's' : '') + (datesStockes ? ' le ' + echapperHtml(datesStockes) : '') + ')';
                } else if (d.queue.length > 0) {
                    detail = ' (présent ' + (d.queue.length + 1) + ' fois dans la file)';
                }
                return ''
                    + '<li class="travaux-doublon-ligne">'
                    +   '<div><strong>' + nomEt + '</strong> — ' + titreProd + detail + '</div>'
                    +   '<div class="travaux-doublon-fichier u-texte-petit texte-muted">Fichier en cours d’import : <code>' + echapperHtml(nomFichierAff) + '</code></div>'
                    +   '<div class="travaux-doublon-renommer">'
                    +     '<label for="rename-doublon-' + idx + '" class="u-texte-petit">Renommer pour distinguer :</label>'
                    +     '<input type="text" id="rename-doublon-' + idx + '" class="controle-form controle-form-compact" '
                    +       'value="' + echapperHtml(nomFichierAff) + '" '
                    +       'placeholder="Ex : Artefact 9 - Partie 2">'
                    +     '<button class="btn btn-compact btn-secondaire" data-action="travauxUI.renommerDoublon" data-param="' + idx + '">Appliquer</button>'
                    +     '<span class="travaux-doublon-feedback u-texte-petit" id="rename-feedback-' + idx + '"></span>'
                    +   '</div>'
                    + '</li>';
            }).join('');
            bandeauDoublons = '<div class="travaux-bandeau-doublon">'
                + '<p><strong>Doublon' + (doublonsDetectes.length > 1 ? 's' : '') + ' détecté' + (doublonsDetectes.length > 1 ? 's' : '') + ' :</strong></p>'
                + '<p class="travaux-doublon-astuce u-texte-petit"><strong>Astuce</strong> : si ce fichier est une partie complémentaire d’un travail <em>déjà évalué</em>, le plus direct est d’annuler ici, d’ouvrir l’évaluation existante et d’utiliser <strong>+ Ajouter des pages</strong>. Sinon, choisis ci-dessous.</p>'
                + '<ul>' + lignesD + '</ul>'
                + '<p class="texte-muted u-texte-petit">Tu peux importer quand même (un second fichier sera créé) ou annuler pour gérer manuellement le fichier existant. Pour distinguer les deux fichiers, renomme celui en cours d’import ci-dessus avant de confirmer.</p>'
                + '</div>';
        }

        afficherModalePipeline('Confirmer l\u2019import',
            bandeauAutreGC + bandeauSansDA + bandeauDAInconnu + bandeauDoublons + `<p>${nbFichiers} fichier(s) seront importés ${msgGroupe} et ${msgProduction}.</p>
            <p>Confirmer l\u2019importation ?</p>`,
            [
                { label: 'Oui, importer', classe: 'btn-principal', action: () => executerImportPipeline() },
                { label: 'Revenir aux réglages', classe: 'btn-secondaire', action: () => {} }
            ].concat(boutonsBascule));
    }

    /**
     * Beta 99.30 : Bascule le groupe-cours actif depuis la modale d'import et
     * ré-évalue les associations étudiant des fichiers en file d'attente.
     */
    async function basculerVersGCDepuisModale(gcId) {
        if (!gcId) return;
        try {
            if (typeof changerGroupeCoursDepuisHeader === 'function') {
                await changerGroupeCoursDepuisHeader(gcId);
            }
            if (travauxImport && typeof travauxImport.reevaluerAssociationsQueue === 'function') {
                travauxImport.reevaluerAssociationsQueue();
            }
            afficherImport();
        } catch (e) {
            console.warn('[Travaux-UI] Erreur bascule GC depuis modale:', e);
        }
    }

    async function executerImportPipeline() {
        // #612 T6.4 — D2 = A : REFUS DIT, pas import silencieux.
        //
        // Sans groupe-cours actif, les fichiers sont stockés mais n'apparaissent
        // NULLE PART : la liste des évaluations lit `obtenirFichiersGroupeActif`,
        // qui n'a alors aucun groupe où chercher. L'enseignant·e voit un import
        // « réussi » et un écran vide, sans rien pour relier les deux.
        //
        // ⚠ La garde vit ICI et pas dans la modale : c'est la dernière porte
        // avant l'écriture, et c'est elle que toute autre entrée devra franchir.
        // ⚠ Et elle ne touche PAS au repli de `obtenirFichiersGroupeActif` —
        // 60 appelants non audités (garde-fou du plan S6).
        const gcActifImport = (typeof db !== 'undefined') ? db.getSync('groupeCoursActif', null) : null;
        if (!gcActifImport || !gcActifImport.id) {
            if (typeof notifications !== 'undefined' && typeof notifications.erreur === 'function') {
                notifications.erreur('Import refusé : aucun groupe-cours actif. Les fichiers seraient enregistrés sans groupe et n\'apparaîtraient dans aucune liste. Choisissez un groupe-cours dans l\'en-tête, puis relancez l\'import.');
            }
            return;
        }

        const queue = travauxImport.obtenirFileDAttente();

        const dpiCible = parseInt(document.getElementById('pipeline-opt-dpi')?.value) || 0;
        // Beta 99.30 : balance des blancs et assemblage automatique appliqués
        // par défaut (les checkbox UI ont été retirées pour simplifier le pipeline).
        // Documenté via le tooltip de l'étape Optimisation et la section Aide.
        const optAssemblage = true;

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
                    if (balanceActiveePour(f) && typeof travauxPreparation.autoBalanceBlancs === 'function') {
                        try {
                            blob = await travauxPreparation.autoBalanceBlancs(blob);
                        } catch (e) {
                            console.warn('[Pipeline] Erreur balance blancs:', f.nomFichier, e);
                        }
                    }

                    // Uniformisation DPI (par fichier : sauf si format11x17)
                    if (dpiCible && !f.format11x17) {
                        try {
                            blob = await uniformiser200DPI(blob, dpiCible);
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

                // Yield 100ms pour permettre au navigateur de mettre à jour la barre de progression
                await new Promise(r => setTimeout(r, 100));
            }
        }

        // === Assemblage PDF si coche ===
        if (optAssemblage) {
            await assemblerGroupesPipeline(queue, dpiCible || 250);
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
            // #604 — Les fichiers écrits pendant l'arbitrage sont passés APRÈS
            // le ménage de `importerTous` : les retirer maintenant, sinon la
            // file les affiche encore alors qu'ils sont déjà stockés.
            if (typeof travauxImport.purgerFichiersImportes === 'function') {
                travauxImport.purgerFichiersImportes();
            }
        }

        // Phase Jetons : appliquer les jetons de reprise pour les fichiers importés comme reprises
        const bilanJetons = await appliquerJetonsReprisePostImport();

        afficherImport();

        const msg = `${resultat.importes} fichier(s) import\u00e9(s)`;
        var details = [];
        if (resultat.erreurs > 0) details.push(resultat.erreurs + ' erreur(s)');
        if (resultat.doublons && resultat.doublons.length > 0) details.push(resultat.doublons.length + ' doublon(s) traité(s)');
        // #608 — deux mentions distinctes : un rattachement n'est jamais annoncé
        // comme un jeton appliqué.
        if (bilanJetons.jetons > 0) details.push(bilanJetons.jetons + ' jeton(s) de reprise appliqué(s)');
        if (bilanJetons.rattaches.length > 0) details.push(bilanJetons.rattaches.length + ' fichier(s) rattaché(s) à une reprise déjà accordée');
        notifications.succes(msg, details.join(' — '));
    }

    /**
     * #608 (constat S6 de l'audit du 30 août 2026) — un jeton de reprise ne
     * s'offre que s'il peut réellement être consommé.
     *
     * LE DÉFAUT. La modale de doublon ne regardait que le compte GLOBAL de
     * jetons de l'élève (`verifierDisponibiliteJeton`). Le maximum PAR
     * PRODUCTION est vérifié ailleurs — dans `appliquerJetonReprise`, qui rend
     * `null` SANS UN MOT quand `silencieux` est posé. Au-delà du maximum, le
     * bouton s'affichait, le fichier était importé comme reprise, aucun jeton
     * n'était consommé, et l'écran annonçait le contraire.
     *
     * Les deux bornes sont donc lues ICI, à l'endroit où le bouton se décide.
     *
     * @param {string} etudiantDA
     * @param {string} productionId
     * @returns {boolean} true si un jeton de reprise peut être accordé
     */
    function _jetonRepriseOffrable(etudiantDA, productionId) {
        if (!etudiantDA) return false;
        if (typeof verifierDisponibiliteJeton !== 'function') return false;
        if (!verifierDisponibiliteJeton(etudiantDA, 'reprise')) return false;

        var configJetons = (typeof obtenirConfigJetons === 'function') ? obtenirConfigJetons() : null;
        var maxParProduction = (configJetons && configJetons.reprise && configJetons.reprise.maxParProduction) || 1;

        var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        var reprisesProduction = evaluations.filter(function(e) {
            return e.etudiantDA === etudiantDA
                && e.productionId === productionId
                && e.jetonRepriseApplique === true;
        }).length;

        return reprisesProduction < maxParProduction;
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
            var productions = obtenirDonneesSelonMode('productions');
            var prod = productions.find(function(p) { return p.id === d.productionId; });
            var nomProd = prod ? (prod.titre || prod.nom) : d.productionId;
            var compteur = (doublons.length > 1) ? ' (' + (i + 1) + '/' + doublons.length + ')' : '';

            // #610 — le critère de détection est DIT : « même élève, même
            // production » et « même nom, même taille » n'appellent pas la même
            // décision, et l'enseignant ne peut pas les distinguer autrement.
            var explicationCritere = (d.critere === 'nom-taille')
                // ⚠ `--texte-secondaire`, pas `--couleur-texte-secondaire` : la
                // seconde est une variable FANTÔME (référencée dans ce fichier,
                // jamais définie dans styles.css). Le cliquet #595 a refusé mon
                // premier jet, qui en aurait ajouté un usage — et mon texte
                // n'aurait eu aucune couleur, il aurait hérité de son parent.
                ? '<p style="font-size:13px;color:var(--texte-secondaire)">'
                    + 'Ce fichier porte le m\u00eame nom et la m\u00eame taille qu\u2019un fichier d\u00e9j\u00e0 import\u00e9. '
                    + 'C\u2019est probablement le m\u00eame document, re-d\u00e9pos\u00e9 apr\u00e8s une interruption.'
                    + '</p>'
                : '';

            // Vérifier si un jeton de reprise est disponible pour cet élève
            var boutonJeton = '';
            if (jetonsActifs && d.fichierExistant.etudiantDA) {
                // #608 — les DEUX bornes : jetons restants ET maximum par production.
                if (_jetonRepriseOffrable(d.fichierExistant.etudiantDA, d.productionId)) {
                    boutonJeton = '<button class="btn btn-secondaire" data-choix="jeton" style="border-color:var(--alerte-texte-attention);">Appliquer comme jeton de reprise' +
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
                        explicationCritere +
                        '<p style="font-size:13px;color:var(--couleur-texte-secondaire)">' +
                            'Existant\u00a0: ' + echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(d.fichierExistant.nomFichier, d.fichierExistant.etudiantDA) : d.fichierExistant.nomFichier) + '<br>' +
                            'Nouveau\u00a0: ' + echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(d.fichierPrepare.nomFichier, d.fichierPrepare.etudiantDA) : d.fichierPrepare.nomFichier) +
                        '</p>' +
                        '<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;">' +
                            boutonJeton +
                            '<button class="btn btn-principal" data-choix="remplacer">Remplacer l\u2019existant' +
                                '<span style="display:block;font-size:11px;font-weight:400;opacity:0.8;">L\u2019ancien fichier est envoy\u00e9 \u00e0 la corbeille. Le nouveau prend sa place.</span>' +
                            '</button>' +
                            '<button class="btn btn-secondaire" data-choix="additionnel">Livrable additionnel (les deux conserv\u00e9s)' +
                                '<span style="display:block;font-size:11px;font-weight:400;opacity:0.8;">Le nouveau fichier coexiste avec l\u2019existant comme deuxi\u00e8me livrable l\u00e9gitime (image + PDF, version compl\u00e9mentaire, etc.). Le cas est marqu\u00e9 comme valid\u00e9 et n\u2019appara\u00eetra pas dans le bandeau.</span>' +
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
                        var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
                        var evalActive = evaluations.find(function(e) {
                            return e.etudiantDA === d.fichierExistant.etudiantDA &&
                                e.productionId === d.productionId && !e.remplaceeParId;
                        });
                        if (evalActive) {
                            var nouvelleEval = appliquerJetonReprise(evalActive.id, null, { silencieux: true });
                            if (!nouvelleEval) {
                                // #608 — le refus était muet : le fichier entrait
                                // comme reprise, aucun jeton n'était consommé, et
                                // rien à l'écran ne le disait.
                                notifications.erreur(
                                    'Jeton non appliqu\u00e9',
                                    'Le fichier de ' + nomEtudiant + ' est import\u00e9 comme reprise, mais aucun jeton n\u2019a \u00e9t\u00e9 consomm\u00e9 '
                                    + '(maximum de reprises atteint pour cette production). \u00c0 v\u00e9rifier dans la liste des \u00e9valuations.'
                                );
                            } else {
                                travauxStockage.mettreAJourFichier(fichierImporte.id, { evaluationId: nouvelleEval.id });
                                if (!d.fichierExistant.evaluationId) {
                                    travauxStockage.mettreAJourFichier(d.fichierExistant.id, { evaluationId: evalActive.id });
                                }
                                notifications.succes('Jeton de reprise appliqu\u00e9 pour ' + echapperHtml(nomEtudiant));
                            }
                        }
                    }
                } catch (e) {
                    console.error('[Travaux-UI] Erreur import jeton:', e);
                }
            } else if (choix === 'remplacer') {
                // #558 B1 — ORDRE INVERSÉ : importer d'abord, jeter ensuite.
                // Auparavant l'ancien fichier partait à la corbeille AVANT
                // l'`await`, et l'échec de l'import n'était qu'un `console.error` :
                // l'utilisateur se retrouvait sans l'ancien ET sans le nouveau,
                // sans le savoir. Le remplacement ne détruit plus rien tant que
                // le remplaçant n'est pas là.
                //
                // #604 — L'ordre était juste, la VÉRIFICATION manquait. Deux
                // manques, et il fallait les deux :
                //   1. `remplaceExistant` — sans ce drapeau, `importerFichier`
                //      retrouve l'existant (toujours en place à cet instant,
                //      justement parce que l'ordre a été inversé) et refuse
                //      d'écrire ;
                //   2. la lecture de la valeur rendue — le refus n'est pas une
                //      exception, c'est un OBJET `{doublon:true}`. Un `await`
                //      qui rend un objet d'échec ressemble en tout point à un
                //      succès : le `catch` ne voyait rien, et la corbeille
                //      avalait l'original.
                d.fichierPrepare.remplaceExistant = true;
                try {
                    var remplacant = await travauxImport.importerFichier(d.fichierPrepare, d.productionId);
                    if (!remplacant || remplacant.doublon || !remplacant.id) {
                        throw new Error('Le fichier de remplacement n\'a pas été écrit (aucun identifiant rendu).');
                    }
                    travauxStockage.deplacerEnCorbeille(d.fichierExistant.id);
                } catch (e) {
                    console.error('[Travaux-UI] Erreur import remplacement:', e);
                    notifications.erreur('Le remplacement a échoué : le fichier d\'origine a été conservé.');
                } finally {
                    d.fichierPrepare.remplaceExistant = false;
                }
            } else if (choix === 'additionnel') {
                // Livrable additionnel : importer sans déclencher la détection
                // de doublon, puis marquer le cas comme validé pour qu'il
                // n'apparaisse pas dans le bandeau Plusieurs fichiers.
                d.fichierPrepare.livrableAdditionnel = true;
                try {
                    var fichierAdd = await travauxImport.importerFichier(d.fichierPrepare, d.productionId);
                    if (fichierAdd && fichierAdd.id &&
                        typeof travauxDoublonsUI !== 'undefined' &&
                        typeof travauxDoublonsUI.marquerLivrableAdditionnel === 'function') {
                        travauxDoublonsUI.marquerLivrableAdditionnel(
                            d.fichierExistant.etudiantDA,
                            d.productionId,
                            [d.fichierExistant.id, fichierAdd.id]
                        );
                    }
                } catch (e) {
                    console.error('[Travaux-UI] Erreur import livrable additionnel:', e);
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
     * @returns {{jetons: number, rattaches: string[]}} #608 — les jetons RÉELLEMENT
     *   accordés d'un côté, les fichiers seulement rattachés à une reprise déjà
     *   accordée de l'autre. Jamais additionnés : ils ne disent pas la même chose.
     */
    async function appliquerJetonsReprisePostImport() {
        // #608 — REND UN OBJET, plus un nombre nu. Le nombre confondait deux
        // choses que l'enseignant ne doit jamais confondre : un jeton accordé
        // (une reprise de plus) et un simple rattachement à une reprise DÉJÀ
        // accordée (aucun jeton consommé, la même reprise gagne un fichier).
        // L'écran annonçait « 1 jeton(s) de reprise appliqué(s) » dans les deux
        // cas.
        var bilan = { jetons: 0, rattaches: [] };
        if (typeof travauxStockage === 'undefined' || typeof appliquerJetonReprise !== 'function') return bilan;

        // Trouver les fichiers marqués comme reprises sans evaluationId
        // #572 — RESTREINT au groupe-cours actif. `obtenirFichiersTravaux()`
        // rend TOUS les fichiers du trimestre, tous groupes confondus : le
        // balayage post-import appliquait donc des jetons de reprise à des
        // élèves d'un autre groupe que celui où l'enseignant venait d'importer.
        // `obtenirFichiersGroupeActif()` retombe sur la liste complète quand
        // aucun groupe n'est actif, donc aucun cas n'est perdu.
        var tousLesFichiers = travauxStockage.obtenirFichiersGroupeActif();
        var fichiersReprise = tousLesFichiers.filter(function(f) {
            return f.estReprise && !f.evaluationId && f.etudiantDA && f.productionId;
        });

        if (fichiersReprise.length === 0) return bilan;

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

        var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
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
                // Jeton déjà appliqué — lier le fichier à l'évaluation existante.
                // #608 : ce n'est PAS un jeton de plus. Compté à part, et dit à part.
                travauxStockage.mettreAJourFichier(fichier.id, { evaluationId: repriseExistante.id });
                bilan.rattaches.push(nomEtudiant);
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
            evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
            bilan.jetons++;
        }

        // Notification consolidée
        if (echecsSansEval.length > 0) {
            notifications.erreur(
                'Jetons non appliqués',
                'Aucune évaluation existante trouvée pour : ' + echecsSansEval.join(', ') +
                '. Les fichiers ont été importés, mais le jeton doit être appliqué manuellement.'
            );
        }

        // #608 — le rattachement a sa propre annonce, distincte de celle des
        // jetons : l'enseignant doit savoir que la reprise déjà accordée a
        // maintenant un fichier de plus, et qu'aucun jeton n'a été consommé.
        if (bilan.rattaches.length > 0) {
            notifications.info(
                'Fichiers rattachés à une reprise déjà accordée',
                bilan.rattaches.join(', ') + ' \u2014 aucun jeton suppl\u00e9mentaire n\u2019a \u00e9t\u00e9 consomm\u00e9.'
            );
        }

        return bilan;
    }

    /**
     * Uniformise une image au DPI cible
     * Lettre (8.5"x11") ou Tabloid (11"x17") selon les dimensions originales
     * @param {Blob} blob - Le blob image
     * @param {number} dpi - DPI cible (200, 250 ou 300)
     * @returns {Promise<Blob>} Le blob redimensionne
     */
    function uniformiser200DPI(blob, dpi) {
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
                    // Tabloid 11"x17"
                    maxW = Math.round(11 * dpi);
                    maxH = Math.round(17 * dpi);
                } else {
                    // Lettre 8.5"x11"
                    maxW = Math.round(8.5 * dpi);
                    maxH = Math.round(11 * dpi);
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
     * @param {number} [dpi=250] - DPI pour la conversion pixels → mm
     */
    async function assemblerGroupesPipeline(queue, dpi) {
        const groupes = travauxImport.regrouperParDocument();

        for (const [cle, fichiers] of groupes) {
            // Seulement les groupes de >= 2 fichiers. #880 — les PDF entrent
            // dans l'assemblage : le cadre « → 1 PDF » les comptait deja.
            const images = fichiers.filter(f => f.estImage || f.estPDF);
            if (images.length < 2) continue;

            try {
                const pdfBlob = await travauxImport.assemblerPDFGroupe(images, dpi);

                // Remplacer les images par un seul PDF dans la queue
                const premierFichier = images[0];
                const indexPremier = queue.indexOf(premierFichier);

                // Retirer tous les fichiers du groupe sauf le premier
                for (let i = images.length - 1; i >= 1; i--) {
                    const idx = queue.indexOf(images[i]);
                    if (idx !== -1) queue.splice(idx, 1);
                }
                // #609 (M5) — la file en mémoire et la file PERSISTÉE bougent
                // ensemble (cf. #558 B1). Sans cet appel, une interruption après
                // l'assemblage fait ressusciter les entrées fusionnées au
                // rechargement, présentées comme « à re-déposer ».
                if (typeof travauxImport.persisterFileDAttente === 'function') {
                    travauxImport.persisterFileDAttente();
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

                    // Regenerer la thumbnail (stockée en IndexedDB, champ métadonnées vide)
                    try {
                        const result = await travauxStockage.genererMiniaturePDF(pdfBlob);
                        if (result.thumbnail && typeof travauxStockage.stockerThumbnail === 'function') {
                            travauxStockage.stockerThumbnail(f.id, result.thumbnail);
                        }
                        f.thumbnailDataUrl = '';
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
    /**
     * Renomme le fichier en cours d'import depuis le bandeau « Doublon détecté »
     * de la modale « Confirmer l'import ». Lit l'input #rename-doublon-${idx},
     * applique le renommage via travauxImport.renommerFichierDansFile et
     * affiche un feedback inline. Désactive l'input + bouton après application.
     *
     * @param {string|number} idxStr - Index du fichier dans la file d'attente
     */
    function renommerDoublon(idxStr) {
        const idx = parseInt(idxStr, 10);
        if (isNaN(idx)) return;
        const input = document.getElementById('rename-doublon-' + idx);
        const feedback = document.getElementById('rename-feedback-' + idx);
        if (!input) return;
        const nouveauNom = (input.value || '').trim();
        if (!nouveauNom) {
            if (feedback) {
                feedback.textContent = 'Nom vide';
                feedback.style.color = 'var(--rouge-erreur)';
            }
            return;
        }
        const ok = (typeof travauxImport !== 'undefined'
            && typeof travauxImport.renommerFichierDansFile === 'function')
            ? travauxImport.renommerFichierDansFile(idx, nouveauNom)
            : false;
        if (!ok) {
            if (feedback) {
                feedback.textContent = 'Renommage échoué';
                feedback.style.color = 'var(--rouge-erreur)';
            }
            return;
        }
        // Récupérer le nom final (qui peut différer si l'extension a été préservée)
        const queue = travauxImport.obtenirFileDAttente();
        const nomFinal = queue && queue[idx] ? queue[idx].nomFichier : nouveauNom;
        input.value = nomFinal;
        input.disabled = true;
        // Désactiver le bouton « Appliquer »
        const btn = document.querySelector('[data-action="travauxUI.renommerDoublon"][data-param="' + idx + '"]');
        if (btn) btn.disabled = true;
        if (feedback) {
            feedback.textContent = 'Renommé en ' + nomFinal;
            feedback.style.color = 'var(--vert-succes)';
        }
    }

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
                <button class="modal-fermer" data-action="fermerOverlayParent" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
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

    /* ===============================
       RÉASSIGNATION D'UNE COPIE (#932)
       =============================== */

    // #932 (22 sept. 2026) — UNE SEULE ÉCRITURE DE L'ASSOCIATION D'UNE COPIE.
    // Cinq chemins réassociaient une copie (menu de la Liste, Propriétés, correction
    // d'identité du panneau d'évaluation, menu Production du tableau, jeton de
    // reprise). Deux d'entre eux — Propriétés et la correction d'identité —
    // changeaient aussi l'ÉLÈVE, et écrivaient sans porte, ou avec la porte muette
    // d'avant #931 (« Remplacer ? », sans nommer les fichiers). Le 22 sept. au matin,
    // c'est cette porte-là qui a envoyé à la corbeille une copie importée le jour
    // même, pendant qu'un Artefact 1 annoté prenait sa place.
    //
    // Trois fonctions portent désormais le geste, et rien d'autre n'écrit :
    //   · `mesurerReassignation` — LIT ce que le geste ferait (conflit, évaluation
    //     orpheline), et nomme ce que la porte doit nommer ;
    //   · `ecrireReassignation`  — ÉCRIT, sur une mesure : corbeille de l'existant,
    //     puis `reassocierFichier` ;
    //   · `reassignerCopie`      — le geste complet : mesure → porte → écriture.
    // La réassignation en masse de la Liste (#934) mesure chaque copie, pose UNE
    // question groupée, puis écrit chaque mesure : la vérification est séparée de
    // l'écriture ICI, pas contournée là-bas.
    // Hors `travaux-stockage.js`, `reassocierFichier` n'a plus d'autre appelant que
    // les deux premières — sentinelle #932.

    /**
     * Mesure ce qu'une réassignation ferait, sans rien écrire ni rien demander.
     * @param {string} fichierId
     * @param {{productionId?: string, etudiantDA?: string}} association
     * @returns {Object|null} la mesure, ou null si le stockage ne connaît pas la copie
     */
    function mesurerReassignation(fichierId, association) {
        const assoc = association || {};
        const verif = travauxStockage.reassocierFichier(fichierId, assoc, { verificationSeule: true });
        if (!verif) return null;

        const tousLesFichiers = (typeof travauxStockage.obtenirFichiersTravaux === 'function' && travauxStockage.obtenirFichiersTravaux()) || [];
        const fichier = tousLesFichiers.find(f => f.id === fichierId) || null;
        const daActuel = (fichier && fichier.etudiantDA) || '';
        const prodActuelle = (fichier && fichier.productionId) || '';
        const nouveauDA = assoc.etudiantDA !== undefined ? (assoc.etudiantDA || '') : daActuel;
        const nouveauProdId = assoc.productionId !== undefined ? (assoc.productionId || '') : prodActuelle;

        const productions = obtenirDonneesSelonMode('productions') || [];
        const prod = productions.find(p => p.id === nouveauProdId);
        const prodAvant = productions.find(p => p.id === prodActuelle);
        const etudiant = (typeof travauxImport !== 'undefined' && typeof travauxImport.trouverEtudiantParDA === 'function')
            ? travauxImport.trouverEtudiantParDA(nouveauDA) : null;

        // Relecture Cowork (22 sept., soir) — CE QUE LA PORTE ET LE RÉCAPITULATIF NOMMENT
        // PASSE PAR L'ANONYMISATION, comme le reste de l'app (carrousel, tableau) : en
        // mode anonymisation, la liste dit « Élève N » et la question disait le vrai nom.
        // Un DA vide ne s'affiche pas vide non plus.
        const nomReel = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : (nouveauDA || 'étudiant·e non identifié·e');
        const nomEleve = (typeof anonymiserNom === 'function' && nouveauDA && anonymiserNom(nouveauDA)) || nomReel;
        const nomDeFichierAffiche = (nom, da) => (typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(nom, da) : nom);
        const existant = verif.fichierExistant || null;

        return {
            fichierId: fichierId,
            association: assoc,
            fichier: fichier,
            changeEleve: nouveauDA !== daActuel,
            changeProduction: nouveauProdId !== prodActuelle,
            nomFichier: nomDeFichierAffiche((fichier && fichier.nomFichier) || fichierId, daActuel),
            nomProduction: prod ? (prod.titre || prod.nom) : nouveauProdId,
            nomProductionActuelle: prodAvant ? (prodAvant.titre || prodAvant.nom) : prodActuelle,
            nomEleve: nomEleve,
            conflit: !!verif.conflit,
            fichierExistant: existant,
            nomExistant: existant ? nomDeFichierAffiche(existant.nomFichier || existant.id, existant.etudiantDA) : '',
            evaluationOrpheline: !!verif.evaluationOrpheline
        };
    }

    /**
     * La porte de conflit. #931 (22 sept. 2026) — elle NOMME les deux fichiers :
     * « Remplacer l'existant ? » ne disait ni lequel part à la corbeille ni lequel
     * prend sa place. #932 — quand l'élève change, elle nomme aussi l'élève.
     * @param {Object} m - une mesure
     * @returns {string}
     */
    function texteDeLaPorte(m) {
        const pour = m.changeEleve
            ? `cet·te étudiant·e et cette production (${m.nomEleve} × ${m.nomProduction})`
            : `cette production (${m.nomProduction})`;
        return `Un fichier existe déjà pour ${pour} :\n` +
            `    ${m.nomExistant}\n\n` +
            `Le remplacer par :\n` +
            `    ${m.nomFichier}\n\n` +
            `Le fichier existant ira à la corbeille (récupérable pendant 30 jours).`;
    }

    /**
     * Écrit une réassignation mesurée : l'existant en conflit part à la corbeille,
     * puis le stockage réassocie. Aucune question ici — elle a été posée par
     * `reassignerCopie`, ou groupée par la Liste (#934).
     * @param {Object} mesure - rendue par `mesurerReassignation`
     * @returns {boolean}
     */
    function ecrireReassignation(mesure) {
        if (!mesure || !mesure.fichierId) return false;
        if (mesure.conflit && mesure.fichierExistant) {
            travauxStockage.deplacerEnCorbeille(mesure.fichierExistant.id);
        }
        const ok = travauxStockage.reassocierFichier(mesure.fichierId, mesure.association);
        return !!ok;
    }

    /**
     * Réassigne une copie (production et/ou élève), en passant par la porte.
     *
     * #561 (29 août 2026) — RENDRE UN VERDICT. Le geste peut s'arrêter sur un
     * `confirm()` refusé : il rend `true` quand la réassignation a eu lieu, `false`
     * sinon (abandon par l'utilisateur, ou refus du stockage). Un appelant qui
     * marquait « reprise » sans ce verdict consommait le jeton sur l'ANCIENNE
     * production.
     *
     * @param {string} fichierId
     * @param {{productionId?: string, etudiantDA?: string}} association
     * @returns {Promise<boolean>}
     */
    async function reassignerCopie(fichierId, association) {
        const mesure = mesurerReassignation(fichierId, association);
        if (!mesure) return false;

        if (mesure.conflit && !confirm(texteDeLaPorte(mesure))) return false;

        if (mesure.evaluationOrpheline) {
            // Porte terrain 1.154.0, décision 3.1 de Grégoire : « aligner » — la même phrase que le
            // récapitulatif du geste en masse, avec le nom de l'ancienne production (porté par la mesure).
            const confirme = confirm(
                `L’évaluation déjà faite sur « ${mesure.nomProductionActuelle} » n’aura plus de copie liée ` +
                `(l’évaluation elle-même est conservée). Continuer ?`
            );
            if (!confirme) return false;
        }

        return ecrireReassignation(mesure);
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
                _setModeCourant('annoter');
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
            _setModeCourant('evaluer');
            masquerPalettesAnnotation();

            // Si les palettes eval existent déjà (cachées), les réafficher et re-remplir
            if (document.getElementById('travaux-palette-eval-gauche')) {
                ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.classList.remove('u-hide');
                });
                // Re-remplir les selects pour le fichier courant
                remplirLabelsIdentite(fichier);
                const prodIdEff = fichier.productionId ||
                    (typeof travauxResolution !== 'undefined' ? travauxResolution.trouverProductionPourFichier(fichier) : null);
                // Chantier F Cat-B (21 mai 2026) — l'API évaluation encapsule le reset
                // critères/identité + delete idModification + desactiverFormulaireEvaluation.
                // travaux-ui ne touche plus window.evaluationEnCours directement.
                if (typeof window.demarrerEvaluationDepuisFichier === 'function') {
                    window.demarrerEvaluationDepuisFichier(fichier, {
                        recreer: false,
                        productionIdEffective: prodIdEff || fichier.productionId
                    });
                }
                preRemplirEvaluation(fichier.etudiantDA, prodIdEff || fichier.productionId);
            } else {
                // Première fois : créer les palettes eval
                afficherPalettesEval(fichier);
            }

            if (btnAnnoter) btnAnnoter.classList.remove('actif');
            if (btnEvaluer) btnEvaluer.classList.add('actif');

            // Recentrer le document
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
            _setModeCourant('annoter');
            // Remettre les panneaux eval dans le HTML statique (pas juste masquer)
            // pour qu'ils survivent si le DOM est recréé (rafraichirUI, navigation)
            fermerModeEvaluation();
            afficherPalettesAnnotation();

            if (btnAnnoter) btnAnnoter.classList.add('actif');
            if (btnEvaluer) btnEvaluer.classList.remove('actif');

            // Recentrer le document
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
        // Masquer toutes les palettes du lot annotation
        ['travaux-palette-flottante', 'travaux-palette-tampons', 'travaux-palette-erreurs-fr'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('u-hide');
        });
    }

    function afficherPalettesAnnotation() {
        // Afficher toutes les palettes du lot annotation
        ['travaux-palette-flottante', 'travaux-palette-tampons', 'travaux-palette-erreurs-fr'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.classList.remove('u-hide');
        });
    }

    function afficherPalettesEval(fichier) {
        // Nettoyer les résidus de palettes eval existantes
        // (évite les doublons si fermerModeEvaluation a partiellement échoué)
        var _idsEval = ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'];
        var _panneauIds = ['travaux-eval-gauche', 'travaux-eval-droite', 'travaux-eval-retroaction'];
        var existantes = _idsEval.some(function(id) { return document.getElementById(id); });
        if (existantes) {
            // Remettre les panneaux dans le HTML statique avant de supprimer les wrappers
            var evalDiv = document.getElementById('evaluations-contenu-evaluation');
            for (var _i = 0; _i < _idsEval.length; _i++) {
                var _pal = document.getElementById(_idsEval[_i]);
                if (!_pal) continue;
                var _pan = document.getElementById(_panneauIds[_i]);
                if (_pan && evalDiv) {
                    _pan.classList.add('u-hide');
                    evalDiv.appendChild(_pan);
                }
                _pal.remove();
            }
        }

        const conteneurDoc = document.getElementById('travaux-conteneur-document');
        if (!conteneurDoc) return;
        const zoneCanvas = document.getElementById('travaux-zone-canvas') || conteneurDoc;

        // Creer les panneaux (source dans le HTML statique)
        const panneauGauche = document.getElementById('travaux-eval-gauche');
        const panneauDroite = document.getElementById('travaux-eval-droite');
        const panneauRetro = document.getElementById('travaux-eval-retroaction');

        if (!panneauGauche) console.warn('⚠️ [afficherPalettesEval] travaux-eval-gauche introuvable');
        if (!panneauDroite) console.warn('⚠️ [afficherPalettesEval] travaux-eval-droite introuvable');
        if (!panneauRetro) console.warn('⚠️ [afficherPalettesEval] travaux-eval-retroaction introuvable');
        if (!panneauGauche && !panneauDroite && !panneauRetro) {
            console.error('⚠️ [afficherPalettesEval] Aucun panneau source — DOM détruit ?');
            return;
        }

        // --- Palette Paramètres (flottante, top-left) ---
        const paletteG = panneauGauche ? creerPaletteEval('travaux-palette-eval-gauche', 'Paramètres', panneauGauche) : null;
        if (paletteG) {
            paletteG.style.top = '12px';
            paletteG.style.left = '12px';

            // Bouton cadenas compact dans la barre de titre
            const barreParam = paletteG.querySelector('.palette-flottante-barre');
            if (barreParam) {
                const btnGroup = barreParam.querySelector('div');
                poserBoutonVerrou(btnGroup || barreParam, !!btnGroup);
            }

            zoneCanvas.appendChild(paletteG);
        }

        // --- Palette Évaluation (flottante, right) ---
        const paletteD = panneauDroite ? creerPaletteEval('travaux-palette-eval-droite', 'Évaluation', panneauDroite) : null;
        if (paletteD) {
            paletteD.style.top = '12px';
            paletteD.style.right = '300px';
            paletteD.style.left = 'auto';
            zoneCanvas.appendChild(paletteD);
        }

        // --- Palette Rétroaction (flottante, far-right) ---
        const paletteR = panneauRetro ? creerPaletteEval('travaux-palette-eval-retro', 'Rétroaction', panneauRetro) : null;
        if (paletteR) {
            paletteR.style.top = '12px';
            paletteR.style.right = '12px';
            paletteR.style.left = 'auto';

            // Sous-barre (vues Générale/Spécifique/Bilan + « Copier tout ») et « Copier » dans le pied
            equiperRetroaction(paletteR.querySelector('.palette-flottante-contenu'));
            zoneCanvas.appendChild(paletteR);
        }

        // Configurer le drag pour chaque palette flottante
        if (paletteG) configurerDragPaletteEval('travaux-palette-eval-gauche');
        if (paletteD) configurerDragPaletteEval('travaux-palette-eval-droite');
        if (paletteR) configurerDragPaletteEval('travaux-palette-eval-retro');

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

        // Chantier F Cat-B (21 mai 2026) — pivot window.evaluationEnCours, selects
        // cachés (étudiant, production), et pré-sélection grille/échelle/cartouche
        // depuis la production : tout est encapsulé dans evaluation.demarrerEvaluation
        // DepuisFichier (evaluation-chargement.js). travaux-ui ne touche plus jamais
        // le pivot directement (sentinelle Vitest tests/unit/sentinelle-evaluation-en-cours.test.js).
        const productionIdEffective = (typeof window.demarrerEvaluationDepuisFichier === 'function')
            ? window.demarrerEvaluationDepuisFichier(fichier)
            : (fichier.productionId || '');

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

        // Injecter les compteurs d'erreurs après que la grille soit chargée
        setTimeout(function() {
            if (typeof travauxOutils !== 'undefined' && typeof travauxOutils.mettreAJourCompteursErreurs === 'function') {
                travauxOutils.mettreAJourCompteursErreurs();
            }
        }, 2000);

        // Attacher les événements de mémorisation pour persister les sélections
        if (typeof attacherEvenementsMemorisation === 'function') {
            attacherEvenementsMemorisation();
        }

        // Restaurer grille/échelle/cartouche si aucune évaluation existante ne les a remplis
        // Utilise selectionsCache (capturé avant le setup) pour éviter les valeurs écrasées
        // Délai suffisant pour que preRemplirEvaluation ait fini son chaînage
        setTimeout(() => {
            // #947 — la mémoire des derniers choix vient d'une AUTRE copie : elle ne pré-remplit
            // qu'une copie SANS évaluation. Sur une copie évaluée, ce qui est enregistré fait foi
            // (#939, #946) : une évaluation sans cartouche ou sans échelle reste sans, sinon
            // « Enregistrer », qui lit les menus, y écrivait celles de la mémoire.
            const copieEvaluee = typeof window._evaluationEnregistreeDeLaCopie === 'function'
                && !!window._evaluationEnregistreeDeLaCopie({ etudiantDA: fichier.etudiantDA, productionId: productionIdEffective });
            if (!selectionsCache || copieEvaluee) {
                // Rien à restaurer — débloquer la mémorisation quand même
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
                // #941 lot S1 — pas sous une grille entièrement en points : elle se note sans
                // échelle, et la mémoire des sélections en remettrait une d'office.
                const grilleEnPoints = typeof window.grilleSelectionneeEnPoints === 'function' && window.grilleSelectionneeEnPoints();
                if (selE && !selE.value && selectionsCache.echelle && !grilleEnPoints) {
                    selE.value = selectionsCache.echelle;
                }
                if (selC && !selC.value && selectionsCache.cartouche) {
                    window.poserCartoucheParChargeur(selC, selectionsCache.cartouche);   // #944 — pas le geste
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

    /**
     * Les outils de la rétroaction : vues Générale / Spécifique / Bilan, « Copier tout », et
     * « Copier » dans le pied (à côté de « Régénérer » et du compteur de mots). Posés sur la
     * palette Rétroaction du mode Évaluer ET sur le formulaire sans copie (#868, 15 sept.
     * 2026) — une seule fonction pour les deux.
     * Idempotente : elle ne retire que ce qu'elle a posé (`data-outil-eval`). Le nettoyage
     * d'avant retirait tout `.btn-copier-retro` — classe que porte aussi le bouton STATIQUE
     * « Régénérer » d'index.html : il disparaissait du mode Évaluer (mesuré le 15 sept.).
     * @param {HTMLElement|null} conteneur - la zone qui contient le panneau de rétroaction
     */
    function equiperRetroaction(conteneur) {
        if (!conteneur) return;
        conteneur.querySelectorAll('[data-outil-eval]').forEach(function(el) { el.remove(); });

        const sousBarre = document.createElement('div');
        sousBarre.className = 'retro-sous-barre';
        sousBarre.setAttribute('data-outil-eval', '');

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
        sousBarre.appendChild(radiosDiv);

        var spacer = document.createElement('span');
        spacer.style.flex = '1';
        sousBarre.appendChild(spacer);

        const btnCopierTout = document.createElement('button');
        btnCopierTout.className = 'btn btn-compact';
        btnCopierTout.textContent = 'Copier tout';
        btnCopierTout.title = 'Copier les 3 sections';
        btnCopierTout.style.cssText = 'font-size:10px; padding:2px 6px;';
        btnCopierTout.addEventListener('click', function() { copierToutRetroaction(); });
        sousBarre.appendChild(btnCopierTout);

        // Insérer en premier dans le contenu
        conteneur.insertBefore(sousBarre, conteneur.firstChild);

        const piedRetro = conteneur.querySelector('.eval-retro-pied');
        if (piedRetro) {
            const btnCopier = document.createElement('button');
            btnCopier.className = 'btn-copier-retro';
            btnCopier.setAttribute('data-outil-eval', '');
            btnCopier.textContent = 'Copier';
            btnCopier.title = 'Copier la section active';
            btnCopier.addEventListener('click', function() { copierRetroaction(1); });
            piedRetro.appendChild(btnCopier);
        }
    }

    /**
     * Le cadenas (verrouiller / déverrouiller l'évaluation). UN seul dans la page :
     * `btnVerrouPalette` est lu par `afficherOuMasquerBoutonVerrouillage` (evaluation.js),
     * qui le montre dès qu'une évaluation enregistrée est chargée.
     * @param {HTMLElement|null} parent
     * @param {boolean} enPremier - l'insérer en tête de `parent` plutôt qu'à la fin
     */
    function poserBoutonVerrou(parent, enPremier) {
        if (!parent) return;
        // Chercher l'ancien AUSSI dans l'arbre de `parent` : `creerPaletteEval` y a déjà déplacé le
        // panneau « Paramètres » — et le cadenas de son en-tête — avant d'insérer la palette dans la
        // page, où `getElementById` ne le voit pas encore (deux cadenas, mesuré le 15 sept.).
        const racine = parent.getRootNode();
        const anciens = new Set([document.getElementById('btnVerrouPalette')]);
        if (racine && racine !== document && racine.querySelectorAll) {
            racine.querySelectorAll('#btnVerrouPalette').forEach(function(b) { anciens.add(b); });
        }
        anciens.forEach(function(b) { if (b) b.remove(); });
        const btnVerrou = document.createElement('button');
        btnVerrou.id = 'btnVerrouPalette';
        btnVerrou.className = 'btn btn-compact';
        btnVerrou.title = 'Verrouiller/Déverrouiller l\'évaluation';
        btnVerrou.style.cssText = 'font-size:12px; padding:2px 6px; margin-right:4px; display:none;';
        btnVerrou.innerHTML = '<img src="icons/icon-open-lock.svg" alt="" class="btn-inline-icon">'; // security-ok: constante, aucune donnée
        btnVerrou.addEventListener('click', function() {
            if (typeof basculerVerrouillageEvaluationCourante === 'function') {
                basculerVerrouillageEvaluationCourante();
            }
        });
        if (enPremier) parent.insertBefore(btnVerrou, parent.firstChild);
        else parent.appendChild(btnVerrou);
    }

    /**
     * Le formulaire SANS copie reçoit les outils des palettes (#868) : le cadenas dans
     * l'en-tête « Paramètres », les outils de la rétroaction. Appelée par evaluation.js
     * (`_setupAffichagePanneauxModif`, chemin sans copie — « Évaluer » et « Consulter »).
     */
    function equiperFormulaireSansCopie() {
        const gauche = document.getElementById('travaux-eval-gauche');
        const enTete = gauche ? gauche.querySelector('.travaux-panneau-header') : null;
        if (enTete) {
            enTete.style.display = '';   // une palette l'a peut-être caché (creerPaletteEval)
            poserBoutonVerrou(enTete, false);
        }
        equiperRetroaction(document.getElementById('travaux-eval-retroaction'));
    }

    function masquerPalettesEval() {
        // Cacher les 3 palettes eval (sans détruire pour préserver l'état)
        ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('u-hide');
        });
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
            <span class="palette-flottante-titre"><span class="palette-grip" aria-hidden="true" title="Glisser pour déplacer">⠿</span>${echapperHtml(titre)}</span>
            <div style="display:flex; gap:2px;">
                <button class="palette-flottante-toggle" data-action="travauxOutils.layoutPaletteH" data-param="${id}" title="Disposition horizontale">\u2194</button>
                <button class="palette-flottante-toggle" data-action="travauxOutils.layoutPaletteV" data-param="${id}" title="Disposition verticale">\u2195</button>
                <button class="palette-flottante-toggle" data-action="travauxUI.togglePaletteEvalReplie" data-param="${id}" title="Replier/Déplier">&#x2212;</button>
            </div>
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
        const prodId = productionIdOverride || fichier.productionId;
        ecrireLabelsIdentite(fichier.etudiantDA, prodId);

        // Synchroniser le select production dans la toolbar
        if (prodId) {
            const select = document.querySelector('.annot-toolbar .travaux-filtre-production') ||
                           document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
            if (select && select.value !== prodId) {
                select.value = prodId;
                productionFiltreActive = prodId;
                sessionStorage.setItem('travaux-filtre-production', prodId);
                filtrerBadgesParProduction(select);
            }
        }
    }

    /**
     * Les étiquettes d'identité (élève, production) du formulaire et de la palette Annotation.
     * Séparée de `remplirLabelsIdentite` le 15 sept. 2026 (#868) : le formulaire sans copie
     * les écrit aussi, SANS synchroniser le filtre de la barre — geste qui peut ouvrir une
     * autre copie (voir `consulterEvaluation`, correctif du 5 mars 2026).
     * @param {string} etudiantDA
     * @param {string} prodId
     */
    function ecrireLabelsIdentite(etudiantDA, prodId) {
        const etudiant = travauxImport.trouverEtudiantParDA(etudiantDA);
        const productions = obtenirDonneesSelonMode('productions');
        const production = (productions && prodId) ? productions.find(p => p.id === prodId) : null;

        const labelEtud = document.getElementById('travaux-eval-label-etudiant');
        if (labelEtud) {
            labelEtud.textContent = etudiant
                ? `${etudiant.prenom} ${etudiant.nom} (${etudiant.daAffichage || etudiant.da})`
                : (etudiantDA || 'Non associé');
        }
        const labelProd = document.getElementById('travaux-eval-label-production');
        if (labelProd) {
            labelProd.textContent = production
                ? (production.titre || production.nom)
                : 'Non associée';
        }

        // Synchroniser les labels de la palette Annotation
        const labelAnnotEtud = document.getElementById('travaux-annot-label-etudiant');
        if (labelAnnotEtud) {
            labelAnnotEtud.textContent = labelEtud ? labelEtud.textContent : '--';
        }
        const labelAnnotProd = document.getElementById('travaux-annot-label-production');
        if (labelAnnotProd) {
            labelAnnotProd.textContent = labelProd ? labelProd.textContent : '--';
        }

        // Synchroniser le select production dans la toolbar
        if (prodId) {
            const select = document.querySelector('.annot-toolbar .travaux-filtre-production') ||
                           document.querySelector('#evaluations-contenu-fichiers .travaux-filtre-production');
            if (select && select.value !== prodId) {
                select.value = prodId;
                productionFiltreActive = prodId;
                sessionStorage.setItem('travaux-filtre-production', prodId);
                filtrerBadgesParProduction(select);
            }
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
    async function appliquerCorrectionIdentite() {
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

        const association = {};
        if (nouveauDA) association.etudiantDA = nouveauDA;
        if (nouveauProdId) association.productionId = nouveauProdId;

        // #932 (22 sept. 2026) — LE CINQUIÈME ÉCRIVAIN PASSE PAR LE GESTE UNIQUE. Cette
        // correction écrivait l'élève ET la production derrière la porte muette
        // d'avant #931 (« Remplacer ? », sans nommer les fichiers), puis
        // `reassocierFichier` nu. Elle attend maintenant le verdict de
        // `reassignerCopie` : sur refus, rien n'est écrit et le panneau reste ouvert.
        const ok = await reassignerCopie(fichier.id, association);
        if (!ok) {
            notifications.info('Réassignation annulée', 'La copie garde son étudiant·e et sa production.');
            return;
        }

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

        // Si le conteneur d'évaluation n'existe plus, le recréer
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

        // Remettre les panneaux dans leur conteneur d'origine et supprimer les palettes
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
        const layout = document.getElementById('travaux-zone-canvas') || document.getElementById('travaux-conteneur-document');
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
        // #936 — le bouton de repli, pas le premier de la barre (« ↔ »).
        const btn = palette.querySelector('[data-action="travauxUI.togglePaletteEvalReplie"]');
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
                    selectProduction.dispatchEvent(new Event('change', { bubbles: true }));

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
        var evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
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
                    <button id="travaux-split-btn-page-prec" class="btn-icon" data-action="travauxVisionneuse.pagePrecedente" disabled aria-label="Page précédente" title="Page précédente"><img src="icons/icon-chevron-left.svg" alt="" class="nav-seq-icon"></button>
                    <span id="travaux-indicateur-page">-- / --</span>
                    <button id="travaux-split-btn-page-suiv" class="btn-icon" data-action="travauxVisionneuse.pageSuivante" disabled aria-label="Page suivante" title="Page suivante"><img src="icons/icon-chevron-right.svg" alt="" class="nav-seq-icon"></button>
                    <button class="btn btn-petit" data-action="travauxAnnotation.basculerAnnotation">Annoter</button>
                    <button class="btn-icon" data-action="travauxUI.fermerVueCoteACote" title="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
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

            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
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
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
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
        // #572 — `new Date('2026-08-28')` est parsé en UTC par la spec, pas en
        // heure locale : à Toronto (UTC−4) la date devient le 27 août à 20 h, et
        // l'affichage recule d'un jour. La valeur vient d'un `input[type=date]`,
        // donc toujours en 'AAAA-MM-JJ'. Construite champ par champ, elle reste
        // le jour que l'utilisateur a choisi.
        queue[index].dateFichier = dateStr ? _dateLocaleDepuisAAAAMMJJ(dateStr) : null;
    }

    /**
     * #572 — Construit une Date à MINUIT LOCAL depuis 'AAAA-MM-JJ'.
     * Le constructeur à trois arguments interprète en heure locale, contrairement
     * au parsing d'une chaîne ISO seule.
     * @param {string} aaaammjj - date au format 'AAAA-MM-JJ'
     * @returns {Date|null} la date locale, ou null si le format n'est pas reconnu
     */
    function _dateLocaleDepuisAAAAMMJJ(aaaammjj) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(aaaammjj));
        if (!m) return new Date(aaaammjj); // format inattendu : comportement d'origine
        return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
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
            queue[index].productionIdParFichier = false;
            rafraichirPipelineUI();
            return;
        }

        queue[index].productionId = productionId;
        queue[index].productionIdParLea = false;
        // #313 : marquer le choix par-fichier (protégé du sélecteur global) ;
        // revenir à « — » (valeur vide) rend la main au global/parseLea.
        queue[index].productionIdParFichier = !!productionId;
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
                        <button class="editeur-page-btn" data-stop data-action="travauxUI.monterPageEditeur" data-param="${index}" ${index === 0 ? 'disabled' : ''} title="Monter"><img src="icons/icon-chevron-up.svg" alt="" class="editeur-page-icon"></button>
                        <button class="editeur-page-btn" data-stop data-action="travauxUI.descendrePageEditeur" data-param="${index}" ${index === editionPages.length - 1 ? 'disabled' : ''} title="Descendre"><img src="icons/icon-chevron-down.svg" alt="" class="editeur-page-icon"></button>
                        <button class="editeur-page-btn" data-stop data-action="travauxUI.pivoterPageEditeur" data-param="${index}" title="Pivoter 90°"><img src="icons/icon-rotate.svg" alt="" class="editeur-page-icon"></button>
                        <button class="editeur-page-btn editeur-page-btn-supprimer" data-stop data-action="travauxUI.supprimerPageEditeur" data-param="${index}" title="Supprimer" ${editionPages.length <= 1 ? 'disabled' : ''}><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
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
     * Ajoute des pages depuis un sélecteur de fichier. Passe par le poste de
     * préparation plein écran (travauxPreparation) en mode ad-hoc pour permettre
     * à l'utilisateur d'appliquer rotation, recadrage, perspective, balance des
     * blancs, exposition, niveaux de gris, DPI, etc. AVANT que les pages soient
     * insérées dans l'éditeur.
     *
     * UX :
     * 1. Sélection des fichiers (PDF + images, multiple)
     * 2. Les PDF sont décomposés en images (1 fichier ad-hoc par page)
     * 3. La palette de prep s'ouvre plein écran
     * 4. Confirmer → pages traitées insérées dans l'éditeur
     *    Passer → pages originales insérées (sans prep)
     *    X (fermer) → aucune page insérée (abandon)
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

            // Étape 1 : préparer les fichiers ad-hoc (PDF décomposé en pages images)
            const fichiersAdHoc = [];
            for (const fichier of input.files) {
                if (fichier.type === 'application/pdf') {
                    try {
                        const arrayBuffer = await fichier.arrayBuffer();
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        const nomBase = (fichier.name || 'document').replace(/\.pdf$/i, '');
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const pageData = await rendrePagePDF(pdf, i);
                            fichiersAdHoc.push({
                                fichier: pageData.blob,
                                nomFichier: nomBase + ' - page ' + i + '.jpg',
                                typeMIME: 'image/jpeg',
                                tailleFichier: pageData.blob.size,
                                estImage: true,
                                estPDF: false,
                                largeurOriginale: pageData.largeur,
                                hauteurOriginale: pageData.hauteur,
                                statut: 'en-attente',
                                parseLea: { nom: '', da: '', nomProduction: '', dateRemise: null, raw: '' },
                                pipelineStatut: 'a-optimiser',
                                groupeDocumentId: ''
                            });
                        }
                    } catch (e) {
                        console.error('[Editeur Pages] Erreur décomposition PDF:', e);
                    }
                } else if (fichier.type.startsWith('image/')) {
                    fichiersAdHoc.push({
                        fichier: fichier,
                        nomFichier: fichier.name,
                        typeMIME: fichier.type,
                        tailleFichier: fichier.size,
                        estImage: true,
                        estPDF: false,
                        statut: 'en-attente',
                        parseLea: { nom: '', da: '', nomProduction: '', dateRemise: null, raw: '' },
                        pipelineStatut: 'a-optimiser',
                        groupeDocumentId: ''
                    });
                }
            }

            input.remove();

            if (fichiersAdHoc.length === 0) return;

            // Étape 2 : ouvrir la palette de prep en mode ad-hoc (offset = -1)
            if (typeof travauxPreparation === 'undefined' ||
                typeof travauxPreparation.ouvrir !== 'function') {
                console.warn('[Editeur Pages] travauxPreparation indisponible, ajout direct sans prep');
                await _insererFichiersTraitesDansEditeur(fichiersAdHoc);
                return;
            }

            travauxPreparation.ouvrir(fichiersAdHoc, async (fichiersTraites) => {
                if (!fichiersTraites || fichiersTraites.length === 0) return;
                await _insererFichiersTraitesDansEditeur(fichiersTraites);
            }, -1);
        });

        input.click();
    }

    /**
     * Convertit chaque fichier traité en page (blob + dataUrl + dimensions) et
     * l'insère dans `editionPages`. Utilise `f.blobTraite` si présent (issu du
     * prep), sinon `f.fichier` (blob original — cas du « Passer » ou pas d'op).
     */
    async function _insererFichiersTraitesDansEditeur(fichiersTraites) {
        for (const f of fichiersTraites) {
            const blobFinal = f.blobTraite || f.fichier;
            if (!blobFinal) continue;

            try {
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blobFinal);
                });
                const dims = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve({ width: img.width, height: img.height });
                    img.onerror = reject;
                    img.src = dataUrl;
                });
                editionPages.push({
                    pageNum: editionPages.length + 1,
                    blob: blobFinal,
                    dataUrl: dataUrl,
                    largeur: dims.width,
                    hauteur: dims.height
                });
            } catch (e) {
                console.error('[Editeur Pages] Erreur insertion page:', e);
            }
        }
        renderEditeurPages();
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

            // Mettre a jour les metadonnees — si c'etait une image, ca devient un PDF.
            // La nouvelle thumbnail est stockée en IDB (pas dans les métadonnées).
            const modifications = {
                nombrePages: editionPages.length,
                tailleFichier: nouveauBlob.size,
                typeMIME: 'application/pdf',
                dateModification: new Date().toISOString()
            };
            if (thumbnailDataUrl && typeof travauxStockage.stockerThumbnail === 'function') {
                travauxStockage.stockerThumbnail(editionFichierId, thumbnailDataUrl);
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
            const message = estFusion
                ? 'Fichiers fusionnés (' + nbPages + ' pages)'
                : 'Document mis à jour (' + nbPages + ' pages)';
            notifications.succes(message);
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
                    var prods = obtenirDonneesSelonMode('productions') || [];
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
                <button class="modal-fermer" data-action="travauxUI.fermerModalFusionEditeur" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
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
                    <input type="checkbox" class="fusion-fichier-check" value="${echapperHtml(f.id)}" data-on-change="travauxUI.majCompteurFusion">
                    ${thumb}
                    <div class="fusion-fichier-info">
                        <span class="fusion-fichier-nom">${echapperHtml(typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : (f.nomFichier || 'Document'))}</span>
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

            notifications.succes(idsSelectionnes.length + ' document(s) ajouté(s) à la fusion');
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
     * Supprime un fichier (déplacement en corbeille) depuis un badge dans la
     * grille d'Archivage. Réutilise la modale de confirmation existante de
     * liste-evaluations.js qui rafraîchit aussi Archivage si visible.
     * @param {string} fichierId - ID du fichier à supprimer
     */
    function supprimerFichierBadge(fichierId) {
        const fichier = travauxStockage.obtenirFichierParId(fichierId);
        if (!fichier) return;
        if (typeof window.confirmerSuppressionFichier === 'function') {
            window.confirmerSuppressionFichier(fichierId, fichier.etudiantDA);
        } else {
            console.warn('[Travaux-UI] confirmerSuppressionFichier indisponible');
        }
    }

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
                // ⚠ #672 — TABLEAU DE RÉVISION, côté enseignant·e. Même remarque qu'à
                // `travaux-export-pdf.js` : une évaluation enregistrée avant le
                // 1er septembre 2026 en mode simple porte l'amorce du gabarit dans
                // `c.retroaction`. Le PDF remis à l'élève est rattrapé par la garde
                // d'amorces de `synthese-retroaction-data.js` ; cet extrait ne l'est pas,
                // et c'est assumé — il ne sort pas de l'écran de l'enseignant·e.
                // ✅ ANONYMISATION (Tier 0.3) : anonymiser les prénoms dans les rétroactions
                const retroTexte = typeof anonymiserTexteRetroaction === 'function'
                    ? anonymiserTexteRetroaction(c.retroaction || '', evaluation.etudiantDA)
                    : (c.retroaction || '');
                const extrait = retroTexte ? echapperHtml(retroTexte.substring(0, 120)) : '';
                return `<li>
                    <strong>${echapperHtml(c.critereNom || '')}</strong>
                    <span class="niveau">${echapperHtml((typeof c.points === 'number') ? `${c.points} / ${c.ponderation}` : (c.niveauSelectionne || '—'))}</span>
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
            // Lot N1b (21 sept. 2026) : l'entrée que rend LA désignation ; sans pratique, note complète.
            const pratiqueActive = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive().donnees : null;
            if (pratiqueActive?.affichageNote === 'lettre') modeNote = 'lettre';
        } catch(e) { console.warn('[Travaux-UI] pratique affichageNote fallback:', e.message || e); }

        // #941 lot S1 (décision A) — une copie en points : sa note, jamais un niveau ; ses critères
        // par leurs points (ci-dessus), pas par le niveau déduit.
        const enPoints = typeof evaluationEnPoints === 'function' && evaluationEnPoints(evaluation);
        const noteTexte = evaluation.noteFinale != null ? evaluation.noteFinale + '%' : '—';
        let noteHTML;
        if (enPoints) {
            noteHTML = `Note : <strong>${noteTexte}</strong>`;
        } else if (modeNote === 'lettre') {
            noteHTML = `Niveau : <strong>${echapperHtml(evaluation.niveauFinal || '—')}</strong>`;
        } else {
            noteHTML = `Note : <strong>${noteTexte}</strong> &nbsp;|&nbsp; Niveau : <strong>${echapperHtml(evaluation.niveauFinal || '—')}</strong>`;
        }

        // Construire le modal
        const html = `
        <div class="modal-overlay actif" id="travaux-modal-retroaction" data-close-on-bg="travauxUI.fermerModalRetroaction">
            <div class="modal-contenu" style="max-width: 620px;">
                <button class="modal-fermer" data-action="travauxUI.fermerModalRetroaction" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                <h3 class="modal-titre">Rétroaction — ${nomEtudiant}</h3>

                <div class="travaux-retro-entete">
                    <div>Production : <strong>${echapperHtml(evaluation.productionNom || '—')}</strong></div>
                    <div>Grille : <strong>${echapperHtml(evaluation.grilleNom || '—')}</strong></div>
                    <div>${noteHTML}</div>
                </div>

                ${criteresHTML}

                <h4 style="margin: 12px 0 4px;">Rétroaction globale</h4>
                <textarea id="travaux-modal-retro-texte" class="travaux-retro-textarea">${echapperHtml(typeof anonymiserTexteRetroaction === 'function' ? anonymiserTexteRetroaction(evaluation.retroactionFinale || '', evaluation.etudiantDA) : (evaluation.retroactionFinale || ''))}</textarea>

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
        // Lecture brute, comme la suppression plus haut : la lecture anonymisée et filtrée par
        // cours réécrivait « Gr. A », les marqueurs d'anonymisation, et perdait les évaluations
        // des autres cours. Le texte de la zone, lui, passe par la garde de `modes.js`.
        let evaluations = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const index = evaluations.findIndex(e => e.id === evalTrouvee.id);

        if (index === -1) return;

        evaluations[index].retroactionFinale = textarea.value;
        // #961 (D7) — un texte retouché ici est réécrit à la main : il ne suit plus les niveaux.
        // C1 (contre-vérification de Cowork) — sans retouche, la clé n'est pas écrite : une
        // évaluation d'avant D7 garde sa question (« Garder la mienne » / « Remplacer »).
        if (textarea.value !== textarea.defaultValue) evaluations[index].retroactionReecrite = true;
        evaluations[index].dateModification = new Date().toISOString();
        // Lot B de l'enregistrement : l'échec est dit par le témoin commun, avec le geste.
        // Relecture de Cowork (lot B, R3) : sur un échec, la fenêtre RESTE ouverte — fermée,
        // elle emportait le texte qu'on venait d'écrire pendant que le témoin disait « Non enregistré ».
        if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations,
            { geste: 'Enregistrement de la rétroaction' }) !== true) return;

        fermerModalRetroaction();
        notifications.succes('Rétroaction sauvegardée');
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
        const enseignants = db.getSync('enseignants', []);
        const horaires = db.getSync(cle('horaires'), []);

        const groupesCibles = groupesCours
            .filter(gc => gc.id !== gcActifId)
            .map(gc => {
                const coursInfo = cours.find(c => c.id === gc.coursId) || {};
                const ens = enseignants.find(e => e.id === gc.enseignantId) || {};
                const sigle = coursInfo.codeCours || coursInfo.code || coursInfo.sigle || (coursInfo.nature === 'service' ? coursInfo.nomCours : null);
                const groupe = gc.groupeNum || '00001';
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
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
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

            return { id: f.id, nom: typeof anonymiserNomFichier === 'function' ? anonymiserNomFichier(f.nomFichier, f.etudiantDA) : f.nomFichier, etudiant: nomEtudiant, statut: statut };
        });

        // Construire la modale
        const optionsGroupes = groupesCibles.map(g =>
            `<option value="${echapperHtml(g.id)}" data-cours-id="${echapperHtml(g.coursId)}">${echapperHtml(g.label)}</option>`
        ).join('');

        const lignesHTML = lignesFichiers.map(f => `
            <label class="transfert-fichier-ligne">
                <input type="checkbox" value="${echapperHtml(f.id)}" class="transfert-checkbox-fichier">
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
                <button class="modal-fermer" data-action="fermerOverlayParent" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
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
        notifications.succes(`${nb} fichier(s) transféré(s) vers le groupe cible`);

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

    /** Re-importer le fichier actuellement ouvert dans la visionneuse */
    function reimporterFichierActuel() {
        var fichier = travauxVisionneuse.getFichierActuel();
        if (fichier && fichier.id) reimporterFichier(fichier.id);
    }

    /**
     * Changer la production d'un fichier depuis le tableau (onchange select).
     * #932 (22 sept. 2026) — LE MENU SUIT LE VERDICT. Le geste n'était pas attendu :
     * sur un « Annuler » à la porte, le menu affichait la nouvelle production alors
     * que rien n'avait changé. Il revient maintenant à l'ancienne.
     */
    async function changerProductionFichierDepuisTableau(el) {
        var fichierId = el.dataset.fichierId;
        var value = el.value;
        var row = el.closest('tr');
        var fichier = (typeof travauxStockage.obtenirFichierParId === 'function') ? travauxStockage.obtenirFichierParId(fichierId) : null;
        var ancienne = row ? (row.dataset.productionId || '') : ((fichier && fichier.productionId) || '');
        var ok = await reassignerCopie(fichierId, { productionId: value });
        if (ok) {
            if (row) row.dataset.productionId = value;
        } else {
            el.value = ancienne;
        }
    }

    /* ===============================
       PLEIN ÉCRAN + COULEUR DE FOND CANVAS
       =============================== */

    var _pleinEcranActif = false;

    function togglePleinEcran() {
        var zone = document.getElementById('travaux-conteneur-document');
        if (!zone) return;
        _pleinEcranActif = !_pleinEcranActif;
        zone.classList.toggle('travaux-plein-ecran', _pleinEcranActif);
        document.body.classList.toggle('travaux-plein-ecran-actif', _pleinEcranActif);
        var btn = document.getElementById('travaux-btn-plein-ecran');
        if (btn) {
            btn.innerHTML = _pleinEcranActif ? '<img src="icons/icon-collapse.svg" alt="" class="nav-seq-icon">' : '<img src="icons/icon-fit-to-width.svg" alt="" class="nav-seq-icon">';
            btn.title = _pleinEcranActif ? 'Quitter le plein \u00e9cran' : 'Plein \u00e9cran';
        }
    }

    // Échap pour quitter le plein écran
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && _pleinEcranActif) {
            togglePleinEcran();
        }
    });

    /**
     * Pastilles de fond, dans le menu Actions depuis le retour testeur du 23 sept. 2026.
     * Le clic sur une pastille ne remonte pas au menu : il reste ouvert pour comparer.
     */
    function initialiserFondCanvas() {
        var pastilles = document.getElementById('travaux-fond-swatches');
        if (!pastilles) return;

        pastilles.addEventListener('click', function(e) {
            e.stopPropagation();
            var swatch = e.target.closest('[data-fond]');
            if (!swatch) return;
            var couleur = swatch.dataset.fond;
            var conteneur = document.getElementById('travaux-canvas-container');
            if (conteneur) {
                if (couleur) {
                    conteneur.style.background = couleur;
                } else {
                    // « Défaut » : remettre sur la variable CSS du thème
                    conteneur.style.background = '';
                }
            }
            db.setSync('travaux-fond-canvas', couleur);
        });

        // Restaurer la couleur sauvegardée
        var fondSauve = db.getSync('travaux-fond-canvas', null);
        if (fondSauve) {
            var conteneur = document.getElementById('travaux-canvas-container');
            if (conteneur) conteneur.style.background = fondSauve;
        }
    }

    /* ===============================
       ACCÈS RAPIDE AU PROFIL ÉTUDIANT
       =============================== */

    function ouvrirProfilDepuisAnnotation() {
        var fichier = travauxVisionneuse.getFichierActuel();
        var da = fichier ? fichier.etudiantDA : null;
        if (!da) {
            console.warn('[travaux-ui] Aucun DA associé au fichier courant');
            return;
        }
        if (typeof window.afficherProfilComplet === 'function') {
            window.naviguerVers('suivi', 'profil');
            setTimeout(function() { window.afficherProfilComplet(da); }, 200);
        }
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxUI = {
        initialiser: initialiserModuleTravaux,
        // #608 — exposés pour la sentinelle. Le souligné dit « pas une API » :
        // les deux points de décision de la chaîne « jeton de reprise » sont
        // enfouis dans une modale et dans un balayage post-import, que Vitest ne
        // peut atteindre autrement.
        _jetonRepriseOffrable: _jetonRepriseOffrable,
        _appliquerJetonsReprisePostImport: appliquerJetonsReprisePostImport,
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
        associerProductionGlobale: associerProductionGlobale,
        renommerDoublon: renommerDoublon,
        associerJetonProduction: associerJetonProduction,
        changerJetonProductionPipeline: changerJetonProductionPipeline,
        identifierAutoPipeline: identifierAutoPipeline,
        rafraichirPipelineUI: rafraichirPipelineUI,
        // Archivage
        lancerArchivage: lancerArchivage,
        arreterArchivage: arreterArchivage,
        lancerExportLea: lancerExportLea,
        mettreAJourCompteurLea: mettreAJourCompteurLea,
        // Annotation → Evaluation
        evaluerDepuisAnnotation: evaluerDepuisAnnotation,
        basculerMode: basculerMode,
        getModeCourant: function() { return modeCourant; },
        fermerModeEvaluation: fermerModeEvaluation,
        equiperFormulaireSansCopie: equiperFormulaireSansCopie,   // #868 — evaluation.js, chemin sans copie
        ecrireLabelsIdentite: ecrireLabelsIdentite,               // #868 — idem
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
        reimporterFichier: reimporterFichier,
        // Chrono évaluation
        demarrerChrono: demarrerChrono,
        arreterChrono: arreterChrono,
        pauserChrono: pauserChrono,
        reprendreChrono: reprendreChrono,
        togglePauseChrono: togglePauseChrono,
        getDureeMs: getDureeMs,
        resetChrono: resetChrono,
        // Réassignation d'une copie (#932) — le seul chemin d'écriture de l'association
        reassignerCopie: reassignerCopie,
        mesurerReassignation: mesurerReassignation,
        ecrireReassignation: ecrireReassignation,
        // Filtre production (appelé depuis liste-evaluations pour pré-sélectionner)
        setProductionFiltre: function(prodId) {
            productionFiltreActive = prodId || '';
            sessionStorage.setItem('travaux-filtre-production', productionFiltreActive);
        },
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
        supprimerFichierBadge: supprimerFichierBadge,
        sauvegarderRetroactionDepuisModal: sauvegarderRetroactionDepuisModal,
        fermerModalRetroaction: fermerModalRetroaction,
        // Transfert entre groupes
        ouvrirModalTransfert: ouvrirModalTransfert,
        // Layout annotation ancré
        creerLayoutAnnotation: creerLayoutAnnotation,
        detruireLayoutAnnotation: detruireLayoutAnnotation,
        // Wrappers délégation (Phase 5)
        annulerImport: annulerImport,
        reimporterFichierActuel: reimporterFichierActuel,
        changerProductionFichierDepuisTableau: changerProductionFichierDepuisTableau,
        // Plein écran + fond canvas
        togglePleinEcran: togglePleinEcran,
        initialiserFondCanvas: initialiserFondCanvas,
        // Profil rapide
        ouvrirProfilDepuisAnnotation: ouvrirProfilDepuisAnnotation
    };

    // Accès direct pour data-action
    window.ouvrirProfilDepuisAnnotation = ouvrirProfilDepuisAnnotation;

    // Alias pour navigation.js
    window.initialiserModuleTravaux = initialiserModuleTravaux;

})();
