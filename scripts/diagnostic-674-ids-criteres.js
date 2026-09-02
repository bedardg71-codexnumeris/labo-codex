/* ============================================================================
   #674 · SONDE — LES IDENTIFIANTS DES CRITÈRES D'UNE GRILLE, ET CE QUE PORTE LE
   BROUILLON D'UN ÉLÈVE SUR CETTE GRILLE
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   POURQUOI ELLE EXISTE. Le 2 septembre 2026 à 18 h 50, trois captures mises
   ensemble : le PDF imprimait la MÊME description sous quatre critères qui en
   ont chacun une ; au retour sur la copie, un seul des quatre niveaux était
   restauré. Une seule cause explique les deux : les entrées `criteres[]` du
   brouillon porteraient un même `critereId`, parce que les critères de la
   grille partageraient un identifiant. La sonde le mesure au lieu de le
   supposer (règle 1 : aucune ancre sans sa preuve).

   USAGE — dans la console du navigateur, sur l'application ouverte :
       (coller le contenu de ce fichier, puis)
       sonde674('Grille-5 FR-ALGO A26', '9000259')

   Le rapport commence par « ==== sonde #674 ». Copier-coller la sortie.
   ========================================================================= */

(function () {
    'use strict';

    function sonde674(nomGrille, da) {
        const out = [];
        const L = (m) => out.push(m);
        L('==== sonde #674 · identifiants de critères · LECTURE SEULE ====');

        const grilles = db.getSync(cle('grillesTemplates'), []) || [];
        const g = grilles.find(x => x && x.nom === nomGrille);
        if (!g) {
            L('grille introuvable : « ' + nomGrille + ' »');
            L('noms disponibles : ' + grilles.map(x => x && x.nom).join(' | '));
            console.log(out.join('\n'));
            return { statut: 'grille-introuvable' };
        }
        const criteres = Array.isArray(g.criteres) ? g.criteres : [];
        L('grille ' + JSON.stringify(g.id) + ' · « ' + g.nom + ' » · ' + criteres.length + ' critère(s)');
        criteres.forEach((c, i) => {
            L('  ' + i + '. id=' + JSON.stringify(c && c.id) + ' · ' + (c && c.nom) + ' · ' + (c && c.ponderation) + ' % · type=' + ((c && c.type) || '(aucun)'));
        });
        const ids = criteres.map(c => c && c.id);
        L('identifiants DISTINCTS : ' + new Set(ids).size + ' sur ' + ids.length
          + (new Set(ids).size < ids.length ? '   ⚠ DOUBLONS' : '   (tous distincts)'));

        const evals = (db.getSync(cle('evaluationsSauvegardees'), []) || [])
            .filter(e => e && e.etudiantDA === da && e.grilleId === g.id && !e.remplaceeParId);
        L('');
        L('évaluations actives de ' + da + ' sur cette grille : ' + evals.length);
        evals.forEach(e => {
            L('  ' + e.id + ' · production ' + (e.productionNom || e.productionId) + ' · note ' + e.noteFinale
              + ' · portée ' + e.ponderationCouverte + ' · verrouillée ' + e.verrouillee
              + ' · ' + ((e.criteres || []).length) + ' critère(s) enregistré(s)');
            (e.criteres || []).forEach(c => {
                L('     critereId=' + JSON.stringify(c.critereId) + ' · ' + c.critereNom + ' · niveau ' + c.niveauSelectionne + ' · ' + c.ponderation + ' %');
            });
        });

        const selects = Array.from(document.querySelectorAll('select[id^="eval_"]')).map(s => s.id);
        L('');
        L('sélecteurs de critères présents à l\'écran : ' + JSON.stringify(selects));
        const nu = (typeof evaluationEnCours !== 'undefined') ? evaluationEnCours : null;
        L('evaluationEnCours (nom nu) — critères : ' + JSON.stringify(nu && nu.criteres));
        L('window.evaluationEnCours — critères : ' + JSON.stringify(window.evaluationEnCours && window.evaluationEnCours.criteres));
        L('même objet : ' + (nu === window.evaluationEnCours));
        L('==== fin sonde #674 · aucune écriture effectuée ====');
        console.log(out.join('\n'));
        return { grilleId: g.id, ids: ids, distincts: new Set(ids).size, evaluations: evals.length };
    }

    window.sonde674 = sonde674;
    console.log('#674 · sonde chargée. Lance :  sonde674(\'Grille-5 FR-ALGO A26\', \'9000259\')');
})();
