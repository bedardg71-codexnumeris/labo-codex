/* ============================================================================
   #832 — LA PALETTE PARAMÈTRES N'AFFICHE PAS L'ÉCHELLE DE PERFORMANCE (H2026)
   ----------------------------------------------------------------------------
   Après #831 (grilles recréées), l'évaluation H2026 s'ouvre avec sa grille,
   mais le menu « Échelle de performance » reste vide (capture 15 h 03).
   L'évaluation porte `echelleId 1767389426695`, présente dans le trimestre
   sous le nom « IDME et niv 0 (restaurée #542) ». Cette sonde imprime ce que
   le menu CONTIENT (ses options), ce que l'échelle EST (ses champs), et ce que
   la résolution de l'échelle de la pratique rend — pour savoir pourquoi la
   valeur de l'évaluation ne trouve pas d'option.

   ⛔ LECTURE SEULE. ⛔ AUCUNE DONNÉE PERSONNELLE (ids et noms d'échelles, de
   pratiques ; comptes).
   Usage : ouvre une évaluation H2026 dans Annoter et évaluer (palette
   Paramètres visible), puis Finder → scripts → glisser ce fichier dans un
   nouvel onglet → Cmd+A, Cmd+C → console de l'application (Cmd+Option+J) →
   Cmd+V, Entrée.
   ============================================================================ */
(function () {
    'use strict';
    var out = [];
    var P = function (s) { out.push(s); };
    P('==== #832 · échelle de la palette · LECTURE SEULE ====');
    try {
        var sel = document.getElementById('selectEchelle1');
        P('menu #selectEchelle1 : ' + (sel ? sel.options.length + ' option(s), valeur « ' + sel.value + ' », disabled=' + sel.disabled : 'ABSENT du DOM'));
        if (sel) Array.prototype.forEach.call(sel.options, function (o) { P('  option value=' + JSON.stringify(o.value) + ' · ' + o.textContent); });
        var selG = document.getElementById('selectGrille1');
        P('menu #selectGrille1 : valeur « ' + (selG && selG.value) + ' »');
        var ec = (typeof evaluationEnCours !== 'undefined' && evaluationEnCours) ? evaluationEnCours : (window.evaluationEnCours || null);
        P('evaluationEnCours : ' + (ec ? 'grilleId=' + ec.grilleId + ' echelleId=' + JSON.stringify(ec.echelleId) + ' cartoucheId=' + ec.cartoucheId : 'non exposée'));

        var echelles = db.getSync(cle('echellesTemplates'), []) || [];
        P('échelles du trimestre (' + cle('echellesTemplates') + ') : ' + echelles.length);
        echelles.forEach(function (e) {
            P('  ' + e.id + ' · « ' + e.nom + ' » · niveaux=' + ((e.niveaux || []).length) + ' · dansBibliotheque=' + JSON.stringify(e.dansBibliotheque) + ' · isDemo=' + JSON.stringify(e.isDemo) + ' · type=' + JSON.stringify(e.type) + ' · champs=' + JSON.stringify(Object.keys(e)));
        });
        var grilles = db.getSync(cle('grillesTemplates'), []) || [];
        var g = grilles.find(function (x) { return selG && x && x.id === selG.value; });
        P('grille sélectionnée : ' + (g ? g.id + ' · echelleId=' + JSON.stringify(g.echelleId) : 'introuvable'));

        var gca = db.getSync('groupeCoursActif', null);
        var gcs = db.getSync(cle('groupesCours'), []) || [];
        var gc = gcs.find(function (x) { return gca && x && x.id === gca.id; });
        P('groupe-cours actif : ' + (gc && gc.id) + ' · pratiqueId=' + JSON.stringify(gc && gc.pratiqueId));
        var prats = db.getSync(cle('pratiquesConfigurables'), []) || [];
        var prat = prats.find(function (p) { return gc && p && p.id === gc.pratiqueId; });
        P('pratique du GC : ' + (prat ? prat.id + ' « ' + prat.nom + ' » · config.echelleId=' + JSON.stringify(prat.config && prat.config.echelleId) + ' · config.echelle=' + (prat.config && prat.config.echelle ? 'objet embarqué (' + ((prat.config.echelle.niveaux || []).length) + ' niveaux, id ' + prat.config.echelle.id + ')' : 'absent') : 'INTROUVABLE dans ' + cle('pratiquesConfigurables') + ' (' + prats.length + ' pratiques)'));
        if (typeof _resoudreEchellePratique === 'function') {
            var r = _resoudreEchellePratique();
            P('_resoudreEchellePratique() → ' + (r ? r.id + ' « ' + r.nom + ' »' : String(r)));
        } else P('_resoudreEchellePratique : privée au module (non appelable d\'ici)');
        var modalites = db.getSync(cle('modalitesEvaluation'), null) || {};
        P('modalitesEvaluation.echelleId : ' + JSON.stringify(modalites.echelleId) + ' ; typePAN : ' + JSON.stringify(modalites.typePAN));
        var evals = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        var parEch = {}; evals.forEach(function (e) { var k = (e && e.echelleId) || '(vide)'; parEch[k] = (parEch[k] || 0) + 1; });
        P('evaluations par echelleId : ' + JSON.stringify(parEch));
    } catch (e) {
        P('ERREUR : ' + (e && e.message));
    }
    P('==== fin #832 ====');
    var texte = out.join('\n');
    console.log(texte);
    return texte;
})();
