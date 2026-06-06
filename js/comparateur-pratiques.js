/* ============================================================
   COMPARATEUR DE PRATIQUES — lot C1-a (squelette + garde démo)
   ------------------------------------------------------------
   Vue d'aide au choix d'une pratique de notation. Montre, sur des
   profils-types contrastés, la maîtrise en regard de chaque note —
   pour sortir du paradigme du cumul (la note = reflet de la maîtrise
   en fin de parcours, pas un score additionné).

   Spec : plans de travail/SPEC_comparateur_pratiques.md (§3.1 matrice,
          §1 bis finalité, §3.4 garde démo)
   Conception C1 : plans de travail/NOTE-CONCEPTION-C1-comparateur.md
                   (design validé avec Grégoire le 6 juin 2026)

   PÉRIMÈTRE DE CE LOT (C1-a) : squelette du module, conteneur,
   ouverture/fermeture (focus SPA, Échap, clic extérieur) et la
   GARDE DÉMO. La matrice elle-même (4 profils, colonnes, colonne
   « Niveau atteint », deltas, en-têtes E1) arrive en C1-b.

   API publique (dispatcher data-action de main.js) :
   - ouvrirComparateurPratiques()
   - fermerComparateurPratiques()

   Panneau : #comparateur-pratiques-panel (index.html), construit
   dynamiquement à l'ouverture, vidé à la fermeture.

   Sécurité : contenu 100 % statique défini dans ce fichier — aucune
   donnée utilisateur injectée (même statut que guides-pedagogiques.js).
   Lecture seule absolue côté moteur : ce module n'écrit jamais de
   données (ni clés réelles, ni demo_*).
   ============================================================ */

(function() {

    /* ── État interne ─────────────────────────────────────── */
    var _focusAvantOuverture = null;
    var _ouvert = false;
    // Candidates simulées sélectionnées (1-2 ids), réinitialisées à la fermeture.
    // null = pas encore initialisé → défauts calculés à l'ouverture (C1-d).
    var _candidatsSel = null;

    // Profils-types étiquetés en dur (§8 de la note de conception) : stables et
    // racontables, pas de détection dynamique. DA du namespace démo (DEMO0xx).
    var PROFILS = [
        { da: 'DEMO010', label: 'Fort' },
        { da: 'DEMO013', label: 'Moyen' },
        { da: 'DEMO004', label: 'En difficulté' },
        { da: 'DEMO011', label: 'Irrégulier' }
    ];

    // E1 — « ce que cette note mesure » : une ligne fixe par FAMILLE (indexée par
    // le code du registre, pas par l'id de pratique), sous le nom + badge (§5).
    // Formulations de départ (SPEC §3.1) — à valider en terrain avec Grégoire.
    // DEN à ajouter quand la famille sera créable (#318).
    var MICROCOPY_E1 = {
        SOM: 'La moyenne pondérée des performances, chacune comptée une fois, au moment où elle a eu lieu.',
        STD: 'Le niveau de maîtrise démontré — les reprises remplacent les premiers essais.',
        SPE: 'Les exigences satisfaites parmi celles annoncées.'
    };

    // Ligne de garde sous la matrice (§2.1) : recentre le novice issu de SOM —
    // ni le chiffre le plus élevé ni l'écart ne sont l'enjeu (pluralisme, pas de
    // palmarès). Formulation à valider en terrain.
    var LIGNE_GARDE = 'Il ne s’agit pas d’un palmarès des pratiques de notation.';

    function estEnDemo() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    /* ════════════════════════════════════════════════════════
       MOTEUR (consommation seule — aucune écriture)
       ════════════════════════════════════════════════════════ */

    // Productions / évaluations selon le mode (démo ou réel) + échelles globales.
    function _donnees() {
        var lire = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode
            : function() { return []; };
        return {
            productions: lire('productions') || [],
            evaluations: lire('evaluationsSauvegardees') || [],
            echelles: (typeof db !== 'undefined') ? (db.getSync('echellesTemplates', []) || []) : []
        };
    }

    function _echelle(echelleId, echelles) {
        if (!echelleId) return null;
        for (var i = 0; i < echelles.length; i++) {
            if (echelles[i].id === echelleId) return echelles[i];
        }
        return null;
    }

    // Rang d'un niveau = son index dans l'échelle triée (jamais une valeur IDME
    // codée en dur — l'outil est pluraliste, §3 de la note).
    function _rang(echelle, code) {
        if (!echelle || !echelle.niveaux) return -1;
        for (var i = 0; i < echelle.niveaux.length; i++) {
            if (echelle.niveaux[i].code === code) return i;
        }
        return -1;
    }

    // Évaluations recevables d'un profil portant un niveau, triées par date.
    function _evalsProfil(da, evaluations) {
        return evaluations.filter(function(e) {
            if (e.etudiantDA !== da) return false;
            if (e.remplaceeParId) return false;
            if (e.niveauFinal === null || e.niveauFinal === undefined || e.niveauFinal === '') return false;
            var st = e.statutIntegrite || 'recevable';
            if (st === 'plagiat' || st === 'ia') return false;
            return true;
        }).sort(function(a, b) {
            return new Date(a.dateEvaluation) - new Date(b.dateEvaluation);
        });
    }

    // Seuils de tendance (proposition §12.3, à valider en terrain).
    function _tendance(delta) {
        if (delta >= 2)  return { fleche: '↗↗', mot: 'forte progression' };
        if (delta === 1) return { fleche: '↗',  mot: 'progression' };
        if (delta <= -1) return { fleche: '↘',  mot: 'recul' };
        return { fleche: '→', mot: 'stable' };
    }

    // Colonne « Niveau atteint » : niveau de fin de parcours (production
    // terminale, sinon dernière éval datée — §4 + repli §12.2), traduit via
    // l'ÉCHELLE de la grille (libellé + description SOLO au survol), + tendance.
    function _niveauAtteint(da, d) {
        var evals = _evalsProfil(da, d.evaluations);
        if (!evals.length) return null;

        var terminale = null;
        for (var i = 0; i < d.productions.length; i++) {
            if (d.productions[i].type === 'terminale') { terminale = d.productions[i]; break; }
        }
        var evalFin = null;
        if (terminale) {
            var fins = evals.filter(function(e) { return e.productionId === terminale.id; });
            evalFin = fins.length ? fins[fins.length - 1] : null;
        }
        if (!evalFin) evalFin = evals[evals.length - 1];   // repli : dernière éval datée

        var echelle = _echelle(evalFin.echelleId, d.echelles);
        var niveau = null;
        if (echelle && echelle.niveaux) {
            for (var j = 0; j < echelle.niveaux.length; j++) {
                if (echelle.niveaux[j].code === evalFin.niveauFinal) { niveau = echelle.niveaux[j]; break; }
            }
        }
        var delta = _rang(echelle, evalFin.niveauFinal) - _rang(echelle, evals[0].niveauFinal);
        return {
            label: niveau ? niveau.nom : evalFin.niveauFinal,
            description: (niveau && niveau.description) ? niveau.description : '',
            tendance: _tendance(delta)
        };
    }

    // Code court de famille (SOM/STD/SPE) — strict d'abord (familles codées),
    // sinon via l'instance (pratiques configurables : dérive de configuration.type).
    function _codePratique(id) {
        if (typeof obtenirRepresentationPratiqueStricte === 'function') {
            var r = obtenirRepresentationPratiqueStricte(id);
            if (r && r.code) return r.code;
        }
        var inst = (typeof obtenirPratiqueParId === 'function') ? obtenirPratiqueParId(id) : null;
        return (inst && typeof inst.obtenirCode === 'function') ? inst.obtenirCode() : null;
    }

    // Badge construit depuis le CODE réel (genererBadgePratiqueHTML retombe sur STD
    // par défaut pour un id configurable non mappé — à ne pas réutiliser ici).
    function _badge(id) {
        var code = _codePratique(id);
        if (!code) return '';
        var c = code.toLowerCase();
        return '<span class="badge-type-pratique badge-type-' + c + '">' + code + '</span>';
    }

    function _configsPratiques() {
        var ns = (typeof cle === 'function') ? db.getSync(cle('pratiquesConfigurables'), null) : null;
        return ns || db.getSync('pratiquesConfigurables', []) || [];
    }

    function _nomPratique(id) {
        var cfg = _configsPratiques().filter(function(p) { return p.id === id; })[0];
        if (cfg && cfg.nom) return cfg.nom;
        var inst = (typeof obtenirPratiqueParId === 'function') ? obtenirPratiqueParId(id) : null;
        if (inst && inst.nom) return inst.nom;
        if (typeof obtenirRepresentationPratique === 'function') {
            var r = obtenirRepresentationPratique(id);
            if (r && r.famille) return r.famille;
        }
        return id;
    }

    // Colonnes : référence = pratique active (« Ta pratique ») + simulations
    // SOM (famille codée) et SPE (1ʳᵉ configurable de famille SPE ≠ réf).
    // La sélection inline des candidates arrive en C1-d.
    // Référence = pratique active du groupe-cours (« Ta pratique »).
    function _refId() {
        return (typeof obtenirPratiqueActiveGroupeCours === 'function' && obtenirPratiqueActiveGroupeCours())
            || (window.PRATIQUE_DEFAUT || 'standards');
    }

    // Pratiques SIMULABLES disponibles pour les sélecteurs (C1-d) : familles
    // codées (SOM/STD/SPE actives) + pratiques configurables de la bibliothèque,
    // hors référence. Les gabarits prédéfinis sont EXCLUS : non exécutables tels
    // quels (skill §3/§10) — ils donneraient « — ». À revoir si on synthétise
    // une config à la volée (hors C1).
    function _pratiquesDisponibles(refId) {
        var vues = {};
        var liste = [];
        function ajouter(id) {
            if (!id || id === refId || vues[id]) return;
            var code = _codePratique(id);
            if (!code) return;                 // non résoluble → on n'offre pas
            vues[id] = true;
            liste.push({ id: id, nom: _nomPratique(id), code: code });
        }
        ['sommative', 'standards', 'specifications'].forEach(ajouter);
        _configsPratiques().forEach(function(p) { ajouter(p.id); });
        return liste;
    }

    // Défauts des candidates : SOM (famille codée) + 1ʳᵉ SPE configurable ≠ réf.
    function _initCandidats(refId) {
        if (_candidatsSel) return;
        var sel = [];
        if (refId !== 'sommative') sel.push('sommative');
        var spe = _configsPratiques().filter(function(p) {
            return p.id !== refId && _codePratique(p.id) === 'SPE';
        })[0];
        if (spe) sel.push(spe.id);
        // Repli : au moins une simulation si rien trouvé.
        if (!sel.length) {
            var dispo = _pratiquesDisponibles(refId);
            if (dispo.length) sel.push(dispo[0].id);
        }
        _candidatsSel = sel;
    }

    function _colonnes() {
        var refId = _refId();
        _initCandidats(refId);
        var cols = [{ id: refId, ref: true }];
        _candidatsSel.forEach(function(id) {
            if (id) cols.push({ id: id, ref: false });
        });
        return cols;
    }

    // Note finale simulée (0-100), lecture seule. null si non calculable.
    function _note(da, pratiqueId) {
        if (typeof simulerIndices !== 'function') return null;
        var r = simulerIndices(da, pratiqueId);
        return r ? r.P : null;
    }

    function _esc(s) {
        return (typeof echapperHtml === 'function') ? echapperHtml(String(s)) : String(s);
    }

    /* ── Rendu de la matrice (§3 du layout) ────────────────── */
    function _rendreMatrice() {
        var d = _donnees();
        var cols = _colonnes();
        var refId = cols[0].id;

        var h = '<table class="comparateur-matrice-table">';
        h += '<thead><tr>';
        h += '<th scope="col" class="comparateur-col-profil">Profil</th>';
        h += '<th scope="col" class="comparateur-col-niveau">Niveau atteint</th>';
        cols.forEach(function(c) {
            var code = _codePratique(c.id);
            var e1 = (code && MICROCOPY_E1[code]) ? MICROCOPY_E1[code] : '';
            h += '<th scope="col" class="comparateur-col-pratique' + (c.ref ? ' comparateur-col-pratique--ref' : '') + '">'
                + _badge(c.id) + ' <span class="comparateur-col-nom">' + _esc(_nomPratique(c.id)) + '</span>'
                + '<span class="comparateur-col-tag">' + (c.ref ? 'Ta pratique' : 'simulation') + '</span>'
                + (e1 ? '<span class="comparateur-col-e1">' + _esc(e1) + '</span>' : '')
                + '</th>';
        });
        h += '</tr></thead><tbody>';

        PROFILS.forEach(function(prof) {
            var na = _niveauAtteint(prof.da, d);
            var pRef = _note(prof.da, refId);
            h += '<tr>';
            h += '<th scope="row" class="comparateur-col-profil">' + _esc(prof.label) + '</th>';

            if (na) {
                var titre = na.description ? _esc(na.label + ' · ' + na.description) : _esc(na.label);
                // aria-label : la description du niveau (SOLO au survol) est aussi
                // restituée au lecteur d'écran, pas seulement à la souris (§9).
                var aria = na.label + (na.description ? ', ' + na.description : '') + ', ' + na.tendance.mot;
                h += '<td class="comparateur-col-niveau" title="' + titre + '" aria-label="' + _esc(aria) + '">'
                    + _esc(na.label)
                    + ' <span class="comparateur-tendance" aria-hidden="true">' + na.tendance.fleche + '</span>'
                    + '</td>';
            } else {
                h += '<td class="comparateur-col-niveau comparateur-vide">—</td>';
            }

            cols.forEach(function(c) {
                var p = _note(prof.da, c.id);
                if (p === null) {
                    h += '<td class="comparateur-cellule comparateur-vide" title="Note non calculable pour cette pratique">—</td>';
                    return;
                }
                var delta = '';
                if (!c.ref && pRef !== null) {
                    var dd = p - pRef;
                    delta = ' <span class="comparateur-delta">(' + (dd > 0 ? '+' : '') + dd + ')</span>';
                }
                h += '<td class="comparateur-cellule' + (c.ref ? ' comparateur-cellule--ref' : '') + '">'
                    + '<span class="comparateur-note">' + p + '</span>' + delta + '</td>';
            });
            h += '</tr>';
        });

        h += '</tbody></table>';
        return h;
    }

    /* ── Ouverture ────────────────────────────────────────── */
    function ouvrirComparateurPratiques() {
        var panel = document.getElementById('comparateur-pratiques-panel');
        if (!panel) {
            console.error('[comparateur-pratiques] Panneau #comparateur-pratiques-panel introuvable');
            return;
        }

        // Si déjà ouvert, refermer proprement d'abord (réentrance : la garde
        // démo réutilise ce chemin pour basculer invitation → vue).
        if (_ouvert) fermerComparateurPratiques();

        _focusAvantOuverture = document.activeElement;
        _ouvert = true;

        // GARDE DÉMO : le comparateur s'appuie sur les profils-types de la
        // démonstration. Hors démo, on invite à l'activer plutôt que d'afficher
        // une vue vide (§3.4 de la spec).
        if (estEnDemo()) {
            construireVue(panel);
        } else {
            construireInvitation(panel);
        }
        panel.style.display = '';

        // Accessibilité SPA : déplacer le focus vers le titre du panneau.
        var titre = panel.querySelector('.comparateur-titre');
        if (titre) titre.focus();

        document.addEventListener('keydown', _surClavier);
        // Différer pour ne pas capter le clic d'ouverture lui-même.
        setTimeout(function() {
            document.addEventListener('mousedown', _surClicExterieur);
        }, 0);
    }

    /* ── En-tête commun (titre + bouton fermer) ───────────── */
    function entete(titre) {
        return '<div class="comparateur-header">' +
                    '<div>' +
                        '<div class="comparateur-surtitre">Aide au choix d’une pratique</div>' +
                        '<h3 class="comparateur-titre" id="comparateur-titre-texte" tabindex="-1">' + titre + '</h3>' +
                    '</div>' +
                    '<button class="comparateur-fermer" title="Fermer le comparateur" aria-label="Fermer le comparateur">' +
                        '<img src="icons/icon-close-window.svg" alt="" class="modal-close-icon">' +
                    '</button>' +
                '</div>';
    }

    /* ── Garde démo : invitation à activer la démonstration ── */
    function construireInvitation(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu" role="dialog" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p>Le comparateur s’appuie sur des <strong>profils-types contrastés</strong> ' +
                    'pour montrer comment une même trajectoire d’apprentissage se traduit en notes ' +
                    'selon la pratique choisie. Ces profils vivent dans le <strong>mode démonstration</strong>.</p>' +
                    '<p>Active la démonstration pour explorer le comparateur sans toucher à tes données réelles.</p>' +
                    '<button class="btn btn-principal comparateur-activer-demo" type="button">Activer le mode démonstration</button>' +
                '</div>' +
            '</div>';
        attacherFermeture(panel);
        var btn = panel.querySelector('.comparateur-activer-demo');
        if (btn) btn.addEventListener('click', activerDemoEtOuvrir);
    }

    /* ── Sélecteurs inline des candidates simulées (C1-d) ───── */
    // Zone inline (jamais de modale — anti-pattern projet). Un <select> par
    // colonne de simulation ; changer une candidate recalcule la matrice.
    function _rendreSelecteurs() {
        var refId = _refId();
        _initCandidats(refId);
        var dispo = _pratiquesDisponibles(refId);

        var blocs = _candidatsSel.map(function(selId, slot) {
            var opts = dispo.map(function(p) {
                var sel = (p.id === selId) ? ' selected' : '';
                return '<option value="' + _esc(p.id) + '"' + sel + '>'
                    + _esc(p.code + ' · ' + p.nom) + '</option>';
            }).join('');
            return '<label class="comparateur-selecteur">'
                + '<span class="comparateur-selecteur-libelle">Simulation ' + (slot + 1) + '</span>'
                + '<select class="comparateur-select" data-slot="' + slot + '">' + opts + '</select>'
                + '</label>';
        }).join('');

        return '<div class="comparateur-selecteurs" id="comparateur-selecteurs">'
            + '<span class="comparateur-selecteurs-titre">Comparer avec</span>'
            + blocs + '</div>';
    }

    // Re-rend uniquement le tableau (préserve les sélecteurs et le focus).
    function _rerendreMatrice(panel) {
        var hote = panel.querySelector('#comparateur-matrice');
        if (hote) hote.innerHTML = _rendreMatrice();
    }

    function _attacherSelecteurs(panel) {
        var selects = panel.querySelectorAll('.comparateur-select');
        for (var i = 0; i < selects.length; i++) {
            selects[i].addEventListener('change', function(e) {
                var slot = parseInt(e.target.getAttribute('data-slot'), 10);
                if (!isNaN(slot)) {
                    _candidatsSel[slot] = e.target.value;   // état UI seulement, aucune écriture en base
                    _rerendreMatrice(panel);
                }
            });
        }
    }

    /* ── Vue comparateur (matrice + sélecteurs) ─────────────── */
    function construireVue(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu" role="dialog" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p class="comparateur-finalite">Des pratiques différentes mesurent des choses ' +
                    'différentes. Un écart entre des points n’est ni un bonus ni une erreur. Le ' +
                    'comparateur montre la <strong>maîtrise atteinte en regard de chaque note</strong>.</p>' +
                    _rendreSelecteurs() +
                    '<div class="comparateur-matrice" id="comparateur-matrice" data-etat="matrice">' +
                        _rendreMatrice() +
                    '</div>' +
                    '<p class="comparateur-garde">' + _esc(LIGNE_GARDE) + '</p>' +
                '</div>' +
            '</div>';
        attacherFermeture(panel);
        _attacherSelecteurs(panel);
    }

    function attacherFermeture(panel) {
        var f = panel.querySelector('.comparateur-fermer');
        if (f) f.addEventListener('click', fermerComparateurPratiques);
    }

    /* ── Garde démo : activer puis basculer sur la vue ──────── */
    function activerDemoEtOuvrir() {
        if (typeof activerModeDemo !== 'function') {
            console.warn('[comparateur-pratiques] activerModeDemo absent — impossible d’activer la démo');
            return;
        }
        // activerModeDemo est asynchrone (seed démo). On ré-ouvre ensuite pour
        // que la garde rebascule sur la vue (estEnDemo() devient vrai).
        Promise.resolve(activerModeDemo()).then(function() {
            ouvrirComparateurPratiques();
        }).catch(function(e) {
            console.error('[comparateur-pratiques] échec activation démo', e);
        });
    }

    /* ── Fermeture ────────────────────────────────────────── */
    function fermerComparateurPratiques() {
        var panel = document.getElementById('comparateur-pratiques-panel');
        if (!panel) return;

        document.removeEventListener('keydown', _surClavier);
        document.removeEventListener('mousedown', _surClicExterieur);

        panel.innerHTML = '';
        panel.style.display = 'none';
        _ouvert = false;
        _candidatsSel = null;   // rouvrir = défauts recalculés

        // Restaurer le focus sur l'élément déclencheur.
        if (_focusAvantOuverture && typeof _focusAvantOuverture.focus === 'function'
            && document.contains(_focusAvantOuverture)) {
            _focusAvantOuverture.focus();
        }
        _focusAvantOuverture = null;
    }

    /* ── Écouteurs globaux (actifs seulement panneau ouvert) ─ */
    function _surClavier(e) {
        // Auto-désattachement défensif si l'overlay est fermé (cf. pattern
        // listeners globaux du projet) — ne pas compter sur le couple ouvrir/fermer.
        if (!_ouvert) {
            document.removeEventListener('keydown', _surClavier);
            return;
        }
        if (e.key === 'Escape') fermerComparateurPratiques();
    }

    function _surClicExterieur(e) {
        var panel = document.getElementById('comparateur-pratiques-panel');
        if (!panel || !_ouvert) {
            document.removeEventListener('mousedown', _surClicExterieur);
            return;
        }
        if (panel.contains(e.target)) return;
        // Laisser le dispatcher gérer un clic sur un autre bouton d'ouverture.
        if (e.target.closest && e.target.closest('[data-action="ouvrirComparateurPratiques"]')) return;
        fermerComparateurPratiques();
    }

    /* ── API publique (dispatcher data-action de main.js) ─── */
    window.ouvrirComparateurPratiques = ouvrirComparateurPratiques;
    window.fermerComparateurPratiques = fermerComparateurPratiques;

})();
