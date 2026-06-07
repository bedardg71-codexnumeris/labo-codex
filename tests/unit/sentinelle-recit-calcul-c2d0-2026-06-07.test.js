import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// C2-d.0 (Comparateur, fiche de profil) — RÉCIT UNIFIÉ dans simulerIndices.
// La fiche doit lire simulerIndices(da, id).recit pour TOUTE famille, sans
// ré-aiguiller (SSOT — éviter un 3ᵉ chemin de résolution). Contrat §4.
//  (1) STD  : recit provient de calculerDetailsNoteFinale.recit (C2-a).
//  (2) SOM/SPE : recit provient de instance.decrireCalcul (C2-b/C2-c).
//  (3) INDISPONIBLE : ni l'un ni l'autre → recit null (jamais d'erreur).
//  (4) ADDITIF : C / P / noteFinale / details inchangés par l'ajout du champ.

const DA = '1111111';

// Récits factices conformes au contrat §4 (un par famille).
const RECIT_STD = {
    famille: 'STD', pratiqueNom: 'Standards',
    resultats: [{ label: 'Artefact 1', date: null, niveau: 'E', note: 90, sort: 'compte', detail: 'retenue' }],
    synthese: { formuleTexte: 'portfolio × 60 % + terminale × 40 %', noteFinale: 79, plafonnement: null }
};
const RECIT_SOM = {
    famille: 'SOM', pratiqueNom: 'Sommative traditionnelle',
    resultats: [{ label: 'Dissertation', date: null, niveau: 'M', note: 80, sort: 'compte', detail: 'comptée une fois · poids 60 %' }],
    synthese: { formuleTexte: 'moyenne pondérée de 1 évaluation', noteFinale: 66, plafonnement: null }
};
const RECIT_SPE = {
    famille: 'SPE', pratiqueNom: 'PAN par spécifications',
    resultats: [{ label: 'Examen', date: null, niveau: null, note: null, sort: 'satisfait', detail: '1 acceptable · 1 exigé (palier C)' }],
    synthese: { formuleTexte: 'palier C atteint', noteFinale: 60, plafonnement: null }
};

const instances = {
    // STD : note portfolio présente → details (et son recit) priment.
    'std-prat': { calculerCompletion: () => 0.90, calculerPerformance: () => 0.79 },
    // SOM/SPE : pas de note portfolio → instance.decrireCalcul fournit le récit.
    'som-prat': { calculerCompletion: () => 0.70, calculerPerformance: () => 0.66, decrireCalcul: () => RECIT_SOM },
    'spe-prat': { calculerCompletion: () => 0.50, calculerPerformance: () => 0.60, decrireCalcul: () => RECIT_SPE },
    // Indisponible : ni details.recit, ni decrireCalcul.
    'nu-prat': { calculerCompletion: () => 0.40, calculerPerformance: () => 0.50 }
};

const NOTES = { 'std-prat': 79 }; // seul STD a une note finale portfolio

let win;

beforeAll(() => {
    const store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; }, get: async () => null, set: async () => {}
    };
    win = chargerScript('js/portfolio.js', {
        db, cle: (k) => k,
        obtenirPratiqueParId: (id) => instances[id] || null,
        obtenirPratiqueActiveGroupeCours: () => 'std-prat',
        obtenirDonneesSelonMode: () => [],
        estEtudiantExclu: () => false,
        calculerDetailsNoteFinale: (da, id) =>
            (id in NOTES) ? { noteFinale: NOTES[id], recit: RECIT_STD } : { noteFinale: null, recit: null }
    });
});

describe('C2-d.0 · récit unifié dans simulerIndices', () => {
    it('STD : recit provient de calculerDetailsNoteFinale.recit', () => {
        const r = win.simulerIndices(DA, 'std-prat');
        expect(r.recit).toBe(RECIT_STD);
        expect(r.recit.famille).toBe('STD');
        expect(r.noteFinale).toBe(79); // additif : la note ne bouge pas
    });

    it('SOM : recit provient de instance.decrireCalcul (pas de note portfolio)', () => {
        const r = win.simulerIndices(DA, 'som-prat');
        expect(r.recit).toBe(RECIT_SOM);
        expect(r.recit.famille).toBe('SOM');
        expect(r.noteFinale).toBeNull();
        expect(r.P).toBe(66); // calculerPerformance (0.66 → 66)
    });

    it('SPE : recit provient de instance.decrireCalcul (niveaux en code brut/null)', () => {
        const r = win.simulerIndices(DA, 'spe-prat');
        expect(r.recit).toBe(RECIT_SPE);
        expect(r.recit.famille).toBe('SPE');
        expect(r.recit.resultats[0].niveau).toBeNull();
    });

    it('INDISPONIBLE : ni details.recit ni decrireCalcul → recit null', () => {
        const r = win.simulerIndices(DA, 'nu-prat');
        expect(r.recit).toBeNull();
        expect(r.P).toBe(50); // le reste du contrat simulerIndices fonctionne
    });

    it('ADDITIF : la forme de retour conserve C / P / noteFinale / details', () => {
        const r = win.simulerIndices(DA, 'std-prat');
        expect(r).toMatchObject({ pratique: 'std-prat', C: 90, P: 79, noteFinale: 79 });
        expect(r.details).not.toBeNull();
        expect('recit' in r).toBe(true);
    });

    it('garde-fous inchangés : da/pratiqueId manquant ou inconnu → null', () => {
        expect(win.simulerIndices('', 'std-prat')).toBeNull();
        expect(win.simulerIndices(DA, null)).toBeNull();
        expect(win.simulerIndices(DA, 'inexistante')).toBeNull();
    });
});
