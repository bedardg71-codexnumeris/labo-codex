/* ============================================================================
   #830 (suite 5) — LES SÉANCES DE L'HORAIRE H2026 PORTENT-ELLES UN NOMBRE DE
   PÉRIODES ?
   ----------------------------------------------------------------------------
   La sonde e a tranché : les 29 dates sont retenues, mais
   `obtenirNombrePeriodesSeance(date)` rend 0 pour chacune. Depuis #540 (lot E1,
   26 août 2026), le nombre de périodes est une donnée SAISIE, portée par la
   séance de l'horaire (`nombrePeriodes`) et propagée aux séances complètes ;
   il ne se déduit plus des heures. Un horaire d'avant, qui n'a que `duree`
   ou `debut`/`fin`, donne donc 0 période — sauf si un repli sait la lire.
   Celle-ci imprime les champs des séances de l'horaire du groupe actif et des
   séances complètes générées, puis ce que le repli rend.

   ⛔ LECTURE SEULE. ⛔ AUCUNE DONNÉE PERSONNELLE (des champs d'horaire).
   Même usage : Finder → scripts → glisser dans un nouvel onglet → Cmd+A,
   Cmd+C → console de l'application (Cmd+Option+J) → Cmd+V, Entrée.
   ============================================================================ */
(function () {
    'use strict';
    var out = [];
    var P = function (s) { out.push(s); };
    P('==== #830f · périodes de l\'horaire · LECTURE SEULE ====');
    try {
        var gca = db.getSync('groupeCoursActif', null);
        var gcs = db.getSync(cle('groupesCours'), []) || [];
        var gc = gcs.find(function (x) { return gca && x && x.id === gca.id; });
        var horaires = db.getSync(cle('horaires'), []) || [];
        var hor = gc ? horaires.find(function (h) { return h && h.id === gc.horaireId; }) : null;
        P('horaire ' + (gc && gc.horaireId) + ' : champs de l\'horaire = ' + JSON.stringify(hor ? Object.keys(hor) : null)
            + ' ; periodesParSeance = ' + JSON.stringify(hor && hor.periodesParSeance));
        (hor && hor.seances || []).forEach(function (s, i) {
            P('  séance ' + i + ' : ' + JSON.stringify({ jour: s.jour, debut: s.debut || s.heureDebut, fin: s.fin || s.heureFin, duree: s.duree, nombrePeriodes: s.nombrePeriodes, champs: Object.keys(s) }));
        });
        var autres = horaires.filter(function (h) { return h && (!gc || h.id !== gc.horaireId); });
        P('autres horaires du trimestre : ' + autres.length + ' → ' + JSON.stringify(autres.map(function (h) { return { id: h.id, seances: (h.seances || []).map(function (s) { return [s.jour, s.nombrePeriodes, s.duree]; }) }; })));

        var sc = db.getSync(cleSeancesCompletes(null), null) || {};
        var dates = Object.keys(sc).sort();
        var d0 = dates[0];
        P('séances complètes : ' + dates.length + ' ; la 1re (' + d0 + ') = ' + JSON.stringify(sc[d0]));
        var sansPeriodes = dates.filter(function (d) { return !(sc[d] || []).some(function (s) { return parseInt(s.nombrePeriodes, 10) > 0; }); }).length;
        P('  dates dont aucune séance ne porte nombrePeriodes > 0 : ' + sansPeriodes + ' / ' + dates.length);
        P('obtenirNombrePeriodesSeance(' + d0 + ') → ' + obtenirNombrePeriodesSeance(d0));
        P('obtenirDureePeriode() → ' + (typeof obtenirDureePeriode === 'function' ? obtenirDureePeriode() : '?'));
        // Une présence saisie de cette date : combien de périodes présentes portait-elle ?
        var pres = (obtenirDonneesSelonMode('presences') || []).filter(function (p) { return p.date === d0; });
        var pp = {}; pres.forEach(function (p) { var k = JSON.stringify(p.periodesPresentes) + '/' + JSON.stringify(p.heures); pp[k] = (pp[k] || 0) + 1; });
        P('présences du ' + d0 + ' : ' + pres.length + ' ; (periodesPresentes/heures) → ' + JSON.stringify(pp));
    } catch (e) {
        P('ERREUR : ' + (e && e.message));
    }
    P('==== fin #830f ====');
    var texte = out.join('\n');
    console.log(texte);
    return texte;
})();
