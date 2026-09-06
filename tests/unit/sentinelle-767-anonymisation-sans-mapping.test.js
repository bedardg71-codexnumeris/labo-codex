/**
 * SENTINELLE #767 — LE MODE ANONYMISATION NE PLANTE PLUS SUR UN TRIMESTRE SANS MAPPING.
 *
 * Audit des sous-onglets de Suivi, 6 septembre 2026, CM-1 (Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md §0).
 * `genererMappingAnonyme` (js/modes.js:279) affectait `doitRegenerer = true` (:310 ancien format, :338 mapping absent)
 * sans jamais le déclarer ; sous le 'use strict' de la ligne 9, chaque lecture de `groupeEtudiants` en mode
 * anonymisation levait `ReferenceError: Can't find variable: doitRegenerer` sur tout trimestre sans mapping
 * (démo, A2026) — mesuré au vrai geste `basculerModeAnonymisation()` en démo. Depuis le 22 février (8b739ae3).
 *
 * Mesure : modes.js RÉEL, chargé en 'use strict' comme dans l'app, un store sans mapping et un store avec un
 * mapping à l'ANCIEN format ; `obtenirDonneesSelonMode('groupeEtudiants')` rend des élèves anonymisés
 * (« Élève N ») et écrit le mapping namespacé — sans lever. Source seulement, pas de stock : le plantage
 * survenait AVANT toute écriture (la ligne 333 qui écrit vit dans l'autre branche).
 *
 * Break-test attendu : retirer `let doitRegenerer = false;` → les deux cas rougissent (ReferenceError).
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const ETUDIANTS = [
    { da: '2000001', nom: 'Assidu', prenom: 'Alice', groupe: '01', coursId: 'GC1' },
    { da: '2000002', nom: 'Absent', prenom: 'Bruno', groupe: '01', coursId: 'GC1' }
];
function monter(store) {
    const journal = [];
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); journal.push(k); }, get: async () => null, set: async () => {} };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle: (k) => 'test_' + k };
    chargerScript('js/modes.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s), toggleDisplay() {}, obtenirPreference: () => null }, win);
    return { win, journal };
}

describe('#767 · anonymisation sans mapping', () => {
    it('trimestre SANS mapping : la lecture anonymise et écrit le mapping namespacé, sans ReferenceError', () => {
        const store = { modeApplication: 'anonymisation', test_groupeEtudiants: JSON.parse(JSON.stringify(ETUDIANTS)) };
        const { win, journal } = monter(store);
        let erreur = null, lus = null;
        try { lus = win.obtenirDonneesSelonMode('groupeEtudiants'); } catch (e) { erreur = e.constructor.name + ': ' + e.message; }
        expect(erreur).toBe(null);
        expect(lus.length).toBe(2);
        expect(lus.every(e => /^Élève \d+$/.test(e.prenom))).toBe(true);
        expect(lus.map(e => e.nom)).not.toContain('Assidu');
        expect(journal).toContain('test_mapping_anonymisation');
        expect(Object.keys(store.test_mapping_anonymisation).sort()).toEqual(['2000001', '2000002']);
    });

    it('mapping à l\'ANCIEN format (noms fictifs) : régénéré au nouveau format, sans ReferenceError', () => {
        const store = { modeApplication: 'anonymisation', test_groupeEtudiants: JSON.parse(JSON.stringify(ETUDIANTS)),
            test_mapping_anonymisation: { 2000001: { nom: 'Tremblay', prenom: 'Jean' }, 2000002: { nom: 'Roy', prenom: 'Marie' } } };
        const { win } = monter(store);
        let erreur = null, lus = null;
        try { lus = win.obtenirDonneesSelonMode('groupeEtudiants'); } catch (e) { erreur = e.constructor.name + ': ' + e.message; }
        expect(erreur).toBe(null);
        expect(lus.every(e => /^Élève \d+$/.test(e.prenom))).toBe(true);
        expect(store.test_mapping_anonymisation['2000001']).toHaveProperty('numero');
    });
});
