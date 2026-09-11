/* ============================================================================
   #830 — LA BARRE « ASSIDUITÉ (A) » DU SUIVI DU GROUPE EST VIDE (H2026)
   ----------------------------------------------------------------------------
   Rapport de Grégoire du 11 sept. 2026, 14 h 17 (1.131.0) : « aucun de mes
   groupes de l'hiver 2026 n'affiche l'indice A ». C et P s'affichent.

   Ce que le code dit : la barre A ne montre que les élèves dont
   `indicesAssiduite.sommatif[da].nombreSeances > 0` (tableau-bord-apercu.js,
   afficherMetriquesGlobales). `nombreSeances` vaut 0 quand AUCUNE date des
   séances complètes du groupe-cours n'est aussi une date où des présences
   du groupe ont été saisies (indices.js, calculerAssiduite). Deux causes
   possibles, que seules les données départagent :
     (a) les séances complètes du groupe sont vides — horaire du groupe-cours
         non résolu, cache `seancesCompletes_gc_<id>` vide (famille #129) ;
     (b) les présences sont écartées par le filtre de cours — `coursId` d'un
         ancien format (famille #154/#346), ou groupe de l'élève sans
         correspondance (`groupeReel`/`groupe`).

   ⛔ ELLE N'ÉCRIT RIEN, NULLE PART. Aucun `db.set`, aucune régénération
   (elle lit le cache des séances complètes tel quel, sans appeler
   obtenirSeancesCompletes qui régénère). Elle mesure, elle rapporte.

   ⛔ ELLE NE SORT AUCUNE DONNÉE PERSONNELLE : des comptes, des dates, des
   identifiants de cours et d'horaire. Pas un DA, pas un nom.

   ── COMMENT S'EN SERVIR (une seule fenêtre : le navigateur) ────────────────
   1. Dans l'application, choisis le groupe-cours H2026 dont la barre A est
      vide, et va dans Suivi › Suivi du groupe.
   2. Finder → dossier `scripts` → glisse ce fichier dans un NOUVEL onglet du
      navigateur (il s'affiche en texte) → Cmd+A, Cmd+C.
   3. Reviens sur l'onglet de l'application, ouvre la console
      (Cmd + Option + J), colle (Cmd+V), Entrée.
   4. Le rapport commence par `==== #830 · indice A vide`. Si la console dit
      `is not defined`, c'est que le fichier n'est pas passé en entier.
   5. Copie tout le bloc (il est aussi retourné comme texte) et colle-le dans
      la conversation.
   ============================================================================ */
(function () {
    'use strict';
    var out = [];
    var P = function (s) { out.push(s); };
    var g = function (nom) { return typeof window[nom] === 'function' ? window[nom] : null; };

    P('==== #830 · indice A vide (Suivi du groupe) · LECTURE SEULE ====');
    try {
        var trim = g('obtenirTrimestreId') ? obtenirTrimestreId() : '(obtenirTrimestreId absent)';
        var gca = db.getSync('groupeCoursActif', null);
        var info = db.getSync('infoCours', null);
        var ctx = g('obtenirContexteCoursActif') ? obtenirContexteCoursActif() : null;
        P('trimestre actif : ' + trim
            + ' | groupeCoursActif.id : ' + (gca && gca.id)
            + ' | infoCours.id : ' + (info && info.id) + ' (groupe ' + (info && info.groupe) + ')'
            + ' | contexte.groupe : ' + (ctx && ctx.groupe) + ' modeCours=' + (ctx && ctx._modeCours));

        var gcs = db.getSync(cle('groupesCours'), []) || [];
        P('groupesCours du trimestre : ' + gcs.length + ' ; actif(s) : '
            + gcs.filter(function (x) { return x && x.actif; })
                 .map(function (x) { return x.id + ' / cours ' + x.coursId + ' / gr ' + x.groupeNum + ' / horaire ' + x.horaireId; })
                 .join(' ; '));

        var gc = gcs.find(function (x) { return gca && x && x.id === gca.id; }) || null;
        var horaires = db.getSync(cle('horaires'), []) || [];
        var hor = gc ? horaires.find(function (h) { return h && h.id === gc.horaireId; }) : null;
        P('horaire du GC actif : ' + (gc ? (gc.horaireId || 'AUCUN horaireId') : 'GC actif INTROUVABLE dans la liste du trimestre')
            + ' → ' + (hor ? (hor.seances || []).length + ' séance(s)/semaine (' + (hor.seances || []).map(function (s) { return s.jour; }).join(', ') + ')'
                            : 'horaire INTROUVABLE dans ' + cle('horaires') + ' (' + horaires.length + ' horaire(s))'));
        var idCours = g('obtenirCoursActifId') ? obtenirCoursActifId() : null;
        var seancesRes = g('obtenirSeancesHoraire') ? obtenirSeancesHoraire(idCours) : null;
        P('obtenirSeancesHoraire(' + idCours + ') → ' + (seancesRes ? seancesRes.length + ' séance(s)' : 'fonction absente'));

        var kSC = g('cleSeancesCompletes') ? cleSeancesCompletes(null) : '(cleSeancesCompletes absente)';
        var sc = db.getSync(kSC, null);
        var datesSC = sc ? Object.keys(sc).sort() : [];
        P('séances complètes (cache, non régénéré) : ' + kSC + ' → '
            + (sc ? datesSC.length + ' date(s)' + (datesSC.length ? ' [' + datesSC[0] + ' … ' + datesSC[datesSC.length - 1] + ']' : '') : 'CLÉ ABSENTE'));
        var cal = db.getSync(cle('calendrierComplet'), {}) || {};
        P('calendrierComplet ' + cle('calendrierComplet') + ' : ' + Object.keys(cal).length + ' jour(s)');

        var brut = db.getSync(cle('presences'), []) || [];
        var filt = g('obtenirDonneesSelonMode') ? (obtenirDonneesSelonMode('presences') || []) : [];
        var parCours = {};
        brut.forEach(function (p) { var k = (p && p.coursId) || '(sans coursId)'; parCours[k] = (parCours[k] || 0) + 1; });
        P('présences brutes ' + cle('presences') + ' : ' + brut.length + ' ; après le filtre de cours : ' + filt.length);
        P('  coursId portés par les présences brutes : ' + JSON.stringify(parCours));
        P('  cours au magasin `cours` : ' + JSON.stringify((db.getSync('cours', []) || []).map(function (c) { return c && c.id; })));
        P('  dates distinctes saisies (filtrées, non facultatives) : '
            + new Set(filt.filter(function (p) { return !p.facultatif; }).map(function (p) { return p.date; })).size);

        var et = g('obtenirEtudiantsCoursActif') ? obtenirEtudiantsCoursActif() : [];
        var grp = {};
        et.forEach(function (e) { var k = e.groupeReel || e.groupe || '(aucun)'; grp[k] = (grp[k] || 0) + 1; });
        P('étudiants du cours actif : ' + et.length + ' ; par groupe (groupeReel|groupe) : ' + JSON.stringify(grp));

        var ia = (g('obtenirDonneesSelonMode') ? obtenirDonneesSelonMode('indicesAssiduite') : null) || {};
        var som = ia.sommatif || {};
        var das = Object.keys(som);
        var avec = das.filter(function (d) { return som[d] && som[d].nombreSeances > 0; }).length;
        P('indicesAssiduite.sommatif : ' + das.length + ' élève(s), dont ' + avec + ' avec nombreSeances > 0 ; dateCalcul ' + ia.dateCalcul);

        if (et[0] && g('calculerAssiduite')) {
            var r = calculerAssiduite(et[0].da, null);
            P('calculerAssiduite(1er élève du cours) → nombreSeances=' + r.nombreSeances + ', périodes offertes=' + r.periodesOffertes + ', présentes=' + r.periodesPresentes);
            if (g('construireDatesSaisiesGroupe')) {
                var ds = construireDatesSaisiesGroupe(et[0].da, filt);
                var inter = datesSC.filter(function (d) { return ds.has(d); }).length;
                P('  dates saisies du groupe de cet élève : ' + ds.size + ' ; en commun avec les séances complètes : ' + inter);
            }
        }
        P('aujourd\'hui (dateLocaleYMD) : ' + (g('dateLocaleYMD') ? dateLocaleYMD() : '?'));
        P('avertissements #154 déjà émis cette session : ' + JSON.stringify(window._avertis154 || {}));
    } catch (e) {
        P('ERREUR de la sonde : ' + (e && e.message));
    }
    P('==== fin #830 ====');
    var texte = out.join('\n');
    console.log(texte);
    return texte;
})();
