/* ============================================================================
   #353 — clés ORPHELINES de localStorage : LE MÊME SCRIPT RECENSE ET PURGE
   ----------------------------------------------------------------------------
   Le relevé du 10 août (Chrome 100 % / Safari 88,3 % du quota) a montré, dans
   le top 20, des clés dont plus rien ne devrait dépendre :

     · `a2024_*`            — présentes en Chrome SEULEMENT (363 K car. à deux)
     · `h2026_snapshots_COURS1766455789356` — clé de snapshots nommée d'après
       l'id de cours d'AVANT la migration, celui que #154 a réapparié
     · `simulation_indicesCP` — AUCUN producteur dans tout `js/` (vérifié au
       grep le 10 août) : résidu d'une version antérieure

   Ce script ne SUPPOSE rien : il confronte chaque clé aux registres vivants
   (`trimestres`, magasin `cours`) et ne classe « orpheline » que ce qui n'a
   plus de référent. Il n'écrit RIEN — la suppression est un geste séparé, à
   décider sur ce rapport.

   ⮕ POURQUOI RECENSER ET PURGER DANS LE MÊME FICHIER. Le 10 août, une
   première version classait des snapshots VIVANTS comme orphelins (elle les
   comparait au seul magasin `cours` alors qu'ils sont nommés d'après le
   GROUPE-COURS). Si le rapport et la purge vivaient dans deux scripts, la
   correction de l'un pourrait ne pas atteindre l'autre — et on supprimerait
   sur une classification périmée. Ici, ce qui décide EST ce qui agit.

   - coller le fichier            → DRY-RUN automatique, n'écrit rien
   - `await reparer353({ executer: true, familles: ['sansProducteur'] })`
   - `await reparer353({ executer: true, familles: ['snapshots'] })`
   - `await reparer353({ executer: true, familles: ['trimestres'],
                         trimestres: ['a2024'] })`   ← à NOMMER explicitement
   - `annuler353()`               → restaure (même session ; filet durable =
                                    backup Codex)

   ⚠ À lancer dans CHAQUE navigateur : Chrome et Safari sont deux îles de
   stockage distinctes (leçon #154/#346), et leurs orphelines diffèrent.
   ============================================================================ */
(function () {
    'use strict';

window.reparer353 = async function (opts) {
    opts = opts || {};
    var executer = !!opts.executer;
    var famillesDemandees = opts.familles || [];
    var trimestresAutorises = opts.trimestres || [];

    var out = [];
    var L = function (s) { out.push(s); };
    L('==== #353 · clés orphelines · ' + (executer ? '⚠ EXÉCUTION' : 'DRY-RUN (rien ne sera écrit)') + ' ====');

    // ── Registres vivants ────────────────────────────────────────────────
    var trimestres = [];
    try { trimestres = db.getSync('trimestres', []) || []; } catch (e) { trimestres = []; }
    var idsTrimestres = {};
    trimestres.forEach(function (t) { if (t && t.id) idsTrimestres[t.id] = true; });

    var coursVivants = {};
    try {
        (db.getSync('cours', []) || []).forEach(function (c) { if (c && c.id) coursVivants[c.id] = true; });
    } catch (e) { /* magasin illisible : on le dira plus bas */ }

    // ⚠⚠ CORRECTIF DU 10 AOÛT — LA PREMIÈRE VERSION DE CE SCRIPT SE TROMPAIT ICI,
    // et le faux positif aurait coûté cher.
    //
    // `cleSnapshots()` (snapshots.js:90) construit `<trim>_snapshots_<id>` où
    // `<id>` vient d'`obtenirCoursIdPourSnapshots()` : **`infoCours._groupeCoursId`
    // EN PRIORITÉ**, et seulement à défaut `infoCours.id`. La variable s'appelle
    // `coursId` mais porte, dans le cas normal, un id de GROUPE-COURS — le
    // commentaire du module le dit d'ailleurs : « Clé format :
    // h2026_snapshots_GC123456789 ».
    //
    // ⮕ Confronter ces clés au seul magasin `cours` classait donc TOUS les
    // snapshots vivants comme orphelins : chez Grégoire, 4 clés bien réelles
    // (115 + 95 + 91 + 55 K car.) de trajectoires hebdomadaires a2025/h2026.
    // Les supprimer aurait détruit des données actives.
    //
    // On accepte désormais les DEUX registres : cours ET groupes-cours de chaque
    // trimestre. Un suffixe inconnu des deux est seul déclaré orphelin.
    var idsAcceptes = {};
    Object.keys(coursVivants).forEach(function (id) { idsAcceptes[id] = 'cours'; });
    var nbGC = 0;
    Object.keys(idsTrimestres).concat(['demo']).forEach(function (t) {
        var liste = [];
        try { liste = db.getSync(t + '_groupesCours', []) || []; } catch (e) { liste = []; }
        (Array.isArray(liste) ? liste : []).forEach(function (g) {
            if (g && g.id) { idsAcceptes[g.id] = 'groupe-cours'; nbGC++; }
            // Le pointeur peut aussi porter le coursId du GC : l'accepter aussi.
            if (g && g.coursId) idsAcceptes[g.coursId] = 'cours (via GC)';
        });
    });

    L('Trimestres déclarés  : ' + (Object.keys(idsTrimestres).join(', ') || 'AUCUN'));
    L('Cours au magasin     : ' + (Object.keys(coursVivants).join(', ') || 'AUCUN'));
    L('Groupes-cours connus : ' + nbGC);
    if (nbGC === 0) {
        L('⚠ AUCUN groupe-cours lu : la section « snapshots » ne peut pas conclure.');
        L('  Elle sera SAUTÉE plutôt que de désigner des données vivantes.');
    }
    L('');

    // ── Inventaire de localStorage ───────────────────────────────────────
    var toutes = [];
    var total = 0;
    for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k === null) continue;
        var n = k.length + (localStorage.getItem(k) || '').length;
        total += n;
        toutes.push({ cle: k, car: n });
    }

    var familles = { trimestreInconnu: [], snapshotOrphelin: [], sansProducteur: [] };
    var PREFIXE_TRIMESTRE = /^([aeh]\d{4})_/;
    // Clés sans producteur connu, constatées au grep le 10 août 2026.
    // `etudiantsSuivis` (nue) : plus écrite depuis #749 (11 sept. 2026) — la liste
    // vit sous `<trim>_etudiantsSuivis_gc_<gcId>` ; la nue a été LUE une fois
    // pour le semis et laissée en place, exprès (réversibilité).
    // `datesVerrouillees` (nue) : plus écrite depuis #749 lot 3 (11 sept. 2026) — le
    // verrou vit sous `<trim>_datesVerrouillees_gc_<gcId>` ; la nue est LUE une fois
    // (semis, la liste entière) et laissée en place, exprès. Les quatre états d'écran
    // de la saisie (`presences_*`, `recherchePresences`) sont passés sous `cle()` le
    // même jour, sans semis : leurs nues sont de simples orphelines.
    var SANS_PRODUCTEUR = ['simulation_indicesCP', 'etudiantsSuivis', 'datesVerrouillees',
        'presences_date', 'presences_groupe', 'presences_tri', 'recherchePresences'];

    toutes.forEach(function (x) {
        // 1. Préfixe de trimestre absent du registre `trimestres`.
        var m = PREFIXE_TRIMESTRE.exec(x.cle);
        if (m && !idsTrimestres[m[1]]) {
            familles.trimestreInconnu.push(x);
            return;
        }
        // 2. Snapshots dont le suffixe n'est NI un cours NI un groupe-cours.
        //    Forme réelle : `<trim>_snapshots_<id>` où `<id>` est le
        //    `_groupeCoursId` en priorité (snapshots.js:77-96).
        //    ⚠ On ne conclut QUE si les registres ont pu être lus : sans eux,
        //    tout paraîtrait orphelin — c'est exactement le faux positif du
        //    premier jet. Mieux vaut ne rien dire que désigner du vivant.
        var ms = /_snapshots_(.+)$/.exec(x.cle);
        if (ms && nbGC > 0 && !idsAcceptes[ms[1]]) {
            familles.snapshotOrphelin.push(x);
            return;
        }
        // 3. Clés dont aucun code ne produit plus le nom.
        if (SANS_PRODUCTEUR.indexOf(x.cle) !== -1) familles.sansProducteur.push(x);
    });

    var recuperable = 0;
    var bloc = function (titre, liste, note) {
        var somme = liste.reduce(function (a, x) { return a + x.car; }, 0);
        recuperable += somme;
        L('— ' + titre + ' : ' + liste.length + ' clé(s), ' + Math.round(somme / 1024) + ' K car.');
        if (note) L('    ' + note);
        liste.sort(function (a, b) { return b.car - a.car; })
             .forEach(function (x) { L('    · ' + Math.round(x.car / 1024) + ' K car.  ' + x.cle); });
        if (liste.length === 0) L('    (aucune)');
        L('');
    };

    bloc('TRIMESTRE ABSENT du registre', familles.trimestreInconnu,
         '⚠ Vérifier AVANT de supprimer : un trimestre archivé peut être légitime et vouloir être conservé.');
    bloc('SNAPSHOTS orphelins (suffixe inconnu des DEUX registres)', familles.snapshotOrphelin,
         'Nommés `<trim>_snapshots_<id>` où `<id>` est un GROUPE-COURS en priorité (snapshots.js:77).\n' +
         '    Confrontés ici aux cours ET aux groupes-cours : un snapshot vivant n\'est plus signalé.');
    bloc('SANS PRODUCTEUR connu dans js/', familles.sansProducteur,
         'Résidu d\'une version antérieure — aucun code n\'écrit ce nom aujourd\'hui.\n' +
         '    (`etudiantsSuivis` est encore LU, une fois, par le semis de #749 : le supprimer\n' +
         '    après la première ouverture de chaque groupe-cours, pas avant.)');

    L('TOTAL localStorage : ' + Math.round(total / 1024) + ' K car. (' +
      (100 * total / (5 * 1024 * 1024)).toFixed(1) + ' % du quota, ' + toutes.length + ' clés)');
    L('RÉCUPÉRABLE identifié : ' + Math.round(recuperable / 1024) + ' K car. (' +
      (100 * recuperable / total).toFixed(1) + ' % de l\'occupation)');
    L('');

    // ── PURGE — seulement ce qui est demandé NOMMÉMENT ───────────────────
    // Chaque famille doit être réclamée : rien n'est supprimé « parce que
    // c'était dans le rapport ». Et un trimestre entier exige EN PLUS d'être
    // nommé — c'est le geste le plus lourd du lot.
    var aSupprimer = [];
    if (famillesDemandees.indexOf('sansProducteur') !== -1) {
        familles.sansProducteur.forEach(function (x) { aSupprimer.push(x); });
    }
    if (famillesDemandees.indexOf('snapshots') !== -1) {
        if (nbGC === 0) {
            L('⛔ REFUS (snapshots) : aucun groupe-cours lisible, la classification n\'a pas pu conclure.');
        } else {
            familles.snapshotOrphelin.forEach(function (x) { aSupprimer.push(x); });
        }
    }
    if (famillesDemandees.indexOf('trimestres') !== -1) {
        if (!trimestresAutorises.length) {
            L('⛔ REFUS (trimestres) : il faut NOMMER les préfixes à purger, ex. { trimestres: [\'a2024\'] }.');
            L('   Supprimer un trimestre entier sans le nommer serait un geste trop large pour un défaut.');
        } else {
            familles.trimestreInconnu.forEach(function (x) {
                var m2 = PREFIXE_TRIMESTRE.exec(x.cle);
                if (m2 && trimestresAutorises.indexOf(m2[1]) !== -1) aSupprimer.push(x);
                else L('   ⤬ ' + x.cle + ' — préfixe non nommé, CONSERVÉ');
            });
        }
    }

    if (!executer) {
        L('⚠ Rien n\'a été supprimé — ce rapport est l\'entrée d\'une décision.');
        if (famillesDemandees.length) {
            L('   (familles demandées : ' + famillesDemandees.join(', ') + ' → ' + aSupprimer.length + ' clé(s) visée(s))');
        }
        L('   Pour purger, après backup Codex :');
        L('     await reparer353({ executer: true, familles: [\'sansProducteur\'] })');
        L('     await reparer353({ executer: true, familles: [\'snapshots\'] })');
        L('     await reparer353({ executer: true, familles: [\'trimestres\'], trimestres: [\'a2024\'] })');
        L('==== FIN #353 ====');
        console.log(out.join('\n'));
        return;
    }

    if (!aSupprimer.length) {
        L('Rien à supprimer pour les familles demandées.');
        L('==== FIN #353 ====');
        console.log(out.join('\n'));
        return;
    }

    window._pre353 = {};
    var libere = 0;
    for (var s2 = 0; s2 < aSupprimer.length; s2++) {
        var cible = aSupprimer[s2].cle;
        try {
            window._pre353[cible] = await db.get(cible, null);
            await db.remove(cible);
            libere += aSupprimer[s2].car;
            L('✔ supprimée : ' + cible + ' (' + Math.round(aSupprimer[s2].car / 1024) + ' K car.)');
        } catch (e) {
            L('⚠ échec sur ' + cible + ' : ' + (e && e.message));
        }
    }
    L('');
    L('✅ ' + aSupprimer.length + ' clé(s) supprimée(s), ~' + Math.round(libere / 1024) + ' K car. libérés.');
    L('   RECHARGE la page (Cmd+R). Filet même-session : annuler353().');
    L('   Filet durable : ton backup Codex.');
    L('==== FIN #353 ====');
    console.log(out.join('\n'));
};

window.annuler353 = async function () {
    if (!window._pre353 || !Object.keys(window._pre353).length) {
        console.log('#353 : aucune pré-image en mémoire (page rechargée ?). Filet : backup Codex.');
        return;
    }
    for (var k of Object.keys(window._pre353)) {
        await db.set(k, window._pre353[k]);
        console.log('↩ ' + k + ' restaurée');
    }
    window._pre353 = {};
    console.log('✅ Annulation faite. Recharge la page.');
};

// DRY-RUN automatique au collage : lecture seule, aucun risque.
reparer353();
})();
