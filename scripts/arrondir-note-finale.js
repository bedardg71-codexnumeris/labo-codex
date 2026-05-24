/**
 * arrondir-note-finale.js
 *
 * Arrondit à 1 décimale les `noteFinale` stockés dans evaluationsSauvegardees
 * qui ont été persistés avec plein de décimales (séquelles du script
 * reparation-donnees-algorithmiques.js du 24 mai 2026 b0524-1900, avant
 * son fix d'arrondi).
 *
 * Convention : `Math.round(noteFinale * 10) / 10` — alignée sur
 * evaluation.js:2147 et liste-evaluations.js:878.
 *
 * Usage console :
 *   1. Coller ce fichier en entier → mode PREVIEW.
 *   2. Vérifier window.__arrondiNote.aArrondir.
 *   3. Pour appliquer : window.__arrondiNote.appliquer()
 */
(function() {
    'use strict';

    function aTropDeDecimales(n) {
        if (typeof n !== 'number') return false;
        const arrondi = Math.round(n * 10) / 10;
        // Tolérance flottants (Math.abs > 1e-9 = vraiment différent)
        return Math.abs(n - arrondi) > 1e-9;
    }

    function calculerArrondis() {
        const cleEvals = cle('evaluationsSauvegardees');
        const evaluations = db.getSync(cleEvals, []) || [];
        const aArrondir = [];

        evaluations.forEach((ev) => {
            if (aTropDeDecimales(ev.noteFinale)) {
                aArrondir.push({
                    evalId: ev.id,
                    etudiantDA: ev.etudiantDA,
                    etudiantNom: ev.etudiantNom || '',
                    productionNom: ev.productionNom || '',
                    avant: ev.noteFinale,
                    apres: Math.round(ev.noteFinale * 10) / 10
                });
            }
        });

        return { aArrondir: aArrondir, total: evaluations.length };
    }

    function appliquerArrondis() {
        const cleEvals = cle('evaluationsSauvegardees');
        const evaluations = db.getSync(cleEvals, []) || [];
        const evalParId = {};
        evaluations.forEach((ev, idx) => { evalParId[ev.id] = idx; });

        const { aArrondir } = calculerArrondis();
        if (!aArrondir.length) {
            console.log('[Arrondi noteFinale] Rien à arrondir.');
            return { applique: 0 };
        }

        aArrondir.forEach(rep => {
            const idx = evalParId[rep.evalId];
            if (idx === undefined) return;
            evaluations[idx].noteFinale = rep.apres;
        });

        db.setSync(cleEvals, evaluations);
        console.log(`[Arrondi noteFinale] ${aArrondir.length} évaluations arrondies à 1 décimale.`);
        return { applique: aArrondir.length };
    }

    // === MODE PREVIEW ===
    const preview = calculerArrondis();
    console.group('[Arrondi noteFinale] Mode PREVIEW (rien n\'est écrit en DB)');
    console.log('Total évals scannées :', preview.total);
    console.log('À arrondir (noteFinale > 1 décimale) :', preview.aArrondir.length);
    if (preview.aArrondir.length > 0) {
        console.table(preview.aArrondir.map(r => ({
            etudiant: r.etudiantNom || r.etudiantDA,
            production: r.productionNom,
            avant: r.avant,
            apres: r.apres
        })));
    }
    console.groupEnd();
    console.log('Pour appliquer : window.__arrondiNote.appliquer()');

    window.__arrondiNote = {
        aArrondir: preview.aArrondir,
        appliquer: appliquerArrondis,
        recalculer: calculerArrondis
    };
    return window.__arrondiNote;
})();
