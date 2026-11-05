import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1235 — retour de Grégoire du 5 nov. 2026, 10 h 59 (iPad, Labo › Rythme) : « il faudrait que l'on
// sépare la production originale de la production reprise. La durée d'évaluation d'une reprise est
// généralement beaucoup plus courte […] ça donne l'illusion que la durée moyenne d'évaluation de
// l'artefact original est plus courte ».
//
// Mesuré dans le code : un remplacement plus qu'un mélange. `collecterDurees` écartait l'original d'une
// reprise (`remplaceeParId`) et gardait la reprise à sa place, avec la durée la plus récente du chrono.
// Règle verrouillée ici : originaux et reprises se comptent à part ; la durée d'une évaluation est la
// sienne (une durée héritée de l'original n'est pas celle de la reprise) ; le chrono, sans lien à une
// évaluation précise, ne sert que pour un élève qui n'a qu'une évaluation de cette production.

const ACTIVITE = 'Analyser un récit (activité fictive)';
const PROD = 'PROD_1235';

function monterRythme(store) {
    const db = { getSync: (k, d) => (k in store ? store[k] : d), setSync: (k, v) => { store[k] = v; }, removeSync: (k) => { delete store[k]; } };
    const win = chargerScript('js/rythme.js', {
        db,
        cle: (k) => `a2026_${k}`,
        obtenirDonneesSelonMode: (k) => store[`a2026_${k}`] || [],
        echapperHtml: (t) => String(t ?? ''),
        MutationObserver: class { observe() {} disconnect() {} },
        document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {}, body: {} }
    });
    return win.Rythme;
}

const ev = (id, da, duree, champs = {}) => ({
    id, etudiantDA: da, productionId: PROD, criteres: [{ critereId: 'CR1', niveauSelectionne: 'M' }],
    dureeEvaluation: duree, dateCreation: '2026-11-01T13:00:00.000Z', ...champs
});

function lignes(evaluations, chrono = []) {
    const rythme = monterRythme({
        a2026_productions: [{ id: PROD, titre: 'Artefact fictif', activiteApprentissage: ACTIVITE }],
        a2026_evaluationsSauvegardees: evaluations,
        a2026_chronoEvaluations: chrono
    });
    const stats = rythme.calculerStatsParActivite(rythme.collecterDurees());
    const resume = (s) => s && { moyenneMin: s.moyenne / 60000, n: s.count };
    return {
        ordre: stats.map((s) => (s.reprise ? 'reprises' : 'origine')),
        origine: resume(stats.find((s) => s.activite === ACTIVITE && !s.reprise)),
        reprises: resume(stats.find((s) => s.activite === ACTIVITE && s.reprise))
    };
}

describe('#1235 · le rythme compte à part les originaux et les reprises', () => {
    it('le cas de la consigne : 12 min puis 2 min de reprise, et 10 min sans reprise → 11 min sur 2, 2 min sur 1', () => {
        const r = lignes([
            ev('EVAL_A', '9001001', 720, { remplaceeParId: 'EVAL_A_R' }),
            ev('EVAL_A_R', '9001001', 120, { repriseDeId: 'EVAL_A', jetonRepriseApplique: true }),
            ev('EVAL_B', '9001002', 600)
        ], [
            // le chrono de la reprise, le plus récent : il ne remplace plus la durée de l'original
            { dureeMs: 130000, date: '2026-11-03T10:00:00.000Z', productionId: PROD, etudiantDA: '9001001' }
        ]);
        expect(r.origine).toEqual({ moyenneMin: 11, n: 2 });
        expect(r.reprises).toEqual({ moyenneMin: 2, n: 1 });
        expect(r.ordre).toEqual(['origine', 'reprises']);   // la ligne des reprises juste dessous
    });

    it('une reprise qui n\'a que la durée héritée de son original compte sans durée', () => {
        const r = lignes([
            ev('EVAL_C', '9001003', 480, { remplaceeParId: 'EVAL_C_R' }),
            ev('EVAL_C_R', '9001003', 480, { repriseDeId: 'EVAL_C', jetonRepriseApplique: true }),
            ev('EVAL_D', '9001004', 300, { repriseDeIdCiblee: 'EVAL_X', jetonRepriseCibleeApplique: true }),
            ev('EVAL_X', '9001004', 900)
        ]);
        expect(r.origine).toEqual({ moyenneMin: 11.5, n: 2 });   // (8 + 15) / 2
        expect(r.reprises).toEqual({ moyenneMin: 5, n: 2 });      // la ciblée seule a sa durée ; la reprise héritée compte sans
    });

    // Relecture neuve : la pratique « supprimer l'originale » efface la source ; la reprise jamais
    // réenregistrée garde la durée et le chrono de l'original.
    it('original supprimé : une reprise jamais réenregistrée compte sans durée, et le chrono de l\'original ne lui va pas', () => {
        const r = lignes([
            ev('EVAL_G_R', '9001007', 720, { repriseDeId: 'EVAL_G', jetonRepriseApplique: true, dateCreation: '2026-11-04T09:00:00.000Z' }),
            ev('EVAL_H_R', '9001008', 0, { repriseDeId: 'EVAL_H', jetonRepriseApplique: true, dateCreation: '2026-11-04T09:00:00.000Z' }),
            ev('EVAL_I_R', '9001009', 180, { repriseDeId: 'EVAL_I', jetonRepriseApplique: true, dateModification: '2026-11-04T10:00:00.000Z' }),
            ev('EVAL_J', '9001010', 600)
        ], [
            { dureeMs: 900000, date: '2026-11-01T13:00:00.000Z', productionId: PROD, etudiantDA: '9001008' }
        ]);
        expect(r.reprises).toEqual({ moyenneMin: 3, n: 3 });   // seule la reprise réenregistrée a sa durée
    });

    it('aucun original avec une durée : la ligne des reprises vient seule', () => {
        const r = lignes([
            ev('EVAL_K', '9001011', 0, { remplaceeParId: 'EVAL_K_R' }),
            ev('EVAL_K_R', '9001011', 120, { repriseDeId: 'EVAL_K', jetonRepriseApplique: true, dateModification: '2026-11-04T10:00:00.000Z' })
        ]);
        expect(r.ordre).toEqual(['reprises']);
        expect(r.reprises).toEqual({ moyenneMin: 2, n: 1 });
    });

    it('sans reprise, rien ne change : une ligne, le chrono à défaut d\'une durée', () => {
        const r = lignes([ev('EVAL_E', '9001005', 0), ev('EVAL_F', '9001006', 600)],
            [{ dureeMs: 360000, date: '2026-11-01T13:00:00.000Z', productionId: PROD, etudiantDA: '9001005' }]);
        expect(r.origine).toEqual({ moyenneMin: 8, n: 2 });
        expect(r.reprises).toBeUndefined();
    });
});
