import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle C2 (#358 — corollaire de la migration namespacée des modèles).
//
// CE QU'ELLE VERROUILLE : `identifierTemplatesUtilises` (trimestres.js) — le SSOT
// d'usage des modèles d'un trimestre — réconcilie les ÉVALUATIONS (source
// grade-bearing) en plus des productions. Avant C2, il ne lisait que les
// productions ; or `production.grilleId` est souvent périmé (résidu de
// contamination inter-trimestre). Une grille/échelle/pratique utilisée par une
// éval mais ABSENTE des productions était alors ratée → snapshot d'archivage et
// migration namespacée amputés (classe de bug « grille d'origine introuvable »,
// Brique A). Cas réel : h2026 a 2 grilles d'évals que ses productions rataient.
//
// BREAK-TEST (SKILL_verification_adverse) : retirer l'une des deux lectures
// d'évals dans identifierTemplatesUtilises fait ROUGIR au moins une assertion
// ci-dessous — chaque dimension (grille / échelle / pratique) mord seule.

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

// Trimestre où chaque famille de modèle a un cas « éval seule » (absent des
// productions) ET un cas « production seule » — pour prouver qu'on garde les deux.
function storeMixte() {
    return {
        trimestres: [{ id: 'h2026', actif: true, archive: false }],
        h2026_productions: [
            { id: 'P1', grilleId: 'G_PROD_ONLY', echelleId: 'ECH_PROD_ONLY', pratiqueId: 'P_PROD_ONLY' }
        ],
        h2026_evaluationsSauvegardees: [
            { id: 'E1', grilleId: 'G_EVAL_ONLY', echelleId: 'ECH_EVAL_ONLY' },
            { id: 'E2', grilleId: 'G_EVAL_ONLY', echelleId: 'pratique-P_EVAL_ONLY' }
        ],
        grillesTemplates: [
            { id: 'G_PROD_ONLY' }, { id: 'G_EVAL_ONLY' }
        ],
        h2026_groupesCours: [{ id: 'GC', pratiqueId: 'P_ACTIVE' }]
    };
}

describe('C2 (#358) · identifierTemplatesUtilises réconcilie les évaluations', () => {
    function identifier(store, trim) {
        const win = chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
        expect(typeof win.identifierTemplatesUtilises).toBe('function');
        return win.identifierTemplatesUtilises(trim);
    }

    it('GRILLE utilisée par une éval mais ABSENTE des productions → incluse', () => {
        const r = identifier(storeMixte(), 'h2026');
        expect(r.grilleIds.has('G_EVAL_ONLY')).toBe(true);   // C2 : sans la lecture d'évals, raté
        expect(r.grilleIds.has('G_PROD_ONLY')).toBe(true);   // la lecture des productions reste
    });

    it('ÉCHELLE utilisée directement par une éval → incluse', () => {
        const r = identifier(storeMixte(), 'h2026');
        expect(r.echelleIds.has('ECH_EVAL_ONLY')).toBe(true); // C2
        expect(r.echelleIds.has('ECH_PROD_ONLY')).toBe(true);
    });

    it('PRATIQUE référencée par un echelleId « pratique-<id> » d\'éval → incluse, PAS comme échelle', () => {
        const r = identifier(storeMixte(), 'h2026');
        expect(r.pratiqueIds.has('P_EVAL_ONLY')).toBe(true);  // C2
        expect(r.pratiqueIds.has('P_PROD_ONLY')).toBe(true);  // production
        expect(r.pratiqueIds.has('P_ACTIVE')).toBe(true);     // groupe-cours (#328)
        // le préfixe « pratique- » ne doit PAS polluer les échelles
        expect(r.echelleIds.has('pratique-P_EVAL_ONLY')).toBe(false);
        expect(r.echelleIds.has('P_EVAL_ONLY')).toBe(false);
    });

    it('trimestre sans évaluations → comportement productions inchangé (rétrocompat)', () => {
        const store = storeMixte();
        store.h2026_evaluationsSauvegardees = [];
        const r = identifier(store, 'h2026');
        expect(r.grilleIds.has('G_PROD_ONLY')).toBe(true);
        expect(r.grilleIds.has('G_EVAL_ONLY')).toBe(false); // plus d'éval → plus ce gain
        expect([...r.grilleIds].length).toBe(1);
    });
});
