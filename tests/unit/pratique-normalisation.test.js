import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session A (assainissement des identifiants de pratiques, mai 2026).
// normaliserIdPratique est le point unique de canonicalisation legacy → canonique.
// Décision 29 mai : identifiants neutres (sommative/standards/specifications/denotation),
// codes courts (SOM/STD/SPE/DEN) inchangés. Session C Lot 4 : pan-objectifs est
// foldé dans standards (instance séparée retirée, décision D1).

let win;

beforeAll(() => {
    // pratique-registre.js n'a pas d'effet de bord top-level qui touche db ;
    // un stub minimal suffit (les fonctions ne l'utilisent qu'à l'appel).
    win = chargerScript('js/pratiques/pratique-registre.js', {
        db: { get: async () => null, getSync: (c, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => k
    });
});

describe('Session A · normaliserIdPratique', () => {
    it('expose normaliserIdPratique — et PLUS `PRATIQUE_DEFAUT` (lot N1b, 21 sept. 2026 : aucun lecteur ne se replie sur une pratique par défaut)', () => {
        expect(typeof win.normaliserIdPratique).toBe('function');
        expect(win.PRATIQUE_DEFAUT).toBeUndefined();
    });

    it('mappe chaque identifiant legacy vers son canonique', () => {
        const N = win.normaliserIdPratique;
        expect(N('alternative')).toBe('standards');
        expect(N('pan-maitrise')).toBe('standards');
        expect(N('pan-maitrise-json')).toBe('standards');
        expect(N('pan-standards')).toBe('standards');
        expect(N('pan-objectifs')).toBe('standards');
        expect(N('pan-specifications')).toBe('specifications');
        expect(N('pan-denotation')).toBe('denotation');
    });

    it('laisse les identifiants déjà canoniques inchangés', () => {
        const N = win.normaliserIdPratique;
        for (const id of ['sommative', 'standards', 'specifications', 'denotation', 'test']) {
            expect(N(id)).toBe(id);
        }
    });

    it('folde pan-objectifs dans standards (Session C Lot 4, décision D1)', () => {
        expect(win.normaliserIdPratique('pan-objectifs')).toBe('standards');
    });

    it('est idempotent : normaliser(normaliser(x)) === normaliser(x)', () => {
        const N = win.normaliserIdPratique;
        for (const id of ['pan-standards', 'pan-maitrise', 'pan-specifications', 'specifications', 'sommative', 'pan-objectifs']) {
            expect(N(N(id))).toBe(N(id));
        }
    });

    it('tolère les entrées non exploitables sans planter', () => {
        const N = win.normaliserIdPratique;
        expect(N(null)).toBe(null);
        expect(N(undefined)).toBe(undefined);
        expect(N('')).toBe('');
        expect(N('id-inconnu')).toBe('id-inconnu');
    });
});
