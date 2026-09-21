import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session A volet B (canonisation de la production des pratiques, 31 mai 2026).
//
// Verrou réel de l'étape 1 : `PratiqueManager.chargerPratiqueActive` résout la
// pratique active puis route les pratiques codées en dur vers le registre.
// #328 L2-b2 (11 juin 2026) : la résolution passe par la SSOT
// `groupesCours[].pratiqueId` via obtenirPratiqueActiveGroupeCours — le miroir
// `modalites.pratique` n'existe plus ; le stub du helper remplace la fixture.
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
    // Lus via window.* dans le code.
    win.obtenirPratiqueActive = () => MARQUEUR_REGISTRE;
    win.obtenirPratiqueActiveGroupeCours = () => pratiqueSSOT;
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

// ↻ LOT N1a (21 sept. 2026, #713 volet registre / #710) — PratiqueManager NE ROUTE PLUS RIEN LUI-MÊME.
// Avant, `standards`, `sommative` et `specifications` (et leurs formes `pan-…`) étaient tenues pour des
// pratiques codées en dur valides et renvoyées au registre : un pointeur `specifications` nu donnait
// l'instance SPE jamais configurée, 50 % pour tout le monde. `chargerPratiqueActive` rend maintenant ce
// que rend LA résolution du registre (`window.resoudrePratiqueActive`) — et rien d'autre. Ce que la
// résolution décide pour chaque pointeur est prouvé sur le vrai moteur dans
// `sentinelle-lot-N1a-pratique-active-une-seule-facon.test.js`.
describe('Session A volet B ↻ N1a · pratique-manager rend ce que rend la résolution du registre', () => {
    const avecResolution = (pointeur, resolution) => {
        const win = chargerManager(pointeur, { normaliser: normaliserIdPratique });
        win.resoudrePratiqueActive = () => resolution;
        return win;
    };

    it('pratique résolue → son instance, quel que soit le pointeur (canonique, legacy ou configurable)', async () => {
        const instance = { obtenirId: () => 'la-pratique-assignee' };
        for (const id of ['sommative', 'pan-standards', 'pan-standards-bedard']) {
            const win = avecResolution(id, { etat: 'ok', idBrut: id, id, pratique: instance });
            expect(await win.PratiqueManager.chargerPratiqueActive(), `pointeur ${id}`).toBe(instance);
            expect(win.PratiqueManager.pratiqueActive).toBe(instance);
        }
    });

    it('#713 · un pointeur nu que la résolution dit « introuvable » → null, et le registre n\'est PAS consulté à côté', async () => {
        for (const id of ['specifications', 'pan-specifications', 'standards', 'pan-standards']) {
            const win = avecResolution(id, { etat: 'introuvable', idBrut: id, id: null, pratique: null });
            const res = await win.PratiqueManager.chargerPratiqueActive();
            expect(res, `pointeur ${id}`).toBeNull();
            expect(res).not.toBe(MARQUEUR_REGISTRE);
        }
    });

    it('rien d\'assigné, ou pratique assignée illisible → null', async () => {
        expect(await avecResolution(null, { etat: 'aucune', idBrut: null, id: null, pratique: null }).PratiqueManager.chargerPratiqueActive()).toBeNull();
        expect(await avecResolution('p1', { etat: 'illisible', idBrut: 'p1', id: 'p1', pratique: null }).PratiqueManager.chargerPratiqueActive()).toBeNull();
    });

    it('registre non chargé (aucune résolution) : null, sans lever', async () => {
        const win = chargerManager('standards', { normaliser: undefined });
        expect(await win.PratiqueManager.chargerPratiqueActive()).toBeNull();
    });
});
