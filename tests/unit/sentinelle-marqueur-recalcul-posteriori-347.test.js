import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #347 — Rétroaction d'un artefact recalculée « live » ≠ version historique
// reçue par l'élève.
//
// Décision Grégoire (29 juin 2026) : NE PAS figer/snapshot la rétroaction (aucun
// stockage nouveau, aucun changement de format), mais MARQUER explicitement les
// vues recalculées a posteriori. La synthèse d'un artefact agrège, via le
// portfolio (calculerDetailsNoteFinale) et la progression, TOUTES les évaluations
// de l'élève — donc des artefacts remis APRÈS celui qu'on regarde. La vue ne
// correspond alors plus à la rétroaction historique reçue au moment de la remise.
//
// Critère de détection retenu (cf. detecterRecalculPosteriori) : il existe au
// moins une évaluation de l'élève (non remplacée, avec noteFinale) dont la
// `dateEvaluation` est STRICTEMENT postérieure à celle de l'évaluation affichée.
//
// Cette sentinelle verrouille :
//   1. le DRAPEAU `recalculee` dans le shape Feedback (synthese-retroaction-data) ;
//   2. la PRÉSENCE/ABSENCE du bandeau dans le rendu (synthese-retroaction-rendu).

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

function chargerData(store) {
    return chargerScript('js/synthese-retroaction-data.js', {
        db: dbDepuisStore(store),
        // cle() identité : le store du test n'est pas namespacé.
        cle: (k) => k,
        // Appelé sans garde dans construireCourse ; renvoyer {} suffit.
        obtenirTrimestreActif: () => ({})
    });
}

function chargerRendu() {
    return chargerScript('js/synthese-retroaction-rendu.js');
}

// Évaluation minimale : seuls les champs lus par detecterRecalculPosteriori
// (etudiantDA, id, dateEvaluation) et le shape de base comptent.
function evalDe(id, da, date, extra = {}) {
    return Object.assign({ id, etudiantDA: da, dateEvaluation: date, noteFinale: 70 }, extra);
}

const DA = 'A001';
const EVAL_COURANTE = evalDe('ev-2', DA, '2026-03-10T12:00:00');

describe('#347 · drapeau « recalculée a posteriori » (synthese-retroaction-data)', () => {
    it('recalculee = true quand une évaluation POSTÉRIEURE de l’élève existe', () => {
        const store = {
            evaluationsSauvegardees: [
                evalDe('ev-1', DA, '2026-02-01T12:00:00'), // antérieure
                EVAL_COURANTE,
                evalDe('ev-3', DA, '2026-04-01T12:00:00')  // POSTÉRIEURE → recalcul
            ]
        };
        const win = chargerData(store);
        const fb = win.syntheseRetroactionData.construireFeedback(EVAL_COURANTE, null, null);
        expect(fb.recalculee).toBe(true);
    });

    it('recalculee = false quand l’artefact courant est le DERNIER évalué', () => {
        const store = {
            evaluationsSauvegardees: [
                evalDe('ev-1', DA, '2026-02-01T12:00:00'),
                EVAL_COURANTE // la plus récente : rien d’ultérieur
            ]
        };
        const win = chargerData(store);
        const fb = win.syntheseRetroactionData.construireFeedback(EVAL_COURANTE, null, null);
        expect(fb.recalculee).toBe(false);
    });

    it('recalculee = false quand l’évaluation postérieure est REMPLACÉE (hors portfolio)', () => {
        const store = {
            evaluationsSauvegardees: [
                EVAL_COURANTE,
                evalDe('ev-3', DA, '2026-04-01T12:00:00', { remplaceeParId: 'ev-9' })
            ]
        };
        const win = chargerData(store);
        const fb = win.syntheseRetroactionData.construireFeedback(EVAL_COURANTE, null, null);
        expect(fb.recalculee).toBe(false);
    });

    it('recalculee = false quand l’évaluation postérieure est SANS note (noteFinale null)', () => {
        const store = {
            evaluationsSauvegardees: [
                EVAL_COURANTE,
                evalDe('ev-3', DA, '2026-04-01T12:00:00', { noteFinale: null })
            ]
        };
        const win = chargerData(store);
        const fb = win.syntheseRetroactionData.construireFeedback(EVAL_COURANTE, null, null);
        expect(fb.recalculee).toBe(false);
    });

    it('recalculee = false quand l’évaluation postérieure appartient à un AUTRE élève', () => {
        const store = {
            evaluationsSauvegardees: [
                EVAL_COURANTE,
                evalDe('ev-3', 'B999', '2026-04-01T12:00:00')
            ]
        };
        const win = chargerData(store);
        const fb = win.syntheseRetroactionData.construireFeedback(EVAL_COURANTE, null, null);
        expect(fb.recalculee).toBe(false);
    });
});

describe('#347 · bandeau dans le rendu (synthese-retroaction-rendu)', () => {
    const PHRASE = 'peut différer de la rétroaction reçue';

    function feedbackBidon(recalculee) {
        return {
            recalculee,
            scale: [],
            student: { firstName: 'Ada', lastName: 'Lovelace' },
            course: {},
            artefact: { title: 'Artefact 1', number: 1, total: 3 },
            trimestre: [],
            criteria: [],
            overall: {},
            stamps: [],
            errors: [],
            bilan: {}
        };
    }

    it('le bandeau APPARAÎT quand recalculee = true', () => {
        const win = chargerRendu();
        const html = win.syntheseRetroactionRendu.rendreSyntheseHTML(feedbackBidon(true));
        expect(html).toContain(PHRASE);
    });

    it('le bandeau est ABSENT quand recalculee = false', () => {
        const win = chargerRendu();
        const html = win.syntheseRetroactionRendu.rendreSyntheseHTML(feedbackBidon(false));
        expect(html).not.toContain(PHRASE);
    });

    it('le bandeau est ABSENT quand recalculee est absent (rétro-compat shape)', () => {
        const win = chargerRendu();
        const fb = feedbackBidon(true);
        delete fb.recalculee;
        const html = win.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
        expect(html).not.toContain(PHRASE);
    });
});
