import { describe, it, expect } from 'vitest';
import { calculerReparations } from '../../scripts/reparer-references-productions.mjs';

// Brique D — hygiène namespacing, BLOC 2 (juin 2026). calculerReparations() calcule
// le plan de remap des références de production périmées (production.grilleId/echelleId
// ≠ id UNANIME des évaluations de cette production) + la neutralisation des cartouches
// orphelines (gabarit absent du catalogue). LOGIQUE PURE, lecture seule, source de
// vérité = les évaluations (elles ont réellement noté les élèves).
//
// CONSERVATEUR : remap UNIQUEMENT si des évals existent ET s'accordent sur un id ≠ du
// champ production. Aucune éval / désaccord ⇒ on ne touche pas (on ne « tranche » pas).
//
// Break-test : dans reparer-references-productions.mjs, retirer la garde d'unanimité
// (`if (cible === null) continue;`) → le cas « évals divergentes » rougit (un remap
// arbitraire serait proposé). Ou retirer `if ((prod[champ]||'') === cible) continue;`
// → le cas « déjà aligné » rougit (remap inutile proposé).

function codexAvec(productions, evaluations, cartouchesCollections = {}) {
    return Object.assign({
        h2026_productions: productions,
        h2026_evaluationsSauvegardees: evaluations
    }, cartouchesCollections);
}
const T = ['h2026'];

describe('Brique D · BLOC 2 · calculerReparations — remap conservateur des références de production', () => {
    it('remappe un grilleId PÉRIMÉ vers l’id unanime des évals', () => {
        const codex = codexAvec(
            [{ id: 'P1', titre: 'Art', grilleId: 'GRILLE_PARTAGEE' }],
            [
                { id: 'E1', productionId: 'P1', grilleId: 'GRILLE_ISOLEE' },
                { id: 'E2', productionId: 'P1', grilleId: 'GRILLE_ISOLEE' }
            ]
        );
        const { remaps } = calculerReparations(codex, T);
        expect(remaps).toHaveLength(1);
        expect(remaps[0]).toMatchObject({ productionId: 'P1', champ: 'grilleId', de: 'GRILLE_PARTAGEE', vers: 'GRILLE_ISOLEE', nbEvals: 2 });
    });

    it('remplit un grilleId VIDE (∅) avec l’id unanime des évals', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: '' }],
            [{ id: 'E1', productionId: 'P1', grilleId: 'G_ISO' }]
        );
        const { remaps } = calculerReparations(codex, T);
        expect(remaps).toHaveLength(1);
        expect(remaps[0]).toMatchObject({ champ: 'grilleId', de: '', vers: 'G_ISO' });
    });

    it('ne touche PAS une production déjà alignée sur ses évals', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: 'G_OK' }],
            [{ id: 'E1', productionId: 'P1', grilleId: 'G_OK' }]
        );
        expect(calculerReparations(codex, T).remaps).toHaveLength(0);
    });

    it('ne tranche PAS quand les évals divergent (pas de remap arbitraire)', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: 'G_PROD' }],
            [
                { id: 'E1', productionId: 'P1', grilleId: 'G_A' },
                { id: 'E2', productionId: 'P1', grilleId: 'G_B' }
            ]
        );
        expect(calculerReparations(codex, T).remaps).toHaveLength(0);
    });

    it('ne touche PAS une production sans évaluation', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: 'G_PROD' }],
            [{ id: 'E1', productionId: 'AUTRE', grilleId: 'G_X' }]
        );
        expect(calculerReparations(codex, T).remaps).toHaveLength(0);
    });

    it('ignore les évals remplacées (remplaceeParId) dans le calcul d’unanimité', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: 'G_PERIME' }],
            [
                { id: 'E1', productionId: 'P1', grilleId: 'G_MORTE', remplaceeParId: 'E2' },
                { id: 'E2', productionId: 'P1', grilleId: 'G_ACTIVE' }
            ]
        );
        const { remaps } = calculerReparations(codex, T);
        expect(remaps).toHaveLength(1);
        expect(remaps[0].vers).toBe('G_ACTIVE');
    });

    it('remappe echelleId séparément de grilleId quand le champ existe', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: 'G_OK', echelleId: 'ECH_PERIME' }],
            [{ id: 'E1', productionId: 'P1', grilleId: 'G_OK', echelleId: 'ECH_ISO' }]
        );
        const { remaps } = calculerReparations(codex, T);
        expect(remaps).toHaveLength(1);
        expect(remaps[0]).toMatchObject({ champ: 'echelleId', de: 'ECH_PERIME', vers: 'ECH_ISO' });
    });

    it('cartouche orpheline : flaggée seulement avec opts.cartouches ET si absente du catalogue', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: 'G_OK' }],
            [{ id: 'E1', productionId: 'P1', grilleId: 'G_OK', cartoucheId: 'CART_DISPARUE' }],
            { 'cartouches_G_OK': [{ id: 'CART_VIVANTE' }] }
        );
        // sans opts.cartouches : rien
        expect(calculerReparations(codex, T).cartouches).toHaveLength(0);
        // avec opts.cartouches : la cartouche absente du catalogue est flaggée
        const avec = calculerReparations(codex, T, { cartouches: true }).cartouches;
        expect(avec).toHaveLength(1);
        expect(avec[0]).toMatchObject({ cartoucheId: 'CART_DISPARUE', nbEvals: 1 });
    });

    it('cartouche PRÉSENTE au catalogue : jamais flaggée', () => {
        const codex = codexAvec(
            [{ id: 'P1', grilleId: 'G_OK' }],
            [{ id: 'E1', productionId: 'P1', grilleId: 'G_OK', cartoucheId: 'CART_VIVANTE' }],
            { 'cartouches_G_OK': [{ id: 'CART_VIVANTE' }] }
        );
        expect(calculerReparations(codex, T, { cartouches: true }).cartouches).toHaveLength(0);
    });
});
