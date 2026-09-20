import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #395 — Pratiques configurables Sommative : P = 0 pour tous.
// Avant : PratiqueConfigurable.calculerPerformance lisait le format DUAL
// d'indicesCP (actuel.SOM?.P / actuel.PAN?.P) retiré en Beta 95.5 — le store
// est PLAT ({date, pratique, C, P, details}) → toujours undefined → || 0,
// affiché comme un vrai zéro (noteConstructible restait true). Sonde du
// rapport d'audit : store plat {C:70, P:86} → calculerPerformance = 0
// (attendu sain : 0,86). SPE avait été corrigée le 6 juin par délégation ;
// moyenne_ponderee et conversion_niveaux étaient restées sur le dual.
//
// Le fix (patron SPE) : 'moyenne_ponderee' délègue à une PratiqueSommative
// jetable (vraie moyenne pondérée) ; 'conversion_niveaux' et les replis
// lisent le format PLAT.

const DA = '1234567';

function chargerChaine(store) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async () => null,
        set: async () => {}
    };
    const cle = (k) => k;
    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    chargerScript('js/pratiques/pratique-sommative.js', { db, cle }, win);
    chargerScript('js/pratiques/pratique-configurable.js', { db, cle }, win);
    return win;
}

// 20 sept. 2026 — `pratiqueDuCache` : l'entrée porte la pratique qui l'a calculée, et le repli ne lit plus le cache
// d'une AUTRE pratique (chemin frère d'A-3). La fixture partagée disait 'som-cfg' pour des instances 'std-cfg' et
// 'spe-cfg' : sans le vouloir, deux essais figeaient le défaut. Chaque essai nomme maintenant la pratique de son cache.
function storeDeBase(pratiqueDuCache = 'som-cfg') {
    return {
        // Store PLAT (Beta 95.5+) — la sonde du rapport : C 70, P 86.
        indicesCP: {
            [DA]: { actuel: { date: '2026-08-01', pratique: pratiqueDuCache, C: 70, P: 86, details: {} } }
        },
        productions: [
            { id: 'P1', ponderation: 40 },
            { id: 'P2', ponderation: 60 }
        ],
        evaluationsSauvegardees: [
            { etudiantDA: DA, productionId: 'P1', noteFinale: 80, remplaceeParId: null },
            { etudiantDA: DA, productionId: 'P2', noteFinale: 90, remplaceeParId: null }
        ]
    };
}

describe('#395 — configurable Sommative (moyenne_ponderee) : délégation, plus de 0 systématique', () => {
    it('sonde du rapport : store plat + notes réelles → P = 0,86 (avant : 0)', () => {
        const win = chargerChaine(storeDeBase());
        const pratique = new win.PratiqueConfigurable({
            id: 'som-cfg', nom: 'SOM du wizard', type: 'sommative',
            calcul_note: { methode: 'moyenne_ponderee' }
        });
        // Vraie moyenne pondérée déléguée : (80×40 + 90×60)/100 = 86 → 0,86.
        expect(pratique.calculerPerformance(DA)).toBeCloseTo(0.86, 10);
    });

    it('aucune évaluation pour le DA → null (« non calculable »), jamais un zéro déguisé', () => {
        const store = storeDeBase();
        store.evaluationsSauvegardees = [];
        const win = chargerChaine(store);
        const pratique = new win.PratiqueConfigurable({
            id: 'som-cfg', nom: 'SOM du wizard', type: 'sommative',
            calcul_note: { methode: 'moyenne_ponderee' }
        });
        expect(pratique.calculerPerformance(DA)).toBeNull();
    });
});

describe('#395 — configurable conversion_niveaux : lecture du store PLAT', () => {
    const ECHELLE = {
        type: 'niveaux',
        niveaux: [
            { code: 'I', valeur_pourcentage: 55 },
            { code: 'D', valeur_pourcentage: 70 },
            { code: 'M', valeur_pourcentage: 80 },
            { code: 'E', valeur_pourcentage: 90 }
        ]
    };

    it('sonde du rapport : store plat {P: 86} → 0,86 (avant : 0 via actuel.PAN?.P)', () => {
        const win = chargerChaine(storeDeBase('std-cfg'));
        const pratique = new win.PratiqueConfigurable({
            id: 'std-cfg', nom: 'STD du wizard', type: 'standards',
            calcul_note: { methode: 'conversion_niveaux' },
            echelle: ECHELLE
        });
        expect(pratique.calculerPerformance(DA)).toBeCloseTo(0.86, 10);
    });

    it('le repli SPE (config incomplète) lit aussi le format plat', () => {
        const win = chargerChaine(storeDeBase('spe-cfg'));
        const pratique = new win.PratiqueConfigurable({
            id: 'spe-cfg', nom: 'SPE incomplète', type: 'specifications',
            calcul_note: { methode: 'specifications' }
            // pas de typesTravaux/tableBundles → repli sur la valeur stockée
        });
        expect(pratique.calculerPerformance(DA)).toBeCloseTo(0.86, 10);
    });

    it('le repli ne lit pas le cache calculé sous une AUTRE pratique → null, jamais la note d\'une autre règle', () => {
        const win = chargerChaine(storeDeBase('som-cfg'));
        const pratique = new win.PratiqueConfigurable({
            id: 'spe-cfg', nom: 'SPE incomplète', type: 'specifications',
            calcul_note: { methode: 'specifications' }
        });
        expect(pratique.calculerPerformance(DA)).toBeNull();
    });
});
