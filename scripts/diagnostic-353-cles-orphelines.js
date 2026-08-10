/* ============================================================================
   DIAGNOSTIC #353 — clés ORPHELINES de localStorage (lecture seule)
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

   Usage : console (Cmd+Option+J), coller, Entrée. Puis coller le rapport.
   ⚠ À lancer dans CHAQUE navigateur : Chrome et Safari sont deux îles de
   stockage distinctes (leçon #154/#346), et leurs orphelines diffèrent.
   ============================================================================ */
(function () {
    'use strict';

    var out = [];
    var L = function (s) { out.push(s); };
    L('==== DIAG #353 · clés orphelines (LECTURE SEULE) ====');

    // ── Registres vivants ────────────────────────────────────────────────
    var trimestres = [];
    try { trimestres = db.getSync('trimestres', []) || []; } catch (e) { trimestres = []; }
    var idsTrimestres = {};
    trimestres.forEach(function (t) { if (t && t.id) idsTrimestres[t.id] = true; });

    var coursVivants = {};
    try {
        (db.getSync('cours', []) || []).forEach(function (c) { if (c && c.id) coursVivants[c.id] = true; });
    } catch (e) { /* magasin illisible : on le dira plus bas */ }

    L('Trimestres déclarés : ' + (Object.keys(idsTrimestres).join(', ') || 'AUCUN'));
    L('Cours au magasin    : ' + (Object.keys(coursVivants).join(', ') || 'AUCUN'));
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
    var SANS_PRODUCTEUR = ['simulation_indicesCP'];

    toutes.forEach(function (x) {
        // 1. Préfixe de trimestre absent du registre `trimestres`.
        var m = PREFIXE_TRIMESTRE.exec(x.cle);
        if (m && !idsTrimestres[m[1]]) {
            familles.trimestreInconnu.push(x);
            return;
        }
        // 2. Snapshots nommés d'après un coursId qui n'existe plus.
        //    Forme réelle : `<trim>_snapshots_<coursId>` (snapshots.js:96).
        var ms = /_snapshots_(.+)$/.exec(x.cle);
        if (ms && Object.keys(coursVivants).length > 0 && !coursVivants[ms[1]]) {
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
    bloc('SNAPSHOTS orphelins (coursId inconnu du magasin)', familles.snapshotOrphelin,
         'Nommés `<trim>_snapshots_<coursId>` : plus aucun lecteur ne reconstruit ce nom.');
    bloc('SANS PRODUCTEUR connu dans js/', familles.sansProducteur,
         'Résidu d\'une version antérieure — aucun code n\'écrit ni ne lit ce nom aujourd\'hui.');

    L('TOTAL localStorage : ' + Math.round(total / 1024) + ' K car. (' +
      (100 * total / (5 * 1024 * 1024)).toFixed(1) + ' % du quota, ' + toutes.length + ' clés)');
    L('RÉCUPÉRABLE identifié : ' + Math.round(recuperable / 1024) + ' K car. (' +
      (100 * recuperable / total).toFixed(1) + ' % de l\'occupation)');
    L('');
    L('⚠ Rien n\'a été supprimé. Ce rapport est l\'entrée d\'une décision, pas son exécution.');
    L('==== FIN DIAG #353 ====');
    console.log(out.join('\n'));
})();
