/* ============================================================================
   #674 — LOT 0 · COMBIEN DE TES ÉVALUATIONS PORTENT UNE COUVERTURE < 100 % ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   CE QU'ELLE MESURE, ET POURQUOI ELLE EXISTE.
   `calculerNote()` saute tout critère sans niveau : il quitte le numérateur ET
   `ponderationTotal`. La division finale renormalise donc les pondérations
   restantes à 100 %. Mesuré le 1er septembre 2026 sous WebKit, grille 50/30/20 :
   perdre le critère à 20 % fait passer la note de 84,0 % (niveau M) à 95,0 %
   (niveau E). Onze points, un niveau de plus, et RIEN ne le déclare —
   `ponderationTotal` n'a que trois occurrences dans `js/` et aucune ne le
   compare à 100 %.
   Pire : `_collecterCriteresSauv` ne pousse un critère que `if (niveau)`. Le
   critère manquant est ABSENT du tableau enregistré, donc absent du PDF remis.
   Une grille amputée est indistinguable d'une grille qui n'a jamais eu ce
   critère.

   LA QUESTION QUE CETTE SONDE TRANCHE, et elle seule :
     zéro écart      → #674 est de la prévention, il s'ouvre à froid ;
     un écart ou plus → il y a des notes à revoir, dont certaines déjà remises.

   ⚠ CE QU'ELLE COMPARE. La somme des pondérations des `criteres[]` ENREGISTRÉS
   de chaque évaluation, contre la somme des pondérations de SA grille. Pas
   contre 100 : une grille dont les pondérations ne totalisent pas 100 rendrait
   toutes ses évaluations suspectes pour la mauvaise raison. L'écart mesuré est
   donc bien « il manque un critère », pas « la grille est mal fichue ».

   ⚠ ELLE NE CONCLUT PAS À TA PLACE. Une évaluation dont la grille a disparu
   n'est pas déclarée saine : elle est comptée À PART, dans « impossible à
   juger ». Un zéro qui inclurait ces cas mentirait (patron des sondes #442,
   #453 et #542).

   ⚠ ELLE NOMME LA CLÉ QUI A SERVI (règle R1 de #636). Elle balaie TOUS les
   trimestres, et lit la grille dans le MÊME espace de noms que l'évaluation —
   c'est exactement la confusion qui a rendu l'outil de réparation muet dans la
   nuit du 31 août (évaluations sous la clé du trimestre, grilles sous la clé
   nue : `find()` rendait `undefined` et la boucle sortait sans rien regarder).

   USAGE — dans la console de Safari, sur l'application ouverte :
       (coller le contenu de ce fichier, puis)
       await diag674()

   Repère : le rapport commence par « ==== #674 · lot 0 ».
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r1 · 1er septembre 2026 · lot 0 de #674';

    async function lire(cle) {
        try { return await db.get(cle); } catch (e) { return null; }
    }

    async function toutesLesCles() {
        const vues = new Set();
        try {
            const k = await db.keys();
            for (let i = 0; i < k.length; i++) vues.add(k[i]);
        } catch (e) { /* IDB indisponible */ }
        for (let j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j));
        return Array.from(vues);
    }

    // Un nombre, ou null si la valeur n'est pas exploitable. On ne remplace
    // JAMAIS par 0 : un zéro inventé se confondrait avec une pondération
    // réellement nulle, et fabriquerait un écart qui n'existe pas.
    function nombreOuNull(v) {
        if (v == null || String(v).trim() === '') return null;
        const n = Number(v);
        return isNaN(n) ? null : n;
    }

    // Somme des pondérations d'une liste, et le nombre d'entrées ILLISIBLES.
    // Les deux voyagent ensemble : une somme seule ne dit pas ce qu'elle a
    // ignoré pour l'obtenir.
    function sommerPonderations(liste) {
        let somme = 0;
        let illisibles = 0;
        for (const item of (liste || [])) {
            const p = nombreOuNull(item && item.ponderation);
            if (p === null) illisibles++; else somme += p;
        }
        return { somme, illisibles };
    }

    // L'espace de noms d'une clé : 'h2026_evaluationsSauvegardees' → 'h2026_'.
    // Clé nue → chaîne vide. C'est ce préfixe qui doit servir à lire la grille.
    function prefixeDe(cleEvaluations) {
        const i = cleEvaluations.indexOf('evaluationsSauvegardees');
        return i <= 0 ? '' : cleEvaluations.slice(0, i);
    }

    async function diag674() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #674 · lot 0 · couverture de pondération des évaluations · LECTURE SEULE ====');
        L('     outil ' + VERSION_OUTIL);
        L('');

        const cles = await toutesLesCles();
        const clesEvals = cles.filter(k => k.endsWith('evaluationsSauvegardees')).sort();

        if (clesEvals.length === 0) {
            L('AUCUNE clé se terminant par « evaluationsSauvegardees » trouvée.');
            L('⚠ Ce n\'est PAS « zéro écart » : c\'est « rien regardé ». Vérifie que');
            L('  l\'application est bien ouverte sur ton corpus avant de conclure.');
            L('  (Clés vues au total : ' + cles.length + '.)');
            console.log(out.join('\n'));
            return { statut: 'aucune-cle', clesVues: cles.length };
        }

        L('Clés d\'évaluations trouvées (' + clesEvals.length + ') — la sonde les lit TOUTES :');
        for (const k of clesEvals) L('  · ' + k);
        L('');

        let totalExaminees = 0;
        let totalJugees = 0;
        let totalRemplacees = 0;
        const ecarts = [];
        const nonJugeables = [];

        for (const cleEval of clesEvals) {
            const prefixe = prefixeDe(cleEval);
            const cleGrilles = prefixe + 'grillesTemplates';
            const evaluations = (await lire(cleEval)) || [];
            const grilles = (await lire(cleGrilles)) || [];

            L('— ' + cleEval + ' : ' + evaluations.length + ' évaluation(s)');
            L('  grilles lues dans « ' + cleGrilles + ' » : ' + grilles.length
              + (grilles.length === 0 ? '  ⚠ AUCUNE — tout ce lot sera « impossible à juger »' : ''));

            for (const ev of evaluations) {
                totalExaminees++;
                if (ev && ev.remplaceeParId) { totalRemplacees++; continue; }

                const grille = grilles.find(g => g && g.id === (ev && ev.grilleId));
                const critEval = Array.isArray(ev && ev.criteres) ? ev.criteres : null;

                if (!grille || !Array.isArray(grille.criteres) || !critEval) {
                    nonJugeables.push({
                        cle: cleEval,
                        da: (ev && ev.etudiantDA) || '(sans DA)',
                        production: (ev && ev.productionNom) || (ev && ev.productionId) || '(sans production)',
                        grilleId: (ev && ev.grilleId) || '(sans grille)',
                        motif: !grille ? 'grille introuvable dans ' + cleGrilles
                             : (!Array.isArray(grille.criteres) ? 'grille sans tableau de critères'
                                                                : 'évaluation sans tableau de critères')
                    });
                    continue;
                }

                const sEval = sommerPonderations(critEval);
                const sGrille = sommerPonderations(grille.criteres);

                if (sEval.illisibles > 0 || sGrille.illisibles > 0 || sGrille.somme === 0) {
                    nonJugeables.push({
                        cle: cleEval,
                        da: ev.etudiantDA || '(sans DA)',
                        production: ev.productionNom || ev.productionId || '(sans production)',
                        grilleId: ev.grilleId,
                        motif: sGrille.somme === 0
                            ? 'la grille totalise 0 % — rien à comparer'
                            : ('pondérations illisibles : ' + sEval.illisibles + ' côté évaluation, '
                               + sGrille.illisibles + ' côté grille')
                    });
                    continue;
                }

                totalJugees++;
                const couverture = sEval.somme / sGrille.somme;
                if (couverture < 0.9999) {
                    const idsPresents = new Set(critEval.map(c => c && c.critereId));
                    const manquants = grille.criteres
                        .filter(gc => gc && !idsPresents.has(gc.id))
                        .map(gc => (gc.nom || gc.id) + ' (' + (gc.ponderation != null ? gc.ponderation + ' %' : 'pond. ?') + ')');
                    const note = nombreOuNull(ev.noteFinale);
                    ecarts.push({
                        cle: cleEval,
                        da: ev.etudiantDA || '(sans DA)',
                        production: ev.productionNom || ev.productionId || '(sans production)',
                        grille: grille.nom || grille.id,
                        couverturePct: (couverture * 100).toFixed(1),
                        ponderationEnregistree: sEval.somme,
                        ponderationGrille: sGrille.somme,
                        criteresManquants: manquants.length ? manquants : ['(aucun nom retrouvé — critères présents mais pondérations partielles)'],
                        noteTelleQueRemise: note,
                        // Illustration de l'ÉCART, pas une note corrigée : ce que
                        // vaudrait la note si le poids manquant comptait pour zéro.
                        // La vraie note demande d'évaluer le critère manquant.
                        siLeManquantComptaitZero: note === null ? null : Number((note * couverture).toFixed(1)),
                        statutRemise: ev.statutRemise || '(non dit)',
                        dateEvaluation: ev.dateEvaluation || '(sans date)'
                    });
                }
            }
        }

        L('');
        L('---- CE QUI A ÉTÉ REGARDÉ ----');
        L('  évaluations parcourues .................. ' + totalExaminees);
        L('  écartées car remplacées (reprise) ....... ' + totalRemplacees);
        L('  RÉELLEMENT JUGÉES ....................... ' + totalJugees);
        L('  impossibles à juger ..................... ' + nonJugeables.length);
        L('');
        L('⚠ Le nombre qui compte est « RÉELLEMENT JUGÉES ». Un zéro d\'écarts sur');
        L('  zéro jugée ne dit pas « tout va bien » : il dit « rien regardé ».');
        L('');

        L('---- LE RÉSULTAT ----');
        L('  évaluations à couverture < 100 % ........ ' + ecarts.length);
        if (ecarts.length === 0) {
            L('');
            L('  ⮕ Aucun écart parmi les ' + totalJugees + ' évaluations jugées.');
            L('    #674 est de la PRÉVENTION : le chantier s\'ouvre à froid.');
            if (nonJugeables.length > 0) {
                L('    ⚠ Sauf les ' + nonJugeables.length + ' cas impossibles à juger, listés plus bas.');
            }
        } else {
            L('');
            L('  ⮕ Ces notes ont été calculées sur une pondération renormalisée.');
            L('    Celles dont le statut est « remis » sont déjà entre les mains des élèves.');
            L('');
            for (const e of ecarts) {
                L('  · ' + e.da + ' — ' + e.production);
                L('      grille : ' + e.grille + '   [' + e.cle + ']');
                L('      couverture : ' + e.couverturePct + ' %  ('
                  + e.ponderationEnregistree + ' sur ' + e.ponderationGrille + ')');
                L('      critère(s) disparu(s) : ' + e.criteresManquants.join(', '));
                L('      note telle que remise : ' + (e.noteTelleQueRemise === null ? '(aucune)' : e.noteTelleQueRemise));
                L('      si le manquant comptait zéro : ' + (e.siLeManquantComptaitZero === null ? '(indisponible)' : e.siLeManquantComptaitZero));
                L('      statut : ' + e.statutRemise + '   évaluée le ' + e.dateEvaluation);
            }
            L('');
            L('  ⚠ « si le manquant comptait zéro » BORNE l\'écart, ce n\'est PAS la note');
            L('    corrigée : la vraie note demande d\'évaluer le critère absent. Les deux');
            L('    nombres encadrent la note juste, ils ne la donnent pas.');
        }

        if (nonJugeables.length > 0) {
            L('');
            L('---- IMPOSSIBLES À JUGER (' + nonJugeables.length + ') ----');
            L('  Ni saines ni fautives : la sonde refuse de conclure sur elles.');
            for (const n of nonJugeables) {
                L('  · ' + n.da + ' — ' + n.production + '  [' + n.cle + ']');
                L('      ' + n.motif);
            }
        }

        L('');
        L('==== fin #674 · lot 0 · aucune écriture effectuée ====');
        console.log(out.join('\n'));
        return {
            examinees: totalExaminees,
            remplacees: totalRemplacees,
            jugees: totalJugees,
            ecarts: ecarts,
            nonJugeables: nonJugeables
        };
    }

    window.diag674 = diag674;
    console.log('#674 · sonde chargée. Lance :  await diag674()');
})();
