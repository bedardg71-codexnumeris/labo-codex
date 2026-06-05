import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session C (#303) Lot 3 — retrait du jeton déprécié SOM|PAN.
// Contrat verrouillé :
//  - obtenirIndicesCP(da) rend la couche unique (structure plate `actuel`) de la
//    pratique active ; il n'y a plus de branche jeton renvoyant {C,P,details}.
//  - un éventuel 2e argument (ancien jeton 'SOM'/'PAN') est IGNORÉ : même objet.
//  - le cluster mort obtenirHistoriqueIndicesCP / calculerDirectionEngagement est
//    retiré (plus exporté).
// L'invariant chiffré A-C-P est couvert par golden-master-calcul-sessionC ;
// cette sentinelle verrouille la signature/forme de la lecture des indices.

const DA = '1234567';
const ACTUEL = { date: '2026-06-04', pratique: 'PAN', C: 75, P: 88, details: { artefactsRetenus: ['a'] } };
const stores = {
    indicesCP: { [DA]: { actuel: ACTUEL, historique: [] } },
    modalitesEvaluation: { pratique: 'standards' },
    indicesAssiduite: {}
};
const db = {
    getSync: (k, d) => (k in stores ? stores[k] : (d !== undefined ? d : null)),
    setSync: () => {}, get: async () => null, set: async () => {}
};
const cle = (k) => k;
const obtenirDonneesSelonMode = (k) => stores[k];

let win;
beforeAll(() => {
    win = chargerScript('js/indices.js', { db, cle, obtenirDonneesSelonMode });
});

describe('Session C Lot 3 · retrait du jeton SOM|PAN', () => {
    it('obtenirIndicesCP(da) rend la structure plate `actuel` (pas de branche SOM/PAN)', () => {
        const r = win.obtenirIndicesCP(DA);
        expect(r).toBe(ACTUEL);
        expect(r.C).toBe(75);
        expect(r.P).toBe(88);
        expect(r.SOM).toBeUndefined();
        expect(r.PAN).toBeUndefined();
    });

    it('un 2e argument (ex-jeton) est ignoré : même objet retourné', () => {
        const sansArg = win.obtenirIndicesCP(DA);
        expect(win.obtenirIndicesCP(DA, 'SOM')).toBe(sansArg);
        expect(win.obtenirIndicesCP(DA, 'PAN')).toBe(sansArg);
    });

    it('la signature publique n\'expose plus de paramètre jeton (arité = 1)', () => {
        expect(win.obtenirIndicesCP.length).toBe(1);
    });

    it('DA inconnu → null', () => {
        expect(win.obtenirIndicesCP('0000000')).toBeNull();
    });

    it('le cluster mort historique/direction est retiré (plus exporté)', () => {
        expect(win.obtenirHistoriqueIndicesCP).toBeUndefined();
        expect(win.calculerDirectionEngagement).toBeUndefined();
    });
});
