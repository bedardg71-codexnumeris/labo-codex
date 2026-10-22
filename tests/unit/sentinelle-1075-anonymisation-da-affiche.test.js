/**
 * #1075, POINT 1 — EN ANONYMISATION, LE VRAI DA NE S'AFFICHE PAS ET NE S'EXPORTE PAS (22 oct. 2026).
 *
 * Constat (audit 5.4, 8.55) : `anonymiserDonnees` garde le vrai DA dans `da` (les calculs en ont besoin)
 * et met le masque dans `daAffichage`. Trois écrans lisaient `da` pour l'AFFICHER : le menu Étudiant·e
 * de « Propriétés du fichier » (liste-evaluations.js), la liste d'association de l'import
 * (travaux-import.js, sans échappement de surcroît) et le Comparateur (libellé du profil, colonne DA du
 * CSV).
 *
 * Ce banc verrouille :
 *   A — le contrat, sur `modes.js` RÉEL : en anonymisation, `obtenirDAAffichage` d'un·e élève lu·e rend le
 *       masque, et son `da` reste le vrai (les calculs) ;
 *   B — les trois écrans affichent `obtenirDAAffichage(e)`, jamais `e.da` dans un libellé ;
 *   C — le CSV du Comparateur écrit `daAffichage`, et le libellé d'un profil ne retombe plus sur le vrai DA.
 *
 * Break-test (22 oct.) : remettre `(e.da || '')` dans le libellé de liste-evaluations rougit B1 ; remettre
 * `prof.da` dans la ligne du CSV rougit C1.
 *
 * DA et noms FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

describe('#1075, point 1 — le contrat de modes.js', () => {
    it('A — en anonymisation, le DA affiché est masqué, le DA de calcul reste le vrai', () => {
        const store = {
            modeApplication: 'anonymisation',
            test_groupeEtudiants: [{ da: '2000001', nom: 'Fictif', prenom: 'Zébulon', groupe: '01' }]
        };
        const db = {
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); }, get: async () => null, set: async () => {}
        };
        const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle: (k) => 'test_' + k };
        chargerScript('js/modes.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s), toggleDisplay() {}, obtenirPreference: () => null }, win);
        const [e] = win.obtenirDonneesSelonMode('groupeEtudiants');
        expect(e.da).toBe('2000001');
        expect(win.obtenirDAAffichage(e)).toBe('ANONYME');
        expect(e.nom).not.toBe('Fictif');
    });
});

describe('#1075, point 1 — les trois écrans', () => {
    it('B1 — Propriétés du fichier : le libellé lit obtenirDAAffichage', () => {
        const src = lire('js/liste-evaluations.js');
        const bloc = tranche(src, 'var optionsEtudiants = etudiants.map(', '}).join(');
        expect(bloc).toContain("' (' + obtenirDAAffichage(e) + ')'");
        expect(bloc).not.toMatch(/\(e\.da \|\| ''\) \+ '\)'/);
    });

    it('B2 — l\'import : le libellé lit obtenirDAAffichage, échappé', () => {
        const src = lire('js/travaux-import.js');
        const ligne = src.split('\n').find((l) => l.includes('travaux-select-etudiant') === false && l.includes("<option value=\"${echapperHtml(e.da)}\""));
        expect(ligne).toBeTruthy();
        expect(ligne).toContain("echapperHtml(e.nom + ', ' + e.prenom + ' (' + obtenirDAAffichage(e) + ')')");
        expect(ligne).not.toMatch(/\(\$\{e\.da\}\)/);
    });

    it('B3 — le Comparateur : le profil réel porte daAffichage, son libellé ne retombe pas sur le vrai DA', () => {
        const src = lire('js/comparateur-pratiques.js');
        const bloc = tranche(src, 'function _profilsReels()', 'function _note(');
        expect(bloc).toContain('obtenirDAAffichage(e)');
        expect(bloc).toContain('label: e.nom || e.prenom || daAffichage');
        expect(bloc).not.toMatch(/label: e\.nom \|\| e\.da/);
    });

    it('C1 — le CSV du Comparateur écrit daAffichage', () => {
        const src = lire('js/comparateur-pratiques.js');
        const bloc = tranche(src, 'function _genererCSV()', 'var BOM');
        expect(bloc).toContain('var row = [prof.label, prof.daAffichage || prof.da,');
    });
});
