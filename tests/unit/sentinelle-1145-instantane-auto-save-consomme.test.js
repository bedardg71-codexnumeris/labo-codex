import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1145 (23 oct. 2026) — UN INSTANTANÉ D'ENREGISTREMENT AUTOMATIQUE NE S'ÉCRIT QU'UNE FOIS.
//
// `_flusherAutoSave` (au chargement d'élève, à la fermeture d'une copie, avant un rechargement) rejouait
// `window._pendingAutoSaveSnapshot` même quand le minuteur l'avait déjà écrit, ou quand une annulation
// (« Enregistrer », « Modifier », `nouvelleEvaluation`) n'avait vidé que le minuteur. Vécu à 17 h 11 :
// l'évaluation d'une copie réécrite au passage en mode Évaluer, sans « Enregistrer ». Le banc navigateur :
// tests/integration/evaluer-reecrit-evaluation-1145.spec.js.
//
// Break-tests (faits le 23 oct. 2026, rouges tous deux) :
//   1. rendre au minuteur sa forme d'avant (`_autoSauvegarderCriteres(window._pendingAutoSaveSnapshot)`,
//      sans vider) → « le minuteur consomme » rougit : 2 écritures.
//   2. retirer `window._pendingAutoSaveSnapshot = null;` de `_annulerAutoSaveEnAttente` → « l'annulation
//      jette » rougit : 1 écriture.

function monter() {
    const ecritures = [];
    let minuteur = null;
    const base = {
        grillesTemplates: [{ id: 'G1', criteres: [{ id: 'C1', nom: 'Structure', ponderation: 100 }] }],
        evaluationsSauvegardees: [{ id: 'EV1', etudiantDA: '111', productionId: 'P1', grilleId: 'G1', criteres: [] }]
    };
    const win = chargerScript('js/evaluation-chargement.js', {
        db: {
            get: async () => null,
            getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : (d !== undefined ? d : null)),
            set: async () => {},
            setSync: () => {}
        },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        sauvegarderDonneesSelonMode: (k) => { if (k === 'evaluationsSauvegardees') ecritures.push(k); return true; },
        obtenirPreference: () => null,
        setTimeout: (fn) => { minuteur = fn; return 1; },
        clearTimeout: () => { minuteur = null; }
    }, { addEventListener: () => {}, removeEventListener: () => {} });
    win.evaluationEnCours = { etudiantDA: '111', productionId: 'P1', grilleId: 'G1', criteres: { C1: 'D' }, donneesAlgorithmiques: {} };
    win._pendingAutoSaveSnapshot = null;
    win._autoSaveSuspendu = false;
    win._chargementsEvaluationEnCours = 0;
    return { win, ecritures, declencher: () => { const f = minuteur; minuteur = null; f(); } };
}

describe('#1145 · l\'instantané de l\'enregistrement automatique ne se rejoue pas', () => {
    it('le minuteur consomme l\'instantané : un flush qui suit n\'écrit rien', () => {
        const { win, ecritures, declencher } = monter();
        win._debouncerAutoSave();
        declencher();
        expect(ecritures.length, 'le minuteur écrit le geste').toBe(1);
        expect(win._pendingAutoSaveSnapshot).toBe(null);
        win._flusherAutoSave();
        expect(ecritures.length, 'le flush ne rejoue pas ce qui est écrit').toBe(1);
    });

    it('l\'annulation jette l\'instantané : un flush qui suit n\'écrit rien', () => {
        const { win, ecritures } = monter();
        win._debouncerAutoSave();
        win._annulerAutoSaveEnAttente();
        expect(win._timerAutoSave).toBe(null);
        win._flusherAutoSave();
        expect(ecritures.length).toBe(0);
    });

    it('témoin — un instantané EN ATTENTE part bien au flush (le changement de copie)', () => {
        const { win, ecritures } = monter();
        win._debouncerAutoSave();
        win._flusherAutoSave();
        expect(ecritures.length).toBe(1);
    });
});
