/* ============================================================================
   RÉPARATION — retirer un COURS et tout ce qui en dépend
   ----------------------------------------------------------------------------
   Motif (10 août 2026, décision Grégoire) : le cours `601-102-MQ` de son
   espace H26 est FICTIF — des données de test, jamais un cours donné avec
   Labo Codex. Il porte en plus les 3 exemplaires à id identique de #442.
   Plutôt que dédoublonner puis garder une fiche inutile, on la retire.

   ⚠⚠ CE SCRIPT SUPPRIME DES DONNÉES. Il est donc construit pour REFUSER
   plutôt que deviner :

   1. DRY-RUN par défaut. Il n'écrit rien tant qu'on ne le lui dit pas.
   2. Il RECENSE avant de proposer : chaque clé, chaque item qui référence le
      cours, et chaque groupe-cours qui en dépend — avec ses effectifs.
   3. Il REFUSE d'exécuter si un groupe-cours dépendant porte des données
      (étudiants, évaluations, présences) : un cours « fictif » qui traîne des
      évaluations réelles n'est pas fictif, et c'est à l'humain de trancher.
      `{ forcer: true }` passe outre, explicitement.
   4. Il ne touche JAMAIS les items qui pointent un AUTRE cours.

   Le registre des clés porteuses de `coursId` est celui du projet lui-même
   (`SUFFIXES_FK` de `_diagnostiquerModeleCours`, `js/cours.js`) — pas une
   liste réinventée ici.

   - `await retirerCours('h2026-601-102-MQ-00001')`                 → DRY-RUN
   - `await retirerCours('h2026-601-102-MQ-00001', {executer:true})` → applique
   - `annulerRetraitCours()`                                        → restaure
                                     (même session ; filet durable = backup Codex)
   ============================================================================ */
(function () {
    'use strict';

    // Registre du projet : les suffixes de clés dont les items portent `coursId`.
    var SUFFIXES_FK = ['presences', 'productions', 'groupeEtudiants', 'groupesCours', 'evaluationsSauvegardees'];

    async function _toutesLesCles() {
        var cles = new Set();
        try { db.keysSync().forEach(function (k) { cles.add(String(k)); }); } catch (e) { /* best-effort */ }
        try { (await db.keys() || []).forEach(function (k) { cles.add(String(k)); }); } catch (e) { /* best-effort */ }
        return Array.from(cles);
    }

    window.retirerCours = async function (coursId, opts) {
        opts = opts || {};
        var executer = !!opts.executer;
        var forcer = !!opts.forcer;
        var out = [];
        var L = function (s) { out.push(s); };
        L('==== RETRAIT DE COURS · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien ne sera écrit)') + ' ====');

        if (!coursId) {
            L('⛔ REFUS : aucun id de cours fourni.');
            console.log(out.join('\n'));
            return;
        }
        L('Cible : ' + coursId);
        L('');

        // ── 1. La fiche de cours elle-même ───────────────────────────────
        var magasin = db.getSync('cours', []) || [];
        var fiches = magasin.filter(function (c) { return c && c.id === coursId; });
        L('— magasin `cours` : ' + fiches.length + ' fiche(s) portant cet id' +
          (fiches.length > 1 ? '  (les doublons #442)' : ''));
        fiches.forEach(function (f, i) {
            L('    · #' + (i + 1) + ' ' + (f.codeCours || f.sigle || '?') + ' « ' + (f.nomCours || f.titre || '?') + ' »' +
              (f.session ? ' · ' + f.session + ' ' + (f.annee || '') : '') +
              (f.heuresContact ? ' · ' + f.heuresContact + ' h' : '') +
              (f.ponderation ? ' · pond. ' + f.ponderation : ''));
        });
        if (fiches.length === 0) L('    ⚠ aucune fiche : le cours est peut-être déjà retiré.');
        L('');

        // ── 2. Ce qui le référence, clé par clé ──────────────────────────
        var toutes = await _toutesLesCles();
        var cibles = [];          // { cle, garde:[], retire:[] }
        var gcDependants = [];    // groupes-cours pointant ce cours

        for (var i = 0; i < toutes.length; i++) {
            var k = toutes[i];
            if (!SUFFIXES_FK.some(function (s) { return k === s || k.endsWith('_' + s); })) continue;
            var valeur = null;
            try { valeur = await db.get(k, null); } catch (e) { continue; }
            if (!Array.isArray(valeur)) continue;

            var retire = valeur.filter(function (it) { return it && it.coursId === coursId; });
            if (retire.length === 0) continue;
            var garde = valeur.filter(function (it) { return !(it && it.coursId === coursId); });
            cibles.push({ cle: k, garde: garde, retire: retire, total: valeur.length });

            if (k.endsWith('_groupesCours')) {
                retire.forEach(function (g) {
                    if (g && g.id) gcDependants.push({ gc: g, cle: k });
                });
            }
        }

        if (cibles.length === 0) {
            L('— aucune donnée ne référence ce cours.');
        } else {
            L('— données référençant le cours :');
            cibles.forEach(function (c) {
                L('    · ' + c.cle + ' : ' + c.retire.length + ' / ' + c.total + ' item(s) retiré(s)');
            });
        }
        L('');

        // ── 3. Les groupes-cours dépendants, et ce QU'ILS portent ────────
        var risque = [];
        if (gcDependants.length) {
            L('— groupes-cours dépendants :');
            for (var g = 0; g < gcDependants.length; g++) {
                var gc = gcDependants[g].gc;
                var trim = gcDependants[g].cle.replace(/_groupesCours$/, '');
                // Ce que ce groupe-cours porte réellement : effectifs et traces.
                var nbEtu = 0, nbEval = 0, nbPres = 0;
                try {
                    var etu = await db.get(trim + '_groupeEtudiants', []) || [];
                    nbEtu = (Array.isArray(etu) ? etu : []).filter(function (e) {
                        return e && (e.groupeCoursId === gc.id || e.coursId === coursId);
                    }).length;
                    var ev = await db.get(trim + '_evaluationsSauvegardees', []) || [];
                    nbEval = (Array.isArray(ev) ? ev : []).filter(function (e) { return e && e.coursId === coursId; }).length;
                    var pr = await db.get(trim + '_presences', []) || [];
                    nbPres = (Array.isArray(pr) ? pr : []).filter(function (p) { return p && p.coursId === coursId; }).length;
                } catch (e) { /* comptage best-effort */ }

                var cleSnap = trim + '_snapshots_' + gc.id;
                var snapPresent = toutes.indexOf(cleSnap) !== -1;
                L('    · ' + gc.id + ' (groupe ' + (gc.groupeNum || gc.groupe || '?') + ', ' + trim + ')' +
                  ' — ' + nbEtu + ' étudiant·e(s), ' + nbEval + ' évaluation(s), ' + nbPres + ' présence(s)' +
                  (snapPresent ? ' · snapshots présents (' + cleSnap + ')' : ''));
                if (nbEtu || nbEval || nbPres) risque.push(gc.id);
                if (snapPresent) cibles.push({ cle: cleSnap, garde: null, retire: null, total: null, supprimerCle: true });
            }
            L('');
        }

        // ── 4. Le pointeur de contexte ───────────────────────────────────
        var infoCours = db.getSync('infoCours', null);
        var pointeurVise = !!(infoCours && (infoCours.id === coursId || infoCours.coursId === coursId));
        if (pointeurVise) {
            L('⚠ `infoCours` pointe ce cours : il sera remis à null (l\'app re-sélectionnera au prochain rendu).');
            L('');
        }

        // ── 5. Décision ──────────────────────────────────────────────────
        if (risque.length && !forcer) {
            L('⛔ REFUS : ' + risque.length + ' groupe-cours dépendant(s) portent des données réelles');
            L('   (étudiants, évaluations ou présences) : ' + risque.join(', '));
            L('   Un cours « fictif » qui traîne des traces réelles n\'est pas fictif — vérifie d\'abord.');
            L('   Si tu confirmes que tout cela est du test :');
            L('       await retirerCours(\'' + coursId + '\', { executer: true, forcer: true })');
            console.log(out.join('\n'));
            return;
        }

        if (!executer) {
            L('DRY-RUN terminé. Rien n\'a été écrit.');
            L('Si le plan est bon ET que le backup Codex est fait :');
            L('    await retirerCours(\'' + coursId + '\', { executer: true' + (risque.length ? ', forcer: true' : '') + ' })');
            console.log(out.join('\n'));
            return;
        }

        // ── 6. Exécution ─────────────────────────────────────────────────
        window._preRetraitCours = { cles: {}, infoCours: infoCours };
        for (var c = 0; c < cibles.length; c++) {
            var cible = cibles[c];
            var avant = await db.get(cible.cle, null);
            window._preRetraitCours.cles[cible.cle] = JSON.parse(JSON.stringify(avant));
            if (cible.supprimerCle) {
                await db.remove(cible.cle);
                L('✔ ' + cible.cle + ' : clé SUPPRIMÉE');
            } else {
                await db.set(cible.cle, cible.garde);
                L('✔ ' + cible.cle + ' : ' + cible.total + ' → ' + cible.garde.length + ' item(s)');
            }
        }
        var magasinApres = (db.getSync('cours', []) || []).filter(function (x) { return !(x && x.id === coursId); });
        window._preRetraitCours.cles['cours'] = JSON.parse(JSON.stringify(db.getSync('cours', []) || []));
        db.setSync('cours', magasinApres);
        L('✔ cours : ' + magasin.length + ' → ' + magasinApres.length + ' fiche(s)');

        if (pointeurVise) {
            db.setSync('infoCours', null);
            L('✔ infoCours remis à null');
        }
        L('');
        L('✅ Terminé. RECHARGE la page (Cmd+R).');
        L('   Filet même-session : annulerRetraitCours(). Filet durable : ton backup Codex.');
        console.log(out.join('\n'));
    };

    window.annulerRetraitCours = async function () {
        var pre = window._preRetraitCours;
        if (!pre || !pre.cles || !Object.keys(pre.cles).length) {
            console.log('Retrait de cours : aucune pré-image en mémoire (page rechargée ?). Filet : backup Codex.');
            return;
        }
        for (var k of Object.keys(pre.cles)) {
            if (pre.cles[k] === null) { await db.remove(k); }
            else { await db.set(k, pre.cles[k]); }
            console.log('↩ ' + k + ' restauré');
        }
        if (pre.infoCours !== undefined) db.setSync('infoCours', pre.infoCours);
        window._preRetraitCours = null;
        console.log('✅ Annulation faite. Recharge la page.');
    };

    console.log('Retrait de cours chargé. D\'abord :  await retirerCours(\'<idDuCours>\')  (dry-run)');
})();
