/**
 * SENTINELLE — EN ANONYMISATION, UN GROUPE INCONNU DE LA TABLE REÇOIT LA PREMIÈRE LETTRE LIBRE, PAS « Gr. ? ».
 *
 * Commentaire de Grégoire du 19 nov. 2026 (1.250.0, iPad) : au profil, l'étiquette dit « Groupe Gr. ? ».
 * `anonymiserGroupe` (js/modes.js) lit la table GLOBALE `mapping_groupes_anonymes`, créée une seule fois avec les
 * groupes du trimestre actif ce jour-là et jamais étendue : tout groupe venu après sortait en « Gr. ? », et deux
 * groupes différents s'y confondaient.
 *
 * Ce que ce banc garde (modes.js RÉEL, 'use strict', comme dans l'app) :
 *   1. une table périmée : le groupe absent reçoit la première lettre libre, les lettres déjà données ne bougent pas ;
 *   2. la lettre est stable d'une lecture à l'autre, et la table ne se réécrit pas sans raison ;
 *   3. deux groupes neufs : deux lettres différentes ;
 *   4. jamais de doublon : les 26 lettres prises, « Gr. ? » comme avant, table intacte ;
 *   5. la garde d'écriture du lot A rend la lettre neuve à son numéro réel.
 *
 * Break-test attendu : retirer le bloc « première lettre libre » d'`anonymiserGroupe` → 1, 2, 3 et 5 rougissent
 * (5 dès sa première assertion ; la seconde garde que l'extension ne casse pas la garde). 4 reste vert par
 * construction : il garde la règle « jamais de doublon », qui vaut avec ou sans le bloc.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const ETUDIANTS = [
    { da: '2000001', nom: 'Fictif', prenom: 'Aube', groupe: '01', coursId: 'GC1' },
    { da: '2000002', nom: 'Fictif', prenom: 'Brume', groupe: '01', coursId: 'GC1' }
];
const copie = (v) => JSON.parse(JSON.stringify(v));

function monter(store) {
    const journal = [];
    const db = {
        getSync: (k, d) => (k in store ? copie(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = copie(v); journal.push(k); },
        removeSync: (k) => { delete store[k]; }, get: async () => null, set: async () => {}
    };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle: (k) => 'test_' + k };
    chargerScript('js/modes.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s), toggleDisplay() {}, obtenirPreference: () => null }, win);
    return { win, journal };
}

const TABLE_PERIMEE = { '00001': 'Gr. A', '00002': 'Gr. B' };   // posée sur un autre trimestre : le groupe « 01 » n'y est pas

describe('anonymisation · un groupe absent de la table reçoit la première lettre libre', () => {
    it('table périmée : « Gr. C », et « Gr. A » / « Gr. B » gardent leurs groupes', () => {
        const store = { modeApplication: 'anonymisation', test_groupeEtudiants: copie(ETUDIANTS), mapping_groupes_anonymes: copie(TABLE_PERIMEE) };
        const { win } = monter(store);
        const lus = win.obtenirDonneesSelonMode('groupeEtudiants');
        expect(lus.map(e => e.groupe)).toEqual(['Gr. C', 'Gr. C']);
        expect(lus.map(e => e.groupeReel)).toEqual(['01', '01']);
        expect(store.mapping_groupes_anonymes).toEqual({ '00001': 'Gr. A', '00002': 'Gr. B', '01': 'Gr. C' });
    });

    it('la lettre est stable : une seconde lecture rend la même, sans réécrire la table', () => {
        const store = { modeApplication: 'anonymisation', test_groupeEtudiants: copie(ETUDIANTS), mapping_groupes_anonymes: copie(TABLE_PERIMEE) };
        const { win, journal } = monter(store);
        win.obtenirDonneesSelonMode('groupeEtudiants');
        const ecrituresApresPremiere = journal.filter(k => k === 'mapping_groupes_anonymes').length;
        expect(ecrituresApresPremiere).toBe(1);
        expect(win.anonymiserGroupe('01')).toBe('Gr. C');
        win.obtenirDonneesSelonMode('groupeEtudiants');
        expect(journal.filter(k => k === 'mapping_groupes_anonymes').length).toBe(ecrituresApresPremiere);
    });

    it('deux groupes neufs : deux lettres différentes, jamais deux « Gr. ? »', () => {
        const store = { modeApplication: 'anonymisation', test_groupeEtudiants: copie(ETUDIANTS), mapping_groupes_anonymes: copie(TABLE_PERIMEE) };
        const { win } = monter(store);
        const g1 = win.anonymiserGroupe('01');
        const g2 = win.anonymiserGroupe('02');
        expect([g1, g2]).toEqual(['Gr. C', 'Gr. D']);
    });

    it('les 26 lettres prises : « Gr. ? » comme avant, et la table n\'est pas touchée (aucun doublon)', () => {
        const pleine = {};
        for (let i = 0; i < 26; i++) pleine[`G${i}`] = `Gr. ${String.fromCharCode(65 + i)}`;
        const store = { modeApplication: 'anonymisation', test_groupeEtudiants: copie(ETUDIANTS), mapping_groupes_anonymes: copie(pleine) };
        const { win, journal } = monter(store);
        expect(win.anonymiserGroupe('01')).toBe('Gr. ?');
        expect(store.mapping_groupes_anonymes).toEqual(pleine);
        expect(journal).not.toContain('mapping_groupes_anonymes');
    });

    it('la garde d\'écriture rend la lettre neuve à son numéro réel', () => {
        const store = { modeApplication: 'anonymisation', test_groupeEtudiants: copie(ETUDIANTS), mapping_groupes_anonymes: copie(TABLE_PERIMEE) };
        const { win } = monter(store);
        const lettre = win.anonymiserGroupe('01');
        expect(lettre).toBe('Gr. C');
        // Une fiche lue en anonymisation, sans ses marqueurs (cas d'un écran qui ne les recopie pas) : la garde ne peut
        // compter que sur la table pour rendre « Gr. C » à « 01 ».
        const ecrite = win.retirerSubstitutionsAnonymisation('test_groupeEtudiants', [{ ...ETUDIANTS[0], groupe: lettre }]);
        expect(ecrite[0].groupe).toBe('01');
    });
});
