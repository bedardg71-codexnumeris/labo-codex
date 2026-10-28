/**
 * SENTINELLE #709 — UN CACHE `indicesCP` VIDE N'EST PAS UN ZÉRO.
 *
 * Audit du 5 septembre 2026, constat F-1 (Rapports/AUDIT-pratique-de-notation-2026-09-05.md).
 * `PratiqueConfigurable.calculerPerformance` lisait `indicesCP[da]` AVANT de déléguer, pour
 * toutes les méthodes, et rendait `0` — un nombre, « constructible » — tant que l'élève n'y
 * avait pas d'entrée : première passe d'indices d'un trimestre (banc F1 : SOM 0 puis 87),
 * élève ajouté, export lancé avant un recalcul (banc F2 : « 0, final » dans le CSV) ; et la
 * délégation SPE rendait 0 pour « aucune évaluation » (banc B6 : « 0, final »).
 *
 * Après : une sommative ou une spécification configurable calcule depuis les évaluations,
 * sans cache ; la lecture du cache (conversion_niveaux, replis) rend null s'il est vide.
 *
 * Break-test attendu : rétablir `return 0` quand l'entrée manque → les trois premiers cas rougissent.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { pontsResolution } from './_helpers/ponts-resolution.js';   // lot N1a (21 sept. 2026)

const clone = (x) => JSON.parse(JSON.stringify(x));
const DA = '3000001';
const SOM = { id: 'som-cfg', nom: 'SOM', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' }, configuration: {} };
const SPE = { id: 'spe-cfg', nom: 'SPE', type: 'specifications', calcul_note: { methode: 'specifications' },
    configuration: { typesTravaux: [{ id: 'examen', nom: 'Examen', seuilAcceptable: 70 }], tableBundles: [{ noteFixe: 80, requis: { examen: 1 } }, { noteFixe: 50, requis: null }] } };
const STD = { id: 'std-cfg', nom: 'STD', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, echelle: { type: 'niveaux', niveaux: [{ code: 'M', valeur_pourcentage: 80 }] }, configuration: { type: 'standards' } };

function monter(pratique, evaluations, indicesCP) {
    const store = { groupeCoursActif: { id: 'GC1', trimestreId: 'test' }, test_groupesCours: [{ id: 'GC1', trimestreId: 'test', pratiqueId: pratique.id }],
        test_pratiquesConfigurables: [clone(pratique)], test_productions: [{ id: 'P1', type: 'examen', ponderation: 40 }, { id: 'P2', type: 'examen', ponderation: 60 }],
        test_evaluationsSauvegardees: clone(evaluations), test_groupeEtudiants: [{ da: DA, nom: 'N', prenom: 'P' }], test_echellesTemplates: [] };
    if (indicesCP) store.test_indicesCP = clone(indicesCP);
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async () => null, set: async () => {} };
    const cle = (k) => 'test_' + k;
    const obtenirDonneesSelonMode = (k) => { const kb = k.startsWith('test_') ? k.slice(5) : k; return ('test_' + kb) in store ? clone(store['test_' + kb]) : (kb === 'indicesCP' ? {} : []); };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test' };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { db, cle, obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: (k, v) => { store['test_' + k] = clone(v); return true; },
        estEtudiantExclu: () => false, obtenirPratiqueActiveGroupeCours: () => pratique.id, ...pontsResolution(win, () => pratique.id),
        obtenirPratiqueParId: fwd('obtenirPratiqueParId'), obtenirTypePratiqueActive: fwd('obtenirTypePratiqueActive'),
        calculerDetailsNoteFinale: () => null, compterEvaluationsEcarteesDeLaNote: fwd('compterEvaluationsEcarteesDeLaNote') };
    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-manager.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    chargerScript('js/pratiques/pratique-sommative.js', globaux, win);
    chargerScript('js/pratiques/pratique-pan-specifications.js', globaux, win);
    chargerScript('js/portfolio.js', globaux, win);
    chargerScript('js/export-resultats-finaux.js', globaux, win);
    return { win, store };
}
const EVALS = [{ id: 'e1', etudiantDA: DA, productionId: 'P1', noteFinale: 80, ponderationCouverte: 100, verrouillee: true },
    { id: 'e2', etudiantDA: DA, productionId: 'P2', noteFinale: 90, ponderationCouverte: 100, verrouillee: true }];

describe('#709 · le zéro du premier calcul', () => {
    it('SOM configurable, cache vide : 0,86 dès le premier appel (avant : 0), et la PREMIÈRE passe d\'indices stocke 86', () => {
        const { win } = monter(SOM, EVALS);
        expect(win.obtenirPratiqueParId('som-cfg').calculerPerformance(DA)).toBeCloseTo(0.86, 10);   // (80×40 + 90×60)/100
        const passe1 = win.calculerEtStockerIndicesCP()[DA].actuel;
        expect([passe1.P, passe1.noteConstructible]).toEqual([86, true]);                           // avant : [0, true]
    });
    it('l\'export lancé AVANT toute passe d\'indices écrit la note, pas « 0, final »', () => {
        const { win } = monter(SOM, EVALS);
        const ligne = win._exportResultats.construireLignesSynthese([{ da: DA, nom: 'N', prenom: 'P' }], { pratiqueId: 'som-cfg' }, win.simulerIndices)[0];
        expect([ligne[8], ligne[9]]).toEqual([86, 'provisoire']);                                     // avant : [0, 'final'] ; E7 (28 oct.) : « provisoire » sans « Notes finalisées »
    });
    it('SPE configurable, cache vide : le palier dès le premier appel (0,8) ; SANS évaluation : null et « non constructible », jamais « 0, final »', () => {
        const avec = monter(SPE, EVALS);
        expect(avec.win.obtenirPratiqueParId('spe-cfg').calculerPerformance(DA)).toBe(0.8);            // avant : 0
        const sans = monter(SPE, []);
        expect(sans.win.obtenirPratiqueParId('spe-cfg').calculerPerformance(DA)).toBeNull();          // avant : 0
        const ligne = sans.win._exportResultats.construireLignesSynthese([{ da: DA, nom: 'N', prenom: 'P' }], { pratiqueId: 'spe-cfg' }, sans.win.simulerIndices)[0];
        expect([ligne[8], ligne[9]]).toEqual(['', 'non constructible']);                              // avant : [0, 'final']
    });
    it('STD configurable (conversion_niveaux) : le cache vide rend null ; le cache présent rend sa valeur, un 0 stocké compris', () => {
        const vide = monter(STD, EVALS);
        expect(vide.win.obtenirPratiqueParId('std-cfg').calculerPerformance(DA)).toBeNull();          // avant : 0
        const plein = monter(STD, EVALS, { [DA]: { actuel: { P: 79, C: 100 } } });
        expect(plein.win.obtenirPratiqueParId('std-cfg').calculerPerformance(DA)).toBeCloseTo(0.79, 10);
        const zero = monter(STD, EVALS, { [DA]: { actuel: { P: 0, C: 100 } } });
        expect(zero.win.obtenirPratiqueParId('std-cfg').calculerPerformance(DA)).toBe(0);
    });
    it('SOM configurable sans aucune évaluation : null (#395, inchangé)', () => {
        expect(monter(SOM, []).win.obtenirPratiqueParId('som-cfg').calculerPerformance(DA)).toBeNull();
    });
});
