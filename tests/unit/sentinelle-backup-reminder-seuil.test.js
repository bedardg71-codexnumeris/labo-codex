import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — retour terrain 8 juin : le rappel « Protège tes données » s'affichait
// trop tôt (première ouverture, ou simple groupe-cours configuré, sans données réelles).
// Le seuil est désormais : des données RÉELLES à protéger (évaluations enregistrées ou
// travaux d'élèves importés), jamais en mode démo. « Avoir un groupe-cours » ne suffit plus.

let store;
const db = {
    getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
    setSync: (k, v) => { store[k] = v; }
};
// Le module lit window.cle (namespace du trimestre actif) → on le pose sur le fauxWindow.
const win = chargerScript('js/modal-backup-reminder.js', { db }, { cle: (k) => `h2026_${k}` });
const aDesDonnees = win.backupReminder.utilisateurADesDonnees;

beforeEach(() => { store = {}; });

describe('rappel sauvegarde · seuil « vraies données »', () => {
    it('aucune donnée → pas de rappel', () => {
        expect(aDesDonnees()).toBe(false);
    });

    it('un groupe-cours configuré mais aucune évaluation → PAS de rappel (le bug)', () => {
        store['groupeCoursActif'] = { id: 'gc1' };
        store['h2026_groupesCours'] = [{ id: 'gc1', nom: 'Mon cours' }];
        expect(aDesDonnees()).toBe(false);
    });

    it('des évaluations enregistrées → rappel', () => {
        store['h2026_evaluationsSauvegardees'] = [{ id: 'e1', noteFinale: 80 }];
        expect(aDesDonnees()).toBe(true);
    });

    it('des travaux d\'élèves importés → rappel', () => {
        store['h2026_fichiersTravaux'] = [{ id: 'f1' }];
        expect(aDesDonnees()).toBe(true);
    });

    it('mode démo → JAMAIS de rappel, même avec des évaluations', () => {
        store['demo-actif'] = 'true';
        store['h2026_evaluationsSauvegardees'] = [{ id: 'e1', noteFinale: 80 }];
        expect(aDesDonnees()).toBe(false);
    });

    it('collections vides → pas de rappel', () => {
        store['h2026_evaluationsSauvegardees'] = [];
        store['h2026_fichiersTravaux'] = [];
        expect(aDesDonnees()).toBe(false);
    });
});
