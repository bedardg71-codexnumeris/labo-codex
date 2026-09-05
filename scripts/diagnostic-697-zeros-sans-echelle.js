/* ============================================================================
   #697 — LE STOCK : COMBIEN D'ÉVALUATIONS PORTENT UN « 0 » ÉCRIT SANS ÉCHELLE ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   CE QU'ELLE MESURE, ET POURQUOI ELLE EXISTE.
   Jusqu'au 5 septembre 2026 (1.120.0), une évaluation dont l'échelle ne se résolvait
   pas (échelle supprimée, grille importée sans son échelle, pratique disparue,
   trimestre archivé sans copie d'échelle) passait la porte de l'enregistrement et
   s'écrivait avec `noteFinale: 0`, `ponderationCouverte: null`, `niveauFinal: '--'`
   — verrouillée par l'enregistrement, non verrouillée par l'auto-save. La liste
   affichait « - » ; la note du cours comptait 0. Le correctif #697 tarit la SOURCE
   (la porte refuse, l'auto-save ne crée rien). Le STOCK déjà écrit, lui, reste :
   « tarir n'est pas réparer ». Cette sonde le MESURE. Elle ne le répare pas :
   écrire dans les données de quelqu'un remonte à Grégoire.

   DEUX COMPTES, SÉPARÉS :
     1. le FOSSILE — noteFinale === 0 ET ponderationCouverte absente ET niveauFinal
        « -- » : la signature exacte de ce que le chemin corrigé écrivait ;
     2. l'ÉCHELLE INTROUVABLE AUJOURD'HUI — l'echelleId de l'évaluation ne se résout
        ni dans `<trimestre>_echellesTemplates` ni dans une pratique du même
        trimestre : ces évaluations seraient REFUSÉES maintenant si on les rouvrait,
        et leur PDF ne conclut pas.
   Une évaluation peut être dans les deux, dans un seul, ou dans aucun.

   ⚠ ELLE NOMME LA CLÉ QUI A SERVI et lit chaque trimestre dans SON espace de noms
   (patron de la sonde #674). Les évaluations remplacées (`remplaceeParId`) sont
   comptées à part. Un zéro de fossile n'est pas une preuve d'absence si aucune clé
   n'a été lue : la sonde le dit.

   USAGE — dans la console de Safari, sur l'application ouverte :
       (coller le contenu de ce fichier, puis)
       await diag697()

   Repère : le rapport commence par « ==== #697 ».
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r1 · 5 septembre 2026 · A-1 de l\'audit du moteur';

    async function lire(cleBrute) {
        try { return await db.get(cleBrute); } catch (e) { return null; }
    }

    async function toutesLesCles() {
        const vues = new Set();
        try {
            const k = await db.keys();
            for (let i = 0; i < k.length; i++) vues.add(k[i]);
        } catch (e) { /* IDB indisponible */ }
        try {
            for (let j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j));
        } catch (e) { /* localStorage indisponible */ }
        return Array.from(vues);
    }

    // 'h2026_evaluationsSauvegardees' → 'h2026_' ; clé nue → ''.
    function prefixeDe(cleEvaluations) {
        const i = cleEvaluations.indexOf('evaluationsSauvegardees');
        return i <= 0 ? '' : cleEvaluations.slice(0, i);
    }

    // La signature EXACTE de ce que le chemin corrigé écrivait. Pas « noteFinale 0 »
    // seul : un vrai zéro (copie non recevable, évaluation vide déclarée) porte une
    // portée (0 ou un nombre) et ne doit pas être compté ici.
    function estFossile(ev) {
        return !!ev && ev.noteFinale === 0
            && (ev.ponderationCouverte === null || ev.ponderationCouverte === undefined)
            && ev.niveauFinal === '--';
    }

    // Même question que `resoudreEchelleEvaluation` (evaluation-calcul.js), posée sur
    // les listes du trimestre de l'évaluation.
    function echelleResolue(echelleId, echelles, pratiques) {
        if (!echelleId) return false;
        const id = String(echelleId);
        if (id.startsWith('pratique-')) {
            const pratiqueId = id.replace('pratique-', '');
            const p = (pratiques || []).find(x => x && x.id === pratiqueId);
            return !!(p && p.config && p.config.echelle);
        }
        return (echelles || []).some(e => e && e.id === id);
    }

    function classer(ev, echelles, pratiques) {
        return {
            fossile: estFossile(ev),
            echelleIntrouvable: !echelleResolue(ev && ev.echelleId, echelles, pratiques),
            remplacee: !!(ev && ev.remplaceeParId)
        };
    }

    async function diag697() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #697 · le stock des « 0 » écrits sans échelle · LECTURE SEULE ====');
        L('     outil ' + VERSION_OUTIL);
        L('');

        const cles = await toutesLesCles();
        const clesEvals = cles.filter(k => k.endsWith('evaluationsSauvegardees')).sort();
        if (clesEvals.length === 0) {
            L('AUCUNE clé se terminant par « evaluationsSauvegardees » trouvée.');
            L('⚠ Ce n\'est PAS « zéro fossile » : c\'est « rien regardé ». (Clés vues : ' + cles.length + '.)');
            console.log(out.join('\n'));
            return { statut: 'aucune-cle', clesVues: cles.length };
        }
        L('Clés d\'évaluations trouvées (' + clesEvals.length + ') — la sonde les lit TOUTES :');
        for (const k of clesEvals) L('  · ' + k);
        L('');

        const resultat = { statut: 'ok', parCle: {}, fossiles: 0, echellesIntrouvables: 0, lesDeux: 0, examinees: 0, remplacees: 0 };
        for (const cleEval of clesEvals) {
            const prefixe = prefixeDe(cleEval);
            const evaluations = (await lire(cleEval)) || [];
            const echelles = (await lire(prefixe + 'echellesTemplates')) || [];
            const pratiques = (await lire(prefixe + 'pratiquesConfigurables')) || [];
            const lot = { evaluations: evaluations.length, echellesLues: echelles.length, pratiquesLues: pratiques.length, fossiles: [], echellesIntrouvables: [], remplacees: 0 };
            L('— ' + cleEval + ' : ' + evaluations.length + ' évaluation(s) · échelles lues dans « ' + prefixe + 'echellesTemplates » : ' + echelles.length
              + ' · pratiques : ' + pratiques.length + (echelles.length === 0 ? '  ⚠ AUCUNE échelle : toutes ses évaluations seront « introuvable »' : ''));
            for (const ev of evaluations) {
                if (!ev) continue;
                resultat.examinees++;
                const c = classer(ev, echelles, pratiques);
                if (c.remplacee) { lot.remplacees++; resultat.remplacees++; }
                const fiche = (ev.id || '(sans id)') + ' · DA ' + (ev.etudiantDA || '?') + ' · production ' + (ev.productionId || '?')
                    + ' · échelle « ' + (ev.echelleId || '(vide)') + ' » · ' + (ev.dateModification || ev.dateEvaluation || 'sans date')
                    + (c.remplacee ? ' · REMPLACÉE' : '') + (ev.verrouillee ? ' · verrouillée' : ' · brouillon');
                if (c.fossile) { lot.fossiles.push(fiche); resultat.fossiles++; }
                if (c.echelleIntrouvable) { lot.echellesIntrouvables.push(fiche); resultat.echellesIntrouvables++; }
                if (c.fossile && c.echelleIntrouvable) resultat.lesDeux++;
            }
            L('  fossiles (0 · portée absente · niveau « -- ») : ' + lot.fossiles.length);
            for (const f of lot.fossiles) L('    ✗ ' + f);
            L('  échelle introuvable aujourd\'hui : ' + lot.echellesIntrouvables.length);
            for (const f of lot.echellesIntrouvables) L('    ? ' + f);
            if (lot.remplacees) L('  (dont ' + lot.remplacees + ' remplacée(s), comptées ci-dessus mais hors de toute note)');
            L('');
            resultat.parCle[cleEval] = lot;
        }
        L('TOTAL — examinées ' + resultat.examinees + ' · fossiles ' + resultat.fossiles + ' · échelle introuvable ' + resultat.echellesIntrouvables
          + ' · les deux ' + resultat.lesDeux + ' · remplacées ' + resultat.remplacees);
        L('Rien n\'a été écrit. Ce que ces lignes deviennent est une décision de Grégoire.');
        console.log(out.join('\n'));
        return resultat;
    }

    window.diag697 = diag697;
    window.diag697Classer = classer;
    console.log('#697 · sonde chargée. Lance :  await diag697()');
})();
