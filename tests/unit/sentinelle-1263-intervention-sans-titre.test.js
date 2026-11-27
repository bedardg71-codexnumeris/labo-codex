import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1263 — une intervention créée sans titre paraissait sans nom dans la liste. Décision de Grégoire (27 nov. 2026) :
// un titre de repli daté, à l'affichage seulement.

function monter() {
    const win = {
        addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'a2026', cle: (k) => 'a2026_' + k,
        dateEnLettres: (d, o) => d.toLocaleDateString('fr-CA', o)
    };
    const db = {
        getSync: () => null, setSync: () => true, get: async () => null, set: async () => {}, removeSync: () => {},
        enregistrerGardeEcriture: () => {}, surEcriture: () => {}, surEchecEcriture: () => {}, commitEnAttente: () => null
    };
    chargerScript('js/modes.js', { db, cle: win.cle, notifications: { succes() {}, erreur() {}, warning() {}, info() {} },
        obtenirPreference: () => null, definirPreference: () => {} }, win);
    return win;
}

describe('#1263 · une intervention sans titre porte un titre daté', () => {
    it('sans titre : « Intervention du 27 novembre », et rien n\'est écrit dans l\'intervention', () => {
        const win = monter();
        const inter = { titre: '', date: '2026-11-27' };
        expect(win.titreInterventionAffiche(inter)).toBe('Intervention du 27 novembre');
        expect(inter.titre).toBe('');
    });
    it('dans la vue des rencontres : « Rencontre du… »', () => {
        expect(monter().titreInterventionAffiche({ date: '2026-11-27' }, '', 'Rencontre')).toBe('Rencontre du 27 novembre');
    });
    it('sans date non plus : « Intervention »', () => {
        expect(monter().titreInterventionAffiche({ titre: '' })).toBe('Intervention');
    });
    it('témoins : un titre écrit reste le sien ; le repli que l\'appelant donne passe avant', () => {
        const win = monter();
        expect(win.titreInterventionAffiche({ titre: 'Reprise du plan', date: '2026-11-27' })).toBe('Reprise du plan');
        expect(win.titreInterventionAffiche({ titre: '', date: '2026-11-27' }, 'Intervention 3')).toBe('Intervention 3');
    });
});
