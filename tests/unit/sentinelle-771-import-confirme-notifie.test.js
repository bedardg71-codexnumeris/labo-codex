/**
 * SENTINELLE #771 — CONFIRMER UN IMPORT D'ÉLÈVES ÉCRIT, PUIS LE DIT.
 *
 * Audit des sous-onglets de Suivi, 6 septembre 2026, CM-5. `confirmerImportV2` (js/trimestre-v2-etudiants.js:759)
 * écrivait les élèves par `db.modifier`, puis lisait `etudiants` — le paramètre du mutateur, refermé — pour la
 * notification : `ReferenceError: etudiants is not defined` sous 'use strict', APRÈS l'écriture. L'enseignant
 * confirmait l'import, rien ne disait « N étudiant(s) importé(s) », la fonction sortait en rejet. Premier geste des
 * collègues le 14 septembre.
 *
 * Mesure : la fonction réelle, avec deux lignes en attente d'import ; les élèves sont écrits, la fonction ne lève
 * pas, et la notification de succès dit le compte du LOT importé (2) et le compte du groupe relu en base (5).
 *
 * Break-test attendu : remettre `${etudiants.length}` → rouge (ReferenceError) ; remettre `${verification}` seul
 * → rouge sur le libellé (5 ≠ 2).
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase } from './_helpers/bac-suivi.js';

describe('#771 · confirmer un import', () => {
    it('deux élèves importés : écrits, aucune erreur, et une notification qui dit « 2 » puis « 5 au total »', async () => {
        const store = storeBase();   // trois élèves dans GC1 + un dans GC2 → cinq après l'import, quatre avant
        const b = monter(store, { modules: [{ chemin: 'js/trimestre-v2-etudiants.js', internes: ['donneesImportEnAttenteV2'] }] });
        b.interne['trimestre-v2-etudiants.js'].donneesImportEnAttenteV2 = [{ da: '3000001', nom: 'Importé', prenom: 'Ivan', groupe: '01', programme: '' }, { da: '3000002', nom: 'Importée', prenom: 'Ida', groupe: '01', programme: '' }];
        let erreur = null;
        try { await b.win.confirmerImportV2(); } catch (e) { erreur = e.constructor.name + ': ' + e.message; }
        expect(erreur).toBe(null);
        expect(store.test_groupeEtudiants.map(e => e.da)).toContain('3000001');
        expect(store.test_groupeEtudiants.length).toBe(6);
        const succes = b.notifs.filter(n => n.type === 'succes').map(n => n.t);
        expect(succes.length).toBe(1);
        // #749 lot 2 (11 sept. 2026) : les mots changent — « ajouté·es », et « déjà présent·es » quand il y en a.
        expect(succes[0]).toMatch(/^2 étudiant·es ajouté·es/);
        expect(succes[0]).toContain('6 au total');
    });
});
