/* ============================================================================
   #831 — « GRILLE D'ORIGINE INTROUVABLE » SUR LES ÉVALUATIONS H2026, EN LIGNE
   ----------------------------------------------------------------------------
   Rapport de Grégoire du 11 sept. 2026, 14 h 50 (1.131.1) : dans Annoter et
   évaluer, une évaluation d'Hiver 2026 s'affiche « depuis les données
   sauvegardées », la palette Paramètres n'offre ni grille ni échelle.

   Ce que le dossier dit : les 408 évaluations H2026 référencent trois grilles
   (`grille_1770742838756_23q82vbsk`, `grille_1772187755149_uq1oiiafa`,
   `GRILLE1759529438501`) dont la définition manquait au jeu de travail
   (reconstruction de juin, #362). La réparation a été JOUÉE le 5 août au soir,
   dans l'instance LOCALE (`file://`). L'instance en ligne, source unique depuis
   le 8 septembre, est une autre île (leçon #154) : elle porte ce que l'export
   qui l'a alimentée portait. Cette sonde mesure ce que l'instance en ligne
   contient aujourd'hui, pour savoir si c'est le même défaut, non réparé ici,
   ou autre chose.

   ⛔ LECTURE SEULE. ⛔ AUCUNE DONNÉE PERSONNELLE : ids de grilles, d'échelles,
   noms de grilles (ce sont tes modèles, pas des élèves), comptes.
   Même usage : Finder → scripts → glisser dans un nouvel onglet → Cmd+A,
   Cmd+C → console de l'application (Cmd+Option+J) → Cmd+V, Entrée.
   ============================================================================ */
(function () {
    'use strict';
    var out = [];
    var P = function (s) { out.push(s); };
    P('==== #831 · grilles H2026 en ligne · LECTURE SEULE ====');
    try {
        var trim = obtenirTrimestreId();
        P('trimestre actif : ' + trim + ' ; adresse : ' + location.origin);
        var grilles = db.getSync(cle('grillesTemplates'), []) || [];
        P('grilles du trimestre (' + cle('grillesTemplates') + ') : ' + grilles.length);
        grilles.forEach(function (g) {
            P('  ' + g.id + ' · « ' + g.nom + ' » · ' + ((g.criteres || []).length) + ' critère(s) · echelleId=' + JSON.stringify(g.echelleId) + (g.isDemo ? ' · isDemo' : '') + (g.dansBibliotheque === false ? ' · horsBiblio' : ''));
        });
        var attendues = ['grille_1770742838756_23q82vbsk', 'grille_1772187755149_uq1oiiafa', 'GRILLE1759529438501'];
        attendues.forEach(function (id) { P('  attendue ' + id + ' : ' + (grilles.some(function (g) { return g && g.id === id; }) ? 'PRÉSENTE' : 'ABSENTE')); });

        var evals = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        var parGrille = {};
        evals.forEach(function (e) { var k = (e && e.grilleId) || '(sans grilleId)'; parGrille[k] = (parGrille[k] || 0) + 1; });
        P('évaluations du trimestre : ' + evals.length + ' ; par grilleId : ' + JSON.stringify(parGrille));
        var idsGrilles = new Set(grilles.map(function (g) { return g && g.id; }));
        var orphelines = Object.keys(parGrille).filter(function (k) { return !idsGrilles.has(k); });
        P('  grilleId d\'évaluations SANS définition dans le trimestre : ' + JSON.stringify(orphelines));

        var echelles = db.getSync(cle('echellesTemplates'), []) || [];
        P('échelles du trimestre : ' + echelles.length + ' → ' + JSON.stringify(echelles.map(function (e) { return e.id + ' « ' + e.nom + ' »'; })));
        var parEchelle = {};
        evals.forEach(function (e) { var k = (e && e.echelleId) || '(sans echelleId)'; parEchelle[k] = (parEchelle[k] || 0) + 1; });
        P('  par echelleId d\'évaluation : ' + JSON.stringify(parEchelle));

        var pref = obtenirPreference('grilleReferenceDepistage');
        P('préférence grilleReferenceDepistage : ' + JSON.stringify(pref) + ' → ' + (idsGrilles.has(pref) ? 'présente' : 'ABSENTE des grilles du trimestre'));

        // Empreinte des critères : les critereId des évals se retrouvent-ils dans une grille présente ?
        var critereIdsEvals = new Set();
        evals.forEach(function (e) { (e && e.criteres || []).forEach(function (c) { if (c && c.critereId) critereIdsEvals.add(String(c.critereId)); }); });
        var couverture = grilles.map(function (g) {
            var ids = new Set((g.criteres || []).map(function (c) { return String(c.id); }));
            var n = 0; critereIdsEvals.forEach(function (id) { if (ids.has(id)) n++; });
            return g.id + ':' + n + '/' + ids.size;
        });
        P('critereId distincts portés par les évals : ' + critereIdsEvals.size + ' ; couverts par chaque grille présente (grille:communs/critères) : ' + JSON.stringify(couverture));

        // Ce que l'export/import a laissé : autres trimestres qui portent les grilles attendues ?
        var autres = (db.getSync('trimestres', []) || []).map(function (t) { return t && t.id; }).filter(function (id) { return id && id !== trim; });
        autres.forEach(function (t) {
            var gs = db.getSync(t + '_grillesTemplates', []) || [];
            var presentes = attendues.filter(function (id) { return gs.some(function (g) { return g && g.id === id; }); });
            P('  ' + t + '_grillesTemplates : ' + gs.length + ' grille(s) ; attendues présentes : ' + JSON.stringify(presentes));
        });
        P('date des données : ' + (db.getSync('demo-version-installee', null) ? '' : '') + 'dernière importation ? ' + JSON.stringify(db.getSync('derniereImportation', null) || db.getSync('dernierImport', null) || '(inconnue)'));
    } catch (e) {
        P('ERREUR : ' + (e && e.message));
    }
    P('==== fin #831 ====');
    var texte = out.join('\n');
    console.log(texte);
    return texte;
})();
