/* ============================================================
   COMPARATEUR DE PRATIQUES — sous-section pérenne du Labo (lot C4)
   ------------------------------------------------------------
   Vue d'aide au choix d'une pratique de notation. Montre, sur des
   profils-types contrastés, la maîtrise en regard de chaque note —
   pour sortir du paradigme du cumul (la note = reflet de la maîtrise
   en fin de parcours, pas un score additionné).

   Spec : plans de travail/SPEC_comparateur_pratiques.md (§3.1 matrice,
          §1 bis finalité, §3.4 garde démo, §7 séquencement C4)
   Conception : NOTE-CONCEPTION-C1/C2-comparateur.md (design validé
                avec Grégoire les 6-7 juin 2026)

   FORME (lot C4) : vraie SOUS-SECTION du Labo (Labo › « Comparateur de
   pratiques »), pas un overlay. La visibilité est gérée par la
   navigation (afficherSousSection ajoute/retire .active) ; ce module
   construit le contenu via l'initialiseur 'labo-comparateur' du
   dispatcher INITIALISATEURS_SOUS_SECTION de navigation.js. Aucun
   bouton Fermer / Échap / clic-extérieur : on quitte par la sous-nav.

   API publique :
   - initialiserComparateurPratiques()  ← appelée par navigation.js
   - _comparateurGenererCSV()           ← exposée pour les tests (C3)

   Conteneur : #labo-comparateur (index.html), rempli dynamiquement à
   chaque affichage de la sous-section (entrée fraîche = retour matrice).

   Sécurité : contenu 100 % statique défini dans ce fichier — aucune
   donnée utilisateur injectée (même statut que guides-pedagogiques.js).
   Lecture seule absolue côté moteur : ce module n'écrit jamais de
   données (ni clés réelles, ni demo_*).
   ============================================================ */

(function() {

    /* ── État interne ─────────────────────────────────────── */
    // Candidates simulées sélectionnées (1-2 ids), réinitialisées à chaque
    // entrée dans la sous-section. null = pas encore initialisé → défauts
    // calculés au rendu (C1-d).
    var _candidatsSel = null;

    // Vue courante du panneau : 'matrice' (comparaison) ou 'fiche' (profil) — C2-d.
    var _vue = 'matrice';
    var _daFiche = null;

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

    // Avertissement sous la matrice ET sous le récit de la fiche : le comparateur
    // est expérimental ; invite à signaler les anomalies pour contribuer à son
    // amélioration. (Le recentrage anti-palmarès reste porté par le paragraphe de
    // finalité en tête : « un écart entre des points n’est ni un bonus ni une erreur ».)
    var LIGNE_GARDE = 'Le comparateur est un outil expérimental et peut présenter des erreurs. Partage tes observations et participe à son amélioration en utilisant l’icône « Signaler un bug », en haut à droite de l’en-tête.';

    // Phrases de contexte par profil (§9 — contenu VALIDÉ Grégoire 7 juin 2026,
    // variante A). En dur, stables, racontables ; indexées par DA ; echapperHtml()
    // à l'affichage. S'affichent dans l'en-tête de la fiche, sous « {profil} · {DA} ».
    var PHRASES_CONTEXTE = {
        DEMO010: 'Parcours régulier et soutenu : la maîtrise s’installe tôt et se confirme jusqu’à la fin.',
        DEMO013: 'Progression régulière, sans accroc marquant : la maîtrise se construit graduellement.',
        DEMO004: 'Plusieurs remises restent sous les attentes ; la maîtrise demeure fragile en fin de parcours.',
        DEMO011: 'A raté deux des premières remises, puis a démontré la maîtrise sur les productions suivantes.'
    };

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

        // Pratiques offertes aux sélecteurs des colonnes de simulation (hors réf).
        var dispo = _pratiquesDisponibles(refId);
        var slot = 0;   // index dans _candidatsSel = ordre des colonnes non-réf

        var h = '<table class="comparateur-matrice-table">';
        h += '<thead><tr>';
        h += '<th scope="col" class="comparateur-col-profil">Profil</th>';
        h += '<th scope="col" class="comparateur-col-niveau">Niveau atteint</th>';
        cols.forEach(function(c) {
            var code = _codePratique(c.id);
            var e1 = (code && MICROCOPY_E1[code]) ? MICROCOPY_E1[code] : '';
            // Réf (« Ta pratique ») = titre statique non modifiable ; colonnes de
            // simulation = un <select> à la place du titre (le bandeau « Comparer
            // avec » est supprimé — il répétait le nom déjà porté par la colonne).
            var titre;
            if (c.ref) {
                titre = _badge(c.id) + ' <span class="comparateur-col-nom">' + _esc(_nomPratique(c.id)) + '</span>'
                    + '<span class="comparateur-col-tag">Ta pratique</span>';
            } else {
                titre = _selectColonne(slot, c.id, dispo)
                    + '<span class="comparateur-col-tag">Simulation</span>';
                slot++;
            }
            h += '<th scope="col" class="comparateur-col-pratique' + (c.ref ? ' comparateur-col-pratique--ref' : '') + '">'
                + titre
                + (e1 ? '<span class="comparateur-col-e1">' + _esc(e1) + '</span>' : '')
                + '</th>';
        });
        h += '</tr></thead><tbody>';

        PROFILS.forEach(function(prof) {
            var na = _niveauAtteint(prof.da, d);
            var pRef = _note(prof.da, refId);
            // Ligne activable (clic + clavier) → ouvre la fiche du profil (C2-d.1).
            h += '<tr class="comparateur-ligne-profil" data-profil-da="' + _esc(prof.da) + '"'
                + ' role="button" tabindex="0" aria-label="' + _esc('Ouvrir la fiche : ' + prof.label) + '">';
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
    // Conteneur de la sous-section (toggle .active géré par la navigation).
    function _conteneur() {
        return document.getElementById('labo-comparateur');
    }

    // Rend (ou re-rend) le contenu de la sous-section. Appelée par la
    // navigation à chaque affichage de Labo › Comparateur, et après
    // activation de la démo. Entrée fraîche = on repart de la matrice.
    function rendreComparateur() {
        var hote = _conteneur();
        if (!hote) {
            console.error('[comparateur-pratiques] Conteneur #labo-comparateur introuvable');
            return;
        }

        _vue = 'matrice';
        _daFiche = null;
        _candidatsSel = null;   // défauts recalculés à chaque entrée

        // GARDE DÉMO : le comparateur s'appuie sur les profils-types de la
        // démonstration. Hors démo, on invite à l'activer plutôt que d'afficher
        // une vue vide (§3.4 de la spec).
        if (estEnDemo()) {
            construireVue(hote);
        } else {
            construireInvitation(hote);
        }

        // Accessibilité SPA : déplacer le focus vers le titre de la vue.
        var titre = hote.querySelector('.comparateur-titre');
        if (titre) titre.focus();
    }

    /* ── En-tête commun (titre + bouton fermer) ───────────── */
    function entete(titre) {
        return '<div class="comparateur-header">' +
                    '<div>' +
                        '<h2 class="comparateur-titre" id="comparateur-titre-texte" tabindex="-1">' + titre + '</h2>' +
                    '</div>' +
                '</div>';
    }

    /* ── Garde démo : invitation à activer la démonstration ── */
    function construireInvitation(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu carte" role="region" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p>Le comparateur s’appuie sur des <strong>profils-types contrastés</strong> ' +
                    'pour montrer comment une même trajectoire d’apprentissage se traduit en notes ' +
                    'selon la pratique choisie. Ces profils vivent dans le <strong>mode démonstration</strong>.</p>' +
                    '<p>Active la démonstration pour explorer le comparateur sans toucher à tes données réelles.</p>' +
                    '<button class="btn btn-principal comparateur-activer-demo" type="button">Activer le mode démonstration</button>' +
                '</div>' +
            '</div>';
        var btn = panel.querySelector('.comparateur-activer-demo');
        if (btn) btn.addEventListener('click', activerDemoEtOuvrir);
    }

    /* ── Sélecteurs des candidates simulées (C1-d) ─────────── */
    // Le <select> vit DANS l'en-tête de sa colonne de simulation (jamais de
    // modale — anti-pattern projet). Il remplace le titre statique : le bandeau
    // « Comparer avec » répétait le nom déjà porté par la colonne. Changer une
    // candidate recalcule la matrice.
    function _optionsSelect(selId, dispo) {
        return dispo.map(function(p) {
            var sel = (p.id === selId) ? ' selected' : '';
            return '<option value="' + _esc(p.id) + '"' + sel + '>'
                + _esc(p.code + ' · ' + p.nom) + '</option>';
        }).join('');
    }

    function _selectColonne(slot, selId, dispo) {
        return '<select class="comparateur-select" data-slot="' + slot + '"'
            + ' aria-label="Pratique à simuler dans cette colonne">'
            + _optionsSelect(selId, dispo) + '</select>';
    }

    // Re-rend uniquement le tableau (les sélecteurs y vivent désormais ; l'hôte
    // #comparateur-matrice persiste, donc l'écouteur délégué survit au re-rendu).
    function _rerendreMatrice(panel) {
        var hote = panel.querySelector('#comparateur-matrice');
        if (hote) hote.innerHTML = _rendreMatrice();
    }

    // Délégation sur l'hôte persistant #comparateur-matrice : un seul attachement
    // suffit, les <select> recréés à chaque re-rendu restent câblés (même pattern
    // que _attacherNavigationLignes). Le change d'un <select> remonte par bulle.
    function _attacherSelecteurs(panel) {
        var hote = panel.querySelector('#comparateur-matrice');
        if (!hote) return;
        hote.addEventListener('change', function(e) {
            var t = e.target;
            if (!t || !t.classList || !t.classList.contains('comparateur-select')) return;
            var slot = parseInt(t.getAttribute('data-slot'), 10);
            if (!isNaN(slot)) {
                _candidatsSel[slot] = t.value;   // état UI seulement, aucune écriture en base
                _rerendreMatrice(panel);
            }
        });
    }

    /* ── Navigation matrice → fiche (C2-d.1) ───────────────── */
    // Délégation sur l'hôte #comparateur-matrice : il PERSISTE à travers les
    // re-rendus du tableau (_rerendreMatrice ne change que son innerHTML), donc
    // un seul attachement suffit (pas de fuite d'écouteurs).
    function _attacherNavigationLignes(panel) {
        var hote = panel.querySelector('#comparateur-matrice');
        if (!hote) return;
        hote.addEventListener('click', function(e) {
            var tr = e.target.closest ? e.target.closest('[data-profil-da]') : null;
            if (tr) _ouvrirFiche(panel, tr.getAttribute('data-profil-da'));
        });
        hote.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
            var tr = e.target.closest ? e.target.closest('[data-profil-da]') : null;
            if (tr) { e.preventDefault(); _ouvrirFiche(panel, tr.getAttribute('data-profil-da')); }
        });
    }

    function _ouvrirFiche(panel, da) {
        if (!da) return;
        _vue = 'fiche';
        _daFiche = da;
        construireFiche(panel, da);
        // Accessibilité SPA : focus au titre de la nouvelle vue.
        var titre = panel.querySelector('.comparateur-titre');
        if (titre) titre.focus();
    }

    function _retourMatrice(panel) {
        _vue = 'matrice';
        _daFiche = null;
        construireVue(panel);   // _candidatsSel préservé → état des sélecteurs conservé
        var titre = panel.querySelector('.comparateur-titre');
        if (titre) titre.focus();
    }

    /* ── Bloc « Maîtrise en fin de parcours » (E2bis, C2-d.2) ─ */
    // Niveau d'échelle correspondant à un code (jamais I/D/M/E en dur — pluralisme).
    function _libelleNiveau(echelle, code) {
        if (echelle && echelle.niveaux) {
            for (var i = 0; i < echelle.niveaux.length; i++) {
                if (echelle.niveaux[i].code === code) return echelle.niveaux[i];
            }
        }
        return null;
    }

    // Trajectoire des niveaux datés (libellés d'échelle) + démonstration finale.
    function _blocMaitrise(da, d) {
        var titre = '<h4 class="comparateur-fiche-titre">Maîtrise en fin de parcours</h4>';
        var evals = _evalsProfil(da, d.evaluations);
        if (!evals.length) {
            return '<section class="comparateur-fiche-bloc">' + titre
                + '<p class="comparateur-vide">Aucune évaluation datée pour ce profil.</p></section>';
        }

        var etapes = evals.map(function(e) {
            var ech = _echelle(e.echelleId, d.echelles);
            var niv = _libelleNiveau(ech, e.niveauFinal);
            var lib = niv ? niv.nom : e.niveauFinal;
            var desc = (niv && niv.description) ? niv.description : '';
            var t = desc ? _esc(lib + ' · ' + desc) : _esc(lib);
            return '<span class="comparateur-traj-etape" title="' + t + '">' + _esc(lib) + '</span>';
        }).join('<span class="comparateur-traj-fleche" aria-hidden="true">→</span>');

        var finale = '';
        var na = _niveauAtteint(da, d);
        if (na) {
            var aria = na.label + (na.description ? ', ' + na.description : '') + ', ' + na.tendance.mot;
            var t2 = na.description ? _esc(na.label + ' · ' + na.description) : _esc(na.label);
            finale = '<p class="comparateur-fiche-finale">'
                + '<span class="comparateur-fiche-finale-libelle">Démonstration finale :</span> '
                + '<span class="comparateur-fiche-finale-niveau" title="' + t2 + '" aria-label="' + _esc(aria) + '">'
                + _esc(na.label)
                + ' <span class="comparateur-tendance" aria-hidden="true">' + na.tendance.fleche + '</span>'
                + '</span></p>';
        }

        return '<section class="comparateur-fiche-bloc">' + titre
            + '<div class="comparateur-traj">' + etapes + '</div>' + finale + '</section>';
    }

    /* ── Bloc « Ce que chaque pratique retient » (récit E2, C2-d.3) ─ */
    // Échelle de référence du profil pour traduire les niveaux (codes bruts) du
    // récit en libellés. Même logique que _niveauAtteint (terminale, sinon dernière
    // éval datée). Les profils démo ont une échelle homogène ; repli = code brut.
    function _echelleProfil(da, d) {
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
        if (!evalFin) evalFin = evals[evals.length - 1];
        return _echelle(evalFin.echelleId, d.echelles);
    }

    // Une carte par pratique (référence d'abord) consommant le contrat §4 via
    // simulerIndices().recit (aiguillage unifié C2-d.0 — pas de ré-aiguillage ici).
    function _carteRecit(da, c, ech) {
        var recit = null;
        if (typeof simulerIndices === 'function') {
            var r = simulerIndices(da, c.id);
            recit = r ? r.recit : null;
        }
        var enTete = '<div class="comparateur-recit-entete">'
            + _badge(c.id) + ' <span class="comparateur-col-nom">' + _esc(_nomPratique(c.id)) + '</span>'
            + '<span class="comparateur-col-tag">' + (c.ref ? 'Ta pratique' : 'simulation') + '</span>'
            + '</div>';
        var classe = 'comparateur-recit-carte' + (c.ref ? ' comparateur-recit-carte--ref' : '');

        if (!recit || !recit.resultats || !recit.resultats.length) {
            return '<div class="' + classe + '">' + enTete
                + '<p class="comparateur-vide">Récit indisponible pour cette pratique.</p></div>';
        }

        var lignes = recit.resultats.map(function(res) {
            var niveauHtml = '';
            if (res.niveau) {
                var niv = _libelleNiveau(ech, res.niveau);
                var lib = niv ? niv.nom : res.niveau;
                var t = (niv && niv.description) ? _esc(lib + ' · ' + niv.description) : _esc(lib);
                niveauHtml = '<span class="comparateur-recit-niveau" title="' + t + '">' + _esc(lib) + '</span>';
            }
            var noteHtml = (res.note !== null && res.note !== undefined)
                ? '<span class="comparateur-recit-note">' + _esc(res.note) + '</span>' : '';
            return '<li class="comparateur-recit-ligne comparateur-recit--' + _esc(res.sort) + '">'
                + '<span class="comparateur-recit-label">' + _esc(res.label) + '</span>'
                + niveauHtml + noteHtml
                + '<span class="comparateur-recit-detail">' + _esc(res.detail) + '</span>'
                + '</li>';
        }).join('');

        var synth = recit.synthese || {};
        var noteFin = (synth.noteFinale !== null && synth.noteFinale !== undefined)
            ? Math.round(synth.noteFinale) : null;
        var synthHtml = '<div class="comparateur-recit-synthese">'
            + (synth.formuleTexte ? '<span class="comparateur-recit-formule">' + _esc(synth.formuleTexte) + '</span>' : '')
            + (noteFin !== null ? '<span class="comparateur-recit-notefinale">' + noteFin + '</span>' : '')
            + '</div>';
        var plaf = synth.plafonnement
            ? '<p class="comparateur-recit-plafond">Note plafonnée (conformité).</p>' : '';

        return '<div class="' + classe + '">' + enTete
            + '<ul class="comparateur-recit-liste">' + lignes + '</ul>'
            + synthHtml + plaf + '</div>';
    }

    function _blocRecit(da, d) {
        var titre = '<h4 class="comparateur-fiche-titre">Ce que chaque pratique retient</h4>';
        var ech = _echelleProfil(da, d);
        var cartes = _colonnes().map(function(c) { return _carteRecit(da, c, ech); }).join('');
        return '<section class="comparateur-fiche-bloc">' + titre
            + '<div class="comparateur-recit-cartes">' + cartes + '</div>'
            + '<p class="comparateur-garde">' + _esc(LIGNE_GARDE) + '</p>'
            + '</section>';
    }

    /* ── Fiche de profil (en-tête + maîtrise + récit E2) ────── */
    function construireFiche(panel, da) {
        var d = _donnees();
        var prof = null;
        for (var i = 0; i < PROFILS.length; i++) {
            if (PROFILS[i].da === da) { prof = PROFILS[i]; break; }
        }
        var label = prof ? prof.label : da;
        var phrase = PHRASES_CONTEXTE[da] || '';

        panel.innerHTML =
            '<div class="comparateur-contenu carte" role="region" aria-labelledby="comparateur-titre-texte">' +
                '<div class="comparateur-header">' +
                    '<div>' +
                        '<button class="comparateur-retour" type="button">‹ Retour à la comparaison</button>' +
                        '<h2 class="comparateur-titre" id="comparateur-titre-texte" tabindex="-1">' +
                            _esc(label) + ' <span class="comparateur-fiche-da">· ' + _esc(da) + '</span>' +
                        '</h2>' +
                        (phrase ? '<p class="comparateur-fiche-contexte">' + _esc(phrase) + '</p>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="comparateur-corps">' +
                    _blocMaitrise(da, d) +
                    _blocRecit(da, d) +
                '</div>' +
            '</div>';

        var r = panel.querySelector('.comparateur-retour');
        if (r) r.addEventListener('click', function() { _retourMatrice(panel); });
    }

    /* ── Vue comparateur (matrice + sélecteurs) ─────────────── */
    function construireVue(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu carte" role="region" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p class="comparateur-finalite">Des pratiques différentes mesurent des choses ' +
                    'différentes. Un écart entre des points n’est ni un bonus ni une erreur. Le ' +
                    'comparateur montre la <strong>maîtrise atteinte en regard de chaque note</strong>.</p>' +
                    '<div class="comparateur-matrice" id="comparateur-matrice" data-etat="matrice">' +
                        _rendreMatrice() +
                    '</div>' +
                    '<p class="comparateur-garde">' + _esc(LIGNE_GARDE) + '</p>' +
                    '<div class="comparateur-actions">' +
                        '<button type="button" class="comparateur-exporter">Exporter en CSV</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        _attacherSelecteurs(panel);
        _attacherNavigationLignes(panel);
        _attacherExport(panel);
    }

    /* ── Garde démo : activer puis rendre la vue ────────────── */
    function activerDemoEtOuvrir() {
        if (typeof activerModeDemo !== 'function') {
            console.warn('[comparateur-pratiques] activerModeDemo absent — impossible d’activer la démo');
            return;
        }
        // activerModeDemo est asynchrone (seed démo). On re-rend ensuite pour
        // que la garde rebascule sur la vue (estEnDemo() devient vrai).
        Promise.resolve(activerModeDemo()).then(function() {
            rendreComparateur();
        }).catch(function(e) {
            console.error('[comparateur-pratiques] échec activation démo', e);
        });
    }

    /* ── Export CSV (C3) — trace de la comparaison ──────────── */
    // Échappement RFC 4180 + neutralisation d'injection de formule (Excel/Sheets) :
    // une cellule qui commence par = + - @ est préfixée d'une apostrophe.
    function _csvCell(v) {
        var s = (v === null || v === undefined) ? '' : String(v);
        if (/^[=+\-@]/.test(s)) s = "'" + s;
        if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
        return s;
    }

    // Génère le CSV de la comparaison : une ligne par profil-type, une colonne de
    // note par pratique comparée (réf d'abord). Lecture seule. BOM UTF-8 pour Excel.
    function _genererCSV() {
        var d = _donnees();
        var cols = _colonnes();
        var entetes = ['Profil', 'DA', 'Niveau atteint', 'Tendance'];
        cols.forEach(function(c) {
            entetes.push(_nomPratique(c.id) + (c.ref ? ' (Ta pratique)' : ' (simulation)'));
        });
        var lignes = [entetes.map(_csvCell).join(',')];
        PROFILS.forEach(function(prof) {
            var na = _niveauAtteint(prof.da, d);
            var row = [prof.label, prof.da, na ? na.label : '', na ? na.tendance.mot : ''];
            cols.forEach(function(c) {
                var p = _note(prof.da, c.id);
                row.push(p === null ? '' : p);
            });
            lignes.push(row.map(_csvCell).join(','));
        });
        var BOM = String.fromCharCode(0xFEFF);   // BOM UTF-8 explicite (ouverture Excel/accents)
        return BOM + lignes.join('\r\n') + '\r\n';
    }

    function exporterCSV() {
        var csv = _genererCSV();
        var nom = (typeof genererNomFichierExport === 'function')
            ? genererNomFichierExport('comparateur-pratiques', { extension: '.csv', precisionDate: 'minute' })
            : 'comparateur-pratiques.csv';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', nom);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        if (typeof notifications !== 'undefined' && notifications.succes) {
            notifications.succes('Export réussi', 'Comparaison exportée en CSV');
        }
    }

    function _attacherExport(panel) {
        var b = panel.querySelector('.comparateur-exporter');
        if (b) b.addEventListener('click', exporterCSV);
    }

    /* ── API publique ─────────────────────────────────────── */
    // Appelée par le dispatcher INITIALISATEURS_SOUS_SECTION de navigation.js
    // ('labo-comparateur') à chaque affichage de la sous-section.
    window.initialiserComparateurPratiques = rendreComparateur;
    // Exposée pour les tests de régression (contenu CSV déterministe).
    window._comparateurGenererCSV = _genererCSV;

})();
