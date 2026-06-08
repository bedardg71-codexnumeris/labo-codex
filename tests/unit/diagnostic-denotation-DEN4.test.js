import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Lot DEN-4 (#318) — diagnostic « note non calculable » : cas Dénotation.
// Quand la pratique active est une DEN, le message #128 doit ORIENTER vers la
// saisie du jugement (section « Jugement » du profil), pas vers une config
// portfolio à corriger (qui serait faux pour une DEN). Non-régression STD.

let pratiqueActiveId = null;
let store = [];
const db = {
    getSync: (k, def) => (k === 'pratiquesConfigurables' ? store : (def !== undefined ? def : null)),
    setSync: () => {}
};
const globaux = {
    db,
    cle: (k) => k,
    obtenirPratiqueActiveGroupeCours: () => pratiqueActiveId,
    normaliserIdPratique: (t) => t,
    notifications: { erreur: () => {}, succes: () => {} },
    echapperHtml: (s) => String(s == null ? '' : s)
};
const win = chargerScript('js/profil-etudiant-actions.js', globaux);
const diag = win._diagnostiquerNoteNonCalculable;

describe('DEN-4 · diagnostic « non calculable » — cas Dénotation', () => {
    it('DEN active → message « jugement à saisir », pas « config portfolio »', () => {
        pratiqueActiveId = 'p-den';
        store = [{ id: 'p-den', type: 'denotation', nom: 'Ma DEN', calcul_note: { methode: 'jugement_global' } }];
        const msg = diag();
        expect(msg).toContain('Dénotation');
        expect(msg).toContain('Jugement');
        expect(msg).not.toContain('portfolio');
    });

    it('reconnaît via la méthode jugement_global même sans type explicite', () => {
        pratiqueActiveId = 'p-den2';
        store = [{ id: 'p-den2', nom: 'DEN', calcul_note: { methode: 'jugement_global' } }];
        expect(diag().toLowerCase()).toContain('jugement');
    });

    it('STD à config incomplète → message portfolio (non-régression)', () => {
        pratiqueActiveId = 'p-std';
        store = [{ id: 'p-std', type: 'standards', nom: 'STD', calcul_note: { methode: 'conversion_niveaux' } }];
        expect(diag()).toContain('portfolio');
    });
});
