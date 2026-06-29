import { describe, it, expect } from 'vitest';
import { calculerRecreationGrilles, appliquer, fabriquerGrille } from '../../scripts/reparer-grilles-h2026.mjs';

// #362 — Grilles h2026 désappariées des évaluations. calculerRecreationGrilles() calcule le
// plan de RECRÉATION de DÉFINITIONS de grille manquantes : un grilleId référencé par des évals
// (grade-bearing) mais ABSENT du pool *_grillesTemplates est recréé sous l'id attendu, à partir
// de la grille DU TRIMESTRE qui couvre le mieux les critères des évals. LECTURE SEULE.
//
// IMPORTANT (vérité du codex réel, dry-run 28 juin) :
//  - dans une ÉVALUATION, le critère porte son id sous `critereId` (PAS `id`, qui est le champ
//    des DÉFINITIONS de grille). Lire le mauvais champ → empreinte vide → faux « 0 recréation ».
//  - des copies IDENTIQUES existent en a2025/demo ET h2026 → la SOURCE doit être cherchée
//    SCOPÉE au trimestre, sinon fausse ambiguïté qui ferait tout refuser.
//  - certains groupes ont des évals mal estampillées (outliers) → appariement par COUVERTURE
//    (éval ⊆ grille) + couverture majoritaire, et on compte les outliers.
//
// INVARIANT : ne JAMAIS réécrire les évaluations. On ne fabrique que des définitions.
//
// Break-test (chacun fait ROUGIR un cas précis si on casse la garde, dans le .mjs) :
//  - empreinteEval : remplacer `c.critereId || c.id` par `c.id` → les recréations rougissent
//      (empreinte vide, plus aucun appariement) — c'EST le bug corrigé.
//  - sources scopées : remplacer `sourcesTrimestre` par le pool global `indexerGrilles(codex)`
//      → le test « ignore les jumelles d'autres trimestres » rougit (ambiguïté → 0 recréation).
//  - garde majoritaire : retirer `if (best.couverts <= length/2) continue;`
//      → le test « refuse si couverture non majoritaire » rougit.
//  - dans fabriquerGrille(), forcer `copie.id = src.grille.id` → le test « force l'id attendu » rougit.

// Définition de grille : critères sous `id`. Évaluation : critères sous `critereId`.
const HOLIS = ['H1', 'H2', 'H3', 'H4', 'H5'];
const ALGO = ['A1', 'A2', 'A3', 'A4', 'A5'];
const G4 = ['G1', 'G2', 'G3', 'G4'];
const grilleDef = (id, nom, critIds, extra = {}) =>
    Object.assign({ id, nom, criteres: critIds.map(c => ({ id: c, nom: c, ponderation: 10 })) }, extra);
const evalH = (id, grilleId, critIds, extra = {}) =>
    Object.assign({ id, grilleId, criteres: critIds.map(c => ({ critereId: c, niveauSelectionne: 2 })) }, extra);

describe('#362 · calculerRecreationGrilles — recréation par couverture, scopée au trimestre', () => {
    it('recrée une grille ABSENTE sous l’id attendu, depuis la jumelle DU TRIMESTRE (champ critereId)', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [
                evalH('E1', 'grille_HOLIS', HOLIS),
                evalH('E2', 'grille_HOLIS', HOLIS)
            ],
            h2026_grillesTemplates: [grilleDef('COPIE_A25', 'Grille-5 FR-HOLIS-30 A25', HOLIS, { echelleId: 'ECH_HOLIS' })]
        };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'Grille-5 FR-HOLIS-30' });
        expect(recreations).toHaveLength(1);
        expect(recreations[0]).toMatchObject({
            idAttendu: 'grille_HOLIS', sourceId: 'COPIE_A25', sourceCle: 'h2026_grillesTemplates',
            nbCriteres: 5, nbEvals: 2, nbCouverts: 2, nbOutliers: 0, echelleId: 'ECH_HOLIS',
            nomPropre: 'Grille-5 FR-HOLIS-30'
        });
    });

    it('SCOPING : ignore les jumelles identiques d’AUTRES trimestres (a2025/demo) — pas de fausse ambiguïté', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', HOLIS)],
            // même empreinte présente en a2025 ET demo ET h2026 : l'ancien code (pool global) aurait vu
            // 3 candidates et refusé. Le nouveau scope au trimestre → une seule source : la jumelle h2026.
            a2025_grillesTemplates: [grilleDef('A25_HOLIS', 'FR-HOLIS A25', HOLIS)],
            demo_grillesTemplates: [grilleDef('DEMO_HOLIS', 'FR-HOLIS demo', HOLIS)],
            h2026_grillesTemplates: [grilleDef('H26_HOLIS', 'FR-HOLIS A25', HOLIS)]
        };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', {});
        expect(recreations).toHaveLength(1);
        expect(recreations[0].sourceId).toBe('H26_HOLIS');       // la jumelle DU TRIMESTRE, jamais a2025/demo
        expect(recreations[0].sourceCle).toBe('h2026_grillesTemplates');
    });

    it('OUTLIERS : un groupe majoritairement Grille-4 + une éval mal estampillée → recrée Grille-4, compte l’outlier', () => {
        const evals = [];
        for (let i = 0; i < 6; i++) evals.push(evalH('G' + i, 'grille_4', G4));   // 6 évals propres Grille-4
        evals.push(evalH('OUT', 'grille_4', HOLIS));                               // 1 éval mal estampillée (HOLIS)
        const codex = {
            h2026_evaluationsSauvegardees: evals,
            h2026_grillesTemplates: [
                grilleDef('COPIE_G4', 'Grille-4 A25', G4),
                grilleDef('COPIE_HOLIS', 'FR-HOLIS A25', HOLIS)
            ]
        };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', {});
        expect(recreations).toHaveLength(1);
        expect(recreations[0]).toMatchObject({ idAttendu: 'grille_4', sourceId: 'COPIE_G4', nbEvals: 7, nbCouverts: 6, nbOutliers: 1 });
    });

    it('COUVERTURE par sous-ensemble : les évals partielles (sous-ensemble des critères) comptent comme couvertes', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [
                evalH('E1', 'grille_HOLIS', HOLIS),              // complète
                evalH('E2', 'grille_HOLIS', ['H1', 'H2', 'H3'])  // partielle (3 des 5)
            ],
            h2026_grillesTemplates: [grilleDef('COPIE_A25', 'FR-HOLIS A25', HOLIS)]
        };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', {});
        expect(recreations).toHaveLength(1);
        expect(recreations[0]).toMatchObject({ nbEvals: 2, nbCouverts: 2, nbOutliers: 0 });
    });

    it('GARDE MAJORITAIRE : refuse de trancher si aucune grille du trimestre ne couvre la majorité', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [
                evalH('E1', 'grille_X', HOLIS),
                evalH('E2', 'grille_X', ALGO)   // 50/50 entre deux grilles → aucune ne couvre > la moitié
            ],
            h2026_grillesTemplates: [grilleDef('COPIE_HOLIS', 'HOLIS', HOLIS), grilleDef('COPIE_ALGO', 'ALGO', ALGO)]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('AMBIGUÏTÉ INTRA-TRIMESTRE : deux grilles du trimestre couvrent autant → on NE tranche pas', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', HOLIS)],
            h2026_grillesTemplates: [grilleDef('DOUBLON_A', 'A', HOLIS), grilleDef('DOUBLON_B', 'B', HOLIS)]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('NE recrée PAS une grille déjà présente dans le pool global sous son id', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', HOLIS)],
            h2026_grillesTemplates: [grilleDef('grille_HOLIS', 'FR-HOLIS', HOLIS)]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('les évals REMPLACÉES (remplaceeParId) n’ont pas voix au chapitre', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_MORTE', HOLIS, { remplaceeParId: 'E2' })],
            h2026_grillesTemplates: [grilleDef('COPIE_A25', 'A25', HOLIS)]
        };
        expect(calculerRecreationGrilles(codex, 'h2026', {}).recreations).toHaveLength(0);
    });

    it('signale les copies orphelines (0 éval), en marquant celle qui a servi de source', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', HOLIS)],
            h2026_grillesTemplates: [
                grilleDef('COPIE_A25', 'FR-HOLIS A25', HOLIS),         // source de la recréation
                grilleDef('GENERIQUE', 'Générique', ['Z1', 'Z2'])     // sans usage, pas source
            ]
        };
        const { orphelines } = calculerRecreationGrilles(codex, 'h2026', {});
        const parId = Object.fromEntries(orphelines.map(o => [o.id, o.raison]));
        expect(parId.COPIE_A25).toBe('source-d-une-recreation');
        expect(parId.GENERIQUE).toBe('sans-eval');
    });

    it('NE JAMAIS toucher les évaluations : l’objet codex d’entrée n’est pas muté', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', HOLIS)],
            h2026_grillesTemplates: [grilleDef('COPIE_A25', 'A25', HOLIS)]
        };
        const avant = JSON.stringify(codex);
        calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'Nom' });
        expect(JSON.stringify(codex)).toBe(avant);
    });

    it('cas 3 familles (HOLIS + ALGO + Grille-4) : recrée les trois, chacune depuis sa jumelle h2026', () => {
        const codex = {
            h2026_evaluationsSauvegardees: [
                evalH('E1', 'grille_HOLIS', HOLIS),
                evalH('E2', 'grille_ALGO', ALGO),
                evalH('E3', 'grille_4', G4)
            ],
            h2026_grillesTemplates: [
                grilleDef('COPIE_HOLIS', 'HOLIS A25', HOLIS),
                grilleDef('COPIE_ALGO', 'ALGO A25', ALGO),
                grilleDef('COPIE_G4', 'Grille-4 A25', G4)
            ]
        };
        const { recreations } = calculerRecreationGrilles(codex, 'h2026', {});
        expect(recreations.map(r => r.idAttendu).sort()).toEqual(['grille_4', 'grille_ALGO', 'grille_HOLIS']);
        const parId = Object.fromEntries(recreations.map(r => [r.idAttendu, r.sourceId]));
        expect(parId.grille_HOLIS).toBe('COPIE_HOLIS');
        expect(parId.grille_ALGO).toBe('COPIE_ALGO');
        expect(parId.grille_4).toBe('COPIE_G4');
    });
});

describe('#362 · appliquer / fabriquerGrille — écriture (copie) de définitions, jamais d’évaluations', () => {
    const codexHolis = () => ({
        h2026_evaluationsSauvegardees: [evalH('E1', 'grille_HOLIS', HOLIS)],
        h2026_grillesTemplates: [grilleDef('COPIE_A25', 'FR-HOLIS A25', HOLIS, { echelleId: 'ECH_HOLIS', dansBibliotheque: true })]
    });

    it('fabriquerGrille force l’id ATTENDU (pas l’id source) et copie les critères de la source', () => {
        const codex = codexHolis();
        const plan = calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'Grille-5 FR-HOLIS-30' });
        const grille = fabriquerGrille(codex, plan.recreations[0]);
        expect(grille.id).toBe('grille_HOLIS');
        expect(grille.id).not.toBe('COPIE_A25');
        expect(grille.nom).toBe('Grille-5 FR-HOLIS-30');
        expect(grille.criteres.map(c => c.id).sort()).toEqual([...HOLIS].sort());
        expect(grille.echelleId).toBe('ECH_HOLIS');
        expect(grille.recreeeDe).toBe('COPIE_A25');
        expect(grille.recreeePar).toBe('#362-reparer-grilles-h2026');
    });

    it('fabriquerGrille fait une COPIE PROFONDE : muter le résultat ne touche pas la source', () => {
        const codex = codexHolis();
        const grille = fabriquerGrille(codex, calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'N' }).recreations[0]);
        grille.criteres[0].ponderation = 999;
        expect(codex.h2026_grillesTemplates[0].criteres[0].ponderation).toBe(10);
    });

    it('appliquer AJOUTE la définition recréée sous l’id attendu, sans retirer la copie source', () => {
        const codex = codexHolis();
        const out = appliquer(codex, calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'Grille-5 FR-HOLIS-30' }));
        const ids = out.h2026_grillesTemplates.map(g => g.id).sort();
        expect(ids).toContain('grille_HOLIS');
        expect(ids).toContain('COPIE_A25');
    });

    it('appliquer NE touche PAS les évaluations (grade-bearing) — identiques avant/après', () => {
        const codex = codexHolis();
        const evalsAvant = JSON.stringify(codex.h2026_evaluationsSauvegardees);
        const out = appliquer(codex, calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'N' }));
        expect(JSON.stringify(out.h2026_evaluationsSauvegardees)).toBe(evalsAvant);
    });

    it('appliquer NE mute PAS le codex d’entrée (écrit sur une copie profonde)', () => {
        const codex = codexHolis();
        const avant = JSON.stringify(codex);
        appliquer(codex, calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'N' }));
        expect(JSON.stringify(codex)).toBe(avant);
    });

    it('appliquer est idempotent au niveau liste : ré-appliquer ne crée pas de doublon', () => {
        const codex = codexHolis();
        const out1 = appliquer(codex, calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'N' }));
        const out2 = appliquer(out1, calculerRecreationGrilles(out1, 'h2026', { grille_HOLIS: 'N' }));
        expect(out2.h2026_grillesTemplates.filter(g => g.id === 'grille_HOLIS')).toHaveLength(1);
    });

    it('appliquer NE touche QUE *_grillesTemplates (aucune autre clé du codex modifiée)', () => {
        const codex = Object.assign(codexHolis(), { h2026_presences: [{ da: 'X' }], autreCle: { a: 1 } });
        const out = appliquer(codex, calculerRecreationGrilles(codex, 'h2026', { grille_HOLIS: 'N' }));
        expect(JSON.stringify(out.h2026_presences)).toBe(JSON.stringify(codex.h2026_presences));
        expect(JSON.stringify(out.autreCle)).toBe(JSON.stringify(codex.autreCle));
    });
});
