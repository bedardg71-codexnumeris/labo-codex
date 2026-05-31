import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session A volet B (canonisation de la production des pratiques, 31 mai 2026).
//
// Verrou réel de l'étape 1 : `PratiqueManager.chargerPratiqueActive` lit le SSOT
// `modalites.pratique` puis route les pratiques codées en dur vers le registre.
// Avant ce volet, le test était fait sur les ids LEGACY en dur
// (`pan-standards`/`pan-specifications`) ; au moment où la production écrit du
// canonique (`standards`/`specifications`), une valeur canonique « tombait »
// dans la branche configurable JSON → `find` échoue → pratique active null.
//
// Cette sentinelle verrouille la tolérance : legacy ET canonique doivent router
// vers le registre, tandis qu'une pratique CONFIGURABLE (ex. pan-standards-bedard,
// absente de la table de normalisation) ne doit PAS être mal routée.

const MARQUEUR_REGISTRE = { __source: 'registre' };

function chargerManager(pratiqueSSOT, { normaliser } = {}) {
    const db = {
        getSync(c, d) {
            if (c === 'modalitesEvaluation') return { pratique: pratiqueSSOT };
            if (c === 'pratiquesConfigurables') return []; // aucune pratique configurable
            return d !== undefined ? d : null;
        },
        setSync() {},
        get: async () => null,
        set: async () => {}
    };
    const win = chargerScript('js/pratiques/pratique-manager.js', {
        db,
        cle: (k) => k,
        normaliserIdPratique: normaliser,
        // Le registre renvoie un marqueur reconnaissable : prouve qu'on a bien
        // emprunté la branche « pratique codée en dur ».
        obtenirPratiqueActive: () => MARQUEUR_REGISTRE
    });
    // obtenirPratiqueActive est lu via window.obtenirPratiqueActive dans le code.
    win.obtenirPratiqueActive = () => MARQUEUR_REGISTRE;
    return win;
}

let normaliserIdPratique;

beforeAll(() => {
    const registre = chargerScript('js/pratiques/pratique-registre.js', {
        db: { get: async () => null, getSync: (c, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => k
    });
    normaliserIdPratique = registre.normaliserIdPratique;
});

describe('Session A volet B · pratique-manager résout legacy ET canonique', () => {
    it('route les ids canoniques codés en dur vers le registre', async () => {
        for (const id of ['standards', 'specifications', 'sommative']) {
            const win = chargerManager(id, { normaliser: normaliserIdPratique });
            const res = await win.PratiqueManager.chargerPratiqueActive();
            expect(res, `id canonique ${id}`).toBe(MARQUEUR_REGISTRE);
        }
    });

    it('route encore les ids legacy (compat données non migrées)', async () => {
        for (const id of ['pan-standards', 'pan-specifications']) {
            const win = chargerManager(id, { normaliser: normaliserIdPratique });
            const res = await win.PratiqueManager.chargerPratiqueActive();
            expect(res, `id legacy ${id}`).toBe(MARQUEUR_REGISTRE);
        }
    });

    it('ne MAL-route PAS une pratique configurable (pan-standards-bedard) vers le registre', async () => {
        const win = chargerManager('pan-standards-bedard', { normaliser: normaliserIdPratique });
        const res = await win.PratiqueManager.chargerPratiqueActive();
        // Absente de la table de normalisation → reste configurable → branche JSON
        // → introuvable dans une liste vide → pas le marqueur registre.
        expect(res).not.toBe(MARQUEUR_REGISTRE);
    });

    it('reste fonctionnel si normaliserIdPratique est absent (guard typeof)', async () => {
        // Sans la fonction, le guard retombe sur la valeur brute ; un id legacy
        // ne matche plus le set canonique — comportement dégradé mais sans crash.
        const win = chargerManager('standards', { normaliser: undefined });
        const res = await win.PratiqueManager.chargerPratiqueActive();
        expect(res).toBe(MARQUEUR_REGISTRE); // 'standards' est déjà canonique → route OK
    });
});
