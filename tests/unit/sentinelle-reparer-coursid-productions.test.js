import { describe, it, expect } from 'vitest';
import { calculerRemapsCoursId } from '../../scripts/reparer-coursid-productions.mjs';

// Brique D — hygiène namespacing coursId (juin 2026). calculerRemapsCoursId()
// calcule le plan de remap des coursId de production périmés (production.coursId
// ≠ id de cours UNANIME des évaluations de cette production). LOGIQUE PURE, lecture
// seule, source de vérité = les évaluations (elles portent le coursId canonique).
//
// CONSERVATEUR : remap UNIQUEMENT si des évals existent ET s'accordent sur un coursId
// ≠ du champ production. Aucune éval / désaccord ⇒ on ne touche pas.
//
// AUTO-LIMITÉ : un trimestre dont productions ET évals partagent déjà le même coursId
// (cas A24/A25, ancien id LÉGITIME et cohérent) ne produit AUCUN remap → garantie
// « ne jamais migrer un trimestre cohérent vers un autre cours ».
//
// Break-test : dans reparer-coursid-productions.mjs,
//  - retirer `if (cible === null) continue;` → le cas « évals divergentes » rougit.
//  - retirer `if ((prod.coursId||'') === cible) continue;` → le cas « déjà aligné » rougit.
//  - retirer `&& e.coursId` du filtre `liees` → le cas « évals sans coursId » rougit.
//  - retirer `if (!liees.length) continue;` → le cas « sans évaluation » (conteneur) rougit.

function codex(productions, evaluations, extra = {}) {
    return Object.assign({
        h2026_productions: productions,
        h2026_evaluationsSauvegardees: evaluations
    }, extra);
}
const T = ['h2026'];

describe('Brique D · calculerRemapsCoursId — remap conservateur du coursId de production', () => {
    it('remappe un coursId PÉRIMÉ vers l’id de cours unanime des évals', () => {
        const c = codex(
            [{ id: 'P1', titre: 'Artefact 3', coursId: 'COURS_LEGACY' }],
            [
                { id: 'E1', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' },
                { id: 'E2', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' }
            ]
        );
        const { remaps } = calculerRemapsCoursId(c, T);
        expect(remaps).toHaveLength(1);
        expect(remaps[0]).toMatchObject({ productionId: 'P1', champ: 'coursId', de: 'COURS_LEGACY', vers: 'h2026-601-101-MQ-00001', nbEvals: 2 });
    });

    it('remplit un coursId VIDE (∅) avec l’id unanime des évals', () => {
        const c = codex(
            [{ id: 'P1', coursId: '' }],
            [{ id: 'E1', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' }]
        );
        const { remaps } = calculerRemapsCoursId(c, T);
        expect(remaps).toHaveLength(1);
        expect(remaps[0]).toMatchObject({ champ: 'coursId', de: '', vers: 'h2026-601-101-MQ-00001' });
    });

    it('ne touche PAS une production déjà alignée sur ses évals', () => {
        const c = codex(
            [{ id: 'P1', coursId: 'h2026-601-101-MQ-00001' }],
            [{ id: 'E1', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' }]
        );
        expect(calculerRemapsCoursId(c, T).remaps).toHaveLength(0);
    });

    it('ne tranche PAS quand les évals divergent (pas de remap arbitraire)', () => {
        const c = codex(
            [{ id: 'P1', coursId: 'COURS_PROD' }],
            [
                { id: 'E1', productionId: 'P1', coursId: 'COURS_A' },
                { id: 'E2', productionId: 'P1', coursId: 'COURS_B' }
            ]
        );
        expect(calculerRemapsCoursId(c, T).remaps).toHaveLength(0);
    });

    it('ne touche PAS une production SANS évaluation (ex. conteneur « Portfolio »)', () => {
        const c = codex(
            [{ id: 'PORTFOLIO', titre: 'Portfolio', coursId: 'COURS_LEGACY' }],
            [{ id: 'E1', productionId: 'AUTRE', coursId: 'h2026-601-101-MQ-00001' }]
        );
        expect(calculerRemapsCoursId(c, T).remaps).toHaveLength(0);
    });

    it('ignore les évals remplacées (remplaceeParId) dans le calcul d’unanimité', () => {
        const c = codex(
            [{ id: 'P1', coursId: 'COURS_LEGACY' }],
            [
                { id: 'E1', productionId: 'P1', coursId: 'COURS_MORT', remplaceeParId: 'E2' },
                { id: 'E2', productionId: 'P1', coursId: 'h2026-601-101-MQ-00001' }
            ]
        );
        const { remaps } = calculerRemapsCoursId(c, T);
        expect(remaps).toHaveLength(1);
        expect(remaps[0].vers).toBe('h2026-601-101-MQ-00001');
    });

    it('les évals SANS coursId ne votent pas (pas de remap si aucune éval ne déclare de coursId)', () => {
        const c = codex(
            [{ id: 'P1', coursId: 'COURS_LEGACY' }],
            [{ id: 'E1', productionId: 'P1' /* pas de coursId */ }]
        );
        expect(calculerRemapsCoursId(c, T).remaps).toHaveLength(0);
    });

    // ── GARANTIE CROSS-TRIMESTRE : un trimestre cohérent (ancien id légitime, partagé
    //    par productions ET évals) n'est JAMAIS touché ; seul le trimestre désaligné l'est.
    it('cas cross-trimestre : A25 cohérent intact, seul h2026 désaligné est remappé', () => {
        const c = {
            // h2026 : productions sur l'ancien id, évals sur l'id canonique → DÉSALIGNÉ
            h2026_productions: [{ id: 'P_H', titre: 'Artefact 3', coursId: 'COURS1766455789356' }],
            h2026_evaluationsSauvegardees: [
                { id: 'EH1', productionId: 'P_H', coursId: 'h2026-601-101-MQ-00001' },
                { id: 'EH2', productionId: 'P_H', coursId: 'h2026-601-101-MQ-00001' }
            ],
            // a2025 : productions ET évals partagent l'ancien id (LÉGITIME ici) → COHÉRENT
            a2025_productions: [{ id: 'P_A', titre: 'Artefact A25', coursId: 'COURS1766455789356' }],
            a2025_evaluationsSauvegardees: [
                { id: 'EA1', productionId: 'P_A', coursId: 'COURS1766455789356' }
            ]
        };
        const { remaps } = calculerRemapsCoursId(c, ['a2025', 'h2026']);
        expect(remaps).toHaveLength(1);
        expect(remaps[0]).toMatchObject({ trimestre: 'h2026', productionId: 'P_H', de: 'COURS1766455789356', vers: 'h2026-601-101-MQ-00001' });
        // Aucune entrée a2025 — l'ancien id légitime y reste intact.
        expect(remaps.some(r => r.trimestre === 'a2025')).toBe(false);
    });
});
