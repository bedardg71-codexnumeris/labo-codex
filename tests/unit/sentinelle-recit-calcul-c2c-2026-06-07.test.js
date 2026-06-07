import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// C2-c (Comparateur, fiche de profil) — récit de calcul SPE : traçabilité ADDITIVE
// via PratiquePanSpecifications.decrireCalcul(da). Contrat NOTE-CONCEPTION-C2 §4.
// En spécifications, la note est un PALIER : on décrit chaque type de travail par
// son sort (satisfait / manquant / non-exige) vis-à-vis du palier atteint.
//  (1) PARITÉ : la note du récit == calculerPerformance × 100 (palier inchangé).
//  (2) CONTRAT : recit rempli, sorts dans l'énumération.
//  (3) SÉMANTIQUE SPE : satisfait / manquant / non-exige correctement attribués.
//  (4) EXCLUSION : une version remplacée par reprise ne compte pas (palier honnête).
//  (5) REPLI : sans config exploitable → null (jamais d'échec global hors STD).

const DA = '1234567';

const TYPES = [
    { id: 'dissertation', nom: 'Dissertation', seuilAcceptable: 70 },
    { id: 'examen', nom: 'Examen', seuilAcceptable: 70 },
    { id: 'portfolio', nom: 'Portfolio', seuilAcceptable: 70 },
    { id: 'oral', nom: 'Présentation orale', seuilAcceptable: 70 } // jamais requis dans les bundles
];

const BUNDLES = [
    { noteFixe: 100, label: 'A', requis: { dissertation: 2, examen: 2, portfolio: 1 }, description: 'Excellence' },
    { noteFixe: 80, label: 'B', requis: { dissertation: 2, examen: 1, portfolio: 1 }, description: 'Bonne performance' },
    { noteFixe: 70, label: 'C+', requis: { dissertation: 1, examen: 1, portfolio: 1 }, description: 'Maîtrise acceptable' },
    { noteFixe: 60, label: 'C', requis: { dissertation: 1, examen: 1 }, description: 'Réussite minimale' },
    { noteFixe: 50, label: 'F', requis: null, description: 'Échec' }
];

const PRODUCTIONS = [
    { id: 'd1', type: 'dissertation' },
    { id: 'd2', type: 'dissertation' },
    { id: 'e1', type: 'examen' },
    { id: 'p1', type: 'portfolio' },
    { id: 'p2', type: 'portfolio' },
    { id: 'o1', type: 'oral' }
];

// Acceptables (>=70) : d1, e1, o1. Non acceptable : p1 (60). Remplacée (exclue) : p2 (95).
// Comptes effectifs → dissertation 1, examen 1, portfolio 0, oral 1 → palier C (60).
// (Si p2 était comptée, portfolio 1 ⇒ C+ 70 : le golden 60 prouve l'exclusion.)
const EVALS = [
    { etudiantDA: DA, productionId: 'd1', noteFinale: 80 },
    { etudiantDA: DA, productionId: 'e1', noteFinale: 90 },
    { etudiantDA: DA, productionId: 'p1', noteFinale: 60 },
    { etudiantDA: DA, productionId: 'o1', noteFinale: 85 },
    { etudiantDA: DA, productionId: 'p2', noteFinale: 95, remplaceeParId: 'rep-x' }
];

const SORTS_VALIDES = ['compte', 'ecarte', 'remplace', 'obligatoire', 'non-exige', 'satisfait', 'manquant'];

function instancierSPE(evals, productions) {
    const win = chargerScript('js/pratiques/pratique-pan-specifications.js', {
        obtenirDonneesSelonMode: (k) =>
            k === 'evaluationsSauvegardees' ? evals : (k === 'productions' ? productions : [])
    });
    win.obtenirCodePratique = () => 'SPE'; // obtenirCode() délègue au registre — stub neutre
    return new win.PratiquePanSpecifications();
}

let spe, recit;

beforeAll(() => {
    spe = instancierSPE(EVALS, PRODUCTIONS);
    spe.configurerPratique({ typesTravaux: TYPES, tableBundles: BUNDLES });
    recit = spe.decrireCalcul(DA);
});

describe('C2-c · récit de calcul SPE (traçabilité additive)', () => {
    it('expose decrireCalcul sur PratiquePanSpecifications', () => {
        expect(typeof spe.decrireCalcul).toBe('function');
    });

    it('PARITÉ : la note du récit == calculerPerformance × 100 (palier C = 60)', () => {
        const p = spe.calculerPerformance(DA);
        expect(recit.synthese.noteFinale).toBe(p * 100);
        expect(recit.synthese.noteFinale).toBe(60);
    });

    it('CONTRAT : recit rempli, famille SPE, sorts dans l\'énumération', () => {
        expect(recit.famille).toBe('SPE');
        expect(recit.pratiqueNom).toBe('PAN par spécifications');
        expect(recit.resultats.length).toBe(4); // un par type de travail
        recit.resultats.forEach(r => {
            expect(SORTS_VALIDES).toContain(r.sort);
            expect(typeof r.detail).toBe('string');
            expect(r.niveau).toBeNull(); // SPE binaire : pas de niveau d'échelle
        });
        expect(recit.synthese.plafonnement).toBeNull();
        expect(recit.synthese.formuleTexte).toMatch(/palier C/);
    });

    it('SÉMANTIQUE SPE : satisfait (×2), manquant (portfolio), non-exige (oral)', () => {
        const sortDe = (label) => recit.resultats.find(r => r.label === label).sort;
        expect(sortDe('Dissertation')).toBe('satisfait'); // exigé au palier C, atteint
        expect(sortDe('Examen')).toBe('satisfait');       // exigé au palier C, atteint
        // portfolio : non exigé à C, mais requis (déficitaire) au palier suivant C+
        expect(sortDe('Portfolio')).toBe('manquant');
        const portfolio = recit.resultats.find(r => r.label === 'Portfolio');
        expect(portfolio.detail).toMatch(/palier C\+/);
        // oral : jamais requis → ni exigé, ni bloquant
        expect(sortDe('Présentation orale')).toBe('non-exige');
    });

    it('EXCLUSION : la version remplacée par reprise ne fait pas monter le palier', () => {
        // p2 (portfolio acceptable, 95) est remplacée → portfolio reste à 0 → C, pas C+.
        expect(recit.synthese.noteFinale).toBe(60);
    });

    it('REPLI : sans config exploitable → null (jamais d\'échec global)', () => {
        const speNu = instancierSPE(EVALS, PRODUCTIONS); // pas de configurerPratique
        expect(speNu.decrireCalcul(DA)).toBeNull();
        expect(spe.decrireCalcul('123')).toBeNull(); // DA invalide
    });
});
