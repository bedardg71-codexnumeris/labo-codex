import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';   // lot A (16 sept. 2026) : les deux prédicats réels du registre

// SENTINELLE #529 — Lot 2 : le défi spécifique se lit dans la DONNÉE, plus
// jamais dans la prose.
//
// CE QUI EXISTAIT. `identifierDefiSpecifique` retrouvait les scores par critère
// en passant une expression régulière sur le TEXTE de la rétroaction :
//
//   /(STRUCTURE|RIGUEUR|PLAUSIBILIT[ÉE]|NUANCE|FRAN[ÇC]AIS\s+[ÉE]CRIT)\s*\(([IDME])\)/gi
//
// Les cinq noms de critères de Grégoire ET les quatre codes IDME y étaient
// écrits. Pour toute autre grille, toute autre échelle, ou toute reformulation
// d'un libellé, le résultat était le même : aucun match, aucun score, un bloc
// « Forces et défis » muet — sans erreur, sans message, sans trace.
//
// Or `evaluation.criteres[]` porte la même information, structurée, DEPUIS LA
// CRÉATION DU DÉPÔT (octobre 2025) : critereId, critereNom, niveauSelectionne.
//
// Ce que cette sentinelle verrouille : une grille et une échelle qui ne
// ressemblent en RIEN à celles de Grégoire produisent un défi correct.

let win;
let evaluationsEnBase = [];
let echellesEnBase = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return echellesEnBase;
                return defaut !== undefined ? defaut : null;
            },
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (quoi) => {
            if (quoi === 'evaluationsSauvegardees') return evaluationsEnBase;
            if (quoi === 'productions') return [{ id: 'P1' }, { id: 'P2' }];
            return [];
        },
        obtenirIdsProductionsEvaluables: () => ['P1', 'P2'],
        obtenirNombreProductionsPourPatterns: () => 3,
        // #740 (16 sept. 2026) : `identifierDefiSpecifique` lit la grille de référence pour en exclure les critères
        // « Aucun ». Sans grille configurée — le cas de ce banc — tout critère est lu, comme avant.
        obtenirGrilleReferenceDepistage: () => null,
        obtenirSeuil: () => 0.75,
        obtenirPreference: () => null,
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {},
        afficherSection: () => {},
        afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false,
        filtrerEtudiantsParMode: (arr) => arr,
        estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {},
        calculerEtStockerIndicesCP: () => {}
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    chargerScript('js/profil-etudiant-calculs.js', stubs, win);
    chargerPredicatsCopie(win);
});

// Une grille de sciences et une échelle en lettres : rien de commun avec SRPNF/IDME.
const ECHELLE_LETTRES = {
    id: 'ECH_LETTRES', nom: 'Lettres',
    niveaux: [
        { code: 'A', valeurCalcul: 95 }, { code: 'B', valeurCalcul: 82 },
        { code: 'C', valeurCalcul: 68 }, { code: 'D', valeurCalcul: 45 }
    ]
};

function evaluationLabo(id, niveauMethode, niveauResultats, texteRetro) {
    return {
        id, etudiantDA: '111', productionId: id, productionNom: 'Labo ' + id,
        dateEvaluation: '2026-0' + id.slice(-1) + '-01T10:00:00.000Z',
        echelleId: 'ECH_LETTRES',
        noteFinale: 70,   // lot A (#741) : une copie enregistrée porte une note ; le texte ne la fait plus compter
        retroactionFinale: texteRetro,
        criteres: [
            { critereId: 'C_METH', critereNom: 'Méthode', niveauSelectionne: niveauMethode, ponderation: 40 },
            { critereId: 'C_RES', critereNom: 'Résultats', niveauSelectionne: niveauResultats, ponderation: 60 }
        ]
    };
}

describe('#529 Lot 2 · le défi se lit dans criteres[], plus dans la rétroaction', () => {

    it('une grille « Méthode / Résultats » et une échelle A-B-C-D donnent un défi — l\'ancien code rendait « Aucun »', () => {
        echellesEnBase = [ECHELLE_LETTRES];
        evaluationsEnBase = [
            evaluationLabo('P1', 'D', 'A', 'Bon travail dans l\'ensemble.'),
            evaluationLabo('P2', 'D', 'B', 'Continue ainsi.')
        ];
        const r = win.identifierDefiSpecifique('111');
        // Méthode : (0.45 + 0.45) / 2 = 0.45 — sous le seuil 0.75.
        // Résultats : (0.95 + 0.82) / 2 = 0.885 — au-dessus.
        expect(r.defi, 'le défi doit porter le nom réel du critère de la grille').toBe('Méthode');
        expect(r.score).toBeCloseTo(0.45, 5);
    });

    it('la rétroaction peut être VIDE ou reformulée : le calcul n\'en dépend plus', () => {
        echellesEnBase = [ECHELLE_LETTRES];
        // Aucune mention de critère ni de niveau dans le texte — l'ancienne
        // regex n'avait alors STRICTEMENT rien à se mettre sous la dent.
        evaluationsEnBase = [
            evaluationLabo('P1', 'D', 'A', ''),
            evaluationLabo('P2', 'D', 'A', 'Texte entièrement reformulé cette session.')
        ];
        const r = win.identifierDefiSpecifique('111');
        expect(r.defi).toBe('Méthode');
    });

    it('le critère le plus faible l\'emporte, et lui seul', () => {
        echellesEnBase = [ECHELLE_LETTRES];
        evaluationsEnBase = [{
            id: 'P1', etudiantDA: '111', productionId: 'P1', productionNom: 'Labo',
            dateEvaluation: '2026-05-01T10:00:00.000Z', echelleId: 'ECH_LETTRES',
            noteFinale: 70,   // lot A (#741)
            retroactionFinale: 'peu importe',
            criteres: [
                { critereId: 'C_A', critereNom: 'Méthode', niveauSelectionne: 'C' },   // 0.68
                { critereId: 'C_B', critereNom: 'Résultats', niveauSelectionne: 'D' }, // 0.45 ← le plus faible
                { critereId: 'C_C', critereNom: 'Discussion', niveauSelectionne: 'A' } // 0.95
            ]
        }];
        const r = win.identifierDefiSpecifique('111');
        expect(r.defi).toBe('Résultats');
        expect(r.score).toBeCloseTo(0.45, 5);
    });

    it('tout au-dessus du seuil → « Aucun », et un score nul', () => {
        echellesEnBase = [ECHELLE_LETTRES];
        evaluationsEnBase = [evaluationLabo('P1', 'A', 'A', 'x')];
        const r = win.identifierDefiSpecifique('111');
        expect(r.defi).toBe('Aucun');
        expect(r.score).toBeNull();
    });

    it('deux évaluations produites avec des ÉCHELLES DIFFÉRENTES sont converties chacune par la sienne', () => {
        // Le cœur du correctif : la table n'est plus globale. Une échelle
        // sur 100 et une échelle sur 4 coexistent sans se contaminer.
        echellesEnBase = [
            ECHELLE_LETTRES,
            { id: 'ECH_QUATRE', nom: 'Sur 4', niveaux: [
                { code: 'A', valeurCalcul: 25 },   // même CODE « A », valeur toute autre
                { code: 'B', valeurCalcul: 100 }
            ] }
        ];
        evaluationsEnBase = [
            { id: 'P1', etudiantDA: '111', productionId: 'P1', dateEvaluation: '2026-05-02T10:00:00Z',
              echelleId: 'ECH_LETTRES', noteFinale: 70, retroactionFinale: 'x',
              criteres: [{ critereId: 'C_M', critereNom: 'Méthode', niveauSelectionne: 'A' }] },   // 0.95
            { id: 'P2', etudiantDA: '111', productionId: 'P2', dateEvaluation: '2026-05-01T10:00:00Z',
              echelleId: 'ECH_QUATRE', noteFinale: 70, retroactionFinale: 'x',
              criteres: [{ critereId: 'C_M', critereNom: 'Méthode', niveauSelectionne: 'A' }] }    // 0.25
        ];
        const r = win.identifierDefiSpecifique('111');
        // (0.95 + 0.25) / 2 = 0.60. Avec une table unique, les deux « A »
        // auraient valu la même chose et la moyenne aurait été fausse.
        expect(r.defi).toBe('Méthode');
        expect(r.score, 'chaque évaluation convertie par SON échelle').toBeCloseTo(0.60, 5);
    });
});
