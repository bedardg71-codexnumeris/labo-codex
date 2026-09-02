/* ============================================================================
   #674 · SONDE — LES CRITÈRES SANS IDENTIFIANT, ET LES ÉVALUATIONS QUI EN PORTENT
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   CE QU'ELLE MESURE, ET POURQUOI. L'éditeur de grille en lignes ajoutait un
   critère SANS identifiant (`grilles.js`, « Nouveau critère » — tari le
   2 septembre 2026). L'éditeur travaille par index et ne voyait rien ; l'écran
   d'évaluation travaille par identifiant : plusieurs critères sans `id` y
   deviennent UN SEUL (`eval_undefined`). Le niveau choisi sur l'un est lu sur
   le premier, la note porte ce seul niveau sur leur poids cumulé, la cartouche
   et le PDF impriment le premier sous tous. Mesuré sur « Grille-5 FR-ALGO A26 »
   (sonde `diagnostic-674-ids-criteres.js`) : 4 critères sur 5 sans identifiant.

   TARIR N'EST PAS RÉPARER. Le correctif empêche la naissance de nouveaux
   critères sans identifiant. Il ne touche AUCUNE grille déjà écrite, ni aucune
   évaluation. Cette sonde dit combien il y en a, où, et ce qu'elles portent —
   pour que la réparation soit décidée sur des chiffres, par Grégoire.

   ⚠ CE QU'ELLE NE PEUT PAS DIRE. Pour une évaluation faite sur une telle
   grille, les niveaux que l'enseignant·e a CHOISIS à l'écran sur les critères
   sans identifiant n'ont jamais été enregistrés : le modèle a gardé, pour tous,
   la valeur du premier. La sonde montre les niveaux ENREGISTRÉS (identiques
   entre eux quand le mécanisme a joué) ; les jugements réels sont perdus.

   USAGE — dans la console du navigateur, sur l'application ouverte :
       (coller le contenu de ce fichier, puis)
       await diag674SansId()

   Le rapport commence par « ==== #674 · critères sans identifiant ».
   ========================================================================= */

(function () {
    'use strict';

    async function lire(cle) {
        try { return await db.get(cle); } catch (e) { return null; }
    }

    async function toutesLesCles() {
        const vues = new Set();
        try { (await db.keys()).forEach(k => vues.add(k)); } catch (e) { /* IDB indisponible */ }
        for (let j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j));
        return Array.from(vues);
    }

    const sansId = (c) => !c || c.id === undefined || c.id === null || String(c.id).trim() === '';
    const prefixeDe = (cle, base) => { const i = cle.indexOf(base); return i <= 0 ? '' : cle.slice(0, i); };

    async function diag674SansId() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #674 · critères sans identifiant · LECTURE SEULE ====');
        L('');

        const cles = await toutesLesCles();
        const clesGrilles = cles.filter(k => k.endsWith('grillesTemplates') || k === 'bibliothequeGrilles').sort();
        const clesEvals = cles.filter(k => k.endsWith('evaluationsSauvegardees')).sort();

        L('---- GRILLES (' + clesGrilles.length + ' clé(s) lue(s) : ' + clesGrilles.join(', ') + ') ----');
        const grillesTouchees = [];   // { cle, id, nom, sansId: [noms], total }
        let totalGrilles = 0;
        for (const k of clesGrilles) {
            const grilles = (await lire(k)) || [];
            for (const g of grilles) {
                if (!g) continue;
                totalGrilles++;
                const crit = Array.isArray(g.criteres) ? g.criteres : [];
                const fautifs = crit.filter(sansId).map(c => (c && c.nom) || '(sans nom)');
                if (fautifs.length) grillesTouchees.push({ cle: k, id: g.id, nom: g.nom || g.id, sansId: fautifs, total: crit.length });
            }
        }
        L('  grilles parcourues ....................... ' + totalGrilles);
        L('  grilles avec au moins un critère sans id . ' + grillesTouchees.length);
        for (const g of grillesTouchees) {
            L('  · « ' + g.nom + ' »  [' + g.cle + ']  ' + g.sansId.length + ' sur ' + g.total + ' : ' + g.sansId.join(', '));
        }
        L('');

        L('---- ÉVALUATIONS (' + clesEvals.length + ' clé(s) lue(s)) ----');
        const idsGrillesTouchees = new Set(grillesTouchees.map(g => g.id));
        let totalEvals = 0, totalRemplacees = 0;
        const touchees = [];
        for (const k of clesEvals) {
            const evaluations = (await lire(k)) || [];
            for (const e of evaluations) {
                if (!e) continue;
                totalEvals++;
                if (e.remplaceeParId) { totalRemplacees++; continue; }
                const crit = Array.isArray(e.criteres) ? e.criteres : [];
                const entreesSansId = crit.filter(c => !c || c.critereId === undefined || c.critereId === null || String(c.critereId).trim() === '');
                if (!entreesSansId.length && !idsGrillesTouchees.has(e.grilleId)) continue;
                const niveaux = entreesSansId.map(c => c.niveauSelectionne || '');
                touchees.push({
                    cle: k, id: e.id, da: e.etudiantDA || '(sans DA)', production: e.productionNom || e.productionId || '(sans production)',
                    grille: e.grilleNom || e.grilleId, note: e.noteFinale, portee: e.ponderationCouverte,
                    statut: e.statutRemise || '(non dit)', verrouillee: !!e.verrouillee, date: e.dateEvaluation || '(sans date)',
                    entreesSansId: entreesSansId.length, niveaux: niveaux,
                    niveauxIdentiques: niveaux.length > 1 && new Set(niveaux).size === 1
                });
            }
        }
        L('  évaluations parcourues .................. ' + totalEvals);
        L('  écartées car remplacées ................. ' + totalRemplacees);
        L('  TOUCHÉES (entrées sans critereId, ou grille touchée) ' + touchees.length);
        const identiques = touchees.filter(t => t.niveauxIdentiques).length;
        L('  dont niveaux enregistrés tous IDENTIQUES  ' + identiques + '   (le mécanisme a joué : un seul niveau pour tous)');
        L('');
        for (const t of touchees) {
            L('  · ' + t.da + ' — ' + t.production + '  [' + t.cle + ']');
            L('      grille : ' + t.grille + ' · ' + t.entreesSansId + ' entrée(s) sans identifiant · niveaux ' + JSON.stringify(t.niveaux)
              + (t.niveauxIdentiques ? '  ⚠ identiques' : ''));
            L('      note ' + t.note + ' · portée ' + t.portee + ' · statut ' + t.statut + ' · verrouillée ' + t.verrouillee + ' · ' + t.date);
        }
        L('');
        L('⚠ « touchée » ne veut pas dire « fausse » : une évaluation où l\'enseignant·e voulait le même');
        L('  niveau partout est juste. Mais RIEN ne distingue ce cas de l\'autre : les jugements');
        L('  distincts, s\'il y en a eu, n\'ont jamais été enregistrés. C\'est à Grégoire de dire,');
        L('  copie par copie ou en bloc, ce qui doit être réévalué.');
        L('');
        L('==== fin #674 · critères sans identifiant · aucune écriture effectuée ====');
        console.log(out.join('\n'));
        return { grilles: grillesTouchees, evaluations: touchees };
    }

    window.diag674SansId = diag674SansId;
    console.log('#674 · sonde chargée. Lance :  await diag674SansId()');
})();
