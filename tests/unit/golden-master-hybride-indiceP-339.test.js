import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #339 L0 — GOLDEN MASTER du moteur hybride « indice P » (15 juin 2026).
//
// Fige le comportement ACTUEL de calculerNoteAvecCategories (portfolio.js) —
// le SECOND moteur hybride, celui que le redesign #339 (§7 du diagnostic,
// PLAN-339 L4) va RETIRER au profit d'un moteur unique où l'indice P dérive
// de la note de session. Tant que ce moteur existe, ses chiffres ne doivent
// pas bouger « par accident » ; quand L4 le retirera, ce golden master rend
// VISIBLE et MESURABLE l'écart (c'est le but : unifier les 5 divergences du
// §3 du diagnostic, pas les masquer).
//
// Couvre, sur une fixture synthétique contrôlée, les pièges vérifiés du
// diagnostic A25 :
//   - sélection : N meilleures du pool `categorie === 'selection'`
//   - obligatoires : TOUTES comptent, manquante = 0 (piège L6 « zéro fantôme »)
//   - production SANS catégorie : silencieusement ignorée (piège L5)
//   - évaluation remplacée (remplaceeParId) : exclue (piège L9, versant P)
//   - pondération de pool : moyenne pondérée sélection/obligatoires
//
// Complète le golden master Playwright procédural (#328 L2-0) qui fige, lui,
// le chemin « note de session » du profil. Le profil hybride (#339 L0 bis)
// sera figé côté Playwright/CI avec les vraies données A25 (Mac).

const DA = '5550001';

// Config hybride : 2 meilleures en sélection (pond. 65), obligatoires (pond. 35).
const CONFIG_CATEGORIES = {
    actif: true,
    selection: { nombreARetenir: 2, ponderation: 65 },
    obligatoires: { ponderation: 35 }
};

// Productions : 3 sélection, 2 obligatoires (dont une jamais remise), 1 SANS
// catégorie (doit être ignorée — piège L5).
const PRODUCTIONS = [
    { id: 'S1', categorie: 'selection', titre: 'Sélection 1' },
    { id: 'S2', categorie: 'selection', titre: 'Sélection 2' },
    { id: 'S3', categorie: 'selection', titre: 'Sélection 3' },
    { id: 'O1', categorie: 'obligatoire', titre: 'Obligatoire 1' },
    { id: 'O2', categorie: 'obligatoire', titre: 'Obligatoire 2 (jamais remise)' },
    { id: 'X1', titre: 'Hors pool (sans catégorie)' }
];

// Évaluations : S1=60, S2=80, S3=90 (une vieille tentative de S3 remplacée à
// 10, EXCLUE), O1=70 (O2 absente → 0), X1=100 (ignorée car sans catégorie).
const EVALUATIONS = [
    { id: 'E_S1', etudiantDA: DA, productionId: 'S1', noteFinale: 60, remplaceeParId: null },
    { id: 'E_S2', etudiantDA: DA, productionId: 'S2', noteFinale: 80, remplaceeParId: null },
    { id: 'E_S3', etudiantDA: DA, productionId: 'S3', noteFinale: 90, remplaceeParId: null },
    { id: 'E_S3_OLD', etudiantDA: DA, productionId: 'S3', noteFinale: 10, remplaceeParId: 'E_S3' },
    { id: 'E_O1', etudiantDA: DA, productionId: 'O1', noteFinale: 70, remplaceeParId: null },
    { id: 'E_X1', etudiantDA: DA, productionId: 'X1', noteFinale: 100, remplaceeParId: null }
];

// Valeurs FIGÉES sur le code du 15 juin 2026. Calcul à la main :
//   sélection : meilleures 2 de {60,80,90} = {90,80} → moyenne 85
//   obligatoires : {O1=70, O2 manquante=0} → moyenne 35
//   note finale = 85 × 65/100 + 35 × 35/100 = 55,25 + 12,25 = 67,5
// Ne JAMAIS ajuster ces chiffres pour faire passer un refactoring sans
// diagnostic : un écart = le calcul a bougé (ce que L4 doit rendre explicite).
const GOLDEN = {
    noteFinale: 67.5,
    valide: true,
    selection: { moyenne: 85, retenues: 2, total: 3, disponibles: 3, ponderation: 65, notes: [90, 80] },
    obligatoires: { moyenne: 35, completees: 1, total: 2, ponderation: 35, notes: [70, 0] }
};

let win;

beforeAll(() => {
    const store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async () => null, set: async () => {}
    };
    const globaux = {
        db,
        cle: (k) => k,
        obtenirDonneesSelonMode: (k) => {
            if (k === 'productions') return PRODUCTIONS;
            if (k === 'evaluationsSauvegardees') return EVALUATIONS;
            return [];
        }
    };
    // #706 (5 sept. 2026) : la règle « ce qui entre dans la note » vit dans pratique-registre.js —
    // le charger d'abord sur le même window. Changement de HARNAIS seulement : les chiffres
    // GOLDEN sont inchangés (aucune évaluation de la fixture n'est un brouillon).
    win = chargerScript('js/pratiques/pratique-registre.js', globaux);
    chargerScript('js/portfolio.js', globaux, win);
});

describe('#339 L0 · golden master moteur hybride indice P (calculerNoteAvecCategories)', () => {
    it('expose calculerNoteAvecCategories', () => {
        expect(typeof win.calculerNoteAvecCategories).toBe('function');
    });

    it('fige la note finale et la décomposition (pièges L5/L6/L9 inclus)', () => {
        const r = win.calculerNoteAvecCategories(DA, CONFIG_CATEGORIES);
        expect(r.noteFinale).toBe(GOLDEN.noteFinale);
        expect(r.valide).toBe(GOLDEN.valide);
        expect(r.details.selection).toMatchObject(GOLDEN.selection);
        expect(r.details.obligatoires).toMatchObject(GOLDEN.obligatoires);
    });

    it('piège L5 : une production sans catégorie est ignorée (X1=100 absent du calcul)', () => {
        const r = win.calculerNoteAvecCategories(DA, CONFIG_CATEGORIES);
        // X1 (note 100) ne gonfle ni la sélection ni les obligatoires.
        expect(r.details.selection.total).toBe(3);     // S1/S2/S3 seulement
        expect(r.details.obligatoires.total).toBe(2);   // O1/O2 seulement
        const idsRetenus = r.details.selection.productions.map(p => p.id);
        expect(idsRetenus).not.toContain('X1');
    });

    it('piège L6 : obligatoire jamais remise comptée comme 0 (zéro fantôme)', () => {
        const r = win.calculerNoteAvecCategories(DA, CONFIG_CATEGORIES);
        const o2 = r.details.obligatoires.productions.find(p => p.id === 'O2');
        expect(o2).toMatchObject({ note: 0, manquante: true });
    });

    it('garde : configCategories absente ou inactive → note null, non valide', () => {
        expect(win.calculerNoteAvecCategories(DA, null)).toEqual({ noteFinale: null, valide: false, details: null });
        expect(win.calculerNoteAvecCategories(DA, { actif: false })).toEqual({ noteFinale: null, valide: false, details: null });
    });
});
