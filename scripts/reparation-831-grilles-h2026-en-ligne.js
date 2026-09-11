/* ============================================================================
   #831 — RENDRE AUX 408 ÉVALUATIONS H2026 DE L'INSTANCE EN LIGNE LEURS GRILLES
   ----------------------------------------------------------------------------
   DRY-RUN PAR DÉFAUT. Rien n'est écrit tant que `{ executer: true }` n'est pas
   donné explicitement.

   ── CE QUI EST ÉTABLI (sonde #831, 11 sept. 2026, app.codexnumeris.org) ─────
   · les 408 évaluations H2026 citent trois grilles ABSENTES du trimestre :
       grille_1770742838756_23q82vbsk (225), grille_1772187755149_uq1oiiafa (94),
       GRILLE1759529438501 (89) ;
   · trois grilles vivantes, renumérotées en juin (reconstruction), portent
     EXACTEMENT leurs critères : « Grille-4 H26 » 4/4, « Grille-5 FR-HOLIS H26 »
     5/5, « Grille-5 FR-ALGO H26 » 5/5 — 14 identifiants de critères, tous
     couverts ;
   · la réparation #362 du 5 août a été jouée dans l'AUTRE navigateur ; l'export
     qui a alimenté l'instance en ligne venait de celui qui ne l'avait pas
     reçue (« chaque navigateur est une île », #154).

   ── CE QUE LE SCRIPT FAIT ──────────────────────────────────────────────────
   ÉTAPE 0 — PROUVER, PAS RECOPIER. Pour chaque grilleId cité par des évals et
     absent du trimestre, il relève l'ensemble des `critereId` que CES évals
     portent, et cherche la grille vivante du trimestre dont les identifiants
     de critères sont EXACTEMENT cet ensemble. Une seule jumelle, ou refus.
     Les correspondances ne sont jamais tapées ici : elles se lisent dans tes
     données à chaque exécution.
   ÉTAPE 1 — RECRÉER la grille sous l'identifiant attendu : copie intégrale de
     la jumelle (critères, nom, réglages), seul `id` change. La jumelle reste
     en place (voir « ce qu'il ne touche pas »).
   ÉTAPE 2 — CARTOUCHES : si le tiroir `h2026_cartouches_<idAttendu>` est vide
     et que celui de la jumelle ne l'est pas, il y recopie les cartouches avec
     `grilleId` mis à jour (fusion par identité : même id + même contenu =
     ignoré ; même id + contenu différent = REFUS).
   ÉTAPE 3 — `db.flush()` explicite après chaque écriture (leçon du 5 août :
     une écriture non drainée revertait au rechargement).

   ── CE QU'IL NE TOUCHE JAMAIS ──────────────────────────────────────────────
   · les ÉVALUATIONS (registre de ce qui a été fait, et témoin du diagnostic) ;
   · les jumelles renumérotées : elles restent — la retirer est un autre
     geste, à décider après avoir vu le résultat (les deux grilles porteront
     le même nom dans le menu ; H2026 est un trimestre passé, on n'y évalue
     plus) ;
   · les productions, les échelles, la préférence de dépistage ;
   · un identifiant DÉJÀ présent (rien n'est écrasé) ;
   · les autres trimestres, la démo.

   USAGE — console du navigateur, dans l'onglet de l'app, trimestre H2026 actif,
   APRÈS un export Codex de sauvegarde :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await reparer831()`                       → dry-run, n'écrit rien
     3. `await reparer831({ executer: true })`     → recrée les grilles
     4. `annuler831()`                             → restaure (même session)
   Repère : le rapport commence par « ==== #831 · réparation ».
   ============================================================================ */
(function () {
    'use strict';
    var VERSION_OUTIL = 'r2 · 11 sept. 2026 (empreinte majoritaire, hors-empreinte nommés)';
    var TRIMESTRE = 'h2026';
    var K = function (nom) { return TRIMESTRE + '_' + nom; };
    var KC = function (grilleId) { return TRIMESTRE + '_cartouches_' + grilleId; };
    var clone = function (x) { return JSON.parse(JSON.stringify(x)); };
    var _sauvegarde = null;

    /**
     * L'empreinte MAJORITAIRE des évals d'une grille : l'ensemble de critereId
     * que le plus grand nombre d'entre elles portent. Pourquoi pas l'union :
     * le dossier de juin (RELAIS-grilles-h2026-desappariees §0bis) a mesuré
     * trois évals « mal estampillées » — elles portent les critères d'une
     * AUTRE grille sous ce grilleId. L'union ferait 14 critères que personne
     * ne porte ; la majorité en fait 4, et nomme les hors-empreinte sans y
     * toucher (ce sont des évaluations : on ne réécrit pas la mémoire).
     */
    function empreinteCriteresEvals(evals, grilleId) {
        var comptes = {}, ensembles = {};
        evals.forEach(function (e) {
            if (!e || e.grilleId !== grilleId) return;
            var ids = (e.criteres || []).map(function (c) { return c && c.critereId ? String(c.critereId) : null; }).filter(Boolean).sort();
            var k = ids.join('|');
            comptes[k] = (comptes[k] || 0) + 1;
            ensembles[k] = ids;
        });
        var meilleure = null, total = 0;
        Object.keys(comptes).forEach(function (k) { total += comptes[k]; if (meilleure === null || comptes[k] > comptes[meilleure]) meilleure = k; });
        if (meilleure === null || meilleure === '') return { ids: new Set(), nb: 0, horsEmpreinte: total };
        return { ids: new Set(ensembles[meilleure]), nb: comptes[meilleure], horsEmpreinte: total - comptes[meilleure] };
    }
    function empreinteGrille(g) {
        return new Set((g && g.criteres || []).map(function (c) { return String(c && c.id); }));
    }
    function memesEnsembles(a, b) {
        if (a.size !== b.size) return false;
        var ok = true; a.forEach(function (x) { if (!b.has(x)) ok = false; }); return ok;
    }
    function signature(o) {
        var c = clone(o); delete c.id; delete c.grilleId;
        return JSON.stringify(c, Object.keys(c).sort());
    }

    /** Étape 0, pure : le plan, établi par preuve. Exportée pour la sentinelle. */
    function etablirPlan(grilles, evals) {
        var presents = new Set(grilles.map(function (g) { return g && g.id; }));
        var cites = {};
        evals.forEach(function (e) { if (e && e.grilleId) cites[e.grilleId] = (cites[e.grilleId] || 0) + 1; });
        var plan = [], refus = [];
        Object.keys(cites).forEach(function (idAttendu) {
            if (presents.has(idAttendu)) return;
            var emp = empreinteCriteresEvals(evals, idAttendu);
            var empreinte = emp.ids;
            if (empreinte.size === 0) { refus.push({ idAttendu: idAttendu, nbEvals: cites[idAttendu], motif: 'aucun critereId porté par ces évals' }); return; }
            var jumelles = grilles.filter(function (g) { return g && !g.isDemo && memesEnsembles(empreinteGrille(g), empreinte); });
            if (jumelles.length !== 1) {
                refus.push({ idAttendu: idAttendu, nbEvals: cites[idAttendu], motif: jumelles.length === 0 ? 'aucune grille du trimestre ne porte exactement ces ' + empreinte.size + ' critères (empreinte majoritaire, ' + emp.nb + ' évals)' : jumelles.length + ' grilles portent ces critères (ambigu)' });
                return;
            }
            plan.push({ idAttendu: idAttendu, nbEvals: cites[idAttendu], nbCriteres: empreinte.size, nbDansEmpreinte: emp.nb, horsEmpreinte: emp.horsEmpreinte, jumelle: jumelles[0] });
        });
        return { plan: plan, refus: refus };
    }

    async function reparer831(options) {
        var executer = !!(options && options.executer);
        var lignes = [];
        var L = function (s) { lignes.push(s); };
        L('==== #831 · réparation · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien n\'est écrit)') + ' · ' + VERSION_OUTIL + ' ====');
        try {
            var trimActif = (typeof obtenirTrimestreId === 'function') ? obtenirTrimestreId() : null;
            if (trimActif !== TRIMESTRE) { L('⛔ Le trimestre actif est « ' + trimActif + ' », pas ' + TRIMESTRE + '. Active H2026 et relance.'); return fin(lignes); }

            var grilles = db.getSync(K('grillesTemplates'), []) || [];
            var evals = db.getSync(K('evaluationsSauvegardees'), []) || [];
            L('grilles du trimestre : ' + grilles.length + ' ; évaluations : ' + evals.length);
            var r = etablirPlan(grilles, evals);
            r.refus.forEach(function (x) { L('  ✗ ' + x.idAttendu + ' (' + x.nbEvals + ' évals) — REFUS : ' + x.motif); });
            r.plan.forEach(function (x) { L('  ✓ ' + x.idAttendu + ' (' + x.nbEvals + ' évals, ' + x.nbCriteres + ' critères portés par ' + x.nbDansEmpreinte + (x.horsEmpreinte ? ' ; ' + x.horsEmpreinte + ' mal estampillée(s), non touchée(s)' : '') + ') ← jumelle ' + x.jumelle.id + ' « ' + x.jumelle.nom + ' »'); });
            if (r.plan.length === 0) { L('Rien à recréer.'); return fin(lignes); }

            // Cartouches : état des tiroirs
            r.plan.forEach(function (x) {
                var tiroirAttendu = db.getSync(KC(x.idAttendu), null);
                var tiroirJumelle = db.getSync(KC(x.jumelle.id), null);
                x.cartouchesAttendu = Array.isArray(tiroirAttendu) ? tiroirAttendu.length : null;
                x.cartouchesJumelle = Array.isArray(tiroirJumelle) ? tiroirJumelle.length : null;
                L('    cartouches : tiroir attendu ' + (x.cartouchesAttendu === null ? 'absent' : x.cartouchesAttendu) + ' ; tiroir jumelle ' + (x.cartouchesJumelle === null ? 'absent' : x.cartouchesJumelle));
            });

            if (!executer) {
                L('');
                L('DRY-RUN terminé. Si le plan te va, après un export Codex de sauvegarde :');
                L('   await reparer831({ executer: true })');
                return fin(lignes);
            }

            // Sauvegarde même-session
            _sauvegarde = { grilles: clone(grilles), tiroirs: {} };
            r.plan.forEach(function (x) { _sauvegarde.tiroirs[KC(x.idAttendu)] = db.getSync(KC(x.idAttendu), null); });

            // Étape 1 — recréer
            var neuves = grilles.slice();
            r.plan.forEach(function (x) {
                if (neuves.some(function (g) { return g && g.id === x.idAttendu; })) return;
                var g = clone(x.jumelle);
                g.id = x.idAttendu;
                g.dateModification = new Date().toISOString();
                neuves.push(g);
                L('  → grille recréée : ' + x.idAttendu + ' « ' + g.nom + ' » (' + (g.criteres || []).length + ' critères)');
            });
            db.setSync(K('grillesTemplates'), neuves);
            if (typeof db.flush === 'function') await db.flush();

            // Étape 2 — cartouches
            for (var i = 0; i < r.plan.length; i++) {
                var x = r.plan[i];
                var source = db.getSync(KC(x.jumelle.id), null);
                if (!Array.isArray(source) || source.length === 0) continue;
                var cible = db.getSync(KC(x.idAttendu), null);
                cible = Array.isArray(cible) ? cible : [];
                var ajoutees = 0, ignorees = 0, refusees = 0;
                source.forEach(function (c) {
                    if (!c || !c.id) return;
                    var deja = cible.find(function (d) { return d && d.id === c.id; });
                    if (deja) { if (signature(deja) === signature(c)) ignorees++; else refusees++; return; }
                    var copie = clone(c); copie.grilleId = x.idAttendu; cible.push(copie); ajoutees++;
                });
                if (ajoutees > 0) { db.setSync(KC(x.idAttendu), cible); if (typeof db.flush === 'function') await db.flush(); }
                L('  → cartouches ' + x.idAttendu + ' : ' + ajoutees + ' copiée(s), ' + ignorees + ' identique(s) ignorée(s), ' + refusees + ' REFUSÉE(s) (même id, contenu différent)');
            }

            // Vérification
            var apres = db.getSync(K('grillesTemplates'), []) || [];
            var manquantes = r.plan.filter(function (x) { return !apres.some(function (g) { return g && g.id === x.idAttendu; }); });
            L(manquantes.length === 0 ? '✓ Les ' + r.plan.length + ' grilles attendues sont présentes. Recharge la page (⌘R) puis rouvre une évaluation H2026.' : '⛔ ' + manquantes.length + ' grille(s) manquent encore après écriture.');
            L('   Filet même-session : annuler831(). Filet durable : ton export Codex.');
        } catch (e) {
            L('ERREUR : ' + (e && e.message));
        }
        return fin(lignes);
    }
    function fin(lignes) { lignes.push('==== fin #831 ===='); var t = lignes.join('\n'); console.log(t); return t; }

    window.reparer831 = reparer831;
    window.annuler831 = async function () {
        if (!_sauvegarde) { console.log('#831 : rien à annuler dans cette session.'); return; }
        db.setSync(K('grillesTemplates'), _sauvegarde.grilles);
        Object.keys(_sauvegarde.tiroirs).forEach(function (k) {
            if (_sauvegarde.tiroirs[k] === null) db.removeSync(k); else db.setSync(k, _sauvegarde.tiroirs[k]);
        });
        if (typeof db.flush === 'function') await db.flush();
        console.log('#831 : état d\'avant restauré (grilles + tiroirs de cartouches).');
        _sauvegarde = null;
    };
    window.__831 = { etablirPlan: etablirPlan };
    console.log('#831 chargé (' + VERSION_OUTIL + '). Dry-run : await reparer831()');
})();
