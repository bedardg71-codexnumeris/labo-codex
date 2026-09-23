/**
 * SENTINELLE #708 — UNE PRATIQUE PAR SPÉCIFICATIONS ÉCRITE EN `forfaits` CALCULE.
 *
 * Audit du 5 septembre 2026, constat D-3 (Rapports/AUDIT-pratique-de-notation-2026-09-05.md).
 * Le moteur lisait `tableBundles { noteFixe, requis }` ; le gabarit « Modèle simple »
 * (pratiques-bibliotheque.js), l'éditeur de gabarit (pratiques-gestion.js) et l'ancien éditeur
 * (pratique-notation-v2.js) écrivent `forfaits { lettre, note, travaux }` et des types de
 * travail à id NUMÉRIQUE sans seuil propre. Rien ne traduisait : 0 pour toute la classe,
 * « constructible », exporté « 0, final » (banc D9).
 *
 * Après : `configurerPratique` traduit forfaits → tableBundles à la lecture (une seule fois,
 * rien n'est réécrit chez les gens), et un type de travail s'apparie à une production par son
 * id OU par son nom (« Projet » ↔ `projet`, « Examen » ↔ `examen`).
 *
 * Break-test attendu : retirer la traduction (ou l'appariement par nom) → le premier cas rougit.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const DA = { A: '2000001', B: '2000002', C: '2000003' };

// La forme EXACTE du gabarit « Modèle simple » (pratiques-bibliotheque.js:60-80).
const GABARIT = { id: 'spe-gabarit', nom: 'Modèle simple', type: 'specifications', calcul_note: { methode: 'specifications' },
    configuration: { seuilAcceptable: 75,
        typesTravaux: [{ id: 1, nom: 'Projet', description: 'Travail pratique ou créatif' }, { id: 2, nom: 'Examen', description: 'Évaluation sommative' }],
        forfaits: [{ id: 1, lettre: 'Excellence', note: 90, travaux: { 1: 2, 2: 1 } }, { id: 2, lettre: 'Réussite', note: 70, travaux: { 1: 1, 2: 1 } }] } };
// Ce que l'assistant écrit (wizard-pratique-v2.js:2749-2773) : ni types, ni forfaits.
const ASSISTANT = { id: 'spe-assistant', nom: 'SPE de l\'assistant', type: 'specifications', calcul_note: { methode: 'specifications' },
    configuration: { seuilAcceptabilite: 100, jetons: { activer: false }, modeleBundle: 'classique' } };
// La forme du moteur (celle du pack démo et de la sentinelle C2-c).
const MOTEUR = { id: 'spe-moteur', nom: 'SPE moteur', type: 'specifications', calcul_note: { methode: 'specifications' },
    configuration: { typesTravaux: [{ id: 'projet', nom: 'Projet', seuilAcceptable: 75 }, { id: 'examen', nom: 'Examen', seuilAcceptable: 75 }],
        tableBundles: [{ noteFixe: 90, label: 'Excellence', requis: { projet: 2, examen: 1 } }, { noteFixe: 70, label: 'Réussite', requis: { projet: 1, examen: 1 } }] } };

const PRODUCTIONS = [{ id: 'PR1', titre: 'Projet 1', type: 'projet' }, { id: 'PR2', titre: 'Projet 2', type: 'projet' }, { id: 'EX1', titre: 'Examen', type: 'examen' }];
function ev(id, da, productionId, noteFinale) {
    return { id, etudiantDA: da, productionId, noteFinale, niveauFinal: 'M', ponderationCouverte: 100, verrouillee: true, statutRemise: 'remis' };
}
// À la main (seuil 75) : A → projet 80, 85 et examen 90 → 2 + 1 → Excellence 90 ;
//                        B → projet 80 et examen 90 → Réussite 70 ;
//                        C → projet 60 (< 75) et examen 90 → aucun forfait, aucun palier d'échec déclaré → AUCUNE NOTE
//                            (lot N4, #713 : avant, un 50 écrit dans le moteur).
const EVALUATIONS = [ev('a1', DA.A, 'PR1', 80), ev('a2', DA.A, 'PR2', 85), ev('a3', DA.A, 'EX1', 90),
    ev('b1', DA.B, 'PR1', 80), ev('b2', DA.B, 'EX1', 90),
    ev('c1', DA.C, 'PR1', 60), ev('c2', DA.C, 'EX1', 90)];

function monter(pratique) {
    const store = { groupeCoursActif: { id: 'GC1', trimestreId: 'test' }, test_groupesCours: [{ id: 'GC1', trimestreId: 'test', pratiqueId: pratique.id }],
        test_pratiquesConfigurables: [clone(pratique)], test_productions: clone(PRODUCTIONS), test_evaluationsSauvegardees: clone(EVALUATIONS),
        test_groupeEtudiants: Object.values(DA).map(da => ({ da, nom: 'N', prenom: 'P' })), test_echellesTemplates: [] };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async () => null, set: async () => {} };
    const cle = (k) => 'test_' + k;
    const obtenirDonneesSelonMode = (k) => { const kb = k.startsWith('test_') ? k.slice(5) : k; return ('test_' + kb) in store ? clone(store['test_' + kb]) : (kb === 'indicesCP' ? {} : []); };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test',
        TYPES_PRODUCTION: [{ id: 'examen', libelle: 'Examen' }, { id: 'travail', libelle: 'Travail écrit' }, { id: 'projet', libelle: 'Projet' }] };
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { db, cle, obtenirDonneesSelonMode, sauvegarderDonneesSelonMode: (k, v) => { store['test_' + k] = clone(v); return true; },
        estEtudiantExclu: () => false, obtenirPratiqueActiveGroupeCours: () => pratique.id,
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

describe('#708 · la forme « forfaits » du gabarit calcule', () => {
    it('LE CAS QUI RENDAIT 0 À TOUTE LA CLASSE — le gabarit « Modèle simple » : 90 · 70 · aucune note, par la configurable et par la simulation', () => {
        const { win } = monter(GABARIT);
        const p = win.obtenirPratiqueParId('spe-gabarit');
        expect(p.calculerPerformance(DA.A)).toBe(0.9);      // avant : 0
        expect(p.calculerPerformance(DA.B)).toBe(0.7);      // avant : 0
        expect(p.calculerPerformance(DA.C)).toBeNull();     // avant #708 : 0 ; avant le lot N4 : 0,5 (plancher codé en dur)
        expect(win.simulerIndices(DA.A, 'spe-gabarit')).toMatchObject({ P: 90, noteConstructible: true });
        const lignes = win._exportResultats.construireLignesSynthese(Object.values(DA).map(da => ({ da, nom: 'N', prenom: 'P' })), { pratiqueId: 'spe-gabarit' }, win.simulerIndices);
        expect(lignes.map(l => l[8])).toEqual([90, 70, '']);
    });
    it('le récit de calcul suit, sous le nom de la pratique : Projet et Examen « satisfaits » pour A, palier « Excellence »', () => {
        const { win } = monter(GABARIT);
        const recit = win.obtenirPratiqueParId('spe-gabarit').decrireCalcul(DA.A);
        expect(recit.pratiqueNom).toBe('Modèle simple');
        expect(recit.resultats.map(r => r.sort)).toEqual(['satisfait', 'satisfait']);
        expect(recit.synthese.noteFinale).toBe(90);
        expect(recit.synthese.formuleTexte).toMatch(/Excellence/);
    });
    it('la forme du moteur (tableBundles) rend les MÊMES nombres — parité des deux formes', () => {
        const { win } = monter(MOTEUR);
        const p = win.obtenirPratiqueParId('spe-moteur');
        expect([p.calculerPerformance(DA.A), p.calculerPerformance(DA.B), p.calculerPerformance(DA.C)]).toEqual([0.9, 0.7, null]);
    });
    it('ce que l\'assistant écrit (ni types ni forfaits) reste NON CONSTRUCTIBLE — null, jamais 0, et l\'export le dit', () => {
        const { win } = monter(ASSISTANT);
        expect(win.obtenirPratiqueParId('spe-assistant').calculerPerformance(DA.A)).toBeNull();
        const ligne = win._exportResultats.construireLignesSynthese([{ da: DA.A, nom: 'N', prenom: 'P' }], { pratiqueId: 'spe-assistant' }, win.simulerIndices)[0];
        // Lot N4 (#713) : l'export nomme la cause.
        expect([ligne[8], ligne[9]]).toEqual(['', 'non constructible – Ta pratique n\'a pas encore ses types de productions et ses forfaits : aucune note ne peut être calculée. Règle-les dans Conception › Pratiques de notation (clique sur la pratique).']);
    });
    it('la traduction : seuil de la racine propagé aux types, note → noteFixe, lettre → label, travaux → requis, forfait sans travaux → palier plancher', () => {
        const { win } = monter(GABARIT);
        const n = win.normaliserConfigurationSpecifications({ seuilAcceptable: 75,
            typesTravaux: [{ id: 1, nom: 'Projet' }, { id: 2, nom: 'Examen', seuilAcceptable: 60 }],
            forfaits: [{ lettre: 'A', note: 100, travaux: { 1: 2 } }, { lettre: 'F', note: 50, travaux: {} }] });
        expect(n.typesTravaux.map(t => t.seuilAcceptable)).toEqual([75, 60]);
        expect(n.tableBundles).toEqual([{ noteFixe: 100, label: 'A', description: undefined, requis: { 1: 2 } }, { noteFixe: 50, label: 'F', description: undefined, requis: null }]);
        expect(win.normaliserConfigurationSpecifications({ typesTravaux: [], tableBundles: [{ noteFixe: 60, requis: null }] }).tableBundles).toEqual([{ noteFixe: 60, requis: null }]);
        expect(win.normaliserConfigurationSpecifications({}).tableBundles).toBeNull();
    });
    it('l\'appariement par nom est insensible à la casse et aux accents, et lit aussi le libellé du type de production', () => {
        const jeu = clone(GABARIT); jeu.configuration.typesTravaux = [{ id: 1, nom: 'PROJET' }, { id: 2, nom: 'Travail écrit' }];
        const { win, store } = monter(jeu);
        store.test_productions = [{ id: 'PR1', type: 'projet' }, { id: 'PR2', type: 'projet' }, { id: 'EX1', type: 'travail' }];
        expect(win.obtenirPratiqueParId('spe-gabarit').calculerPerformance(DA.A)).toBe(0.9);
    });
});
