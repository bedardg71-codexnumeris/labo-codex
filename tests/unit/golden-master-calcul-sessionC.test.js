import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Session C (#303) — GOLDEN MASTER du moteur de calcul (Lot 0).
// Fige les chiffres A-C-P produits par le code ACTUEL sur une fixture contrôlée,
// pour que la refonte « calcul par famille » ne les déplace pas en silence.
// On harnache la pratique Sommative : elle calcule UNIQUEMENT depuis
// evaluationsSauvegardees + productions (aucune lecture de l'état global), donc
// reproductible hors navigateur. Invariant : ces valeurs ne doivent PAS bouger.

// Fixture : 1 étudiant, 2 productions pondérées 40/60, notes 80 et 90.
// Moyenne pondérée = (80×40 + 90×60) / (40+60) = 8600/100 = 86 → indice P = 0,86.
const DA = '1234567';
const store = {
    productions: [
        { id: 'P1', ponderation: 40 },
        { id: 'P2', ponderation: 60 }
    ],
    evaluationsSauvegardees: [
        { etudiantDA: DA, productionId: 'P1', noteFinale: 80, remplaceeParId: null },
        { etudiantDA: DA, productionId: 'P2', noteFinale: 90, remplaceeParId: null },
        // Remplacée → doit être exclue du calcul
        { etudiantDA: DA, productionId: 'P1', noteFinale: 10, remplaceeParId: 'x' },
        // noteFinale null → doit être exclue
        { etudiantDA: DA, productionId: 'P2', noteFinale: null, remplaceeParId: null }
    ]
};

const db = {
    getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
    setSync: () => {},
    get: async () => null,
    set: async () => {}
};
const cle = (k) => k;

let sommative;

beforeAll(() => {
    // Registre d'abord (fournit enregistrerPratique), puis l'instance sur le même window.
    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    chargerScript('js/pratiques/pratique-sommative.js', { db, cle }, win);
    sommative = win.obtenirPratiqueParId('sommative');
});

describe('Session C · golden master — Sommative.calculerPerformance', () => {
    it('résout bien l\'instance Sommative', () => {
        expect(sommative).toBeTruthy();
        expect(sommative.obtenirId()).toBe('sommative');
    });

    it('GOLDEN : moyenne pondérée = 0,86 (80×40 + 90×60)/100', () => {
        expect(sommative.calculerPerformance(DA)).toBeCloseTo(0.86, 10);
    });

    it('exclut les évaluations remplacées et les noteFinale null', () => {
        // Si elles n'étaient pas exclues, la moyenne changerait → ce test le garantit.
        expect(sommative.calculerPerformance(DA)).toBeCloseTo(0.86, 10);
    });

    it('DA invalide → null', () => {
        expect(sommative.calculerPerformance('')).toBeNull();
        expect(sommative.calculerPerformance('123')).toBeNull();
        expect(sommative.calculerPerformance(null)).toBeNull();
    });

    it('aucune évaluation pour le DA → null', () => {
        expect(sommative.calculerPerformance('7654321')).toBeNull();
    });
});
