import { describe, it, expect } from 'vitest';
import { calculerRecreationGrilles } from '../../scripts/reparer-grilles-h2026.mjs';

// #362 — Grilles h2026 désappariées des évaluations. calculerRecreationGrilles()
// calcule le plan de RECRÉATION de DÉFINITIONS de grille manquantes : un grilleId
// référencé par des évals (grade-bearing) mais ABSENT du pool *_grillesTemplates est
// recréé sous l'id attendu, à partir d'une copie orpheline dont l'empreinte de
// critereId correspond EXACTEMENT. LOGIQUE PURE, lecture seule.
//
// INVARIANT : ne JAMAIS réécrire les évaluations. On ne fabrique que des définitions.
//
// CONSERVATEUR : recréation seulement si (a) le grilleId est référencé par ≥1 éval
// active, (b) absent du pool, (c) exactement UNE copie orpheline a l'empreinte exacte.
//
// Break-test (chacun fait ROUGIR un cas précis si on casse la garde correspondante,
// dans scripts/reparer-grilles-h2026.mjs) :
//  - remplacer `if (pool.has(idAttendu)) continue;` par `if (false) continue;`
//      → le test « grille présente n'est pas recréée » rougit (recrée à tort).
//  - remplacer `if (candidates.length !== 1) continue;` par `if (false) continue;`
//      → les tests « 0 candidate » et « 2 candidates ambiguës » rougissent.
//  - retirer le filtre `.filter(e => e && !e.remplaceeParId)` sur evals
//      → le test « éval remplacée n'a pas voix » peut rougir (recrée pour une grille morte).
//  - dans appliquer(), forcer `copie.id = src.grille.id` au lieu de rec.idAttendu :
//      non couvert ici (logique d'écriture, hors cœur pur) — voir le CLI --ecrire.

// Fixtures : 3 critères FR-HOLIS, 3 critères Grille-4, etc. (ids = ceux que l'éval stocke).
const CRIT_HOLIS = [
    { id: 'CR1759243306842', nom: 'Structure', ponderation: 15 },
    { id: 'CR331050', nom: 'Rigueur', ponderation: 20 },
    { id: 'CR365467', nom: 'Plausibilité', ponderation: 10 }
];
const CRIT_ALGO = [
    { id: 'CR1759529438502', nom: 'Structure', ponderation: 15 },
    { id: 'CR458633', nom: 'Rigueur', ponderation: 20 }
];

// Une éval porte SES PROPRES criteres (id = critereId de la grille) + grilleId + grade.
function evalH(id, grilleId, criteres, extra = {}) {
    return Object.assign({ id, grilleId, criteres: criteres.map(c => ({ id: c.id, niveauSelectionne: 2 })) }, extra);
}

describe('#362 · calculerRecreationGrilles — recréation conservatrice de définitions de grille', () => {
    it('recrée une grille ABSENTE sous l’id attendu, à partir de la copie orpheline d’empreinte exacte', () => {
        const codex = {
            // évals pointent grille_HOLIS (absente du pool) ; la copie « A25 » a les mêmes critereId.
            h2026_evaluationsSauvegardees: [
                evalH('E1', 'grille_HOLIS', CRIT_HOLIS),
                evalH('E2', 'grille_HOLIS', CRIT_HOLIS)
            ],
            h2026_grillesTemplates: [
                { id: 'COPIE_A25', nom: 'Grille-5 FR-HOLIS A25', criteres: CRIT_HOLIS, echelleId: 'ECH_HOLIS' }
            ]
        };
        const noms = { grille_HOLIS: 'Grille-5 FR-HOLIS-30' };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', noms);
        expect(recreations).toHaveLength(1);
        expect(recreations[0]).toMatchObject({
            idAttendu: 'grille_HOLIS',
            sourceId: 'COPIE_A25',
            sourceCle: 'h2026_grillesTemplates',
            nbCriteres: 3,
            nbEvals: 2,
            echelleId: 'ECH_HOLIS',
            nomPropre: 'Grille-5 FR-HOLIS-30'
        });
    });

    it('plante le bon set de critereId attendus (empreinte) sur la recréation', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_ALGO', CRIT_ALGO)],
            h2026_grillesTemplates: [{ id: 'COPIE_ALGO', nom: 'FR-ALGO A25', criteres: CRIT_ALGO }]
        };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', {});
        expect(recreations).toHaveLength(1);
        expect(recreations[0].empreinte).toBe(['CR1759529438502', 'CR458633'].sort().join('|'));
    });

    it('NE recrée PAS une grille déjà présente dans le pool sous son id (rien à réparer)', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', CRIT_HOLIS)],
            // la définition existe déjà sous le bon id → résoluble
            h2026_grillesTemplates: [{ id: 'grille_HOLIS', nom: 'FR-HOLIS', criteres: CRIT_HOLIS }]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('NE tranche PAS s’il n’existe AUCUNE copie d’empreinte exacte (0 candidate)', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', CRIT_HOLIS)],
            // copie présente mais critereId différents → pas d'appariement
            h2026_grillesTemplates: [{ id: 'COPIE_X', nom: 'Autre', criteres: [{ id: 'AUTRE_ID' }] }]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('NE tranche PAS si DEUX copies ont la même empreinte (ambiguïté)', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', CRIT_HOLIS)],
            h2026_grillesTemplates: [
                { id: 'COPIE_A', nom: 'A25 a', criteres: CRIT_HOLIS },
                { id: 'COPIE_B', nom: 'A25 b', criteres: CRIT_HOLIS }
            ]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('les évals REMPLACÉES (remplaceeParId) n’ont pas voix au chapitre', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [
                // seule une éval morte pointe grille_MORTE → ne déclenche aucune recréation
                evalH('E1', 'grille_MORTE', CRIT_HOLIS, { remplaceeParId: 'E2' })
            ],
            h2026_grillesTemplates: [{ id: 'COPIE_A25', nom: 'A25', criteres: CRIT_HOLIS }]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('signale les copies orphelines (0 éval), en marquant celle qui a servi de source', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', CRIT_HOLIS)],
            h2026_grillesTemplates: [
                { id: 'COPIE_A25', nom: 'FR-HOLIS A25', criteres: CRIT_HOLIS },  // source de la recréation
                { id: 'COPIE_SEULE', nom: 'Sans usage', criteres: [{ id: 'ZZ' }] } // aucune éval, pas source
            ]
        };
        const { orphelines } = calculerRecreationGrilles(codex, 'h2026', {});
        const parId = Object.fromEntries(orphelines.map(o => [o.id, o.raison]));
        expect(parId.COPIE_A25).toBe('source-d-une-recreation');
        expect(parId.COPIE_SEULE).toBe('sans-eval');
    });

    it('NE compte PAS comme orpheline une grille effectivement référencée par des évals', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', CRIT_HOLIS)],
            h2026_grillesTemplates: [{ id: 'grille_HOLIS', nom: 'FR-HOLIS', criteres: CRIT_HOLIS }]
        };
        const { orphelines } = calculerRecreationGrilles(codex, 'h2026', {});
        expect(orphelines.find(o => o.id === 'grille_HOLIS')).toBeUndefined();
    });

    it('idempotence : une fois la grille présente sous l’id attendu, plus aucune recréation', () => {
        const noms = { grille_HOLIS: 'Grille-5 FR-HOLIS-30' };
        const avant = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', CRIT_HOLIS)],
            h2026_grillesTemplates: [{ id: 'COPIE_A25', nom: 'A25', criteres: CRIT_HOLIS, echelleId: 'ECH' }]
        };
        const plan = calculerRecreationGrilles(avant, 'h2026', noms);
        expect(plan.recreations).toHaveLength(1);
        // Simule l'application : on ajoute la définition recréée sous l'id attendu.
        const apres = JSON.parse(JSON.stringify(avant));
        apres.h2026_grillesTemplates.push({ id: 'grille_HOLIS', nom: noms.grille_HOLIS, criteres: CRIT_HOLIS });
        expect(calculerRecreationGrilles(apres, 'h2026', noms).recreations).toHaveLength(0);
    });

    it('NE JAMAIS toucher les évaluations : l’objet codex d’entrée n’est pas muté', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', CRIT_HOLIS)],
            h2026_grillesTemplates: [{ id: 'COPIE_A25', nom: 'A25', criteres: CRIT_HOLIS }]
        };
        const avant = JSON.stringify(codex);
        calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'Nom' });
        expect(JSON.stringify(codex)).toBe(avant);
    });

    it('cas 3 familles (HOLIS + ALGO) : recrée les deux, chacune depuis sa copie', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [
                evalH('E1', 'grille_HOLIS', CRIT_HOLIS),
                evalH('E2', 'grille_ALGO', CRIT_ALGO)
            ],
            h2026_grillesTemplates: [
                { id: 'COPIE_HOLIS', nom: 'HOLIS A25', criteres: CRIT_HOLIS },
                { id: 'COPIE_ALGO', nom: 'ALGO A25', criteres: CRIT_ALGO }
            ]
        };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', {});
        expect(recreations.map(r => r.idAttendu).sort()).toEqual(['grille_ALGO', 'grille_HOLIS']);
        const parId = Object.fromEntries(recreations.map(r => [r.idAttendu, r.sourceId]));
        expect(parId.grille_HOLIS).toBe('COPIE_HOLIS');
        expect(parId.grille_ALGO).toBe('COPIE_ALGO');
    });
});
